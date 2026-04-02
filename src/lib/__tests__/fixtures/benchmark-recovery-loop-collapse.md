# Recovery Loop Collapse

Rollback can be retried indefinitely until it eventually succeeds.

If rollback fails, the system restarts from the current partially written state without a recovery journal or stop evidence.

The same recovery mission may call itself recursively, and there is no documented emergency recovery mode.
