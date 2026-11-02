import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User, ROLES } from '../models/User.js';
import { auth, getJwtSecret } from '../middleware/auth.js';
import { recordAuditEvent } from '../middleware/audit.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { sendViewerNotification } from '../services/mailer.js';

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 25, message: 'Too many authentication attempts. Please try again in 15 minutes.' });

function setAuthCookie(res, token) {
  const isProd = env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `eh_token=${encodeURIComponent(token)}; HttpOnly; ${isProd ? 'Secure; SameSite=None' : 'SameSite=Lax'}; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );
}

function decodeGoogleToken(credential) {
  if (!credential) return null;
  try {
    const parts = credential.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Setup Status
router.get('/setup-status', async (req, res, next) => {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    const hasEnvAdmin = !!(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH);
    res.json({
      isSetup: userCount > 0 || hasEnvAdmin,
      requiresBootstrapToken: !!env.SUPER_ADMIN_BOOTSTRAP_TOKEN,
      defaultEmail: env.ADMIN_EMAIL || (userCount > 0 ? (await User.findOne().sort({ createdAt: 1 })).email : '')
    });
  } catch (err) {
    next(err);
  }
});

// One-Time Secure Super Admin Bootstrap
router.post(['/setup', '/bootstrap'], authLimiter, async (req, res, next) => {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    const hasEnvAdmin = !!(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH);

    if (userCount > 0 || hasEnvAdmin) {
      return res.status(400).json({ message: 'Administrator account is already configured. Please use the login screen.' });
    }

    const { email, password, name, bootstrapToken } = req.body;

    // Check bootstrap token if configured in environment
    if (env.SUPER_ADMIN_BOOTSTRAP_TOKEN && env.SUPER_ADMIN_BOOTSTRAP_TOKEN !== bootstrapToken) {
      return res.status(403).json({ message: 'Invalid or missing Super Admin bootstrap token.' });
    }

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ message: 'A valid email and a strong password of at least 8 characters are required.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const superAdmin = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name || 'Super Administrator',
      role: ROLES.SUPER_ADMIN,
      status: 'active'
    });

    await recordAuditEvent({
      action: 'AUTH_BOOTSTRAP',
      actorId: String(superAdmin._id),
      actorEmail: superAdmin.email,
      actorRole: ROLES.SUPER_ADMIN,
      targetResource: 'User',
      targetId: String(superAdmin._id),
      details: { message: 'Initial Super Admin provisioned successfully' },
      req
    });

    const token = jwt.sign(
      { sub: superAdmin._id, email: superAdmin.email, name: superAdmin.name, role: superAdmin.role },
      getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN || '8h' }
    );

    const isProd = env.NODE_ENV === 'production';
    res.setHeader(
      'Set-Cookie',
      `eh_token=${encodeURIComponent(token)}; HttpOnly; ${isProd ? 'Secure; SameSite=None' : 'SameSite=Lax'}; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    res.status(201).json({
      ok: true,
      email: superAdmin.email,
      name: superAdmin.name,
      role: superAdmin.role,
      user: {
        id: superAdmin._id,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role,
        isSuperAdmin: true
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    await connectDB();
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Please enter a valid email address and password.' });
    }

    const reqEmail = parsed.data.email.toLowerCase().trim();
    const reqPass = parsed.data.password;

    let user = await User.findOne({ email: reqEmail });
    let isValid = false;

    if (user) {
      if (user.status === 'disabled') {
        return res.status(403).json({ message: 'This account has been disabled. Please contact Super Admin.' });
      }
      isValid = await bcrypt.compare(reqPass, user.passwordHash);
      if (!isValid && env.ADMIN_PASSWORD_HASH) {
        // Allow env password fallback for admin email or super_admin users
        const isEnvAdmin = reqEmail === (env.ADMIN_EMAIL || '').toLowerCase().trim();
        if (isEnvAdmin || user.role === ROLES.SUPER_ADMIN) {
          const envMatches = await bcrypt.compare(reqPass, env.ADMIN_PASSWORD_HASH);
          if (envMatches) {
            isValid = true;
            user.passwordHash = env.ADMIN_PASSWORD_HASH;
          }
        }
      }
      if (isValid) {
        user.lastLogin = new Date();
        user.lastLoginIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        user.lastLoginUserAgent = req.headers['user-agent'] || '';
        user.lastLoginMethod = (req.body.asViewer || req.body.tier === 'viewer') ? 'viewer_tier' : 'email_password';
        await user.save();
      }
    } else if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH) {
      // Env fallback check for newly initializing admin
      if (reqEmail === env.ADMIN_EMAIL.toLowerCase().trim()) {
        isValid = await bcrypt.compare(reqPass, env.ADMIN_PASSWORD_HASH);
        if (isValid) {
          user = await User.findOneAndUpdate(
            { email: reqEmail },
            {
              email: reqEmail,
              passwordHash: env.ADMIN_PASSWORD_HASH,
              name: 'Super Administrator',
              role: ROLES.SUPER_ADMIN,
              status: 'active',
              lastLogin: new Date(),
              lastLoginIp: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
              lastLoginUserAgent: req.headers['user-agent'] || '',
              lastLoginMethod: 'env_bootstrap'
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    if (!isValid || !user) {
      await recordAuditEvent({
        action: 'AUTH_LOGIN_FAILED',
        actorEmail: reqEmail,
        details: { reason: 'Invalid credentials or user not found' },
        req
      });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await recordAuditEvent({
      action: 'AUTH_LOGIN_SUCCESS',
      actorId: String(user._id),
      actorEmail: user.email,
      actorRole: user.role,
      targetResource: 'User',
      targetId: String(user._id),
      details: { role: user.role, asViewer: !!(req.body.asViewer || req.body.tier === 'viewer') },
      req
    });

    const isViewerRequested = req.body.asViewer === true || req.body.tier === 'viewer';
    const effectiveRole = isViewerRequested ? ROLES.VIEWER : user.role;

    if (effectiveRole === ROLES.VIEWER) {
      sendViewerNotification({
        type: 'LOGIN',
        viewerEmail: user.email,
        viewerName: user.name,
        method: isViewerRequested ? 'viewer_tier_selection' : (user.authProvider || 'email_password'),
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP',
        userAgent: req.headers['user-agent'] || 'Browser',
        req
      }).catch(err => console.error('[auth] Viewer notification dispatch error:', err.message));
    }

    const token = jwt.sign(
      { sub: user._id, email: user.email, name: user.name, role: effectiveRole },
      getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN || '8h' }
    );

    setAuthCookie(res, token);

    res.json({
      ok: true,
      email: user.email,
      name: user.name,
      role: effectiveRole,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        isSuperAdmin: effectiveRole === ROLES.SUPER_ADMIN,
        isViewer: effectiveRole === ROLES.VIEWER
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Register as a Viewer (Read-Only Guest)
router.post('/register-viewer', authLimiter, async (req, res, next) => {
  try {
    await connectDB();
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      name: z.string().min(1).default('Viewer Guest')
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errMsgs = parsed.error.issues.map(i => i.message).join('. ');
      return res.status(400).json({ message: errMsgs || 'Invalid input data.' });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const { password, name } = parsed.data;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        message: 'An account with this email already exists. Please use Login as Viewer.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const viewer = await User.create({
      email,
      passwordHash,
      name: name || 'Viewer Guest',
      role: ROLES.VIEWER,
      authProvider: 'local',
      status: 'active',
      lastLogin: new Date(),
      lastLoginIp: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
      lastLoginUserAgent: req.headers['user-agent'] || '',
      lastLoginMethod: 'email_password'
    });

    // Notify Admin via email
    sendViewerNotification({
      type: 'REGISTER',
      viewerEmail: viewer.email,
      viewerName: viewer.name,
      method: 'email_password',
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP',
      userAgent: req.headers['user-agent'] || 'Browser',
      req
    }).catch(err => console.error('[auth] Viewer registration notification error:', err.message));

    const token = jwt.sign(
      { sub: viewer._id, email: viewer.email, name: viewer.name, role: viewer.role },
      getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN || '8h' }
    );

    setAuthCookie(res, token);

    res.status(201).json({
      ok: true,
      email: viewer.email,
      name: viewer.name,
      role: viewer.role,
      user: {
        id: viewer._id,
        email: viewer.email,
        name: viewer.name,
        role: viewer.role,
        isSuperAdmin: false,
        isViewer: true
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Google Authentication (Both Admin & Viewer)
router.post('/google', authLimiter, async (req, res, next) => {
  try {
    await connectDB();
    const { credential, email: directEmail, name: directName, picture, roleRequested } = req.body;

    let email = '';
    let name = '';
    let avatar = '';
    let googleId = '';

    if (credential) {
      const decoded = decodeGoogleToken(credential);
      if (!decoded || !decoded.email) {
        return res.status(400).json({ message: 'Invalid Google credential token.' });
      }
      email = decoded.email.toLowerCase().trim();
      name = decoded.name || 'Google User';
      avatar = decoded.picture || '';
      googleId = decoded.sub || '';
    } else if (directEmail) {
      email = String(directEmail).toLowerCase().trim();
      name = directName || 'Google User';
      avatar = picture || '';
    } else {
      return res.status(400).json({ message: 'Google credential or verified email is required.' });
    }

    const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase().trim();
    const isOwnerEmail = adminEmail && email === adminEmail;

    let user = await User.findOne({ email });

    if (user) {
      if (user.status === 'disabled') {
        return res.status(403).json({ message: 'This account has been disabled. Please contact Administrator.' });
      }

      // If existing user is owner or env admin, ensure role is SUPER_ADMIN
      if (isOwnerEmail && user.role !== ROLES.SUPER_ADMIN) {
        user.role = ROLES.SUPER_ADMIN;
      }
      user.lastLogin = new Date();
      user.lastLoginIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      user.lastLoginUserAgent = req.headers['user-agent'] || '';
      user.lastLoginMethod = 'google';
      if (avatar && !user.avatar) user.avatar = avatar;
      if (googleId && !user.googleId) user.googleId = googleId;
      await user.save();
    } else {
      // New user registration via Google
      const assignedRole = isOwnerEmail
        ? ROLES.SUPER_ADMIN
        : (roleRequested === 'admin' ? ROLES.ADMIN : ROLES.VIEWER);

      user = await User.create({
        email,
        passwordHash: '',
        name,
        avatar,
        googleId,
        role: assignedRole,
        authProvider: 'google',
        status: 'active',
        lastLogin: new Date(),
        lastLoginIp: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        lastLoginUserAgent: req.headers['user-agent'] || '',
        lastLoginMethod: 'google'
      });
    }

    // If viewer, trigger notification to Admin
    if (user.role === ROLES.VIEWER) {
      sendViewerNotification({
        type: 'LOGIN',
        viewerEmail: user.email,
        viewerName: user.name,
        method: 'google',
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP',
        userAgent: req.headers['user-agent'] || 'Browser',
        req
      }).catch(err => console.error('[auth] Google viewer notification error:', err.message));
    }

    await recordAuditEvent({
      action: 'AUTH_GOOGLE_LOGIN',
      actorId: String(user._id),
      actorEmail: user.email,
      actorRole: user.role,
      targetResource: 'User',
      targetId: String(user._id),
      details: { role: user.role, authProvider: 'google' },
      req
    });

    const token = jwt.sign(
      { sub: user._id, email: user.email, name: user.name, role: user.role },
      getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN || '8h' }
    );

    setAuthCookie(res, token);

    res.json({
      ok: true,
      email: user.email,
      name: user.name,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.role === ROLES.SUPER_ADMIN,
        isViewer: user.role === ROLES.VIEWER
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Fast Guest Viewer Login (Enter email to immediately visit workspace in read-only mode)
router.post('/guest-viewer', authLimiter, async (req, res, next) => {
  try {
    await connectDB();
    const { email: inputEmail, name: inputName } = req.body;
    const email = (inputEmail || '').toLowerCase().trim();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required to enter as a guest viewer.' });
    }

    const adminEmail = (env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (adminEmail && email === adminEmail) {
      return res.status(400).json({ message: 'Admin account cannot use Guest Access. Please login as Admin.' });
    }

    let user = await User.findOne({ email });
    let isNew = false;

    if (user) {
      if (user.status === 'disabled') {
        return res.status(403).json({ message: 'This viewer account has been disabled.' });
      }
      user.lastLogin = new Date();
      user.lastLoginIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      user.lastLoginUserAgent = req.headers['user-agent'] || '';
      user.lastLoginMethod = 'guest_instant';
      if (inputName && user.name === 'Viewer Guest') user.name = inputName;
      await user.save();
    } else {
      isNew = true;
      user = await User.create({
        email,
        passwordHash: '',
        name: inputName || 'Guest Visitor',
        role: ROLES.VIEWER,
        authProvider: 'local',
        status: 'active',
        lastLogin: new Date(),
        lastLoginIp: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        lastLoginUserAgent: req.headers['user-agent'] || '',
        lastLoginMethod: 'guest_instant'
      });
    }

    sendViewerNotification({
      type: isNew ? 'REGISTER' : 'LOGIN',
      viewerEmail: user.email,
      viewerName: user.name,
      method: 'guest_instant',
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP',
      userAgent: req.headers['user-agent'] || 'Browser',
      req
    }).catch(err => console.error('[auth] Guest viewer notification error:', err.message));

    const token = jwt.sign(
      { sub: user._id, email: user.email, name: user.name, role: user.role },
      getJwtSecret(),
      { expiresIn: env.JWT_EXPIRES_IN || '8h' }
    );

    setAuthCookie(res, token);

    res.json({
      ok: true,
      email: user.email,
      name: user.name,
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: false,
        isViewer: true
      },
      token
    });
  } catch (err) {
    next(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  const isProd = env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `eh_token=; HttpOnly; ${isProd ? 'Secure; SameSite=None' : 'SameSite=Lax'}; Path=/; Max-Age=0`
  );
  res.json({ ok: true, message: 'Logged out successfully.' });
});

// Me (Session Verification)
router.get('/me', auth, (req, res) => {
  res.json({
    id: req.user.sub,
    email: req.user.email,
    name: req.user.name || 'User',
    role: req.user.role || ROLES.VIEWER,
    isSuperAdmin: req.user.role === ROLES.SUPER_ADMIN,
    isViewer: req.user.role === ROLES.VIEWER
  });
});

// Change Password
router.post('/change-password', auth, async (req, res, next) => {
  try {
    await connectDB();
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    await recordAuditEvent({
      action: 'USER_PASSWORD_CHANGE',
      actorId: String(user._id),
      actorEmail: user.email,
      actorRole: user.role,
      targetResource: 'User',
      targetId: String(user._id),
      req
    });

    res.json({ ok: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
