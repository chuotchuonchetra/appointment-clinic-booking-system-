import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { AlertCircle, Bell, CalendarDays, Check, CircleCheck, Clock, Copy, ExternalLink, Info, Mail, ShieldCheck, X, type LucideIcon } from 'lucide-react'
import CalendarMenu from '../components/CalendarMenu'
import { Stepper } from '../components/Layouts'
import Modal from '../components/Modal'
import { Button, Card } from '../components/ui'
import { useBooking, type Appointment, type Status } from '../context/BookingContext'
import { CLINIC, addMinutes, getProvider, getService } from '../data/mock'

const CHANGE_WINDOW_HOURS = 24

/** "+855 12 345 678" -> "+855 •••• 5678" */
function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const last4 = digits.slice(-4)
  const prefix = phone.trim().startsWith('+') ? phone.trim().split(/[\s-]/)[0] + ' ' : ''
  return `${prefix}•••• ${last4}`
}

const fullDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

/** What the page says for each booking status. Pending = the clinic still has to approve it. */
const VIEW: Record<'pending' | 'confirmed' | 'cancelled', { title: string; subtitle: string; tint: string; icon: LucideIcon; iconCls: string; badge: string; badgeCls: string; BadgeIcon: LucideIcon }> = {
  pending: {
    title: 'Booking request received',
    subtitle: "We'll confirm your appointment shortly.",
    tint: 'bg-amber-50',
    icon: Check,
    iconCls: 'bg-amber-500 text-white',
    badge: 'Pending approval',
    badgeCls: 'bg-amber-100 text-amber-900',
    BadgeIcon: Clock,
  },
  confirmed: {
    title: 'Appointment confirmed',
    subtitle: 'Your dentist has approved your booking. See you soon!',
    tint: 'bg-fresh-soft',
    icon: Check,
    iconCls: 'bg-fresh text-white',
    badge: 'Confirmed',
    badgeCls: 'bg-fresh/15 text-fresh-dark',
    BadgeIcon: CircleCheck,
  },
  cancelled: {
    title: 'Booking cancelled',
    subtitle: 'This appointment has been cancelled.',
    tint: 'bg-slate-100',
    icon: X,
    iconCls: 'bg-slate-500 text-white',
    badge: 'Cancelled',
    badgeCls: 'bg-slate-200 text-slate-700',
    BadgeIcon: AlertCircle,
  },
}
const viewFor = (s: Status) => (s === 'completed' ? VIEW.confirmed : VIEW[s])

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-slate-100 py-3 last:border-0">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="min-w-0 wrap-break-word text-right text-[15px] font-semibold text-slate-900">{children}</dd>
    </div>
  )
}

type StepState = 'done' | 'current' | 'upcoming'

/**
 * The confirmation card. `status` can be passed explicitly so both the
 * pending and confirmed versions can be rendered; it defaults to the booking's own status.
 */
