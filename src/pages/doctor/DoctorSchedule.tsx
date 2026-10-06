import { useMemo, useRef, useState } from 'react'
import { CalendarCheck, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Coffee, Gauge, Mail, Phone } from 'lucide-react'
import { Button, PageHeader, StatusBadge } from '../../components/ui'
import { Avatar, Panel, Progress, Segmented, StatCard } from '../../components/staff'
import type { Appointment } from '../../context/BookingContext'
import { TIME_SLOTS, addMinutes, getService, isSlotTaken, isSunday, toISO } from '../../data/mock'
import { isActive, startOf, useDoctor } from './useDoctor'

const DAY_COUNT = 14
const views = ['day', 'week'] as const
const blocked = 'bg-[repeating-linear-gradient(135deg,#f1f5f9_0,#f1f5f9_6px,#ffffff_6px,#ffffff_12px)]'

/** Today (if open) plus the following working days; Sundays are closed. */
function workingDays(count: number) {
  const out: string[] = []
  const d = new Date()
  while (out.length < count) {
    const iso = toISO(d)
    if (!isSunday(iso)) out.push(iso)
    d.setDate(d.getDate() + 1)
  }
  return out
}

const parse = (iso: string) => new Date(iso + 'T00:00:00')
const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => parse(iso).toLocaleDateString('en-US', o)

type Slot = { time: string; appt?: Appointment; busy: boolean }

