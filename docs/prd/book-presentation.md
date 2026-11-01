# Book presentation

Status: approved visual direction; validation boundaries approved; implementation tracked in GitHub issue #7.

## Problem

Flat book placeholders do not convey the tactile character desired for the reading shelf.

## Solution

Keep covers front-facing and add a subtle spine, fold highlight, edge thickness and grounded shadow. Use CSS rather than a 3D dependency. Preserve legibility, aspect ratio and the approved diary layout. Apply the treatment to the shelf and latest reading, scaling it for smaller covers.

## Acceptance criteria

- Covers have a narrow left spine and subtle light/shadow depth.
- Titles remain readable and decorative layers never intercept interaction.
- Shelf and latest-reading covers share the treatment.
- No horizontal page overflow at 390, 768 or 1440px.
- Do not introduce animations, external images or new dependencies.

## Approved validation

A component test verifies accessible cover identity and content. Browser captures validate the visual treatment and responsive layout. A markup test cannot establish visual quality.
