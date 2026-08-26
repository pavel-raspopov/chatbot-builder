import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type RpcError = { message?: string; code?: string };

export type OpResult = {
  data?: unknown;
  error?: RpcError | null;
  count?: number | null;
};

type OpQueue = OpResult | OpResult[];

export type FakeSupabaseConfig = {
  user?: { id: string; email?: string } | null;
  /** Per-table results keyed by first operation: select | insert | update | delete. */
  tables?: Record<string, Record<string, OpQueue>>;
  /** Results keyed by RPC function name. */
  rpc?: Record<string, OpResult>;
  storage?: {
    download?: { data?: Blob | null; error?: RpcError | null };
    remove?: OpResult;
  };
  auth?: {
    user?: { id: string; email?: string } | null;
    signInWithPassword?: { data?: unknown; error?: RpcError | null };
    signUp?: { data?: unknown; error?: RpcError | null };
    signOut?: { error?: RpcError | null };
  };
};

export type FakeSupabaseCalls = {
  rpc: Array<{ name: string; args: Record<string, unknown> }>;
  storageRemovedPaths: string[][];
  insertedRows: Array<{ table: string; rows: unknown }>;
  updates: Array<{ table: string; values: unknown }>;
};

const NULL_RESULT: OpResult = { data: null, error: null };
/**
 * Fluent in-memory stand-in for SupabaseClient<Database>. Configure expected
 * results per table/op and inspect `calls` afterwards. Terminal builders are
 * thenable, matching how production code awaits `.eq(...)` chains,
 * `.maybeSingle()`, and `.single()`.
 */
export function createFakeSupabase(
  config: FakeSupabaseConfig = {},
): SupabaseClient<Database> & { calls: FakeSupabaseCalls } {
  const calls: FakeSupabaseCalls = {
    rpc: [],
    storageRemovedPaths: [],
    insertedRows: [],
    updates: [],
  };

  function from(table: string) {
    let op: string = "select";
    let seen = 0;

    const next = (): OpResult => takeNext(config.tables?.[table]?.[op], seen++);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {
      select() {
        return builder;
      },
      eq() {
        return builder;
      },
      limit() {
        return builder;
      },
      insert(rows: unknown) {
        op = "insert";
        calls.insertedRows.push({ table, rows });
        return builder;
      },
      update(values: unknown) {
        op = "update";
        calls.updates.push({ table, values });
        return builder;
      },
      delete() {
        op = "delete";
        return builder;
      },
      async maybeSingle() {
        const result = next();
        return { data: result.data ?? null, error: result.error ?? null };
      },
      async single() {
        const result = next();
        return { data: result.data ?? null, error: result.error ?? null };
      },
      then(
        resolve: (value: OpResult) => unknown,
        reject: (reason?: unknown) => unknown,
      ) {
        try {
          return Promise.resolve(resolve(next()));
        } catch (error) {
          return Promise.resolve(reject(error));
        }
      },
    };

    return builder;
  }

  const client = {
    calls,
    auth: {
      async getUser() {
        return { data: { user: config.auth?.user ?? null }, error: null };
      },
      async signInWithPassword(credentials: unknown) {
        void credentials;
        return (
          config.auth?.signInWithPassword ?? {
            data: { session: {} },
            error: null,
          }
        );
      },
      async signUp(credentials: unknown) {
        void credentials;
        return config.auth?.signUp ?? { data: { session: null }, error: null };
      },
      async signOut() {
        return config.auth?.signOut ?? { error: null };
      },
    },
    from,
    async rpc(name: string, args: Record<string, unknown> = {}) {
      calls.rpc.push({ name, args });
      return config.rpc?.[name] ?? NULL_RESULT;
    },
    storage: {
      from(_bucket: string) {
        void _bucket;
        return {
          async download(_path: string) {
            void _path;
            const dl = config.storage?.download ?? {};
            return { data: dl.data ?? null, error: dl.error ?? null };
          },
          async remove(paths: string[]) {
            calls.storageRemovedPaths.push(paths);
            return config.storage?.remove ?? NULL_RESULT;
          },
        };
      },
    },
  };

  return client as SupabaseClient<Database> & { calls: FakeSupabaseCalls };
}


function takeNext(queue: OpQueue | undefined, seen: number): OpResult {
  if (queue === undefined) {
    return NULL_RESULT;
  }
  if (Array.isArray(queue)) {
    return queue[Math.min(seen, queue.length - 1)] ?? NULL_RESULT;
  }
  return queue;
}
