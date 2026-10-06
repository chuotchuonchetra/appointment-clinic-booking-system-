import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, CalendarDays, CheckCircle2, Clock, Coffee, Hourglass, Star } from 'lucide-react'
import { Button, StatusBadge } from '../../components/ui'
import { Avatar, EmptyState, Panel, StatCard } from '../../components/staff'
import { addMinutes, getService, toISO } from '../../data/mock'
import { isActive, startOf, useDoctor } from './useDoctor'

const shortDate = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

/** "in 2h 15m" / "in 20m" / "now" */
function until(ms: number) {
  const m = Math.round(ms / 60000)
  if (m <= 0) return 'now'
  if (m < 60) return `in ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `in ${h}h${m % 60 ? ` ${m % 60}m` : ''}`
  const d = Math.round(h / 24)
  return `in ${d} day${d === 1 ? '' : 's'}`
}

export default function DoctorOverview() {
  const { user, provider, mine, updateAppointment } = useDoctor()
  const now = new Date()
  const today = toISO(now)
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const upcoming = mine.filter((a) => isActive(a) && startOf(a) >= now.getTime() - 30 * 60000).sort((a, b) => startOf(a) - startOf(b))
  const todays = mine.filter((a) => isActive(a) && a.date === today).sort((a, b) => startOf(a) - startOf(b))
  const awaiting = mine.filter((a) => a.status === 'pending').sort((a, b) => startOf(a) - startOf(b))
  const next = upcoming[0]
  const rated = mine.filter((a) => a.feedback)
  const avgRating = rated.length ? rated.reduce((s, a) => s + (a.feedback?.rating ?? 0), 0) / rated.length : 0
  const recentFeedback = rated.filter((a) => a.feedback?.comment).slice(-3).reverse()

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-blue-600 to-premium p-6 text-white shadow-lg shadow-primary/20 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            {provider && (
              <img src={provider.photo} alt="" className="h-16 w-16 rounded-2xl object-cover object-top ring-4 ring-white/30 md:h-20 md:w-20" onError={(e) => (e.currentTarget.style.display = 'none')} />
            )}
            <div>
              <p className="text-sm font-medium text-blue-100">{greeting},</p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{user?.name}</h1>
              <p className="mt-1 text-sm text-blue-100">
                {provider?.specialty} · {todays.length ? `${todays.length} patient${todays.length === 1 ? '' : 's'} on today's list` : 'No patients booked today'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur-md lg:min-w-80">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">Next patient</p>
            {next ? (
              <div className="mt-2 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-sm font-bold text-primary">
                  {next.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{next.fullName}</p>
                  <p className="truncate text-sm text-blue-100">{getService(next.serviceId)?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">{next.time}</p>
                  <p className="text-xs text-blue-100">{until(startOf(next) - now.getTime())}</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-blue-100">Nothing scheduled — enjoy the quiet.</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's patients" value={todays.length} icon={CalendarCheck} tone="blue" note={todays[0] ? `First at ${todays[0].time}` : 'Free day'} />
        <StatCard label="Awaiting confirmation" value={awaiting.length} icon={Hourglass} tone="amber" note={awaiting.length ? 'Confirm to notify patients' : 'All confirmed'} delay={0.05} />
        <StatCard label="Upcoming" value={upcoming.length} icon={Clock} tone="teal" note="Pending and confirmed" delay={0.1} />
        <StatCard
          label="Patient rating"
          value={rated.length ? avgRating.toFixed(1) : '—'}
          icon={Star}
          tone="violet"
          note={`${mine.filter((a) => a.status === 'completed').length} completed · ${rated.length} review${rated.length === 1 ? '' : 's'}`}
          delay={0.15}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Today's schedule"
          subtitle={now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          className="lg:col-span-2"
          action={<Link to="/doctor/schedule" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">Full schedule <ArrowRight className="h-3.5 w-3.5" /></Link>}
        >
          {todays.length === 0 ? (
            <EmptyState icon={Coffee} title="No appointments today" text="Your open slots are visible to patients booking online." />
          ) : (
            <ol className="relative space-y-1">
              {todays.map((a, i) => {
                const service = getService(a.serviceId)
                const past = startOf(a) + (service?.duration ?? 30) * 60000 < now.getTime()
                const isNext = a.id === next?.id
                return (
                  <li key={a.id} className="relative flex gap-4">
                    <div className="w-14 shrink-0 pt-3 text-right">
                      <p className={`text-sm font-semibold tabular-nums ${past ? 'text-slate-400' : 'text-slate-900'}`}>{a.time}</p>
                      <p className="text-[11px] text-slate-400 tabular-nums">{addMinutes(a.time, service?.duration ?? 30)}</p>
                    </div>
                    <div className="relative flex flex-col items-center">
                      <span className={`mt-4 h-3 w-3 rounded-full ring-4 ${isNext ? 'bg-primary ring-primary/20' : past ? 'bg-slate-300 ring-slate-100' : 'bg-white ring-slate-200 border-2 border-primary'}`} />
                      {i < todays.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
                    </div>
                    <div className={`mb-2 flex min-w-0 flex-1 flex-wrap items-center gap-3 rounded-xl border p-3 transition ${isNext ? 'border-primary/30 bg-primary-soft/60' : 'border-slate-100 hover:bg-slate-50'} ${past ? 'opacity-60' : ''}`}>
                      <Avatar name={a.fullName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-900">{a.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{service?.name} · {service?.duration} min</p>
                      </div>
                      <StatusBadge status={a.status} />
                      {a.status === 'confirmed' && !past && isNext && (
                        <Button variant="primary" className="min-h-9 px-3 py-1 text-xs" onClick={() => updateAppointment(a.id, { status: 'completed', paid: true })}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel
            title="Needs confirmation"
            subtitle="Pending bookings"
            bodyClassName=""
            action={awaiting.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{awaiting.length}</span>}
          >
            {awaiting.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="You're all caught up" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {awaiting.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={a.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{a.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{shortDate(a.date)} · {a.time}</p>
                    </div>
                    <Button variant="fresh" className="min-h-9 px-3 py-1 text-xs" onClick={() => updateAppointment(a.id, { status: 'confirmed' })}>Confirm</Button>
                  </li>
                ))}
              </ul>
            )}
            {awaiting.length > 4 && (
              <Link to="/doctor/appointments" className="block border-t border-slate-100 px-5 py-3 text-center text-sm font-medium text-primary hover:bg-slate-50">
                View {awaiting.length - 4} more
              </Link>
            )}
          </Panel>

          <Panel title="Coming up" subtitle="After today" bodyClassName="">
            {upcoming.filter((a) => a.date > today).length === 0 ? (
              <EmptyState icon={CalendarDays} title="Nothing booked yet" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcoming.filter((a) => a.date > today).slice(0, 4).map((a) => {
                  const d = new Date(a.date + 'T00:00:00')
                  return (
                    <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 leading-none">
                        <span className="text-[10px] font-semibold uppercase text-slate-500">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-base font-bold text-slate-900">{d.getDate()}</span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{a.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{a.time} · {getService(a.serviceId)?.name}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          {recentFeedback.length > 0 && (
            <Panel title="Recent feedback">
              <ul className="space-y-4">
                {recentFeedback.map((a) => (
                  <li key={a.id}>
                    <div className="flex items-center gap-0.5" aria-label={`${a.feedback!.rating} out of 5`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < a.feedback!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-slate-700">“{a.feedback!.comment}”</p>
                    <p className="mt-0.5 text-xs text-slate-400">— {a.fullName}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
