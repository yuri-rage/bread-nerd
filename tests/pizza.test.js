const assert = require('assert');

// Test suite for computeFormula and buildSteps in Pizza Nerd
const {
  computeFormula,
  buildSteps,
  getBakerInsight,
  formatSaltVolume,
  formatOilVolume,
  GRAIN_DEFINITIONS,
  SALT_DEFINITIONS,
  LEAVENING_DEFINITIONS,
  SUGAR_TYPES,
  PIZZA_SIZES,
  NY_DEFAULTS,
  timerEngine,
  toggleTimer,
  loadTimer,
  clearTimer
} = require('../pizza/app.js');

console.log('🍕 Running Pizza Nerd Formula Tests...\n');

let passed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. NYC Baseline Formula (2x 14" pies = 660g total dough)
test('NY Baseline formula returns ~393g flour, 62% hydration, 2.0% oil, 2.2% salt, 1.5% sugar, 0.35% yeast', () => {
  const state = {
    ...NY_DEFAULTS,
    pies: 2,
    pizzaSize: '14',
    ballWeight: 330,
    specialtyPct: 0
  };

  const f = computeFormula(state);
  // Target dough = 2 * 330 = 660g
  // Sum % = 100 + 62 + 2.0 + 2.2 + 1.5 + 0.35 = 168.05%
  // 660 / 1.6805 = 392.74 -> 393g flour
  assert.strictEqual(f.totalFlour, 393);
  assert.strictEqual(f.breadFlourGrams, 393);
  assert.strictEqual(f.specialtyGrams, 0);
  assert.strictEqual(f.totalWaterGrams, 244); // 393 * 0.62 = 243.66 -> 244
  assert.strictEqual(f.oilGrams, 7.9);        // 393 * 0.02 = 7.86 -> 7.9
  assert.strictEqual(f.saltGrams, 8.6);       // 393 * 0.022 = 8.646 -> 8.6
  assert.strictEqual(f.sugarGrams, 5.9);      // 393 * 0.015 = 5.895 -> 5.9
  assert.strictEqual(f.yeastGrams, 1.4);      // 393 * 0.0035 = 1.3755 -> 1.4
  assert.strictEqual(f.totalDough, 661);      // 393 + 244 + 8.6 + 7.9 + 1.4 + 5.9 = 660.8 -> 661
  assert.strictEqual(f.perPie, 331);          // 661 / 2 = 330.5 -> 331 (within 1g of 330g target)
});

// 2. Direct Flour Input
test('Direct flour input scales dough and per-pie weight accurately', () => {
  const state = {
    ...NY_DEFAULTS,
    isDirectFlourInput: true,
    totalFlour: 500,
    pies: 2,
    hydrationPct: 62.0
  };

  const f = computeFormula(state);
  assert.strictEqual(f.totalFlour, 500);
  assert.strictEqual(f.totalWaterGrams, 310); // 500 * 0.62 = 310
  assert.strictEqual(f.oilGrams, 10.0);       // 500 * 0.02 = 10
  assert.strictEqual(f.saltGrams, 11.0);      // 500 * 0.022 = 11
  assert.strictEqual(f.sugarGrams, 7.5);      // 500 * 0.015 = 7.5
  assert.strictEqual(f.yeastGrams, 1.8);      // 500 * 0.0035 = 1.75 -> 1.8
  assert.strictEqual(f.totalDough, 840);      // 500 + 310 + 11 + 10 + 1.8 + 7.5 = 840.3 -> 840
  assert.strictEqual(f.perPie, 420);          // 840 / 2 = 420
});

// 3. Sourdough Starter Offsets (Flour & Water)
test('Sourdough Starter inoculation (15%) properly offsets bread flour and water', () => {
  const state = {
    ...NY_DEFAULTS,
    isDirectFlourInput: true,
    totalFlour: 500,
    pies: 2,
    yeastType: 'sourdough',
    starterRatePct: 15,
    specialtyPct: 20,
    specialtyGrain: 'semolina'
  };

  const f = computeFormula(state);
  // 15% starter of 500g = 75g starter (38g flour + 37g water or 37.5)
  assert.strictEqual(f.starterGrams, 75);
  assert.strictEqual(f.starterFlourGrams, 38);
  assert.strictEqual(f.starterWaterGrams, 37);

  // 20% semolina = 100g semolina
  assert.strictEqual(f.specialtyGrams, 100);

  // Added bread flour = 500 - 100 - 38 = 362g
  assert.strictEqual(f.breadFlourGrams, 362);
  assert.strictEqual(f.breadFlourGrams + f.specialtyGrams + f.starterFlourGrams, 500);

  // Total water at 62% + auto-adjust (20% semolina at +0.08 = +1.6% -> 63.6%)
  // 500 * 0.636 = 318g total water; added water = 318 - 37 = 281g
  assert.strictEqual(f.effectiveHydrationPct, 63.6);
  assert.strictEqual(f.totalWaterGrams, 318);
  assert.strictEqual(f.addedWaterGrams, 281);
  assert.strictEqual(f.yeastGrams, 0); // commercial yeast is 0 in sourdough mode
});

// 4. Hydration Clamping (55% to 75%)
test('Hydration is clamped at 75% upper bound and 55% lower bound', () => {
  // High hydration clamp: 74% base with 20% rye (+4.0%) unclamped = 78.0% -> clamp at 75%
  const highState = {
    ...NY_DEFAULTS,
    baseHydrationPct: 74,
    hydrationPct: 74,
    autoAdjustHydration: true,
    specialtyPct: 20,
    specialtyGrain: 'rye'
  };
  const fHigh = computeFormula(highState);
  assert.strictEqual(fHigh.effectiveHydrationPct, 75.0);

  // Low hydration clamp: 56% base with 20% spelt (-2.0%) unclamped = 54.0% -> clamp at 55%
  const lowState = {
    ...NY_DEFAULTS,
    baseHydrationPct: 56,
    hydrationPct: 56,
    autoAdjustHydration: true,
    specialtyPct: 20,
    specialtyGrain: 'spelt'
  };
  const fLow = computeFormula(lowState);
  assert.strictEqual(fLow.effectiveHydrationPct, 55.0);
});

// 5. Grain Auto-Adjust Compensation
test('Grain hydration adjustments add water for semolina, whole wheat, and rye, hold back for type 00 and spelt', () => {
  const base = {
    ...NY_DEFAULTS,
    baseHydrationPct: 62.0,
    autoAdjustHydration: true,
    specialtyPct: 20
  };

  // Semolina: +0.08 per % -> 20 * 0.08 = +1.6% -> 63.6%
  const fSemolina = computeFormula({ ...base, specialtyGrain: 'semolina' });
  assert.strictEqual(fSemolina.recommendedBump, 1.6);
  assert.strictEqual(fSemolina.effectiveHydrationPct, 63.6);

  // Whole Wheat: +0.15 per % -> 20 * 0.15 = +3.0% -> 65.0%
  const fWW = computeFormula({ ...base, specialtyGrain: 'whole_wheat' });
  assert.strictEqual(fWW.recommendedBump, 3.0);
  assert.strictEqual(fWW.effectiveHydrationPct, 65.0);

  // Rye: +0.20 per % -> 20 * 0.20 = +4.0% -> 66.0%
  const fRye = computeFormula({ ...base, specialtyGrain: 'rye' });
  assert.strictEqual(fRye.recommendedBump, 4.0);
  assert.strictEqual(fRye.effectiveHydrationPct, 66.0);

  // Type 00: -0.08 per % -> 20 * -0.08 = -1.6% -> 60.4%
  const fTipo00 = computeFormula({ ...base, specialtyGrain: 'tipo00' });
  assert.strictEqual(fTipo00.recommendedBump, -1.6);
  assert.strictEqual(fTipo00.effectiveHydrationPct, 60.4);

  // Spelt: -0.10 per % -> 20 * -0.10 = -2.0% -> 60.0%
  const fSpelt = computeFormula({ ...base, specialtyGrain: 'spelt' });
  assert.strictEqual(fSpelt.recommendedBump, -2.0);
  assert.strictEqual(fSpelt.effectiveHydrationPct, 60.0);
});

// 6. Olive Oil and Sugar/Malt Toggles
test('Olive oil and Sugar/Malt inclusion toggles update weights properly', () => {
  const stateNoOil = {
    ...NY_DEFAULTS,
    isDirectFlourInput: true,
    totalFlour: 500,
    includeOil: false
  };
  const fNoOil = computeFormula(stateNoOil);
  assert.strictEqual(fNoOil.oilGrams, 0);
  assert.strictEqual(fNoOil.includeOil, false);

  const stateNoSugar = {
    ...NY_DEFAULTS,
    isDirectFlourInput: true,
    totalFlour: 500,
    includeSugar: false
  };
  const fNoSugar = computeFormula(stateNoSugar);
  assert.strictEqual(fNoSugar.sugarGrams, 0);
  assert.strictEqual(fNoSugar.includeSugar, false);
});

// 7. Pizza Size Presets
test('Pizza size presets calculate correct ball weights', () => {
  assert.strictEqual(PIZZA_SIZES['12'].targetBallWeight, 260);
  assert.strictEqual(PIZZA_SIZES['14'].targetBallWeight, 330);
  assert.strictEqual(PIZZA_SIZES['16'].targetBallWeight, 450);
  assert.strictEqual(PIZZA_SIZES['18'].targetBallWeight, 560);
});

// 8. Surface Adaptations in buildSteps
test('buildSteps adapts baking instructions to chosen surface (steel, pan, outdoor oven)', () => {
  const fSteel = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'steel' });
  const stepsSteel = buildSteps(fSteel);
  const step8Steel = stepsSteel.find(s => s.num === 8);
  const step9Steel = stepsSteel.find(s => s.num === 9);
  assert.ok(step8Steel.title.includes('Baking Steel'), 'Steel preheat should mention Baking Steel');
  assert.ok(step9Steel.screenDesc.includes('screaming hot steel'), 'Steel step 9 should launch onto steel');
  assert.ok(step9Steel.screenDesc.includes('Wire Rack Rest'), 'Steel step 9 should include wire rack rest');

  const fPan = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'pan' });
  const stepsPan = buildSteps(fPan);
  const step7Pan = stepsPan.find(s => s.num === 7);
  const step8Pan = stepsPan.find(s => s.num === 8);
  const step9Pan = stepsPan.find(s => s.num === 9);
  assert.ok(step7Pan.title.includes('Pan Proof'), 'Pan step 7 should be Pan Press & Pan Proof');
  assert.ok(step7Pan.screenDesc.includes('Direct Pan Setup'), 'Pan step 7 should setup directly in pan');
  assert.ok(step8Pan.title.includes('Pan'), 'Pan preheat should mention Pan');
  assert.ok(step9Pan.screenDesc.includes('Pan Bake'), 'Pan step 9 should bake in pan');

  const fOutdoor = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'outdoor_oven' });
  const stepsOutdoor = buildSteps(fOutdoor);
  const step8Outdoor = stepsOutdoor.find(s => s.num === 8);
  const step9Outdoor = stepsOutdoor.find(s => s.num === 9);
  assert.ok(step8Outdoor.title.includes('Outdoor Pizza Oven'), 'Outdoor preheat should mention Outdoor Pizza Oven');
  assert.ok(step9Outdoor.screenDesc.includes('Rotate'), 'Outdoor step 9 should rotate pie');
});