export function ConfirmationCard({ appt, status = appt.status }: { appt: Appointment; status?: Status }) {
  const { updateAppointment } = useBooking()
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const view = viewFor(status)
  const service = getService(appt.serviceId)
  const dentist = getProvider(appt.providerId)
  const end = addMinutes(appt.time, service?.duration ?? 30)
  const active = status === 'pending' || status === 'confirmed'
  const hoursLeft = (new Date(`${appt.date}T${appt.time}:00`).getTime() - Date.now()) / 36e5
  const canChange = active && hoursLeft >= CHANGE_WINDOW_HOURS

  const copy = async () => {
    await copyText(appt.id)
    toast.success('Copied', { description: `Reference ${appt.id}` })
  }
  const confirmCancel = () => {
    updateAppointment(appt.id, { status: 'cancelled' })
    setCancelOpen(false)
    toast.success('Booking cancelled')
  }

  const timeline: { icon: LucideIcon; title: string; text: string; state: StepState }[] = [
    { icon: Mail, title: 'Confirmation sent', text: `Email to ${appt.email} and SMS to ${maskPhone(appt.phone)}.`, state: 'done' },
    {
      icon: ShieldCheck,
      title: 'Clinic approval',
      text: status === 'pending' ? 'We are reviewing your request and will approve it shortly.' : 'Your dentist has approved your appointment.',
      state: status === 'pending' ? 'current' : 'done',
    },
    { icon: Bell, title: 'Reminder', text: 'You will get a reminder before your visit.', state: 'upcoming' },
  ]
  const stateLabel: Record<StepState, string> = { done: 'Completed', current: 'In progress', upcoming: 'Upcoming' }
  const stateCls: Record<StepState, string> = {
    done: 'bg-primary text-white',
    current: 'bg-primary-soft text-primary ring-2 ring-primary',
    upcoming: 'bg-slate-100 text-slate-600',
  }

  return (
    <Card className="overflow-hidden p-0">
      {/* Status header: light tint, dark text */}
      <div className={`${view.tint} px-4 py-8 text-center sm:px-6`}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full shadow-sm ${view.iconCls}`}
        >
          <view.icon className="h-8 w-8" strokeWidth={3} aria-hidden />
        </motion.div>

        <div role="status" aria-live="polite" className="mt-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${view.badgeCls}`}>
            <view.BadgeIcon className="h-4 w-4" aria-hidden /> {view.badge}
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{view.title}</h1>
          <p className="mt-1 text-slate-700">{view.subtitle}</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-700">
          <span>Reference</span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white py-1 pl-3 pr-1 ring-1 ring-slate-300">
            <span className="font-mono text-sm font-semibold tracking-wide text-slate-900">{appt.id}</span>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy reference code"
              className="grid h-8 w-8 place-items-center rounded-full text-primary transition hover:bg-primary-soft"
            >
              <Copy className="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>

      <div className="space-y-8 p-4 sm:p-6">
        {/* Appointment details */}
        <section aria-labelledby="details-h">
          <h2 id="details-h" className="mb-3 text-lg font-bold text-slate-900">Appointment details</h2>
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-base font-bold text-slate-900 sm:text-lg">
                {fullDate(appt.date)} · {appt.time} - {end}
              </p>
              <p className="text-sm text-slate-600">{CLINIC.timezone}</p>
            </div>
          </div>
          <dl className="mt-2">
            <Row label="Service">{service?.name}</Row>
            <Row label="Dentist">{dentist?.name}</Row>
            <Row label="Duration">{service?.duration} min</Row>
            <Row label="Price">${appt.amount} · {appt.paid ? 'Paid' : 'Pay at clinic'}</Row>
            <Row label="Location">
              <span className="block">{CLINIC.name}</span>
              <span className="block text-sm font-normal text-slate-600">{CLINIC.address}</span>
              <a
                href={CLINIC.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Get directions <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Row>
          </dl>
        </section>

        {/* What happens next: timeline */}
        <section aria-labelledby="next-h">
          <h2 id="next-h" className="mb-4 text-lg font-bold text-slate-900">What happens next</h2>
          <ol>
            {timeline.map((t, i) => (
              <li key={t.title} className="flex gap-4" aria-current={t.state === 'current' ? 'step' : undefined}>
                <div className="flex flex-col items-center">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${stateCls[t.state]}`}>
                    <t.icon className="h-5 w-5" aria-hidden />
                  </span>
                  {i < timeline.length - 1 && <span aria-hidden className={`my-1 w-px flex-1 ${t.state === 'done' ? 'bg-primary' : 'bg-slate-200'}`} />}
                </div>
                <div className={i < timeline.length - 1 ? 'pb-6' : ''}>
                  <p className="text-base font-semibold text-slate-900">
                    {i + 1}. {t.title} <span className="sr-only">({stateLabel[t.state]})</span>
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-primary-soft p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-slate-900">Before your visit</p>
              <p className="text-sm text-slate-700">Please arrive 10 minutes early and bring your ID.</p>
            </div>
          </div>
        </section>

        {/* Actions: primary first on mobile */}
        <section aria-label="Actions">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to="/my-appointments" className="block sm:inline-block"><Button className="w-full sm:w-auto">View my appointments</Button></Link>
            {active && <CalendarMenu appt={appt} />}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium">
            {canChange && (
              <>
                <button type="button" className="inline-flex min-h-11 items-center text-primary hover:underline" onClick={() => navigate('/my-appointments', { state: { reschedule: appt.id } })}>
                  Reschedule
                </button>
                <button type="button" className="inline-flex min-h-11 items-center text-red-600 hover:underline" onClick={() => setCancelOpen(true)}>
                  Cancel booking
                </button>
              </>
            )}
            <Link to="/" className="inline-flex min-h-11 items-center text-primary hover:underline">Back to home</Link>
          </div>
          {active && !canChange && (
            <p className="text-sm text-slate-600">Changes are allowed more than {CHANGE_WINDOW_HOURS} hours before your visit. Please call the clinic.</p>
          )}
        </section>
      </div>

      {cancelOpen && (
        <Modal label="Cancel booking" onClose={() => setCancelOpen(false)}>
          <h2 className="text-xl font-bold text-slate-900">Cancel this booking?</h2>
          <p className="mt-2 text-sm text-slate-600">
            {service?.name} on {fullDate(appt.date)} at {appt.time}. This cannot be undone.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep booking</Button>
            <Button variant="danger" onClick={confirmCancel}>Yes, cancel booking</Button>
          </div>
        </Modal>
      )}
    </Card>
  )
}

export default function Confirmation() {
  const { id } = useParams()
  const { appointments, resetDraft } = useBooking()
  const appt = appointments.find((a) => a.id === id)

  useEffect(() => resetDraft(), []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!appt) return <Navigate to="/my-appointments" replace />

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* "Confirmed" is the current step; the earlier steps show as completed */}
      <Stepper current={4} />
      <ConfirmationCard appt={appt} />
    </div>
  )
}
