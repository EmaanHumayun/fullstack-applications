import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, ROLES } from '../models/User.js';

export function getJwtSecret() {
  return env.JWT_SECRET || 'engineering-hub-pro-super-secure-jwt-secret-key-32-chars';
}

/**
 * Parses cookies from raw cookie header.
 */
export function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => {
        const i = s.indexOf('=');
        return [s.slice(0, i), decodeURIComponent(s.slice(i + 1))];
      })
  );
}

/**
 * Cookie parser middleware.
 */
export function cookieParserMiddleware(req, res, next) {
  if (!req.cookies) {
    req.cookies = parseCookies(req.headers.cookie);
  }
  next();
}

/**
 * Mandatory Authentication Middleware.
 */
export async function auth(req, res, next) {
  cookieParserMiddleware(req, res, () => {});
  const token = req.cookies?.eh_token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    
    // Check if user exists in database and is active
    if (decoded.sub && decoded.sub !== 'env_admin') {
      const user = await User.findById(decoded.sub);
      if (user) {
        if (user.status === 'disabled') {
          return res.status(403).json({ message: 'This account has been disabled. Please contact Super Admin.' });
        }
        // If token was issued for read-only viewer mode, preserve viewer role
        if (decoded.role === ROLES.VIEWER) {
          decoded.role = ROLES.VIEWER;
        } else {
          decoded.role = user.role;
        }
        decoded.name = user.name;
        decoded.email = user.email;
      }
    } else if (decoded.sub === 'env_admin') {
      decoded.role = decoded.role === ROLES.VIEWER ? ROLES.VIEWER : ROLES.SUPER_ADMIN;
    }

    req.user = decoded;
    req.admin = decoded; // For backwards compatibility
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid. Please sign in again.' });
  }
}

/**
 * Optional Authentication Middleware.
 */
export async function optionalAuth(req, res, next) {
  cookieParserMiddleware(req, res, () => {});
  const token = req.cookies?.eh_token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      if (decoded.sub && decoded.sub !== 'env_admin') {
        const user = await User.findById(decoded.sub);
        if (user && user.status !== 'disabled') {
          if (decoded.role === ROLES.VIEWER) {
            decoded.role = ROLES.VIEWER;
          } else {
            decoded.role = user.role;
          }
          decoded.name = user.name;
          decoded.email = user.email;
          req.user = decoded;
          req.admin = decoded;
        }
      } else if (decoded.sub === 'env_admin') {
        decoded.role = decoded.role === ROLES.VIEWER ? ROLES.VIEWER : ROLES.SUPER_ADMIN;
        req.user = decoded;
        req.admin = decoded;
      }
    } catch (e) {
      // Ignore invalid optional tokens
    }
  }
  next();
}
