// Cron worker — two-phase publishing schedule
// Phase 1: 5 articles/day drip (articles already exist with future dates, filterPublished handles visibility)
// Phase 2: After all 300 are visible, generate 5 new articles/week via auto-gen pipeline
//
// Runs daily at 06:00 MDT (12:00 UTC) to check if new articles need generating

import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CRON_HOUR = 12; // UTC = 6AM MDT
const CRON_MINUTE = 0;
const TIMEOUT_MS = 600_000; // 10 minutes

function msUntilNextRun() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(CRON_HOUR, CRON_MINUTE, 0, 0);
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - now.getTime();
}

function getAllArticlesCount() {
  try {
    const indexPath = resolve(__dirname, '../content/articles-index.json');
    if (!existsSync(indexPath)) return 0;
    const articles = JSON.parse(readFileSync(indexPath, 'utf-8'));
    return articles.length;
  } catch {
    return 0;
  }
}

function getVisibleCount() {
  try {
    const indexPath = resolve(__dirname, '../content/articles-index.json');
    if (!existsSync(indexPath)) return 0;
    const articles = JSON.parse(readFileSync(indexPath, 'utf-8'));
    const today = new Date().toISOString().split('T')[0];
    return articles.filter(a => a.dateISO <= today).length;
  } catch {
    return 0;
  }
}

function isWeeklyGenDay() {
  // Generate new articles on Monday and Thursday (2 batches of ~2-3 each = ~5/week)
  const day = new Date().getUTCDay();
  return day === 1 || day === 4; // Monday, Thursday
}

async function runGeneration() {
  const total = getAllArticlesCount();
  const visible = getVisibleCount();

  console.log(`[cron] Status: ${visible} visible / ${total} total articles`);

  // Phase 1: All 300 pre-built articles drip out automatically via date filtering
  // No action needed — filterPublished() in the server handles this
  if (visible < total) {
    console.log(`[cron] Phase 1 (drip): ${total - visible} articles still scheduled. No generation needed.`);
    return;
  }

  // Phase 2: All pre-built articles are visible. Generate 5 new per week.
  if (!isWeeklyGenDay()) {
    console.log('[cron] Phase 2: Not a generation day (Mon/Thu only). Skipping.');
    return;
  }

  console.log('[cron] Phase 2: All articles visible. Generating new batch...');
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
    const hours = Math.round(ms / 3600000);
    console.log(`[cron] Next check in ${hours}h (${Math.round(ms / 60000)}min)`);
    await new Promise(r => setTimeout(r, ms));
    await runGeneration();
  }
}

scheduleLoop().catch(err => {
  console.error('[cron] Fatal error:', err);
  process.exit(1);
});
