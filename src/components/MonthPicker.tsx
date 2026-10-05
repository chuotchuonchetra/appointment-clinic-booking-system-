import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { arrowNav } from '../lib/arrowNav'
import { toISO } from '../data/mock'

interface Props {
  /** Currently selected ISO date (may be empty). */
  value: string
  /** Dates that can be chosen. Everything else is disabled. */
  enabled: Set<string>
  min: string
  max: string
  onPick: (iso: string) => void
  onClose: () => void
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const monthIndex = (iso: string) => {
  const d = new Date(iso + 'T00:00:00')
  return d.getFullYear() * 12 + d.getMonth()
}

/** Full month calendar popover. Esc / outside click closes; arrow keys move between days. */
export default function MonthPicker({ value, enabled, min, max, onPick, onClose }: Props) {
  const start = new Date((value || min) + 'T00:00:00')
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() })
  const ref = useRef<HTMLDivElement>(null)
  const idx = view.y * 12 + view.m

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // move focus into the calendar when it opens / month changes
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-nav][aria-pressed="true"], [data-nav]')?.focus()
  }, [idx])

  const first = new Date(view.y, view.m, 1)
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISO(new Date(view.y, view.m, i + 1))),
  ]
  const label = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const go = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Choose a date"
      className="absolute right-0 top-full z-30 mt-2 w-[19rem] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={idx <= monthIndex(min)}
          onClick={() => go(-1)}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-slate-900" aria-live="polite">{label}</p>
        <button
          type="button"
          aria-label="Next month"
          disabled={idx >= monthIndex(max)}
          onClick={() => go(1)}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-600">
        {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1" onKeyDown={arrowNav}>
        {cells.map((iso, i) =>
          iso === null ? (
            <span key={`pad-${i}`} />
          ) : (
            <button
              key={iso}
              type="button"
              data-nav
              disabled={!enabled.has(iso)}
              aria-pressed={iso === value}
              onClick={() => { onPick(iso); onClose() }}
              className={`grid h-10 place-items-center rounded-full text-sm font-medium transition ${
                iso === value
                  ? 'bg-primary text-white shadow-sm'
                  : enabled.has(iso)
                    ? 'text-slate-800 hover:bg-primary-soft'
                    : 'cursor-not-allowed text-slate-300'
              }`}
            >
              {Number(iso.slice(8))}
            </button>
          ),
        )}
      </div>
      <p className="mt-3 text-xs text-slate-600">Greyed-out days are closed or fully booked.</p>
    </div>
  )
}
