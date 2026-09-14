import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { DeezerTrack } from '../types/deezer'

export type SwipeDirection = 'nope' | 'like' | 'love'

const EXIT_TARGET: Record<SwipeDirection, { x: number; y: number; rotate: number }> = {
  nope: { x: -460, y: 64, rotate: -16 },
  like: { x: 460, y: 64, rotate: 16 },
  love: { x: 0, y: -560, rotate: 0 },
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function CardFace({ track }: { track: DeezerTrack }) {
  const cover =
    track.album.cover_xl ?? track.album.cover_big ?? track.album.cover_medium

  return (
    <div className="relative h-full overflow-hidden rounded-[26px] ring-1 ring-white/10 ring-inset bg-graphite">
      {cover ? (
        <img
          src={cover}
          alt={`${track.album.title} cover`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand/70 to-magenta/60" />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/85" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-2">
          {track.explicit_lyrics && (
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white">
              E
            </span>
          )}
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
            {track.album.title}
          </p>
        </div>
        <h2 className="mt-1.5 truncate text-[26px] font-bold leading-tight tracking-tight text-white">
          {track.title}
        </h2>
        <p className="mt-0.5 truncate text-[15px] font-medium text-white/85">
          {track.artist.name}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
          {track.duration > 0 && (
            <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 backdrop-blur-sm">
              {formatDuration(track.duration)}
            </span>
          )}
          {typeof track.bpm === 'number' && (
            <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 backdrop-blur-sm">
              {track.bpm} BPM
            </span>
          )}
          {typeof track.rank === 'number' && track.rank > 0 && (
            <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 backdrop-blur-sm">
              #{track.rank.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface TrackCardProps {
  track: DeezerTrack
  pending: SwipeDirection | null
  onAnimationComplete: () => void
  onDragEnd: (direction: SwipeDirection | null) => void
}

export function TrackCard({ track, pending, onAnimationComplete, onDragEnd }: TrackCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-16, 16])

  const likeOpacity = useTransform(x, [30, 150], [0, 1])
  const nopeOpacity = useTransform(x, [-30, -150], [0, 1])
  const loveOpacity = useTransform(y, [-180, -60], [1, 0])

  const exiting = pending !== null

  return (
    <motion.div
      className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
      style={{ x, y, rotate }}
      drag={!exiting}
      dragElastic={0.9}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (exiting) return
        const { offset } = info
        if (offset.y < -120 && Math.abs(offset.y) > Math.abs(offset.x)) {
          onDragEnd('love')
          return
        }
        if (offset.x > 110) {
          onDragEnd('like')
          return
        }
        if (offset.x < -110) {
          onDragEnd('nope')
          return
        }
        onDragEnd(null)
      }}
      animate={
        exiting
          ? { ...EXIT_TARGET[pending], opacity: 0 }
          : { x: 0, y: 0 }
      }
      transition={
        exiting
          ? { duration: 0.34, ease: 'easeIn' }
          : { type: 'spring', stiffness: 520, damping: 42 }
      }
      onAnimationComplete={() => {
        if (exiting) onAnimationComplete()
      }}
    >
      <CardFace track={track} />

      <motion.div className="pointer-events-none absolute left-5 top-7" style={{ opacity: likeOpacity }}>
        <span className="-rotate-[14deg] border-4 border-valid px-3 py-1 text-3xl font-extrabold tracking-[0.14em] text-valid shadow-[0_6px_20px_rgba(0,0,0,0.45)]">
          LIKE
        </span>
      </motion.div>
      <motion.div className="pointer-events-none absolute right-5 top-7" style={{ opacity: nopeOpacity }}>
        <span className="rotate-[14deg] border-4 border-danger px-3 py-1 text-3xl font-extrabold tracking-[0.14em] text-danger shadow-[0_6px_20px_rgba(0,0,0,0.45)]">
          NOPE
        </span>
      </motion.div>
      <motion.div className="pointer-events-none absolute inset-x-0 top-8 grid place-items-center" style={{ opacity: loveOpacity }}>
        <span className="border-4 border-brand px-3 py-1 text-3xl font-extrabold tracking-[0.14em] text-brand shadow-[0_6px_20px_rgba(0,0,0,0.45)]">
          LOVE
        </span>
      </motion.div>
    </motion.div>
  )
}