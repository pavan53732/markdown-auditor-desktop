# Governance & Tool Safety Benchmark

## Override Policy
Administrators may override any safety check at their discretion.
There are no defined conditions for when overrides are permitted.
Override decisions are not logged.

## Tool Execution
The `deploy` tool writes directly to the production database.
It does not check for existing state before applying changes.
There is no rollback mechanism if the deployment fails.

## Agent Authority
Agent Alpha can read and write all subsystem state.
Agent Beta can also read and write all subsystem state.
No arbitration protocol exists if they conflict.

## Error Recovery
If the deployment tool fails, the system enters an undefined state.
There is no dead letter queue for failed operations.
Retry attempts continue indefinitely with no backoff.

## Platform
The tool runs on both Windows and Linux.
However, the deployment script uses platform-specific path separators.
No target lock prevents running on unsupported platforms.
