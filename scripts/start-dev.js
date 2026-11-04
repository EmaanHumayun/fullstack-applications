import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('[STARTUP] Launching Engineering Hub Pro (Backend + Frontend)...');

// 1. Start Express Backend API Server (Port 5000)
const backend = spawn('node', ['server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

// 2. Start Vite Frontend Server (Port 5173)
const frontend = spawn('npx', ['vite', '--host', 'localhost', '--port', '5173'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

backend.on('close', code => {
  console.log(`[BACKEND] Process exited with code ${code}`);
  frontend.kill();
  process.exit(code || 0);
});

frontend.on('close', code => {
  console.log(`[FRONTEND] Process exited with code ${code}`);
  backend.kill();
  process.exit(code || 0);
});

const cleanup = () => {
  console.log('[SHUTDOWN] Stopping all servers...');
  try { backend.kill(); } catch {}
  try { frontend.kill(); } catch {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

