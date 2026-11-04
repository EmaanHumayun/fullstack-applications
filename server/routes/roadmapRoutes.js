import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Roadmap, calculateRoadmapProgressWeighted } from '../models/Roadmap.js';
import { Domain } from '../models/Domain.js';
import { Skill } from '../models/Skill.js';
import { Goal } from '../models/Goal.js';
import { Milestone } from '../models/Milestone.js';
import { Project } from '../models/Project.js';
import { Certificate } from '../models/Certificate.js';
import { Resource } from '../models/Resource.js';
import { WorkLog } from '../models/WorkLog.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';
import { validateDomainAssociations, enrichDomainAssociations } from '../services/domainAssociationService.js';

const router = express.Router();

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper to populate all roadmap relationships
function populateRoadmap(query) {
  return query
    .populate('primaryDomain', 'name slug icon accentColor fields')
    .populate('domainAssociations.domainId', 'name slug icon accentColor fields')
    .populate('secondaryDomains', 'name slug icon accentColor')
    .populate('linkedSkills', 'name slug level category proficiencyPercentage status icon')
    .populate('linkedGoals', 'title status progress timeHorizon priority targetDate')
    .populate('linkedMilestones', 'title status targetDate category')
    .populate('linkedResources', 'title url type difficulty status rating')
    .populate('relatedProjects', 'title slug status technologies coverImage')
    .populate('linkedCertifications', 'title issuer status credentialUrl imageUrl')
    .populate('phases.milestoneId', 'title status targetDate')
    .populate('phases.steps.linkedSkills', 'name slug level category status icon')
    .populate('phases.steps.linkedProjects', 'title slug status technologies')
    .populate('phases.steps.linkedResources', 'title url type difficulty status')
    .populate('phases.steps.linkedCertifications', 'title issuer status')
    .populate('phases.steps.linkedGoals', 'title status progress')
    .populate('phases.steps.linkedMilestones', 'title status targetDate')
    .populate('stages.steps.skillId', 'name level category');
}

// 1. List Roadmaps with Search, Domain, Subdomain, Difficulty, and Status Filters
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

    // Category / Domain filtering: support primaryDomain, secondaryDomains, category, and domainAssociations
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    if (req.query.domain && req.query.domain !== 'All') {
      const d = req.query.domain;
      const isOid = mongoose.Types.ObjectId.isValid(d);
      let domId = isOid ? d : null;
      if (!domId) {
        const foundDomain = await Domain.findOne({ $or: [{ slug: d }, { name: d }] }).lean();
        if (foundDomain) domId = foundDomain._id;
      }
      const domConditions = [{ category: d }];
      if (domId) {
        domConditions.push(
          { primaryDomain: domId },
          { secondaryDomains: domId },
          { 'domainAssociations.domainId': domId }
        );
      }
      query.$and = query.$and || [];
      query.$and.push({ $or: domConditions });
    }

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
      const subConditions = [
        { subdomain: new RegExp(`^${sub}$`, 'i') }
      ];
      if (subId) {
        subConditions.push(
          { subdomainId: subId },
          { 'domainAssociations.subdomainIds': subId }
        );
      }
      query.$and = query.$and || [];
      query.$and.push({ $or: subConditions });
    }

    if (req.query.difficulty && req.query.difficulty !== 'All') {
      query.difficulty = req.query.difficulty;
    }

    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    if (req.query.search && req.query.search.trim()) {
      const s = req.query.search.trim();
      const sRegex = new RegExp(s, 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: sRegex },
          { description: sRegex },
          { purpose: sRegex },
          { category: sRegex },
          { 'phases.title': sRegex },
          { 'phases.steps.title': sRegex }
        ]
      });
    }

    let roadmapsQuery = Roadmap.find(query).sort({ order: 1, updatedAt: -1, createdAt: -1 });

    // Server-side privacy projection for public callers
    if (!isPrivileged) {
      roadmapsQuery = roadmapsQuery.select('-notes -reviews');
    }

    const roadmaps = await populateRoadmap(roadmapsQuery);
    const enrichedRoadmaps = roadmaps.map(r => enrichDomainAssociations(r));

    res.json(enrichedRoadmaps);
  } catch (err) {
    next(err);
  }
});

