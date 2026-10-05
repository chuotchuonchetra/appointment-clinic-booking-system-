import { useState } from 'react'
import { Mail, NotebookPen, Phone } from 'lucide-react'
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui'
import type { Appointment, Status } from '../../context/BookingContext'
import { formatDate, getService } from '../../data/mock'
import { startOf, useDoctor } from './useDoctor'

const filters: ('all' | Status)[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

function NoteEditor({ a, onSave }: { a: Appointment; onSave: (note: string) => void }) {
  const [note, setNote] = useState(a.doctorNote ?? '')
  const dirty = note !== (a.doctorNote ?? '')
  return (
    <div className="mt-4 rounded-xl bg-slate-50 p-3">
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <NotebookPen className="h-3.5 w-3.5" /> Clinical note (private)
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Diagnosis, treatment given, follow-up…"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      <div className="mt-2 flex justify-end">
        <Button variant="outline" className="px-3 py-1.5" disabled={!dirty} onClick={() => onSave(note)}>Save note</Button>
      </div>
    </div>
  )
}

export default function DoctorAppointments() {
  const { mine, updateAppointment } = useDoctor()
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [search, setSearch] = useState('')

  const rows = mine
    .filter((a) => (filter === 'all' || a.status === filter) && (a.fullName + a.email + a.id).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => startOf(a) - startOf(b))

  return (
    <>
      <PageHeader title="My patients" subtitle="Confirm bookings, complete visits and keep notes." />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`min-h-10 rounded-full px-4 text-sm font-medium capitalize ${
              filter === f ? 'bg-premium text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {f} {f !== 'all' && <span className="opacity-60">({mine.filter((a) => a.status === f).length})</span>}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient…"
          className="ml-auto min-h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </div>

      {rows.length === 0 ? (
        <Card className="py-12 text-center text-slate-500">No appointments found.</Card>
      ) : (
        <div className="space-y-4">
          {rows.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{a.fullName}</h3>
                  <p className="text-sm text-slate-500">{getService(a.serviceId)?.name} · {formatDate(a.date)} · <b className="text-slate-700">{a.time}</b></p>
                  <p className="mt-1 flex flex-wrap gap-x-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {a.phone}</span>
                    <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {a.email}</span>
                  </p>
                  {a.notes && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"><b>Patient note:</b> {a.notes}</p>}
                  {a.feedback && <p className="mt-2 text-sm text-slate-500">Patient rating: <b className="text-amber-500">{a.feedback.rating}/5</b>{a.feedback.comment && ` — “${a.feedback.comment}”`}</p>}
                </div>
                <StatusBadge status={a.status} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {a.status === 'pending' && <Button variant="fresh" onClick={() => updateAppointment(a.id, { status: 'confirmed' })}>Confirm</Button>}
                {a.status === 'confirmed' && <Button onClick={() => updateAppointment(a.id, { status: 'completed', paid: true })}>Mark completed</Button>}
                {(a.status === 'pending' || a.status === 'confirmed') && (
                  <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => updateAppointment(a.id, { status: 'cancelled' })}>Cancel</Button>
                )}
              </div>

              {a.status !== 'cancelled' && <NoteEditor key={a.id + (a.doctorNote ?? '')} a={a} onSave={(doctorNote) => updateAppointment(a.id, { doctorNote })} />}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
