import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellOff, CheckCheck, CircleCheck, Info, TriangleAlert, XCircle, type LucideIcon } from 'lucide-react'
import { useNotifications, type Notice, type NoticeType } from '../context/NotificationContext'
import { arrowNav } from '../lib/arrowNav'

const ICON: Record<NoticeType, { Icon: LucideIcon; cls: string }> = {
  info: { Icon: Info, cls: 'bg-primary-soft text-primary' },
  success: { Icon: CircleCheck, cls: 'bg-fresh-soft text-fresh-dark' },
  warning: { Icon: TriangleAlert, cls: 'bg-amber-100 text-amber-700' },
  danger: { Icon: XCircle, cls: 'bg-red-100 text-red-700' },
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

/** Bell with an unread badge and a dropdown list. Works for patients, doctors and admins. */
export default function NotificationBell() {
  const { items, unread, isUnread, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openItem = (n: Notice) => {
    markRead(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative grid h-11 w-11 place-items-center rounded-xl text-slate-700 transition hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-xs font-bold leading-none text-white ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-16 z-40 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-base font-bold text-slate-900">
              Notifications {unread > 0 && <span className="ml-1 rounded-full bg-primary-soft px-2 py-0.5 text-sm font-semibold text-primary">{unread} new</span>}
            </h2>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <BellOff className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2 font-semibold text-slate-800">You are all caught up</p>
              <p className="text-sm text-slate-600">Booking updates and reminders will show up here.</p>
            </div>
          ) : (
            <ul className="max-h-[min(24rem,60vh)] overflow-y-auto" onKeyDown={arrowNav}>
              {items.map((n) => {
                const { Icon, cls } = ICON[n.type]
                const fresh = isUnread(n)
                return (
                  <li key={n.id} className="border-b border-slate-100 last:border-0">
                    <button
                      type="button"
                      data-nav
                      onClick={() => openItem(n)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${fresh ? 'bg-primary-soft/50' : ''}`}
                    >
                      <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${cls}`}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm text-slate-900 ${fresh ? 'font-bold' : 'font-semibold'}`}>
                          {n.title}
                          {fresh && <span className="sr-only"> (unread)</span>}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-600">{n.body}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">{timeAgo(n.createdAt)}</span>
                      </span>
                      {fresh && <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
