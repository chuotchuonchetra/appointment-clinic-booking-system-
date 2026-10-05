import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'

/** Simple accessible dialog: Esc and backdrop click close it, focus moves into it when it opens. */
export default function Modal({ children, onClose, wide, label }: { children: ReactNode; onClose: () => void; wide?: boolean; label: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-40 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl outline-none ${wide ? 'max-w-2xl' : 'max-w-md'}`}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
