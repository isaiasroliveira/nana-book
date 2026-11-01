# Reading experience discovery

## Evidence boundary

Reviewed public product introductions, public forms and official help articles. Authenticated interactions and physical-device sharing were not exercised. The observations below inform proposals; they do not expand the approved implementation scope.

## Reader journeys

### Find a book

Search by title, author or ISBN. Show enough edition information to disambiguate language, publisher and format. A work and a particular edition are different identities; never merge them based on title alone. Barcode capture is a future option, not a search prerequisite.

### Organize a reading life

Separate reading status from rating and review. A reader can want to read, be reading, finish or abandon a book without writing a review. Custom shelves, progress and rereading history are possible later additions. Numeric targets should not be required to record a reading.

### Express an opinion

Use a five-star scale with half-star steps and genuinely half-filled icons. A short reaction should be possible without requiring long prose. Keep spoiler handling explicit when review writing is introduced. Reading completion date, rating and text serve different purposes and should not be conflated.

### Share an evaluation

Proposed flow: save the evaluation, preview the share image, then share or save the image. Distinguish sharing the book from sharing the reader's evaluation. Privacy and which information becomes visible require explicit decisions before implementation. Native sharing behavior must be checked on physical devices.

### Discover other reading paths

Personal shelves and curated collections can support discovery alongside reviews. Social feeds, reactions and copying collections are optional future directions, not approved requirements.

## Proposals for Nana Books

- Preserve the approved diary layout and a short path from search to reading registration.
- Keep ratings independent of review text and make the evaluation preview explicit before sharing.
- Allow a missing catalog entry to be reported rather than silently creating duplicates; the actual contribution workflow remains undecided.
- Decide privacy, spoilers, data export and reading-history rules in subsequent PRDs before building them.

## Current implementation scope

The approved book-discovery PRD covers title, author and ISBN searches, provider attribution, edition metadata and partial failures. This research does not add authentication, persistence, sharing, custom shelves, progress tracking or social features to those tickets.
