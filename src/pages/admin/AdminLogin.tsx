import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Layouts'
import { Alert, Button, Field } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const err = login(email, password, 'admin')
    if (err) return setError(err)
    navigate('/admin', { replace: true })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-premium p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="text-center text-xl font-bold">Staff sign in</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" variant="premium" className="w-full">Sign in</Button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Demo: admin@smile.com / admin123</p>
      </div>
    </div>
  )
}
