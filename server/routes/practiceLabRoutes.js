import express from 'express';
import mongoose from 'mongoose';
import { PracticeLab } from '../models/PracticeLab.js';
import { Domain } from '../models/Domain.js';
import { connectDB } from '../config/db.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';
import { validateDomainAssociations, enrichDomainAssociations } from '../services/domainAssociationService.js';
import { documentUploadMiddleware, uploadDocumentToStorage, deleteDocumentFromStorage } from '../services/documentStorage.js';

const router = express.Router();

function sanitizeLabBody(body) {
  if (!body || typeof body !== 'object') return body;
  const singleRefKeys = ['primaryDomain', 'subdomainId'];
  for (const key of singleRefKeys) {
    if (key in body) {
      const val = body[key];
      if (!val || val === '' || val === 'none' || val === 'null' || !mongoose.Types.ObjectId.isValid(String(val))) {
        body[key] = null;
      }
    }
  }

  const arrayRefKeys = ['secondaryDomains', 'linkedGoals', 'linkedRoadmaps', 'linkedSkills', 'linkedResources', 'relatedProjects', 'relatedAssignments'];
  for (const key of arrayRefKeys) {
    if (key in body && Array.isArray(body[key])) {
      body[key] = body[key].filter(id => id && mongoose.Types.ObjectId.isValid(String(id)));
    }
  }

  if (Array.isArray(body.commands)) {
    body.commands = body.commands.map(cmd => {
      if (typeof cmd === 'string') return { command: cmd, description: '' };
      if (cmd && typeof cmd === 'object') {
        return {
          command: String(cmd.command || ''),
          description: String(cmd.description || '')
        };
      }
      return { command: String(cmd || ''), description: '' };
    });
  }

  if (Array.isArray(body.tasks)) {
    body.tasks = body.tasks.map(t => ({
      ...t,
      isCompleted: typeof t.isCompleted === 'boolean' ? t.isCompleted : (typeof t.completed === 'boolean' ? t.completed : false)
    }));
  }

  return body;
}

/**
 * GET /api/practice-labs
 * List practice labs with search, multi-domain filtering, and permission checks.
 */
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
        query.visibility = 'public';
      }
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }
    if (req.query.difficulty && req.query.difficulty !== 'All') {
      query.difficulty = req.query.difficulty;
    }
    if (req.query.labType && req.query.labType !== 'All') {
      query.labType = req.query.labType;
    }

    // Domain & Subdomain Filter
    if (req.query.domainId && req.query.domainId !== 'All') {
      if (mongoose.Types.ObjectId.isValid(req.query.domainId)) {
        const dId = new mongoose.Types.ObjectId(req.query.domainId);
        query.$or = [
          { 'domainAssociations.domainId': dId },
          { primaryDomain: dId },
          { secondaryDomains: dId }
        ];
      }
    }
    if (req.query.subdomainId && req.query.subdomainId !== 'All') {
      if (mongoose.Types.ObjectId.isValid(req.query.subdomainId)) {
        const subId = new mongoose.Types.ObjectId(req.query.subdomainId);
        query['domainAssociations.subdomainIds'] = subId;
      }
    }

    // Search query
    if (req.query.search && req.query.search.trim()) {
      const s = req.query.search.trim();
      const regex = new RegExp(s, 'i');
      query.$or = [
        ...(query.$or || []),
        { title: regex },
        { shortDescription: regex },
        { detailedDescription: regex },
        { learningObjective: regex },
        { technologies: regex },
        { labId: regex }
      ];
    }

    const labs = await PracticeLab.find(query)
      .sort({ createdAt: -1 })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('linkedSkills', 'name category level status proficiencyPercentage icon')
      .populate('linkedRoadmaps', 'title slug progress status difficulty category')
      .populate('linkedGoals', 'title status progress priority')
      .populate('relatedProjects', 'title slug status')
      .lean();

    const enriched = labs.map(lab => enrichDomainAssociations(lab));

    if (!isPrivileged) {
      // Strip private notes
      const sanitized = enriched.map(lab => {
        const { personalNotes, ...publicSafe } = lab;
        return publicSafe;
      });
      return res.json(sanitized);
    }

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/practice-labs/:idOrSlug
 * Retrieve single practice lab.
 */
