# Design direction

Nana Books is a mobile-first reading journal. The Nana family assets establish a warm banana-yellow, cream and deep brown palette. Book covers supply visual variety. The diary layout (prototype A) is approved: a welcome section, latest review and recent reading shelf. Other prototypes have been removed.

Design priorities: legible reading, generous touch targets, recognizable rating and sharing actions, and a calm interface that puts books first. Reader-facing copy is in Portuguese.

The initial implementation uses Lucide icons, SVG half-star fills, a cream canvas, yellow accents and a responsive book shelf. Book covers remain illustrative pending catalog selection.

Book covers use a restrained CSS spine, fold highlight, thin edge and grounded shadow while remaining front-facing. Gradients are limited to material lighting on the cover, not page or card backgrounds.

## Color exploration

A temporary development-only color prototype at `/prototype/colors` compares petrol blue, sage green and dusty rose on the approved layout. Query parameter `palette` selects the variant. The site offers these palettes in light and dark modes, remembering the selection on the device. The original palette remains the initial default. Cover artwork colors remain independent of the application palette.

Fraunces is used for headings and book covers; Bricolage Grotesque is used for navigation and other interface text.

The default reading surface uses a cool, pale green background, with a quieter contrasting surface for the latest review. Reader-selected palettes continue to override the default colors.
