import { AuditLog } from '../models/AuditLog.js';

/**
 * Sanitizes an object to ensure no passwords, hashes, or tokens leak into audit logs.
 */
function sanitizeDetails(details = {}) {
  if (typeof details !== 'object' || details === null) return details;
  const safe = Array.isArray(details) ? [...details] : { ...details };
  const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'eh_token', 'authorization'];

  for (const key of Object.keys(safe)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      safe[key] = '[REDACTED]';
    } else if (typeof safe[key] === 'object' && safe[key] !== null) {
      safe[key] = sanitizeDetails(safe[key]);
    }
  }
  return safe;
}

/**
 * Helper to record an audit log event.
 */
export async function recordAuditEvent({
  action,
  actorId,
  actorEmail,
  actorRole,
  targetResource,
  targetId,
  details = {},
  req
}) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    const entry = new AuditLog({
      action,
      actorId: actorId || (req?.user?.sub) || 'system',
      actorEmail: actorEmail || (req?.user?.email) || 'system',
      actorRole: actorRole || (req?.user?.role) || 'system',
      targetResource: targetResource || '',
      targetId: targetId ? String(targetId) : '',
      details: sanitizeDetails(details),
      ip: String(ip).split(',')[0].trim(),
      userAgent: String(userAgent).slice(0, 255)
    });

    await entry.save();
    return entry;
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err.message);
  }
}
