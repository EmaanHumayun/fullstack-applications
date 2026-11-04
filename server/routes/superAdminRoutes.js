import express from 'express';
import bcrypt from 'bcryptjs';
import { connectDB, getDBState } from '../config/db.js';
import { getEnvDiagnostics } from '../config/env.js';
import { User, ROLES } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { Roadmap } from '../models/Roadmap.js';
import { WorkLog } from '../models/WorkLog.js';
import { Milestone } from '../models/Milestone.js';
import { Goal } from '../models/Goal.js';
import { Note } from '../models/Note.js';
import { Certificate } from '../models/Certificate.js';
import { Settings } from '../models/Settings.js';
import { Profile } from '../models/Profile.js';
import { Theme } from '../models/Theme.js';
import { auth } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

// Enforce auth and Super Admin on all routes in this file
router.use(auth, requireSuperAdmin);

// 1. List Users with online status and telemetry
router.get('/users', async (req, res, next) => {
  try {
    await connectDB();
    const users = await User.find({}, '-passwordHash').sort({ lastLogin: -1, createdAt: -1 });
    const now = Date.now();
    const enriched = users.map(u => {
      const doc = u.toObject();
      const lastLoginMs = u.lastLogin ? new Date(u.lastLogin).getTime() : 0;
      doc.isOnline = Boolean(lastLoginMs && (now - lastLoginMs < 30 * 60 * 1000));
      return doc;
    });
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

// 1.1 Active Sessions & Recent Logins ("Kon Kon Login Hai")
router.get('/active-sessions', async (req, res, next) => {
  try {
    await connectDB();
    const now = Date.now();

    // 1. Fetch recent login audit events
    const recentLoginLogs = await AuditLog.find({
      action: { $in: ['AUTH_LOGIN_SUCCESS', 'AUTH_GOOGLE_LOGIN', 'VIEWER_SESSION_INIT', 'AUTH_BOOTSTRAP'] }
    }).sort({ createdAt: -1 }).limit(25);

    // 2. Fetch users with lastLogin
    const recentUsers = await User.find({ lastLogin: { $exists: true, $ne: null } }, '-passwordHash')
      .sort({ lastLogin: -1 })
      .limit(20);

    const activeUsers = recentUsers.map(u => {
      const doc = u.toObject();
      const lastLoginMs = new Date(u.lastLogin).getTime();
      doc.isOnline = Boolean(now - lastLoginMs < 30 * 60 * 1000);
      return doc;
    });

    res.json({
      onlineCount: activeUsers.filter(u => u.isOnline).length,
      activeUsers,
      recentLoginLogs
    });
  } catch (err) {
    next(err);
  }
});

// 2. Create User
router.post('/users', async (req, res, next) => {
  try {
    await connectDB();
    const { email, password, name, role } = req.body;

    if (!email || !password || password.length < 8) {
      return res.status(400).json({ message: 'Valid email and a password of at least 8 characters are required.' });
    }

    const assignedRole = Object.values(ROLES).includes(role) ? role : ROLES.ADMIN;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name || 'Team Member',
      role: assignedRole,
      status: 'active'
    });

    await recordAuditEvent({
      action: 'USER_CREATE',
      targetResource: 'User',
      targetId: String(newUser._id),
      details: { email: newUser.email, role: newUser.role },
      req
    });

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt
    });
  } catch (err) {
    next(err);
  }
});

