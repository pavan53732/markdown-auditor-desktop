# Artifact Reproducibility Failure

Build outputs include a timestamp suffix in the package name and an environment-derived random folder.

The artifact manifest does not record the source commit, and the package version increments on every attempted build regardless of validation outcome.

Replay guidance claims the same binary can be reproduced, but no input hash or environment snapshot is persisted.
