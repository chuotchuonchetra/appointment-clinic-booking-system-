import { Navigate, useNavigate } from 'react-router-dom'
import { Stepper } from '../components/Layouts'
import SlotPicker from '../components/SlotPicker'
import { Button, Card, PageHeader } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { getService, providers } from '../data/mock'

export default function Schedule() {
  const { draft, updateDraft } = useBooking()
  const navigate = useNavigate()
  const service = getService(draft.serviceId)
  if (!service) return <Navigate to="/services" replace />

  const available = providers.filter((p) => p.serviceIds.includes(service.id))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Stepper current={1} />
      <PageHeader title="Pick a date & time" subtitle={`${service.icon} ${service.name} · ${service.duration} min · $${service.price}`} />

      <Card className="mb-6">
        <p className="mb-3 text-sm font-medium text-slate-700">Choose your dentist</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {available.map((p) => (
            <button
              key={p.id}
              onClick={() => updateDraft({ providerId: p.id, time: '' })}
              className={`rounded-xl border-2 p-4 text-left transition ${
                draft.providerId === p.id ? 'border-premium bg-premium-soft' : 'border-slate-200 hover:border-premium'
              }`}
            >
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-slate-500">{p.specialty}</p>
            </button>
          ))}
        </div>
      </Card>

      {draft.providerId && (
        <Card>
          <SlotPicker
            providerId={draft.providerId}
            date={draft.date}
            time={draft.time}
            onDate={(date) => updateDraft({ date })}
            onTime={(time) => updateDraft({ time })}
          />
        </Card>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={() => navigate('/services')}>Back</Button>
        <Button disabled={!draft.providerId || !draft.date || !draft.time} onClick={() => navigate('/book/details')} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
