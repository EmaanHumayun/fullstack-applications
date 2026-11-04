import express from 'express';
import { connectDB } from '../config/db.js';
import { Settings } from '../models/Settings.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { Roadmap } from '../models/Roadmap.js';
import { WorkLog } from '../models/WorkLog.js';
import { Milestone } from '../models/Milestone.js';
import { Goal } from '../models/Goal.js';
import { Note } from '../models/Note.js';
import { Certificate } from '../models/Certificate.js';
import { auth } from '../middleware/auth.js';
import { requireEditorOrAbove, requireSuperAdmin } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';
import { seedInitialData } from '../services/seed.js';

const router = express.Router();

// Get Public Presentation Settings
router.get('/', async (req, res, next) => {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// Update Settings
router.put('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const updateData = { ...req.body, updatedAt: new Date() };

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    await recordAuditEvent({
      action: 'SETTINGS_UPDATE',
      targetResource: 'Settings',
      targetId: String(settings._id),
      details: { portfolioVisibility: settings.portfolioVisibility },
      req
    });

    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// Module Reset (Super Admin Only with Double Confirmation)
router.post('/reset-module', auth, requireSuperAdmin, async (req, res, next) => {
  try {
    await connectDB();
    const { module, confirmText, doubleConfirm } = req.body;

    if (confirmText !== 'CONFIRM') {
      return res.status(400).json({ message: 'Type CONFIRM to proceed with the reset operation.' });
    }

    switch (module) {
      case 'workLogs':
        await WorkLog.deleteMany({});
        await recordAuditEvent({ action: 'MODULE_RESET', details: { module: 'workLogs' }, req });
        return res.json({ ok: true, message: 'Work logs cleared.' });

      case 'notes':
        await Note.deleteMany({});
        await recordAuditEvent({ action: 'MODULE_RESET', details: { module: 'notes' }, req });
        return res.json({ ok: true, message: 'Notes cleared.' });

      case 'milestones':
        await Milestone.deleteMany({});
        await recordAuditEvent({ action: 'MODULE_RESET', details: { module: 'milestones' }, req });
        return res.json({ ok: true, message: 'Milestones cleared.' });

      case 'goals':
        await Goal.deleteMany({});
        await recordAuditEvent({ action: 'MODULE_RESET', details: { module: 'goals' }, req });
        return res.json({ ok: true, message: 'Goals cleared.' });

      case 'projects':
        await Project.deleteMany({});
        await seedInitialData();
        await recordAuditEvent({ action: 'MODULE_RESET', details: { module: 'projects' }, req });
        return res.json({ ok: true, message: 'Projects reset to initial structure.' });

      case 'all':
        if (doubleConfirm !== 'RESET_ALL_DATA') {
          return res.status(400).json({ message: 'Full database reset requires confirmation code: RESET_ALL_DATA.' });
        }
        await Promise.all([
          Project.deleteMany({}),
          Skill.deleteMany({}),
          Roadmap.deleteMany({}),
          WorkLog.deleteMany({}),
          Milestone.deleteMany({}),
          Goal.deleteMany({}),
          Note.deleteMany({}),
          Certificate.deleteMany({})
        ]);
        await seedInitialData();
        await recordAuditEvent({ action: 'DATABASE_FULL_RESET', details: { message: 'All modules reset to initial defaults' }, req });
        return res.json({ ok: true, message: 'All modules reset to initial defaults.' });

      default:
        return res.status(400).json({ message: `Unknown module: ${module}` });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
