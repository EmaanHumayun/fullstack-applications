import express from 'express';
import { connectDB } from '../config/db.js';
import { Domain } from '../models/Domain.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { Goal } from '../models/Goal.js';
import { Milestone } from '../models/Milestone.js';
import { Certificate } from '../models/Certificate.js';
import { Resource } from '../models/Resource.js';
import { Roadmap } from '../models/Roadmap.js';
import { WorkLog } from '../models/WorkLog.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// List Domains
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

    const domains = await Domain.find(query)
      .populate('parentDomain', 'name slug icon accentColor')
      .sort({ order: 1, name: 1 });
    res.json(domains);
  } catch (err) {
    next(err);
  }
});

// Deep-Dive Domain & Subdomain Detail Endpoint
router.get('/:identifier/deep-dive', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { identifier } = req.params;
    const { subdomain } = req.query;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    const isPrivileged = !!req.user;
    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    const domain = await Domain.findOne(query).populate('parentDomain', 'name slug icon accentColor');

    if (!domain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    if (!isPrivileged && (domain.visibility === 'private' || domain.isArchived)) {
      return res.status(404).json({ message: 'Domain not found or private.' });
    }

    // Match subdomain if requested
    let matchedSubdomain = null;
    if (subdomain) {
      matchedSubdomain = (domain.fields || []).find(
        f => f.slug === subdomain || f.name.toLowerCase() === subdomain.toLowerCase() || String(f._id) === subdomain
      ) || null;
    }

    // Base domain match condition
    const domainFilter = {
      $or: [
        { primaryDomain: domain._id },
        { domainId: domain._id },
        { domain: domain.name },
        { category: domain.name },
        { domainName: domain.name },
        { 'domainAssociations.domainId': domain._id }
      ]
    };

    // Skills
    const skillQ = { ...domainFilter };
    if (!isPrivileged) {
      skillQ.visibility = 'public';
      skillQ.isArchived = false;
    }
    if (matchedSubdomain) {
      skillQ.$and = skillQ.$and || [];
      skillQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomain: new RegExp(`^${matchedSubdomain.slug}$`, 'i') },
          { subcategory: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomainId: matchedSubdomain._id }
        ]
      });
    }
    const skills = await Skill.find(skillQ)
      .select(isPrivileged ? '' : '-learningNotes -practiceHistory')
      .populate('relatedProjects', 'title slug coverImage status')
      .populate('relatedGoals', 'title status progress')
      .sort({ confidenceRating: -1, order: 1 });

    // Goals
    const goalQ = { ...domainFilter };
    if (!isPrivileged) {
      goalQ.visibility = 'public';
      goalQ.isArchived = false;
    }
    if (matchedSubdomain) {
      goalQ.$and = goalQ.$and || [];
      goalQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomain: new RegExp(`^${matchedSubdomain.slug}$`, 'i') },
          { subdomainId: matchedSubdomain._id },
          { 'domainAssociations.subdomainIds': matchedSubdomain._id }
        ]
      });
    }
    const goals = await Goal.find(goalQ)
      .select(isPrivileged ? '' : '-reviews -blockers -risks')
      .populate('linkedSkills', 'name level status')
      .populate('associatedProjects', 'title slug status')
      .sort({ deadline: 1, priority: -1, createdAt: -1 });

    const goalIds = goals.map(g => g._id);

    // Milestones
    const milestoneQ = {
      $or: [
        { primaryDomain: domain._id },
        { parentGoalId: { $in: goalIds } }
      ]
    };
    if (!isPrivileged) {
      milestoneQ.visibility = 'public';
      milestoneQ.isArchived = false;
    }
    if (matchedSubdomain) {
      milestoneQ.$and = milestoneQ.$and || [];
      milestoneQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomainId: matchedSubdomain._id }
        ]
      });
    }
    const milestones = await Milestone.find(milestoneQ)
      .populate('parentGoalId', 'title status progress')
      .populate('relatedProjectId', 'title slug')
      .populate('relatedSkillId', 'name level')
      .sort({ targetDate: 1, order: 1 });

    // Certifications
    const certQ = { ...domainFilter };
    if (!isPrivileged) {
      certQ.visibility = 'public';
      certQ.isArchived = false;
    }
    if (matchedSubdomain) {
      certQ.$and = certQ.$and || [];
      certQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomain: new RegExp(`^${matchedSubdomain.slug}$`, 'i') },
          { subdomainId: matchedSubdomain._id }
        ]
      });
    }
    const certifications = await Certificate.find(certQ)
      .populate('relatedSkills', 'name level')
      .populate('relatedGoals', 'title status')
      .sort({ issuedAt: -1, createdAt: -1 });

    // Projects
    const projectQ = {
      $or: [
        { primaryDomain: domain._id },
        { domainId: domain._id },
        { domain: domain.name }
      ]
    };
    if (!isPrivileged) {
      projectQ.visibility = 'public';
      projectQ.published = true;
      projectQ.isArchived = false;
    }
    if (matchedSubdomain) {
      projectQ.$and = projectQ.$and || [];
      projectQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { fieldName: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { fieldId: String(matchedSubdomain._id) },
          { subdomainId: matchedSubdomain._id }
        ]
      });
    }
    const projects = await Project.find(projectQ)
      .populate('relatedSkills', 'name level')
      .populate('relatedGoals', 'title status')
      .sort({ featured: -1, order: 1, updatedAt: -1 });

    // Resources
    const resourceQ = { ...domainFilter };
    if (!isPrivileged) {
      resourceQ.visibility = 'public';
      resourceQ.isArchived = false;
    }
    if (matchedSubdomain) {
      resourceQ.$and = resourceQ.$and || [];
      resourceQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomainId: matchedSubdomain._id }
        ]
      });
    }
    const resources = await Resource.find(resourceQ)
      .populate('relatedSkills', 'name level')
      .populate('relatedGoals', 'title status')
      .sort({ rating: -1, updatedAt: -1 });

    // Roadmaps
    const roadmapQ = { ...domainFilter };
    if (!isPrivileged) {
      roadmapQ.visibility = 'public';
      roadmapQ.isArchived = false;
    }
    if (matchedSubdomain) {
      roadmapQ.$and = roadmapQ.$and || [];
      roadmapQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomainId: matchedSubdomain._id },
          { 'domainAssociations.subdomainIds': matchedSubdomain._id }
        ]
      });
    }
    const roadmaps = await Roadmap.find(roadmapQ)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('linkedSkills', 'name level category')
      .populate('linkedGoals', 'title status progress')
      .populate('relatedProjects', 'title slug status')
      .populate('phases.steps.linkedSkills', 'name level category')
      .populate('phases.steps.linkedProjects', 'title slug status')
      .populate('phases.steps.linkedResources', 'title url type')
      .sort({ order: 1, updatedAt: -1 });

    // Work Logs
    const workLogQ = { primaryDomain: domain._id };
    if (!isPrivileged) {
      workLogQ.visibility = 'public';
      workLogQ.isArchived = false;
    }
    if (matchedSubdomain) {
      workLogQ.$and = workLogQ.$and || [];
      workLogQ.$and.push({
        $or: [
          { subdomain: new RegExp(`^${matchedSubdomain.name}$`, 'i') },
          { subdomainId: matchedSubdomain._id }
        ]
      });
    }
    let workLogsQuery = WorkLog.find(workLogQ)
      .populate('projectId', 'title slug')
      .populate('skillIds', 'name')
      .sort({ date: -1, createdAt: -1 });
    if (!isPrivileged) {
      workLogsQuery = workLogsQuery.select('-reflectionNotes -blockers -problemEncountered -problemSolution');
    }
    const workLogs = await workLogsQuery;
    const totalLoggedMinutes = workLogs.reduce((sum, w) => sum + (w.timeSpentMinutes || 0), 0);
    const totalLoggedHours = Math.round((totalLoggedMinutes / 60) * 10) / 10;

    // Deduplicated Achievements
    const achievements = [];
    const seenAchievementKeys = new Set();

    // 1. Demonstrated Skills
    skills
      .filter(s => s.status === 'Demonstrated' || s.level === 'Advanced' || s.level === 'Expert')
      .forEach(s => {
        const key = `skill-${s._id}`;
        if (!seenAchievementKeys.has(key)) {
          seenAchievementKeys.add(key);
          achievements.push({
            id: key,
            type: 'skill',
            title: `Demonstrated: ${s.name}`,
            description: s.description || `Attained ${s.level} proficiency`,
            date: s.lastPractisedDate || s.updatedAt || s.createdAt,
            level: s.level,
            refId: s._id,
            isPrimaryDomain: true
          });
        }
      });

    // 2. Completed Goals
    goals
      .filter(g => g.status === 'Completed' || g.status === 'Achieved')
      .forEach(g => {
        const key = `goal-${g._id}`;
        if (!seenAchievementKeys.has(key)) {
          seenAchievementKeys.add(key);
          achievements.push({
            id: key,
            type: 'goal',
            title: `Achieved Goal: ${g.title}`,
            description: g.description || 'Target engineering goal successfully achieved',
            date: g.completionDate || g.updatedAt,
            refId: g._id,
            isPrimaryDomain: true
          });
        }
      });

    // 3. Completed Milestones
    milestones
      .filter(m => m.status === 'completed')
      .forEach(m => {
        const key = `milestone-${m._id}`;
        if (!seenAchievementKeys.has(key)) {
          seenAchievementKeys.add(key);
          achievements.push({
            id: key,
            type: 'milestone',
            title: `Milestone: ${m.title}`,
            description: m.description || (m.parentGoalId ? `Completed for ${m.parentGoalId.title}` : ''),
            date: m.completionDate || m.updatedAt,
            refId: m._id,
            isPrimaryDomain: true
          });
        }
      });

    // 4. Verified Certifications
    certifications
      .filter(c => c.status === 'completed' || (!c.status && c.issuedAt))
      .forEach(c => {
        const key = `cert-${c._id}`;
        if (!seenAchievementKeys.has(key)) {
          seenAchievementKeys.add(key);
          achievements.push({
            id: key,
            type: 'certification',
            title: `Credential: ${c.title}`,
            description: `Issued by ${c.issuer || 'Accredited Authority'}`,
            date: c.issuedAt || c.createdAt,
            verificationUrl: c.credentialUrl,
            refId: c._id,
            isPrimaryDomain: true
          });
        }
      });

    // 5. Finished Projects
    projects
      .filter(p => p.status === 'Completed' || p.status === 'Maintained')
      .forEach(p => {
        const key = `project-${p._id}`;
        if (!seenAchievementKeys.has(key)) {
          seenAchievementKeys.add(key);
          achievements.push({
            id: key,
            type: 'project',
            title: `Shipped: ${p.title}`,
            description: p.summary || p.description || 'Production-grade engineering project completed',
            date: p.completionDate || p.updatedAt,
            refId: p._id,
            isPrimaryDomain: true
          });
        }
      });

    // Sort achievements latest first
    achievements.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Meaningful Counts
    const counts = {
      skills: skills.length,
      activeGoals: goals.filter(g => g.status === 'Active' || g.status === 'In Progress').length,
      completedGoals: goals.filter(g => g.status === 'Completed' || g.status === 'Achieved').length,
      plannedGoals: goals.filter(g => g.status === 'Planned' || g.status === 'Draft').length,
      onHoldGoals: goals.filter(g => g.status === 'On hold').length,
      milestones: milestones.length,
      completedMilestones: milestones.filter(m => m.status === 'completed').length,
      certifications: certifications.length,
      completedCertifications: certifications.filter(c => c.status === 'completed').length,
      projects: projects.length,
      resources: resources.length,
      roadmaps: roadmaps.length,
      completedRoadmaps: roadmaps.filter(r => r.status === 'completed' || r.progress === 100).length,
      workLogs: workLogs.length,
      loggedHours: totalLoggedHours,
      achievements: achievements.length
    };

    // Analytics Distributions
    const proficiencyLevels = ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'];
    const proficiencyDistribution = proficiencyLevels.map(lvl => ({
      level: lvl,
      count: skills.filter(s => s.level === lvl).length
    }));

    const skillStatuses = ['Learning', 'Practising', 'Demonstrated', 'Planned', 'Needs revision'];
    const skillStatusDistribution = skillStatuses.map(st => ({
      status: st,
      count: skills.filter(s => s.status === st).length
    }));

    const goalProgressDistribution = [
      { range: '0-25%', count: goals.filter(g => g.progress >= 0 && g.progress <= 25).length },
      { range: '26-50%', count: goals.filter(g => g.progress > 25 && g.progress <= 50).length },
      { range: '51-75%', count: goals.filter(g => g.progress > 50 && g.progress <= 75).length },
      { range: '76-100%', count: goals.filter(g => g.progress > 75 && g.progress <= 100).length }
    ];

    const certStatuses = ['completed', 'in_progress', 'planned', 'expired'];
    const certStatusDistribution = certStatuses.map(st => ({
      status: st,
      count: certifications.filter(c => (c.status || 'completed') === st).length
    }));

    const projectTypes = ['project', 'learning_path', 'lab', 'tool', 'paper'];
    const projectTypeDistribution = projectTypes.map(t => ({
      type: t,
      count: projects.filter(p => (p.entityType || 'project') === t).length
    }));

    const resourceTypes = [
      'Documentation',
      'Courses',
      'Tutorials',
      'Practical labs',
      'Quizzes and exercises',
      'Books and papers',
      'Tools',
      'Communities',
      'Webinars and events',
      'Certifications and exam preparation'
    ];
    const resourceTypeDistribution = resourceTypes.map(t => ({
      type: t,
      count: resources.filter(r => r.type === t).length
    })).filter(r => r.count > 0);

    const analytics = {
      proficiencyDistribution,
      skillProficiency: proficiencyDistribution,
      skillStatusDistribution,
      goalProgressDistribution,
      certStatusDistribution,
      projectTypeDistribution,
      resourceTypeDistribution,
      milestoneCompletionRate: milestones.length > 0
        ? Math.round((counts.completedMilestones / milestones.length) * 100)
        : 0
    };

    res.json({
      domain,
      subdomain: matchedSubdomain,
      activeSubdomain: matchedSubdomain,
      subdomains: domain.fields || [],
      siblingSubdomains: domain.fields || [],
      skills,
      goals,
      milestones,
      certifications,
      projects,
      resources,
      roadmaps,
      workLogs,
      totalLoggedHours,
      achievements,
      counts,
      analytics
    });
  } catch (err) {
    next(err);
  }
});

