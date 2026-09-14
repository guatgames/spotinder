import { deezer } from './deezer'
import type { DeezerArtist, DeezerTrack } from '../types/deezer'

const TARGET_TRACKS = 60
const MAX_SUGGESTIONS = 8
const MAX_RELATED = 10

export interface DeckSeeds {
  artists: DeezerArtist[]
  // Artist ids collected from likes on Discover — adaptive taste seeds.
  suggestions: number[]
  // Track ids already played in Discover — never dealt again.
  played: number[]
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function uniqueById<T extends { id: number }>(items: T[]): T[] {
  const seen = new Set<number>()
  const result: T[] = []
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      result.push(item)
    }
  }
  return result
}

// Recommendation pipeline:
//   1. Seeds = explicitly liked artists + artists born from liking tracks.
//      Pull a few top tracks from each (primary pool).
//   2. For each liked artist, fetch the related-artists list; drop anyone who
//      is already a known seed; pull tracks from the remaining (secondary pool).
//   3. Queue = shuffled primary pool, then shuffled secondary pool.
// Individual requests failing are tolerated — usable tracks win out.
export async function fetchDeckTracks(
  seeds: DeckSeeds,
  target = TARGET_TRACKS,
): Promise<DeezerTrack[]> {
  const { artists, suggestions, played } = seeds
  const artistIds = uniqueById(artists).map((a) => a.id)
  const suggestionIds = [...new Set(suggestions)].slice(-MAX_SUGGESTIONS)
  const seedIds = [...new Set([...artistIds, ...suggestionIds])]
  if (seedIds.length === 0) return []

  const knownIds = new Set(seedIds)
  const playedIds = new Set(played)

  const collect = (batches: Array<{ data?: DeezerTrack[] } | null>) => {
    const seen = new Set<number>()
    const out: DeezerTrack[] = []
    for (const batch of batches) {
      for (const track of batch?.data ?? []) {
        if (track.id && !seen.has(track.id) && !playedIds.has(track.id)) {
          seen.add(track.id)
          out.push(track)
        }
      }
    }
    return out
  }

  // Primary pool: top tracks from the liked + suggested seeds.
  const primaryPer = Math.max(3, Math.floor((target * 0.5) / Math.max(seedIds.length, 1)))
  const primary = collect(
    await Promise.all(
      seedIds.map((id) => deezer.getArtistTopTracks(id, primaryPer).catch(() => null)),
    ),
  )

  // Related pool: neighbors of the explicitly liked artists, minus known seeds.
  const related = uniqueById(
    (
      await Promise.all(
        artistIds
          .slice(0, 6)
          .map((id) => deezer.getArtistRelated(id, MAX_RELATED + 8).catch(() => null)),
      )
    ).flatMap((batch) => batch?.data ?? []),
  )
    .filter((artist) => !knownIds.has(artist.id))
    .slice(0, MAX_RELATED)

  const relatedPer = Math.max(1, Math.floor((target * 0.5) / Math.max(related.length, 1)))
  const secondary = collect(
    await Promise.all(
      related.map((artist) =>
        deezer.getArtistTopTracks(artist.id, relatedPer).catch(() => null),
      ),
    ),
  )

  return [...shuffle(primary), ...shuffle(secondary)]
}

// Related-artist suggestions for the Artists section: neighbors of the liked
// artists, minus anyone already liked.
export async function getArtistRecommendations(
  artistIds: number[],
  limit = 10,
): Promise<DeezerArtist[]> {
  const likedIds = new Set(artistIds)
  const batches = await Promise.all(
    artistIds
      .slice(0, 4)
      .map((id) => deezer.getArtistRelated(id, 12).catch(() => null)),
  )
  return uniqueById(batches.flatMap((batch) => batch?.data ?? []))
    .filter((artist) => !likedIds.has(artist.id))
    .slice(0, limit)
}