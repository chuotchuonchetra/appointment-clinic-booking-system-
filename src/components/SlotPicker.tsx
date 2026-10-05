import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Sun, Sunset } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { TIME_SLOTS, formatDate, isSlotTaken, isSunday, toISO } from '../data/mock'
import { arrowNav } from '../lib/arrowNav'
import MonthPicker from './MonthPicker'

export const TIMEZONE_NOTE = 'Times shown in Phnom Penh time (GMT+7)'

/**
 * Shared availability for one or more dentists.
 * A day/time counts as free when ANY of the given dentists is free (used for "Any available dentist").
 */
export function useSlots(providerIds: string[], ignoreId?: string, count = 14) {
  const { appointments } = useBooking()
  const booked = useMemo(
    () => appointments.filter((a) => a.status !== 'cancelled' && a.id !== ignoreId),
    [appointments, ignoreId],
  )
  const days = useMemo(() => {
    const out: string[] = []
    const d = new Date()
    d.setDate(d.getDate() + 1)
    while (out.length < count) {
      const iso = toISO(d)
      if (!isSunday(iso)) out.push(iso)
      d.setDate(d.getDate() + 1)
    }
    return out
  }, [count])
  const isTaken = (day: string, t: string) => providerIds.every((p) => isSlotTaken(p, day, t, booked))
  const free = (day: string) => TIME_SLOTS.filter((t) => !isTaken(day, t))
  return { days, free, isTaken, booked }
}

type Slots = ReturnType<typeof useSlots>

export const longDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

const monthLabel = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const roundBtn =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white'

/**
 * Scrollable day selector with a live month label, arrow buttons and a month-calendar popover.
 * Only low (<= 3) or no availability gets a badge, so the strip stays calm.
 */
