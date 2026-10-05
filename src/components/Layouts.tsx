import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, type Role } from '../context/AuthContext'
import { Button } from './ui'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${isActive ? 'text-primary' : 'text-slate-600 hover:text-primary'}`

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-center gap-2 text-xl font-bold ${light ? 'text-white' : 'text-premium'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg text-white">🦷</span>
      SmileCare
    </span>
  )
}

export function PublicLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/" end className={navCls}>Home</NavLink>
            <NavLink to="/services" className={navCls}>Services</NavLink>
            {user?.role === 'patient' && <NavLink to="/my-appointments" className={navCls}>My Appointments</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin" className={navCls}>Admin Panel</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 sm:inline">Hi, {user.name.split(' ')[0]}</span>
                <Button variant="outline" onClick={() => { logout(); navigate('/') }}>Log out</Button>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost">Log in</Button></Link>
                <Link to="/register"><Button>Register</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-premium-dark text-teal-100">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-4 py-8 text-sm sm:flex-row">
          <Logo light />
          <p>Mon–Sat 09:00–17:00 · +855 12 345 678 · hello@smilecare.com</p>
        </div>
      </footer>
    </div>
  )
}

/** Wraps pages that need a signed-in user. Remembers where to return after login. */
export function RequireAuth({ role = 'patient' }: { role?: Role }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

const adminLinks = [
  { to: '/admin', label: 'Dashboard', end: true, icon: '📊' },
  { to: '/admin/appointments', label: 'Appointments', icon: '📅' },
  { to: '/admin/schedule', label: 'Providers & Services', icon: '🩺' },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-premium p-4 text-white md:w-64 md:shrink-0">
        <Link to="/admin" className="mb-6 block"><Logo light /></Link>
        <nav className="flex gap-2 md:flex-col">
          {adminLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white text-premium' : 'text-teal-50 hover:bg-white/10'}`
              }
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/20 pt-4 text-sm">
          <p className="text-teal-100">{user?.email}</p>
          <button className="mt-2 font-semibold underline" onClick={() => { logout(); navigate('/admin/login') }}>Log out</button>
          <Link to="/" className="mt-2 block text-teal-100 hover:underline">← View website</Link>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 p-6 md:p-10"><Outlet /></main>
    </div>
  )
}

const steps = ['Service', 'Date & Time', 'Details', 'Payment', 'Confirmed']

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-10 flex items-center justify-between gap-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                done ? 'bg-fresh text-white' : active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span className={`hidden text-sm font-medium sm:inline ${active ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
            {i < steps.length - 1 && <span className={`h-0.5 flex-1 ${done ? 'bg-fresh' : 'bg-slate-200'}`} />}
          </li>
        )
      })}
    </ol>
  )
}
