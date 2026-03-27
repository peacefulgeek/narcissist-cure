import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Start web server
const web = spawn('node', [resolve(__dirname, '../dist/server/index.js')], {
  stdio: 'inherit',
  env: { ...process.env },
});

web.on('error', (err) => {
  console.error('[web] Failed to start:', err);
  process.exit(1);
});

web.on('exit', (code) => {
  console.log(`[web] Exited with code ${code}`);
  process.exit(code || 0);
});

// Start cron worker
const cron = spawn('node', [resolve(__dirname, 'cron-worker.mjs')], {
  stdio: 'inherit',
  env: { ...process.env },
});

cron.on('error', (err) => {
  console.error('[cron] Failed to start:', err);
});

cron.on('exit', (code) => {
  console.log(`[cron] Exited with code ${code}`);
});

// Handle shutdown
process.on('SIGTERM', () => {
  web.kill('SIGTERM');
  cron.kill('SIGTERM');
});

process.on('SIGINT', () => {
  web.kill('SIGINT');
  cron.kill('SIGINT');
});
