import { motion } from 'framer-motion'
import { NAV_ITEMS } from './navigation'
import type { ViewId } from './navigation'

interface PageHeaderProps {
  active: ViewId
  onNavigate: (view: ViewId) => void
}

export function PageHeader({ active, onNavigate }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-center gap-2.5">
        <img src="logo.png" alt="logo" className="size-8 rounded-2xl" />
        <div className="hidden leading-tight sm:block">
          <p className="text-[13px] font-semibold tracking-tight text-frost">Spotinder</p>
          <p className="text-[10px] text-mist">swipe to your next listen</p>
        </div>
      </div>

      <nav className="pill-nav hidden md:flex" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`pill-btn ${item.id === active ? 'active' : ''}`}
              aria-current={item.id === active ? 'page' : undefined}
            >
              <Icon size={15} className={item.id === active ? 'text-brand' : ''} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-ash md:ml-0">
        <span className="h-1.5 w-1.5 rounded-full bg-valid" aria-hidden="true" />
        <span className="hidden sm:inline">Powered by Deezer</span>
        <span className="sm:hidden">Deezer</span>
      </div>

      <div className="mobile-tabs">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === active
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-mist"
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-inset ring-white/10"
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
      </div>
    </header>
  )
}