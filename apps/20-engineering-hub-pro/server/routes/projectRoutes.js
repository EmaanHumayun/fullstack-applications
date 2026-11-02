import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Project } from '../models/Project.js';
import { WorkLog } from '../models/WorkLog.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';
import {
  generateUniqueSlug,
  willCreateCycle,
  buildProjectTree,
  collectDescendantIds
} from '../services/hierarchy.js';
import { calculateProjectProgress } from '../services/progress.js';

const router = express.Router();

// 1. List Projects (Flat or Hierarchical Tree)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isAdmin = !!req.user;
    const isAll = req.query.all === 'true' && isAdmin;
    const isArchivedOnly = req.query.archived === 'true' && isAdmin;

    const query = {};

    if (isArchivedOnly) {
      query.isArchived = true;
    } else {
      query.isArchived = false;
      if (!isAll) {
        query.$or = [{ visibility: 'public' }, { published: true }];
      }
    }

    if (req.query.primaryDomain) {
      query.primaryDomain = req.query.primaryDomain;
    } else if (req.query.domain && req.query.domain !== 'All') {
      query.$or = [{ primaryDomain: req.query.domain }, { domainId: req.query.domain }, { domain: req.query.domain }];
    }

    if (req.query.subdomain && req.query.subdomain !== 'All') {
      query.subdomain = new RegExp(req.query.subdomain, 'i');
    }

    if (req.query.type) query.type = req.query.type;
    if (req.query.parentId !== undefined) {
      query.parentId = req.query.parentId === 'null' || req.query.parentId === '' ? null : req.query.parentId;
    }

    const projects = await Project.find(query)
      .sort({ order: 1, featured: -1, updatedAt: -1 })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('parentId', 'title slug type')
      .populate('relatedSkills', 'name category level')
      .populate('relatedGoals', 'title status progress')
      .populate('relatedMilestones', 'title status targetDate')
      .populate('relatedCertifications', 'title issuer credentialUrl');

    if (req.query.tree === 'true') {
      const tree = buildProjectTree(projects);
      return res.json(tree);
    }

    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// 2. Get Single Project by Slug or ID
