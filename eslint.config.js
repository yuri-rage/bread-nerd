module.exports = [
  {
    files: ['bread/app.js', 'pizza/app.js', 'shared/core.js', 'shared/sw.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        KitchenCore: 'readonly',
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        getComputedStyle: 'readonly',
        matchMedia: 'readonly',
        AudioContext: 'readonly',
        Event: 'readonly',
        location: 'readonly',
        self: 'readonly',
        globalThis: 'readonly',
        performance: 'readonly',
        fetch: 'readonly',
        caches: 'readonly',
        URL: 'readonly',
        Response: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error'
    }
  }
];
