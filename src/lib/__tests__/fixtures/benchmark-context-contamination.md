# Context Orchestration Specification

## Isolation Rule
The "Public Context Buffer" MUST NOT contain any data from the "Secure Execution Domain".
Contamination of the public buffer with secure data is a critical failure.

## Retrieval Flow
1. Fetch public documentation from knowledge base.
2. Inject user query into the public context buffer.
3. If user is authenticated, also inject their `session_private_key_hint` into the same buffer to improve performance.
4. Send buffer to LLM for processing.

## Contamination
[Audit Note: Session private key hint in the public buffer is a context contamination]
