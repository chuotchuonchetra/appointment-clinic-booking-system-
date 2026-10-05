import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { Alert, Button, Field } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const stateFrom = (useLocation().state as { from?: string } | null)?.from
  const from = stateFrom ?? '/services'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const isBooking = from.startsWith('/services') || from.startsWith('/book')

  // One login for everyone. Admins and doctors always land on their dashboard first
  // (unless they were already heading to a page inside their own area); patients return to where they were.
  const destination = (role: string) => {
    if (role === 'admin') return stateFrom?.startsWith('/admin') ? stateFrom : '/admin'
    if (role === 'doctor') return stateFrom?.startsWith('/doctor') ? stateFrom : '/doctor'
    return stateFrom ?? '/services'
  }

  if (user) return <Navigate to={destination(user.role)} replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const res = login(email, password)
    if (res.error || !res.user) return setError(res.error ?? 'Login failed.')
    navigate(destination(res.user.role), { replace: true })
  }

  const reset = () => {
    if (!email) return setError('Enter your email first, then click "Forgot password".')
    setError('')
    setResetSent(true)
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to book and manage your appointments.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {isBooking && !error && <Alert type="info">Please log in to book your appointment. New here? Create a free account below.</Alert>}
        {error && <Alert>{error}</Alert>}
        {resetSent && <Alert type="success">A password reset link has been sent to {email}.</Alert>}
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="button" onClick={reset} className="text-sm font-medium text-primary hover:underline">Forgot password?</button>
        <Button type="submit" className="w-full">Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New patient? <Link to="/register" state={{ from }} className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  )
}
