import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Stepper } from '../components/Layouts'
import Summary from '../components/Summary'
import { Button, Card, Field, PageHeader, TextArea } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'

export default function Details() {
  const { user } = useAuth()
  const { draft, updateDraft } = useBooking()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    updateDraft({
      fullName: draft.fullName || user?.name || '',
      email: draft.email || user?.email || '',
      phone: draft.phone || user?.phone || '',
    })
    // prefill once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!draft.serviceId || !draft.providerId || !draft.date || !draft.time) return <Navigate to="/services" replace />

  const values = { fullName: draft.fullName, email: draft.email, phone: draft.phone }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (values.fullName.trim().length < 2) errs.fullName = 'Please enter your full name.'
    if (!/^\+?[0-9\s-]{8,15}$/.test(values.phone)) errs.phone = 'Enter a valid phone number.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    updateDraft(values)
    navigate('/book/payment')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Stepper current={2} />
      <PageHeader title="Your details" subtitle="We'll send your confirmation here." />
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name" value={values.fullName} error={errors.fullName} onChange={(e) => updateDraft({ fullName: e.target.value })} />
            <Field label="Email" type="email" required value={values.email} onChange={(e) => updateDraft({ email: e.target.value })} />
            <Field label="Phone" type="tel" value={values.phone} error={errors.phone} onChange={(e) => updateDraft({ phone: e.target.value })} />
            <TextArea label="Notes for the dentist (optional)" value={draft.notes} onChange={(e) => updateDraft({ notes: e.target.value })} placeholder="Allergies, pain, preferences…" />
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/book/schedule')}>Back</Button>
              <Button type="submit" className="px-8">Continue to payment</Button>
            </div>
          </form>
        </Card>
        <Summary draft={draft} />
      </div>
    </div>
  )
}