// 2. Get Single Roadmap by ID or Slug (Deep-Dive)
router.get('/:idOrSlug', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { idOrSlug } = req.params;
    const isPrivileged = !!req.user;
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    let roadmapQuery = Roadmap.findOne(query);

    if (!isPrivileged) {
      roadmapQuery = roadmapQuery.select('-notes -reviews');
    }

    const roadmap = await populateRoadmap(roadmapQuery);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }

    if (!isPrivileged && (roadmap.visibility === 'private' || roadmap.isArchived)) {
      return res.status(404).json({ message: 'Roadmap not found or private.' });
    }

    const roadmapObj = roadmap.toObject();
    const roadmapWorkLogs = await WorkLog.find({
      roadmapId: roadmap._id,
      isArchived: false,
      ...(isPrivileged ? {} : { visibility: 'public' })
    }).sort({ date: -1 }).select('title date timeSpentMinutes outcome category roadmapPhaseId roadmapStepId').lean();

    roadmapObj.relatedWorkLogs = roadmapWorkLogs;
    roadmapObj.totalLoggedMinutes = roadmapWorkLogs.reduce((sum, w) => sum + (w.timeSpentMinutes || 0), 0);
    roadmapObj.totalLoggedHours = Math.round((roadmapObj.totalLoggedMinutes / 60) * 10) / 10;

    res.json(enrichDomainAssociations(roadmapObj));
  } catch (err) {
    next(err);
  }
});

// 3. Create Roadmap
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = req.body || {};

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Roadmap title is required.' });
    }

    // Auto-generate slug if not provided
    let slug = body.slug ? slugify(body.slug) : slugify(body.title);
    const existingSlug = await Roadmap.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    const primaryDomain = body.primaryDomain || body.primaryDomainId || null;
    const subdomain = body.subdomain || body.subdomainName || '';

    // Domain validation
    if (primaryDomain) {
      const dom = await Domain.findById(primaryDomain);
      if (!dom) {
        return res.status(400).json({ message: 'Selected primary domain does not exist.' });
      }
    }

    // Standardize phases from phases or legacy stages
    const incomingPhases = (body.phases && body.phases.length > 0)
      ? body.phases
      : (body.stages && body.stages.length > 0)
        ? body.stages
        : [];

    incomingPhases.forEach(ph => {
      (ph.steps || []).forEach(st => {
        if (st.linkedSkillIds && Array.isArray(st.linkedSkillIds)) {
          st.linkedSkills = Array.from(new Set([...(st.linkedSkills || []), ...st.linkedSkillIds]));
          if (!st.skillId && st.linkedSkillIds[0]) st.skillId = st.linkedSkillIds[0];
        }
        if (st.relatedProjectIds && Array.isArray(st.relatedProjectIds)) {
          st.linkedProjects = Array.from(new Set([...(st.linkedProjects || []), ...st.relatedProjectIds]));
        }
        if (st.linkedResourceIds && Array.isArray(st.linkedResourceIds)) {
          st.linkedResources = Array.from(new Set([...(st.linkedResources || []), ...st.linkedResourceIds]));
        }
      });
    });

    // Validate domainAssociations if provided
    if (body.domainAssociations) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    const newRoadmap = new Roadmap({
      ...body,
      primaryDomain,
      subdomain,
      slug,
      phases: incomingPhases,
      stages: incomingPhases,
      isArchived: false,
      progress: calculateRoadmapProgressWeighted(incomingPhases)
    });

    await newRoadmap.save();

    // Bidirectional sync: update connected skills, goals, projects, certs, resources
    const allSkillIds = new Set();
    (newRoadmap.linkedSkills || []).forEach(id => allSkillIds.add(String(id)));
    (newRoadmap.phases || []).forEach(ph => {
      (ph.steps || []).forEach(st => {
        (st.linkedSkills || []).forEach(id => allSkillIds.add(String(id)));
        if (st.skillId) allSkillIds.add(String(st.skillId));
      });
    });
    if (allSkillIds.size > 0) {
      await Skill.updateMany(
        { _id: { $in: Array.from(allSkillIds) } },
        { $addToSet: { relatedRoadmaps: newRoadmap._id } }
      );
    }
    if (newRoadmap.linkedGoals && newRoadmap.linkedGoals.length > 0) {
      await Goal.updateMany(
        { _id: { $in: newRoadmap.linkedGoals } },
        { $addToSet: { linkedRoadmaps: newRoadmap._id } }
      );
    }
    if (newRoadmap.relatedProjects && newRoadmap.relatedProjects.length > 0) {
      await Project.updateMany(
        { _id: { $in: newRoadmap.relatedProjects } },
        { $addToSet: { relatedRoadmaps: newRoadmap._id } }
      );
    }
    if (newRoadmap.linkedCertifications && newRoadmap.linkedCertifications.length > 0) {
      await Certificate.updateMany(
        { _id: { $in: newRoadmap.linkedCertifications } },
        { $addToSet: { relatedRoadmaps: newRoadmap._id } }
      );
    }
    if (newRoadmap.linkedResources && newRoadmap.linkedResources.length > 0) {
      await Resource.updateMany(
        { _id: { $in: newRoadmap.linkedResources } },
        { $addToSet: { relatedRoadmaps: newRoadmap._id } }
      );
    }

    await recordAuditEvent({
      action: 'ROADMAP_CREATE',
      targetResource: 'Roadmap',
      targetId: String(newRoadmap._id),
      details: { title: newRoadmap.title, domain: newRoadmap.primaryDomain },
      req
    });

    const populated = await populateRoadmap(Roadmap.findById(newRoadmap._id));
    res.status(201).json(enrichDomainAssociations(populated));
  } catch (err) {
    next(err);
  }
});

