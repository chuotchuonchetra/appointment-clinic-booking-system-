import { Card, PageHeader } from '../../components/ui'
import { TIME_SLOTS, getService, providers, services } from '../../data/mock'

export default function ProvidersServices() {
  return (
    <>
      <PageHeader title="Providers & services" subtitle="Who works here and what we offer. Slots shown are the clinic's standard daily schedule." />

      <h2 className="mb-3 font-semibold text-premium">Dentists</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {providers.map((p) => (
          <Card key={p.id}>
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-fresh-dark">{p.specialty}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {p.serviceIds.map((id) => (
                <span key={id} className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary-dark">{getService(id)?.name}</span>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Mon–Sat · {TIME_SLOTS[0]}–16:30 · {TIME_SLOTS.length} slots/day
            </p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-semibold text-premium">Services</h2>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>{['Service', 'Duration', 'Price'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.icon} {s.name}</td>
                <td className="px-4 py-3">{s.duration} min</td>
                <td className="px-4 py-3 font-semibold text-fresh-dark">${s.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  )
}
