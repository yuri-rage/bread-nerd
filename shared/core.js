/**
 * KITCHEN NERD SHARED CORE ENGINE
 * Shared infrastructure for Bread Nerd & Pizza Nerd companion apps.
 * Provides high-precision countdown timers, screen wake lock, theme management,
 * toast alerts, Web Audio chime synthesis, and step checklists.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KitchenCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // --- 1. Time Formatting Utility ---
  function formatTime(seconds) {
    const s = Math.max(0, Math.round(Number(seconds) || 0));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // --- 2. Web Audio Chime Synthesis ---
  let sharedAudioCtx = null;

  function getAudioContext() {
    if (typeof window === 'undefined') return null;
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

  function playChime(customCtx) {
    try {
      const ctx = customCtx || getAudioContext();
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

      // Play pleasant harmonic 3-tone chime: A5 (880Hz), C#6 (1108.7Hz), E6 (1318.5Hz)
      playTone(880, 0, 0.4);
      playTone(1108.7, 0.25, 0.4);
      playTone(1318.5, 0.5, 0.8);
      setTimeout(() => {
        playTone(880, 0, 0.3);
        playTone(1318.5, 0.2, 0.7);
      }, 1000);
    } catch (e) {
      console.warn('KitchenCore audio chime unsupported or blocked:', e);
    }
  }

  // --- 3. Toast Notifications ---
  function createToastManager(options = {}) {
    const containerId = options.containerId || 'toastContainer';

    function show(message, type = 'info', duration = 3200) {
      if (typeof document === 'undefined') {
        console.log(`[Toast ${type}]: ${message}`);
        return;
      }
      const container = document.getElementById(containerId);
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      const span = document.createElement('span');
      span.textContent = message;
      toast.appendChild(span);
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }

    return { show };
  }

  // --- 4. Screen Wake Lock Manager ---
  function createWakeLockManager(options = {}) {
    const buttonId = options.buttonId || 'wakeLockBtn';
    const toastManager = options.toastManager || null;
    let wakeLockSentinel = null;
    let wakeLockWanted = false;

    function getButton() {
      return (typeof document !== 'undefined') ? document.getElementById(buttonId) : null;
    }

    function syncButton(active) {
      const btn = getButton();
      if (!btn) return;
      if (active) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    }

    async function request() {
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator) || !wakeLockWanted) return false;
      try {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        syncButton(true);

        wakeLockSentinel.addEventListener('release', () => {
          wakeLockSentinel = null;
          if (!wakeLockWanted) {
            syncButton(false);
          }
        });
        return true;
      } catch (err) {
        console.warn('KitchenCore wake lock request error:', err);
        return false;
      }
    }

    async function release() {
      if (wakeLockSentinel) {
        try {
          await wakeLockSentinel.release();
        } catch (e) {}
        wakeLockSentinel = null;
      }
      syncButton(false);
    }

    async function toggle() {
      if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
        if (toastManager) toastManager.show('Screen Wake Lock is not supported on this browser', 'warning');
        return false;
      }

      if (wakeLockWanted) {
        wakeLockWanted = false;
        await release();
        if (toastManager) toastManager.show('Screen Wake Lock released', 'info');
        return false;
      } else {
        wakeLockWanted = true;
        const success = await request();
        if (success && wakeLockSentinel) {
          if (toastManager) toastManager.show('Screen will stay awake while baking!', 'success');
          return true;
        } else {
          wakeLockWanted = false;
          if (toastManager) toastManager.show('Could not activate Wake Lock', 'warning');
          return false;
        }
      }
    }

    // Auto re-acquire wake lock on tab visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (wakeLockWanted && document.visibilityState === 'visible' && !wakeLockSentinel) {
          request();
        }
      });
    }

    return {
      toggle,
      request,
      release,
      isLocked: () => !!wakeLockSentinel,
      isWanted: () => wakeLockWanted
    };
  }

  // --- 5. Theme Manager ---
  function createThemeManager(options = {}) {
    const storageKey = options.storageKey || 'kitchen_theme';
    const legacyKeys = options.legacyKeys || [];
    const buttonId = options.buttonId || 'themeToggleBtn';
    const textId = options.textId || 'themeToggleText';
    const iconId = options.iconId || 'themeToggleIcon';

    function getDOMElements() {
      if (typeof document === 'undefined') return {};
      return {
        btn: document.getElementById(buttonId),
        text: document.getElementById(textId),
        icon: document.getElementById(iconId)
      };
    }

    function applyTheme(theme) {
      if (typeof document === 'undefined') return;
      const isLight = theme === 'light';
      const { btn, text, icon } = getDOMElements();

      if (isLight) {
        document.documentElement.setAttribute('data-theme', 'light');
        if (text) text.textContent = 'Light';
        if (icon) {
          icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
        }
        if (btn) {
          btn.setAttribute('aria-pressed', 'true');
          btn.setAttribute('title', 'Switch to dark theme');
          btn.setAttribute('aria-label', 'Switch to dark theme');
        }
      } else {
        document.documentElement.removeAttribute('data-theme');
        if (text) text.textContent = 'Dark';
        if (icon) {
          icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
        }
        if (btn) {
          btn.setAttribute('aria-pressed', 'false');
          btn.setAttribute('title', 'Switch to light theme');
          btn.setAttribute('aria-label', 'Switch to light theme');
        }
      }

      // Synchronize mobile chrome status bar
      const newColor = isLight ? '#f8fafc' : '#080b12';
      const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
      themeColorMetas.forEach(meta => {
        meta.setAttribute('content', newColor);
      });
    }

    function getSavedTheme() {
      if (typeof localStorage === 'undefined') return null;
      try {
        let val = localStorage.getItem(storageKey);
        if (val) return val;
        for (const k of legacyKeys) {
          val = localStorage.getItem(k);
          if (val) return val;
        }
      } catch (e) {}
      return null;
    }

    function initSystemThemeListener() {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const handleThemeChange = (e) => {
          if (!getSavedTheme()) {
            applyTheme(e.matches ? 'light' : 'dark');
          }
        };
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleThemeChange);
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handleThemeChange);
        }
      } catch (e) {}
    }

    function loadTheme() {
      const saved = getSavedTheme();
      if (saved === 'light' || saved === 'dark') {
        applyTheme(saved);
      } else if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight ? 'light' : 'dark');
      } else {
        applyTheme('dark');
      }
      initSystemThemeListener();
    }

    function toggleTheme() {
      if (typeof document === 'undefined') return 'dark';
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      applyTheme(newTheme);
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(storageKey, newTheme);
        }
      } catch (e) {}
      return newTheme;
    }

    return {
      applyTheme,
      loadTheme,
      toggleTheme,
      getTheme: () => (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
    };
  }

  // --- 6. Step Checklist Manager ---
  function createChecklistManager(options = {}) {
    const storageKey = options.storageKey || 'kitchen_checklist';
    const stepSelector = options.stepSelector || '.timeline-step';
    const progressSelector = options.progressSelector || '#stepsProgress';

    function getSteps() {
      if (typeof document === 'undefined') return [];
      return Array.from(document.querySelectorAll(stepSelector));
    }

    function getProgressBar() {
      if (typeof document === 'undefined') return null;
      return document.querySelector(progressSelector);
    }

    function save() {
      try {
        if (typeof localStorage === 'undefined') return;
        const completed = [];
        getSteps().forEach(step => {
          if (step.classList.contains('completed')) {
            const num = step.dataset.step;
            if (num) completed.push(num);
          }
        });
        localStorage.setItem(storageKey, JSON.stringify(completed));
      } catch (e) {
        console.warn('KitchenCore checklist save error:', e);
      }
    }

    function update() {
      const steps = getSteps();
      let completedCount = 0;
      steps.forEach(step => {
        if (step.classList.contains('completed')) {
          completedCount++;
        }
      });
      const progressBar = getProgressBar();
      if (progressBar && steps.length > 0) {
        const pct = Math.round((completedCount / steps.length) * 100);
        progressBar.style.width = `${pct}%`;
        progressBar.setAttribute('aria-valuenow', String(pct));
      }
    }

    function load() {
      try {
        if (typeof localStorage === 'undefined') return;
        const saved = localStorage.getItem(storageKey);
        if (!saved) return;
        const completed = JSON.parse(saved);
        if (Array.isArray(completed)) {
          getSteps().forEach(step => {
            const num = step.dataset.step;
            if (num && completed.includes(num)) {
              step.classList.add('completed');
            } else {
              step.classList.remove('completed');
            }
          });
        }
      } catch (e) {
        console.warn('KitchenCore checklist load error:', e);
      }
      update();
    }

    function reset() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(storageKey);
        }
      } catch (e) {}
      getSteps().forEach(step => {
        step.classList.remove('completed');
      });
      update();
    }

    function toggleStep(stepElement) {
      if (!stepElement) return;
      stepElement.classList.toggle('completed');
      save();
      update();
    }

    return {
      save,
      load,
      reset,
      update,
      toggleStep
    };
  }

  // --- 7. Full Kitchen Timer Engine ---
  function createTimer(options = {}) {
    const storageKey = options.storageKey || 'kitchen_timer';
    const appName = options.appName || 'Kitchen Nerd';
    const defaultTitle = options.defaultTitle || `${appName} — Interactive Baker's Calculator`;
    const toastManager = options.toastManager || null;
    const defaultLabel = options.defaultLabel || 'Ready';

    let interval = null;
    let remainingSeconds = 0;
    let totalSeconds = 0;
    let isRunning = false;
    let labelText = defaultLabel;
    let endTime = null;

    // SVG icons
    const SVG_CHECK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    const SVG_PAUSE = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
    const SVG_PLAY = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>';

    function announce(msg) {
      if (typeof document === 'undefined') return;
      const el = document.getElementById('timerAriaAnnouncer');
      if (el) {
        el.textContent = '';
        setTimeout(() => {
          el.textContent = msg;
        }, 50);
      }
    }

    function saveState() {
      if (typeof localStorage === 'undefined') return;
      try {
        if ((isRunning && endTime) || (totalSeconds > 0 && remainingSeconds > 0)) {
          const data = {
            remaining: remainingSeconds,
            remainingSeconds: remainingSeconds,
            total: totalSeconds,
            totalSeconds: totalSeconds,
            running: isRunning,
            isRunning: isRunning,
            label: labelText,
            labelText: labelText,
            endTime: endTime
          };
          localStorage.setItem(storageKey, JSON.stringify(data));
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (e) {}
    }

    function updateUI() {
      if (typeof document === 'undefined') return;

      const timeStr = formatTime(remainingSeconds);
      const isComplete = (remainingSeconds <= 0 && totalSeconds > 0);

      // 1. Main Timer Card Elements
      const countdownEl = document.getElementById('timerCountdown');
      const labelEl = document.getElementById('timerLabel');
      const statusBadge = document.getElementById('activeTimerBadge');
      const startBtn = document.getElementById('startTimerBtn');
      const resetBtn = document.getElementById('resetTimerBtn');
      const clearBtn = document.getElementById('clearTimerBtn');

      if (countdownEl) countdownEl.textContent = timeStr;
      if (labelEl) labelEl.textContent = labelText;

      if (statusBadge) {
        if (isComplete) {
          statusBadge.className = 'timer-status-badge ringing';
          statusBadge.textContent = 'DONE!';
        } else if (isRunning) {
          statusBadge.className = 'timer-status-badge running';
          statusBadge.textContent = 'RUNNING';
        } else if (totalSeconds > 0 && remainingSeconds > 0) {
          statusBadge.className = 'timer-status-badge paused';
          statusBadge.textContent = 'PAUSED';
        } else {
          statusBadge.className = 'timer-status-badge idle';
          statusBadge.textContent = 'READY';
        }
      }

      if (startBtn) {
        if (isComplete) {
          startBtn.innerHTML = `${SVG_PLAY}<span>Start</span>`;
          startBtn.disabled = true;
          startBtn.className = 'timer-btn primary';
        } else if (isRunning) {
          startBtn.innerHTML = `${SVG_PAUSE}<span>Pause</span>`;
          startBtn.disabled = false;
          startBtn.className = 'timer-btn timer-btn-pause';
        } else if (totalSeconds > 0 && remainingSeconds > 0) {
          const resumeLabel = (totalSeconds > remainingSeconds) ? 'Resume' : 'Start';
          startBtn.innerHTML = `${SVG_PLAY}<span>${resumeLabel}</span>`;
          startBtn.disabled = false;
          startBtn.className = 'timer-btn primary';
        } else {
          startBtn.innerHTML = `${SVG_PLAY}<span>Start</span>`;
          startBtn.disabled = true;
          startBtn.className = 'timer-btn primary';
        }
      }

      if (resetBtn) resetBtn.disabled = (totalSeconds <= 0);
      if (clearBtn) clearBtn.disabled = (totalSeconds <= 0 && remainingSeconds <= 0);

      // 2. Header Timer Pill
      const headerBtn = document.getElementById('headerTimerBtn');
      const headerText = document.getElementById('headerTimerText');
      if (headerBtn && headerText) {
        if (isComplete) {
          headerBtn.className = 'action-btn header-timer-btn ringing';
          headerText.textContent = 'DONE!';
          headerBtn.setAttribute('aria-label', `Baking timer: DONE! Jump to timer card`);
        } else if (isRunning) {
          headerBtn.className = 'action-btn header-timer-btn running';
          headerText.textContent = timeStr;
          headerBtn.setAttribute('aria-label', `Baking timer running: ${timeStr}. Jump to timer card`);
        } else if (totalSeconds > 0 && remainingSeconds > 0) {
          headerBtn.className = 'action-btn header-timer-btn paused';
          headerText.textContent = `${timeStr} ⏸`;
          headerBtn.setAttribute('aria-label', `Baking timer paused: ${timeStr}. Jump to timer card`);
        } else {
          headerBtn.className = 'action-btn header-timer-btn idle';
          headerText.textContent = 'Ready';
          headerBtn.setAttribute('aria-label', 'Baking timer: Ready. Jump to timer card');
        }
      }

      // 3. Mobile Floating Timer Pill
      const mobilePill = document.getElementById('mobileFloatingTimer');
      const mobileDigits = document.getElementById('mobileTimerDigits');
      const mobileLabel = document.getElementById('mobileTimerLabel');
      const mobileToggleBtn = document.getElementById('mobileTimerToggleBtn');

      if (mobilePill) {
        if (isComplete) {
          mobilePill.className = 'mobile-floating-timer ringing';
          if (mobileDigits) mobileDigits.textContent = 'DONE!';
          if (mobileLabel) mobileLabel.textContent = labelText;
          if (mobileToggleBtn) {
            mobileToggleBtn.innerHTML = SVG_CHECK;
            mobileToggleBtn.setAttribute('aria-label', 'Dismiss finished timer');
            mobileToggleBtn.title = 'Dismiss finished timer';
          }
          document.body.classList.add('has-floating-timer');
        } else if (isRunning) {
          mobilePill.className = 'mobile-floating-timer running';
          if (mobileDigits) mobileDigits.textContent = timeStr;
          if (mobileLabel) mobileLabel.textContent = labelText;
          if (mobileToggleBtn) {
            mobileToggleBtn.innerHTML = SVG_PAUSE;
            mobileToggleBtn.setAttribute('aria-label', 'Pause timer');
            mobileToggleBtn.title = 'Pause timer';
          }
          document.body.classList.add('has-floating-timer');
        } else if (totalSeconds > 0 && remainingSeconds > 0) {
          mobilePill.className = 'mobile-floating-timer paused';
          if (mobileDigits) mobileDigits.textContent = timeStr;
          if (mobileLabel) mobileLabel.textContent = labelText;
          if (mobileToggleBtn) {
            mobileToggleBtn.innerHTML = SVG_PLAY;
            mobileToggleBtn.setAttribute('aria-label', 'Resume timer');
            mobileToggleBtn.title = 'Resume timer';
          }
          document.body.classList.add('has-floating-timer');
        } else {
          mobilePill.className = 'mobile-floating-timer hidden';
          if (mobileToggleBtn) {
            mobileToggleBtn.innerHTML = SVG_PLAY;
            mobileToggleBtn.setAttribute('aria-label', 'Pause or resume timer');
            mobileToggleBtn.title = 'Pause or resume timer';
          }
          document.body.classList.remove('has-floating-timer');
        }
      }

      // 4. Document Title
      if (typeof document !== 'undefined') {
        if (isComplete) {
          document.title = `🔔 TIME UP! ${appName}`;
        } else if (isRunning) {
          document.title = `(${timeStr}) ${labelText} — ${appName}`;
        } else if (totalSeconds > 0 && remainingSeconds > 0) {
          document.title = `[Paused] ${timeStr} — ${appName}`;
        } else {
          document.title = defaultTitle;
        }
      }

      saveState();
    }

    function pause(announcePause = true) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      const wasRunning = isRunning;
      isRunning = false;
      endTime = null;
      updateUI();
      if (announcePause && wasRunning && remainingSeconds > 0) {
        announce(`Timer paused: ${formatTime(remainingSeconds)} remaining`);
      }
    }

    function start(resetEndTime = true, announcement = null) {
      if (remainingSeconds <= 0) return;
      getAudioContext();
      if (interval) clearInterval(interval);
      isRunning = true;
      if (resetEndTime) {
        endTime = Date.now() + remainingSeconds * 1000;
      }

      if (announcement) {
        announce(announcement);
      } else if (totalSeconds > remainingSeconds) {
        announce(`Timer resumed: ${formatTime(remainingSeconds)} remaining`);
      } else {
        announce(`Timer started for ${labelText}: ${formatTime(remainingSeconds)}`);
      }
      updateUI();

      interval = setInterval(() => {
        if (endTime) {
          const rem = Math.round((endTime - Date.now()) / 1000);
          remainingSeconds = Math.max(0, rem);
        } else {
          remainingSeconds--;
        }

        if (remainingSeconds <= 0) {
          clearInterval(interval);
          interval = null;
          remainingSeconds = 0;
          isRunning = false;
          endTime = null;
          playChime();
          updateUI();
          announce(`Timer finished: ${labelText}!`);
          if (toastManager && typeof window !== 'undefined' && window.innerWidth > 768) {
            toastManager.show(`🔔 Timer Finished: ${labelText}!`, 'warning');
          }
        } else {
          updateUI();
        }
      }, 500);
    }

    function toggle() {
      if (remainingSeconds <= 0 && totalSeconds > 0) {
        clear();
      } else if (isRunning) {
        pause();
      } else if (remainingSeconds > 0) {
        const isResume = totalSeconds > remainingSeconds;
        const msg = isResume
          ? `Timer resumed: ${formatTime(remainingSeconds)} remaining`
          : `Timer started for ${labelText}: ${formatTime(remainingSeconds)}`;
        start(true, msg);
      }
    }

    function reset() {
      pause(false);
      remainingSeconds = totalSeconds;
      endTime = null;
      updateUI();
      announce(`Timer reset to ${formatTime(totalSeconds)}`);
    }

    function clear() {
      pause(false);
      totalSeconds = 0;
      remainingSeconds = 0;
      labelText = defaultLabel;
      endTime = null;
      updateUI();
      announce('Timer cleared');
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(storageKey);
        }
      } catch (e) {}
    }

    function load(seconds, label) {
      pause(false);
      totalSeconds = seconds;
      remainingSeconds = seconds;
      labelText = label || defaultLabel;
      endTime = Date.now() + seconds * 1000;
      updateUI();
      start(false, `Timer started for ${labelText}: ${formatTime(seconds)}`);

      // Smooth scroll to timer if on mobile screen
      if (typeof window !== 'undefined' && window.innerWidth < 1040) {
        const card = document.getElementById('timerHubCard');
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    function adjustMinutes(mins) {
      const deltaSecs = mins * 60;
      if (deltaSecs < 0) {
        if (remainingSeconds <= 0) return;
        const newSecs = Math.max(0, remainingSeconds + deltaSecs);
        remainingSeconds = newSecs;
        if (endTime) {
          endTime = Date.now() + newSecs * 1000;
        }
        if (newSecs === 0) {
          pause(false);
          totalSeconds = 0;
          endTime = null;
          updateUI();
        } else {
          updateUI();
        }
      } else {
        totalSeconds += deltaSecs;
        remainingSeconds += deltaSecs;
        if (endTime) {
          endTime += deltaSecs * 1000;
        }
        if (!isRunning && totalSeconds === deltaSecs && remainingSeconds > 0) {
          if (labelText === 'Select a baking step below to start' || labelText === 'Ready' || labelText === defaultLabel) {
            labelText = `Custom +${mins}m`;
          }
          updateUI();
          start(true, `Timer started for ${labelText}: ${formatTime(remainingSeconds)}`);
        } else {
          updateUI();
        }
      }
    }

    function loadState() {
      if (typeof localStorage === 'undefined') return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return;

        const remSec = (typeof data.remaining === 'number') ? data.remaining : data.remainingSeconds;
        const totSec = (typeof data.total === 'number') ? data.total : data.totalSeconds;
        const isRun = (typeof data.running === 'boolean') ? data.running : data.isRunning;
        const lbl = data.label || data.labelText || defaultLabel;

        if (typeof remSec !== 'number') return;

        totalSeconds = totSec || remSec;
        labelText = lbl;

        if (isRun && data.endTime) {
          const now = Date.now();
          const rem = Math.max(0, Math.round((data.endTime - now) / 1000));
          if (rem > 0) {
            remainingSeconds = rem;
            endTime = data.endTime;
            start(false);
          } else {
            remainingSeconds = 0;
            isRunning = false;
            endTime = null;
            updateUI();
            if (toastManager && typeof window !== 'undefined' && window.innerWidth > 768) {
              toastManager.show(`🔔 Timer "${labelText}" finished while you were away!`, 'warning');
            }
          }
        } else {
          remainingSeconds = remSec;
          isRunning = false;
          endTime = null;
          updateUI();
        }
      } catch (e) {
        console.warn('KitchenCore timer state load error:', e);
      }
    }

    return {
      start,
      pause,
      toggle,
      reset,
      clear,
      load,
      adjustMinutes,
      updateUI,
      loadState,
      saveState,
      getState: () => ({
        remainingSeconds,
        totalSeconds,
        isRunning,
        labelText,
        endTime
      })
    };
  }

  return {
    formatTime,
    getAudioContext,
    playChime,
    createToastManager,
    createWakeLockManager,
    createThemeManager,
    createChecklistManager,
    createTimer
  };
});
