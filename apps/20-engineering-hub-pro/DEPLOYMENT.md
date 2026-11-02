# Production Deployment Guide — Engineering Hub Pro

This document provides operational instructions for deploying Engineering Hub Pro to production environments (Vercel, Render, Railway, AWS, or Docker).

---

## 1. Deployment Topology

Because Engineering Hub Pro consists of a React 18 single-page application and a persistent Express 4 backend with background tasks and Mongoose connection pooling, the recommended production architecture is:

- **Frontend**: Vercel (Static Edge CDN distribution of Vite bundle `/dist`).
- **Backend**: Node.js Container Service (Render, Railway, Fly.io, Heroku, or AWS App Runner).
- **Database**: MongoDB Atlas Replica Set (M0 free tier or dedicated M10+).
- **Storage**: Supabase Storage Bucket or Cloudinary for image and PDF credential assets.

*(Alternatively, both frontend and backend can run on a single unified VPS or Docker container with Nginx reverse proxying).*

---

## 2. Environment Variables Reference

| Variable | Required | Description | Example / Recommended Value |
| :--- | :---: | :--- | :--- |
| `PORT` | Yes | HTTP listening port | `5000` (or injected by host) |
| `NODE_ENV` | Yes | Runtime environment | `production` |
| `MONGODB_URI` | Yes | MongoDB Atlas replica set URI | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `JWT_SECRET` | Yes | Cryptographic secret for signing tokens | Minimum 32 random characters |
| `JWT_EXPIRES_IN` | No | Token lifetime | `8h` or `7d` |
| `ADMIN_EMAIL` | Yes | Initial Super Admin email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD_HASH` | Yes | Bcrypt hash for initial Super Admin | Output of `node scripts/hash-password.js <password>` |
| `CLIENT_ORIGIN` | Yes | Permitted frontend origins (CORS) | `https://your-portfolio.vercel.app,http://localhost:5173` |
| `SUPABASE_URL` | Optional | Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-side storage key | `sb_publishable_...` or service role secret |
| `SUPABASE_BUCKET` | Optional | Storage bucket name | `engineering-hub` |
| `MAX_UPLOAD_MB` | No | Max file upload size | `10` |

---

## 3. Step-by-Step Production Deployment

### Step A: Database Provisioning (MongoDB Atlas)
1. In your MongoDB Atlas dashboard, navigate to **Network Access**.
2. Add an IP Access rule: Allow Access from Anywhere (`0.0.0.0/0`) or configure VPC peering if deploying to AWS/GCP.
3. In **Database Access**, verify your database user has `readWriteAnyDatabase` or permissions for your specific target database.

### Step B: Backend Deployment (Render / Railway / Docker)
1. Connect your repository to your cloud provider.
2. Configure build and start commands:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. In Environment Variables, input all variables from the table above.
4. Verify the backend health endpoint:
   ```bash
   curl -I https://your-backend-api.onrender.com/api/health
   ```
   *Expected Response: HTTP 200 with `{"ok":true,"dbState":"connected"}`.*

### Step C: Frontend Deployment (Vercel)
1. Import your repository into Vercel.
2. Framework Preset: **Vite**.
3. Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In Vercel Project Settings → Environment Variables:
   - Set `VITE_API_URL` to your deployed backend URL: `https://your-backend-api.onrender.com/api`.
5. Deploy.

---

## 4. Post-Deployment Verification Checklist

- [ ] Visit `https://your-frontend.vercel.app/api/health` (or your backend URL) and verify DB connection state.
- [ ] Visit public portfolio home `/` and verify default seeded content loads without console errors.
- [ ] Sign in to `/admin/login` using your configured Super Admin credentials.
- [ ] Access the Super Admin Control Center (`/admin/super`) and check live telemetry.
- [ ] Upload a test certificate and verify attachment URL persists correctly.
- [ ] Create a project in draft status; verify it does **not** appear on `/projects`.
- [ ] Publish the project; verify it appears immediately on `/projects`.
- [ ] Test the Recycle Bin by archiving and restoring a skill or project.

---

## 5. Troubleshooting Common Issues

### Issue 1: "MongoDB connection timeout (MongooseServerSelectionError)"
- **Cause**: Atlas IP whitelist is blocking your host container IP.
- **Remedy**: In Atlas dashboard under **Network Access**, ensure `0.0.0.0/0` is whitelisted.

### Issue 2: "CORS policy: No 'Access-Control-Allow-Origin' header is present"
- **Cause**: Backend `CLIENT_ORIGIN` does not match the frontend production URL.
- **Remedy**: Update `CLIENT_ORIGIN` in backend environment variables to include `https://your-domain.vercel.app` (without trailing slash).

### Issue 3: "Invalid or expired session"
- **Cause**: Cookie blocked due to HTTPS mismatch.
- **Remedy**: Ensure `NODE_ENV=production` is set so cookies are configured with `SameSite=None; Secure`.
