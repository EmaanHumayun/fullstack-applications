import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { WorkLog } from '../models/WorkLog.js';
import { TimerSession } from '../models/TimerSession.js';
import { Reflection } from '../models/Reflection.js';
import { Domain } from '../models/Domain.js';
import { Project } from '../models/Project.js';
import { Skill } from '../models/Skill.js';
import { Roadmap } from '../models/Roadmap.js';
import { Goal } from '../models/Goal.js';
import { Milestone } from '../models/Milestone.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { requireEditorOrAbove } from '../middleware/rbac.js';
import { recordAuditEvent } from '../middleware/audit.js';

const router = express.Router();

function populateWorkLog(query) {
  return query
    .populate('primaryDomain', 'name slug icon accentColor fields')
    .populate('projectId', 'title slug status technologies coverImage')
    .populate('skillIds', 'name slug level category icon')
    .populate('roadmapId', 'title slug progress status')
    .populate('goalId', 'title status progress priority')
    .populate('milestoneId', 'title status targetDate')
    .populate('resourceIds', 'title url type')
    .populate('certificateId', 'title issuer credentialUrl');
}

// -------------------------------------------------------------
// 1. LIST WORK LOGS WITH ADVANCED FILTERING & PAGINATION
// -------------------------------------------------------------
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

    // Specific filters
    if (req.query.projectId) query.projectId = req.query.projectId;
    if (req.query.primaryDomain || req.query.domainId) {
      query.primaryDomain = req.query.primaryDomain || req.query.domainId;
    }
    if (req.query.subdomain && req.query.subdomain !== 'All') {
      query.subdomain = new RegExp(`^${req.query.subdomain}$`, 'i');
    }
    if (req.query.skillId) {
      query.skillIds = req.query.skillId;
    }
    if (req.query.roadmapId) query.roadmapId = req.query.roadmapId;
    if (req.query.goalId) query.goalId = req.query.goalId;
    if (req.query.milestoneId) query.milestoneId = req.query.milestoneId;

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }
    if (req.query.status && req.query.status !== 'All') {
      query.status = req.query.status;
    }

    // Date range filters
    if (req.query.date) {
      query.date = req.query.date;
    } else if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = req.query.startDate;
      if (req.query.endDate) query.date.$lte = req.query.endDate;
    }

    // Full-text search
    if (req.query.search && req.query.search.trim()) {
      const s = req.query.search.trim();
      query.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { outcome: { $regex: s, $options: 'i' } },
        { tags: { $regex: s, $options: 'i' } }
      ];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 100));
    const skip = (page - 1) * limit;

    let dbQuery = WorkLog.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!isPrivileged) {
      dbQuery = dbQuery.select('-reflectionNotes -blockers -problemEncountered -problemSolution');
    }

    const [logs, total] = await Promise.all([
      populateWorkLog(dbQuery),
      WorkLog.countDocuments(query)
    ]);

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 2. COMPREHENSIVE MULTI-PERIOD ANALYTICS & ACTIVITY HEATMAP
// -------------------------------------------------------------
router.get('/analytics', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const isPrivileged = !!req.user;
    const baseQuery = { isArchived: false };
    if (!isPrivileged) {
      baseQuery.visibility = 'public';
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const period = req.query.period || 'all';
    let startDate = req.query.startDate || '';
    let endDate = req.query.endDate || '';

    // Automatic period bounding if not explicitly provided
    if (!startDate && !endDate && period !== 'all') {
      const d = new Date();
      if (period === 'daily' || period === 'today') {
        startDate = todayStr;
        endDate = todayStr;
      } else if (period === 'weekly' || period === 'this_week') {
        const day = d.getDay() || 7; // Sunday = 7
        d.setDate(d.getDate() - day + 1); // Monday
        startDate = d.toISOString().slice(0, 10);
        d.setDate(d.getDate() + 6);
        endDate = d.toISOString().slice(0, 10);
      } else if (period === 'monthly' || period === 'this_month') {
        startDate = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
        endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
      } else if (period === 'quarterly' || period === 'this_quarter') {
        const qMonth = Math.floor(d.getMonth() / 3) * 3;
        startDate = new Date(d.getFullYear(), qMonth, 1).toISOString().slice(0, 10);
        endDate = new Date(d.getFullYear(), qMonth + 3, 0).toISOString().slice(0, 10);
      } else if (period === 'yearly' || period === 'this_year') {
        startDate = `${d.getFullYear()}-01-01`;
        endDate = `${d.getFullYear()}-12-31`;
      }
    }

    const filteredQuery = { ...baseQuery };
    if (startDate || endDate) {
      filteredQuery.date = {};
      if (startDate) filteredQuery.date.$gte = startDate;
      if (endDate) filteredQuery.date.$lte = endDate;
    }

    if (req.query.domain) filteredQuery.primaryDomain = req.query.domain;
    if (req.query.projectId) filteredQuery.projectId = req.query.projectId;
    if (req.query.category && req.query.category !== 'All') filteredQuery.category = req.query.category;

    const [filteredLogs, allLogsPastYear] = await Promise.all([
      WorkLog.find(filteredQuery)
        .populate('primaryDomain', 'name accentColor')
        .populate('projectId', 'title slug')
        .populate('skillIds', 'name category')
        .populate('milestoneId', 'title')
        .populate('goalId', 'title')
        .lean(),
      WorkLog.find({
        ...baseQuery,
        date: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) }
      }).select('date timeSpentMinutes category').lean()
    ]);

    // 1. High-Level Totals
    const totalMinutes = filteredLogs.reduce((sum, l) => sum + (l.timeSpentMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const logCount = filteredLogs.length;

    const activeDaysSet = new Set(filteredLogs.map(l => l.date));
    const activeDaysCount = activeDaysSet.size;
    const averageHoursPerActiveDay = activeDaysCount > 0
      ? Math.round((totalHours / activeDaysCount) * 10) / 10
      : 0;

    // 2. Category Distribution
    const categoryMap = {};
    for (const l of filteredLogs) {
      const cat = l.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + (l.timeSpentMinutes || 0);
    }
    const byCategory = Object.entries(categoryMap).map(([category, mins]) => ({
      category,
      minutes: mins,
      hours: Math.round((mins / 60) * 10) / 10,
      percentage: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0
    })).sort((a, b) => b.minutes - a.minutes);

    // 3. Domain & Subdomain Allocation
    const domainMap = {};
    for (const l of filteredLogs) {
      const domName = l.primaryDomain?.name || 'Unassigned Domain';
      const domColor = l.primaryDomain?.accentColor || '#64748b';
      if (!domainMap[domName]) {
        domainMap[domName] = { domainName: domName, accentColor: domColor, minutes: 0, count: 0 };
      }
      domainMap[domName].minutes += l.timeSpentMinutes || 0;
      domainMap[domName].count += 1;
    }
    const byDomain = Object.values(domainMap).map(d => ({
      ...d,
      hours: Math.round((d.minutes / 60) * 10) / 10,
      percentage: totalMinutes > 0 ? Math.round((d.minutes / totalMinutes) * 100) : 0
    })).sort((a, b) => b.minutes - a.minutes);

    // 4. Project Distribution
    const projectMap = {};
    for (const l of filteredLogs) {
      if (l.projectId) {
        const pTitle = l.projectId.title || 'Untitled Project';
        const pSlug = l.projectId.slug || '';
        if (!projectMap[pTitle]) {
          projectMap[pTitle] = { title: pTitle, slug: pSlug, minutes: 0, count: 0 };
        }
        projectMap[pTitle].minutes += l.timeSpentMinutes || 0;
        projectMap[pTitle].count += 1;
      }
    }
    const byProject = Object.values(projectMap).map(p => ({
      ...p,
      hours: Math.round((p.minutes / 60) * 10) / 10
    })).sort((a, b) => b.minutes - a.minutes);

    // 5. Skills Practiced
    const skillMap = {};
    for (const l of filteredLogs) {
      for (const s of (l.skillIds || [])) {
        const sName = s.name || 'Skill';
        if (!skillMap[sName]) {
          skillMap[sName] = { name: sName, count: 0, minutes: 0 };
        }
        skillMap[sName].count += 1;
        skillMap[sName].minutes += l.timeSpentMinutes || 0;
      }
    }
    const bySkill = Object.values(skillMap).sort((a, b) => b.count - a.count);

    // 6. Chronological Daily Trends (within selected period or recent 30 days)
    const trendMap = {};
    for (const l of filteredLogs) {
      if (!trendMap[l.date]) {
        trendMap[l.date] = { date: l.date, minutes: 0, count: 0 };
      }
      trendMap[l.date].minutes += l.timeSpentMinutes || 0;
      trendMap[l.date].count += 1;
    }
    const dailyTrend = Object.values(trendMap)
      .map(t => ({ ...t, hours: Math.round((t.minutes / 60) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 7. Annual Activity Heatmap Matrix (365 days)
    const heatmapDayMap = {};
    for (const l of allLogsPastYear) {
      if (!heatmapDayMap[l.date]) {
        heatmapDayMap[l.date] = { date: l.date, minutes: 0, count: 0 };
      }
      heatmapDayMap[l.date].minutes += l.timeSpentMinutes || 0;
      heatmapDayMap[l.date].count += 1;
    }

    // Compute 365-day series
    const heatmap = [];
    const pastYearStart = new Date();
    pastYearStart.setDate(pastYearStart.getDate() - 364);

    for (let i = 0; i < 365; i++) {
      const cur = new Date(pastYearStart);
      cur.setDate(cur.getDate() + i);
      const dStr = cur.toISOString().slice(0, 10);
      const entry = heatmapDayMap[dStr] || { date: dStr, minutes: 0, count: 0 };

      // Intensity level 0..4 based on minutes
      let intensity = 0;
      if (entry.minutes > 0 && entry.minutes < 60) intensity = 1;
      else if (entry.minutes >= 60 && entry.minutes < 150) intensity = 2;
      else if (entry.minutes >= 150 && entry.minutes < 240) intensity = 3;
      else if (entry.minutes >= 240) intensity = 4;

      heatmap.push({
        date: dStr,
        minutes: entry.minutes,
        hours: Math.round((entry.minutes / 60) * 10) / 10,
        count: entry.count,
        intensity
      });
    }

    // 8. Streak Calculations
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Check consecutive days leading up to today
    const checkDate = new Date();
    let hasToday = heatmapDayMap[todayStr]?.minutes > 0;
    let scanDate = new Date(checkDate);
    if (!hasToday) {
      // Check if yesterday had activity
      scanDate.setDate(scanDate.getDate() - 1);
    }

    while (true) {
      const dStr = scanDate.toISOString().slice(0, 10);
      if (heatmapDayMap[dStr]?.minutes > 0) {
        currentStreak++;
        scanDate.setDate(scanDate.getDate() - 1);
      } else {
        break;
      }
    }

    for (const day of heatmap) {
      if (day.minutes > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // 9. Deliverables & Blockers count
    const deliverablesCount = filteredLogs.filter(l => !!l.outcome || (l.evidence && l.evidence.length > 0)).length;
    const blockersCount = filteredLogs.filter(l => !!l.blockers || l.status === 'blocked').length;

    res.json({
      period,
      startDate,
      endDate,
      totalMinutes,
      totalHours,
      logCount,
      activeDaysCount,
      averageHoursPerActiveDay,
      deliverablesCount,
      blockersCount,
      byCategory,
      byDomain,
      byProject,
      bySkill,
      dailyTrend,
      heatmap,
      consistency: {
        currentStreak,
        longestStreak,
        totalActiveDaysYear: Object.keys(heatmapDayMap).length
      }
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 3. ACTIVE LIVE TIMER SESSION MANAGEMENT
// -------------------------------------------------------------
router.get('/timer/active', auth, async (req, res, next) => {
  try {
    await connectDB();
    const session = await TimerSession.findOne({
      userId: req.user._id
    })
      .populate('primaryDomain', 'name accentColor')
      .populate('projectId', 'title slug')
      .populate('skillIds', 'name');

    if (!session) {
      return res.json({ active: false, session: null });
    }

    const now = Date.now();
    let activeElapsedMs = 0;

    if (session.isRunning) {
      const currentRunMs = now - new Date(session.startTime).getTime() - session.totalPausedMs;
      activeElapsedMs = Math.max(0, currentRunMs);
    } else {
      const pausedAtMs = session.pausedAt ? new Date(session.pausedAt).getTime() : now;
      const totalRunMs = pausedAtMs - new Date(session.startTime).getTime() - session.totalPausedMs;
      activeElapsedMs = Math.max(0, totalRunMs);
    }

    const activeElapsedSeconds = Math.floor(activeElapsedMs / 1000);
    const activeElapsedMinutes = Math.max(1, Math.round(activeElapsedSeconds / 60));

    res.json({
      active: true,
      session,
      activeElapsedSeconds,
      activeElapsedMinutes
    });
  } catch (err) {
    next(err);
  }
});

router.post('/timer/start', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const {
      title = 'Engineering Work Session',
      category = 'Development',
      primaryDomain,
      subdomain,
      subdomainId,
      projectId,
      skillIds,
      roadmapId,
      roadmapPhaseId,
      roadmapStepId,
      goalId,
      milestoneId,
      notes
    } = req.body || {};

    // Check if user already has an active session
    let session = await TimerSession.findOne({ userId: req.user._id });
    if (session) {
      return res.status(409).json({
        message: 'An active timer session is already running.',
        session
      });
    }

    session = await TimerSession.create({
      userId: req.user._id,
      title: title.trim(),
      category,
      primaryDomain: primaryDomain || null,
      subdomain: subdomain || '',
      subdomainId: subdomainId || '',
      projectId: projectId || null,
      skillIds: Array.isArray(skillIds) ? skillIds : [],
      roadmapId: roadmapId || null,
      roadmapPhaseId: roadmapPhaseId || '',
      roadmapStepId: roadmapStepId || '',
      goalId: goalId || null,
      milestoneId: milestoneId || null,
      notes: notes || '',
      startTime: new Date(),
      totalPausedMs: 0,
      isRunning: true
    });

    const populated = await TimerSession.findById(session._id)
      .populate('primaryDomain', 'name accentColor')
      .populate('projectId', 'title')
      .populate('skillIds', 'name');

    res.status(201).json({ ok: true, session: populated });
  } catch (err) {
    next(err);
  }
});

router.post('/timer/pause', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const session = await TimerSession.findOne({ userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'No active timer found.' });

    if (session.isRunning) {
      session.isRunning = false;
      session.pausedAt = new Date();
      await session.save();
    }

    res.json({ ok: true, session });
  } catch (err) {
    next(err);
  }
});

router.post('/timer/resume', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const session = await TimerSession.findOne({ userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'No active timer found.' });

    if (!session.isRunning && session.pausedAt) {
      const pausedDuration = Date.now() - new Date(session.pausedAt).getTime();
      session.totalPausedMs = (session.totalPausedMs || 0) + Math.max(0, pausedDuration);
      session.pausedAt = null;
      session.isRunning = true;
      await session.save();
    }

    res.json({ ok: true, session });
  } catch (err) {
    next(err);
  }
});

router.post('/timer/stop', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const session = await TimerSession.findOne({ userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'No active timer found to stop.' });

    const now = Date.now();
    let activeElapsedMs = 0;

    if (session.isRunning) {
      activeElapsedMs = now - new Date(session.startTime).getTime() - session.totalPausedMs;
    } else {
      const pausedAtMs = session.pausedAt ? new Date(session.pausedAt).getTime() : now;
      activeElapsedMs = pausedAtMs - new Date(session.startTime).getTime() - session.totalPausedMs;
    }

    // Minimum 1 minute
    const timeSpentMinutes = Math.max(1, Math.round(activeElapsedMs / 60000));
    const todayStr = new Date().toISOString().slice(0, 10);

    const override = req.body || {};

    const workLogData = {
      title: override.title || session.title || 'Engineering Work Session',
      date: override.date || todayStr,
      timeSpentMinutes: override.timeSpentMinutes ? Number(override.timeSpentMinutes) : timeSpentMinutes,
      category: override.category || session.category || 'Development',
      primaryDomain: override.primaryDomain || session.primaryDomain,
      subdomain: override.subdomain || session.subdomain,
      subdomainId: override.subdomainId || session.subdomainId,
      projectId: override.projectId || session.projectId,
      skillIds: override.skillIds || session.skillIds,
      roadmapId: override.roadmapId || session.roadmapId,
      roadmapPhaseId: override.roadmapPhaseId || session.roadmapPhaseId,
      roadmapStepId: override.roadmapStepId || session.roadmapStepId,
      goalId: override.goalId || session.goalId,
      milestoneId: override.milestoneId || session.milestoneId,
      description: override.description || session.notes || '',
      outcome: override.outcome || '',
      status: 'completed',
      userId: req.user._id,
      isArchived: false
    };

    const newLog = await WorkLog.create(workLogData);
    await TimerSession.findByIdAndDelete(session._id);

    await recordAuditEvent({
      action: 'WORKLOG_FROM_TIMER',
      targetResource: 'WorkLog',
      targetId: String(newLog._id),
      details: { minutes: newLog.timeSpentMinutes, title: newLog.title },
      req
    });

    const populated = await populateWorkLog(WorkLog.findById(newLog._id));
    res.status(201).json({ ok: true, workLog: populated });
  } catch (err) {
    next(err);
  }
});

router.delete('/timer/cancel', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    await TimerSession.findOneAndDelete({ userId: req.user._id });
    res.json({ ok: true, message: 'Active timer cancelled.' });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 4. QUICK LOG (RAPID 1-CLICK ENTRY)
// -------------------------------------------------------------
router.post('/quick', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const {
      title,
      timeSpentMinutes = 60,
      category = 'Development',
      date,
      primaryDomain,
      projectId,
      outcome
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required for quick logging.' });
    }

    const duration = Math.min(1440, Math.max(1, Number(timeSpentMinutes) || 60));
    const logDate = date || new Date().toISOString().slice(0, 10);

    const log = await WorkLog.create({
      title: title.trim(),
      date: logDate,
      timeSpentMinutes: duration,
      category,
      primaryDomain: primaryDomain || null,
      projectId: projectId || null,
      outcome: outcome || '',
      status: 'completed',
      userId: req.user._id,
      isArchived: false
    });

    await recordAuditEvent({
      action: 'WORKLOG_QUICK_CREATE',
      targetResource: 'WorkLog',
      targetId: String(log._id),
      details: { title: log.title, date: log.date, minutes: log.timeSpentMinutes },
      req
    });

    const populated = await populateWorkLog(WorkLog.findById(log._id));
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 5. DETAILED WORK LOG CREATION & CRUD
// -------------------------------------------------------------
router.post('/', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const body = req.body || {};

    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: 'Work log title is required.' });
    }

    const duration = Math.min(1440, Math.max(1, Number(body.timeSpentMinutes) || 60));
    const logDate = body.date || new Date().toISOString().slice(0, 10);

    // Validate Domain if provided
    if (body.primaryDomain) {
      const dom = await Domain.findById(body.primaryDomain);
      if (!dom) return res.status(400).json({ message: 'Referenced domain does not exist.' });
    }

    // Validate Project if provided
    if (body.projectId) {
      const proj = await Project.findById(body.projectId);
      if (!proj) return res.status(400).json({ message: 'Referenced project does not exist.' });
    }

    // Validate Roadmap if provided
    if (body.roadmapId) {
      const rm = await Roadmap.findById(body.roadmapId);
      if (!rm) return res.status(400).json({ message: 'Referenced roadmap does not exist.' });
    }

    const log = await WorkLog.create({
      ...body,
      title: body.title.trim(),
      date: logDate,
      timeSpentMinutes: duration,
      userId: req.user._id,
      isArchived: false
    });

    await recordAuditEvent({
      action: 'WORKLOG_CREATE',
      targetResource: 'WorkLog',
      targetId: String(log._id),
      details: { title: log.title, date: log.date, minutes: log.timeSpentMinutes },
      req
    });

    const populated = await populateWorkLog(WorkLog.findById(log._id));
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// Single Work Log lookup
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const isPrivileged = !!req.user;

    let query = WorkLog.findById(id);
    if (!isPrivileged) {
      query = query.select('-reflectionNotes -blockers -problemEncountered -problemSolution');
    }

    const log = await populateWorkLog(query);
    if (!log) return res.status(404).json({ message: 'Work log not found.' });

    if (!isPrivileged && (log.visibility === 'private' || log.isArchived)) {
      return res.status(404).json({ message: 'Work log not found or private.' });
    }

    res.json(log);
  } catch (err) {
    next(err);
  }
});

