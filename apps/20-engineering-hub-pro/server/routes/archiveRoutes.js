import express from 'express';
import { connectDB } from '../config/db.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { Roadmap } from '../models/Roadmap.js';
import { WorkLog } from '../models/WorkLog.js';
import { Milestone } from '../models/Milestone.js';
import { Goal } from '../models/Goal.js';
import { Note } from '../models/Note.js';
import { Certificate } from '../models/Certificate.js';
import { SocialLink } from '../models/SocialLink.js';
import { PracticeLab } from '../models/PracticeLab.js';
import { Assignment } from '../models/Assignment.js';
import { Resume } from '../models/Resume.js';
import { auth } from '../middleware/auth.js';
import { requireEditorOrAbove, requireSuperAdmin } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

router.use(auth, requireEditorOrAbove);

// Get All Archived Items Across All Modules
router.get('/', async (req, res, next) => {
  try {
    await connectDB();
    const [
      projects,
      skills,
      roadmaps,
      workLogs,
      milestones,
      goals,
      notes,
      certificates,
      socialLinks,
      practiceLabs,
      assignments,
      resumes
    ] = await Promise.all([
      Project.find({ isArchived: true }).select('title type domain archivedAt slug').lean(),
      Skill.find({ isArchived: true }).select('name category level archivedAt').lean(),
      Roadmap.find({ isArchived: true }).select('title category progress archivedAt').lean(),
      WorkLog.find({ isArchived: true }).select('title date category timeSpentMinutes archivedAt').lean(),
      Milestone.find({ isArchived: true }).select('title category targetDate archivedAt').lean(),
      Goal.find({ isArchived: true }).select('title category status targetDate archivedAt').lean(),
      Note.find({ isArchived: true }).select('title category folder archivedAt slug').lean(),
      Certificate.find({ isArchived: true }).select('title issuer issuedAt archivedAt').lean(),
      SocialLink.find({ isArchived: true }).select('label platform url archivedAt').lean(),
      PracticeLab.find({ isArchived: true }).select('title domain difficulty archivedAt').lean(),
      Assignment.find({ isArchived: true }).select('title domain difficulty archivedAt').lean(),
      Resume.find({ isArchived: true }).select('title targetRole templateId archivedAt').lean()
    ]);

    res.json({
      projects: projects.map(p => ({ ...p, entityType: 'project', label: p.title })),
      skills: skills.map(s => ({ ...s, entityType: 'skill', label: s.name })),
      roadmaps: roadmaps.map(r => ({ ...r, entityType: 'roadmap', label: r.title })),
      workLogs: workLogs.map(w => ({ ...w, entityType: 'workLog', label: w.title })),
      milestones: milestones.map(m => ({ ...m, entityType: 'milestone', label: m.title })),
      goals: goals.map(g => ({ ...g, entityType: 'goal', label: g.title })),
      notes: notes.map(n => ({ ...n, entityType: 'note', label: n.title })),
      certificates: certificates.map(c => ({ ...c, entityType: 'certificate', label: c.title })),
      socialLinks: socialLinks.map(sl => ({ ...sl, entityType: 'socialLink', label: sl.label })),
      practiceLabs: practiceLabs.map(pl => ({ ...pl, entityType: 'practiceLab', label: pl.title })),
      assignments: assignments.map(a => ({ ...a, entityType: 'assignment', label: a.title })),
      resumes: resumes.map(r => ({ ...r, entityType: 'resume', label: r.title })),
      totalArchived:
        projects.length +
        skills.length +
        roadmaps.length +
        workLogs.length +
        milestones.length +
        goals.length +
        notes.length +
        certificates.length +
        socialLinks.length +
        practiceLabs.length +
        assignments.length +
        resumes.length
    });
  } catch (err) {
    next(err);
  }
});

// Restore Single Item from Archive
router.put('/restore/:entityType/:id', async (req, res, next) => {
  try {
    await connectDB();
    const { entityType, id } = req.params;
    let model;

    switch (entityType) {
      case 'project': model = Project; break;
      case 'skill': model = Skill; break;
      case 'roadmap': model = Roadmap; break;
      case 'workLog': model = WorkLog; break;
      case 'milestone': model = Milestone; break;
      case 'goal': model = Goal; break;
      case 'note': model = Note; break;
      case 'certificate': model = Certificate; break;
      case 'socialLink': model = SocialLink; break;
      case 'practiceLab': model = PracticeLab; break;
      case 'assignment': model = Assignment; break;
      case 'resume': model = Resume; break;
      default:
        return res.status(400).json({ message: `Unknown entity type: ${entityType}` });
    }

    const restored = await model.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );

    if (!restored) return res.status(404).json({ message: 'Record not found in archive.' });

    await recordAuditEvent({
      action: 'ARCHIVE_RESTORE',
      targetResource: entityType,
      targetId: String(id),
      details: { title: restored.title || restored.name || restored.label },
      req
    });

    res.json({ ok: true, message: 'Item restored.', item: restored });
  } catch (err) {
    next(err);
  }
});

// Permanently Delete Item from Archive
router.delete('/permanent/:entityType/:id', async (req, res, next) => {
  try {
    await connectDB();
    const { entityType, id } = req.params;
    let model;

    switch (entityType) {
      case 'project': model = Project; break;
      case 'skill': model = Skill; break;
      case 'roadmap': model = Roadmap; break;
      case 'workLog': model = WorkLog; break;
      case 'milestone': model = Milestone; break;
      case 'goal': model = Goal; break;
      case 'note': model = Note; break;
      case 'certificate': model = Certificate; break;
      case 'socialLink': model = SocialLink; break;
      case 'practiceLab': model = PracticeLab; break;
      case 'assignment': model = Assignment; break;
      case 'resume': model = Resume; break;
      default:
        return res.status(400).json({ message: `Unknown entity type: ${entityType}` });
    }

    const deleted = await model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Record not found.' });

    await recordAuditEvent({
      action: 'PERMANENT_DELETE',
      targetResource: entityType,
      targetId: String(id),
      details: { title: deleted.title || deleted.name || deleted.label },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

// Empty Recycle Bin (Super Admin Only)
router.post('/empty-trash', requireSuperAdmin, async (req, res, next) => {
  try {
    await connectDB();
    await Promise.all([
      Project.deleteMany({ isArchived: true }),
      Skill.deleteMany({ isArchived: true }),
      Roadmap.deleteMany({ isArchived: true }),
      WorkLog.deleteMany({ isArchived: true }),
      Milestone.deleteMany({ isArchived: true }),
      Goal.deleteMany({ isArchived: true }),
      Note.deleteMany({ isArchived: true }),
      Certificate.deleteMany({ isArchived: true }),
      SocialLink.deleteMany({ isArchived: true }),
      PracticeLab.deleteMany({ isArchived: true }),
      Assignment.deleteMany({ isArchived: true }),
      Resume.deleteMany({ isArchived: true })
    ]);

    await recordAuditEvent({
      action: 'EMPTY_TRASH',
      details: { message: 'All archived records permanently purged across all modules.' },
      req
    });

    res.json({ ok: true, message: 'Recycle bin emptied.' });
  } catch (err) {
    next(err);
  }
});

export default router;
