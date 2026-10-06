import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, CalendarCheck, CalendarDays, CalendarX2, DollarSign, Hourglass, Plus, Stethoscope } from 'lucide-react'
import { Button, StatusBadge } from '../../components/ui'
import { Avatar, BarChart, Donut, EmptyState, Panel, Progress, StatCard } from '../../components/staff'
import { useBooking } from '../../context/BookingContext'
import { getProvider, getService, providers, services, toISO } from '../../data/mock'

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function Dashboard() {
  const { appointments } = useBooking()
  const now = new Date()
  const today = toISO(now)
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const by = (s: string) => appointments.filter((a) => a.status === s).length
  const pending = by('pending')
  const active = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed')
  const revenue = appointments.filter((a) => a.paid && a.status !== 'cancelled').reduce((sum, a) => sum + a.amount, 0)
  const outstanding = active.filter((a) => !a.paid).reduce((sum, a) => sum + a.amount, 0)
  const todayCount = active.filter((a) => a.date === today).length

  // Bookings per day for the next 7 days
  const week = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    return d
  })
    .filter((d) => d.getDay() !== 0) // closed on Sundays
    .slice(0, 6)
    .map((d) => {
    const iso = toISO(d)
    return {
      label: iso === today ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      sub: String(d.getDate()),
      value: active.filter((a) => a.date === iso).length,
      active: iso === today,
    }
  })

  const statusData = [
    { label: 'pending', value: pending, color: '#f59e0b' },
    { label: 'confirmed', value: by('confirmed'), color: '#2f9e55' },
    { label: 'completed', value: by('completed'), color: '#2563eb' },
    { label: 'cancelled', value: by('cancelled'), color: '#cbd5e1' },
  ]

  const upcoming = active
    .filter((a) => a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6)

  const workload = providers.map((p) => ({ p, count: active.filter((a) => a.providerId === p.id && a.date >= today).length }))
  const maxLoad = Math.max(1, ...workload.map((w) => w.count))

  const topServices = services
    .map((s) => {
      const list = appointments.filter((a) => a.serviceId === s.id && a.status !== 'cancelled')
      return { s, count: list.length, revenue: list.filter((a) => a.paid).reduce((sum, a) => sum + a.amount, 0) }
    })
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-[28px]">{greeting} 👋</h1>
          <p className="mt-1 text-slate-500">Here's what's happening at the clinic today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/schedule"><Button variant="outline" className="min-h-10 px-4"><Stethoscope className="h-4 w-4" /> Providers</Button></Link>
          <Link to="/admin/appointments"><Button className="min-h-10 px-4"><Plus className="h-4 w-4" /> Manage bookings</Button></Link>
        </div>
      </div>

      {pending > 0 && (
        <Link
          to="/admin/appointments"
          className="group flex items-center gap-4 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 p-4 transition hover:shadow-md"
        >
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <BellRing className="h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-amber-500" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-amber-900">{pending} booking{pending === 1 ? '' : 's'} waiting for approval</p>
            <p className="text-sm text-amber-800/80">Patients get notified as soon as you confirm.</p>
          </div>
          <span className="ml-auto hidden items-center gap-1 text-sm font-semibold text-amber-900 sm:flex">
            Review now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's appointments" value={todayCount} icon={CalendarCheck} tone="blue" note={`${active.length} active bookings in total`} />
        <StatCard label="Pending approval" value={pending} icon={Hourglass} tone="amber" note={pending ? 'Needs your attention' : 'All caught up'} delay={0.05} />
        <StatCard label="Completed visits" value={by('completed')} icon={CalendarDays} tone="green" note={`${by('cancelled')} cancelled`} delay={0.1} />
        <StatCard label="Revenue (paid)" value={`$${revenue.toLocaleString()}`} icon={DollarSign} tone="violet" note={`$${outstanding.toLocaleString()} outstanding`} delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Bookings this week" subtitle="Active appointments for the next 6 opening days" className="lg:col-span-2">
          <BarChart data={week} />
        </Panel>
        <Panel title="Status breakdown" subtitle="All appointments">
          <Donut data={statusData} centerLabel="bookings" />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Upcoming appointments"
          subtitle="Next confirmed and pending visits"
          className="lg:col-span-2"
          bodyClassName=""
          action={<Link to="/admin/appointments" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">View all <ArrowRight className="h-3.5 w-3.5" /></Link>}
        >
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarX2} title="No upcoming appointments" text="New bookings will show up here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    {['Patient', 'Dentist', 'Date', 'Status'].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {upcoming.map((a) => (
                    <tr key={a.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={a.fullName} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{a.fullName}</p>
                            <p className="truncate text-xs text-slate-500">{getService(a.serviceId)?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{getProvider(a.providerId)?.name}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{a.date === today ? 'Today' : shortDate(a.date)}</p>
                        <p className="text-xs text-slate-500">{a.time}</p>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Dentist workload" subtitle="Upcoming active bookings">
            <ul className="space-y-4">
              {workload.map(({ p, count }) => (
                <li key={p.id} className="flex items-center gap-3">
                  <img src={p.photo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover object-top" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                      <span className="text-xs font-semibold text-slate-600 tabular-nums">{count}</span>
                    </div>
                    <Progress value={count} max={maxLoad} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Popular services">
            {topServices.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <ul className="space-y-3">
                {topServices.map(({ s, count, revenue }) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><s.icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{count} booking{count === 1 ? '' : 's'}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">${revenue}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
