import type { ComponentPropsWithRef, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { motion } from 'motion/react'
import type { Status } from '../context/BookingContext'

type Variant = 'primary' | 'fresh' | 'premium' | 'outline' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary-dark',
  fresh: 'bg-fresh text-white shadow-sm shadow-fresh/30 hover:bg-fresh-dark',
  premium: 'bg-premium text-white shadow-sm shadow-premium/30 hover:bg-premium-dark',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ComponentPropsWithRef<'button'> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 items-center whitespace-nowrap justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:border-transparent disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:hover:bg-slate-200 disabled:active:scale-100 ${variants[variant]} ${className}`}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}>{children}</div>
}

/** Fades and lifts content in as it scrolls into view. */
export function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

const inputCls =
  'w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/15'

export function Field({
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input {...props} aria-invalid={!!error} className={`${inputCls} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`} />
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

export function TextArea({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea {...props} className={inputCls} rows={3} />
    </label>
  )
}

export function Alert({ type = 'error', children }: { type?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-primary/20 bg-primary-soft text-primary-dark',
    success: 'border-fresh/30 bg-fresh-soft text-fresh-dark',
  }
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  )
}

const statusStyles: Record<Status, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-fresh-soft text-fresh-dark',
  completed: 'bg-primary-soft text-primary-dark',
  cancelled: 'bg-slate-100 text-slate-500',
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}>{status}</span>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-slate-600">{subtitle}</p>}
    </div>
  )
}
