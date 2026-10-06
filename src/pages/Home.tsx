import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Award, Baby, CalendarCheck, CircleCheck, Clock, CreditCard, Droplets, HeartHandshake, Lock, MapPin, Microscope, Phone, Plus, ShieldCheck, Smile, Sparkles, Star, Toothbrush, Users, Utensils } from 'lucide-react'
import DentalBackdrop from '../components/DentalBackdrop'
import { Button, FadeIn } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { CLINIC, providers, services } from '../data/mock'

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

const stats = [
  { value: '12+', label: 'Years of care', icon: Award },
  { value: '1,200+', label: 'Happy patients', icon: Users },
  { value: '4.9', label: 'Average rating', icon: Star },
  { value: '98%', label: 'On-time visits', icon: Clock },
]

const features = [
  { icon: HeartHandshake, title: 'Gentle, pain-aware care', text: 'We explain every step and use modern numbing techniques, so even nervous patients feel at ease.' },
  { icon: Microscope, title: 'Modern equipment', text: 'Digital X-rays with low radiation, intra-oral cameras and sterilised single-use tools.' },
  { icon: CreditCard, title: 'Clear, fixed prices', text: 'The price you see online is the price you pay. Card, KHQR or cash at the clinic.' },
  { icon: CalendarCheck, title: 'Book 24/7 online', text: 'Live availability for every dentist. Reschedule or cancel free up to 24 hours before.' },
  { icon: Baby, title: 'Family friendly', text: 'Care for kids, adults and seniors under one roof, with a calm, child-friendly waiting area.' },
  { icon: ShieldCheck, title: 'Strict hygiene', text: 'Hospital-grade sterilisation and full disinfection between every single patient.' },
]

const tips = [
  { icon: Toothbrush, title: 'Brush twice, 2 minutes', text: 'Use a soft brush and fluoride toothpaste, morning and night. Replace your brush every 3 months.' },
  { icon: Sparkles, title: 'Floss once a day', text: 'Floss or interdental brushes reach the 40% of tooth surfaces a toothbrush misses.' },
  { icon: Utensils, title: 'Watch the sugar', text: 'Limit sweet drinks and snacks between meals; they feed the bacteria that cause cavities.' },
  { icon: Droplets, title: 'Drink more water', text: 'Water rinses away food and keeps saliva flowing, your mouth’s natural defence.' },
]

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

      {/* Stats strip */}
      <section className="relative z-10 mx-auto -mt-8 max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-slate-200 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 md:grid-cols-4">
          {stats.map((st, i) => (
            <FadeIn key={st.label} delay={i * 0.06} className="flex items-center gap-3 bg-white p-5 md:p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><st.icon className="h-5 w-5" /></span>
              <span>
                <span className="block text-2xl font-extrabold tracking-tight text-slate-900">{st.value}</span>
                <span className="text-sm text-slate-500">{st.label}</span>
              </span>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Services with transparent pricing */}
      <div className="relative overflow-hidden">
      <DentalBackdrop />
      <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
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

      </div>

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

      {/* Why choose us */}
      <div className="relative overflow-hidden">
        <DentalBackdrop />
        <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Why SmileCare</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Dental care that puts you first</h2>
            <p className="mt-2 text-slate-500">Everything we do is designed to make your visit comfortable, quick and worry-free.</p>
          </FadeIn>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.05}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white/90 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary to-premium text-white shadow-md shadow-primary/20 transition group-hover:scale-110">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      </div>

      {/* Dentists */}
      <section className="bg-linear-to-b from-white to-primary-soft/60">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <FadeIn className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our team</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Meet our dentists</h2>
            </div>
            <Link to="/about" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">More about us <ArrowRight className="h-4 w-4" /></Link>
          </FadeIn>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {providers.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-primary to-premium">
                    <span className="absolute inset-0 grid place-items-center text-4xl font-bold text-white/80">{initials(p.name)}</span>
                    <img src={p.photo} alt={p.name} loading="lazy" className="relative h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-fresh-dark backdrop-blur">{p.specialty}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.serviceIds.map((id) => (
                        <span key={id} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary-dark">{services.find((x) => x.id === id)?.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
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

      {/* Care tips */}
      <div className="relative overflow-hidden">
        <DentalBackdrop />
        <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-5">
            <FadeIn className="lg:col-span-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Smile tips</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Simple habits for a healthy smile</h2>
              <p className="mt-3 text-slate-500">Good oral health starts at home. Pair these daily habits with a check-up and cleaning every six months.</p>
              <Link to="/services" className="mt-6 inline-block"><Button variant="outline">Book a check-up <ArrowRight className="h-4 w-4" /></Button></Link>
            </FadeIn>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
              {tips.map((t, i) => (
                <FadeIn key={t.title} delay={i * 0.06}>
                  <div className="flex h-full gap-4 rounded-2xl border border-slate-200 bg-white/90 p-5 backdrop-blur">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fresh-soft text-fresh-dark"><t.icon className="h-5 w-5" /></span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{t.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{t.text}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Visit us */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <FadeIn>
          <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white md:grid-cols-3">
            <div className="flex gap-4 p-6 md:border-r md:border-slate-200">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Clock className="h-5 w-5" /></span>
              <div>
                <h3 className="font-semibold text-slate-900">Opening hours</h3>
                <p className="mt-1 text-sm text-slate-500">Mon – Sat · 09:00 – 17:00</p>
                <p className="text-sm text-slate-500">Sunday · Closed</p>
              </div>
            </div>
            <div className="flex gap-4 border-t border-slate-200 p-6 md:border-r md:border-t-0">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fresh-soft text-fresh-dark"><MapPin className="h-5 w-5" /></span>
              <div>
                <h3 className="font-semibold text-slate-900">Find us</h3>
                <p className="mt-1 text-sm text-slate-500">{CLINIC.address}</p>
                <a href={CLINIC.mapsUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">Open in Google Maps</a>
              </div>
            </div>
            <div className="flex gap-4 border-t border-slate-200 p-6 md:border-t-0">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-premium-soft text-premium"><Phone className="h-5 w-5" /></span>
              <div>
                <h3 className="font-semibold text-slate-900">Call or email</h3>
                <a href="tel:+85512345678" className="mt-1 block text-sm text-slate-500 hover:text-primary">+855 12 345 678</a>
                <a href="mailto:hello@smilecare.com" className="block text-sm text-slate-500 hover:text-primary">hello@smilecare.com</a>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FAQ */}
      <div className="relative overflow-hidden">
      <DentalBackdrop />
      <section className="relative mx-auto max-w-3xl px-4 py-16 md:py-20">
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

      </div>

      {/* Final CTA over clinic photo */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-premium-dark">
          <img src={CLINIC_IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div className="absolute inset-0 bg-linear-to-r from-primary/90 to-premium/80" />
          <div className="relative p-10 text-center text-white md:p-16">
            <Smile className="mx-auto mb-3 h-10 w-10 text-white/80" />
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