export function DateStrip({ days, free, date, onPick }: Pick<Slots, 'days' | 'free'> & { date: string; onPick: (d: string) => void }) {
  const scroller = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ left: false, right: true })
  const [firstVisible, setFirstVisible] = useState(0)
  const [calOpen, setCalOpen] = useState(false)
  const calBtn = useRef<HTMLButtonElement>(null)
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ startX: 0, startScroll: 0, moved: false })

  const update = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdge({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 })
    const chips = Array.from(el.querySelectorAll<HTMLElement>('[data-day]'))
    const i = chips.findIndex((c) => c.offsetLeft + c.offsetWidth / 2 > el.scrollLeft)
    setFirstVisible(i < 0 ? 0 : i)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update, days.length])

  // Mouse wheel scrolls the days sideways. At either end the wheel falls through so the page can still scroll.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return // already a horizontal gesture
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      if ((el.scrollLeft <= 0 && e.deltaY < 0) || (el.scrollLeft >= max - 1 && e.deltaY > 0)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Click-and-drag with a mouse (touch already scrolls natively). A real drag must not count as a click on a day.
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scroller.current
    if (e.button !== 0 || !el) return
    drag.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false }
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - drag.current.startX
      if (!drag.current.moved && Math.abs(dx) > 5) {
        drag.current.moved = true
        setDragging(true)
      }
      if (drag.current.moved) el.scrollLeft = drag.current.startScroll - dx
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      setDragging(false)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }
  const swallowClickAfterDrag = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  // keep the selected day in view when it is changed from elsewhere (e.g. the month calendar)
  useEffect(() => {
    if (!date) return
    scroller.current?.querySelector<HTMLElement>(`[data-day="${date}"]`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [date])

  const scrollBy = (dir: 1 | -1) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: 'smooth' })
  const enabledDays = useMemo(() => new Set(days.filter((d) => free(d).length > 0)), [days, free])
  // roving tabindex: one tab stop for the whole strip, arrow keys move inside it
  const tabbable = date && enabledDays.has(date) ? date : days.find((d) => enabledDays.has(d))

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900" aria-live="polite">{monthLabel(days[firstVisible] ?? days[0])}</h3>
        <div className="relative">
          <button
            ref={calBtn}
            type="button"
            className={roundBtn}
            aria-label="Open month calendar"
            aria-haspopup="dialog"
            aria-expanded={calOpen}
            onClick={() => setCalOpen((o) => !o)}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
          {calOpen && (
            <MonthPicker
              value={date}
              enabled={enabledDays}
              min={days[0]}
              max={days[days.length - 1]}
              onPick={onPick}
              onClose={() => { setCalOpen(false); calBtn.current?.focus() }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className={`${roundBtn} hidden sm:grid`} aria-label="Scroll days left" disabled={!edge.left} onClick={() => scrollBy(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={scroller}
          onScroll={update}
          onKeyDown={arrowNav}
          onMouseDown={onMouseDown}
          onClickCapture={swallowClickAfterDrag}
          role="group"
          aria-label="Choose a day"
          className={`no-scrollbar relative flex min-w-0 flex-1 select-none gap-2.5 overflow-x-auto px-1 py-2 ${
            dragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x'
          }`}
        >
          {days.map((d) => {
            const dt = new Date(d + 'T00:00:00')
            const active = d === date
            const left = free(d).length
            const full = left === 0
            return (
              <button
                key={d}
                data-day={d}
                data-nav
                type="button"
                disabled={full}
                aria-pressed={active}
                tabIndex={d === tabbable ? 0 : -1}
                aria-label={`${longDate(d)}${full ? ', fully booked' : left <= 3 ? `, ${left} slot${left === 1 ? '' : 's'} left` : ''}`}
                onClick={() => onPick(d)}
                className={`w-18 shrink-0 snap-start rounded-2xl px-2 py-3 text-center transition ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : full
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-white text-slate-800 ring-1 ring-slate-300 hover:ring-primary'
                }`}
              >
                <span className={`block text-xs font-semibold uppercase tracking-wide ${active ? 'text-white' : full ? 'text-slate-400' : 'text-slate-600'}`}>
                  {dt.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="mt-0.5 block text-2xl font-bold leading-none">{dt.getDate()}</span>
                {/* badge row keeps every card the same height; text only when it matters */}
                <span className="mt-2 flex h-5 items-center justify-center">
                  {full ? (
                    <span className="text-xs font-semibold text-slate-500">Full</span>
                  ) : left <= 3 ? (
                    <span className="rounded-full bg-amber-100 px-2 text-xs font-semibold text-amber-800">{left} left</span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>

        <button type="button" className={`${roundBtn} hidden sm:grid`} aria-label="Scroll days right" disabled={!edge.right} onClick={() => scrollBy(1)}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {date && (
        <p className="mt-3 text-sm text-slate-600">
          Selected: <b className="text-slate-900">{longDate(date)}</b>
        </p>
      )}
    </div>
  )
}

/** Morning / afternoon time grid for one day, with fallback day suggestions when it is full. */
export function TimeGrid({
  providerIds,
  ignoreId,
  date,
  time,
  onDate,
  onTime,
}: {
  providerIds: string[]
  ignoreId?: string
  date: string
  time: string
  onDate: (d: string) => void
  onTime: (t: string) => void
}) {
  const { days, free, isTaken } = useSlots(providerIds, ignoreId, 42)
  const alternatives = free(date).length === 0 ? days.filter((d) => d !== date && free(d).length > 0).slice(0, 3) : []
  const firstFree = free(date)[0]
  const groups = [
    { label: 'Morning', Icon: Sun, slots: TIME_SLOTS.filter((t) => t < '12:00') },
    { label: 'Afternoon', Icon: Sunset, slots: TIME_SLOTS.filter((t) => t >= '12:00') },
  ]

  if (free(date).length === 0) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        This day is fully booked.
        {alternatives.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {alternatives.map((d) => (
              <button key={d} onClick={() => onDate(d)} className="min-h-10 rounded-full bg-white px-4 font-medium text-primary ring-1 ring-primary/40 hover:bg-primary-soft">
                Try {formatDate(d)}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5" onKeyDown={arrowNav}>
      {groups.map((g) => (
        <div key={g.label} role="group" aria-label={g.label}>
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
            <g.Icon className="h-3.5 w-3.5" /> {g.label}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {g.slots.map((t) => {
              const taken = isTaken(date, t)
              const selected = t === time
              return (
                <button
                  key={t}
                  type="button"
                  data-nav
                  aria-disabled={taken || undefined}
                  aria-pressed={selected}
                  tabIndex={taken ? -1 : selected || (!time && t === firstFree) ? 0 : -1}
                  title={taken ? 'Already booked' : undefined}
                  onClick={() => !taken && onTime(t)}
                  className={`min-h-11 rounded-xl text-sm font-semibold transition ${
                    taken
                      ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through'
                      : selected
                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                        : 'bg-white text-slate-800 ring-1 ring-slate-300 hover:ring-primary'
                  }`}
                >
                  {t}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <p className="text-sm text-slate-600">Struck-through times are already booked.</p>
    </div>
  )
}

interface Props {
  providerId: string
  date: string
  time: string
  ignoreId?: string
  onDate: (d: string) => void
  onTime: (t: string) => void
}

/** Combined day + time picker (used when rescheduling and in the admin). */
export default function SlotPicker({ providerId, date, time, ignoreId, onDate, onTime }: Props) {
  const ids = useMemo(() => [providerId], [providerId])
  const { days, free } = useSlots(ids, ignoreId, 42)
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-800">1. Choose a day</p>
      <DateStrip days={days} free={free} date={date} onPick={(d) => { onDate(d); onTime('') }} />
      {date && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-800">2. Choose a time</p>
          <p className="mb-3 text-sm text-slate-600">{TIMEZONE_NOTE}</p>
          <TimeGrid providerIds={ids} ignoreId={ignoreId} date={date} time={time} onDate={onDate} onTime={onTime} />
        </div>
      )}
    </div>
  )
}
