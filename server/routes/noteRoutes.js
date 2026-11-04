import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Note } from '../models/Note.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { slugify } from '../services/hierarchy.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

async function uniqueNoteSlug(title, excludeId) {
  let base = slugify(title);
  let slug = base;
  let n = 2;
  while (await Note.exists({ _id: { $ne: excludeId || null }, slug })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

// List Notes
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const isAll = req.query.all === 'true' && isPrivileged;
    const isArchived = req.query.archived === 'true' && isPrivileged;

    const query = {};
    if (isArchived) {
      query.isArchived = true;
    } else {
      query.isArchived = false;
      if (!isAll) {
        query.published = true;
        query.visibility = 'public';
      }
    }

    if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
    if (req.query.folder && req.query.folder !== 'All') query.folder = req.query.folder;

    const notes = await Note.find(query)
      .sort({ pinned: -1, updatedAt: -1 })
      .populate('relatedProjectId', 'title slug')
      .populate('relatedSkillIds', 'name category');

    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// Get Single Note by Slug or ID
router.get('/:slugOrId', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { slugOrId } = req.params;
    const isId = mongoose.Types.ObjectId.isValid(slugOrId);
    const query = isId ? { _id: slugOrId } : { slug: slugOrId };

    const note = await Note.findOne(query)
      .populate('relatedProjectId', 'title slug')
      .populate('relatedSkillIds', 'name category');

    if (!note) return res.status(404).json({ message: 'Note not found.' });

    const isPrivileged = !!req.user;
    if (!isPrivileged && (note.isArchived || !note.published || note.visibility !== 'public')) {
      return res.status(404).json({ message: 'Note not found or private.' });
    }

    res.json(note);
  } catch (err) {
    next(err);
  }
});

// Create Note
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = req.body || {};

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Note title is required.' });
    }

    const slug = body.slug ? body.slug.trim() : await uniqueNoteSlug(body.title);
    const published = body.published !== undefined ? body.published : (body.visibility === 'public');

    let tags = body.tags || [];
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const note = await Note.create({
      ...body,
      slug,
      tags,
      published,
      isArchived: false
    });

    await recordAuditEvent({
      action: 'NOTE_CREATE',
      targetResource: 'Note',
      targetId: String(note._id),
      details: { title: note.title, slug: note.slug },
      req
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// Update Note
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = req.body || {};

    const existing = await Note.findById(id);
    if (!existing) return res.status(404).json({ message: 'Note not found.' });

    if (body.title && body.title !== existing.title && !body.slug) {
      body.slug = await uniqueNoteSlug(body.title, id);
    }

    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (body.visibility !== undefined) {
      body.published = body.visibility === 'public';
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await recordAuditEvent({
      action: 'NOTE_UPDATE',
      targetResource: 'Note',
      targetId: String(id),
      details: { title: note.title },
      req
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

// Archive Note
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const note = await Note.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    await recordAuditEvent({
      action: 'NOTE_ARCHIVE',
      targetResource: 'Note',
      targetId: String(id),
      details: { title: note.title },
      req
    });

    res.json({ ok: true, message: 'Note archived.', note });
  } catch (err) {
    next(err);
  }
});

// Restore Note
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const note = await Note.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    await recordAuditEvent({
      action: 'NOTE_RESTORE',
      targetResource: 'Note',
      targetId: String(id),
      details: { title: note.title },
      req
    });

    res.json({ ok: true, message: 'Note restored.', note });
  } catch (err) {
    next(err);
  }
});

// Delete Note
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const note = await Note.findByIdAndDelete(id);

    if (!note) return res.status(404).json({ message: 'Note not found.' });

    await recordAuditEvent({
      action: 'NOTE_DELETE',
      targetResource: 'Note',
      targetId: String(id),
      details: { title: note.title },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
