import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Resource } from '../models/Resource.js';
import { Domain } from '../models/Domain.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

// Helper to normalize status values
function normalizeStatus(status) {
  if (!status) return 'To Learn';
  const s = status.toLowerCase().replace(/[_-]/g, ' ').trim();
  if (s === 'to explore' || s === 'to learn' || s === 'planned') return 'To Learn';
  if (s === 'in progress' || s === 'learning') return 'Learning';
  if (s === 'completed' || s === 'done') return 'Completed';
  if (s === 'reference' || s === 'bookmarked') return 'Reference';
  if (s === 'archived') return 'Archived';
  return status;
}

// 1. Analytics & Overview Telemetry (Must be before /:id)
router.get('/analytics', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const baseQuery = isPrivileged ? {} : { visibility: 'public', isArchived: false };

    const [total, favoritesCount, completedCount, allResources] = await Promise.all([
      Resource.countDocuments(baseQuery),
      Resource.countDocuments({ ...baseQuery, isFavorite: true }),
      Resource.countDocuments({ ...baseQuery, status: { $in: ['Completed', 'Completed'] } }),
      Resource.find(baseQuery).select('type status priority domainName tags')
    ]);

    const byType = {};
    const byStatus = { 'To Learn': 0, 'Learning': 0, 'Completed': 0, 'Reference': 0, 'Archived': 0 };
    const byPriority = { 'Low': 0, 'Medium': 0, 'High': 0 };
    const byDomain = {};

    for (const r of allResources) {
      // Type
      const t = r.type || 'Other';
      byType[t] = (byType[t] || 0) + 1;

      // Status
      const st = normalizeStatus(r.status);
      byStatus[st] = (byStatus[st] || 0) + 1;

      // Priority
      const p = r.priority || 'Medium';
      byPriority[p] = (byPriority[p] || 0) + 1;

      // Domain
      if (r.domainName) {
        byDomain[r.domainName] = (byDomain[r.domainName] || 0) + 1;
      }
    }

    res.json({
      total,
      favoritesCount,
      completedCount,
      byType,
      byStatus,
      byPriority,
      byDomain
    });
  } catch (err) {
    next(err);
  }
});

// 2. List Resources with Full Multi-Filter, Search & Pagination
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const {
      domain,
      primaryDomain,
      subdomain,
      field,
      type,
      difficulty,
      status,
      priority,
      skillId,
      projectId,
      roadmapId,
      favorite,
      isFavorite,
      tag,
      search,
      sort = 'recent',
      archived,
      all,
      page,
      limit
    } = req.query;

    const query = {};
    if (!isPrivileged) {
      query.visibility = 'public';
      if (archived !== 'true') {
        query.isArchived = false;
      }
    } else if (archived === 'true') {
      query.isArchived = true;
    } else if (archived === 'false') {
      query.isArchived = false;
    }

    // Domain filter (ObjectId or Name)
    if (primaryDomain) {
      query.primaryDomain = primaryDomain;
    } else if (domain && domain !== 'All') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(domain);
      if (isObjectId) {
        query.$or = [
          { primaryDomain: domain },
          { secondaryDomains: domain }
        ];
      } else {
        query.$or = [
          { domainName: new RegExp(`^${domain}$`, 'i') },
          { relatedDomains: domain }
        ];
      }
    }

    // Subdomain / Field filter
    const activeSub = subdomain || field;
    if (activeSub && activeSub !== 'All') {
      query.$or = query.$or || [];
      query.$or.push(
        { subdomain: new RegExp(`^${activeSub}$`, 'i') },
        { relatedFields: activeSub }
      );
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = new RegExp(`^${type}$`, 'i');
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Status filter
    if (status && status !== 'All') {
      const normalized = normalizeStatus(status);
      query.$or = query.$or || [];
      query.$or.push(
        { status: normalized },
        { status: status }
      );
    }

    // Priority filter
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Skill filter
    if (skillId) {
      query.relatedSkills = skillId;
    }

    // Project filter
    if (projectId) {
      query.relatedProjects = projectId;
    }

    // Roadmap filter
    if (roadmapId) {
      query.relatedRoadmaps = roadmapId;
    }

    // Favorite filter
    if (favorite === 'true' || isFavorite === 'true') {
      query.isFavorite = true;
    }

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // Search query
    if (search && search.trim()) {
      const s = search.trim();
      const searchRegex = new RegExp(s, 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { summary: searchRegex },
          { description: searchRegex },
          { notes: searchRegex },
          { provider: searchRegex },
          { author: searchRegex },
          { tags: searchRegex },
          { domainName: searchRegex },
          { subdomain: searchRegex }
        ]
      });
    }

    // Sort order
    let sortObj = { updatedAt: -1, createdAt: -1 };
    if (sort === 'alphabetical' || sort === 'name') {
      sortObj = { title: 1 };
    } else if (sort === 'priority') {
      sortObj = { priority: -1, updatedAt: -1 };
    } else if (sort === 'rating') {
      sortObj = { rating: -1, updatedAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'recent') {
      sortObj = { updatedAt: -1, createdAt: -1 };
    }

    const totalCount = await Resource.countDocuments(query);
    res.setHeader('X-Total-Count', totalCount);

    let queryBuilder = Resource.find(query)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name slug level status category')
      .populate('relatedProjects', 'title slug coverImage status')
      .populate('relatedRoadmaps', 'title slug category')
      .populate('relatedGoals', 'title status progress')
      .sort(sortObj);

    // Apply pagination only if requested and not all=true
    const isPaginationRequested = req.query.paginate === 'true' || (page && !all);
    if (isPaginationRequested) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 15);
      queryBuilder = queryBuilder.skip((pageNum - 1) * limitNum).limit(limitNum);
      const resources = await queryBuilder;
      return res.json({
        resources,
        total: totalCount,
        page: pageNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      });
    }

    const resources = await queryBuilder;
    res.json(resources);
  } catch (err) {
    next(err);
  }
});

