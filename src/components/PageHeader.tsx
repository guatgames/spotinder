import { NAV_ITEMS } from './navigation'
import { WaveMark } from './icons'
import type { ViewId } from './navigation'

interface PageHeaderProps {
  active: ViewId
  onNavigate: (view: ViewId) => void
}

export function PageHeader({ active, onNavigate }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-center gap-2.5">
        <WaveMark size={24} />
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
    </header>
  )
}