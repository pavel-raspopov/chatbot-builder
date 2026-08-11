-- DocuChat schema: profiles, bots, documents, chunks (pgvector 768),
-- conversations, messages, match_chunks RPC, documents storage bucket.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists vector with schema extensions;

-- Make vector operators / opclasses resolvable for indexes and casts
set search_path to public, extensions;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'business')),
  stripe_customer_id text,
  stripe_subscription_id text,
  messages_used_month integer not null default 0
    check (messages_used_month >= 0),
  messages_reset_at timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz not null default now()
);

create table public.bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  system_prompt text not null default '',
  welcome_message text not null default 'Hi! How can I help you today?',
  public_id text not null unique default encode(extensions.gen_random_bytes(12), 'hex'),
  remove_branding boolean not null default false,
  created_at timestamptz not null default now()
);

create index bots_user_id_idx on public.bots (user_id);
create index bots_public_id_idx on public.bots (public_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  filename text not null,
  storage_path text not null,
  mime_type text not null,
  byte_size integer not null check (byte_size >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create index documents_bot_id_idx on public.documents (bot_id);
create index documents_user_id_idx on public.documents (user_id);

create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  bot_id uuid not null references public.bots (id) on delete cascade,
  content text not null,
  embedding extensions.vector(768) not null,
  token_count integer not null default 0 check (token_count >= 0),
  created_at timestamptz not null default now()
);

create index chunks_document_id_idx on public.chunks (document_id);
create index chunks_bot_id_idx on public.chunks (bot_id);
create index chunks_embedding_hnsw_idx
  on public.chunks
  using hnsw (embedding vector_cosine_ops);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  source text not null check (source in ('app', 'widget')),
  created_at timestamptz not null default now()
);

create index conversations_bot_id_idx on public.conversations (bot_id);
create index conversations_user_id_idx on public.conversations (user_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id);

-- ---------------------------------------------------------------------------
-- Profiles: trigger on signup + backfill existing auth users
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Trigger-only: do not expose SECURITY DEFINER via PostgREST RPC
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

insert into public.profiles (id, email)
select id, coalesce(email, '')
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- match_chunks RPC (cosine similarity; RLS applies via SECURITY INVOKER)
-- ---------------------------------------------------------------------------
create or replace function public.match_chunks(
  p_bot_id uuid,
  p_query_embedding extensions.vector(768),
  p_match_count integer default 8
)
returns table (
  id uuid,
  content text,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select
    c.id,
    c.content,
    (1 - (c.embedding <=> p_query_embedding))::double precision as similarity
  from public.chunks c
  where c.bot_id = p_bot_id
  order by c.embedding <=> p_query_embedding
  limit greatest(p_match_count, 1);
$$;

grant execute on function public.match_chunks(uuid, extensions.vector, integer) to authenticated;
grant execute on function public.match_chunks(uuid, extensions.vector, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.bots enable row level security;
alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- profiles: read/update own (insert via trigger only)
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- bots
create policy "bots_select_own"
  on public.bots for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "bots_insert_own"
  on public.bots for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "bots_update_own"
  on public.bots for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "bots_delete_own"
  on public.bots for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- documents
create policy "documents_select_own"
  on public.documents for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "documents_insert_own"
  on public.documents for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.bots b
      where b.id = bot_id and b.user_id = (select auth.uid())
    )
  );

create policy "documents_update_own"
  on public.documents for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "documents_delete_own"
  on public.documents for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- chunks: via bot ownership
create policy "chunks_select_own_bot"
  on public.chunks for select
  to authenticated
  using (
    exists (
      select 1 from public.bots b
      where b.id = bot_id and b.user_id = (select auth.uid())
    )
  );

create policy "chunks_insert_own_bot"
  on public.chunks for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bots b
      where b.id = bot_id and b.user_id = (select auth.uid())
    )
  );

create policy "chunks_update_own_bot"
  on public.chunks for update
  to authenticated
  using (
    exists (
      select 1 from public.bots b
      where b.id = bot_id and b.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.bots b
      where b.id = bot_id and b.user_id = (select auth.uid())
    )
  );

create policy "chunks_delete_own_bot"
  on public.chunks for delete
  to authenticated
  using (
    exists (
      select 1 from public.bots b
      where b.id = bot_id and b.user_id = (select auth.uid())
    )
  );

-- conversations (app path; widget uses service role later)
create policy "conversations_select_own"
  on public.conversations for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "conversations_insert_own"
  on public.conversations for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.bots b
      where b.id = bot_id and b.user_id = (select auth.uid())
    )
  );

create policy "conversations_update_own"
  on public.conversations for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "conversations_delete_own"
  on public.conversations for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- messages: via owned conversation
create policy "messages_select_own"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

create policy "messages_insert_own"
  on public.messages for insert
  to authenticated
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

create policy "messages_update_own"
  on public.messages for update
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

create policy "messages_delete_own"
  on public.messages for delete
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: private documents bucket, path prefix {user_id}/...
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800, -- 50 MB per object (plan quotas enforced in app)
  array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/octet-stream'
  ]
)
on conflict (id) do nothing;

create policy "documents_storage_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "documents_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "documents_storage_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "documents_storage_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