// 9. formatSaltVolume and formatOilVolume
test('formatSaltVolume and formatOilVolume accurately calculate volume approximations', () => {
  // Table salt (6.0g/tsp)
  assert.strictEqual(formatSaltVolume(9.0, 'table'), '~1.5 tsp');
  // Morton (4.8g/tsp) -> 12 / 4.8 = 2.5 tsp
  assert.strictEqual(formatSaltVolume(12.0, 'morton'), '~2.5 tsp');
  // Diamond (2.8g/tsp) -> 12 / 2.8 = 4.3 tsp (>= 2.95 -> shows tbsp)
  assert.strictEqual(formatSaltVolume(12.0, 'diamond'), '~4.3 tsp (~1.4 tbsp)');

  // EVOO (4.56g/tsp) -> 8g / 4.56 = ~1.8 tsp
  assert.strictEqual(formatOilVolume(8.0), '~1.8 tsp');
  // 15g EVOO -> 15 / 4.56 = 3.3 tsp -> ~1.1 tbsp (~3.3 tsp)
  assert.strictEqual(formatOilVolume(15.0), '~1.1 tbsp (~3.3 tsp)');
});

// 10. Celsius Temperature Output in buildSteps
test('buildSteps outputs accurate Celsius ranges across screen, print, and copy', () => {
  const f = computeFormula(NY_DEFAULTS);
  const stepsC = buildSteps(f, 'C');

  // Step 8 steel preheat should mention 260°C to 288°C
  const step8 = stepsC.find(s => s.num === 8);
  assert.ok(step8.screenDesc.includes('260°C to 288°C') || step8.screenDesc.includes('260°C–288°C'));
  assert.ok(step8.printDesc.includes('260°C–288°C'));
  assert.ok(step8.copyDesc.includes('260°C–288°C'));

  // Step 7 room tempering should mention 18°C
  const step7 = stepsC.find(s => s.num === 7);
  assert.ok(step7.screenDesc.includes('18°C'));
  assert.ok(step7.printDesc.includes('18°C'));
  assert.ok(step7.copyDesc.includes('18°C'));
});

