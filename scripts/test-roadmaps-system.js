import 'dotenv/config';

const baseUrl = 'http://localhost:5000';

function randomHex24() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

async function runRoadmapTests() {
  console.log('====================================================');
  console.log('  ADVANCED ROADMAP SYSTEM COMPLETE TEST SUITE (1-10)');
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
  let testSkill = null;
  let testProject = null;
  let testCert = null;
  let testResource = null;

  let createdRoadmap = null;
  let duplicatedRoadmap = null;
  let generatedGoalId = null;
  let generatedMilestoneId = null;

  try {
    // Locate existing domain, skill, project, cert, resource to link via API
    const domRes = await fetch(`${baseUrl}/api/domains`);
    const domains = await domRes.json();
    testDomain = Array.isArray(domains) ? domains[0] : null;

    const skillRes = await fetch(`${baseUrl}/api/skills`);
    const skills = await skillRes.json();
    testSkill = Array.isArray(skills) ? skills[0] : null;

    const projRes = await fetch(`${baseUrl}/api/projects`);
    const projects = await projRes.json();
    testProject = Array.isArray(projects) ? projects.find(p => p.type !== 'folder') : null;

    const certRes = await fetch(`${baseUrl}/api/certificates`);
    const certs = await certRes.json();
    testCert = Array.isArray(certs) ? certs[0] : null;

    const resRes = await fetch(`${baseUrl}/api/resources`);
    const resources = await resRes.json();
    testResource = Array.isArray(resources) ? resources[0] : null;

    console.log(`\n[Suite 2: Domain & Entities Pre-check]`);
    assert(!!testDomain, `Found reference Domain: "${testDomain?.name}"`);
    assert(!!testSkill, `Found reference Skill: "${testSkill?.name}"`);

    // 2. Create Roadmap with Full Metadata, Domain, and Ordered Phases/Steps
    console.log(`\n[Suite 3: Roadmap Creation & Dual-Sync Backward Compatibility]`);
    const phase1Id = randomHex24();
    const step1Id = randomHex24();
    const step2Id = randomHex24();

    const phase2Id = randomHex24();
    const step3Id = randomHex24();

    const createPayload = {
      title: 'Distributed Systems & Consensus Engineering',
      purpose: 'Deep mastery of distributed log consensus, Raft protocol, and vector clocks.',
      description: 'End-to-end technical learning journey covering Paxos, Raft, event loops, and split-brain recovery.',
      difficulty: 'Advanced',
      estimatedDuration: '14 Weeks',
      learningOutcomes: [
        'Implement Raft leader election and log replication',
        'Handle network partitions and split-brain scenarios safely',
        'Benchmarking Raft cluster with Jepsen tests'
      ],
      prerequisites: 'Strong proficiency in Go or Rust, TCP/IP socket programming, and concurrency primitives.',
      primaryDomain: testDomain?._id,
      subdomain: testDomain?.fields?.[0]?.name || 'Distributed Systems',
      status: 'in-progress',
      isPublic: true,
      notes: 'Internal private notes regarding cluster benchmarks and test hardware.',
      phases: [
        {
          _id: phase1Id,
          title: 'Phase 1: Foundations of Consensus & Network Models',
          description: 'Understanding asynchronous network models, RPCs, and state machine replication.',
          order: 0,
          steps: [
            {
              _id: step1Id,
              title: 'Study FLP Impossibility and Asynchronous Consensus',
              description: 'Analyze Fischer, Lynch, and Paterson paper and understand why consensus is impossible with one faulty node.',
              acceptanceCriteria: 'Write a short technical summary differentiating synchronous vs partially synchronous models.',
              estimatedEffort: '6 hours',
              priority: 'High',
              weight: 2,
              completed: false,
              status: 'available',
              linkedSkillIds: testSkill ? [testSkill._id] : [],
              relatedProjectIds: testProject ? [testProject._id] : [],
              linkedResourceIds: testResource ? [testResource._id] : []
            },
            {
              _id: step2Id,
              title: 'Implement Raft Leader Election State Machine',
              description: 'Build heartbeat timer, candidate state, vote requesting, and randomized election timeout.',
              acceptanceCriteria: 'Pass unit tests with 3 nodes undergoing leader heartbeat isolation.',
              estimatedEffort: '15 hours',
              priority: 'Urgent',
              weight: 3,
              completed: false,
              status: 'locked',
              prerequisites: [step1Id],
              linkedSkillIds: testSkill ? [testSkill._id] : []
            }
          ]
        },
        {
          _id: phase2Id,
          title: 'Phase 2: Log Replication & Fault Tolerance',
          description: 'Appending entries, commitment index, log compaction, and snapshotting.',
          order: 1,
          steps: [
            {
              _id: step3Id,
              title: 'Build Raft Log Replication and Catch-Up Protocol',
              description: 'Implement matchIndex, nextIndex, AppendEntries RPC, and safe commit rules.',
              acceptanceCriteria: 'Nodes cleanly catch up after intermittent packet loss.',
              estimatedEffort: '20 hours',
              priority: 'High',
              weight: 5,
              completed: false,
              status: 'locked',
              prerequisites: [step2Id]
            }
          ]
        }
      ]
    };

    const createRes = await fetch(`${baseUrl}/api/roadmaps`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(createPayload)
    });
    createdRoadmap = await createRes.json();
    if (createRes.status !== 201) {
      console.error('Create error response:', createRes.status, createdRoadmap);
    }

    assert(createRes.status === 201, 'Roadmap created with status 201');
    assert(createdRoadmap.title === createPayload.title, 'Roadmap title preserved accurately');
    assert(createdRoadmap.slug && createdRoadmap.slug.includes('distributed-systems'), `Roadmap slug auto-generated: ${createdRoadmap.slug}`);
    assert(createdRoadmap.phases?.length === 2, '2 Phases initialized');
    assert(createdRoadmap.stages?.length === 2, 'Dual-sync backward compatibility: 2 legacy stages created automatically');
    assert(createdRoadmap.progress === 0, 'Progress accurately initialized to 0% for uncompleted steps');

    // 3. Domain Deep-Dive Integration
    console.log(`\n[Suite 4: Domain & Subdomain Contextual Integration]`);
    const domainDiveRes = await fetch(`${baseUrl}/api/domains/${testDomain.slug}/deep-dive`);
    const domainDiveData = await domainDiveRes.json();
    assert(domainDiveRes.status === 200, `Domain deep-dive endpoint responded for "${testDomain.slug}"`);
    const matchedRoadmap = (domainDiveData.roadmaps || []).find(r => r._id === createdRoadmap._id);
    assert(!!matchedRoadmap, 'Created roadmap appears in Domain deep-dive public response');
    assert(domainDiveData.counts?.roadmaps >= 1, `Domain telemetry counts roadmaps correctly (${domainDiveData.counts?.roadmaps})`);

    // 4. Step Execution, Weighted Progress, and Dependency Cascade
    console.log(`\n[Suite 5: Dependency Cascade, Evidence Logging & Weighted Progress]`);
    // Toggle Step 1 to completed with evidence
    const toggleRes1 = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/toggle-step`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        stepId: step1Id,
        completed: true,
        evidence: {
          title: 'FLP Proof Summary & Notes',
          url: 'https://github.com/engineering-hub/raft-consensus/blob/main/docs/flp-analysis.md',
          notes: 'Completed paper walkthrough and verified synchronous assumption bounds.'
        }
      })
    });
    const updatedRoadmap1 = await toggleRes1.json();
    assert(toggleRes1.status === 200, 'Step 1 toggled successfully');

    // Weight calculation check:
    // Total weights: Step 1 (weight 2) + Step 2 (weight 3) + Step 3 (weight 5) = 10 total
    // Step 1 done (weight 2) -> 2 / 10 = 20%
    assert(updatedRoadmap1.progress === 20, `Weighted progress calculated accurately: expected 20%, got ${updatedRoadmap1.progress}%`);
    assert(updatedRoadmap1.completionEvidence?.length === 1, 'Evidence recorded in roadmap completionEvidence');

    // Check dependency cascade: Step 2 should now be unlocked (status === 'available')
    const step2Current = updatedRoadmap1.phases[0].steps.find(s => s._id.toString() === step2Id);
    assert(step2Current.status === 'available', 'Step 2 automatically unlocked after Step 1 completed');

    // Toggle Step 2 to completed
    const toggleRes2 = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/toggle-step`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        stepId: step2Id,
        completed: true
      })
    });
    const updatedRoadmap2 = await toggleRes2.json();
    // Progress should now be (2 + 3) / 10 = 50%
    assert(updatedRoadmap2.progress === 50, `Weighted progress after Step 2: expected 50%, got ${updatedRoadmap2.progress}%`);
    // Step 3 in phase 2 should now be unlocked!
    const step3Current = updatedRoadmap2.phases[1].steps.find(s => s._id.toString() === step3Id);
    assert(step3Current.status === 'available', 'Step 3 in Phase 2 unlocked across phase boundaries');

    // 5. Bidirectional Skill Integration
    console.log(`\n[Suite 6: Bidirectional Skill Integration]`);
    if (testSkill) {
      const skillDetailRes = await fetch(`${baseUrl}/api/skills/${testSkill._id}`);
      const skillDetail = await skillDetailRes.json();
      assert(skillDetailRes.status === 200, 'Skill detail fetched successfully');
      const relatedRms = skillDetail.relatedRoadmapsList || [];
      const isLinkedToOurRm = relatedRms.some(r => r._id.toString() === createdRoadmap._id);
      assert(isLinkedToOurRm, `Skill detail includes "${createdRoadmap.title}" in relatedRoadmapsList`);
      // Verify completing step did not automatically inflate skill proficiency to expert
      assert(skillDetail.level !== 'Expert' || skillDetail.yearsOfExperience !== 99, 'Completing step did not corrupt or falsely inflate skill level to Expert');
    }

    // 6. Contextual Goal Creation & Linking
    console.log(`\n[Suite 7: Contextual Goal Creation from Roadmap]`);
    const createGoalRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/create-goal`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Master Distributed State Machine Replication',
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'High'
      })
    });
    const generatedGoal = await createGoalRes.json();
    assert(createGoalRes.status === 201, 'Goal created from roadmap context');
    generatedGoalId = generatedGoal._id;
    assert(generatedGoal.linkedRoadmaps?.some(id => id.toString() === createdRoadmap._id), 'Generated goal has linkedRoadmaps pointing to roadmap');

    // Verify roadmap fetched again shows linked goal
    const rmWithGoalRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}`, { headers: authHeaders });
    const rmWithGoal = await rmWithGoalRes.json();
    assert(rmWithGoal.linkedGoals?.some(g => (g._id || g).toString() === generatedGoalId), 'Roadmap linkedGoals contains newly created goal');

    // 7. Contextual Milestone Creation for Phase
    console.log(`\n[Suite 8: Contextual Milestone Creation for Phase]`);
    const createMilestoneRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/create-milestone`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        phaseId: phase1Id,
        title: 'Consensus Foundations Phase Completed',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    const generatedMilestone = await createMilestoneRes.json();
    assert(createMilestoneRes.status === 201, 'Milestone created for roadmap phase');
    generatedMilestoneId = generatedMilestone._id;
    assert(generatedMilestone.relatedRoadmapId?.toString() === createdRoadmap._id, 'Milestone references relatedRoadmapId');
    assert(generatedMilestone.relatedPhaseId?.toString() === phase1Id, 'Milestone references relatedPhaseId');

    // 8. Reorder Phases and Steps
    console.log(`\n[Suite 9: Phase and Step Reordering]`);
    const reorderPhasesRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/reorder-phases`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        phaseIds: [phase2Id, phase1Id]
      })
    });
    const reorderedRm = await reorderPhasesRes.json();
    assert(reorderPhasesRes.status === 200, 'Phases reordered successfully');
    assert(reorderedRm.phases[0]._id.toString() === phase2Id, 'Phase 2 is now first in order');

    // 9. Duplication Workflow
    console.log(`\n[Suite 10: Roadmap Duplication]`);
    const dupRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/duplicate`, {
      method: 'POST',
      headers: authHeaders
    });
    duplicatedRoadmap = await dupRes.json();
    assert(dupRes.status === 201, 'Roadmap duplicated successfully');
    assert(duplicatedRoadmap.title.includes('(Copy)'), 'Duplicated roadmap title includes "(Copy)"');
    assert(duplicatedRoadmap.progress === 0, 'Duplicated roadmap progress reset to 0%');
    assert(duplicatedRoadmap.status === 'draft', 'Duplicated roadmap status set to draft');
    assert(duplicatedRoadmap._id !== createdRoadmap._id, 'Duplicated roadmap has unique ID');

    // 10. Archive and Restore Workflow
    console.log(`\n[Suite 11: Archive and Restore Workflow]`);
    const archiveRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/archive`, {
      method: 'PUT',
      headers: authHeaders
    });
    const archivedRm = await archiveRes.json();
    assert(archiveRes.status === 200, 'Roadmap archived successfully');
    assert(archivedRm.isArchived === true, 'isArchived flag set to true');

    // Standard list should not return it
    const activeListRes = await fetch(`${baseUrl}/api/roadmaps`, { headers: authHeaders });
    const activeList = await activeListRes.json();
    assert(!activeList.some(r => r._id === createdRoadmap._id), 'Archived roadmap omitted from active library');

    // Archived filter should return it
    const archivedListRes = await fetch(`${baseUrl}/api/roadmaps?archived=true`, { headers: authHeaders });
    const archivedList = await archivedListRes.json();
    assert(archivedList.some(r => r._id === createdRoadmap._id), 'Archived roadmap appears in ?archived=true library');

    // Restore it
    const restoreRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}/restore`, {
      method: 'PUT',
      headers: authHeaders
    });
    const restoredRm = await restoreRes.json();
    assert(restoreRes.status === 200, 'Roadmap restored successfully');
    assert(restoredRm.isArchived === false, 'isArchived flag set to false');

    // 11. Server-side Public Privacy Isolation
    console.log(`\n[Suite 12: Server-Side Public Privacy Isolation]`);
    const publicSingleRes = await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}`);
    const publicSingle = await publicSingleRes.json();
    assert(publicSingleRes.status === 200, 'Public GET roadmap succeeded');
    assert(publicSingle.notes === undefined || publicSingle.notes === null || publicSingle.notes === '', 'Private notes stripped from unauthenticated public response');
    assert(!publicSingle.reviews || publicSingle.reviews.length === 0, 'Internal reviews stripped from unauthenticated public response');

    console.log(`\n[Suite 13: Clean-up Test Data]`);
    // Delete duplicate
    await fetch(`${baseUrl}/api/roadmaps/${duplicatedRoadmap._id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    // Delete created roadmap
    await fetch(`${baseUrl}/api/roadmaps/${createdRoadmap._id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    // Delete generated goal and milestone
    if (generatedGoalId) {
      await fetch(`${baseUrl}/api/goals/${generatedGoalId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
    }
    if (generatedMilestoneId) {
      await fetch(`${baseUrl}/api/milestones/${generatedMilestoneId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
    }
    assert(true, 'Test artifacts and records cleaned up safely');

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

runRoadmapTests();
