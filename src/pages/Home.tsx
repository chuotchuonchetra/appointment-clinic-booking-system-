import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CalendarCheck, CircleCheck, Clock, Lock, Plus, ShieldCheck, Star } from 'lucide-react'
import { Button, FadeIn } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { providers, services } from '../data/mock'

const HERO_IMG = 'https://images.unsplash.com/photo-1667133295315-820bb6481730?auto=format&fit=crop&w=1000&q=80'
const CLINIC_IMG = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80'

const steps = [
  ['Choose a service', 'Pick the treatment you need.'],
  ['Pick date & time', 'See live availability per dentist.'],
  ['Confirm & pay', 'Pay online or at the clinic.'],
  ['Get reminders', 'Email and SMS confirmation.'],
]

const reviews = [
  { name: 'Sreymom K.', text: 'Booked in under two minutes and got a reminder the day before. Zero waiting at the clinic.', service: 'Teeth Cleaning' },
  { name: 'Dara P.', text: 'Clear prices upfront and a very gentle dentist. My whole family goes here now.', service: 'Dental Filling' },
  { name: 'Lina S.', text: 'Rescheduling was one tap. Much better than calling and being put on hold.', service: 'Braces Consultation' },
]

const faqs = [
  ['Can I cancel or reschedule?', 'Yes. You can change or cancel online up to 24 hours before your appointment, free of charge.'],
  ['Do I have to pay online?', 'No. You can pay by card, KHQR, or simply pay at the clinic after your visit.'],
  ['How will I know my booking is confirmed?', 'You receive an email and SMS right away, plus a reminder before your visit.'],
  ['Which dentist should I pick?', 'We only show dentists who offer your chosen treatment. If unsure, a General Check-up is a great start.'],
]

const initials = (n: string) => n.replace('Dr. ', '').split(' ').map((w) => w[0]).join('')

function Stars({ count = 5, className = 'h-4 w-4' }: { count?: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => <Star key={i} className={`${className} fill-current`} />)}
    </span>
  )
}

export default function Home() {
  const { updateDraft } = useBooking()
  const navigate = useNavigate()
  const [quick, setQuick] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [heroFailed, setHeroFailed] = useState(false)

  const quickBook = () => {
    updateDraft({ serviceId: quick, providerId: '', time: '' })
    navigate(quick ? '/book/schedule' : '/services')
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-soft via-white to-fresh-soft">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-fresh/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-fresh-dark shadow-sm ring-1 ring-fresh/20">
              <span className="h-2 w-2 animate-pulse rounded-full bg-fresh" /> Slots available this week
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-6xl">
              Healthy smiles,<br /><span className="text-primary">booked in minutes.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              Choose your treatment, pick a time that suits you and get instant confirmation. No phone calls, no waiting.
            </p>

            {/* Quick-book widget: book from the first screen */}
            <div className="mt-8 max-w-lg rounded-2xl bg-white p-3 shadow-xl shadow-primary/10 ring-1 ring-slate-200">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Quick booking</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={quick}
                  onChange={(e) => setQuick(e.target.value)}
                  aria-label="Select a service"
                  className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">What do you need?</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>)}
                </select>
                <Button onClick={quickBook} className="min-h-12 px-6">Find a time <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> <b className="text-slate-900">4.9</b> from 1,200+ patients</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary" /> Secure payment</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-fresh" /> Free cancellation</span>
            </div>
          </motion.div>

          {/* Hero photo */}
          <motion.div
            className="relative mx-auto w-full max-w-md"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="aspect-4/5 overflow-hidden rounded-4xl bg-linear-to-br from-primary to-premium shadow-2xl shadow-primary/25 ring-8 ring-white">
              {!heroFailed && (
                <img
                  src={HERO_IMG}
                  alt="Dentist showing a patient her treatment plan in a modern clinic"
                  className="h-full w-full object-cover"
                  loading="eager"
                  onError={() => setHeroFailed(true)}
                />
              )}
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -left-4 top-10 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl ring-1 ring-slate-100 md:-left-8">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-fresh-soft text-fresh-dark"><CalendarCheck className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs text-slate-400">Tomorrow · 10:30</span>
                <span className="flex items-center gap-1 text-sm font-semibold"><CircleCheck className="h-4 w-4 text-fresh" /> Confirmed</span>
              </span>
            </motion.div>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -right-3 bottom-10 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-100 md:-right-6">
              <p className="text-2xl font-extrabold text-primary">4.9</p>
              <Stars className="h-3.5 w-3.5" />
              <p className="mt-0.5 text-xs text-slate-500">Patient rating</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services with transparent pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <FadeIn className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Treatments & transparent prices</h2>
          <p className="mt-2 text-slate-500">No surprises. What you see is what you pay.</p>
        </FadeIn>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <FadeIn key={s.id} delay={i * 0.05}>
              <Link
                to="/services"
                onClick={() => updateDraft({ serviceId: s.id, providerId: '', time: '' })}
                className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary"><s.icon className="h-6 w-6" /></span>
                  <span className="rounded-full bg-fresh-soft px-3 py-1 text-sm font-bold text-fresh-dark">${s.price}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.description}</p>
                <p className="mt-4 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5 text-slate-400"><Clock className="h-4 w-4" /> {s.duration} min</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">Book <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-premium-soft">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <FadeIn><h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">How it works</h2></FadeIn>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d], i) => (
              <FadeIn key={t} delay={i * 0.08} className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-premium text-lg font-bold text-white shadow-md shadow-premium/30">{i + 1}</span>
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Dentists */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <FadeIn><h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">Meet our dentists</h2></FadeIn>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {providers.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.08}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center transition hover:shadow-lg">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-linear-to-br from-primary to-premium text-2xl font-bold text-white">{initials(p.name)}</div>
                <h3 className="mt-4 font-semibold">{p.name}</h3>
                <p className="text-sm font-medium text-fresh-dark">{p.specialty}</p>
                <p className="mt-2 text-xs text-slate-400">{p.serviceIds.length} treatments offered</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-slate-100/70">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <FadeIn><h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">Loved by our patients</h2></FadeIn>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((r, i) => (
              <FadeIn key={r.name} delay={i * 0.08}>
                <figure className="h-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <Stars />
                  <blockquote className="mt-3 text-slate-700">“{r.text}”</blockquote>
                  <figcaption className="mt-4 text-sm"><b>{r.name}</b> <span className="text-slate-400">· {r.service}</span></figcaption>
                </figure>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <FadeIn><h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2></FadeIn>
        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map(([q, a], i) => {
            const open = openFaq === i
            return (
              <div key={q}>
                <button
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : i)}
                >
                  {q}
                  <Plus className={`h-5 w-5 shrink-0 text-primary transition ${open ? 'rotate-45' : ''}`} />
                </button>
                {open && <p className="px-5 pb-4 text-sm text-slate-600">{a}</p>}
              </div>
            )
          })}
        </div>
      </section>

      {/* Final CTA over clinic photo */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-premium-dark">
          <img src={CLINIC_IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div className="absolute inset-0 bg-linear-to-r from-primary/90 to-premium/80" />
          <div className="relative p-10 text-center text-white md:p-16">
            <h2 className="text-3xl font-bold tracking-tight">Ready for a healthier smile?</h2>
            <p className="mx-auto mt-2 max-w-md text-blue-50">Book your visit now — it takes less than two minutes.</p>
            <Link to="/services" className="mt-6 inline-block">
              <Button className="bg-white px-8 text-primary shadow-lg hover:bg-blue-50">Book an appointment <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
