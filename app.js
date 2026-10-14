/**
 * BREAD NERD — Modern Bread Baking & Hydration Calculator
 * Based on King Arthur Baking: "The Easiest Loaf of Bread You'll Ever Bake"
 */

(function () {
  'use strict';

  // --- Grain Definitions & Behavioral Science ---
  const GRAIN_DEFINITIONS = {
    whole_wheat: {
      id: 'whole_wheat',
      name: 'Whole Wheat Flour',
      shortName: 'Whole Wheat',
      icon: '🌾',
      desc: '100% stoneground whole wheat with germ and bran intact',
      glutenProfile: 'Moderate gluten strength. Coarse bran particles can cut developing gluten strands, resulting in a slightly tighter crumb loft.',
      waterAbsorptionNote: 'Thirsty bran absorbs significant moisture. Recommend bumping hydration +2.0% to +4.0%.',
      extraWaterPerPct: 0.15, // e.g. 20% WW -> +3.0% hydration
      fermentationSpeed: 'Faster (+15% to +25%)',
      fermentationTiming: 'Higher ash, mineral content, and wild microbes accelerate yeast metabolism. Bulk ferment typically finishes 15–25 minutes earlier.',
      flavor: 'Rich, wholesome, nutty, toasted grain sweetness with an amber-hued crumb.',
      handlingTip: 'Use steady, rhythmic kneading without aggressive tearing so coarse bran flakes do not cut gluten strands.'
    },
    spelt: {
      id: 'spelt',
      name: 'Spelt Flour (Ancient Grain)',
      shortName: 'Spelt',
      icon: '🥨',
      desc: 'Ancient non-hybridized wheat with a delicate, highly extensible gluten matrix',
      glutenProfile: 'Delicate gluten matrix. High extensibility but lower elasticity; can slacken or tear if over-kneaded or over-hydrated.',
      waterAbsorptionNote: 'Absorbs water slowly and gluten holds less moisture than modern wheat. Hold water back by ~1%–3% (-0.10% per % spelt) to keep dough manageable.',
      extraWaterPerPct: -0.10, // e.g. 20% spelt -> -2.0% hydration
      fermentationSpeed: 'Faster (+15% to +20%)',
      fermentationTiming: 'Spelt enzymes break down starches swiftly. Keep a close eye on the 2nd rise so loaves do not over-proof and flatten.',
      flavor: 'Mildly sweet, pleasant nutty profile with subtle honey and summer straw notes.',
      handlingTip: 'Keep kneading gentle (4–5 min if >20% spelt). Maintain firm exterior skin tension when shaping.'
    },
    rye: {
      id: 'rye',
      name: 'Dark / Whole Rye Flour',
      shortName: 'Dark Rye',
      icon: '🥪',
      desc: 'Traditional northern European rye grain loaded with pentosan gums (arabinoxylans)',
      glutenProfile: 'Extremely low glutenin. Dough structure relies on pentosans rather than elastic gluten; feels clay-like and tacky.',
      waterAbsorptionNote: 'Pentosans absorb up to 8x their weight in water. Highly recommend +2.5% to +5.0% extra hydration.',
      extraWaterPerPct: 0.22,
      fermentationSpeed: 'Accelerated (+20% to +30%)',
      fermentationTiming: 'Rye contains hyperactive amylase enzymes. Expect dough to ferment swiftly; check bulk rise 20–30 minutes earlier.',
      flavor: 'Deep, earthy, faintly tangy, old-world rustic character with superb moisture retention and long shelf life.',
      handlingTip: 'Knead with wet hands or a water-dipped bench scraper. Do not expect a traditional gluten windowpane test.'
    },
    buckwheat: {
      id: 'buckwheat',
      name: 'Buckwheat Flour (Gluten-Free Seed)',
      shortName: 'Buckwheat',
      icon: '🥞',
      desc: 'Nutrient-dense botanical pseudo-cereal related to rhubarb (100% gluten-free)',
      glutenProfile: 'Zero gluten. Dilutes the bread flour’s structural web. Keep under 15%–20% for an open crusty hearth loaf.',
      waterAbsorptionNote: 'Seed mucilage absorbs water heavily. Recommend +1.5% to +3.0% hydration.',
      extraWaterPerPct: 0.14,
      fermentationSpeed: 'Standard',
      fermentationTiming: 'Ferments at a steady baseline pace without enzyme acceleration. Dough is more fragile, so handle gently during shaping.',
      flavor: 'Intensely rustic, mineral, nutty, earthy depth with striking dark purple-grey flecks throughout the crumb.',
      handlingTip: 'At 10%–15%, creates a visually stunning, aromatic artisan loaf. Above 25%, loaf will be significantly more compact.'
    },
    einkorn: {
      id: 'einkorn',
      name: 'Einkorn Flour (First Ancient Wheat)',
      shortName: 'Einkorn',
      icon: '🏺',
      desc: 'The original 14-chromosome diploid ancient grain cultivated 10,000+ years ago',
      glutenProfile: 'Very gentle gluten with low toughness; produces exceptionally tender, melt-in-the-mouth bread.',
      waterAbsorptionNote: 'Absorbs water sluggishly and forms a famously sticky dough with low water-holding capacity. Reduce water (-0.15% per % einkorn) to prevent a slack paste.',
      extraWaterPerPct: -0.15, // e.g. 20% einkorn -> -3.0% hydration
      fermentationSpeed: 'Faster (+10% to +15%)',
      fermentationTiming: 'Natural sugars break down quickly. Shorten final proof by ~10 minutes to prevent over-proofing.',
      flavor: 'Vibrant golden crumb from natural lutein (carotenoids) with a rich, sweet, toasted-corn and buttery flavor.',
      handlingTip: 'Gentle hand kneading or lowest mixer speed only. Over-manipulation breaks down the ancient gluten.'
    }
  };

  // --- Salt Definitions (Density & Flake Structure) ---
  const SALT_DEFINITIONS = {
    table: {
      id: 'table',
      name: 'Table Salt / Fine Sea Salt',
      shortName: 'Table Salt',
      gramsPerTsp: 6.0,
      desc: 'Standard fine cubic crystals (6.0g/tsp). Dissolves rapidly into dough.',
      volumeHelp: 'Dense crystals; standard baking measurement.'
    },
    diamond: {
      id: 'diamond',
      name: 'Diamond Crystal Kosher Salt',
      shortName: 'Diamond Crystal Kosher',
      gramsPerTsp: 2.8,
      desc: 'Hollow pyramidal flakes (2.8g/tsp). Light & delicate, dissolves fast.',
      volumeHelp: 'Requires ~2.1x volume vs table salt for identical salinity.'
    },
    morton: {
      id: 'morton',
      name: 'Morton Coarse Kosher Salt',
      shortName: 'Morton Kosher',
      gramsPerTsp: 4.8,
      desc: 'Dense, flat rolled flakes (4.8g/tsp). Heavier than Diamond Crystal.',
      volumeHelp: 'Requires ~1.25x volume vs table salt for identical salinity.'
    }
  };

  // --- Leavening Definitions ---
  const LEAVENING_DEFINITIONS = {
    instant: {
      id: 'instant',
      name: 'Instant Dry Yeast',
      shortName: 'Instant Yeast',
      multiplier: 1.0,
      desc: 'Original KAB recipe: 2 1/4 tsp (7g) instant dry yeast. Mixes directly with dry flour.',
      firstRiseDesc: '1 to 2 hours until doubled',
      finalProofDesc: '45 minutes until puffy',
      waterTempF: '90°F to 110°F',
      waterTempC: '32°C to 43°C'
    },
    active_dry: {
      id: 'active_dry',
      name: 'Active Dry Yeast (1.25x)',
      shortName: 'Active Dry',
      multiplier: 1.25,
      desc: 'Requires warm water bloom (10 min at 105°F–110°F / 40°C–43°C). Dosed at 1.25x for equivalent leavening power.',
      firstRiseDesc: '1 to 2 hours until doubled',
      finalProofDesc: '50 to 60 minutes until puffy',
      waterTempF: '105°F to 110°F',
      waterTempC: '40°C to 43°C'
    },
    fresh: {
      id: 'fresh',
      name: 'Fresh Cake / Compressed Yeast (3x)',
      shortName: 'Fresh Yeast',
      multiplier: 3.0,
      desc: 'High-moisture compressed yeast dosed at 3.0x for equivalent leavening power. Crumbles and dissolves immediately into lukewarm water (80°F–90°F / 27°C–32°C).',
      firstRiseDesc: '1 to 1.5 hours until doubled',
      finalProofDesc: '35 to 45 minutes until puffy',
      waterTempF: '80°F to 90°F',
      waterTempC: '27°C to 32°C'
    },
    sourdough: {
      id: 'sourdough',
      name: 'Active Sourdough Starter (100% Hydration)',
      shortName: 'Sourdough Starter',
      multiplier: 0,
      desc: 'Wild yeast & lactobacilli starter (1:1 flour:water). Base flour and water automatically offset to keep dough mass and hydration exact.',
      firstRiseDesc: '4 to 6 hours at room temp (or 12–16 hrs overnight fridge retard)',
      finalProofDesc: '2.0 to 3.5 hours at room temp until puffy',
      waterTempF: '80°F to 85°F',
      waterTempC: '27°C to 29°C'
    }
  };

  // --- Baseline King Arthur Recipe Constants ---
  const KAB_DEFAULTS = {
    loaves: 2,
    baseFlourPerLoaf: 300, // 600g total for 2 loaves (540g initial dough + 60g kneading bench)
    totalFlour: 600,
    baseHydrationPct: 63.2,// Base white-flour hydration preference
    hydrationPct: 63.2,    // Effective hydration (379g water / 600g flour = 63.17%)
    autoAdjustHydration: true, // Automatically compensate hydration for grain thirst
    saltType: 'table',     // table, diamond, morton
    saltPct: 2.5,          // 15g salt / 600g flour (2 1/2 tsp)
    yeastType: 'instant',  // instant, active_dry, fresh, sourdough
    yeastPct: 1.17,        // 7g instant yeast / 600g flour (2 1/4 tsp / 1 packet)
    starterRatePct: 20,    // 10% to 30% sourdough inoculation rate (default 20% = 120g)
    sugarPct: 1.83,        // 11g granulated sugar / 600g flour (1 tbsp)
    includeSugar: true,
    specialtyGrain: 'whole_wheat', // whole_wheat, spelt, rye, buckwheat, einkorn
    specialtyPct: 0,       // Starts at 0%
    tempUnit: 'F',         // 'F' or 'C'
    bakingVessel: 'sheet'  // 'sheet' or 'dutch_oven'
  };

  // LocalStorage storage keys
  const STORAGE_RECIPE_KEY = 'breadNerd_recipe_v1';
  const STORAGE_TIMER_KEY = 'breadNerd_timer_v1';

  // State object
  const state = { ...KAB_DEFAULTS };

  // Timer state
  let timerInterval = null;
  let timerRemainingSeconds = 0;
  let timerTotalSeconds = 0;
  let timerIsRunning = false;
  let timerLabelText = 'Ready';
  let timerEndTime = null;
  let wakeLockSentinel = null;
  let wakeLockWanted = false;
  let sharedAudioCtx = null;

  // Helper to ensure numbers never evaluate to NaN
  function sanitizeNumber(val, fallback) {
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  }

  // Helper to format salt volume according to crystal size & brand density
  function formatSaltVolume(saltGrams, saltType) {
    const salt = SALT_DEFINITIONS[saltType] || SALT_DEFINITIONS.table;
    const tsp = saltGrams / salt.gramsPerTsp;
    if (tsp >= 2.95) {
      const tbsp = tsp / 3.0;
      return `~${tsp.toFixed(1)} tsp (~${tbsp.toFixed(1)} tbsp)`;
    }
    return `~${tsp.toFixed(1)} tsp`;
  }

  // DOM Elements (guarded for Node.js unit testing)
  const DOM = (typeof document !== 'undefined') ? {
    flourInput: document.getElementById('flourInput'),
    hydrationSlider: document.getElementById('hydrationSlider'),
    hydrationValue: document.getElementById('hydrationValue'),
    hydrationCompBadge: document.getElementById('hydrationCompBadge'),
    loafButtons: document.querySelectorAll('.loaf-btn'),
    hydrationPresetButtons: document.querySelectorAll('#hydrationPresetGroup .preset-btn'),
    resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),
    
    // Specialty Grain Card
    grainPctValue: document.getElementById('grainPctValue'),
    totalFlourEcho: document.getElementById('totalFlourEcho'),
    specialtySlider: document.getElementById('specialtySlider'),
    grainChips: document.querySelectorAll('.grain-chip'),
    grainPresetButtons: document.querySelectorAll('#grainPresetGroup .preset-btn'),
    breadFlourSegment: document.getElementById('breadFlourSegment'),
    specialtySegment: document.getElementById('specialtySegment'),
    breadFlourSegLabel: document.getElementById('breadFlourSegLabel'),
    specialtySegLabel: document.getElementById('specialtySegLabel'),
    autoHydrationToggle: document.getElementById('autoHydrationToggle'),
    autoHydrationHint: document.getElementById('autoHydrationHint'),
    grainAdvisoryBox: document.getElementById('grainAdvisoryBox'),

    // Profile box
    profileBadge: document.getElementById('profileBadge'),
    profileDifficulty: document.getElementById('profileDifficulty'),
    profileDescription: document.getElementById('profileDescription'),
    profileTips: document.getElementById('profileTips'),
    
    // Ingredients Table & Badges
    ingredientsTbody: document.getElementById('ingredientsTbody'),
    ingredientsTfoot: document.getElementById('ingredientsTfoot'),
    doughWeightBadge: document.getElementById('doughWeightBadge'),
    loafWeightBadge: document.getElementById('loafWeightBadge'),
    stepLoavesCount: document.getElementById('stepLoavesCount'),
    stepLoafGrams: document.getElementById('stepLoafGrams'),
    
    // Fine-Tuning Drawer
    toggleTuningBtn: document.getElementById('toggleTuningBtn'),
    tuningBody: document.getElementById('tuningBody'),
    saltTypeSelect: document.getElementById('saltTypeSelect'),
    saltSlider: document.getElementById('saltSlider'),
    saltPctLabel: document.getElementById('saltPctLabel'),
    saltDesc: document.getElementById('saltDesc'),
    yeastTypeSelect: document.getElementById('yeastTypeSelect'),
    yeastPctLabel: document.getElementById('yeastPctLabel'),
    yeastDesc: document.getElementById('yeastDesc'),
    sourdoughControls: document.getElementById('sourdoughControls'),
    starterRateSlider: document.getElementById('starterRateSlider'),
    starterRateLabel: document.getElementById('starterRateLabel'),
    sugarSlider: document.getElementById('sugarSlider'),
    sugarPctLabel: document.getElementById('sugarPctLabel'),
    includeSugarCheck: document.getElementById('includeSugarCheck'),
    drawerGrainRatioLabel: document.getElementById('drawerGrainRatioLabel'),
    resetAdvancedBtn: document.getElementById('resetAdvancedBtn'),

    // Timer Hub
    timerHubCard: document.getElementById('timerHubCard'),
    activeTimerBadge: document.getElementById('activeTimerBadge'),
    timerCountdown: document.getElementById('timerCountdown'),
    timerLabel: document.getElementById('timerLabel'),
    startTimerBtn: document.getElementById('startTimerBtn'),
    resetTimerBtn: document.getElementById('resetTimerBtn'),
    clearTimerBtn: document.getElementById('clearTimerBtn'),
    quickChips: document.querySelectorAll('.chip-btn'),
    loadTimerBtns: document.querySelectorAll('.load-timer-btn'),

    // Mobile Floating Timer
    mobileFloatingTimer: document.getElementById('mobileFloatingTimer'),
    mobileTimerDigits: document.getElementById('mobileTimerDigits'),
    mobileTimerLabel: document.getElementById('mobileTimerLabel'),
    mobileTimerToggleBtn: document.getElementById('mobileTimerToggleBtn'),
    mobileTimerJump: document.getElementById('mobileTimerJump'),

    // Timeline & Steps
    timelineContainer: document.getElementById('timelineContainer'),
    timelineSteps: document.querySelectorAll('.timeline-step'),
    stepsProgress: document.getElementById('stepsProgress'),
    vesselBtns: document.querySelectorAll('#vesselBtnGroup .vessel-btn'),
    step1Phase: document.getElementById('step1Phase'),
    step1Title: document.getElementById('step1Title'),
    step1Desc: document.getElementById('step1Desc'),
    step1Actions: document.getElementById('step1Actions'),
    step2Phase: document.getElementById('step2Phase'),
    step2Title: document.getElementById('step2Title'),
    step2Desc: document.getElementById('step2Desc'),
    step2Actions: document.getElementById('step2Actions'),
    step3Phase: document.getElementById('step3Phase'),
    step3Title: document.getElementById('step3Title'),
    step3Desc: document.getElementById('step3Desc'),
    step3Actions: document.getElementById('step3Actions'),
    step4Phase: document.getElementById('step4Phase'),
    step4Title: document.getElementById('step4Title'),
    step4Desc: document.getElementById('step4Desc'),
    step4Meta: document.getElementById('step4Meta'),
    step5Phase: document.getElementById('step5Phase'),
    step5Title: document.getElementById('step5Title'),
    step5Desc: document.getElementById('step5Desc'),
    step5Actions: document.getElementById('step5Actions'),
    step6Phase: document.getElementById('step6Phase'),
    step6Title: document.getElementById('step6Title'),
    step6Desc: document.getElementById('step6Desc'),
    step6Actions: document.getElementById('step6Actions'),
    step7Phase: document.getElementById('step7Phase'),
    step7Title: document.getElementById('step7Title'),
    step7Desc: document.getElementById('step7Desc'),
    step7Actions: document.getElementById('step7Actions'),
    step8Phase: document.getElementById('step8Phase'),
    step8Title: document.getElementById('step8Title'),
    step8Desc: document.getElementById('step8Desc'),
    step8Actions: document.getElementById('step8Actions'),

    // Header actions
    viewModeBtn: document.getElementById('viewModeBtn'),
    viewModeIcon: document.getElementById('viewModeIcon'),
    viewModeText: document.getElementById('viewModeText'),
    headerTimerBtn: document.getElementById('headerTimerBtn'),
    headerTimerText: document.getElementById('headerTimerText'),
    wakeLockBtn: document.getElementById('wakeLockBtn'),
    wakeLockIcon: document.getElementById('wakeLockIcon'),
    tempUnitBtn: document.getElementById('tempUnitBtn'),
    tempUnitText: document.getElementById('tempUnitText'),
    copyRecipeBtn: document.getElementById('copyRecipeBtn'),
    printBtn: document.getElementById('printBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeToggleIcon: document.getElementById('themeToggleIcon'),
    themeToggleText: document.getElementById('themeToggleText'),
    toastContainer: document.getElementById('toastContainer'),
    printRecipeCard: document.getElementById('printRecipeCard')
  } : {};

  // --- Baker's Insights & Hydration Profile Engine ---
  function getBakerInsight(f, currentState) {
    // When auto-adjust is on, the extra water compensates for grain thirst/slacking,
    // so the dough handling feels like the base hydration.
    const isAutoAdjust = currentState.autoAdjustHydration && f.recommendedBump !== 0;
    const feelHydration = isAutoAdjust
      ? sanitizeNumber(currentState.baseHydrationPct, KAB_DEFAULTS.hydrationPct)
      : f.effectiveHydrationPct;
    const actualHydration = f.effectiveHydrationPct;

    // 1. Headline & Base Handling Feel
    let badge = '';
    let sensoryCue = '';
    let baseStars = 1;

    if (feelHydration < 58) {
      badge = 'Stiff & Firm Dough (<58%)';
      sensoryCue = 'Dough feels dense and firm with low extensibility; holds shape rigidly with minimal spreading.';
      baseStars = 2;
    } else if (feelHydration <= 65) {
      if (Math.abs(feelHydration - 63.2) < 0.5 && f.specialtyPct === 0) {
        badge = 'King Arthur Baseline (63.2%)';
      } else {
        badge = 'Standard Hearth Dough (58%–65%)';
      }
      sensoryCue = 'Dough is smooth, supple, and non-sticky. Bounces back when pressed with a clean, dry fingertip.';
      baseStars = 1;
    } else if (feelHydration <= 71) {
      badge = 'Balanced & Soft Hearth Dough (66%–71%)';
      sensoryCue = 'Soft and extensible. Tacky to the touch, but releases cleanly from a dry finger when tapped quickly.';
      baseStars = 2;
    } else if (feelHydration <= 76) {
      badge = 'Artisan Open-Crumb Dough (72%–76%)';
      sensoryCue = 'Extensible, soft, and distinctly sticky. Clings to dry bare hands; handle with wet hands or a cold-water-dipped bench scraper.';
      baseStars = 3;
    } else {
      badge = 'Rustic High-Hydration Dough (77%+)';
      sensoryCue = 'Wet and slack with rapid spreading. Requires wet hands and a dough scraper; build structural tension with coil folds.';
      baseStars = 4;
    }

    if (isAutoAdjust) {
      badge += ` · Feels like ~${feelHydration.toFixed(1)}% white dough`;
    }

    // 2. Adjust Handling Difficulty Star Rating for Grain & Process
    let adjustedStars = baseStars;
    const difficultyModifiers = [];

    if (f.specialtyPct >= 20) {
      if (f.grain.id === 'rye' || f.grain.id === 'buckwheat') {
        adjustedStars += 1;
        difficultyModifiers.push(`${f.grain.shortName} Stickiness`);
      } else if (f.grain.id === 'einkorn') {
        adjustedStars += 1;
        difficultyModifiers.push('Fragile Einkorn');
      } else if (f.grain.id === 'spelt' && actualHydration > 65) {
        adjustedStars += 0.5;
        difficultyModifiers.push('Slack Spelt');
      }
    }
    if (f.yeastType === 'sourdough' && feelHydration >= 70) {
      adjustedStars += 0.5;
      difficultyModifiers.push('Sourdough Slacking');
    }

    const finalStars = Math.min(5, Math.max(1, Math.round(adjustedStars)));
    const starString = '★'.repeat(finalStars) + '☆'.repeat(5 - finalStars);
    let difficultyLabel = 'Easy';
    if (finalStars === 2) difficultyLabel = 'Easy–Moderate';
    else if (finalStars === 3) difficultyLabel = 'Intermediate';
    else if (finalStars === 4) difficultyLabel = 'Advanced';
    else if (finalStars === 5) difficultyLabel = 'Expert';

    const modText = difficultyModifiers.length > 0 ? ` (${difficultyModifiers.join(', ')})` : '';
    const difficulty = `<span aria-label="Handling difficulty ${finalStars} of 5 (${difficultyLabel})">Handling: <span aria-hidden="true">${starString}</span> ${difficultyLabel}${modText}</span>`;

    // 3. Modular Rules Engine for Contextual Baker's Cues
    const rules = [];

    // Mixer Rule
    if (actualHydration > 66) {
      rules.push(`<strong>Stand Mixer:</strong> Dough will stick to the bottom of the bowl—this is completely normal at ${actualHydration.toFixed(1)}% hydration. Resist adding flour; knead until the dough is smooth, elastic, and pulls away cleanly from the sides.`);
    } else {
      rules.push(`<strong>Stand Mixer:</strong> Dough should cleanly clear both the bottom and sides of the mixing bowl into a smooth, bouncy ball without needing extra flour.`);
    }

    // Vessel & Shaping Rule
    if (actualHydration >= 75 && f.bakingVessel === 'sheet') {
      rules.push(`⚠️ <strong>Baking Sheet Warning:</strong> At ${actualHydration.toFixed(1)}% water, dough will spread outward ~15%–25% on a flat sheet pan without side support. Shape with firm surface tension, or switch to a Dutch oven for maximum vertical oven spring.`);
    } else if (f.bakingVessel === 'dutch_oven') {
      rules.push(`<strong>Vessel:</strong> Preheated Dutch oven walls will hold vertical loaf height and trap internal dough steam for an expansive oven spring and blistered crust.`);
    }

    // Grain & Crumb Structure Rule
    if (f.specialtyPct >= 20) {
      if (f.grain.id === 'rye') {
        rules.push(`<strong>Crumb Structure:</strong> Because rye relies on viscous pentosans rather than an elastic gluten network, do not expect large open alveoli; expect a moist, close-knit, tender crumb with deep earthy aroma.`);
      } else if (f.grain.id === 'buckwheat') {
        rules.push(`<strong>Crumb Structure:</strong> Buckwheat is gluten-free; its binding and absorption come from soluble starch and natural mucilage rather than gluten. Expect a dense, tender, cake-like crumb with rich earthy aroma.`);
      } else if (f.grain.id === 'einkorn') {
        rules.push(`<strong>Einkorn Handling:</strong> Einkorn gluten is fragile and breaks down easily under friction. Handle gently on stir speed and avoid aggressive machine kneading.`);
      } else if (f.grain.id === 'spelt') {
        rules.push(`<strong>Spelt Hydration:</strong> Spelt absorbs water slowly; if the dough feels slightly wet right after mixing, let it autolyse/rest 5–10 minutes before adding more flour.`);
      } else if (f.grain.id === 'whole_wheat') {
        rules.push(`<strong>Whole Wheat Bran:</strong> Coarse bran flakes physically disrupt gluten strands, producing an even, tight sandwich crumb rather than cavernous pockets.`);
      }
    } else if (f.specialtyPct === 0 && feelHydration >= 72) {
      rules.push(`<strong>Crumb Expectation:</strong> 100% white bread flour with high water enables a more open, irregular artisan crumb, provided gentle handling preserves fermentation bubbles.`);
    }

    // Leavening Rule
    if (f.yeastType === 'sourdough') {
      rules.push(`<strong>Sourdough Fermentation:</strong> Natural sourdough acids and enzymatic activity relax gluten over a 4–6 hour bulk ferment; dough will feel noticeably softer and slacker at shaping time than a fast commercial dough.`);
    }

    const tipsHtml = rules.map(r => `<div class="insight-cue">${r}</div>`).join('');

    return {
      badge,
      difficulty,
      desc: sensoryCue,
      tips: tipsHtml
    };
  }

  // --- Volume Approximations ---
  function getVolumeApproximations(flourGrams, waterGrams, yeastGrams, saltGrams, sugarGrams, saltType, yeastType, starterGrams) {
    const flourCups = (flourGrams / 120).toFixed(1);
    const waterCups = (waterGrams / 237).toFixed(1);
    const sugarTbsp = (sugarGrams / 11.0).toFixed(1);
    const saltVol = formatSaltVolume(saltGrams, saltType);
    let yeastVol = `~${(yeastGrams / 3.1).toFixed(1)} tsp`;
    if (yeastType === 'fresh') {
      yeastVol = `~${(yeastGrams / 17.0).toFixed(1)} cake block`;
    } else if (yeastType === 'sourdough') {
      yeastVol = `~${(starterGrams / 240).toFixed(1)} cups stirred`;
    }

    return {
      flour: `~${flourCups} cups`,
      water: `~${waterCups} cups`,
      yeast: yeastVol,
      salt: saltVol,
      sugar: `~${sugarTbsp} tbsp`
    };
  }

  // --- Render Grain Advisory Box ---
  function renderGrainAdvisory(f) {
    const specPct = f.specialtyPct;
    const grain = f.grain;

    if (specPct === 0) {
      DOM.grainAdvisoryBox.innerHTML = `
        <div class="advisory-header" style="margin-bottom:0;">
          <div class="advisory-title-wrap">
            <span class="advisory-grain-badge">100% Bread Flour Baseline</span>
            <span class="advisory-timing-speed">Standard Timing (1–2 hr Rise)</span>
          </div>
          <span style="font-size:0.78rem; color:var(--text-muted);">Max gluten strength & classic open crumb</span>
        </div>
      `;
      return;
    }

    // Recommended hydration adjustment calculation consumed directly from formula engine
    const baseH = sanitizeNumber(state.baseHydrationPct, KAB_DEFAULTS.hydrationPct);
    const recommendedBump = f.recommendedBump;
    const suggestedHydration = Math.round((baseH + recommendedBump) * 10) / 10;

    // Estimated fermentation timing estimate based on leavening and grain
    let riseTimeEstimate = '60–120 min (Normal)';
    if (state.yeastType === 'sourdough') {
      riseTimeEstimate = (specPct >= 20 && (grain.id === 'rye' || grain.id === 'whole_wheat')) 
        ? '3.5–5 hrs (Accelerated Sourdough)' 
        : '4–6 hrs (Wild Sourdough)';
    } else if (state.yeastType === 'fresh') {
      riseTimeEstimate = (specPct >= 20 && (grain.id === 'rye' || grain.id === 'whole_wheat')) 
        ? '45–60 min' 
        : '1 to 1.5 hrs';
    } else if (state.yeastType === 'active_dry') {
      riseTimeEstimate = (specPct >= 20 && (grain.id === 'rye' || grain.id === 'whole_wheat')) 
        ? '60–80 min' 
        : '1 to 2 hrs';
    } else {
      // Instant dry yeast
      if (specPct >= 25 && grain.id === 'rye') {
        riseTimeEstimate = '45–75 min (Accelerated)';
      } else if (specPct >= 25 && (grain.id === 'whole_wheat' || grain.id === 'spelt')) {
        riseTimeEstimate = '50–85 min (Faster)';
      } else {
        riseTimeEstimate = '60–120 min (1–2 hrs)';
      }
    }

    const unclampedTarget = Math.round((baseH + recommendedBump) * 10) / 10;
    const isCappedMax = unclampedTarget > 85;
    const isCappedMin = unclampedTarget < 50;
    const effectiveBump = Math.round((state.hydrationPct - baseH) * 10) / 10;
    const effectiveBumpSign = effectiveBump > 0 ? `+${effectiveBump.toFixed(1)}%` : `${effectiveBump.toFixed(1)}%`;
    const bumpSign = recommendedBump > 0 ? `+${recommendedBump.toFixed(1)}%` : `${recommendedBump.toFixed(1)}%`;
    const actionVerb = recommendedBump > 0 ? 'extra water' : 'water held back';

    let actionMarkup = '';
    if (state.autoAdjustHydration) {
      let adjustDesc = '';
      if (isCappedMax) {
        adjustDesc = `Adjusted <strong>${effectiveBumpSign} (${actionVerb}, capped at 85.0%)</strong> for ${grain.shortName}.`;
      } else if (isCappedMin) {
        adjustDesc = `Adjusted <strong>${effectiveBumpSign} (${actionVerb}, floor at 50.0%)</strong> for ${grain.shortName}.`;
      } else if (recommendedBump !== 0) {
        adjustDesc = `Adjusted <strong>${effectiveBumpSign} (${actionVerb})</strong> (total ${state.hydrationPct.toFixed(1)}%) for ${grain.shortName}.`;
      } else {
        adjustDesc = `Baseline hydration (${state.hydrationPct.toFixed(1)}%) maintained.`;
      }
      actionMarkup = `
        <div class="advisory-action-bar">
          <span class="advisory-action-note auto-adjust-active">
            ✓ Auto-Adjust Active: ${adjustDesc}
          </span>
        </div>
      `;
    } else {
      const suggestedHydration = Math.min(85, Math.max(50, unclampedTarget));
      const targetBump = Math.round((suggestedHydration - baseH) * 10) / 10;
      const targetBumpSign = targetBump > 0 ? `+${targetBump.toFixed(1)}%` : `${targetBump.toFixed(1)}%`;
      let noteDesc = '';
      if (isCappedMax) {
        noteDesc = `Auto-adjust is off. Recommended water adjustment: <strong>${targetBumpSign} (capped at 85.0% max)</strong> for ${grain.shortName}.`;
      } else if (isCappedMin) {
        noteDesc = `Auto-adjust is off. Recommended water adjustment: <strong>${targetBumpSign} (floor at 50.0% min)</strong> for ${grain.shortName}.`;
      } else {
        noteDesc = `Auto-adjust is off. Recommended water adjustment for this blend: <strong>${targetBumpSign}</strong> (${suggestedHydration.toFixed(1)}% total).`;
      }
      actionMarkup = `
        <div class="advisory-action-bar">
          <span class="advisory-action-note">
            ${noteDesc}
          </span>
          <button type="button" class="apply-hydration-btn" id="applySuggestedHydrationBtn" data-target-hydration="${suggestedHydration}">
            Apply Recommended Water (${suggestedHydration.toFixed(1)}%)
          </button>
        </div>
      `;
    }

    DOM.grainAdvisoryBox.innerHTML = `
      <div class="advisory-summary-row" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.6rem;">
        <span class="advisory-grain-badge"><span aria-hidden="true">${grain.icon}</span> ${specPct}% ${grain.shortName} Blend</span>
        <span class="advisory-timing-speed">Est. 1st Rise: ${riseTimeEstimate}</span>
      </div>
      ${actionMarkup}
      <details class="grain-advisory-accordion" style="margin-top:0.6rem;">
        <summary class="grain-advisory-summary">
          <span>Grain Characteristics & Science Details</span>
          <span class="advisory-toggle-indicator" aria-hidden="true">▾</span>
        </summary>
        <div class="advisory-details-body">
          <div class="advisory-grid">
            <div class="advisory-cell">
              <h4>Timing & Fermentation Effect</h4>
              <p>${grain.fermentationTiming}</p>
            </div>
            <div class="advisory-cell">
              <h4>Water Absorption</h4>
              <p>${grain.waterAbsorptionNote} At ${specPct}%, recommended compensation is <strong>${bumpSign}</strong>.</p>
            </div>
            <div class="advisory-cell">
              <h4>Gluten Matrix & Handling</h4>
              <p>${grain.glutenProfile} ${grain.handlingTip}</p>
            </div>
            <div class="advisory-cell">
              <h4>Sensory Flavor & Crumb</h4>
              <p>${grain.flavor}</p>
            </div>
          </div>
        </div>
      </details>
    `;

    // Bind apply suggested hydration button if auto-adjust is off
    const applyBtn = document.getElementById('applySuggestedHydrationBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const targetH = parseFloat(applyBtn.dataset.targetHydration);
        if (!isNaN(targetH) && targetH >= 50 && targetH <= 85) {
          state.baseHydrationPct = Math.round((targetH - recommendedBump) * 10) / 10;
          state.hydrationPct = targetH;
          DOM.hydrationSlider.value = targetH;
          recalculate();
        }
      });
    }
  }

  // --- Pure Step Instruction Builder ---
  function buildSteps(f, tempUnit) {
    const isC = (typeof tempUnit === 'string') ? (tempUnit === 'C') : (f.isC || false);
    const isDutch = f.bakingVessel === 'dutch_oven';
    const grain = f.grain || GRAIN_DEFINITIONS.whole_wheat;
    const specialtyPct = f.specialtyPct || 0;
    const specialtyGrams = f.specialtyGrams || 0;
    const breadFlourGrams = f.breadFlourGrams;
    const starterGrams = f.starterGrams || 0;
    const addedWaterGrams = f.addedWaterGrams;
    const totalWaterGrams = f.totalWaterGrams;
    const saltGrams = f.saltGrams;
    const yeastGrams = f.yeastGrams;
    const sugarGrams = f.sugarGrams;
    const perLoaf = f.perLoaf;
    const salt = f.saltDef || SALT_DEFINITIONS.table;
    const yeastDef = f.yeastDef || LEAVENING_DEFINITIONS.instant;

    // STEP 1: Mise & Mixing
    let s1Phase, s1Title, s1ScreenDesc, s1Timers = [], s1PrintDesc, s1CopyDesc;
    if (f.yeastType === 'sourdough') {
      s1Phase = 'Mise & Starter Dispersal';
      s1Title = 'Disperse Starter & Form Shaggy Mass';
      s1ScreenDesc = `In a large mixing bowl, whisk <strong>${starterGrams}g active sourdough starter</strong> into <strong>${addedWaterGrams}g lukewarm water</strong> (${isC ? '27°C to 29°C' : '80°F to 85°F'}) until milky and completely dispersed. Add <strong>${breadFlourGrams}g King Arthur Bread Flour</strong>${specialtyGrams > 0 ? `, <strong>${specialtyGrams}g ${grain.name}</strong>,` : ''} <strong>${saltGrams}g ${salt.shortName}</strong> (${formatSaltVolume(saltGrams, f.saltType)})${f.includeSugar ? `, and <strong>${sugarGrams}g sugar</strong>` : ''}. Mix thoroughly until a rough, shaggy mass forms with no dry flour remaining.`;
      s1PrintDesc = `Whisk ${starterGrams}g active sourdough starter into ${addedWaterGrams}g lukewarm water (${isC ? '27°C–29°C' : '80°F–85°F'}) until milky. Add flours, salt, and optional sugar. Stir into a rough shaggy mass with no dry flour remaining.`;
      s1CopyDesc = `1. Whisk starter into lukewarm water until milky; add flours & salt.`;
    } else if (f.yeastType === 'active_dry') {
      s1Phase = 'Yeast Bloom & Mixing';
      s1Title = 'Bloom Active Dry Yeast & Mix Dough';
      s1ScreenDesc = `<strong>1. Bloom Yeast:</strong> In a small bowl, whisk <strong>${yeastGrams}g Active Dry Yeast</strong> into ~100ml of your measured lukewarm water (${isC ? '40°C to 43°C' : '105°F to 110°F'})${f.includeSugar ? ' with a pinch of the formula sugar' : ''}. Let sit undisturbed for 10 minutes until thick and foamy.<br><strong>2. Form Dough:</strong> Add the foamy yeast mixture, remaining water, flour (${breadFlourGrams}g bread flour${specialtyGrams > 0 ? ` + ${specialtyGrams}g ${grain.shortName}` : ''}), and <strong>${saltGrams}g ${salt.shortName}</strong> (${formatSaltVolume(saltGrams, f.saltType)}). Stir until a cohesive shaggy mass forms.`;
      s1Timers = [{ time: 600, label: 'Active Dry Yeast Bloom (10 min)', text: 'Set 10m Yeast Bloom Timer' }];
      s1PrintDesc = `Bloom ${yeastDef.name} in ~100ml warm water (${isC ? '40°C–43°C' : '105°F–110°F'}) for 10 min until foamy. Add remaining water, flours, salt, and sugar. Mix into a cohesive shaggy dough.`;
      s1CopyDesc = `1. Mix shaggy dough with lukewarm water (bloom yeast 10m first).`;
    } else if (f.yeastType === 'fresh') {
      s1Phase = 'Mise & Mixing';
      s1Title = 'Dissolve Fresh Cake Yeast & Mix Dough';
      s1ScreenDesc = `Crumble <strong>${yeastGrams}g fresh cake yeast</strong> directly into <strong>${addedWaterGrams}g lukewarm water</strong> (${isC ? '27°C to 32°C' : '80°F to 90°F'}) and whisk until dissolved. Add the flours (${breadFlourGrams}g bread flour${specialtyGrams > 0 ? ` + ${specialtyGrams}g ${grain.shortName}` : ''}), <strong>${saltGrams}g ${salt.shortName}</strong> (${formatSaltVolume(saltGrams, f.saltType)})${f.includeSugar ? `, and ${sugarGrams}g sugar` : ''}. Stir together until a cohesive shaggy dough forms.`;
      s1PrintDesc = `Crumble fresh cake yeast into lukewarm water (${isC ? '27°C–32°C' : '80°F–90°F'}) and whisk until dissolved. Add flours, salt, and sugar. Mix into a cohesive shaggy dough.`;
      s1CopyDesc = `1. Mix shaggy dough with lukewarm water (fresh yeast dissolved directly).`;
    } else {
      s1Phase = 'Mise & Mixing';
      s1Title = 'Weigh & Form Shaggy Mass';
      s1ScreenDesc = `In a large bowl or stand mixer bowl, stir together the weighed flour (${breadFlourGrams}g bread flour${specialtyGrams > 0 ? ` + ${specialtyGrams}g ${grain.shortName}` : ''}), <strong>${yeastGrams}g instant yeast</strong>, <strong>${saltGrams}g ${salt.shortName}</strong> (${formatSaltVolume(saltGrams, f.saltType)})${f.includeSugar ? `, and ${sugarGrams}g sugar` : ''}. Pour in <strong>${addedWaterGrams}g lukewarm water</strong> (${isC ? '32°C to 43°C' : '90°F to 110°F'}). Mix until a rough, shaggy dough forms and no dry flour remains.`;
      s1PrintDesc = `Whisk flour, instant dry yeast, salt, and sugar. Pour in lukewarm water (${isC ? '32°C–43°C' : '90°F–110°F'}). Stir until a shaggy, cohesive dough forms.`;
      s1CopyDesc = `1. Mix shaggy dough with lukewarm water.`;
    }

    // STEP 2: Gluten Development
    let s2Phase = 'Gluten Development', s2Title, s2ScreenDesc, s2Timers = [], s2PrintDesc, s2CopyDesc;
    if (f.yeastType === 'sourdough') {
      s2Title = 'Stretch & Folds or Gentle Knead';
      s2ScreenDesc = `<strong>Stretch & Fold Method (Recommended):</strong> Leave dough in the bowl covered. Over the first 90 minutes of bulk rise, perform 3 sets of stretch-and-folds spaced 30 minutes apart. With wet hands, scoop under one quadrant, pull dough gently upward to stretch, and fold over center. Rotate bowl 90° and repeat on all 4 quadrants.${specialtyGrams > 0 ? `<br><em>Note for ${grain.shortName}: Use smooth, gentle handling to prevent shearing delicate gluten webs.</em>` : ''}<br><strong>Alternative Machine Knead:</strong> Equip dough hook and knead on low-medium speed for 6 minutes until dough becomes elastic and bouncy.`;
      s2Timers = [
        { time: 1800, label: 'Sourdough Fold Interval (30 min)', text: 'Set 30m Fold Timer' },
        { time: 360, label: 'Sourdough Mixer Knead (6 min)', text: 'Set 6m Mixer Timer' }
      ];
      s2PrintDesc = `Perform 3 sets of stretch-and-folds spaced 30 min apart over the first 90 minutes (or machine knead 6 min) until smooth and elastic.`;
      s2CopyDesc = `2. 3 sets of stretch-and-folds spaced 30 min apart (or machine knead 6 min).`;
    } else if (specialtyPct >= 20 && grain.id === 'spelt') {
      s2Title = 'Gentle Knead (Delicate Spelt Gluten)';
      s2ScreenDesc = `<strong>Fragile Ancient Gluten:</strong> At ${specialtyPct}% spelt, the gluten matrix is highly extensible but delicate; over-kneading tears the matrix and turns the dough slack. Knead gently by hand for only <strong>4 to 5 minutes</strong> (or 4 minutes on lowest speed in a stand mixer) until dough forms a smooth exterior skin. Avoid aggressive stretching.`;
      s2Timers = [
        { time: 240, label: 'Spelt Mixer Knead (4 min)', text: 'Set 4m Mixer Knead' },
        { time: 300, label: 'Spelt Hand Knead (5 min)', text: 'Set 5m Hand Knead' }
      ];
      s2PrintDesc = `Knead gently for only 4–5 min by hand (or 4 min mixer on low). Spelt's delicate gluten matrix slacks if over-worked.`;
      s2CopyDesc = `2. Knead gently 4-5 min (or 4 min mixer on low; spelt gluten slacks if over-worked).`;
    } else if (specialtyPct >= 20 && grain.id === 'rye') {
      s2Title = 'Rye Dough Handling (Wet Hands / Scraper)';
      s2ScreenDesc = `<strong>Pentosan-Rich Sticky Dough:</strong> At ${specialtyPct}% dark rye, glutenin is significantly reduced; dough cohesion comes from viscous pentosan gums, making the dough feel clay-like and tacky. Work dough for <strong>4 to 5 minutes</strong> using wet hands or a cold-water-dipped bench scraper. <em>Tip: Do not expect a stretchy gluten windowpane!</em>`;
      s2Timers = [
        { time: 240, label: 'Rye Wet Hand Knead (4 min)', text: 'Set 4m Wet Hand Knead' },
        { time: 300, label: 'Rye Bench Scraper (5 min)', text: 'Set 5m Bench Scraper' }
      ];
      s2PrintDesc = `Work dough 4–5 min with wet hands or a cold-water-dipped bench scraper. Rye relies on pentosans; do not expect a windowpane.`;
      s2CopyDesc = `2. Work dough 4-5 min with wet hands/scraper (rye relies on pentosans; no windowpane).`;
    } else if (specialtyPct >= 20 && grain.id === 'buckwheat') {
      s2Title = 'Steady Knead (Gluten-Free Buckwheat)';
      s2ScreenDesc = `<strong>Seed-Mucilage Handling:</strong> At ${specialtyPct}% buckwheat, zero gluten is contributed by buckwheat itself, but the remaining ${(100 - specialtyPct).toFixed(0)}% bread flour still requires a full knead for structural development. Knead by hand for <strong>6 minutes</strong> (or 7 minutes on medium-low speed in a stand mixer). Do not expect a thin windowpane due to natural seed particles.`;
      s2Timers = [
        { time: 360, label: 'Buckwheat Hand Knead (6 min)', text: 'Set 6m Hand Knead' },
        { time: 420, label: 'Buckwheat Mixer Knead (7 min)', text: 'Set 7m Mixer Timer' }
      ];
      s2PrintDesc = `Knead 6–7 min (stand mixer or hand). Buckwheat contributes zero gluten, so the remaining bread flour requires a full knead for structure; do not expect a thin windowpane.`;
      s2CopyDesc = `2. Knead 6-7 min (stand mixer or hand; bread flour requires full knead for structure).`;
    } else if (specialtyPct >= 20 && grain.id === 'einkorn') {
      s2Title = 'Gentle Knead (Ancient Einkorn)';
      s2ScreenDesc = `<strong>Delicate Diploid Gluten:</strong> At ${specialtyPct}% einkorn, proteins are fragile and can break down into a sticky paste under aggressive shearing. Knead gently by hand (or on lowest Stir speed of stand mixer) for <strong>3 to 4 minutes</strong> until homogeneous.`;
      s2Timers = [
        { time: 180, label: 'Einkorn Mixer Stir (3 min)', text: 'Set 3m Mixer Stir' },
        { time: 240, label: 'Einkorn Hand Knead (4 min)', text: 'Set 4m Hand Knead' }
      ];
      s2PrintDesc = `Gentle hand kneading for only 3–4 min (or stand mixer on stir/lowest speed). Einkorn gluten is fragile; avoid high-speed machine kneading.`;
      s2CopyDesc = `2. Gentle knead 3-4 min (stir speed mixer or hand folds; einkorn gluten is fragile).`;
    } else if (specialtyPct >= 20 && grain.id === 'whole_wheat') {
      s2Title = 'Steady Knead (Whole Wheat Bran)';
      s2ScreenDesc = `<strong>Bran-Conscious Development:</strong> At ${specialtyPct}% whole wheat, sharp bran flakes can cut developing gluten strands under tension. Knead by hand for <strong>6 to 7 minutes</strong> with smooth, steady rhythmic folds (or 6 minutes on stand mixer medium-low speed) until resilient and cohesive.`;
      s2Timers = [
        { time: 360, label: 'Whole Wheat Mixer Knead (6 min)', text: 'Set 6m Mixer Knead' },
        { time: 420, label: 'Whole Wheat Hand Knead (7 min)', text: 'Set 7m Hand Knead' }
      ];
      s2PrintDesc = `Knead 6–7 min (or 6 min machine) with rhythmic folds; coarse bran flakes need gentle extra time to align gluten.`;
      s2CopyDesc = `2. Knead 6-7 min (or 6 min machine; rhythmic folds protect gluten from bran cuts).`;
    } else {
      const softGrainNote = specialtyGrams > 0 
        ? `<div class="step-grain-note"><em>At ${specialtyPct}% ${grain.shortName}, the high-protein bread flour provides strong gluten development. Proceed with standard kneading, checking the dough slightly earlier as heritage grains hydrate.</em></div>`
        : '';
      s2Title = 'Knead until Bouncy & Smooth';
      s2ScreenDesc = `<strong>By Hand:</strong> Turn onto lightly floured surface. Fold far edge over itself, press away with heels of hands, turn 90°, and repeat rhythmically for 6 minutes.<br><strong>Stand Mixer:</strong> Equip dough hook; knead on medium-low speed for 7 minutes until dough clears the bowl and feels smooth and elastic.${softGrainNote}`;
      s2Timers = [
        { time: 360, label: 'Kneading Dough (6 min)', text: 'Set 6m Hand Knead Timer' },
        { time: 420, label: 'Mixer Kneading (7 min)', text: 'Set 7m Mixer Timer' }
      ];
      s2PrintDesc = specialtyGrams > 0 
        ? `Knead 6–7 min (stand mixer or hand) until smooth and elastic. Since ${grain.shortName} is under 20%, standard gluten development applies.`
        : `Knead by hand for 6 min on a lightly floured surface (or 7 min with stand mixer dough hook) until bouncy and smooth.`;
      s2CopyDesc = `2. Knead 6-7 min until bouncy and smooth.`;
    }

    // STEP 3: Primary Fermentation
    let s3Phase = 'Primary Fermentation', s3Title, s3ScreenDesc, s3Timers = [], s3PrintDesc, s3CopyDesc;
    const proofHackHtml = `<div class="proof-hack-callout"><strong>Warm Proof Box Tip:</strong> In a cool kitchen, place dough in an unheated oven with a pan of very hot tap water (115°F–120°F / 46°C–49°C) or let boiling water cool for 2–3 minutes first. <em>Heat curve note:</em> The closed oven starts warm (~85°F–90°F / 29°C–32°C) and slowly cools, accelerating early yeast activity. Use an oven thermometer the first time to calibrate, or crack the door slightly if too warm. Check dough at 30–35 minutes!</div>`;
    const speedPct = grain.id === 'rye' ? '20%–30%' : '15%–25%';
    const grainSpeedNote = (specialtyPct >= 20 && (grain.id === 'whole_wheat' || grain.id === 'rye' || grain.id === 'spelt')) ? `
      <div class="step-grain-note">
        <em>Note for ${grain.shortName} (${specialtyPct}%): Rich minerals and active enzymes speed up fermentation by ${speedPct}. Check dough early to prevent over-proofing!</em>
      </div>
    ` : '';

    if (f.yeastType === 'sourdough') {
      s3Title = 'First Rise (Wild Sourdough Bulk Ferment)';
      s3ScreenDesc = `Transfer dough to a lightly oiled clear container. Cover airtight. Wild sourdough cultures ferment gently: let rise at room temperature (${isC ? '21°C to 24°C' : '70°F to 76°F'}) for <strong>4 to 6 hours</strong> until aerated, domed, and increased ~50%–75% in volume.<br><strong>Flavor Retard Option:</strong> After 2 hours at room temperature, place covered container into the refrigerator (${isC ? '3°C to 5°C' : '38°F to 40°F'}) for <strong>12 to 16 hours overnight</strong> for complex lactic & acetic sourdough flavor and effortless cold shaping!${grainSpeedNote}${proofHackHtml}`;
      s3Timers = [
        { time: 14400, label: 'Sourdough Bulk Rise (4 hrs)', text: 'Set 4 hr Bulk Timer' },
        { time: 18000, label: 'Sourdough Bulk Rise (5 hrs)', text: 'Set 5 hr Bulk Timer' },
        { time: 43200, label: 'Overnight Fridge Retard (12 hrs)', text: 'Set 12 hr Retard Timer' }
      ];
      s3PrintDesc = `Bulk ferment 4–6 hours at room temp until puffy and increased 50%–75% (or 2 hrs room temp followed by 12–16 hrs overnight fridge retard for maximum flavor).`;
      s3CopyDesc = `3. Bulk rise 4-6 hrs at room temp (or 12-16 hrs overnight fridge retard).`;
    } else if (f.yeastType === 'fresh') {
      s3Title = 'First Rise (Bulk Ferment)';
      s3ScreenDesc = `Place dough into a lightly oiled bowl. Fresh compressed yeast exhibits active fermentation: let rise at room temperature (${isC ? '20°C to 24°C' : '68°F to 75°F'}) for <strong>1 to 1.5 hours (50 to 90 minutes)</strong> until doubled in size.${grainSpeedNote}${proofHackHtml}`;
      s3Timers = [
        { time: 2100, label: 'Check Dough at 35m (Steam Box)', text: 'Check Dough at 35m (Steam Box)' },
        { time: 3600, label: 'Fresh Yeast Rise (60 min)', text: 'Set 60m Rise Timer' },
        { time: 5400, label: 'Fresh Yeast Rise (90 min)', text: 'Set 90m Rise Timer' }
      ];
      s3PrintDesc = `Let rise covered until doubled in volume (50 to 90 minutes). Pro Tip: A turned-off oven with a pan of hot tap water (~85°F–90°F / 29°C–32°C) speeds bulk rise. Check dough at 30–35 minutes!`;
      s3CopyDesc = `3. 1st Rise: 50 to 90 minutes until doubled in volume.`;
    } else if (f.yeastType === 'active_dry') {
      s3Title = 'First Rise (Bulk Ferment)';
      s3ScreenDesc = `Place dough into a lightly oiled bowl. Active dry yeast rises reliably: let rise at room temperature (${isC ? '20°C to 24°C' : '68°F to 75°F'}) for <strong>1 to 2 hours (60 to 120 minutes)</strong> until doubled in volume.${grainSpeedNote}${proofHackHtml}`;
      s3Timers = [
        { time: 2400, label: 'Check Dough at 40m (Steam Box)', text: 'Check Dough at 40m (Steam Box)' },
        { time: 4500, label: 'Active Dry Rise (75 min)', text: 'Set 75m Rise Timer' },
        { time: 6000, label: 'Active Dry Rise (100 min)', text: 'Set 100m Rise Timer' }
      ];
      s3PrintDesc = `Let rise covered until doubled in volume (1 to 2 hours). Pro Tip: A turned-off oven with hot tap water (~85°F–90°F / 29°C–32°C) speeds bulk rise. Check dough at 35–40 minutes!`;
      s3CopyDesc = `3. 1st Rise: 1 to 2 hours (60 to 120 minutes) until doubled in volume.`;
    } else {
      s3Title = 'First Rise (Bulk Ferment)';
      s3ScreenDesc = `Place dough into a lightly oiled bowl. Let rise at room temperature (${isC ? '20°C to 24°C' : '68°F to 75°F'}) until doubled in volume (approx. <strong>1 to 2 hours / 60 to 120 minutes</strong>, depending on room temperature).${grainSpeedNote}${proofHackHtml}`;
      const acceleratedTimer = (specialtyPct >= 20 && (grain.id === 'whole_wheat' || grain.id === 'rye' || grain.id === 'spelt'))
        ? [{ time: 2700, label: 'Check Dough at 45m (Accelerated)', text: 'Check Dough at 45m (Accelerated)' }]
        : [];
      s3Timers = [
        { time: 2100, label: 'Check Dough at 35m (Steam Box)', text: 'Check Dough at 35m (Steam Box)' },
        ...acceleratedTimer,
        { time: 3600, label: '1st Bulk Rise (60 min)', text: 'Set 60m Rise Timer' },
        { time: 5400, label: '1st Bulk Rise (90 min)', text: 'Set 90m Rise Timer' },
        { time: 7200, label: '1st Bulk Rise (2 hrs)', text: 'Set 2 hr Rise Timer' }
      ];
      s3PrintDesc = `Let rise covered until doubled in volume (1 to 2 hours). Pro Tip: A turned-off oven with a pot of hot water creates a gentle proof box (85°F–90°F / 29°C–32°C) cutting rise time. Check at 30–35 min!`;
      s3CopyDesc = `3. 1st Rise: 1 to 2 hours until doubled in volume.`;
    }

    // STEP 4: Divide & Shape
    let s4Phase = 'Divide & Shape', s4Title, s4ScreenDesc, s4Meta = null, s4Timers = [], s4PrintDesc, s4CopyDesc;
    if (isDutch) {
      s4Title = f.loaves > 1 ? 'Divide & Shape into Round Boules' : 'Shape into a Round Boule';
      const sequentialBakeNote = f.loaves > 1 ? `
        <br><strong>Sequential Baking Strategy:</strong> Because standard 5–6 qt pots fit only one loaf at a time, stagger your bakes: let loaf #1 proof at room temperature, while placing remaining shaped loaves (loaf #2${f.loaves > 2 ? `–#${f.loaves}` : ''}) into the refrigerator to cold-retard. This prevents over-proofing while loaf #1 preheats and bakes!
      ` : '';
      s4ScreenDesc = `Turn dough onto lightly floured work surface. ${f.loaves > 1 ? `Divide into <strong>${f.loaves} equal portions</strong> (~${perLoaf}g each).` : `Dough weight is ~${perLoaf}g.`}<br><strong>Round Boule Shaping:</strong> At ~${perLoaf}g, this loaf fits a standard 5–6 qt round Dutch oven perfectly when shaped as a round boule or short oval batard. Gently pull the edges toward the center to form a tight ball, cup your hands around it, and pull the dough across the counter to build firm surface tension.${sequentialBakeNote}`;
      s4Meta = `<span class="meta-tag">Target: Round boules / short ovals</span>${f.loaves > 1 ? '<span class="meta-tag">Retard remaining loaves in fridge</span>' : '<span class="meta-tag">Single Dutch oven batch</span>'}`;
      const multiLoafRetardPrint = f.loaves > 1 ? ' If baking sequentially in a single Dutch oven, place remaining shaped loaves in refrigerator to retard while preheating and baking the first (reheat covered pot ~10 min between bakes).' : '';
      s4PrintDesc = `Turn dough onto floured work surface. ${f.loaves > 1 ? `Divide into ${f.loaves} equal portions (~${perLoaf}g each).` : `Total loaf weight is ~${perLoaf}g.`} Flatten each piece, fold into thirds, and cup hands around dough to shape into a round boule or short oval batard with good surface tension.${multiLoafRetardPrint}`;
      s4CopyDesc = `4. ${f.loaves > 1 ? `Divide into ${f.loaves} loaves (~${perLoaf}g each), shape into round boules or short oval batards (tight surface tension).` : `Shape into a round boule or short oval batard (~${perLoaf}g, tight surface tension).`}${f.loaves > 1 ? ' If baking sequentially, refrigerate remaining loaves while baking loaf #1 (reheat pot ~10 min between bakes).' : ''}`;
    } else {
      s4Title = 'Deflate, Divide & Letter Fold';
      const multiSheetNote = f.loaves > 2 ? '<br><strong>Pan Capacity:</strong> Standard half-sheet pans fit up to 2 loaves. For 3 or 4 loaves, use two baking sheets (baking on upper and lower thirds of oven and swapping halfway), or bake in batches, refrigerating the second batch.' : '';
      s4ScreenDesc = `Turn dough onto lightly floured work surface. Divide into <strong>${f.loaves} equal portions</strong> (~${perLoaf}g each). Flatten each piece into a 6" × 8" rectangle, letter-fold into thirds like a business letter, and roll tightly into a 10" cylinder, sealing the bottom seam.${multiSheetNote}`;
      s4Meta = `<span class="meta-tag">Target: 10" tight logs</span><span class="meta-tag">Seam side down</span>${f.loaves > 2 ? '<span class="meta-tag">Use 2 sheets or batch bake</span>' : ''}`;
      const multiSheetPrint = f.loaves > 2 ? ' Standard pans fit up to 2 loaves. For 3–4 loaves, use two sheets, or bake in batches, refrigerating the second batch.' : '';
      s4PrintDesc = `Turn dough onto floured work surface. Divide into ${f.loaves} equal portions (~${perLoaf}g each). Flatten each piece into a 6" × 8" rectangle, letter-fold into thirds, and roll tightly into a 10" cylinder, sealing the bottom seam.${multiSheetPrint}`;
      s4CopyDesc = `4. Divide into ${f.loaves} loaves (~${perLoaf}g each), letter fold & roll 10" cylinders, sealing bottom seam.${f.loaves > 2 ? ' (3+ loaves: use two sheets, or bake in batches, refrigerating 2nd batch).' : ''}`;
    }

    // STEP 5: Final Proof
    let s5Phase = 'Final Proof', s5Title = 'Final Proof & Poke Test', s5ScreenDesc, s5Timers = [], s5PrintDesc, s5CopyDesc;
    const vesselPrepNote = isDutch 
      ? 'onto individual sheets of parchment paper (lightly dusted with <strong>coarse semolina flour or yellow cornmeal</strong>, using the paper as a sling later to safely lower loaves into the hot Dutch oven) or into floured banneton proofing baskets'
      : (f.loaves > 2
          ? 'onto two baking sheets (or in batches) generously sprinkled with <strong>coarse semolina flour or yellow cornmeal (~15g)</strong>'
          : 'onto a baking sheet generously sprinkled with <strong>coarse semolina flour or yellow cornmeal (~15g)</strong> (providing a natural non-stick ball-bearing layer and giving the bottom crust its signature artisan crunch)');
    const pokeTestExplanation = `<br><strong>Poke Test:</strong> Gently press a floured fingertip ~1/2" into the dough. KA's baseline recipe considers the loaf ready when the indentation holds and does not bounce back; for artisan hearth loaves, look for an indentation that springs back halfway slowly. <em>Note: Shaped loaves in a warm steam box over-proof quickly; start checking at 25–30 minutes!</em>`;
    const steamBoxProofAction = { time: 1800, label: 'Check Proof at 30m (Steam Box)', text: 'Check at 30m (Steam Box)' };

    if (f.yeastType === 'sourdough') {
      s5ScreenDesc = `Transfer shaped loaves seam-down ${vesselPrepNote}. Cover lightly. Wild sourdough loaves require <strong>2.0 to 3.5 hours</strong> at room temperature to proof until puffy and airy. ${pokeTestExplanation}`;
      s5Timers = [
        { time: 7200, label: 'Sourdough Proof (2 hrs)', text: 'Set 2 hr Proof Timer' },
        { time: 10800, label: 'Sourdough Proof (3 hrs)', text: 'Set 3 hr Proof Timer' }
      ];
    } else if (f.yeastType === 'fresh') {
      s5ScreenDesc = `Transfer loaves seam-down ${vesselPrepNote}. Cover lightly. Fresh yeast proofs quickly: let rise for <strong>35 to 45 minutes</strong> until visibly puffy. ${pokeTestExplanation}`;
      s5Timers = [
        steamBoxProofAction,
        { time: 2400, label: 'Fresh Yeast Proof (40 min)', text: 'Set 40m Proof Timer' }
      ];
    } else if (f.yeastType === 'active_dry') {
      s5ScreenDesc = `Transfer loaves seam-down ${vesselPrepNote}. Cover lightly with oiled plastic wrap. Let rise for <strong>50 to 60 minutes</strong> until noticeably puffy. ${pokeTestExplanation}`;
      s5Timers = [
        steamBoxProofAction,
        { time: 3300, label: 'Active Dry Proof (55 min)', text: 'Set 55m Proof Timer' }
      ];
    } else {
      s5ScreenDesc = `Transfer loaves seam-down ${vesselPrepNote}. Cover lightly with oiled plastic wrap. Let rise for <strong>45 minutes</strong> until noticeably puffy. ${pokeTestExplanation}`;
      s5Timers = [
        steamBoxProofAction,
        { time: 2700, label: 'Final Proof (45 min)', text: 'Set 45m Proof Timer' }
      ];
    }
    const proofSurface = isDutch 
      ? 'parchment paper dusted with coarse semolina flour or cornmeal' 
      : (f.loaves > 2 ? 'two semolina-dusted baking sheets (or proof in batches)' : 'a baking sheet generously sprinkled with coarse semolina flour or yellow cornmeal');
    s5PrintDesc = `Transfer shaped loaves seam-down onto ${proofSurface}. Let proof until puffy (${yeastDef.finalProofDesc}). Poke test: The dough is ready when a gentle fingertip indentation slowly springs back halfway (artisan standard) or holds its indentation without bouncing back (KA baseline).`;
    s5CopyDesc = `5. 2nd Proof: ${yeastDef.finalProofDesc} on semolina/cornmeal-dusted ${isDutch ? 'parchment paper' : (f.loaves > 2 ? 'baking sheets (2 sheets or batches)' : 'baking sheet')}. Poke test: gentle indent rebounds slowly halfway (artisan standard) or holds indent (KA baseline).`;

    // STEP 6: Preheat Setup
    let s6Phase, s6Title, s6ScreenDesc, s6Timers = [], s6PrintDesc, s6CopyDesc;
    if (isDutch) {
      s6Phase = 'Dutch Oven Preheat';
      s6Title = 'Preheat Cast Iron Dutch Oven (45–60 min)';
      s6ScreenDesc = `Place your heavy cast-iron or enameled Dutch oven with its lid inside the oven on the middle rack. Preheat oven to <strong class="temp-val" data-f="450">${isC ? '232°C' : '450°F'}</strong> for <strong>45 to 60 minutes</strong>. Heavy iron needs sufficient time to thoroughly saturate with heat, acting as a radiant mini-hearth for superior oven spring and crispy crust blistering.`;
      s6Timers = [
        { time: 2700, label: 'Dutch Oven Preheat (45 min)', text: 'Set 45m DO Preheat Timer' },
        { time: 3600, label: 'Dutch Oven Preheat (60 min)', text: 'Set 60m DO Preheat Timer' }
      ];
      s6PrintDesc = `Place covered Dutch oven on center rack and preheat oven to ${isC ? '232°C' : '450°F'} for 45–60 minutes to build deep radiant thermal mass.`;
      s6CopyDesc = `6. Preheat ${isC ? '232°C' : '450°F'} with Dutch oven & lid inside for 45-60 min.`;
    } else {
      s6Phase = 'Oven Setup & Preheat';
      s6Title = 'Preheat Oven & Cast-Iron Skillet';
      s6ScreenDesc = `20 minutes before baking, preheat oven to <strong class="temp-val" data-f="450">${isC ? '232°C' : '450°F'}</strong> (<span class="temp-c">${isC ? '450°F' : '232°C'}</span>). Place an empty cast-iron frying pan or heavy metal roasting pan on the bottom oven rack. Bring 1 cup (240ml) of water to a rolling boil in a kettle or microwave.`;
      s6Timers = [
        { time: 1200, label: 'Oven & Skillet Preheat (20 min)', text: 'Set 20m Preheat Timer' }
      ];
      s6PrintDesc = `20 minutes before baking, preheat oven to ${isC ? '232°C' : '450°F'} with an empty cast-iron skillet on bottom rack. Bring 1 cup water to a rolling boil.`;
      s6CopyDesc = `6. Preheat ${isC ? '232°C' : '450°F'} (20 min) with cast-iron pan on bottom rack.`;
    }

    // STEP 7: Slash & Bake
    let s7Phase, s7Title, s7ScreenDesc, s7Timers = [], s7PrintDesc, s7CopyDesc;
    if (isDutch) {
      s7Phase = 'Covered & Uncovered Bake';
      s7Title = 'Load Dutch Oven: Lid-On Steam & Lid-Off Crisp';
      const sequentialReheatNote = f.loaves > 1 ? `
        <br><strong>Subsequent Loaves:</strong> For loaf #2${f.loaves > 2 ? ' and beyond' : ''}, return the covered Dutch oven to the oven for ~10 minutes to reheat back to baking temperature before retrieving the next loaf directly from the refrigerator to score and bake.
      ` : '';
      s7ScreenDesc = `<strong>1. Score on Counter:</strong> Dust proofed loaf with flour or semolina. <strong>Score 3 to 4 diagonal slashes 1/2" deep while still on the parchment paper on the counter</strong> (do NOT attempt to score inside a 450°F pot!).<br><strong>2. Load on Sling:</strong> Carefully remove the preheated pot with heavy heat-resistant oven mitts. Using the parchment paper wings as a sling, lower the scored loaf directly into the pot.<br><strong>3. Lid On (20 min):</strong> Secure lid immediately and return to oven. The tightly sealed pot traps escaping dough steam, keeping the crust soft and allowing dramatic "ear" oven spring.<br><strong>4. Lid Off (10–15 min):</strong> Remove lid (stand back from steam!) and bake uncovered for 10 to 15 minutes until the crust turns deep burnished mahogany and interior registers <strong class="temp-val" data-f="200-205">${isC ? '93°C–96°C' : '200°F–205°F'}</strong> (at least ${isC ? '88°C' : '190°F'} per KA baseline).${sequentialReheatNote}`;
      s7Timers = [
        { time: 1200, label: 'Dutch Oven Lid-On Bake (20 min)', text: 'Set 20m Lid-On Timer' },
        { time: 720, label: 'Dutch Oven Lid-Off Crisp (12 min)', text: 'Set 12m Lid-Off Timer' },
        { time: 900, label: 'Dutch Oven Lid-Off Crisp (15 min)', text: 'Set 15m Lid-Off Timer' },
        ...(f.loaves > 1 ? [{ time: 600, label: 'Dutch Oven Pot Reheat (10 min)', text: 'Set 10m Pot Reheat Timer' }] : [])
      ];
      s7PrintDesc = `Score loaf 1/2" deep on parchment on the counter. Using parchment sling, lower into preheated Dutch oven. Cover with lid and bake 20 min. Remove lid and bake uncovered 10–15 min until deep golden mahogany (internal temp ${isC ? '93°C–96°C' : '200°F–205°F'}; at least ${isC ? '88°C' : '190°F'} per KA baseline).`;
      s7CopyDesc = `7. Score 1/2" deep on parchment on counter. Lower into preheated pot using parchment sling. Lid on 20 min, lid off 10-15 min (internal temp ${isC ? '93°C–96°C' : '200°F–205°F'}; at least ${isC ? '88°C' : '190°F'} per KA baseline).`;
    } else {
      s7Phase = 'Bake with Steam';
      s7Title = 'Slash, Load Steam & Bake';
      const multiSheetBakeNote = f.loaves > 2 ? ' If using two baking sheets, arrange racks on upper and lower thirds and swap sheets top-to-bottom halfway through baking for even browning.' : '';
      s7ScreenDesc = `Dust loaves through a sieve with flour or fine semolina. Make 3 to 4 diagonal 1/2" deep slashes in each loaf. Slide pan into oven${f.loaves > 2 ? ' (or both sheets on upper/lower racks, swapping halfway)' : ''}, quickly pour the boiling water into the cast-iron skillet below, and immediately shut door (wear heat-resistant oven mitts!). Bake for 20 to 25 minutes until deep golden brown and interior registers <strong class="temp-val" data-f="200-205">${isC ? '93°C–96°C' : '200°F–205°F'}</strong> (at least ${isC ? '88°C' : '190°F'} per KA baseline).${multiSheetBakeNote ? `<br><em>${multiSheetBakeNote.trim()}</em>` : ''}`;
      s7Timers = [
        { time: 1200, label: 'Baking Loaves (20 min)', text: 'Set 20m Bake Timer' },
        { time: 1500, label: 'Baking Loaves (25 min)', text: 'Set 25m Bake Timer' }
      ];
      s7PrintDesc = `Dust loaves with semolina, slash 3–4 diagonal cuts 1/2" deep. Slide baking sheet(s) into oven${f.loaves > 2 ? ' (swap upper/lower sheets halfway)' : ''}, pour boiling water into bottom skillet, shut door immediately. Bake 20–25 min until golden brown (internal temp ${isC ? '93°C–96°C' : '200°F–205°F'}; at least ${isC ? '88°C' : '190°F'} per KA baseline).`;
      s7CopyDesc = `7. Slash loaves 1/2" deep. Slide sheet(s) into oven${f.loaves > 2 ? ' (swap sheets halfway)' : ''}, pour 1 cup boiling water into bottom skillet, shut door immediately. Bake 20-25 min (internal temp ${isC ? '93°C–96°C' : '200°F–205°F'}; at least ${isC ? '88°C' : '190°F'} per KA baseline).`;
    }

    // STEP 8: Cooling & Crust Setting
    let s8Phase = 'Cooling & Crust Setting', s8Title, s8ScreenDesc, s8Timers = [], s8PrintDesc, s8CopyDesc;
    if (isDutch && f.loaves > 1) {
      s8Title = 'Cool on Wire Rack & Reheat Pot for Next Loaf';
      s8ScreenDesc = `Using heat-resistant mitts and the parchment sling, immediately lift the baked loaf out of the Dutch oven and transfer to a wire cooling rack (never let baked bread sit in a cooling cast-iron pot, which steams the crust soggy). Return the empty pot with its lid to the oven, keep oven at <strong class="temp-val" data-f="450">${isC ? '232°C' : '450°F'}</strong>, and <strong>reheat for ~10 minutes</strong> before retrieving loaf #2 from the refrigerator to score and bake. Poke-test loaf #2; if it springs back quickly, give it 15–30 minutes at room temperature while the pot reheats. Let baked loaves cool completely (at least 30–60 minutes) before slicing.`;
      s8Timers = [
        { time: 600, label: 'Pot Reheat for Loaf #2 (10 min)', text: 'Set 10m Pot Reheat Timer' }
      ];
      s8PrintDesc = `Immediately lift loaf out of Dutch oven via parchment sling to wire rack. Keep oven at ${isC ? '232°C' : '450°F'}, return covered pot to reheat ~10 min for next loaf. Poke-test loaf #2; if it springs back quickly, give it 15–30 minutes at room temperature while the pot reheats. Cool loaves at least 30–60 min before slicing.`;
      s8CopyDesc = `8. Lift loaf out of pot to wire rack. Reheat covered pot ~10 min at ${isC ? '232°C' : '450°F'} for next loaf (poke-test loaf #2: if springing back quickly, give 15-30 min at room temp). Cool at least 30-60 min before slicing.`;
    } else if (isDutch && f.loaves === 1) {
      s8Title = 'Remove from Pot & Cool on Wire Rack';
      s8ScreenDesc = `Using heat-resistant mitts and the parchment sling, immediately lift the baked loaf out of the Dutch oven and transfer to a wire cooling rack (never let baked bread sit in a cooling cast-iron pot, which steams the bottom crust soggy). Turn off oven. Let the loaf cool completely on the wire rack for at least <strong>30 to 60 minutes</strong> before slicing so the gelatinized crumb structure can fully set.`;
      s8Timers = [];
      s8PrintDesc = `Immediately lift loaf out of Dutch oven via parchment sling to wire rack. Turn off oven. Cool completely on wire rack at least 30–60 min before slicing.`;
      s8CopyDesc = `8. Lift loaf out of Dutch oven via parchment sling directly to wire rack; turn off oven. Cool at least 30-60 min before slicing.`;
    } else {
      s8Title = 'Oven Vent & Cool on Wire Rack';
      s8ScreenDesc = `Turn off the oven, crack door open 2–3 inches with a wooden spoon or folded potholder, and let the loaves rest inside for <strong>5 minutes</strong>. This gentle thermal transition allows trapped moisture to escape without shocking the crust, yielding an exceptionally crispy, crackling finish. Transfer loaves to a wire cooling rack and cool completely (at least 30 to 60 minutes) before slicing.`;
      s8Timers = [
        { time: 300, label: 'Oven Door Vent Rest (5 min)', text: 'Set 5m Vent Rest Timer' }
      ];
      s8PrintDesc = `Turn off oven, prop door open 2–3 inches, and let loaves vent for 5 minutes for a crackling crispy crust. Transfer to wire rack and cool completely (at least 30–60 min) before slicing.`;
      s8CopyDesc = `8. Turn off oven, crack door 5 min, then cool completely on wire rack (at least 30-60 min).`;
    }

    return [
      { num: 1, phase: s1Phase, title: s1Title, screenDesc: s1ScreenDesc, timers: s1Timers, meta: null, printDesc: s1PrintDesc, copyDesc: s1CopyDesc },
      { num: 2, phase: s2Phase, title: s2Title, screenDesc: s2ScreenDesc, timers: s2Timers, meta: null, printDesc: s2PrintDesc, copyDesc: s2CopyDesc },
      { num: 3, phase: s3Phase, title: s3Title, screenDesc: s3ScreenDesc, timers: s3Timers, meta: null, printDesc: s3PrintDesc, copyDesc: s3CopyDesc },
      { num: 4, phase: s4Phase, title: s4Title, screenDesc: s4ScreenDesc, timers: s4Timers, meta: s4Meta, printDesc: s4PrintDesc, copyDesc: s4CopyDesc },
      { num: 5, phase: s5Phase, title: s5Title, screenDesc: s5ScreenDesc, timers: s5Timers, meta: null, printDesc: s5PrintDesc, copyDesc: s5CopyDesc },
      { num: 6, phase: s6Phase, title: s6Title, screenDesc: s6ScreenDesc, timers: s6Timers, meta: null, printDesc: s6PrintDesc, copyDesc: s6CopyDesc },
      { num: 7, phase: s7Phase, title: s7Title, screenDesc: s7ScreenDesc, timers: s7Timers, meta: null, printDesc: s7PrintDesc, copyDesc: s7CopyDesc },
      { num: 8, phase: s8Phase, title: s8Title, screenDesc: s8ScreenDesc, timers: s8Timers, meta: null, printDesc: s8PrintDesc, copyDesc: s8CopyDesc }
    ];
  }

  // --- Dynamic Timeline Steps Renderer ---
  function renderTimelineSteps(f, tempUnit) {
    if (typeof document === 'undefined') return;
    const steps = buildSteps(f, tempUnit);
    steps.forEach(s => {
      const num = s.num;
      const phaseEl = DOM[`step${num}Phase`];
      const titleEl = DOM[`step${num}Title`];
      const descEl = DOM[`step${num}Desc`];
      const actionsEl = DOM[`step${num}Actions`];
      const metaEl = DOM[`step${num}Meta`];

      if (phaseEl && s.phase) phaseEl.textContent = s.phase;
      if (titleEl && s.title) titleEl.textContent = s.title;
      if (descEl && s.screenDesc) descEl.innerHTML = s.screenDesc;
      if (metaEl && s.meta) metaEl.innerHTML = s.meta;
      if (actionsEl) {
        if (s.timers && s.timers.length > 0) {
          actionsEl.innerHTML = s.timers.map(t => `
            <button type="button" class="load-timer-btn" data-time="${t.time}" data-label="${t.label}">
              ${t.text}
            </button>
          `).join('');
        } else {
          actionsEl.innerHTML = '';
        }
      }
    });
  }

  // --- Central Formula Engine ---
  function computeFormula(currentState) {
    const totalFlour = Math.round(sanitizeNumber(currentState.totalFlour, KAB_DEFAULTS.totalFlour));
    const specialtyPct = Math.min(50, Math.max(0, sanitizeNumber(currentState.specialtyPct, 0)));
    const grain = GRAIN_DEFINITIONS[currentState.specialtyGrain] || GRAIN_DEFINITIONS.whole_wheat;
    const recommendedBump = specialtyPct > 0 ? Math.round(specialtyPct * grain.extraWaterPerPct * 10) / 10 : 0;

    let effectiveHydrationPct;
    if (currentState.autoAdjustHydration) {
      const baseH = sanitizeNumber(currentState.baseHydrationPct, KAB_DEFAULTS.hydrationPct);
      effectiveHydrationPct = Math.min(85, Math.max(50, Math.round((baseH + recommendedBump) * 10) / 10));
    } else {
      effectiveHydrationPct = Math.min(85, Math.max(50, sanitizeNumber(currentState.hydrationPct, KAB_DEFAULTS.hydrationPct)));
    }

    const saltPct = sanitizeNumber(currentState.saltPct, KAB_DEFAULTS.saltPct);
    const yeastPct = sanitizeNumber(currentState.yeastPct, KAB_DEFAULTS.yeastPct);
    const sugarPct = currentState.includeSugar ? sanitizeNumber(currentState.sugarPct, KAB_DEFAULTS.sugarPct) : 0;

    const totalWaterGrams = Math.round(totalFlour * (effectiveHydrationPct / 100));
    const saltGrams = Math.round(totalFlour * (saltPct / 100) * 10) / 10;
    const sugarGrams = currentState.includeSugar ? Math.round(totalFlour * (sugarPct / 100) * 10) / 10 : 0;

    const saltDef = SALT_DEFINITIONS[currentState.saltType] || SALT_DEFINITIONS.table;
    const yeastDef = LEAVENING_DEFINITIONS[currentState.yeastType] || LEAVENING_DEFINITIONS.instant;

    let specialtyGrams = Math.round(totalFlour * (specialtyPct / 100));
    let breadFlourGrams = 0;
    let starterGrams = 0;
    let starterFlourGrams = 0;
    let starterWaterGrams = 0;
    let addedWaterGrams = totalWaterGrams;
    let effectiveYeastPct = 0;
    let yeastGrams = 0;
    let totalDough = 0;

    if (currentState.yeastType === 'sourdough') {
      const starterRate = Math.min(30, Math.max(10, sanitizeNumber(currentState.starterRatePct, 20)));
      starterGrams = Math.round(totalFlour * (starterRate / 100));
      starterFlourGrams = Math.round(starterGrams / 2);
      starterWaterGrams = starterGrams - starterFlourGrams;

      breadFlourGrams = Math.max(0, totalFlour - specialtyGrams - starterFlourGrams);
      addedWaterGrams = Math.max(0, totalWaterGrams - starterWaterGrams);
      effectiveYeastPct = 0;
      yeastGrams = 0;
      totalDough = Math.round(breadFlourGrams + specialtyGrams + starterGrams + addedWaterGrams + saltGrams + sugarGrams);
    } else {
      const yeastMultiplier = yeastDef.multiplier;
      effectiveYeastPct = Math.round(yeastPct * yeastMultiplier * 100) / 100;
      yeastGrams = Math.round(totalFlour * (effectiveYeastPct / 100) * 10) / 10;
      breadFlourGrams = totalFlour - specialtyGrams;
      addedWaterGrams = totalWaterGrams;
      totalDough = Math.round(totalFlour + addedWaterGrams + saltGrams + yeastGrams + sugarGrams);
    }

    const loaves = sanitizeNumber(currentState.loaves, KAB_DEFAULTS.loaves);
    const perLoaf = Math.round(totalDough / loaves);

    return {
      totalFlour,
      specialtyPct,
      grain,
      recommendedBump,
      effectiveHydrationPct,
      saltPct,
      yeastPct,
      effectiveYeastPct,
      sugarPct,
      includeSugar: currentState.includeSugar,
      totalWaterGrams,
      saltGrams,
      sugarGrams,
      saltDef,
      yeastDef,
      specialtyGrams,
      breadFlourGrams,
      starterGrams,
      starterFlourGrams,
      starterWaterGrams,
      addedWaterGrams,
      yeastGrams,
      totalDough,
      loaves,
      perLoaf,
      bakingVessel: currentState.bakingVessel,
      yeastType: currentState.yeastType,
      saltType: currentState.saltType,
      starterRatePct: currentState.starterRatePct,
      isC: currentState.tempUnit === 'C'
    };
  }

  // --- Recalculate & Render Formula ---
  function recalculate() {
    if (state.autoAdjustHydration) {
      const fTemp = computeFormula(state);
      state.hydrationPct = fTemp.effectiveHydrationPct;
    }

    const f = computeFormula(state);

    const totalFlour = f.totalFlour;
    const specialtyPct = f.specialtyPct;
    const grain = f.grain;
    const recommendedBump = f.recommendedBump;
    const hydrationPct = f.effectiveHydrationPct;
    const saltPct = f.saltPct;
    const yeastPct = f.yeastPct;
    const sugarPct = f.sugarPct;
    const totalWaterGrams = f.totalWaterGrams;
    const saltGrams = f.saltGrams;
    const sugarGrams = f.sugarGrams;
    const saltDef = f.saltDef;
    const yeastDef = f.yeastDef;
    const specialtyGrams = f.specialtyGrams;
    const breadFlourGrams = f.breadFlourGrams;
    const starterGrams = f.starterGrams;
    const starterFlourGrams = f.starterFlourGrams;
    const starterWaterGrams = f.starterWaterGrams;
    const addedWaterGrams = f.addedWaterGrams;
    const effectiveYeastPct = f.effectiveYeastPct;
    const yeastGrams = f.yeastGrams;
    const totalDough = f.totalDough;
    const perLoaf = f.perLoaf;

    // Update UI Header & Badges
    DOM.doughWeightBadge.textContent = `Total Dough: ${totalDough.toLocaleString()}g`;
    DOM.loafWeightBadge.textContent = `~${perLoaf}g / loaf (${state.loaves} loaves)`;
    DOM.stepLoavesCount.textContent = state.loaves;
    DOM.stepLoafGrams.textContent = `${perLoaf}g`;
    DOM.totalFlourEcho.textContent = `${totalFlour}g`;

    // Specialty Grain UI
    DOM.grainPctValue.textContent = specialtyPct;
    DOM.specialtySlider.value = specialtyPct;

    // Ratio progress bar
    const displayBreadFlourPct = Math.round((breadFlourGrams / totalFlour) * 100);
    DOM.breadFlourSegment.style.width = `${displayBreadFlourPct}%`;
    DOM.specialtySegment.style.width = `${specialtyPct}%`;

    if (displayBreadFlourPct > 18) {
      DOM.breadFlourSegLabel.textContent = `Bread Flour: ${displayBreadFlourPct}% (${breadFlourGrams}g)`;
    } else if (displayBreadFlourPct > 0) {
      DOM.breadFlourSegLabel.textContent = `${displayBreadFlourPct}%`;
    } else {
      DOM.breadFlourSegLabel.textContent = '';
    }

    if (specialtyPct > 18) {
      DOM.specialtySegLabel.textContent = `${grain.shortName}: ${specialtyPct}% (${specialtyGrams}g)`;
    } else if (specialtyPct > 0) {
      DOM.specialtySegLabel.textContent = `${specialtyPct}%`;
    } else {
      DOM.specialtySegLabel.textContent = '';
    }

    // Update auto-hydration hint & badge
    if (state.autoAdjustHydration && recommendedBump !== 0) {
      DOM.hydrationCompBadge.classList.remove('hidden');
      const bumpSign = recommendedBump > 0 ? `+${recommendedBump.toFixed(1)}%` : `${recommendedBump.toFixed(1)}%`;
      DOM.hydrationCompBadge.textContent = `${bumpSign} (${grain.shortName})`;
      if (recommendedBump > 0) {
        DOM.autoHydrationHint.textContent = `Adds +${recommendedBump.toFixed(1)}% extra water to compensate for ${specialtyPct}% ${grain.shortName} absorption (Base: ${state.baseHydrationPct.toFixed(1)}%)`;
      } else {
        DOM.autoHydrationHint.textContent = `Holds back ${Math.abs(recommendedBump).toFixed(1)}% water to prevent slack dough with ${specialtyPct}% ${grain.shortName} (Base: ${state.baseHydrationPct.toFixed(1)}%)`;
      }
    } else if (state.autoAdjustHydration) {
      DOM.hydrationCompBadge.classList.add('hidden');
      DOM.autoHydrationHint.textContent = 'Active: adjusts water percentage automatically to compensate for grain thirst';
    } else {
      DOM.hydrationCompBadge.classList.add('hidden');
      DOM.autoHydrationHint.textContent = 'Manual mode: water percentage will not auto-adjust when grain is changed';
    }

    // Render Advisory Box
    renderGrainAdvisory(f);

    // Hydration display
    DOM.hydrationValue.textContent = hydrationPct.toFixed(1);
    DOM.hydrationSlider.value = hydrationPct;

    // Update dough profile & contextual baker insights
    const insight = getBakerInsight(f, state);
    DOM.profileBadge.textContent = insight.badge;
    DOM.profileDifficulty.innerHTML = insight.difficulty;
    DOM.profileDescription.textContent = insight.desc;
    DOM.profileTips.innerHTML = insight.tips;

    // Update Fine-Tuning Drawer Controls & Descriptions
    DOM.saltPctLabel.textContent = `${saltPct.toFixed(1)}% (${saltGrams}g)`;
    DOM.saltDesc.textContent = `${saltDef.desc} ${saltDef.volumeHelp} (${formatSaltVolume(saltGrams, state.saltType)})`;

    if (state.yeastType === 'sourdough') {
      DOM.sourdoughControls.classList.remove('hidden');
      DOM.yeastPctLabel.textContent = `Starter: ${state.starterRatePct}% (${starterGrams}g)`;
      DOM.starterRateLabel.textContent = `${state.starterRatePct}% (${starterGrams}g starter)`;
      DOM.yeastDesc.textContent = `100% hydration sourdough starter (${starterFlourGrams}g flour + ${starterWaterGrams}g water). Commercial yeast omitted.`;
    } else {
      DOM.sourdoughControls.classList.add('hidden');
      DOM.yeastPctLabel.textContent = `${effectiveYeastPct.toFixed(2)}% (${yeastGrams}g)`;
      DOM.yeastDesc.textContent = `${yeastDef.desc} (${yeastGrams}g)`;
    }

    DOM.sugarPctLabel.textContent = state.includeSugar ? `${sugarPct.toFixed(2)}% (${sugarGrams}g)` : 'Disabled (0g)';
    DOM.drawerGrainRatioLabel.textContent = specialtyPct > 0
      ? `${specialtyPct}% ${grain.shortName} (${specialtyGrams}g) + ${breadFlourGrams}g Bread Flour${starterFlourGrams > 0 ? ` (+${starterFlourGrams}g in starter)` : ''}`
      : `${breadFlourGrams}g Bread Flour${starterFlourGrams > 0 ? ` (+${starterFlourGrams}g in starter)` : ' (100% White)'}`;

    // Build ingredients list
    const ingredients = [];

    if (state.yeastType === 'sourdough') {
      // 1. Sourdough Starter
      ingredients.push({
        id: 'starter',
        name: 'Active Sourdough Starter (100% Hydration)',
        desc: `Ripe, bubbly starter (${starterFlourGrams}g flour + ${starterWaterGrams}g water contributed)`,
        pct: `${state.starterRatePct.toFixed(1)}%`,
        weight: `${starterGrams}g`,
        ref: `~${(starterGrams / 240).toFixed(1)} cups`,
        isWater: false
      });

      // 2. Added Bread Flour
      const bpct = ((breadFlourGrams / totalFlour) * 100).toFixed(1);
      ingredients.push({
        id: 'bread_flour',
        name: 'King Arthur Bread Flour (Added)',
        desc: `High protein white structure (${bpct}% added; ${starterFlourGrams}g supplied by starter)`,
        pct: `${bpct}%`,
        weight: `${breadFlourGrams}g`,
        ref: `~${(breadFlourGrams / 120).toFixed(1)} cups`,
        isWater: false
      });

      // 3. Specialty Flour (if any)
      if (specialtyPct > 0) {
        ingredients.push({
          id: 'specialty_flour',
          name: grain.name,
          desc: `${grain.desc} (${specialtyPct}% of grain bill)`,
          pct: `${specialtyPct.toFixed(1)}%`,
          weight: `${specialtyGrams}g`,
          ref: `~${(specialtyGrams / 120).toFixed(1)} cups`,
          isWater: false
        });
      }

      // 4. Added Water
      const addedWaterPct = ((addedWaterGrams / totalFlour) * 100).toFixed(1);
      ingredients.push({
        id: 'water',
        name: 'Lukewarm Water (Added)',
        desc: `${state.tempUnit === 'F' ? '80°F to 85°F' : '27°C to 29°C'} (${starterWaterGrams}g supplied by starter; ${totalWaterGrams}g total)`,
        pct: `${addedWaterPct}%`,
        weight: `${addedWaterGrams}g / ${addedWaterGrams}ml`,
        ref: `~${(addedWaterGrams / 237).toFixed(1)} cups`,
        isWater: true
      });
    } else {
      // Commercial Yeast Flow
      if (specialtyPct > 0) {
        const bpct = (100 - specialtyPct).toFixed(1);
        ingredients.push({
          id: 'bread_flour',
          name: 'King Arthur Bread Flour',
          desc: `High protein white structure base (${bpct}% of grain bill)`,
          pct: `${bpct}%`,
          weight: `${breadFlourGrams}g`,
          ref: `~${(breadFlourGrams / 120).toFixed(1)} cups`,
          isWater: false
        });
        ingredients.push({
          id: 'specialty_flour',
          name: grain.name,
          desc: `${grain.desc} (${specialtyPct}% of grain bill)`,
          pct: `${specialtyPct.toFixed(1)}%`,
          weight: `${specialtyGrams}g`,
          ref: `~${(specialtyGrams / 120).toFixed(1)} cups`,
          isWater: false
        });
      } else {
        ingredients.push({
          id: 'flour',
          name: 'King Arthur Unbleached Bread Flour',
          desc: '100% white bread flour base with 12.7% protein for optimal loft',
          pct: '100.0%',
          weight: `${totalFlour}g`,
          ref: `~${(totalFlour / 120).toFixed(1)} cups`,
          isWater: false
        });
      }

      // Water
      ingredients.push({
        id: 'water',
        name: 'Lukewarm Water',
        desc: `${state.tempUnit === 'F' ? yeastDef.waterTempF : yeastDef.waterTempC} lukewarm`,
        pct: `${hydrationPct.toFixed(1)}%`,
        weight: `${addedWaterGrams}g / ${addedWaterGrams}ml`,
        ref: `~${(addedWaterGrams / 237).toFixed(1)} cups`,
        isWater: true
      });

      // Yeast
      let yeastRef = `~${(yeastGrams / 3.1).toFixed(1)} tsp`;
      if (state.yeastType === 'fresh') {
        yeastRef = `~${(yeastGrams / 17.0).toFixed(1)} cake block`;
      }

      ingredients.push({
        id: 'yeast',
        name: yeastDef.name,
        desc: yeastDef.desc,
        pct: `${effectiveYeastPct.toFixed(2)}%`,
        weight: `${yeastGrams}g`,
        ref: yeastRef,
        isWater: false
      });
    }

    // Salt row (adjusted for brand/crystal size)
    ingredients.push({
      id: 'salt',
      name: saltDef.name,
      desc: saltDef.desc,
      pct: `${saltPct.toFixed(1)}%`,
      weight: `${saltGrams}g`,
      ref: formatSaltVolume(saltGrams, state.saltType),
      isWater: false
    });

    // Sugar row (if included)
    if (state.includeSugar) {
      ingredients.push({
        id: 'sugar',
        name: 'Granulated Sugar',
        desc: state.yeastType === 'sourdough' ? 'Optional nutrient & promotes deep golden crust' : 'Food for yeast & aids rich golden crust color',
        pct: `${sugarPct.toFixed(2)}%`,
        weight: `${sugarGrams}g`,
        ref: `~${(sugarGrams / 11.0).toFixed(1)} tbsp`,
        isWater: false
      });
    }

    // Render table rows
    DOM.ingredientsTbody.innerHTML = ingredients.map(ing => `
      <tr data-ingredient-id="${ing.id}">
        <td class="th-ingredient">
          <div class="ingredient-title-cell">
            <div>
              <span class="ingredient-name">${ing.name}</span>
              <span class="ingredient-desc">${ing.desc}</span>
            </div>
          </div>
        </td>
        <td class="th-pct">
          <span class="pct-pill">${ing.pct}</span>
        </td>
        <td class="th-weight ${ing.isWater ? 'water-weight' : 'weight-cell'}">
          ${ing.weight}
        </td>
        <td class="th-ref volume-ref">
          ${ing.ref}
        </td>
      </tr>
    `).join('');

    // Render sourdough summary row in ingredientsTfoot if sourdough
    if (DOM.ingredientsTfoot) {
      if (state.yeastType === 'sourdough') {
        DOM.ingredientsTfoot.innerHTML = `
          <tr>
            <td colspan="4" class="sourdough-summary-cell">
              Total grain bill: <strong>${totalFlour}g</strong> (100.0%, incl. ${starterFlourGrams}g in starter) · Total hydration: <strong>${hydrationPct.toFixed(1)}%</strong> (${totalWaterGrams}g total, incl. ${starterWaterGrams}g in starter)
            </td>
          </tr>
        `;
      } else {
        DOM.ingredientsTfoot.innerHTML = '';
      }
    }

    // Update active hydration preset button highlight and aria-pressed
    DOM.hydrationPresetButtons.forEach(btn => {
      const hVal = parseFloat(btn.dataset.hydration);
      const active = !isNaN(hVal) && Math.abs(hVal - hydrationPct) < 0.2;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Update grain preset buttons and aria-pressed
    DOM.grainPresetButtons.forEach(btn => {
      const pVal = parseInt(btn.dataset.pct, 10);
      const active = !isNaN(pVal) && pVal === specialtyPct;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Update grain chips active state and aria-pressed
    DOM.grainChips.forEach(chip => {
      const active = chip.dataset.grain === state.specialtyGrain;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Update loaf buttons and aria-pressed
    DOM.loafButtons.forEach(btn => {
      const lVal = parseInt(btn.dataset.loaves, 10);
      const active = lVal === state.loaves;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Update vessel selector buttons and aria-pressed
    DOM.vesselBtns.forEach(btn => {
      const active = btn.dataset.vessel === state.bakingVessel;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Update Dynamic Timeline Steps based on leavening, salt, grains, and baking vessel
    renderTimelineSteps(f, state.tempUnit);

    // Update temperatures across document
    updateTemperatureDisplays();

    // Render printable recipe card
    renderPrintRecipeCard();

    // Persist recipe state to localStorage
    saveRecipeState();
  }

  // --- Temperature Unit Handling ---
  function updateTemperatureDisplays() {
    const isC = state.tempUnit === 'C';
    document.querySelectorAll('.temp-val').forEach(el => {
      const fRange = el.dataset.f;
      if (!fRange) return;
      if (fRange.includes('-')) {
        const [f1, f2] = fRange.split('-').map(Number);
        const c1 = Math.round((f1 - 32) * (5 / 9));
        const c2 = Math.round((f2 - 32) * (5 / 9));
        el.textContent = isC ? `${c1}°C–${c2}°C` : `${f1}°F–${f2}°F`;
      } else {
        const f = Number(fRange);
        const c = Math.round((f - 32) * (5 / 9));
        el.textContent = isC ? `${c}°C` : `${f}°F`;
      }
    });

    document.querySelectorAll('.temp-c').forEach(el => {
      el.style.display = isC ? 'none' : 'inline';
    });

    DOM.tempUnitText.textContent = `°${state.tempUnit}`;
  }

  // --- Timer Sound (Web Audio API Synthesizer) ---
  function getAudioContext() {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  }

  function playTimerChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const playTone = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play pleasant 3-tone chime: A5, C#6, E6
      playTone(880, 0, 0.4);
      playTone(1108.7, 0.25, 0.4);
      playTone(1318.5, 0.5, 0.8);
      setTimeout(() => {
        playTone(880, 0, 0.3);
        playTone(1318.5, 0.2, 0.7);
      }, 1000);
    } catch (e) {
      console.warn('Audio chime unsupported or blocked', e);
    }
  }

  // --- Timer Hub Functionality ---
  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateTimerUI() {
    DOM.timerCountdown.textContent = formatTime(timerRemainingSeconds);
    DOM.timerLabel.textContent = timerLabelText;

    // Header timer pill button synchronization
    if (DOM.headerTimerBtn && DOM.headerTimerText) {
      if (timerRemainingSeconds <= 0 && timerTotalSeconds > 0) {
        DOM.headerTimerBtn.className = 'action-btn header-timer-btn ringing';
        DOM.headerTimerText.textContent = 'DONE!';
        DOM.headerTimerBtn.setAttribute('aria-label', 'Baking timer: DONE! Jump to timer card');
      } else if (timerIsRunning) {
        const timeStr = formatTime(timerRemainingSeconds);
        DOM.headerTimerBtn.className = 'action-btn header-timer-btn running';
        DOM.headerTimerText.textContent = timeStr;
        DOM.headerTimerBtn.setAttribute('aria-label', `Baking timer running: ${timeStr}. Jump to timer card`);
      } else if (timerTotalSeconds > 0 && timerRemainingSeconds > 0) {
        const timeStr = formatTime(timerRemainingSeconds);
        DOM.headerTimerBtn.className = 'action-btn header-timer-btn paused';
        DOM.headerTimerText.textContent = `${timeStr} ⏸`;
        DOM.headerTimerBtn.setAttribute('aria-label', `Baking timer paused: ${timeStr}. Jump to timer card`);
      } else {
        DOM.headerTimerBtn.className = 'action-btn header-timer-btn idle';
        DOM.headerTimerText.textContent = 'Ready';
        DOM.headerTimerBtn.setAttribute('aria-label', 'Baking timer: Ready. Jump to timer card');
      }
    }

    // Mobile floating timer widget synchronization (phone viewport)
    const SVG_MOBILE_CHECK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    const SVG_MOBILE_PAUSE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
    const SVG_MOBILE_PLAY = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>';

    const SVG_TIMER_PLAY = '<svg class="timer-btn-svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>';
    const SVG_TIMER_PAUSE = '<svg class="timer-btn-svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';

    if (DOM.mobileFloatingTimer) {
      if (timerRemainingSeconds <= 0 && timerTotalSeconds > 0) {
        DOM.mobileFloatingTimer.className = 'mobile-floating-timer ringing';
        if (DOM.mobileTimerDigits) DOM.mobileTimerDigits.textContent = 'DONE!';
        if (DOM.mobileTimerLabel) DOM.mobileTimerLabel.textContent = timerLabelText;
        if (DOM.mobileTimerToggleBtn) {
          DOM.mobileTimerToggleBtn.innerHTML = SVG_MOBILE_CHECK;
          DOM.mobileTimerToggleBtn.setAttribute('aria-label', 'Dismiss finished timer');
          DOM.mobileTimerToggleBtn.title = 'Dismiss finished timer';
        }
        document.body.classList.add('has-floating-timer');
      } else if (timerIsRunning) {
        DOM.mobileFloatingTimer.className = 'mobile-floating-timer running';
        if (DOM.mobileTimerDigits) DOM.mobileTimerDigits.textContent = formatTime(timerRemainingSeconds);
        if (DOM.mobileTimerLabel) DOM.mobileTimerLabel.textContent = timerLabelText;
        if (DOM.mobileTimerToggleBtn) {
          DOM.mobileTimerToggleBtn.innerHTML = SVG_MOBILE_PAUSE;
          DOM.mobileTimerToggleBtn.setAttribute('aria-label', 'Pause timer');
          DOM.mobileTimerToggleBtn.title = 'Pause timer';
        }
        document.body.classList.add('has-floating-timer');
      } else if (timerTotalSeconds > 0 && timerRemainingSeconds > 0) {
        DOM.mobileFloatingTimer.className = 'mobile-floating-timer paused';
        if (DOM.mobileTimerDigits) DOM.mobileTimerDigits.textContent = formatTime(timerRemainingSeconds);
        if (DOM.mobileTimerLabel) DOM.mobileTimerLabel.textContent = timerLabelText;
        if (DOM.mobileTimerToggleBtn) {
          DOM.mobileTimerToggleBtn.innerHTML = SVG_MOBILE_PLAY;
          DOM.mobileTimerToggleBtn.setAttribute('aria-label', 'Resume timer');
          DOM.mobileTimerToggleBtn.title = 'Resume timer';
        }
        document.body.classList.add('has-floating-timer');
      } else {
        DOM.mobileFloatingTimer.className = 'mobile-floating-timer hidden';
        if (DOM.mobileTimerToggleBtn) {
          DOM.mobileTimerToggleBtn.innerHTML = SVG_MOBILE_PLAY;
          DOM.mobileTimerToggleBtn.setAttribute('aria-label', 'Pause or resume timer');
          DOM.mobileTimerToggleBtn.title = 'Pause or resume timer';
        }
        document.body.classList.remove('has-floating-timer');
      }
    }

    if (timerRemainingSeconds <= 0 && timerTotalSeconds > 0) {
      DOM.activeTimerBadge.className = 'timer-status-badge ringing';
      DOM.activeTimerBadge.textContent = 'DONE!';
      document.title = '🔔 TIME UP! Bread Nerd';
      DOM.startTimerBtn.innerHTML = `${SVG_TIMER_PLAY}<span>Start</span>`;
      DOM.startTimerBtn.disabled = true;
      DOM.startTimerBtn.className = 'timer-btn primary';
      if (DOM.resetTimerBtn) DOM.resetTimerBtn.disabled = false;
      if (DOM.clearTimerBtn) DOM.clearTimerBtn.disabled = false;
    } else if (timerIsRunning) {
      DOM.activeTimerBadge.className = 'timer-status-badge running';
      DOM.activeTimerBadge.textContent = 'RUNNING';
      document.title = `(${formatTime(timerRemainingSeconds)}) ${timerLabelText} — Bread Nerd`;
      DOM.startTimerBtn.innerHTML = `${SVG_TIMER_PAUSE}<span>Pause</span>`;
      DOM.startTimerBtn.disabled = false;
      DOM.startTimerBtn.className = 'timer-btn timer-btn-pause';
      if (DOM.resetTimerBtn) DOM.resetTimerBtn.disabled = false;
      if (DOM.clearTimerBtn) DOM.clearTimerBtn.disabled = false;
    } else if (timerTotalSeconds > 0 && timerRemainingSeconds > 0) {
      DOM.activeTimerBadge.className = 'timer-status-badge paused';
      DOM.activeTimerBadge.textContent = 'PAUSED';
      document.title = `[Paused] ${formatTime(timerRemainingSeconds)} — Bread Nerd`;
      const resumeLabel = (timerTotalSeconds > timerRemainingSeconds) ? 'Resume' : 'Start';
      DOM.startTimerBtn.innerHTML = `${SVG_TIMER_PLAY}<span>${resumeLabel}</span>`;
      DOM.startTimerBtn.disabled = false;
      DOM.startTimerBtn.className = 'timer-btn primary';
      if (DOM.resetTimerBtn) DOM.resetTimerBtn.disabled = false;
      if (DOM.clearTimerBtn) DOM.clearTimerBtn.disabled = false;
    } else {
      DOM.activeTimerBadge.className = 'timer-status-badge idle';
      DOM.activeTimerBadge.textContent = 'READY';
      document.title = 'Bread Nerd — Interactive Bread Hydration & Baker\'s Calculator';
      DOM.startTimerBtn.innerHTML = `${SVG_TIMER_PLAY}<span>Start</span>`;
      DOM.startTimerBtn.disabled = true;
      DOM.startTimerBtn.className = 'timer-btn primary';
      if (DOM.resetTimerBtn) DOM.resetTimerBtn.disabled = true;
      if (DOM.clearTimerBtn) DOM.clearTimerBtn.disabled = true;
    }

    saveTimerState();
  }

  function announceTimerStatus(message) {
    const announcer = document.getElementById('timerAriaAnnouncer');
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
  }

  function toggleTimer() {
    if (timerRemainingSeconds <= 0 && timerTotalSeconds > 0) {
      clearTimer();
    } else if (timerIsRunning) {
      pauseTimer();
    } else if (timerRemainingSeconds > 0) {
      const isResume = timerTotalSeconds > timerRemainingSeconds;
      const msg = isResume
        ? `Timer resumed: ${formatTime(timerRemainingSeconds)} remaining`
        : `Timer started for ${timerLabelText}: ${formatTime(timerRemainingSeconds)}`;
      startTimer(true, msg);
    }
  }

  function clearTimer() {
    pauseTimer(false);
    timerTotalSeconds = 0;
    timerRemainingSeconds = 0;
    timerLabelText = 'Ready';
    timerEndTime = null;
    updateTimerUI();
    announceTimerStatus('Timer cleared');
    try {
      localStorage.removeItem(STORAGE_TIMER_KEY);
    } catch (e) {}
  }

  function loadTimer(seconds, label) {
    pauseTimer(false);
    timerTotalSeconds = seconds;
    timerRemainingSeconds = seconds;
    timerLabelText = label;
    timerEndTime = Date.now() + seconds * 1000;
    updateTimerUI();
    startTimer(false, `Timer started for ${label}: ${formatTime(seconds)}`);

    // Smooth scroll to timer if on mobile screen
    if (window.innerWidth < 1040) {
      DOM.timerHubCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function startTimer(resetEndTime = true, announcement = null) {
    if (timerRemainingSeconds <= 0) return;
    getAudioContext();
    if (timerInterval) clearInterval(timerInterval);
    timerIsRunning = true;
    if (resetEndTime) {
      timerEndTime = Date.now() + timerRemainingSeconds * 1000;
    }

    if (announcement) {
      announceTimerStatus(announcement);
    } else if (timerTotalSeconds > timerRemainingSeconds) {
      announceTimerStatus(`Timer resumed: ${formatTime(timerRemainingSeconds)} remaining`);
    } else {
      announceTimerStatus(`Timer started for ${timerLabelText}: ${formatTime(timerRemainingSeconds)}`);
    }
    updateTimerUI();

    timerInterval = setInterval(() => {
      if (timerEndTime) {
        const remaining = Math.round((timerEndTime - Date.now()) / 1000);
        timerRemainingSeconds = Math.max(0, remaining);
      } else {
        timerRemainingSeconds--;
      }

      if (timerRemainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerRemainingSeconds = 0;
        timerIsRunning = false;
        timerEndTime = null;
        playTimerChime();
        updateTimerUI();
        announceTimerStatus(`Timer finished: ${timerLabelText}!`);
        if (window.innerWidth > 768) {
          showToast(`🔔 Timer Finished: ${timerLabelText}!`, 'warning');
        }
      } else {
        updateTimerUI();
      }
    }, 1000);
  }

  function pauseTimer(announce = true) {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const wasRunning = timerIsRunning;
    timerIsRunning = false;
    timerEndTime = null;
    updateTimerUI();
    if (announce && wasRunning && timerRemainingSeconds > 0) {
      announceTimerStatus(`Timer paused: ${formatTime(timerRemainingSeconds)} remaining`);
    }
  }

  function resetTimer() {
    pauseTimer(false);
    timerRemainingSeconds = timerTotalSeconds;
    timerEndTime = null;
    updateTimerUI();
    announceTimerStatus(`Timer reset to ${formatTime(timerTotalSeconds)}`);
  }

  function adjustTimerMinutes(mins) {
    const deltaSecs = mins * 60;
    if (deltaSecs < 0) {
      if (timerRemainingSeconds <= 0) return;
      const newSecs = Math.max(0, timerRemainingSeconds + deltaSecs);
      timerRemainingSeconds = newSecs;
      if (timerEndTime) {
        timerEndTime = Date.now() + newSecs * 1000;
      }
      if (newSecs === 0) {
        pauseTimer();
        timerTotalSeconds = 0;
        timerEndTime = null;
        updateTimerUI();
      } else {
        updateTimerUI();
      }
    } else {
      timerTotalSeconds += deltaSecs;
      timerRemainingSeconds += deltaSecs;
      if (timerEndTime) {
        timerEndTime += deltaSecs * 1000;
      }
      // Only auto-start if timer was freshly empty (0:00); do NOT auto-start if already paused
      if (!timerIsRunning && timerTotalSeconds === deltaSecs && timerRemainingSeconds > 0) {
        if (timerLabelText === 'Select a baking step below to start' || timerLabelText === 'Ready') {
          timerLabelText = `Custom +${mins}m`;
        }
        updateTimerUI();
        startTimer(true, `Timer started for ${timerLabelText}: ${formatTime(timerRemainingSeconds)}`);
      } else {
        updateTimerUI();
      }
    }
  }

  // --- Recipe / Kitchen View Mode ---
  const STORAGE_VIEW_MODE_KEY = 'breadNerd_recipeMode';
  const THEME_STORAGE_KEY = 'breadNerd_theme';

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (DOM.themeToggleText) DOM.themeToggleText.textContent = 'Light';
      if (DOM.themeToggleIcon) {
        DOM.themeToggleIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
      }
      if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.setAttribute('aria-pressed', 'true');
        DOM.themeToggleBtn.setAttribute('title', 'Switch to dark theme');
        DOM.themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (DOM.themeToggleText) DOM.themeToggleText.textContent = 'Dark';
      if (DOM.themeToggleIcon) {
        DOM.themeToggleIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      }
      if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.setAttribute('aria-pressed', 'false');
        DOM.themeToggleBtn.setAttribute('title', 'Switch to light theme');
        DOM.themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
      }
    }

    if (typeof document !== 'undefined') {
      const newColor = (theme === 'light') ? '#f8fafc' : '#080b12';
      const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
      themeColorMetas.forEach(meta => {
        meta.setAttribute('content', newColor);
      });
    }
  }

  let systemThemeListenerInitialized = false;
  function initSystemThemeListener() {
    if (systemThemeListenerInitialized || typeof window === 'undefined' || !window.matchMedia) return;
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      const handleThemeChange = (e) => {
        try {
          const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('bread_nerd_theme');
          if (!saved) {
            applyTheme(e.matches ? 'light' : 'dark');
          }
        } catch (err) {
          applyTheme(e.matches ? 'light' : 'dark');
        }
      };
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleThemeChange);
        systemThemeListenerInitialized = true;
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleThemeChange);
        systemThemeListenerInitialized = true;
      }
    } catch (e) {}
  }

  function loadTheme() {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('bread_nerd_theme');
      if (saved === 'light' || saved === 'dark') {
        applyTheme(saved);
      } else {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight ? 'light' : 'dark');
      }
    } catch (e) {
      applyTheme('dark');
    }
    initSystemThemeListener();
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {}
  }

  function toggleRecipeView(forceMode) {
    const isCurrentlyRecipe = document.body.classList.contains('recipe-mode');
    const newMode = (typeof forceMode === 'boolean') ? forceMode : !isCurrentlyRecipe;

    document.body.classList.toggle('recipe-mode', newMode);

    if (DOM.viewModeText && DOM.viewModeBtn) {
      if (newMode) {
        DOM.viewModeText.textContent = 'Calculator View';
        DOM.viewModeBtn.classList.add('active');
        DOM.viewModeBtn.setAttribute('aria-pressed', 'true');
        showToast('Recipe View Active: Sliders hidden for focused baking', 'info');
      } else {
        DOM.viewModeText.textContent = 'Recipe View';
        DOM.viewModeBtn.classList.remove('active');
        DOM.viewModeBtn.setAttribute('aria-pressed', 'false');
        showToast('Calculator View Active: Full formula controls restored', 'info');
      }
    }

    try {
      localStorage.setItem(STORAGE_VIEW_MODE_KEY, newMode ? 'true' : 'false');
    } catch (e) {}
  }

  function loadRecipeView() {
    try {
      const saved = localStorage.getItem(STORAGE_VIEW_MODE_KEY);
      if (saved === 'true') {
        toggleRecipeView(true);
      }
    } catch (e) {}
  }

  // --- LocalStorage State Persistence ---
  function saveRecipeState() {
    try {
      const dataToSave = {
        loaves: state.loaves,
        totalFlour: state.totalFlour,
        baseHydrationPct: state.baseHydrationPct,
        hydrationPct: state.hydrationPct,
        autoAdjustHydration: state.autoAdjustHydration,
        specialtyGrain: state.specialtyGrain,
        specialtyPct: state.specialtyPct,
        saltType: state.saltType,
        saltPct: state.saltPct,
        yeastType: state.yeastType,
        yeastPct: state.yeastPct,
        starterRatePct: state.starterRatePct,
        sugarPct: state.sugarPct,
        includeSugar: state.includeSugar,
        tempUnit: state.tempUnit,
        bakingVessel: state.bakingVessel
      };
      localStorage.setItem(STORAGE_RECIPE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Could not save recipe state to localStorage', e);
    }
  }

  function loadRecipeState() {
    try {
      const saved = localStorage.getItem(STORAGE_RECIPE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (typeof parsed === 'object' && parsed !== null) {
        if (typeof parsed.loaves === 'number' && parsed.loaves > 0) state.loaves = parsed.loaves;
        if (typeof parsed.totalFlour === 'number' && parsed.totalFlour > 0) state.totalFlour = parsed.totalFlour;
        state.baseFlourPerLoaf = state.totalFlour / (state.loaves || 2);
        if (typeof parsed.baseHydrationPct === 'number') state.baseHydrationPct = parsed.baseHydrationPct;
        if (typeof parsed.hydrationPct === 'number') state.hydrationPct = parsed.hydrationPct;
        if (typeof parsed.autoAdjustHydration === 'boolean') state.autoAdjustHydration = parsed.autoAdjustHydration;
        if (typeof parsed.specialtyGrain === 'string' && GRAIN_DEFINITIONS[parsed.specialtyGrain]) {
          state.specialtyGrain = parsed.specialtyGrain;
        }
        if (typeof parsed.specialtyPct === 'number') state.specialtyPct = parsed.specialtyPct;
        if (typeof parsed.saltType === 'string' && SALT_DEFINITIONS[parsed.saltType]) {
          state.saltType = parsed.saltType;
        }
        if (typeof parsed.saltPct === 'number') state.saltPct = parsed.saltPct;
        if (typeof parsed.yeastType === 'string' && LEAVENING_DEFINITIONS[parsed.yeastType]) {
          state.yeastType = parsed.yeastType;
        }
        if (typeof parsed.yeastPct === 'number') state.yeastPct = parsed.yeastPct;
        if (typeof parsed.starterRatePct === 'number') state.starterRatePct = parsed.starterRatePct;
        if (typeof parsed.sugarPct === 'number') state.sugarPct = parsed.sugarPct;
        if (typeof parsed.includeSugar === 'boolean') state.includeSugar = parsed.includeSugar;
        if (parsed.tempUnit === 'F' || parsed.tempUnit === 'C') state.tempUnit = parsed.tempUnit;
        if (parsed.bakingVessel === 'sheet' || parsed.bakingVessel === 'dutch_oven') {
          state.bakingVessel = parsed.bakingVessel;
        }

        // Synchronize DOM inputs with loaded state
        if (DOM.flourInput) DOM.flourInput.value = state.totalFlour;
        if (DOM.hydrationSlider) DOM.hydrationSlider.value = state.hydrationPct;
        if (DOM.specialtySlider) DOM.specialtySlider.value = state.specialtyPct;
        if (DOM.autoHydrationToggle) DOM.autoHydrationToggle.checked = state.autoAdjustHydration;
        if (DOM.saltTypeSelect) DOM.saltTypeSelect.value = state.saltType;
        if (DOM.saltSlider) DOM.saltSlider.value = state.saltPct;
        if (DOM.yeastTypeSelect) DOM.yeastTypeSelect.value = state.yeastType;
        if (DOM.starterRateSlider) DOM.starterRateSlider.value = state.starterRatePct;
        if (DOM.sugarSlider) DOM.sugarSlider.value = state.sugarPct;
        if (DOM.includeSugarCheck) {
          DOM.includeSugarCheck.checked = state.includeSugar;
          DOM.sugarSlider.disabled = !state.includeSugar;
        }
      }
    } catch (e) {
      console.warn('Could not load recipe state from localStorage', e);
    }
  }

  function saveTimerState() {
    try {
      if (timerIsRunning && timerEndTime) {
        localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify({
          totalSeconds: timerTotalSeconds,
          remainingSeconds: timerRemainingSeconds,
          labelText: timerLabelText,
          isRunning: true,
          endTime: timerEndTime
        }));
      } else if (!timerIsRunning && timerTotalSeconds > 0 && timerRemainingSeconds > 0) {
        localStorage.setItem(STORAGE_TIMER_KEY, JSON.stringify({
          totalSeconds: timerTotalSeconds,
          remainingSeconds: timerRemainingSeconds,
          labelText: timerLabelText,
          isRunning: false,
          endTime: null
        }));
      } else {
        localStorage.removeItem(STORAGE_TIMER_KEY);
      }
    } catch (e) {
      console.warn('Could not save timer state', e);
    }
  }

  function loadTimerState() {
    try {
      const saved = localStorage.getItem(STORAGE_TIMER_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object') return;

      timerTotalSeconds = parsed.totalSeconds || 0;
      timerLabelText = parsed.labelText || 'Timer';

      if (parsed.isRunning && parsed.endTime) {
        const now = Date.now();
        const diffSecs = Math.round((parsed.endTime - now) / 1000);
        if (diffSecs > 0) {
          timerRemainingSeconds = diffSecs;
          timerEndTime = parsed.endTime;
          startTimer(false);
        } else {
          timerRemainingSeconds = 0;
          timerIsRunning = false;
          timerEndTime = null;
          updateTimerUI();
          showToast(`🔔 Timer "${timerLabelText}" finished while you were away!`, 'warning');
        }
      } else if (parsed.remainingSeconds > 0) {
        timerRemainingSeconds = parsed.remainingSeconds;
        timerIsRunning = false;
        timerEndTime = null;
        updateTimerUI();
      }
    } catch (e) {
      console.warn('Could not load timer state', e);
    }
  }

  // --- Dedicated Printable Recipe Card Renderer ---
  function renderPrintRecipeCard() {
    if (!DOM.printRecipeCard) return;

    const f = computeFormula(state);
    const totalFlour = f.totalFlour;
    const specPct = f.specialtyPct;
    const grain = f.grain;
    const specGrams = f.specialtyGrams;
    const saltDef = f.saltDef;
    const yeastDef = f.yeastDef;
    const isC = f.isC;
    const isDutch = f.bakingVessel === 'dutch_oven';

    const hydration = f.effectiveHydrationPct.toFixed(1);
    const totalWater = f.totalWaterGrams;
    const saltGrams = f.saltGrams;
    const sugarGrams = f.sugarGrams;

    let ingredientsRows = [];
    let breadFlourGrams = f.breadFlourGrams;
    let starterGrams = f.starterGrams;
    let starterFlour = f.starterFlourGrams;
    let starterWater = f.starterWaterGrams;
    let addedWater = f.addedWaterGrams;
    let totalDough = f.totalDough;

    if (f.yeastType === 'sourdough') {
      ingredientsRows.push({
        name: 'Active Sourdough Starter (100% Hydration)',
        pct: `${f.starterRatePct}% rate`,
        weight: `${starterGrams}g`,
        ref: `~${(starterGrams / 240).toFixed(1)} cups (${starterFlour}g flour / ${starterWater}g water)`
      });
      ingredientsRows.push({
        name: 'King Arthur Bread Flour (Added)',
        pct: `${((breadFlourGrams / totalFlour) * 100).toFixed(1)}%`,
        weight: `${breadFlourGrams}g`,
        ref: `~${(breadFlourGrams / 120).toFixed(1)} cups`
      });
      if (specPct > 0) {
        ingredientsRows.push({
          name: grain.name,
          pct: `${specPct.toFixed(1)}%`,
          weight: `${specGrams}g`,
          ref: `~${(specGrams / 120).toFixed(1)} cups`
        });
      }
      ingredientsRows.push({
        name: 'Lukewarm Water (Added)',
        pct: `${((addedWater / totalFlour) * 100).toFixed(1)}%`,
        weight: `${addedWater}g / ${addedWater}ml`,
        ref: `~${(addedWater / 237).toFixed(1)} cups (${totalWater}g total hydration)`
      });
    } else {
      let yeastVol = `~${(f.yeastGrams / 3.1).toFixed(1)} tsp`;
      if (f.yeastType === 'fresh') yeastVol = `~${(f.yeastGrams / 17.0).toFixed(1)} cake block`;

      if (specPct > 0) {
        ingredientsRows.push({
          name: 'King Arthur Unbleached Bread Flour',
          pct: `${(100 - specPct).toFixed(1)}%`,
          weight: `${breadFlourGrams}g`,
          ref: `~${(breadFlourGrams / 120).toFixed(1)} cups`
        });
        ingredientsRows.push({
          name: grain.name,
          pct: `${specPct.toFixed(1)}%`,
          weight: `${specGrams}g`,
          ref: `~${(specGrams / 120).toFixed(1)} cups`
        });
      } else {
        ingredientsRows.push({
          name: 'King Arthur Unbleached Bread Flour',
          pct: '100.0%',
          weight: `${totalFlour}g`,
          ref: `~${(totalFlour / 120).toFixed(1)} cups`
        });
      }

      ingredientsRows.push({
        name: 'Lukewarm Water',
        pct: `${hydration}%`,
        weight: `${totalWater}g / ${totalWater}ml`,
        ref: `~${(totalWater / 237).toFixed(1)} cups`
      });

      ingredientsRows.push({
        name: yeastDef.name,
        pct: `${f.effectiveYeastPct.toFixed(2)}%`,
        weight: `${f.yeastGrams}g`,
        ref: yeastVol
      });
    }

    ingredientsRows.push({
      name: saltDef.name,
      pct: `${f.saltPct.toFixed(1)}%`,
      weight: `${saltGrams}g`,
      ref: formatSaltVolume(saltGrams, f.saltType)
    });

    if (f.includeSugar) {
      ingredientsRows.push({
        name: 'Granulated Sugar',
        pct: `${f.sugarPct.toFixed(2)}%`,
        weight: `${sugarGrams}g`,
        ref: `~${(sugarGrams / 11.0).toFixed(1)} tbsp`
      });
    }

    ingredientsRows.push({
      name: 'Coarse Semolina Flour or Cornmeal',
      pct: '—',
      weight: '~15g',
      ref: 'For dusting baking sheet or parchment'
    });

    const perLoaf = f.perLoaf;
    const vesselName = isDutch ? 'Cast Iron Dutch Oven' : 'Baking Sheet + Steam Pan';

    const steps = buildSteps(f, state.tempUnit);
    const printSteps = steps.map(s => ({
      num: s.num,
      title: s.title,
      desc: s.printDesc
    }));

    DOM.printRecipeCard.innerHTML = `
      <div class="print-header">
        <div>
          <h1 class="print-title">Bread Nerd — Artisan Bread Recipe</h1>
          <p class="print-subtitle">Adapted from King Arthur Baking: "The Easiest Loaf of Bread You'll Ever Bake"</p>
        </div>
        <div class="print-date">Printed: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
      </div>

      <div class="print-grid">
        <div class="print-col-left">
          <div class="print-meta-grid">
            <div class="print-meta-item">
              <span>Yield</span>
              <strong>${state.loaves} Loaves (~${perLoaf}g each)</strong>
            </div>
            <div class="print-meta-item">
              <span>Total Dough</span>
              <strong>${totalDough}g</strong>
            </div>
            <div class="print-meta-item">
              <span>Hydration</span>
              <strong>${hydration}%</strong>
            </div>
            <div class="print-meta-item">
              <span>Baking Vessel</span>
              <strong>${vesselName}</strong>
            </div>
          </div>

          <div class="print-section-title">Formula & Ingredients</div>
          <table class="print-table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th class="th-pct">Baker's %</th>
                <th class="th-weight">Weight</th>
                <th>Measure</th>
              </tr>
            </thead>
            <tbody>
              ${ingredientsRows.map(row => `
                <tr>
                  <td><strong>${row.name}</strong></td>
                  <td class="pct-col">${row.pct}</td>
                  <td class="weight-col">${row.weight}</td>
                  <td>${row.ref}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="print-section-title">Baker's Field Notes</div>
          <div class="print-notes">
            <p>• <strong>Bottom Crust:</strong> Dust baking surface with coarse semolina or yellow cornmeal to create a non-stick ball-bearing layer and crisp crust.</p>
            <p>• <strong>Gentle Proof Box:</strong> In a cool kitchen, place dough in turned-off oven with a pot of hot water (~85°F–90°F / 29°C–32°C) to speed bulk rise by ~35%–45%.</p>
            <p>• <strong>Cooling:</strong> Let loaves rest on wire rack for at least 30–60 minutes before slicing to allow internal crumb structure to set.</p>
          </div>
        </div>

        <div class="print-col-right">
          <div class="print-section-title" style="margin-top:0;">Step-by-Step Baker's Method</div>
          <ol class="print-steps">
            ${printSteps.map(s => `
              <li class="print-step-item">
                <div class="print-step-num">${s.num}.</div>
                <div class="print-step-body">
                  <strong>${s.title}:</strong>
                  <p>${s.desc}</p>
                </div>
              </li>
            `).join('')}
          </ol>
        </div>
      </div>
    `;
  }

  // --- Toast System ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const span = document.createElement('span');
    span.textContent = message;
    toast.appendChild(span);
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- Screen Wake Lock API ---
  async function requestWakeLock() {
    if (!('wakeLock' in navigator) || !wakeLockWanted) return;
    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      DOM.wakeLockBtn.classList.add('active');
      DOM.wakeLockBtn.setAttribute('aria-pressed', 'true');

      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
        if (!wakeLockWanted) {
          DOM.wakeLockBtn.classList.remove('active');
          DOM.wakeLockBtn.setAttribute('aria-pressed', 'false');
        }
      });
    } catch (err) {
      console.warn('Wake lock request error:', err);
    }
  }

  async function toggleWakeLock() {
    if (!('wakeLock' in navigator)) {
      showToast('Screen Wake Lock is not supported on this browser', 'warning');
      return;
    }

    try {
      if (wakeLockWanted) {
        wakeLockWanted = false;
        if (wakeLockSentinel) {
          await wakeLockSentinel.release();
          wakeLockSentinel = null;
        }
        DOM.wakeLockBtn.classList.remove('active');
        DOM.wakeLockBtn.setAttribute('aria-pressed', 'false');
        showToast('Screen Wake Lock released', 'info');
      } else {
        wakeLockWanted = true;
        await requestWakeLock();
        if (wakeLockSentinel) {
          DOM.wakeLockBtn.setAttribute('aria-pressed', 'true');
          showToast('Screen will stay awake while baking!', 'success');
        } else {
          showToast('Could not activate Wake Lock', 'warning');
        }
      }
    } catch (err) {
      console.error('Wake lock error:', err);
      showToast('Could not activate Wake Lock: ' + err.message, 'warning');
    }
  }

  // --- Copy Formula Markdown ---
  function copyFormulaToClipboard() {
    const f = computeFormula(state);
    const totalFlour = f.totalFlour;
    const specPct = f.specialtyPct;
    const grain = f.grain;
    const specGrams = f.specialtyGrams;
    const saltDef = f.saltDef;
    const yeastDef = f.yeastDef;
    const isDutch = f.bakingVessel === 'dutch_oven';

    const hydration = f.effectiveHydrationPct.toFixed(1);
    const totalWater = f.totalWaterGrams;
    const saltGrams = f.saltGrams;
    const saltVol = formatSaltVolume(saltGrams, f.saltType);
    const sugarGrams = f.sugarGrams;

    let flourLines = [];
    let yeastLines = [];
    let waterLine = '';
    let totalDough = f.totalDough;

    if (f.yeastType === 'sourdough') {
      flourLines = [
        `• Active Sourdough Starter (100%): ${f.starterGrams}g (${f.starterRatePct}% inoculation — ${f.starterFlourGrams}g flour + ${f.starterWaterGrams}g water)`,
        `• King Arthur Bread Flour (Added): ${f.breadFlourGrams}g (${((f.breadFlourGrams / totalFlour) * 100).toFixed(1)}%)`,
        ...(specPct > 0 ? [`• ${grain.name}: ${specGrams}g (${specPct.toFixed(1)}%)`] : []),
        `  [Total Grain Bill: ${totalFlour}g (100.0%)]`
      ];
      waterLine = `• Lukewarm Water (Added): ${f.addedWaterGrams}g / ${f.addedWaterGrams}ml (${((f.addedWaterGrams / totalFlour) * 100).toFixed(1)}% added | ${totalWater}g total hydration water)`;
    } else {
      let yeastVol = `~${(f.yeastGrams / 3.1).toFixed(1)} tsp`;
      if (f.yeastType === 'fresh') yeastVol = `~${(f.yeastGrams / 17.0).toFixed(1)} cake block`;

      flourLines = specPct > 0 ? [
        `• King Arthur Bread Flour: ${f.breadFlourGrams}g (${(100 - specPct).toFixed(1)}%)`,
        `• ${grain.name}: ${specGrams}g (${specPct.toFixed(1)}%)`,
        `  [Total Grain Bill: ${totalFlour}g (100.0%)]`
      ] : [
        `• King Arthur Bread Flour: ${totalFlour}g (100.0%)`
      ];

      waterLine = `• Lukewarm Water: ${totalWater}g / ${totalWater}ml (${hydration}%)`;
      yeastLines = [`• ${yeastDef.name}: ${f.yeastGrams}g (${f.effectiveYeastPct.toFixed(2)}% | ${yeastVol})`];
    }

    const perLoaf = f.perLoaf;

    const steps = buildSteps(f, state.tempUnit);
    const methodSteps = steps.map(s => s.copyDesc);

    const text = [
      `Bread Nerd — Baker's Formula Sheet`,
      `Adapted from King Arthur Baking: "The Easiest Loaf of Bread You'll Ever Bake"`,
      `Batch: ${f.loaves} loaves (~${perLoaf}g each | Total Dough: ${totalDough}g)`,
      `Hydration: ${hydration}%`,
      `Leavening: ${yeastDef.name}`,
      `Baking Vessel: ${isDutch ? 'Cast Iron Dutch Oven' : 'Baking Sheet + Steam Pan'}`,
      specPct > 0 ? `Grain Blend: ${100 - specPct}% White Bread Flour + ${specPct}% ${grain.shortName}` : `Grain Blend: 100% White Bread Flour`,
      ``,
      `--- INGREDIENTS ---`,
      ...flourLines,
      waterLine,
      ...yeastLines,
      `• ${saltDef.name}: ${saltGrams}g (${f.saltPct}% | ${saltVol})`,
      f.includeSugar ? `• Granulated Sugar: ${sugarGrams}g (${f.sugarPct}%)` : `• Granulated Sugar: 0g (omitted)`,
      `• Pan Prep: Coarse semolina flour or yellow cornmeal for dusting`,
      ``,
      `--- METHOD SUMMARY ---`,
      ...methodSteps
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Formula copied to clipboard!', 'success');
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('Formula copied to clipboard!', 'success');
  }

  // --- Step Progress Checklist Persistence ---
  const STORAGE_STEP_PROGRESS_KEY = 'breadNerd_stepProgress';

  function saveStepProgress() {
    try {
      const completedSteps = [];
      DOM.timelineSteps.forEach(step => {
        if (step.classList.contains('completed')) {
          const stepNum = step.dataset.step;
          if (stepNum) completedSteps.push(stepNum);
        }
      });
      localStorage.setItem(STORAGE_STEP_PROGRESS_KEY, JSON.stringify(completedSteps));
    } catch (e) {
      console.warn('Could not save step progress', e);
    }
  }

  function loadStepProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_STEP_PROGRESS_KEY);
      if (!saved) return;
      const completedSteps = JSON.parse(saved);
      if (Array.isArray(completedSteps)) {
        DOM.timelineSteps.forEach(step => {
          const stepNum = step.dataset.step;
          if (stepNum && completedSteps.includes(stepNum)) {
            step.classList.add('completed');
          } else {
            step.classList.remove('completed');
          }
        });
      }
    } catch (e) {
      console.warn('Could not load step progress', e);
    }
  }

  function resetStepProgress() {
    try {
      localStorage.removeItem(STORAGE_STEP_PROGRESS_KEY);
    } catch (e) {}
    DOM.timelineSteps.forEach(step => {
      step.classList.remove('completed');
    });
    updateStepProgress();
  }

  function updateStepProgress() {
    let completedCount = 0;
    DOM.timelineSteps.forEach(step => {
      if (step.classList.contains('completed')) {
        completedCount++;
      }
    });
    DOM.stepsProgress.textContent = `${completedCount} / ${DOM.timelineSteps.length} Complete`;
  }

  // --- Setup Event Listeners ---
  function setupEvents() {
    // Flour weight input
    DOM.flourInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.totalFlour = val;
        state.baseFlourPerLoaf = val / (state.loaves || 2);
        recalculate();
      }
    });

    // Specialty grain slider
    DOM.specialtySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.specialtyPct = isNaN(val) ? 0 : Math.min(50, Math.max(0, val));
      recalculate();
    });

    // Grain type chips
    DOM.grainChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const grainId = chip.dataset.grain;
        if (GRAIN_DEFINITIONS[grainId]) {
          state.specialtyGrain = grainId;
          // If at 0%, bump to 15% as a helpful default suggestion when clicking a grain
          if (state.specialtyPct === 0) {
            state.specialtyPct = 15;
            DOM.specialtySlider.value = 15;
          }
          recalculate();
        }
      });
    });

    // Grain blend preset buttons
    DOM.grainPresetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = parseInt(btn.dataset.pct, 10);
        if (!isNaN(pct)) {
          state.specialtyPct = pct;
          DOM.specialtySlider.value = pct;
          recalculate();
        }
      });
    });

    // Auto-hydration compensation toggle
    DOM.autoHydrationToggle.addEventListener('change', (e) => {
      state.autoAdjustHydration = e.target.checked;
      const bump = computeFormula(state).recommendedBump;
      if (state.autoAdjustHydration) {
        state.hydrationPct = Math.round((state.baseHydrationPct + bump) * 10) / 10;
      } else {
        state.hydrationPct = state.baseHydrationPct;
      }
      recalculate();
    });

    // Hydration slider
    DOM.hydrationSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val)) {
        const bump = computeFormula(state).recommendedBump;
        if (state.autoAdjustHydration) {
          state.baseHydrationPct = Math.round((val - bump) * 10) / 10;
          state.hydrationPct = val;
        } else {
          state.baseHydrationPct = val;
          state.hydrationPct = val;
        }
        recalculate();
      }
    });

    // Loaf yield buttons
    DOM.loafButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const loaves = parseInt(btn.dataset.loaves, 10);
        if (!isNaN(loaves)) {
          state.loaves = loaves;
          state.totalFlour = loaves * state.baseFlourPerLoaf;
          DOM.flourInput.value = state.totalFlour;
          recalculate();
        }
      });
    });

    // Quick hydration preset buttons
    DOM.hydrationPresetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.hydration);
        if (!isNaN(val)) {
          state.baseHydrationPct = val;
          const bump = computeFormula(state).recommendedBump;
          state.hydrationPct = state.autoAdjustHydration ? Math.round((val + bump) * 10) / 10 : val;
          DOM.hydrationSlider.value = state.hydrationPct;
          recalculate();
        }
      });
    });

    // Reset to defaults
    DOM.resetDefaultsBtn.addEventListener('click', () => {
      resetStepProgress();
      Object.assign(state, KAB_DEFAULTS);
      state.baseFlourPerLoaf = KAB_DEFAULTS.totalFlour / KAB_DEFAULTS.loaves;
      DOM.flourInput.value = state.totalFlour;
      DOM.specialtySlider.value = state.specialtyPct;
      DOM.autoHydrationToggle.checked = state.autoAdjustHydration;
      DOM.hydrationSlider.value = state.hydrationPct;
      DOM.saltTypeSelect.value = state.saltType;
      DOM.saltSlider.value = state.saltPct;
      DOM.yeastTypeSelect.value = state.yeastType;
      DOM.starterRateSlider.value = state.starterRatePct;
      DOM.sugarSlider.value = state.sugarPct;
      DOM.includeSugarCheck.checked = state.includeSugar;
      recalculate();
      showToast('Reset to King Arthur Baking defaults (100% Bread Flour)', 'info');
    });

    // Fine-tuning drawer accordion toggle
    DOM.toggleTuningBtn.addEventListener('click', () => {
      DOM.tuningBody.classList.toggle('hidden');
      const arrow = DOM.toggleTuningBtn.querySelector('.accordion-arrow');
      if (arrow) arrow.classList.toggle('rotated');
    });

    // Salt Type Select & Slider
    DOM.saltTypeSelect.addEventListener('change', (e) => {
      state.saltType = e.target.value;
      recalculate();
    });

    DOM.saltSlider.addEventListener('input', (e) => {
      state.saltPct = parseFloat(e.target.value);
      recalculate();
    });

    // Yeast & Leavening Type Select
    DOM.yeastTypeSelect.addEventListener('change', (e) => {
      state.yeastType = e.target.value;
      recalculate();
    });

    // Sourdough Starter Inoculation Slider
    DOM.starterRateSlider.addEventListener('input', (e) => {
      state.starterRatePct = parseInt(e.target.value, 10);
      recalculate();
    });

    // Sugar slider & toggle
    DOM.sugarSlider.addEventListener('input', (e) => {
      state.sugarPct = parseFloat(e.target.value);
      recalculate();
    });

    DOM.includeSugarCheck.addEventListener('change', (e) => {
      state.includeSugar = e.target.checked;
      DOM.sugarSlider.disabled = !state.includeSugar;
      recalculate();
    });

    // Reset only advanced controls to defaults (without changing batch flour, loaves, hydration, or grains)
    if (DOM.resetAdvancedBtn) {
      DOM.resetAdvancedBtn.addEventListener('click', () => {
        state.saltType = KAB_DEFAULTS.saltType;
        state.saltPct = KAB_DEFAULTS.saltPct;
        state.yeastType = KAB_DEFAULTS.yeastType;
        state.yeastPct = KAB_DEFAULTS.yeastPct;
        state.starterRatePct = KAB_DEFAULTS.starterRatePct;
        state.sugarPct = KAB_DEFAULTS.sugarPct;
        state.includeSugar = KAB_DEFAULTS.includeSugar;

        DOM.saltTypeSelect.value = state.saltType;
        DOM.saltSlider.value = state.saltPct;
        DOM.yeastTypeSelect.value = state.yeastType;
        DOM.starterRateSlider.value = state.starterRatePct;
        DOM.sugarSlider.value = state.sugarPct;
        DOM.includeSugarCheck.checked = state.includeSugar;
        DOM.sugarSlider.disabled = !state.includeSugar;

        recalculate();
        showToast('↺ Advanced ingredients reset to defaults (2.5% Table Salt, Instant Yeast, 1.83% Sugar)', 'info');
      });
    }

    // Timer controls
    DOM.startTimerBtn.addEventListener('click', toggleTimer);
    if (DOM.resetTimerBtn) DOM.resetTimerBtn.addEventListener('click', resetTimer);
    if (DOM.clearTimerBtn) DOM.clearTimerBtn.addEventListener('click', clearTimer);

    if (DOM.mobileTimerToggleBtn) {
      DOM.mobileTimerToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTimer();
      });
    }

    if (DOM.mobileTimerJump) {
      DOM.mobileTimerJump.addEventListener('click', () => {
        DOM.timerHubCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    DOM.quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const mins = parseInt(chip.dataset.min, 10);
        if (!isNaN(mins)) adjustTimerMinutes(mins);
      });
    });

    // Static timer buttons outside timeline (if any)
    DOM.loadTimerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const secs = parseInt(btn.dataset.time, 10);
        const label = btn.dataset.label;
        loadTimer(secs, label);
      });
    });

    // Delegated timer button clicks inside dynamic timeline steps
    DOM.timelineContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.load-timer-btn');
      if (btn) {
        const secs = parseInt(btn.dataset.time, 10);
        const label = btn.dataset.label;
        if (!isNaN(secs) && label) {
          loadTimer(secs, label);
        }
      }
    });

    // Timeline step completion clicks
    DOM.timelineSteps.forEach(step => {
      const checkBtn = step.querySelector('.step-check-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          step.classList.toggle('completed');
          updateStepProgress();
          saveStepProgress();
        });
      }
    });

    // Header timer navigation button
    if (DOM.headerTimerBtn) {
      DOM.headerTimerBtn.addEventListener('click', () => {
        DOM.timerHubCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        DOM.timerHubCard.classList.remove('timer-hub-pulse');
        void DOM.timerHubCard.offsetWidth; // trigger reflow
        DOM.timerHubCard.classList.add('timer-hub-pulse');
        setTimeout(() => {
          DOM.timerHubCard.classList.remove('timer-hub-pulse');
        }, 1600);
      });
    }

    // Baking vessel selector buttons
    DOM.vesselBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const vessel = btn.dataset.vessel;
        if (vessel && (vessel === 'sheet' || vessel === 'dutch_oven')) {
          state.bakingVessel = vessel;
          DOM.vesselBtns.forEach(b => b.classList.toggle('active', b.dataset.vessel === vessel));
          recalculate();
        }
      });
    });

    // Header buttons
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    if (DOM.viewModeBtn) {
      DOM.viewModeBtn.addEventListener('click', () => toggleRecipeView());
    }

    DOM.wakeLockBtn.addEventListener('click', toggleWakeLock);

    DOM.tempUnitBtn.addEventListener('click', () => {
      state.tempUnit = state.tempUnit === 'F' ? 'C' : 'F';
      recalculate();
    });

    DOM.copyRecipeBtn.addEventListener('click', copyFormulaToClipboard);

    DOM.printBtn.addEventListener('click', () => {
      renderPrintRecipeCard();
      setTimeout(() => {
        window.print();
      }, 60);
    });

    window.addEventListener('beforeprint', () => {
      renderPrintRecipeCard();
    });

    // Handle visibility change for screen wake lock re-acquisition
    document.addEventListener('visibilitychange', async () => {
      if (wakeLockWanted && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    });
  }

  // Keep CSS --header-height synchronized with actual header rendered height
  function syncHeaderHeight() {
    const header = document.querySelector('.app-header');
    if (header) {
      const h = header.getBoundingClientRect().height;
      if (h > 0) {
        document.documentElement.style.setProperty('--header-height', `${Math.round(h)}px`);
      }
    }
  }

  // --- Initializer ---
  function init() {
    syncHeaderHeight();
    window.addEventListener('resize', syncHeaderHeight);
    setupEvents();
    loadTheme();
    loadRecipeState();
    loadRecipeView();
    loadStepProgress();
    recalculate();
    loadTimerState();
    updateTimerUI();
    updateStepProgress();

    // Register service worker for offline kitchen use
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./sw.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }

  // Run on DOM load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Node.js module exports for pure formula unit tests
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      computeFormula,
      buildSteps,
      getBakerInsight,
      formatSaltVolume,
      GRAIN_DEFINITIONS,
      SALT_DEFINITIONS,
      LEAVENING_DEFINITIONS,
      KAB_DEFAULTS
    };
  }

})();
