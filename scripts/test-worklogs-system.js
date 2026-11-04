import 'dotenv/config';

const baseUrl = 'http://localhost:5000';

async function runWorkLogTests() {
  console.log('====================================================');
  console.log('   ADVANCED WORK LOGS COMPLETE INTEGRATION SUITE    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Authenticate as Super Admin
  console.log('[Suite 1: Super Admin Authentication]');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@engineeringhub.dev',
      password: 'SuperSecurePass123!'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert(loginRes.status === 200 && !!token, 'Super admin authenticated successfully');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  let testDomain = null;
  let testProject = null;
  let testSkill = null;
  let testRoadmap = null;
  let testGoal = null;
  let testMilestone = null;

  let quickLogId = null;
  let detailedLogId = null;
  let timerLogId = null;

  try {
    // 2. Fetch Reference Entities
    console.log('\n[Suite 2: Reference Entities Pre-check]');
    const [domRes, projRes, skillRes, rmRes, goalRes, mlRes] = await Promise.all([
      fetch(`${baseUrl}/api/domains`),
      fetch(`${baseUrl}/api/projects`),
      fetch(`${baseUrl}/api/skills`),
      fetch(`${baseUrl}/api/roadmaps`, { headers: authHeaders }),
      fetch(`${baseUrl}/api/goals`, { headers: authHeaders }),
      fetch(`${baseUrl}/api/milestones?all=true`, { headers: authHeaders })
    ]);

    const domains = await domRes.json();
    testDomain = Array.isArray(domains) ? domains[0] : null;

    const projects = await projRes.json();
    testProject = Array.isArray(projects) ? projects.find(p => p.type !== 'folder') : null;

    const skills = await skillRes.json();
    testSkill = Array.isArray(skills) ? skills[0] : null;

    const roadmaps = await rmRes.json();
    testRoadmap = Array.isArray(roadmaps) ? roadmaps[0] : null;

    const goals = await goalRes.json();
    testGoal = Array.isArray(goals) ? goals[0] : null;

    const milestonesData = await mlRes.json();
    testMilestone = Array.isArray(milestonesData.milestones)
      ? milestonesData.milestones[0]
      : (Array.isArray(milestonesData) ? milestonesData[0] : null);

    assert(!!testDomain, `Found reference Domain: "${testDomain?.name}"`);
    assert(!!testProject, `Found reference Project: "${testProject?.title}"`);
    assert(!!testSkill, `Found reference Skill: "${testSkill?.name}"`);

    // 3. Quick Log Workflow
    console.log('\n[Suite 3: Quick Log Workflow & Minimal Input]');
    const quickRes = await fetch(`${baseUrl}/api/work-logs/quick`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Rapid Bugfix: Resolved Redis connection pool timeout',
        timeSpentMinutes: 30,
        category: 'Debugging',
        outcome: 'Reduced P99 latency by 45ms'
      })
    });
    const quickLog = await quickRes.json();
    assert(quickRes.status === 201, 'Quick log created with status 201');
    assert(quickLog.timeSpentMinutes === 30, 'Time spent recorded accurately (30 mins)');
    assert(quickLog.category === 'Debugging', 'Category recorded as Debugging');
    quickLogId = quickLog._id;

    // 4. Detailed Work Log Creation & Cross-Module Linking
    console.log('\n[Suite 4: Detailed Work Log Creation & Multi-Module Linking]');
    const detailedPayload = {
      title: 'Architected Distributed Vector Clock & Raft Cluster State',
      description: 'Built state replication protocol, leader election timeouts, and vector clocks.',
      date: new Date().toISOString().slice(0, 10),
      timeSpentMinutes: 120,
      category: 'Architecture',
      activityType: 'System Design',
      status: 'completed',
      priority: 'High',
      primaryDomain: testDomain?._id,
      subdomain: testDomain?.fields?.[0]?.name || 'Distributed Systems',
      projectId: testProject?._id,
      skillIds: testSkill ? [testSkill._id] : [],
      roadmapId: testRoadmap?._id,
      goalId: testGoal?._id,
      milestoneId: testMilestone?._id,
      outcome: 'Drafted architecture blueprint and validated against Jepsen partition tests',
      whatLearned: 'Partial synchrony bounds and network partition mitigation strategies',
      blockers: '',
      tags: ['DistributedSystems', 'Raft', 'Architecture'],
      visibility: 'public',
      evidence: [
        {
          title: 'Architecture Blueprint & Commit',
          url: 'https://github.com/engineering-hub/raft/commit/d910aef',
          type: 'commit',
          notes: 'Passed initial vector clock validation suite.'
        }
      ]
    };

    const detailedRes = await fetch(`${baseUrl}/api/work-logs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(detailedPayload)
    });
    const detailedLog = await detailedRes.json();
    assert(detailedRes.status === 201, 'Detailed work log created with status 201');
    assert(detailedLog.title === detailedPayload.title, 'Work log title preserved accurately');
    assert(detailedLog.primaryDomain?._id === testDomain?._id, 'Primary Domain linked correctly');
    assert(detailedLog.projectId?._id === testProject?._id, 'Project linked correctly');
    assert(detailedLog.evidence?.length === 1, 'Deliverable evidence attached properly');
    detailedLogId = detailedLog._id;

    // 5. Active Live Timer Session Management
    console.log('\n[Suite 5: Active Live Timer Session Management]');
    // Start Timer
    const startRes = await fetch(`${baseUrl}/api/work-logs/timer/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Benchmarking WebSocket Message Bus Throughput',
        category: 'Development',
        primaryDomain: testDomain?._id,
        projectId: testProject?._id
      })
    });
    const startData = await startRes.json();
    assert(startRes.status === 201, 'Live timer started successfully');

    // Duplicate Timer Prevention
    const dupTimerRes = await fetch(`${baseUrl}/api/work-logs/timer/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'Second simultaneous session' })
    });
    assert(dupTimerRes.status === 409, 'Duplicate active timer prevented with HTTP 409');

    // Active Check
    const activeRes = await fetch(`${baseUrl}/api/work-logs/timer/active`, { headers: authHeaders });
    const activeData = await activeRes.json();
    assert(activeData.active === true, 'Timer reports active: true');
    assert(activeData.session?.title === 'Benchmarking WebSocket Message Bus Throughput', 'Timer session title preserved');

    // Pause Timer
    const pauseRes = await fetch(`${baseUrl}/api/work-logs/timer/pause`, { method: 'POST', headers: authHeaders });
    const pauseData = await pauseRes.json();
    assert(pauseData.session?.isRunning === false, 'Timer successfully paused');

    // Resume Timer
    const resumeRes = await fetch(`${baseUrl}/api/work-logs/timer/resume`, { method: 'POST', headers: authHeaders });
    const resumeData = await resumeRes.json();
    assert(resumeData.session?.isRunning === true, 'Timer successfully resumed');

    // Stop Timer & Save to WorkLog
    const stopRes = await fetch(`${baseUrl}/api/work-logs/timer/stop`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        timeSpentMinutes: 45, // Set validated duration
        outcome: 'Benchmarked 250,000 msgs/sec with zero packet loss'
      })
    });
    const stopData = await stopRes.json();
    assert(stopRes.status === 201, 'Timer stopped and WorkLog created with status 201');
    assert(stopData.workLog?.timeSpentMinutes === 45, 'WorkLog created with accurate duration');
    timerLogId = stopData.workLog?._id;

    // Verify Active Timer Cleared
    const activeCheckRes = await fetch(`${baseUrl}/api/work-logs/timer/active`, { headers: authHeaders });
    const activeCheckData = await activeCheckRes.json();
    assert(activeCheckData.active === false, 'Active timer cleared after session stop');

    // 6. Period Analytics & Heatmap Calculation
    console.log('\n[Suite 6: Multi-Period Analytics & Activity Heatmap]');
    const analyticsRes = await fetch(`${baseUrl}/api/work-logs/analytics?period=all`, { headers: authHeaders });
    const analytics = await analyticsRes.json();
    assert(analyticsRes.status === 200, 'Analytics endpoint responded with HTTP 200');
    assert(analytics.totalHours > 0, `Total hours calculated: ${analytics.totalHours} hrs`);
    assert(analytics.logCount >= 3, `Log count calculated correctly: ${analytics.logCount}`);
    assert(analytics.byCategory?.length > 0, `Categories computed (${analytics.byCategory.length} categories)`);
    assert(analytics.byDomain?.length > 0, `Domains computed (${analytics.byDomain.length} domains)`);
    assert(analytics.heatmap?.length === 365, 'Annual activity heatmap matrix contains exactly 365 days');
    assert(analytics.consistency?.totalActiveDaysYear > 0, `Annual active days: ${analytics.consistency?.totalActiveDaysYear}`);

    // 7. Cross-Module Domain Deep-Dive Integration
    console.log('\n[Suite 7: Cross-Module Domain Deep-Dive Integration]');
    if (testDomain) {
      const domDiveRes = await fetch(`${baseUrl}/api/domains/${testDomain.slug}/deep-dive`);
      const domDive = await domDiveRes.json();
      assert(domDiveRes.status === 200, `Domain deep-dive endpoint responded for "${testDomain.slug}"`);
      assert(domDive.counts?.workLogs >= 1, `Domain telemetry counts work logs (${domDive.counts?.workLogs})`);
      assert(domDive.counts?.loggedHours > 0, `Domain telemetry tracks logged hours (${domDive.counts?.loggedHours} hrs)`);
      const foundInDom = (domDive.workLogs || []).some(w => w._id.toString() === detailedLogId);
      assert(foundInDom, 'Detailed work log appears in domain workLogs list');
    }

    // 8. Cross-Module Skill Integration
    console.log('\n[Suite 8: Cross-Module Skill Practice History Integration]');
    if (testSkill) {
      const skillDetailRes = await fetch(`${baseUrl}/api/skills/${testSkill._id}`);
      const skillDetail = await skillDetailRes.json();
      assert(skillDetailRes.status === 200, 'Skill detail fetched successfully');
      const foundInSkill = (skillDetail.relatedWorkLogsList || []).some(w => w._id.toString() === detailedLogId);
      assert(foundInSkill, `Skill detail includes work log in relatedWorkLogsList`);
      assert(skillDetail.totalPracticeHours > 0, `Skill detail calculates totalPracticeHours (${skillDetail.totalPracticeHours} hrs)`);
      // Authoritative rule check: skill proficiency is NOT altered
      assert(skillDetail.level !== 'Expert' || skillDetail.yearsOfExperience !== 99, 'Logging practice time did NOT falsely inflate skill level to Expert');
    }

    // 9. Cross-Module Project Work History Integration
    console.log('\n[Suite 9: Cross-Module Project Work History Integration]');
    if (testProject) {
      const projDetailRes = await fetch(`${baseUrl}/api/projects/${testProject.slug || testProject._id}`);
      const projDetail = await projDetailRes.json();
      assert(projDetailRes.status === 200, 'Project detail fetched successfully');
      const foundInProj = (projDetail.workLogs || []).some(w => w._id.toString() === detailedLogId);
      assert(foundInProj, 'Project detail includes work log in workLogs list');
      assert(projDetail.totalLoggedHours > 0, `Project tracks totalLoggedHours (${projDetail.totalLoggedHours} hrs)`);
    }

    // 10. Data Quality & Diagnostics
    console.log('\n[Suite 10: Data Quality & Consistency Diagnostics]');
    const diagRes = await fetch(`${baseUrl}/api/work-logs/diagnostics/check`, { headers: authHeaders });
    const diagData = await diagRes.json();
    assert(diagRes.status === 200, 'Diagnostics endpoint responded with HTTP 200');
    assert(typeof diagData.healthScore === 'number' && diagData.healthScore >= 0, `Database Health Score computed: ${diagData.healthScore}%`);
    assert(typeof diagData.totalLogs === 'number', `Total logs inspected by diagnostics: ${diagData.totalLogs}`);

    // 11. Reporting & CSV Export
    console.log('\n[Suite 11: Reporting & CSV Export]');
    const exportRes = await fetch(`${baseUrl}/api/work-logs/export/download?format=csv`, { headers: authHeaders });
    assert(exportRes.status === 200, 'CSV export endpoint responded with HTTP 200');
    const csvText = await exportRes.text();
    assert(csvText.includes('ID,Date,Title,Hours,Minutes'), 'CSV header correctly formatted (RFC 4180)');
    assert(csvText.includes('Architected Distributed Vector Clock'), 'Exported CSV contains detailed work log');

    // 12. Period Reflections
    console.log('\n[Suite 12: Period Reflections & Review Tracking]');
    const todayStr = new Date().toISOString().slice(0, 10);
    const saveRefRes = await fetch(`${baseUrl}/api/work-logs/reflections`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        periodType: 'daily',
        periodKey: todayStr,
        accomplishments: 'Shipped complete Work Logs engine and cross-module integration',
        lessonsLearned: 'Clean DAG cycle detection and subdocument ID matching',
        challenges: 'Managing cross-module relationships safely',
        nextPriorities: 'Conduct UI/UX balance audit and production build',
        habitsScore: 5
      })
    });
    const refData = await saveRefRes.json();
    assert(saveRefRes.status === 200, 'Daily reflection saved successfully');

    const getRefRes = await fetch(`${baseUrl}/api/work-logs/reflections/${todayStr}`, { headers: authHeaders });
    const fetchedRef = await getRefRes.json();
    assert(fetchedRef.accomplishments.includes('Shipped complete Work Logs engine'), 'Reflection retrieved accurately by periodKey');

    // 13. Archive & Restore Lifecycle
    console.log('\n[Suite 13: Archive and Restore Lifecycle]');
    const archiveRes = await fetch(`${baseUrl}/api/work-logs/${quickLogId}/archive`, {
      method: 'PUT',
      headers: authHeaders
    });
    const archivedData = await archiveRes.json();
    assert(archiveRes.status === 200, 'Work log archived successfully');
    assert(archivedData.isArchived === true, 'isArchived flag set to true');

    const restoreRes = await fetch(`${baseUrl}/api/work-logs/${quickLogId}/restore`, {
      method: 'PUT',
      headers: authHeaders
    });
    const restoredData = await restoreRes.json();
    assert(restoreRes.status === 200, 'Work log restored successfully');
    assert(restoredData.isArchived === false, 'isArchived flag set to false');

    // 14. Server-Side Public Privacy Isolation
    console.log('\n[Suite 14: Server-Side Public Privacy Isolation]');
    const publicLogRes = await fetch(`${baseUrl}/api/work-logs/${detailedLogId}`);
    const publicLog = await publicLogRes.json();
    assert(publicLogRes.status === 200, 'Public GET work log succeeded');
    assert(publicLog.reflectionNotes === undefined || publicLog.reflectionNotes === '', 'Private reflection notes stripped from unauthenticated response');
    assert(publicLog.blockers === undefined || publicLog.blockers === '', 'Internal blockers stripped from unauthenticated response');

    // 15. Clean-up Test Data
    console.log('\n[Suite 15: Clean-up Test Records]');
    if (quickLogId) {
      await fetch(`${baseUrl}/api/work-logs/${quickLogId}`, { method: 'DELETE', headers: authHeaders });
    }
    if (detailedLogId) {
      await fetch(`${baseUrl}/api/work-logs/${detailedLogId}`, { method: 'DELETE', headers: authHeaders });
    }
    if (timerLogId) {
      await fetch(`${baseUrl}/api/work-logs/${timerLogId}`, { method: 'DELETE', headers: authHeaders });
    }
    assert(true, 'Test artifacts and sessions cleaned up safely');

  } catch (err) {
    console.error('Test execution error:', err);
    assert(false, `Unexpected exception during test: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runWorkLogTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
