import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useAuth, type User } from './AuthContext'

export type NoticeType = 'info' | 'success' | 'warning' | 'danger'

export interface Notice {
  id: string
  /** Recipient keys: `email:<address>`, `role:admin` or `provider:<id>` (see keysFor). */
  to: string[]
  type: NoticeType
  title: string
  body: string
  link?: string
  /** Email of whoever caused it. They see it in the bell but are not toasted about their own action. */
  actor?: string
  /** Same key = only ever created once (used for reminders). */
  dedupeKey?: string
  createdAt: string
  readBy: string[]
}
export type NewNotice = Omit<Notice, 'id' | 'createdAt' | 'readBy'>

interface NotificationState {
  /** Notices addressed to the signed-in user, newest first. */
  items: Notice[]
  unread: number
  isUnread: (n: Notice) => boolean
  notify: (notices: NewNotice[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
}

const KEY = 'dental_notifications'
const MAX = 200
const NotificationContext = createContext<NotificationState | null>(null)

/** crypto.randomUUID only exists on secure origins (https / localhost), so fall back for LAN testing. */
const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const toEmail = (email: string) => `email:${email.toLowerCase()}`

/** Which recipient keys a signed-in user receives. */
const keysFor = (u: User) => [
  toEmail(u.email),
  ...(u.role === 'admin' ? ['role:admin'] : []),
  ...(u.role === 'doctor' && u.providerId ? [`provider:${u.providerId}`] : []),
]

const load = (): Notice[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Notice[]
  } catch {
    return []
  }
}

const toastBy: Record<NoticeType, typeof toast.info> = {
  info: toast.info,
  success: toast.success,
  warning: toast.warning,
  danger: toast.error,
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notices, setNotices] = useState<Notice[]>(load)

  // persist (only when it actually differs, so cross-tab sync cannot ping-pong)
  useEffect(() => {
    const json = JSON.stringify(notices)
    if (localStorage.getItem(KEY) !== json) localStorage.setItem(KEY, json)
  }, [notices])

  // another tab of the same browser changed notices: pick it up live
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setNotices(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const notify = useCallback((list: NewNotice[]) => {
    setNotices((prev) => {
      let next = prev
      for (const n of list) {
        if (n.dedupeKey && next.some((x) => x.dedupeKey === n.dedupeKey)) continue
        next = [{ ...n, id: uid(), createdAt: new Date().toISOString(), readBy: [] }, ...next]
      }
      return next.slice(0, MAX)
    })
  }, [])

  const items = useMemo(() => {
    if (!user) return []
    const keys = keysFor(user)
    return notices.filter((n) => n.to.some((k) => keys.includes(k)))
  }, [notices, user])

  const isUnread = useCallback((n: Notice) => !!user && !n.readBy.includes(user.email), [user])
  const unread = items.filter(isUnread).length

  const markRead = useCallback(
    (id: string) => {
      if (!user) return
      setNotices((prev) => prev.map((n) => (n.id === id && !n.readBy.includes(user.email) ? { ...n, readBy: [...n.readBy, user.email] } : n)))
    },
    [user],
  )
  const markAllRead = useCallback(() => {
    if (!user) return
    const keys = keysFor(user)
    setNotices((prev) =>
      prev.map((n) => (n.to.some((k) => keys.includes(k)) && !n.readBy.includes(user.email) ? { ...n, readBy: [...n.readBy, user.email] } : n)),
    )
  }, [user])

  // Toast brand-new notices that arrive while the user is signed in (not the history, not their own actions).
  const seen = useRef<Set<string> | null>(null)
  useEffect(() => {
    if (!user) {
      seen.current = null
      return
    }
    if (seen.current === null) {
      seen.current = new Set(items.map((n) => n.id))
      return
    }
    for (const n of items) {
      if (seen.current.has(n.id)) continue
      seen.current.add(n.id)
      if (n.actor !== user.email && !n.readBy.includes(user.email)) toastBy[n.type](n.title, { description: n.body })
    }
  }, [items, user])

  return (
    <NotificationContext.Provider value={{ items, unread, isUnread, notify, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
