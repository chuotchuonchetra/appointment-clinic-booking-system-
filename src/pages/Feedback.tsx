import { useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Heart, Star } from 'lucide-react'
import { Button, Card, PageHeader, TextArea } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { getProvider, getService } from '../data/mock'

const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

export default function Feedback() {
  const { id } = useParams()
  const { user } = useAuth()
  const { appointments, updateAppointment } = useBooking()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  const appt = appointments.find((a) => a.id === id && a.userEmail === user?.email)
  if (!appt) return <Navigate to="/my-appointments" replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    updateAppointment(appt.id, { feedback: { rating, comment } })
    setSent(true)
  }
  const shown = hover || rating

  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:py-12">
      <Card className="p-6 md:p-8">
        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <Heart className="mx-auto h-14 w-14 fill-fresh text-fresh" />
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Thank you!</h1>
            <p className="mt-2 text-slate-500">Your feedback helps us improve.</p>
            <Link to="/my-appointments" className="mt-6 inline-block"><Button>Back to my appointments</Button></Link>
          </motion.div>
        ) : (
          <>
            <PageHeader title="How was your visit?" subtitle={`${getService(appt.serviceId)?.name} with ${getProvider(appt.providerId)?.name}`} />
            <form onSubmit={submit} className="space-y-5">
              <div>
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <motion.button
                      key={n}
                      type="button"
                      whileTap={{ scale: 0.85 }}
                      aria-label={`${n} stars`}
                      onMouseEnter={() => setHover(n)}
                      onClick={() => setRating(n)}
                      className={`p-1 transition ${n <= shown ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                      <Star className="h-10 w-10 fill-current" />
                    </motion.button>
                  ))}
                </div>
                <p className="mt-1 h-5 text-sm font-medium text-slate-500">{labels[shown]}</p>
              </div>
              <TextArea label="Comments (optional)" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like? What could be better?" />
              <Button type="submit" variant="fresh" disabled={!rating} className="w-full">Submit feedback</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
