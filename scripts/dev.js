#!/usr/bin/env node

/**
 * Dev Server with live-rebuild for Bread Nerd & Pizza Nerd Monorepo
 * Serves both companion apps locally without external dependencies.
 *
 * URLs:
 *   Bread Nerd: http://localhost:8080/ (or http://localhost:8080/bread/)
 *   Pizza Nerd: http://localhost:8080/pizza/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildApp } = require('./build.js');

const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.PORT, 10) || 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Initial build
console.log('📦 Assembling initial builds...');
buildApp('bread');
buildApp('pizza');

// File watcher with debouncing
let debounceTimer = null;
function watchDirectory(dirPath, targetApp) {
  if (!fs.existsSync(dirPath)) return;
  fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
    if (!filename || filename.includes('node_modules') || filename.includes('.git') || filename.includes('dist')) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\n🔄 File changed (${filename}), rebuilding...`);
      if (targetApp === 'shared') {
        buildApp('bread');
        buildApp('pizza');
      } else {
        buildApp(targetApp);
      }
    }, 150);
  });
}

watchDirectory(path.join(ROOT, 'bread'), 'bread');
watchDirectory(path.join(ROOT, 'pizza'), 'pizza');
watchDirectory(path.join(ROOT, 'shared'), 'shared');

// HTTP Request Handler
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Set no-cache for local dev
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  let filePath = null;

  if (pathname.startsWith('/pizza')) {
    let sub = pathname.replace(/^\/pizza\/?/, '');
    if (!sub || sub === '') sub = 'index.html';
    filePath = path.join(ROOT, 'dist', 'pizza', sub);
  } else if (pathname.startsWith('/bread')) {
    let sub = pathname.replace(/^\/bread\/?/, '');
    if (!sub || sub === '') sub = 'index.html';
    filePath = path.join(ROOT, 'dist', 'bread', sub);
  } else if (pathname.startsWith('/shared/')) {
    const sub = pathname.replace(/^\/shared\//, '');
    filePath = path.join(ROOT, 'dist', 'bread', 'shared', sub);
  } else {
    // Default root serves bread
    let sub = pathname.replace(/^\//, '');
    if (!sub || sub === '') sub = 'index.html';
    filePath = path.join(ROOT, 'dist', 'bread', sub);
  }

  // Fallback for directory without trailing slash
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 Not Found: ${pathname}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Kitchen Nerd Dev Server is running at http://localhost:${PORT}`);
  console.log(`   🍞 Bread Nerd: http://localhost:${PORT}/ (or http://localhost:${PORT}/bread/)`);
  console.log(`   🍕 Pizza Nerd: http://localhost:${PORT}/pizza/\n`);
  console.log(`👀 Watching bread/, pizza/, and shared/ for live updates...\n`);
});
