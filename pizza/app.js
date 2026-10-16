/**
 * PIZZA NERD — Modern New York Style Pizza Dough & Hydration Calculator
 * Dedicated to the science of cold-fermented, high-gluten New York style pizza.
 */

(function () {
  'use strict';

  // --- Flour & Grain Definitions (Behavioral Science) ---
  const GRAIN_DEFINITIONS = {
    semolina: {
      id: 'semolina',
      name: 'Semolina / Durum Flour',
      shortName: 'Semolina',
      icon: '🌾',
      desc: 'High-protein durum wheat. Produces golden crust, signature NY bottom crunch, and prevents stickiness on the peel.',
      glutenProfile: 'Strong, tenacious gluten with low extensibility. Unlike bread flour, durum gluten resists stretching and tends to spring back at higher percentages.',
      waterAbsorptionNote: 'Durum wheat drinks water steadily. Recommend bumping hydration +1.0% to +2.0% for high percentages.',
      extraWaterPerPct: 0.08, // e.g. 15% semolina -> +1.2% hydration
      fermentationSpeed: 'Standard',
      fermentationTiming: 'Ferments at standard pace. Adds golden carotenoid pigments that brown richly.',
      flavor: 'Rich, sweet, nutty, toasted grain notes with a rustic golden crumb and sandy crisp bite.',
      handlingTip: 'Keep under 15%–20% so dough stretches easily without spring-back; use extra semolina on the peel as a natural ball-bearing layer for effortless oven launches.'
    },
    whole_wheat: {
      id: 'whole_wheat',
      name: 'Stoneground Whole Wheat Flour',
      shortName: 'Whole Wheat',
      icon: '🌿',
      desc: '100% stoneground whole wheat with bran and germ intact for rustic NY artisan crusts.',
      glutenProfile: 'Moderate gluten strength. Coarse bran particles can disrupt ultra-thin stretching if exceeded beyond 25%.',
      waterAbsorptionNote: 'Thirsty bran absorbs significant water. Recommend bumping hydration +2.0% to +3.5%.',
      extraWaterPerPct: 0.15, // e.g. 20% WW -> +3.0% hydration
      fermentationSpeed: 'Faster (+15% to +25%)',
      fermentationTiming: 'Mineral-rich germ fuels yeast metabolism; dough balls ferment and mature ~6–12 hours faster.',
      flavor: 'Nutty, earthy, toasted graham aroma with a darker, rustic cornicione.',
      handlingTip: 'Keep under 20%–25% for thin-crust NY folding; handle with smooth knuckle stretching without tearing.'
    },
    tipo00: {
      id: 'tipo00',
      name: 'Type 00 Pizzeria Flour',
      shortName: 'Type 00',
      icon: '🍕',
      desc: 'Finely milled unmalted Italian soft wheat. Warning for home ovens: engineered for 800°F+; browns pale at 500°F–550°F without added sugar/malt.',
      glutenProfile: 'Silky, extensible gluten matrix that yields a soft, tender melt-in-the-mouth cornicione.',
      waterAbsorptionNote: 'Finely milled low-ash flour absorbs water slightly slower. Hold back water (-0.08% per % 00).',
      extraWaterPerPct: -0.08,
      fermentationSpeed: 'Standard',
      fermentationTiming: 'Matures over cold retard. In 500°F home ovens, must be supplemented with 1.5%–2% sugar/malt to avoid pale, tough crust.',
      flavor: 'Pure, clean wheat sweetness that highlights olive oil and fresh San Marzano tomato acidity.',
      handlingTip: 'Stretches with extreme silkiness. In home ovens, keep under 15%–20% blend with malted high-gluten bread flour.'
    },
    spelt: {
      id: 'spelt',
      name: 'Spelt Flour (Ancient Grain)',
      shortName: 'Spelt',
      icon: '🥨',
      desc: 'Ancient non-hybridized wheat with delicate extensible gluten and nutty summer-honey aroma.',
      glutenProfile: 'Highly extensible but delicate; dough can slacken if over-worked or over-hydrated.',
      waterAbsorptionNote: 'Absorbs water slowly and holds less moisture than modern high-gluten wheat. Hold back water (-0.10% per % spelt).',
      extraWaterPerPct: -0.10,
      fermentationSpeed: 'Faster (+15%)',
      fermentationTiming: 'Enzymes break down sugars rapidly. Ensure dough is thoroughly chilled during cold ferment.',
      flavor: 'Mildly sweet, pleasant honey and nutty toasted undertones.',
      handlingTip: 'Knead gently (5 min max). Shape balls with taut surface tension.'
    },
    rye: {
      id: 'rye',
      name: 'Dark Rye Flour',
      shortName: 'Dark Rye',
      icon: '🥪',
      desc: 'Traditional rye addition for rustic earthy depth and subtle sourdough-like complexity.',
      glutenProfile: 'Low glutenin; dough relies on viscous pentosan gums. Dough feels tacky and clay-like.',
      waterAbsorptionNote: 'Pentosans absorb up to 8x their weight in water. Recommend +2.5% to +4.0% extra hydration.',
      extraWaterPerPct: 0.20,
      fermentationSpeed: 'Accelerated (+20%)',
      fermentationTiming: 'Hyperactive amylase enzymes accelerate fermentation. Check dough maturity earlier.',
      flavor: 'Deep, earthy, faintly tangy, old-world rustic complexity.',
      handlingTip: 'Keep under 15% for NY style stretchability. Handle with olive oil on hands if sticky.'
    }
  };

  // Dynamic 10% preset labels reflecting chosen grain addition
  const GRAIN_PRESET_10_LABELS = {
    semolina: '10% Semolina Crisp',
    whole_wheat: '10% Whole Wheat Note',
    tipo00: '10% Type 00 Tender',
    spelt: '10% Spelt Aroma',
    rye: '10% Rye Complexity'
  };

  function getGrainPresetLabel(grainId) {
    if (GRAIN_PRESET_10_LABELS[grainId]) {
      return GRAIN_PRESET_10_LABELS[grainId];
    }
    const g = GRAIN_DEFINITIONS[grainId];
    return g ? `10% ${g.shortName}` : '10% Specialty Blend';
  }

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
      name: 'Instant Dry Yeast (IDY)',
      shortName: 'Instant Yeast',
      multiplier: 1.0,
      desc: 'Pizzeria industry standard. Dosed low (0.35%) for 24–72h cold ferment, or 0.85% for same-day 2.5–3.5h rise.',
      coldFermentDesc: '24 to 72 hours cold ferment in refrigerator (optimal flavor & blistered crust)',
      roomTemperDesc: '90 to 120 minutes at room temperature before stretching',
      waterTempF: '60°F to 65°F (Cold Ferment) / 85°F to 90°F (Same-Day)',
      waterTempC: '16°C to 18°C (Cold Ferment) / 29°C to 32°C (Same-Day)'
    },
    active_dry: {
      id: 'active_dry',
      name: 'Active Dry Yeast (ADY - 1.25x)',
      shortName: 'Active Dry',
      multiplier: 1.25,
      desc: 'Requires 10-minute warm water bloom (100°F–105°F / 38°C–41°C). Dosed at 1.25x for equivalent leavening power.',
      coldFermentDesc: '24 to 72 hours cold ferment in refrigerator',
      roomTemperDesc: '90 to 120 minutes at room temperature before stretching',
      waterTempF: '100°F to 105°F for bloom, then cool water for balance',
      waterTempC: '38°C to 41°C for bloom, then cool water for balance'
    },
    fresh: {
      id: 'fresh',
      name: 'Fresh Cake / Compressed Yeast (3x)',
      shortName: 'Fresh Yeast',
      multiplier: 3.0,
      desc: 'High-moisture compressed baker’s yeast dosed at 3.0x. Crumbles directly into water.',
      coldFermentDesc: '24 to 48 hours cold ferment in refrigerator',
      roomTemperDesc: '60 to 90 minutes at room temperature before stretching',
      waterTempF: '65°F to 75°F',
      waterTempC: '18°C to 24°C'
    },
    sourdough: {
      id: 'sourdough',
      name: 'Active Sourdough Starter (100% Hydration)',
      shortName: 'Sourdough Starter',
      multiplier: 0,
      desc: 'Wild yeast & lactobacilli levain (1:1 flour:water). Base flour and water automatically offset to keep dough mass and hydration exact.',
      coldFermentDesc: '24 to 48 hours cold retard in refrigerator',
      roomTemperDesc: '2 to 3 hours at room temperature before stretching',
      waterTempF: '75°F to 80°F',
      waterTempC: '24°C to 27°C'
    }
  };

  // --- Sugar / Malt Definitions with Distinct Densities ---
  const SUGAR_TYPES = {
    granulated: {
      id: 'granulated',
      name: 'Granulated Sugar',
      gramsPerTbsp: 12.5,
      gramsPerTsp: 4.2,
      desc: 'Aids Maillard browning in 500°F–550°F home ovens and feeds yeast over 72h cold ferment.'
    },
    malt: {
      id: 'malt',
      name: 'Non-Diastatic Malt Powder',
      gramsPerTbsp: 9.0,
      gramsPerTsp: 3.0,
      desc: 'Classic NYC pizzeria secret: rich caramelized golden color, mellow malt aroma, and shiny blistered crust.'
    },
    honey: {
      id: 'honey',
      name: 'Honey / Agave',
      gramsPerTbsp: 21.0,
      gramsPerTsp: 7.0,
      desc: 'Deep golden crust browning with subtle floral sweetness and moisture retention.'
    }
  };

  // --- Pizza Size & Dough Weight Presets ---
  const PIZZA_SIZES = {
    '12': {
      size: 12,
      name: '12" Personal Pie',
      targetBallWeight: 260,
      thicknessFactor: '0.081 oz/in²',
      desc: 'Crispy personal hearth pie; easy to handle on standard 13" stones.'
    },
    '14': {
      size: 14,
      name: '14" Medium Pie',
      targetBallWeight: 330,
      thicknessFactor: '0.076 oz/in²',
      desc: 'The home oven champion. Fits standard 14"–16" steel slabs with ideal fold and chew.'
    },
    '16': {
      size: 16,
      name: '16" Large NY Pie',
      targetBallWeight: 450,
      thicknessFactor: '0.079 oz/in²',
      desc: 'Large party size. Generous slices with classic thin-crust fold.'
    },
    '18': {
      size: 18,
      name: '18" Jumbo NY Street Slice Pie',
      targetBallWeight: 560,
      thicknessFactor: '0.077 oz/in²',
      desc: 'The authentic NYC street slice shop size. Thin, wide, cut into 8 massive foldable slices.'
    }
  };

  // --- Baseline New York Style Defaults ---
  const NY_DEFAULTS = {
    pies: 2,                 // 2 Dough Balls (Standard)
    pizzaSize: '14',         // 14" pie (~330g ball)
    ballWeight: 330,         // 330g per dough ball (total dough ~660g)
    totalFlour: 393,         // ~393g flour for 660g dough
    baseHydrationPct: 62.0,  // Base white-flour hydration preference
    hydrationPct: 62.0,      // Effective hydration
    autoAdjustHydration: true,
    oilPct: 2.0,             // 2.0% Extra Virgin Olive Oil
    includeOil: true,
    saltType: 'table',
    saltPct: 2.2,            // 2.2% Salt
    yeastType: 'instant',
    yeastPct: 0.35,          // 0.35% IDY (for cold ferment; 0.85% for same-day)
    starterRatePct: 15,      // 10% to 25% sourdough inoculation rate (default 15%)
    sugarType: 'granulated', // granulated, malt, honey
    sugarPct: 1.5,           // 1.5% Sugar / Malt
    includeSugar: true,
    specialtyGrain: 'semolina', // semolina, whole_wheat, tipo00, spelt, rye
    specialtyPct: 0,
    tempUnit: 'F',           // 'F' or 'C'
    bakingSurface: 'steel',  // 'steel', 'pan', 'outdoor_oven'
    fermentStyle: 'cold'     // 'cold' (24h-72h) or 'same_day' (4h-6h)
  };

  // LocalStorage storage keys
  const STORAGE_RECIPE_KEY = 'pizzaNerd_recipe_v1';
  const STORAGE_TIMER_KEY = 'pizzaNerd_timer_v1';
  const THEME_STORAGE_KEY = 'pizzaNerd_theme';

  // State object
  const state = { ...NY_DEFAULTS };

  // KitchenCore Shared Infrastructure Services
  const Core = (typeof KitchenCore !== 'undefined')
    ? KitchenCore
    : (typeof require !== 'undefined' ? require('../shared/core.js') : null);

  const toasts = Core ? Core.createToastManager({ containerId: 'toastContainer' }) : null;
  const showToast = (msg, type = 'info') => (toasts ? toasts.show(msg, type) : console.log(`[Toast ${type}]: ${msg}`));

  const themeMgr = Core ? Core.createThemeManager({
    storageKey: THEME_STORAGE_KEY,
    buttonId: 'themeToggleBtn',
    textId: 'themeToggleText',
    iconId: 'themeToggleIcon'
  }) : null;

  const wakeLockMgr = Core ? Core.createWakeLockManager({
    buttonId: 'wakeLockBtn',
    toastManager: toasts
  }) : null;

  const timerEngine = Core ? Core.createTimer({
    storageKey: STORAGE_TIMER_KEY,
    appName: 'Pizza Nerd',
    defaultTitle: 'Pizza Nerd — New York Style Pizza Dough & Hydration Calculator',
    toastManager: toasts,
    defaultLabel: 'Select a pizza step below to start'
  }) : null;

  const checklistMgr = Core ? Core.createChecklistManager({
    storageKey: 'pizzaNerd_stepProgress',
    stepSelector: '.timeline-step',
    progressSelector: '#stepsProgress'
  }) : null;

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

  // Helper to format olive oil volume (1 tbsp EVOO = ~13.7g; 1 tsp = ~4.56g)
  function formatOilVolume(oilGrams) {
    if (oilGrams <= 0) return '0 tsp';
    const tsp = oilGrams / 4.56;
    if (tsp >= 2.95) {
      const tbsp = tsp / 3.0;
      return `~${tbsp.toFixed(1)} tbsp (~${tsp.toFixed(1)} tsp)`;
    }
    return `~${tsp.toFixed(1)} tsp`;
  }

  // Helper to format sugar/malt/honey volume according to density
  function formatSugarVolume(sugarGrams, sugarType) {
    if (sugarGrams <= 0) return '0 tbsp';
    const sDef = SUGAR_TYPES[sugarType] || SUGAR_TYPES.granulated;
    const tbsp = sugarGrams / sDef.gramsPerTbsp;
    const tsp = sugarGrams / sDef.gramsPerTsp;
    if (tbsp >= 1.0) {
      return `~${tbsp.toFixed(1)} tbsp`;
    }
    return `~${tsp.toFixed(1)} tsp`;
  }

  // Screen-reader timer announcer
  function announceTimerStatus(message) {
    const announcer = document.getElementById('timerAriaAnnouncer');
    if (announcer) {
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 50);
    }
  }

  // DOM Elements (guarded for Node.js unit testing)
  const DOM = (typeof document !== 'undefined') ? {
    flourInput: document.getElementById('flourInput'),
    hydrationSlider: document.getElementById('hydrationSlider'),
    hydrationValue: document.getElementById('hydrationValue'),
    hydrationCompBadge: document.getElementById('hydrationCompBadge'),
    pieButtons: document.querySelectorAll('.pie-btn'),
    sizeButtons: document.querySelectorAll('.size-btn'),
    fermentButtons: document.querySelectorAll('.ferment-btn'),
    ballWeightDisplay: document.getElementById('ballWeightDisplay'),
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
    pieWeightBadge: document.getElementById('pieWeightBadge'),
    stepPiesCount: document.getElementById('stepPiesCount'),
    stepPieGrams: document.getElementById('stepPieGrams'),
    toppingGuideCallout: document.getElementById('toppingGuideCallout'),

    // Tuning drawer
    toggleTuningBtn: document.getElementById('toggleTuningBtn'),
    tuningBody: document.getElementById('tuningBody'),
    resetAdvancedBtn: document.getElementById('resetAdvancedBtn'),
    saltSlider: document.getElementById('saltSlider'),
    saltPctLabel: document.getElementById('saltPctLabel'),
    saltTypeSelect: document.getElementById('saltTypeSelect'),
    saltDesc: document.getElementById('saltDesc'),
    
    oilSlider: document.getElementById('oilSlider'),
    oilPctLabel: document.getElementById('oilPctLabel'),
    includeOilCheck: document.getElementById('includeOilCheck'),
    oilDesc: document.getElementById('oilDesc'),

    yeastTypeSelect: document.getElementById('yeastTypeSelect'),
    yeastPctLabel: document.getElementById('yeastPctLabel'),
    yeastDesc: document.getElementById('yeastDesc'),
    sourdoughControls: document.getElementById('sourdoughControls'),
    starterRateSlider: document.getElementById('starterRateSlider'),
    starterRateLabel: document.getElementById('starterRateLabel'),
    
    sugarSlider: document.getElementById('sugarSlider'),
    sugarPctLabel: document.getElementById('sugarPctLabel'),
    includeSugarCheck: document.getElementById('includeSugarCheck'),
    sugarTypeSelect: document.getElementById('sugarTypeSelect'),
    sugarDesc: document.getElementById('sugarDesc'),
    drawerGrainRatioLabel: document.getElementById('drawerGrainRatioLabel'),

    // Surface selector buttons
    surfaceButtons: document.querySelectorAll('.surface-btn'),

    // Timer Hub
    timerCountdown: document.getElementById('timerCountdown'),
    timerLabel: document.getElementById('timerLabel'),
    startTimerBtn: document.getElementById('startTimerBtn'),
    resetTimerBtn: document.getElementById('resetTimerBtn'),
    clearTimerBtn: document.getElementById('clearTimerBtn'),
    activeTimerBadge: document.getElementById('activeTimerBadge'),
    quickTimerChips: document.querySelectorAll('.quick-timer-chips .chip-btn'),

    // Mobile floating timer
    mobileFloatingTimer: document.getElementById('mobileFloatingTimer'),
    mobileTimerJump: document.getElementById('mobileTimerJump'),
    mobileTimerDigits: document.getElementById('mobileTimerDigits'),
    mobileTimerLabel: document.getElementById('mobileTimerLabel'),
    mobileTimerToggleBtn: document.getElementById('mobileTimerToggleBtn'),

    // Timeline Steps
    timelineContainer: document.getElementById('timelineContainer'),
    timelineSteps: document.querySelectorAll('.timeline-step'),
    stepsProgress: document.getElementById('stepsProgress'),
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
    step4Actions: document.getElementById('step4Actions'),
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
    step9Phase: document.getElementById('step9Phase'),
    step9Title: document.getElementById('step9Title'),
    step9Desc: document.getElementById('step9Desc'),
    step9Actions: document.getElementById('step9Actions'),

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
    const isAutoAdjust = currentState.autoAdjustHydration && f.recommendedBump !== 0;
    const feelHydration = isAutoAdjust
      ? sanitizeNumber(currentState.baseHydrationPct, NY_DEFAULTS.hydrationPct)
      : f.effectiveHydrationPct;
    const actualHydration = f.effectiveHydrationPct;
    const isC = currentState && currentState.tempUnit === 'C';

    // 1. Headline & Base Handling Feel
    let badge = '';
    let sensoryCue = '';
    let baseStars = 1;

    if (feelHydration < 58) {
      badge = 'Stiff & Crisp Deck (<58%)';
      sensoryCue = 'Dough feels dense and firm with high elasticity. Requires firm pressing to stretch thin; produces an ultra-crispy, cracker-like cornicione.';
      baseStars = 2;
    } else if (feelHydration <= 63.5) {
      if (Math.abs(feelHydration - 62.0) < 0.5 && f.specialtyPct === 0) {
        badge = 'Classic New York Street Slice (62.0%)';
      } else {
        badge = 'Traditional NYC Dough (58%–63.5%)';
      }
      sensoryCue = 'Perfect balance of chew and fold. Smooth, silky, non-sticky dough that stretches cleanly without tearing or snapping back.';
      baseStars = 1;
    } else if (feelHydration <= 67) {
      badge = 'Home Oven Sweet-Spot (64%–67%)';
      sensoryCue = 'Soft, supple, and extensible. Compensates for home oven dry heat, yielding an airy cornicione and blistered crispy underside.';
      baseStars = 2;
    } else if (feelHydration <= 71) {
      badge = 'Airy Neo-NY Artisan (68%–71%)';
      sensoryCue = 'Distinctly soft and extensible with high bubble activity. Handle gently with semolina on the peel to avoid sticking during launch.';
      baseStars = 3;
    } else {
      badge = 'Wet Pan / High-Hydration (72%+)';
      sensoryCue = 'Slack, wet dough with rapid spreading. Better suited for Sicilian/Grandma sheet pan or Detroit style rather than peel launch.';
      baseStars = 4;
    }

    if (isAutoAdjust) {
      badge += ` · Feels like ~${feelHydration.toFixed(1)}% white dough`;
    }

    // 2. Adjust Handling Difficulty Star Rating for Grain & Process
    let adjustedStars = baseStars;
    const difficultyModifiers = [];

    if (f.specialtyPct >= 20) {
      if (f.grain.id === 'rye') {
        adjustedStars += 1;
        difficultyModifiers.push('Rye Tacky Viscosity');
      } else if (f.grain.id === 'whole_wheat') {
        adjustedStars += 0.5;
        difficultyModifiers.push('Whole Wheat Bran Fragility');
      } else if (f.grain.id === 'spelt' && actualHydration > 64) {
        adjustedStars += 0.5;
        difficultyModifiers.push('Extensible Spelt Slacking');
      }
    }
    if (f.yeastType === 'sourdough' && feelHydration >= 66) {
      adjustedStars += 0.5;
      difficultyModifiers.push('Sourdough Acid Relaxing');
    }
    if (actualHydration >= 68 && f.bakingSurface === 'steel') {
      adjustedStars += 0.5;
      difficultyModifiers.push('Peel Launch Friction');
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

    // 3. Modular Rules Engine for Contextual Pizza Lab Cues
    const rules = [];

    // Olive Oil Rule
    if (f.includeOil && f.oilPct >= 1.5) {
      rules.push(`<strong>Olive Oil Benefit:</strong> ${f.oilGrams}g extra virgin olive oil coats the gluten strands, keeping the home-baked crust wonderfully pliable for the signature New York fold while preventing dry cardboard texture.`);
    } else if (!f.includeOil || f.oilPct === 0) {
      rules.push(`<strong>No Oil Note:</strong> Many New York pizzerias bake with little or no oil. In a home oven at 500°F–550°F (260°C–288°C), an oil-free dough produces a leaner, crisper crust with less tenderness. Dough will be slightly stiffer to stretch.`);
    }

    // Sugar / Malt & Surface Rule
    if (f.bakingSurface === 'outdoor_oven') {
      const outdoorFloor = isC ? '343°C–371°C' : '650°F–700°F';
      const outdoorMod = isC ? '315°C–343°C' : '600°F–650°F';
      if (f.sugarPct > 0.5) {
        rules.push(`⚠️ <strong>Outdoor Oven High Heat Warning:</strong> At standard 650°F+ (${isC ? '343°C+' : '650°F+'}) outdoor temperatures, dough with ${f.sugarPct}% sugar and ${f.oilPct}% oil scorches the bottom crust before the cheese melts. Your bake step is adjusted to a moderate floor of ${outdoorMod} with flame on low for a 4–5 minute New York bake.`);
      } else {
        rules.push(`<strong>Outdoor Pizza Oven:</strong> With lean dough (${f.sugarPct}% sugar), floor is targeted to ${outdoorFloor}. Keep flame on low after launch for an even 3–4 minute bake.`);
      }
    } else if (f.includeSugar && f.sugarPct > 0) {
      rules.push(`<strong>Browning & Fermentation:</strong> ${f.sugarGrams}g ${f.sugarTypeDef.name} fuels the yeast and ensures golden-brown caramelization at 500°F–550°F (260°C–288°C).`);
    }

    // Semolina Gluten Tenacity Caution
    if (f.grain.id === 'semolina' && f.specialtyPct > 0) {
      rules.push(`<strong>Semolina Gluten Tenacity:</strong> Durum wheat brings rich golden color and crisp bottom crunch, but durum gluten is tenacious and less extensible than bread flour. At higher percentages (>15%), expect the dough to resist stretching and spring back; give dough extra bench rest if it feels tight.`);
    }

    // Type 00 Home Oven Caution
    if (f.grain.id === 'tipo00' && f.specialtyPct > 0 && f.bakingSurface !== 'outdoor_oven') {
      rules.push(`⚠️ <strong>Type 00 in Home Oven:</strong> Unmalted Type 00 pizzeria flour requires 800°F+ Neapolitan heat to color properly. At 500°F–550°F, it bakes pale and dry unless paired with malted bread flour and sugar or non-diastatic malt.`);
    }

    // Tempering Rule (The #1 NY pizza mistake) & Fermentation
    if (f.fermentStyle === 'cold') {
      rules.push(`<strong>Cold Dough Warning:</strong> Never stretch cold dough right out of the refrigerator! Cold gluten contracts and tears easily. Allow dough balls <strong>${f.yeastDef.roomTemperDesc}</strong> to reach ~65°F (18°C) before opening.`);
    } else {
      if (f.yeastType === 'sourdough') {
        rules.push(`<strong>Same-Day Sourdough Dough:</strong> Inoculated with 15% active sourdough starter using warm water (${isC ? '24°C–27°C' : '75°F–80°F'}). Allow a 4–5 hour room-temperature bulk rise as one mass, then divide, ball, and proof 2 hours before stretching.`);
      } else {
        rules.push(`<strong>Same-Day Yeast Dough:</strong> Dosed with ~0.85% yeast and lukewarm water (${isC ? '29°C–32°C' : '85°F–90°F'}). Allow a 1.5–2 hour room-temperature bulk rise as one mass, then divide, ball, and proof 1–1.5 hours before stretching.`);
      }
    }

    // Baking Surface Guidance
    if (f.bakingSurface === 'steel') {
      rules.push(`<strong>Baking Steel:</strong> Conducts heat ~18x faster than ceramic stone. Preheating for 45–60 min at maximum oven temperature (500°F–550°F / 260°C–288°C) gives dramatic oven spring, a crispy blistered underside, and charred cornicione spots under the broiler.`);
    } else if (f.bakingSurface === 'pan') {
      rules.push(`<strong>Pan Pizza (Crucial Pan Proof):</strong> Press dough into generously oiled pan (no semolina needed). Proof directly in the pan for 2–3 hours until thick, airy, and puffy before baking at 500°F.`);
    } else {
      rules.push(`<strong>Outdoor Pizza Oven:</strong> Keep flame on low after launch so the floor temperature doesn't burn the bottom before the cheese melts and top browns.`);
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
  function getVolumeApproximations(flourGrams, waterGrams, yeastGrams, saltGrams, sugarGrams, oilGrams, saltType, yeastType, sugarType, starterGrams) {
    const flourCups = (flourGrams / 120).toFixed(1);
    const waterCups = (waterGrams / 237).toFixed(1);
    const sugarVol = formatSugarVolume(sugarGrams, sugarType);
    const oilVol = formatOilVolume(oilGrams);
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
      sugar: sugarVol,
      oil: oilVol
    };
  }

  // --- Render Grain Advisory Box ---
  function renderGrainAdvisory(f) {
    const specPct = f.specialtyPct;
    const grain = f.grain;

    if (specPct === 0) {
      const baselineTiming = f.fermentStyle === 'cold'
        ? (state.yeastType === 'sourdough' || state.yeastType === 'fresh' ? 'Cold Ferment (24–48 hrs)' : 'Cold Ferment (24–72 hrs)')
        : (state.yeastType === 'sourdough' ? 'Same-Day Sourdough (6–7 hrs)' : 'Same-Day Rise (2.5–3.5 hrs)');
      DOM.grainAdvisoryBox.innerHTML = `
        <div class="advisory-header" style="margin-bottom:0;">
          <div class="advisory-title-wrap">
            <span class="advisory-grain-badge">100% High-Gluten Bread Flour Baseline</span>
            <span class="advisory-timing-speed">${baselineTiming}</span>
          </div>
          <span class="advisory-subtext">Max gluten tensile strength, high stretchability & iconic foldable NY slice</span>
        </div>
      `;
      return;
    }

    const baseH = sanitizeNumber(state.baseHydrationPct, NY_DEFAULTS.hydrationPct);
    const recommendedBump = f.recommendedBump;
    const suggestedHydration = Math.round((baseH + recommendedBump) * 10) / 10;

    let riseTimeEstimate;
    if (f.fermentStyle === 'cold') {
      if (state.yeastType === 'sourdough') {
        riseTimeEstimate = (specPct >= 20 && (grain.id === 'rye' || grain.id === 'whole_wheat')) 
          ? '18–36 hrs (Accelerated Sourdough)' 
          : '24–48 hrs (Wild Sourdough)';
      } else if (state.yeastType === 'fresh') {
        riseTimeEstimate = '24–48 hrs (Fresh Yeast Retard)';
      } else {
        riseTimeEstimate = '24–72 hrs Cold Retard';
      }
    } else {
      riseTimeEstimate = state.yeastType === 'sourdough' 
        ? '6–7 hrs (Same-Day Sourdough)' 
        : '2.5–3.5 hrs (Same-Day Rise)';
    }

    const unclampedTarget = Math.round((baseH + recommendedBump) * 10) / 10;
    const isCappedMax = unclampedTarget > 75;
    const isCappedMin = unclampedTarget < 55;
    const effectiveBump = Math.round((state.hydrationPct - baseH) * 10) / 10;
    const effectiveBumpSign = effectiveBump > 0 ? `+${effectiveBump.toFixed(1)}%` : `${effectiveBump.toFixed(1)}%`;
    const bumpSign = recommendedBump > 0 ? `+${recommendedBump.toFixed(1)}%` : `${recommendedBump.toFixed(1)}%`;
    const actionVerb = recommendedBump > 0 ? 'extra water' : 'water held back';

    let actionMarkup = '';
    if (state.autoAdjustHydration) {
      let adjustDesc = '';
      if (isCappedMax) {
        adjustDesc = `Adjusted <strong>${effectiveBumpSign} (${actionVerb}, capped at 75.0%)</strong> for ${grain.shortName}.`;
      } else if (isCappedMin) {
        adjustDesc = `Adjusted <strong>${effectiveBumpSign} (${actionVerb}, floor at 55.0%)</strong> for ${grain.shortName}.`;
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
      const suggestedH = Math.min(75, Math.max(55, unclampedTarget));
      const targetBump = Math.round((suggestedH - baseH) * 10) / 10;
      const targetBumpSign = targetBump > 0 ? `+${targetBump.toFixed(1)}%` : `${targetBump.toFixed(1)}%`;
      let noteDesc = `Auto-adjust is off. Recommended water adjustment for this blend: <strong>${targetBumpSign}</strong> (${suggestedH.toFixed(1)}% total).`;
      actionMarkup = `
        <div class="advisory-action-bar">
          <span class="advisory-action-note">
            ℹ️ ${noteDesc}
          </span>
          <button type="button" id="applySuggestedHydrationBtn" class="btn-subtle-apply" data-target-hydration="${suggestedH}">
            Apply ${suggestedH.toFixed(1)}% Hydration
          </button>
        </div>
      `;
    }

    DOM.grainAdvisoryBox.innerHTML = `
      <div class="advisory-header">
        <div class="advisory-title-wrap">
          <span class="advisory-grain-badge">${specPct}% ${grain.shortName} Blend</span>
          <span class="advisory-timing-speed">${riseTimeEstimate}</span>
        </div>
        <span class="advisory-subtext">${grain.desc}</span>
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
              <h4>Fermentation & Maturation</h4>
              <p>${grain.fermentationTiming}</p>
            </div>
            <div class="advisory-cell">
              <h4>Water Absorption</h4>
              <p>${grain.waterAbsorptionNote} At ${specPct}%, compensation is <strong>${bumpSign}</strong>.</p>
            </div>
            <div class="advisory-cell">
              <h4>Gluten Matrix & Stretch</h4>
              <p>${grain.glutenProfile} ${grain.handlingTip}</p>
            </div>
            <div class="advisory-cell">
              <h4>Crust Color & Flavor</h4>
              <p>${grain.flavor}</p>
            </div>
          </div>
        </div>
      </details>
    `;

    const applyBtn = document.getElementById('applySuggestedHydrationBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const targetH = parseFloat(applyBtn.dataset.targetHydration);
        if (!isNaN(targetH) && targetH >= 55 && targetH <= 75) {
          state.baseHydrationPct = Math.round((targetH - recommendedBump) * 10) / 10;
          state.hydrationPct = targetH;
          if (DOM.hydrationSlider) DOM.hydrationSlider.value = targetH;
          recalculate();
        }
      });
    }
  }

  // --- Pure Step Instruction Builder ---
  function buildSteps(f, tempUnit) {
    const isC = (typeof tempUnit === 'string') ? (tempUnit === 'C') : (f.isC || false);
    const surface = f.bakingSurface || 'steel';
    const isSameDay = f.fermentStyle === 'same_day';
    const grain = f.grain || GRAIN_DEFINITIONS.semolina;
    const specialtyPct = f.specialtyPct || 0;
    const specialtyGrams = f.specialtyGrams || 0;
    const breadFlourGrams = f.breadFlourGrams;
    const starterGrams = f.starterGrams || 0;
    const addedWaterGrams = f.addedWaterGrams;
    const totalWaterGrams = f.totalWaterGrams;
    const saltGrams = f.saltGrams;
    const yeastGrams = f.yeastGrams;
    const sugarGrams = f.sugarGrams;
    const oilGrams = f.oilGrams;
    const perPie = f.perPie;
    const pies = f.pies;
    const pizzaSizeInfo = f.pizzaSizeInfo;
    const salt = f.saltDef || SALT_DEFINITIONS.table;
    const yeastDef = f.yeastDef || LEAVENING_DEFINITIONS.instant;
    const sugarDef = f.sugarTypeDef || SUGAR_TYPES.granulated;

    // Toppings scaled dynamically by pie area (Area proportional to diameter^2, base 14" = 115g sauce, 160g cheese)
    const areaRatio = Math.pow(pizzaSizeInfo.size / 14, 2);
    const saucePerPie = Math.round(115 * areaRatio);
    const cheesePerPie = Math.round(160 * areaRatio);

    // STEP 1: Dry Mise & Flour Blend
    let s1Phase = 'Mise en Place', s1Title = 'Weigh Flour, Salt & Sugar', s1ScreenDesc, s1Timers = [], s1PrintDesc, s1CopyDesc;
    const sugarClause = f.includeSugar && sugarGrams > 0 ? `, and <strong>${sugarGrams}g ${sugarDef.name}</strong>` : '';
    const sugarPrint = f.includeSugar && sugarGrams > 0 ? `, and ${sugarGrams}g ${sugarDef.name}` : '';
    s1ScreenDesc = `In a large mixing bowl or stand mixer bowl, whisk together the flours: <strong>${breadFlourGrams}g King Arthur High-Gluten / Bread Flour</strong>${specialtyGrams > 0 ? ` + <strong>${specialtyGrams}g ${grain.name}</strong>` : ''}, <strong>${saltGrams}g ${salt.shortName}</strong> (${formatSaltVolume(saltGrams, f.saltType)})${sugarClause}. Whisk dry ingredients thoroughly for 30 seconds to evenly disperse the salt and sugar.`;
    s1PrintDesc = `Whisk ${breadFlourGrams}g bread flour${specialtyGrams > 0 ? ` + ${specialtyGrams}g ${grain.shortName}` : ''}, ${saltGrams}g ${salt.shortName} (${formatSaltVolume(saltGrams, f.saltType)})${sugarPrint}. Whisk dry ingredients 30s to distribute evenly.`;
    s1CopyDesc = `1. Whisk dry flours, salt & sugar/malt in mixing bowl.`;

    // STEP 2: Liquid & Yeast Dispersal
    let s2Phase = 'Liquid Preparation', s2Title, s2ScreenDesc, s2Timers = [], s2PrintDesc, s2CopyDesc;
    const waterTempColdStr = isC ? '16°C to 18°C' : '60°F to 65°F';
    const waterTempWarmStr = isC ? '29°C to 32°C' : '85°F to 90°F';
    const sourdoughWaterTemp = isC ? '24°C to 27°C' : '75°F to 80°F';
    const targetWaterTemp = (f.yeastType === 'sourdough') 
      ? sourdoughWaterTemp 
      : (isSameDay ? waterTempWarmStr : waterTempColdStr);

    if (f.yeastType === 'sourdough') {
      s2Title = 'Disperse Sourdough Starter in Warm Water';
      s2ScreenDesc = `In a separate container, whisk <strong>${starterGrams}g active sourdough starter</strong> into <strong>${addedWaterGrams}g warm water</strong> (${targetWaterTemp}) until milky and completely dissolved. Using warm water (${targetWaterTemp}) gives wild yeast and lactobacilli the thermal activation needed to populate the dough.`;
      s2PrintDesc = `Whisk ${starterGrams}g sourdough starter into ${addedWaterGrams}g warm water (${targetWaterTemp}) until completely dissolved.`;
      s2CopyDesc = `2. Whisk sourdough starter into warm water (${targetWaterTemp}) until milky.`;
    } else if (f.yeastType === 'active_dry') {
      s2Title = 'Bloom Active Dry Yeast & Prep Water';
      s2ScreenDesc = `<strong>1. Warm Bloom:</strong> In a small glass, dissolve <strong>${yeastGrams}g Active Dry Yeast</strong> in ~50ml of warm water (${isC ? '38°C to 41°C' : '100°F to 105°F'})${f.includeSugar ? ' with a pinch of the sugar' : ''}. Let sit undisturbed for <strong>10 minutes</strong> until frothy.<br><strong>2. Combine:</strong> Combine the foamy yeast slurry with the remaining measured water (total ${addedWaterGrams}g at ${targetWaterTemp}).`;
      s2Timers = [{ time: 600, label: 'Active Dry Yeast Bloom (10 min)', text: 'Set 10m Yeast Bloom Timer' }];
      s2PrintDesc = `Bloom ${yeastGrams}g active dry yeast in ~50ml warm water (${isC ? '38°C–41°C' : '100°F–105°F'}) for 10 min until frothy. Mix with remaining water (total ${addedWaterGrams}g).`;
      s2CopyDesc = `2. Bloom active dry yeast in warm water 10 min; mix with remaining water.`;
    } else if (f.yeastType === 'fresh') {
      s2Title = 'Dissolve Fresh Cake Yeast in Water';
      s2ScreenDesc = `Crumble <strong>${yeastGrams}g fresh cake yeast</strong> directly into <strong>${addedWaterGrams}g water</strong> (${targetWaterTemp}) and whisk until dissolved.`;
      s2PrintDesc = `Crumble ${yeastGrams}g fresh yeast into ${addedWaterGrams}g water (${targetWaterTemp}) and whisk until dissolved.`;
      s2CopyDesc = `2. Dissolve fresh yeast directly in water.`;
    } else {
      s2Title = 'Measure Water & Add Instant Dry Yeast';
      s2ScreenDesc = `Whisk <strong>${yeastGrams}g Instant Dry Yeast (IDY)</strong> directly into the dry flour blend. Measure <strong>${addedWaterGrams}g water</strong> (${targetWaterTemp}). ${isSameDay ? 'Lukewarm water jump-starts yeast for same-day room temperature fermentation.' : 'Using cool tap water controls mixer friction heat for slow cold fermentation in the fridge!'}`;
      s2PrintDesc = `Whisk ${yeastGrams}g instant yeast into the dry flour. Measure ${addedWaterGrams}g water (${targetWaterTemp}).`;
      s2CopyDesc = `2. Add instant yeast to dry flours; pour in water (${targetWaterTemp}).`;
    }

    // STEP 3: Hydration Rest & Olive Oil Incorporation
    let s3Phase = 'Hydration Rest & Oil', s3Title = 'Mix Shaggy Mass, Rest 10m & Stream Olive Oil', s3ScreenDesc, s3Timers = [], s3PrintDesc, s3CopyDesc;
    const oilAmountText = f.includeOil && oilGrams > 0 ? `<strong>${oilGrams}g Extra Virgin Olive Oil</strong> (${formatOilVolume(oilGrams)})` : 'no added oil';
    const oilPrintText = f.includeOil && oilGrams > 0 ? `${oilGrams}g Extra Virgin Olive Oil (${formatOilVolume(oilGrams)})` : 'no added oil';
    s3ScreenDesc = `Pour the water into the dry flour mixture. Stir with a wooden spoon or mixer paddle on lowest speed for 1 to 2 minutes until a rough, shaggy mass forms with no dry flour pockets.<br><strong>10-Minute Hydration Rest:</strong> Cover bowl and rest undisturbed for <strong>10 minutes</strong>. This allows high-protein flour proteins to hydrate naturally without machine heat.<br><strong>Oil Incorporation:</strong> Drizzle in ${oilAmountText}. <em>Pizza Lab note:</em> Adding oil *after* initial hydration prevents fat from coating dry flour particles, ensuring full gluten network development!`;
    s3Timers = [{ time: 600, label: 'Hydration Rest (10 min)', text: 'Set 10m Rest Timer' }];
    s3PrintDesc = `Stir water into flour until shaggy. Cover and rest 10 min. Drizzle in ${oilPrintText}. Adding oil after hydration maximizes gluten strength.`;
    s3CopyDesc = `3. Mix shaggy dough, rest 10 min, then stream in olive oil.`;

    // STEP 4: Kneading to Windowpane
    let s4Phase = 'Gluten Development', s4Title = 'Knead until Smooth & Elastic', s4ScreenDesc, s4Timers = [], s4PrintDesc, s4CopyDesc;
    s4ScreenDesc = `<strong>Stand Mixer (Dough Hook):</strong> Knead on Speed 2 (medium-low) for <strong>6 to 8 minutes</strong>. The dough will gather around the hook, clear the sides of the bowl, and become smooth and satiny.<br><strong>Hand Kneading:</strong> Turn dough onto an unfloured clean counter. Knead firmly with heels of hands for <strong>8 to 10 minutes</strong> using steady push-fold-turn motion.<br><strong>Windowpane Test:</strong> Pinch off a small piece of dough and gently stretch it between your thumbs and index fingers. It should stretch thin enough to see light pass through without immediately tearing.`;
    s4Timers = [
      { time: 360, label: 'Stand Mixer Knead (6 min)', text: 'Set 6m Mixer Knead' },
      { time: 480, label: 'Stand Mixer Knead (8 min)', text: 'Set 8m Mixer Knead' },
      { time: 600, label: 'Hand Knead (10 min)', text: 'Set 10m Hand Knead' }
    ];
    s4PrintDesc = `Knead 6–8 min in stand mixer (Speed 2) or 8–10 min by hand until dough clears bowl and forms a supple, smooth ball. Test for translucent windowpane.`;
    s4CopyDesc = `4. Knead 6-8 min mixer (or 8-10 min hand) until smooth, passing windowpane test.`;

    // STEP 5: Bulk Rest / Rise & Balling
    let s5Phase, s5Title, s5ScreenDesc, s5Meta = null, s5Timers = [], s5PrintDesc, s5CopyDesc;
    if (isSameDay) {
      s5Phase = 'Primary Bulk Rise';
      if (f.yeastType === 'sourdough') {
        s5Title = 'Primary Sourdough Bulk Rise as One Mass (4–5 hrs)';
        s5ScreenDesc = `Cover the kneaded dough mass with a damp cloth or bowl and let rise undisturbed at room temperature (${isC ? '22°C to 25°C' : '72°F to 78°F'}) for <strong>4 to 5 hours</strong> until aerated, pillowy, and roughly doubled. <em>Do not divide yet:</em> bulk fermenting as a single mass builds optimal lactic acidity and uniform gas structure.`;
        s5Timers = [
          { time: 14400, label: 'Sourdough Bulk (4 hrs)', text: 'Set 4 hr Bulk Timer' },
          { time: 18000, label: 'Sourdough Bulk (5 hrs)', text: 'Set 5 hr Bulk Timer' }
        ];
        s5PrintDesc = `Cover dough mass and bulk-rise at room temperature (${isC ? '22°C–25°C' : '72°F–78°F'}) for 4–5 hrs until doubled. Do not divide yet.`;
        s5CopyDesc = `5. Primary bulk rise as one mass at room temp for 4-5 hrs until doubled.`;
      } else {
        s5Title = 'Primary Bulk Rise as One Mass (1.5–2 hrs)';
        s5ScreenDesc = `Cover the kneaded dough mass with a damp cloth or bowl and let rise undisturbed at room temperature (${isC ? '21°C to 24°C' : '70°F to 75°F'}) for <strong>1.5 to 2 hours</strong> until aerated, pillowy, and roughly doubled. <em>Do not divide yet:</em> bulk fermenting as a single mass builds superior flavor and gas retention.`;
        s5Timers = [
          { time: 5400, label: 'Same-Day Bulk (1.5 hrs)', text: 'Set 1.5 hr Bulk Timer' },
          { time: 7200, label: 'Same-Day Bulk (2 hrs)', text: 'Set 2 hr Bulk Timer' }
        ];
        s5PrintDesc = `Cover dough mass and bulk-rise at room temperature (${isC ? '21°C–24°C' : '70°F–75°F'}) for 1.5–2 hrs until doubled. Do not divide yet.`;
        s5CopyDesc = `5. Primary bulk rise as one mass at room temp for 1.5-2 hrs until doubled.`;
      }
    } else if (f.yeastType === 'sourdough') {
      s5Phase = 'Ambient Bulk & Balling';
      s5Title = 'Room-Temperature Bulk Rise (3–4 hrs) & Balling';
      s5ScreenDesc = `Cover the kneaded dough mass and let bulk-rise at room temperature (${isC ? '22°C to 25°C' : '72°F to 78°F'}) for <strong>3 to 4 hours</strong> until noticeably aerated and risen by about 30%–50%. <em>Why this matters:</em> Wild sourdough ferments sluggishly at fridge temperatures; this warm ambient head start is essential to establish fermentation before the cold retard!<br><strong>Divide & Ball:</strong> Divide dough into <strong>${pies} equal portions</strong> (~<strong>${perPie}g each</strong>, sized for ${pizzaSizeInfo.name}). Cup hands and drag across counter to build taut surface tension, pinching bottom seams tightly closed.`;
      s5Timers = [
        { time: 10800, label: 'Sourdough Room Bulk (3 hrs)', text: 'Set 3 hr Bulk Timer' },
        { time: 14400, label: 'Sourdough Room Bulk (4 hrs)', text: 'Set 4 hr Bulk Timer' }
      ];
      s5Meta = `<span class="meta-tag">${pies} Balls × ~${perPie}g</span><span class="meta-tag">Target: ${pizzaSizeInfo.name}</span><span class="meta-tag">Pinch bottom seam tight</span>`;
      s5PrintDesc = `Let dough bulk-rise covered at room temp (${isC ? '22°C–25°C' : '72°F–78°F'}) for 3–4 hrs (until risen ~30%–50%) before balling. Divide into ${pies} balls (~${perPie}g each), ball with tight surface tension, seal bottom seams.`;
      s5CopyDesc = `5. Bulk rise dough at room temp 3-4 hrs (until up ~30-50%). Divide into ${pies} balls (~${perPie}g each), roll tight surface tension, seal seams.`;
    } else {
      s5Phase = 'Bulk Rest & Balling';
      s5Title = `Rest 20m & Shape ${pies} Dough Balls`;
      s5ScreenDesc = `Cover the kneaded dough with an inverted bowl or damp towel and let rest at room temperature for <strong>20 minutes</strong> (this relaxes the tight gluten matrix from kneading, making balling effortless).<br><strong>Divide & Ball:</strong> Divide dough into <strong>${pies} equal portions</strong> (~<strong>${perPie}g each</strong>, sized for ${pizzaSizeInfo.name}).<br><strong>Tension Balling Technique:</strong> Cup your hands around each dough piece, dragging it across the counter in small circles to create high surface tension on the smooth top skin. Pinch the bottom seam tightly closed so gas doesn't escape.`;
      s5Timers = [{ time: 1200, label: 'Post-Knead Bench Rest (20 min)', text: 'Set 20m Bench Rest' }];
      s5Meta = `<span class="meta-tag">${pies} Balls × ~${perPie}g</span><span class="meta-tag">Target: ${pizzaSizeInfo.name}</span><span class="meta-tag">Pinch bottom seam tight</span>`;
      s5PrintDesc = `Rest covered dough 20 min. Divide into ${pies} portions (~${perPie}g each). Cup hands and drag across counter to build taut surface tension, pinching bottom seam closed.`;
      s5CopyDesc = `5. Rest dough 20 min. Divide into ${pies} balls (~${perPie}g each), roll tight surface tension, seal bottom seams.`;
    }

    // STEP 6: Fermentation (Cold Retard or Same-Day Divide & Ball)
    let s6Phase, s6Title, s6ScreenDesc, s6Meta = null, s6Timers = [], s6PrintDesc, s6CopyDesc;
    if (isSameDay) {
      s6Phase = 'Divide & Ball';
      s6Title = `Divide & Shape ${pies} Dough Balls`;
      s6ScreenDesc = `Turn the bulk-risen dough onto a clean counter. Divide dough into <strong>${pies} equal portions</strong> (~<strong>${perPie}g each</strong>, sized for ${pizzaSizeInfo.name}).<br><strong>Tension Balling Technique:</strong> Cup your hands around each dough piece, dragging it across the counter in small circles to create high surface tension on the smooth top skin. Pinch bottom seams tightly closed so gas doesn't escape. Place shaped balls into lightly oiled individual containers or a proofing tray.`;
      s6Meta = `<span class="meta-tag">${pies} Balls × ~${perPie}g</span><span class="meta-tag">Target: ${pizzaSizeInfo.name}</span><span class="meta-tag">Pinch bottom seam tight</span>`;
      s6PrintDesc = `Divide bulk-risen dough into ${pies} portions (~${perPie}g each). Cup hands and roll with taut surface tension, pinching bottom seams closed.`;
      s6CopyDesc = `6. Divide dough into ${pies} balls (~${perPie}g each), roll tight surface tension, seal bottom seams.`;
    } else {
      s6Phase = 'Cold Fermentation';
      const is48hMax = f.yeastType === 'sourdough' || f.yeastType === 'fresh';
      s6Title = is48hMax ? 'Cold Fermentation in Refrigerator (24–48 hrs)' : 'Cold Fermentation in Refrigerator (24–72 hrs)';
      s6ScreenDesc = `Lightly oil individual round airtight containers with olive oil. Place each dough ball inside seam-side down. Mist tops lightly with oil and seal airtight.<br><strong>Refrigerate at ${isC ? '2°C to 4°C' : '36°F to 39°F'} (${yeastDef.coldFermentDesc}):</strong><br>
      • <strong>24 Hours:</strong> Good baseline New York flavor and solid stretchability.<br>
      • <strong>48 Hours (Pizza Lab Sweet Spot):</strong> Peak balance of sweet complex wheat flavor, supple elasticity, and delicate micro-blistering.${!is48hMax ? '<br>• <strong>72 Hours:</strong> Maximum acidity, sourdough-like nuance, and ultra-tender cornicione loft.' : ''}`;
      s6Timers = [
        { time: 86400, label: 'Cold Ferment (24 Hours)', text: 'Set 24 hr Cold Ferment Timer' },
        { time: 172800, label: 'Cold Ferment (48 Hours)', text: 'Set 48 hr Cold Ferment Timer' }
      ];
      if (!is48hMax) {
        s6Timers.push({ time: 259200, label: 'Cold Ferment (72 Hours)', text: 'Set 72 hr Cold Ferment Timer' });
      }
      s6PrintDesc = `Place dough balls in lightly oiled airtight containers. Cold ferment in refrigerator (${isC ? '2°C–4°C' : '36°F–39°F'}) for ${is48hMax ? '24 to 48 hours' : '24 to 72 hours (48 hrs optimal)'}.`;
      s6CopyDesc = `6. Cold ferment in oiled airtight containers in fridge (${isC ? '2°C–4°C' : '36°F–39°F'}) for ${is48hMax ? '24-48 hours' : '24-72 hours'}.`;
    }

    // STEP 7: Room Temperature Tempering (or Pan Proof)
    let s7Phase, s7Title, s7ScreenDesc, s7Timers = [], s7PrintDesc, s7CopyDesc;
    if (surface === 'pan') {
      s7Phase = 'Pan Press & Proof';
      const panProofDuration = f.yeastType === 'sourdough' ? '2–3 hrs' : (isSameDay ? '1.5–2 hrs' : '2–3 hrs');
      s7Title = `Pan Press & Pan Proof (${panProofDuration})`;
      s7ScreenDesc = `<strong>Direct Pan Setup:</strong> Generously oil your 14"–16" round pizza pan with 2 to 3 tbsp extra virgin olive oil. Transfer dough directly into the oiled pan ${!isSameDay ? 'straight from the fridge (or after a 20–30 minute rest to take the chill off)' : ''}.<br><strong>Press & Dimple:</strong> Gently press dough outward with your fingertips toward edges. If dough resists and springs back, let it rest 10 minutes and press again until it reaches pan edges.<br><strong>The Pan Proof:</strong> Cover the pan and let proof undisturbed at room temperature for <strong>${panProofDuration}</strong> until thick, aerated, and puffy. This single generous pan proof replaces separate ball warm-up and gives pan pizza its light, airy, golden-crisp crumb!<br><em>Baker's note on pan crust thickness:</em> A standard ~${perPie}g ball produces a crisp, medium-thin pan crust. For a traditional thick-crust bakery Sicilian or Detroit-style bite in a 14" round pan, use 400g–450g of dough.`;
      if (f.yeastType === 'sourdough' || !isSameDay) {
        s7Timers = [
          { time: 7200, label: 'Pan Proof (2 hrs)', text: 'Set 2 hr Pan Proof Timer' },
          { time: 10800, label: 'Pan Proof (3 hrs)', text: 'Set 3 hr Pan Proof Timer' }
        ];
      } else {
        s7Timers = [
          { time: 5400, label: 'Pan Proof (90 min)', text: 'Set 90m Pan Proof Timer' },
          { time: 7200, label: 'Pan Proof (120 min)', text: 'Set 120m Pan Proof Timer' }
        ];
      }
      s7PrintDesc = `Transfer dough into oiled 14"–16" pan. Press to edges (resting 10m if needed). Cover and proof in pan for ${panProofDuration} until puffy. (For thick crust, use 400–450g dough).`;
      s7CopyDesc = `7. Transfer dough to oiled pan, press to edges, cover and proof at room temp ${panProofDuration} until thick and puffy.`;
    } else if (isSameDay) {
      s7Phase = 'Ball Proof & Relaxation';
      if (f.yeastType === 'sourdough') {
        s7Title = 'Sourdough Ball Proof & Relaxation (2 hrs)';
        s7ScreenDesc = `Let shaped sourdough balls proof undisturbed in lightly oiled covered containers or a proofing tray for <strong>2 hours</strong> at room temperature. The wild gluten relaxes completely so the dough stretches paper-thin without snapping back. (Total same-day fermentation: ~6–7 hours).`;
        s7Timers = [{ time: 7200, label: 'Sourdough Ball Proof (2 hrs)', text: 'Set 2 hr Proof Timer' }];
        s7PrintDesc = `Let sourdough balls proof covered at room temperature for 2 hours to relax gluten before stretching.`;
        s7CopyDesc = `7. Proof sourdough balls covered at room temp for 2 hours until relaxed.`;
      } else {
        s7Title = 'Ball Proof & Gluten Relaxation (1–1.5 hrs)';
        s7ScreenDesc = `Let shaped dough balls proof undisturbed in lightly oiled covered containers or a proofing tray for <strong>1 to 1.5 hours</strong> at room temperature. The gluten relaxes completely so the dough stretches paper-thin without snapping back. (Total same-day fermentation: ~2.5–3.5 hours).`;
        s7Timers = [
          { time: 3600, label: 'Ball Proof (60 min)', text: 'Set 60m Proof Timer' },
          { time: 5400, label: 'Ball Proof (90 min)', text: 'Set 90m Proof Timer' }
        ];
        s7PrintDesc = `Let dough balls proof covered at room temperature for 1–1.5 hours to relax gluten before stretching.`;
        s7CopyDesc = `7. Proof dough balls covered at room temp for 1-1.5 hours until relaxed.`;
      }
    } else {
      s7Phase = 'Room Tempering';
      const temperDuration = f.yeastType === 'sourdough' ? '2–3 hrs' : (f.yeastType === 'fresh' ? '60–90 min' : '90–120 min');
      s7Title = `Warm Dough to Room Temp (${temperDuration})`;
      s7ScreenDesc = `<strong>CRUCIAL NEW YORK RULE:</strong> Remove dough containers from the refrigerator <strong>${yeastDef.roomTemperDesc}</strong> so dough warms to approximately <strong class="temp-val" data-f="65">${isC ? '18°C' : '65°F'}</strong>.<br><em>Why this matters:</em> Cold gluten contracts aggressively and snaps back. Warming the dough allows the gluten network to completely relax, giving you that iconic paper-thin New York stretch without tearing! Keep containers sealed so balls do not dry out.`;
      if (f.yeastType === 'sourdough') {
        s7Timers = [
          { time: 7200, label: 'Room Tempering (2 hrs)', text: 'Set 2 hr Tempering Timer' },
          { time: 10800, label: 'Room Tempering (3 hrs)', text: 'Set 3 hr Tempering Timer' }
        ];
      } else if (f.yeastType === 'fresh') {
        s7Timers = [
          { time: 3600, label: 'Room Tempering (60 min)', text: 'Set 60m Tempering Timer' },
          { time: 5400, label: 'Room Tempering (90 min)', text: 'Set 90m Tempering Timer' }
        ];
      } else {
        s7Timers = [
          { time: 5400, label: 'Room Tempering (90 min)', text: 'Set 90m Tempering Timer' },
          { time: 7200, label: 'Room Tempering (120 min)', text: 'Set 120m Tempering Timer' }
        ];
      }
      s7PrintDesc = `Remove dough containers from fridge ${yeastDef.roomTemperDesc} to warm to ~${isC ? '18°C' : '65°F'}. Cold dough snaps back and tears; warm dough stretches effortlessly.`;
      s7CopyDesc = `7. Temper dough balls at room temperature ${yeastDef.roomTemperDesc} before stretching (warm to ~${isC ? '18°C' : '65°F'}).`;
    }

    // STEP 8: Oven & Surface Setup Preheat
    let s8Phase = 'Oven Setup', s8Title, s8ScreenDesc, s8Timers = [], s8PrintDesc, s8CopyDesc;
    if (surface === 'steel') {
      s8Title = 'Preheat Baking Steel at Max Temp (45–60 min)';
      s8ScreenDesc = `Place your heavy 1/4" or 3/8" baking steel (or thick baking stone) on the top or second-to-top rack of your oven (approx. 6–7 inches below the broiler element). Preheat oven to its absolute maximum setting: <strong class="temp-val" data-f="550">${isC ? '260°C to 288°C' : '500°F to 550°F'}</strong> for <strong>45 to 60 minutes</strong>. The dense steel saturates with thermal energy to blister the crust instantly upon contact.`;
      s8Timers = [
        { time: 2700, label: 'Steel Preheat (45 min)', text: 'Set 45m Preheat Timer' },
        { time: 3600, label: 'Steel Preheat (60 min)', text: 'Set 60m Preheat Timer' }
      ];
      s8PrintDesc = `Place baking steel on upper rack (6–7" below broiler) and preheat oven to max temp (${isC ? '260°C–288°C' : '500°F–550°F'}) for 45–60 minutes.`;
      s8CopyDesc = `8. Preheat baking steel on top rack at ${isC ? '260°C–288°C' : '500°F–550°F'} for 45-60 min.`;
    } else if (surface === 'pan') {
      s8Title = 'Preheat Oven for Pan Pizza (30 min)';
      s8ScreenDesc = `Position oven rack in bottom third of the oven. Preheat oven to <strong class="temp-val" data-f="500">${isC ? '260°C' : '500°F'}</strong> for <strong>30 minutes</strong> during the final 30 minutes of your pan proof.`;
      s8Timers = [{ time: 1800, label: 'Pan Oven Preheat (30 min)', text: 'Set 30m Preheat Timer' }];
      s8PrintDesc = `Preheat oven to ${isC ? '260°C' : '500°F'} for 30 min with rack in bottom third.`;
      s8CopyDesc = `8. Preheat oven to ${isC ? '260°C' : '500°F'} (30 min) with rack in bottom third.`;
    } else {
      const hasHighSugar = f.includeSugar && f.sugarGrams > 0 && f.sugarPct > 0.5;
      if (hasHighSugar) {
        s8Title = `Preheat Outdoor Pizza Oven (${isC ? '315°C–343°C' : '600°F–650°F'})`;
        const outdoorModFloor = isC ? '315°C to 343°C' : '600°F to 650°F';
        s8ScreenDesc = `Fire up outdoor pizza oven (Ooni/Gozney) to <strong class="temp-val" data-f="600-650">${outdoorModFloor}</strong> floor temperature (measured with infrared thermometer). With ${f.sugarPct}% sugar and ${f.oilPct}% oil in this NY dough, moderating the floor to ${outdoorModFloor} prevents scorching the bottom before the cheese melts. Once preheated, turn flame down to low setting for an even 4–5 minute New York style bake pace.`;
        s8PrintDesc = `Preheat outdoor oven floor to ${isC ? '315°C–343°C' : '600°F–650°F'}. Turn flame to low before launch to prevent scorching sugar/oil.`;
        s8CopyDesc = `8. Preheat outdoor oven floor to ${isC ? '315°C–343°C' : '600°F–650°F'}; turn flame to low before launch.`;
      } else {
        s8Title = `Preheat Outdoor Pizza Oven (${isC ? '343°C–371°C' : '650°F–700°F'})`;
        s8ScreenDesc = `Fire up outdoor pizza oven (Ooni/Gozney) to <strong class="temp-val" data-f="650-700">${isC ? '343°C to 371°C' : '650°F to 700°F'}</strong> floor temperature (measured with infrared thermometer). With low/zero sugar, this lean dough handles high outdoor heat. Once preheated, turn flame down to low setting so top heat matches NY style bake pace without charring too fast.`;
        s8PrintDesc = `Preheat outdoor oven floor to ${isC ? '343°C–371°C' : '650°F–700°F'}. Turn flame to low before launch for even NY baking.`;
        s8CopyDesc = `8. Preheat outdoor oven floor to ${isC ? '343°C–371°C' : '650°F–700°F'}; turn flame to low before launch.`;
      }
      s8Timers = [{ time: 1800, label: 'Outdoor Oven Preheat (30 min)', text: 'Set 30m Preheat Timer' }];
    }

    // STEP 9: Stretch, Launch, Bake & Wire Rack Rest
    let s9Phase = 'Stretch, Bake & Rest', s9Title, s9ScreenDesc, s9Timers = [], s9PrintDesc, s9CopyDesc;
    if (surface === 'steel') {
      s9Title = 'Knuckle Stretch, Sauce, Steel Bake & Wire Rack Rest';
      s9ScreenDesc = `<strong>1. Open Dough:</strong> Dust counter with a 50/50 mix of semolina and bread flour. Drop dough ball into flour. Press out with fingertips from center outward, leaving a 1/2" puffed rim (cornicione). Never use a rolling pin! Flip onto the backs of your hands and gently stretch using knuckles until ~<strong>${pizzaSizeInfo.size}" diameter</strong>.<br><strong>2. Peel & Topping:</strong> Transfer to a lightly dusted wooden peel. <em>Shake the peel</em> to verify dough slides freely! Ladle ~<strong>${saucePerPie}g</strong> crushed uncooked San Marzano tomatoes, top with ~<strong>${cheesePerPie}g</strong> whole-milk low-moisture mozzarella, a drizzle of olive oil, and pecorino romano.<br><strong>3. Steel Launch & Bake:</strong> Shimmy pie onto screaming hot steel. Bake for <strong>5 to 7 minutes</strong>. (Turn on oven broiler for final 1–2 minutes for charred blistered spots!).<br><strong>4. Wire Rack Rest (2 min):</strong> Transfer immediately to a wire cooling rack for 2 minutes before slicing. <em>Crucial step:</em> Elevating on a wire rack lets steam dissipate without turning the bottom crust soggy, ensuring that signature crispy New York fold!`;
      s9Timers = [
        { time: 300, label: 'Steel Bake Check (5 min)', text: 'Set 5m Bake Timer' },
        { time: 420, label: 'Steel Bake Check (7 min)', text: 'Set 7m Bake Timer' },
        { time: 120, label: 'Wire Rack Steam Rest (2 min)', text: 'Set 2m Rack Rest Timer' }
      ];
      s9PrintDesc = `Press dough center out leaving 1/2" cornicione. Knuckle stretch to ${pizzaSizeInfo.size}". Test slide on dusted peel. Top with ~${saucePerPie}g crushed tomatoes, ~${cheesePerPie}g low-moisture whole milk mozzarella, pecorino. Launch onto steel; bake 5–7 min (broiler for final 1–2m). Rest on wire cooling rack 2 min before slicing.`;
      s9CopyDesc = `9. Knuckle stretch to ${pizzaSizeInfo.size}", top (~${saucePerPie}g sauce, ~${cheesePerPie}g cheese), peel-shake test, bake on steel 5-7 min (broiler assist final 1-2m). Rest 2 min on wire rack before slicing.`;
    } else if (surface === 'pan') {
      s9Title = 'Top, Pan Bake (12–15 min) & Wire Rack Rest';
      s9ScreenDesc = `<strong>1. Dimple & Top:</strong> Gently dimple the puffy proofed dough one last time with oiled fingertips. Spread ~<strong>${saucePerPie}g</strong> sauce right up to the edges, distribute ~<strong>${cheesePerPie}g</strong> mozzarella evenly.<br><strong>2. Pan Bake:</strong> Bake in pan on bottom oven rack at <strong class="temp-val" data-f="500">${isC ? '260°C' : '500°F'}</strong> for <strong>12 to 15 minutes</strong> until bottom is golden crisp and cheese is bubbly and browned.<br><strong>3. Wire Rack Rest (3 min):</strong> Use a spatula to immediately transfer pizza onto a wire cooling rack for <strong>3 minutes</strong> so steam does not trap under the crust. Slice and enjoy!`;
      s9Timers = [
        { time: 720, label: 'Pan Bake Check (12 min)', text: 'Set 12m Pan Bake Timer' },
        { time: 900, label: 'Pan Bake Check (15 min)', text: 'Set 15m Pan Bake Timer' },
        { time: 180, label: 'Wire Rack Rest (3 min)', text: 'Set 3m Rack Rest Timer' }
      ];
      s9PrintDesc = `Dimple proofed dough. Top with ~${saucePerPie}g sauce to edges and ~${cheesePerPie}g cheese. Bake on bottom rack at ${isC ? '260°C' : '500°F'} for 12–15 min until crispy underneath. Transfer immediately to wire rack for 3 min before slicing.`;
      s9CopyDesc = `9. Top with ~${saucePerPie}g sauce and ~${cheesePerPie}g cheese, bake on bottom rack at ${isC ? '260°C' : '500°F'} for 12-15 min. Rest 3 min on wire rack.`;
    } else {
      const hasHighSugar = f.includeSugar && f.sugarGrams > 0 && f.sugarPct > 0.5;
      if (hasHighSugar) {
        s9Title = 'Stretch, Outdoor Launch & Rotate (4–5 min)';
        s9ScreenDesc = `<strong>1. Open & Stretch:</strong> Dust peel with semolina, knuckle stretch dough to ~<strong>${pizzaSizeInfo.size}"</strong>, verify slide on peel, top with ~<strong>${saucePerPie}g</strong> sauce and ~<strong>${cheesePerPie}g</strong> cheese.<br><strong>2. Launch & Rotate:</strong> Launch onto <strong class="temp-val" data-f="600-650">${isC ? '315°C to 343°C' : '600°F to 650°F'}</strong> stone. Turn flame to lowest flame setting. Rotate 90° every 45–60 seconds using a turning peel. Bake takes <strong>4 to 5 minutes</strong> total.<br><strong>3. Wire Rack Rest:</strong> Transfer directly to wire rack for <strong>2 minutes</strong> to set the crust before slicing!`;
        s9Timers = [
          { time: 45, label: 'First Rotation Check (45 sec)', text: 'Set 45s Turn Timer' },
          { time: 240, label: 'Outdoor Bake Check (4 min)', text: 'Set 4m Bake Timer' },
          { time: 300, label: 'Outdoor Bake Total (5 min)', text: 'Set 5m Bake Timer' },
          { time: 120, label: 'Wire Rack Rest (2 min)', text: 'Set 2m Rack Rest Timer' }
        ];
        s9PrintDesc = `Knuckle stretch to ${pizzaSizeInfo.size}", top (~${saucePerPie}g sauce, ~${cheesePerPie}g cheese), launch into ${isC ? '315°C–343°C' : '600°F–650°F'} oven on low flame. Rotate every 45–60s; bake 4–5 min. Rest on wire rack 2 min before slicing.`;
        s9CopyDesc = `9. Knuckle stretch to ${pizzaSizeInfo.size}", launch into ${isC ? '315°C–343°C' : '600°F–650°F'} oven on low flame, rotate every 45-60s for 4-5 min. Rest 2 min on wire rack.`;
      } else {
        s9Title = 'Stretch, Outdoor Launch & Rotate (3–4 min)';
        s9ScreenDesc = `<strong>1. Open & Stretch:</strong> Dust peel with semolina, knuckle stretch dough to ~<strong>${pizzaSizeInfo.size}"</strong>, verify slide on peel, top with ~<strong>${saucePerPie}g</strong> sauce and ~<strong>${cheesePerPie}g</strong> cheese.<br><strong>2. Launch & Rotate:</strong> Launch onto <strong class="temp-val" data-f="650-700">${isC ? '343°C to 371°C' : '650°F to 700°F'}</strong> stone. Turn flame to lowest flame setting. Rotate 90° every 45–60 seconds using a turning peel. Bake takes <strong>3 to 4 minutes</strong> total.<br><strong>3. Wire Rack Rest:</strong> Transfer directly to wire rack for <strong>2 minutes</strong> to set the crust before slicing!`;
        s9Timers = [
          { time: 45, label: 'First Rotation Check (45 sec)', text: 'Set 45s Turn Timer' },
          { time: 180, label: 'Outdoor Bake Total (3 min)', text: 'Set 3m Bake Timer' },
          { time: 120, label: 'Wire Rack Rest (2 min)', text: 'Set 2m Rack Rest Timer' }
        ];
        s9PrintDesc = `Knuckle stretch to ${pizzaSizeInfo.size}", top (~${saucePerPie}g sauce, ~${cheesePerPie}g cheese), launch into ${isC ? '343°C–371°C' : '650°F–700°F'} oven on low flame. Rotate every 45–60s; bake 3–4 min. Rest on wire rack 2 min before slicing.`;
        s9CopyDesc = `9. Knuckle stretch to ${pizzaSizeInfo.size}", launch into ${isC ? '343°C–371°C' : '650°F–700°F'} oven on low flame, rotate every 45-60s for 3-4 min. Rest 2 min on wire rack.`;
      }
    }

    return [
      { num: 1, phase: s1Phase, title: s1Title, screenDesc: s1ScreenDesc, timers: s1Timers, meta: null, printDesc: s1PrintDesc, copyDesc: s1CopyDesc },
      { num: 2, phase: s2Phase, title: s2Title, screenDesc: s2ScreenDesc, timers: s2Timers, meta: null, printDesc: s2PrintDesc, copyDesc: s2CopyDesc },
      { num: 3, phase: s3Phase, title: s3Title, screenDesc: s3ScreenDesc, timers: s3Timers, meta: null, printDesc: s3PrintDesc, copyDesc: s3CopyDesc },
      { num: 4, phase: s4Phase, title: s4Title, screenDesc: s4ScreenDesc, timers: s4Timers, meta: null, printDesc: s4PrintDesc, copyDesc: s4CopyDesc },
      { num: 5, phase: s5Phase, title: s5Title, screenDesc: s5ScreenDesc, timers: s5Timers, meta: s5Meta, printDesc: s5PrintDesc, copyDesc: s5CopyDesc },
      { num: 6, phase: s6Phase, title: s6Title, screenDesc: s6ScreenDesc, timers: s6Timers, meta: s6Meta, printDesc: s6PrintDesc, copyDesc: s6CopyDesc },
      { num: 7, phase: s7Phase, title: s7Title, screenDesc: s7ScreenDesc, timers: s7Timers, meta: null, printDesc: s7PrintDesc, copyDesc: s7CopyDesc },
      { num: 8, phase: s8Phase, title: s8Title, screenDesc: s8ScreenDesc, timers: s8Timers, meta: null, printDesc: s8PrintDesc, copyDesc: s8CopyDesc },
      { num: 9, phase: s9Phase, title: s9Title, screenDesc: s9ScreenDesc, timers: s9Timers, meta: null, printDesc: s9PrintDesc, copyDesc: s9CopyDesc }
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
    const pies = Math.max(1, Math.round(sanitizeNumber(currentState.pies, NY_DEFAULTS.pies)));
    const pizzaSizeKey = currentState.pizzaSize || NY_DEFAULTS.pizzaSize;
    const pizzaSizeInfo = PIZZA_SIZES[pizzaSizeKey] || PIZZA_SIZES['14'];
    const ballWeight = sanitizeNumber(currentState.ballWeight, pizzaSizeInfo.targetBallWeight);
    const fermentStyle = currentState.fermentStyle || 'cold';

    const specialtyPct = Math.min(50, Math.max(0, sanitizeNumber(currentState.specialtyPct, 0)));
    const grain = GRAIN_DEFINITIONS[currentState.specialtyGrain] || GRAIN_DEFINITIONS.semolina;
    const recommendedBump = specialtyPct > 0 ? Math.round(specialtyPct * grain.extraWaterPerPct * 10) / 10 : 0;

    let effectiveHydrationPct;
    if (currentState.autoAdjustHydration) {
      const baseH = sanitizeNumber(currentState.baseHydrationPct, NY_DEFAULTS.hydrationPct);
      effectiveHydrationPct = Math.min(75, Math.max(55, Math.round((baseH + recommendedBump) * 10) / 10));
    } else {
      effectiveHydrationPct = Math.min(75, Math.max(55, sanitizeNumber(currentState.hydrationPct, NY_DEFAULTS.hydrationPct)));
    }

    const saltPct = sanitizeNumber(currentState.saltPct, NY_DEFAULTS.saltPct);
    
    // Yeast percentage: In cold ferment default is 0.35%; in same-day default is 0.85%
    const baselineYeastPct = (fermentStyle === 'same_day') ? 0.85 : 0.35;
    let yeastPct = baselineYeastPct;
    if (currentState.yeastPct !== undefined && currentState.yeastPct !== null) {
      if (fermentStyle === 'same_day' && currentState.yeastPct === NY_DEFAULTS.yeastPct) {
        yeastPct = 0.85;
      } else {
        yeastPct = sanitizeNumber(currentState.yeastPct, baselineYeastPct);
      }
    }

    const oilPct = (currentState.includeOil !== false) ? sanitizeNumber(currentState.oilPct, NY_DEFAULTS.oilPct) : 0;
    const sugarPct = (currentState.includeSugar !== false) ? sanitizeNumber(currentState.sugarPct, NY_DEFAULTS.sugarPct) : 0;

    const saltDef = SALT_DEFINITIONS[currentState.saltType] || SALT_DEFINITIONS.table;
    const yeastDef = LEAVENING_DEFINITIONS[currentState.yeastType] || LEAVENING_DEFINITIONS.instant;
    const sugarTypeDef = SUGAR_TYPES[currentState.sugarType] || SUGAR_TYPES.granulated;

    const yeastMultiplier = yeastDef.multiplier;
    const effectiveYeastPct = (currentState.yeastType === 'sourdough') ? 0 : Math.round(yeastPct * yeastMultiplier * 100) / 100;

    let totalFlour;
    let targetTotalDough;

    if (currentState.isDirectFlourInput && currentState.totalFlour) {
      totalFlour = Math.round(sanitizeNumber(currentState.totalFlour, NY_DEFAULTS.totalFlour));
    } else {
      targetTotalDough = pies * ballWeight;
      const sumPct = 1 + (effectiveHydrationPct / 100) + (oilPct / 100) + (saltPct / 100) + (sugarPct / 100) + (effectiveYeastPct / 100);
      totalFlour = Math.round(targetTotalDough / sumPct);
    }

    const totalWaterGrams = Math.round(totalFlour * (effectiveHydrationPct / 100));
    const saltGrams = Math.round(((totalFlour * (saltPct / 100) * 10) + 1e-9)) / 10;
    const oilGrams = Math.round(((totalFlour * (oilPct / 100) * 10) + 1e-9)) / 10;
    const sugarGrams = (currentState.includeSugar !== false) ? Math.round(((totalFlour * (sugarPct / 100) * 10) + 1e-9)) / 10 : 0;

    const specialtyGrams = Math.round(totalFlour * (specialtyPct / 100));
    let breadFlourGrams = 0;
    let starterGrams = 0;
    let starterFlourGrams = 0;
    let starterWaterGrams = 0;
    let addedWaterGrams = totalWaterGrams;
    let yeastGrams = 0;
    let totalDough = 0;

    if (currentState.yeastType === 'sourdough') {
      const starterRate = Math.min(30, Math.max(10, sanitizeNumber(currentState.starterRatePct, 15)));
      starterGrams = Math.round(totalFlour * (starterRate / 100));
      starterFlourGrams = Math.round(starterGrams / 2);
      starterWaterGrams = starterGrams - starterFlourGrams;

      breadFlourGrams = Math.max(0, totalFlour - specialtyGrams - starterFlourGrams);
      addedWaterGrams = Math.max(0, totalWaterGrams - starterWaterGrams);
      yeastGrams = 0;
      totalDough = Math.round(breadFlourGrams + specialtyGrams + starterGrams + addedWaterGrams + saltGrams + oilGrams + sugarGrams);
    } else {
      yeastGrams = Math.round(((totalFlour * (effectiveYeastPct / 100) * 10) + 1e-9)) / 10;
      breadFlourGrams = totalFlour - specialtyGrams;
      addedWaterGrams = totalWaterGrams;
      totalDough = Math.round(totalFlour + addedWaterGrams + saltGrams + oilGrams + yeastGrams + sugarGrams);
    }

    const perPie = Math.round(totalDough / pies);

    return {
      totalFlour,
      specialtyPct,
      grain,
      recommendedBump,
      effectiveHydrationPct,
      saltPct,
      yeastPct,
      effectiveYeastPct,
      oilPct,
      includeOil: (currentState.includeOil !== false) && oilPct > 0,
      sugarPct,
      includeSugar: (currentState.includeSugar !== false) && sugarPct > 0,
      totalWaterGrams,
      saltGrams,
      oilGrams,
      sugarGrams,
      saltDef,
      yeastDef,
      sugarTypeDef,
      specialtyGrams,
      breadFlourGrams,
      starterGrams,
      starterFlourGrams,
      starterWaterGrams,
      addedWaterGrams,
      yeastGrams,
      totalDough,
      pies,
      perPie,
      pizzaSizeInfo,
      bakingSurface: currentState.bakingSurface || 'steel',
      yeastType: currentState.yeastType || 'instant',
      saltType: currentState.saltType || 'table',
      sugarType: currentState.sugarType || 'granulated',
      starterRatePct: currentState.starterRatePct || 15,
      fermentStyle,
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
    const oilPct = f.oilPct;
    const sugarPct = f.sugarPct;
    const totalWaterGrams = f.totalWaterGrams;
    const saltGrams = f.saltGrams;
    const oilGrams = f.oilGrams;
    const sugarGrams = f.sugarGrams;
    const saltDef = f.saltDef;
    const yeastDef = f.yeastDef;
    const sugarDef = f.sugarTypeDef;
    const specialtyGrams = f.specialtyGrams;
    const breadFlourGrams = f.breadFlourGrams;
    const starterGrams = f.starterGrams;
    const starterFlourGrams = f.starterFlourGrams;
    const starterWaterGrams = f.starterWaterGrams;
    const addedWaterGrams = f.addedWaterGrams;
    const effectiveYeastPct = f.effectiveYeastPct;
    const yeastGrams = f.yeastGrams;
    const totalDough = f.totalDough;
    const perPie = f.perPie;
    const pies = f.pies;

    // Toppings scaled dynamically by area
    const areaRatio = Math.pow(f.pizzaSizeInfo.size / 14, 2);
    const saucePerPie = Math.round(115 * areaRatio);
    const cheesePerPie = Math.round(160 * areaRatio);

    // Update DOM inputs and echoes
    if (DOM.flourInput && document.activeElement !== DOM.flourInput) {
      DOM.flourInput.value = totalFlour;
    }
    if (DOM.doughWeightBadge) DOM.doughWeightBadge.textContent = `Total Dough: ${totalDough.toLocaleString()}g`;
    if (DOM.pieWeightBadge) DOM.pieWeightBadge.textContent = `~${perPie}g / ball (${pies} pies)`;
    if (DOM.ballWeightDisplay) DOM.ballWeightDisplay.textContent = `~${perPie}g`;
    if (DOM.stepPiesCount) DOM.stepPiesCount.textContent = pies;
    if (DOM.stepPieGrams) DOM.stepPieGrams.textContent = `${perPie}g`;
    if (DOM.totalFlourEcho) DOM.totalFlourEcho.textContent = `${totalFlour}g`;

    // Topping Guide Callout
    if (DOM.toppingGuideCallout) {
      DOM.toppingGuideCallout.innerHTML = `
        <div class="topping-guide-inner">
          <span class="topping-guide-title">🥫 Estimated Topping Guide (per ${f.pizzaSizeInfo.name}):</span>
          <span class="topping-guide-item">Crushed Tomatoes: <strong>~${saucePerPie}g</strong></span>
          <span class="topping-guide-item">Low-Moisture Mozzarella: <strong>~${cheesePerPie}g</strong></span>
          <span class="topping-guide-item">Total Batch: <strong>~${saucePerPie * pies}g sauce / ~${cheesePerPie * pies}g cheese</strong></span>
        </div>
      `;
    }

    // Specialty Grain UI
    if (DOM.grainPctValue) DOM.grainPctValue.textContent = specialtyPct;
    if (DOM.specialtySlider) DOM.specialtySlider.value = specialtyPct;

    // Ratio progress bar
    const displayBreadFlourPct = Math.round((breadFlourGrams / totalFlour) * 100);
    if (DOM.breadFlourSegment) DOM.breadFlourSegment.style.width = `${displayBreadFlourPct}%`;
    if (DOM.specialtySegment) DOM.specialtySegment.style.width = `${specialtyPct}%`;

    if (DOM.breadFlourSegLabel) {
      if (displayBreadFlourPct > 18) {
        DOM.breadFlourSegLabel.textContent = `Bread Flour: ${displayBreadFlourPct}% (${breadFlourGrams}g)`;
      } else if (displayBreadFlourPct > 0) {
        DOM.breadFlourSegLabel.textContent = `${displayBreadFlourPct}%`;
      } else {
        DOM.breadFlourSegLabel.textContent = '';
      }
    }

    if (DOM.specialtySegLabel) {
      if (specialtyPct > 18) {
        DOM.specialtySegLabel.textContent = `${grain.shortName}: ${specialtyPct}% (${specialtyGrams}g)`;
      } else if (specialtyPct > 0) {
        DOM.specialtySegLabel.textContent = `${specialtyPct}%`;
      } else {
        DOM.specialtySegLabel.textContent = '';
      }
    }

    // Dynamic 10% preset button label reflecting active grain
    const preset10Btn = (DOM.grainPresetButtons ? Array.from(DOM.grainPresetButtons) : []).find(b => b.dataset.pct === '10') || (typeof document !== 'undefined' ? document.querySelector('#grainPresetGroup [data-pct="10"]') : null);
    if (preset10Btn) {
      preset10Btn.textContent = getGrainPresetLabel(grain.id);
    }

    // Auto-hydration hint & badge
    if (DOM.hydrationCompBadge && DOM.autoHydrationHint) {
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
        DOM.autoHydrationHint.textContent = 'Active: adjusts water percentage automatically to compensate for flour thirst';
      } else {
        DOM.hydrationCompBadge.classList.add('hidden');
        DOM.autoHydrationHint.textContent = 'Manual mode: water percentage will not auto-adjust when flour is changed';
      }
    }

    // Advisory Box
    renderGrainAdvisory(f);

    // Hydration Slider & Display
    if (DOM.hydrationValue) DOM.hydrationValue.textContent = hydrationPct.toFixed(1);
    if (DOM.hydrationSlider) DOM.hydrationSlider.value = hydrationPct;

    // Baker Insights
    const insight = getBakerInsight(f, state);
    if (DOM.profileBadge) DOM.profileBadge.textContent = insight.badge;
    if (DOM.profileDifficulty) DOM.profileDifficulty.innerHTML = insight.difficulty;
    if (DOM.profileDescription) DOM.profileDescription.textContent = insight.desc;
    if (DOM.profileTips) DOM.profileTips.innerHTML = insight.tips;

    // Advanced Drawer Controls
    if (DOM.saltPctLabel) DOM.saltPctLabel.textContent = `${saltPct.toFixed(1)}% (${saltGrams}g)`;
    if (DOM.saltDesc) DOM.saltDesc.textContent = `${saltDef.desc} ${saltDef.volumeHelp} (${formatSaltVolume(saltGrams, state.saltType)})`;

    if (DOM.oilPctLabel) DOM.oilPctLabel.textContent = state.includeOil ? `${oilPct.toFixed(1)}% (${oilGrams}g)` : 'Disabled (0g)';
    if (DOM.oilDesc) DOM.oilDesc.textContent = state.includeOil 
      ? `Extra Virgin Olive Oil provides tender crumb, golden crust in home ovens & signature NY fold (${formatOilVolume(oilGrams)}).` 
      : 'Oil omitted: leaner Neapolitan-style chew; crust will be firmer/crispier in 500°F home ovens.';

    if (DOM.yeastPctLabel && DOM.yeastDesc) {
      if (state.yeastType === 'sourdough') {
        if (DOM.sourdoughControls) DOM.sourdoughControls.classList.remove('hidden');
        DOM.yeastPctLabel.textContent = `Starter: ${state.starterRatePct}% (${starterGrams}g)`;
        if (DOM.starterRateLabel) DOM.starterRateLabel.textContent = `${state.starterRatePct}% (${starterGrams}g starter)`;
        DOM.yeastDesc.textContent = `100% hydration sourdough starter (${starterFlourGrams}g flour + ${starterWaterGrams}g water). Commercial yeast omitted.${state.fermentStyle === 'same_day' ? ' Same-day sourdough requires 6.5–9h room fermentation.' : ''}`;
      } else {
        if (DOM.sourdoughControls) DOM.sourdoughControls.classList.add('hidden');
        DOM.yeastPctLabel.textContent = `${effectiveYeastPct.toFixed(2)}% (${yeastGrams}g)`;
        DOM.yeastDesc.textContent = state.fermentStyle === 'same_day'
          ? `Same-day formulation (${effectiveYeastPct.toFixed(2)}% IDY for 3–4.5h room temp rise).`
          : `Cold-fermentation baseline (${effectiveYeastPct.toFixed(2)}% IDY for 24–72h fridge retard).`;
      }
    }

    if (DOM.sugarPctLabel && DOM.sugarDesc) {
      DOM.sugarPctLabel.textContent = state.includeSugar ? `${sugarPct.toFixed(1)}% (${sugarGrams}g)` : 'Disabled (0g)';
      DOM.sugarDesc.textContent = state.includeSugar
        ? `${sugarDef.desc} (${sugarGrams}g — ${formatSugarVolume(sugarGrams, state.sugarType)})`
        : 'Sugar omitted: less crust browning in home ovens below 600°F.';
    }

    if (DOM.drawerGrainRatioLabel) {
      DOM.drawerGrainRatioLabel.textContent = specialtyPct > 0
        ? `${specialtyPct}% ${grain.shortName} (${specialtyGrams}g) + ${breadFlourGrams}g Bread Flour${starterFlourGrams > 0 ? ` (+${starterFlourGrams}g in starter)` : ''}`
        : `${breadFlourGrams}g Bread Flour${starterFlourGrams > 0 ? ` (+${starterFlourGrams}g in starter)` : ' (100% White)'}`;
    }

    // Build formula ingredients table
    const ingredients = [];

    if (state.yeastType === 'sourdough') {
      ingredients.push({
        id: 'starter',
        name: 'Active Sourdough Starter (100% Hydration)',
        desc: `Ripe, bubbly starter (${starterFlourGrams}g flour + ${starterWaterGrams}g water contributed)`,
        pct: `${state.starterRatePct.toFixed(1)}%`,
        weight: `${starterGrams}g`,
        ref: `~${(starterGrams / 240).toFixed(1)} cups`,
        isWater: false
      });

      const bpct = ((breadFlourGrams / totalFlour) * 100).toFixed(1);
      ingredients.push({
        id: 'bread_flour',
        name: 'High-Gluten Bread Flour (Added)',
        desc: `High protein (12.7%–14.2%) structure (${bpct}% added; ${starterFlourGrams}g in starter)`,
        pct: `${bpct}%`,
        weight: `${breadFlourGrams}g`,
        ref: `~${(breadFlourGrams / 120).toFixed(1)} cups`,
        isWater: false
      });

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

      const addedWaterPct = ((addedWaterGrams / totalFlour) * 100).toFixed(1);
      ingredients.push({
        id: 'water',
        name: 'Water (Added)',
        desc: `${state.tempUnit === 'C' ? '16°C to 18°C' : '60°F to 65°F'} (${starterWaterGrams}g supplied by starter; ${totalWaterGrams}g total)`,
        pct: `${addedWaterPct}%`,
        weight: `${addedWaterGrams}g / ${addedWaterGrams}ml`,
        ref: `~${(addedWaterGrams / 237).toFixed(1)} cups`,
        isWater: true
      });
    } else {
      if (specialtyPct > 0) {
        const bpct = (100 - specialtyPct).toFixed(1);
        ingredients.push({
          id: 'bread_flour',
          name: 'King Arthur High-Gluten / Bread Flour',
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
          name: 'King Arthur High-Gluten / Unbleached Bread Flour',
          desc: '100% high-protein flour (12.7%–14.2%) for signature NYC chew and gluten loft',
          pct: '100.0%',
          weight: `${totalFlour}g`,
          ref: `~${(totalFlour / 120).toFixed(1)} cups`,
          isWater: false
        });
      }

      const waterTempText = state.fermentStyle === 'same_day'
        ? (state.tempUnit === 'C' ? '29°C to 32°C (Lukewarm)' : '85°F to 90°F (Lukewarm)')
        : (state.tempUnit === 'C' ? '16°C to 18°C (Cool)' : '60°F to 65°F (Cool)');

      ingredients.push({
        id: 'water',
        name: 'Water',
        desc: `${waterTempText} (${state.fermentStyle === 'same_day' ? 'activates quick room rise' : 'controls friction heat for fridge retard'})`,
        pct: `${hydrationPct.toFixed(1)}%`,
        weight: `${totalWaterGrams}g / ${totalWaterGrams}ml`,
        ref: `~${(totalWaterGrams / 237).toFixed(1)} cups`,
        isWater: true
      });

      ingredients.push({
        id: 'yeast',
        name: yeastDef.name,
        desc: yeastDef.desc,
        pct: `${effectiveYeastPct.toFixed(2)}%`,
        weight: `${yeastGrams}g`,
        ref: `~${(yeastGrams / 3.1).toFixed(1)} tsp`,
        isWater: false
      });
    }

    // Olive Oil
    if (state.includeOil && oilGrams > 0) {
      ingredients.push({
        id: 'oil',
        name: 'Extra Virgin Olive Oil',
        desc: 'Tenderizes crumb, helps browning in home ovens, and enables signature NY fold',
        pct: `${oilPct.toFixed(1)}%`,
        weight: `${oilGrams}g`,
        ref: formatOilVolume(oilGrams),
        isWater: false
      });
    }

    // Salt
    ingredients.push({
      id: 'salt',
      name: saltDef.name,
      desc: saltDef.desc,
      pct: `${saltPct.toFixed(1)}%`,
      weight: `${saltGrams}g`,
      ref: formatSaltVolume(saltGrams, state.saltType),
      isWater: false
    });

    // Sugar / Malt
    if (state.includeSugar && sugarGrams > 0) {
      ingredients.push({
        id: 'sugar',
        name: sugarDef.name,
        desc: sugarDef.desc,
        pct: `${sugarPct.toFixed(1)}%`,
        weight: `${sugarGrams}g`,
        ref: formatSugarVolume(sugarGrams, state.sugarType),
        isWater: false
      });
    }

    // Semolina dusting note (baking surface)
    if (state.bakingSurface !== 'pan') {
      ingredients.push({
        id: 'dusting_semolina',
        name: 'Semolina / Coarse Flour (for Peel & Surface)',
        desc: 'Dusting layer for peel launching and golden crispy bottom crunch',
        pct: '--',
        weight: '~25g',
        ref: '~2 tbsp',
        isWater: false,
        isSpecial: true
      });
    }

    // Render table
    if (DOM.ingredientsTbody) {
      DOM.ingredientsTbody.innerHTML = ingredients.map(ing => `
        <tr class="${ing.isSpecial ? 'special-ingredient-row' : ''}">
          <td class="td-ingredient">
            <strong>${ing.name}</strong>
            <small class="ingredient-desc">${ing.desc}</small>
          </td>
          <td class="td-pct font-mono">${ing.pct}</td>
          <td class="td-weight font-mono"><strong>${ing.weight}</strong></td>
          <td class="td-ref font-mono">${ing.ref}</td>
        </tr>
      `).join('');
    }

    if (DOM.ingredientsTfoot) {
      const totalPctSum = (100 + hydrationPct + (state.includeOil ? oilPct : 0) + saltPct + (state.includeSugar ? sugarPct : 0) + (state.yeastType === 'sourdough' ? 0 : effectiveYeastPct)).toFixed(1);
      DOM.ingredientsTfoot.innerHTML = `
        <tr class="tfoot-total-row">
          <td><strong>Total Dough Formula</strong></td>
          <td class="font-mono"><strong>${totalPctSum}%</strong></td>
          <td class="font-mono"><strong>${totalDough.toLocaleString()}g</strong></td>
          <td class="font-mono"><strong>${pies} × ~${perPie}g</strong></td>
        </tr>
      `;
    }

    // Render Timeline Steps
    renderTimelineSteps(f, state.tempUnit);

    // Render Printable Recipe Card
    renderPrintRecipeCard(f);

    // Save recipe state
    saveRecipeState();
  }

  // --- Temperature Unit Handling ---
  function setTempUnit(unit) {
    state.tempUnit = (unit === 'C') ? 'C' : 'F';
    const isC = state.tempUnit === 'C';

    document.querySelectorAll('.temp-val').forEach(el => {
      const fRange = el.dataset.f;
      if (!fRange) return;

      if (fRange.includes('-')) {
        const parts = fRange.split('-');
        const f1 = parseFloat(parts[0]);
        const f2 = parseFloat(parts[1]);
        const c1 = Math.round((f1 - 32) * 5 / 9);
        const c2 = Math.round((f2 - 32) * 5 / 9);
        el.textContent = isC ? `${c1}°C–${c2}°C` : `${f1}°F–${f2}°F`;
      } else {
        const f = parseFloat(fRange);
        const c = Math.round((f - 32) * 5 / 9);
        el.textContent = isC ? `${c}°C` : `${f}°F`;
      }
    });

    if (DOM.tempUnitText) {
      DOM.tempUnitText.textContent = `°${state.tempUnit}`;
    }
    if (DOM.tempUnitBtn) {
      DOM.tempUnitBtn.setAttribute('aria-label', `Toggle temperature unit (current: °${state.tempUnit})`);
    }
    recalculate();
  }

  // --- Timer & Infrastructure Facade (Delegated to KitchenCore) ---
  const formatTime = Core ? Core.formatTime : (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const updateTimerUI = () => timerEngine && timerEngine.updateUI();
  const toggleTimer = () => timerEngine && timerEngine.toggle();
  const clearTimer = () => timerEngine && timerEngine.clear();
  const loadTimer = (seconds, label) => timerEngine && timerEngine.load(seconds, label);
  const startTimer = (resetEndTime = true, announcement = null) => timerEngine && timerEngine.start(resetEndTime, announcement);
  const pauseTimer = (announce = true) => timerEngine && timerEngine.pause(announce);
  const resetTimer = () => timerEngine && timerEngine.reset();
  const adjustTimerMinutes = (mins) => timerEngine && timerEngine.adjustMinutes(mins);
  const saveTimerState = () => timerEngine && timerEngine.saveState();
  const loadTimerState = () => timerEngine && timerEngine.loadState();

  // --- Recipe / Kitchen View Mode ---
  function setRecipeViewMode(active) {
    if (active) {
      document.body.classList.add('recipe-view-mode');
      if (DOM.viewModeBtn) {
        DOM.viewModeBtn.classList.add('active');
        DOM.viewModeBtn.setAttribute('aria-pressed', 'true');
      }
      if (DOM.viewModeText) DOM.viewModeText.textContent = 'Calculator View';
      showToast('🍳 Kitchen Recipe View active (sliders tucked away)');
    } else {
      document.body.classList.remove('recipe-view-mode');
      if (DOM.viewModeBtn) {
        DOM.viewModeBtn.classList.remove('active');
        DOM.viewModeBtn.setAttribute('aria-pressed', 'false');
      }
      if (DOM.viewModeText) DOM.viewModeText.textContent = 'Recipe View';
    }
    try {
      localStorage.setItem('pizzaNerd_recipeView', active ? '1' : '0');
    } catch (e) {}
  }

  function loadRecipeView() {
    try {
      if (localStorage.getItem('pizzaNerd_recipeView') === '1') {
        setRecipeViewMode(true);
      }
    } catch (e) {}
  }

  // --- LocalStorage State Persistence ---
  function saveRecipeState() {
    try {
      localStorage.setItem(STORAGE_RECIPE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function loadRecipeState() {
    try {
      const raw = localStorage.getItem(STORAGE_RECIPE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        Object.assign(state, saved);
        if (DOM.saltTypeSelect) DOM.saltTypeSelect.value = state.saltType;
        if (DOM.yeastTypeSelect) DOM.yeastTypeSelect.value = state.yeastType;
        if (DOM.sugarTypeSelect) DOM.sugarTypeSelect.value = state.sugarType || 'granulated';
        if (DOM.autoHydrationToggle) DOM.autoHydrationToggle.checked = state.autoAdjustHydration;
        if (DOM.includeOilCheck) DOM.includeOilCheck.checked = state.includeOil !== false;
        if (DOM.includeSugarCheck) DOM.includeSugarCheck.checked = state.includeSugar !== false;
        if (DOM.saltSlider) DOM.saltSlider.value = state.saltPct;
        if (DOM.oilSlider) DOM.oilSlider.value = state.oilPct;
        if (DOM.sugarSlider) DOM.sugarSlider.value = state.sugarPct;
        if (DOM.starterRateSlider) DOM.starterRateSlider.value = state.starterRatePct || 15;

        // Restore temperature unit explicitly
        if (state.tempUnit) {
          setTempUnit(state.tempUnit);
        }

        // Sync buttons
        DOM.pieButtons.forEach(btn => {
          const p = parseInt(btn.dataset.pies, 10);
          btn.classList.toggle('active', p === state.pies);
          btn.setAttribute('aria-pressed', p === state.pies ? 'true' : 'false');
        });
        DOM.sizeButtons.forEach(btn => {
          const s = btn.dataset.size;
          btn.classList.toggle('active', s === state.pizzaSize);
          btn.setAttribute('aria-pressed', s === state.pizzaSize ? 'true' : 'false');
        });
        DOM.fermentButtons.forEach(btn => {
          const fm = btn.dataset.ferment;
          btn.classList.toggle('active', fm === state.fermentStyle);
          btn.setAttribute('aria-pressed', fm === state.fermentStyle ? 'true' : 'false');
        });
        DOM.surfaceButtons.forEach(btn => {
          const sf = btn.dataset.surface;
          btn.classList.toggle('active', sf === state.bakingSurface);
          btn.setAttribute('aria-pressed', sf === state.bakingSurface ? 'true' : 'false');
        });
        DOM.grainChips.forEach(chip => {
          const g = chip.dataset.grain;
          chip.classList.toggle('active', g === state.specialtyGrain);
          chip.setAttribute('aria-pressed', g === state.specialtyGrain ? 'true' : 'false');
        });
      }
    } catch (e) {}
  }

  // --- Dedicated Printable Recipe Card Renderer ---
  function renderPrintRecipeCard(f) {
    if (!DOM.printRecipeCard) return;

    const steps = buildSteps(f, state.tempUnit);
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const isC = state.tempUnit === 'C';

    const ingredientRows = [];
    if (f.yeastType === 'sourdough') {
      ingredientRows.push({
        name: 'Active Sourdough Starter',
        pct: `${f.starterRatePct.toFixed(1)}%`,
        weight: `${f.starterGrams}g`,
        ref: `~${(f.starterGrams / 240).toFixed(1)} cups`
      });
      ingredientRows.push({
        name: 'High-Gluten Bread Flour',
        pct: `${((f.breadFlourGrams / f.totalFlour) * 100).toFixed(1)}%`,
        weight: `${f.breadFlourGrams}g`,
        ref: `~${(f.breadFlourGrams / 120).toFixed(1)} cups`
      });
      if (f.specialtyGrams > 0) {
        ingredientRows.push({
          name: f.grain.name,
          pct: `${f.specialtyPct.toFixed(1)}%`,
          weight: `${f.specialtyGrams}g`,
          ref: `~${(f.specialtyGrams / 120).toFixed(1)} cups`
        });
      }
      const sourdoughWaterTemp = isC ? '24°C–27°C' : '75°F–80°F';
      ingredientRows.push({
        name: `Water (${sourdoughWaterTemp})`,
        pct: `${((f.addedWaterGrams / f.totalFlour) * 100).toFixed(1)}%`,
        weight: `${f.addedWaterGrams}g`,
        ref: `~${(f.addedWaterGrams / 237).toFixed(1)} cups`
      });
    } else {
      if (f.specialtyGrams > 0) {
        ingredientRows.push({
          name: 'High-Gluten Bread Flour',
          pct: `${(100 - f.specialtyPct).toFixed(1)}%`,
          weight: `${f.breadFlourGrams}g`,
          ref: `~${(f.breadFlourGrams / 120).toFixed(1)} cups`
        });
        ingredientRows.push({
          name: f.grain.name,
          pct: `${f.specialtyPct.toFixed(1)}%`,
          weight: `${f.specialtyGrams}g`,
          ref: `~${(f.specialtyGrams / 120).toFixed(1)} cups`
        });
      } else {
        ingredientRows.push({
          name: 'High-Gluten Bread Flour',
          pct: '100.0%',
          weight: `${f.totalFlour}g`,
          ref: `~${(f.totalFlour / 120).toFixed(1)} cups`
        });
      }
      const waterTempText = f.fermentStyle === 'same_day' 
        ? (isC ? '29°C–32°C' : '85°F–90°F') 
        : (isC ? '16°C–18°C' : '60°F–65°F');
      ingredientRows.push({
        name: `Water (${waterTempText})`,
        pct: `${f.effectiveHydrationPct.toFixed(1)}%`,
        weight: `${f.totalWaterGrams}g`,
        ref: `~${(f.totalWaterGrams / 237).toFixed(1)} cups`
      });
      ingredientRows.push({
        name: f.yeastDef.name,
        pct: `${f.effectiveYeastPct.toFixed(2)}%`,
        weight: `${f.yeastGrams}g`,
        ref: `~${(f.yeastGrams / 3.1).toFixed(1)} tsp`
      });
    }

    if (f.includeOil && f.oilGrams > 0) {
      ingredientRows.push({
        name: 'Extra Virgin Olive Oil',
        pct: `${f.oilPct.toFixed(1)}%`,
        weight: `${f.oilGrams}g`,
        ref: formatOilVolume(f.oilGrams)
      });
    }
    ingredientRows.push({
      name: f.saltDef.name,
      pct: `${f.saltPct.toFixed(1)}%`,
      weight: `${f.saltGrams}g`,
      ref: formatSaltVolume(f.saltGrams, state.saltType)
    });
    if (f.includeSugar && f.sugarGrams > 0) {
      ingredientRows.push({
        name: f.sugarTypeDef.name,
        pct: `${f.sugarPct.toFixed(1)}%`,
        weight: `${f.sugarGrams}g`,
        ref: formatSugarVolume(f.sugarGrams, state.sugarType)
      });
    }
    if (f.bakingSurface !== 'pan') {
      ingredientRows.push({
        name: 'Semolina (Peel Dusting)',
        pct: '--',
        weight: '~25g',
        ref: '~2 tbsp'
      });
    }

    const surfaceName = f.bakingSurface === 'steel' 
      ? 'Baking Steel / Stone' 
      : (f.bakingSurface === 'pan' ? 'Pan / Sheet' : 'Outdoor Oven');

    const areaRatio = Math.pow(f.pizzaSizeInfo.size / 14, 2);
    const saucePerPie = Math.round(115 * areaRatio);
    const cheesePerPie = Math.round(160 * areaRatio);

    DOM.printRecipeCard.innerHTML = `
      <div class="print-header">
        <div>
          <h1 class="print-title">Pizza Nerd — New York Style Pizza Formula</h1>
          <p class="print-subtitle">Authentic NYC Pizzeria Dough Formula Sheet & Baking Workflow</p>
        </div>
        <div class="print-date">Printed: ${dateStr}</div>
      </div>

      <div class="print-grid">
        <div class="print-col-left">
          <div class="print-meta-grid">
            <div class="print-meta-item">
              <span>Yield</span>
              <strong>${f.pies} Pies (${f.pizzaSizeInfo.name})</strong>
            </div>
            <div class="print-meta-item">
              <span>Total Dough</span>
              <strong>${f.totalDough.toLocaleString()}g</strong>
            </div>
            <div class="print-meta-item">
              <span>Hydration</span>
              <strong>${f.effectiveHydrationPct.toFixed(1)}% (${f.fermentStyle === 'cold' ? 'Cold' : (f.yeastType === 'sourdough' ? 'Same-Day 6–7h' : 'Same-Day 2.5–3.5h')})</strong>
            </div>
            <div class="print-meta-item">
              <span>Baking Surface</span>
              <strong>${surfaceName}</strong>
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
              ${ingredientRows.map(row => `
                <tr>
                  <td><strong>${row.name}</strong></td>
                  <td class="pct-col">${row.pct}</td>
                  <td class="weight-col">${row.weight}</td>
                  <td>${row.ref}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="print-section-title">Baker's Field Notes & Toppings</div>
          <div class="print-notes">
            <p>• <strong>Target Toppings (${f.pizzaSizeInfo.name} pie):</strong> ~${saucePerPie}g crushed tomatoes, ~${cheesePerPie}g low-moisture whole milk mozzarella.</p>
            <p>• <strong>Rim & Stretch:</strong> Degas center outward leaving a 1/2" puffy rim. Knuckle stretch gently with gravity.</p>
            ${f.bakingSurface === 'outdoor_oven'
              ? (f.sugarPct > 0.5
                  ? `<p>• <strong>Outdoor Oven High Heat:</strong> Floor is moderated to ${isC ? '315°C–343°C' : '600°F–650°F'} on low flame to prevent scorching sugar/oil.</p>`
                  : `<p>• <strong>Outdoor Oven High Heat:</strong> Bake at ${isC ? '343°C–371°C' : '650°F–700°F'} on low flame for 3–4 minutes.</p>`)
              : (f.bakingSurface === 'pan'
                  ? `<p>• <strong>Crucial Pan Proof:</strong> Proof dough directly in oiled pan 2–3 hrs (or 1.5–2 hrs same-day) until thick and puffy before topping.</p>`
                  : `<p>• <strong>Steel Preheat:</strong> Preheat baking steel at ${isC ? '260°C–288°C' : '500°F–550°F'} for 45–60m. Launch directly onto hot steel.</p>`)}
          </div>
        </div>

        <div class="print-col-right">
          <div class="print-section-title" style="margin-top:0;">Step-by-Step Baker's Method</div>
          <ol class="print-steps">
            ${steps.map(s => `
              <li class="print-step-item">
                <div class="print-step-num">${s.num}.</div>
                <div class="print-step-body">
                  <strong>${s.title}:</strong>
                  <p>${s.printDesc}</p>
                </div>
              </li>
            `).join('')}
          </ol>
        </div>
      </div>
    `;
  }



  // --- Screen Wake Lock API (Delegated to KitchenCore) ---
  const requestWakeLock = () => wakeLockMgr && wakeLockMgr.request();
  const releaseWakeLock = () => wakeLockMgr && wakeLockMgr.release();
  const toggleWakeLock = () => wakeLockMgr && wakeLockMgr.toggle();

  // --- Copy Formula Markdown ---
  function copyFormulaMarkdown() {
    const f = computeFormula(state);
    const steps = buildSteps(f, state.tempUnit);
    const isC = state.tempUnit === 'C';

    let md = `## 🍕 Pizza Nerd — New York Style Pizza Formula\n\n`;
    md += `**Yield:** ${f.pies} Pies (${f.pizzaSizeInfo.name}) · **Total Dough:** ${f.totalDough}g (~${f.perPie}g / ball)\n`;
    md += `**Hydration:** ${f.effectiveHydrationPct.toFixed(1)}% · **Flour:** ${f.totalFlour}g · **Method:** ${f.fermentStyle === 'cold' ? '24h–72h Cold Ferment' : (f.yeastType === 'sourdough' ? '6h–7h Same-Day Sourdough' : '2.5h–3.5h Same-Day')} · **Surface:** ${f.bakingSurface}\n\n`;

    md += `### Ingredients\n`;
    if (f.yeastType === 'sourdough') {
      md += `- **Active Sourdough Starter:** ${f.starterGrams}g (${f.starterRatePct.toFixed(1)}%)\n`;
      md += `- **High-Gluten Bread Flour:** ${f.breadFlourGrams}g\n`;
      if (f.specialtyGrams > 0) md += `- **${f.grain.name}:** ${f.specialtyGrams}g (${f.specialtyPct.toFixed(1)}%)\n`;
      md += `- **Water:** ${f.addedWaterGrams}g\n`;
    } else {
      if (f.specialtyGrams > 0) {
        md += `- **High-Gluten Bread Flour:** ${f.breadFlourGrams}g (${(100 - f.specialtyPct).toFixed(1)}%)\n`;
        md += `- **${f.grain.name}:** ${f.specialtyGrams}g (${f.specialtyPct.toFixed(1)}%)\n`;
      } else {
        md += `- **High-Gluten Bread Flour:** ${f.totalFlour}g (100.0%)\n`;
      }
      const waterTempText = f.fermentStyle === 'same_day' 
        ? (isC ? '29°C–32°C' : '85°F–90°F') 
        : (isC ? '16°C–18°C' : '60°F–65°F');
      md += `- **Water (${waterTempText}):** ${f.totalWaterGrams}g (${f.effectiveHydrationPct.toFixed(1)}%)\n`;
      md += `- **${f.yeastDef.name}:** ${f.yeastGrams}g (${f.effectiveYeastPct.toFixed(2)}%)\n`;
    }
    if (f.includeOil && f.oilGrams > 0) {
      md += `- **Extra Virgin Olive Oil:** ${f.oilGrams}g (${f.oilPct.toFixed(1)}% — ${formatOilVolume(f.oilGrams)})\n`;
    }
    md += `- **${f.saltDef.name}:** ${f.saltGrams}g (${f.saltPct.toFixed(1)}% — ${formatSaltVolume(f.saltGrams, state.saltType)})\n`;
    if (f.includeSugar && f.sugarGrams > 0) {
      md += `- **${f.sugarTypeDef.name}:** ${f.sugarGrams}g (${f.sugarPct.toFixed(1)}% — ${formatSugarVolume(f.sugarGrams, state.sugarType)})\n`;
    }
    if (f.bakingSurface !== 'pan') {
      md += `- **Semolina (Peel Dusting):** ~25g\n`;
    }
    md += `\n### Method & Fermentation\n`;
    steps.forEach(s => {
      md += `${s.copyDesc}\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md).then(() => {
        showToast('📋 Formula & timeline copied to clipboard!');
      }).catch(() => {
        showToast('Failed to copy formula to clipboard');
      });
    }
  }

  // --- Step Progress Checklist Persistence (Delegated to KitchenCore) ---
  const saveStepProgress = () => checklistMgr && checklistMgr.save();
  const resetStepProgress = () => {
    if (checklistMgr) checklistMgr.reset();
    updateStepProgress();
  };

  function updateStepProgress() {
    const steps = (DOM.timelineSteps && DOM.timelineSteps.length > 0)
      ? DOM.timelineSteps
      : document.querySelectorAll('.timeline-step');
    let completedCount = 0;
    steps.forEach(step => {
      if (step.classList.contains('completed')) completedCount++;
    });
    if (DOM.stepsProgress) {
      DOM.stepsProgress.textContent = `${completedCount} / ${steps.length} Complete`;
    }
  }

  function loadStepProgress() {
    if (checklistMgr) checklistMgr.load();
    updateStepProgress();
  }

  // --- Theme Management (Delegated to KitchenCore) ---
  const applyTheme = (theme) => themeMgr && themeMgr.applyTheme(theme);
  const loadTheme = () => themeMgr && themeMgr.loadTheme();
  const toggleTheme = () => themeMgr && themeMgr.toggleTheme();

  // --- Setup Event Listeners ---
  function setupEvents() {
    if (typeof document === 'undefined') return;

    // Direct flour input
    if (DOM.flourInput) {
      DOM.flourInput.addEventListener('input', () => {
        const val = parseFloat(DOM.flourInput.value);
        if (!isNaN(val) && val >= 100 && val <= 5000) {
          state.totalFlour = val;
          state.isDirectFlourInput = true;
          recalculate();
        }
      });
    }

    // Pie buttons (1, 2, 3, 4, 6)
    DOM.pieButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.pies, 10);
        if (!isNaN(p)) {
          state.pies = p;
          state.isDirectFlourInput = false;
          DOM.pieButtons.forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          recalculate();
        }
      });
    });

    // Pizza size buttons (12", 14", 16", 18")
    DOM.sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.dataset.size;
        if (PIZZA_SIZES[s]) {
          state.pizzaSize = s;
          state.ballWeight = PIZZA_SIZES[s].targetBallWeight;
          state.isDirectFlourInput = false;
          DOM.sizeButtons.forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          recalculate();
        }
      });
    });

    // Ferment buttons (cold vs same-day)
    DOM.fermentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const fm = btn.dataset.ferment;
        state.fermentStyle = fm;
        state.yeastPct = (fm === 'same_day') ? 0.85 : 0.35;
        DOM.fermentButtons.forEach(b => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        recalculate();
        showToast(fm === 'same_day' 
          ? '⚡ Switched to Same-Day Fast Dough (~0.85% yeast, 2.5–3.5h room rise)' 
          : '❄️ Switched to 24h–72h Cold Fermentation (~0.35% yeast, fridge retard)');
      });
    });

    // Surface buttons (steel, pan, outdoor_oven)
    DOM.surfaceButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const sf = btn.dataset.surface;
        state.bakingSurface = sf;
        DOM.surfaceButtons.forEach(b => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        recalculate();
      });
    });

    // Hydration Slider
    if (DOM.hydrationSlider) {
      DOM.hydrationSlider.addEventListener('input', () => {
        const h = parseFloat(DOM.hydrationSlider.value);
        if (!isNaN(h)) {
          state.baseHydrationPct = h;
          state.hydrationPct = h;
          recalculate();
        }
      });
    }

    // Hydration preset buttons
    DOM.hydrationPresetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const h = parseFloat(btn.dataset.hydration);
        if (!isNaN(h)) {
          state.baseHydrationPct = h;
          state.hydrationPct = h;
          if (DOM.hydrationSlider) DOM.hydrationSlider.value = h;
          DOM.hydrationPresetButtons.forEach(b => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          recalculate();
        }
      });
    });

    // Specialty Grain Chips
    DOM.grainChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const g = chip.dataset.grain;
        if (GRAIN_DEFINITIONS[g]) {
          state.specialtyGrain = g;
          // If at 0%, bump to 15% as a helpful default suggestion when clicking a grain
          if (state.specialtyPct === 0) {
            state.specialtyPct = 15;
            if (DOM.specialtySlider) DOM.specialtySlider.value = 15;
          }
          DOM.grainChips.forEach(c => {
            const active = c === chip;
            c.classList.toggle('active', active);
            c.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          recalculate();
        }
      });
    });

    // Specialty Grain Slider
    if (DOM.specialtySlider) {
      DOM.specialtySlider.addEventListener('input', () => {
        const val = parseInt(DOM.specialtySlider.value, 10);
        state.specialtyPct = val;
        DOM.grainPresetButtons.forEach(btn => {
          const bp = parseInt(btn.dataset.pct, 10);
          btn.classList.toggle('active', bp === val);
          btn.setAttribute('aria-pressed', bp === val ? 'true' : 'false');
        });
        recalculate();
      });
    }

    // Grain Presets
    DOM.grainPresetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = parseInt(btn.dataset.pct, 10);
        state.specialtyPct = pct;
        if (DOM.specialtySlider) DOM.specialtySlider.value = pct;
        DOM.grainPresetButtons.forEach(b => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        recalculate();
      });
    });

    // Auto-hydration toggle
    if (DOM.autoHydrationToggle) {
      DOM.autoHydrationToggle.addEventListener('change', () => {
        state.autoAdjustHydration = DOM.autoHydrationToggle.checked;
        recalculate();
      });
    }

    // Fine-Tuning Drawer Toggle
    if (DOM.toggleTuningBtn && DOM.tuningBody) {
      DOM.toggleTuningBtn.addEventListener('click', () => {
        const isHidden = DOM.tuningBody.classList.contains('hidden');
        DOM.tuningBody.classList.toggle('hidden', !isHidden);
        DOM.toggleTuningBtn.classList.toggle('open', isHidden);
      });
    }

    // Salt slider & select
    if (DOM.saltSlider) {
      DOM.saltSlider.addEventListener('input', () => {
        state.saltPct = parseFloat(DOM.saltSlider.value);
        recalculate();
      });
    }
    if (DOM.saltTypeSelect) {
      DOM.saltTypeSelect.addEventListener('change', () => {
        state.saltType = DOM.saltTypeSelect.value;
        recalculate();
      });
    }

    // Olive Oil slider & check
    if (DOM.oilSlider) {
      DOM.oilSlider.addEventListener('input', () => {
        state.oilPct = parseFloat(DOM.oilSlider.value);
        recalculate();
      });
    }
    if (DOM.includeOilCheck) {
      DOM.includeOilCheck.addEventListener('change', () => {
        state.includeOil = DOM.includeOilCheck.checked;
        recalculate();
      });
    }

    // Yeast select & starter slider
    if (DOM.yeastTypeSelect) {
      DOM.yeastTypeSelect.addEventListener('change', () => {
        state.yeastType = DOM.yeastTypeSelect.value;
        recalculate();
      });
    }
    if (DOM.starterRateSlider) {
      DOM.starterRateSlider.addEventListener('input', () => {
        state.starterRatePct = parseInt(DOM.starterRateSlider.value, 10);
        recalculate();
      });
    }

    // Sugar slider, type, and check
    if (DOM.sugarSlider) {
      DOM.sugarSlider.addEventListener('input', () => {
        state.sugarPct = parseFloat(DOM.sugarSlider.value);
        recalculate();
      });
    }
    if (DOM.sugarTypeSelect) {
      DOM.sugarTypeSelect.addEventListener('change', () => {
        state.sugarType = DOM.sugarTypeSelect.value;
        recalculate();
      });
    }
    if (DOM.includeSugarCheck) {
      DOM.includeSugarCheck.addEventListener('change', () => {
        state.includeSugar = DOM.includeSugarCheck.checked;
        recalculate();
      });
    }

    // Reset Advanced Ingredients Button
    if (DOM.resetAdvancedBtn) {
      DOM.resetAdvancedBtn.addEventListener('click', () => {
        state.saltPct = NY_DEFAULTS.saltPct;
        state.saltType = NY_DEFAULTS.saltType;
        state.oilPct = NY_DEFAULTS.oilPct;
        state.includeOil = NY_DEFAULTS.includeOil;
        state.yeastPct = (state.fermentStyle === 'same_day') ? 0.85 : 0.35;
        state.yeastType = NY_DEFAULTS.yeastType;
        state.starterRatePct = NY_DEFAULTS.starterRatePct;
        state.sugarPct = NY_DEFAULTS.sugarPct;
        state.sugarType = NY_DEFAULTS.sugarType;
        state.includeSugar = NY_DEFAULTS.includeSugar;

        if (DOM.saltSlider) DOM.saltSlider.value = state.saltPct;
        if (DOM.saltTypeSelect) DOM.saltTypeSelect.value = state.saltType;
        if (DOM.oilSlider) DOM.oilSlider.value = state.oilPct;
        if (DOM.includeOilCheck) DOM.includeOilCheck.checked = state.includeOil;
        if (DOM.yeastTypeSelect) DOM.yeastTypeSelect.value = state.yeastType;
        if (DOM.sugarSlider) DOM.sugarSlider.value = state.sugarPct;
        if (DOM.sugarTypeSelect) DOM.sugarTypeSelect.value = state.sugarType;
        if (DOM.includeSugarCheck) DOM.includeSugarCheck.checked = state.includeSugar;
        recalculate();
        showToast('↺ Advanced ingredients reset to NYC defaults');
      });
    }

    // Reset all defaults button
    if (DOM.resetDefaultsBtn) {
      DOM.resetDefaultsBtn.addEventListener('click', () => {
        resetStepProgress();
        Object.assign(state, NY_DEFAULTS);
        state.isDirectFlourInput = false;
        if (DOM.flourInput) DOM.flourInput.value = state.totalFlour;
        if (DOM.saltSlider) DOM.saltSlider.value = state.saltPct;
        if (DOM.saltTypeSelect) DOM.saltTypeSelect.value = state.saltType;
        if (DOM.oilSlider) DOM.oilSlider.value = state.oilPct;
        if (DOM.includeOilCheck) DOM.includeOilCheck.checked = state.includeOil;
        if (DOM.yeastTypeSelect) DOM.yeastTypeSelect.value = state.yeastType;
        if (DOM.sugarSlider) DOM.sugarSlider.value = state.sugarPct;
        if (DOM.sugarTypeSelect) DOM.sugarTypeSelect.value = state.sugarType;
        if (DOM.includeSugarCheck) DOM.includeSugarCheck.checked = state.includeSugar;
        if (DOM.autoHydrationToggle) DOM.autoHydrationToggle.checked = state.autoAdjustHydration;
        if (DOM.specialtySlider) DOM.specialtySlider.value = 0;

        DOM.pieButtons.forEach(b => {
          const active = parseInt(b.dataset.pies, 10) === state.pies;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        DOM.sizeButtons.forEach(b => {
          const active = b.dataset.size === state.pizzaSize;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        DOM.fermentButtons.forEach(b => {
          const active = b.dataset.ferment === state.fermentStyle;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        DOM.surfaceButtons.forEach(b => {
          const active = b.dataset.surface === state.bakingSurface;
          b.classList.toggle('active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        DOM.grainChips.forEach(c => {
          const active = c.dataset.grain === state.specialtyGrain;
          c.classList.toggle('active', active);
          c.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        recalculate();
        showToast('↺ All settings reset to classic New York defaults');
      });
    }

    // Timer Hub Controls
    if (DOM.startTimerBtn) DOM.startTimerBtn.addEventListener('click', toggleTimer);
    if (DOM.resetTimerBtn) DOM.resetTimerBtn.addEventListener('click', resetTimer);
    if (DOM.clearTimerBtn) DOM.clearTimerBtn.addEventListener('click', clearTimer);
    if (DOM.quickTimerChips) {
      DOM.quickTimerChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const m = parseInt(chip.dataset.min, 10);
          if (!isNaN(m)) adjustTimerMinutes(m);
        });
      });
    }

    // Mobile floating timer widget buttons
    if (DOM.mobileTimerJump) {
      DOM.mobileTimerJump.addEventListener('click', () => {
        const hub = document.getElementById('timerHubCard');
        if (hub) hub.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    if (DOM.mobileTimerToggleBtn) {
      DOM.mobileTimerToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTimer();
      });
    }

    // Timeline step check and timer load delegation
    if (DOM.timelineContainer) {
      DOM.timelineContainer.addEventListener('click', (e) => {
        const checkBtn = e.target.closest('.step-check-btn');
        if (checkBtn) {
          const step = checkBtn.closest('.timeline-step');
          if (step) {
            step.classList.toggle('completed');
            updateStepProgress();
            saveStepProgress();
          }
          return;
        }

        const btn = e.target.closest('.load-timer-btn');
        if (btn) {
          const time = parseInt(btn.dataset.time, 10);
          const label = btn.dataset.label;
          if (!isNaN(time)) {
            loadTimer(time, label);
            if (window.innerWidth < 768 && DOM.timerCountdown) {
              DOM.timerCountdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      });
    }

    // Header timer button jump
    if (DOM.headerTimerBtn) {
      DOM.headerTimerBtn.addEventListener('click', () => {
        const hub = document.getElementById('timerHubCard');
        if (hub) hub.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    // Wake lock button
    if (DOM.wakeLockBtn) {
      DOM.wakeLockBtn.addEventListener('click', async () => {
        wakeLockWanted = !wakeLockSentinel;
        if (wakeLockWanted) {
          await requestWakeLock();
        } else {
          releaseWakeLock();
        }
      });
    }

    // Temperature unit button
    if (DOM.tempUnitBtn) {
      DOM.tempUnitBtn.addEventListener('click', () => {
        const next = state.tempUnit === 'F' ? 'C' : 'F';
        setTempUnit(next);
        showToast(`Switched temperature display to °${next}`);
      });
    }

    // Recipe view mode button
    if (DOM.viewModeBtn) {
      DOM.viewModeBtn.addEventListener('click', () => {
        const active = !document.body.classList.contains('recipe-view-mode');
        setRecipeViewMode(active);
      });
    }

    // Theme toggle button
    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Copy recipe button
    if (DOM.copyRecipeBtn) {
      DOM.copyRecipeBtn.addEventListener('click', copyFormulaMarkdown);
    }

    // Print button
    if (DOM.printBtn) {
      DOM.printBtn.addEventListener('click', () => {
        const f = computeFormula(state);
        renderPrintRecipeCard(f);
        window.print();
      });
    }

    // Wake Lock re-request on page visibility change
    document.addEventListener('visibilitychange', async () => {
      if (wakeLockWanted && document.visibilityState === 'visible' && !wakeLockSentinel) {
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
    setTempUnit(state.tempUnit || 'F');
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

  // Node.js module exports for pure formula unit tests and timer integration
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      computeFormula,
      buildSteps,
      getBakerInsight,
      formatSaltVolume,
      formatOilVolume,
      formatSugarVolume,
      GRAIN_DEFINITIONS,
      SALT_DEFINITIONS,
      LEAVENING_DEFINITIONS,
      SUGAR_TYPES,
      PIZZA_SIZES,
      NY_DEFAULTS,
      getGrainPresetLabel,
      timerEngine,
      toggleTimer,
      loadTimer,
      clearTimer,
      resetTimer
    };
  }

})();