// Get Domain by Slug or ID
router.get('/:identifier', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { identifier } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    const query = isObjectId ? { _id: identifier } : { slug: identifier };
    const domain = await Domain.findOne(query).populate('parentDomain', 'name slug icon accentColor');

    if (!domain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    // Attach count of active projects under this domain
    const projects = await Project.find({
      $or: [{ domainId: domain._id }, { domain: domain.name }],
      isArchived: false,
      published: true
    }).select('title slug summary domain fieldName entityType technologies coverImage');

    res.json({
      domain,
      projects
    });
  } catch (err) {
    next(err);
  }
});


// Create Domain
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const {
      name,
      description,
      accentColor,
      icon,
      coverImage,
      parentDomain,
      order,
      fields,
      isFeatured,
      visibility
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Domain name is required.' });
    }

    const slug = slugify(name);
    const existing = await Domain.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(400).json({ message: 'A domain with this name or slug already exists.' });
    }

    const processedFields = Array.isArray(fields)
      ? fields.map((f, i) => ({
          name: f.name.trim(),
          slug: slugify(f.slug || f.name),
          description: f.description || '',
          order: typeof f.order === 'number' ? f.order : i,
          icon: f.icon || 'code',
          accentColor: f.accentColor || '',
          coverImage: f.coverImage || '',
          isFeatured: !!f.isFeatured,
          visibility: f.visibility || 'public'
        }))
      : [];

    const domain = await Domain.create({
      name: name.trim(),
      slug,
      description: description || '',
      accentColor: accentColor || '#bb9457',
      icon: icon || 'layers',
      coverImage: coverImage || '',
      parentDomain: parentDomain || null,
      order: typeof order === 'number' ? order : 0,
      fields: processedFields,
      isFeatured: isFeatured !== false,
      visibility: visibility || 'public',
      isArchived: false
    });

    await recordAuditEvent({
      action: 'DOMAIN_CREATE',
      targetResource: 'Domain',
      targetId: String(domain._id),
      details: { name: domain.name, fieldsCount: domain.fields.length },
      req
    });

    res.status(201).json(domain);
  } catch (err) {
    next(err);
  }
});

