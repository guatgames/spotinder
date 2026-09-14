import { deezer } from './deezer'
import type { DeezerArtist, DeezerTrack } from '../types/deezer'

const TARGET_TRACKS = 60

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Builds a personalized queue from the liked artists' top tracks.
// Individual artist requests failing are tolerated — usable tracks win out.
export async function fetchDeckTracks(
  artists: DeezerArtist[],
  target = TARGET_TRACKS,
): Promise<DeezerTrack[]> {
  if (artists.length === 0) return []

  const perArtist = Math.max(3, Math.floor(target / artists.length))
  const attempts = await Promise.all(
    artists.map((artist) =>
      deezer.getArtistTopTracks(artist.id, perArtist).catch(() => null),
    ),
  )

  const seen = new Set<number>()
  const merged: DeezerTrack[] = []
  for (const batch of attempts) {
    for (const track of batch?.data ?? []) {
      if (track.id && !seen.has(track.id)) {
        seen.add(track.id)
        merged.push(track)
      }
    }
  }

  return shuffle(merged)
}