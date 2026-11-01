# Architecture

## Status

Nana Books is in planning. Next.js and TypeScript are adopted for the application. The initial App Router home page implements the approved diary layout with demonstration data. Authentication, persistence and sharing are not implemented. The application lives in `src/app`, reusable UI in `src/components`, and public assets in `public`. Google Books is adopted for interactive book discovery; deployment remains open.

## Adopted application stack

Use Next.js with TypeScript for the web interface and server-side application operations, Node.js as the server runtime, and pnpm as the package manager. Keep the interface and backend in one application until a concrete requirement justifies separation. Select supported stable versions and review security advisories before installation and upgrades.

## Initial direction

The product is a mobile-first web application for reader profiles, ratings and sharing. The proposed stack is Vercel, PostgreSQL on Neon and Better Auth. Managed versus self-hosted Better Auth remains undecided. Node.js and pnpm are the project runtime and package manager; pinned versions should be kept current with security releases.

```text
Reader → web application → business rules and authentication
                           ├─ PostgreSQL on Neon
                           ├─ Google Books (interactive book discovery)
                           └─ file storage (undecided)
```

The server validates external input and enforces authorization. The database preserves persistent data and integrity. External catalog, authentication and storage integrations should remain clear at their boundaries. Add separate layers only when they solve a demonstrated need.

Sharing generates a preview and invokes the device share sheet when supported; saving the image provides a fallback. Test the Instagram flow on physical iPhone and Android devices.

Open decisions include book metadata and cover licensing, authentication deployment, file storage, privacy, recovery and costs.

## Book catalog

Google Books is the sole catalog provider. The server uses a project API key to search titles, authors and ISBNs and returns available volume metadata with source attribution. The public endpoint preserves bounded input, timeouts and empty/error states. Provider quotas apply per Google Cloud project; monitor them in the Cloud Console. Metadata remains transient; persistence and cover permissions remain outside this integration.
