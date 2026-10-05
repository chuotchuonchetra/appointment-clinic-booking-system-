import { Link } from 'react-router-dom'
import { BellRing } from 'lucide-react'
import { PageHeader, Card, StatusBadge } from '../../components/ui'
import { useBooking } from '../../context/BookingContext'
import { formatDate, getProvider, getService, toISO } from '../../data/mock'

export default function Dashboard() {
  const { appointments } = useBooking()
  const today = toISO(new Date())
  const count = (f: (s: string) => boolean) => appointments.filter((a) => f(a.status)).length
  const pending = count((s) => s === 'pending')
  const revenue = appointments.filter((a) => a.paid && a.status !== 'cancelled').reduce((sum, a) => sum + a.amount, 0)

  const stats = [
    { label: 'Pending approval', value: count((s) => s === 'pending'), color: 'text-amber-600' },
    { label: 'Confirmed', value: count((s) => s === 'confirmed'), color: 'text-fresh' },
    { label: 'Completed', value: count((s) => s === 'completed'), color: 'text-primary' },
    { label: 'Revenue (paid)', value: `$${revenue}`, color: 'text-premium' },
  ]
  const upcoming = appointments
    .filter((a) => (a.status === 'pending' || a.status === 'confirmed') && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5)

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Clinic overview" />
      {pending > 0 && (
        <Link
          to="/admin/appointments"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 transition hover:bg-amber-100"
        >
          <BellRing className="h-5 w-5 shrink-0" aria-hidden />
          <span className="font-semibold">{pending} booking{pending === 1 ? '' : 's'} waiting for your approval</span>
          <span className="ml-auto text-sm font-semibold text-primary">Review now</span>
        </Link>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-premium">Upcoming appointments</h2>
          <Link to="/admin/appointments" className="text-sm font-medium text-primary hover:underline">Manage all</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No upcoming appointments.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{a.fullName} · {getService(a.serviceId)?.name}</p>
                  <p className="text-slate-500">{formatDate(a.date)} {a.time} · {getProvider(a.providerId)?.name}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  )
}
