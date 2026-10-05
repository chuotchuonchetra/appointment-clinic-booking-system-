import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, CircleCheck, Users } from 'lucide-react'
import DentalBackdrop from '../components/DentalBackdrop'
import { BookingBar, Stepper } from '../components/Layouts'
import { DateStrip, TIMEZONE_NOTE, TimeGrid, useSlots } from '../components/SlotPicker'
import { PageHeader } from '../components/ui'
import { useBooking } from '../context/BookingContext'
import { addMinutes, getProvider, getService, isSlotTaken, providers, type Provider } from '../data/mock'
import { arrowNav } from '../lib/arrowNav'

const initials = (n: string) => n.replace('Dr. ', '').split(' ').map((w) => w[0]).join('')

const shortDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

/** Numbered panel heading: "Step 1: Your Dentist". */
function Panel({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg shadow-slate-200/50 md:p-7">
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{n}</span>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Step {n}: {title}</h2>
          {hint && <p className="text-sm text-slate-600">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

function Portrait({ p, selected }: { p: Provider; selected: boolean }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="relative block aspect-4/5 w-full overflow-hidden rounded-xl bg-primary ring-1 ring-slate-200">
      {failed ? (
        <span className="grid h-full w-full place-items-center text-4xl font-bold text-white">{initials(p.name)}</span>
      ) : (
        <img src={p.photo} alt={`Portrait of ${p.name}`} loading="lazy" className="h-full w-full object-cover object-top" onError={() => setFailed(true)} />
      )}
      {selected && (
        <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
    </span>
  )
}

const cardCls = (selected: boolean) =>
  `w-36 shrink-0 snap-start rounded-2xl border-2 p-2 text-left transition sm:w-auto ${
    selected ? 'border-primary bg-primary-soft' : 'border-slate-200 bg-white hover:border-primary/50'
  }`

export default function Schedule() {
  const { draft, updateDraft } = useBooking()
  const navigate = useNavigate()
  const service = getService(draft.serviceId)
  const available = useMemo(() => (service ? providers.filter((p) => p.serviceIds.includes(service.id)) : []), [service])
  const [anyMode, setAnyMode] = useState(false)

  // "Any available dentist" searches all dentists for this service; otherwise just the chosen one.
  const providerIds = useMemo(
    () => (anyMode ? available.map((p) => p.id) : draft.providerId ? [draft.providerId] : []),
    [anyMode, available, draft.providerId],
  )
  const { days, free, booked } = useSlots(providerIds, undefined, 42)

  // Fewer clicks: pre-select the first dentist who offers this service.
  useEffect(() => {
    if (service && !anyMode && !draft.providerId && available[0]) updateDraft({ providerId: available[0].id })
  }, [service, anyMode, draft.providerId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!service) return <Navigate to="/services" replace />

  const pickDentist = (id: 'any' | string) => {
    if (id === 'any') {
      setAnyMode(true)
      updateDraft({ providerId: '', time: '' })
    } else {
      setAnyMode(false)
      updateDraft({ providerId: id, time: '' })
    }
  }
  const pickDate = (date: string) => updateDraft(anyMode ? { date, time: '', providerId: '' } : { date, time: '' })
  const pickTime = (time: string) => {
    if (!anyMode) return updateDraft({ time })
    // resolve "any" to the first dentist who is actually free at this time
    const dentist = available.find((p) => !isSlotTaken(p.id, draft.date, time, booked))
    updateDraft({ time, providerId: dentist?.id ?? '' })
  }

  const ready = !!draft.providerId && !!draft.date && !!draft.time
  const dentist = getProvider(draft.providerId)
  const summary = ready && (
    <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
      <CircleCheck className="h-5 w-5 shrink-0 text-primary" />
      <span>
        {dentist?.name} · {shortDate(draft.date)} · {draft.time} - {addMinutes(draft.time, service.duration)}
      </span>
    </p>
  )

  return (
    <div className="relative">
      <DentalBackdrop />
      <div className="relative mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Stepper current={1} />
        <PageHeader title="Pick a date & time" subtitle={`${service.name} • ${service.duration} min • $${service.price}`} />

        <div className="space-y-5">
          <Panel n={1} title="Your Dentist" hint="Choose who you would like to see, or let us find the earliest time.">
            <div
              role="radiogroup"
              aria-label="Dentist"
              onKeyDown={(e) => arrowNav(e, { select: true })}
              className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 py-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0"
            >
              <button
                type="button"
                role="radio"
                data-nav
                aria-checked={anyMode}
                tabIndex={anyMode || (!draft.providerId && !anyMode) ? 0 : -1}
                onClick={() => pickDentist('any')}
                className={cardCls(anyMode)}
              >
                <span className="relative grid aspect-4/5 w-full place-items-center rounded-xl bg-primary-soft ring-1 ring-slate-200">
                  <Users className="h-12 w-12 text-primary" strokeWidth={1.5} />
                  {anyMode && (
                    <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="mt-3 block px-1">
                  <span className="block font-semibold text-slate-900">Any available dentist</span>
                  <span className="block text-sm text-slate-600">Earliest availability</span>
                </span>
              </button>

              {available.map((p) => {
                const selected = !anyMode && draft.providerId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    data-nav
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => pickDentist(p.id)}
                    className={cardCls(selected)}
                  >
                    <Portrait p={p} selected={selected} />
                    <span className="mt-3 block px-1">
                      <span className="block font-semibold text-slate-900">{p.name}</span>
                      <span className="block text-sm text-slate-600">{p.specialty}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Panel>

          {providerIds.length > 0 && (
            <Panel n={2} title="Choose a day" hint="Days with few or no open slots are marked.">
              <DateStrip days={days} free={free} date={draft.date} onPick={pickDate} />
            </Panel>
          )}

          {draft.date && providerIds.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Panel n={3} title="Choose a time" hint={TIMEZONE_NOTE}>
                <TimeGrid providerIds={providerIds} date={draft.date} time={draft.time} onDate={pickDate} onTime={pickTime} />
              </Panel>
            </motion.div>
          )}
        </div>

        <BookingBar
          onBack={() => navigate('/services')}
          disabled={!ready}
          onNext={() => navigate('/book/details')}
          summary={summary || undefined}
          nextLabel="Continue"
        />
      </div>
    </div>
  )
}
