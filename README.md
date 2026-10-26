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

### Sun and moon glare

For a screen that doesn't move (a TV on a wall, a kiosk), the realistic glass can catch glare where the sun and moon really are. The positions come from [chronochrome](https://github.com/chronochrome/chronochrome) `main`.

```ts
import { glare } from '@house-of-ambers/glass'

// heading = true compass bearing the screen faces (magnetic reading + local declination)
glare(document.documentElement, { latitude: 57.63, longitude: 39.88, heading: 272 })
```

Each piece of glass lights up from the body that is above the horizon and in front of the screen. The sun's glare is warm. The moon's glare is cool and scales with how full the moon is. `glare()` computes once, so call it again on a timer to follow the sky.

Blur needs something behind the element. Without `backdrop-filter` support the glass falls back to an opaque fill.

## Demos

Open `demo/simplified.html` or `demo/realistic.html` in a browser.

## Develop

```sh
git clone --recurse-submodules https://github.com/house-of-ambers/glass.git
npm install
npm test   # builds dist/ and runs the tests
```

chronochrome is pulled in from its `main` branch as a git submodule in `vendor/chronochrome` and compiled from source. Its npm release doesn't have `deviceLight` yet. To update it, run `git submodule update --remote vendor/chronochrome`.