// Update Work Log
router.put('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const body = req.body || {};

    if (body.timeSpentMinutes !== undefined) {
      body.timeSpentMinutes = Math.min(1440, Math.max(1, Number(body.timeSpentMinutes) || 60));
    }

    const log = await WorkLog.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!log) return res.status(404).json({ message: 'Work log not found.' });

    await recordAuditEvent({
      action: 'WORKLOG_UPDATE',
      targetResource: 'WorkLog',
      targetId: String(id),
      details: { title: log.title },
      req
    });

    const populated = await populateWorkLog(WorkLog.findById(id));
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

// Archive Work Log
router.put('/:id/archive', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const log = await WorkLog.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date() },
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Work log not found.' });

    await recordAuditEvent({
      action: 'WORKLOG_ARCHIVE',
      targetResource: 'WorkLog',
      targetId: String(id),
      details: { title: log.title },
      req
    });

    res.json({ ...log.toObject(), ok: true, message: 'Work log archived.', log });
  } catch (err) {
    next(err);
  }
});

// Restore Work Log
router.put('/:id/restore', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const log = await WorkLog.findByIdAndUpdate(
      id,
      { isArchived: false, archivedAt: null },
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Work log not found.' });

    await recordAuditEvent({
      action: 'WORKLOG_RESTORE',
      targetResource: 'WorkLog',
      targetId: String(id),
      details: { title: log.title },
      req
    });

    res.json({ ...log.toObject(), ok: true, message: 'Work log restored.', log });
  } catch (err) {
    next(err);
  }
});

