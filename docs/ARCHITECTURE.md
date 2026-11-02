# Architecture

## Status

Nana Book uses Next.js and TypeScript with the App Router. Managed Neon Auth supplies reader identity and PostgreSQL on Neon persists private evaluations. The application lives in `src/app`, reusable UI in `src/components`, and public assets in `public`. Google Books supplies interactive book discovery. Sharing and deployment remain open.

## Adopted application stack

Tailwind CSS supplies utility styles through PostCSS. Shared controls use shadcn/ui and Fluid Functionalism with Radix primitives; MotionConfig respects reader motion preferences. Existing CSS and appearance tokens remain the theme source during incremental component migration. Playwright supports browser and viewport checks.

Use Next.js with TypeScript for the web interface and server-side application operations, Node.js as the server runtime, and pnpm as the package manager. Keep the interface and backend in one application until a concrete requirement justifies separation. Select supported stable versions and review security advisories before installation and upgrades.

## Initial direction

The product is a mobile-first reading diary. Managed Neon Auth uses Better Auth through the installed Neon SDK. Node.js and pnpm are the project runtime and package manager; pinned versions should be kept current with security releases.

```text
Reader → web application → business rules and authentication
                           ├─ PostgreSQL on Neon
                           ├─ Google Books (interactive book discovery)
                           └─ file storage (undecided)
```

The server validates external input and enforces authorization. The database preserves persistent data and integrity. External catalog, authentication and storage integrations should remain clear at their boundaries. Add separate layers only when they solve a demonstrated need.

Sharing generates a preview and invokes the device share sheet when supported; saving the image provides a fallback. Test the Instagram flow on physical iPhone and Android devices.

Open decisions include file storage, recovery, sharing and deployment.

## Private evaluations

Route handlers validate sessions with the Neon SDK before reading or saving evaluations. Ownership always comes from the verified session. Private responses are never shared-cacheable. Mutations require a matching request origin and bounded JSON input.

The relational schema uses internal edition identities and the existing authentication user primary key. Reviews reference both identities through foreign keys, enforce a rating of 1 through 10 half-star units and allow one current evaluation per reader and edition. Reader deletion cascades to reviews; referenced edition deletion is restricted. Edition resolution and review upsert share one atomic PostgreSQL statement. The diary uses stable cursor pagination ordered by creation time and review identity. Migrations live in `db/migrations` and execute transactionally through `scripts/migrate.mjs`.

## Book catalog

Google Books is the sole catalog provider. The server uses a project API key to search titles, authors and ISBNs and resolves selected volume identities before saving evaluations. Public results carry source attribution. Catalog calls use bounded timeouts and preserve empty/error states. A catalog outage does not hide saved reader evaluations. Provider quotas apply per Google Cloud project; monitor them in the Cloud Console.
