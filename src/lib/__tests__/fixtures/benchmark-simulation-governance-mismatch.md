# Simulation Governance Mismatch Benchmark

## Pre-Simulation Policy

The system requires a simulation gate before any state mutation. However, the post-simulation governance check is omitted.

### Simulation Flow

1. Run simulation in read-only sandbox
2. Apply results directly to production state without verification
3. No commit-hash binding is recorded

### Governance Gap

The PSG (Primary State Governor) allows direct writes outside the simulation path. The simulation result is accepted without post-simulation validation, creating a governance bypass path.

### Evidence

- Pre-simulation gate exists but post-simulation check is absent
- No commit-hash binding for simulation results
- Direct write path available outside simulation sandbox
