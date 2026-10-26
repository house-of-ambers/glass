import { test } from 'node:test'
import assert from 'node:assert/strict'
import { glare } from '../dist/src/index.js'

// viewerHeading 92: you look east, the screen faces west
const YAR = { latitude: 57.6261, longitude: 39.8845, viewerHeading: 92 }
const fakeEl = (vars = {}) => {
  const props = new Map(Object.entries(vars))
  return { props, style: { getPropertyValue: k => props.get(k) ?? '', setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k) } }
}

test('september evening: low sun in front of a west-facing screen', () => {
  const el = fakeEl()
  glare(el, { ...YAR, at: new Date('2026-09-02T18:00:00+03:00') })
  assert.ok(Number(el.props.get('--glare-sun')) > 0.5)
  assert.match(el.props.get('--glare-sun-x'), /%$/)
})

test('full moon at night: no sun, moon glare when it is in front', () => {
  const el = fakeEl()
  // 2024-01-25 full moon, chronochrome's own test date; the moon is opposite the sun
  glare(el, { ...YAR, viewerHeading: 270, at: new Date('2024-01-25T17:54:00Z') })
  assert.equal(el.props.get('--glare-sun'), '0.000')
  assert.ok(Number(el.props.get('--glare-moon')) > 0)
})

test('undo restores what was there', () => {
  const el = fakeEl({ '--glare-sun': '0.5' })
  glare(el, { ...YAR, at: new Date('2026-09-02T18:00:00+03:00') })()
  assert.deepEqual(Object.fromEntries(el.props), { '--glare-sun': '0.5' })
})

test('floor lifts a side light that is barely in front, but not one behind the screen', () => {
  const at = new Date('2026-09-02T13:00:00+03:00') // sun south-southwest, z ≈ 0.15 for the west-facing screen
  const el = fakeEl()
  glare(el, { ...YAR, at })
  assert.equal(el.props.get('--glare-sun'), '0.200')
  glare(el, { ...YAR, at, floor: 0 })
  assert.ok(Number(el.props.get('--glare-sun')) < 0.2)
  glare(el, { ...YAR, at: new Date('2026-09-02T11:00:00+03:00') }) // morning: sun behind the screen
  assert.equal(el.props.get('--glare-sun'), '0.000')
})

test('rim angle points the bright stop at the light: upper right here', () => {
  const el = fakeEl()
  glare(el, { ...YAR, at: new Date('2026-09-02T13:00:00+03:00') })
  const angle = parseFloat(el.props.get('--glare-angle'))
  assert.ok(angle > -140 && angle < -120, `angle=${angle}`) // -135deg ≡ 225deg: starts at the top right
  glare(el, { ...YAR, at: new Date('2026-09-02T01:00:00+03:00') }) // no light at all: default top-left
  assert.equal(el.props.get('--glare-angle'), '135.0deg')
})
