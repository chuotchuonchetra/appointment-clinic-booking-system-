import type { ReactNode } from 'react'
import { Bell, ClipboardList, Repeat2, Zap } from 'lucide-react'

const perks = [
  [Zap, 'Book in under 2 minutes'],
  [Bell, 'Email & SMS reminders'],
  [Repeat2, 'Free reschedule or cancel'],
  [ClipboardList, 'All your visits in one place'],
] as const

/** Split layout: brand panel on the left (desktop), form on the right. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-0 px-4 py-8 md:grid-cols-2 md:py-14">
      <aside className="hidden flex-col justify-between rounded-l-3xl bg-linear-to-br from-primary to-premium p-10 text-white md:flex">
        <div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">Your smile, <br />simply scheduled.</h2>
          <p className="mt-3 text-blue-50">Join thousands of patients who book their dental care online.</p>
        </div>
        <ul className="mt-10 space-y-3">
          {perks.map(([Icon, text]) => (
            <li key={text} className="flex items-center gap-3 text-sm font-medium">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><Icon className="h-4 w-4" /></span>{text}
            </li>
          ))}
        </ul>
      </aside>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 md:rounded-l-none md:rounded-r-3xl md:p-10">
        {children}
      </div>
    </div>
  )
}