// 11. Timer Durations match instructional text
test('step timer durations match instructional text', () => {
  const f = computeFormula(NY_DEFAULTS);
  const steps = buildSteps(f);

  // Step 3 Autolyse: 10 min = 600s
  const step3 = steps.find(s => s.num === 3);
  assert.ok(step3.timers.some(t => t.time === 600));

  // Step 5 Bench rest: 20 min = 1200s
  const step5 = steps.find(s => s.num === 5);
  assert.ok(step5.timers.some(t => t.time === 1200));

  // Step 7 Tempering: 90 min = 5400s, 120 min = 7200s
  const step7 = steps.find(s => s.num === 7);
  assert.ok(step7.timers.some(t => t.time === 5400));
  assert.ok(step7.timers.some(t => t.time === 7200));
});

// 12. Version Consistency Check across package.json, index.html, and sw.js
test('release version matches across package.json, index.html header badge, and sw.js cache name', () => {
  const fs = require('fs');
  const path = require('path');
  const { buildApp } = require('../scripts/build.js');

  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const expectedVer = pkg.version;

  const html = fs.readFileSync(path.join(__dirname, '../pizza/index.html'), 'utf8');
  assert.ok(
    html.includes(`v${expectedVer}`),
    `pizza/index.html header badge must include v${expectedVer} matching package.json`
  );

  buildApp('pizza');
  const sw = fs.readFileSync(path.join(__dirname, '../dist/pizza/sw.js'), 'utf8');
  assert.ok(
    sw.includes(`pizza-nerd-v${expectedVer}`),
    `dist/pizza/sw.js CACHE_NAME must include pizza-nerd-v${expectedVer} matching package.json`
  );
  assert.ok(
    sw.includes("key.startsWith(`${APP_NAME}-`)"),
    'dist/pizza/sw.js must isolate cache deletion with APP_NAME prefix'
  );
  assert.ok(
    !sw.includes('"./index.html"') && !sw.includes("'./index.html'"),
    'dist/pizza/sw.js must not list index.html in ASSETS_TO_CACHE (covered by ./)'
  );
  assert.ok(
    sw.includes("event.request.mode === 'navigate'") && sw.includes("caches.match('./')"),
    'dist/pizza/sw.js must restore offline navigation fallback to ./'
  );
});

