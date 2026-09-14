import { motion } from 'framer-motion'
import { CompassIcon, HeartIcon, SearchIcon, WaveMark } from './icons'

export type ViewId = 'discover' | 'liked' | 'search'

interface SidebarProps {
  active: ViewId
  likedCount: number
  onNavigate: (view: ViewId) => void
}

const SECTIONS: { id: ViewId; label: string; icon: typeof CompassIcon }[] = [
  { id: 'discover', label: 'Discover', icon: CompassIcon },
  { id: 'liked', label: 'Liked', icon: HeartIcon },
  { id: 'search', label: 'Search', icon: SearchIcon },
]

export function Sidebar({ active, likedCount, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="flex items-center gap-2.5 px-2 pb-4 pt-1">
        <WaveMark size={30} />
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-frost">Spotinder</p>
          <p className="text-[11px] text-mist">Swipe · Listen · Coincide</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {SECTIONS.map((section) => {
          const isActive = section.id === active
          const Icon = section.icon
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onNavigate(section.id)}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ash transition-colors hover:text-frost"
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-inset ring-white/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <Icon size={17} className={`relative ${isActive ? 'text-brand' : 'text-mist group-hover:text-frost'}`} />
              <span className="relative flex-1">{section.label}</span>
              {section.id === 'liked' && likedCount > 0 && (
                <span className="relative rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand">
                  {likedCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <div className="rounded-2xl bg-gradient-to-br from-brand/25 to-magenta/20 p-4 ring-1 ring-inset ring-white/10">
          <p className="text-xs font-semibold text-frost">Find your frequency</p>
          <p className="pt-1 text-[11px] leading-relaxed text-ash">
            Track previews and playlists are powered by the Deezer catalog.
          </p>
          <div className="flex h-6 items-end gap-1 pt-3" aria-hidden="true">
            {[40, 62, 48, 82, 54, 96, 70, 100, 58].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-brand to-magenta"
                style={{ height: `${h * 0.34}px`, opacity: 0.35 + (i / 9) * 0.65 }}
              />
            ))}
          </div>
        </div>
        <p className="px-2 text-[10px] text-mist">
          API · Deezer · build 0.1.0
        </p>
      </div>
    </aside>
  )
}