// 4. Update Roadmap
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = req.body || {};

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }

    if (body.primaryDomainId !== undefined && body.primaryDomain === undefined) {
      body.primaryDomain = body.primaryDomainId;
    }
    if (body.subdomainName !== undefined && body.subdomain === undefined) {
      body.subdomain = body.subdomainName;
    }

    // Validate domainAssociations if provided
    if (body.domainAssociations !== undefined) {
      const val = await validateDomainAssociations(body.domainAssociations);
      if (!val.valid) {
        return res.status(400).json({ message: val.error });
      }
      body.domainAssociations = val.sanitized;
    }

    // Slug update check
    if (body.slug && body.slug !== roadmap.slug) {
      const cleanSlug = slugify(body.slug);
      const existingSlug = await Roadmap.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(400).json({ message: 'A roadmap with this slug already exists.' });
      }
      body.slug = cleanSlug;
    }

    // Sync phases and stages
    if (body.phases) {
      body.stages = body.phases;
      body.progress = calculateRoadmapProgressWeighted(body.phases);
    } else if (body.stages) {
      body.phases = body.stages;
      body.progress = calculateRoadmapProgressWeighted(body.stages);
    }

    Object.assign(roadmap, body);
    roadmap.updatedAt = new Date();
    await roadmap.save();

    // Bidirectional sync
    if (body.linkedSkills) {
      await Skill.updateMany(
        { relatedRoadmaps: id, _id: { $nin: body.linkedSkills } },
        { $pull: { relatedRoadmaps: id } }
      );
      await Skill.updateMany(
        { _id: { $in: body.linkedSkills } },
        { $addToSet: { relatedRoadmaps: id } }
      );
    }

    if (body.linkedGoals) {
      await Goal.updateMany(
        { linkedRoadmaps: id, _id: { $nin: body.linkedGoals } },
        { $pull: { linkedRoadmaps: id } }
      );
      await Goal.updateMany(
        { _id: { $in: body.linkedGoals } },
        { $addToSet: { linkedRoadmaps: id } }
      );
    }

    await recordAuditEvent({
      action: 'ROADMAP_UPDATE',
      targetResource: 'Roadmap',
      targetId: String(id),
      details: { title: roadmap.title, progress: roadmap.progress },
      req
    });

    const populated = await populateRoadmap(Roadmap.findById(id));
    res.json(enrichDomainAssociations(populated));
  } catch (err) {
    next(err);
  }
});

