import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { ArrowLeft, ArrowRight, ArrowUp, CalendarDays, Check, ChevronRight, Clock, Globe, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, Phone, Send, Smile, Stethoscope, Users, X, type LucideIcon } from 'lucide-react'
import { useAuth, type Role } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import { Avatar } from './staff'
import { Button } from './ui'
import { CLINIC, services } from '../data/mock'

/** Nav link with a pill that slides between the active items. `pillId` keeps desktop and mobile pills separate. */
function NavItem({ to, end, pillId, icon: Icon, highlight, children }: { to: string; end?: boolean; pillId: string; icon?: LucideIcon; highlight?: boolean; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'text-primary' : highlight ? 'bg-primary-soft/70 text-primary ring-1 ring-primary/15 hover:bg-primary-soft' : 'text-slate-600 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <motion.span layoutId={pillId} className="absolute inset-0 -z-0 rounded-lg bg-primary-soft" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
          <span className="relative inline-flex h-5 items-center gap-1.5">{Icon && <Icon className="h-4 w-4" />}{children}</span>
        </>
      )}
    </NavLink>
  )
}

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={`flex items-center gap-2 font-extrabold tracking-tight transition-all duration-300 ${compact ? 'text-lg' : 'text-xl'} ${light ? 'text-white' : 'text-slate-900'}`}>
      <span className={`grid place-items-center rounded-xl bg-primary text-white shadow-sm transition-all duration-300 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}><Smile className={compact ? 'h-4 w-4' : 'h-5 w-5'} /></span>
      <span>Smile<span className={light ? 'text-teal-200' : 'text-primary'}>Care</span></span>
    </span>
  )
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8V13.5h2.4V21h3.1z" /></svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

const socials = [
  { label: 'Facebook', href: 'https://facebook.com', icon: <FacebookIcon /> },
  { label: 'Instagram', href: 'https://instagram.com', icon: <InstagramIcon /> },
  { label: 'Telegram', href: 'https://t.me', icon: <Send className="h-[18px] w-[18px]" /> },
]

const footLink = 'group inline-flex items-center gap-1 text-slate-400 transition hover:text-white'

function SiteFooter({ loggedIn }: { loggedIn: boolean }) {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      <div aria-hidden className="h-1 bg-linear-to-r from-primary via-premium to-fresh" />
      <Smile aria-hidden className="pointer-events-none absolute -bottom-16 -right-10 h-72 w-72 text-white/3" strokeWidth={1} />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">Gentle, modern dental care for the whole family. Book online in under two minutes.</p>
          <div className="mt-5 flex gap-2">
            {socials.map((x) => (
              <a key={x.label} href={x.href} target="_blank" rel="noreferrer" aria-label={x.label} title={x.label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-slate-300 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:ring-primary">
                {x.icon}
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Explore</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className={footLink}>Home</Link></li>
            <li><Link to="/services" className={footLink}>Book an appointment</Link></li>
            <li><Link to="/about" className={footLink}>About us</Link></li>
            <li>{loggedIn ? <Link to="/my-appointments" className={footLink}>My appointments</Link> : <Link to="/login" className={footLink}>Log in</Link>}</li>
          </ul>
        </nav>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Treatments</p>
          <ul className="space-y-2.5 text-sm">
            {services.map((sv) => (
              <li key={sv.id}><Link to="/services" className={footLink}>{sv.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white">Visit us</p>
          <ul className="space-y-3.5 text-sm">
            <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><span>Mon – Sat · 09:00 – 17:00<br /><span className="text-slate-500">Sunday closed</span></span></li>
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><a href={CLINIC.mapsUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">{CLINIC.address}</a></li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><a href="tel:+85512345678" className="transition hover:text-white">+855 12 345 678</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" /><a href="mailto:hello@smilecare.com" className="transition hover:text-white">hello@smilecare.com</a></li>
          </ul>
          <Link to="/services" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark">
            Book now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} SmileCare Dental Clinic. All rights reserved.</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-slate-400 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
          >
            Back to top <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Header shrinks after a small scroll; a thin line shows how far down the page you are.
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 30, restDelta: 0.001 })
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled((was) => (was ? y > 6 : y > 24))) // hysteresis: no flicker near the threshold
  // While a signed-in user is mid-booking, the header CTA points to their schedule instead of "Book now".
  const staffHome = user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor' : null
  const inBooking = location.pathname.startsWith('/book') || location.pathname === '/services'

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const links = (pillId: string) => (
    <>
      <NavItem to="/" end pillId={pillId}>Home</NavItem>
      <NavItem to="/services" pillId={pillId}>Services</NavItem>
      <NavItem to="/about" pillId={pillId}>About Us</NavItem>
      {user && <NavItem to="/my-appointments" pillId={pillId}>My Appointments</NavItem>}
      {staffHome && <NavItem to={staffHome} pillId={pillId} icon={LayoutDashboard} highlight>Dashboard</NavItem>}
    </>
  )
  // Slimmer buttons once the header has shrunk (min-h-9! wins over the Button default).
  const btn = scrolled ? 'min-h-9! py-1.5! ' : ''

  return (
    <div className="flex min-h-screen flex-col">
      <header
        data-scrolled={scrolled}
        className={`fixed inset-x-0 top-0 z-30 border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
          scrolled || open
            ? 'border-slate-200/70 bg-white/90 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.18)] backdrop-blur-xl'
            : 'border-transparent bg-white/60 backdrop-blur-md'
        }`}
      >
        <div className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[padding] duration-300 ${scrolled ? 'py-1.5' : 'py-4'}`}>
          <Link to="/" aria-label="SmileCare home"><Logo compact={scrolled} /></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">{links('nav-pill-desktop')}</nav>
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            {user ? (
              <button
                onClick={() => { logout(); navigate('/') }}
                title={`Log out ${user.name}`}
                aria-label={`Log out ${user.name}`}
                className={`group hidden items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white pl-1 pr-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 md:inline-flex ${scrolled ? 'h-9' : 'h-11'}`}
              >
                <Avatar name={user.name} size="sm" />
                <span className="hidden max-w-24 truncate xl:inline">{user.name.split(' ')[0]}</span>
                <span className="hidden h-4 w-px bg-slate-200 transition group-hover:bg-red-200 xl:block" />
                <LogOut className="h-4 w-4 transition group-hover:translate-x-0.5" />
                <span>Log out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className={`group hidden items-center gap-2 whitespace-nowrap rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary-soft hover:text-primary md:inline-flex ${scrolled ? 'h-9' : 'h-11'}`}
              >
                <LogIn className="h-4 w-4 transition group-hover:translate-x-0.5" /> Log in
              </Link>
            )}
            {user && inBooking ? (
              <Link to="/my-appointments"><Button className={`${btn}rounded-full px-5`}><CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline">View My Schedule</span><span className="sm:hidden">Schedule</span></Button></Link>
            ) : (
              <Link to="/services"><Button className={`${btn}rounded-full px-5`}>Book now</Button></Link>
            )}
            <button
              className={`grid place-items-center rounded-xl text-xl transition-all duration-300 hover:bg-slate-100 md:hidden ${scrolled ? 'h-9 w-9' : 'h-11 w-11'}`}
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Reading progress */}
        <motion.div aria-hidden style={{ scaleX: progress }} className={`absolute inset-x-0 -bottom-px h-0.5 origin-left bg-linear-to-r from-primary to-premium transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 md:hidden"
            >
              <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
                {links('nav-pill-mobile')}
                {user ? (
                  <button className="rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={() => { logout(); navigate('/') }}>
                    Log out
                  </button>
                ) : (
                  <>
                    <NavItem to="/login" pillId="nav-pill-mobile">Log in</NavItem>
                    <NavItem to="/register" pillId="nav-pill-mobile">Create account</NavItem>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* The header is fixed, so this spacer keeps the page from sliding under it. Its height never changes, which is what
          stops the shrinking header from nudging the scroll position (and flickering near the top). */}
      <div aria-hidden className="h-[77px] shrink-0" />

      <main className="flex-1">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.div>
      </main>

      <SiteFooter loggedIn={!!user} />
    </div>
  )
}

/** Wraps pages that need a signed-in user. Remembers where to return after login. */
export function RequireAuth({ role }: { role?: Role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

const adminLinks: { to: string; label: string; end?: boolean; icon: LucideIcon }[] = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/admin/schedule', label: 'Providers & Services', icon: Stethoscope },
]

const doctorLinks: { to: string; label: string; end?: boolean; icon: LucideIcon }[] = [
  { to: '/doctor', label: 'Overview', end: true, icon: LayoutDashboard },
  { to: '/doctor/appointments', label: 'My Patients', icon: Users },
  { to: '/doctor/schedule', label: 'My Schedule', icon: CalendarDays },
]

/** Sidebar shell shared by the admin and doctor areas. */
function StaffLayout({ links, home, roleLabel }: { links: typeof adminLinks; home: string; roleLabel: string }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const current = links.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to))) ?? links[0]
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link to={home} aria-label="Dashboard home"><Logo /></Link>
        <button className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-3">
        <p className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{roleLabel}</p>
        <nav className="flex flex-col gap-0.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-primary-soft text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="staff-nav-indicator" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" />}
                  <l.icon className={`h-[18px] w-[18px] ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} /> {l.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <p className="px-3 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Shortcuts</p>
        <Link to="/" className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
          <Globe className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-600" /> Patient website
        </Link>
      </div>

      <div className="mt-auto p-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
          <Avatar name={user?.name ?? ''} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white hover:text-red-600 hover:shadow-sm"
            aria-label="Log out"
            title="Log out"
            onClick={() => { logout(); navigate('/login') }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200/80 bg-white lg:block">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
          <button className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="hidden text-slate-400 sm:inline">{roleLabel}</span>
            <ChevronRight className="hidden h-4 w-4 text-slate-300 sm:block" />
            <span className="truncate font-semibold text-slate-900">{current.label}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 md:flex">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> {today}
            </span>
            <NotificationBell />
            <Avatar name={user?.name ?? ''} size="sm" className="hidden sm:grid" />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export const AdminLayout = () => <StaffLayout links={adminLinks} home="/admin" roleLabel="Admin" />
export const DoctorLayout = () => <StaffLayout links={doctorLinks} home="/doctor" roleLabel="Doctor portal" />

const steps = ['Service', 'Date & Time', 'Details', 'Payment', 'Confirmed']

/** Compact progress bar on mobile, numbered stepper on desktop. */
export function Stepper({ current }: { current: number }) {
  const shown = Math.min(current, steps.length - 1)
  return (
    <>
      <div className="mb-6 md:hidden">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-primary">Step {shown + 1} of {steps.length}</span>
          <span className="text-slate-600">{steps[shown]}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${((shown + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="mb-10 hidden items-center justify-between gap-2 md:flex" aria-label="Booking progress">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={label} aria-current={active ? 'step' : undefined} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                  done ? 'bg-primary text-white' : active ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`whitespace-nowrap text-sm font-medium ${active ? 'text-primary' : done ? 'text-slate-700' : 'text-slate-600'}`}>{label}</span>
              {i < steps.length - 1 && <span className={`h-0.5 min-w-3 flex-1 rounded ${done ? 'bg-primary' : 'bg-slate-200'}`} />}
            </li>
          )
        })}
      </ol>
    </>
  )
}

/**
 * Sticky bottom action bar on mobile (higher conversion), inline row on desktop.
 * `summary` (e.g. the chosen dentist and time) sits above the buttons.
 */
export function BookingBar({
  onBack,
  onNext,
  nextLabel = 'Continue',
  disabled,
  variant = 'primary',
  hint,
  summary,
  type = 'button',
}: {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: ReactNode
  disabled?: boolean
  variant?: 'primary' | 'fresh'
  hint?: ReactNode
  summary?: ReactNode
  type?: 'button' | 'submit'
}) {
  return (
    <>
      <div className={`${summary ? 'h-32' : 'h-20'} md:hidden`} aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          {summary && <div className="rounded-xl bg-primary-soft px-4 py-2.5 md:bg-white md:ring-1 md:ring-slate-200">{summary}</div>}
          <div className="flex items-center justify-between gap-3">
            {onBack ? (
              <Button type="button" variant="outline" onClick={onBack} aria-label="Back">
                <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-1 items-center justify-end gap-4">
              {hint && <span className="hidden text-sm text-slate-600 sm:inline">{hint}</span>}
              <Button type={type} variant={variant} disabled={disabled} onClick={onNext} className="flex-1 px-8 sm:flex-none">
                {nextLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
