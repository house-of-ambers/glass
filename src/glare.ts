import { deviceLight, moonAgeDays, moonPhase, type DeviceLightVector } from '../vendor/chronochrome/packages/core/src/index.js'

export interface GlareOptions {
  latitude: number
  longitude: number
  /** True compass bearing you look along when facing the screen, degrees (screen on an east wall, facing west: 90). Magnetic reading + local declination. */
  viewerHeading: number
  /** Default: now. */
  at?: Date
  /** Minimum strength while a body is up and in front of the screen, so light from the side still shows. Default: 0.2. */
  floor?: number
}

/** 0 when the body is below the horizon or behind the screen, else how squarely it faces the screen, at least `floor`. */
const strength = (v: DeviceLightVector, floor: number) => (v.altitudeDeg > 0 && v.z > 0 ? Math.max(floor, v.z) : 0)

const place = (name: string, v: DeviceLightVector, s: number): [string, string][] => [
  [`--glare-${name}-x`, `${(50 + 50 * v.x).toFixed(1)}%`],
  [`--glare-${name}-y`, `${(50 - 50 * v.y).toFixed(1)}%`],
  [`--glare-${name}`, s.toFixed(3)],
]

/**
 * Puts the realistic profile's glare where the sun and the moon really are, via chronochrome.
 * Sets `--glare-sun(-x|-y)` and `--glare-moon(-x|-y)`; the moon is scaled by how full it is.
 * `--glare-angle` turns the rim's bright side toward the stronger light.
 * Set it on any ancestor, e.g. `document.documentElement`, to light every glass piece.
 * Computed once for `at`; call again to follow the sky. Returns an undo.
 */
export function glare(el: HTMLElement, { latitude, longitude, viewerHeading, at = new Date(), floor = 0.2 }: GlareOptions): () => void {
  const { sun, moon } = deviceLight({ at, latitude, longitude, viewerHeading })
  const lit = (1 - Math.cos(2 * Math.PI * moonPhase(moonAgeDays(at)))) / 2
  const sunS = strength(sun, floor)
  const moonS = strength(moon, floor) * lit
  const light = sunS >= moonS ? sun : moon
  // CSS gradient angle whose 0% stop sits on the light's side: 0deg starts at the bottom, 90deg at the left
  const angle = sunS || moonS ? (Math.atan2(-light.x, -light.y) * 180) / Math.PI : 135
  const vars = [...place('sun', sun, sunS), ...place('moon', moon, moonS), ['--glare-angle', `${angle.toFixed(1)}deg`] as [string, string]]
  const prev = vars.map(([k]) => [k, el.style.getPropertyValue(k)] as const)
  for (const [k, v] of vars) el.style.setProperty(k, v)
  return () => { for (const [k, v] of prev) v ? el.style.setProperty(k, v) : el.style.removeProperty(k) }
}
