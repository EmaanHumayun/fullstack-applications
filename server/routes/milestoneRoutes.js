import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Milestone } from '../models/Milestone.js';
import { Goal } from '../models/Goal.js';
import { Domain } from '../models/Domain.js';
import { Skill } from '../models/Skill.js';
import { Project } from '../models/Project.js';
import { Roadmap } from '../models/Roadmap.js';
import { Certificate } from '../models/Certificate.js';
import { Resource } from '../models/Resource.js';
import { WorkLog } from '../models/WorkLog.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

function populateMilestone(query) {
  return query
    .populate('primaryDomain', 'name slug icon accentColor fields')
    .populate('secondaryDomains', 'name slug icon accentColor')
    .populate('parentGoalId', 'title status progress deadline targetDate priority')
    .populate('relatedProjectId', 'title slug status technologies')
    .populate('relatedProjects', 'title slug status technologies')
    .populate('relatedSkillId', 'name slug level category status icon')
    .populate('relatedSkills', 'name slug level category status icon')
    .populate('relatedRoadmapId', 'title slug progress status difficulty phases')
    .populate('relatedCertifications', 'title issuer status credentialUrl')
    .populate('relatedResources', 'title url type difficulty status')
    .populate('relatedWorkLogs', 'title date timeSpentMinutes category')
    .populate('dependsOn', 'title status dueDate targetDate priority progress');
}

// 1. Analytics & Metrics Dashboard
router.get('/analytics', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const baseQuery = isPrivileged ? { isArchived: false } : { isArchived: false, visibility: 'public' };

    const allMilestones = await Milestone.find(baseQuery)
      .populate('primaryDomain', 'name')
      .populate('parentGoalId', 'title');

    const total = allMilestones.length;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const statusCounts = {
      not_started: 0,
      planned: 0,
      in_progress: 0,
      completed: 0,
      blocked: 0
    };

    const priorityCounts = {
      Low: 0,
      Normal: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
      Urgent: 0
    };

    const categoryCounts = {};
    const domainCounts = {};
    const goalCounts = {};

    let overdueCount = 0;
    let dueSoonCount = 0;
    let evidenceCount = 0;

    for (const m of allMilestones) {
      // Status
      const st = m.status || 'planned';
      statusCounts[st] = (statusCounts[st] || 0) + 1;

      // Priority
      const pr = m.priority || 'Medium';
      priorityCounts[pr] = (priorityCounts[pr] || 0) + 1;

      // Category
      const cat = m.category || 'Career';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Domains
      const domName = m.primaryDomain?.name || 'Unassigned';
      domainCounts[domName] = (domainCounts[domName] || 0) + 1;

      // Goals
      const goalTitle = m.parentGoalId?.title || 'Standalone';
      goalCounts[goalTitle] = (goalCounts[goalTitle] || 0) + 1;

      // Evidence count
      if ((m.evidence && m.evidence.length > 0) || m.evidenceUrl) {
        evidenceCount++;
      }

      // Overdue / Due Soon
      if (m.status !== 'completed') {
        const target = m.dueDate || m.targetDate;
        if (target) {
          const d = new Date(target);
          if (!isNaN(d.getTime())) {
            if (d < now) {
              overdueCount++;
            } else if (d <= sevenDaysLater) {
              dueSoonCount++;
            }
          }
        }
      }
    }

    const completionRate = total > 0 ? Math.round((statusCounts.completed / total) * 100) : 0;

    res.json({
      total,
      completionRate,
      statusCounts,
      priorityCounts,
      categoryCounts,
      domainCounts,
      goalCounts,
      overdueCount,
      dueSoonCount,
      evidenceCount
    });
  } catch (err) {
    next(err);
  }
});

