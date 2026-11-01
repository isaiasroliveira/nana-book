# Development environment

## Problem

Developers need a repeatable way to run Nana Books and verify application behavior.

## Solution

Provide a Docker development environment and a component test environment using the project's pinned Node and pnpm versions.

## User stories

1. As a developer, I can start the application with Docker and access it locally.
2. As a developer, I can run automated component tests and receive a failing exit status when behavior regresses.
3. As a developer, I can find the commands in the project documentation.

## Decisions and testing

Keep the existing Next.js application and package manager. Test Docker through the application HTTP response and component behavior through its accessible output. Existing type checking and build verification remain available.

## Out of scope

Production deployment, CI hosting, databases, and end-to-end browser infrastructure.
