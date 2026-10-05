import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

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

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Appointment[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(appointments))
  }, [appointments])

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
    return appt
  }

  return (
    <BookingContext.Provider
      value={{
        draft,
        updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
        resetDraft: () => setDraft(emptyDraft),
        appointments,
        createAppointment,
        updateAppointment: (id, patch) => setAppointments((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x))),
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
