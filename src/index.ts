export type GlassProfile = 'simplified' | 'realistic'

export interface GlassOptions {
  /** Default: 'simplified'. */
  profile?: GlassProfile
  /** Blur radius in px. Default: 24. */
  blur?: number
  /** Blur multiplier, e.g. 0.5 for small pills. Default: 1. */
  thickness?: number
  /** Colored light inside the glass, any CSS color. Realistic profile only. */
  tint?: string
  /** Rim width and rim/shine strength, ~2.5 for a 55" TV at 3 m. Realistic profile only. Default: 1. */
  scale?: number
}

/**
 * Turns an element into glass. Needs the stylesheet loaded once:
 * `import '@house-of-ambers/glass/glass.css'`.
 * Returns a function that puts the element back the way it was.
 */
export function glass(el: HTMLElement, { profile = 'simplified', blur, thickness, tint, scale }: GlassOptions = {}): () => void {
  const classes = (profile === 'realistic' ? ['glass', 'glass--realistic'] : ['glass'])
    .filter(c => !el.classList.contains(c))
  const vars = Object.entries({
    '--blur': blur === undefined ? undefined : `${blur}px`,
    '--thickness': thickness?.toString(),
    '--tint': tint,
    '--glass-scale': scale?.toString(),
  }).filter((e): e is [string, string] => e[1] !== undefined)
  const prev = vars.map(([k]) => [k, el.style.getPropertyValue(k)] as const)

  el.classList.add(...classes)
  for (const [k, v] of vars) el.style.setProperty(k, v)

  return () => {
    el.classList.remove(...classes)
    for (const [k, v] of prev) v ? el.style.setProperty(k, v) : el.style.removeProperty(k)
  }
}
export { glare, type GlareOptions } from './glare.js'
export { bake, type BakeOptions } from './bake.js'
