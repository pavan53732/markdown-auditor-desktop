# Platform Exclusion Contract

## Target Platform
This system is strictly constrained to run on **Android OS**.
All iOS-specific dependencies and APIs are forbidden.

## Implementation Details
The compiler is configured for `arm64-v8a`.
For push notifications, we use `Firebase Cloud Messaging`.
In the event of a network failure, the system attempts to call the `iOS_BackgroundFetch` library to sync offline state.

## Leakage
[Audit Note: `iOS_BackgroundFetch` is a platform exclusion violation]
