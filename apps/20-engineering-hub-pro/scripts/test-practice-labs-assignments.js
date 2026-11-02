import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'engineering-hub-pro-super-secure-jwt-secret-key-32-chars';

const adminToken = jwt.sign(
  { sub: 'env_admin', username: 'admin', role: 'super_admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
      ...(options.unauthenticated ? {} : { Authorization: `Bearer ${adminToken}` }),
      ...(options.headers || {})
    };

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers
      },
      res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log('🚀 PRACTICE LABS & ASSIGNMENTS FULL VERIFICATION TEST SUITE');
  console.log('======================================================================\n');

  // STEP 1: Fetch Domains to use real IDs
  console.log('👉 STEP 1: Fetching available domains and subdomains...');
  const domRes = await request('/api/domains');
  assert(domRes.status === 200, 'Domains endpoint reachable');
  const domains = domRes.data || [];
  assert(domains.length > 0, `Found ${domains.length} active domain(s) in system`);

  const primaryDom = domains[0];
  const primarySubdomains = (primaryDom.fields || []).slice(0, 2).map(f => f._id);
  const secondaryDom = domains[1] || domains[0];
  const secondarySubdomains = (secondaryDom.fields || []).slice(0, 1).map(f => f._id);

  console.log(`   Selected Domain A: "${primaryDom.name}" with ${primarySubdomains.length} subdomains`);
  console.log(`   Selected Domain B: "${secondaryDom.name}" with ${secondarySubdomains.length} subdomains`);

  // STEP 2: Fetch roadmaps, skills, resources for relationship linking
  console.log('\n👉 STEP 2: Fetching existing roadmaps, skills, resources for relationships...');
  const [roadmapsRes, skillsRes, resourcesRes] = await Promise.all([
    request('/api/roadmaps').catch(() => ({ data: [] })),
    request('/api/skills').catch(() => ({ data: [] })),
    request('/api/resources').catch(() => ({ data: [] }))
  ]);

  const roadmaps = roadmapsRes.data || [];
  const skills = skillsRes.data || [];
  const resources = resourcesRes.data || [];

  const sampleRoadmapId = roadmaps[0]?._id;
  const sampleSkillId = skills[0]?._id;
  const sampleResourceId = resources[0]?._id;
  console.log(`   Available entities for linking: Roadmaps (${roadmaps.length}), Skills (${skills.length}), Resources (${resources.length})`);

  // =====================================================================
  // PRACTICE LABS TESTS
  // =====================================================================
  console.log('\n======================================================================');
  console.log('🔬 PART A: PRACTICE LABS MODULE VERIFICATION');
  console.log('======================================================================');

  // TEST 1: Create Practice Lab with Multi-Domain Associations
  console.log('\n👉 TEST 1: Creating Practice Lab with multi-domain & multi-subdomain associations...');
  const labPayload = {
    title: 'Automated Container Health Probing & Restart Simulation',
    shortDescription: 'Configure liveness/readiness probes and build automated container restart watchers with Docker & Bash.',
    detailedDescription: '# Container Probing Lab\n\nThis lab simulates deadlocks and verifies automatic recovery mechanics.',
    learningObjective: 'Master automated container lifecycle probing, failure detection, and health checks.',
    difficulty: 'Intermediate',
    labType: 'Simulation',
    estimatedDuration: '45 mins',
    priority: 'High',
    status: 'In Progress',
    domainAssociations: [
      { domainId: primaryDom._id, subdomainIds: primarySubdomains },
      { domainId: secondaryDom._id, subdomainIds: secondarySubdomains }
    ],
    technologies: ['Docker', 'Bash', 'Linux', 'cURL'],
    operatingSystem: 'Ubuntu 22.04 LTS / Alpine',
    requiredEnvironment: 'Docker Engine 24+ & Bash 5.0',
    commands: [
      { command: 'docker run -d --name test-probe alpine sleep 3600', description: 'Run test container' },
      { command: 'docker inspect --format "{{.State.Health.Status}}" test-probe', description: 'Query health status' }
    ],
    tasks: [
      { title: 'Provision docker sandbox container', description: 'Create baseline daemon container', completed: false },
      { title: 'Implement bash health-check script', description: 'Write healthcheck.sh with exit codes', completed: false },
      { title: 'Inject artificial HTTP 503 latency', description: 'Simulate server freeze and verify restart', completed: false }
    ],
    personalNotes: 'Confidential engineering notes: Probing interval should not drop below 2 seconds.',
    learningReflection: 'Probes must be carefully tuned to prevent cascading restart storms in production.',
    relatedRoadmaps: sampleRoadmapId ? [sampleRoadmapId] : [],
    relatedSkills: sampleSkillId ? [sampleSkillId] : [],
    relatedResources: sampleResourceId ? [sampleResourceId] : []
  };

  const createLabRes = await request('/api/practice-labs', {
    method: 'POST',
    body: labPayload
  });

  if (createLabRes.status !== 201) {
    console.error('Create Lab Error Payload:', JSON.stringify(createLabRes.data, null, 2));
  }
  assert(createLabRes.status === 201, `Practice Lab created successfully (Status ${createLabRes.status})`);
  const createdLab = createLabRes.data;
  assert(createdLab._id, `Lab received database ID: ${createdLab._id}`);
  assert(createdLab.domainAssociations.length === 2, 'Lab has 2 domain associations preserved');
  assert(
    String(createdLab.primaryDomain) === String(primaryDom._id) ||
    String(createdLab.primaryDomain?._id) === String(primaryDom._id),
    'Bidirectional legacy primaryDomain synchronization verified'
  );
  console.log(`   Lab ID: ${createdLab.labId || 'N/A'}, Slug: ${createdLab.slug}`);

  // TEST 2: First-class Markdown Document Management on Practice Lab
  console.log('\n👉 TEST 2: Managing First-Class Markdown (.md) documents on Lab...');
  const mdPayload = {
    title: 'Lab Execution Guide',
    fileName: 'lab-instructions.md',
    content: `# Lab Execution Guide\n\n## 1. Setup Phase\nRun \`docker-compose up -d\`.\n\n## 2. Verification Checklist\n- [x] Container spun up\n- [ ] Probes firing correctly`
  };

  const addDocRes = await request(`/api/practice-labs/${createdLab._id}/markdown`, {
    method: 'POST',
    body: mdPayload
  });
  assert(addDocRes.status === 201, `Markdown document created on lab (Status ${addDocRes.status})`);
  assert(addDocRes.data.id, 'Markdown document returned with unique ID');
  const docId = addDocRes.data.id;

  // Edit and save Markdown file
  const updateDocRes = await request(`/api/practice-labs/${createdLab._id}/markdown/${docId}`, {
    method: 'PUT',
    body: {
      title: 'Lab Execution Guide (Updated)',
      fileName: 'lab-instructions.md',
      content: `# Lab Execution Guide (v2)\n\nAdded automated rollback verification instructions.`
    }
  });
  assert(updateDocRes.status === 200, `Markdown document edited and saved (Status ${updateDocRes.status})`);
  assert(updateDocRes.data.content.includes('(v2)'), 'Updated markdown content verified');

  // TEST 3: Toggle Task & Verify Progress Calculation
  console.log('\n👉 TEST 3: Toggling Lab tasks and testing automated completion percentage...');
  const firstTaskId = createdLab.tasks[0]?.id || createdLab.tasks[0]?._id;
  const toggleTaskRes = await request(`/api/practice-labs/${createdLab._id}/toggle-task`, {
    method: 'PUT',
    body: { taskId: firstTaskId, completed: true }
  });
  assert(toggleTaskRes.status === 200, 'Task toggled successfully');
  // 1 out of 3 tasks completed = 33%
  assert(toggleTaskRes.data.completionPercentage === 33, `Completion percentage computed to: ${toggleTaskRes.data.completionPercentage}%`);

  // TEST 4: Add Lab Practical Evidence
  console.log('\n👉 TEST 4: Logging practical evidence on Lab...');
  const evidenceRes = await request(`/api/practice-labs/${createdLab._id}/evidence`, {
    method: 'POST',
    body: {
      title: 'Terminal Screenshot & Log Dump',
      evidenceType: 'Log Output',
      description: 'Captured systemd journal output showing successful restart upon probe failure.',
      url: 'https://raw.githubusercontent.com/evidence/restart-probe.log'
    }
  });
  assert(evidenceRes.status === 201, `Evidence logged successfully (Status ${evidenceRes.status})`);
  assert(
    (Array.isArray(evidenceRes.data) ? evidenceRes.data.length : evidenceRes.data.evidence?.length) === 1,
    'Evidence records array has 1 entry'
  );

  // TEST 5: Verify Privacy of Personal Notes
  console.log('\n👉 TEST 5: Verifying private notes are stripped in unauthenticated public responses...');
  const publicLabRes = await request(`/api/practice-labs/${createdLab._id}`, {
    unauthenticated: true
  });
  assert(publicLabRes.status === 200, 'Public lab endpoint returned 200');
  assert(!publicLabRes.data.personalNotes, 'personalNotes field is properly hidden from unauthenticated visitors');

  // TEST 6: Duplicate Practice Lab
  console.log('\n👉 TEST 6: Testing Lab Duplication...');
  const dupLabRes = await request(`/api/practice-labs/${createdLab._id}/duplicate`, {
    method: 'POST'
  });
  assert(dupLabRes.status === 201, `Lab duplicated successfully (Status ${dupLabRes.status})`);
  assert(dupLabRes.data.title.includes('(Copy)'), 'Duplicated lab title contains "(Copy)"');
  // Cleanup duplicate
  await request(`/api/practice-labs/${dupLabRes.data._id}`, { method: 'DELETE' });
  console.log('   Duplicated test lab cleaned up');

  // =====================================================================
  // ASSIGNMENTS MODULE TESTS
  // =====================================================================
  console.log('\n======================================================================');
  console.log('📋 PART B: ASSIGNMENTS MODULE VERIFICATION');
  console.log('======================================================================');

  // TEST 7: Create Assignment with Multi-Domain Associations
  console.log('\n👉 TEST 7: Creating Assignment with multi-domain associations, rubric, & deliverables...');
  const assignmentPayload = {
    title: 'Automated Multi-Region Infrastructure Deployment Script',
    shortDescription: 'Build a production-grade Bash automation tool to audit, deploy, and verify infrastructure health across multiple availability zones.',
    detailedDescription: '# Infrastructure Deployment Assignment\n\nDeliver a fully automated shell utility with error handling, logging, and idempotency.',
    objective: 'Demonstrate advanced shell automation, API integrations, and robust operational scripting.',
    assignmentType: 'Practical',
    difficulty: 'Advanced',
    estimatedDuration: '4 hours',
    priority: 'Urgent',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    domainAssociations: [
      { domainId: primaryDom._id, subdomainIds: primarySubdomains },
      { domainId: secondaryDom._id, subdomainIds: secondarySubdomains }
    ],
    tasks: [
      { title: 'Define CLI flags & argument parser', description: 'Support --dry-run, --region, and --verbose', completed: true },
      { title: 'Implement idempotency checks', description: 'Prevent duplicate provisioning if resources exist', completed: false },
      { title: 'Write automated integration test', description: 'Run test suite inside isolated Docker container', completed: false }
    ],
    technicalRequirements: ['Bash 5.0+', 'POSIX Compliant Syntax', 'Zero external unvetted dependencies'],
    expectedDeliverables: ['Source Code', 'GitHub Repository', 'README Documentation', 'PDF Report'],
    rubric: '### Grading Rubric\n- Code modularity: 30%\n- Idempotency & Error Handling: 40%\n- Documentation & Logs: 30%',
    maxMarks: 100,
    privateNotes: 'Evaluation criteria must penalize hardcoded credentials severely.'
  };

  const createAssignRes = await request('/api/assignments', {
    method: 'POST',
    body: assignmentPayload
  });
  if (createAssignRes.status !== 201) {
    console.error('Create Assignment Error Payload:', JSON.stringify(createAssignRes.data, null, 2));
  }
  assert(createAssignRes.status === 201, `Assignment created successfully (Status ${createAssignRes.status})`);
  const createdAssignment = createAssignRes.data;
  assert(createdAssignment._id, `Assignment received database ID: ${createdAssignment._id}`);
  assert(createdAssignment.domainAssociations.length === 2, 'Assignment has 2 domain associations preserved');
  console.log(`   Assignment ID: ${createdAssignment.assignmentId || 'N/A'}, Slug: ${createdAssignment.slug}`);

  // TEST 8: Markdown Documentation on Assignment
  console.log('\n👉 TEST 8: Adding first-class Markdown file to Assignment...');
  const assignDocRes = await request(`/api/assignments/${createdAssignment._id}/markdown`, {
    method: 'POST',
    body: {
      title: 'Assignment Brief & Constraints',
      fileName: 'assignment-brief.md',
      content: `# Technical Brief\n\n## Constraints\n- Maximum memory usage: 128MB\n- Must exit with standard POSIX status codes.`
    }
  });
  assert(assignDocRes.status === 201, `Markdown document added to assignment (Status ${assignDocRes.status})`);
  assert(assignDocRes.data.id, 'Assignment markdown document created with ID');

  // TEST 9: Multi-Version Submissions System (v1 & v2)
  console.log('\n👉 TEST 9: Submitting deliverable (v1)...');
  const submitV1Res = await request(`/api/assignments/${createdAssignment._id}/submit`, {
    method: 'POST',
    body: {
      githubUrl: 'https://github.com/engineer/infra-deployer/tree/v1.0.0',
      liveUrl: 'https://demo.infra-deployer.internal',
      textResponse: 'Completed initial implementation. Passes all standard test fixtures.',
      notes: 'Initial submission for technical review.'
    }
  });
  assert([200, 201].includes(submitV1Res.status), `Deliverable v1 submitted (Status ${submitV1Res.status})`);
  assert(submitV1Res.data.status === 'Submitted', 'Assignment status changed to "Submitted"');
  assert(submitV1Res.data.submissions.length === 1, 'Submissions array has 1 entry');
  assert(submitV1Res.data.submissions[0].version === 1, 'First submission tagged as version 1');

  console.log('\n👉 TEST 10: Resubmitting updated deliverable (v2)...');
  const submitV2Res = await request(`/api/assignments/${createdAssignment._id}/submit`, {
    method: 'POST',
    body: {
      githubUrl: 'https://github.com/engineer/infra-deployer/tree/v1.1.0',
      liveUrl: 'https://demo.infra-deployer.internal',
      textResponse: 'Updated implementation: Added idempotency checks and improved logging format.',
      notes: 'Revised submission resolving edge cases.'
    }
  });
  assert([200, 201].includes(submitV2Res.status), `Deliverable v2 submitted (Status ${submitV2Res.status})`);
  assert(submitV2Res.data.submissions.length === 2, 'Submissions history preserved 2 versions');
  assert(submitV2Res.data.submissions[1].version === 2, 'Second submission tagged as version 2');
  console.log(`   Submission history versions: v${submitV2Res.data.submissions[0].version} and v${submitV2Res.data.submissions[1].version} intact`);

  // TEST 11: Assignment Evaluation & Rubric Feedback
  console.log('\n👉 TEST 11: Evaluating Assignment with rubric score and feedback...');
  const evalRes = await request(`/api/assignments/${createdAssignment._id}/evaluate`, {
    method: 'PUT',
    body: {
      obtainedMarks: 96,
      maxMarks: 100,
      feedback: 'Outstanding technical submission. Idempotency guarantees are rock-solid and the CLI interface is intuitive.',
      reviewComments: 'Code architecture is clean. Minor improvement possible in handling SIGINT trap signals.',
      status: 'Reviewed'
    }
  });
  assert(evalRes.status === 200, `Assignment evaluated successfully (Status ${evalRes.status})`);
  assert(evalRes.data.obtainedMarks === 96, 'Obtained marks recorded as 96');
  assert(evalRes.data.percentage === 96, 'Percentage calculated as 96%');
  assert(evalRes.data.status === 'Reviewed', 'Status updated to Reviewed');

  // TEST 12: Privacy of Assignment Notes
  console.log('\n👉 TEST 12: Verifying private notes on assignments are hidden from public...');
  const publicAssignRes = await request(`/api/assignments/${createdAssignment._id}`, {
    unauthenticated: true
  });
  assert(publicAssignRes.status === 200, 'Public assignment endpoint returned 200');
  assert(!publicAssignRes.data.privateNotes, 'privateNotes field is hidden from unauthenticated visitors');

  // TEST 13: Multi-Domain Query Filtering
  console.log('\n👉 TEST 13: Verifying multi-domain query filtering on both modules...');
  const filteredLabsRes = await request(`/api/practice-labs?domainId=${primaryDom._id}`);
  assert(filteredLabsRes.status === 200, 'Practice labs filtered by domain');
  const labFound = filteredLabsRes.data.some(l => String(l._id) === String(createdLab._id));
  assert(labFound, 'Created lab returned when filtering by associated domain');

  const filteredAssignRes = await request(`/api/assignments?domainId=${primaryDom._id}`);
  assert(filteredAssignRes.status === 200, 'Assignments filtered by domain');
  const assignFound = filteredAssignRes.data.some(a => String(a._id) === String(createdAssignment._id));
  assert(assignFound, 'Created assignment returned when filtering by associated domain');

  // TEST 14: Duplicate Assignment
  console.log('\n👉 TEST 14: Testing Assignment Duplication...');
  const dupAssignRes = await request(`/api/assignments/${createdAssignment._id}/duplicate`, {
    method: 'POST'
  });
  assert(dupAssignRes.status === 201, `Assignment duplicated successfully (Status ${dupAssignRes.status})`);
  assert(dupAssignRes.data.title.includes('(Copy)'), 'Duplicated assignment title contains "(Copy)"');
  await request(`/api/assignments/${dupAssignRes.data._id}`, { method: 'DELETE' });
  console.log('   Duplicated test assignment cleaned up');

  console.log('\n======================================================================');
  console.log('🎉 ALL 14 TEST STEPS PASSED SUCCESSFULLY! BOTH MODULES FULLY OPERATIONAL');
  console.log('======================================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
