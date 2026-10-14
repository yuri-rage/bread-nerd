# Bread Nerd

A statically served web app for artisan bread baking, featuring an interactive baker's percentage formula engine, dynamic hydration scaling, heritage grain blending, contextual Baker's Insights, and kitchen timers.

Adapted from King Arthur Baking's classic recipe: ["The Easiest Loaf of Bread You'll Ever Bake"](https://www.kingarthurbaking.com/recipes/the-easiest-loaf-of-bread-youll-ever-bake-recipe) by PJ Hamel.

---

## Overview

Bread Nerd scales and balances bread formulas in real time using metric weights (grams and milliliters) and baker's percentages. It provides live dough character profiles, procedural guidance, and built-in timers for every stage from mixing to cooling.

### Core Features

- **Single Formula Engine & Central Step Builder**: One unified mathematical engine (`computeFormula()`) and step instruction generator (`buildSteps()`) powers the interactive screen timeline, printable recipe card, and clipboard copy with perfect consistency.
- **Dynamic Hydration Scaling & Auto-Adjust**: Adjust dough hydration from 50% to 85% with immediate recalculation. Auto-adjust intelligently compensates for grain thirst (+3.0% for Whole Wheat, +4.4% for Dark Rye) or holds water back to prevent slack dough (-2.0% for Spelt, -3.0% for Einkorn), clamped within safe baker bounds (50%–85%).
- **Specialty Heritage Grain Blending**: Incorporate Whole Wheat, Spelt, Dark Rye, Buckwheat, or Einkorn. Increasing specialty flour automatically offsets base bread flour. Provides collapsible grain science details, enzymatic speed warnings, and handling adaptations (e.g. wet-hands pentosan work for rye, rhythmic folding for whole wheat bran).
- **Flexible Leavening Options**: Formulate with Instant Yeast, Active Dry Yeast (with 10m warm water bloom timer), Fresh Cake Yeast, or Active Sourdough Starter (with 10%–30% inoculation rates and exact 50/50 flour and water offsets).
- **Salt Density Calculations**: Measures salt by weight while providing crystal-density-adjusted volume equivalents for Table Salt, Diamond Crystal Kosher Salt, and Morton Kosher Salt.
- **Vessel Workflow & Sequential Baking**:
  - **Baking Sheet**: 10" letter-folded batards, cornmeal dusting, preheated cast-iron skillet steam pan, 5m door-cracked oven vent rest.
  - **Cast Iron Dutch Oven**: Round boules with parchment sling, counter scoring, lid-on steam bake (20m), lid-off crisp bake (10–15m), wire rack cooling (never let bread sit in hot cast iron), and sequential covered pot reheating (~10m) for multi-loaf bakes.
- **Contextual Baker's Insights**: Real-time sensory cues based on how the dough will actually feel, with mixer speed advice, vessel suggestions, and accessible star ratings for screen readers.
- **Integrated Kitchen Timers**: Step-specific countdown timers with quick adjustment controls (+/- minutes), wall-clock accuracy, and offline Web Audio chime alerts.
- **Mobile Floating Timer**: Compact bottom-docked pill on phones with pulsing ring on completion, accessible screen-reader announcements, and quick jump to the timer hub card.
- **Accessible & High-Contrast Design**: Follows WCAG AA standards with >4.5:1 contrast for all text in both light and dark modes, explicit `:focus-visible` focus rings, connected form labels, and proper `aria-pressed` states across all toggles.
- **PWA & Offline Kitchen Use**: Includes `manifest.json` and a service worker (`sw.js`) for standalone homescreen installation and completely offline kitchen operation.
- **Step Progress Persistence**: Remembers completed baking checklist steps across page reloads via `localStorage`.

---

## Running Locally

Bread Nerd requires zero dependencies and no build step.

### Local Server

Run with Python 3:

```bash
python3 -m http.server 8080
```

Then navigate to `http://localhost:8080` in your web browser.

Alternatively, open `index.html` directly in any modern browser.

---

## Running Unit Tests

Bread Nerd includes a pure Node.js test suite with zero external dependencies verifying baseline formula calculations, sourdough starter offsets, hydration clamping, grain hydration adjustments, Celsius/Fahrenheit output, and vessel-aware step generation.

Run tests via npm or node:

```bash
npm test
# or: node tests/formula.test.js
```

---

## Project Structure

```text
bread-nerd/
├── assets/                     # PWA icons, apple touch icons, and vector favicons
│   ├── favicon.svg
│   ├── apple-touch-icon.svg
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable.svg
│   ├── icon-maskable-192.png
│   └── icon-maskable-512.png
├── tests/
│   └── formula.test.js         # Comprehensive formula math & step instruction tests
├── index.html                  # Accessible single-page web app UI
├── styles.css                  # Responsive design with dark/light themes & WCAG AA contrast
├── app.js                      # Unified formula calculation & timeline step engine
├── sw.js                       # Service worker for offline kitchen baking
├── manifest.json               # Web App Manifest for mobile installation
├── package.json                # Project metadata and test runner scripts
└── README.md
```

---

## Baseline Formula Reference

The default King Arthur Baking formula yields two hearth loaves:

| Ingredient | Baker's % | Weight (2 Loaves) | Volume Reference |
| :--- | :---: | :---: | :---: |
| King Arthur Bread Flour | 100.0% | 600g | 4 1/2 to 5 cups |
| Lukewarm Water (90°F - 110°F / 32°C - 43°C) | 63.2% | 379g / 379ml | 1 2/3 cups |
| Granulated Sugar | 1.83% | 11g | 1 tablespoon |
| Instant Yeast | 1.17% | 7g | 2 1/4 teaspoons (1 packet) |
| Table Salt | 2.50% | 15g | 2 1/2 teaspoons |
| Cornmeal or Coarse Semolina | -- | ~15g | For baking surface |
