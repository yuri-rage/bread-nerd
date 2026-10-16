const assert = require('assert');
const KitchenCore = require('../shared/core.js');

console.log('🥣 Running Shared Kitchen Core Tests...\n');

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

// 1. Time Formatting
test('formatTime properly formats seconds into MM:SS and HH:MM:SS', () => {
  assert.strictEqual(KitchenCore.formatTime(0), '00:00');
  assert.strictEqual(KitchenCore.formatTime(9), '00:09');
  assert.strictEqual(KitchenCore.formatTime(60), '01:00');
  assert.strictEqual(KitchenCore.formatTime(65), '01:05');
  assert.strictEqual(KitchenCore.formatTime(3599), '59:59');
  assert.strictEqual(KitchenCore.formatTime(3600), '01:00:00');
  assert.strictEqual(KitchenCore.formatTime(3665), '01:01:05');
});

// 2. Timer creation and state transitions
test('createTimer initializes, loads, pauses, and adjusts time accurately', () => {
  const timer = KitchenCore.createTimer({
    appName: 'Test Nerd',
    defaultLabel: 'Ready'
  });

  assert.strictEqual(timer.getState().remainingSeconds, 0);
  assert.strictEqual(timer.getState().totalSeconds, 0);
  assert.strictEqual(timer.getState().isRunning, false);

  // Load timer for 10 minutes (600s)
  timer.load(600, 'Mix Dough');
  assert.strictEqual(timer.getState().remainingSeconds, 600);
  assert.strictEqual(timer.getState().totalSeconds, 600);
  assert.strictEqual(timer.getState().labelText, 'Mix Dough');
  assert.strictEqual(timer.getState().isRunning, true);

  // Pause timer
  timer.pause();
  assert.strictEqual(timer.getState().isRunning, false);
  assert.strictEqual(timer.getState().remainingSeconds, 600);

  // Adjust +5 minutes
  timer.adjustMinutes(5);
  assert.strictEqual(timer.getState().remainingSeconds, 900);
  assert.strictEqual(timer.getState().totalSeconds, 900);

  // Reset timer
  timer.reset();
  assert.strictEqual(timer.getState().remainingSeconds, 900);
  assert.strictEqual(timer.getState().isRunning, false);

  // Clear timer
  timer.clear();
  assert.strictEqual(timer.getState().remainingSeconds, 0);
  assert.strictEqual(timer.getState().totalSeconds, 0);
  assert.strictEqual(timer.getState().labelText, 'Ready');
});

// 3. Theme Manager creation
test('createThemeManager initializes and provides theme methods', () => {
  const themeMgr = KitchenCore.createThemeManager({
    storageKey: 'test_theme'
  });
  assert.strictEqual(typeof themeMgr.applyTheme, 'function');
  assert.strictEqual(typeof themeMgr.toggleTheme, 'function');
  assert.strictEqual(typeof themeMgr.loadTheme, 'function');
});

// 4. Toast Manager creation
test('createToastManager initializes without throwing in headless environment', () => {
  const toasts = KitchenCore.createToastManager();
  assert.strictEqual(typeof toasts.show, 'function');
  // Calling show in headless should safely fall back to console or no-op
  toasts.show('Test toast', 'info');
});

// 5. Wake Lock Manager creation
test('createWakeLockManager initializes in headless environment', () => {
  const wakeLock = KitchenCore.createWakeLockManager();
  assert.strictEqual(typeof wakeLock.toggle, 'function');
  assert.strictEqual(typeof wakeLock.request, 'function');
  assert.strictEqual(typeof wakeLock.release, 'function');
  assert.strictEqual(wakeLock.isLocked(), false);
});

console.log(`\n🎉 All ${passed} shared core tests passed successfully!\n`);
