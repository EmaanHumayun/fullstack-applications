import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Resume } from '../models/Resume.js';
import { Profile } from '../models/Profile.js';
import { Skill } from '../models/Skill.js';
import { Project } from '../models/Project.js';
import { Certificate } from '../models/Certificate.js';
import { Milestone } from '../models/Milestone.js';
import { User } from '../models/User.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

async function resolveOwnerId(req) {
  if (req.user && req.user._id) {
    return req.user._id;
  }
  const admin = await User.findOne().sort({ createdAt: 1 });
  if (admin) return admin._id;
  const newAdmin = await User.create({
    email: 'admin@engineeringhub.dev',
    name: 'Emaan Humayun',
    role: 'super_admin'
  });
  return newAdmin._id;
}

// 1. Public endpoint: Get the single featured public resume
router.get('/featured/public', async (req, res, next) => {
  try {
    await connectDB();
    const featured = await Resume.findOne({ isFeatured: true, visibility: 'public', isArchived: { $ne: true } }).lean();
    if (featured) {
      return res.json(featured);
    }
    // Fallback: Return any public resume if available
    const anyPublic = await Resume.findOne({ visibility: 'public', isArchived: { $ne: true } }).sort({ updatedAt: -1 }).lean();
    return res.json(anyPublic || null);
  } catch (err) {
    next(err);
  }
});

// 2. Fetch live workspace data for snapshot import
router.get('/workspace/data', auth, async (req, res, next) => {
  try {
    await connectDB();
    const [profile, skills, projects, certificates, milestones] = await Promise.all([
      Profile.findOne().lean(),
      Skill.find({ status: { $ne: 'Archived' }, isArchived: { $ne: true } })
        .sort({ priority: 1, level: -1, name: 1 })
        .lean(),
      Project.find({ type: 'project', isArchived: { $ne: true } })
        .sort({ featured: -1, status: 1, order: 1 })
        .lean(),
      Certificate.find({ status: { $ne: 'Archived' }, isArchived: { $ne: true } })
        .sort({ issuedAt: -1 })
        .lean(),
      Milestone.find({ isArchived: { $ne: true } })
        .sort({ targetDate: -1 })
        .lean()
    ]);

    // Group skills by category
    const skillsByCategory = {};
    (skills || []).forEach(sk => {
      const cat = sk.category || 'General Technical';
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push({
        id: sk._id,
        name: sk.name,
        level: sk.level,
        proficiency: sk.confidenceRating || 7,
        status: sk.status,
        description: sk.description || '',
        evidenceCount: (sk.practicalEvidence || []).length
      });
    });

    res.json({
      profile: profile || {
        name: 'Emaan Humayun',
        headline: 'Software Engineer | DevOps Engineer',
        bio: 'Building reliable backend systems, cloud architectures, and agentic workflows.',
        location: 'Lahore, Pakistan',
        email: 'emaan.humayun@example.com',
        phone: '',
        linkedinUrl: 'https://linkedin.com/in/emaanmuhammadhumayun',
        githubUrl: 'https://github.com/EmaanHumayun',
        websiteUrl: '',
        education: [],
        achievements: []
      },
      skillsByCategory,
      totalSkills: skills.length,
      projects: (projects || []).map(p => ({
        id: p._id,
        title: p.title,
        domain: p.domain,
        summary: p.summary || p.description || '',
        technologies: p.technologies || [],
        githubUrl: p.githubUrl || '',
        liveUrl: p.liveUrl || '',
        status: p.status,
        featured: !!p.featured
      })),
      certificates: (certificates || []).map(c => ({
        id: c._id,
        title: c.title,
        issuer: c.issuer,
        issuedAt: c.issuedAt,
        credentialUrl: c.credentialUrl || '',
        credentialId: c.credentialId || ''
      })),
      milestones: (milestones || []).map(m => ({
        id: m._id,
        title: m.title,
        category: m.category,
        targetDate: m.targetDate,
        status: m.status
      }))
    });
  } catch (err) {
    next(err);
  }
});

// 3. List all resumes for the workspace
router.get('/', auth, async (req, res, next) => {
  try {
    await connectDB();
    const resumes = await Resume.find({ isArchived: { $ne: true } })
      .select('title targetRole templateId theme visibility isFeatured version createdAt updatedAt personalInformation')
      .sort({ isFeatured: -1, updatedAt: -1 })
      .lean();
    res.json(resumes);
  } catch (err) {
    next(err);
  }
});

