import { useCallback, useEffect, useRef, useState } from 'react'
import type { DeezerTrack } from '../types/deezer'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartFilledIcon,
  HeartIcon,
} from './icons'
import { PreviewButton } from './PreviewButton'

interface TrackRowProps {
  title: string
  hint?: string
  tracks: DeezerTrack[]
  likedIds: Set<number>
  numbered?: boolean
  onLike: (track: DeezerTrack) => void
  onUnlike: (track: DeezerTrack) => void
}

// Horizontally scrollable shelf of cover-card tiles with prev/next arrows,
// used for the browse sections on the Search page (Recommended / Top songs).
export function TrackRow({
  title,
  hint,
  tracks,
  likedIds,
  numbered = false,
  onLike,
  onUnlike,
}: TrackRowProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const updateEdge = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const start = el.scrollLeft <= 2
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
    setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const frame = requestAnimationFrame(updateEdge)
    const ro = new ResizeObserver(updateEdge)
    ro.observe(el)
    window.addEventListener('resize', updateEdge)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('resize', updateEdge)
    }
  }, [updateEdge, tracks.length])

  const scroll = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({
      left: direction * Math.round(Math.max(240, el.clientWidth * 0.7)),
      behavior: 'smooth',
    })
  }, [])

  if (tracks.length === 0) return null

  const showArrows = !edge.start || !edge.end

  return (
    <section>
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-frost">{title}</h2>
          {hint && <p className="truncate pt-0.5 text-[11px] text-mist">{hint}</p>}
        </div>
        {showArrows && (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              aria-label="Scroll shelf left"
              onClick={() => scroll(-1)}
              disabled={edge.start}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-mist transition-colors hover:border-white/25 hover:text-frost disabled:opacity-30"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <button
              type="button"
              aria-label="Scroll shelf right"
              onClick={() => scroll(1)}
              disabled={edge.end}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-mist transition-colors hover:border-white/25 hover:text-frost disabled:opacity-30"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateEdge}
        className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5"
      >
        {tracks.map((track, index) => {
          const liked = likedIds.has(track.id)
          return (
            <div key={track.id} className="w-36 shrink-0 sm:w-40">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-steel">
                {track.album.cover_medium ? (
                  <img
                    src={track.album.cover_medium}
                    alt={track.album.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    draggable={false}
                    onLoad={updateEdge}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/40 to-magenta/40" />
                )}
                <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {numbered && (
                  <span className="absolute left-2 top-2 rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/90 backdrop-blur">
                    #{index + 1}
                  </span>
                )}
                <PreviewButton
                  track={track}
                  iconSize={13}
                  className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-all hover:bg-black/70"
                />
                <button
                  type="button"
                  aria-label={
                    liked
                      ? `Remove ${track.title} from liked`
                      : `Add ${track.title} to liked`
                  }
                  onClick={() => (liked ? onUnlike(track) : onLike(track))}
                  className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur transition-all active:scale-90 ${
                    liked
                      ? 'text-valid'
                      : 'text-white/80 hover:bg-black/70 hover:text-white'
                  }`}
                >
                  {liked ? <HeartFilledIcon size={14} /> : <HeartIcon size={14} />}
                </button>
              </div>
              <p className="pt-2 truncate text-xs font-semibold text-frost">
                {track.title}
              </p>
              <p className="truncate text-[10px] text-ash">{track.artist.name}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}