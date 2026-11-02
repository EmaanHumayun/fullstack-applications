# Engineering Hub Pro (v2.0)
## Production-Grade Portfolio, Personal Knowledge Management & Super Admin Workspace

Engineering Hub Pro is a high-performance, full-stack software engineering platform designed to manage technical portfolios, acyclic hierarchical project trees, architectural knowledge bases, learning roadmaps, skills matrix, verified credentials, and time-tracked engineering worklogs.

It features a **Super Admin Control Center**, centralized **Role-Based Access Control (RBAC)**, server-enforced publication filters, a unified Recycle Bin with archive/restore capabilities, and a dynamic editorial theme system based on a curated warm brand palette (`#6f1d1b`, `#bb9457`, `#432818`, `#99582a`, `#ffe6a7`).

---

## Key Modules & Capabilities

1. **Super Admin Control Center (`/admin/super`)**
   - Server-enforced highest application authority (`super_admin`).
   - Granular RBAC user management (`super_admin`, `admin`, `editor`, `viewer`).
   - Live system health telemetry (database state, memory, storage adapters, uptime).
   - Immutable audit logging with credential redaction.
   - Comprehensive system backup data export (JSON archive excluding credentials).
   - Protected danger zone with demotion protection for the last Super Admin.

2. **Hierarchical Project & Collection Engine (`/admin/projects` & `/admin/folders`)**
   - Directed Acyclic Graph (DAG) cycle-prevention engine (`willCreateCycle`).
   - Nested workspaces, repositories, subprojects, and collections.
   - Weighted milestone task checklist with dynamic project progress calculation.
   - Safe deletion policies: Reparent children to root or recursive Cascade Deletion.
   - Separate links for GitHub repository, live production deployment, and custom resources.

3. **Skills Matrix (`/admin/skills`)**
   - Granular technical skills categorized by domain (Backend, AI, DevOps, Architecture).
   - Owner-controlled proficiency representations, associated projects, and display ordering.

4. **Interactive Roadmaps (`/admin/roadmaps`)**
   - Multi-stage learning journeys and technical milestones.
   - Interactive step toggling with server-calculated progress formulas.

5. **Engineering Work Logs (`/admin/work-logs`)**
   - Daily focused coding and architecture session logging.
   - Duration tracking, project linkage, skill tags, and weekly velocity summaries.

6. **Strategic Milestones & Goals (`/admin/milestones` & `/admin/goals`)**
   - Major professional wins, credential verification links, and quarterly engineering OKRs.

7. **Certificates & Qualifications (`/admin/certificates`)**
   - Multi-tier cloud storage uploads (Supabase Storage / Cloudinary / Local Disk).
   - Verifiable badge links, credential IDs, issue/expiry dates, and proof attachments.

8. **Personal Knowledge Management (PKM) (`/admin/notes`)**
   - Rich technical concept breakdowns and architecture trade-offs.
   - Live Markdown editing with split-view and XSS-safe native React AST rendering (`SafeMarkdown`).

9. **Dynamic Editorial Brand Palette (`/admin/themes`)**
   - Live CSS variable injection across both public portfolio and administrative dashboard.
   - Pre-configured palettes (Warm Editorial, Deep Midnight, Forest & Clay, etc.) + custom palette creator.

10. **Unified Recycle Bin (`/admin/archive`)**
    - Multi-module archive/restore engine preventing accidental data loss.
    - Permanent destruction requires explicit confirmation modals.

11. **Public Portfolio (`/`, `/projects`, `/projects/:slug`, `/notes`)**
    - Editorial typography (`Playfair Display`, `DM Sans`), GSAP entrance animations.
    - Strict server-side enforcement: Draft and archived records are strictly excluded.
    - Interactive Project Tree view and responsive Grid view.

---

## Architecture & Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS 3.4, GSAP, Lucide React Icons.
- **Backend**: Node.js, Express 4.21, Mongoose 8.9 (MongoDB Atlas or embedded zero-config in-memory engine fallback).
- **Authentication**: JWT tokens transmitted via `HttpOnly`, `SameSite` cookies and `Bearer` Authorization headers with brute-force rate limiting.
- **Storage**: Pluggable storage pipeline (Supabase Storage → Cloudinary → Local uploads disk fallback).
- **Security**: Strict Zod validation schemas, XSS-safe markdown parsing, credential masking, CSP-friendly headers.

---

## Local Development & Setup

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### 1. Installation
Clone or navigate to the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Copy the provided `.env.example` to `.env`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI="your_mongodb_atlas_connection_string"
JWT_SECRET="your_long_random_jwt_secret_key"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD_HASH="$2a$12$your_bcrypt_password_hash"
CLIENT_ORIGIN=http://localhost:5173
```
*(If `MONGODB_URI` is omitted or unavailable, the backend automatically boots an in-memory MongoDB instance for immediate local evaluation).*

### 3. Running the Application
Run the backend and frontend dev server:
```bash
# Terminal 1: Backend API Engine
npm start

# Terminal 2: Frontend Vite Development Server
npm run dev
```

Visit:
- **Public Portfolio**: `http://localhost:5173`
- **Admin Workspace**: `http://localhost:5173/admin`
- **Super Admin Control Center**: `http://localhost:5173/admin/super`

---

## Testing & Build Verification

The application includes an automated test suite verifying 13 system suites:
```bash
# Run backend API and RBAC test suite
npm test

# Run production frontend bundle build
npm run build
```

Both tests pass with **0 errors**.

---

## License
MIT License. Built for high-reliability technical portfolios and engineering hubs.
