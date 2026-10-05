import { useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button, Card, PageHeader, TextArea } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { getProvider, getService } from '../data/mock'

export default function Feedback() {
  const { id } = useParams()
  const { user } = useAuth()
  const { appointments, updateAppointment } = useBooking()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  const appt = appointments.find((a) => a.id === id && a.userEmail === user?.email)
  if (!appt) return <Navigate to="/my-appointments" replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    updateAppointment(appt.id, { feedback: { rating, comment } })
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Card>
        {sent ? (
          <div className="text-center">
            <div className="text-5xl">💚</div>
            <h1 className="mt-3 text-2xl font-bold text-premium">Thank you!</h1>
            <p className="mt-2 text-slate-500">Your feedback helps us improve.</p>
            <Link to="/my-appointments" className="mt-6 inline-block"><Button>Back to my appointments</Button></Link>
          </div>
        ) : (
          <>
            <PageHeader title="How was your visit?" subtitle={`${getService(appt.serviceId)?.name} with ${getProvider(appt.providerId)?.name}`} />
            <form onSubmit={submit} className="space-y-4">
              <div className="flex gap-1 text-4xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setRating(n)} className={n <= rating ? 'text-amber-400' : 'text-slate-300'}>★</button>
                ))}
              </div>
              <TextArea label="Comments (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
              <Button type="submit" variant="fresh" disabled={!rating} className="w-full">Submit feedback</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
