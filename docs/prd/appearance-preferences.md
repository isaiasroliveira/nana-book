# Appearance preferences

## Problem

Readers cannot choose the site's colors or a dark appearance. The existing color comparison is limited to a development prototype, and the shadows around book covers need refinement.

## Proposed solution

Let readers choose petrol blue, sage green or dusty rose and a light or dark appearance on the site. Remember the choice on the same device. Refine book cover shadows so they feel grounded across appearances and cover sizes.

Evaluate Bricolage Grotesque for headings and navigation alongside the existing body typeface before extending its use across the site.

## Reader stories

1. As a reader, I want to choose a palette, so that the site reflects my preference.
2. As a reader, I want to choose a light or dark appearance for each palette, so that I can read comfortably.
3. As a reader, I want my choice to remain after reopening the site on the same device, so that I do not need to set it again.
4. As a keyboard or assistive technology user, I want to identify and operate the appearance controls, so that I can change my preference independently.
5. As a reader, I want book covers to have restrained, consistent depth, so that the shadows do not distract from the books.
6. As a reader, I want headings and navigation to remain clear and legible, so that I can navigate the reading journal comfortably.

## Implementation decisions

- Make appearance controls available on the site, with the active palette and mode identifiable.
- Provide light and dark variants of each of the three prototype palettes. Keep text, controls, borders and focus indicators legible in every combination.
- Store preferences locally on the device; account synchronization is outside the current product capabilities.
- Preserve the current site appearance as the initial default until a reader makes a selection.
- Apply refined cover shadows to both the latest reading and the shelf, including small screens.
- Keep the current cover content and dimensions intact.
- Compare Bricolage Grotesque in headings and navigation with the current typography, while retaining the existing body typeface for the initial evaluation.
- Limit files to 500 lines and split by responsibility when necessary.

## Testing decisions

- Test public behavior through the appearance controls and rendered page: selecting each palette and mode, identifying the current selection, and restoring a saved choice after reload.
- Verify keyboard operation and accessible control names and states. Check representative light and dark combinations for contrast and visible focus.
- Review book shadows visually on the shelf and latest reading at desktop and mobile sizes. Existing component tests cover cover content; avoid tests coupled to CSS shadow values.
- Review the proposed typeface at desktop and mobile sizes, including Portuguese accents, navigation labels and headings.
- Follow the existing component test approach where appropriate, and use browser checks for persistence and visual behavior.

## Out of scope

- User accounts, cross-device synchronization and custom color pickers.
- Changes to book metadata, cover content or the site layout.

## Further notes

- Placement of appearance controls can follow the current layout, provided they are discoverable and usable on mobile.
