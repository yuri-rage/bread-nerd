#!/usr/bin/env node

/**
 * Validates that classes referenced in HTML templates and JS logic
 * have corresponding definitions across shared/base.css and app stylesheets.
 */

const fs = require('fs');
const path = require('path');

function extractClassesFromContent(content) {
  const classes = new Set();
  
  // Replace ${...} inside content with spaces to avoid dynamic expression artifacts
  const sanitized = content.replace(/\$\{[^}]+\}/g, ' ');

  // 1. class="..." attributes
  const classAttrRegex = /class=["']([^"']+)["']/g;
  let match;
  while ((match = classAttrRegex.exec(sanitized)) !== null) {
    match[1].split(/\s+/).forEach(c => {
      const clean = c.replace(/[^a-zA-Z0-9_-]/g, '');
      if (clean && !clean.startsWith('svg') && isNaN(clean[0])) {
        classes.add(clean);
      }
    });
  }

  // 2. classList.add('...'), classList.toggle('...')
  const classListRegex = /classList\.(?:add|remove|toggle|contains)\(['"]([a-zA-Z0-9_-]+)['"]/g;
  while ((match = classListRegex.exec(sanitized)) !== null) {
    classes.add(match[1]);
  }

  // 3. querySelector('.foo')
  const qsRegex = /querySelector(?:All)?\(['"][^'"]*?\.([a-zA-Z0-9_-]+)/g;
  while ((match = qsRegex.exec(sanitized)) !== null) {
    classes.add(match[1]);
  }

  return classes;
}

function extractDefinedClasses(css) {
  const defined = new Set();
  const classRegex = /\.([a-zA-Z0-9_-]+)(?=[^a-zA-Z0-9_-]|$)/g;
  let match;
  while ((match = classRegex.exec(css)) !== null) {
    defined.add(match[1]);
  }
  return defined;
}

// Known semantic container classes or test/accessibility hooks not requiring dedicated CSS rules
const IGNORED_SEMANTIC_CLASSES = new Set([
  'glass-card',
  'formula-card',
  'card-recipe-ingredients',
  'card-recipe-steps',
  'yeast-options',
  'slider-ticks',
  'tick',
  'active-tick',
  'grain-preset-btn',
  'hydration-preset-btn',
  'topping-guide-callout',
  'seg-label',
  'mobile-timer-btn-wrap',
  'header-actions-row-primary',
  'header-actions-row-secondary'
]);

function runCheck(appName, htmlPath, appJsPath, appCssPath, baseCssPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  const appCss = fs.readFileSync(appCssPath, 'utf8');
  const baseCss = fs.readFileSync(baseCssPath, 'utf8');

  const usedClasses = new Set([
    ...extractClassesFromContent(html),
    ...extractClassesFromContent(appJs)
  ]);

  const definedClasses = new Set([
    ...extractDefinedClasses(baseCss),
    ...extractDefinedClasses(appCss)
  ]);

  const missing = [];
  for (const cls of usedClasses) {
    if (!definedClasses.has(cls) && !IGNORED_SEMANTIC_CLASSES.has(cls)) {
      missing.push(cls);
    }
  }

  return { usedCount: usedClasses.size, missing };
}

console.log('🔍 Running CSS Selector Validation...');

const baseCssPath = path.join(__dirname, '../shared/base.css');

const breadResult = runCheck(
  'Bread Nerd',
  path.join(__dirname, '../bread/index.html'),
  path.join(__dirname, '../bread/app.js'),
  path.join(__dirname, '../bread/styles.css'),
  baseCssPath
);

const pizzaResult = runCheck(
  'Pizza Nerd',
  path.join(__dirname, '../pizza/index.html'),
  path.join(__dirname, '../pizza/app.js'),
  path.join(__dirname, '../pizza/styles.css'),
  baseCssPath
);

let hasError = false;

if (breadResult.missing.length > 0) {
  console.error(`❌ Bread Nerd has ${breadResult.missing.length} unstyled classes:`, breadResult.missing);
  hasError = true;
} else {
  console.log(`✓ Bread Nerd: all ${breadResult.usedCount} classes accounted for.`);
}

if (pizzaResult.missing.length > 0) {
  console.error(`❌ Pizza Nerd has ${pizzaResult.missing.length} unstyled classes:`, pizzaResult.missing);
  hasError = true;
} else {
  console.log(`✓ Pizza Nerd: all ${pizzaResult.usedCount} classes accounted for.`);
}

if (hasError) {
  process.exit(1);
} else {
  console.log('🎉 All CSS selectors successfully validated across both apps!\n');
}
