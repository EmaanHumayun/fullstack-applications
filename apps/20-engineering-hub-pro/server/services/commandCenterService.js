import { calculateProjectProgress, calculateRoadmapProgress } from './progress.js';

/**
 * Parses and normalizes date filter options.
 * Returns { startDate, endDate, comparisonStartDate, comparisonEndDate, preset, label }
 */
export function resolveDateRange(params = {}) {
  const preset = params.preset || 'monthly';
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  let startDateStr = '';
  let endDateStr = todayStr;
  let compStartDateStr = '';
  let compEndDateStr = '';
  let label = '';

  function formatDate(d) {
    return d.toISOString().slice(0, 10);
  }

  function subDays(d, days) {
    const res = new Date(d);
    res.setDate(res.getDate() - days);
    return res;
  }

  if (preset === 'daily') {
    startDateStr = todayStr;
    endDateStr = todayStr;
    const yDay = subDays(now, 1);
    compStartDateStr = formatDate(yDay);
    compEndDateStr = formatDate(yDay);
    label = `Today: ${todayStr}`;
  } else if (preset === 'weekly') {
    const start = subDays(now, 6);
    startDateStr = formatDate(start);
    endDateStr = todayStr;
    const compEnd = subDays(start, 1);
    const compStart = subDays(compEnd, 6);
    compStartDateStr = formatDate(compStart);
    compEndDateStr = formatDate(compEnd);
    label = `Past 7 Days (${startDateStr} to ${endDateStr})`;
  } else if (preset === 'monthly') {
    const start = subDays(now, 29);
    startDateStr = formatDate(start);
    endDateStr = todayStr;
    const compEnd = subDays(start, 1);
    const compStart = subDays(compEnd, 29);
    compStartDateStr = formatDate(compStart);
    compEndDateStr = formatDate(compEnd);
    label = `Past 30 Days (${startDateStr} to ${endDateStr})`;
  } else if (preset === 'quarterly') {
    const start = subDays(now, 89);
    startDateStr = formatDate(start);
    endDateStr = todayStr;
    const compEnd = subDays(start, 1);
    const compStart = subDays(compEnd, 89);
    compStartDateStr = formatDate(compStart);
    compEndDateStr = formatDate(compEnd);
    label = `Past 90 Days (${startDateStr} to ${endDateStr})`;
  } else if (preset === 'yearly') {
    const start = subDays(now, 364);
    startDateStr = formatDate(start);
    endDateStr = todayStr;
    const compEnd = subDays(start, 1);
    const compStart = subDays(compEnd, 364);
    compStartDateStr = formatDate(compStart);
    compEndDateStr = formatDate(compEnd);
    label = `Past 365 Days (${startDateStr} to ${endDateStr})`;
  } else if (preset === 'all') {
    startDateStr = '2020-01-01';
    endDateStr = todayStr;
    compStartDateStr = '';
    compEndDateStr = '';
    label = 'All Recorded History';
  } else if (preset === 'custom') {
    startDateStr = params.startDate ? String(params.startDate).slice(0, 10) : formatDate(subDays(now, 29));
    endDateStr = params.endDate ? String(params.endDate).slice(0, 10) : todayStr;
    if (startDateStr > endDateStr) {
      const temp = startDateStr;
      startDateStr = endDateStr;
      endDateStr = temp;
    }
    const diffMs = new Date(endDateStr) - new Date(startDateStr);
    const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    const compEnd = subDays(new Date(startDateStr), 1);
    const compStart = subDays(compEnd, diffDays - 1);
    compStartDateStr = formatDate(compStart);
    compEndDateStr = formatDate(compEnd);
    label = `Custom Range: ${startDateStr} to ${endDateStr}`;
  } else {
    // Default fallback to past 30 days
    const start = subDays(now, 29);
    startDateStr = formatDate(start);
    endDateStr = todayStr;
    label = `Past 30 Days (${startDateStr} to ${endDateStr})`;
  }

  return {
    preset,
    startDate: startDateStr,
    endDate: endDateStr,
    comparisonStartDate: compStartDateStr,
    comparisonEndDate: compEndDateStr,
    label
  };
}

