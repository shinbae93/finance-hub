/* eslint-disable @nx/enforce-module-boundaries */
const path = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const preset = require('../../libs/web-ui/tailwind.preset.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    path.join(__dirname, '../../libs/web-ui/src/**/*.{ts,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: { extend: {} },
  plugins: [],
};
