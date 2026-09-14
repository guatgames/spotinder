import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MobileNav } from './components/MobileNav'
import { Titlebar } from './components/Titlebar'
import { Sidebar } from './components/Sidebar'
import type { ViewId } from './components/Sidebar'
import { DiscoverView } from './components/DiscoverView'
import { SearchView } from './components/SearchView'
import { LikedView } from './components/LikedView'
import { deezer, DeezerError } from './services/deezer'
import type { DeezerTrack } from './types/deezer'
import { VIBES, pickVibe } from './data/vibes'

const LIKED_KEY = 'spotinder:liked'

function loadLiked(): DeezerTrack[] {
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    const parsed = raw ? (JSON.parse(raw) as DeezerTrack[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function App() {
  const [view, setView] = useState<ViewId>('discover')
  const [vibe, setVibe] = useState(VIBES[0])
  const [queue, setQueue] = useState<DeezerTrack[]>([])
  const [liked, setLiked] = useState<DeezerTrack[]>(loadLiked)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVibe = useCallback(async (target: string) => {
    try {
      const result = await deezer.searchTracks(target, 80)
      setQueue(result.data)
      setError(null)
    } catch (err) {
      setError(err instanceof DeezerError ? err.message : 'Failed to load tracks')
      setQueue([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Async fetch on mount: state updates only occur after the awaited request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVibe(VIBES[0])
  }, [loadVibe])

  useEffect(() => {
    try {
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked))
    } catch {
      // storage unavailable — ignore
    }
  }, [liked])

  const handleSwipe = useCallback(
    (direction: 'nope' | 'like' | 'love') => {
      setQueue((current) => {
        const [top, ...rest] = current
        if (top && (direction === 'like' || direction === 'love')) {
          setLiked((prev) => (prev.some((t) => t.id === top.id) ? prev : [top, ...prev]))
        }
        return rest
      })
    },
    [],
  )

  const addLiked = useCallback((track: DeezerTrack) => {
    setLiked((prev) => (prev.some((t) => t.id === track.id) ? prev : [track, ...prev]))
  }, [])

  const removeLiked = useCallback((track: DeezerTrack) => {
    setLiked((prev) => prev.filter((t) => t.id !== track.id))
  }, [])

  const likedIds = new Set(liked.map((t) => t.id))

  return (
    <div className="app-scene">
      <motion.div
        className="window"
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      >
        <Titlebar />

        <div className="scene-body">
          <Sidebar active={view} likedCount={liked.length} onNavigate={setView} />

          <main className="content">
            {view === 'discover' && (
              <DiscoverView
                queue={queue}
                loading={loading}
                error={error}
                vibe={vibe}
                onSelectVibe={(v) => {
                  setVibe(v)
                  setLoading(true)
                  void loadVibe(v)
                }}
                onRefill={() => {
                  const next = pickVibe()
                  setVibe(next)
                  setLoading(true)
                  void loadVibe(next)
                }}
                onSwipe={handleSwipe}
              />
            )}
            {view === 'liked' && <LikedView tracks={liked} onRemove={removeLiked} />}
            {view === 'search' && (
              <SearchView likedIds={likedIds} onLike={addLiked} onUnlike={removeLiked} />
            )}
          </main>
        </div>

        <MobileNav active={view} likedCount={liked.length} onNavigate={setView} />
      </motion.div>
    </div>
  )
}

export default App