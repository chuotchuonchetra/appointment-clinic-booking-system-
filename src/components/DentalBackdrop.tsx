import { Smile, Sparkles, Toothbrush } from 'lucide-react'

const TOOTH =
  'M36 22c-12 0-20 9-20 22 0 10 4 16 7 27 3 11 4 29 12 29 6 0 6-18 11-18h6c5 0 5 18 11 18 8 0 9-18 12-29 3-11 7-17 7-27 0-13-8-22-20-22-7 0-11 3-16 3s-9-3-10-3z'

/** Very faint dental illustrations in the page's negative space. Purely decorative. */
export default function DentalBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden text-primary">
      <svg viewBox="0 0 120 120" className="absolute -right-16 -top-10 h-80 w-80 rotate-12 opacity-[0.06]">
        <path d={TOOTH} fill="currentColor" />
      </svg>
      <svg viewBox="0 0 120 120" className="absolute -bottom-16 -left-14 h-96 w-96 -rotate-12 opacity-[0.05]">
        <path d={TOOTH} fill="currentColor" />
      </svg>
      <svg viewBox="0 0 120 120" className="absolute right-[6%] top-[52%] hidden h-40 w-40 rotate-[24deg] opacity-[0.07] lg:block">
        <path d={TOOTH} fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      <Toothbrush className="absolute left-[4%] top-[30%] hidden h-24 w-24 -rotate-12 opacity-[0.08] lg:block" strokeWidth={1} />
      <Smile className="absolute bottom-[14%] right-[10%] hidden h-28 w-28 text-primary opacity-[0.07] lg:block" strokeWidth={1} />
      <Sparkles className="absolute left-[18%] top-6 hidden h-16 w-16 opacity-[0.1] md:block" strokeWidth={1} />
    </div>
  )
}
