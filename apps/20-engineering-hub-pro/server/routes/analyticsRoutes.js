import express from 'express';
import { connectDB } from '../config/db.js';
import { Domain } from '../models/Domain.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { Roadmap } from '../models/Roadmap.js';
import { WorkLog } from '../models/WorkLog.js';
import { Milestone } from '../models/Milestone.js';
import { Note } from '../models/Note.js';
import { Certificate } from '../models/Certificate.js';
import { Goal } from '../models/Goal.js';
import { Resource } from '../models/Resource.js';
import { auth } from '../middleware/auth.js';
import { computeCommandCenterData } from '../services/commandCenterService.js';

const router = express.Router();

/**
 * GET /api/analytics
 * Lightweight summary counts for quick reference & backward compatibility.
 */
router.get('/', auth, async (req, res, next) => {
  try {
    await connectDB();
    const [
      domains,
      projects,
      skills,
      roadmaps,
      workLogs,
      milestones,
      notes,
      certificates,
      goals
    ] = await Promise.all([
      Domain.find({ isArchived: false }).lean(),
      Project.find({ isArchived: false }).lean(),
      Skill.find({ isArchived: false }).lean(),
      Roadmap.find({ isArchived: false }).lean(),
      WorkLog.find({ isArchived: false }).lean(),
      Milestone.find({ isArchived: false }).lean(),
      Note.find({ isArchived: false }).lean(),
      Certificate.find({ isArchived: false }).lean(),
      Goal.find({ isArchived: false }).lean()
    ]);

    // Project analytics
    const projectItems = projects.filter(p => p.type !== 'folder');
    const folderCount = projects.filter(p => p.type === 'folder' || p.type === 'directory').length;
    const completedProjects = projectItems.filter(p => p.status === 'Completed').length;
    const inProgressProjects = projectItems.filter(p => p.status === 'In progress' || p.status === 'Active').length;
    const avgProgress = projectItems.length > 0
      ? Math.round(projectItems.reduce((acc, p) => acc + (p.progress || 0), 0) / projectItems.length)
      : 0;

    // Task metrics
    let totalTasks = 0;
    let completedTasks = 0;
    for (const p of projectItems) {
      if (p.tasks && p.tasks.length > 0) {
        totalTasks += p.tasks.length;
        completedTasks += p.tasks.filter(t => t.completed).length;
      }
    }

    // Work log hours
    const totalMinutes = workLogs.reduce((acc, w) => acc + (w.timeSpentMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Skill distribution by level
    const skillsByLevel = {
      Beginner: skills.filter(s => s.level === 'Beginner').length,
      Intermediate: skills.filter(s => s.level === 'Intermediate').length,
      Advanced: skills.filter(s => s.level === 'Advanced').length,
      Expert: skills.filter(s => s.level === 'Expert').length
    };

    res.json({
      counts: {
        domains: domains.length,
        projects: projectItems.length,
        skills: skills.length,
        roadmaps: roadmaps.length,
        workLogs: workLogs.length,
        milestones: milestones.length,
        goals: goals.length,
        notes: notes.length,
        certificates: certificates.length
      },
      projects: {
        total: projectItems.length,
        folders: folderCount,
        completed: completedProjects,
        inProgress: inProgressProjects,
        avgProgress,
        published: projectItems.filter(p => p.published).length
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      skills: {
        total: skills.length,
        byLevel: skillsByLevel
      },
      roadmaps: {
        total: roadmaps.length,
        avgProgress: roadmaps.length > 0 ? Math.round(roadmaps.reduce((acc, r) => acc + (r.progress || 0), 0) / roadmaps.length) : 0
      },
      workLogs: {
        total: workLogs.length,
        totalHours
      },
      milestones: {
        total: milestones.length,
        completed: milestones.filter(m => m.status === 'completed').length
      },
      goals: {
        total: goals.length,
        achieved: goals.filter(g => g.status === 'Achieved').length
      },
      notes: {
        total: notes.length,
        published: notes.filter(n => n.published).length
      },
      certificates: {
        total: certificates.length,
        published: certificates.filter(c => c.published).length
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/command-center
 * Full Data-Driven Command Center Telemetry:
 * - Filterable by date preset, custom ranges, domain, subdomain, project, roadmap, goal
 * - Executive KPIs & Deltas
 * - Time-series work activity trends
 * - Domain & Subdomain breakdowns
 * - Goals & Milestones status & deadlines
 * - Skills competency & practice ranking
 * - Roadmaps phase completion & next actions
 * - Projects status & deliverables
 * - 365-day Activity Heatmap
 * - Interactive Relationship Graph (nodes & edges)
 * - Chronological Activity Stream
 */
router.get('/command-center', auth, async (req, res, next) => {
  try {
    await connectDB();

    const {
      preset,
      startDate,
      endDate,
      domainId,
      subdomain,
      projectId,
      roadmapId,
      goalId
    } = req.query;

    const [
      domains,
      projects,
      skills,
      roadmaps,
      goals,
      milestones,
      workLogs,
      certificates,
      resources
    ] = await Promise.all([
      Domain.find({ isArchived: false }).lean(),
      Project.find({ isArchived: false }).lean(),
      Skill.find({ isArchived: false }).lean(),
      Roadmap.find({ isArchived: false }).lean(),
      Goal.find({ isArchived: false }).lean(),
      Milestone.find({ isArchived: false }).lean(),
      WorkLog.find({ isArchived: false }).lean(),
      Certificate.find({ isArchived: false }).lean(),
      Resource.find({ isArchived: false }).lean()
    ]);

    const data = computeCommandCenterData({
      domains,
      projects,
      skills,
      roadmaps,
      goals,
      milestones,
      workLogs,
      certificates,
      resources,
      filters: {
        preset,
        startDate,
        endDate,
        domainId,
        subdomain,
        projectId,
        roadmapId,
        goalId
      }
    });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
