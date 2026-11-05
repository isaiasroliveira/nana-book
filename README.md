<p align="center">
  <img src="public/icons/nana-book-192.png" alt="Nana Book app icon" width="128">
</p>

<h1 align="center">Nana Book</h1>

<p align="center">A reading journal for the books that stay with you.</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#tests">Tests</a> ·
  <a href="#documentation">Documentation</a>
</p>

Search for a book, choose the edition you read, and save your rating and opinion in a private diary. Nana Book is designed for mobile and works on desktop too.

## A look inside

The demonstration diary on desktop and mobile:

<p align="center">
  <img src="docs/images/diary-desktop.png" alt="Desktop view of the Nana Book demonstration diary" width="700">
  <img src="docs/images/diary-mobile.png" alt="Mobile view of the Nana Book demonstration diary" width="195">
</p>

## Features

- Find editions by title, author or ISBN using Google Books.
- Save private ratings in half-star increments, add an optional opinion and mark spoilers.
- Edit or delete evaluations and revisit your reading diary across devices.
- Personalize the app's appearance and install it on your home screen.

Built with Next.js, TypeScript, Neon Auth and PostgreSQL.

## Getting started

Use the Node.js version in `.nvmrc` and the pnpm version in `package.json`. To run the app locally:

```sh
fnm install
fnm use
npx --yes pnpm@12.14.0 install
npx --yes pnpm@12.14.0 dev
```

Open http://localhost:3000 to explore the demonstration diary. To enable private diaries and book search, configure the services described in [Private diary setup](#private-diary-setup) and [Experimental book search](#experimental-book-search).

Run `pnpm verify` before submitting application changes. If the shell still reports an old Node.js version, run `eval "$(fnm env)"` before `fnm use`. The explicit npx commands avoid older Corepack versions that incorrectly look for `bin/pnpm.cjs` in pnpm 12.

Direct dependency versions are pinned. Use `pnpm install --frozen-lockfile` for automated installations.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Coding standards](docs/CODING_STANDARDS.md)
- [Design direction](DESIGN.md)

## Environment troubleshooting

- `node --version` must match `.nvmrc`; activating a runtime in another terminal does not update the current shell.
- `pnpm --version` must match `packageManager` in `package.json`.
- If `pnpm` fails with a missing `bin/pnpm.cjs`, use `npx --yes pnpm@12.14.0` instead. The project pin remains unchanged.
- `ENOTFOUND registry.npmjs.org` prevents installation. Run the commands in a terminal with registry access. An offline installation cannot succeed unless every required package is already cached.
- A successful syntax check is not a successful typecheck, build, or browser test. Do not report the application as verified until `pnpm verify` succeeds.

## Docker

```sh
docker build -t nana-books .
docker run --rm -p 3000:3000 nana-books
```

Open http://localhost:3000. Stop the container with Ctrl+C. Rebuild the image after changing the source.

## Tests

Run `pnpm test` to check component behavior. `pnpm verify` also runs the tests before type checking and building.

Run `pnpm test:browser` against the local development server to check appearance and the review flow. The review browser test uses deterministic HTTP fixtures.

For integration tests, create an isolated Neon branch with Auth enabled and email verification disabled for test accounts. Put its pooled connection in `DATABASE_URL`, its direct connection in `DATABASE_URL_UNPOOLED` and `TEST_DATABASE_URL`, and its Auth URL and an application cookie secret in a private `.env.test` file. Never use production credentials. PostgreSQL client tools (`psql`) must be installed.

```sh
node --env-file=.env.test scripts/migrate.mjs
pnpm build
node --env-file=.env.test --import ./tests/fixtures/catalog-preload.mjs node_modules/next/dist/bin/next start --port 3102
# In another terminal:
node --env-file=.env.test --test tests/integration/*.test.mjs
```

These tests use real PostgreSQL and Neon Auth through the public HTTP endpoints, with deterministic Google Books responses. They create temporary reader accounts and remove them after the run. They cover ownership, direct database constraints, concurrent saves, stable pagination and transactional rollback.

## Private diary setup

Use the Neon branch connection settings in `.env.local`: `DATABASE_URL` for application queries, `DATABASE_URL_UNPOOLED` for migrations, and `NEON_AUTH_BASE_URL` for Managed Neon Auth. Generate `NEON_AUTH_COOKIE_SECRET` with `openssl rand -base64 32`. Keep these values private. Register the application origin in the branch Auth trusted domains.

Run `pnpm db:migrate` before starting the application. Migrations run in a transaction over the direct connection and record their applied filenames. The schema references the existing `neon_auth.user` identity. Sign up or sign in at `/auth/sign-in`; use the same page to sign out.

The diary uses one current evaluation per reader and edition. Ratings range from 0.5 to 5 stars. Opinions are optional plain text, limited to 5,000 characters, and can be marked as spoilers. Editing updates the existing evaluation. Private API responses use `private, no-store` caching, and ownership comes from the authenticated session.

The application requires new and reset passwords to contain at least 12 characters, including uppercase and lowercase letters, a digit and a punctuation mark or symbol. Existing passwords remain valid for sign-in. These rules are enforced by the application authentication proxy; the managed Neon Auth endpoint is separately accessible, so provider-level enforcement must be verified before relying on this policy as a universal restriction.

## Experimental book search

Book search uses [Google Books](https://developers.google.com/books/docs/v1/using). Set `GOOGLE_BOOKS_API_KEY` in `.env.local` using a Google Cloud project with the Books API enabled, and restart the application. The key is used only on the server. Remove the obsolete `OPEN_LIBRARY_CONTACT_EMAIL` setting.

Searches support titles, authors and ISBNs. Results identify Google Books and include available edition metadata. Available provider covers appear in search results. Google applies project quotas; check the Books API quota page in Google Cloud Console for current limits and usage.

Search endpoint tests mock external HTTP responses. Browser checks cover success and provider-error feedback; these checks do not establish live provider coverage or quotas.
