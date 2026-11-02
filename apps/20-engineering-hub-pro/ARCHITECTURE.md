# Architecture & System Design — Engineering Hub Pro

This document specifies the technical architecture, boundary contracts, data models, and operational invariants governing Engineering Hub Pro.

---

## 1. System Topology & Boundaries

```
┌────────────────────────────────────────────────────────┐
│                   BROWSER CLIENT                      │
│                                                        │
│  Public Visitors              Authenticated Workspace   │
│  - Portfolio Home (/)         - Overview (/admin)      │
│  - Projects (/projects)       - 10 Module Managers     │
│  - Spec Detail (/projects/:s) - Control Center (/super)│
│  - Notes (/notes)             - Recycle Bin (/archive) │
└───────────────────────────┬────────────────────────────┘
                            │
               HTTPS / JSON REST API
               Bearer Token + HttpOnly Cookie
                            │
┌───────────────────────────▼────────────────────────────┐
│                    NODE EXPRESS API                    │
│                                                        │
│  Middleware Layer:                                     │
│  - CORS (CLIENT_ORIGIN whitelist)                      │
│  - Rate Limiter (Brute-force protection on auth)       │
│  - Auth (JWT verification & cookie parsing)            │
│  - RBAC (requireSuperAdmin / requireRole)              │
│  - Audit Logger (recordAuditEvent with redaction)      │
│  - Error Handler (safe JSON responses, no leaks)       │
│                                                        │
│  Service Engines:                                      │
│  - Hierarchy Service (DAG acyclic cycle detection)     │
│  - Progress Service (Weighted tasks & roadmaps)        │
│  - Storage Service (Supabase -> Cloudinary -> Disk)    │
│  - Seed Service (Default themes, profile, tree)        │
└───────────────────────────┬────────────────────────────┘
                            │
         Mongoose ORM 8.9 / Native MongoDB Driver
                            │
┌───────────────────────────▼────────────────────────────┐
│                  PERSISTENCE LAYER                     │
│                                                        │
│  Primary: MongoDB Atlas (Replica Set Cluster)          │
│  Fallback: Embedded Zero-Config In-Memory MongoDB      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Directory Layout & Modular Structure

```
engineering-hub/
├── server.js                   # Application entry point, Express app mounting, error handling
├── server/
│   ├── config/
│   │   ├── env.js              # Environment schema validation (Zod)
│   │   └── db.js               # Dual-mode Mongoose connection with in-memory fallback
│   ├── models/                 # Mongoose schemas with lifecycle indexes & timestamps
│   │   ├── User.js             # RBAC identity (super_admin, admin, editor, viewer)
│   │   ├── AuditLog.js         # Immutable security & change log
│   │   ├── Project.js          # Hierarchical projects, repositories & folders
│   │   ├── Skill.js            # Categorized skills matrix & proficiencies
│   │   ├── Roadmap.js          # Multi-stage learning journeys & steps
│   │   ├── WorkLog.js          # Engineering activity & duration tracking
│   │   ├── Milestone.js        # Strategic achievements & credential evidence
│   │   ├── Goal.js             # Long-term OKRs & targets
│   │   ├── Note.js             # Personal Knowledge Management (Markdown)
│   │   ├── Certificate.js      # Verified credentials & proof documents
│   │   ├── Theme.js            # Editorial design system palettes
│   │   ├── Profile.js          # Public identity & education history
│   │   └── Settings.js         # Application configuration & feature flags
│   ├── middleware/
│   │   ├── auth.js             # Cookie & Bearer JWT validation
│   │   ├── rbac.js             # Role enforcement (requireSuperAdmin, requireRole)
│   │   ├── audit.js            # Automatic audit logging with credential scrubbing
│   │   └── rateLimit.js        # In-memory IP window rate limiting
│   ├── routes/                 # Express REST routers for all modules
│   └── services/
│       ├── hierarchy.js        # DAG cycle prevention & tree generator
│       ├── progress.js         # Mathematical completion metrics
│       ├── storage.js          # Storage adapter pipeline
│       └── seed.js             # Default database bootstrapping
├── src/
│   ├── App.jsx                 # Central router with AdminGate & SuperAdminGate
│   ├── components.jsx          # Shared UI primitives (Modal, Confirm, Toast, EmptyState)
│   ├── components/
│   │   └── Layout.jsx          # Admin shell navigation, role badges, mobile drawer
│   ├── lib/
│   │   ├── api.js              # Fetch client handling auth headers, errors & cookies
│   │   ├── theme.js            # Live CSS variable injector
│   │   └── markdown.jsx        # Native React AST Markdown renderer (XSS-safe)
│   └── pages/
│       ├── PublicHome.jsx      # Editorial portfolio homepage
│       ├── ProjectsPage.jsx    # Public catalogue (Grid & Tree views)
│       ├── ProjectDetail.jsx   # Project specification & task milestones
│       ├── NotesPage.jsx       # Public PKM reading library
│       ├── LoginPage.jsx       # Secure sign-in & Super Admin provisioning
│       └── admin/              # Dedicated admin interfaces for all 13 modules
├── scripts/
│   └── test-backend.js         # Automated 13-suite integration & RBAC tests
└── package.json
```

---

## 3. Directed Acyclic Graph (DAG) Hierarchy Engine

The hierarchical project engine supports arbitrary levels of nested workspaces, parent repositories, and child modules without allowing cyclical parent references (`A -> B -> A` or `A -> B -> C -> A`).

### Cycle Prevention (`willCreateCycle`)
Before updating any document's `parentId`:
1. If `parentId === id`, reject immediately.
2. The server traverses ancestors upward from the proposed `parentId` via BFS/DFS:
   ```javascript
   let current = await Project.findById(targetParentId);
   while (current) {
     if (String(current._id) === String(childId)) {
       return true; // Cycle detected: child is an ancestor of target parent!
     }
     current = current.parentId ? await Project.findById(current.parentId) : null;
   }
   return false;
   ```
3. If `willCreateCycle` returns `true`, the operation is aborted with HTTP 400 (`Circular dependency detected`).

### Deletion Policies
When deleting a folder or parent project:
- **`strategy: 'reparent'` (Safe)**: All immediate children have their `parentId` updated to the deleted item's `parentId` (or `null` if root). No subprojects are lost.
- **`strategy: 'cascade'` (Destructive)**: The server recursively finds all descendants using depth-first search and removes them permanently along with related tasks and milestones.

---

## 4. Progress Calculation Models

Project and roadmap completion rates are calculated deterministically on the server rather than trusting arbitrary percentages:

1. **Project Task Progress**:
   $$\text{Progress} = \text{round}\left( \frac{\sum_{\text{completed}} \text{weight}_i}{\sum_{\text{all}} \text{weight}_i} \times 100 \right)$$
   *(Defaults to count of completed tasks divided by total tasks if weights are unassigned).*

2. **Roadmap Step Progress**:
   $$\text{Progress} = \text{round}\left( \frac{\sum_{\text{stages}} \text{completedSteps}}{\sum_{\text{stages}} \text{totalSteps}} \times 100 \right)$$
   Toggling any roadmap step automatically recalculates stage completion and the parent roadmap's overall progress bar.

---

## 5. Security & Visibility Rules

Every module adheres to server-enforced lifecycle states:

| Lifecycle State | Database Flag | Public Visibility | Admin View | Action Permitted |
| :--- | :--- | :--- | :--- | :--- |
| **Draft** | `published: false, isArchived: false` | **Hidden** | Visible (Draft Badge) | Edit, Publish, Archive |
| **Published** | `published: true, isArchived: false` | **Live** | Visible (Public Badge) | Edit, Unpublish, Archive |
| **Archived** | `isArchived: true` | **Hidden** | Recycle Bin Only | Restore, Permanent Delete |
| **Deleted** | Document Removed | **Hidden** | Not Visible | None |

Public API endpoints (`GET /api/projects`, `GET /api/skills`, `GET /api/notes`, etc.) strictly filter `{ published: true, isArchived: false }` on the database query level, preventing draft or private records from ever transmitting to client browsers.
