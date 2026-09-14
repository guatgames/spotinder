# Spotinder

Swipe your way to a new favorite track. A Tinder-style music recommender with
an Apple Liquid Glass aesthetic on Deezer's dark-mode palette — presented in a
floating, macOS-inspired glass window instead of a fake phone frame. Powered by
the [Deezer API](https://developers.deezer.com/api) through a secure Netlify
serverless proxy.

## Stack

- **Vite 8 + React 19 + TypeScript** (React Compiler enabled)
- **Tailwind CSS v4** — design tokens via `@theme` in `src/styles/theme.css`
- **framer-motion** — drag-to-swipe decks, spring stacks, layout pills
- **Netlify Functions** — `netlify/functions/deezer-proxy.ts` (CORS proxy)

## Design foundations

- `src/styles/theme.css` — Deezer dark surfaces (`--color-abyss`, `--color-void`,
  `--color-raisin`, …) and electric brand palette (`brand #a238ff`, `magenta #ff2d95`).
- `src/styles/glass.css` — Liquid Glass utilities: `glass`, `glass-strong`
  (`backdrop-filter: blur() saturate()`, hairline borders, inset specular highlights).
- `src/styles/components.css` — macOS window shell (traffic dots, glass titlebar,
  grid sidebar + content), responsive: full-bleed under 960px with a floating
  bottom tab bar.

## Structure

- `src/components/` — `Deck` / `TrackCard` (swipe stack, like · nope · love),
  `DiscoverView`, `SearchView`, `LikedView`, `Sidebar`, `Titlebar`, `MobileNav`, `icons`
- `src/services/deezer.ts` — proxy client (`searchTracks`, `getCharts`, `getTrack`,
  `getAlbum`, `getArtist`, `getArtistTopTracks`, `getSuggestions`)
- `src/types/deezer.ts` — Deezer API models
- `src/data/vibes.ts` — discover vibe chips
- `netlify/functions/deezer-proxy.ts` — allowlisted, CORS-enabled proxy

## Getting started

```bash
pnpm install
pnpm dev        # Vite only
```

The app calls Deezer through the serverless proxy, so browse data needs the
function running locally:

```bash
pnpm add -D netlify-cli   # once
netlify dev               # serves frontend + functions on http://localhost:8888
```

No build step is required for the function — Netlify bundles TypeScript
functions automatically (`zip-it-and-ship-it`).

## Serverless proxy

`netlify/functions/deezer-proxy.ts` forwards whitelisted GET endpoints to
`https://api.deezer.com`, adds CORS + cache headers, and returns the JSON body.

```
GET /.netlify/functions/deezer-proxy?endpoint=/search/track&q=dua+lipa&limit=10
```

- Endpoint allowlist prevents open-proxy/SSRF abuse (no `.`, `@`, `//`, `%`).
- Set `ALLOWED_ORIGIN` (Netlify env var) to lock CORS to your site; defaults to `*`.
- Passes upstream status codes through; normalizes non-JSON upstream errors.

Frontend client: `src/services/deezer.ts`. Override the proxy URL with
`VITE_DEEZER_PROXY_BASE`.

## Deploy

```bash
netlify deploy --prod          # or push to a Netlify Git-connected repo
```

`netlify.toml` builds with `pnpm build` (`tsc -b && vite build`) and adds an
SPA redirect.

## Roadmap

1. **Preview playback** — 30s `track.preview` audio on tap, `NowPlaying` sheet
2. **Match moment** — animated "It's a match" after a Love swipe, shareable deck screenshots
3. **Playlist sync + auth** — Deezer OAuth (`DEEZER_APP_ID`), proxy `/auth/token`, create/append a "Spotinder" playlist from Liked
4. **Smarter decks** — charts + suggestions feed by genre/artist seeds, deduped queues
5. **Polish** — optimistic caching, strict `ALLOWED_ORIGIN`, Netlify rate limiting, tests