// 5. Toggle Roadmap Step Completion & Dependency Resolution
router.put('/:id/toggle-step', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { phaseId, stepId, completed, status, evidence } = req.body;

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    const activePhases = (roadmap.phases && roadmap.phases.length > 0) ? roadmap.phases : roadmap.stages;
    let phase = null;
    let step = null;

    if (phaseId) {
      phase = activePhases.find(
        p => String(p.id) === String(phaseId) || String(p._id) === String(phaseId)
      );
      if (phase) {
        step = phase.steps.find(
          st => String(st.id) === String(stepId) || String(st._id) === String(stepId)
        );
      }
    } else {
      for (const p of activePhases) {
        step = p.steps.find(
          st => String(st.id) === String(stepId) || String(st._id) === String(stepId)
        );
        if (step) {
          phase = p;
          break;
        }
      }
    }

    if (!phase || !step) return res.status(404).json({ message: 'Step not found.' });

    // Determine target completion state
    const newCompleted = completed !== undefined ? !!completed : !step.completed;
    step.completed = newCompleted;
    step.status = newCompleted ? 'completed' : (status || 'available');

    if (newCompleted) {
      step.completedAt = new Date();
      if (evidence && evidence.title) {
        const evObj = {
          title: evidence.title,
          url: evidence.url || '',
          notes: evidence.notes || '',
          stepId: step.id || step._id,
          stepTitle: step.title,
          date: new Date()
        };
        step.completionEvidence.push(evObj);
        roadmap.completionEvidence = roadmap.completionEvidence || [];
        roadmap.completionEvidence.push(evObj);
      }
    } else {
      step.completedAt = null;
    }

    roadmap.phases = activePhases;
    roadmap.stages = activePhases;
    await roadmap.save(); // pre-save hook handles dependency cascade & progress calculation

    res.json({
      ok: true,
      progress: roadmap.progress,
      status: roadmap.status,
      phases: roadmap.phases,
      stages: roadmap.stages,
      completionEvidence: roadmap.completionEvidence,
      stepId: step.id || step._id,
      completed: step.completed,
      stepStatus: step.status
    });
  } catch (err) {
    next(err);
  }
});

