import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, CalendarDays, Globe, Check, LayoutDashboard, Menu, Smile, Stethoscope, Users, X, type LucideIcon } from 'lucide-react'
import { useAuth, type Role } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import { Button } from './ui'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary-soft text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-sm"><Smile className="h-5 w-5" /></span>
      Smile<span className={light ? 'text-teal-200' : 'text-primary'}>Care</span>
    </span>
  )
}

export function PublicLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  // While a signed-in user is mid-booking, the header CTA points to their schedule instead of "Book now".
  const staffHome = user?.role === 'admin' ? '/admin' : user?.role === 'doctor' ? '/doctor' : null
  const inBooking = location.pathname.startsWith('/book') || location.pathname === '/services'

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const links = (
    <>
      <NavLink to="/" end className={navCls}>Home</NavLink>
      <NavLink to="/services" className={navCls}>Services</NavLink>
      {user && <NavLink to="/my-appointments" className={navCls}>My Appointments</NavLink>}
      {staffHome && <NavLink to={staffHome} className={navCls}>Dashboard</NavLink>}
    </>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" aria-label="SmileCare home"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">{links}</nav>
          <div className="flex items-center gap-2">
            {user && <NotificationBell />}
            {user ? (
              <Button variant="ghost" className="hidden md:inline-flex" onClick={() => { logout(); navigate('/') }}>
                Log out ({user.name.split(' ')[0]})
              </Button>
            ) : (
              <Link to="/login" className="hidden md:block"><Button variant="ghost">Log in</Button></Link>
            )}
            {staffHome && (
              <Link to={staffHome} className="hidden sm:block"><Button variant="outline" className="px-4"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button></Link>
            )}
            {user && inBooking ? (
              <Link to="/my-appointments"><Button className="px-4"><CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline">View My Schedule</span><span className="sm:hidden">Schedule</span></Button></Link>
            ) : (
              <Link to="/services"><Button className="px-4">Book now</Button></Link>
            )}
            <button
              className="grid h-11 w-11 place-items-center rounded-xl text-xl hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 md:hidden"
            >
              <nav className="flex flex-col gap-1 p-3">
                {links}
                {user ? (
                  <button className="rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={() => { logout(); navigate('/') }}>
                    Log out
                  </button>
                ) : (
                  <>
                    <NavLink to="/login" className={navCls}>Log in</NavLink>
                    <NavLink to="/register" className={navCls}>Create account</NavLink>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Outlet />
        </motion.div>
      </main>

      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <Logo light />
            <p className="mt-3 max-w-xs text-sm text-slate-400">Gentle, modern dental care. Book online in under two minutes.</p>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Visit us</p>
            <p>Mon–Sat · 09:00 – 17:00</p>
            <p>Street 271, Phnom Penh</p>
          </div>
          <div className="text-sm">
            <p className="mb-2 font-semibold text-white">Contact</p>
            <p>+855 12 345 678</p>
            <p>hello@smilecare.com</p>
          </div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} SmileCare Dental Clinic</p>
      </footer>
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
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-premium p-4 text-white md:w-64 md:shrink-0">
        <Link to={home} className="mb-6 block"><Logo light /></Link>
        <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wider text-teal-200 md:block">{roleLabel}</p>
        <nav className="flex gap-2 md:flex-col">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white text-premium' : 'text-teal-50 hover:bg-white/10'}`
              }
            >
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/20 pt-4 text-sm">
          <p className="font-semibold text-white">{user?.name}</p>
          <p className="text-teal-100">{user?.email}</p>
          <button className="mt-2 font-semibold underline" onClick={() => { logout(); navigate('/login') }}>Log out</button>
          <Link to="/" className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 font-medium text-white transition hover:bg-white/20"><Globe className="h-4 w-4" /> Switch to patient site</Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-slate-50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-2 md:px-10">
          <p className="text-sm font-medium text-slate-600">{roleLabel}</p>
          <NotificationBell />
        </div>
        <div className="p-6 md:p-10"><Outlet /></div>
      </main>
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
