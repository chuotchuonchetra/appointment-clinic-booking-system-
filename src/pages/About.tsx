import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Award, Clock, Eye, GraduationCap, HeartHandshake, Leaf, MapPin, Phone, ShieldCheck, Smile, Sparkles, Target, Users } from 'lucide-react'
import DentalBackdrop from '../components/DentalBackdrop'
import { Button, FadeIn } from '../components/ui'
import { CLINIC, getService, providers } from '../data/mock'

const CLINIC_IMG = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'

const stats = [
  { value: '2014', label: 'Founded', icon: Award },
  { value: '1,200+', label: 'Patients cared for', icon: Users },
  { value: '3', label: 'Specialist dentists', icon: GraduationCap },
  { value: '4.9★', label: 'Patient rating', icon: Smile },
]

const values = [
  { icon: HeartHandshake, title: 'Compassion', text: 'We listen first. Every treatment plan is explained clearly, with no pressure and no jargon.' },
  { icon: ShieldCheck, title: 'Safety', text: 'Hospital-grade sterilisation, single-use tools and low-radiation digital X-rays as standard.' },
  { icon: Sparkles, title: 'Excellence', text: 'Our dentists train every year on the latest techniques so you get modern, lasting results.' },
  { icon: Leaf, title: 'Honesty', text: 'Fixed, transparent prices online. We only recommend the treatment you actually need.' },
]

const milestones = [
  { year: '2014', title: 'A small clinic opens', text: 'Dr. Sophea Chan opens a two-chair practice on Street 271 with one goal: gentle care for every family.' },
  { year: '2017', title: 'Orthodontics added', text: 'Dr. Vannak Sok joins the team, bringing braces and smile-alignment treatment in-house.' },
  { year: '2020', title: 'Digital upgrade', text: 'Digital X-rays, intra-oral cameras and a fully renovated, calming patient lounge.' },
  { year: '2023', title: 'Specialist root canal care', text: 'Dr. Mealea Kim joins as our endodontist, so complex treatments no longer need a referral.' },
  { year: 'Today', title: 'Book online in minutes', text: 'Patients book, pay and get reminders online, with no phone calls and no waiting.' },
]

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-soft via-white to-fresh-soft">
        <DentalBackdrop />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/15">
              <Smile className="h-4 w-4" /> About SmileCare
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl">
              Caring for Phnom Penh's smiles <span className="text-primary">since 2014.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              We're a family-run dental clinic that believes a visit to the dentist should feel calm, clear and kind. Modern
              treatment, honest prices and a team that genuinely cares.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services"><Button className="px-6">Book a visit <ArrowRight className="h-4 w-4" /></Button></Link>
              <a href="#team"><Button variant="outline" className="px-6">Meet the team</Button></a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative mx-auto w-full max-w-md">
            <div className="aspect-4/3 overflow-hidden rounded-4xl bg-linear-to-br from-primary to-premium shadow-2xl shadow-primary/25 ring-8 ring-white">
              <img src={CLINIC_IMG} alt="Bright, modern treatment room at SmileCare" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl ring-1 ring-slate-100 md:-left-8">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-fresh-soft text-fresh-dark"><ShieldCheck className="h-5 w-5" /></span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">Licensed & certified</span>
                <span className="text-xs text-slate-500">Ministry of Health, Cambodia</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <s.icon className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Mission & vision */}
      <div className="relative overflow-hidden">
        <DentalBackdrop />
        <section className="relative mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2">
          <FadeIn>
            <div className="h-full rounded-3xl bg-linear-to-br from-primary to-blue-700 p-8 text-white shadow-lg shadow-primary/20">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Target className="h-6 w-6" /></span>
              <h2 className="mt-5 text-2xl font-bold">Our mission</h2>
              <p className="mt-2 leading-relaxed text-blue-50">
                To make excellent dental care easy to reach for every family. That means clear prices, online booking and a team
                that treats each patient the way we'd treat our own.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="h-full rounded-3xl bg-linear-to-br from-premium to-teal-800 p-8 text-white shadow-lg shadow-premium/20">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Eye className="h-6 w-6" /></span>
              <h2 className="mt-5 text-2xl font-bold">Our vision</h2>
              <p className="mt-2 leading-relaxed text-teal-50">
                A community where nobody puts off the dentist out of fear or cost, and where healthy smiles start early and
                last a lifetime.
              </p>
            </div>
          </FadeIn>
        </section>
      </div>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">What we stand for</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Our values</h2>
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.06}>
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{v.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Story timeline */}
      <section className="bg-premium-soft">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
          <FadeIn className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-premium">Our story</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">From two chairs to your favourite clinic</h2>
          </FadeIn>
          <ol className="relative mt-12 space-y-8 border-l-2 border-premium/20 pl-8 md:mx-auto md:max-w-2xl">
            {milestones.map((m, i) => (
              <li key={m.year} className="relative">
                <FadeIn delay={i * 0.06}>
                  <span className="absolute -left-[41px] top-1 grid h-5 w-5 place-items-center rounded-full bg-premium ring-4 ring-premium-soft">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-premium ring-1 ring-premium/20">{m.year}</span>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{m.title}</h3>
                  <p className="mt-1 text-slate-600">{m.text}</p>
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Team */}
      <div id="team" className="relative scroll-mt-20 overflow-hidden">
        <DentalBackdrop />
        <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">The team</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Dentists you can trust</h2>
            <p className="mt-2 text-slate-500">Experienced specialists who take the time to explain, and to get it right.</p>
          </FadeIn>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {providers.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.08}>
                <div className="group h-full overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:shadow-xl hover:shadow-primary/10">
                  <div className="aspect-square overflow-hidden bg-linear-to-br from-primary to-premium">
                    <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                    <p className="text-sm font-medium text-fresh-dark">{p.specialty}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.serviceIds.map((id) => (
                        <span key={id} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary-dark">{getService(id)?.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      </div>

      {/* Visit */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-premium p-8 text-white md:p-12">
            <Smile className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-white/10" strokeWidth={1} />
            <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Come and say hello</h2>
                <p className="mt-2 max-w-md">New patients are always welcome. Book online in under two minutes, or just give us a call.</p>
                <Link to="/services" className="mt-6 inline-block">
                  <Button className="bg-primary px-8 text-white shadow-lg hover:bg-blue-50">Book an appointment <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><MapPin className="h-5 w-5 shrink-0" /> <a href={CLINIC.mapsUrl} target="_blank" rel="noreferrer" className="hover:underline">{CLINIC.address}</a></li>
                <li className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><Clock className="h-5 w-5 shrink-0" /> Mon – Sat · 09:00 – 17:00 · Sunday closed</li>
                <li className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"><Phone className="h-5 w-5 shrink-0" /> <a href="tel:+85512345678" className="hover:underline">+855 12 345 678</a></li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  )
}