// 13. Fermentation Style: Cold Retard (0.35% IDY) vs Same-Day Fast Dough (0.85% IDY)
test('fermentStyle toggles yeast percentage, water temperatures, and step workflow', () => {
  // Cold retard baseline
  const fCold = computeFormula({ ...NY_DEFAULTS, isDirectFlourInput: true, totalFlour: 1000, fermentStyle: 'cold' });
  assert.strictEqual(fCold.effectiveYeastPct, 0.35);
  assert.strictEqual(fCold.yeastGrams, 3.5);
  const stepsCold = buildSteps(fCold);
  const step2Cold = stepsCold.find(s => s.num === 2);
  const step6Cold = stepsCold.find(s => s.num === 6);
  assert.ok(step2Cold.screenDesc.includes('60°F to 65°F') || step2Cold.screenDesc.includes('Cool Water'));
  assert.ok(step6Cold.title.includes('Cold Fermentation in Refrigerator (24–72 hrs)'));
  assert.ok(step6Cold.screenDesc.includes('48 Hours (Pizza Lab Sweet Spot)'));

  // Same-Day fast dough
  const fSameDay = computeFormula({ ...NY_DEFAULTS, isDirectFlourInput: true, totalFlour: 1000, fermentStyle: 'same_day' });
  assert.strictEqual(fSameDay.effectiveYeastPct, 0.85);
  assert.strictEqual(fSameDay.yeastGrams, 8.5);
  const stepsSameDay = buildSteps(fSameDay);
  const step2SameDay = stepsSameDay.find(s => s.num === 2);
  const step5SameDay = stepsSameDay.find(s => s.num === 5);
  const step6SameDay = stepsSameDay.find(s => s.num === 6);
  const step7SameDay = stepsSameDay.find(s => s.num === 7);
  assert.ok(step2SameDay.screenDesc.includes('85°F to 90°F') || step2SameDay.screenDesc.includes('Lukewarm Water'));
  assert.ok(step5SameDay.title.includes('Primary Bulk Rise as One Mass'));
  assert.ok(step5SameDay.screenDesc.includes('1.5 to 2 hours'));
  assert.ok(step5SameDay.timers.some(t => t.time === 5400 || t.time === 7200), 'Same-day bulk rise should include timer');
  assert.ok(step6SameDay.title.includes('Divide & Shape'));
  assert.ok(step7SameDay.title.includes('Ball Proof & Gluten Relaxation'));
});

