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

glare(document.documentElement, {
  latitude: 57.63,
  longitude: 39.88,
  viewerHeading: 272, // where you look at the screen: true bearing, magnetic reading + local declination
})
```

Each piece of glass lights up from the body that is above the horizon and in front of the screen. The sun's glare is warm. The moon's glare is cool and scales with how full the moon is. `glare()` computes once, so call it again on a timer to follow the sky.

Blur needs something behind the element. Without `backdrop-filter` and without a baked backdrop, the body becomes an opaque fill. Shine, rim and glare still show on top.

### Old TV engines: baked frost

Older TV browsers have no `backdrop-filter`: Samsung Tizen ≤ 5.5 and LG webOS ≤ 5 run Chromium 38–79. There, blur the page backdrop once and put the blurred copy under the glass:

```ts
import { bake } from '@house-of-ambers/glass'

// the page shows `backdrop` sharp: body { background: url(backdrop.jpg) center / cover fixed }
document.documentElement.style.setProperty('--glass-baked', `url(${await bake(backdrop, { blur: 24 })})`)
el.classList.add('glass--baked')
```

`bake()` uses `ctx.filter` when the browser has it, Chromium 52 and later. Otherwise it downscales and stretches the image back. The class turns `backdrop-filter` off and draws the blurred copy as the bottom background layer, with `fixed` and `cover`, so it lines up with the sharp one behind.

There are two limits:
- The page backdrop must be sharp and drawn `center / cover fixed`. With nothing behind the glass, there's nothing to frost.
- A `fixed` background doesn't stay fixed inside an ancestor with `transform`, so baked glass there is misaligned.

| glass.css uses | First Chromium | Without it |
|---|---|---|
| `backdrop-filter` | 76 | `glass--baked`, or an opaque body |
| `@property --tint` | 85 | `--tint` changes without a transition |
| `mask-composite: exclude` | 120 | `-webkit-mask-composite: xor` draws the rim |
| `calc()` inside `rgba()` | not checked on old engines | `--glare-*` and `--glass-scale` alphas need a JS port with concrete values |
| `inset`, two-position color stops | 87, 71 | not used: `top/right/bottom/left` and `linear-gradient(#000, #000)` |

## Demos

Open `demo/simplified.html` or `demo/realistic.html` in a browser.

## Develop

```sh
git clone --recurse-submodules https://github.com/house-of-ambers/glass.git
npm install
npm test   # builds dist/ and runs the tests
```

chronochrome is pulled in from its `main` branch as a git submodule in `vendor/chronochrome` and compiled from source. Its npm release doesn't have `deviceLight` yet. To update it, run `git submodule update --remote vendor/chronochrome`.
