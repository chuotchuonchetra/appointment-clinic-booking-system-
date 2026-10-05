import { useNavigate } from 'react-router-dom'
import { Stepper } from '../components/Layouts'
import { Button, PageHeader } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { services } from '../data/mock'

export default function Services() {
  const { draft, updateDraft } = useBooking()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Stepper current={0} />
      <PageHeader title="Select a service" subtitle="What would you like to book today?" />
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => {
          const selected = draft.serviceId === s.id
          return (
            <button
              key={s.id}
              onClick={() => updateDraft({ serviceId: s.id, providerId: '', time: '' })}
              className={`rounded-2xl border-2 bg-white p-5 text-left transition hover:shadow-md ${
                selected ? 'border-primary bg-primary-soft' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-lg font-bold text-fresh-dark">${s.price}</span>
              </div>
              <h3 className="mt-2 font-semibold">{s.name}</h3>
              <p className="text-sm text-slate-500">{s.description}</p>
              <p className="mt-2 text-xs font-medium text-premium">⏱ {s.duration} minutes</p>
            </button>
          )
        })}
      </div>
      <div className="mt-8 flex justify-end">
        <Button disabled={!draft.serviceId} onClick={() => navigate('/book/schedule')} className="px-8">
          Continue
        </Button>
      </div>
    </div>
  )
}
