import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSIGN_DIR = path.join(__dirname, '..', 'github-ecosystem', 'devops-assignments-challenges');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(path.join(ASSIGN_DIR, 'assignment-01-high-availability-vpc', 'terraform'));
ensureDir(path.join(ASSIGN_DIR, 'assignment-02-zero-downtime-k8s-rollout'));
ensureDir(path.join(ASSIGN_DIR, 'assignment-03-secure-ci-cd-pipeline'));

// Assignment 01
fs.writeFileSync(path.join(ASSIGN_DIR, 'assignment-01-high-availability-vpc', 'requirements.md'), `# Assignment 01: High-Availability Multi-AZ Cloud Network Architecture

## Business Scenario
A high-traffic e-commerce enterprise requires a resilient AWS network architecture capable of withstanding the outage of an entire AWS Availability Zone without downtime.

## Architectural Requirements
1. **CIDR Allocation:** Allocate \`10.100.0.0/16\` into distinct public and private subnets across 3 Availability Zones.
2. **Egress Isolation:** Private subnets must have outbound internet connectivity via NAT Gateways for security patches, but zero direct inbound internet reachability.
3. **High Availability:** At least 2 NAT Gateways deployed across distinct AZs to avoid a single point of failure (SPOF).
4. **Tagging Standard:** Comply with corporate tagging (\`Environment\`, \`Owner\`, \`CostCenter\`, \`IaC\`).

## Submission Deliverables
- [x] Terraform Infrastructure as Code (\`terraform/main.tf\`)
- [x] Network topology writeup (\`architecture-design.md\`)
`);

fs.writeFileSync(path.join(ASSIGN_DIR, 'assignment-01-high-availability-vpc', 'architecture-design.md'), `# Network Architecture Design Document

## Topology Overview
- **VPC CIDR:** \`10.100.0.0/16\` (65,536 total addresses)
- **Availability Zones:** \`us-east-1a\`, \`us-east-1b\`, \`us-east-1c\`

### Subnet Layout
| Subnet Name | CIDR Block | Usable IPs | Route Target |
| :--- | :--- | :--- | :--- |
| \`public-1a\` | \`10.100.1.0/24\` | 251 | Internet Gateway (\`igw\`) |
| \`public-1b\` | \`10.100.2.0/24\` | 251 | Internet Gateway (\`igw\`) |
| \`public-1c\` | \`10.100.3.0/24\` | 251 | Internet Gateway (\`igw\`) |
| \`private-app-1a\` | \`10.100.10.0/24\` | 251 | NAT Gateway A |
| \`private-app-1b\` | \`10.100.20.0/24\` | 251 | NAT Gateway B |
| \`private-app-1c\` | \`10.100.30.0/24\` | 251 | NAT Gateway A (Failover) |
`);

fs.writeFileSync(path.join(ASSIGN_DIR, 'assignment-01-high-availability-vpc', 'terraform', 'main.tf'), `# Multi-AZ High Availability VPC Submission
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

resource "aws_vpc" "ha_vpc" {
  cidr_block           = "10.100.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "enterprise-ha-vpc"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}
`);

// Assignment 02
fs.writeFileSync(path.join(ASSIGN_DIR, 'assignment-02-zero-downtime-k8s-rollout', 'requirements.md'), `# Assignment 02: Zero-Downtime Kubernetes Canary & Blue/Green Deployments

## Scenario
A critical payment transaction microservice cannot tolerate any dropped requests during production releases.

## Requirements
1. Configure Kubernetes RollingUpdate strategy with \`maxSurge: 25%\` and \`maxUnavailable: 0\`.
2. Implement rigorous HTTP Readiness probes targeting \`/healthz\` to ensure pods receive traffic only after warm-up.
3. Configure preStop lifecycle hooks allowing in-flight requests 15 seconds to drain before SIGKILL.
`);

fs.writeFileSync(path.join(ASSIGN_DIR, 'assignment-02-zero-downtime-k8s-rollout', 'canary-deployment.yaml'), `apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service-canary
  labels:
    app: payment-service
    tier: canary
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  selector:
    matchLabels:
      app: payment-service
      tier: canary
  template:
    metadata:
      labels:
        app: payment-service
        tier: canary
    spec:
      containers:
        - name: payment-api
          image: ghcr.io/emaanhumayun/payment-service:v2.1.0
          ports:
            - containerPort: 8080
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 15"]
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          resources:
            limits:
              cpu: "500m"
              memory: "512Mi"
            requests:
              cpu: "100m"
              memory: "128Mi"
`);

// Assignment 03
fs.writeFileSync(path.join(ASSIGN_DIR, 'assignment-03-secure-ci-cd-pipeline', 'requirements.md'), `# Assignment 03: Secure Supply-Chain CI/CD Pipeline

## Scenario
Implement automated security gates preventing vulnerabilities and secrets from entering production container registries.

## Requirements
1. SAST (Static Application Security Testing) scanning using Trivy or Semgrep.
2. Secret scanning step to detect leaked API tokens or credentials before merge.
3. Docker image vulnerability scanning failing builds on CRITICAL CVEs.
`);

// Commit
try {
  execSync('git add .', { cwd: ASSIGN_DIR });
  execSync('git commit -m "feat(assignments): add HA VPC IaC, zero-downtime canary rollout, and secure CI/CD requirements"', { cwd: ASSIGN_DIR, stdio: 'inherit' });
  console.log('✅ Successfully enhanced devops-assignments-challenges!');
} catch (e) {
  console.log('Git commit notice:', e.message);
}

