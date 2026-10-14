const assert = require('assert');

// Test suite for computeFormula and buildSteps
const {
  computeFormula,
  buildSteps,
  formatSaltVolume,
  GRAIN_DEFINITIONS,
  SALT_DEFINITIONS,
  LEAVENING_DEFINITIONS,
  KAB_DEFAULTS
} = require('../app.js');

console.log('🧪 Running Bread Nerd Formula Tests...\n');

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

// 1. King Arthur Baseline Formula
test('KA Baseline formula returns 600g flour, 379g water, 15g salt, 7g yeast, 11g sugar', () => {
  const state = {
    totalFlour: 600,
    loaves: 2,
    baseHydrationPct: 63.2,
    hydrationPct: 63.2,
    autoAdjustHydration: false,
    specialtyPct: 0,
    specialtyGrain: 'whole_wheat',
    saltType: 'table',
    saltPct: 2.5,
    yeastType: 'instant',
    yeastPct: 1.17,
    sugarPct: 1.83,
    includeSugar: true,
    bakingVessel: 'sheet'
  };

  const f = computeFormula(state);
  assert.strictEqual(f.totalFlour, 600);
  assert.strictEqual(f.breadFlourGrams, 600);
  assert.strictEqual(f.specialtyGrams, 0);
  assert.strictEqual(f.totalWaterGrams, 379); // 600 * 0.632 = 379.2 -> 379
  assert.strictEqual(f.saltGrams, 15);        // 600 * 0.025 = 15
  assert.strictEqual(f.yeastGrams, 7);       // 600 * 0.0117 = 7.02 -> 7
  assert.strictEqual(f.sugarGrams, 11);      // 600 * 0.0183 = 10.98 -> 11
  assert.strictEqual(f.totalDough, 1012);    // 600 + 379 + 15 + 7 + 11 = 1012
  assert.strictEqual(f.perLoaf, 506);        // 1012 / 2 = 506
});

// 2. Sourdough Offsets (Starter Flour & Water)
test('Sourdough Starter inoculation (20%) properly offsets bread flour and water', () => {
  const state = {
    totalFlour: 600,
    loaves: 2,
    baseHydrationPct: 63.2,
    hydrationPct: 63.2,
    autoAdjustHydration: false,
    specialtyPct: 20,
    specialtyGrain: 'spelt',
    starterRatePct: 20,
    saltType: 'table',
    saltPct: 2.5,
    yeastType: 'sourdough',
    yeastPct: 1.17,
    sugarPct: 0,
    includeSugar: false,
    bakingVessel: 'dutch_oven'
  };

  const f = computeFormula(state);
  // 20% starter = 120g starter (60g flour + 60g water)
  assert.strictEqual(f.starterGrams, 120);
  assert.strictEqual(f.starterFlourGrams, 60);
  assert.strictEqual(f.starterWaterGrams, 60);

  // Specialty grain = 20% of 600g = 120g spelt
  assert.strictEqual(f.specialtyGrams, 120);

  // Added bread flour = 600 - 120 (spelt) - 60 (starter) = 420g
  assert.strictEqual(f.breadFlourGrams, 420);
  assert.strictEqual(f.breadFlourGrams + f.specialtyGrams + f.starterFlourGrams, 600);

  // Total water at 63.2% = 379g; added water = 379 - 60 = 319g
  assert.strictEqual(f.totalWaterGrams, 379);
  assert.strictEqual(f.addedWaterGrams, 319);
});

// 3. Hydration Clamping (50% to 85%)
test('Hydration is clamped at 85% upper bound and 50% lower bound', () => {
  // 50% rye with 78% preset unclamped would be 78 + 11 = 89% -> clamp at 85%
  const highState = {
    totalFlour: 600,
    loaves: 2,
    baseHydrationPct: 78,
    hydrationPct: 78,
    autoAdjustHydration: true,
    specialtyPct: 50,
    specialtyGrain: 'rye',
    saltType: 'table',
    saltPct: 2.5,
    yeastType: 'instant',
    yeastPct: 1.17,
    includeSugar: true,
    sugarPct: 1.83,
    bakingVessel: 'sheet'
  };
  const fHigh = computeFormula(highState);
  assert.strictEqual(fHigh.effectiveHydrationPct, 85);

  // Low hydration clamp: 52% base with 50% einkorn (-7.5%) unclamped = 44.5% -> clamp at 50%
  const lowState = {
    totalFlour: 600,
    loaves: 2,
    baseHydrationPct: 52,
    hydrationPct: 52,
    autoAdjustHydration: true,
    specialtyPct: 50,
    specialtyGrain: 'einkorn',
    saltType: 'table',
    saltPct: 2.5,
    yeastType: 'instant',
    yeastPct: 1.17,
    includeSugar: false,
    sugarPct: 0,
    bakingVessel: 'sheet'
  };
  const fLow = computeFormula(lowState);
  assert.strictEqual(fLow.effectiveHydrationPct, 50);
});