// 14. Outdoor Pizza Oven in Celsius Mode (Lean Dough vs Sugar Dough)
test('Outdoor oven step 9 outputs correct Celsius ranges based on dough sugar content', () => {
  // Lean dough (0 sugar) uses standard high heat (343°C to 371°C)
  const fLean = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'outdoor_oven', includeSugar: false, sugarPct: 0 });
  const stepsLeanC = buildSteps(fLean, 'C');
  const step9Lean = stepsLeanC.find(s => s.num === 9);
  assert.ok(step9Lean.screenDesc.includes('343°C to 371°C'), 'Lean dough screen description must contain 343°C to 371°C');
  assert.ok(step9Lean.printDesc.includes('343°C–371°C'), 'Lean dough print description must contain 343°C–371°C');
  assert.ok(step9Lean.copyDesc.includes('343°C–371°C'), 'Lean dough copy description must contain 343°C–371°C');

  // Dough with sugar (default NY 1.5%) uses moderated heat (315°C to 343°C) to prevent scorch
  const fSugar = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'outdoor_oven', includeSugar: true, sugarPct: 1.5 });
  const stepsSugarC = buildSteps(fSugar, 'C');
  const step9Sugar = stepsSugarC.find(s => s.num === 9);
  assert.ok(step9Sugar.screenDesc.includes('315°C to 343°C'), 'Sugar dough screen description must contain 315°C to 343°C');
  assert.ok(step9Sugar.printDesc.includes('315°C–343°C'), 'Sugar dough print description must contain 315°C–343°C');
  assert.ok(step9Sugar.copyDesc.includes('315°C–343°C'), 'Sugar dough copy description must contain 315°C–343°C');
});

// 15. Pan Pizza Workflow with Direct Pan Proof
test('Pan pizza workflow includes direct pan proof replacing separate warm-up/ball-proof', () => {
  const f = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'pan' });
  const steps = buildSteps(f);
  const step7 = steps.find(s => s.num === 7);
  const step8 = steps.find(s => s.num === 8);
  const step9 = steps.find(s => s.num === 9);

  assert.ok(step7.title.includes('Pan Press & Pan Proof (2–3 hrs)'), 'Step 7 title should include Pan Press & Pan Proof');
  assert.ok(step7.screenDesc.includes('Direct Pan Setup'), 'Step 7 should setup directly in pan');
  assert.ok(step7.screenDesc.includes('400g–450g of dough'), 'Step 7 should mention 400g-450g for thick crust');
  assert.ok(step7.timers.some(t => t.time === 7200), 'Pan step 7 should include 2h proof timer');
  assert.ok(step7.timers.some(t => t.time === 10800), 'Pan step 7 should include 3h proof timer');

  assert.ok(step8.screenDesc.includes('pan proof'), 'Step 8 should align with pan baking');
  assert.ok(step9.screenDesc.includes('Dimple & Top'), 'Step 9 should dimple and top proofed dough');
  assert.ok(step9.screenDesc.includes('12 to 15 minutes'), 'Step 9 should bake 12 to 15 minutes');
});

// 16. Sugar Density Accurate Volume Calculations
test('formatSugarVolume calculates accurate volume by sugar ingredient density', () => {
  const { formatSugarVolume } = require('../pizza/app.js');
  // Granulated sugar (~12.5g/tbsp = 4.17g/tsp)
  // 6.0g / 4.17 = ~1.4 tsp
  assert.strictEqual(formatSugarVolume(6.0, 'granulated'), '~1.4 tsp');

  // Non-diastatic malt powder (~9.0g/tbsp = 3.0g/tsp)
  // 6.0g / 3.0 = ~2.0 tsp
  assert.strictEqual(formatSugarVolume(6.0, 'malt'), '~2.0 tsp');

  // Honey (~21.0g/tbsp = 7.0g/tsp)
  // 6.0g / 7.0 = ~0.9 tsp (preventing inflated 1.7x tbsp figure)
  assert.strictEqual(formatSugarVolume(6.0, 'honey'), '~0.9 tsp');
});

