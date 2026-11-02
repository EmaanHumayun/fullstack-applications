import { ROLES } from '../models/User.js';

const ROLE_RANKS = {
  [ROLES.SUPER_ADMIN]: 40,
  [ROLES.ADMIN]: 30,
  [ROLES.EDITOR]: 20,
  [ROLES.VIEWER]: 10
};

/**
 * Middleware: Requires a minimum role level in the hierarchy.
 * E.g. requireRole(ROLES.ADMIN) permits 'super_admin' and 'admin'.
 */
export function requireRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const userRole = req.user.role || ROLES.VIEWER;
    if (userRole === ROLES.VIEWER) {
      return res.status(403).json({
        message: 'Forbidden. Viewers have read-only access. Creating, editing, or deleting workspace content requires Administrator privileges.'
      });
    }

    const userRank = ROLE_RANKS[userRole] || 0;
    const requiredRank = ROLE_RANKS[minimumRole] || 0;

    if (userRank < requiredRank) {
      return res.status(403).json({
        message: `Forbidden. Action requires ${minimumRole} privileges. Current role: ${userRole}.`
      });
    }

    next();
  };
}

/**
 * Middleware: Strictly requires Super Admin role.
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  if (req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).json({
      message: 'Access restricted to Super Administrators only.'
    });
  }

  next();
}

/**
 * Middleware: Disallows Viewer role from performing write mutations.
 */
export function requireEditorOrAbove(req, res, next) {
  return requireRole(ROLES.EDITOR)(req, res, next);
}

/**
 * Middleware: Requires Admin or Super Admin role.
 */
export function requireAdminOrAbove(req, res, next) {
  return requireRole(ROLES.ADMIN)(req, res, next);
}

/**
 * Helper: Checks if actor has higher rank than target role.
 */
export function canManageRole(actorRole, targetRole) {
  if (actorRole !== ROLES.SUPER_ADMIN) return false;
  return true; // Super admin can manage all
}

