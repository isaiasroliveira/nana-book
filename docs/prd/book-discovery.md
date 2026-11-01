# Book discovery PRD

Status: approved. Scope, ticket breakdown and public test boundaries approved on 2026-11-01.

## Problem statement

Readers need to find the correct book and edition before recording a reading or rating. The current application contains illustrative books only.

## Solution

Provide title, author and ISBN search through Google Books, identify the source, and display available edition metadata without creating a permanent catalog. The latest provider choice supersedes the earlier provider comparison.

## User stories

1. As a reader, I want to search by title so that I can find a book.
2. As a reader, I want to search by author so that I can find their books.
3. As a reader, I want to search by ISBN so that I can identify an edition.
4. As a reader, I want to see author, language, publisher and publication date when available so that I can distinguish editions.
5. As a reader, I want to know which source returned a result so that I know where the metadata came from.
6. As a reader, I want clear loading, empty and error states so that I know whether to retry.
7. As a reader, I want a clear error when the catalog is unavailable so that I know when to retry.

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

Google Books is the selected provider; continue checking representative Brazilian titles to assess coverage. Store catalog provenance in future persistent records. The current app predates this PRD and must not be presented as having been built test-first.

## Discovery notes

The reader journey starts with finding the correct book and edition. Present title, authors and available edition metadata clearly, preserve source identifiers, and distinguish empty results from upstream failure. Research-informed proposals for later reading and sharing flows are recorded in [product discovery](../PRODUCT_DISCOVERY.md); they do not expand this PRD's approved scope.

## Approved amendment: adopt Open Library

Status: provider choice, revised ticket scope and public test boundaries approved on 2026-11-01.

- Replace Google Books with Open Library as the sole search provider, with no API key requirement.
- Preserve title, author and ISBN search through the existing public HTTP endpoint and reader interface.
- Return edition identifiers and available edition metadata from the same edition; never combine ISBN, language, publisher or date from unrelated editions of a work.
- Prefer Portuguese editions without excluding other languages. Preserve validation, timeouts, source attribution and empty/error states.
- Respect the provider's published request limits and identify the application. Document any contact configuration required for identified requests.
- Deliver one vertical ticket, with no blockers: replace the provider, adapt fixtures, remove Google credential setup, and update architecture, setup documentation and changelog.
- Test through the public search HTTP endpoint: title/author/ISBN requests, edition consistency, missing/invalid metadata, empty results, upstream failures and request limiting. Demonstrate a failing test before implementation.
- Verify the existing browser search flow with Open Library attribution. Live coverage checks are a small sample, not a guarantee of Brazilian catalog completeness.
- Exclude provider comparison, Google fallback, persistence, cover display and new dependencies.

## Amendment: use Google Books

The user selected Google Books as the sole provider after reviewing Open Library coverage and the Google Cloud project quota. Preserve the existing reader flow and approved endpoint and browser test boundaries. Use a server-side API key; keep persistence and cover display out of scope. One vertical ticket covers the provider switch, tests and documentation.

## Tracking

- Google Books provider: https://github.com/isaiasroliveira/nana-books/issues/18

- Provider adoption: https://github.com/isaiasroliveira/nana-books/issues/16
- PRD: https://github.com/isaiasroliveira/nana-books/issues/4
- First implementation ticket: https://github.com/isaiasroliveira/nana-books/issues/5
- Second implementation ticket: https://github.com/isaiasroliveira/nana-books/issues/6
