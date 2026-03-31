# World State Atomicity Benchmark

## State Mutation Flow

The world state is mutated without atomicity guarantees.

### Mutation Path

1. State mutation occurs outside the PSG gateway
2. No commit-hash binding is recorded
3. Read/write atomicity is not enforced

### Atomicity Gap

The state mutation invariant is breached during transitional states. Snapshot isolation is not atomic with mutation, creating a window for dirty reads.

### Evidence

- State mutation invariant gap in transitional states
- Mutation gateway bypass during system recovery
- snapshot isolation not atomic with mutation
- Read/write atomicity failure on independent fields
