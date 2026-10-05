import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, Clock } from 'lucide-react'
import { toast } from 'sonner'
import DentalBackdrop from '../components/DentalBackdrop'
import { BookingBar, Stepper } from '../components/Layouts'
import { PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useBooking } from '../context/BookingContext'
import { getService, services } from '../data/mock'

export default function Services() {
  const { user } = useAuth()
  const { draft, updateDraft } = useBooking()
  const navigate = useNavigate()
  const picked = getService(draft.serviceId)

  // Guests choose a service first; on Continue we ask them to log in or register.
  const handleContinue = () => {
    if (user) return navigate('/book/schedule')
    toast.info('Please log in or register to continue booking.', {
      description: picked ? `Your selection (${picked.name}) will be saved.` : undefined,
    })
    navigate('/login', { state: { from: '/book/schedule' } })
  }

  return (
    <div className="relative">
    <DentalBackdrop />
    <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-12">
      <Stepper current={0} />
      <PageHeader title="What can we help you with?" subtitle="Select a treatment. Prices are final, with no hidden fees." />
      <div className="grid gap-3 sm:grid-cols-2 md:gap-4" role="radiogroup" aria-label="Service">
        {services.map((s, i) => {
          const selected = draft.serviceId === s.id
          return (
            <motion.button
              key={s.id}
              role="radio"
              aria-checked={selected}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateDraft({ serviceId: s.id, providerId: '', time: '' })}
              className={`relative flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition hover:shadow-md ${
                selected ? 'border-primary bg-primary-soft shadow-md shadow-primary/10' : 'border-slate-200 bg-white hover:border-primary/40'
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm ring-1 ring-slate-100"><s.icon className="h-6 w-6" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-lg font-extrabold text-fresh-dark">${s.price}</span>
                </span>
                <span className="mt-0.5 block text-sm text-slate-500">{s.description}</span>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-premium ring-1 ring-slate-200"><Clock className="h-3 w-3" /> {s.duration} min</span>
              </span>
              {selected && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-sm text-white shadow"><Check className="h-4 w-4" strokeWidth={3} /></motion.span>
              )}
            </motion.button>
          )
        })}
      </div>

      <BookingBar
        disabled={!picked}
        onNext={handleContinue}
        hint={picked && <>{picked.name} · <b className="text-slate-900">${picked.price}</b>{!user && ' · log in or register next'}</>}
        nextLabel={picked ? `Continue · $${picked.price}` : 'Select a service'}
      />
    </div>
    </div>
  )
}
