import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { deezer, DeezerError } from '../services/deezer'
import { getRecommendedTracks } from '../services/deck'
import type { DeezerArtist, DeezerGenre, DeezerTrack } from '../types/deezer'
import { HeartFilledIcon, HeartIcon, NopeIcon, SearchIcon } from './icons'
import { PreviewButton } from './PreviewButton'
import { TrackRow } from './TrackRow'

interface SearchViewProps {
  likedIds: Set<number>
  seedArtists: DeezerArtist[]
  seedArtistIds: number[]
  onLike: (track: DeezerTrack) => void
  onUnlike: (track: DeezerTrack) => void
}

const SUGGESTIONS = ['Charli xcx', 'Röyksopp', 'badbadnotgood', 'Daft Punk', 'Chet Faker', 'Tame Impala']
const LIVE_MIN_CHARS = 2

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Human-readable scope label, e.g. `“dua” in genre “Pop”` or `by artist “Dua Lipa”`.
function buildScopeLabel(text: string, artist: string, genre: string): string {
  const scope = artist ? `by artist “${artist}”` : genre ? `in genre “${genre}”` : ''
  return [text ? `“${text}”` : '', scope].filter(Boolean).join(' ')
}

function SkeletonRow() {
  return (
    <div>
      <div className="h-4 w-44 rounded bg-white/5" />
      <div className="flex gap-3 pt-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="w-36 shrink-0 sm:w-40">
            <div className="aspect-square animate-pulse rounded-2xl bg-white/5" />
            <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="mt-1 h-2 w-1/2 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SearchView({
  likedIds,
  seedArtists,
  seedArtistIds,
  onLike,
  onUnlike,
}: SearchViewProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DeezerTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const [artistFilter, setArtistFilter] = useState('')
  const [genreFilter, setGenreFilter] = useState('')
  const [genres, setGenres] = useState<DeezerGenre[]>([])

  const [topTracks, setTopTracks] = useState<DeezerTrack[]>([])
  const [recommended, setRecommended] = useState<DeezerTrack[]>([])
  const [chartFailed, setChartFailed] = useState(false)
  const [recsFailed, setRecsFailed] = useState(false)

  const debounceRef = useRef<number | null>(null)

  // Genre list for the filter dropdown; fetched once.
  useEffect(() => {
    let cancelled = false
    deezer
      .getGenres()
      .then((res) => {
        if (!cancelled) setGenres(res.data.filter((g) => g.id !== 0 && g.name))
      })
      .catch(() => {
        /* filters stay hidden if genres can't load */
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Global chart shelved while idle; loaded once.
  useEffect(() => {
    let cancelled = false
    deezer
      .getChartTracks(15)
      .then((chart) => {
        if (!cancelled) setTopTracks(chart.data)
      })
      .catch(() => {
        if (!cancelled) setChartFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Taste-based shelf: rebuilds whenever the artist set changes so it keeps up
  // with likes on Discover and the Artists page.
  useEffect(() => {
    if (seedArtistIds.length === 0) return
    let cancelled = false
    getRecommendedTracks(seedArtistIds, 18)
      .then((tracks) => {
        if (cancelled) return
        if (tracks.length === 0) {
          setRecsFailed(true)
        } else {
          setRecommended(tracks)
          setRecsFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) setRecsFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [seedArtistIds])

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    }
  }, [])

  // Live search: fires once the query (or an active filter) is meaningful.
  useEffect(() => {
    let cancelled = false
    const scope = [
      artistFilter ? `artist:"${artistFilter}"` : '',
      genreFilter ? `genre:"${genreFilter}"` : '',
    ]
      .filter(Boolean)
      .join(' ')
    const term = [query.trim(), scope].filter(Boolean).join(' ').trim()

    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)

    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      if (cancelled) return
      if ((!scope && query.trim().length < LIVE_MIN_CHARS) || (!scope && !term)) {
        setResults([])
        setError(null)
        setSearched(false)
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      deezer
        .searchTracks(term, 40)
        .then((res) => {
          if (cancelled) return
          setResults(res.data)
          setSearched(true)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err instanceof DeezerError ? err.message : 'Search failed')
          setResults([])
          setSearched(true)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 250)

    return () => {
      cancelled = true
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
    }
  }, [query, artistFilter, genreFilter])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    const scope = [
      artistFilter ? `artist:"${artistFilter}"` : '',
      genreFilter ? `genre:"${genreFilter}"` : '',
    ]
      .filter(Boolean)
      .join(' ')
    const term = [query.trim(), scope].filter(Boolean).join(' ').trim()
    if (term.length >= LIVE_MIN_CHARS || scope) {
      setLoading(true)
      setError(null)
      deezer
        .searchTracks(term, 40)
        .then((res) => {
          setResults(res.data)
          setSearched(true)
        })
        .catch((err) => {
          setError(err instanceof DeezerError ? err.message : 'Search failed')
          setResults([])
          setSearched(true)
        })
        .finally(() => setLoading(false))
    }
  }

  function clearSearch() {
    setQuery('')
  }

  const scopeLabel = buildScopeLabel(query.trim(), artistFilter, genreFilter)
  const recsLoading = seedArtistIds.length > 0 && !recsFailed && recommended.length === 0
  const chartLoading = topTracks.length === 0 && !chartFailed

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-frost">Search</h1>
        <p className="pt-1 text-sm text-ash">
          Browse what’s hot or made for you, pick a genre or artist, or find any track.
        </p>

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
            {query.length > 0 && !loading && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-mist transition-colors hover:bg-white/10 hover:text-frost"
              >
                <NopeIcon size={12} />
              </button>
            )}
            {loading && (
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand border-r-transparent" />
            )}
          </div>
        </form>

        {/* Adaptive filters: user's artists + Deezer genres, one at a time */}
        <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:gap-3">
          {seedArtists.length > 0 && (
            <label className="glass flex items-center gap-2 rounded-full pl-3 pr-1 py-1">
              <span className="shrink-0 text-[11px] text-mist">Artist</span>
              <select
                value={artistFilter}
                onChange={(event) => {
                  const value = event.target.value
                  setArtistFilter(value)
                  if (value) setGenreFilter('')
                }}
                aria-label="Filter by artist"
                className="max-w-[11rem] cursor-pointer rounded-full bg-raisin py-1 pl-2 pr-5 text-xs text-frost focus:outline-none"
              >
                <option value="">All artists</option>
                {seedArtists.map((artist) => (
                  <option key={artist.id} value={artist.name}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {genres.length > 0 && (
            <label className="glass flex items-center gap-2 rounded-full pl-3 pr-1 py-1">
              <span className="shrink-0 text-[11px] text-mist">Genre</span>
              <select
                value={genreFilter}
                onChange={(event) => {
                  const value = event.target.value
                  setGenreFilter(value)
                  if (value) setArtistFilter('')
                }}
                aria-label="Filter by genre"
                className="max-w-[11rem] cursor-pointer rounded-full bg-raisin py-1 pl-2 pr-5 text-xs text-frost focus:outline-none"
              >
                <option value="">All genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.name}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <p className="text-[11px] text-mist">
            {artistFilter || genreFilter
              ? `${artistFilter ? `Showing ${artistFilter} tracks` : `Showing ${genreFilter} tracks`} — pick one filter at a time.`
              : 'Pick a filter to browse, or start typing for live results.'}
          </p>
        </div>

        {!searched && !loading && (
          <div className="flex flex-wrap gap-2 pt-3">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ash transition-colors hover:border-brand hover:text-frost"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {!searched && (
        <div className="pb-8">
          {(chartFailed || recsFailed) && (
            <p className="pb-3 text-xs text-blush">
              Couldn’t load the charts — your search still works.
            </p>
          )}

          {seedArtistIds.length > 0 && (
            <div className="pb-9">
              {recsLoading ? (
                <SkeletonRow />
              ) : (
                <TrackRow
                  title="Recommended for you"
                  hint="Top tracks from your set and artists it learns from."
                  tracks={recommended}
                  likedIds={likedIds}
                  onLike={onLike}
                  onUnlike={onUnlike}
                />
              )}
            </div>
          )}

          {chartLoading ? (
            <SkeletonRow />
          ) : (
            <TrackRow
              title="Top songs right now"
              hint="Today’s global chart."
              tracks={topTracks}
              likedIds={likedIds}
              numbered
              onLike={onLike}
              onUnlike={onUnlike}
            />
          )}
        </div>
      )}

      {searched && (
        <div className="pb-8">
          {error && <p className="pb-4 text-xs text-blush">{error}</p>}

          {results.length > 0 && !loading && (
            <p className="pb-3 text-[11px] text-mist">
              {results.length} result{results.length === 1 ? '' : 's'}
              {scopeLabel ? ` ${scopeLabel}` : ''}
            </p>
          )}

          {results.length === 0 && !error && (
            <p className="pt-6 text-center text-sm text-mist">
              Nothing matched{scopeLabel ? ` ${scopeLabel}` : ''}.
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
      )}
    </div>
  )
}