import { GithubIcon, MailIcon, PhoneIcon } from './icons'

const YEAR = new Date().getFullYear()

const contactLinks = [
  { href: 'https://github.com/guatgames/', label: 'GitHub', Icon: GithubIcon },
  { href: 'mailto:adalfaroochoa@gmail.com', label: 'Email', Icon: MailIcon },
  { href: 'tel:+50240605112', label: 'Phone', Icon: PhoneIcon },
]

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="flex flex-col items-center justify-center gap-3 text-center md:flex-row md:justify-between md:gap-4 md:text-left">
        <p className="text-[11px] text-ash">© {YEAR} Spotinder</p>

        <p className="order-last text-[11px] text-ash md:order-none">
          Powered by <span className="font-medium text-frost">Deezer</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <p className="text-[11px] text-ash">
            Developed by <span className="font-medium text-frost">Angel David Alfaro Ochoa</span>
          </p>
          <div className="flex items-center gap-1.5">
            {contactLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-ash transition-colors hover:border-white/25 hover:text-frost"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}