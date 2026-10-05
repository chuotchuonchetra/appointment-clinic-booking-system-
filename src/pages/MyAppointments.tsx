import { useState } from 'react'
import { Link } from 'react-router-dom'
import SlotPicker from '../components/SlotPicker'
import { Alert, Button, Card, PageHeader, StatusBadge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking, type Appointment } from '../context/BookingContext'
import { formatDate, getProvider, getService } from '../data/mock'

const CHANGE_WINDOW_HOURS = 24

const hoursUntil = (a: Appointment) => (new Date(`${a.date}T${a.time}:00`).getTime() - Date.now()) / 36e5

export default function MyAppointments() {
  const { user } = useAuth()
  const { appointments, updateAppointment } = useBooking()
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [notice, setNotice] = useState('')

  const mine = appointments.filter((a) => a.userEmail === user?.email)
  const canChange = (a: Appointment) => (a.status === 'pending' || a.status === 'confirmed') && hoursUntil(a) >= CHANGE_WINDOW_HOURS

  const cancel = (a: Appointment) => {
    if (!window.confirm('Cancel this appointment?')) return
    updateAppointment(a.id, { status: 'cancelled' })
    setNotice(`Appointment ${a.id} was cancelled.`)
  }

  const saveReschedule = () => {
    if (!rescheduling) return
    updateAppointment(rescheduling.id, { date: newDate, time: newTime, status: 'pending' })
    setNotice(`Appointment ${rescheduling.id} moved to ${formatDate(newDate)} at ${newTime}. Awaiting clinic approval.`)
    setRescheduling(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <PageHeader title="My appointments" subtitle="View, reschedule or cancel your bookings." />
      {notice && <div className="mb-4"><Alert type="success">{notice}</Alert></div>}

      {mine.length === 0 ? (
        <Card className="text-center">
          <p className="text-slate-500">You have no appointments yet.</p>
          <Link to="/services" className="mt-4 inline-block"><Button>Book your first visit</Button></Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {mine.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{getService(a.serviceId)?.name}</h3>
                  <p className="text-sm text-slate-500">{getProvider(a.providerId)?.name}</p>
                  <p className="mt-2 text-sm font-medium text-primary">📅 {formatDate(a.date)} · {a.time}</p>
                  <p className="mt-1 font-mono text-xs text-slate-400">{a.id} · {a.paid ? 'Paid' : 'Pay at clinic'} · ${a.amount}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {canChange(a) && (
                  <>
                    <Button variant="outline" onClick={() => { setRescheduling(a); setNewDate(''); setNewTime('') }}>Reschedule</Button>
                    <Button variant="danger" onClick={() => cancel(a)}>Cancel</Button>
                  </>
                )}
                {(a.status === 'pending' || a.status === 'confirmed') && !canChange(a) && (
                  <p className="text-sm text-slate-500">Changes are only allowed more than {CHANGE_WINDOW_HOURS}h before the appointment. Please call the clinic.</p>
                )}
                {a.status === 'completed' &&
                  (a.feedback ? (
                    <p className="text-sm text-fresh-dark">You rated this visit {'★'.repeat(a.feedback.rating)}</p>
                  ) : (
                    <Link to={`/feedback/${a.id}`}><Button variant="fresh">Leave feedback</Button></Link>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {rescheduling && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold text-premium">Reschedule {getService(rescheduling.serviceId)?.name}</h2>
            <div className="mt-4">
              <SlotPicker
                providerId={rescheduling.providerId}
                ignoreId={rescheduling.id}
                date={newDate}
                time={newTime}
                onDate={setNewDate}
                onTime={setNewTime}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduling(null)}>Close</Button>
              <Button disabled={!newDate || !newTime} onClick={saveReschedule}>Save new time</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
