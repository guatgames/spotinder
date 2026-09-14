import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { DeezerTrack } from '../types/deezer'
import { CardFace, TrackCard } from './TrackCard'
import type { SwipeDirection } from './TrackCard'
import { HeartFilledIcon, LoveIcon, NopeIcon, RefreshIcon } from './icons'

const MAX_VISIBLE = 4

interface DeckProps {
  queue: DeezerTrack[]
  loading: boolean
  error: string | null
  onSwipe: (direction: SwipeDirection) => void
  onRefill: () => void
}

function DecisionButton({
  label,
  children,
  tone,
  big,
  disabled,
  onClick,
}: {
  label: string
  children: ReactNode
  tone: 'danger' | 'valid' | 'brand'
  big?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  const tones: Record<string, string> = {
    danger:
      'text-danger border-danger/25 bg-danger/10 hover:bg-danger/20 hover:border-danger/60',
    valid:
      'text-valid border-valid/25 bg-valid/10 hover:bg-valid/20 hover:border-valid/70',
    brand:
      'text-brand border-brand/30 bg-brand/15 hover:bg-brand/25 hover:border-brand',
  }
  const size = big
    ? 'h-16 w-16 border-transparent bg-gradient-to-br from-brand to-magenta text-white shadow-[0_14px_34px_-12px_rgba(162,56,255,0.85)]'
    : 'h-14 w-14'
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-center rounded-full border backdrop-blur-2xl transition-all duration-200',
        size,
        big ? '' : tones[tone],
        disabled ? 'pointer-events-none opacity-40' : 'hover:-translate-y-0.5 active:scale-90',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function Deck({ queue, loading, error, onSwipe, onRefill }: DeckProps) {
  const [pending, setPending] = useState<SwipeDirection | null>(null)
  const topTrack = queue[0] ?? null
  const prevTopId = useRef(topTrack?.id ?? null)

  useEffect(() => {
    const id = topTrack?.id ?? null
    if (prevTopId.current !== id) {
      setPending(null)
      prevTopId.current = id
    }
  }, [topTrack?.id])

  const visible = queue.slice(0, MAX_VISIBLE)
  const busy = loading || pending !== null

  if (loading && queue.length === 0) {
    return (
      <div className="deck-viewport">
        <div className="deck-card flex items-center justify-center">
          <div className="glass animate-pulse h-full w-full rounded-[26px]">
            <div className="flex h-full flex-col justify-end gap-2 p-5">
              <div className="h-3 w-2/3 rounded-full bg-white/10" />
              <div className="h-6 w-1/2 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && queue.length === 0) {
    return (
      <div className="deck-viewport">
        <div className="deck-card">
          <div className="glass flex h-full flex-col items-center justify-center gap-3 rounded-[26px] p-8 text-center">
            <p className="text-sm font-medium text-frost">Couldn't load your deck</p>
            <p className="max-w-[26ch] text-xs leading-relaxed text-ash">{error}</p>
            <button
              type="button"
              onClick={onRefill}
              className="mt-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-frost transition-colors hover:border-brand hover:text-brand"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="deck-viewport">
        <div className="deck-card">
          <div className="glass flex h-full flex-col items-center justify-center gap-3 rounded-[26px] p-8 text-center">
            <span className="brand-mark" aria-hidden="true" />
            <p className="text-base font-semibold text-frost">That's the whole deck</p>
            <p className="max-w-[28ch] text-xs leading-relaxed text-ash">
              You swiped through your artist picks. Pull a fresh stack of tracks to keep going.
            </p>
            <button
              type="button"
              onClick={onRefill}
              className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-magenta px-5 py-2.5 text-xs font-semibold text-white transition-transform active:scale-95"
            >
              <RefreshIcon size={14} />
              New picks
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="deck-viewport">
        {visible.map((track, index) => (
          <DeckLayer
            key={track.id}
            track={track}
            index={index}
            pending={pending}
            onSwipe={() => {
              if (pending) onSwipe(pending)
            }}
            onDragIntent={(direction) => {
              if (direction && !busy) setPending(direction)
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 pt-1 pb-3">
        <DecisionButton label="Nope" tone="danger" disabled={busy} onClick={() => setPending('nope')}>
          <NopeIcon size={24} />
        </DecisionButton>
        <DecisionButton label="Like" tone="valid" big disabled={busy} onClick={() => setPending('like')}>
          <HeartFilledIcon size={26} />
        </DecisionButton>
        <DecisionButton label="Love" tone="brand" disabled={busy} onClick={() => setPending('love')}>
          <LoveIcon size={24} />
        </DecisionButton>
      </div>
    </>
  )
}

function DeckLayer({
  track,
  index,
  pending,
  onSwipe,
  onDragIntent,
}: {
  track: DeezerTrack
  index: number
  pending: SwipeDirection | null
  onSwipe: () => void
  onDragIntent: (direction: SwipeDirection | null) => void
}) {
  const top = index === 0
  const scale = top ? 1 : Math.max(0.82, 1 - 0.05 * index)
  const y = index * 18
  const opacity = top ? 1 : Math.max(0.15, 1 - 0.32 * index)

  return (
    <motion.div
      className="deck-card"
      initial={false}
      animate={{ scale, y, opacity }}
      transition={{ type: 'spring', stiffness: 340, damping: 32 }}
      style={{
        zIndex: 40 - index,
        pointerEvents: top ? 'auto' : 'none',
        touchAction: top ? 'none' : 'auto',
      }}
    >
      {top ? (
        <TrackCard
          track={track}
          pending={pending}
          onAnimationComplete={onSwipe}
          onDragEnd={onDragIntent}
        />
      ) : (
        <CardFace track={track} />
      )}
    </motion.div>
  )
}