import { useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence } from 'motion/react'
import { CalendarDays, CalendarX2, Check, CheckCircle2, ChevronLeft, ChevronRight, Coffee, Mail, MousePointerClick, Move, Phone, Stethoscope, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Modal from '../../components/Modal'
import { Avatar, EmptyState } from '../../components/staff'
import { Button, StatusBadge } from '../../components/ui'
import { useBooking, type Appointment } from '../../context/BookingContext'
import { TIME_SLOTS, addMinutes, formatDate, getProvider, getService, isSlotTaken, isSunday, providers, toISO } from '../../data/mock'

const LUNCH_AFTER = TIME_SLOTS.indexOf('11:30')
const SLOT_MIN = 30
const blocked = 'bg-[repeating-linear-gradient(135deg,#f1f5f9_0,#f1f5f9_5px,#ffffff_5px,#ffffff_10px)]'

// Columns: dentist label, morning slots, a narrow lunch gap, afternoon slots. Fits a 1280px laptop without scrolling.
const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `204px repeat(${LUNCH_AFTER + 1}, minmax(56px, 1fr)) 24px repeat(${TIME_SLOTS.length - LUNCH_AFTER - 1}, minmax(56px, 1fr))`,
}
const colOf = (slotIdx: number) => slotIdx + 2 + (slotIdx > LUNCH_AFTER ? 1 : 0)
const sessionEnd = (idx: number) => (idx <= LUNCH_AFTER ? LUNCH_AFTER : TIME_SLOTS.length - 1)
const slotsFor = (serviceId: string) => Math.max(1, Math.ceil((getService(serviceId)?.duration ?? SLOT_MIN) / SLOT_MIN))

const shiftDay = (iso: string, dir: 1 | -1) => {
  const d = new Date(iso + 'T00:00:00')
  do d.setDate(d.getDate() + dir)
  while (isSunday(toISO(d)))
  return toISO(d)
}
const firstOpenDay = () => {
  const t = toISO(new Date())
  return isSunday(t) ? shiftDay(t, 1) : t
}
const isActive = (a: Appointment) => a.status === 'pending' || a.status === 'confirmed'
const startMs = (date: string, time: string) => new Date(`${date}T${time}:00`).getTime()
const endOf = (a: Appointment) => addMinutes(a.time, getService(a.serviceId)?.duration ?? SLOT_MIN)

const blockCls: Record<string, string> = {
  confirmed: 'bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary-dark',
  pending: 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-300 hover:bg-amber-100',
  completed: 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-200/70',
}
const accentCls: Record<string, string> = { confirmed: 'bg-white/50', pending: 'bg-amber-400', completed: 'bg-slate-300' }