// 6. Duplicate Roadmap
router.post('/:id/duplicate', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const source = await Roadmap.findById(id);
    if (!source) return res.status(404).json({ message: 'Source roadmap not found.' });

    const sourceObj = source.toObject();
    delete sourceObj._id;
    delete sourceObj.createdAt;
    delete sourceObj.updatedAt;

    sourceObj.title = `${source.title} (Copy)`;
    sourceObj.slug = `${source.slug || slugify(source.title)}-copy-${Date.now().toString().slice(-4)}`;
    sourceObj.progress = 0;
    sourceObj.status = 'draft';

    // Reset step completion for cloned copy
    const clonedPhases = (sourceObj.phases || sourceObj.stages || []).map((ph, pIdx) => ({
      ...ph,
      id: Math.random().toString(36).substring(2, 9),
      steps: (ph.steps || []).map(st => ({
        ...st,
        id: Math.random().toString(36).substring(2, 9),
        completed: false,
        status: (st.prerequisites && st.prerequisites.length > 0) ? 'locked' : 'available',
        completedAt: null,
        completionEvidence: []
      }))
    }));

    sourceObj.phases = clonedPhases;
    sourceObj.stages = clonedPhases;

    const duplicate = new Roadmap(sourceObj);
    await duplicate.save();

    await recordAuditEvent({
      action: 'ROADMAP_DUPLICATE',
      targetResource: 'Roadmap',
      targetId: String(duplicate._id),
      details: { originalId: id, newTitle: duplicate.title },
      req
    });

    const populated = await populateRoadmap(Roadmap.findById(duplicate._id));
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// 7. Contextual Action: Create Goal from Roadmap Context
router.post('/:id/create-goal', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    const {
      title,
      timeHorizon = 'Strategic Goal',
      priority = 'High',
      targetDate
    } = req.body || {};

    const goalTitle = title || `Mastery: ${roadmap.title}`;

    // Convert roadmap phases into goal milestones
    const phases = roadmap.phases || roadmap.stages || [];
    const milestonesList = phases.map((ph, idx) => ({
      title: ph.title,
      description: ph.description || '',
      sequence: idx + 1,
      isCompleted: (ph.steps || []).length > 0 && ph.steps.every(st => st.completed),
      weight: Math.max(1, (ph.steps || []).length)
    }));

    const newGoal = new Goal({
      title: goalTitle,
      description: roadmap.description || `Goal derived from roadmap: ${roadmap.title}`,
      primaryDomain: roadmap.primaryDomain,
      subdomain: roadmap.subdomain,
      subdomainId: roadmap.subdomainId,
      timeHorizon,
      priority,
      status: 'Active',
      targetDate: targetDate || roadmap.targetDate || '',
      linkedRoadmaps: [roadmap._id],
      linkedSkills: roadmap.linkedSkills || [],
      associatedProjects: roadmap.relatedProjects || [],
      milestonesList
    });

    await newGoal.save();

    // Link new goal to roadmap
    await Roadmap.findByIdAndUpdate(id, {
      $addToSet: { linkedGoals: newGoal._id }
    });

    await recordAuditEvent({
      action: 'GOAL_CREATE_FROM_ROADMAP',
      targetResource: 'Goal',
      targetId: String(newGoal._id),
      details: { roadmapId: id, goalTitle: newGoal.title },
      req
    });

    const populatedRoadmap = await populateRoadmap(Roadmap.findById(id));
    res.status(201).json({ ...newGoal.toObject(), ok: true, goal: newGoal, roadmap: populatedRoadmap });
  } catch (err) {
    next(err);
  }
});

// 8. Contextual Action: Create Milestone from Roadmap Phase or Step
router.post('/:id/create-milestone', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    const { phaseId, stepId, title, targetDate, description, category = 'Learning' } = req.body || {};

    const milestoneTitle = title || `Outcome: ${roadmap.title}`;

    const newMilestone = new Milestone({
      title: milestoneTitle,
      description: description || '',
      category,
      primaryDomain: roadmap.primaryDomain,
      subdomain: roadmap.subdomain,
      subdomainId: roadmap.subdomainId,
      relatedRoadmapId: roadmap._id,
      relatedPhaseId: phaseId || '',
      relatedStepId: stepId || '',
      targetDate: targetDate || roadmap.targetDate || '',
      status: 'planned'
    });

    await newMilestone.save();

    // Add to roadmap-level linkedMilestones
    await Roadmap.findByIdAndUpdate(id, {
      $addToSet: { linkedMilestones: newMilestone._id }
    });

    // If linked to a specific phase, store phase milestoneId
    if (phaseId) {
      const activePhases = roadmap.phases || roadmap.stages || [];
      const phase = activePhases.find(p => String(p.id) === String(phaseId) || String(p._id) === String(phaseId));
      if (phase) {
        phase.milestoneId = newMilestone._id;
        roadmap.phases = activePhases;
        roadmap.stages = activePhases;
        await roadmap.save();
      }
    }

    const populatedRoadmap = await populateRoadmap(Roadmap.findById(id));
    res.status(201).json({ ...newMilestone.toObject(), ok: true, milestone: newMilestone, roadmap: populatedRoadmap });
  } catch (err) {
    next(err);
  }
});

