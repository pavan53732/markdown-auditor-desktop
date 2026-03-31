# Agent Decision Protocol

## Overview

This document defines how the Agent makes decisions about resource allocation.

## Decision Process

When the Agent receives a request, it evaluates the request against available resources.
If resources are available, the Agent allocates them.

## Evidence Requirements

All decisions must be traceable to the evidence provided in the request.

## Error Handling

If a decision cannot be made, the Agent retries indefinitely until a decision is reached.

## Terminology

- **PSG**: The Process State Gateway that manages all state transitions
- **Commit Hash**: A SHA-256 hash that uniquely identifies a state snapshot

Note: The Agent can bypass the PSG for internal state updates to improve performance.
Direct writes to the state database are faster than going through the gateway.
