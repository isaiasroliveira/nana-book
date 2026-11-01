# Book discovery PRD

Status: approved. Scope, ticket breakdown and public test boundaries approved on 2026-11-01.

## Problem statement

Readers need to find the correct book and edition before recording a reading or rating. The current application contains illustrative books only.

## Solution

Provide an experimental title, author and ISBN search that compares Google Books and Open Library results, identifies each source, and displays available edition metadata without creating a permanent catalog.

## User stories

1. As a reader, I want to search by title so that I can find a book.
2. As a reader, I want to search by author so that I can find their books.
3. As a reader, I want to search by ISBN so that I can identify an edition.
4. As a reader, I want to see author, language, publisher and publication date when available so that I can distinguish editions.
5. As a reader, I want to know which source returned a result so that I can compare catalog coverage.
6. As a reader, I want clear loading, empty and error states so that I know whether to retry.
7. As a reader, I want useful results from one provider when another fails so that a partial outage does not block discovery.

## Implementation decisions

- Use the existing Next.js application and approved diary layout.
- Query external providers on the server and keep credentials server-side.
- Keep provider identifiers and source labels; do not merge books based on title alone.
- Prefer Portuguese editions where the provider supports it, without silently excluding other languages.
- Validate bounded queries, bound provider response time, and respect provider rate limits.
- Do not persist provider content or generate cover-based Stories until usage permissions are resolved.

## Testing decisions

Approved public test boundaries:

- Public search HTTP endpoint: validation, title/author/ISBN queries, normalized results, provider outages and empty results. External HTTP responses use representative fixtures; this does not verify live provider coverage.
- Reader search flow in the browser: submitting a query and seeing results or errors. This does not verify physical-device sharing.

Use one failing behavior test, implement the minimum to pass, then repeat. Implement approved tickets in dependency order.

## Out of scope

Authentication, persistent reading records, ratings submission, bulk ingestion, automatic work/edition merging and Stories generation.

## Further notes

Compare representative Brazilian titles before selecting a primary provider. Store catalog provenance in future persistent records. The current app predates this PRD and must not be presented as having been built test-first.

## Discovery notes

The reader journey starts with finding the correct book and edition. Present title, authors and available edition metadata clearly, preserve source identifiers, and distinguish empty results from upstream failure. Research-informed proposals for later reading and sharing flows are recorded in [product discovery](../PRODUCT_DISCOVERY.md); they do not expand this PRD's approved scope.

## Tracking

- PRD: https://github.com/isaiasroliveira/nana-books/issues/4
- First implementation ticket: https://github.com/isaiasroliveira/nana-books/issues/5
- Second implementation ticket: https://github.com/isaiasroliveira/nana-books/issues/6
