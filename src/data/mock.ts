export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  icon: string
}

export interface Provider {
  id: string
  name: string
  specialty: string
  serviceIds: string[]
}

export const services: Service[] = [
  { id: 'checkup', name: 'General Check-up', description: 'Routine exam, X-rays and oral health advice.', duration: 30, price: 40, icon: '🦷' },
  { id: 'cleaning', name: 'Teeth Cleaning', description: 'Professional scaling and polishing.', duration: 45, price: 60, icon: '✨' },
  { id: 'whitening', name: 'Teeth Whitening', description: 'Safe in-clinic whitening for a brighter smile.', duration: 60, price: 150, icon: '😁' },
  { id: 'filling', name: 'Dental Filling', description: 'Repair cavities with tooth-coloured material.', duration: 45, price: 90, icon: '🛠️' },
  { id: 'braces', name: 'Braces Consultation', description: 'Orthodontic assessment and treatment plan.', duration: 40, price: 70, icon: '😬' },
  { id: 'rootcanal', name: 'Root Canal', description: 'Pain-relieving treatment for infected teeth.', duration: 90, price: 300, icon: '💉' },
]

export const providers: Provider[] = [
  { id: 'p1', name: 'Dr. Sophea Chan', specialty: 'General Dentist', serviceIds: ['checkup', 'cleaning', 'filling'] },
  { id: 'p2', name: 'Dr. Vannak Sok', specialty: 'Orthodontist', serviceIds: ['braces', 'checkup', 'whitening'] },
  { id: 'p3', name: 'Dr. Mealea Kim', specialty: 'Endodontist', serviceIds: ['rootcanal', 'filling', 'checkup'] },
]

export const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00']

export const getService = (id: string) => services.find((s) => s.id === id)
export const getProvider = (id: string) => providers.find((p) => p.id === id)

export const toISO = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

/** Deterministic pseudo-random so some slots always look "taken" for a given provider/date. */
export function isSlotTaken(providerId: string, date: string, time: string, booked: { providerId: string; date: string; time: string }[]) {
  if (booked.some((b) => b.providerId === providerId && b.date === date && b.time === time)) return true
  let h = 0
  const key = providerId + date + time
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h % 4 === 0
}

export const isSunday = (iso: string) => new Date(iso + 'T00:00:00').getDay() === 0
