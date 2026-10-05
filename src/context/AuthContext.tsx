import { createContext, useContext, useState, type ReactNode } from 'react'

export type Role = 'patient' | 'admin'
export interface User {
  name: string
  email: string
  phone?: string
  role: Role
}
interface StoredUser extends User {
  password: string
}

interface AuthState {
  user: User | null
  login: (email: string, password: string, role?: Role) => string | null
  register: (name: string, email: string, phone: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const USERS_KEY = 'dental_users'
const SESSION_KEY = 'dental_session'

// Demo admin account (frontend-only until a backend exists)
const ADMIN: StoredUser = { name: 'Clinic Admin', email: 'admin@smile.com', password: 'admin123', role: 'admin' }

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => read<User | null>(SESSION_KEY, null))

  const startSession = ({ password: _p, ...u }: StoredUser) => {
    setUser(u)
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
  }

  const login: AuthState['login'] = (email, password, role = 'patient') => {
    const all = [ADMIN, ...read<StoredUser[]>(USERS_KEY, [])]
    const found = all.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role)
    if (!found) return 'Incorrect email or password. Please try again or reset your password.'
    startSession(found)
    return null
  }

  const register: AuthState['register'] = (name, email, phone, password) => {
    const users = read<StoredUser[]>(USERS_KEY, [])
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return 'An account with this email already exists.'
    const created: StoredUser = { name, email, phone, password, role: 'patient' }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, created]))
    startSession(created)
    return null
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
