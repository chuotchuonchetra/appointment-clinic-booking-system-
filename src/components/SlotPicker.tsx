import { useMemo } from 'react'
import { useBooking } from '../context/BookingContext'
import { TIME_SLOTS, formatDate, isSlotTaken, isSunday, toISO } from '../data/mock'

interface Props {
  providerId: string
  date: string
  time: string
  ignoreId?: string
  onDate: (d: string) => void
  onTime: (t: string) => void
}

/** Date strip + time-slot grid with disabled (booked) slots and next-available suggestions. */
export default function SlotPicker({ providerId, date, time, ignoreId, onDate, onTime }: Props) {
  const { appointments } = useBooking()
  const booked = useMemo(
    () => appointments.filter((a) => a.status !== 'cancelled' && a.id !== ignoreId),
    [appointments, ignoreId],
  )

  const days = useMemo(() => {
    const out: string[] = []
    const d = new Date()
    d.setDate(d.getDate() + 1)
    while (out.length < 14) {
      const iso = toISO(d)
      if (!isSunday(iso)) out.push(iso)
      d.setDate(d.getDate() + 1)
    }
    return out
  }, [])

  const free = (day: string) => TIME_SLOTS.filter((t) => !isSlotTaken(providerId, day, t, booked))
  const slots = date ? free(date) : []
  const alternatives = date && slots.length === 0 ? days.filter((d) => d !== date && free(d).length > 0).slice(0, 3) : []

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">Choose a date</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const dt = new Date(d + 'T00:00:00')
          const active = d === date
          return (
            <button
              key={d}
              onClick={() => { onDate(d); onTime('') }}
              className={`w-16 shrink-0 rounded-xl border-2 py-2 text-center transition ${
                active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white hover:border-primary'
              }`}
            >
              <span className="block text-xs">{dt.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className="block text-lg font-bold">{dt.getDate()}</span>
              <span className="block text-xs">{dt.toLocaleDateString('en-US', { month: 'short' })}</span>
            </button>
          )
        })}
      </div>

      {date && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-slate-700">Available times on {formatDate(date)}</p>
          {slots.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No slots available on this date.
              {alternatives.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {alternatives.map((d) => (
                    <button key={d} onClick={() => onDate(d)} className="rounded-full bg-white px-3 py-1 font-medium text-primary ring-1 ring-primary/30 hover:bg-primary-soft">
                      Try {formatDate(d)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIME_SLOTS.map((t) => {
                const taken = isSlotTaken(providerId, date, t, booked)
                return (
                  <button
                    key={t}
                    disabled={taken}
                    onClick={() => onTime(t)}
                    className={`rounded-lg border-2 py-2 text-sm font-medium transition ${
                      taken
                        ? 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400 line-through'
                        : t === time
                          ? 'border-fresh bg-fresh text-white'
                          : 'border-slate-200 bg-white hover:border-fresh'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
