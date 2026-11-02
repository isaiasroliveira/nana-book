# Nana Book design direction

## Product

A personal reading diary, currently demonstrated with sample readings and notes. Book search uses Google Books. Do not imply that reading progress, note editing or persistence already exists.

## Nighttime reading desk

The interface takes its identity from books as objects, notes as pages and the yellow mascot as a reading companion. The default remains dark. Open composition replaces enclosing dashboard cards. Desktop pairs a compact search with the introduction, then a loose book cover, its bibliographic details and one paper note. Mobile stacks the introduction and search, pairs cover and details, then shows the note and two-column shelf.

## Tokens

```design-tokens
background: #25251f
surface: #303029
text: #f5f2e9
muted: #b6b3aa
border: #49493d
accent: #f5c94f
note-paper: #e6dfbd
note-ink: #383b2c
```

Use Bricolage Grotesque for navigation, headings and controls. Fraunces regular gives book titles and reading notes a literary voice. Display type stays below 64px on desktop and 48px on mobile. Spacing follows 8, 12, 16, 24, 32, 48 and 64px. Rounded corners belong to controls and the folded edge of the note; books keep their own proportions.

Yellow identifies actions and the selected navigation item. The mascot appears prominently once in the header. The cream note is the one contrasting material. Real cover colors supply visual variety. No decorative statistics, progress bars or repeated card containers.

Existing saved palette and mode selections remain supported. Cover images fall back to illustrated covers when unavailable. Keyboard focus remains visible.

## References and decisions

- [Refero Styles](https://styles.refero.design/): compare authored visual systems rather than copying a generic dark dashboard.
- [Literal](https://literal.club/): books, shelves and personal reading as the product center.
- [Are.na](https://www.are.na/): collection content carries identity with quiet interface chrome.
- [teenage engineering via Refero](https://styles.refero.design/style/aecf9dda-5cba-4dc7-9e73-59b65d895cdf): objects lead the composition.

The watercolor hero and later enclosing charcoal feature card were replaced after feedback that the page lacked identity. Motion remains limited to user interactions. No entrance or scroll effects.

The primary search entry is “Avaliar um livro”: find a book the reader has read, rather than promote the next read. Keep the featured cover as a regular image; the Three.js experiment was rejected. Rating submission and persistence remain outside the implemented demo.

Original light mode uses a soft paper canvas (#ffffff), warm white surfaces (#ffffff) and dark olive text (#303030), preserving banana-yellow action fills. Muted text and rating accents darken for legibility. Mode selection does not switch palettes.

The featured reading uses the review background in every palette, including Original. Original light uses a neutral canvas and a warm yellow feature band (#f5edce); yellow stays in actions and the diary note.

Original light uses neutral gray text and canvas, with a warm yellow feature band. Its note paper is a subdued near-neutral #f0eee4, so banana yellow remains concentrated in the mascot and primary actions.
