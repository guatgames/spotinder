import { WaveMark } from './icons'

export function Titlebar() {
  return (
    <header className="titlebar">
      <div className="traffic-dots" aria-hidden="true">
        <span className="traffic-dot dot-close" />
        <span className="traffic-dot dot-min" />
        <span className="traffic-dot dot-max" />
      </div>

      <div className="flex items-center gap-2.5">
        <WaveMark size={24} />
        <div className="leading-none">
          <p className="text-[13px] font-semibold tracking-tight text-frost">Spotinder</p>
          <p className="pt-0.5 text-[10px] text-mist">swipe to your next listen</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-ash">
        <span className="h-1.5 w-1.5 rounded-full bg-valid" aria-hidden="true" />
        Powered by Deezer
      </div>
    </header>
  )
}