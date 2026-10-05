import { Link } from 'react-router-dom'
import { PageHeader, Card, StatusBadge } from '../../components/ui'
import { useBooking } from '../../context/BookingContext'
import { formatDate, getProvider, getService, toISO } from '../../data/mock'

export default function Dashboard() {
  const { appointments } = useBooking()
  const today = toISO(new Date())
  const count = (f: (s: string) => boolean) => appointments.filter((a) => f(a.status)).length
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
          <Link to="/admin/appointments" className="text-sm font-medium text-primary hover:underline">Manage all →</Link>
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
