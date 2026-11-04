import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = path.join(__dirname, '..', 'github-ecosystem', 'devops-practice-labs');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// Module 01: Linux & Automation
ensureDir(path.join(BASE, 'module-01-linux-automation', 'docs'));
fs.writeFileSync(path.join(BASE, 'module-01-linux-automation', 'README.md'), `# Module 01: Linux Administration & Shell Automation

## Objective
Master foundational Linux system administration, service management, cron scheduling, and bash scripting for automated maintenance.

## Exercises Included
1. **Health Check Script (\`scripts/health-check.sh\`):**
   - Monitors CPU usage, Memory availability, Disk space, and active zombie processes.
   - Emits alerts when thresholds (>85% disk, >90% memory) are exceeded.
2. **Backup & Rotation Daemon (\`scripts/backup-and-rotate.sh\`):**
   - Creates timestamped tarball archives of critical application directories.
   - Enforces a 7-day retention policy, automatically purging expired archives.

## How to Run & Verify
\`\`\`bash
# 1. Make executable
chmod +x scripts/*.sh

# 2. Run system health check
./scripts/health-check.sh

# 3. Test backup rotation
./scripts/backup-and-rotate.sh /tmp/test-data /tmp/backups
\`\`\`
`);

// Module 02: Docker Containerization
ensureDir(path.join(BASE, 'module-02-docker-containerization'));
fs.writeFileSync(path.join(BASE, 'module-02-docker-containerization', 'README.md'), `# Module 02: Production Docker & Multi-Stage Builds

## Objective
Package modern applications into secure, lightweight, and deterministic container images adhering to production standards:
- Multi-stage build compilation to eliminate build dependencies from runtime images.
- Non-root user execution (\`USER node\` / \`appuser\`) to adhere to least privilege.
- Layer caching optimization to minimize build duration.

## Files
- \`Dockerfile\`: Optimized multi-stage build template.
- \`docker-compose.yml\`: Multi-container topology connecting application, database, and cache.

## Build and Run
\`\`\`bash
docker build -t app:v1.0 .
docker compose up -d
\`\`\`
`);

// Module 03: Kubernetes Orchestration
ensureDir(path.join(BASE, 'module-03-kubernetes-orchestration', 'manifests'));
fs.writeFileSync(path.join(BASE, 'module-03-kubernetes-orchestration', 'manifests', 'service.yaml'), `apiVersion: v1
kind: Service
metadata:
  name: cloud-native-app-service
  labels:
    app: cloud-native-app
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 5000
      protocol: TCP
      name: http
  selector:
    app: cloud-native-app
`);

fs.writeFileSync(path.join(BASE, 'module-03-kubernetes-orchestration', 'manifests', 'configmap.yaml'), `apiVersion: v1
kind: ConfigMap
metadata:
  name: cloud-native-app-config
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "5000"
  CACHE_TTL_SECONDS: "300"
`);

fs.writeFileSync(path.join(BASE, 'module-03-kubernetes-orchestration', 'README.md'), `# Module 03: Kubernetes Manifests & Pod Lifecycle

## Objective
Deploy declarative, resilient workloads to Kubernetes clusters using production-grade configurations:
- Rolling updates with \`maxSurge\` and \`maxUnavailable\` controls.
- Liveness and readiness HTTP probes for automatic self-healing.
- Decoupled application configuration via ConfigMaps and Secrets.
- Resource request and limit bounds to prevent noisy neighbor starvation.

## Manifests
- \`manifests/deployment.yaml\`: Declarative Deployment with probes and securityContext.
- \`manifests/service.yaml\`: Internal ClusterIP routing traffic to active pods.
- \`manifests/configmap.yaml\`: Decoupled runtime configuration parameters.

## Apply Manifests
\`\`\`bash
kubectl apply -f manifests/configmap.yaml
kubectl apply -f manifests/deployment.yaml
kubectl apply -f manifests/service.yaml

# Verify rollout status
kubectl rollout status deployment/cloud-native-app-deployment
\`\`\`
`);

