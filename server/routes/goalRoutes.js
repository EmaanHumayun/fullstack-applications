import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Goal } from '../models/Goal.js';
import { Domain } from '../models/Domain.js';
import { Roadmap } from '../models/Roadmap.js';
import { WorkLog } from '../models/WorkLog.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove, requireAdminOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';
import { validateDomainAssociations, enrichDomainAssociations } from '../services/domainAssociationService.js';

const router = express.Router();

/**
 * GET /api/goals/analytics
 * Real data-driven goal analytics computed from active database records.
 */
router.get('/analytics', auth, async (req, res, next) => {
  try {
    await connectDB();
    const goals = await Goal.find({ isArchived: false })
      .populate('linkedSkills', 'name category level')
      .populate('requiredSkills.skill', 'name category level')
      .lean();

    const totalActive = goals.length;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const byStatus = {
      Draft: 0,
      Planned: 0,
      Active: 0,
      'In Progress': 0,
      'On hold': 0,
      Completed: 0,
      Achieved: 0,
      Cancelled: 0
    };

    const byPriority = {
      Critical: 0,
      High: 0,
      Normal: 0,
      Low: 0
    };

    const byHorizon = {
      'Long-term Vision': 0,
      'Strategic Goal': 0,
      'Short-term Goal': 0,
      'Weekly Action': 0
    };

    let totalProgressSum = 0;
    let totalMilestonesCount = 0;
    let completedMilestonesCount = 0;
    let overdueMilestonesCount = 0;
    let overdueTasksCount = 0;
    let upcomingDeadlines = [];
    const requiredSkillsMap = {};

    goals.forEach(g => {
      // Status
      let st = g.status || 'Active';
      if (st === 'In Progress') st = 'Active';
      if (st === 'Achieved') st = 'Completed';
      if (byStatus[st] !== undefined) byStatus[st]++;
      else byStatus.Active++;

      // Priority
      let pr = g.priority || 'Normal';
      if (pr === 'Medium') pr = 'Normal';
      if (pr === 'Urgent') pr = 'Critical';
      if (byPriority[pr] !== undefined) byPriority[pr]++;
      else byPriority.Normal++;

      // Time horizon
      const hz = g.timeHorizon || 'Strategic Goal';
      if (byHorizon[hz] !== undefined) byHorizon[hz]++;
      else byHorizon['Strategic Goal']++;

      totalProgressSum += (g.progress || 0);

      // Deadlines
      const deadlineDate = g.deadline ? new Date(g.deadline) : (g.targetDate ? new Date(g.targetDate) : null);
      if (deadlineDate && !isNaN(deadlineDate.getTime())) {
        if (deadlineDate >= now && deadlineDate <= thirtyDaysFromNow && st !== 'Completed') {
          upcomingDeadlines.push({
            id: g._id,
            title: g.title,
            deadline: deadlineDate,
            priority: g.priority,
            progress: g.progress
          });
        }
      }

      // Milestones check
      (g.milestonesList || []).forEach(m => {
        totalMilestonesCount++;
        if (m.isCompleted) {
          completedMilestonesCount++;
        } else if (m.dueDate && new Date(m.dueDate) < now) {
          overdueMilestonesCount++;
        }
      });

      // Tasks check
      (g.tasks || []).forEach(t => {
        if (!t.isCompleted && t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now) {
          overdueTasksCount++;
        }
      });

      // Required skills aggregation
      (g.requiredSkills || []).forEach(rs => {
        if (rs.skill) {
          const sName = rs.skill.name || 'Unknown Skill';
          if (!requiredSkillsMap[sName]) {
            requiredSkillsMap[sName] = { count: 0, targetLevel: rs.targetLevel, isAcquired: rs.isAcquired };
          }
          requiredSkillsMap[sName].count++;
        }
      });
    });

    const skillsDemand = Object.keys(requiredSkillsMap).map(name => ({
      name,
      goalsCount: requiredSkillsMap[name].count,
      targetLevel: requiredSkillsMap[name].targetLevel,
      isAcquired: requiredSkillsMap[name].isAcquired
    })).sort((a, b) => b.goalsCount - a.goalsCount).slice(0, 8);

    res.json({
      totalActive,
      averageProgress: totalActive > 0 ? Math.round(totalProgressSum / totalActive) : 0,
      byStatus,
      byPriority,
      byHorizon,
      totalMilestonesCount,
      completedMilestonesCount,
      overdueMilestonesCount,
      overdueTasksCount,
      milestoneCompletionRate: totalMilestonesCount > 0 ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100) : 0,
      upcomingDeadlines: upcomingDeadlines.sort((a, b) => a.deadline - b.deadline).slice(0, 6),
      skillsDemand
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/goals
 * List goals with filtering, search, and privacy sanitization.
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

    // Domain filtering: match legacy primaryDomain, category, secondaryDomains, or domainAssociations
    if (req.query.primaryDomain) {
      const pid = req.query.primaryDomain;
      query.$or = [
        { primaryDomain: pid },
        { 'domainAssociations.domainId': pid }
      ];
    } else if (req.query.domain && req.query.domain !== 'All') {
      const d = req.query.domain;
      const isOid = mongoose.Types.ObjectId.isValid(d);
      let domainDocId = isOid ? d : null;
      if (!domainDocId) {
        const found = await Domain.findOne({ $or: [{ slug: d }, { name: d }] }).lean();
        if (found) domainDocId = found._id;
      }
      const domConditions = [{ category: d }];
      if (domainDocId) {
        domConditions.push(
          { primaryDomain: domainDocId },
          { secondaryDomains: domainDocId },
          { 'domainAssociations.domainId': domainDocId }
        );
      }
      query.$and = query.$and || [];
      query.$and.push({ $or: domConditions });
    } else if (req.query.category && req.query.category !== 'All') {
      query.$or = [{ primaryDomain: req.query.category }, { category: req.query.category }, { 'domainAssociations.domainId': req.query.category }];
    }

    // Subdomain filtering: match legacy subdomain string, subdomainId, or domainAssociations.subdomainIds
    if (req.query.subdomain && req.query.subdomain !== 'All') {
      const sub = req.query.subdomain;
      const isOid = mongoose.Types.ObjectId.isValid(sub);
      let subId = isOid ? sub : null;
      if (!subId) {
        const domWithField = await Domain.findOne({
          $or: [
            { 'fields.name': new RegExp(`^${sub}$`, 'i') },
            { 'fields.slug': new RegExp(`^${sub}$`, 'i') }
          ]
        }).lean();
        const f = domWithField?.fields?.find(
          field => field.name.toLowerCase() === sub.toLowerCase() || field.slug.toLowerCase() === sub.toLowerCase()
        );
        if (f) subId = f._id;
      }
      const subConditions = [{ subdomain: new RegExp(sub, 'i') }];
      if (subId) {
        subConditions.push(
          { subdomainId: subId },
          { 'domainAssociations.subdomainIds': subId }
        );
      }
      query.$and = query.$and || [];
      query.$and.push({ $or: subConditions });
    }

    if (req.query.timeHorizon && req.query.timeHorizon !== 'All') {
      query.timeHorizon = req.query.timeHorizon;
    }

    if (req.query.priority && req.query.priority !== 'All') {
      query.priority = req.query.priority;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { targetOutcome: searchRegex }
      ];
    }

    const goals = await Goal.find(query)
      .sort({ deadline: 1, targetDate: 1, priority: -1, createdAt: -1 })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('associatedProjects', 'title slug status githubUrl liveUrl coverImage')
      .populate('linkedSkills', 'name category level status proficiencyPercentage')
      .populate('requiredSkills.skill', 'name category level status proficiencyPercentage')
      .populate('certifications', 'title issuer issueDate credentialUrl')
      .populate('linkedRoadmaps', 'title slug progress status difficulty category')
      .populate('childGoals', 'title status progress priority')
      .populate('externalMilestones')
      .lean();

    const enrichedGoals = goals.map(g => enrichDomainAssociations(g));

    // Sanitize for public requests
    if (!isPrivileged) {
      const sanitized = enrichedGoals.map(g => {
        const { reviews, blockers, risks, tasks, ...publicSafe } = g;
        return publicSafe;
      });
      return res.json(sanitized);
    }

    res.json(enrichedGoals);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/goals/:id
 * Retrieve single goal by ID with populated references.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const { id } = req.params;

    const goal = await Goal.findById(id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('associatedProjects', 'title slug status githubUrl liveUrl coverImage')
      .populate('linkedSkills', 'name category level status proficiencyPercentage icon')
      .populate('requiredSkills.skill', 'name category level status proficiencyPercentage icon')
      .populate('certifications', 'title issuer issueDate credentialUrl')
      .populate('linkedRoadmaps', 'title slug progress status difficulty category')
      .populate('childGoals', 'title status progress priority timeHorizon')
      .populate('parentGoal', 'title status progress priority')
      .populate('externalMilestones')
      .lean();

    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const enriched = enrichDomainAssociations(goal);

    // Attach related work logs without altering authoritative goal progress
    const goalWorkLogs = await WorkLog.find({
      goalId: goal._id,
      isArchived: false,
      ...(isPrivileged ? {} : { visibility: 'public' })
    }).sort({ date: -1 }).select('title date timeSpentMinutes outcome category status').lean();

    goal.relatedWorkLogs = goalWorkLogs;
    goal.totalLoggedMinutes = goalWorkLogs.reduce((sum, w) => sum + (w.timeSpentMinutes || 0), 0);
    goal.totalLoggedHours = Math.round((goal.totalLoggedMinutes / 60) * 10) / 10;

    if (!isPrivileged) {
      if (enriched.visibility === 'private' || enriched.isArchived) {
        return res.status(404).json({ message: 'Goal not found.' });
      }
      const { reviews, blockers, risks, tasks, ...publicSafe } = enriched;
      return res.json(publicSafe);
    }

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

function sanitizeGoalBody(body) {
  if (!body || typeof body !== 'object') return body;

  const singleRefKeys = ['parentGoal', 'primaryDomain', 'subdomainId'];
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
    'childGoals',
    'linkedSkills',
    'associatedProjects',
    'linkedRoadmaps',
    'certifications',
    'secondaryDomains'
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

/**
 * POST /api/goals
 * Create new Goal
 */
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = sanitizeGoalBody(req.body || {});

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Goal title is required.' });
    }

    // Validate domainAssociations if provided
    if (body.domainAssociations) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    if (body.status) {
      const s = body.status.toLowerCase().replace(/[_-]/g, ' ').trim();
      if (s === 'in progress') body.status = 'In Progress';
      else if (s === 'active') body.status = 'Active';
      else if (s === 'planned') body.status = 'Planned';
      else if (s === 'completed') body.status = 'Completed';
      else if (s === 'achieved') body.status = 'Achieved';
      else if (s === 'draft') body.status = 'Draft';
      else if (s === 'on hold') body.status = 'On hold';
    }

    const goal = new Goal({
      ...body,
      title: body.title.trim(),
      isArchived: false
    });

    goal.recalculateProgress();
    await goal.save();

    await recordAuditEvent({
      action: 'GOAL_CREATE',
      targetResource: 'Goal',
      targetId: String(goal._id),
      details: { title: goal.title, category: goal.category, status: goal.status },
      req
    });

    const populated = await Goal.findById(goal._id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('associatedProjects', 'title slug status')
      .populate('linkedSkills', 'name category level')
      .populate('requiredSkills.skill', 'name category level')
      .lean();

    res.status(201).json(enrichDomainAssociations(populated));
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/goals/:id
 * Full Update Goal
 */
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = sanitizeGoalBody(req.body || {});
    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    // Validate domainAssociations if provided
    if (body.domainAssociations !== undefined) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    Object.assign(goal, body);
    goal.recalculateProgress();
    await goal.save();

    const populated = await Goal.findById(id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
      .populate('associatedProjects', 'title slug status')
      .populate('linkedSkills', 'name category level')
      .populate('requiredSkills.skill', 'name category level')
      .lean();

    await recordAuditEvent({
      action: 'GOAL_UPDATE',
      targetResource: 'Goal',
      targetId: String(id),
      details: { title: goal.title, progress: goal.progress, status: goal.status },
      req
    });

    res.json(enrichDomainAssociations(populated));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/goals/:id/milestones
 * Add milestone to goal
 */
router.post('/:id/milestones', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { title, description, dueDate, weight, sequence, evidenceUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Milestone title is required.' });
    }

    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const newMilestone = {
      title: title.trim(),
      description: (description || '').trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      weight: Number(weight) || 1,
      sequence: Number(sequence) || goal.milestonesList.length,
      isCompleted: false,
      evidenceUrl: (evidenceUrl || '').trim()
    };

    goal.milestonesList.push(newMilestone);
    goal.recalculateProgress();
    await goal.save();

    res.status(201).json({ ok: true, goal, milestone: newMilestone });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/goals/:id/milestones/:milestoneId/toggle
 * Toggle completion of milestone
 */
router.patch('/:id/milestones/:milestoneId/toggle', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, milestoneId } = req.params;

    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const milestone = goal.milestonesList.id(milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found in goal.' });

    milestone.isCompleted = !milestone.isCompleted;
    milestone.completedAt = milestone.isCompleted ? new Date() : null;

    goal.recalculateProgress();
    await goal.save();

    res.json({ ok: true, goal, milestone });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/goals/:id/tasks
 * Add actionable task to goal
 */
router.post('/:id/tasks', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { title, description, dueDate, priority, estimatedHours, associatedSkill } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const newTask = {
      title: title.trim(),
      description: (description || '').trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'Normal',
      status: 'todo',
      estimatedHours: Number(estimatedHours) || 1,
      actualHours: 0,
      isCompleted: false,
      associatedSkill: associatedSkill || null
    };

    goal.tasks.push(newTask);
    goal.recalculateProgress();
    await goal.save();

    res.status(201).json({ ok: true, goal, task: newTask });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/goals/:id/tasks/:taskId/toggle
 * Toggle completion of task
 */
router.patch('/:id/tasks/:taskId/toggle', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, taskId } = req.params;

    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const task = goal.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found in goal.' });

    task.isCompleted = !task.isCompleted;
    task.status = task.isCompleted ? 'completed' : 'todo';
    task.completedAt = task.isCompleted ? new Date() : null;

    goal.recalculateProgress();
    await goal.save();

    res.json({ ok: true, goal, task });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/goals/:id/reviews
 * Record a weekly review
 */
router.post('/:id/reviews', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { completedSummary, uncompletedSummary, blockers, learnings, isDeadlineRealistic, nextCommitments } = req.body;

    const goal = await Goal.findById(id);
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const review = {
      date: new Date(),
      completedSummary: (completedSummary || '').trim(),
      uncompletedSummary: (uncompletedSummary || '').trim(),
      blockers: (blockers || '').trim(),
      learnings: (learnings || '').trim(),
      isDeadlineRealistic: isDeadlineRealistic !== false,
      nextCommitments: (nextCommitments || '').trim()
    };

    goal.reviews.push(review);
    goal.updatedAt = new Date();
    await goal.save();

    res.status(201).json({ ok: true, goal, review });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/goals/:id/archive
 */
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const goal = await Goal.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    await recordAuditEvent({
      action: 'GOAL_ARCHIVE',
      targetResource: 'Goal',
      targetId: String(id),
      details: { title: goal.title },
      req
    });

    res.json({ ok: true, message: 'Goal archived.', goal });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/goals/:id/restore
 */
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const goal = await Goal.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    await recordAuditEvent({
      action: 'GOAL_RESTORE',
      targetResource: 'Goal',
      targetId: String(id),
      details: { title: goal.title },
      req
    });

    res.json({ ok: true, message: 'Goal restored.', goal });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/goals/:id
 */
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Goal not found.' });
    }
    const goal = await Goal.findByIdAndDelete(id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    // Clean up references in connected models
    await Roadmap.updateMany({ linkedGoals: id }, { $pull: { linkedGoals: id } }).catch(() => {});
    await WorkLog.updateMany({ relatedGoals: id }, { $pull: { relatedGoals: id } }).catch(() => {});

    await recordAuditEvent({
      action: 'GOAL_DELETE',
      targetResource: 'Goal',
      targetId: String(id),
      details: { title: goal.title },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
