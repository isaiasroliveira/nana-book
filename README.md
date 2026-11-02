# Nana Book

A mobile-first reading journal built with Next.js and TypeScript. The initial home page implements the approved diary layout with demonstration readings, catalog covers, ratings and half-filled stars. Authentication, persistence and sharing are not implemented yet.

## Development

Use the Node.js version in `.nvmrc` and the pnpm version in `package.json`.

```sh
fnm install
fnm use
npx --yes pnpm@12.14.0 install
npx --yes pnpm@12.14.0 dev
```

Open http://localhost:3000. Run `pnpm verify` before submitting application changes. If the shell still reports an old Node.js version, run `eval "$(fnm env)"` before `fnm use`. The explicit npx commands avoid older Corepack versions that incorrectly look for `bin/pnpm.cjs` in pnpm 12.

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

## Experimental book search

Book search uses [Google Books](https://developers.google.com/books/docs/v1/using). Set `GOOGLE_BOOKS_API_KEY` in `.env.local` using a Google Cloud project with the Books API enabled, and restart the application. The key is used only on the server. Remove the obsolete `OPEN_LIBRARY_CONTACT_EMAIL` setting.

Searches support titles, authors and ISBNs. Results identify Google Books and include available edition metadata. Searches are not persisted and responses are not cached; saving readings remains outside this slice. Available provider covers appear in search results. Google applies project quotas; check the Books API quota page in Google Cloud Console for current limits and usage.

Search endpoint tests mock external HTTP responses. Browser checks cover success and provider-error feedback; these checks do not establish live provider coverage or quotas.
