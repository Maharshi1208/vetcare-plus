import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: 'http://localhost:5173' // update if frontend runs at a different port
  },
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['list']
  ]
});
