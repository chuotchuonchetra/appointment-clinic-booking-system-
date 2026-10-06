import { useState } from 'react'
import { SearchX } from 'lucide-react'
import SlotPicker from '../../components/SlotPicker'
import AppointmentTimeline from './AppointmentTimeline'
import { Button, Card, StatusBadge } from '../../components/ui'
import { useBooking, type Appointment, type Status } from '../../context/BookingContext'
import { Avatar, EmptyState, SearchInput, Segmented } from '../../components/staff'
import { formatDate, getProvider, getService } from '../../data/mock'

const views = ['timeline', 'list'] as const
const filters: readonly ('all' | Status)[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function Appointments() {
  const { appointments, updateAppointment } = useBooking()
  const [view, setView] = useState<(typeof views)[number]>('timeline')
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

  const counts = Object.fromEntries(filters.map((f) => [f, f === 'all' ? appointments.length : appointments.filter((a) => a.status === f).length]))

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Appointments</h1>
          <p className="mt-1.5 text-slate-600">
            {view === 'timeline' ? 'See the day per dentist. Drag a booking to move it, click it to manage it.' : 'Every booking in one list. Filter, approve, adjust or complete.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or ID…" />
          <Segmented options={views} value={view} onChange={setView} />
        </div>
      </div>
      {view === 'list' && <div className="mb-4"><Segmented options={filters} value={filter} onChange={setFilter} counts={counts} /></div>}

      {view === 'timeline' ? (
        <AppointmentTimeline search={search} onAdjust={(a) => { setAdjusting(a); setDate(a.date); setTime('') }} />
      ) : (
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-200 text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {['Patient', 'Service', 'Dentist', 'When', 'Payment', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td colSpan={7}><EmptyState icon={SearchX} title="No appointments found" text="Try another filter or search term." /></td></tr>
            )}
            {rows.map((a) => (
              <tr key={a.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={a.fullName} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900">{a.fullName}</p>
                      <p className="text-xs text-slate-400">{a.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{getService(a.serviceId)?.name}</td>
                <td className="px-4 py-3">{getProvider(a.providerId)?.name}</td>
                <td className="px-4 py-3">{formatDate(a.date)}<br />{a.time}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${a.paid ? 'text-fresh-dark' : 'text-slate-500'}`}>{a.paid ? 'Paid' : 'Due'}</span>
                  <p className="font-medium text-slate-900 tabular-nums">${a.amount}</p>
                </td>
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
      )}

      {adjusting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">Adjust {adjusting.fullName}'s appointment</h2>
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
