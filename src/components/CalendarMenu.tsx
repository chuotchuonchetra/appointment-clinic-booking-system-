import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, ChevronDown, Download } from 'lucide-react'
import type { Appointment } from '../context/BookingContext'
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl } from '../lib/calendar'
import { arrowNav } from '../lib/arrowNav'
import { Button } from './ui'

const itemCls =
  'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-slate-800 transition hover:bg-primary-soft'

/** "Add to calendar" button with a small menu: Google, Apple, Outlook or an .ics download. */
export default function CalendarMenu({ appt }: { appt: Appointment }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>('[data-nav]')?.focus()
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={root} className="relative w-full sm:w-auto">
      <Button
        ref={trigger}
        variant="outline"
        className="w-full sm:w-auto"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarPlus className="h-4 w-4" /> Add to calendar <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Add to calendar"
          onKeyDown={arrowNav}
          className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200 sm:right-auto sm:w-64"
        >
          <a role="menuitem" data-nav href={googleCalendarUrl(appt)} target="_blank" rel="noopener noreferrer" onClick={close} className={itemCls}>
            Google Calendar
          </a>
          <button role="menuitem" data-nav type="button" onClick={() => { downloadIcs(appt); close() }} className={itemCls}>
            Apple Calendar
          </button>
          <a role="menuitem" data-nav href={outlookCalendarUrl(appt)} target="_blank" rel="noopener noreferrer" onClick={close} className={itemCls}>
            Outlook
          </a>
          <button role="menuitem" data-nav type="button" onClick={() => { downloadIcs(appt); close() }} className={`${itemCls} border-t border-slate-100`}>
            <Download className="h-4 w-4 text-slate-600" /> Download .ics file
          </button>
        </div>
      )}
    </div>
  )
}
