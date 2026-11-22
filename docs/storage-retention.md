# Draft retention planning

The project owner selected a **30-day inactive-draft cleanup proposal**. Automatic deletion is disabled; selecting this proposal did not authorize deleting existing data. No retention worker or deletion command is implemented. Activity definitions, the one-day trial, subscription entitlements and notification/upgrade rules still need decisions before expiry or cleanup is enabled.

The read-only report provides aggregate draft counts and logical image bytes without returning customer identifiers, email addresses, draft text or image payloads. Run it through the workspace wrapper:

```powershell
node scripts/workspace-run.mjs node scripts/storage-retention-report.mjs --days=30
```

The default is 30 days, matching the selected proposal. Use `--days=90` or `--days=180` for comparison. `--test` uses the guarded disposable database. There is no `--apply` or delete option; unexpected arguments are rejected. The report explicitly sets a PostgreSQL read-only, repeatable-read transaction. If required tables are absent, it reports `SCHEMA_NOT_READY` without running migrations or inventing zero usage.

## What the numbers mean

- Last activity means the latest saved draft edit **or photo edit**, including older photo-library paths. Views and sign-ins are not recorded, so a draft listed for review may still be used regularly. Do not enable deletion based on these timestamps alone without an explicit retention agreement or last-view tracking.
- Administrators, disabled accounts, and accounts with any paid or pending order are excluded from review candidates. This is deliberately conservative while memberships and support terms remain undecided.
- Purchased snapshots/photos, retained source releases, delivered artifacts and MFA credentials are outside this report and are never deletion candidates.
- Reported bytes are logical draft-image bytes. They exclude JSON content, indexes, database history/bloat, backups and storage-provider overhead. They are not a promise of disk space or billing reduction.
- Output counts are strings to preserve PostgreSQL integer precision. Results are a point-in-time snapshot, not a deletion manifest; a future worker must recheck ownership, entitlements, edits and purchases transactionally before acting.

## Decisions before any cleanup feature

Define what counts as activity for the selected 30-day window; define how paid memberships and cancellation affect drafts while preserving purchases; provide a warning and export/restore/upgrade path before deletion; define a notification grace period and cancellation of cleanup after new activity; document backup/restore and audit records. A proposed schedule is a warning after 23 inactive days and deletion no earlier than day 30, with cleanup blocked on failed notice delivery or any new activity; that schedule still needs review and implementation. Only then implement a bounded worker with concurrency checks and an explicit rollout gate. Existing maintenance does not call this report or delete drafts.

## Current verification

The application database currently reports missing `PersonalizationDraft` and `PersonalizationDraftImage` tables. No application migration was run. The disposable database tests verify aggregate byte/count accuracy, recent photo edits preventing false stale candidates, protected accounts, no customer identifiers in output and preservation of all fixtures until test cleanup.

Temporary/cache handling is documented in [workspace tools](workspace-tools.md). Hosting remains in planning.
