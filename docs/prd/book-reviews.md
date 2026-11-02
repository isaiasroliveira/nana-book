# Book reviews

Status: implemented in issues #21 and #22. Scope, ticket breakdown and public test boundaries approved on 2026-11-01.

## Problem statement

Readers can find books but cannot select one and persist a personal rating and opinion.

## Proposed solution

Select a search result, confirm its edition, choose a rating from 0.5 to 5 in half-star steps, optionally write an opinion and mark spoilers, then save. Show the persisted review in the reader's diary after reload. Preserve form input on failure and prevent duplicate submissions. Reviews are private to their authenticated author in this first slice.

## User stories

1. As a reader, I want to confirm the selected edition before rating it.
2. As a reader, I want to assign half-star ratings without writing text.
3. As a reader, I want to optionally record an opinion and identify spoilers.
4. As a reader, I want my saved review to survive reloads.
5. As a reader, I want failures to preserve my input and allow retry.
6. As a reader, I want other readers to be unable to access or change my private reviews.
7. As a reader, I want to revise my existing evaluation without creating duplicates.

## Implementation decisions

- Require Managed Neon Auth for persistence and reuse its existing PostgreSQL user identity.
- Store one current review per reader and catalog edition. Different editions remain distinct; rereading history and work-level aggregation are outside this slice.
- Use integer rating units from 1 through 10, where displayed stars = rating units / 2. Enforce the range in the database and at the server boundary.
- Opinion is optional plain text, trimmed, with a limit of 5,000 characters. Empty text becomes NULL. Spoiler flag defaults to false.
- Resolve the selected provider identifier on the server; do not trust client-supplied metadata or ownership.
- Persist the catalog record and review atomically. Use database uniqueness for concurrent saves; editing the same reader/edition updates the existing review.
- Derive ownership from the authenticated session. Enforce ownership on every read and write; private responses must not enter shared caches.

## Relational model

Target third normal form: each fact belongs to its entity, multivalued relationships use join tables, and review records do not duplicate book or reader attributes.

| Relation | Facts and integrity |
| --- | --- |
| Auth user | Authentication-owned identity; reuse its primary key rather than maintain a second identity store. |
| editions | Internal primary key, provider code and provider volume identifier; UNIQUE(provider, provider_volume_id). Provider identifiers are external mappings, never internal primary keys. |
| reviews | Primary key, user and edition foreign keys, rating_units, nullable opinion, contains_spoilers, created_at and updated_at; UNIQUE(user_id, edition_id), CHECK rating_units BETWEEN 1 AND 10, opinion length constraint. |

All required fields use NOT NULL. Foreign keys prevent orphan records. User deletion removes their reviews; edition deletion is restricted while referenced. Index the reader diary query by (user_id, created_at DESC, id DESC), with stable cursor pagination. Add indexes to other foreign-key lookup paths when migrations establish actual access patterns. Do not store derived rating averages, counts, author lists or reader names on reviews.

An edition here means the selected catalog volume, not a claim that provider records resolve bibliographic identity perfectly. Distinct provider IDs can represent the same physical edition; cross-record reconciliation requires separate evidence and is deferred. Do not introduce an empty works hierarchy, partitioning or materialized aggregates without a current behavior that requires them. Normalization protects integrity; query plans and observed load guide subsequent performance changes.

## Public test boundaries

- Browser behavior: search, select an edition, choose half-stars, save, reload and see the persisted evaluation; revise it without duplicates.
- Public server boundary backed by a real isolated PostgreSQL database: reject unauthenticated requests, invalid ratings and oversized opinions; prevent cross-user reads and writes; handle concurrent duplicate saves and atomic rollback.
- Database constraints must reject invalid direct writes independently of UI validation.
- Provider failures preserve form input and create no partial review. Stub the external catalog in deterministic tests.
- Demonstrate a failing behavior test for each approved slice before implementation. Avoid tests coupled to component internals.

## Approved GitHub ticket breakdown

1. **feat: save and retrieve a private book rating**. Blocked by: none. Deliver authenticated selection, half-star rating, normalized persistence, private diary reload, validation and isolation tests across UI, server and database.
2. **feat: write and revise book opinions**. Blocked by: ticket 1. Deliver optional opinion, spoiler marker, revision of the existing evaluation, retained input on failure and end-to-end tests.

Publish approved tickets exclusively as GitHub Issues with ready-for-agent. This document is a PRD, not a local ticket ledger.

## Out of scope

Public profiles, sharing, feeds, likes, reading status, rereading history, automatic work/edition reconciliation, manual catalog contributions, rating aggregates and speculative infrastructure.

## Approved scope

The user approved the proposed behavior, relational identity, two vertical tickets and public test boundaries, including private-by-default reviews and one current evaluation per reader per catalog edition.

## Published tickets

- [#21: Save and retrieve a private book rating](https://github.com/isaiasroliveira/nana-books/issues/21).
- [#22: Write and revise book opinions](https://github.com/isaiasroliveira/nana-books/issues/22), blocked by #21.
