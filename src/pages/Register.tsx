import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Field } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/services'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (form.name.trim().length < 2) errs.name = 'Please enter your full name.'
    if (!/^\+?[0-9\s-]{8,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number.'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    const err = register(form.name.trim(), form.email, form.phone, form.password)
    if (err) return setServerError(err)
    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold text-premium">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">It only takes a minute.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {serverError && <Alert>{serverError}</Alert>}
          <Field label="Full name" required value={form.name} onChange={set('name')} error={errors.name} />
          <Field label="Email" type="email" required value={form.email} onChange={set('email')} />
          <Field label="Phone" type="tel" required value={form.phone} onChange={set('phone')} error={errors.phone} />
          <Field label="Password" type="password" required value={form.password} onChange={set('password')} error={errors.password} />
          <Field label="Confirm password" type="password" required value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
          <Button type="submit" variant="fresh" className="w-full">Register</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered? <Link to="/login" state={{ from }} className="font-semibold text-primary hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