// Module 04: Networking Troubleshooting
ensureDir(path.join(BASE, 'module-04-networking-troubleshooting', 'scripts'));
fs.writeFileSync(path.join(BASE, 'module-04-networking-troubleshooting', 'scripts', 'network-diagnostics.sh'), `#!/usr/bin/env bash
# Network Diagnostics & Port Reachability Validator
set -euo pipefail

TARGET_HOST="\${1:-1.1.1.1}"
TARGET_PORT="\${2:-80}"

echo "================================================="
echo "  🌐 Running Network Diagnostics for $TARGET_HOST"
echo "================================================="

echo -n "[1] Checking DNS resolution... "
if host "$TARGET_HOST" >/dev/null 2>&1; then
    echo "OK"
else
    echo "SKIPPED/IP DIRECT"
fi

echo -n "[2] Checking ICMP ping connectivity... "
if ping -c 2 -W 2 "$TARGET_HOST" >/dev/null 2>&1; then
    echo "SUCCESS"
else
    echo "ICMP BLOCKED OR HOST UNREACHABLE"
fi

echo -n "[3] Checking TCP port $TARGET_PORT connectivity... "
if nc -z -w 3 "$TARGET_HOST" "$TARGET_PORT" 2>/dev/null; then
    echo "PORT OPEN"
else
    echo "PORT CLOSED OR FILTERED"
fi
echo "================================================="
`);

fs.writeFileSync(path.join(BASE, 'module-04-networking-troubleshooting', 'README.md'), `# Module 04: Computer Networking & Production Troubleshooting

## Objective
Deep dive into TCP/IP fundamentals, DNS resolution hierarchies, HTTP/HTTPS handshake inspection, and connectivity triage in containerized environments.

## Tooling & Commands
- \`curl -iv\`: Full TLS and HTTP header handshake analysis.
- \`dig\` / \`nslookup\`: DNS propagation and record validation.
- \`netstat\` / \`ss -tulpn\`: Listening port and socket diagnostics.
- \`nc -zv\`: TCP/UDP socket connectivity verification.
`);

// Module 07: Helm Packaging
ensureDir(path.join(BASE, 'module-07-helm-packaging', 'chart', 'templates'));
fs.writeFileSync(path.join(BASE, 'module-07-helm-packaging', 'chart', 'Chart.yaml'), `apiVersion: v2
name: cloud-native-service
description: Production-grade Helm chart for cloud-native web services
type: application
version: 1.0.0
appVersion: "1.0.0"
maintainers:
  - name: Emaan Humayun
    email: emaanhumayun23072@gmail.com
`);

fs.writeFileSync(path.join(BASE, 'module-07-helm-packaging', 'chart', 'values.yaml'), `replicaCount: 3

image:
  repository: ghcr.io/emaanhumayun/cloud-native-app
  pullPolicy: IfNotPresent
  tag: "1.0.0"

service:
  type: ClusterIP
  port: 80
  targetPort: 5000

resources:
  limits:
    cpu: 250m
    memory: 256Mi
  requests:
    cpu: 50m
    memory: 128Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 75
`);

fs.writeFileSync(path.join(BASE, 'module-07-helm-packaging', 'README.md'), `# Module 07: Helm Chart Packaging & Templating

## Objective
Standardize Kubernetes workload deployment across environments (Dev, Staging, Production) using Helm v3 parameterization.

## Chart Structure
- \`chart/Chart.yaml\`: Chart metadata and semantic versioning.
- \`chart/values.yaml\`: Configurable deployment parameters (replicas, resources, image tags).

## Lint & Package
\`\`\`bash
helm lint ./chart
helm template test-release ./chart
\`\`\`
`);

// Module 08: Observability
ensureDir(path.join(BASE, 'module-08-observability-telemetry', 'prometheus'));
fs.writeFileSync(path.join(BASE, 'module-08-observability-telemetry', 'prometheus', 'prometheus.yml'), `global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts.yml"

scrape_configs:
  - job_name: "cloud-native-services"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["app:5000"]
`);

fs.writeFileSync(path.join(BASE, 'module-08-observability-telemetry', 'prometheus', 'alerts.yml'), `groups:
  - name: service_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High 5xx error rate detected on {{ $labels.instance }}"
`);

fs.writeFileSync(path.join(BASE, 'module-08-observability-telemetry', 'README.md'), `# Module 08: Observability, Metrics & Telemetry

## Objective
Establish complete system visibility through metrics collection, custom Prometheus scrapers, and automated alerting thresholds for production reliability.
`);

// Commit changes
try {
  execSync('git add .', { cwd: BASE });
  execSync('git commit -m "docs(labs): add complete exercise documentation, manifests, helm chart, and monitoring rules"', { cwd: BASE, stdio: 'inherit' });
  console.log('✅ Successfully enhanced devops-practice-labs!');
} catch (e) {
  console.log('Git commit notice:', e.message);
}

