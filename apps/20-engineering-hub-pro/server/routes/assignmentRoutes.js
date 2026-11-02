import express from 'express';
import mongoose from 'mongoose';
import { Assignment } from '../models/Assignment.js';
import { Domain } from '../models/Domain.js';
import { connectDB } from '../config/db.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';
import { validateDomainAssociations, enrichDomainAssociations } from '../services/domainAssociationService.js';
import { documentUploadMiddleware, uploadDocumentToStorage, deleteDocumentFromStorage } from '../services/documentStorage.js';

const router = express.Router();

function sanitizeAssignmentBody(body) {
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

  const arrayRefKeys = [
    'secondaryDomains',
    'linkedGoals',
    'linkedRoadmaps',
    'linkedSkills',
    'linkedResources',
    'relatedPracticeLabs',
    'relatedProjects',
    'relatedMilestones'
  ];
  for (const key of arrayRefKeys) {
    if (key in body && Array.isArray(body[key])) {
      body[key] = body[key].filter(id => id && mongoose.Types.ObjectId.isValid(String(id)));
    }
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
 * GET /api/assignments
 * List assignments with multi-domain filtering, search, and privacy sanitization.
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
    if (req.query.assignmentType && req.query.assignmentType !== 'All') {
      query.assignmentType = req.query.assignmentType;
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
        { objective: regex },
        { instructions: regex },
        { assignmentId: regex }
      ];
    }

    const assignments = await Assignment.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('linkedSkills', 'name category level status proficiencyPercentage icon')
      .populate('linkedRoadmaps', 'title slug progress status difficulty category')
      .populate('linkedGoals', 'title status progress priority')
      .populate('relatedPracticeLabs', 'title labId difficulty status')
      .populate('relatedProjects', 'title slug status')
      .lean();

    const enriched = assignments.map(a => enrichDomainAssociations(a));

    if (!isPrivileged) {
      const sanitized = enriched.map(a => {
        const { privateNotes, ...publicSafe } = a;
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
 * GET /api/assignments/:idOrSlug
 * Retrieve single assignment by ID or slug.
 */
router.get('/:idOrSlug', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const { idOrSlug } = req.params;

    const isOid = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isOid ? { _id: idOrSlug } : { slug: idOrSlug };

    const assignment = await Assignment.findOne(filter)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('linkedSkills', 'name category level status proficiencyPercentage icon')
      .populate('linkedRoadmaps', 'title slug progress status difficulty category phases')
      .populate('linkedGoals', 'title status progress priority timeHorizon')
      .populate('linkedResources', 'title url category type')
      .populate('relatedPracticeLabs', 'title labId difficulty status')
      .populate('relatedProjects', 'title slug status githubUrl liveUrl coverImage')
      .populate('relatedMilestones', 'title status dueDate')
      .lean();

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    if (!isPrivileged && (assignment.visibility === 'private' || assignment.isArchived)) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    const enriched = enrichDomainAssociations(assignment);

    if (!isPrivileged) {
      const { privateNotes, ...publicSafe } = enriched;
      return res.json(publicSafe);
    }

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/assignments
 * Create new Assignment.
 */
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = sanitizeAssignmentBody(req.body || {});

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Assignment title is required.' });
    }

    // Validate domain associations if provided
    if (body.domainAssociations && body.domainAssociations.length > 0) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    const assignment = new Assignment({
      ...body,
      title: body.title.trim()
    });

    await assignment.save();

    await recordAuditEvent({
      action: 'ASSIGNMENT_CREATE',
      targetResource: 'Assignment',
      targetId: String(assignment._id),
      details: { title: assignment.title, assignmentId: assignment.assignmentId },
      req
    });

    const populated = await Assignment.findById(assignment._id)
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
 * PUT /api/assignments/:id
 * Update Assignment.
 */
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = sanitizeAssignmentBody(req.body || {});

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    if (body.domainAssociations) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    Object.assign(assignment, body);
    await assignment.save();

    await recordAuditEvent({
      action: 'ASSIGNMENT_UPDATE',
      targetResource: 'Assignment',
      targetId: String(assignment._id),
      details: { title: assignment.title, status: assignment.status },
      req
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('linkedSkills', 'name category level')
      .populate('linkedRoadmaps', 'title slug progress status')
      .lean();

    res.json(enrichDomainAssociations(populated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/assignments/:id
 * Delete Assignment permanently.
 */
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    // Cleanup attachments from storage
    if (assignment.attachments && assignment.attachments.length > 0) {
      for (const att of assignment.attachments) {
        await deleteDocumentFromStorage(att.storageKey, att.provider);
      }
    }

    await recordAuditEvent({
      action: 'ASSIGNMENT_DELETE',
      targetResource: 'Assignment',
      targetId: id,
      details: { title: assignment.title },
      req
    });

    res.json({ message: 'Assignment and attachments deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/assignments/:id/duplicate
 * Duplicate an Assignment.
 */
router.post('/:id/duplicate', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const assignment = await Assignment.findById(id).lean();
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const { _id, createdAt, updatedAt, assignmentId, slug, ...cloneData } = assignment;
    const newAssignment = new Assignment({
      ...cloneData,
      title: `${cloneData.title} (Copy)`,
      status: 'Not Started',
      submissions: [],
      obtainedMarks: 0,
      percentage: 0,
      evaluatedAt: null,
      submissionDate: null,
      reviewDate: null,
      tasks: (cloneData.tasks || []).map(t => ({ ...t, isCompleted: false, completedAt: null }))
    });

    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/assignments/:id/toggle-task
 * Check/uncheck individual assignment task.
 */
router.put('/:id/toggle-task', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { taskId, isCompleted, completed } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const task = assignment.tasks.find(t => t.id === taskId || (t._id && String(t._id) === String(taskId)));
    if (task) {
      const explicitVal = typeof isCompleted === 'boolean' ? isCompleted : (typeof completed === 'boolean' ? completed : null);
      task.isCompleted = explicitVal !== null ? explicitVal : !task.isCompleted;
      task.completedAt = task.isCompleted ? new Date() : null;
      await assignment.save();
    }

    res.json({
      tasks: assignment.tasks,
      status: assignment.status
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// SUBMISSIONS & RESUBMISSIONS (PART E)
// ==========================================

/**
 * POST /api/assignments/:id/submit
 * Submit or resubmit assignment work.
 */
router.post('/:id/submit', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { githubUrl, liveUrl, textResponse, notes, files } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const nextVersion = (assignment.submissions?.length || 0) + 1;
    const submission = {
      version: nextVersion,
      submittedAt: new Date(),
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      textResponse: textResponse || '',
      notes: notes || '',
      files: Array.isArray(files) ? files : [],
      status: nextVersion > 1 ? 'Resubmitted' : 'Submitted'
    };

    assignment.submissions.push(submission);
    assignment.status = 'Submitted';
    assignment.submissionDate = new Date();
    await assignment.save();

    await recordAuditEvent({
      action: 'ASSIGNMENT_SUBMIT',
      targetResource: 'Assignment',
      targetId: String(assignment._id),
      details: { title: assignment.title, version: nextVersion },
      req
    });

    res.status(201).json({
      submissions: assignment.submissions,
      latestSubmission: submission,
      status: assignment.status
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// EVALUATION & FEEDBACK (PART E)
// ==========================================

/**
 * PUT /api/assignments/:id/evaluate
 * Grade, review, or request revision on assignment.
 */
router.put('/:id/evaluate', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const {
      maxMarks,
      obtainedMarks,
      feedback,
      reviewComments,
      revisionRequests,
      status
    } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    if (maxMarks !== undefined) assignment.maxMarks = Number(maxMarks);
    if (obtainedMarks !== undefined) assignment.obtainedMarks = Number(obtainedMarks);
    if (feedback !== undefined) assignment.feedback = feedback;
    if (reviewComments !== undefined) assignment.reviewComments = reviewComments;
    if (revisionRequests !== undefined) assignment.revisionRequests = revisionRequests;

    if (status) {
      assignment.status = status;
    } else {
      assignment.status = revisionRequests ? 'Revision Required' : 'Reviewed';
    }

    assignment.evaluatedAt = new Date();
    assignment.reviewDate = new Date();

    await assignment.save();

    await recordAuditEvent({
      action: 'ASSIGNMENT_EVALUATE',
      targetResource: 'Assignment',
      targetId: String(assignment._id),
      details: { title: assignment.title, status: assignment.status, obtainedMarks },
      req
    });

    res.json(assignment);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// MARKDOWN FILE OPERATIONS (PART C)
// ==========================================

/**
 * POST /api/assignments/:id/markdown
 * Create new Markdown document inside Assignment.
 */
router.post('/:id/markdown', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { title, filename, content, templateType } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

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

    assignment.markdownFiles.push(newDoc);
    await assignment.save();

    res.status(201).json(newDoc);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/assignments/:id/markdown/:docId
 * Update existing Markdown document inside Assignment.
 */
router.put('/:id/markdown/:docId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, docId } = req.params;
    const { title, filename, content } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const doc = assignment.markdownFiles.find(d => d.id === docId);
    if (!doc) return res.status(404).json({ message: 'Markdown document not found.' });

    if (title !== undefined) doc.title = title.trim();
    if (filename !== undefined) {
      let safeName = filename.trim();
      if (!safeName.endsWith('.md') && !safeName.endsWith('.markdown')) safeName += '.md';
      doc.filename = safeName;
    }
    if (content !== undefined) doc.content = content;
    doc.updatedAt = new Date();

    await assignment.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/assignments/:id/markdown/:docId
 * Delete Markdown document from Assignment.
 */
router.delete('/:id/markdown/:docId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, docId } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    assignment.markdownFiles = assignment.markdownFiles.filter(d => d.id !== docId);
    await assignment.save();

    res.json({ message: 'Markdown document deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ATTACHMENT OPERATIONS (PARTS C, D & E)
// ==========================================

/**
 * POST /api/assignments/:id/attachments
 * Upload attachment file to Assignment.
 */
router.post('/:id/attachments', auth, requireEditorOrAbove, documentUploadMiddleware.single('file'), async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'No file provided.' });

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const storedFile = await uploadDocumentToStorage(req.file, 'assignments');
    assignment.attachments.push(storedFile);
    await assignment.save();

    res.status(201).json(storedFile);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/assignments/:id/attachments/:attachmentId
 * Delete attachment file from Assignment.
 */
router.delete('/:id/attachments/:attachmentId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, attachmentId } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const att = assignment.attachments.find(a => a.id === attachmentId);
    if (att) {
      await deleteDocumentFromStorage(att.storageKey, att.provider);
      assignment.attachments = assignment.attachments.filter(a => a.id !== attachmentId);
      await assignment.save();
    }

    res.json({ message: 'Attachment deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