// Delete Work Log
router.delete('/:id', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { id } = req.params;
    const log = await WorkLog.findByIdAndDelete(id);

    if (!log) return res.status(404).json({ message: 'Work log not found.' });

    await recordAuditEvent({
      action: 'WORKLOG_DELETE',
      targetResource: 'WorkLog',
      targetId: String(id),
      details: { title: log.title },
      req
    });

    res.json({ ok: true, deletedId: id });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 6. DATA QUALITY & INTEGRITY DIAGNOSTICS
// -------------------------------------------------------------
router.get('/diagnostics/check', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const logs = await WorkLog.find().lean();
    const domains = await Domain.find().lean();
    const domainIds = new Set(domains.map(d => String(d._id)));
    const domainMap = new Map(domains.map(d => [String(d._id), d]));

    const projects = await Project.find().lean();
    const projectIds = new Set(projects.map(p => String(p._id)));

    const skills = await Skill.find().lean();
    const skillIds = new Set(skills.map(s => String(s._id)));

    const roadmaps = await Roadmap.find().lean();
    const roadmapIds = new Set(roadmaps.map(r => String(r._id)));

    const issues = [];

    // Duplicate tracker
    const seen = new Map();

    for (const l of logs) {
      // 1. Missing Domain
      if (!l.primaryDomain) {
        issues.push({
          logId: l._id,
          title: l.title,
          date: l.date,
          type: 'missing_domain',
          severity: 'warning',
          message: 'Work log has no primary domain assigned.'
        });
      } else if (!domainIds.has(String(l.primaryDomain))) {
        // Orphaned domain
        issues.push({
          logId: l._id,
          title: l.title,
          date: l.date,
          type: 'orphaned_domain',
          severity: 'error',
          message: `Referenced domain ID ${l.primaryDomain} does not exist.`
        });
      } else if (l.subdomain) {
        // Validate subdomain against domain fields
        const dom = domainMap.get(String(l.primaryDomain));
        const validFields = (dom.fields || []).map(f => f.name.toLowerCase());
        if (validFields.length > 0 && !validFields.includes(l.subdomain.toLowerCase())) {
          issues.push({
            logId: l._id,
            title: l.title,
            date: l.date,
            type: 'invalid_subdomain',
            severity: 'warning',
            message: `Subdomain "${l.subdomain}" does not match domain "${dom.name}".`
          });
        }
      }

      // 2. Orphaned Project
      if (l.projectId && !projectIds.has(String(l.projectId))) {
        issues.push({
          logId: l._id,
          title: l.title,
          date: l.date,
          type: 'orphaned_project',
          severity: 'error',
          message: 'Referenced project was deleted or does not exist.'
        });
      }

      // 3. Orphaned Skills
      for (const sId of (l.skillIds || [])) {
        if (!skillIds.has(String(sId))) {
          issues.push({
            logId: l._id,
            title: l.title,
            date: l.date,
            type: 'orphaned_skill',
            severity: 'warning',
            message: `Referenced skill ${sId} no longer exists.`
          });
        }
      }

      // 4. Orphaned Roadmap
      if (l.roadmapId && !roadmapIds.has(String(l.roadmapId))) {
        issues.push({
          logId: l._id,
          title: l.title,
          date: l.date,
          type: 'orphaned_roadmap',
          severity: 'error',
          message: 'Referenced roadmap was deleted or does not exist.'
        });
      }

      // 5. Impossible Duration
      if (!l.timeSpentMinutes || l.timeSpentMinutes <= 0 || l.timeSpentMinutes > 1440) {
        issues.push({
          logId: l._id,
          title: l.title,
          date: l.date,
          type: 'invalid_duration',
          severity: 'error',
          message: `Time spent is invalid: ${l.timeSpentMinutes} mins.`
        });
      }

      // 6. Duplicate detection
      const dupKey = `${l.date}_${l.title.toLowerCase().trim()}`;
      if (seen.has(dupKey)) {
        issues.push({
          logId: l._id,
          title: l.title,
          date: l.date,
          type: 'duplicate_entry',
          severity: 'warning',
          message: `Duplicate entry matching "${l.title}" on ${l.date}.`
        });
      } else {
        seen.set(dupKey, l._id);
      }
    }

    const totalLogs = logs.length;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const healthScore = totalLogs > 0
      ? Math.max(0, Math.round(100 - (errorCount * 15 + warningCount * 5) / (totalLogs || 1)))
      : 100;

    res.json({
      healthScore,
      totalLogs,
      issuesCount: issues.length,
      errorCount,
      warningCount,
      issues
    });
  } catch (err) {
    next(err);
  }
});

