import { Link } from 'react-router-dom'
import { Button } from '../components/ui'
import { providers, services } from '../data/mock'

const steps = [
  ['1', 'Choose a service', 'Pick the treatment you need.'],
  ['2', 'Pick date & time', 'See live availability per dentist.'],
  ['3', 'Confirm & pay', 'Secure payment or pay at the clinic.'],
  ['4', 'Get reminders', 'Email/SMS confirmation and reminders.'],
]

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-soft via-white to-fresh-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <span className="rounded-full bg-fresh-soft px-3 py-1 text-sm font-semibold text-fresh-dark">
              Now accepting online bookings
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
              Healthy smiles, <span className="text-primary">booked in minutes.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-slate-600">
              Choose your treatment, pick a time that suits you and get instant confirmation. No phone calls, no waiting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services"><Button className="px-6 py-3 text-base">Book an appointment</Button></Link>
              <Link to="/services"><Button variant="outline" className="px-6 py-3 text-base">View services</Button></Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['6+', 'Treatments', 'text-primary'],
              ['3', 'Specialist dentists', 'text-fresh'],
              ['24/7', 'Online booking', 'text-premium'],
              ['4.9★', 'Patient rating', 'text-primary'],
            ].map(([n, l, c]) => (
              <div key={l} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
                <p className={`text-3xl font-extrabold ${c}`}>{n}</p>
                <p className="mt-1 text-sm text-slate-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-premium">Our services</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.id}
              to="/services"
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-premium-soft">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-3xl font-bold text-premium">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([n, t, d]) => (
              <div key={n} className="text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-premium text-lg font-bold text-white">{n}</span>
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-premium">Meet our dentists</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {providers.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-3xl">👩‍⚕️</div>
              <h3 className="mt-4 font-semibold">{p.name}</h3>
              <p className="text-sm text-fresh-dark">{p.specialty}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
