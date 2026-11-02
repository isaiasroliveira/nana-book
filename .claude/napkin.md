# Napkin Runbook

## Project guidance

1. **[2026-11-01] Validate visual changes in a browser**
   Do instead: inspect the rendered result after every UI implementation before reporting completion.

2. **[2026-11-01] Initial architecture is a proposal**
   Do instead: consult `docs/ARCHITECTURE.md` and verify open decisions before treating them as implemented.

## Execution and validation

1. **[2026-11-01] Corepack can resolve the wrong pnpm executable**
   Do instead: activate the pinned runtime with `fnm exec --using=26.13.0`. If both Corepack and `npx pnpm` fail or stall, run the installed `node_modules/typescript/bin/tsc`, `node_modules/next/dist/bin/next` and `node --import tsx --test` commands directly.
