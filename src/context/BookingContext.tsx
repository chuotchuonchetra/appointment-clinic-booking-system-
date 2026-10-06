import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { formatDate, getProvider, getService } from '../data/mock'
import { useAuth } from './AuthContext'
import { toEmail, useNotifications, type NewNotice } from './NotificationContext'

export type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Draft {
  serviceId: string
  providerId: string
  date: string
  time: string
  fullName: string
  email: string
  phone: string
  notes: string
}

export interface Appointment extends Draft {
  id: string
  userEmail: string
  status: Status
  paid: boolean
  paymentMethod: string
  amount: number
  feedback?: { rating: number; comment: string }
  /** Private note written by the treating dentist. */
  doctorNote?: string
  createdAt: string
}

interface BookingState {
  draft: Draft
  updateDraft: (patch: Partial<Draft>) => void
  resetDraft: () => void
  appointments: Appointment[]
  createAppointment: (userEmail: string, paymentMethod: string, amount: number) => Appointment
  updateAppointment: (id: string, patch: Partial<Appointment>) => void
}

const emptyDraft: Draft = { serviceId: '', providerId: '', date: '', time: '', fullName: '', email: '', phone: '', notes: '' }
const KEY = 'dental_appointments'
const BookingContext = createContext<BookingState | null>(null)

const load = (): Appointment[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Appointment[]
  } catch {
    return []
  }
}

/** Notices for admin + the treating dentist (same text, each with their own link). */
const forStaff = (providerId: string, type: NewNotice['type'], title: string, body: string, actor?: string): NewNotice[] => [
  { to: ['role:admin'], type, title, body, link: '/admin/appointments', actor },
  { to: [`provider:${providerId}`], type, title, body, link: '/doctor/appointments', actor },
]

const describe = (a: Pick<Appointment, 'serviceId' | 'providerId' | 'date' | 'time'>) => ({
  service: getService(a.serviceId)?.name ?? 'Appointment',
  dentist: getProvider(a.providerId)?.name ?? 'your dentist',
  when: `${formatDate(a.date)} at ${a.time}`,
})

export function BookingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [appointments, setAppointments] = useState<Appointment[]>(load)

  // persist only when different, so cross-tab sync cannot ping-pong
  useEffect(() => {
    const json = JSON.stringify(appointments)
    if (localStorage.getItem(KEY) !== json) localStorage.setItem(KEY, json)
  }, [appointments])

  // another tab of the same browser changed bookings (e.g. the admin approved one): pick it up live
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setAppointments(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Reminders: tell patients about visits that start within 24 hours (once per booking time).
  useEffect(() => {
    const check = () => {
      const now = Date.now()
      const due = appointments.filter((a) => {
        if (a.status !== 'pending' && a.status !== 'confirmed') return false
        const start = new Date(`${a.date}T${a.time}:00`).getTime()
        return start > now && start - now <= 24 * 36e5
      })
      if (!due.length) return
      notify(
        due.map((a) => {
          const d = describe(a)
          return {
            to: [toEmail(a.userEmail)],
            type: 'info' as const,
            title: 'Appointment reminder',
            body: `${d.service} with ${d.dentist}, ${d.when}. Please arrive 10 minutes early and bring your ID.`,
            link: `/book/confirmation/${a.id}`,
            dedupeKey: `reminder:${a.id}:${a.date}${a.time}`,
          }
        }),
      )
    }
    check()
    const timer = setInterval(check, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [appointments, notify])

  const createAppointment: BookingState['createAppointment'] = (userEmail, paymentMethod, amount) => {
    const appt: Appointment = {
      ...draft,
      id: 'APT-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      userEmail,
      status: 'pending',
      paid: paymentMethod !== 'clinic',
      paymentMethod,
      amount,
      createdAt: new Date().toISOString(),
    }
    setAppointments((a) => [appt, ...a])

    const d = describe(appt)
    notify([
      {
        to: [toEmail(userEmail)],
        type: 'info',
        title: 'Booking request received',
        body: `${d.service} with ${d.dentist}, ${d.when}. We will confirm it shortly.`,
        link: `/book/confirmation/${appt.id}`,
        actor: userEmail,
      },
      ...forStaff(appt.providerId, 'warning', 'New booking needs approval', `${appt.fullName} · ${d.service} · ${d.when}`, userEmail),
    ])
    return appt
  }

  const updateAppointment: BookingState['updateAppointment'] = (id, patch) => {
    const old = appointments.find((a) => a.id === id)
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    if (!old) return

    const next = { ...old, ...patch }
    const d = describe(next)
    const actor = user?.email
    // Staff acting on someone else's booking vs. the patient acting on their own.
    const byStaff = (user?.role === 'admin' || user?.role === 'doctor') && user.email !== old.userEmail
    const patient = [toEmail(old.userEmail)]
    const out: NewNotice[] = []

    const timeChanged = next.date !== old.date || next.time !== old.time || next.providerId !== old.providerId
    const statusChanged = next.status !== old.status

    if (timeChanged) {
      if (byStaff) {
        out.push({
          to: patient,
          type: 'info',
          title: 'Appointment time changed',
          body: `Your ${d.service} was moved to ${d.when} with ${d.dentist}.${next.status === 'confirmed' ? ' It is confirmed.' : ''}`,
          link: `/book/confirmation/${id}`,
          actor,
        })
      } else {
        out.push(...forStaff(old.providerId, 'warning', 'Reschedule request needs approval', `${old.fullName} moved ${d.service} to ${d.when}.`, actor))
      }
    } else if (statusChanged) {
      if (next.status === 'confirmed') {
        out.push({
          to: patient,
          type: 'success',
          title: 'Appointment confirmed',
          body: `${d.service} with ${d.dentist}, ${d.when}, is confirmed. See you soon!`,
          link: `/book/confirmation/${id}`,
          actor,
        })
      } else if (next.status === 'cancelled') {
        if (byStaff) {
          out.push({
            to: patient,
            type: 'danger',
            title: 'Appointment cancelled by the clinic',
            body: `Your ${d.service} on ${d.when} was cancelled. Please book another time.`,
            link: '/services',
            actor,
          })
        } else {
          out.push(...forStaff(old.providerId, 'warning', 'Booking cancelled by patient', `${old.fullName} cancelled ${d.service} on ${d.when}.`, actor))
        }
      } else if (next.status === 'completed') {
        out.push({
          to: patient,
          type: 'success',
          title: 'Visit completed',
          body: `Thanks for visiting! Tell us how your ${d.service} went.`,
          link: `/feedback/${id}`,
          actor,
        })
      }
    }

    if (patch.feedback && !old.feedback) {
      out.push(...forStaff(old.providerId, 'info', 'New patient feedback', `${old.fullName} rated ${d.service} ${patch.feedback.rating}/5.`, actor))
    }
    if (out.length) notify(out)
  }

  return (
    <BookingContext.Provider
      value={{
        draft,
        updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
        resetDraft: () => setDraft(emptyDraft),
        appointments,
        createAppointment,
        updateAppointment,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider')
  return ctx
}
