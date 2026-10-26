import { test } from 'node:test'
import assert from 'node:assert/strict'
import { glare } from '../dist/src/index.js'

const YAR = { latitude: 57.6261, longitude: 39.8845, heading: 272 }
const fakeEl = (vars = {}) => {
  const props = new Map(Object.entries(vars))
  return { props, style: { getPropertyValue: k => props.get(k) ?? '', setProperty: (k, v) => props.set(k, v), removeProperty: k => props.delete(k) } }
}

test('september evening: low sun in front of a west-facing screen, glare on the right side of the sky', () => {
  const el = fakeEl()
  glare(el, { ...YAR, at: new Date('2026-09-02T18:00:00+03:00') })
  assert.ok(Number(el.props.get('--glare-sun')) > 0.5)
  assert.match(el.props.get('--glare-sun-x'), /%$/)
})

test('full moon at night: no sun, moon glare when it is in front', () => {
  const el = fakeEl()
  // 2024-01-25 full moon, chronochrome's own test date; the moon is opposite the sun
  glare(el, { ...YAR, heading: 90, at: new Date('2024-01-25T17:54:00Z') })
  assert.equal(el.props.get('--glare-sun'), '0.000')
  assert.ok(Number(el.props.get('--glare-moon')) > 0)
})

test('undo restores what was there', () => {
  const el = fakeEl({ '--glare-sun': '0.5' })
  glare(el, { ...YAR, at: new Date('2026-09-02T18:00:00+03:00') })()
  assert.deepEqual(Object.fromEntries(el.props), { '--glare-sun': '0.5' })
})
