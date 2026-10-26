# glass

Frosted glass for dark UIs: one stylesheet and a tiny TypeScript helper, no runtime dependencies.

## Install

```sh
npm i github:house-of-ambers/glass
```

## Use

```ts
import '@house-of-ambers/glass/glass.css'
import { glass } from '@house-of-ambers/glass'

const undo = glass(el, { profile: 'realistic', blur: 24, thickness: 0.5, tint: '#E1306C33' })
undo() // back to how it was
```

Or without JS, just classes:

```html
<div class="glass">simplified</div>
<div class="glass glass--realistic">realistic</div>
```

| Option / CSS var | Default | |
|---|---|---|
| `profile` | `'simplified'` | `'realistic'` adds shine, lit rim, depth shadows and grain |
| `blur` / `--blur` | `24px` | blur radius |
| `thickness` / `--thickness` | `1` | blur multiplier, use ~0.5 for small pills |
| `tint` / `--tint` | none | colored light inside the glass, realistic only, animatable |

Blur needs something behind the element. Without `backdrop-filter` support the glass falls back to an opaque fill.

## Demos

Open `demo/simplified.html` or `demo/realistic.html` in a browser.

## Develop

```sh
npm install
npm test   # builds dist/ and runs the tests
```
