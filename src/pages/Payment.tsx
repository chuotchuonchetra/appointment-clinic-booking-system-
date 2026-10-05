import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Stepper } from '../components/Layouts'
import Summary from '../components/Summary'
import { Alert, Button, Card, Field, PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { getService } from '../data/mock'

type Method = 'card' | 'khqr' | 'clinic'

const methods: { id: Method; label: string; hint: string }[] = [
  { id: 'card', label: 'Credit / Debit card', hint: 'Visa, Mastercard' },
  { id: 'khqr', label: 'KHQR / Bank transfer', hint: 'Scan with your banking app' },
  { id: 'clinic', label: 'Pay at the clinic', hint: 'Pay after your visit' },
]

export default function Payment() {
  const { user } = useAuth()
  const { draft, createAppointment } = useBooking()
  const navigate = useNavigate()
  const [method, setMethod] = useState<Method>('card')
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const service = getService(draft.serviceId)
  if (!service || !draft.providerId || !draft.date || !draft.time || !draft.fullName) return <Navigate to="/services" replace />

  const pay = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (method === 'card' && card.number.replace(/\s/g, '').length < 13) return setError('Enter a valid card number.')
    setProcessing(true)
    // Simulated payment gateway. Demo: a card number ending in 0000 is declined.
    setTimeout(() => {
      setProcessing(false)
      if (method === 'card' && card.number.replace(/\s/g, '').endsWith('0000')) {
        return setError('Payment failed: your card was declined. Please try another card or payment method.')
      }
      const appt = createAppointment(user!.email, method, service.price)
      navigate(`/book/confirmation/${appt.id}`, { replace: true })
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Stepper current={3} />
      <PageHeader title="Payment" subtitle="Choose how you would like to pay." />
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card>
          <form onSubmit={pay} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <div className="space-y-2">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                    method === m.id ? 'border-primary bg-primary-soft' : 'border-slate-200'
                  }`}
                >
                  <input type="radio" name="method" checked={method === m.id} onChange={() => { setMethod(m.id); setError('') }} className="accent-primary" />
                  <span>
                    <span className="block font-medium">{m.label}</span>
                    <span className="text-sm text-slate-500">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            {method === 'card' && (
              <div className="space-y-4">
                <Field label="Card number" inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                  <Field label="CVC" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
                </div>
                <p className="text-xs text-slate-400">Demo: use any number; one ending in 0000 simulates a declined payment.</p>
              </div>
            )}
            {method === 'khqr' && (
              <div className="grid place-items-center rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                <div className="grid h-32 w-32 place-items-center rounded-lg bg-white text-5xl ring-1 ring-slate-200">▦</div>
                <p className="mt-3">Scan the QR code, then press "Confirm payment".</p>
              </div>
            )}
            {method === 'clinic' && <Alert type="info">Your slot is held. Please pay ${service.price} at reception after your visit.</Alert>}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/book/details')}>Back</Button>
              <Button type="submit" variant="fresh" disabled={processing} className="px-8">
                {processing ? 'Processing…' : method === 'clinic' ? 'Confirm booking' : method === 'khqr' ? 'Confirm payment' : `Pay $${service.price}`}
              </Button>
            </div>
          </form>
        </Card>
        <Summary draft={draft} />
      </div>
    </div>
  )
}
