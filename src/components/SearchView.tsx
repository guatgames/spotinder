import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { deezer, DeezerError } from '../services/deezer'
import type { DeezerTrack } from '../types/deezer'
import { HeartFilledIcon, HeartIcon, SearchIcon } from './icons'
import { PreviewButton } from './PreviewButton'

interface SearchViewProps {
  likedIds: Set<number>
  onLike: (track: DeezerTrack) => void
  onUnlike: (track: DeezerTrack) => void
}

const SUGGESTIONS = ['Charli xcx', 'Röyksopp', 'badbadnotgood', 'Daft Punk', 'Chet Faker', 'Tame Impala']

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SearchView({ likedIds, onLike, onUnlike }: SearchViewProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DeezerTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function runSearch(q: string) {
    const term = q.trim()
    if (!term) return
    setQuery(term)
    setLoading(true)
    setError(null)
    try {
      const res = await deezer.searchTracks(term, 40)
      setResults(res.data)
      setSearched(true)
    } catch (err) {
      setError(err instanceof DeezerError ? err.message : 'Search failed')
      setResults([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void runSearch(query)
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-frost">Search</h1>
        <p className="pt-1 text-sm text-ash">Find any track in the Deezer catalog.</p>

        <form onSubmit={handleSubmit} className="pt-4">
          <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
            <SearchIcon size={16} className="shrink-0 text-mist" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Track, artist, album…"
              className="w-full bg-transparent text-sm text-frost placeholder:text-mist focus:outline-none"
              aria-label="Search Deezer catalog"
              autoComplete="off"
            />
            {loading && (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand border-r-transparent" />
            )}
          </div>
        </form>

        {!searched && !loading && (
          <div className="flex flex-wrap gap-2 pt-3">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void runSearch(suggestion)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ash transition-colors hover:border-brand hover:text-frost"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pb-8">
        {error && <p className="pb-4 text-xs text-blush">{error}</p>}

        {searched && results.length > 0 && (
          <p className="pb-3 text-[11px] text-mist">
            {results.length} results for “{query}”
          </p>
        )}

        {searched && results.length === 0 && !error && (
          <p className="pt-6 text-center text-sm text-mist">
            Nothing matched “{query}”.
          </p>
        )}

        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {results.map((track) => {
              const liked = likedIds.has(track.id)
              return (
                <motion.li
                  key={track.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="glass flex items-center gap-3 rounded-2xl p-2.5">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <img
                        src={track.album.cover_medium}
                        alt={track.album.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-frost">{track.title}</p>
                      <p className="truncate text-xs text-ash">
                        {track.artist.name} · {track.album.title}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-mist">
                      {formatDuration(track.duration)}
                    </span>
                    <PreviewButton
                      track={track}
                      iconSize={12}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-frost transition-all hover:border-valid/60 hover:text-valid active:scale-90"
                    />
                    <button
                      type="button"
                      aria-label={liked ? 'Remove from liked' : 'Add to liked'}
                      onClick={() => (liked ? onUnlike(track) : onLike(track))}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90 ${
                        liked
                          ? 'border-valid/40 bg-valid/15 text-valid'
                          : 'border-white/10 text-mist hover:border-valid/50 hover:text-valid'
                      }`}
                    >
                      {liked ? <HeartFilledIcon size={15} /> : <HeartIcon size={15} />}
                    </button>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}