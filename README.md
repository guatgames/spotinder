# Spotinder

Swipe your way to a new favorite track. A Tinder-style music recommender with
an Apple Liquid Glass aesthetic on Deezer's dark-mode palette — a normal,
scrollable web page (no window chrome, no fake phone frame) with a floating
glass header and bottom nav. Powered by the
[Deezer API](https://developers.deezer.com/api) through a secure Netlify Edge
Function proxy.

## Stack

- **Vite 8 + React 19 + TypeScript** (React Compiler enabled)
- **Tailwind CSS v4** — design tokens via `@theme` in `src/styles/theme.css`
- **framer-motion** — drag-to-swipe decks, spring stacks, layout pills
- **Netlify Edge Functions** — `netlify/edge-functions/deezer-proxy.ts` (CORS proxy on Deno)

## Design foundations

- `src/styles/theme.css` — Deezer dark surfaces (`--color-abyss`, `--color-void`,
  `--color-raisin`, …) and electric brand palette (`brand #a238ff`, `magenta #ff2d95`).
- `src/styles/glass.css` — Liquid Glass utilities: `glass`, `glass-strong`
  (`backdrop-filter: blur() saturate()`, hairline borders, inset specular highlights).
- `src/styles/components.css` — normal page flow (sticky glass header, tile/pill
  nav, centered Tinder deck stage); responsive bottom tab bar under 768px.

## Flow

- First visit lands on **Artists**: pick from the live Top-10 chart (with an
  offline fallback) or search any artist — your selection seeds the deck.
- **Discover** deals a stacked, swipable queue of each liked artist's top tracks
  (right = like, left = pass, up = love; deciding buttons match).
- **Liked** collects your matches; **Search** can add any catalog track directly.
- Artists + liked tracks persist in `localStorage` (`spotinder:artists`,
  `spotinder:liked`).

## Structure

- `src/components/` — `PageHeader` + `MobileNav` (shared nav), `Deck` /
  `TrackCard` (swipe stack, like · nope · love), `ArtistsView` (liked artists,
  related recommendations, Top-10 chart), `DiscoverView`,
  `SearchView`, `LikedView`, `navigation.ts` (nav meta), `icons`
- `src/services/deezer.ts` — proxy client (`searchTracks`, `getCharts`, `getTrack`,
  `getAlbum`, `getArtist`, `getArtistTopTracks`, `getSuggestions`)
- `src/services/deck.ts` — builds the personalized queue from liked artists
- `src/data/defaultArtists.ts` — offline Top-10 fallback
- `src/types/deezer.ts` — Deezer API models
- `netlify/edge-functions/deezer-proxy.ts` — allowlisted, CORS-enabled Edge proxy

## Getting started

```bash
pnpm install
pnpm dev        # Vite only
```

The app calls Deezer through the Edge proxy, so browse data needs it running
locally:

```bash
pnpm add -D netlify-cli   # once
netlify dev               # serves frontend + Edge Functions on http://localhost:8888
```

## Edge proxy

`netlify/edge-functions/deezer-proxy.ts` forwards whitelisted GET endpoints to
`https://api.deezer.com`, adds CORS + cache headers, and returns the JSON body.

```
GET /deezer-proxy?endpoint=/search/track&q=dua+lipa&limit=10
```

- Endpoint allowlist prevents open-proxy/SSRF abuse (no `.`, `@`, `//`, `%`).
- Set `ALLOWED_ORIGIN` (Netlify env var on Deno) to lock CORS to your site; defaults to `*`.
- Passes upstream status codes through; normalizes non-JSON upstream errors.

Route is wired in `netlify.toml` (`[[edge_functions]]`). Frontend client:
`src/services/deezer.ts`. Override the proxy URL with `VITE_DEEZER_PROXY_BASE`.

## Deploy

```bash
netlify deploy --prod          # or push to a Netlify Git-connected repo
```

`netlify.toml` builds with `pnpm build` (`tsc -b && vite build`) and adds an
SPA redirect.

## Roadmap

1. **Preview playback** — 30s `track.preview` on every card (done: tap ▶ on any track, autoplay in Discover, one preview at a time)
2. **Match moment** — animated "It's a match" after a Love swipe, shareable deck screenshots
3. **Playlist sync + auth** — Deezer OAuth (`DEEZER_APP_ID`), Edge `/auth/token`, create/append a "Spotinder" playlist from Liked
4. **Smarter decks** — related-artist seeding + adaptive taste suggestions (done: Discover mixes liked-artist and related-artist top tracks, liking a track seeds its artist into future decks, and already-played tracks are never dealt again)
5. **Polish** — optimistic caching, strict `ALLOWED_ORIGIN`, Netlify rate limiting, tests