// Diagnostic Repair Actions
router.post('/diagnostics/repair', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const { action, logId } = req.body || {};

    if (action === 'clamp-durations') {
      await WorkLog.updateMany({ timeSpentMinutes: { $lt: 5 } }, { $set: { timeSpentMinutes: 30 } });
      await WorkLog.updateMany({ timeSpentMinutes: { $gt: 1440 } }, { $set: { timeSpentMinutes: 480 } });
      return res.json({ ok: true, message: 'Invalid durations clamped to safe bounds.' });
    }

    if (action === 'unlink-orphaned-projects') {
      const validProjectIds = (await Project.find().select('_id').lean()).map(p => p._id);
      await WorkLog.updateMany(
        { projectId: { $nin: validProjectIds, $ne: null } },
        { $set: { projectId: null } }
      );
      return res.json({ ok: true, message: 'Orphaned project references cleared.' });
    }

    if (action === 'unlink-orphaned-roadmaps') {
      const validRoadmapIds = (await Roadmap.find().select('_id').lean()).map(r => r._id);
      await WorkLog.updateMany(
        { roadmapId: { $nin: validRoadmapIds, $ne: null } },
        { $set: { roadmapId: null } }
      );
      return res.json({ ok: true, message: 'Orphaned roadmap references cleared.' });
    }

    res.status(400).json({ message: 'Unknown repair action requested.' });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 7. EXPORT DATA (CSV / JSON)
// -------------------------------------------------------------
router.get('/export/download', auth, async (req, res, next) => {
  try {
    await connectDB();
    const format = req.query.format === 'json' ? 'json' : 'csv';

    const query = { isArchived: false };
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) query.date.$gte = req.query.startDate;
      if (req.query.endDate) query.date.$lte = req.query.endDate;
    }
    if (req.query.domain) query.primaryDomain = req.query.domain;
    if (req.query.projectId) query.projectId = req.query.projectId;

    const logs = await WorkLog.find(query)
      .sort({ date: -1 })
      .populate('primaryDomain', 'name')
      .populate('projectId', 'title')
      .populate('skillIds', 'name')
      .lean();

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="work-logs-export.json"');
      return res.json(logs);
    }

    // Generate CSV (RFC 4180 format)
    const headers = [
      'ID', 'Date', 'Title', 'Hours', 'Minutes', 'Category', 'ActivityType',
      'Domain', 'Subdomain', 'Project', 'Skills', 'Status', 'Outcome'
    ];

    const rows = logs.map(l => [
      l._id,
      l.date,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      Math.round(((l.timeSpentMinutes || 0) / 60) * 10) / 10,
      l.timeSpentMinutes || 0,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.activityType || 'Coding').replace(/"/g, '""')}"`,
      `"${(l.primaryDomain?.name || '').replace(/"/g, '""')}"`,
      `"${(l.subdomain || '').replace(/"/g, '""')}"`,
      `"${(l.projectId?.title || '').replace(/"/g, '""')}"`,
      `"${(l.skillIds || []).map(s => s.name).join('; ').replace(/"/g, '""')}"`,
      l.status || 'completed',
      `"${(l.outcome || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="engineering-work-logs.csv"');
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 8. PERIOD REFLECTIONS
// -------------------------------------------------------------
router.get('/reflections/:periodKey', auth, async (req, res, next) => {
  try {
    await connectDB();
    const { periodKey } = req.params;
    const reflection = await Reflection.findOne({
      periodKey,
      userId: req.user._id
    });
    res.json(reflection || { periodKey, accomplishments: '', lessonsLearned: '', challenges: '', nextPriorities: '', habitsScore: 5 });
  } catch (err) {
    next(err);
  }
});

router.post('/reflections', auth, requireEditorOrAbove, async (req, res, next) => {
  try {
    await connectDB();
    const {
      periodType = 'daily',
      periodKey,
      accomplishments,
      lessonsLearned,
      challenges,
      nextPriorities,
      habitsScore
    } = req.body || {};

    if (!periodKey) return res.status(400).json({ message: 'periodKey is required.' });

    const updated = await Reflection.findOneAndUpdate(
      { periodKey, userId: req.user._id },
      {
        periodType,
        periodKey,
        accomplishments: accomplishments || '',
        lessonsLearned: lessonsLearned || '',
        challenges: challenges || '',
        nextPriorities: nextPriorities || '',
        habitsScore: Number(habitsScore) || 5,
        userId: req.user._id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ ok: true, reflection: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
