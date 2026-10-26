import { test } from 'node:test'
import assert from 'node:assert/strict'

// Just enough canvas for bake(): records what gets drawn
globalThis.HTMLImageElement = class {}
const canvases = []
globalThis.document = {
  createElement: () => {
    const calls = []
    const c = { width: 0, height: 0, calls, toDataURL: t => `data:${t};x`, getContext: () => ctx }
    const ctx = { filter: globalThis.ctxFilter, drawImage: (...a) => calls.push(['draw', ctx.filter, ...a.slice(1)]) }
    canvases.push(c)
    return c
  },
}
const { bake } = await import('../dist/src/index.js')
const backdrop = { width: 1920, height: 1080 }

test('blurs with ctx.filter at 480px wide, overdrawn past the edges', async () => {
  globalThis.ctxFilter = 'none'
  canvases.length = 0
  assert.equal(await bake(backdrop, { blur: 40 }), 'data:image/jpeg;x')
  const [out] = canvases
  assert.deepEqual([out.width, out.height], [480, 270])
  assert.deepEqual(out.calls, [['draw', 'blur(10px) saturate(1.8)', -20, -20, 520, 310]])
})

test('without ctx.filter, downscales and stretches back', async () => {
  globalThis.ctxFilter = undefined
  canvases.length = 0
  await bake(backdrop, { blur: 40 })
  const [out, small] = canvases
  assert.deepEqual([small.width, small.height], [48, 27])
  assert.deepEqual(out.calls, [['draw', undefined, 0, 0, 480, 270]])
})
