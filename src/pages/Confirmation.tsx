import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Stepper } from '../components/Layouts'
import { Alert, Button, Card } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { formatDate, getProvider, getService } from '../data/mock'

export default function Confirmation() {
  const { id } = useParams()
  const { appointments, resetDraft } = useBooking()
  const appt = appointments.find((a) => a.id === id)

  useEffect(() => resetDraft(), []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!appt) return <Navigate to="/my-appointments" replace />
  const s = getService(appt.serviceId)
  const p = getProvider(appt.providerId)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Stepper current={5} />
      <Card className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-fresh text-3xl text-white">✓</div>
        <h1 className="mt-4 text-3xl font-bold text-premium">Booking received!</h1>
        <p className="mt-2 text-slate-500">
          Reference <span className="font-mono font-semibold text-slate-800">{appt.id}</span>
        </p>

        <dl className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          {[
            ['Service', s?.name],
            ['Dentist', p?.name],
            ['Date', formatDate(appt.date)],
            ['Time', appt.time],
            ['Payment', appt.paid ? `Paid $${appt.amount}` : `Pay $${appt.amount} at clinic`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 text-left">
          <Alert type="success">
            Confirmation sent by email to {appt.email} and SMS to {appt.phone}. The clinic will approve your appointment shortly.
          </Alert>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/my-appointments"><Button>View my appointments</Button></Link>
          <Link to="/"><Button variant="outline">Back to home</Button></Link>
        </div>
      </Card>
    </div>
  )
}