// 9. Link Existing Goal to Roadmap
router.put('/:id/link-goal', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { goalId } = req.body;

    if (!goalId) return res.status(400).json({ message: 'goalId is required.' });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });

    const roadmap = await Roadmap.findByIdAndUpdate(
      id,
      { $addToSet: { linkedGoals: goalId } },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    await Goal.findByIdAndUpdate(goalId, {
      $addToSet: { linkedRoadmaps: id }
    });

    const populated = await populateRoadmap(Roadmap.findById(id));
    res.json({ ok: true, roadmap: populated });
  } catch (err) {
    next(err);
  }
});

// 10. Link Existing Milestone to Roadmap
router.put('/:id/link-milestone', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { milestoneId, phaseId } = req.body;

    if (!milestoneId) return res.status(400).json({ message: 'milestoneId is required.' });

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found.' });

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    roadmap.linkedMilestones = roadmap.linkedMilestones || [];
    if (!roadmap.linkedMilestones.some(m => String(m) === String(milestoneId))) {
      roadmap.linkedMilestones.push(milestoneId);
    }

    if (phaseId) {
      const activePhases = roadmap.phases || roadmap.stages || [];
      const phase = activePhases.find(p => String(p.id) === String(phaseId) || String(p._id) === String(phaseId));
      if (phase) {
        phase.milestoneId = milestoneId;
      }
      roadmap.phases = activePhases;
      roadmap.stages = activePhases;
    }

    await roadmap.save();

    await Milestone.findByIdAndUpdate(milestoneId, {
      relatedRoadmapId: id,
      relatedPhaseId: phaseId || ''
    });

    const populated = await populateRoadmap(Roadmap.findById(id));
    res.json({ ok: true, roadmap: populated });
  } catch (err) {
    next(err);
  }
});

// 11. Link Existing Skill to Roadmap
router.put('/:id/link-skill', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { skillId, phaseId, stepId } = req.body;

    if (!skillId) return res.status(400).json({ message: 'skillId is required.' });

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: 'Skill not found.' });

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    roadmap.linkedSkills = roadmap.linkedSkills || [];
    if (!roadmap.linkedSkills.some(s => String(s) === String(skillId))) {
      roadmap.linkedSkills.push(skillId);
    }

    if (phaseId && stepId) {
      const activePhases = roadmap.phases || roadmap.stages || [];
      const phase = activePhases.find(p => String(p.id) === String(phaseId) || String(p._id) === String(phaseId));
      if (phase) {
        const step = phase.steps.find(st => String(st.id) === String(stepId) || String(st._id) === String(stepId));
        if (step) {
          step.linkedSkills = step.linkedSkills || [];
          if (!step.linkedSkills.some(s => String(s) === String(skillId))) {
            step.linkedSkills.push(skillId);
          }
          step.skillId = skillId;
        }
      }
      roadmap.phases = activePhases;
      roadmap.stages = activePhases;
    }

    await roadmap.save();

    await Skill.findByIdAndUpdate(skillId, {
      $addToSet: { relatedRoadmaps: id }
    });

    const populated = await populateRoadmap(Roadmap.findById(id));
    res.json({ ok: true, roadmap: populated });
  } catch (err) {
    next(err);
  }
});

