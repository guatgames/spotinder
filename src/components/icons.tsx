interface IconProps {
  size?: number
  className?: string
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

export function WaveMark({ size = 30, className = '' }: IconProps) {
  return (
    <span
      className={`brand-mark grid place-items-center ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.3 }}
      aria-hidden="true"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="currentColor" className="text-frost">
        <path d="M3 10h3v4H3zM7.5 6h3v12h-3zM12 2.5h3v19h-3zM16.5 7.5h3v9h-3zM21 11h3v2h-3z" transform="translate(-2)" />
      </svg>
    </span>
  )
}

export function CompassIcon({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  )
}

export function HeartIcon({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M12 20.5 5.1 13.6a4.5 4.5 0 1 1 6.4-6.4l.5.5.5-.5a4.5 4.5 0 1 1 6.4 6.4L12 20.5Z" />
    </svg>
  )
}

export function HeartFilledIcon({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 20.5 5.1 13.6a4.5 4.5 0 1 1 6.4-6.4l.5.5.5-.5a4.5 4.5 0 1 1 6.4 6.4L12 20.5Z" />
    </svg>
  )
}

export function SearchIcon({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  )
}

export function NopeIcon({ size = 22, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function LoveIcon({ size = 22, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M12 3.5 13.6 9a4 4 0 0 0 2.9 2.9l5.5 1.6-5.5 1.6a4 4 0 0 0-2.9 2.9L12 23.5l-1.6-6.5A4 4 0 0 0 7.5 14L2 12.4 7.5 10.8A4 4 0 0 0 10.4 8L12 3.5Z" />
    </svg>
  )
}

export function RefreshIcon({ size = 16, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 3v4h-4" />
    </svg>
  )
}

export function PlayIcon({ size = 12, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 4.5v15l.6.3L20 12l-13.4-7.8-.6.3Z" />
    </svg>
  )
}

export function MusicIcon({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M9 18V6l12-2v11" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="15" r="3" />
    </svg>
  )
}