// 2. List Milestones with rich filtering
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
      if (!isAll && !isPrivileged) {
        query.visibility = 'public';
      }
    }

    // Status filter
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    // Priority filter
    if (req.query.priority && req.query.priority !== 'All') {
      query.priority = req.query.priority;
    }

    // Parent Goal filter
    if (req.query.parentGoalId) {
      query.parentGoalId = req.query.parentGoalId;
    }

    // Domain & Subdomain filters
    if (req.query.primaryDomain && req.query.primaryDomain !== 'All') {
      if (mongoose.Types.ObjectId.isValid(req.query.primaryDomain)) {
        query.primaryDomain = req.query.primaryDomain;
      } else {
        const d = await Domain.findOne({ slug: req.query.primaryDomain });
        if (d) query.primaryDomain = d._id;
      }
    }

    if (req.query.subdomain && req.query.subdomain !== 'All') {
      query.subdomain = new RegExp(`^${req.query.subdomain}$`, 'i');
    }

    // Roadmap filter
    if (req.query.relatedRoadmapId) {
      query.relatedRoadmapId = req.query.relatedRoadmapId;
    }

    // Skill filter
    if (req.query.relatedSkillId) {
      query.$or = [
        { relatedSkillId: req.query.relatedSkillId },
        { relatedSkills: req.query.relatedSkillId }
      ];
    }

    // Project filter
    if (req.query.relatedProjectId) {
      query.$or = [
        { relatedProjectId: req.query.relatedProjectId },
        { relatedProjects: req.query.relatedProjectId }
      ];
    }

    // Fulltext search
    if (req.query.search && req.query.search.trim()) {
      const s = req.query.search.trim();
      const sRegex = new RegExp(s, 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: sRegex },
          { description: sRegex },
          { subdomain: sRegex },
          { successCriteria: sRegex },
          { tags: sRegex }
        ]
      });
    }

    let milestonesQuery = Milestone.find(query).sort({ order: 1, targetDate: 1, dueDate: 1, createdAt: -1 });

    // Server-side privacy projection for public unauthenticated visitors
    if (!isPrivileged) {
      milestonesQuery = milestonesQuery.select('-notes -statusHistory -evidenceNotes');
    }

    let milestones = await populateMilestone(milestonesQuery);

    // Dynamic overdue check / auto-blocked state verification
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // If client requested overdue only
    if (req.query.overdue === 'true') {
      milestones = milestones.filter(m => {
        if (m.status === 'completed' || m.status === 'archived') return false;
        const target = m.dueDate || m.targetDate;
        if (!target) return false;
        const d = new Date(target);
        return !isNaN(d.getTime()) && d < now;
      });
    }

    // If client requested due soon only
    if (req.query.dueSoon === 'true') {
      milestones = milestones.filter(m => {
        if (m.status === 'completed' || m.status === 'archived') return false;
        const target = m.dueDate || m.targetDate;
        if (!target) return false;
        const d = new Date(target);
        return !isNaN(d.getTime()) && d >= now && d <= sevenDaysLater;
      });
    }

    res.json(milestones);
  } catch (err) {
    next(err);
  }
});

// 3. Get Single Milestone by ID or Slug
router.get('/:idOrSlug', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { idOrSlug } = req.params;
    const isPrivileged = !!req.user;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    let milestoneQuery = Milestone.findOne(query);

    if (!isPrivileged) {
      milestoneQuery = milestoneQuery.select('-notes -statusHistory -evidenceNotes');
    }

    const milestone = await populateMilestone(milestoneQuery);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    if (!isPrivileged && (milestone.visibility !== 'public' || milestone.isArchived)) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    res.json(milestone);
  } catch (err) {
    next(err);
  }
});

function sanitizeMilestoneBody(body) {
  if (!body || typeof body !== 'object') return body;

  const singleRefKeys = [
    'parentGoalId',
    'goalId',
    'primaryDomain',
    'subdomainId',
    'relatedRoadmapId',
    'relatedSkillId',
    'relatedProjectId'
  ];

  for (const key of singleRefKeys) {
    if (key in body) {
      const val = body[key];
      if (!val || val === '' || val === 'none' || val === 'null' || val === 'undefined') {
        body[key] = null;
      } else if (typeof val === 'string' && !mongoose.Types.ObjectId.isValid(val)) {
        body[key] = null;
      }
    }
  }

  const arrayRefKeys = [
    'dependsOn',
    'secondaryDomains',
    'relatedSkills',
    'relatedProjects',
    'relatedCertifications',
    'relatedResources',
    'relatedWorkLogs'
  ];

  for (const key of arrayRefKeys) {
    if (key in body) {
      if (Array.isArray(body[key])) {
        body[key] = body[key].filter(id => id && id !== '' && mongoose.Types.ObjectId.isValid(String(id)));
      } else {
        body[key] = [];
      }
    }
  }

  return body;
}