// 4. Heritage Grain Water Direction (Negative for Spelt & Einkorn, Positive for WW & Rye)
test('Grain hydration adjustments hold water back for spelt and einkorn, add water for rye and whole wheat', () => {
  const speltState = {
    totalFlour: 600,
    loaves: 2,
    baseHydrationPct: 65,
    hydrationPct: 65,
    autoAdjustHydration: true,
    specialtyPct: 20,
    specialtyGrain: 'spelt',
    saltType: 'table',
    saltPct: 2.5,
    yeastType: 'instant',
    yeastPct: 1.17,
    includeSugar: false,
    sugarPct: 0,
    bakingVessel: 'sheet'
  };
  const fSpelt = computeFormula(speltState);
  // 20% spelt at -0.10 per % = -2.0% -> 63.0%
  assert.strictEqual(fSpelt.recommendedBump, -2.0);
  assert.strictEqual(fSpelt.effectiveHydrationPct, 63.0);

  const einkornState = { ...speltState, specialtyGrain: 'einkorn' };
  const fEinkorn = computeFormula(einkornState);
  // 20% einkorn at -0.15 per % = -3.0% -> 62.0%
  assert.strictEqual(fEinkorn.recommendedBump, -3.0);
  assert.strictEqual(fEinkorn.effectiveHydrationPct, 62.0);

  const wwState = { ...speltState, specialtyGrain: 'whole_wheat' };
  const fWW = computeFormula(wwState);
  // 20% whole wheat at +0.15 per % = +3.0% -> 68.0%
  assert.strictEqual(fWW.recommendedBump, 3.0);
  assert.strictEqual(fWW.effectiveHydrationPct, 68.0);

  const ryeState = { ...speltState, specialtyGrain: 'rye' };
  const fRye = computeFormula(ryeState);
  // 20% rye at +0.22 per % = +4.4% -> 69.4%
  assert.strictEqual(fRye.recommendedBump, 4.4);
  assert.strictEqual(fRye.effectiveHydrationPct, 69.4);
});

// 5. Unified buildSteps - Step 8 Dutch Oven Cooling & Sourdough Step 2 Consistency
test('buildSteps adapts Step 8 cooling to vessel and loaf count', () => {
  // Dutch oven with 2 loaves
  const fDutchMulti = computeFormula({
    ...KAB_DEFAULTS,
    bakingVessel: 'dutch_oven',
    loaves: 2
  });
  const stepsDutchMulti = buildSteps(fDutchMulti);
  const step8DM = stepsDutchMulti.find(s => s.num === 8);
  assert.ok(step8DM.title.includes('Reheat Pot'), 'Multi-loaf Dutch oven step 8 should mention reheating pot');
  assert.ok(step8DM.screenDesc.includes('reheat for ~10 minutes'), 'Desc should explain 10m reheat between loaves');
  assert.ok(step8DM.copyDesc.includes('Reheat covered pot'), 'Copy text should include pot reheat note');
  assert.strictEqual(step8DM.timers.length, 1);
  assert.strictEqual(step8DM.timers[0].time, 600);

  // Dutch oven with 1 loaf
  const fDutchSingle = computeFormula({
    ...KAB_DEFAULTS,
    bakingVessel: 'dutch_oven',
    loaves: 1
  });
  const stepsDutchSingle = buildSteps(fDutchSingle);
  const step8DS = stepsDutchSingle.find(s => s.num === 8);
  assert.ok(step8DS.title.includes('Remove from Pot'), 'Single loaf Dutch oven step 8 should say remove from pot');
  assert.ok(step8DS.screenDesc.includes('Turn off oven'), 'Single loaf Dutch oven should say turn off oven');
  assert.ok(!step8DS.screenDesc.includes('reheat'), 'Single loaf Dutch oven should NOT say reheat');

  // Baking sheet with steam
  const fSheet = computeFormula({
    ...KAB_DEFAULTS,
    bakingVessel: 'sheet',
    loaves: 2
  });
  const stepsSheet = buildSteps(fSheet);
  const step8Sheet = stepsSheet.find(s => s.num === 8);
  assert.ok(step8Sheet.title.includes('Oven Vent'), 'Sheet step 8 should vent in oven');
  assert.ok(step8Sheet.screenDesc.includes('crack door open 2–3 inches'), 'Sheet step 8 should crack door open');
});

