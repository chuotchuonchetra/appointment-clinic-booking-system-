import { useState } from 'react'
import SlotPicker from '../../components/SlotPicker'
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui'
import { useBooking, type Appointment, type Status } from '../../context/BookingContext'
import { formatDate, getProvider, getService } from '../../data/mock'

const filters: ('all' | Status)[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function Appointments() {
  const { appointments, updateAppointment } = useBooking()
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [search, setSearch] = useState('')
  const [adjusting, setAdjusting] = useState<Appointment | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const rows = appointments.filter(
    (a) =>
      (filter === 'all' || a.status === filter) &&
      (a.fullName + a.id + a.email).toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <PageHeader title="Appointments" subtitle="Approve, adjust or complete bookings." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              filter === f ? 'bg-premium text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {f}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email or ID…"
          className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {['Patient', 'Service', 'Dentist', 'When', 'Payment', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No appointments found.</td></tr>
            )}
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{a.fullName}</p>
                  <p className="text-xs text-slate-400">{a.phone}</p>
                </td>
                <td className="px-4 py-3">{getService(a.serviceId)?.name}</td>
                <td className="px-4 py-3">{getProvider(a.providerId)?.name}</td>
                <td className="px-4 py-3">{formatDate(a.date)}<br />{a.time}</td>
                <td className="px-4 py-3">{a.paid ? `Paid $${a.amount}` : `Due $${a.amount}`}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {a.status === 'pending' && <Button variant="fresh" className="px-3 py-1.5" onClick={() => updateAppointment(a.id, { status: 'confirmed' })}>Approve</Button>}
                    {a.status === 'confirmed' && <Button variant="primary" className="px-3 py-1.5" onClick={() => updateAppointment(a.id, { status: 'completed', paid: true })}>Complete</Button>}
                    {(a.status === 'pending' || a.status === 'confirmed') && (
                      <>
                        <Button variant="outline" className="px-3 py-1.5" onClick={() => { setAdjusting(a); setDate(''); setTime('') }}>Adjust</Button>
                        <Button variant="danger" className="px-3 py-1.5" onClick={() => updateAppointment(a.id, { status: 'cancelled' })}>Cancel</Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {adjusting && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold text-premium">Adjust {adjusting.fullName}'s appointment</h2>
            <div className="mt-4">
              <SlotPicker providerId={adjusting.providerId} ignoreId={adjusting.id} date={date} time={time} onDate={setDate} onTime={setTime} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAdjusting(null)}>Close</Button>
              <Button
                disabled={!date || !time}
                onClick={() => { updateAppointment(adjusting.id, { date, time, status: 'confirmed' }); setAdjusting(null) }}
              >
                Save & confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