// 4. Create Milestone
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = sanitizeMilestoneBody(req.body || {});

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Milestone title is required.' });
    }

    // Auto-inherit domain/subdomain from parent goal if not explicitly specified
    const goalRefId = body.parentGoalId || body.goalId;
    if (goalRefId && mongoose.Types.ObjectId.isValid(goalRefId)) {
      body.parentGoalId = goalRefId;
      const parentGoal = await Goal.findById(goalRefId);
      if (parentGoal) {
        if (!body.primaryDomain && parentGoal.primaryDomain) {
          body.primaryDomain = parentGoal.primaryDomain;
        }
        if (!body.subdomain && parentGoal.subdomain) {
          body.subdomain = parentGoal.subdomain;
        }
        if (!body.subdomainId && parentGoal.subdomainId) {
          body.subdomainId = parentGoal.subdomainId;
        }
      }
    } else {
      body.parentGoalId = null;
    }

    // Domain validation
    if (body.primaryDomain) {
      const dom = await Domain.findById(body.primaryDomain);
      if (!dom) {
        return res.status(400).json({ message: 'Selected primary domain does not exist.' });
      }
    }

    // Dependencies cycle check
    if (body.dependsOn && Array.isArray(body.dependsOn) && body.dependsOn.length > 0) {
      const hasCycle = await Milestone.detectCycle(null, body.dependsOn);
      if (hasCycle) {
        return res.status(400).json({ message: 'Circular dependency detected. A milestone cannot depend on itself.' });
      }
    }

    // Auto-block if any prerequisite is not completed
    if (body.dependsOn && body.dependsOn.length > 0 && body.status !== 'completed') {
      const prereqs = await Milestone.find({ _id: { $in: body.dependsOn } });
      const hasIncompletePrereq = prereqs.some(p => p.status !== 'completed');
      if (hasIncompletePrereq && (body.status === 'in_progress' || !body.status)) {
        body.status = 'blocked';
      }
    }

    const milestone = new Milestone({
      ...body,
      isArchived: false
    });

    await milestone.save();

    await recordAuditEvent({
      action: 'MILESTONE_CREATE',
      targetResource: 'Milestone',
      targetId: String(milestone._id),
      details: { title: milestone.title, category: milestone.category },
      req
    });

    const populated = await populateMilestone(Milestone.findById(milestone._id));
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// 5. Update Milestone
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = sanitizeMilestoneBody(req.body || {});

    const milestone = await Milestone.findById(id);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found.' });
    }

    // Cycle check if dependencies are modified
    if (body.dependsOn && Array.isArray(body.dependsOn)) {
      const hasCycle = await Milestone.detectCycle(id, body.dependsOn);
      if (hasCycle) {
        return res.status(400).json({
          message: 'Circular dependency detected. A milestone cannot depend on itself or one of its dependents.'
        });
      }
    }

    // Domain validation
    if (body.primaryDomain && String(body.primaryDomain) !== String(milestone.primaryDomain)) {
      const dom = await Domain.findById(body.primaryDomain);
      if (!dom) {
        return res.status(400).json({ message: 'Selected primary domain does not exist.' });
      }
    }

    // Handle goal association change
    const goalRefId = body.parentGoalId !== undefined ? body.parentGoalId : body.goalId;
    if (goalRefId !== undefined) {
      body.parentGoalId = goalRefId || null;
    }

    // Update fields
    Object.assign(milestone, body);
    await milestone.save();

    await recordAuditEvent({
      action: 'MILESTONE_UPDATE',
      targetResource: 'Milestone',
      targetId: String(id),
      details: { title: milestone.title, status: milestone.status },
      req
    });

    const populated = await populateMilestone(Milestone.findById(id));
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// 6. Toggle Subtask completion
router.put('/:id/toggle-subtask', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { subtaskId, completed } = req.body;

    const milestone = await Milestone.findById(id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });

    const subtask = milestone.subtasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found.' });

    subtask.completed = completed !== undefined ? !!completed : !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;

    await milestone.save();

    const populated = await populateMilestone(Milestone.findById(id));
    res.json({
      ok: true,
      progress: milestone.progress,
      status: milestone.status,
      milestone: populated
    });
  } catch (err) {
    next(err);
  }
});

// 7. Attach Verified Evidence
router.post('/:id/evidence', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { title, url, notes, type } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Evidence title is required.' });
    }

    const milestone = await Milestone.findById(id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });

    milestone.evidence = milestone.evidence || [];
    milestone.evidence.push({
      title: title.trim(),
      url: url || '',
      notes: notes || '',
      type: type || 'repository',
      date: new Date()
    });

    if (url && !milestone.evidenceUrl) {
      milestone.evidenceUrl = url;
    }

    await milestone.save();

    res.status(201).json({
      ok: true,
      evidence: milestone.evidence
    });
  } catch (err) {
    next(err);
  }
});

// 8. Archive Milestone
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const milestone = await Milestone.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });

    await recordAuditEvent({
      action: 'MILESTONE_ARCHIVE',
      targetResource: 'Milestone',
      targetId: String(id),
      details: { title: milestone.title },
      req
    });

    res.json({ ok: true, message: 'Milestone archived.', milestone });
  } catch (err) {
    next(err);
  }
});

// 9. Restore Milestone
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const milestone = await Milestone.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });

    await recordAuditEvent({
      action: 'MILESTONE_RESTORE',
      targetResource: 'Milestone',
      targetId: String(id),
      details: { title: milestone.title },
      req
    });

    res.json({ ok: true, message: 'Milestone restored.', milestone });
  } catch (err) {
    next(err);
  }
});

// 10. Delete Milestone (with reference cleanup)
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const milestone = await Milestone.findByIdAndDelete(id);

    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });

    // Remove milestone references from other milestones dependsOn
    await Milestone.updateMany(
      { dependsOn: id },
      { $pull: { dependsOn: id } }
    );

    await recordAuditEvent({
      action: 'MILESTONE_DELETE',
      targetResource: 'Milestone',
      targetId: String(id),
      details: { title: milestone.title },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
