import { Card, PageHeader } from '../../components/ui'
import { TIME_SLOTS, formatDate, isSlotTaken } from '../../data/mock'
import { useSlots } from '../../components/SlotPicker'
import { isActive, useDoctor } from './useDoctor'

/** Next two weeks: booked patients, busy times and open slots for this dentist. */
export default function DoctorSchedule() {
  const { user, mine } = useDoctor()
  const providerId = user?.providerId ?? ''
  const { days } = useSlots([providerId])
  const active = mine.filter(isActive)

  return (
    <>
      <PageHeader title="My schedule" subtitle="Your next 14 working days. Sundays are closed." />
      <div className="mb-5 flex flex-wrap gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded bg-primary" /> Patient booked</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded bg-slate-200" /> Busy / blocked</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded border border-fresh bg-fresh-soft" /> Open</span>
      </div>

      <div className="space-y-4">
        {days.map((d) => {
          const booked = active.filter((a) => a.date === d)
          const openCount = TIME_SLOTS.filter((t) => !isSlotTaken(providerId, d, t, active)).length
          return (
            <Card key={d} className="p-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold">{formatDate(d)}</h3>
                <span className="text-sm text-slate-500">{booked.length} patient{booked.length === 1 ? '' : 's'} · {openCount} open</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                {TIME_SLOTS.map((t) => {
                  const appt = booked.find((a) => a.time === t)
                  const busy = !appt && isSlotTaken(providerId, d, t, active)
                  return (
                    <div
                      key={t}
                      title={appt ? `${appt.fullName} (${appt.status})` : busy ? 'Busy' : 'Open'}
                      className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${
                        appt ? 'bg-primary text-white' : busy ? 'bg-slate-100 text-slate-400' : 'border border-fresh/40 bg-fresh-soft text-fresh-dark'
                      }`}
                    >
                      {t}
                      {appt && <span className="block truncate text-xs font-medium opacity-90">{appt.fullName.split(' ')[0]}</span>}
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
