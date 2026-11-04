import express from 'express';
import { connectDB } from '../config/db.js';
import { Project } from '../models/Project.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { generateUniqueSlug } from '../services/hierarchy.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

// List Collections / Folders
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const query = {
      type: { $in: ['folder', 'directory'] },
      isArchived: false
    };

    if (!isPrivileged) {
      query.$or = [{ visibility: 'public' }, { published: true }];
    }

    const folders = await Project.find(query).sort({ order: 1, title: 1 });

    // Map to frontend expected shape: { _id, name, description, color, slug }
    const mapped = folders.map(f => ({
      _id: f._id,
      id: f._id,
      name: f.title,
      title: f.title,
      description: f.summary || f.description || '',
      color: f.technologies?.[0] || '#bb9457',
      slug: f.slug,
      parentId: f.parentId,
      order: f.order,
      type: f.type,
      published: f.published
    }));

    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

// Create Collection / Folder
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { name, title, description, color, parentId } = req.body;
    const folderTitle = name || title;

    if (!folderTitle || !folderTitle.trim()) {
      return res.status(400).json({ message: 'Collection name is required.' });
    }

    const slug = await generateUniqueSlug(folderTitle);
    const newFolder = await Project.create({
      title: folderTitle.trim(),
      slug,
      type: 'folder',
      summary: description || '',
      description: description || '',
      technologies: color ? [color] : ['#bb9457'],
      parentId: parentId || null,
      visibility: 'public',
      published: true,
      status: 'In progress'
    });

    await recordAuditEvent({
      action: 'FOLDER_CREATE',
      targetResource: 'Project',
      targetId: String(newFolder._id),
      details: { title: newFolder.title },
      req
    });

    res.status(201).json({
      _id: newFolder._id,
      id: newFolder._id,
      name: newFolder.title,
      title: newFolder.title,
      description: newFolder.summary,
      color: color || '#bb9457',
      slug: newFolder.slug
    });
  } catch (err) {
    next(err);
  }
});

// Delete Collection (safely reparents contained projects to root or folder's parent)
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const folder = await Project.findById(id);

    if (!folder) {
      return res.status(404).json({ message: 'Collection not found.' });
    }

    // Reparent any child items to the folder's parent or null (uncategorize)
    await Project.updateMany(
      { parentId: id },
      { $set: { parentId: folder.parentId || null } }
    );

    await Project.findByIdAndDelete(id);

    await recordAuditEvent({
      action: 'FOLDER_DELETE',
      targetResource: 'Project',
      targetId: String(id),
      details: { title: folder.title },
      req
    });

    res.json({ ok: true, deletedId: id, message: 'Collection deleted. Child projects uncategorized.' });
  } catch (err) {
    next(err);
  }
});

export default router;