test('buildSteps sourdough step 2 has consistent mixer time (6 min) across screen and copy', () => {
  const fSourdough = computeFormula({
    ...KAB_DEFAULTS,
    yeastType: 'sourdough'
  });
  const steps = buildSteps(fSourdough);
  const step2 = steps.find(s => s.num === 2);
  assert.ok(step2.screenDesc.includes('6 minutes') || step2.screenDesc.includes('6 min'));
  assert.ok(step2.copyDesc.includes('6 min'));
  const mixerTimer = step2.timers.find(t => t.time === 360);
  assert.ok(mixerTimer, 'Should offer a 6m mixer timer (360 seconds)');
});

// 6. formatSaltVolume for Table, Morton Kosher, and Diamond Crystal Kosher
test('formatSaltVolume accurately formats table, Morton coarse kosher, and Diamond Crystal kosher volumes', () => {
  // 15g table salt (6.0g/tsp) -> ~2.5 tsp (< 2.95, no tbsp)
  assert.strictEqual(formatSaltVolume(15, 'table'), '~2.5 tsp');

  // 15g Morton coarse kosher (4.8g/tsp) -> 15 / 4.8 = 3.125 -> ~3.1 tsp (~1.0 tbsp)
  assert.strictEqual(formatSaltVolume(15, 'morton'), '~3.1 tsp (~1.0 tbsp)');

  // 15g Diamond Crystal kosher (2.8g/tsp) -> 15 / 2.8 = 5.357 -> ~5.4 tsp (~1.8 tbsp)
  assert.strictEqual(formatSaltVolume(15, 'diamond'), '~5.4 tsp (~1.8 tbsp)');

  // 6g Diamond Crystal -> 6 / 2.8 = 2.14 -> ~2.1 tsp (under 2.95 threshold)
  assert.strictEqual(formatSaltVolume(6, 'diamond'), '~2.1 tsp');
});

// 7. Celsius Temperature Output in buildSteps
test('buildSteps outputs accurate Celsius ranges (93°C–96°C) across screen, print, and copy', () => {
  const f = computeFormula(KAB_DEFAULTS);
  const stepsC = buildSteps(f, 'C');

  // Step 6 should have 232°C
  const step6 = stepsC.find(s => s.num === 6);
  assert.ok(step6.screenDesc.includes('232°C'), 'Step 6 screen should show 232°C');
  assert.ok(step6.printDesc.includes('232°C'), 'Step 6 print should show 232°C');
  assert.ok(step6.copyDesc.includes('232°C'), 'Step 6 copy should show 232°C');

  // Step 7 should have 93°C–96°C
  const step7 = stepsC.find(s => s.num === 7);
  assert.ok(step7.screenDesc.includes('93°C–96°C'), 'Step 7 screen should show 93°C–96°C range');
  assert.ok(step7.printDesc.includes('93°C–96°C'), 'Step 7 print should show 93°C–96°C range');
  assert.ok(step7.copyDesc.includes('93°C–96°C'), 'Step 7 copy should show 93°C–96°C range');

  // In Fahrenheit ('F'), Step 7 should have 200°F–205°F
  const stepsF = buildSteps(f, 'F');
  const step7F = stepsF.find(s => s.num === 7);
  assert.ok(step7F.screenDesc.includes('200°F–205°F'), 'Step 7F screen should show 200°F–205°F');
  assert.ok(step7F.printDesc.includes('200°F–205°F'), 'Step 7F print should show 200°F–205°F');
  assert.ok(step7F.copyDesc.includes('200°F–205°F'), 'Step 7F copy should show 200°F–205°F');
});

