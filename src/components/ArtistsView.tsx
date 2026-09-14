import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { deezer, DeezerError } from '../services/deezer'
import { getArtistRecommendations } from '../services/deck'
import type { DeezerArtist } from '../types/deezer'
import { CheckIcon, SearchIcon } from './icons'

interface ArtistsViewProps {
  defaults: DeezerArtist[]
  selected: DeezerArtist[]
  landing?: boolean
  onToggle: (artist: DeezerArtist) => void
}

function ArtistAvatar({ artist }: { artist: DeezerArtist }) {
  return artist.picture_medium ? (
    <img
      src={artist.picture_medium}
      alt={artist.name}
      className="h-full w-full object-cover"
      loading="lazy"
      draggable={false}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/60 to-magenta/50 text-3xl font-bold text-white">
      {artist.name.charAt(0)}
    </div>
  )
}

interface ArtistTileProps {
  artist: DeezerArtist
  selected: boolean
  onToggle: (artist: DeezerArtist) => void
}

function ArtistTile({ artist, selected, onToggle }: ArtistTileProps) {
  return (
    <motion.button
      type="button"
      layout
      onClick={() => onToggle(artist)}
      className="group flex flex-col items-center gap-2"
      whileTap={{ scale: 0.95 }}
      aria-pressed={selected}
      aria-label={`${selected ? 'Remove' : 'Add'} ${artist.name}`}
    >
      <span
        className={`relative block aspect-square w-full overflow-hidden rounded-2xl ring-2 transition-all ${
          selected
            ? 'ring-brand shadow-[0_12px_30px_-8px_rgba(162,56,255,0.6)]'
            : 'ring-white/10 group-hover:ring-white/25'
        }`}
      >
        <ArtistAvatar artist={artist} />
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <AnimatePresence>
          {selected && (
            <motion.span
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand to-magenta text-white shadow-lg"
            >
              <CheckIcon size={13} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span
        className={`max-w-full truncate text-center text-xs font-medium ${
          selected ? 'text-frost' : 'text-ash group-hover:text-frost'
        }`}
      >
        {artist.name}
      </span>
    </motion.button>
  )
}

function SectionHeading({
  title,
  hint,
  trailing,
}: {
  title: string
  hint?: string
  trailing?: string
}) {
  return (
    <div className="flex items-center justify-between pb-3">
      <div>
        <h2 className="text-sm font-semibold text-frost">{title}</h2>
        {hint && <p className="pt-0.5 text-[11px] text-mist">{hint}</p>}
      </div>
      {trailing && <span className="shrink-0 text-[11px] text-mist">{trailing}</span>}
    </div>
  )
}

function ArtistGrid({
  artists,
  selected,
  onToggle,
}: {
  artists: DeezerArtist[]
  selected: DeezerArtist[]
  onToggle: (artist: DeezerArtist) => void
}) {
  if (artists.length === 0) return null
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5">
      {artists.map((artist) => (
        <ArtistTile
          key={artist.id}
          artist={artist}
          selected={selected.some((a) => a.id === artist.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

export function ArtistsView({
  defaults,
  selected,
  landing = false,
  onToggle,
}: ArtistsViewProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DeezerArtist[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<DeezerArtist[]>([])
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    }
  }, [])

  // Recommendations are derived from the liked artists, so refresh as the set
  // changes.
  useEffect(() => {
    const ids = selected.map((artist) => artist.id)
    if (ids.length === 0) return
    let cancelled = false
    getArtistRecommendations(ids)
      .then((artists) => {
        if (!cancelled) setRecommendations(artists)
      })
      .catch(() => {
        if (!cancelled) setRecommendations([])
      })
    return () => {
      cancelled = true
    }
  }, [selected])

  // Inline-as-you-type search: fires after every second letter (debounced),
  // and Enter triggers it immediately via the form submit.
  function scheduleSearch(term: string) {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    const value = term.trim()
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null
      if (value.length < 2) {
        setResults([])
        setError(null)
        setSearching(false)
        return
      }
      void runSearch(term)
    }, 250)
  }

  async function runSearch(q: string) {
    const term = q.trim()
    if (!term) return
    setSearching(true)
    setError(null)
    try {
      const res = await deezer.searchArtists(term, 12)
      setResults(res.data)
    } catch (err) {
      setError(err instanceof DeezerError ? err.message : 'Search failed')
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current)
    void runSearch(query)
  }

  const showRecs = selected.length > 0
  const recsLoading = showRecs && recommendations.length === 0

  return (
    <div className="mx-auto w-full max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="max-w-[18ch] text-3xl font-bold tracking-tight text-frost sm:text-4xl">
          {landing ? 'What do you like?' : 'Your artists'}
        </h1>
        <p className="max-w-[46ch] pt-2 text-sm leading-relaxed text-ash">
          {landing
            ? 'Pick from the chart, our recommendations, or search — every artist you like seeds your Discover deck.'
            : 'Your set, personalized picks that learn from it, and today’s chart. Uncheck any artist to drop them.'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="pt-6">
        <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
          <SearchIcon size={16} className="shrink-0 text-mist" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              const value = event.target.value
              setQuery(value)
              scheduleSearch(value)
            }}
            placeholder="Search artists to like…"
            className="w-full bg-transparent text-sm text-frost placeholder:text-mist focus:outline-none"
            aria-label="Search artists"
            autoComplete="off"
          />
          {searching && (
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand border-r-transparent" />
          )}
        </div>
      </form>

      {error && <p className="pt-3 text-xs text-blush">{error}</p>}

      {results.length > 0 && (
        <section className="pt-6">
          <SectionHeading
            title={`Results for “${query}”`}
            trailing={`${results.length} found`}
          />
          <ArtistGrid artists={results} selected={selected} onToggle={onToggle} />
        </section>
      )}

      <section className="pt-8">
        <SectionHeading
          title="Your artists"
          hint={
            selected.length
              ? 'Tap an artist to remove them.'
              : 'Nothing picked yet — tap any artist below to start.'
          }
          trailing={selected.length ? `${selected.length} selected` : undefined}
        />
        <ArtistGrid artists={selected} selected={selected} onToggle={onToggle} />
      </section>

      {showRecs && (
        <section className="pt-8">
          <SectionHeading
            title="Recommendations"
            hint="Related artists worth adding to your set."
          />
          {recsLoading ? (
            <p className="text-xs text-mist">Crunching related artists…</p>
          ) : (
            <ArtistGrid
              artists={recommendations}
              selected={selected}
              onToggle={onToggle}
            />
          )}
        </section>
      )}

      <section className="pt-8">
        <SectionHeading title="Top 10 right now" hint="Today’s global chart." />
        <ArtistGrid artists={defaults} selected={selected} onToggle={onToggle} />
      </section>
    </div>
  )
}