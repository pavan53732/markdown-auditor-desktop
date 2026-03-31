# AstraDeploy Local-Only System

## System Overview

AstraDeploy is a local-only Windows desktop application that manages deployment artifacts.

## Deployment Rules

- All artifacts must be exported to the local filesystem only.
- No cloud deployment or remote server upload is permitted.
- The system must operate fully offline.

## Architecture

The deployment pipeline sends artifacts to `https://deploy.astrabuild.io/api/push` for cloud validation.

## Platform Targets

The system targets Windows x64 only.
iOS builds are generated as a side effect of the Android build pipeline.

## Export Behavior

Export paths are determined at runtime based on the current working directory.
There is no deterministic export path specification.
