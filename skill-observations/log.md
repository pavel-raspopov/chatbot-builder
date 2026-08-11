# Skill Observation Log

Observations captured during task-oriented work.

**Status key:** OPEN = not yet actioned | ACTIONED (YYYY-MM-DD) = skill
updated/created | DECLINED (YYYY-MM-DD) = user decided not to pursue —
resolved statuses always carry their resolution date

---

## 2026-08-11

### Observation 1: Scaffold in nonempty repo via temp dir

**Status:** ACTIONED (2026-08-11) — Applied to executing-plans (weekly review, staged)
**Date:** 2026-08-11
**Session context:** Landing Page (01) implementation — create-next-app into nonempty DocuChat repo
**Skill:** executing-plans / New skill candidate: greenfield-scaffold-merge
**Type:** open-source
**Phase/Area:** Task execution — project bootstrap

**Issue:** create-next-app refuses or overwrites agent docs (AGENTS.md) when run in a nonempty repo that already has context files. Scaffolding into a temp folder and moving app/config/node_modules while preserving existing docs avoided collisions.

**Suggested improvement:** When a plan says “scaffold into existing repo,” document: create-next-app in a temp dir with --disable-git, move package/app/config only, never overwrite AGENTS.md/PRODUCT.md/context/.

**Principle:** Bootstrap tools that emit starter docs must be merged into an existing agent-managed repo by file selection, not by scaffolding in place.


### Observation 2: Document + imprint after first UI ship

**Status:** ACTIONED (2026-08-11) — Applied to imprint + AGENTS.md imprint blurb; principle logged (weekly review, staged)
**Date:** 2026-08-11
**Session context:** Persist landing UI rules via /impeccable document + /imprint
**Skill:** imprint / impeccable document
**Type:** open-source
**Phase/Area:** Post-feature design carbonization

**Issue:** Seed DESIGN.md and a free-form ui-registry were insufficient for cross-session consistency; imprint’s table format + baseline and a non-seed design.json sidecar are what later agents actually match.

**Suggested improvement:** After the first real UI ships, always pair /impeccable document (refresh DESIGN.md + sidecar, write surface brief) with /imprint (baseline + per-component tables) before starting the next feature.

**Principle:** Visual rules persist when they are written in the formats each skill expects to read — not as ad-hoc notes.