router.get('/:slugOrId', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { slugOrId } = req.params;
    const isId = mongoose.Types.ObjectId.isValid(slugOrId);

    const query = isId ? { _id: slugOrId } : { slug: slugOrId };
    const project = await Project.findOne(query)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('parentId', 'title slug type')
      .populate('relatedSkills', 'name category level')
      .populate('relatedGoals', 'title status progress')
      .populate('relatedMilestones', 'title status targetDate')
      .populate('relatedCertifications', 'title issuer credentialUrl');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Publication / archive check for visitors
    const isPrivileged = !!req.user;
    if (!isPrivileged) {
      if (project.isArchived || (!project.published && project.visibility !== 'public')) {
        return res.status(404).json({ message: 'Project not found or private.' });
      }
    }

    // Include subprojects if any
    const subprojects = await Project.find({
      parentId: project._id,
      isArchived: false,
      ...(isPrivileged ? {} : { published: true, visibility: 'public' })
    }).select('title slug type domain status progress summary technologies');

    const result = project.toObject();
    result.subprojects = subprojects;

    // Attach Work History without altering authoritative project status
    const projectWorkLogs = await WorkLog.find({
      projectId: project._id,
      isArchived: false,
      ...(isPrivileged ? {} : { visibility: 'public' })
    }).sort({ date: -1 }).select('title date timeSpentMinutes outcome category status evidence');

    result.workLogs = projectWorkLogs;
    result.totalLoggedMinutes = projectWorkLogs.reduce((sum, w) => sum + (w.timeSpentMinutes || 0), 0);
    result.totalLoggedHours = Math.round((result.totalLoggedMinutes / 60) * 10) / 10;

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 3. Create Project
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = req.body || {};

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Project title is required.' });
    }

    const slug = body.slug ? body.slug.trim() : await generateUniqueSlug(body.title);

    let parentId = null;
    if (body.parentId) {
      if (!mongoose.Types.ObjectId.isValid(body.parentId)) {
        return res.status(400).json({ message: 'Invalid parent project ID.' });
      }
      parentId = new mongoose.Types.ObjectId(body.parentId);
    }

    let technologies = body.technologies || [];
    if (typeof technologies === 'string') {
      technologies = technologies.split(',').map(s => s.trim()).filter(Boolean);
    }

    const primaryDomain = body.primaryDomain || body.domainId || null;
    const domainId = body.domainId || body.primaryDomain || null;
    const subdomain = body.subdomain || body.fieldName || '';
    const fieldName = body.fieldName || body.subdomain || '';

    const newProject = new Project({
      ...body,
      primaryDomain,
      domainId,
      subdomain,
      fieldName,
      slug,
      parentId,
      technologies,
      isArchived: false,
      published: body.published !== undefined ? body.published : (body.visibility === 'public')
    });

    newProject.progress = calculateProjectProgress(newProject);
    await newProject.save();

    await recordAuditEvent({
      action: 'PROJECT_CREATE',
      targetResource: 'Project',
      targetId: String(newProject._id),
      details: { title: newProject.title, type: newProject.type, slug: newProject.slug },
      req
    });

    const populated = await Project.findById(newProject._id)
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('parentId', 'title slug type')
      .populate('relatedSkills', 'name category level')
      .populate('relatedGoals', 'title status progress')
      .populate('relatedMilestones', 'title status targetDate')
      .populate('relatedCertifications', 'title issuer credentialUrl');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// 4. Update Project (with Complete Acyclic Cycle Prevention)
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = req.body || {};

    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Prevent direct or indirect cycles in parent hierarchy
    if (body.parentId !== undefined) {
      const targetParentId = body.parentId ? String(body.parentId) : null;
      if (targetParentId) {
        const createsCycle = await willCreateCycle(id, targetParentId);
        if (createsCycle) {
          return res.status(400).json({
            message: 'Circular hierarchy detected: an item cannot be set as a child of its own descendant.'
          });
        }
      }
    }

    // Slug regeneration if title changed
    if (body.title && body.title !== existing.title && !body.slug) {
      body.slug = await generateUniqueSlug(body.title, id);
    }

    if (body.visibility !== undefined) {
      body.published = body.visibility === 'public';
    }

    if (body.technologies && !Array.isArray(body.technologies)) {
      body.technologies = body.technologies.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updateData = {
      ...body,
      parentId: body.parentId ? new mongoose.Types.ObjectId(body.parentId) : null,
      updatedAt: new Date()
    };

    // Calculate progress dynamically
    const mergedForProgress = { ...existing.toObject(), ...updateData };
    updateData.progress = calculateProjectProgress(mergedForProgress);

    const updated = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('primaryDomain', 'name slug icon accentColor')
      .populate('parentId', 'title slug type')
      .populate('relatedSkills', 'name category level')
      .populate('relatedGoals', 'title status progress')
      .populate('relatedMilestones', 'title status targetDate')
      .populate('relatedCertifications', 'title issuer credentialUrl');

    await recordAuditEvent({
      action: 'PROJECT_UPDATE',
      targetResource: 'Project',
      targetId: String(id),
      details: { title: updated.title, status: updated.status, progress: updated.progress },
      req
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 5. Reorder & Reparent Tree Items
router.put('/reorder/tree', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Expected items array for reordering.' });
    }

    // Verify no cycles in bulk updates
    for (const item of items) {
      if (item.parentId) {
        const createsCycle = await willCreateCycle(item.id, item.parentId);
        if (createsCycle) {
          return res.status(400).json({
            message: `Circular dependency detected for item ${item.id} with parent ${item.parentId}.`
          });
        }
      }
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: {
          $set: {
            parentId: item.parentId ? new mongoose.Types.ObjectId(item.parentId) : null,
            order: item.order ?? 0,
            updatedAt: new Date()
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await Project.bulkWrite(bulkOps);
    }

    res.json({ ok: true, updatedCount: bulkOps.length });
  } catch (err) {
    next(err);
  }
});

// 6. Archive Project
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await recordAuditEvent({
      action: 'PROJECT_ARCHIVE',
      targetResource: 'Project',
      targetId: String(id),
      details: { title: project.title },
      req
    });

    res.json({ ok: true, message: 'Project archived.', project });
  } catch (err) {
    next(err);
  }
});

// 7. Restore Project
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await recordAuditEvent({
      action: 'PROJECT_RESTORE',
      targetResource: 'Project',
      targetId: String(id),
      details: { title: project.title },
      req
    });

    res.json({ ok: true, message: 'Project restored.', project });
  } catch (err) {
    next(err);
  }
});

// 8. Delete Project (with Cascade or Reparent Support)
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const mode = req.query.mode; // 'cascade' | 'reparent'
    const newParentId = req.query.newParentId || null;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const directChildren = await Project.find({ parentId: id }).lean();

    if (directChildren.length > 0 && !mode) {
      return res.status(400).json({
        hasChildren: true,
        childrenCount: directChildren.length,
        children: directChildren.map(c => ({ id: c._id, title: c.title, type: c.type })),
        message: `This item has ${directChildren.length} child item(s). Choose to cascade delete or reparent them.`
      });
    }

    if (directChildren.length > 0) {
      if (mode === 'cascade') {
        const allDescendantIds = await collectDescendantIds(id);
        const toDelete = [id, ...allDescendantIds];
        await Project.deleteMany({ _id: { $in: toDelete } });

        await recordAuditEvent({
          action: 'PROJECT_CASCADE_DELETE',
          targetResource: 'Project',
          targetId: String(id),
          details: { title: project.title, deletedTotal: toDelete.length },
          req
        });

        return res.json({ ok: true, deletedCount: toDelete.length, mode: 'cascade' });
      } else if (mode === 'reparent') {
        const parentTarget = newParentId ? new mongoose.Types.ObjectId(newParentId) : (project.parentId || null);
        await Project.updateMany({ parentId: id }, { $set: { parentId: parentTarget } });
      }
    }

    await Project.findByIdAndDelete(id);

    await recordAuditEvent({
      action: 'PROJECT_DELETE',
      targetResource: 'Project',
      targetId: String(id),
      details: { title: project.title },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
