import { useAuth } from '../../context/AuthContext'
import { useBooking, type Appointment } from '../../context/BookingContext'
import { getProvider } from '../../data/mock'

export const isActive = (a: Appointment) => a.status === 'pending' || a.status === 'confirmed'
export const startOf = (a: Appointment) => new Date(`${a.date}T${a.time}:00`).getTime()

/** The signed-in dentist, their provider profile and only their own appointments. */
export function useDoctor() {
  const { user } = useAuth()
  const { appointments, updateAppointment } = useBooking()
  const provider = getProvider(user?.providerId ?? '')
  const mine = appointments.filter((a) => a.providerId === user?.providerId)
  return { user, provider, mine, updateAppointment }
}
