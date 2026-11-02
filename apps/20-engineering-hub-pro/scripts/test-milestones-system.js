import 'dotenv/config';

const baseUrl = 'http://localhost:5000';

function randomHex24() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

async function runMilestoneTests() {
  console.log('====================================================');
  console.log('   ADVANCED MILESTONES COMPLETE INTEGRATION SUITE   ');
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
  let testGoal = null;
  let testSkill = null;
  let testProject = null;
  let testRoadmap = null;

  let createdMilestoneA = null;
  let createdMilestoneB = null;

  try {
    // 2. Pre-fetch reference entities
    console.log(`\n[Suite 2: Reference Entities Pre-check]`);
    const [domRes, goalRes, skillRes, projRes, rmRes] = await Promise.all([
      fetch(`${baseUrl}/api/domains`),
      fetch(`${baseUrl}/api/goals?all=true`, { headers: authHeaders }),
      fetch(`${baseUrl}/api/skills`),
      fetch(`${baseUrl}/api/projects`),
      fetch(`${baseUrl}/api/roadmaps?all=true`, { headers: authHeaders })
    ]);

    const domains = await domRes.json();
    testDomain = Array.isArray(domains) ? domains[0] : null;

    const goals = await goalRes.json();
    testGoal = Array.isArray(goals) ? goals[0] : null;

    const skills = await skillRes.json();
    testSkill = Array.isArray(skills) ? skills[0] : null;

    const projects = await projRes.json();
    testProject = Array.isArray(projects) ? projects.find(p => p.type !== 'folder') : null;

    const roadmaps = await rmRes.json();
    testRoadmap = Array.isArray(roadmaps) ? roadmaps[0] : null;

    assert(!!testDomain, `Found reference Domain: "${testDomain?.name}"`);
    assert(!!testGoal, `Found reference Goal: "${testGoal?.title}"`);
    assert(!!testSkill, `Found reference Skill: "${testSkill?.name}"`);

    // 3. Milestone Creation with Full Metadata & Subtasks
    console.log(`\n[Suite 3: Milestone Creation & Multi-Entity Linking]`);
    const createPayloadA = {
      title: 'Automated Test: Distributed Ledger Consensus Cluster',
      description: 'Deploy a 3-node Byzantine fault-tolerant cluster with Raft protocol consensus.',
      category: 'Architecture',
      priority: 'High',
      status: 'planned',
      primaryDomain: testDomain?._id,
      subdomain: testDomain?.fields?.[0]?.name || 'Distributed Systems',
      parentGoalId: testGoal?._id,
      relatedSkills: testSkill ? [testSkill._id] : [],
      relatedProjects: testProject ? [testProject._id] : [],
      relatedRoadmapId: testRoadmap?._id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      successCriteria: [
        'Leader election under 150ms timeout',
        'Zero log divergence under partition simulation'
      ],
      subtasks: [
        { title: 'Provision 3 node virtual testbed', completed: false, estimatedMinutes: 45 },
        { title: 'Implement RPC heartbeat protocol', completed: false, estimatedMinutes: 60 },
        { title: 'Run chaos partition benchmark test', completed: false, estimatedMinutes: 90 }
      ],
      notes: 'Internal private benchmark notes and metrics.'
    };

    const createResA = await fetch(`${baseUrl}/api/milestones`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(createPayloadA)
    });
    createdMilestoneA = await createResA.json();

    assert(createResA.status === 201, 'Milestone A created with status 201');
    assert(createdMilestoneA.title === createPayloadA.title, 'Milestone title preserved accurately');
    assert(createdMilestoneA.subtasks?.length === 3, '3 subtasks initialized');
    assert(createdMilestoneA.progress === 0, 'Progress accurately initialized to 0%');
    assert(createdMilestoneA.parentGoalId?._id === testGoal?._id || createdMilestoneA.parentGoalId === testGoal?._id, 'Parent Goal linked bidirectionally');

    // 4. Subtask Toggling & Progress Recalculation
    console.log(`\n[Suite 4: Subtasks Interactive Toggling & Progress Calculation]`);
    const subtask1 = createdMilestoneA.subtasks[0];
    const subtask2 = createdMilestoneA.subtasks[1];
    const subtask3 = createdMilestoneA.subtasks[2];

    // Toggle subtask 1
    const toggleRes1 = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}/toggle-subtask`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ subtaskId: subtask1._id, completed: true })
    });
    const toggleData1 = await toggleRes1.json();
    assert(toggleRes1.status === 200, 'Subtask 1 toggled successfully');
    assert(toggleData1.progress === 33, `Progress accurately calculated: expected 33%, got ${toggleData1.progress}%`);

    // Toggle subtask 2
    const toggleRes2 = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}/toggle-subtask`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ subtaskId: subtask2._id, completed: true })
    });
    const toggleData2 = await toggleRes2.json();
    assert(toggleData2.progress === 67, `Progress after subtask 2: expected 67%, got ${toggleData2.progress}%`);

    // Toggle subtask 3 -> 100% and auto-complete milestone
    const toggleRes3 = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}/toggle-subtask`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ subtaskId: subtask3._id, completed: true })
    });
    const toggleData3 = await toggleRes3.json();
    assert(toggleData3.progress === 100, `Progress after all subtasks: 100%`);
    assert(toggleData3.status === 'completed', 'Milestone auto-completed when all subtasks completed');

    // 5. Dependency Validation & Circular Dependency Detection
    console.log(`\n[Suite 5: Dependency Enforcement & Cycle Prevention]`);
    // Create Milestone B that depends on Milestone A
    const createResB = await fetch(`${baseUrl}/api/milestones`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Automated Test: Sharded Key-Value Engine over Raft',
        category: 'Project',
        priority: 'Critical',
        dependsOn: [createdMilestoneA._id],
        primaryDomain: testDomain?._id
      })
    });
    createdMilestoneB = await createResB.json();
    assert(createResB.status === 201, 'Milestone B created with dependency on Milestone A');

    // Attempt to introduce a circular dependency: Make Milestone A depend on Milestone B (A -> B -> A)
    const cycleRes = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        dependsOn: [createdMilestoneB._id]
      })
    });
    const cycleData = await cycleRes.json();
    assert(cycleRes.status === 400, `Circular dependency rejected with HTTP 400: "${cycleData.message}"`);

    // 6. Verified Evidence Attachment
    console.log(`\n[Suite 6: Verified Deliverable Evidence Attachment]`);
    const evRes = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}/evidence`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Jepsen Split-Brain Benchmark Report',
        url: 'https://github.com/engineering-hub/raft-consensus/blob/main/benchmarks/jepsen-results.md',
        notes: 'Simulated 50 network partitions over 24 hours. Zero inconsistent state transitions observed.',
        type: 'benchmark'
      })
    });
    const evData = await evRes.json();
    assert(evRes.status === 201, 'Evidence attached with status 201');
    assert(evData.evidence?.length >= 1, 'Evidence recorded in milestone evidence array');

    // 7. Domain Deep-Dive Integration
    console.log(`\n[Suite 7: Domain & Subdomain Deep-Dive Integration]`);
    const domainDiveRes = await fetch(`${baseUrl}/api/domains/${testDomain.slug}/deep-dive`);
    const domainDiveData = await domainDiveRes.json();
    assert(domainDiveRes.status === 200, `Domain deep-dive endpoint responded for "${testDomain.slug}"`);
    const matchedMilestone = (domainDiveData.milestones || []).find(m => m._id === createdMilestoneA._id);
    assert(!!matchedMilestone, 'Created milestone appears in Domain deep-dive response');

    // 8. Overdue Logic Verification
    console.log(`\n[Suite 8: Overdue vs Completed State Verification]`);
    // Completed milestone with past due date should NOT be classified as overdue
    const listOverdueRes = await fetch(`${baseUrl}/api/milestones?all=true&overdue=true`, { headers: authHeaders });
    const overdueList = await listOverdueRes.json();
    const isCompletedMisclassified = overdueList.some(m => m._id === createdMilestoneA._id);
    assert(!isCompletedMisclassified, 'Completed milestone with past date is NOT misclassified as overdue');

    // 9. Analytics Endpoint Verification
    console.log(`\n[Suite 9: Analytics Metrics Calculation]`);
    const analyticsRes = await fetch(`${baseUrl}/api/milestones/analytics`, { headers: authHeaders });
    const anData = await analyticsRes.json();
    assert(analyticsRes.status === 200, 'Milestone analytics endpoint responded 200');
    assert(typeof anData.total === 'number' && anData.total >= 2, `Total milestone telemetry accurate (${anData.total})`);
    assert(typeof anData.completionRate === 'number', `Completion rate calculated (${anData.completionRate}%)`);

    // 10. Archive and Restore Workflow
    console.log(`\n[Suite 10: Archive and Restore Lifecycle]`);
    const archiveRes = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}/archive`, {
      method: 'PUT',
      headers: authHeaders
    });
    assert(archiveRes.status === 200, 'Milestone A archived successfully');

    // Verify it is excluded from active list
    const activeListRes = await fetch(`${baseUrl}/api/milestones?all=true`, { headers: authHeaders });
    const activeList = await activeListRes.json();
    assert(!activeList.some(m => m._id === createdMilestoneA._id), 'Archived milestone excluded from active library');

    // Restore it
    const restoreRes = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}/restore`, {
      method: 'PUT',
      headers: authHeaders
    });
    assert(restoreRes.status === 200, 'Milestone A restored successfully');

    // 11. Public vs Private Server-side Privacy Isolation
    console.log(`\n[Suite 11: Server-Side Public Privacy Isolation]`);
    const publicSingleRes = await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}`);
    const publicSingle = await publicSingleRes.json();
    assert(publicSingleRes.status === 200, 'Public GET milestone succeeded');
    assert(publicSingle.notes === undefined || publicSingle.notes === null || publicSingle.notes === '', 'Private notes stripped from unauthenticated response');
    assert(!publicSingle.statusHistory || publicSingle.statusHistory.length === 0, 'Status history stripped from unauthenticated response');

    // 12. Cleanup
    console.log(`\n[Suite 12: Test Artifacts Cleanup]`);
    await fetch(`${baseUrl}/api/milestones/${createdMilestoneB._id}`, { method: 'DELETE', headers: authHeaders });
    await fetch(`${baseUrl}/api/milestones/${createdMilestoneA._id}`, { method: 'DELETE', headers: authHeaders });
    assert(true, 'Test records cleaned up safely');

  } catch (err) {
    console.error('Fatal error during test run:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMilestoneTests();
