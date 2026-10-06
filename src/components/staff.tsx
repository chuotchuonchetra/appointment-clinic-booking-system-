import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Search, type LucideIcon } from 'lucide-react'

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]

export const initials = (name = '') =>
  name.replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

/** Initials avatar with a stable colour per name. */
export function Avatar({ name, size = 'md', className = '' }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${sizes[size]} ${avatarColors[h % avatarColors.length]} ${className}`} aria-hidden>
      {initials(name)}
    </span>
  )
}

/** White panel with an optional header row (title, subtitle, action). */
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = 'p-5',
}: {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
      {title && (
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

const tones = {
  blue: 'bg-blue-50 text-blue-600 ring-blue-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  teal: 'bg-teal-50 text-teal-600 ring-teal-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
}
export type Tone = keyof typeof tones

/** KPI tile: icon chip, big number and a small footnote. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  note,
  delay = 0,
}: {
  label: string
  value: ReactNode
  icon: LucideIcon
  tone?: Tone
  note?: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      {note && <div className="mt-1 text-xs text-slate-500">{note}</div>}
    </motion.div>
  )
}

/** Simple vertical bar chart; highlights the bar flagged `active`. */
export function BarChart({ data }: { data: { label: string; sub?: string; value: number; active?: boolean }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex h-52 items-end gap-2 sm:gap-3" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(', ')}>
      {data.map((d, i) => (
        <div key={d.label + i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs font-semibold text-slate-700 tabular-nums">{d.value}</span>
          <div className="relative flex w-full max-w-12 flex-1 items-end overflow-hidden rounded-lg bg-slate-100">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
              className={`w-full rounded-lg ${d.active ? 'bg-primary' : 'bg-primary/35'}`}
            />
          </div>
          <span className={`text-xs ${d.active ? 'font-semibold text-primary' : 'text-slate-500'}`}>{d.label}</span>
          {d.sub && <span className="-mt-2 text-[10px] text-slate-400">{d.sub}</span>}
        </div>
      ))}
    </div>
  )
}

/** Ring chart with a centred total and a legend. */
export function Donut({ data, centerLabel }: { data: { label: string; value: number; color: string }[]; centerLabel: string }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const r = 42
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
          {total > 0 &&
            data.map((d) => {
              const len = (d.value / total) * c
              const el = (
                <motion.circle
                  key={d.label}
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="12"
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )
              offset += len
              return el
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{total}</p>
            <p className="text-xs text-slate-500">{centerLabel}</p>
          </div>
        </div>
      </div>
      <ul className="w-full space-y-2.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="capitalize text-slate-600">{d.label}</span>
            <span className="ml-auto font-semibold text-slate-900 tabular-nums">{d.value}</span>
            <span className="w-10 text-right text-xs text-slate-400 tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Thin horizontal progress bar. */
export function Progress({ value, max, className = 'bg-primary' }: { value: number; max: number; className?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <motion.div
        className={`h-full rounded-full ${className}`}
        initial={{ width: 0 }}
        animate={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Icon className="h-6 w-6" /></span>
      <p className="mt-3 font-medium text-slate-700">{title}</p>
      {text && <p className="mt-1 max-w-xs text-sm text-slate-500">{text}</p>}
    </div>
  )
}

/** Segmented filter control used on staff list pages. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  counts?: Partial<Record<T, number>>
}) {
  return (
    <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium capitalize transition ${
            value === o ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {o}
          {counts?.[o] !== undefined && (
            <span className={`rounded-md px-1.5 text-xs tabular-nums ${value === o ? 'bg-primary-soft text-primary' : 'bg-slate-200/70 text-slate-500'}`}>{counts[o]}</span>
          )}
        </button>
      ))}
    </div>
  )
}

/** Search box with a leading icon. */
export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative block md:w-72">
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
    </label>
  )
}