// 8. Step 2 and Step 8 Timer Consistency Check across Recipe Permutations
test('step 2 and step 8 timer durations match their instructional text across recipe permutations', () => {
  const vessels = ['sheet', 'dutch_oven'];
  const yeasts = ['instant', 'active_dry', 'fresh', 'sourdough'];
  const grains = ['whole_wheat', 'spelt', 'rye', 'buckwheat', 'einkorn'];

  vessels.forEach(bakingVessel => {
    yeasts.forEach(yeastType => {
      grains.forEach(specialtyGrain => {
        const f = computeFormula({
          ...KAB_DEFAULTS,
          bakingVessel,
          yeastType,
          specialtyGrain,
          specialtyPct: 20,
          loaves: 2
        });
        const steps = buildSteps(f);

        // Step 2 kneading/mixer timer minutes must match screen text
        const step2 = steps.find(s => s.num === 2);
        step2.timers.forEach(t => {
          const mins = Math.round(t.time / 60);
          assert.ok(new RegExp('\\b' + mins + '\\b').test(step2.screenDesc), `Step 2 screenDesc should include timer duration ${mins} min for ${yeastType} + ${specialtyGrain}`);
        });

        // Step 8 pot reheat or oven vent timer minutes must match screen text
        const step8 = steps.find(s => s.num === 8);
        step8.timers.forEach(t => {
          const mins = Math.round(t.time / 60);
          assert.ok(new RegExp('\\b' + mins + '\\b').test(step8.screenDesc), `Step 8 screenDesc should include timer duration ${mins} min for ${bakingVessel}`);
        });
      });
    });
  });
});

// 9. Loaf #2 Dutch Oven Poke-Test Note and 3-4 Loaf Sheet Pan Capacity Note
test('buildSteps includes loaf #2 proofing note for Dutch oven and multi-sheet note for 3+ sheet loaves', () => {
  // Dutch oven multi-loaf
  const fDutchMulti = computeFormula({
    ...KAB_DEFAULTS,
    bakingVessel: 'dutch_oven',
    loaves: 2
  });
  const stepsDutch = buildSteps(fDutchMulti);
  const step4D = stepsDutch.find(s => s.num === 4);
  const step7D = stepsDutch.find(s => s.num === 7);
  const step8D = stepsDutch.find(s => s.num === 8);
  assert.ok(!step4D.screenDesc.includes('Poke-test loaf #2'), 'Step 4 should NOT have redundant poke-test');
  assert.ok(!step7D.screenDesc.includes('Poke-test loaf #2'), 'Step 7 should NOT have redundant poke-test');
  assert.ok(step4D.screenDesc.includes('cold-retard'), 'Step 4 should mention cold-retard');
  assert.ok(step8D.screenDesc.includes('Poke-test loaf #2'), 'Step 8 screen should mention poke-test for loaf #2');
  assert.ok(step8D.printDesc.includes('Poke-test loaf #2'), 'Step 8 print should mention poke-test for loaf #2');
  assert.ok(step8D.copyDesc.includes('poke-test loaf #2'), 'Step 8 copy should mention poke-test for loaf #2');

  // Sheet pan with 3 loaves
  const fSheet3 = computeFormula({
    ...KAB_DEFAULTS,
    bakingVessel: 'sheet',
    loaves: 3
  });
  const stepsSheet3 = buildSteps(fSheet3);
  const step4S = stepsSheet3.find(s => s.num === 4);
  assert.ok(step4S.screenDesc.includes('two baking sheets') || step4S.screenDesc.includes('batches'), 'Step 4 sheet pan for 3 loaves should mention two sheets or batches');
  assert.ok(step4S.printDesc.includes('two sheets') || step4S.printDesc.includes('batches'), 'Step 4 print for 3 loaves should mention two sheets or batches');
});

// 11. Version Consistency Check across package.json, index.html, and sw.js
test('release version matches across package.json, index.html header badge, and sw.js cache name', () => {
  const fs = require('fs');
  const path = require('path');

  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const expectedVer = pkg.version;

  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(
    html.includes(`v${expectedVer}`),
    `index.html header badge must include v${expectedVer} matching package.json`
  );

  const sw = fs.readFileSync(path.join(__dirname, '../sw.js'), 'utf8');
  assert.ok(
    sw.includes(`bread-nerd-v${expectedVer}`),
    `sw.js CACHE_NAME must include bread-nerd-v${expectedVer} matching package.json`
  );
});

console.log(`\n🎉 All ${passed} formula tests passed successfully!\n`);
