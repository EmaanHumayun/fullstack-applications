import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Skill } from '../models/Skill.js';
import { Goal } from '../models/Goal.js';
import { Roadmap } from '../models/Roadmap.js';
import { WorkLog } from '../models/WorkLog.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove, requireAdminOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

/**
 * GET /api/skills/analytics
 * Comprehensive data-driven analytics computed from real database records.
 */
router.get('/analytics', auth, async (req, res, next) => {
  try {
    await connectDB();
    const skills = await Skill.find({ isArchived: false }).lean();
    const goals = await Goal.find({ isArchived: false }).lean();

    const totalActive = skills.length;

    // Status breakdown
    const byStatus = {
      Planned: 0,
      Learning: 0,
      Practising: 0,
      Demonstrated: 0,
      'Needs revision': 0,
      'On hold': 0
    };

    // Level breakdown
    const byLevel = {
      Beginner: 0,
      Developing: 0,
      Intermediate: 0,
      Advanced: 0,
      Expert: 0
    };

    // Category breakdown
    const byCategory = {};

    let totalProficiency = 0;
    let recentlyPractisedCount = 0;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const levelRank = {
      Beginner: 1,
      Developing: 2,
      Intermediate: 3,
      Advanced: 4,
      Expert: 5
    };

    const skillGaps = [];
    const recommendations = [];

    skills.forEach(skill => {
      // Map legacy statuses
      let normalizedStatus = skill.status;
      if (normalizedStatus === 'Proficient' || normalizedStatus === 'Mastered') normalizedStatus = 'Demonstrated';
      if (normalizedStatus === 'To Learn') normalizedStatus = 'Planned';

      if (byStatus[normalizedStatus] !== undefined) {
        byStatus[normalizedStatus]++;
      } else {
        byStatus.Learning++;
      }

      // Level
      const lvl = skill.level || 'Intermediate';
      if (byLevel[lvl] !== undefined) {
        byLevel[lvl]++;
      } else {
        byLevel.Intermediate++;
      }

      // Category
      const cat = skill.category || 'General';
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, totalPct: 0, skills: [] };
      }
      byCategory[cat].count++;
      byCategory[cat].totalPct += (skill.proficiencyPercentage || 0);
      byCategory[cat].skills.push({
        id: skill._id,
        name: skill.name,
        level: skill.level,
        proficiencyPercentage: skill.proficiencyPercentage
      });

      totalProficiency += (skill.proficiencyPercentage || 0);

      // Practice activity check
      if (skill.lastPractisedDate && new Date(skill.lastPractisedDate) >= thirtyDaysAgo) {
        recentlyPractisedCount++;
      } else if (skill.practiceHistory && skill.practiceHistory.length > 0) {
        const latest = skill.practiceHistory[skill.practiceHistory.length - 1];
        if (latest.date && new Date(latest.date) >= thirtyDaysAgo) {
          recentlyPractisedCount++;
        }
      }

      // Gap analysis: current level vs target level
      const currentRank = levelRank[skill.level] || 3;
      const targetRank = levelRank[skill.targetProficiency] || 4;
      if (targetRank > currentRank) {
        skillGaps.push({
          id: skill._id,
          name: skill.name,
          category: skill.category,
          currentLevel: skill.level,
          targetLevel: skill.targetProficiency,
          gap: targetRank - currentRank,
          confidence: skill.confidenceRating || 5,
          nextAction: skill.nextAction || `Build practical projects using ${skill.name}`
        });
      }

      // Concrete recommendations
      if (skill.priority === 'Critical' && normalizedStatus === 'Planned') {
        recommendations.push({
          type: 'HIGH_PRIORITY_PLANNED',
          severity: 'warning',
          skillId: skill._id,
          skillName: skill.name,
          message: `Critical priority skill "${skill.name}" is still in Planned state. Consider scheduling active practice.`
        });
      }

      if (normalizedStatus === 'Demonstrated' && (!skill.relatedProjects || skill.relatedProjects.length === 0) && (!skill.practicalEvidence || skill.practicalEvidence.length === 0)) {
        recommendations.push({
          type: 'MISSING_EVIDENCE',
          severity: 'info',
          skillId: skill._id,
          skillName: skill.name,
          message: `"${skill.name}" is marked Demonstrated but has no linked projects or practical evidence attached.`
        });
      }

      if (normalizedStatus === 'Practising' && (!skill.lastPractisedDate || new Date(skill.lastPractisedDate) < thirtyDaysAgo)) {
        recommendations.push({
          type: 'DORMANT_PRACTICE',
          severity: 'warning',
          skillId: skill._id,
          skillName: skill.name,
          message: `Active practice for "${skill.name}" has lapsed (>30 days). A brief revision session is recommended.`
        });
      }
    });

    // Check goals linked to skills
    const skillIdsInGoals = new Set();
    goals.forEach(g => {
      (g.linkedSkills || []).forEach(sId => skillIdsInGoals.add(String(sId)));
      (g.requiredSkills || []).forEach(rs => {
        if (rs.skill) skillIdsInGoals.add(String(rs.skill));
      });
    });

    const categorySummary = Object.keys(byCategory).map(cat => ({
      category: cat,
      count: byCategory[cat].count,
      averageProficiency: Math.round(byCategory[cat].totalPct / byCategory[cat].count)
    })).sort((a, b) => b.count - a.count);

    res.json({
      totalActive,
      averageProficiency: totalActive > 0 ? Math.round(totalProficiency / totalActive) : 0,
      byStatus,
      byLevel,
      byCategory: categorySummary,
      linkedToGoalsCount: skillIdsInGoals.size,
      recentlyPractisedCount,
      skillGapsCount: skillGaps.length,
      skillGaps: skillGaps.sort((a, b) => b.gap - a.gap).slice(0, 10),
      recommendations: recommendations.slice(0, 8)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/skills
 * List skills with multi-parameter filtering, search, and public/private sanitization.
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
        query.visibility = { $ne: 'private' };
      }
    }

    if (req.query.primaryDomain) {
      query.primaryDomain = req.query.primaryDomain;
    } else if (req.query.domain && req.query.domain !== 'All') {
      query.$or = [{ primaryDomain: req.query.domain }, { category: req.query.domain }];
    } else if (req.query.category && req.query.category !== 'All') {
      query.$or = [{ primaryDomain: req.query.category }, { category: req.query.category }];
    }

    if (req.query.subdomain && req.query.subdomain !== 'All') {
      query.$or = query.$or || [];
      query.$or.push(
        { subdomain: new RegExp(req.query.subdomain, 'i') },
        { subcategory: new RegExp(req.query.subdomain, 'i') }
      );
    }

    if (req.query.level && req.query.level !== 'All') {
      query.level = req.query.level;
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { subcategory: searchRegex },
        { subdomain: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    let sort = { order: 1, proficiencyPercentage: -1, name: 1 };
    if (req.query.sort === 'name') sort = { name: 1 };
    if (req.query.sort === 'level') sort = { proficiencyPercentage: -1 };
    if (req.query.sort === 'recent') sort = { lastPractisedDate: -1, updatedAt: -1 };
    if (req.query.sort === 'featured') sort = { featuredOrder: 1, order: 1 };

    let skillsQuery = Skill.find(query)
      .sort(sort)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedProjects', 'title slug description coverImage tags githubUrl liveUrl status')
      .populate('relatedCertificates', 'title issuer issueDate credentialUrl badgeImage')
      .populate('relatedRoadmaps', 'title slug progress status difficulty category');

    if (isPrivileged) {
      skillsQuery = skillsQuery.populate('relatedGoals', 'title status progress priority targetDate');
    }

    const skills = await skillsQuery.lean();

    // Sanitize for public requests
    if (!isPrivileged) {
      const sanitized = skills.map(s => {
        const { learningNotes, knownGaps, practiceHistory, relatedGoals, ...publicSafe } = s;
        return publicSafe;
      });
      return res.json(sanitized);
    }

    res.json(skills);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/skills/:id
 * Get single skill by ID with populated references.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const { id } = req.params;

    let skillQuery = Skill.findById(id)
      .populate('relatedProjects', 'title slug description coverImage tags githubUrl liveUrl status')
      .populate('relatedCertificates', 'title issuer issueDate credentialUrl badgeImage')
      .populate('relatedRoadmaps', 'title slug progress status difficulty category');

    if (isPrivileged) {
      skillQuery = skillQuery.populate('relatedGoals', 'title status progress priority targetDate deadline');
    }

    const skill = await skillQuery.lean();
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    // Attach all roadmaps and specific steps developing this skill
    const roadmapsWithStep = await Roadmap.find({
      $or: [
        { _id: { $in: skill.relatedRoadmaps || [] } },
        { linkedSkills: skill._id },
        { 'phases.steps.linkedSkills': skill._id },
        { 'phases.steps.skillId': skill._id },
        { 'stages.steps.linkedSkills': skill._id },
        { 'stages.steps.skillId': skill._id }
      ]
    }).select('title slug status progress difficulty phases category').lean();
    skill.relatedRoadmapsList = roadmapsWithStep;

    // Attach real WorkLog practice history (without artificially inflating proficiency)
    const skillWorkLogs = await WorkLog.find({
      skillIds: skill._id,
      isArchived: false,
      ...(isPrivileged ? {} : { visibility: 'public' })
    }).select('title date timeSpentMinutes outcome category').sort({ date: -1 }).lean();

    skill.relatedWorkLogsList = skillWorkLogs;
    skill.totalPracticeMinutes = skillWorkLogs.reduce((sum, w) => sum + (w.timeSpentMinutes || 0), 0);
    skill.totalPracticeHours = Math.round((skill.totalPracticeMinutes / 60) * 10) / 10;
    skill.lastPracticeDate = skillWorkLogs[0]?.date || skill.lastPractisedDate || null;

    if (!isPrivileged) {
      if (skill.visibility === 'private' || skill.isArchived) {
        return res.status(404).json({ message: 'Skill not found.' });
      }
      const { learningNotes, knownGaps, practiceHistory, relatedGoals, ...publicSafe } = skill;
      return res.json(publicSafe);
    }

    res.json(skill);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/skills
 * Create new Skill
 */
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = req.body || {};

    if (!body.name || !body.name.trim()) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    const skill = await Skill.create({
      ...body,
      name: body.name.trim(),
      isArchived: false
    });

    await recordAuditEvent({
      action: 'SKILL_CREATE',
      targetResource: 'Skill',
      targetId: String(skill._id),
      details: { name: skill.name, category: skill.category, level: skill.level },
      req
    });

    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/skills/:id
 * Full Update Skill
 */
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('relatedProjects', 'title slug description coverImage tags')
      .populate('relatedGoals', 'title status progress priority')
      .populate('relatedCertificates', 'title issuer issueDate');

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    await recordAuditEvent({
      action: 'SKILL_UPDATE',
      targetResource: 'Skill',
      targetId: String(id),
      details: { name: skill.name, category: skill.category, level: skill.level },
      req
    });

    res.json(skill);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/skills/:id/quick-status
 * Quick inline status and proficiency updater
 */
router.patch('/:id/quick-status', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { status, level, proficiencyPercentage, confidenceRating } = req.body;

    const updates = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (level !== undefined) updates.level = level;
    if (proficiencyPercentage !== undefined) updates.proficiencyPercentage = Number(proficiencyPercentage);
    if (confidenceRating !== undefined) updates.confidenceRating = Number(confidenceRating);

    const skill = await Skill.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ message: 'Skill not found.' });

    res.json(skill);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/skills/:id/practice
 * Log practice session directly into practiceHistory
 */
router.post('/:id/practice', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { durationMinutes, topic, learnings, challenges, evidenceUrl, nextAction, date } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) return res.status(404).json({ message: 'Skill not found.' });

    const sessionDate = date ? new Date(date) : new Date();
    const session = {
      date: sessionDate,
      durationMinutes: Number(durationMinutes) || 30,
      topic: (topic || '').trim(),
      learnings: (learnings || '').trim(),
      challenges: (challenges || '').trim(),
      evidenceUrl: (evidenceUrl || '').trim(),
      nextAction: (nextAction || '').trim()
    };

    skill.practiceHistory.push(session);
    skill.lastPractisedDate = sessionDate;
    if (nextAction && nextAction.trim()) {
      skill.nextAction = nextAction.trim();
    }
    skill.updatedAt = new Date();
    await skill.save();

    await recordAuditEvent({
      action: 'SKILL_PRACTICE_LOG',
      targetResource: 'Skill',
      targetId: String(id),
      details: { name: skill.name, duration: session.durationMinutes, topic: session.topic },
      req
    });

    res.status(201).json({ ok: true, skill, session });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/skills/:id/evidence
 * Add practical evidence item
 */
router.post('/:id/evidence', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { title, url, description, date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Evidence title is required.' });
    }

    const skill = await Skill.findById(id);
    if (!skill) return res.status(404).json({ message: 'Skill not found.' });

    const evidence = {
      title: title.trim(),
      url: (url || '').trim(),
      description: (description || '').trim(),
      date: date ? new Date(date) : new Date()
    };

    skill.practicalEvidence.push(evidence);
    skill.updatedAt = new Date();
    await skill.save();

    res.status(201).json({ ok: true, skill, evidence });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/skills/:id/archive
 */
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: 'Skill not found.' });

    await recordAuditEvent({
      action: 'SKILL_ARCHIVE',
      targetResource: 'Skill',
      targetId: String(id),
      details: { name: skill.name },
      req
    });

    res.json({ ok: true, message: 'Skill moved to archive.', skill });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/skills/:id/restore
 */
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!skill) return res.status(404).json({ message: 'Skill not found.' });

    await recordAuditEvent({
      action: 'SKILL_RESTORE',
      targetResource: 'Skill',
      targetId: String(id),
      details: { name: skill.name },
      req
    });

    res.json({ ok: true, message: 'Skill restored from archive.', skill });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/skills/:id
 */
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Skill not found.' });
    }
    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    // Clean up references in connected models
    await Goal.updateMany({ relatedSkills: id }, { $pull: { relatedSkills: id } }).catch(() => {});
    await Roadmap.updateMany({ 'phases.milestones.skills': id }, { $pull: { 'phases.$[].milestones.$[].skills': id } }).catch(() => {});
    await WorkLog.updateMany({ relatedSkills: id }, { $pull: { relatedSkills: id } }).catch(() => {});

    await recordAuditEvent({
      action: 'SKILL_DELETE',
      targetResource: 'Skill',
      targetId: String(id),
      details: { name: skill.name },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
