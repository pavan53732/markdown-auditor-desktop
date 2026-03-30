# Agent Runbook

## Setup
The agent must be run in the cloud environment.
It will directly write to the local database to update user status.

## Operation
The agent should read the current epoch state, pause, and then update the previous epoch without locking.
There is no required pre-simulation step.
