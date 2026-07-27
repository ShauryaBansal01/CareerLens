import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', '**/*-report/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          // eslint-plugin-react isn't installed, so JSX usage of an
          // identifier doesn't count as a reference. Capitalised names are
          // therefore exempt — they're components rendered in JSX.
          varsIgnorePattern: '^[A-Z_]|^motion$',
          argsIgnorePattern: '^[A-Z_]|^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Only affects hot-reload ergonomics in dev, never correctness — a
      // component file that also exports a variants map or a context should
      // not be able to fail the build.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Vitest injects describe/it/expect as globals; without this every test
    // file fails `no-undef` and takes the whole lint run down with it.
    files: ['**/*.{test,spec}.{js,jsx}', 'src/tests/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.vitest, ...globals.node },
    },
  },
  {
    // Playwright specs and its config run in Node, not the browser.
    files: ['e2e/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Vite / Tailwind / PostCSS configs are Node-side modules.
    files: ['*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
])
