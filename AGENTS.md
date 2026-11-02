# Nana Book

Read [architecture](docs/ARCHITECTURE.md) and [coding standards](docs/CODING_STANDARDS.md) before changing the project. The architecture is an initial direction; do not treat open decisions as implemented.

Use English for identifiers, code comments and documentation. Keep changes cohesive and tests proportional to risk. Record notable changes in `CHANGELOG.md` under `[Unreleased]`.

## Delivery workflow

Follow PRD → ticket → TDD → implementation. Approve the scope, ticket breakdown and public test boundaries before implementation. Tickets live exclusively in GitHub Issues, with `ready-for-agent` for approved actionable tickets. Do not create or maintain local ticket files. PRDs may be versioned in the repository. Work one vertical behavior slice at a time and demonstrate a failing test before adding implementation. Keep code, comments, documentation, commits and PRs in English.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
