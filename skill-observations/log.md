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