// 2.1 Edit User (Name, Email, Role, Status, Password)
router.put('/users/:id', async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Role check and protection
    if (role && role !== targetUser.role) {
      if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({ message: `Invalid role: ${role}. Valid roles: ${Object.values(ROLES).join(', ')}` });
      }
      if (targetUser.role === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN) {
        const activeSuperAdmins = await User.countDocuments({ role: ROLES.SUPER_ADMIN, status: 'active' });
        if (activeSuperAdmins <= 1) {
          return res.status(400).json({
            message: 'Protection Alert: Cannot demote the final active Super Administrator. Assign another Super Admin first.'
          });
        }
      }
      targetUser.role = role;
    }

    // Status check and protection
    if (status && status !== targetUser.status) {
      if (!['active', 'disabled'].includes(status)) {
        return res.status(400).json({ message: "Status must be either 'active' or 'disabled'." });
      }
      if (targetUser.role === ROLES.SUPER_ADMIN && status === 'disabled') {
        const activeSuperAdmins = await User.countDocuments({ role: ROLES.SUPER_ADMIN, status: 'active' });
        if (activeSuperAdmins <= 1) {
          return res.status(400).json({
            message: 'Protection Alert: Cannot disable the final active Super Administrator.'
          });
        }
      }
      targetUser.status = status;
    }

    // Email update
    if (email && email.toLowerCase().trim() !== targetUser.email) {
      const trimmedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: trimmedEmail, _id: { $ne: targetUser._id } });
      if (existing) {
        return res.status(409).json({ message: 'Another user already uses this email address.' });
      }
      targetUser.email = trimmedEmail;
    }

    // Name update
    if (name) {
      targetUser.name = name.trim();
    }

    // Password reset if provided
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
      }
      targetUser.passwordHash = await bcrypt.hash(password, 12);
    }

    await targetUser.save();

    await recordAuditEvent({
      action: 'USER_EDIT',
      targetResource: 'User',
      targetId: String(targetUser._id),
      details: {
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        status: targetUser.status,
        passwordReset: !!password
      },
      req
    });

    res.json({
      _id: targetUser._id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      status: targetUser.status,
      lastLogin: targetUser.lastLogin,
      lastLoginIp: targetUser.lastLoginIp,
      lastLoginUserAgent: targetUser.lastLoginUserAgent,
      lastLoginMethod: targetUser.lastLoginMethod
    });
  } catch (err) {
    next(err);
  }
});

// 3. Update User Role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: `Invalid role: ${role}. Valid roles: ${Object.values(ROLES).join(', ')}` });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Protection: Prevent demoting the final Super Admin
    if (targetUser.role === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN) {
      const activeSuperAdmins = await User.countDocuments({ role: ROLES.SUPER_ADMIN, status: 'active' });
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({
          message: 'Protection Alert: Cannot demote the final active Super Administrator. Assign another Super Admin first.'
        });
      }
    }

    const previousRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await recordAuditEvent({
      action: 'USER_ROLE_CHANGE',
      targetResource: 'User',
      targetId: String(targetUser._id),
      details: { previousRole, newRole: role, userEmail: targetUser.email },
      req
    });

    res.json({
      _id: targetUser._id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      status: targetUser.status
    });
  } catch (err) {
    next(err);
  }
});

// 4. Update User Status (active / disabled)
router.put('/users/:id/status', async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'active' or 'disabled'." });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Protection: Cannot disable the final active Super Admin
    if (targetUser.role === ROLES.SUPER_ADMIN && status === 'disabled') {
      const activeSuperAdmins = await User.countDocuments({ role: ROLES.SUPER_ADMIN, status: 'active' });
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({
          message: 'Protection Alert: Cannot disable the final active Super Administrator.'
        });
      }
    }

    targetUser.status = status;
    await targetUser.save();

    await recordAuditEvent({
      action: 'USER_STATUS_CHANGE',
      targetResource: 'User',
      targetId: String(targetUser._id),
      details: { newStatus: status, userEmail: targetUser.email },
      req
    });

    res.json({
      _id: targetUser._id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role,
      status: targetUser.status
    });
  } catch (err) {
    next(err);
  }
});

// 5. Delete User
router.delete('/users/:id', async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Protection: Cannot delete the last active Super Admin
    if (targetUser.role === ROLES.SUPER_ADMIN) {
      const activeSuperAdmins = await User.countDocuments({ role: ROLES.SUPER_ADMIN, status: 'active' });
      if (activeSuperAdmins <= 1) {
        return res.status(400).json({
          message: 'Protection Alert: Cannot delete the final active Super Administrator.'
        });
      }
    }

    await User.findByIdAndDelete(id);

    await recordAuditEvent({
      action: 'USER_DELETE',
      targetResource: 'User',
      targetId: String(id),
      details: { deletedEmail: targetUser.email, role: targetUser.role },
      req
    });

    res.json({ ok: true, deletedId: id, email: targetUser.email });
  } catch (err) {
    next(err);
  }
});

