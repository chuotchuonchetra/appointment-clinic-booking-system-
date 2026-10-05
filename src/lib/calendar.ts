import type { Appointment } from '../context/BookingContext'
import { CLINIC, addMinutes, getProvider, getService } from '../data/mock'

/** Appointment start/end as real instants. The clinic runs on Phnom Penh time (GMT+7). */
function span(a: Appointment) {
  const minutes = getService(a.serviceId)?.duration ?? 30
  const start = new Date(`${a.date}T${a.time}:00+07:00`)
  const end = new Date(`${a.date}T${addMinutes(a.time, minutes)}:00+07:00`)
  return { start, end }
}

/** 20261029T080000Z */
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function details(a: Appointment) {
  const s = getService(a.serviceId)
  return {
    title: `${s?.name ?? 'Dental appointment'} at ${CLINIC.name}`,
    description: `Dentist: ${getProvider(a.providerId)?.name}. Reference ${a.id}. Please arrive 10 minutes early and bring your ID.`,
  }
}

export function googleCalendarUrl(a: Appointment) {
  const { start, end } = span(a)
  const d = details(a)
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: d.title,
    dates: `${utc(start)}/${utc(end)}`,
    details: d.description,
    location: `${CLINIC.name}, ${CLINIC.address}`,
    ctz: 'Asia/Phnom_Penh',
  })
  return `https://calendar.google.com/calendar/render?${q}`
}

export function outlookCalendarUrl(a: Appointment) {
  const { start, end } = span(a)
  const d = details(a)
  const q = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: d.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: d.description,
    location: `${CLINIC.name}, ${CLINIC.address}`,
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${q}`
}

const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

/** Downloads an .ics file (opens in Apple Calendar, Outlook and most other calendar apps). */
export function downloadIcs(a: Appointment) {
  const { start, end } = span(a)
  const d = details(a)
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SmileCare//Booking//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${a.id}@smilecare`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`,
    `SUMMARY:${esc(d.title)}`, `DESCRIPTION:${esc(d.description)}`, `LOCATION:${esc(`${CLINIC.name}, ${CLINIC.address}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${a.id}.ics`
  link.click()
  URL.revokeObjectURL(url)
}
