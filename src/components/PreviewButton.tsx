import type { PointerEvent } from 'react'
import type { DeezerTrack } from '../types/deezer'
import { usePreview } from '../services/preview'
import { PauseIcon, PlayIcon } from './icons'

interface PreviewButtonProps {
  track: DeezerTrack
  label?: string
  iconSize?: number
  className?: string
  stopDrag?: boolean
}

export function PreviewButton({
  track,
  label,
  iconSize = 14,
  className = '',
  stopDrag = false,
}: PreviewButtonProps) {
  const { playing, toggle } = usePreview(track.id, track.preview)
  const hasPreview = track.preview.length > 0

  return (
    <button
      type="button"
      aria-label={label ?? (playing ? `Pause preview of ${track.title}` : `Play preview of ${track.title}`)}
      disabled={!hasPreview}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.stopPropagation()
      }}
      onClick={(event) => {
        event.stopPropagation()
        toggle()
      }}
      className={[
        !hasPreview && 'pointer-events-none opacity-50',
        stopDrag && 'touch-none',
        className,
      ].join(' ')}
    >
      {playing ? <PauseIcon size={iconSize} /> : <PlayIcon size={iconSize} />}
    </button>
  )
}