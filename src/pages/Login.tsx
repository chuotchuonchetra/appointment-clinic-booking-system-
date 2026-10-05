import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Field } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/services'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err = login(email, password)
    if (err) return setError(err)
    navigate(from, { replace: true })
  }

  const reset = () => {
    if (!email) return setError('Enter your email first, then click "Forgot password".')
    setError('')
    setResetSent(true)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold text-premium">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to book and manage your appointments.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <Alert>{error}</Alert>}
          {resetSent && <Alert type="success">A password reset link has been sent to {email}.</Alert>}
          <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={reset} className="text-sm font-medium text-primary hover:underline">Forgot password?</button>
          <Button type="submit" className="w-full">Log in</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New patient? <Link to="/register" state={{ from }} className="font-semibold text-primary hover:underline">Create an account</Link>
        </p>
      </Card>
    </div>
  )
}
