import express from 'express';
import { connectDB } from '../config/db.js';
import { SiteContent } from '../models/SiteContent.js';
import { auth } from '../middleware/auth.js';
import { requireEditorOrAbove, requireSuperAdmin } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

// Get Public Site Content
router.get('/', async (req, res, next) => {
  try {
    await connectDB();
    let content = await SiteContent.findOne();
    if (!content) {
      content = await SiteContent.create({});
    }
    res.json(content);
  } catch (err) {
    next(err);
  }
});

// Update Site Content
router.put('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const update = { ...req.body, updatedAt: new Date() };

    const content = await SiteContent.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    await recordAuditEvent({
      action: 'SITE_CONTENT_UPDATE',
      targetResource: 'SiteContent',
      targetId: String(content._id),
      details: { heroHeading: content.hero?.heading },
      req
    });

    res.json(content);
  } catch (err) {
    next(err);
  }
});

// Reset Site Content to Defaults (Super Admin only)
router.post('/reset', auth, requireSuperAdmin, async (req, res, next) => {
  try {
    await connectDB();
    await SiteContent.deleteMany({});
    const fresh = await SiteContent.create({});

    await recordAuditEvent({
      action: 'SITE_CONTENT_RESET',
      targetResource: 'SiteContent',
      targetId: String(fresh._id),
      details: { message: 'Reset site content to system defaults' },
      req
    });

    res.json(fresh);
  } catch (err) {
    next(err);
  }
});

export default router;
