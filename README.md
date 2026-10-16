# Bread Nerd & Pizza Nerd

A zero-dependency monorepo for artisan bread and New York style pizza baking web applications, featuring interactive baker's percentage formula engines, dynamic hydration scaling, heritage grain blending, contextual kitchen insights, area-scaled pizza toppings, and built-in kitchen timers.

- **Bread Nerd**: Deployed at **[bread.yurirage.com](https://bread.yurirage.com)**  
  Adapted from King Arthur Baking's classic recipe: ["The Easiest Loaf of Bread You'll Ever Bake"](https://www.kingarthurbaking.com/recipes/the-easiest-loaf-of-bread-youll-ever-bake-recipe) by PJ Hamel.
- **Pizza Nerd**: Deployed at **[pizza.yurirage.com](https://pizza.yurirage.com)**  
  Dedicated to the science of cold-fermented, high-gluten New York style pizza (500°F–550°F home ovens & outdoor pizza ovens).

---

## Overview

Both applications scale and balance formulas in real time using metric weights (grams and milliliters) and baker's percentages. They provide live dough character profiles, procedural guidance, and built-in timers for every stage from mixing to cooling.

### Core Features

- **Single Formula Engine & Central Step Builder**: Each app features a unified mathematical engine (`computeFormula()`) and step instruction generator (`buildSteps()`) powering interactive screen timelines, printable recipe cards, and clipboard copy with perfect consistency.
- **Dynamic Hydration Scaling & Auto-Adjust**: Immediate recalculation with intelligent grain thirst compensations, clamped within safe baker bounds.
- **Specialty Flour & Grain Blending**: Incorporate Whole Wheat, Spelt, Dark Rye, Buckwheat, Einkorn (Bread Nerd), and Semolina / Durum Flour or Type 00 Pizzeria Flour (Pizza Nerd).
- **Flexible Leavening Options**: Instant Dry Yeast, Active Dry Yeast (with 10m warm bloom timer), Fresh Cake Yeast, or Active Sourdough Starter (with exact 50/50 flour and water offsets).
- **Area-Scaled Pizza Toppings (Pizza Nerd)**: Calculates authentic New York sauce and cheese proportions scaled precisely by pie surface area ($\pi r^2$) across 12", 14", 16", and 18" pies.
- **Baking Vessel & Surface Workflows**:
  - *Bread Nerd*: Baking Sheet (letter-folded batards, steam pan, 5m door-cracked vent) & Cast Iron Dutch Oven (round boules, lid-on steam, wire rack cooling, sequential pot reheating).
  - *Pizza Nerd*: Baking Steel / Pizza Stone (550°F preheat, broiler assist), Pan Pizza (oiled pan proof), & Outdoor Pizza Oven (650°F–700°F stone preheat).
- **Integrated Kitchen Timers & Mobile Floating Pill**: Step-specific countdown timers, Web Audio chime alerts, mobile floating status pill with pulse animation, and live screen-reader announcements (`aria-live="polite"`).
- **Accessible & High-Contrast Design**: Follows WCAG AA standards with >4.5:1 contrast in both light and dark modes, explicit `:focus-visible` focus rings, connected form labels, live OS `(prefers-color-scheme)` listening, and synchronized browser chrome (`meta[name="theme-color"]`).
- **PWA & Offline Kitchen Use**: Standalone homescreen installation (`manifest.json`) and offline kitchen operation via build-generated service workers (`shared/sw.js` compiled to `dist/<app>/sw.js`) featuring origin-isolated cache management and offline navigation fallbacks.

---

## Running Locally

Both apps require zero external dependencies and run with pure Node.js scripts.

### Dev Server with Live Rebuilding (Recommended)

Starts the zero-dependency Node.js dev server with file watching across `bread/`, `pizza/`, and `shared/`, auto-assembling `dist/` on changes:

```bash
npm run dev
```

- **Bread Nerd**: `http://localhost:8080/` (or `http://localhost:8080/bread/`)
- **Pizza Nerd**: `http://localhost:8080/pizza/`

### Cloudflare Worker Local Dev

Run individual Workers locally with Wrangler:

```bash
npm run dev:bread   # Builds dist/bread and starts local Wrangler dev server
npm run dev:pizza   # Builds dist/pizza and starts local Wrangler dev server
```

### Static File Server

If serving static files with Python or any HTTP server, assemble `dist/` first so `shared/` assets are in place:

```bash
npm run build
python3 -m http.server 8080 --directory dist
```

- Bread Nerd: `http://localhost:8080/bread/`
- Pizza Nerd: `http://localhost:8080/pizza/`

---

## Running Unit Tests

A pure Node.js test suite with zero external dependencies verifies both applications and the shared kitchen engine:

```bash
npm test            # Runs CSS selector validation and all 44 tests: Shared (5), Bread (13), Pizza (26)
npm run check:selectors # Validates CSS class coverage across base.css and app stylesheets
npm run check:undef     # Runs ESLint undefined variable checks across app scripts
npm run test:shared # Runs shared kitchen core tests (timers, theme, toasts, wakelock)
npm run test:bread  # Runs Bread formula, step, timer & version tests
npm run test:pizza  # Runs Pizza formula, topping, timing & surface tests
```

---

## Building & Deploying to Cloudflare

Cloudflare Workers Static Assets hosts each app on its respective subdomain from a single repository. The build script links shared assets (`base.css`, `core.js`), dynamically scans static files, and compiles `shared/sw.js` into `dist/<app>/sw.js` with baked versions and cache scopes:

```bash
npm run build        # Assembles both dist/bread and dist/pizza
npm run build:bread  # Assembles dist/bread
npm run build:pizza  # Assembles dist/pizza
```

### Cloudflare Workers Configuration

In the Cloudflare dashboard (Workers Builds), connect the repository and configure each Worker:

| Setting | Bread Nerd Worker | Pizza Nerd Worker |
| :--- | :--- | :--- |
| **Worker Name** | `bread-nerd` | `pizza-nerd` |
| **Domain** | `bread.yurirage.com` | `pizza.yurirage.com` |
| **Build Command** | `npm run build:bread` | `npm run build:pizza` |
| **Deploy Command** | `npx wrangler deploy --config dist/bread/wrangler.jsonc` | `npx wrangler deploy --config dist/pizza/wrangler.jsonc` |
| **Watch Paths** | `bread/**`, `shared/**`, `scripts/**` | `pizza/**`, `shared/**`, `scripts/**` |

---

## Project Structure

```text
bread-nerd/
├── bread/                      # Bread Nerd web application
│   ├── index.html              # UI with companion Pizza Nerd link
│   ├── app.js                  # Bread formula engine & step builder
│   ├── styles.css              # Bread-specific styles & overrides
│   ├── manifest.json           # Scoped PWA manifest
│   ├── assets/                 # PWA icons & Apple touch icons
│   ├── _headers                # Edge cache revalidation rules
│   ├── .assetsignore           # Static asset exclusions
│   └── wrangler.jsonc          # Cloudflare Worker asset configuration
├── pizza/                      # Pizza Nerd web application
│   ├── index.html              # UI with companion Bread Nerd link
│   ├── app.js                  # NY pizza formula engine & topping guide
│   ├── styles.css              # Pizza-specific styles & overrides
│   ├── manifest.json           # Scoped PWA manifest
│   ├── assets/                 # PWA icons & Apple touch icons
│   ├── _headers                # Edge cache revalidation rules
│   ├── .assetsignore           # Static asset exclusions
│   └── wrangler.jsonc          # Cloudflare Worker asset configuration
├── shared/                     # Shared kitchen infrastructure
│   ├── base.css                # Shared typography, design tokens, responsive layout, print card
│   ├── core.js                 # Shared kitchen timers, audio chimes, theme & toast managers
│   └── sw.js                   # Canonical service worker template with build-time interpolation
├── tests/
│   ├── shared.test.js          # 5 Shared timer, theme & kitchen core tests
│   ├── bread.test.js           # 13 Bread formula, timer workflow, step & version tests
│   └── pizza.test.js           # 26 Pizza formula, timer workflow, surface, timing & topping tests
├── scripts/
│   ├── build.js                # Assembly into dist/<app> & dynamic sw.js compiler
│   ├── dev.js                  # Zero-dependency live dev server with file watching
│   └── check-selectors.js      # CSS selector validation across HTML, JS, and CSS
├── .github/workflows/
│   └── test.yml                # CI matrix running npm test on Node 20, 22, 24
├── eslint.config.js            # Flat ESLint config for no-undef linting with browser globals
├── package.json                # Unified workspace scripts & versioning
└── README.md
```

---

## Baseline Formulas

### Bread Nerd (King Arthur Baseline)

| Ingredient | Baker's % | Weight (2 Loaves) | Volume Reference |
| :--- | :---: | :---: | :---: |
| King Arthur Bread Flour | 100.0% | 600g | 4 1/2 to 5 cups |
| Lukewarm Water (90°F - 110°F / 32°C - 43°C) | 63.2% | 379g / 379ml | 1 2/3 cups |
| Granulated Sugar | 1.83% | 11g | 1 tablespoon |
| Instant Yeast | 1.17% | 7g | 2 1/4 teaspoons (1 packet) |
| Table Salt | 2.50% | 15g | 2 1/2 teaspoons |
| Cornmeal or Coarse Semolina | -- | ~15g | For baking surface |

### Pizza Nerd (New York Style Baseline)

| Ingredient | Baker's % | Weight (2x 14" Pies) | Volume Reference |
| :--- | :---: | :---: | :---: |
| High-Gluten Bread Flour (12.7%–14.2% protein) | 100.0% | ~393g | ~3.3 cups |
| Cool Water (60°F–65°F / 16°C–18°C) | 62.0% | 244g / 244ml | ~1.0 cups |
| Fine Sea Salt / Table Salt | 2.20% | 8.6g | ~1.4 tsp |
| Extra Virgin Olive Oil | 2.00% | 7.9g | ~1.7 tsp |
| Granulated Sugar or Non-Diastatic Malt | 1.50% | 5.9g | ~0.5 tbsp |
| Instant Dry Yeast (IDY) | 0.35% | 1.4g | ~0.5 tsp |
| Semolina / Durum Flour | -- | ~25g | For peel & surface |

---

## License

MIT © Yuri Rage