// Update Domain
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const {
      name,
      description,
      accentColor,
      icon,
      coverImage,
      parentDomain,
      order,
      fields,
      isFeatured,
      visibility,
      isArchived
    } = req.body;

    const domain = await Domain.findById(id);
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    if (name && name.trim()) {
      const oldName = domain.name;
      domain.name = name.trim();
      domain.slug = slugify(name);

      // Keep all related modules synchronized when renamed so relationships never break
      if (oldName !== domain.name) {
        await Promise.all([
          Project.updateMany(
            { $or: [{ domain: oldName }, { domainId: domain._id }] },
            { $set: { domain: domain.name, primaryDomain: domain._id } }
          ),
          Skill.updateMany(
            { $or: [{ category: oldName }, { primaryDomain: domain._id }] },
            { $set: { category: domain.name, primaryDomain: domain._id } }
          ),
          Goal.updateMany(
            { $or: [{ category: oldName }, { primaryDomain: domain._id }] },
            { $set: { category: domain.name, primaryDomain: domain._id } }
          ),
          Certificate.updateMany(
            { $or: [{ domain: oldName }, { primaryDomain: domain._id }] },
            { $set: { domain: domain.name, primaryDomain: domain._id } }
          ),
          Resource.updateMany(
            { $or: [{ domainName: oldName }, { primaryDomain: domain._id }] },
            { $set: { domainName: domain.name, primaryDomain: domain._id } }
          )
        ]);
      }
    }

    if (description !== undefined) domain.description = description;
    if (accentColor) domain.accentColor = accentColor;
    if (icon) domain.icon = icon;
    if (coverImage !== undefined) domain.coverImage = coverImage;
    if (typeof order === 'number') domain.order = order;
    if (parentDomain !== undefined) {
      if (parentDomain && (String(parentDomain) === String(domain._id) || String(parentDomain) === String(id))) {
        return res.status(400).json({ message: 'A domain cannot be its own parent.' });
      }
      domain.parentDomain = parentDomain || null;
    }
    if (isFeatured !== undefined) domain.isFeatured = isFeatured;
    if (visibility) domain.visibility = visibility;
    if (isArchived !== undefined) {
      domain.isArchived = isArchived;
      domain.archivedAt = isArchived ? new Date() : null;
    }

    if (Array.isArray(fields)) {
      domain.fields = fields.map((f, i) => ({
        _id: f._id || undefined,
        name: f.name.trim(),
        slug: slugify(f.slug || f.name),
        description: f.description || '',
        order: typeof f.order === 'number' ? f.order : i,
        icon: f.icon || 'code',
        accentColor: f.accentColor || '',
        coverImage: f.coverImage || '',
        isFeatured: !!f.isFeatured,
        visibility: f.visibility || 'public'
      }));
    }

    await domain.save();

    await recordAuditEvent({
      action: 'DOMAIN_UPDATE',
      targetResource: 'Domain',
      targetId: String(domain._id),
      details: { name: domain.name },
      req
    });

    res.json(domain);
  } catch (err) {
    next(err);
  }
});

