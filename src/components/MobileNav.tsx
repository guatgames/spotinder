import { motion } from 'framer-motion'
import { NAV_ITEMS } from './navigation'
import type { ViewId } from './navigation'

interface MobileNavProps {
  active: ViewId
  onNavigate: (view: ViewId) => void
}

export function MobileNav({ active, onNavigate }: MobileNavProps) {
  return (
    <nav className="mobile-tabbar glass" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
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
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}