// 3. Get Resource by ID
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const resource = await Resource.findById(req.params.id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name slug level status category')
      .populate('relatedProjects', 'title slug coverImage status')
      .populate('relatedRoadmaps', 'title slug category')
      .populate('relatedGoals', 'title status progress');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (!isPrivileged && (resource.visibility === 'private' || resource.isArchived)) {
      return res.status(404).json({ message: 'Resource not found or private.' });
    }

    res.json(resource);
  } catch (err) {
    next(err);
  }
});

// 4. Create Resource
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const {
      title,
      summary,
      description,
      url,
      attachmentUrl,
      coverImageUrl,
      type = 'Documentation',
      provider = '',
      author = '',
      publicationDate,
      difficulty = 'Intermediate',
      status = 'To Learn',
      priority = 'Medium',
      rating = 5,
      isFavorite = false,
      tags = [],
      collections = [],
      primaryDomain,
      domainName,
      secondaryDomains = [],
      relatedDomains = [],
      subdomain = '',
      subdomainId,
      relatedFields = [],
      relatedSkills = [],
      relatedProjects = [],
      relatedRoadmaps = [],
      relatedMilestones = [],
      relatedGoals = [],
      notes = '',
      intendedOutcome = '',
      estimatedDuration = '',
      completionDate,
      metadata = {},
      visibility = 'public'
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Resource title is required.' });
    }
    if (!url || !url.trim()) {
      return res.status(400).json({ message: 'Destination URL is required.' });
    }

    // Resolve primaryDomain name if ID is given
    let resolvedDomainName = domainName || '';
    if (primaryDomain && !resolvedDomainName && mongoose.Types.ObjectId.isValid(primaryDomain)) {
      const dom = await Domain.findById(primaryDomain);
      if (dom) resolvedDomainName = dom.name;
    }

    const cleanTags = Array.isArray(tags)
      ? tags.map(t => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const resource = await Resource.create({
      title: title.trim(),
      summary: (summary || '').trim(),
      description: description || '',
      url: url.trim(),
      attachmentUrl: (attachmentUrl || '').trim(),
      coverImageUrl: (coverImageUrl || '').trim(),
      type: (type || 'Documentation').trim(),
      provider: (provider || '').trim(),
      author: (author || '').trim(),
      publicationDate: publicationDate ? new Date(publicationDate) : null,
      difficulty,
      status: normalizeStatus(status),
      priority: ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium',
      rating: typeof rating === 'number' ? rating : 5,
      isFavorite: Boolean(isFavorite),
      tags: cleanTags,
      collections: Array.isArray(collections) ? collections : [],
      primaryDomain: primaryDomain && mongoose.Types.ObjectId.isValid(primaryDomain) ? primaryDomain : null,
      domainName: resolvedDomainName,
      secondaryDomains: Array.isArray(secondaryDomains) ? secondaryDomains : [],
      relatedDomains: Array.isArray(relatedDomains) ? relatedDomains : (resolvedDomainName ? [resolvedDomainName] : []),
      subdomain: (subdomain || '').trim(),
      subdomainId: subdomainId && mongoose.Types.ObjectId.isValid(subdomainId) ? subdomainId : null,
      relatedFields: Array.isArray(relatedFields) ? relatedFields : (subdomain ? [subdomain.trim()] : []),
      relatedSkills: Array.isArray(relatedSkills) ? relatedSkills.filter(id => mongoose.Types.ObjectId.isValid(id)) : [],
      relatedProjects: Array.isArray(relatedProjects) ? relatedProjects.filter(id => mongoose.Types.ObjectId.isValid(id)) : [],
      relatedRoadmaps: Array.isArray(relatedRoadmaps) ? relatedRoadmaps.filter(id => mongoose.Types.ObjectId.isValid(id)) : [],
      relatedMilestones: Array.isArray(relatedMilestones) ? relatedMilestones : [],
      relatedGoals: Array.isArray(relatedGoals) ? relatedGoals.filter(id => mongoose.Types.ObjectId.isValid(id)) : [],
      notes: notes || '',
      intendedOutcome: intendedOutcome || '',
      estimatedDuration: estimatedDuration || '',
      completionDate: completionDate ? new Date(completionDate) : null,
      metadata: metadata || {},
      visibility: visibility || 'public',
      isArchived: false
    });

    await recordAuditEvent({
      action: 'RESOURCE_CREATE',
      targetResource: 'Resource',
      targetId: String(resource._id),
      details: { title: resource.title, type: resource.type, domain: resolvedDomainName },
      req
    });

    const populated = await Resource.findById(resource._id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name slug level status category')
      .populate('relatedProjects', 'title slug coverImage status')
      .populate('relatedRoadmaps', 'title slug category')
      .populate('relatedGoals', 'title status progress');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// 5. Update Resource
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.url) updateData.url = updateData.url.trim();
    if (updateData.status) updateData.status = normalizeStatus(updateData.status);

    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags.map(t => String(t).trim()).filter(Boolean)
        : typeof updateData.tags === 'string'
          ? updateData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [];
    }

    if (updateData.primaryDomain && !updateData.domainName && mongoose.Types.ObjectId.isValid(updateData.primaryDomain)) {
      const dom = await Domain.findById(updateData.primaryDomain);
      if (dom) updateData.domainName = dom.name;
    }

    updateData.updatedAt = new Date();

    const resource = await Resource.findByIdAndUpdate(id, updateData, { new: true })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name slug level status category')
      .populate('relatedProjects', 'title slug coverImage status')
      .populate('relatedRoadmaps', 'title slug category')
      .populate('relatedGoals', 'title status progress');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    await recordAuditEvent({
      action: 'RESOURCE_UPDATE',
      targetResource: 'Resource',
      targetId: String(resource._id),
      details: { title: resource.title },
      req
    });

    res.json(resource);
  } catch (err) {
    next(err);
  }
});