// Add Field to Domain
router.post('/:id/fields', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { name, description, icon, isFeatured } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Field name is required.' });
    }

    const domain = await Domain.findById(id);
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    const slug = slugify(name);
    domain.fields.push({
      name: name.trim(),
      slug,
      description: description || '',
      order: domain.fields.length,
      icon: icon || 'code',
      isFeatured: !!isFeatured
    });

    await domain.save();
    res.status(201).json(domain);
  } catch (err) {
    next(err);
  }
});

// Delete Field from Domain
router.delete('/:id/fields/:fieldId', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id, fieldId } = req.params;

    const domain = await Domain.findById(id);
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found.' });
    }

    domain.fields = domain.fields.filter(f => String(f._id) !== fieldId && f.slug !== fieldId);
    await domain.save();
    res.json(domain);
  } catch (err) {
    next(err);
  }
});

// Archive / Restore Domain
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const domain = await Domain.findById(req.params.id);
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });

    domain.isArchived = !domain.isArchived;
    domain.archivedAt = domain.isArchived ? new Date() : null;
    await domain.save();

    await recordAuditEvent({
      action: domain.isArchived ? 'DOMAIN_ARCHIVE' : 'DOMAIN_RESTORE',
      targetResource: 'Domain',
      targetId: String(domain._id),
      details: { name: domain.name, isArchived: domain.isArchived },
      req
    });

    res.json({ ok: true, isArchived: domain.isArchived, domain });
  } catch (err) {
    next(err);
  }
});