// 6. Audit Logs View
router.get('/audit-logs', async (req, res, next) => {
  try {
    await connectDB();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    const query = {};

    if (req.query.action) query.action = req.query.action;
    if (req.query.actorEmail) query.actorEmail = new RegExp(req.query.actorEmail, 'i');

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ logs, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
});

// 7. System Health & Live Metrics
router.get('/system-health', async (req, res, next) => {
  try {
    await connectDB();
    const [
      totalUsers,
      superAdmins,
      projectsTotal,
      projectsPublished,
      projectsArchived,
      skillsTotal,
      roadmapsTotal,
      workLogsTotal,
      milestonesTotal,
      goalsTotal,
      notesTotal,
      certsTotal,
      recentAuditCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.SUPER_ADMIN }),
      Project.countDocuments(),
      Project.countDocuments({ published: true, isArchived: false }),
      Project.countDocuments({ isArchived: true }),
      Skill.countDocuments({ isArchived: false }),
      Roadmap.countDocuments({ isArchived: false }),
      WorkLog.countDocuments({ isArchived: false }),
      Milestone.countDocuments({ isArchived: false }),
      Goal.countDocuments({ isArchived: false }),
      Note.countDocuments({ isArchived: false }),
      Certificate.countDocuments({ isArchived: false }),
      AuditLog.countDocuments()
    ]);

    const memoryUsage = process.memoryUsage();
    const dbState = getDBState();
    const envDiag = getEnvDiagnostics();

    res.json({
      service: 'engineering-hub-pro-core',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        state: dbState.state,
        isInMemory: dbState.isInMemory,
        host: dbState.host
      },
      storage: {
        provider: envDiag.hasSupabase ? 'supabase' : (envDiag.hasCloudinary ? 'cloudinary' : 'local-disk'),
        bucket: envDiag.supabaseBucket
      },
      counts: {
        users: { total: totalUsers, superAdmins },
        projects: { total: projectsTotal, published: projectsPublished, archived: projectsArchived },
        skills: skillsTotal,
        roadmaps: roadmapsTotal,
        workLogs: workLogsTotal,
        milestones: milestonesTotal,
        goals: goalsTotal,
        notes: notesTotal,
        certificates: certsTotal,
        auditLogs: recentAuditCount
      },
      system: {
        nodeVersion: process.version,
        memoryRssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024)
      }
    });
  } catch (err) {
    next(err);
  }
});

// 8. Safe Data Export (All Manageable Content excluding secrets)
router.get('/export-data', async (req, res, next) => {
  try {
    await connectDB();
    const [
      profile,
      settings,
      themes,
      projects,
      skills,
      roadmaps,
      workLogs,
      milestones,
      goals,
      notes,
      certificates
    ] = await Promise.all([
      Profile.findOne(),
      Settings.findOne(),
      Theme.find(),
      Project.find(),
      Skill.find(),
      Roadmap.find(),
      WorkLog.find(),
      Milestone.find(),
      Goal.find(),
      Note.find(),
      Certificate.find()
    ]);

    await recordAuditEvent({
      action: 'DATA_EXPORT',
      details: {
        exportedEntities: {
          projects: projects.length,
          skills: skills.length,
          roadmaps: roadmaps.length,
          notes: notes.length,
          certificates: certificates.length,
          goals: goals.length
        }
      },
      req
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="engineering-hub-export-${Date.now()}.json"`);
    res.json({
      exportMetadata: {
        application: 'Engineering Hub Pro',
        exportedAt: new Date().toISOString(),
        exportedBy: req.user.email
      },
      profile,
      settings,
      themes,
      projects,
      skills,
      roadmaps,
      workLogs,
      milestones,
      goals,
      notes,
      certificates
    });
  } catch (err) {
    next(err);
  }
});

// 9. List Audit Logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    await connectDB();
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments()
    ]);

    res.json({ logs, total, page, limit });
  } catch (err) {
    next(err);
  }
});

export default router;
