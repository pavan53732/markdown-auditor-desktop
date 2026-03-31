# Control Plane Override Abuse Benchmark

## Authority Delegation

The control plane delegates authority to the execution owner, but override conditions are not specified.

### Override Path

1. Any execution owner can override control-plane decisions
2. No audit trail is recorded for overrides
3. Override conditions are permanent without manual reset

### Authority Confusion

The control plane and data plane are not properly separated. The execution owner boundary is ambiguous, allowing unauthorized writes through the control plane.

### Evidence

- Override conditions not specified
- No audit trail for control-plane actions
- Execution owner boundary unclear
- Control-plane separation breach in unified interface
