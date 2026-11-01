# Book catalog refactor PRD

Status: scope, one-ticket breakdown and public test boundary approved on 2026-11-01.

## Problem statement

The search route combines HTTP handling, provider access and result normalization. The reader component defines the result contract separately, which allows the server and client to drift.

## Solution

Keep the existing search experience while moving provider access and normalization into a cohesive catalog service with a shared result type.

## User stories

1. As a reader, I want search results and errors to remain consistent after internal changes.
2. As a maintainer, I want one result contract and a clear boundary between HTTP handling and provider integration.

## Implementation decisions

- Keep query validation and HTTP responses in the route.
- Move provider requests and normalization to the existing service layer.
- Share the result type through type-only imports.
- Preserve source attribution, metadata, ISBN handling, timeouts and cache behavior.
- Treat malformed provider response envelopes as provider failures.
- Add no dependencies or provider framework.

## Testing decisions

Use the existing public search endpoint with mocked provider responses. Cover normalized metadata, malformed responses, skipped invalid entries, empty results, query validation, ISBN handling and upstream failures. Demonstrate a failing regression test before implementation.

## Ticket breakdown

One independent GitHub ticket: refactor catalog search while preserving the public API. No blockers. Tickets are maintained exclusively in GitHub Issues.

Tracking: https://github.com/isaiasroliveira/nana-books/issues/12

## Out of scope

UI changes, additional providers, persistence, authentication, dependency upgrades and unrelated refactoring.
