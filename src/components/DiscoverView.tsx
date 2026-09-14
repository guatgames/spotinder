import { motion } from 'framer-motion'
import { RefreshIcon } from './icons'
import { Deck } from './Deck'
import type { SwipeDirection } from './TrackCard'
import type { DeezerTrack } from '../types/deezer'

interface DiscoverViewProps {
  queue: DeezerTrack[]
  loading: boolean
  error: string | null
  artistCount: number
  onRefill: () => void
  onSwipe: (direction: SwipeDirection) => void
}

export function DiscoverView({
  queue,
  loading,
  error,
  artistCount,
  onRefill,
  onSwipe,
}: DiscoverViewProps) {
  return (
    <div className="deck-stage">
      <motion.div
        className="flex w-full items-end justify-between pb-4"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-frost">For you</h1>
          <p className="pt-1 text-[13px] leading-snug text-ash">
            Built from your {artistCount} artist{artistCount === 1 ? '' : 's'} · swipe
            right to like, left to pass, up to love
          </p>
        </div>
        <button
          type="button"
          onClick={onRefill}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-ash transition-colors hover:border-brand hover:text-frost disabled:opacity-50"
          aria-label="Load a fresh deck"
        >
          <RefreshIcon size={13} />
          Refill
        </button>
      </motion.div>

      {!loading && queue.length > 0 && (
        <div className="w-full pb-3 text-center text-[11px] text-mist">
          {queue.length} track{queue.length === 1 ? '' : 's'} left
        </div>
      )}

      <Deck
        queue={queue}
        loading={loading}
        error={error}
        onSwipe={onSwipe}
        onRefill={onRefill}
      />
    </div>
  )
}