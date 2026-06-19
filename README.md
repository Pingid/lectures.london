# Lectures London

[![Deploy Status](https://api.netlify.com/api/v1/badges/098b9ec2-9b77-4917-989e-244a158b7b93/deploy-status)](https://app.netlify.com/sites/lectures-london/deploys)

[lectures.london](https://lectures.london) is a directory of free public talks and lectures hosted by universities and institutions across London — covering law, art, philosophy, history, economics, science and more.

Listings are scraped daily from each host, compiled into a static site, and published with RSS feeds, calendar (`.ics`) exports, and automated posts to Twitter and Bluesky.

## How it works

A scheduled GitHub Action runs daily to:

1. **Scrape** each source into a single `lectures.json` + `hosts.json`.
2. **Build** the static client from that data.
3. **Deploy** to Netlify and **post** new lectures to social media.

## Project structure

This is a pnpm workspace monorepo.

- `@client` — the [Astro](https://astro.build) + [SolidJS](https://www.solidjs.com) website (search, RSS, calendar exports).
- `@package/shears` — small HTML scraping/query toolkit.
- `@package/scrapers` — one scraper per host, built on `shears`, normalising lectures into a shared schema.
- `@package/scripts` — CLI tools (`collect`, `tweet`, `bluesky`) that drive the data pipeline.

## Getting started

Requires [Node.js](https://nodejs.org) 22+ and [pnpm](https://pnpm.io) 10+.

```bash
pnpm install        # install dependencies
pnpm build:ts       # build the workspace packages
pnpm collect        # scrape lectures -> @client/lectures.json + hosts.json
```

Then run the site locally:

```bash
cd @client
pnpm dev            # start the dev server
```

## Common commands

Run from the repo root:

| Command | Description |
| --- | --- |
| `pnpm build` | Build packages and the client for production. |
| `pnpm collect` | Scrape all sources and write `lectures.json` / `hosts.json`. |
| `pnpm watch:ts` | Rebuild packages on change during development. |
| `pnpm tweet` / `pnpm bluesky` | Post upcoming lectures to social media (needs API credentials). |
| `pnpm format` | Format the codebase with Prettier. |

## Adding a new source

1. Create `@package/scrapers/src/sources/<name>/index.ts` with a scraper that returns lectures in the shared schema.
2. Export it from `@package/scrapers/src/sources/index.ts`.
3. Run `pnpm build:ts && pnpm collect` to verify the output.

## License

MIT
