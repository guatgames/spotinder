import { motion } from 'framer-motion'
import type { ViewId } from './Sidebar'
import { CompassIcon, HeartIcon, SearchIcon } from './icons'

interface MobileNavProps {
  active: ViewId
  likedCount: number
  onNavigate: (view: ViewId) => void
}

const TABS: { id: ViewId; label: string; icon: typeof CompassIcon }[] = [
  { id: 'discover', label: 'Discover', icon: CompassIcon },
  { id: 'liked', label: 'Liked', icon: HeartIcon },
  { id: 'search', label: 'Search', icon: SearchIcon },
]

export function MobileNav({ active, likedCount, onNavigate }: MobileNavProps) {
  return (
    <nav className="mobile-tabbar glass" aria-label="Primary">
      {TABS.map((tab) => {
        const isActive = tab.id === active
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-mist"
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-2xl bg-white/[0.07] ring-1 ring-inset ring-white/10"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <Icon size={20} className={`relative ${isActive ? 'text-brand' : ''}`} />
            <span className={`relative text-[10px] font-medium ${isActive ? 'text-frost' : ''}`}>
              {tab.label}
              {tab.id === 'liked' && likedCount > 0 ? ` · ${likedCount}` : ''}
            </span>
          </button>
        )
      })}
    </nav>
  )
}