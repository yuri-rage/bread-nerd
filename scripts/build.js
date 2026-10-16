#!/usr/bin/env node

/**
 * Build script for Bread Nerd & Pizza Nerd Monorepo
 * Assembles standalone distribution packages in dist/<app> for Cloudflare Workers Static Assets.
 * Dynamically compiles shared/sw.js into dist/<app>/sw.js with baked version and asset cache list.
 *
 * Usage:
 *   node scripts/build.js          # Builds both bread and pizza
 *   node scripts/build.js bread    # Builds only bread
 *   node scripts/build.js pizza    # Builds only pizza
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const target = process.argv[2];

const VALID_APPS = ['bread', 'pizza'];

function buildApp(app) {
  if (!VALID_APPS.includes(app)) {
    console.error(`Error: Unknown target app "${app}". Valid targets: ${VALID_APPS.join(', ')}`);
    process.exit(1);
  }

  const srcDir = path.join(ROOT, app);
  const outDir = path.join(ROOT, 'dist', app);
  const sharedDir = path.join(ROOT, 'shared');

  if (!fs.existsSync(srcDir)) {
    console.error(`Error: Source directory "${srcDir}" not found.`);
    process.exit(1);
  }

  console.log(`🔨 Building ${app} -> dist/${app}...`);

  // Clean and recreate output directory
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // Copy all files from app directory
  fs.cpSync(srcDir, outDir, { recursive: true });

  // If shared/ directory exists, copy it into dist/<app>/shared (excluding service worker template)
  if (fs.existsSync(sharedDir) && fs.readdirSync(sharedDir).length > 0) {
    const outShared = path.join(outDir, 'shared');
    fs.cpSync(sharedDir, outShared, {
      recursive: true,
      filter: (src) => path.basename(src) !== 'sw.js'
    });
    console.log(`  ✓ Linked shared assets into dist/${app}/shared`);
  }

  // Collect assets for service worker offline cache (./ covers the root page; omit index.html to avoid Cloudflare redirect cache bugs)
  const IGNORE_FILES = new Set([
    'sw.js',
    'wrangler.jsonc',
    '_headers',
    'index.html',
    'apple-touch-icon.svg',
    'icon-maskable.svg'
  ]);
  const assets = ['./'];

  function collectAssets(dir, baseRel = '.') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // skip .git, .assetsignore, etc.
      if (entry.isDirectory()) {
        collectAssets(path.join(dir, entry.name), `${baseRel}/${entry.name}`);
      } else {
        if (IGNORE_FILES.has(entry.name) || entry.name.endsWith('.map')) continue;
        assets.push(`${baseRel}/${entry.name}`);
      }
    }
  }

  collectAssets(outDir);

  // Compile shared/sw.js template into dist/<app>/sw.js
  const swTemplatePath = path.join(sharedDir, 'sw.js');
  if (fs.existsSync(swTemplatePath)) {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    let swContent = fs.readFileSync(swTemplatePath, 'utf8');
    const appTitle = app === 'bread' ? 'Bread Nerd' : 'Pizza Nerd';
    swContent = swContent
      .replace(/__APP_TITLE__/g, appTitle)
      .replace(/__APP__/g, app)
      .replace(/__VERSION__/g, pkg.version)
      .replace('__ASSETS__', JSON.stringify(assets, null, 2));

    fs.writeFileSync(path.join(outDir, 'sw.js'), swContent, 'utf8');
    console.log(`  ✓ Generated dist/${app}/sw.js with ${assets.length} cached assets`);
  }

  // Count files
  let fileCount = 0;
  function countFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        countFiles(path.join(dir, entry.name));
      } else {
        fileCount++;
      }
    }
  }
  countFiles(outDir);

  console.log(`✓ Successfully assembled dist/${app} (${fileCount} files)\n`);
}

if (require.main === module) {
  const appsToBuild = target ? [target] : VALID_APPS;
  appsToBuild.forEach(buildApp);
}

module.exports = { buildApp, VALID_APPS };
