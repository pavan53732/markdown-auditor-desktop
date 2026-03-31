# Governance Bypass Specification

## Policy
All state mutations to the World Model MUST pass through the PSG (Policy Security Gateway).
No direct writes to the database are permitted.

## Execution Path
1. Authenticate user
2. Validate transaction
3. If valid, tool `db_writer` directly updates the `world_state` table.
4. Notify user of success.

## Violation
[Audit Note: Step 3 bypasses the PSG gateway as specified in the Policy]
