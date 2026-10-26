import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tintOf } from '../dist/src/index.js'

// n pixels of one RGBA color each, concatenated
const px = (...runs) => new Uint8ClampedArray(runs.flatMap(([n, rgba]) => Array.from({ length: n }, () => rgba).flat()))

test('red logo on transparent → red', () => {
  assert.deepEqual(tintOf(px([30, [229, 9, 20, 255]], [70, [0, 0, 0, 0]])), [229, 9, 20])
})

test('white logo, gray type → null', () => {
  assert.equal(tintOf(px([40, [255, 255, 255, 255]], [20, [128, 128, 130, 255]], [40, [0, 0, 0, 0]])), null)
})

test('red with black type → red: black has no chroma, so it doesn\'t pull the color dark', () => {
  assert.deepEqual(tintOf(px([60, [229, 9, 20, 255]], [40, [0, 0, 0, 255]])), [229, 9, 20])
})

test('a few colored pixels on a white logo are not enough', () => {
  assert.equal(tintOf(px([2, [255, 0, 0, 255]], [98, [255, 255, 255, 255]])), null)
})
