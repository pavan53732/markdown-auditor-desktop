# Export Non-Determinism Benchmark

## Export Flow

The export path varies by environment, creating non-deterministic behavior.

### Export Path

1. Export path includes timestamp, varying per execution
2. Export structure is incomplete in partial exports
3. Export atomicity gap during streamed exports

### Non-Determinism

The export path determinism is violated. The remote deployment prohibition is not rigorously enforced, allowing cloud dependency leaks.

### Evidence

- Export path varies by environment
- Export structure incomplete in minimalist builds
- Remote deployment prohibition rigor gap
- Export path determinism detail gap
