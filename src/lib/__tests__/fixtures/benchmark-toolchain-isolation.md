# Toolchain Leakage Example

The build runner uses whatever Node.js, Java, and Android SDK are already on the host PATH.

Caches are shared in the global user profile, and sandbox fallback silently disables isolation when the preferred environment is unavailable.

The runtime capability manifest is mentioned, but required permissions are not enumerated anywhere.
