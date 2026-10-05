import type { KeyboardEvent } from 'react'

const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']

/**
 * Keyboard navigation for a group of controls. Put `data-nav` on each control and
 * call this from the group's onKeyDown. Left/Right/Home/End move through the
 * controls in order; Up/Down move to the nearest control in the row above/below
 * (so it works for grids). Disabled and aria-disabled controls are skipped.
 * With `select: true` the control that receives focus is also activated (radio-group behaviour).
 */
export function arrowNav(e: KeyboardEvent<HTMLElement>, opts: { select?: boolean } = {}) {
  if (!KEYS.includes(e.key)) return
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[data-nav]')).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true',
  )
  const cur = items.indexOf(document.activeElement as HTMLElement)
  if (cur < 0) return
  const rect = items[cur].getBoundingClientRect()
  let next = cur

  if (e.key === 'ArrowRight') next = Math.min(cur + 1, items.length - 1)
  else if (e.key === 'ArrowLeft') next = Math.max(cur - 1, 0)
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = items.length - 1
  else {
    const dir = e.key === 'ArrowDown' ? 1 : -1
    const others = items
      .map((el, i) => ({ i, r: el.getBoundingClientRect() }))
      .filter((x) => (dir > 0 ? x.r.top > rect.top + 4 : x.r.top < rect.top - 4))
    if (!others.length) return // single row: let the page scroll normally
    const rowTop = dir > 0 ? Math.min(...others.map((x) => x.r.top)) : Math.max(...others.map((x) => x.r.top))
    const row = others.filter((x) => Math.abs(x.r.top - rowTop) < 4)
    next = row.reduce((best, x) => (Math.abs(x.r.left - rect.left) < Math.abs(best.r.left - rect.left) ? x : best)).i
  }

  e.preventDefault()
  items[next].focus()
  items[next].scrollIntoView({ block: 'nearest', inline: 'nearest' })
  if (opts.select) items[next].click()
}