// 4. Get a single resume by ID
router.get('/:id', auth, async (req, res, next) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume identifier' });
    }
    const resume = await Resume.findById(req.params.id).lean();
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    next(err);
  }
});

// 5. Create a new resume
router.post('/', auth, async (req, res, next) => {
  try {
    await connectDB();
    const ownerId = await resolveOwnerId(req);

    // Default basic sections if none provided
    const defaultSections = [
      {
        id: 'sec-summary',
        sectionType: 'summary',
        title: 'Professional Summary',
        visible: true,
        order: 0,
        entries: []
      },
      {
        id: 'sec-skills',
        sectionType: 'skills',
        title: 'Technical Competencies',
        visible: true,
        order: 1,
        entries: []
      },
      {
        id: 'sec-projects',
        sectionType: 'projects',
        title: 'Key Technical Projects',
        visible: true,
        order: 2,
        entries: []
      },
      {
        id: 'sec-experience',
        sectionType: 'experience',
        title: 'Engineering Experience',
        visible: true,
        order: 3,
        entries: []
      },
      {
        id: 'sec-education',
        sectionType: 'education',
        title: 'Education & Academic Background',
        visible: true,
        order: 4,
        entries: []
      },
      {
        id: 'sec-certifications',
        sectionType: 'certifications',
        title: 'Certifications & Credentials',
        visible: true,
        order: 5,
        entries: []
      }
    ];

    const resumeData = {
      ...req.body,
      ownerId,
      sections: req.body.sections && req.body.sections.length > 0 ? req.body.sections : defaultSections
    };

    const resume = await Resume.create(resumeData);
    res.status(201).json(resume);
  } catch (err) {
    next(err);
  }
});

// 6. Update resume
router.put('/:id', auth, async (req, res, next) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume identifier' });
    }

    const { _id, ownerId, createdAt, ...updateData } = req.body;
    updateData.updatedAt = new Date();

    const updated = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// 7. Duplicate resume
router.post('/:id/duplicate', auth, async (req, res, next) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume identifier' });
    }

    const original = await Resume.findById(req.params.id).lean();
    if (!original) {
      return res.status(404).json({ message: 'Original resume not found' });
    }

    const { _id, createdAt, updatedAt, ...cloneData } = original;
    cloneData.title = `${original.title} (Copy)`;
    cloneData.version = (original.version || 1) + 1;
    cloneData.isFeatured = false; // Never duplicate as featured
    cloneData.visibility = 'private';

    const duplicate = await Resume.create(cloneData);
    res.status(201).json(duplicate);
  } catch (err) {
    next(err);
  }
});

// 8. Delete resume (Soft delete to recycle bin by default, permanent with ?permanent=true)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume identifier' });
    }

    if (req.query.permanent === 'true') {
      const deleted = await Resume.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      return res.json({ success: true, message: 'Resume permanently deleted' });
    }

    const archived = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: { isArchived: true, archivedAt: new Date(), isFeatured: false } },
      { new: true }
    );
    if (!archived) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ success: true, message: 'Resume moved to Recycle Bin' });
  } catch (err) {
    next(err);
  }
});

// 8b. Restore resume from archive
router.put('/:id/restore', auth, async (req, res, next) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume identifier' });
    }

    const restored = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: { isArchived: false, archivedAt: null } },
      { new: true }
    );
    if (!restored) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ success: true, message: 'Resume restored successfully', resume: restored });
  } catch (err) {
    next(err);
  }
});

// 9. Set single featured public resume
router.post('/:id/set-featured', auth, async (req, res, next) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume identifier' });
    }

    // Step 1: Un-feature all existing resumes
    await Resume.updateMany({}, { $set: { isFeatured: false } });

    // Step 2: Set target resume as featured and public
    const updated = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: { isFeatured: true, visibility: 'public', updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Target resume not found' });
    }

    res.json({
      success: true,
      message: `"${updated.title}" has been set as the primary featured resume on your public portfolio.`,
      resume: updated
    });
  } catch (err) {
    next(err);
  }
});

// 10. Unset featured status
router.delete('/:id/unset-featured', auth, async (req, res, next) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resume identifier' });
    }

    const updated = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: { isFeatured: false, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Target resume not found' });
    }

    res.json({ success: true, message: 'Featured status removed', resume: updated });
  } catch (err) {
    next(err);
  }
});

export default router;