export default function DoctorSchedule() {
  const { user, mine, updateAppointment } = useDoctor()
  const providerId = user?.providerId ?? ''
  const today = toISO(new Date())
  const days = useMemo(() => workingDays(DAY_COUNT), [])
  const [selected, setSelected] = useState(days[0])
  const [view, setView] = useState<(typeof views)[number]>('day')
  const strip = useRef<HTMLDivElement>(null)

  const active = mine.filter(isActive)
  // Completed visits still occupy their slot in the timeline.
  const shown = mine.filter((a) => a.status !== 'cancelled')

  const slotsFor = (d: string): Slot[] =>
    TIME_SLOTS.map((time) => {
      const appt = shown.find((a) => a.date === d && a.time === time)
      return { time, appt, busy: !appt && isSlotTaken(providerId, d, time, active) }
    })

  const dayInfo = (d: string) => {
    const slots = slotsFor(d)
    const patients = slots.filter((s) => s.appt).length
    const open = slots.filter((s) => !s.appt && !s.busy).length
    return { slots, patients, open, busy: TIME_SLOTS.length - patients - open }
  }

  const totals = days.reduce(
    (t, d) => {
      const i = dayInfo(d)
      return { patients: t.patients + i.patients, open: t.open + i.open }
    },
    { patients: 0, open: 0 },
  )
  const capacity = days.length * TIME_SLOTS.length
  const utilisation = Math.round(((capacity - totals.open) / capacity) * 100)

  const sel = dayInfo(selected)
  const selIdx = days.indexOf(selected)
  const weekStart = Math.floor(selIdx / 6) * 6
  const week = days.slice(weekStart, weekStart + 6)

  const go = (delta: number) => {
    const next = days[Math.min(days.length - 1, Math.max(0, selIdx + delta))]
    setSelected(next)
    strip.current?.querySelector(`[data-day="${next}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="My schedule" subtitle={`Your next ${DAY_COUNT} working days · Mon–Sat, 09:00–16:30 · Sundays closed`} />
        <div className="mb-6 md:mb-8"><Segmented options={views} value={view} onChange={setView} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Booked patients" value={totals.patients} icon={CalendarCheck} tone="blue" note={`Across ${DAY_COUNT} working days`} />
        <StatCard label="Open slots" value={totals.open} icon={CalendarClock} tone="green" note="Bookable by patients online" delay={0.05} />
        <StatCard label="Utilisation" value={`${utilisation}%`} icon={Gauge} tone="violet" note={<Progress value={utilisation} max={100} className="bg-violet-500" />} delay={0.1} />
      </div>

      {/* Date strip */}
      <div className="flex items-center gap-2">
        <button onClick={() => go(-1)} disabled={selIdx === 0} aria-label="Previous day" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div ref={strip} className="no-scrollbar flex flex-1 gap-2 overflow-x-auto py-1" role="tablist" aria-label="Choose a day">
          {days.map((d) => {
            const { patients, open } = dayInfo(d)
            const isSel = d === selected
            return (
              <button
                key={d}
                data-day={d}
                role="tab"
                aria-selected={isSel}
                onClick={() => setSelected(d)}
                className={`flex w-18 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 transition ${
                  isSel ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[11px] font-semibold uppercase ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>{d === today ? 'Today' : fmt(d, { weekday: 'short' })}</span>
                <span className="text-xl font-bold leading-tight tabular-nums">{parse(d).getDate()}</span>
                <span className={`text-[10px] ${isSel ? 'text-blue-100' : 'text-slate-400'}`}>{fmt(d, { month: 'short' })}</span>
                <span className="mt-1.5 flex gap-0.5" aria-label={`${patients} patients, ${open} open`}>
                  {Array.from({ length: Math.min(patients, 5) }, (_, i) => (
                    <i key={i} className={`h-1.5 w-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-primary'}`} />
                  ))}
                  {patients === 0 && <i className={`h-1.5 w-1.5 rounded-full ${isSel ? 'bg-white/40' : 'bg-slate-200'}`} />}
                </span>
              </button>
            )
          })}
        </div>
        <button onClick={() => go(1)} disabled={selIdx === days.length - 1} aria-label="Next day" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded bg-primary" /> Patient booked</span>
        <span className="inline-flex items-center gap-2"><i className={`h-3 w-3 rounded border border-slate-200 ${blocked}`} /> Busy / blocked</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded border border-dashed border-fresh bg-fresh-soft" /> Open</span>
      </div>

      {view === 'day' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel
            title={fmt(selected, { weekday: 'long', month: 'long', day: 'numeric' })}
            subtitle={`${sel.patients} patient${sel.patients === 1 ? '' : 's'} · ${sel.open} open · ${sel.busy} blocked`}
            className="lg:col-span-2"
          >
            <ol className="space-y-2">
              {sel.slots.map((s, i) => {
                const service = s.appt && getService(s.appt.serviceId)
                const lunch = i > 0 && TIME_SLOTS[i - 1] === '11:30'
                return (
                  <li key={s.time}>
                    {lunch && (
                      <div className="my-3 flex items-center gap-3 text-xs font-medium text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        <Coffee className="h-3.5 w-3.5" /> Lunch break · 12:00 – 13:00
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                    )}
                    <div className="flex gap-3">
                      <span className="w-12 shrink-0 pt-2.5 text-right text-sm font-semibold text-slate-500 tabular-nums">{s.time}</span>
                      {s.appt ? (
                        <div className={`flex min-w-0 flex-1 flex-wrap items-center gap-3 rounded-xl border-l-4 p-3 ${s.appt.status === 'completed' ? 'border-slate-300 bg-slate-50' : s.appt.status === 'pending' ? 'border-amber-400 bg-amber-50/60' : 'border-primary bg-primary-soft/70'}`}>
                          <Avatar name={s.appt.fullName} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-900">{s.appt.fullName}</p>
                            <p className="truncate text-xs text-slate-500">
                              {service?.name} · {s.time}–{addMinutes(s.time, service?.duration ?? 30)}
                            </p>
                            <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                              <a href={`tel:${s.appt.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3" /> {s.appt.phone}</a>
                              <a href={`mailto:${s.appt.email}`} className="inline-flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3" /> {s.appt.email}</a>
                            </p>
                          </div>
                          <StatusBadge status={s.appt.status} />
                          {s.appt.status === 'pending' && (
                            <Button variant="fresh" className="min-h-9 px-3 py-1 text-xs" onClick={() => updateAppointment(s.appt!.id, { status: 'confirmed' })}>Confirm</Button>
                          )}
                          {s.appt.status === 'confirmed' && startOf(s.appt) <= Date.now() && (
                            <Button className="min-h-9 px-3 py-1 text-xs" onClick={() => updateAppointment(s.appt!.id, { status: 'completed', paid: true })}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                            </Button>
                          )}
                        </div>
                      ) : s.busy ? (
                        <div className={`flex min-h-11 flex-1 items-center rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-400 ${blocked}`}>Busy / blocked</div>
                      ) : (
                        <div className="flex min-h-11 flex-1 items-center rounded-xl border border-dashed border-fresh/50 bg-fresh-soft/50 px-3 text-xs font-medium text-fresh-dark">Available</div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Panel>

          <div className="space-y-6">
            <Panel title="Day summary">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Patients', value: sel.patients, cls: 'bg-primary-soft text-primary' },
                  { label: 'Open', value: sel.open, cls: 'bg-fresh-soft text-fresh-dark' },
                  { label: 'Blocked', value: sel.busy, cls: 'bg-slate-100 text-slate-600' },
                ].map((x) => (
                  <div key={x.label} className={`rounded-xl py-3 ${x.cls}`}>
                    <p className="text-2xl font-bold tabular-nums">{x.value}</p>
                    <p className="text-xs font-medium">{x.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                  <span>Day filled</span>
                  <span className="font-semibold text-slate-700">{Math.round(((sel.patients + sel.busy) / TIME_SLOTS.length) * 100)}%</span>
                </div>
                <Progress value={sel.patients + sel.busy} max={TIME_SLOTS.length} />
              </div>
            </Panel>

            <Panel title="Patients this day" bodyClassName="">
              {sel.patients === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-slate-500">No patients booked. Open slots are visible to patients online.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {sel.slots.filter((s) => s.appt).map(({ appt: a }) => (
                    <li key={a!.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="w-11 text-sm font-semibold text-slate-900 tabular-nums">{a!.time}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{a!.fullName}</p>
                        <p className="truncate text-xs text-slate-500">{getService(a!.serviceId)?.name}</p>
                      </div>
                      <StatusBadge status={a!.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      ) : (
        <Panel
          title={`${fmt(week[0], { month: 'short', day: 'numeric' })} – ${fmt(week[week.length - 1], { month: 'short', day: 'numeric' })}`}
          subtitle="Click a day to open it in day view"
          bodyClassName="overflow-x-auto"
          action={
            <div className="flex gap-1">
              <button onClick={() => setSelected(days[Math.max(0, weekStart - 6)])} disabled={weekStart === 0} aria-label="Previous week" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setSelected(days[Math.min(days.length - 1, weekStart + 6)])} disabled={weekStart + 6 >= days.length} aria-label="Next week" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          }
        >
          <table className="w-full min-w-180 border-separate border-spacing-1.5 text-xs">
            <thead>
              <tr>
                <th className="w-14" />
                {week.map((d) => (
                  <th key={d} className="pb-1">
                    <button
                      onClick={() => { setSelected(d); setView('day') }}
                      className={`w-full rounded-xl px-2 py-2 transition hover:bg-slate-100 ${d === today ? 'bg-primary-soft text-primary' : 'text-slate-700'}`}
                    >
                      <span className="block text-[11px] font-semibold uppercase text-slate-400">{fmt(d, { weekday: 'short' })}</span>
                      <span className="text-lg font-bold tabular-nums">{parse(d).getDate()}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((t, row) => (
                <tr key={t}>
                  <td className="pr-1 text-right font-semibold text-slate-400 tabular-nums">{t}</td>
                  {week.map((d) => {
                    const s = dayInfo(d).slots[row]
                    return (
                      <td key={d}>
                        {s.appt ? (
                          <div
                            title={`${s.appt.fullName} · ${getService(s.appt.serviceId)?.name} (${s.appt.status})`}
                            className={`truncate rounded-lg px-2 py-1.5 font-medium ${s.appt.status === 'pending' ? 'bg-amber-100 text-amber-800' : s.appt.status === 'completed' ? 'bg-slate-200 text-slate-600' : 'bg-primary text-white'}`}
                          >
                            {s.appt.fullName.split(' ')[0]}
                          </div>
                        ) : s.busy ? (
                          <div className={`h-7 rounded-lg border border-slate-200 ${blocked}`} title="Busy" />
                        ) : (
                          <div className="h-7 rounded-lg border border-dashed border-fresh/40 bg-fresh-soft/40" title="Open" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  )
}