// 17. Topping Scaling by Surface Area
test('Toppings scale proportionally with pie area', () => {
  // Baseline 14": 115g sauce, 160g cheese
  const f14 = computeFormula({ ...NY_DEFAULTS, pizzaSize: '14' });
  const steps14 = buildSteps(f14);
  const step9_14 = steps14.find(s => s.num === 9);
  assert.ok(step9_14.printDesc.includes('~115g crushed tomatoes') || step9_14.printDesc.includes('~115g sauce'));
  assert.ok(step9_14.printDesc.includes('~160g low-moisture') || step9_14.printDesc.includes('~160g cheese'));

  // 18" pie: area ratio = 18^2 / 14^2 = 324 / 196 = 1.653x
  // 115 * 1.653 = ~190g sauce, 160 * 1.653 = ~264g cheese
  const f18 = computeFormula({ ...NY_DEFAULTS, pizzaSize: '18' });
  const steps18 = buildSteps(f18);
  const step9_18 = steps18.find(s => s.num === 9);
  assert.ok(step9_18.printDesc.includes('~190g crushed tomatoes') || step9_18.printDesc.includes('~190g sauce'));
  assert.ok(step9_18.printDesc.includes('~264g low-moisture') || step9_18.printDesc.includes('~264g cheese'));

  // 12" pie: area ratio = 12^2 / 14^2 = 144 / 196 = 0.735x
  // 115 * 0.735 = ~84g sauce, 160 * 0.735 = ~118g cheese
  const f12 = computeFormula({ ...NY_DEFAULTS, pizzaSize: '12' });
  const steps12 = buildSteps(f12);
  const step9_12 = steps12.find(s => s.num === 9);
  assert.ok(step9_12.printDesc.includes('~84g crushed tomatoes') || step9_12.printDesc.includes('~84g sauce'));
  assert.ok(step9_12.printDesc.includes('~118g low-moisture') || step9_12.printDesc.includes('~118g cheese'));
});

// 18. Dynamic Grain Preset Labels
test('Grain preset 10% label adapts to active grain and avoids hardcoded semolina', () => {
  const { getGrainPresetLabel } = require('../pizza/app.js');
  assert.strictEqual(getGrainPresetLabel('semolina'), '10% Semolina Crisp');
  assert.strictEqual(getGrainPresetLabel('whole_wheat'), '10% Whole Wheat Note');
  assert.strictEqual(getGrainPresetLabel('tipo00'), '10% Type 00 Tender');
  assert.strictEqual(getGrainPresetLabel('spelt'), '10% Spelt Aroma');
  assert.strictEqual(getGrainPresetLabel('rye'), '10% Rye Complexity');
});

// 19. Outdoor Oven Celsius Formatting in Insights & Steps
test('Outdoor oven warning in getBakerInsight and step 8 title adapts to Celsius and sugar level', () => {
  // Default NY dough with 1.5% sugar
  const fOutdoor = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'outdoor_oven' });
  const insightF = getBakerInsight(fOutdoor, { ...NY_DEFAULTS, tempUnit: 'F' });
  assert.ok(insightF.tips.includes('600°F–650°F'), 'Fahrenheit mode should show 600°F–650°F for sugar dough');
  assert.ok(!insightF.tips.includes('315°C–343°C'));

  const insightC = getBakerInsight(fOutdoor, { ...NY_DEFAULTS, tempUnit: 'C' });
  assert.ok(insightC.tips.includes('315°C–343°C'), 'Celsius mode should show 315°C–343°C in outdoor oven warning');

  const stepsF = buildSteps(fOutdoor, 'F');
  const step8F = stepsF.find(s => s.num === 8);
  assert.strictEqual(step8F.title, 'Preheat Outdoor Pizza Oven (600°F–650°F)');
  assert.ok(step8F.screenDesc.includes('moderating the floor to 600°F to 650°F prevents scorching'), 'F mode should moderate to 600°F to 650°F without duplicate parenthetical');
  assert.ok(!step8F.screenDesc.includes('(600°F to 650°F)'), 'F mode should not duplicate 600°F in parentheses');

  const stepsC = buildSteps(fOutdoor, 'C');
  const step8C = stepsC.find(s => s.num === 8);
  assert.strictEqual(step8C.title, 'Preheat Outdoor Pizza Oven (315°C–343°C)');
  assert.ok(step8C.screenDesc.includes('moderating the floor to 315°C to 343°C prevents scorching'), 'C mode should moderate to 315°C to 343°C');
  assert.ok(!step8C.screenDesc.includes('600°F–650°F'), 'C mode should not contain 600°F-650°F in moderation explanation');

  // Lean dough (0% sugar) targets full 650°F–700°F (343°C–371°C)
  const fLeanOutdoor = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'outdoor_oven', includeSugar: false, sugarPct: 0 });
  const stepsLeanF = buildSteps(fLeanOutdoor, 'F');
  const step8LeanF = stepsLeanF.find(s => s.num === 8);
  assert.strictEqual(step8LeanF.title, 'Preheat Outdoor Pizza Oven (650°F–700°F)');
});

