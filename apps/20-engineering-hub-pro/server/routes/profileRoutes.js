import express from 'express';
import { connectDB } from '../config/db.js';
import { Profile } from '../models/Profile.js';
import { auth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

// Get Public Profile
router.get('/', async (req, res, next) => {
  try {
    await connectDB();
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Update Profile
router.put('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const updateData = { ...req.body, updatedAt: new Date() };

    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    await recordAuditEvent({
      action: 'PROFILE_UPDATE',
      targetResource: 'Profile',
      targetId: String(profile._id),
      details: { name: profile.name, headline: profile.headline },
      req
    });

    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