/**
 * Computes complete analytics telemetry for the Command Center.
 */
export function computeCommandCenterData({
  domains = [],
  projects = [],
  skills = [],
  roadmaps = [],
  goals = [],
  milestones = [],
  workLogs = [],
  certificates = [],
  resources = [],
  filters = {}
}) {
  const dateRange = resolveDateRange(filters);
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = dateRange;

  const filterDomainId = filters.domainId && filters.domainId !== 'all' ? String(filters.domainId) : null;
  const filterSubdomain = filters.subdomain && filters.subdomain !== 'all' ? String(filters.subdomain).toLowerCase() : null;
  const filterProjectId = filters.projectId && filters.projectId !== 'all' ? String(filters.projectId) : null;
  const filterRoadmapId = filters.roadmapId && filters.roadmapId !== 'all' ? String(filters.roadmapId) : null;
  const filterGoalId = filters.goalId && filters.goalId !== 'all' ? String(filters.goalId) : null;

  // Domain map for easy lookup
  const domainById = new Map();
  const domainByName = new Map();
  for (const d of domains) {
    domainById.set(String(d._id), d);
    domainByName.set(String(d.name).toLowerCase(), d);
    if (d.slug) domainByName.set(String(d.slug).toLowerCase(), d);
  }

  function resolveDomainName(item) {
    if (item.primaryDomain) {
      const d = domainById.get(String(item.primaryDomain._id || item.primaryDomain));
      if (d) return d.name;
    }
    if (item.domain) {
      if (typeof item.domain === 'object' && item.domain.name) return item.domain.name;
      const d = domainById.get(String(item.domain)) || domainByName.get(String(item.domain).toLowerCase());
      if (d) return d.name;
      return String(item.domain);
    }
    return 'Uncategorized';
  }

  function resolveDomainId(item) {
    if (item.primaryDomain) return String(item.primaryDomain._id || item.primaryDomain);
    if (item.domain) {
      if (typeof item.domain === 'object' && item.domain._id) return String(item.domain._id);
      const d = domainById.get(String(item.domain)) || domainByName.get(String(item.domain).toLowerCase());
      if (d) return String(d._id);
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // 1. FILTERING WORK LOGS
  // ---------------------------------------------------------------------------
  function matchesEntityFilter(log) {
    if (filterDomainId) {
      const logDomId = resolveDomainId(log);
      if (logDomId !== filterDomainId) return false;
    }
    if (filterSubdomain) {
      const logSub = String(log.subdomain || log.subdomainId || '').toLowerCase();
      if (!logSub.includes(filterSubdomain)) return false;
    }
    if (filterProjectId) {
      const logProjId = log.projectId ? String(log.projectId._id || log.projectId) : null;
      if (logProjId !== filterProjectId) return false;
    }
    if (filterRoadmapId) {
      const logRmId = log.roadmapId ? String(log.roadmapId._id || log.roadmapId) : null;
      if (logRmId !== filterRoadmapId) return false;
    }
    if (filterGoalId) {
      const logGoalId = log.goalId ? String(log.goalId._id || log.goalId) : null;
      if (logGoalId !== filterGoalId) return false;
    }
    return true;
  }

  const periodLogs = [];
  const comparisonLogs = [];

  for (const log of workLogs) {
    if (!matchesEntityFilter(log)) continue;
    const logDate = String(log.date || '').slice(0, 10);
    if (logDate >= startDate && logDate <= endDate) {
      periodLogs.push(log);
    } else if (comparisonStartDate && comparisonEndDate && logDate >= comparisonStartDate && logDate <= comparisonEndDate) {
      comparisonLogs.push(log);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. EXECUTIVE SUMMARY METRICS
  // ---------------------------------------------------------------------------
  const totalLoggedMinutes = periodLogs.reduce((acc, l) => acc + (Number(l.timeSpentMinutes) || 0), 0);
  const totalLoggedHours = Math.round((totalLoggedMinutes / 60) * 10) / 10;
  const workSessionCount = periodLogs.length;

  const compMinutes = comparisonLogs.reduce((acc, l) => acc + (Number(l.timeSpentMinutes) || 0), 0);
  const compHours = Math.round((compMinutes / 60) * 10) / 10;
  const compSessions = comparisonLogs.length;

  const hoursDeltaPercent = compHours > 0 ? Math.round(((totalLoggedHours - compHours) / compHours) * 100) : null;
  const sessionsDeltaPercent = compSessions > 0 ? Math.round(((workSessionCount - compSessions) / compSessions) * 100) : null;

  // Deliverables in period
  const deliverablesList = [];
  for (const log of periodLogs) {
    if (log.verifiedEvidence && Array.isArray(log.verifiedEvidence)) {
      for (const ev of log.verifiedEvidence) {
        deliverablesList.push({
          id: ev._id ? String(ev._id) : `${log._id}-ev`,
          title: ev.title || log.title,
          url: ev.url || '',
          type: ev.type || 'deliverable',
          date: ev.date ? String(ev.date).slice(0, 10) : log.date,
          source: 'WorkLog',
          sourceTitle: log.title,
          sourceId: String(log._id)
        });
      }
    }
  }

  for (const m of milestones) {
    if (m.evidence && Array.isArray(m.evidence)) {
      for (const ev of m.evidence) {
        const evDate = ev.date ? String(ev.date).slice(0, 10) : String(m.completedAt || m.updatedAt || '').slice(0, 10);
        if (evDate >= startDate && evDate <= endDate) {
          deliverablesList.push({
            id: ev._id ? String(ev._id) : `${m._id}-ev`,
            title: ev.title || m.title,
            url: ev.url || '',
            type: ev.type || 'milestone_deliverable',
            date: evDate,
            source: 'Milestone',
            sourceTitle: m.title,
            sourceId: String(m._id)
          });
        }
      }
    }
  }

  // Active projects
  const filteredProjects = projects.filter(p => {
    if (p.type === 'folder' || p.type === 'directory') return false;
    if (filterDomainId && resolveDomainId(p) !== filterDomainId) return false;
    return true;
  });

  const activeProjects = filteredProjects.filter(p => p.status === 'In progress' || p.status === 'Active');
  const completedProjects = filteredProjects.filter(p => p.status === 'Completed');

  // Goals
  const filteredGoals = goals.filter(g => {
    if (filterDomainId && resolveDomainId(g) !== filterDomainId) return false;
    return true;
  });
  const activeGoals = filteredGoals.filter(g => g.status === 'Active' || g.status === 'In Progress');
  const completedGoals = filteredGoals.filter(g => g.status === 'Achieved' || g.status === 'Completed');

  // Milestones
  const filteredMilestones = milestones.filter(m => {
    if (filterDomainId && resolveDomainId(m) !== filterDomainId) return false;
    return true;
  });

  const completedMilestonesTotal = filteredMilestones.filter(m => m.status === 'completed');
  const completedMilestonesInPeriod = filteredMilestones.filter(m => {
    if (m.status !== 'completed') return false;
    const cDate = String(m.completedAt || m.completionDate || m.updatedAt || '').slice(0, 10);
    return cDate >= startDate && cDate <= endDate;
  });
  const activeMilestones = filteredMilestones.filter(m => m.status === 'in_progress' || m.status === 'planned');
  const blockedMilestones = filteredMilestones.filter(m => m.status === 'blocked');

  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueMilestones = filteredMilestones.filter(m => {
    if (m.status === 'completed' || m.status === 'archived') return false;
    const due = m.dueDate || m.targetDate;
    return due && due < todayStr;
  });

  // Roadmaps
  const filteredRoadmaps = roadmaps.filter(r => {
    if (filterDomainId && resolveDomainId(r) !== filterDomainId) return false;
    return true;
  });
  const activeRoadmaps = filteredRoadmaps.filter(r => r.status === 'in_progress' || r.status === 'Active');
  const completedRoadmaps = filteredRoadmaps.filter(r => r.status === 'completed' || r.status === 'Completed');

  let totalStepCount = 0;
  let completedStepCount = 0;
  let blockedStepCount = 0;
  let availableStepCount = 0;
  const nextActions = [];

  for (const rm of filteredRoadmaps) {
    if (!rm.phases) continue;
    for (const phase of rm.phases) {
      if (!phase.steps) continue;
      for (const step of phase.steps) {
        totalStepCount++;
        if (step.completed || step.status === 'completed') {
          completedStepCount++;
        } else if (step.blocked || step.status === 'blocked') {
          blockedStepCount++;
        } else if (step.status === 'available' || step.status === 'in_progress') {
          availableStepCount++;
          if (nextActions.length < 8) {
            nextActions.push({
              stepId: step.id,
              title: step.title,
              roadmapTitle: rm.title,
              roadmapId: String(rm._id),
              phaseTitle: phase.title,
              priority: step.priority || 'Medium',
              estimatedEffort: step.estimatedEffort || '2h',
              domain: resolveDomainName(rm)
            });
          }
        }
      }
    }
  }

  const overallRoadmapProgress = filteredRoadmaps.length > 0
    ? Math.round(filteredRoadmaps.reduce((acc, r) => acc + (calculateRoadmapProgress(r.phases) || r.progress || 0), 0) / filteredRoadmaps.length)
    : 0;

  // Skills
  const filteredSkills = skills.filter(s => {
    if (filterDomainId && resolveDomainId(s) !== filterDomainId) return false;
    return true;
  });

  const practicedSkillIdSet = new Set();
  const skillMinutesMap = new Map();

  for (const log of periodLogs) {
    if (log.skillIds && Array.isArray(log.skillIds)) {
      for (const sid of log.skillIds) {
        const idStr = String(sid._id || sid);
        practicedSkillIdSet.add(idStr);
        skillMinutesMap.set(idStr, (skillMinutesMap.get(idStr) || 0) + (Number(log.timeSpentMinutes) || 0));
      }
    }
  }

  const skillsWithEvidence = filteredSkills.filter(s => s.evidence && s.evidence.length > 0);

  // Top practiced skills ranking
  const topPracticedSkills = Array.from(practicedSkillIdSet)
    .map(id => {
      const skill = filteredSkills.find(s => String(s._id) === id);
      if (!skill) return null;
      return {
        id: String(skill._id),
        name: skill.name,
        level: skill.level || 'Intermediate',
        domain: resolveDomainName(skill),
        minutes: skillMinutesMap.get(id) || 0,
        hours: Math.round(((skillMinutesMap.get(id) || 0) / 60) * 10) / 10,
        evidenceCount: skill.evidence?.length || 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  // Certificates
  const filteredCertificates = certificates.filter(c => {
    if (filterDomainId && resolveDomainId(c) !== filterDomainId) return false;
    return true;
  });
  const earnedCertificates = filteredCertificates.filter(c => !c.status || c.status === 'Completed' || c.status === 'Verified' || c.published);

  // ---------------------------------------------------------------------------
  // 3. TIME-SERIES TRENDS VISUALIZATION
  // ---------------------------------------------------------------------------
  // Buckets generation based on preset
  const timeSeries = [];
  const bucketMap = new Map();

  function getBucketKeyAndLabel(dateStr) {
    if (dateRange.preset === 'daily') {
      return { key: dateStr, label: dateStr };
    }
    if (dateRange.preset === 'yearly') {
      const monthStr = dateStr.slice(0, 7);
      return { key: monthStr, label: monthStr };
    }
    // Default daily key
    return { key: dateStr, label: dateStr };
  }

  // Pre-populate time series buckets so zero-work days are properly represented
  const curr = new Date(startDate);
  const endD = new Date(endDate);
  while (curr <= endD) {
    const dStr = curr.toISOString().slice(0, 10);
    const { key, label } = getBucketKeyAndLabel(dStr);
    if (!bucketMap.has(key)) {
      bucketMap.set(key, {
        date: key,
        label,
        hours: 0,
        minutes: 0,
        sessions: 0,
        deliverables: 0,
        milestonesCompleted: 0
      });
    }
    curr.setDate(curr.getDate() + 1);
  }

  for (const log of periodLogs) {
    const dStr = String(log.date || '').slice(0, 10);
    const { key } = getBucketKeyAndLabel(dStr);
    if (bucketMap.has(key)) {
      const b = bucketMap.get(key);
      b.minutes += Number(log.timeSpentMinutes) || 0;
      b.hours = Math.round((b.minutes / 60) * 10) / 10;
      b.sessions += 1;
      if (log.verifiedEvidence && log.verifiedEvidence.length > 0) {
        b.deliverables += log.verifiedEvidence.length;
      }
    }
  }

  for (const m of completedMilestonesInPeriod) {
    const cDate = String(m.completedAt || m.completionDate || m.updatedAt || '').slice(0, 10);
    const { key } = getBucketKeyAndLabel(cDate);
    if (bucketMap.has(key)) {
      bucketMap.get(key).milestonesCompleted += 1;
    }
  }

  const timeSeriesData = Array.from(bucketMap.values());

  // ---------------------------------------------------------------------------
  // 4. DOMAIN & SUBDOMAIN INVESTED TIME DISTRIBUTION
  // ---------------------------------------------------------------------------
  const domainAggregation = new Map();
  for (const d of domains) {
    domainAggregation.set(String(d._id), {
      domainId: String(d._id),
      domainName: d.name,
      slug: d.slug,
      accentColor: d.accentColor || '#bb9457',
      icon: d.icon || 'layers',
      minutes: 0,
      hours: 0,
      sessionCount: 0,
      subdomainsMap: new Map(),
      activeGoalsCount: 0,
      activeMilestonesCount: 0,
      projectsCount: 0,
      skillsCount: 0
    });
  }

  // Count items per domain
  for (const g of activeGoals) {
    const did = resolveDomainId(g);
    if (did && domainAggregation.has(did)) domainAggregation.get(did).activeGoalsCount++;
  }
  for (const m of activeMilestones) {
    const did = resolveDomainId(m);
    if (did && domainAggregation.has(did)) domainAggregation.get(did).activeMilestonesCount++;
  }
  for (const p of filteredProjects) {
    const did = resolveDomainId(p);
    if (did && domainAggregation.has(did)) domainAggregation.get(did).projectsCount++;
  }
  for (const s of filteredSkills) {
    const did = resolveDomainId(s);
    if (did && domainAggregation.has(did)) domainAggregation.get(did).skillsCount++;
  }

  // Aggregate work logs into domains and subdomains
  for (const log of periodLogs) {
    const did = resolveDomainId(log);
    if (did && domainAggregation.has(did)) {
      const dRec = domainAggregation.get(did);
      const mins = Number(log.timeSpentMinutes) || 0;
      dRec.minutes += mins;
      dRec.sessionCount += 1;

      const subName = log.subdomain || 'General Practice';
      const currentSub = dRec.subdomainsMap.get(subName) || { name: subName, minutes: 0, hours: 0, count: 0 };
      currentSub.minutes += mins;
      currentSub.hours = Math.round((currentSub.minutes / 60) * 10) / 10;
      currentSub.count += 1;
      dRec.subdomainsMap.set(subName, currentSub);
    }
  }

  const domainDistribution = Array.from(domainAggregation.values())
    .map(d => {
      d.hours = Math.round((d.minutes / 60) * 10) / 10;
      d.percentage = totalLoggedMinutes > 0 ? Math.round((d.minutes / totalLoggedMinutes) * 100) : 0;
      d.subdomains = Array.from(d.subdomainsMap.values()).sort((a, b) => b.minutes - a.minutes);
      delete d.subdomainsMap;
      return d;
    })
    .sort((a, b) => b.minutes - a.minutes);

  // ---------------------------------------------------------------------------
  // 5. GOALS & MILESTONES DETAILED TELEMETRY
  // ---------------------------------------------------------------------------
  const goalStatusCounts = {
    Active: filteredGoals.filter(g => g.status === 'Active').length,
    InProgress: filteredGoals.filter(g => g.status === 'In Progress').length,
    Achieved: filteredGoals.filter(g => g.status === 'Achieved' || g.status === 'Completed').length,
    OnHold: filteredGoals.filter(g => g.status === 'On hold').length,
    Draft: filteredGoals.filter(g => g.status === 'Draft' || g.status === 'Planned').length
  };

  const milestoneStatusCounts = {
    planned: filteredMilestones.filter(m => m.status === 'planned' || m.status === 'not_started').length,
    in_progress: filteredMilestones.filter(m => m.status === 'in_progress').length,
    completed: filteredMilestones.filter(m => m.status === 'completed').length,
    blocked: filteredMilestones.filter(m => m.status === 'blocked').length
  };

  const upcomingDeadlines = filteredMilestones
    .filter(m => {
      if (m.status === 'completed' || m.status === 'archived') return false;
      const due = m.dueDate || m.targetDate;
      return due && due >= todayStr;
    })
    .sort((a, b) => (a.dueDate || a.targetDate).localeCompare(b.dueDate || b.targetDate))
    .slice(0, 6)
    .map(m => ({
      id: String(m._id),
      title: m.title,
      dueDate: m.dueDate || m.targetDate,
      domain: resolveDomainName(m),
      priority: m.priority || 'Medium',
      progress: m.progress || 0
    }));

  // ---------------------------------------------------------------------------
  // 6. 365-DAY ANNUAL CONTRIBUTION HEATMAP
  // ---------------------------------------------------------------------------
  const heatmap = [];
  const heatmapDayMap = new Map();

  for (const log of workLogs) {
    if (!matchesEntityFilter(log)) continue;
    const dStr = String(log.date || '').slice(0, 10);
    const existing = heatmapDayMap.get(dStr) || { minutes: 0, count: 0 };
    existing.minutes += Number(log.timeSpentMinutes) || 0;
    existing.count += 1;
    heatmapDayMap.set(dStr, existing);
  }

  const hEnd = new Date();
  const hStart = new Date();
  hStart.setDate(hEnd.getDate() - 364);

  let iter = new Date(hStart);
  while (iter <= hEnd) {
    const dStr = iter.toISOString().slice(0, 10);
    const data = heatmapDayMap.get(dStr) || { minutes: 0, count: 0 };
    const mins = data.minutes;
    let intensity = 0;
    if (mins > 0 && mins <= 60) intensity = 1;
    else if (mins > 60 && mins <= 120) intensity = 2;
    else if (mins > 120 && mins <= 240) intensity = 3;
    else if (mins > 240) intensity = 4;

    heatmap.push({
      date: dStr,
      minutes: mins,
      hours: Math.round((mins / 60) * 10) / 10,
      count: data.count,
      intensity
    });
    iter.setDate(iter.getDate() + 1);
  }

  // Work log category breakdown
  const categoryMap = new Map();
  for (const log of periodLogs) {
    const cat = log.category || 'Development';
    const existing = categoryMap.get(cat) || { name: cat, minutes: 0, hours: 0, count: 0 };
    existing.minutes += Number(log.timeSpentMinutes) || 0;
    existing.count += 1;
    categoryMap.set(cat, existing);
  }
  const categoryBreakdown = Array.from(categoryMap.values()).map(c => {
    c.hours = Math.round((c.minutes / 60) * 10) / 10;
    c.percentage = totalLoggedMinutes > 0 ? Math.round((c.minutes / totalLoggedMinutes) * 100) : 0;
    return c;
  }).sort((a, b) => b.minutes - a.minutes);

  // ---------------------------------------------------------------------------
  // 7. INTERACTIVE RELATIONSHIP GRAPH MAPPING (Progress Map)
  // ---------------------------------------------------------------------------
  const graphNodes = [];
  const graphEdges = [];
  const nodeSet = new Set();

  function addNode(id, label, type, status, progress, domain, meta = {}) {
    if (nodeSet.has(id)) return;
    nodeSet.add(id);
    graphNodes.push({
      id,
      label,
      type,
      status: status || 'active',
      progress: progress !== undefined ? progress : null,
      domain: domain || 'General',
      ...meta
    });
  }

  function addEdge(source, target, relationship) {
    if (!nodeSet.has(source) || !nodeSet.has(target)) return;
    graphEdges.push({
      source,
      target,
      relationship
    });
  }

  // Add Domains
  for (const d of domains) {
    addNode(`dom-${d._id}`, d.name, 'domain', 'active', null, d.name, { color: d.accentColor, icon: d.icon });
  }

  // Add Active Projects
  for (const p of filteredProjects.slice(0, 15)) {
    const pId = `proj-${p._id}`;
    const domName = resolveDomainName(p);
    addNode(pId, p.title, 'project', p.status, calculateProjectProgress(p), domName, { published: p.published });
    const domId = resolveDomainId(p);
    if (domId) addEdge(`dom-${domId}`, pId, 'contains');
  }

  // Add Active Goals
  for (const g of filteredGoals.slice(0, 15)) {
    const gId = `goal-${g._id}`;
    const domName = resolveDomainName(g);
    addNode(gId, g.title, 'goal', g.status, g.progress || 0, domName, { priority: g.priority });
    const domId = resolveDomainId(g);
    if (domId) addEdge(`dom-${domId}`, gId, 'contains');
  }

  // Add Key Milestones
  for (const m of filteredMilestones.slice(0, 20)) {
    const mId = `mile-${m._id}`;
    const domName = resolveDomainName(m);
    addNode(mId, m.title, 'milestone', m.status, m.progress || 0, domName, { priority: m.priority });
    const domId = resolveDomainId(m);
    if (domId) addEdge(`dom-${domId}`, mId, 'contains');

    // Link milestone to Goal
    if (m.relatedGoal || m.parentGoalId) {
      const gId = String(m.relatedGoal?._id || m.relatedGoal || m.parentGoalId);
      addEdge(`goal-${gId}`, mId, 'executes');
    }

    // Link milestone to Projects
    if (m.relatedProjects && Array.isArray(m.relatedProjects)) {
      for (const p of m.relatedProjects) {
        addEdge(mId, `proj-${p._id || p}`, 'delivers');
      }
    }
  }

  // Add Top Skills
  for (const s of filteredSkills.slice(0, 20)) {
    const sId = `skill-${s._id}`;
    const domName = resolveDomainName(s);
    addNode(sId, s.name, 'skill', s.level, null, domName, { category: s.category });
    const domId = resolveDomainId(s);
    if (domId) addEdge(`dom-${domId}`, sId, 'develops');
  }

  // Add Roadmaps
  for (const r of filteredRoadmaps.slice(0, 10)) {
    const rId = `rm-${r._id}`;
    const domName = resolveDomainName(r);
    addNode(rId, r.title, 'roadmap', r.status, calculateRoadmapProgress(r.phases), domName);
    const domId = resolveDomainId(r);
    if (domId) addEdge(`dom-${domId}`, rId, 'guides');
  }

  // ---------------------------------------------------------------------------
  // 8. CHRONOLOGICAL SYNTHESIZED ACTIVITY FEED
  // ---------------------------------------------------------------------------
  const activityEvents = [];

  for (const log of periodLogs.slice(0, 30)) {
    activityEvents.push({
      id: `act-log-${log._id}`,
      type: 'work_log',
      title: log.title,
      subtitle: `${log.timeSpentMinutes}m in ${resolveDomainName(log)} · ${log.category || 'Engineering'}`,
      date: log.date,
      link: '/admin/work-logs',
      domain: resolveDomainName(log),
      rawTimestamp: new Date(log.date || log.createdAt).getTime()
    });
  }

  for (const m of completedMilestonesInPeriod) {
    const cDate = String(m.completedAt || m.completionDate || m.updatedAt || '').slice(0, 10);
    activityEvents.push({
      id: `act-mile-${m._id}`,
      type: 'milestone',
      title: `Achieved Milestone: ${m.title}`,
      subtitle: `${resolveDomainName(m)} · Priority: ${m.priority || 'Medium'}`,
      date: cDate,
      link: '/admin/milestones',
      domain: resolveDomainName(m),
      rawTimestamp: new Date(m.completedAt || m.updatedAt).getTime()
    });
  }

  for (const p of filteredProjects) {
    if (p.published && p.createdAt) {
      const pDate = String(p.createdAt).slice(0, 10);
      if (pDate >= startDate && pDate <= endDate) {
        activityEvents.push({
          id: `act-proj-${p._id}`,
          type: 'project',
          title: `Published Project: ${p.title}`,
          subtitle: `${resolveDomainName(p)} · ${p.summary || 'Architecture live'}`,
          date: pDate,
          link: '/admin/projects',
          domain: resolveDomainName(p),
          rawTimestamp: new Date(p.createdAt).getTime()
        });
      }
    }
  }

  activityEvents.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  const recentActivityFeed = activityEvents.slice(0, 20);

  // Return complete unified command center payload
  return {
    dateRange,
    summary: {
      totalLoggedHours,
      totalLoggedMinutes,
      workSessionCount,
      deliverablesCompleted: deliverablesList.length,
      activeProjectsCount: activeProjects.length,
      completedProjectsCount: completedProjects.length,
      totalProjectsCount: filteredProjects.length,
      activeGoalsCount: activeGoals.length,
      completedGoalsCount: completedGoals.length,
      totalGoalsCount: filteredGoals.length,
      completedMilestonesPeriodCount: completedMilestonesInPeriod.length,
      totalCompletedMilestonesCount: completedMilestonesTotal.length,
      totalMilestonesCount: filteredMilestones.length,
      overallRoadmapProgress,
      skillsPracticedCount: practicedSkillIdSet.size,
      skillsWithEvidenceCount: skillsWithEvidence.length,
      totalSkillsCount: filteredSkills.length,
      certificatesEarnedCount: earnedCertificates.length,
      totalCertificatesCount: filteredCertificates.length,
      deltas: {
        hasComparison: compHours > 0 || compSessions > 0,
        hoursPercent: hoursDeltaPercent,
        sessionsPercent: sessionsDeltaPercent
      }
    },
    timeSeries: timeSeriesData,
    domains: domainDistribution,
    goals: {
      statusCounts: goalStatusCounts,
      activeGoals: activeGoals.slice(0, 6).map(g => ({
        id: String(g._id),
        title: g.title,
        priority: g.priority,
        progress: g.progress || 0,
        domain: resolveDomainName(g)
      }))
    },
    milestones: {
      statusCounts: milestoneStatusCounts,
      upcomingDeadlines,
      overdueMilestones: overdueMilestones.map(m => ({
        id: String(m._id),
        title: m.title,
        dueDate: m.dueDate || m.targetDate,
        domain: resolveDomainName(m)
      })),
      blockedMilestones: blockedMilestones.map(m => ({
        id: String(m._id),
        title: m.title,
        domain: resolveDomainName(m)
      }))
    },
    skills: {
      topPracticed: topPracticedSkills,
      levels: {
        Beginner: filteredSkills.filter(s => s.level === 'Beginner').length,
        Developing: filteredSkills.filter(s => s.level === 'Developing').length,
        Intermediate: filteredSkills.filter(s => s.level === 'Intermediate').length,
        Advanced: filteredSkills.filter(s => s.level === 'Advanced').length,
        Expert: filteredSkills.filter(s => s.level === 'Expert').length
      }
    },
    roadmaps: {
      activeCount: activeRoadmaps.length,
      completedCount: completedRoadmaps.length,
      totalSteps: totalStepCount,
      completedSteps: completedStepCount,
      availableSteps: availableStepCount,
      blockedSteps: blockedStepCount,
      nextActions
    },
    projects: {
      statusDistribution: {
        InProgress: activeProjects.length,
        Completed: completedProjects.length,
        Planning: filteredProjects.filter(p => p.status === 'Planning' || p.status === 'Draft').length,
        OnHold: filteredProjects.filter(p => p.status === 'On hold').length
      },
      recentDeliverables: deliverablesList.slice(0, 10)
    },
    workLogs: {
      heatmap,
      categoryBreakdown,
      recentLogs: periodLogs.slice(0, 8).map(l => ({
        id: String(l._id),
        title: l.title,
        date: l.date,
        durationMinutes: l.timeSpentMinutes,
        category: l.category || 'Development',
        domain: resolveDomainName(l)
      }))
    },
    relationshipMap: {
      nodes: graphNodes,
      edges: graphEdges
    },
    activityFeed: recentActivityFeed
  };
}