// 20. Sourdough Same-Day Fermentation Timing (4–5h Bulk + 2h Ball Proof)
test('Sourdough same-day mode provides 4–5h bulk rise and 2h ball proof', () => {
  const fSourdoughSameDay = computeFormula({
    ...NY_DEFAULTS,
    yeastType: 'sourdough',
    fermentStyle: 'same_day'
  });
  const steps = buildSteps(fSourdoughSameDay);
  const step5 = steps.find(s => s.num === 5);
  const step6 = steps.find(s => s.num === 6);
  const step7 = steps.find(s => s.num === 7);

  assert.ok(step5.title.includes('4–5 hrs'), 'Step 5 title should indicate 4–5 hrs for sourdough bulk rise');
  assert.ok(step5.timers.some(t => t.time === 14400), 'Step 5 should have a 4 hr timer');
  assert.ok(step5.timers.some(t => t.time === 18000), 'Step 5 should have a 5 hr timer');

  assert.ok(step6.title.includes('Divide & Shape'), 'Step 6 should be divide and ball');

  assert.ok(step7.title.includes('2 hrs'), 'Step 7 title should indicate 2 hr proof for sourdough balls');
  assert.ok(step7.timers.some(t => t.time === 7200), 'Step 7 should have a 2 hr timer');
});

// 21. Item 1: Same-Day Steps Reordering (Never Proof Balls Twice)
test('Item 1: Same-day steps bulk-rise as one mass before dividing and balling (never proof balls twice)', () => {
  const fYeastSameDay = computeFormula({ ...NY_DEFAULTS, fermentStyle: 'same_day' });
  const stepsYeast = buildSteps(fYeastSameDay);
  
  // Step 5: Primary Bulk Rise as One Mass
  const s5 = stepsYeast.find(s => s.num === 5);
  assert.strictEqual(s5.phase, 'Primary Bulk Rise');
  assert.ok(s5.screenDesc.includes('Do not divide yet'));
  assert.ok(s5.title.includes('1.5–2 hrs'));

  // Step 6: Divide & Shape Balls
  const s6 = stepsYeast.find(s => s.num === 6);
  assert.strictEqual(s6.phase, 'Divide & Ball');
  assert.ok(s6.title.includes('Divide & Shape'));

  // Step 7: Proof Balls (exactly once after shaping)
  const s7 = stepsYeast.find(s => s.num === 7);
  assert.strictEqual(s7.phase, 'Ball Proof & Relaxation');
  assert.ok(s7.title.includes('1–1.5 hrs'));
});

// 22. Item 2: Pan Mode Single Pan Proof After Shaping
test('Item 2: Pan mode has exactly one rise after shaping (pan proof replaces separate warm-up/ball-proof)', () => {
  // Cold ferment pan mode
  const fPanCold = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'pan', fermentStyle: 'cold' });
  const stepsCold = buildSteps(fPanCold);
  const s7Cold = stepsCold.find(s => s.num === 7);
  const s9Cold = stepsCold.find(s => s.num === 9);
  assert.strictEqual(s7Cold.phase, 'Pan Press & Proof');
  assert.ok(s7Cold.title.includes('2–3 hrs'));
  assert.ok(!s9Cold.screenDesc.includes('Crucial Pan Proof')); // Pan proof is in step 7, not repeated in step 9
  assert.ok(s9Cold.screenDesc.includes('Dimple & Top'));

  // Same-day pan mode
  const fPanSameDay = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'pan', fermentStyle: 'same_day' });
  const stepsSameDay = buildSteps(fPanSameDay);
  const s7SameDay = stepsSameDay.find(s => s.num === 7);
  const s9SameDay = stepsSameDay.find(s => s.num === 9);
  assert.strictEqual(s7SameDay.phase, 'Pan Press & Proof');
  assert.ok(!s9SameDay.screenDesc.includes('Crucial Pan Proof'));
});

// 23. Item 3: Cold Sourdough Room-Temperature Bulk and Warm Water
test('Item 3: Cold sourdough includes 3–4h room-temperature bulk before fridge and 75°F–80°F water', () => {
  const fSourdoughCold = computeFormula({ ...NY_DEFAULTS, yeastType: 'sourdough', fermentStyle: 'cold' });
  const steps = buildSteps(fSourdoughCold);
  
  // Step 2 water temperature
  const s2 = steps.find(s => s.num === 2);
  assert.ok(s2.screenDesc.includes('75°F to 80°F') || s2.screenDesc.includes('warm water'));

  // Step 5 room temperature bulk before balling
  const s5 = steps.find(s => s.num === 5);
  assert.strictEqual(s5.phase, 'Ambient Bulk & Balling');
  assert.ok(s5.title.includes('3–4 hrs'));
  assert.ok(s5.screenDesc.includes('3 to 4 hours'));

  // Step 7 room temperature warm-up uses 2–3 hours from definition
  const s7 = steps.find(s => s.num === 7);
  assert.ok(s7.title.includes('2–3 hrs'));
  assert.ok(s7.screenDesc.includes('2 to 3 hours'));
});

