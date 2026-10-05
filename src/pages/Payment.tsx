import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { CreditCard, Hospital, Lock, QrCode, Smartphone, type LucideIcon } from 'lucide-react'
import { BookingBar, Stepper } from '../components/Layouts'
import Summary from '../components/Summary'
import { Alert, Card, Field, PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { getService } from '../data/mock'

type Method = 'card' | 'khqr' | 'clinic'

const methods: { id: Method; icon: LucideIcon; label: string; hint: string }[] = [
  { id: 'card', icon: CreditCard, label: 'Credit / Debit card', hint: 'Visa, Mastercard' },
  { id: 'khqr', icon: Smartphone, label: 'KHQR / Bank transfer', hint: 'Scan with your banking app' },
  { id: 'clinic', icon: Hospital, label: 'Pay at the clinic', hint: 'Pay after your visit' },
]

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

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
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <Stepper current={3} />
      <PageHeader title="Payment" subtitle="Choose how you would like to pay." />
      <form onSubmit={pay}>
        <div className="grid gap-6 md:grid-cols-[1fr_340px]">
          <Card className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <div className="space-y-2" role="radiogroup" aria-label="Payment method">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                    method === m.id ? 'border-primary bg-primary-soft' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input type="radio" name="method" checked={method === m.id} onChange={() => { setMethod(m.id); setError('') }} className="h-4 w-4 accent-primary" />
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-slate-100"><m.icon className="h-5 w-5" /></span>
                  <span>
                    <span className="block font-semibold">{m.label}</span>
                    <span className="text-sm text-slate-500">{m.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            {method === 'card' && (
              <div className="space-y-4 rounded-xl bg-slate-50 p-4">
                <Field label="Card number" inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
                  <Field label="CVC" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} />
                </div>
                <p className="flex items-center gap-1.5 text-xs text-slate-400"><Lock className="h-3.5 w-3.5 shrink-0" /> Encrypted. Demo: a card number ending in 0000 simulates a declined payment.</p>
              </div>
            )}
            {method === 'khqr' && (
              <div className="grid place-items-center rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                <div className="grid h-36 w-36 place-items-center rounded-xl bg-white text-slate-800 ring-1 ring-slate-200"><QrCode className="h-24 w-24" strokeWidth={1.5} /></div>
                <p className="mt-3">Scan the QR code in your banking app, then press "Confirm payment".</p>
              </div>
            )}
            {method === 'clinic' && <Alert type="info">Your slot is held. Please pay ${service.price} at reception after your visit.</Alert>}
          </Card>
          <Summary draft={draft} />
        </div>
        <BookingBar
          type="submit"
          variant="fresh"
          disabled={processing}
          onBack={() => navigate('/book/details')}
          nextLabel={processing ? 'Processing…' : method === 'clinic' ? 'Confirm booking' : method === 'khqr' ? 'Confirm payment' : `Pay $${service.price}`}
        />
      </form>
    </div>
  )
}
