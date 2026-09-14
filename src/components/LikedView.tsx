import { AnimatePresence, motion } from 'framer-motion'
import type { DeezerTrack } from '../types/deezer'
import { HeartFilledIcon, NopeIcon } from './icons'
import { PreviewButton } from './PreviewButton'

interface LikedViewProps {
  tracks: DeezerTrack[]
  onRemove: (track: DeezerTrack) => void
}

export function LikedView({ tracks, onRemove }: LikedViewProps) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-frost">Liked</h1>
        <p className="pt-1 text-sm text-ash">
          {tracks.length === 0
            ? 'Your swiped matches will collect here.'
            : `${tracks.length} track${tracks.length === 1 ? '' : 's'} you love.`}
        </p>
      </div>

      <div className="pb-8">
        {tracks.length === 0 ? (
          <div className="glass mx-auto mt-10 flex max-w-xs flex-col items-center gap-3 rounded-3xl p-8 text-center">
            <span className="text-2xl text-mist">♡</span>
            <p className="text-sm font-medium text-frost">No matches yet</p>
            <p className="text-xs leading-relaxed text-ash">
              Swipe right or tap the heart in Discover — anything you love shows up here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence initial={false}>
              {tracks.map((track) => (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="glass group relative overflow-hidden rounded-2xl">
                    <div className="relative aspect-square">
                      <img
                        src={track.album.cover_medium}
                        alt={`${track.album.title} cover`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <PreviewButton
                        track={track}
                        iconSize={14}
                        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-all hover:bg-black/70"
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${track.title}`}
                        onClick={() => onRemove(track)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity hover:bg-danger/80 group-hover:opacity-100"
                      >
                        <NopeIcon size={14} />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <p className="truncate text-xs font-semibold text-white">{track.title}</p>
                        <p className="truncate text-[10px] text-white/70">{track.artist.name}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {tracks.length > 0 && (
          <p className="flex items-center gap-1.5 pt-6 text-[11px] text-mist">
            <HeartFilledIcon size={12} className="text-valid" />
            Kept in this browser — cleared decks don't touch your likes.
          </p>
        )}
      </div>
    </div>
  )
}