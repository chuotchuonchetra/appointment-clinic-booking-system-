import { Card } from './ui'
import type { Draft } from '../context/BookingContext'
import { formatDate, getProvider, getService } from '../data/mock'

export default function Summary({ draft }: { draft: Draft }) {
  const s = getService(draft.serviceId)
  const p = getProvider(draft.providerId)
  if (!s || !p) return null
  const rows = [
    ['Service', s.name],
    ['Dentist', p.name],
    ['Date', formatDate(draft.date)],
    ['Time', draft.time],
    ['Duration', `${s.duration} min`],
  ]
  return (
    <Card className="h-fit">
      <h3 className="font-semibold text-premium">Booking summary</h3>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 font-bold">
        <span>Total</span>
        <span className="text-fresh-dark">${s.price}</span>
      </div>
    </Card>
  )
}
