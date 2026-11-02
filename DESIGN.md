# Nana Book design direction

## Product

A personal reading diary with private saved evaluations and a public demonstration. Book search uses Google Books. Reading progress and gamification are not implemented.

## Nighttime reading desk

The interface takes its identity from books as objects, impressions as editorial text and the yellow mascot as a reading companion. The default remains dark. Open composition replaces enclosing dashboard cards. Desktop pairs a compact search with the introduction, then a loose book cover, its bibliographic details and a reading impression below them. Mobile stacks the introduction and search, pairs cover and details, then shows the note and two-column shelf.

## Tokens

```design-tokens
background: #25251f
surface: #303029
text: #f5f2e9
muted: #b6b3aa
border: #49493d
accent: #f5c94f
```

Use Bricolage Grotesque for navigation, headings and controls. Fraunces regular gives book titles and reading notes a literary voice. Display type stays at or below 60px on desktop and 48px on mobile. Body text is 16px; secondary metadata and controls use 14px. Spacing follows 8, 12, 16, 24, 32, 48 and 64px. Rounded corners belong to controls; books keep their own proportions.

Yellow identifies actions and the selected navigation item. The mascot appears prominently once in the header. Reading impressions have no enclosing card or colored band. Each impression starts with the reviewer name and rating together, followed by the opinion in regular Fraunces on the page background. Book details and reviewer content share one body on desktop; mobile places the attributed opinion immediately below the cover and title. Real cover colors supply visual variety. No decorative statistics, progress bars or repeated card containers.

Liquid glass belongs only on fixed navigation that overlays scrolling content: the desktop header and mobile bottom bar. Keep search and reading content on clear, solid surfaces. Respect reduced-transparency preferences and use opaque navigation when backdrop filtering is unavailable.

Use Tailwind CSS and shadcn/ui with the Radix flavor of Fluid Functionalism for shared controls. Navigation uses one moving hover highlight; search buttons preserve their label while loading. Map interaction colors to the existing appearance tokens and honor reduced motion through the root MotionConfig. Keep the existing fonts and glass navigation identity.

Existing saved palette and mode selections remain supported. Cover images fall back to illustrated covers when unavailable. Keyboard focus remains visible.

## References and decisions

- [Refero Styles](https://styles.refero.design/): compare authored visual systems rather than copying a generic dark dashboard.
- [Literal](https://literal.club/): books, shelves and personal reading as the product center.
- [Are.na](https://www.are.na/): collection content carries identity with quiet interface chrome.
- [teenage engineering via Refero](https://styles.refero.design/style/aecf9dda-5cba-4dc7-9e73-59b65d895cdf): objects lead the composition.

The watercolor hero and later enclosing charcoal feature card were replaced after feedback that the page lacked identity. Motion remains limited to user interactions. No entrance or scroll effects.

The primary search entry is “Avaliar um livro”: find a book the reader has read, rather than promote the next read. Keep the featured cover as a regular image; the Three.js experiment was rejected. The signed-in diary supports rating submission and persistence.

Original light mode uses a soft paper canvas (#ffffff), warm white surfaces (#ffffff) and dark olive text (#303030), preserving banana-yellow action fills. Muted text and rating accents darken for legibility. Mode selection does not switch palettes.

The featured reading and its impression sit directly on the canvas in every palette. Shadows stay restrained on book covers and floating navigation; the review editor uses a border without a decorative shadow.

Original light uses neutral gray text and canvas. Banana yellow remains concentrated in the mascot and primary actions.
