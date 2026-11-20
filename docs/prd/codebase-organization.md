# Codebase organization

## Problem

Related behavior is spread across generic directories, and large files make changes harder to understand. The project has no documented file-length limit.

## Outcome

Keep maintained text files at or below 500 lines and organize code around responsibilities that change together. Preserve existing reader-visible behavior, accessibility, security, and visual appearance. Generated files, dependency lockfiles, and vendored third-party code are outside the limit.

## Delivery slices

1. Document and check the file-length rule, including its exclusions.
2. Organize application styles by responsibility without changing the cascade or appearance.
3. Separate hover geometry from interaction management while retaining its public behavior.
4. Address confirmed cross-feature coupling in independently verifiable slices, including appearance initialization and review ownership where a simpler boundary preserves behavior.
5. Review redundant comments and tests after the structural changes.

Slices are independent unless a specific dependency is discovered. Avoid moving files merely to satisfy a preferred directory tree.

## Verification

Exercise existing public behavior through component, integration, and browser tests as appropriate. Add focused regression coverage where a meaningful behavior is currently unprotected. Verify hover interaction, appearance before hydration, search, diary, authentication, and the visual cascade where affected. Demonstrate a failing test for each behavioral slice before implementation. Run the available project checks and report any unavailable checks.

## Out of scope

New product features, design changes, and behavior changes unrelated to a discovered structural defect.
