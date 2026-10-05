import { createContext, useContext, useState, type ReactNode } from 'react'

export type Role = 'patient' | 'admin' | 'doctor'
export interface User {
  name: string
  email: string
  phone?: string
  role: Role
  /** For doctors: which dentist (data/mock providers) this account belongs to. */
  providerId?: string
}
interface StoredUser extends User {
  password: string
}

interface AuthState {
  user: User | null
  /** One login for everyone: returns the signed-in user (check `role`) or an error message. */
  login: (email: string, password: string) => { user?: User; error?: string }
  register: (name: string, email: string, phone: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const USERS_KEY = 'dental_users'
const SESSION_KEY = 'dental_session'

// Demo admin account (frontend-only until a backend exists)
const ADMIN: StoredUser = { name: 'Clinic Admin', email: 'admin@smile.com', password: 'admin123', role: 'admin' }
const DOCTORS: StoredUser[] = [
  { name: 'Dr. Sophea Chan', email: 'sophea@smile.com', password: 'doctor123', role: 'doctor', providerId: 'p1' },
  { name: 'Dr. Vannak Sok', email: 'vannak@smile.com', password: 'doctor123', role: 'doctor', providerId: 'p2' },
  { name: 'Dr. Mealea Kim', email: 'mealea@smile.com', password: 'doctor123', role: 'doctor', providerId: 'p3' },
]
const DEMO_PATIENT: StoredUser = { name: 'Demo Patient', email: 'patient@smile.com', phone: '+855 12 345 678', password: 'patient123', role: 'patient' }

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

  const startSession = ({ password: _p, ...u }: StoredUser): User => {
    setUser(u)
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    return u
  }

  const login: AuthState['login'] = (email, password) => {
    const all = [ADMIN, ...DOCTORS, DEMO_PATIENT, ...read<StoredUser[]>(USERS_KEY, [])]
    const found = all.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) return { error: 'Incorrect email or password. Please try again or reset your password.' }
    return { user: startSession(found) }
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
