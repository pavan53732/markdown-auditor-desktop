# Tool Side-Effect Leakage Benchmark

## Tool Execution Safety

Tool side effects leak to unrelated systems, violating sandbox isolation.

### Tool Flow

1. Tool executes in sandbox environment
2. Side effects leak to global state
3. Sandbox boundary not enforced for privileged tools

### Side-Effect Leakage

The sandbox isolation boundary is not enforced. Direct tool side-effect leakage occurs to unrelated systems.

### Evidence

- Sandbox isolation boundary gap: boundary not enforced
- Direct tool side-effect leakage to unrelated systems
- Side effect validation absence for read-only tools
- Tool invocation contract gap for validated calls
