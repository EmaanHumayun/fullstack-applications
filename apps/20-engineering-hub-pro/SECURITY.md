# Application Security Policy & Threat Mitigation — Engineering Hub Pro

This document describes the security architecture, threat model, authorization controls, and defensive practices implemented across Engineering Hub Pro.

---

## 1. Threat Model & Defensive Perimeter

| Attack Vector | Threat Level | Defensive Control Implemented |
| :--- | :--- | :--- |
| **Privilege Escalation** | Critical | Server-side role enforcement via `requireSuperAdmin` and `requireRole`. Self-promotion to higher roles blocked at controller level. |
| **NoSQL Injection** | High | Strict Zod schema parsing and Mongoose model type enforcement on all inputs; no raw MongoDB queries accepted from client. |
| **Cross-Site Scripting (XSS)** | High | Rich text notes render via `SafeMarkdown` which builds a native React Virtual DOM tree without using `dangerouslySetInnerHTML`. |
| **Credential Exposure** | Critical | `ADMIN_PASSWORD_HASH` never returned in API payloads; audit logs scrub all fields matching `password`, `token`, `secret`, `hash`. |
| **Brute-Force Login** | Medium | Windowed rate limiting (`rateLimit.js`) restricting failed auth attempts to 15 per 15-minute window per IP. |
| **Insecure Direct Object Reference (IDOR)**| High | Administrative mutation endpoints enforce session identity and role permissions before querying or updating records. |
| **Arbitrary File Upload** | High | Multer memory storage enforces strict MIME type validation (images and PDF only), 10MB file size ceiling, and generates randomized file timestamps. |
| **Circular Hierarchy DoS** | Medium | Graph reachability check (`willCreateCycle`) executes prior to any parent ID mutation to prevent infinite recursion during tree walks. |

---

## 2. Authentication & Session Strategy

The platform supports a dual authentication mechanism:
1. **`HttpOnly` Cookie (`eh_token`)**:
   - In production: Flagged with `HttpOnly; Secure; SameSite=None; Path=/; Max-Age=7d`.
   - In local development: Flagged with `HttpOnly; SameSite=Lax; Path=/`.
   - Prevents JavaScript access via `document.cookie`, mitigating credential theft via client-side injection.
2. **Authorization Header (`Bearer <token>`)**:
   - Handled uniformly for headless clients, programmatic scripts, and CI/CD automation.

### Password Hashing
All passwords are encrypted using `bcryptjs` with a work factor (salt rounds) of **12**. Universal default passwords are explicitly prohibited.

---

## 3. Super Admin & Centralized RBAC

The system defines four hierarchical roles:

```
[super_admin] ──► Full application authority, user management, audit logs, danger zone, backup export
      │
  [admin]     ──► Full content management across all 10 engineering modules, archive & restore
      │
  [editor]    ──► Create, edit, and update content; cannot delete collections or manage system settings
      │
  [viewer]    ──► Read-only access to internal workspace; no modification capabilities
```

### Protection of the Final Super Admin
To prevent accidental administrative lockout:
```javascript
// In User controller during role change or deletion:
const activeSuperAdmins = await User.countDocuments({ role: ROLES.SUPER_ADMIN, status: 'active' });
if (activeSuperAdmins <= 1 && (newRole !== ROLES.SUPER_ADMIN || newStatus === 'disabled')) {
  return res.status(400).json({ message: 'Cannot demote or disable the last active Super Admin.' });
}
```

---

## 4. File Storage & Upload Security

1. **Upload Size Ceiling**: Enforced dynamically via `MAX_UPLOAD_MB` (default: 10 MB).
2. **MIME Verification**: Restricted strictly to:
   - `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/svg+xml`
   - `application/pdf`
3. **Storage Pipeline**:
   - Primary: Supabase Storage (`@supabase/supabase-js`) using server-side service-role key.
   - Secondary: Cloudinary (`cloudinary`) with secure SSL endpoints.
   - Tertiary fallback: Local filesystem (`/uploads`) with sanitized filenames preventing path traversal (`../`).

---

## 5. Audit Logging & Credential Scrubbing

All sensitive state mutations (logins, role adjustments, password modifications, cascade deletions, backup exports) are automatically committed to the `audit_logs` collection.

The auditing engine scrubs sensitive attributes recursively:
```javascript
function redactCredentials(obj) {
  const SENSITIVE_KEYS = ['password', 'passwordHash', 'token', 'jwt', 'secret', 'key'];
  // Replaces values with "[REDACTED]" prior to persistence
}
```

---

## 6. Security Reporting
If you discover a potential vulnerability, please report it privately to the repository owner rather than filing public issues.