// 12. Reorder Phases
router.put('/:id/reorder-phases', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { phaseIds } = req.body;

    if (!Array.isArray(phaseIds)) {
      return res.status(400).json({ message: 'phaseIds must be an array of IDs.' });
    }

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    const activePhases = roadmap.phases || roadmap.stages || [];
    const reordered = [];
    for (const pId of phaseIds) {
      const found = activePhases.find(p => String(p._id) === String(pId) || String(p.id) === String(pId));
      if (found) {
        reordered.push(found);
      }
    }
    // Append any remaining phases
    for (const remaining of activePhases) {
      if (!reordered.some(r => String(r._id) === String(remaining._id) || String(r.id) === String(remaining.id))) {
        reordered.push(remaining);
      }
    }

    reordered.forEach((p, idx) => {
      p.order = idx + 1;
    });

    roadmap.phases = reordered;
    roadmap.stages = reordered;
    await roadmap.save();

    const populated = await populateRoadmap(Roadmap.findById(id));
    res.json({ ...populated.toObject(), ok: true, roadmap: populated });
  } catch (err) {
    next(err);
  }
});

// 13. Reorder Steps within a Phase
router.put('/:id/reorder-steps', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { phaseId, stepIds } = req.body;

    if (!phaseId || !Array.isArray(stepIds)) {
      return res.status(400).json({ message: 'phaseId and stepIds array are required.' });
    }

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    const activePhases = roadmap.phases || roadmap.stages || [];
    const phase = activePhases.find(p => String(p.id) === String(phaseId) || String(p._id) === String(phaseId));
    if (!phase) return res.status(404).json({ message: 'Phase not found.' });

    const reorderedSteps = [];
    for (const sId of stepIds) {
      const found = (phase.steps || []).find(st => String(st._id) === String(sId) || String(st.id) === String(sId));
      if (found) {
        reorderedSteps.push(found);
      }
    }
    for (const remaining of (phase.steps || [])) {
      if (!reorderedSteps.some(r => String(r._id) === String(remaining._id) || String(r.id) === String(remaining.id))) {
        reorderedSteps.push(remaining);
      }
    }

    phase.steps = reorderedSteps;
    roadmap.phases = activePhases;
    roadmap.stages = activePhases;
    await roadmap.save();

    const populated = await populateRoadmap(Roadmap.findById(id));
    res.json({ ...populated.toObject(), ok: true, roadmap: populated });
  } catch (err) {
    next(err);
  }
});

// 14. Archive Roadmap
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const roadmap = await Roadmap.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    await recordAuditEvent({
      action: 'ROADMAP_ARCHIVE',
      targetResource: 'Roadmap',
      targetId: String(id),
      details: { title: roadmap.title },
      req
    });

    res.json({ ...roadmap.toObject(), ok: true, message: 'Roadmap archived.', roadmap });
  } catch (err) {
    next(err);
  }
});

// 15. Restore Roadmap
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const roadmap = await Roadmap.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    await recordAuditEvent({
      action: 'ROADMAP_RESTORE',
      targetResource: 'Roadmap',
      targetId: String(id),
      details: { title: roadmap.title },
      req
    });

    res.json({ ...roadmap.toObject(), ok: true, message: 'Roadmap restored.', roadmap });
  } catch (err) {
    next(err);
  }
});

// 16. Delete Roadmap with Safe Cascade Cleanup
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }
    const roadmap = await Roadmap.findByIdAndDelete(id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found.' });
    }

    // Clean up references in Skills, Goals, Milestones, Projects, Certifications, Resources
    await Skill.updateMany({ relatedRoadmaps: id }, { $pull: { relatedRoadmaps: id } });
    await Goal.updateMany({ linkedRoadmaps: id }, { $pull: { linkedRoadmaps: id } });
    await Milestone.updateMany({ relatedRoadmapId: id }, { $set: { relatedRoadmapId: null } });
    await Project.updateMany({ relatedRoadmaps: id }, { $pull: { relatedRoadmaps: id } });
    await Certificate.updateMany({ relatedRoadmaps: id }, { $pull: { relatedRoadmaps: id } });
    await Resource.updateMany({ relatedRoadmaps: id }, { $pull: { relatedRoadmaps: id } });

    await recordAuditEvent({
      action: 'ROADMAP_DELETE',
      targetResource: 'Roadmap',
      targetId: String(id),
      details: { title: roadmap.title },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
