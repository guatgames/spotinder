import { motion } from 'framer-motion'
import { RefreshIcon } from './icons'
import { Deck } from './Deck'
import type { SwipeDirection } from './TrackCard'
import type { DeezerTrack } from '../types/deezer'
import { VIBES } from '../data/vibes'

interface DiscoverViewProps {
  queue: DeezerTrack[]
  loading: boolean
  error: string | null
  vibe: string
  onSelectVibe: (vibe: string) => void
  onRefill: () => void
  onSwipe: (direction: SwipeDirection) => void
}

export function DiscoverView({
  queue,
  loading,
  error,
  vibe,
  onSelectVibe,
  onRefill,
  onSwipe,
}: DiscoverViewProps) {
  return (
    <div className="deck-stage">
      <motion.div
        className="flex w-full max-w-[400px] items-end justify-between pt-6 pb-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-frost">Discover</h1>
          <p className="pt-1 text-[13px] leading-snug text-ash">
            Swipe right to like · left to pass · up to love
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

      <div className="flex w-full max-w-[400px] gap-1.5 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIBES.map((item) => {
          const isActive = item === vibe
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelectVibe(item)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-brand bg-brand/15 text-brand'
                  : 'border-white/10 text-ash hover:border-white/25 hover:text-frost'
              }`}
            >
              {item}
            </button>
          )
        })}
      </div>

      {!loading && queue.length > 0 && (
        <div className="w-full max-w-[400px] pb-2 text-center text-[11px] text-mist">
          {queue.length} track{queue.length === 1 ? '' : 's'} left · currently {vibe}
        </div>
      )}

      <Deck
        queue={queue}
        loading={loading}
        error={error}
        vibe={vibe}
        onSwipe={onSwipe}
        onRefill={onRefill}
      />
    </div>
  )
}