// Also support PATCH for partial updates (e.g. quick toggle favorite or status)
router.patch('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    if (updateData.status) updateData.status = normalizeStatus(updateData.status);

    const resource = await Resource.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name slug level status category')
      .populate('relatedProjects', 'title slug coverImage status')
      .populate('relatedRoadmaps', 'title slug category')
      .populate('relatedGoals', 'title status progress');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    res.json(resource);
  } catch (err) {
    next(err);
  }
});

// 6. Safe Relationship Unlink (Unlinks domain/skill/project/roadmap WITHOUT deleting resource)
router.patch('/:id/unlink', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { targetType, targetId } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (targetType === 'skill') {
      resource.relatedSkills = resource.relatedSkills.filter(s => String(s) !== String(targetId));
    } else if (targetType === 'project') {
      resource.relatedProjects = resource.relatedProjects.filter(p => String(p) !== String(targetId));
    } else if (targetType === 'roadmap') {
      resource.relatedRoadmaps = resource.relatedRoadmaps.filter(r => String(r) !== String(targetId));
    } else if (targetType === 'domain') {
      if (String(resource.primaryDomain) === String(targetId) || resource.domainName === targetId) {
        resource.primaryDomain = null;
        resource.domainName = '';
      }
      resource.secondaryDomains = resource.secondaryDomains.filter(d => String(d) !== String(targetId));
      resource.relatedDomains = resource.relatedDomains.filter(d => d !== targetId);
    }

    resource.updatedAt = new Date();
    await resource.save();

    await recordAuditEvent({
      action: 'RESOURCE_UNLINK',
      targetResource: 'Resource',
      targetId: String(resource._id),
      details: { title: resource.title, unlinkedType: targetType, unlinkedId: targetId },
      req
    });

    const populated = await Resource.findById(resource._id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('relatedSkills', 'name slug level status category')
      .populate('relatedProjects', 'title slug coverImage status')
      .populate('relatedRoadmaps', 'title slug category')
      .populate('relatedGoals', 'title status progress');

    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// 7. Delete Resource (Permanent deletion with safe preservation of all related entities)
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    await recordAuditEvent({
      action: 'RESOURCE_DELETE',
      targetResource: 'Resource',
      targetId: String(resource._id),
      details: { title: resource.title },
      req
    });

    res.json({ ok: true, message: `Resource "${resource.title}" deleted.` });
  } catch (err) {
    next(err);
  }
});

export default router;
