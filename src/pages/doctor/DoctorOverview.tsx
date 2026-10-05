import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Clock, Hourglass } from 'lucide-react'
import { Button, Card, StatusBadge } from '../../components/ui'
import { formatDate, getService, toISO } from '../../data/mock'
import { isActive, startOf, useDoctor } from './useDoctor'

export default function DoctorOverview() {
  const { user, provider, mine, updateAppointment } = useDoctor()
  const today = toISO(new Date())
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const upcoming = mine.filter((a) => isActive(a) && a.date >= today).sort((a, b) => startOf(a) - startOf(b))
  const stats = [
    { label: "Today's patients", value: upcoming.filter((a) => a.date === today).length, icon: CalendarCheck, color: 'text-primary bg-primary-soft' },
    { label: 'Awaiting confirmation', value: mine.filter((a) => a.status === 'pending').length, icon: Hourglass, color: 'text-amber-600 bg-amber-50' },
    { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'text-premium bg-premium-soft' },
    { label: 'Completed', value: mine.filter((a) => a.status === 'completed').length, icon: CheckCircle2, color: 'text-fresh-dark bg-fresh-soft' },
  ]

  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        {provider && (
          <img src={provider.photo} alt="" className="h-16 w-16 rounded-2xl object-cover object-top ring-4 ring-white shadow-md" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{greeting}, {user?.name}</h1>
          <p className="text-slate-500">{provider?.specialty} · Here is your day at a glance.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${s.color}`}><s.icon className="h-6 w-6" /></span>
            <span>
              <span className="block text-3xl font-extrabold leading-none">{s.value}</span>
              <span className="text-sm text-slate-500">{s.label}</span>
            </span>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Next appointments</h2>
          <Link to="/doctor/appointments" className="text-sm font-medium text-primary hover:underline">View all patients</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No upcoming appointments yet. New bookings will appear here.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {upcoming.slice(0, 6).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-semibold">{a.fullName} <span className="font-normal text-slate-500">· {getService(a.serviceId)?.name}</span></p>
                  <p className="text-slate-500">{formatDate(a.date)} · {a.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {a.status === 'pending' && (
                    <Button variant="fresh" className="px-3 py-1.5" onClick={() => updateAppointment(a.id, { status: 'confirmed' })}>Confirm</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