export default function AppointmentTimeline({ search, onAdjust }: { search: string; onAdjust: (a: Appointment) => void }) {
  const { appointments, updateAppointment } = useBooking()
  const [date, setDate] = useState(firstOpenDay)
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<{ pid: string; idx: number } | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [hidden, setHidden] = useState<string[]>([])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])

  const todayISO = firstOpenDay()
  const active = appointments.filter(isActive)
  const dayAppts = appointments.filter((a) => a.date === date && a.status !== 'cancelled')
  const dragged = appointments.find((a) => a.id === dragId)
  const opened = appointments.find((a) => a.id === openId)
  const rows = providers.filter((p) => !hidden.includes(p.id))
  const q = search.trim().toLowerCase()
  const matches = (a: Appointment) => !q || (a.fullName + a.email + a.id).toLowerCase().includes(q)

  /** Slot indexes a dentist already has filled on the shown day (whole treatment length, not just the start). */
  const occupied = (pid: string, exceptId?: string) => {
    const set = new Set<number>()
    for (const a of active) {
      if (a.providerId !== pid || a.date !== date || a.id === exceptId) continue
      const start = TIME_SLOTS.indexOf(a.time)
      const last = Math.min(start + slotsFor(a.serviceId) - 1, sessionEnd(start))
      for (let i = start; i <= last; i++) set.add(i)
    }
    return set
  }

  /** Why `a` can't start at slot `idx` with dentist `pid`, or null when it can. */
  const dropProblem = (a: Appointment, pid: string, idx: number): string | null => {
    const time = TIME_SLOTS[idx]
    if (a.providerId === pid && a.date === date && a.time === time) return 'Current time'
    const p = getProvider(pid)
    if (!p?.serviceIds.includes(a.serviceId)) return `Doesn't do ${getService(a.serviceId)?.name}`
    if (startMs(date, time) < now) return 'In the past'
    if (isSlotTaken(pid, date, time, [])) return 'Dentist busy'
    const n = slotsFor(a.serviceId)
    if (idx + n - 1 > sessionEnd(idx)) return idx <= LUNCH_AFTER ? 'Runs into lunch' : 'Runs past closing'
    const occ = occupied(pid, a.id)
    for (let k = 0; k < n; k++) if (occ.has(idx + k)) return 'Overlaps a booking'
    return null
  }

  const move = (a: Appointment, pid: string, idx: number) => {
    const problem = dropProblem(a, pid, idx)
    if (problem === 'Current time') return
    if (problem) return void toast.error("Can't move this appointment", { description: problem })
    const time = TIME_SLOTS[idx]
    const prev = { providerId: a.providerId, date: a.date, time: a.time }
    updateAppointment(a.id, { providerId: pid, date, time })
    toast.success(`${a.fullName} → ${time}${pid !== a.providerId ? ` with ${getProvider(pid)?.name}` : ''}`, {
      description: 'The patient has been notified.',
      action: { label: 'Undo', onClick: () => updateAppointment(a.id, prev) },
    })
  }

  const approve = (a: Appointment) => {
    updateAppointment(a.id, { status: 'confirmed' })
    toast.success(`Approved ${a.fullName}`, { description: `${getService(a.serviceId)?.name} at ${a.time}` })
  }

  // Red "now" line, when the shown day is today and the clinic is open.
  const nowMarker = (() => {
    if (date !== toISO(new Date(now))) return null
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const s = startMs(date, TIME_SLOTS[i])
      if (now >= s && now < s + SLOT_MIN * 60000) return { col: colOf(i), pct: ((now - s) / (SLOT_MIN * 60000)) * 100 }
    }
    return null
  })()

  // Day strip: 3 open days before and after the selected one.
  const strip = (() => {
    let start = date
    for (let i = 0; i < 3; i++) start = shiftDay(start, -1)
    const out = [start]
    while (out.length < 7) out.push(shiftDay(out[out.length - 1], 1))
    return out
  })()

  const count = (s: string) => dayAppts.filter((a) => a.status === s).length
  const capacity = rows.length * TIME_SLOTS.length
  const filled = rows.reduce((n, p) => n + occupied(p.id).size, 0)

  return (
    <div className="space-y-4">
      {/* Day picker */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setDate((d) => shiftDay(d, -1))} aria-label="Previous day" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"><ChevronLeft className="h-5 w-5" /></button>
          <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto" role="tablist" aria-label="Choose a day">
            {strip.map((d, si) => {
              const list = appointments.filter((a) => a.date === d && a.status !== 'cancelled')
              const hasPending = list.some((a) => a.status === 'pending')
              const sel = d === date
              const dt = new Date(d + 'T00:00:00')
              return (
                <button
                  key={d}
                  role="tab"
                  aria-selected={sel}
                  onClick={() => setDate(d)}
                  className={`relative min-w-16 flex-1 flex-col items-center rounded-xl px-2 py-2 transition ${Math.abs(si - 3) > 1 ? 'hidden sm:flex' : 'flex'} ${sel ? 'bg-primary text-white shadow-md shadow-primary/25' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className={`text-[11px] font-semibold uppercase ${sel ? 'text-blue-100' : 'text-slate-400'}`}>{d === todayISO ? 'Today' : dt.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-lg font-bold leading-tight tabular-nums">{dt.getDate()}</span>
                  <span className={`text-[11px] ${sel ? 'text-blue-100' : 'text-slate-400'}`}>{list.length ? `${list.length} booked` : '—'}</span>
                  {hasPending && <span className={`absolute right-2 top-2 h-2 w-2 rounded-full ${sel ? 'bg-amber-300' : 'bg-amber-500'}`} title="Has pending bookings" />}
                </button>
              )
            })}
          </div>
          <button onClick={() => setDate((d) => shiftDay(d, 1))} aria-label="Next day" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"><ChevronRight className="h-5 w-5" /></button>
          <div className="order-last flex w-full gap-2 sm:order-none sm:w-auto">
            <button onClick={() => setDate(todayISO)} disabled={date === todayISO} className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:flex-none">Today</button>
            <label className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" title="Pick a date">
              <CalendarDays className="h-4 w-4" />
              <input
                type="date"
                value={date}
                onChange={(e) => e.target.value && setDate(isSunday(e.target.value) ? shiftDay(e.target.value, 1) : e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Pick a date"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Day summary + dentist filter */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-lg bg-white px-3 py-1.5 font-medium text-slate-700 ring-1 ring-slate-200"><b className="text-slate-900">{dayAppts.length}</b> booking{dayAppts.length === 1 ? '' : 's'}</span>
        <span className="rounded-lg bg-primary-soft px-3 py-1.5 font-medium text-primary"><b>{count('confirmed')}</b> confirmed</span>
        {count('pending') > 0 && <span className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-700 ring-1 ring-amber-200"><b>{count('pending')}</b> waiting for approval</span>}
        <span className="hidden rounded-lg bg-white px-3 py-1.5 font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">{capacity ? Math.round((filled / capacity) * 100) : 0}% of chair time booked</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-xs text-slate-500 sm:inline">Dentists</span>
          {providers.map((p) => {
            const off = hidden.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() => setHidden((h) => (off ? h.filter((x) => x !== p.id) : [...h, p.id]))}
                aria-pressed={!off}
                title={`${off ? 'Show' : 'Hide'} ${p.name}`}
                className={`flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2.5 text-xs font-medium ring-1 transition ${off ? 'bg-white text-slate-400 ring-slate-200' : 'bg-white text-slate-700 ring-primary/40'}`}
              >
                <img src={p.photo} alt="" className={`h-6 w-6 rounded-full object-cover object-top ${off ? 'opacity-40 grayscale' : ''}`} />
                {p.name.replace('Dr. ', '').split(' ')[0]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: drag-and-drop timeline */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:block">
        <div className={`flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-xs transition ${dragged ? 'bg-primary-soft text-primary' : 'bg-slate-50/60 text-slate-500'}`}>
          {dragged ? (
            <><Move className="h-3.5 w-3.5" /> Moving <b>{dragged.fullName}</b> ({getService(dragged.serviceId)?.duration} min). Drop on a green slot. Grey rows can't do this treatment.</>
          ) : dayAppts.some(isActive) && !dayAppts.some((a) => isActive(a) && startMs(a.date, a.time) > now) ? (
            <><MousePointerClick className="h-3.5 w-3.5" /> These bookings have already started, so they can't be dragged. Click one to reschedule it to another day.</>
          ) : (
            <><MousePointerClick className="h-3.5 w-3.5" /> Drag a booking to move it · click it for details · <Check className="h-3.5 w-3.5" /> approves pending ones</>
          )}
          <span className="ml-auto hidden items-center gap-3 lg:flex">
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-primary" /> Confirmed</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-amber-100 ring-1 ring-amber-300" /> Pending</span>
            <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-slate-200" /> Done</span>
            <span className="inline-flex items-center gap-1.5"><i className={`h-2.5 w-2.5 rounded-sm ring-1 ring-slate-200 ${blocked}`} /> Busy</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            {/* Time header */}
            <div style={gridStyle} className="border-b border-slate-100">
              <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Dentist</div>
              {TIME_SLOTS.map((t, i) => (
                <div key={t} style={{ gridColumn: colOf(i) }} className={`relative border-l py-2.5 pl-1.5 text-xs font-medium tabular-nums ${t.endsWith(':00') ? 'border-slate-200 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                  {t}
                  {nowMarker?.col === colOf(i) && <span className="absolute -bottom-1 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-red-500" style={{ left: `${nowMarker.pct}%` }} />}
                </div>
              ))}
              <div style={{ gridColumn: colOf(LUNCH_AFTER) + 1 }} className="grid place-items-center border-l border-slate-100 text-slate-300" title="Lunch 12:00–13:00"><Coffee className="h-3.5 w-3.5" /></div>
            </div>

            {rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">All dentists are hidden. Turn one on above.</p>}

            {rows.map((p) => {
              const mine = dayAppts.filter((a) => a.providerId === p.id).sort((a, b) => a.time.localeCompare(b.time))
              const starts = mine.map((a) => TIME_SLOTS.indexOf(a.time))
              const covered = new Set<number>()
              const blocks = mine.map((a, k) => {
                const start = starts[k]
                // stop at the session end and at the next booking, so blocks never overlap
                const nextStart = starts.slice(k + 1).find((s) => s > start) ?? Infinity
                const span = Math.max(1, Math.min(slotsFor(a.serviceId), sessionEnd(start) - start + 1, nextStart - start))
                for (let i = start; i < start + span; i++) covered.add(i)
                return { a, start, span }
              })
              const rowOff = dragged && !p.serviceIds.includes(dragged.serviceId)
              const preview = dragged && over?.pid === p.id ? { idx: over.idx, problem: dropProblem(dragged, p.id, over.idx) } : null
              const previewSpan = preview && !preview.problem ? Math.min(slotsFor(dragged!.serviceId), sessionEnd(preview.idx) - preview.idx + 1) : 1

              return (
                <div key={p.id} style={gridStyle} className={`relative min-h-[88px] border-b border-slate-100 transition last:border-b-0 ${rowOff ? 'opacity-50' : ''}`}>
                  <div style={{ gridRow: 1 }} className="flex items-center gap-2.5 border-r border-slate-100 px-4 py-3">
                    <img src={p.photo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover object-top" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                      <p className="truncate text-xs text-slate-500">{p.specialty}</p>
                      <p className="text-[11px] font-medium text-slate-400">{mine.length} booking{mine.length === 1 ? '' : 's'}</p>
                    </div>
                  </div>

                  {/* Slots (drop targets) */}
                  {TIME_SLOTS.map((t, i) => {
                    const busy = !covered.has(i) && isSlotTaken(p.id, date, t, [])
                    const past = startMs(date, t) + SLOT_MIN * 60000 <= now
                    const ok = dragged && !rowOff ? dropProblem(dragged, p.id, i) === null : false
                    return (
                      <div
                        key={t}
                        style={{ gridColumn: colOf(i), gridRow: 1 }}
                        onDragOver={(e) => {
                          if (!dragged) return
                          e.preventDefault()
                          e.dataTransfer.dropEffect = ok ? 'move' : 'none'
                          if (over?.pid !== p.id || over.idx !== i) setOver({ pid: p.id, idx: i })
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          setOver(null)
                          if (dragged) move(dragged, p.id, i)
                        }}
                        className={`border-l transition-colors ${t.endsWith(':00') ? 'border-slate-200/70' : 'border-slate-100'} ${
                          busy ? blocked : past ? 'bg-slate-50' : ok ? 'bg-emerald-50' : ''
                        }`}
                      />
                    )
                  })}
                  <div style={{ gridColumn: colOf(LUNCH_AFTER) + 1, gridRow: 1 }} className={`border-l border-slate-100 ${blocked}`} />

                  {nowMarker && (
                    <div style={{ gridColumn: nowMarker.col, gridRow: 1 }} className="pointer-events-none relative z-[6]">
                      <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-red-500/70" style={{ left: `${nowMarker.pct}%` }} />
                    </div>
                  )}

                  {/* Bookings */}
                  {blocks.map(({ a, start, span }) => {
                    const service = getService(a.serviceId)
                    const canDrag = isActive(a) && startMs(a.date, a.time) > now
                    const isDragging = dragId === a.id
                    const dim = (q && !matches(a)) || (dragId && !isDragging)
                    return (
                      <div
                        key={a.id}
                        style={{ gridColumn: `${colOf(start)} / span ${span}`, gridRow: 1 }}
                        className={`group relative z-[7] p-1 ${isDragging || dragId ? 'pointer-events-none' : ''}`}
                      >
                        <div
                          draggable={canDrag}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', a.id)
                            requestAnimationFrame(() => setDragId(a.id))
                          }}
                          onDragEnd={() => { setDragId(null); setOver(null) }}
                          className={`relative flex h-full overflow-hidden rounded-lg transition ${blockCls[a.status]} ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${
                            isDragging ? 'opacity-30' : dim ? 'opacity-40' : ''
                          }`}
                        >
                          <span className={`w-1 shrink-0 ${accentCls[a.status]}`} />
                          <button onClick={() => setOpenId(a.id)} className={`flex min-w-0 flex-1 flex-col justify-center py-1.5 text-left ${span > 1 ? 'px-2' : 'px-1.5'}`} title={`${a.fullName} · ${service?.name} · ${a.time}–${endOf(a)}${canDrag ? ' · drag to move' : isActive(a) ? ' · already started, use Reschedule' : ''}`}>
                            <span className={`truncate font-semibold leading-tight ${span > 1 ? 'text-[13px]' : 'text-xs'}`}>{span > 1 ? a.fullName : a.fullName.split(' ')[0]}</span>
                            <span className="truncate text-[11px] opacity-80">{span > 1 ? `${service?.name} · ${a.time}–${endOf(a)}` : a.time}</span>
                          </button>
                          {a.status === 'pending' && (
                            <button
                              onClick={() => approve(a)}
                              aria-label={`Approve ${a.fullName}`}
                              title="Approve"
                              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-emerald-500 text-white opacity-0 shadow transition hover:bg-emerald-600 focus-visible:opacity-100 group-hover:opacity-100"
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Drop preview */}
                  {preview && (
                    <div style={{ gridColumn: `${colOf(preview.idx)} / span ${previewSpan}`, gridRow: 1 }} className="pointer-events-none relative z-[8] p-1">
                      <div className={`flex h-full flex-col justify-center rounded-lg border-2 border-dashed px-2 text-[11px] font-semibold ${preview.problem ? 'border-red-300 bg-red-50/90 text-red-600' : 'border-primary bg-primary/10 text-primary'}`}>
                        {preview.problem ?? <>{TIME_SLOTS[preview.idx]}–{addMinutes(TIME_SLOTS[preview.idx], getService(dragged!.serviceId)?.duration ?? SLOT_MIN)}<span className="font-medium opacity-80">Drop to move</span></>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {dayAppts.length === 0 && rows.length > 0 && (
          <p className="border-t border-slate-100 px-5 py-3 text-center text-sm text-slate-500">No bookings on this day. Use the day strip above to jump to a busier one.</p>
        )}
      </div>

      {/* Mobile: simple agenda grouped by dentist */}
      <div className="space-y-3 md:hidden">
        {rows.map((p) => {
          const mine = dayAppts.filter((a) => a.providerId === p.id && matches(a)).sort((a, b) => a.time.localeCompare(b.time))
          return (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <img src={p.photo} alt="" className="h-9 w-9 rounded-full object-cover object-top" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.specialty}</p>
                </div>
                <span className="text-xs font-medium text-slate-400">{mine.length} booked</span>
              </div>
              {mine.length === 0 ? (
                <p className="px-4 py-4 text-sm text-slate-400">No bookings.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {mine.map((a) => (
                    <li key={a.id}>
                      <button onClick={() => setOpenId(a.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-slate-50">
                        <span className="w-12 shrink-0">
                          <span className="block text-sm font-semibold text-slate-900 tabular-nums">{a.time}</span>
                          <span className="text-[11px] text-slate-400 tabular-nums">{endOf(a)}</span>
                        </span>
                        <span className={`h-9 w-1 shrink-0 rounded-full ${a.status === 'confirmed' ? 'bg-primary' : a.status === 'pending' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900">{a.fullName}</span>
                          <span className="block truncate text-xs text-slate-500">{getService(a.serviceId)?.name}</span>
                        </span>
                        <StatusBadge status={a.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
        {rows.length === 0 && <EmptyState icon={CalendarX2} title="All dentists are hidden" />}
      </div>

      {/* Details dialog: also the keyboard / touch way to reschedule */}
      <AnimatePresence>
        {opened && (
          <Modal label={`Appointment for ${opened.fullName}`} onClose={() => setOpenId(null)}>
            <div className="flex items-start gap-3">
              <Avatar name={opened.fullName} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900">{opened.fullName}</h3>
                <p className="text-xs text-slate-400">{opened.id}</p>
              </div>
              <StatusBadge status={opened.status} />
            </div>
            <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate-500">Service</dt><dd className="font-medium text-slate-900">{getService(opened.serviceId)?.name} · {getService(opened.serviceId)?.duration} min</dd></div>
              <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate-500">Dentist</dt><dd className="flex items-center gap-1.5 font-medium text-slate-900"><Stethoscope className="h-3.5 w-3.5 text-slate-400" /> {getProvider(opened.providerId)?.name}</dd></div>
              <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate-500">When</dt><dd className="font-medium text-slate-900">{formatDate(opened.date)} · {opened.time}–{endOf(opened)}</dd></div>
              <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate-500">Payment</dt><dd className="font-medium text-slate-900">{opened.paid ? 'Paid' : 'Due'} ${opened.amount}</dd></div>
              <div className="flex gap-3"><dt className="w-20 shrink-0 text-slate-500">Contact</dt>
                <dd className="min-w-0 space-y-1">
                  <a href={`tel:${opened.phone}`} className="flex items-center gap-1.5 text-slate-700 hover:text-primary"><Phone className="h-3.5 w-3.5 text-slate-400" /> {opened.phone}</a>
                  <a href={`mailto:${opened.email}`} className="flex items-center gap-1.5 truncate text-slate-700 hover:text-primary"><Mail className="h-3.5 w-3.5 text-slate-400" /> {opened.email}</a>
                </dd>
              </div>
            </dl>
            {opened.notes && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"><b>Patient note:</b> {opened.notes}</p>}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {opened.status === 'pending' && (
                <Button variant="fresh" className="px-4" onClick={() => { approve(opened); setOpenId(null) }}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
              )}
              {opened.status === 'confirmed' && (
                <Button className="px-4" onClick={() => { updateAppointment(opened.id, { status: 'completed', paid: true }); setOpenId(null) }}><CheckCircle2 className="h-4 w-4" /> Complete</Button>
              )}
              {isActive(opened) && (
                <>
                  <Button variant="outline" className="px-4" onClick={() => { onAdjust(opened); setOpenId(null) }}><CalendarDays className="h-4 w-4" /> Reschedule</Button>
                  <Button variant="ghost" className="px-4 text-red-600 hover:bg-red-50" onClick={() => { updateAppointment(opened.id, { status: 'cancelled' }); setOpenId(null) }}><XCircle className="h-4 w-4" /> Cancel</Button>
                </>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
