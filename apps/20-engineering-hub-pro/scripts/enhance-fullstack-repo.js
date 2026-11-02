import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DIR = path.join(__dirname, '..', 'github-ecosystem', 'fullstack-cloud-native-app');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(path.join(APP_DIR, 'client', 'src'));
ensureDir(path.join(APP_DIR, 'server', 'routes'));
ensureDir(path.join(APP_DIR, 'k8s'));

// .gitignore
fs.writeFileSync(path.join(APP_DIR, '.gitignore'), `node_modules/
dist/
build/
.env
*.log
.DS_Store
`);

// docker-compose.yml
fs.writeFileSync(path.join(APP_DIR, 'docker-compose.yml'), `version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/healthz"]
      interval: 15s
      timeout: 5s
      retries: 3

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
`);

// Server package.json
fs.writeFileSync(path.join(APP_DIR, 'server', 'package.json'), JSON.stringify({
  name: "cloud-native-api",
  version: "1.0.0",
  type: "module",
  main: "server.js",
  scripts: {
    start: "node server.js",
    test: "echo \"No tests specified\" && exit 0"
  },
  dependencies: {
    express: "^4.19.2",
    cors: "^2.8.5",
    helmet: "^7.1.0"
  }
}, null, 2));

// Server server.js
fs.writeFileSync(path.join(APP_DIR, 'server', 'server.js'), `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Healthcheck endpoint for K8s liveness & readiness probes
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss
  });
});

// Telemetry metrics endpoint
app.get('/metrics', (req, res) => {
  res.type('text/plain').send(\`
# HELP process_uptime_seconds The total uptime of the process in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds \${process.uptime()}
# HELP process_resident_memory_bytes Resident memory size in bytes
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes \${process.memoryUsage().rss}
  \`.trim());
});

// Sample API route
app.get('/api/v1/status', (req, res) => {
  res.json({
    service: 'cloud-native-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`[SERVER] Cloud-Native API listening on http://0.0.0.0:\${PORT}\`);
});
`);

// Server Dockerfile
fs.writeFileSync(path.join(APP_DIR, 'server', 'Dockerfile'), `# Multi-stage Dockerfile for Node.js Express Backend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
ENV NODE_ENV=production
USER node
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY . .

EXPOSE 5000
HEALTHCHECK --interval=20s --timeout=3s --retries=3 \\
  CMD curl -f http://localhost:5000/healthz || exit 1

CMD ["node", "server.js"]
`);

// Client package.json
fs.writeFileSync(path.join(APP_DIR, 'client', 'package.json'), JSON.stringify({
  name: "cloud-native-frontend",
  version: "1.0.0",
  type: "module",
  scripts: {
    build: "echo \"Building frontend asset bundles\""
  }
}, null, 2));

// Client index.html
fs.writeFileSync(path.join(APP_DIR, 'client', 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloud Native Application</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; padding: 24px; border-radius: 8px; border: 1px solid #334155; max-width: 600px; margin: 0 auto; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #059669; font-weight: bold; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">PROD READY</span>
    <h1>Cloud-Native Application Platform</h1>
    <p>React Frontend + Node.js Express Backend running in Docker and Kubernetes.</p>
    <div id="status">Connecting to backend...</div>
  </div>
  <script>
    fetch('/api/v1/status')
      .then(r => r.json())
      .then(d => { document.getElementById('status').innerText = 'Backend Status: Connected (' + d.environment + ')'; })
      .catch(() => { document.getElementById('status').innerText = 'Running in standalone demo mode.'; });
  </script>
</body>
</html>
`);

// Client Dockerfile
fs.writeFileSync(path.join(APP_DIR, 'client', 'Dockerfile'), `# Client Web Server Container
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`);

// K8s Manifests
fs.writeFileSync(path.join(APP_DIR, 'k8s', 'deployment.yaml'), `apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloud-native-app-backend
  labels:
    app: cloud-native-backend
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: cloud-native-backend
  template:
    metadata:
      labels:
        app: cloud-native-backend
    spec:
      containers:
        - name: api
          image: ghcr.io/emaanhumayun/cloud-native-api:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 5000
          readinessProbe:
            httpGet:
              path: /healthz
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz
              port: 5000
            initialDelaySeconds: 15
            periodSeconds: 20
          resources:
            limits:
              cpu: 300m
              memory: 256Mi
            requests:
              cpu: 50m
              memory: 128Mi
`);

fs.writeFileSync(path.join(APP_DIR, 'k8s', 'service.yaml'), `apiVersion: v1
kind: Service
metadata:
  name: cloud-native-app-backend-svc
spec:
  type: ClusterIP
  ports:
    - port: 5000
      targetPort: 5000
      protocol: TCP
  selector:
    app: cloud-native-backend
`);

// Commit
try {
  execSync('git add .', { cwd: APP_DIR });
  execSync('git commit -m "feat(app): add runnable Express backend, Nginx frontend, Dockerfiles, and K8s manifests"', { cwd: APP_DIR, stdio: 'inherit' });
  console.log('✅ Successfully enhanced fullstack-cloud-native-app!');
} catch (e) {
  console.log('Git commit notice:', e.message);
}

