// Cron worker — runs Mon-Fri at 12:00 UTC (6AM MDT)
// Triggers article generation pipeline

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CRON_HOUR = 12;
const CRON_MINUTE = 0;
const TIMEOUT_MS = 600_000; // 10 minutes

function isWeekday() {
  const day = new Date().getUTCDay();
  return day >= 1 && day <= 5;
}

function msUntilNextRun() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(CRON_HOUR, CRON_MINUTE, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  while (next.getUTCDay() === 0 || next.getUTCDay() === 6) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - now.getTime();
}

async function runGeneration() {
  if (!isWeekday()) {
    console.log('[cron] Not a weekday, skipping.');
    return;
  }

  console.log('[cron] Starting article generation...');
  const child = spawn('node', [resolve(__dirname, 'generate-articles.mjs')], {
    stdio: 'inherit',
    env: { ...process.env },
    timeout: TIMEOUT_MS,
  });

  return new Promise((res) => {
    child.on('exit', (code) => {
      console.log(`[cron] Generation exited with code ${code}`);
      res(undefined);
    });
    child.on('error', (err) => {
      console.error('[cron] Generation error:', err);
      res(undefined);
    });
  });
}

// Check for --run-now flag
if (process.argv.includes('--run-now')) {
  console.log('[cron] Running immediately (--run-now)');
  await runGeneration();
  process.exit(0);
}

// Schedule loop
async function scheduleLoop() {
  while (true) {
    const ms = msUntilNextRun();
    console.log(`[cron] Next run in ${Math.round(ms / 60000)} minutes`);
    await new Promise(r => setTimeout(r, ms));
    await runGeneration();
  }
}

scheduleLoop().catch(err => {
  console.error('[cron] Fatal error:', err);
  process.exit(1);
});
