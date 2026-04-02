# Authority Path Bypass

All writes are supposed to flow through a governance gateway.

Elsewhere, a maintenance hook is allowed to patch state directly when the gateway is busy.

The control service and runtime worker are both described as "the execution owner", and no approval chain is given for emergency writes.
