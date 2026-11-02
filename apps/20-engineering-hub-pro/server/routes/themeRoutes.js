import express from 'express';
import { connectDB } from '../config/db.js';
import { Theme } from '../models/Theme.js';
import { auth } from '../middleware/auth.js';
import { requireEditorOrAbove, requireSuperAdmin } from '../middleware/rbac.js';
import { INITIAL_THEMES } from '../services/seed.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

// List Themes
router.get('/', async (req, res, next) => {
  try {
    await connectDB();
    const themes = await Theme.find().sort({ isPreset: -1, name: 1 });
    res.json(themes);
  } catch (err) {
    next(err);
  }
});

// Create Custom Theme
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { name, colors } = req.body;

    if (!name || !colors) {
      return res.status(400).json({ message: 'Theme name and color palette are required.' });
    }

    const themeId = `custom-${Date.now()}`;
    const newTheme = await Theme.create({
      themeId,
      name,
      colors,
      isPreset: false,
      isActive: false
    });

    await recordAuditEvent({
      action: 'THEME_CREATE',
      targetResource: 'Theme',
      targetId: String(newTheme._id),
      details: { name: newTheme.name },
      req
    });

    res.status(201).json(newTheme);
  } catch (err) {
    next(err);
  }
});

// Activate Theme
router.put('/:id/activate', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;

    let targetTheme = await Theme.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { themeId: id },
        { themeId: id.toLowerCase() },
        { name: new RegExp(`^${id}$`, 'i') }
      ]
    });

    if (!targetTheme) {
      const preset = INITIAL_THEMES.find(
        p => p.themeId === id || p.themeId === id.toLowerCase() || p.name.toLowerCase() === id.toLowerCase()
      );
      if (preset) {
        targetTheme = await Theme.create({
          themeId: preset.themeId,
          name: preset.name,
          mode: preset.mode,
          colors: preset.colors,
          raw: preset.raw,
          isPreset: true,
          isActive: false
        });
      }
    }

    if (!targetTheme) {
      return res.status(404).json({ message: 'Theme not found.' });
    }

    await Theme.updateMany({ _id: { $ne: targetTheme._id } }, { $set: { isActive: false } });
    const updatedTheme = await Theme.findByIdAndUpdate(
      targetTheme._id,
      { $set: { isActive: true } },
      { new: true }
    );

    await recordAuditEvent({
      action: 'THEME_ACTIVATE',
      targetResource: 'Theme',
      targetId: String(targetTheme._id),
      details: { themeName: updatedTheme.name, themeId: updatedTheme.themeId },
      req
    });

    res.json({ ok: true, activeTheme: updatedTheme });
  } catch (err) {
    next(err);
  }
});

// Update Custom Theme
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { name, colors } = req.body;

    const theme = await Theme.findById(id);
    if (!theme) return res.status(404).json({ message: 'Theme not found.' });
    if (theme.isPreset) {
      return res.status(400).json({ message: 'Default preset themes cannot be edited. Create a custom theme instead.' });
    }

    if (name) theme.name = name;
    if (colors) theme.colors = { ...theme.colors, ...colors };
    await theme.save();

    res.json(theme);
  } catch (err) {
    next(err);
  }
});

// Delete Custom Theme
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const theme = await Theme.findById(id);

    if (!theme) return res.status(404).json({ message: 'Theme not found.' });
    if (theme.isPreset) {
      return res.status(400).json({ message: 'Default preset themes cannot be deleted.' });
    }

    if (theme.isActive) {
      // Revert to Editorial Sage preset
      await Theme.findOneAndUpdate({ themeId: 'editorial-sage' }, { isActive: true });
    }

    await Theme.findByIdAndDelete(id);
    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

// Reset Themes to Default Presets (Super Admin)
router.post('/reset', auth, requireSuperAdmin, async (req, res, next) => {
  try {
    await connectDB();
    await Theme.deleteMany({});
    await Theme.insertMany(INITIAL_THEMES);

    await recordAuditEvent({
      action: 'THEMES_RESET',
      targetResource: 'Theme',
      details: { message: 'Reset all themes to default presets' },
      req
    });

    res.json({ ok: true, message: 'Themes reset to 8 default palettes (Editorial Sage active).' });
  } catch (err) {
    next(err);
  }
});

export default router;
