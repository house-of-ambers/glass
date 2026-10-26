/**
 * The colored light of an icon from its RGBA pixels: the average color weighted by alpha × chroma
 * (max − min channel), so white or black backgrounds and gray type don't count.
 * Null for a white, black or gray logo: mean chroma below 24/255.
 */
export function tintOf(rgba: Uint8ClampedArray): [number, number, number] | null {
  let r = 0, g = 0, b = 0, weight = 0, alpha = 0, chroma = 0
  for (let i = 0; i < rgba.length; i += 4) {
    const R = rgba[i], G = rgba[i + 1], B = rgba[i + 2], A = rgba[i + 3]
    const c = Math.max(R, G, B) - Math.min(R, G, B)
    const w = A * c
    r += R * w; g += G * w; b += B * w
    weight += w; alpha += A; chroma += A * c
  }
  if (!weight || chroma / alpha < 24) return null
  return [Math.round(r / weight), Math.round(g / weight), Math.round(b / weight)]
}

/**
 * `tintOf` for an image, as a `tint` value: `glass(el, { profile: 'realistic', tint: tintFrom(logo) })`.
 * Undefined for a gray logo, so no tint gets set. Same-origin images only: a cross-origin one
 * taints the canvas and getImageData throws.
 */
export function tintFrom(img: HTMLImageElement | HTMLCanvasElement, alpha = 0.4): string | undefined {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0, 64, 64)
  const rgb = tintOf(ctx.getImageData(0, 0, 64, 64).data)
  return rgb ? `rgba(${rgb.join(', ')}, ${alpha})` : undefined
}