// Permanent Delete Domain
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const domain = await Domain.findById(req.params.id);
    if (!domain) return res.status(404).json({ message: 'Domain not found.' });

    // Safe unlink across all modules rather than deleting records
    await Promise.all([
      Project.updateMany({ $or: [{ domainId: domain._id }, { primaryDomain: domain._id }] }, { $set: { domainId: null, primaryDomain: null } }),
      Skill.updateMany({ primaryDomain: domain._id }, { $set: { primaryDomain: null } }),
      Goal.updateMany({ primaryDomain: domain._id }, { $set: { primaryDomain: null } }),
      Certificate.updateMany({ primaryDomain: domain._id }, { $set: { primaryDomain: null } }),
      Milestone.updateMany({ primaryDomain: domain._id }, { $set: { primaryDomain: null } }),
      Resource.updateMany({ primaryDomain: domain._id }, { $set: { primaryDomain: null } })
    ]);

    await Domain.findByIdAndDelete(domain._id);

    await recordAuditEvent({
      action: 'DOMAIN_DELETE',
      targetResource: 'Domain',
      targetId: String(domain._id),
      details: { name: domain.name },
      req
    });

    res.json({ ok: true, message: `Domain "${domain.name}" deleted. Associated projects uncategorized.` });
  } catch (err) {
    next(err);
  }
});

export default router;
