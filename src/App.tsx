import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from './components/PageHeader'
import { DiscoverView } from './components/DiscoverView'
import { SearchView } from './components/SearchView'
import { LikedView } from './components/LikedView'
import { ArtistsView } from './components/ArtistsView'
import { TOP_ARTISTS } from './data/defaultArtists'
import { fetchDeckTracks } from './services/deck'
import type { DeckSeeds } from './services/deck'
import { deezer, DeezerError } from './services/deezer'
import type { DeezerArtist, DeezerTrack } from './types/deezer'
import type { ViewId } from './components/navigation'
import { CheckIcon } from './components/icons'

const ARTISTS_KEY = 'spotinder:artists'
const LIKED_KEY = 'spotinder:liked'
const SUGGESTIONS_KEY = 'spotinder:artist-suggestions'
const PLAYED_KEY = 'spotinder:played'
const MAX_SUGGESTIONS = 12
const MAX_PLAYED = 500

function loadStored<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as T[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function App() {
  const [view, setView] = useState<ViewId>(() =>
    loadStored<DeezerArtist>(ARTISTS_KEY).length > 0 ? 'discover' : 'artists',
  )
  const [defaults, setDefaults] = useState<DeezerArtist[]>(TOP_ARTISTS)
  const [artists, setArtists] = useState<DeezerArtist[]>(() =>
    loadStored<DeezerArtist>(ARTISTS_KEY),
  )
  const [queue, setQueue] = useState<DeezerTrack[]>([])
  const [liked, setLiked] = useState<DeezerTrack[]>(() =>
    loadStored<DeezerTrack>(LIKED_KEY),
  )
  const [suggestions, setSuggestions] = useState<number[]>(() =>
    loadStored<number>(SUGGESTIONS_KEY),
  )
  const [played, setPlayed] = useState<number[]>(() =>
    loadStored<number>(PLAYED_KEY),
  )
  const [loading, setLoading] = useState<boolean>(() => artists.length > 0)
  const [error, setError] = useState<string | null>(null)

  const generateDeck = useCallback(
    async (artistList: DeezerArtist[], taste: number[], playedIds: number[]) => {
      const seeds: DeckSeeds = {
        artists: artistList,
        suggestions: taste,
        played: playedIds,
      }
      try {
        const tracks = await fetchDeckTracks(seeds)
        setQueue(tracks)
        setError(null)
      } catch (err) {
        setError(err instanceof DeezerError ? err.message : 'Failed to build your deck')
        setQueue([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // First visit: builds the initial deck from saved artists and refreshes the
  // top-10 defaults from the live charts when possible.
  const booted = useRef(false)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    if (artists.length > 0) {
      const seeds: DeckSeeds = { artists, suggestions, played }
      fetchDeckTracks(seeds)
        .then((tracks) => {
          setQueue(tracks)
          setError(null)
        })
        .catch((err) => {
          setError(err instanceof DeezerError ? err.message : 'Failed to build your deck')
          setQueue([])
        })
        .finally(() => setLoading(false))
    }
    void deezer
      .getCharts(10)
      .then((chart) => {
        if (chart.artists?.data.length) {
          setDefaults(chart.artists.data)
          setError(null)
        }
      })
      .catch(() => {
        /* keep offline fallback */
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once, then persist paths handle rest
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(ARTISTS_KEY, JSON.stringify(artists))
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked))
      localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions))
      localStorage.setItem(PLAYED_KEY, JSON.stringify(played))
    } catch {
      // storage unavailable — ignore
    }
  }, [artists, liked, suggestions, played])

  const handleSwipe = useCallback((direction: 'nope' | 'like' | 'love') => {
    setQueue((current) => {
      const [top, ...rest] = current
      if (top) {
        // Whatever the outcome, the top track has been played — never again.
        setPlayed((prev) =>
          prev.includes(top.id) ? prev : [...prev, top.id].slice(-MAX_PLAYED),
        )
      }
      if (top && (direction === 'like' || direction === 'love')) {
        // Liking a track adds its artist to the taste seeds for future decks.
        setSuggestions((prev) =>
          prev.some((id) => id === top.artist.id)
            ? prev
            : [...prev, top.artist.id].slice(-MAX_SUGGESTIONS),
        )
        setLiked((prev) => (prev.some((t) => t.id === top.id) ? prev : [top, ...prev]))
      }
      return rest
    })
  }, [])

  const toggleArtist = useCallback((artist: DeezerArtist) => {
    setArtists((prev) =>
      prev.some((a) => a.id === artist.id)
        ? prev.filter((a) => a.id !== artist.id)
        : [...prev, artist],
    )
  }, [])

  const startSwiping = useCallback(() => {
    if (artists.length === 0) return
    setView('discover')
    setLoading(true)
    void generateDeck(artists, suggestions, played)
  }, [artists, suggestions, played, generateDeck])

  const refill = useCallback(() => {
    if (artists.length === 0) return
    setLoading(true)
    void generateDeck(artists, suggestions, played)
  }, [artists, suggestions, played, generateDeck])

  const addLiked = useCallback((track: DeezerTrack) => {
    setLiked((prev) => (prev.some((t) => t.id === track.id) ? prev : [track, ...prev]))
  }, [])

  const removeLiked = useCallback((track: DeezerTrack) => {
    setLiked((prev) => prev.filter((t) => t.id !== track.id))
  }, [])

  const likedIds = new Set(liked.map((t) => t.id))

  // Taste seeds shared with the search browse shelf: liked artists + artists
  // born from likes on Discover.
  const seedArtistIds = useMemo(
    () => [...new Set([...artists.map((a) => a.id), ...suggestions])],
    [artists, suggestions],
  )

  return (
    <div className="app-scene">
      <PageHeader active={view} onNavigate={setView} />

      <main className="page-main">
        {view === 'discover' && (
          <DiscoverView
            queue={queue}
            loading={loading}
            error={error}
            artistCount={artists.length}
            onRefill={refill}
            onSwipe={handleSwipe}
          />
        )}

        {view === 'artists' && (
          <ArtistsView
            defaults={defaults}
            selected={artists}
            landing={artists.length === 0}
            onToggle={toggleArtist}
          />
        )}

        {view === 'liked' && <LikedView tracks={liked} onRemove={removeLiked} />}

        {view === 'search' && (
          <SearchView
            likedIds={likedIds}
            seedArtists={artists}
            seedArtistIds={seedArtistIds}
            onLike={addLiked}
            onUnlike={removeLiked}
          />
        )}
      </main>

      {view === 'artists' && artists.length > 0 && (
        <motion.div
          className="continue-bar glass"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="flex items-center gap-1.5 text-[11px] text-mist">
            <CheckIcon size={13} className="text-valid" />
            {artists.length} selected
          </span>
          <button
            type="button"
            onClick={startSwiping}
            className="rounded-full bg-gradient-to-r from-brand to-magenta px-5 py-2 text-xs font-semibold text-white transition-transform active:scale-95"
          >
            Start swiping
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default App