router.get('/:idOrSlug', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const { idOrSlug } = req.params;

    const isOid = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isOid ? { _id: idOrSlug } : { slug: idOrSlug };

    const lab = await PracticeLab.findOne(filter)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('linkedSkills', 'name category level status proficiencyPercentage icon')
      .populate('linkedRoadmaps', 'title slug progress status difficulty category phases')
      .populate('linkedGoals', 'title status progress priority timeHorizon')
      .populate('linkedResources', 'title url category type')
      .populate('relatedProjects', 'title slug status githubUrl liveUrl coverImage')
      .populate('relatedAssignments', 'title assignmentId difficulty status dueDate')
      .lean();

    if (!lab) {
      return res.status(404).json({ message: 'Practice Lab not found.' });
    }

    if (!isPrivileged && (lab.visibility === 'private' || lab.isArchived)) {
      return res.status(404).json({ message: 'Practice Lab not found.' });
    }

    const enriched = enrichDomainAssociations(lab);

    if (!isPrivileged) {
      const { personalNotes, ...publicSafe } = enriched;
      return res.json(publicSafe);
    }

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/practice-labs
 * Create new Practice Lab.
 */
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = sanitizeLabBody(req.body || {});

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Practice Lab title is required.' });
    }

    // Validate multi-domain associations
    if (body.domainAssociations && body.domainAssociations.length > 0) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    const lab = new PracticeLab({
      ...body,
      title: body.title.trim()
    });

    await lab.save();

    await recordAuditEvent({
      action: 'PRACTICE_LAB_CREATE',
      targetResource: 'PracticeLab',
      targetId: String(lab._id),
      details: { title: lab.title, labId: lab.labId, difficulty: lab.difficulty },
      req
    });

    const populated = await PracticeLab.findById(lab._id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('linkedSkills', 'name category level')
      .lean();

    res.status(201).json(enrichDomainAssociations(populated));
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/practice-labs/:id
 * Update existing Practice Lab.
 */
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = sanitizeLabBody(req.body || {});

    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    // Validate domain associations if modified
    if (body.domainAssociations) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    Object.assign(lab, body);
    await lab.save();

    await recordAuditEvent({
      action: 'PRACTICE_LAB_UPDATE',
      targetResource: 'PracticeLab',
      targetId: String(lab._id),
      details: { title: lab.title, status: lab.status },
      req
    });

    const populated = await PracticeLab.findById(lab._id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('linkedSkills', 'name category level')
      .populate('linkedRoadmaps', 'title slug progress status')
      .populate('linkedGoals', 'title status progress')
      .lean();

    res.json(enrichDomainAssociations(populated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/practice-labs/:id
 * Delete Practice Lab permanently.
 */
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const lab = await PracticeLab.findByIdAndDelete(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    // Cleanup associated attachments from storage
    if (lab.attachments && lab.attachments.length > 0) {
      for (const att of lab.attachments) {
        await deleteDocumentFromStorage(att.storageKey, att.provider);
      }
    }

    await recordAuditEvent({
      action: 'PRACTICE_LAB_DELETE',
      targetResource: 'PracticeLab',
      targetId: id,
      details: { title: lab.title },
      req
    });

    res.json({ message: 'Practice Lab and attachments deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/practice-labs/:id/duplicate
 * Duplicate a Practice Lab.
 */
router.post('/:id/duplicate', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const lab = await PracticeLab.findById(id).lean();
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    const { _id, createdAt, updatedAt, labId, slug, ...cloneData } = lab;
    const newLab = new PracticeLab({
      ...cloneData,
      title: `${cloneData.title} (Copy)`,
      status: 'Not Started',
      completionPercentage: 0,
      startedAt: null,
      completedAt: null,
      attemptsCount: 0,
      tasks: (cloneData.tasks || []).map(t => ({ ...t, isCompleted: false, completedAt: null }))
    });

    await newLab.save();
    res.status(201).json(newLab);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/practice-labs/:id/toggle-task
 * Toggle completion of a specific task in a lab.
 */
router.put('/:id/toggle-task', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { taskId, isCompleted, completed } = req.body;

    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    const task = lab.tasks.find(t => t.id === taskId || (t._id && String(t._id) === String(taskId)));
    if (task) {
      const explicitVal = typeof isCompleted === 'boolean' ? isCompleted : (typeof completed === 'boolean' ? completed : null);
      task.isCompleted = explicitVal !== null ? explicitVal : !task.isCompleted;
      task.completedAt = task.isCompleted ? new Date() : null;
      lab.lastPracticedAt = new Date();
      await lab.save();
    }

    res.json({
      tasks: lab.tasks,
      completionPercentage: lab.completionPercentage,
      status: lab.status
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/practice-labs/:id/start
 * Mark lab as started / resume practice.
 */
router.put('/:id/start', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    lab.status = 'In Progress';
    lab.startedAt = lab.startedAt || new Date();
    lab.lastPracticedAt = new Date();
    lab.attemptsCount = (lab.attemptsCount || 0) + 1;
    await lab.save();

    res.json(lab);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/practice-labs/:id/complete
 * Manually mark lab as completed.
 */
router.put('/:id/complete', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    lab.status = 'Completed';
    lab.completedAt = new Date();
    lab.completionPercentage = 100;
    lab.tasks.forEach(t => {
      t.isCompleted = true;
      t.completedAt = t.completedAt || new Date();
    });
    await lab.save();

    res.json(lab);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/practice-labs/:id/evidence
 * Log evidence / screenshot / log record.
 */
router.post('/:id/evidence', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { title, evidenceType, description, fileUrl, externalUrl } = req.body;

    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    const newEvidence = {
      id: Math.random().toString(36).substring(2, 9),
      title: (title || 'Practical Evidence').trim(),
      evidenceType: evidenceType || 'Screenshot / Terminal Log',
      description: description || '',
      fileUrl: fileUrl || '',
      externalUrl: externalUrl || '',
      recordedAt: new Date()
    };

    lab.evidence.push(newEvidence);
    await lab.save();

    res.status(201).json(lab.evidence);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/practice-labs/:id/evidence/:evidenceId
 */
router.delete('/:id/evidence/:evidenceId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, evidenceId } = req.params;
    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    lab.evidence = lab.evidence.filter(e => e.id !== evidenceId);
    await lab.save();

    res.json(lab.evidence);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MARKDOWN FILE OPERATIONS (PART C)
// ==========================================

/**
 * POST /api/practice-labs/:id/markdown
 * Create new Markdown document inside Lab.
 */
router.post('/:id/markdown', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { title, filename, content, templateType } = req.body;

    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    let safeFilename = (filename || 'document.md').trim();
    if (!safeFilename.endsWith('.md') && !safeFilename.endsWith('.markdown')) {
      safeFilename += '.md';
    }

    const newDoc = {
      id: Math.random().toString(36).substring(2, 9),
      title: (title || safeFilename.replace(/\.md$/, '')).trim(),
      filename: safeFilename,
      content: content || '',
      templateType: templateType || 'Custom',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    lab.markdownFiles.push(newDoc);
    await lab.save();

    res.status(201).json(newDoc);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/practice-labs/:id/markdown/:docId
 * Update existing Markdown document inside Lab.
 */
router.put('/:id/markdown/:docId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, docId } = req.params;
    const { title, filename, content } = req.body;

    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    const doc = lab.markdownFiles.find(d => d.id === docId);
    if (!doc) return res.status(404).json({ message: 'Markdown document not found.' });

    if (title !== undefined) doc.title = title.trim();
    if (filename !== undefined) {
      let safeName = filename.trim();
      if (!safeName.endsWith('.md') && !safeName.endsWith('.markdown')) safeName += '.md';
      doc.filename = safeName;
    }
    if (content !== undefined) doc.content = content;
    doc.updatedAt = new Date();

    await lab.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/practice-labs/:id/markdown/:docId
 * Delete Markdown document from Lab.
 */
router.delete('/:id/markdown/:docId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, docId } = req.params;
    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    lab.markdownFiles = lab.markdownFiles.filter(d => d.id !== docId);
    await lab.save();

    res.json({ message: 'Markdown document deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ATTACHMENT OPERATIONS (PARTS C, D & E)
// ==========================================

/**
 * POST /api/practice-labs/:id/attachments
 * Upload attachment file to Lab.
 */
router.post('/:id/attachments', auth, requireEditorOrAbove, documentUploadMiddleware.single('file'), async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No file provided.' });

    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    const storedFile = await uploadDocumentToStorage(req.file, 'labs');
    lab.attachments.push(storedFile);
    await lab.save();

    res.status(201).json(storedFile);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/practice-labs/:id/attachments/:attachmentId
 * Delete attachment file from Lab.
 */
router.delete('/:id/attachments/:attachmentId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, attachmentId } = req.params;
    const lab = await PracticeLab.findById(id);
    if (!lab) return res.status(404).json({ message: 'Practice Lab not found.' });

    const att = lab.attachments.find(a => a.id === attachmentId);
    if (att) {
      await deleteDocumentFromStorage(att.storageKey, att.provider);
      lab.attachments = lab.attachments.filter(a => a.id !== attachmentId);
      await lab.save();
    }

    res.json({ message: 'Attachment deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
