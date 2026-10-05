import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import type { Status } from '../context/BookingContext'

type Variant = 'primary' | 'fresh' | 'premium' | 'outline' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  fresh: 'bg-fresh text-white hover:bg-fresh-dark',
  premium: 'bg-premium text-white hover:bg-premium-dark',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20'

export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input {...props} className={`${inputCls} ${error ? 'border-red-400' : ''}`} />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function TextArea({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
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
  return <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
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
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-premium">{title}</h1>
      {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
    </div>
  )
}
