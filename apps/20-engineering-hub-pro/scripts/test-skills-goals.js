import 'dotenv/config';
import mongoose from 'mongoose';
import { User, ROLES } from '../server/models/User.js';
import { Skill } from '../server/models/Skill.js';
import { Goal } from '../server/models/Goal.js';
import { Project } from '../server/models/Project.js';

const baseUrl = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('   SKILLS & GOALS COMPLETE INTEGRATION TEST SUITE   ');
  console.log('====================================================');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[test] Connected to MongoDB Atlas.');

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
  console.log('\n[Suite 1: Authentication & RBAC Verification]');
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

  let testSkillId = null;
  let testGoalId = null;

  try {
    // 2. Skills CRUD & Analytics
    console.log('\n[Suite 2: Skills Management & Practice Log]');
    const createSkillRes = await fetch(`${baseUrl}/api/skills`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Automated Test eBPF & Kernel Tracing',
        category: 'Systems',
        level: 'Intermediate',
        targetProficiency: 'Expert',
        confidenceRating: 8,
        status: 'Practising',
        proficiencyPercentage: 70,
        description: 'Kernel-level instrumentation and socket telemetry.',
        publicDescription: 'Production eBPF tracing engine.',
        learningNotes: 'PRIVATE_NOTES_SHOULD_NEVER_LEAK',
        knownGaps: ['XDP hardware offloading'],
        visibility: 'public'
      })
    });
    const createdSkill = await createSkillRes.json();
    testSkillId = createdSkill._id;
    assert(createSkillRes.status === 201 && createdSkill.name.includes('eBPF'), 'Skill created with target proficiency & confidence');

    // Quick status update
    const quickRes = await fetch(`${baseUrl}/api/skills/${testSkillId}/quick-status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Demonstrated',
        proficiencyPercentage: 85
      })
    });
    const quickData = await quickRes.json();
    assert(quickRes.status === 200 && quickData.status === 'Demonstrated' && quickData.proficiencyPercentage === 85, 'Quick status and proficiency updated via inline PATCH');

    // Practice log
    const practiceRes = await fetch(`${baseUrl}/api/skills/${testSkillId}/practice`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        durationMinutes: 60,
        topic: 'TC eBPF Filter Hooks',
        learnings: 'Validated packet drop invariants in ring buffer.',
        challenges: 'Verifier loop bounds check.',
        nextAction: 'Integrate userspace daemon'
      })
    });
    const practiceData = await practiceRes.json();
    assert(practiceRes.status === 201 && practiceData.skill.practiceHistory.length === 1, 'Practice session logged directly into skill history with duration');

    // Practical evidence
    const evidenceRes = await fetch(`${baseUrl}/api/skills/${testSkillId}/evidence`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Kernel Socket Monitor Daemon',
        url: 'https://github.com/EmaanHumayun/ebpf-tracer',
        description: 'Live production tracing benchmark with 100k conn/sec.'
      })
    });
    const evidenceData = await evidenceRes.json();
    assert(evidenceRes.status === 201 && evidenceData.skill.practicalEvidence.length === 1, 'Practical evidence item added with verifiable URL');

    // Skills Analytics endpoint
    const skillAnalyticsRes = await fetch(`${baseUrl}/api/skills/analytics`, {
      headers: authHeaders
    });
    const skillAnalytics = await skillAnalyticsRes.json();
    assert(
      skillAnalyticsRes.status === 200 &&
      typeof skillAnalytics.totalActive === 'number' &&
      skillAnalytics.byCategory.length > 0 &&
      typeof skillAnalytics.averageProficiency === 'number',
      'Skills analytics computed live from active database records'
    );

    // 3. Goals & Roadmaps System
    console.log('\n[Suite 3: Goals, Milestones, Tasks & Weekly Reviews]');
    const createGoalRes = await fetch(`${baseUrl}/api/goals`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Automated Test: Deploy High-Throughput Kernel Mesh',
        category: 'Technical Mastery',
        timeHorizon: 'Strategic Goal',
        priority: 'Critical',
        status: 'Active',
        whyItMatters: 'Achieve zero-packet-drop communication across cluster.',
        measurableSuccessCriteria: 'p99 latency < 2ms under 50k RPS.',
        progressMode: 'milestones',
        linkedSkills: [testSkillId],
        milestonesList: [
          {
            title: 'Kernel ring buffer allocation',
            weight: 2,
            isCompleted: true
          },
          {
            title: 'Socket ingress filter deployment',
            weight: 2,
            isCompleted: false
          }
        ]
      })
    });
    const createdGoal = await createGoalRes.json();
    testGoalId = createdGoal._id;
    assert(createGoalRes.status === 201 && createdGoal.progress === 50, 'Goal created with automatic milestone-weighted progress calculation (50%)');

    // Toggle milestone
    const mId = createdGoal.milestonesList[1]._id;
    const toggleMRes = await fetch(`${baseUrl}/api/goals/${testGoalId}/milestones/${mId}/toggle`, {
      method: 'PATCH',
      headers: authHeaders
    });
    const toggleMData = await toggleMRes.json();
    assert(toggleMRes.status === 200 && toggleMData.goal.progress === 100 && toggleMData.goal.status === 'Completed', 'Milestone toggle dynamically recalculated progress to 100% and marked Completed');

    // Add task
    const addTaskRes = await fetch(`${baseUrl}/api/goals/${testGoalId}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Profile CPU cache misses on eBPF map lookups',
        estimatedHours: 4,
        priority: 'High'
      })
    });
    const taskData = await addTaskRes.json();
    assert(addTaskRes.status === 201 && taskData.goal.tasks.length === 1, 'Actionable task created and linked to goal');

    // Log weekly review
    const addReviewRes = await fetch(`${baseUrl}/api/goals/${testGoalId}/reviews`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        completedSummary: 'Validated kernel ring buffer and ingress filters.',
        blockers: 'None.',
        learnings: 'Zero-copy ring buffer reduces kernel-to-userspace copies.',
        isDeadlineRealistic: true,
        nextCommitments: 'Benchmark sustained throughput'
      })
    });
    const reviewData = await addReviewRes.json();
    assert(addReviewRes.status === 201 && reviewData.goal.reviews.length === 1, 'Weekly retrospective review preserved in goal review archive');

    // Goals Analytics endpoint
    const goalAnalyticsRes = await fetch(`${baseUrl}/api/goals/analytics`, {
      headers: authHeaders
    });
    const goalAnalytics = await goalAnalyticsRes.json();
    assert(
      goalAnalyticsRes.status === 200 &&
      typeof goalAnalytics.totalActive === 'number' &&
      typeof goalAnalytics.milestoneCompletionRate === 'number',
      'Goals analytics computed live from active database records'
    );

    // 4. Data Privacy & Sanitization Check (Public vs Private)
    console.log('\n[Suite 4: Public Portfolio Privacy & Data Sanitization]');
    const publicSkillRes = await fetch(`${baseUrl}/api/skills/${testSkillId}`);
    const publicSkillData = await publicSkillRes.json();
    assert(
      publicSkillData.learningNotes === undefined &&
      publicSkillData.knownGaps === undefined &&
      publicSkillData.practiceHistory === undefined,
      'Public skills endpoint strictly omits private notes, known gaps, and practice history'
    );

    const publicGoalRes = await fetch(`${baseUrl}/api/goals/${testGoalId}`);
    const publicGoalData = await publicGoalRes.json();
    assert(
      publicGoalData.reviews === undefined &&
      publicGoalData.blockers === undefined &&
      publicGoalData.tasks === undefined,
      'Public goals endpoint strictly omits private reviews, blockers, and execution task lists'
    );

  } finally {
    // 5. Cleanup Test Artifacts
    console.log('\n[Suite 5: Clean Teardown]');
    if (testSkillId) {
      await Skill.findByIdAndDelete(testSkillId);
      console.log('  [cleanup] Deleted test skill.');
    }
    if (testGoalId) {
      await Goal.findByIdAndDelete(testGoalId);
      console.log('  [cleanup] Deleted test goal.');
    }
    await mongoose.disconnect();
  }

  console.log('====================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('[test] Fatal error:', err);
  process.exit(1);
});
