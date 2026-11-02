# Deployment Runbook & Operational Guide

## 1. Container Build
```bash
docker build -t app-backend:v1.0 ./server
docker build -t app-frontend:v1.0 ./client
```

## 2. Environment Variables Checklist
- `NODE_ENV=production`
- `PORT=5000`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=super_secure_secret`

## 3. Production Healthcheck
Verify service health:
```bash
curl -f http://localhost:5000/healthz
```
