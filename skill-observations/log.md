# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-13

### Observation 3: Feature-review of a whole phase vs one feature

**Status:** OPEN
**Date:** 2026-08-13
**Session context:** User asked to restore session memory and then review a completed phase plus all prior progress
**Skill:** feature-review
**Type:** open-source
**Phase/Area:** Step 1 — Understand What Should Have Been Built / report scope

**Issue:** The skill is written for a single completed feature against one plan. The user asked to review a whole phase plus all prior progress. Restoring memory and reviewing in the same turn also conflicts with remember-restore's "wait for confirmation before continuing."

**Suggested improvement:** Add a multi-feature / phase-review mode: use the build plan and progress tracker as the benchmark, report per completed item then a cross-cutting summary. When the user chains restore + another skill in one message, treat the second skill as confirmation to proceed (do not block).

**Principle:** A review skill scoped to one feature needs an explicit multi-item mode when the user asks for a phase or program review; chained slash-commands in one message authorize the next skill without a separate confirm.

### Observation 4: Review findings need runtime + current-docs check before cleanup work

**Status:** OPEN
**Date:** 2026-08-13
**Session context:** User asked to fix review issues but first confirm against current docs; challenged a storage-orphan finding
**Skill:** feature-review
**Type:** open-source
**Phase/Area:** Severity / production-readiness findings

**Issue:** A review inferred Storage orphans from "DB CASCADE does not call Storage API" without checking the user's verified delete path or current Storage docs. The user had already seen files disappear. Official Storage docs say SQL deletes orphan objects, but recommending a new cleanup system without reproducing the failure is over-engineering.

**Suggested improvement:** In Layer 3, mark inferred cascade/orphan issues as "verify against product + official API docs" before calling them Important. Prefer the existing delete helper over a new job/trigger.

**Principle:** A missing API call in source is not proof of a user-visible bug — confirm with the official storage/delete docs and the path the user actually ran before proposing cleanup machinery.


### Observation 5: Plan-specified verification vs TDD skill when the repo has no test runner

**Status:** OPEN
**Date:** 2026-08-13
**Session context:** Implementing 09 in-app chat from an approved plan that named lint, build, and manual UI as verification
**Skill:** test-driven-development
**Type:** open-source
**Phase/Area:** When to Use / Iron Law vs user-plan precedence

**Issue:** The TDD skill requires a failing test before production code. This repo has no test runner, and the written feature plan explicitly forbade adding one. Following TDD would have expanded scope (install Vitest/Jest) against the plan.

**Suggested improvement:** Add an exception: when the project or the current plan names a verification method and there is no test runner, do not add a framework unasked. Follow the plan's verify commands. User instructions and the written plan outrank the TDD iron law.

**Principle:** A skill that mandates tests cannot override a project that has no test runner and a plan that already specified how to verify.

### Observation 6: Drift control without a test suite is scope + typecheck, not TDD theater

**Status:** OPEN
**Date:** 2026-08-13
**Session context:** User agreed to defer a test runner until after polished visible functionality, but worried AI would break unrelated code
**Skill:** test-driven-development / writing-plans / executing-plans
**Type:** open-source
**Phase/Area:** When to Use / verification vs drift prevention

**Issue:** Installing a runner and writing tests-after (or TDD on new files only) would not catch edits to existing chat/ingest/quota paths. The drift risk is shared modules (`lib/rag`, `lib/plans`, `lib/usage`, Supabase clients), not the absence of a red-green ritual on brand-new widget UI.

**Suggested improvement:** When the project has no test runner and the user has waived TDD until polish: do not add a framework; name substitute drift controls in the feature plan (files in / files out of scope, lint+build before claiming done, extra caution on shared `lib/`). A test suite becomes the right control once those shared contracts exist and regressions would wreck a demo.

**Principle:** A missing test runner is not permission to skip verification — it means the plan must name the actual drift nets (scope, types, lint, build, manual path) instead of performing TDD against a framework that is not there.

### Observation 7: Plan scope freeze vs a failing shared-lib typecheck at verify

**Status:** OPEN
**Date:** 2026-08-13
**Session context:** Implementing 10 embed snippet; plan forbade editing shared lib except listed files; `npm run build` failed in `lib/gemini.ts` on `thinkingLevel: "minimal"` vs SDK enum `ThinkingLevel.MINIMAL`
**Skill:** writing-plans / executing-plans
**Type:** open-source
**Phase/Area:** Global Constraints / files out of scope vs verification commands

**Issue:** The feature plan listed lint+build as the verify gate and also froze `lib/gemini.ts`. The type error was unrelated to embed work (SDK enum vs string literal) but blocked claiming the feature done. Following the freeze would have left a red build; following the verify gate required a one-line shared-lib type fix.

**Suggested improvement:** In plans that freeze shared modules, add an exception: a one-line type/compile fix in a frozen file is allowed when the named verify command fails on it. Record the exception in the session notes. Do not expand into behavior changes.

**Principle:** A file-scope freeze cannot override a plan's own verify command. If lint or build fails in frozen code, a minimal type-only fix is in scope; behavior changes still are not.

### Observation 8: supabase migration new timestamps can sort before existing files

**Status:** OPEN
**Date:** 2026-08-13
**Session context:** Adding consume_owner_message_quota after get_bot_widget_config
**Skill:** supabase / writing-plans
**Type:** open-source
**Phase/Area:** Schema / migrations

**Issue:** `supabase migration new` stamped the file with UTC time (`20260813182320`), which sorted *before* an existing migration (`20260813195100`) that had been named with a later local-looking timestamp. Applying in filename order would run the new RPC before a later migration that already exists.

**Suggested improvement:** After `supabase migration new`, compare the new filename to the current max in `supabase/migrations/`. If it is not last, rename it to max+1 before writing SQL.

**Principle:** Migration filenames are an ordering key, not a wall-clock. A newly created file must sort after every existing migration in the folder, even when the CLI clock disagrees with earlier names.

### Observation 9: Service-role prerequisite cannot be filled by the agent without CLI login

**Status:** OPEN
**Date:** 2026-08-13
**Session context:** Implementing public widget chat that requires SUPABASE_SERVICE_ROLE_KEY
**Skill:** executing-plans / supabase
**Type:** open-source
**Phase/Area:** Env / secrets

**Issue:** The feature plan required adding a service role key to local env. `.env.local` listed only public Supabase keys and Gemini. `supabase projects api-keys` failed (no access token). MCP exposes publishable keys, not the service role. The route correctly 500s with a setup message, but live widget answers cannot be verified until the human pastes the key.

**Suggested improvement:** Plans that need a secret should include a non-secret gate: check that the env *name* is present, document the dashboard path, and do not claim an end-to-end click-through if the key is missing. Do not print or commit the value.

**Principle:** An agent can wire a secret-dependent path and prove the missing-config error; it cannot complete a live integration when the secret is absent from env and unreachable from authenticated tools.
