# Workflow Skip Risk

The audit pipeline is documented as:

1. Intake
2. Validation
3. Execution
4. Verification

An optimization note then says validation may be skipped for trusted requests, but no equivalent checkpoint or rollback stage is defined.

The document also never states how a run exits after an aborted verification step.
