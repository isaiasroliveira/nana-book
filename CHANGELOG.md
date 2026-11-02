# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Use higher-resolution Google Books covers when available.

- Warm the original light theme feature band and align the reading note.

- Neutralize the original light canvas and apply the featured reading background across all themes.

- Focus book discovery copy on rating books the reader has already read.

- Give the reading diary a distinct nighttime desk layout with open book covers, compact search and a personal note.

- Display Google Books covers in search results and the demonstration shelf, with illustrated fallbacks for unavailable images.

- Default to a charcoal reading interface with a compact search introduction and featured demonstration book.

- Update the brand image and browser icon.
- Use Google Books for title, author and ISBN search with a server-side API key.

- Separate book catalog integration from HTTP handling and share the search result type with the reader interface.
- Refresh the default reading surface with a cool palette and more direct diary copy.
- Restore Fraunces for headings and use Bricolage Grotesque for interface text.
- Add reader-selectable light and dark color palettes, explore Bricolage Grotesque in headings and navigation, and refine book cover shadows.
- Explore petrol blue, sage green and dusty rose in the color prototype.

### Fixed

- Apply the saved appearance before the page first renders to prevent a theme flash.

- Keep the landing illustration visible behind the header across appearance palettes.
- Preserve readable heading and navigation colors over the light illustration in dark mode.
- Reject malformed catalog response envelopes instead of treating them as empty search results.
- Preserve the font import URL when formatting global styles.
- Align book authors and ratings across each row of the reading shelf.
- Pin direct dependency versions and document runtime activation and the verification command.

- Render fractional ratings with half-filled stars instead of a fraction character.

- Avoid a browser global name collision that prevented prototype layouts from rendering.

### Added

- Offer a persistent light mode for the original yellow reading theme.


- Explore a watercolor reading scene on the home page.
- Add a subtle spine, edge thickness and grounded shadows to book covers.

- Add experimental Google Books search with edition metadata, accessible feedback and server-side validation.

- Record public reader-journey research and approved catalog-discovery scope tracked in GitHub Issues.

- Add a Docker development image and a component test command.

- Start the Next.js and TypeScript application with the approved diary home page and Lucide rating icons.

- Add a fourth layout prototype centered on reader reviews and current reading.

- Add three temporary layout prototypes for design review.
- Document initial architecture and coding standards.
- Record Next.js and TypeScript as the adopted application stack.

### Removed

- Remove temporary layout prototypes after approval of the diary direction.
