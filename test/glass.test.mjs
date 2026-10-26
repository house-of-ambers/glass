import { test } from 'node:test'
import assert from 'node:assert/strict'
import { glass } from '../dist/index.js'

// Just enough of HTMLElement for glass(): classList + style custom properties
function fakeEl(classes = [], vars = {}) {
  const cls = new Set(classes)
  const props = new Map(Object.entries(vars))
  return {
    cls, props,
    classList: { add: (...c) => c.forEach(x => cls.add(x)), remove: (...c) => c.forEach(x => cls.delete(x)), contains: c => cls.has(c) },
    style: { getPropertyValue: k => props.get(k) ?? '', setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k) },
  }
}

test('simplified by default, no vars', () => {
  const el = fakeEl()
  glass(el)
  assert.deepEqual([...el.cls], ['glass'])
  assert.equal(el.props.size, 0)
})

test('realistic sets classes and vars, undo removes them', () => {
  const el = fakeEl()
  const undo = glass(el, { profile: 'realistic', blur: 12, thickness: 0.5, tint: 'red' })
  assert.deepEqual([...el.cls], ['glass', 'glass--realistic'])
  assert.deepEqual(Object.fromEntries(el.props), { '--blur': '12px', '--thickness': '0.5', '--tint': 'red' })
  undo()
  assert.equal(el.cls.size, 0)
  assert.equal(el.props.size, 0)
})

test('undo keeps what was there before', () => {
  const el = fakeEl(['glass'], { '--blur': '40px' })
  glass(el, { profile: 'realistic', blur: 8 })()
  assert.deepEqual([...el.cls], ['glass'])
  assert.deepEqual(Object.fromEntries(el.props), { '--blur': '40px' })
})
