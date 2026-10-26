export interface BakeOptions {
  /** Blur radius in px of the source image. Default: 24, like --blur. */
  blur?: number
}

/**
 * Blurs the page backdrop for `glass--baked`, where backdrop-filter is missing (old TV engines).
 * Pass the same sharp image the page shows as `background: url(…) center / cover fixed`, then
 * `el.style.setProperty('--glass-baked', `url(${await bake(img)})`)` on the glass or any ancestor.
 * Resolves to a JPEG data URL. The image must be same-origin, or the canvas can't be read.
 */
export async function bake(image: HTMLImageElement | HTMLCanvasElement, { blur = 24 }: BakeOptions = {}): Promise<string> {
  if (image instanceof HTMLImageElement && !image.complete) {
    await new Promise((ok, fail) => { image.addEventListener('load', ok, { once: true }); image.addEventListener('error', fail, { once: true }) })
  }
  const w = image instanceof HTMLImageElement ? image.naturalWidth : image.width
  const h = image instanceof HTMLImageElement ? image.naturalHeight : image.height
  // A blurred image needs no detail: bake small, CSS stretches it back
  const k = Math.min(1, 480 / w)
  const out = document.createElement('canvas')
  out.width = Math.round(w * k)
  out.height = Math.round(h * k)
  const ctx = out.getContext('2d')!
  const r = blur * k

  if (ctx.filter !== undefined) {
    ctx.filter = `blur(${r}px) saturate(1.8)`
    // Overdraw by 2r so the blur doesn't pull transparent black in from the edges.
    // shortcut: stretches the edges by ~2r px, invisible once blurred
    ctx.drawImage(image, -2 * r, -2 * r, out.width + 4 * r, out.height + 4 * r)
  } else {
    // No ctx.filter: downscale then let smoothing stretch it back, a soft box blur
    const small = document.createElement('canvas')
    small.width = Math.max(1, Math.round(out.width / Math.max(1, r)))
    small.height = Math.max(1, Math.round(out.height / Math.max(1, r)))
    small.getContext('2d')!.drawImage(image, 0, 0, small.width, small.height)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(small, 0, 0, out.width, out.height)
  }
  return out.toDataURL('image/jpeg', 0.85)
}
