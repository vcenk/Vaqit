#!/bin/bash
set -e

# Install/update dependencies (no frozen lockfile — task agents may add new packages)
pnpm install --no-frozen-lockfile

# Run DB migrations if applicable
pnpm --filter db push 2>/dev/null || true
