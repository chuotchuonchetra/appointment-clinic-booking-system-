import { CalendarDays, Clock, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { Card } from './ui'
import type { Draft } from '../context/BookingContext'
import { formatDate, getProvider, getService } from '../data/mock'

export default function Summary({ draft }: { draft: Draft }) {
  const s = getService(draft.serviceId)
  const p = getProvider(draft.providerId)
  if (!s || !p) return null
  const rows = [
    [Stethoscope, 'Service', s.name],
    [UserRound, 'Dentist', p.name],
    [CalendarDays, 'Date', formatDate(draft.date)],
    [Clock, 'Time', `${draft.time} · ${s.duration} min`],
  ] as const
  return (
    <Card className="h-fit bg-linear-to-b from-white to-primary-soft/40 md:sticky md:top-24">
      <h3 className="font-bold text-slate-900">Booking summary</h3>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map(([Icon, k, v]) => (
          <div key={k} className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm text-primary ring-1 ring-slate-100"><Icon className="h-4 w-4" /></span>
            <div>
              <dt className="text-xs text-slate-400">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-center justify-between border-t border-dashed border-slate-300 pt-4">
        <span className="font-medium text-slate-600">Total</span>
        <span className="text-2xl font-extrabold text-fresh-dark">${s.price}</span>
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-fresh" /> Free cancellation up to 24h before</p>
    </Card>
  )
}
