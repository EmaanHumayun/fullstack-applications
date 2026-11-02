import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Certificate } from '../models/Certificate.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { deleteFileFromStorage } from '../services/storage.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

// List Certificates
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
        query.published = { $ne: false };
        query.visibility = { $ne: 'private' };
      }
    }

    if (req.query.primaryDomain) {
      query.primaryDomain = req.query.primaryDomain;
    } else if (req.query.domain && req.query.domain !== 'All') {
      query.$or = [{ primaryDomain: req.query.domain }, { domain: req.query.domain }];
    }

    if (req.query.subdomain && req.query.subdomain !== 'All') {
      query.subdomain = new RegExp(req.query.subdomain, 'i');
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    const certificates = await Certificate.find(query)
      .sort({ issuedAt: -1, createdAt: -1 })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name category level')
      .populate('relatedGoals', 'title status progress')
      .populate('relatedProjects', 'title slug status');

    res.json(certificates);
  } catch (err) {
    next(err);
  }
});

// Get Certificate by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    const cert = await Certificate.findById(id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name category level')
      .populate('relatedGoals', 'title status progress')
      .populate('relatedProjects', 'title slug status');

    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    res.json(cert);
  } catch (err) {
    next(err);
  }
});

// Create Certificate
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = req.body || {};

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Certificate title is required.' });
    }

    let tags = body.tags || [];
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const cert = await Certificate.create({
      ...body,
      tags,
      published: body.published !== undefined ? body.published : (body.visibility === 'public'),
      isArchived: false
    });

    await recordAuditEvent({
      action: 'CERTIFICATE_CREATE',
      targetResource: 'Certificate',
      targetId: String(cert._id),
      details: { title: cert.title, issuer: cert.issuer },
      req
    });

    const populated = await Certificate.findById(cert._id).populate('relatedSkills', 'name category level');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// Update Certificate
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = req.body || {};

    if (body.tags && typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    if (body.visibility !== undefined) {
      body.published = body.visibility === 'public';
    }

    const cert = await Certificate.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('relatedSkills', 'name category level');

    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

    await recordAuditEvent({
      action: 'CERTIFICATE_UPDATE',
      targetResource: 'Certificate',
      targetId: String(id),
      details: { title: cert.title },
      req
    });

    res.json(cert);
  } catch (err) {
    next(err);
  }
});

// Archive Certificate
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const cert = await Certificate.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

    await recordAuditEvent({
      action: 'CERTIFICATE_ARCHIVE',
      targetResource: 'Certificate',
      targetId: String(id),
      details: { title: cert.title },
      req
    });

    res.json({ ok: true, message: 'Certificate archived.', cert });
  } catch (err) {
    next(err);
  }
});

// Restore Certificate
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const cert = await Certificate.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

    await recordAuditEvent({
      action: 'CERTIFICATE_RESTORE',
      targetResource: 'Certificate',
      targetId: String(id),
      details: { title: cert.title },
      req
    });

    res.json({ ok: true, message: 'Certificate restored.', cert });
  } catch (err) {
    next(err);
  }
});

// Delete Certificate
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }
    const cert = await Certificate.findById(id);

    if (!cert) return res.status(404).json({ message: 'Certificate not found.' });

    if (cert.fileUrl && !cert.fileUrl.startsWith('http')) {
      await deleteFileFromStorage(cert.fileUrl, 'local');
    }

    await Certificate.findByIdAndDelete(id);

    await recordAuditEvent({
      action: 'CERTIFICATE_DELETE',
      targetResource: 'Certificate',
      targetId: String(id),
      details: { title: cert.title },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