// 24. Item 4: Outdoor Oven Temperature Adapts to Sugar Level
test('Item 4: Outdoor oven preheat temperature and bake time adapt to sugar level to avoid scorch', () => {
  // High sugar (1.5% default NY dough) -> 600°F–650°F floor, 4–5m bake
  const fSugar = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'outdoor_oven', includeSugar: true, sugarPct: 1.5 });
  const stepsSugar = buildSteps(fSugar);
  const s8Sugar = stepsSugar.find(s => s.num === 8);
  const s9Sugar = stepsSugar.find(s => s.num === 9);
  assert.ok(s8Sugar.title.includes('600°F–650°F'));
  assert.ok(s9Sugar.title.includes('4–5 min'));

  // Lean dough (0% sugar) -> 650°F–700°F floor, 3–4m bake
  const fLean = computeFormula({ ...NY_DEFAULTS, bakingSurface: 'outdoor_oven', includeSugar: false, sugarPct: 0 });
  const stepsLean = buildSteps(fLean);
  const s8Lean = stepsLean.find(s => s.num === 8);
  const s9Lean = stepsLean.find(s => s.num === 9);
  assert.ok(s8Lean.title.includes('650°F–700°F'));
  assert.ok(s9Lean.title.includes('3–4 min'));
});

// 25. Undefined Variable Safety Guard
test('Pizza timer and wake lock handlers do not reference obsolete/undefined variables (e.g. timerIsRunning, wakeLockWanted)', () => {
  const fs = require('fs');
  const path = require('path');
  const code = fs.readFileSync(path.join(__dirname, '../pizza/app.js'), 'utf8');
  assert.ok(!code.includes('timerIsRunning'), 'pizza/app.js must not reference obsolete timerIsRunning');
  assert.ok(!code.includes('timerRemainingSeconds'), 'pizza/app.js must not reference obsolete timerRemainingSeconds');
  assert.ok(!code.includes('timerTotalSeconds'), 'pizza/app.js must not reference obsolete timerTotalSeconds');
  assert.ok(!code.includes('wakeLockWanted'), 'pizza/app.js must not reference obsolete wakeLockWanted');
  assert.ok(!code.includes('wakeLockSentinel'), 'pizza/app.js must not reference obsolete wakeLockSentinel');
});

// 26. Kitchen Timer User Workflow (Load, Pause, Resume, Clear)
test('Pizza timer user workflow: load, toggle (paused), toggle (running), finish, toggle (cleared)', () => {
  clearTimer();
  assert.strictEqual(timerEngine.getState().isRunning, false);
  assert.strictEqual(timerEngine.getState().remainingSeconds, 0);

  // User starts a step timer (e.g. 20m bench rest = 1200s)
  loadTimer(1200, 'Bench Rest');
  assert.strictEqual(timerEngine.getState().isRunning, true);
  assert.strictEqual(timerEngine.getState().remainingSeconds, 1200);
  assert.strictEqual(timerEngine.getState().labelText, 'Bench Rest');

  // User clicks Pause on timer card or mobile pill (toggleTimer)
  toggleTimer();
  assert.strictEqual(timerEngine.getState().isRunning, false, 'Timer should be paused after first toggle');
  assert.strictEqual(timerEngine.getState().remainingSeconds, 1200);

  // User clicks Resume (toggleTimer)
  toggleTimer();
  assert.strictEqual(timerEngine.getState().isRunning, true, 'Timer should be running after second toggle');

  // Simulate timer finish (remainingSeconds becomes 0 while totalSeconds > 0)
  timerEngine.load(0, 'Rest Complete');
  assert.strictEqual(timerEngine.getState().remainingSeconds, 0);

  // User clicks to dismiss/clear finished timer (toggleTimer)
  toggleTimer();
  assert.strictEqual(timerEngine.getState().remainingSeconds, 0);
  assert.strictEqual(timerEngine.getState().totalSeconds, 0);
  assert.strictEqual(timerEngine.getState().isRunning, false);
});

console.log(`\n🎉 All ${passed} formula tests passed successfully!\n`);
