import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BookingBar, Stepper } from '../components/Layouts'
import Summary from '../components/Summary'
import { Card, Field, PageHeader, TextArea } from '../components/ui'
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
    if (!/^\+?[0-9\s-]{8,15}$/.test(values.phone)) errs.phone = 'Enter a valid phone number, e.g. +855 12 345 678.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    updateDraft(values)
    navigate('/book/payment')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <Stepper current={2} />
      <PageHeader title="Your details" subtitle="We only ask what we need. Your confirmation is sent here." />
      <form onSubmit={submit}>
        <div className="grid gap-6 md:grid-cols-[1fr_340px]">
          <Card className="space-y-4">
            <Field label="Full name" autoComplete="name" value={values.fullName} error={errors.fullName} onChange={(e) => updateDraft({ fullName: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" type="email" autoComplete="email" required value={values.email} onChange={(e) => updateDraft({ email: e.target.value })} />
              <Field label="Phone" type="tel" autoComplete="tel" value={values.phone} error={errors.phone} hint="For SMS reminders" onChange={(e) => updateDraft({ phone: e.target.value })} />
            </div>
            <TextArea label="Anything the dentist should know? (optional)" value={draft.notes} onChange={(e) => updateDraft({ notes: e.target.value })} placeholder="Allergies, pain, preferences…" />
          </Card>
          <Summary draft={draft} />
        </div>
        <BookingBar type="submit" onBack={() => navigate('/book/schedule')} nextLabel="Continue to payment" />
      </form>
    </div>
  )
}
