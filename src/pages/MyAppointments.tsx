import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarX2, Star } from 'lucide-react'
import Modal from '../components/Modal'
import SlotPicker from '../components/SlotPicker'
import { Alert, Button, Card, PageHeader, StatusBadge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking, type Appointment } from '../context/BookingContext'
import { formatDate, getProvider, getService } from '../data/mock'

const CHANGE_WINDOW_HOURS = 24

const startOf = (a: Appointment) => new Date(`${a.date}T${a.time}:00`).getTime()
const hoursUntil = (a: Appointment) => (startOf(a) - Date.now()) / 36e5

export default function MyAppointments() {
  const { user } = useAuth()
  const { appointments, updateAppointment } = useBooking()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null)
  const [cancelling, setCancelling] = useState<Appointment | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [notice, setNotice] = useState('')

  const location = useLocation()
  const navigate = useNavigate()

  // "Reschedule" on the confirmation page lands here with the dialog already open.
  useEffect(() => {
    const id = (location.state as { reschedule?: string } | null)?.reschedule
    if (!id) return
    const a = appointments.find((x) => x.id === id)
    if (a) setRescheduling(a)
    navigate(location.pathname, { replace: true, state: null })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mine = appointments.filter((a) => a.userEmail === user?.email)
  const isActive = (a: Appointment) => a.status === 'pending' || a.status === 'confirmed'
  const upcoming = mine.filter(isActive).sort((a, b) => startOf(a) - startOf(b))
  const past = mine.filter((a) => !isActive(a))
  const list = tab === 'upcoming' ? upcoming : past
  const canChange = (a: Appointment) => isActive(a) && hoursUntil(a) >= CHANGE_WINDOW_HOURS

  const confirmCancel = () => {
    if (!cancelling) return
    updateAppointment(cancelling.id, { status: 'cancelled' })
    setNotice(`Appointment ${cancelling.id} was cancelled.`)
    setCancelling(null)
  }

  const saveReschedule = () => {
    if (!rescheduling) return
    updateAppointment(rescheduling.id, { date: newDate, time: newTime, status: 'pending' })
    setNotice(`Appointment ${rescheduling.id} moved to ${formatDate(newDate)} at ${newTime}. Awaiting clinic approval.`)
    setRescheduling(null)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <PageHeader title="My appointments" subtitle="View, reschedule or cancel your bookings." />
      {notice && <div className="mb-4"><Alert type="success">{notice}</Alert></div>}

      <div className="mb-5 inline-flex rounded-xl bg-slate-200/70 p-1" role="tablist">
        {([['upcoming', `Upcoming (${upcoming.length})`], ['past', `Past & cancelled (${past.length})`]] as const).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition ${tab === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card className="py-12 text-center">
          <CalendarX2 className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-3 font-semibold">{tab === 'upcoming' ? 'No upcoming appointments' : 'Nothing here yet'}</p>
          <p className="text-sm text-slate-500">{tab === 'upcoming' ? 'Book a visit and it will show up here.' : 'Completed and cancelled visits appear here.'}</p>
          {tab === 'upcoming' && <Link to="/services" className="mt-5 inline-block"><Button>Book a visit</Button></Link>}
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((a, i) => {
            const dt = new Date(a.date + 'T00:00:00')
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`p-5 ${a.status === 'cancelled' ? 'opacity-70' : ''}`}>
                  <div className="flex gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-center text-primary">
                      <span>
                        <span className="block text-xs font-semibold uppercase">{dt.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="block text-2xl font-extrabold leading-none">{dt.getDate()}</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-lg font-semibold">{getService(a.serviceId)?.name}</h3>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-sm text-slate-500">{getProvider(a.providerId)?.name} · {formatDate(a.date)} · <b className="text-slate-700">{a.time}</b></p>
                      <p className="mt-1 font-mono text-xs text-slate-400">{a.id} · {a.paid ? 'Paid' : 'Pay at clinic'} · ${a.amount}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    {canChange(a) && (
                      <>
                        <Button variant="outline" onClick={() => { setRescheduling(a); setNewDate(''); setNewTime('') }}>Reschedule</Button>
                        <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setCancelling(a)}>Cancel</Button>
                      </>
                    )}
                    {isActive(a) && !canChange(a) && (
                      <p className="text-sm text-slate-500">Changes are allowed more than {CHANGE_WINDOW_HOURS}h before the visit. Please call the clinic.</p>
                    )}
                    {a.status === 'completed' &&
                      (a.feedback ? (
                        <p className="text-sm text-fresh-dark">You rated this visit <span className="inline-flex align-middle text-amber-400">{Array.from({ length: a.feedback.rating }, (_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</span></p>
                      ) : (
                        <Link to={`/feedback/${a.id}`}><Button variant="fresh">Leave feedback</Button></Link>
                      ))}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {rescheduling && (
          <Modal label="Reschedule appointment" onClose={() => setRescheduling(null)} wide>
            <h2 className="text-xl font-bold">Reschedule {getService(rescheduling.serviceId)?.name}</h2>
            <div className="mt-5">
              <SlotPicker providerId={rescheduling.providerId} ignoreId={rescheduling.id} date={newDate} time={newTime} onDate={setNewDate} onTime={setNewTime} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRescheduling(null)}>Close</Button>
              <Button disabled={!newDate || !newTime} onClick={saveReschedule}>Save new time</Button>
            </div>
          </Modal>
        )}
        {cancelling && (
          <Modal label="Cancel appointment" onClose={() => setCancelling(null)}>
            <h2 className="text-xl font-bold">Cancel this appointment?</h2>
            <p className="mt-2 text-sm text-slate-500">
              {getService(cancelling.serviceId)?.name} on {formatDate(cancelling.date)} at {cancelling.time}. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelling(null)}>Keep it</Button>
              <Button variant="danger" onClick={confirmCancel}>Yes, cancel</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
