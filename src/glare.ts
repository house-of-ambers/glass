import { deviceLight, moonAgeDays, moonPhase, type DeviceLightVector } from '../vendor/chronochrome/packages/core/src/index.js'

export interface GlareOptions {
  latitude: number
  longitude: number
  /** True compass bearing the screen faces, degrees (west wall: 270). Magnetic reading + local declination. */
  heading: number
  /** Default: now. */
  at?: Date
}

/** 0 when the body is below the horizon or behind the screen, else how squarely it faces the screen. */
const strength = (v: DeviceLightVector) => (v.altitudeDeg > 0 ? Math.max(0, v.z) : 0)

const place = (name: string, v: DeviceLightVector, k: number): [string, string][] => [
  [`--glare-${name}-x`, `${(50 + 50 * v.x).toFixed(1)}%`],
  [`--glare-${name}-y`, `${(50 - 50 * v.y).toFixed(1)}%`],
  [`--glare-${name}`, (strength(v) * k).toFixed(3)],
]

/**
 * Puts the realistic profile's glare where the sun and the moon really are, via chronochrome.
 * Sets `--glare-sun(-x|-y)` and `--glare-moon(-x|-y)`; the moon is scaled by how full it is.
 * Set it on any ancestor, e.g. `document.documentElement`, to light every glass piece.
 * Computed once for `at`; call again to follow the sky. Returns an undo.
 */
export function glare(el: HTMLElement, { latitude, longitude, heading, at = new Date() }: GlareOptions): () => void {
  const { sun, moon } = deviceLight({ at, latitude, longitude, heading })
  const lit = (1 - Math.cos(2 * Math.PI * moonPhase(moonAgeDays(at)))) / 2
  const vars = [...place('sun', sun, 1), ...place('moon', moon, lit)]
  const prev = vars.map(([k]) => [k, el.style.getPropertyValue(k)] as const)
  for (const [k, v] of vars) el.style.setProperty(k, v)
  return () => { for (const [k, v] of prev) v ? el.style.setProperty(k, v) : el.style.removeProperty(k) }
}
