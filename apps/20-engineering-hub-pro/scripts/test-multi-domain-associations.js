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
      Authorization: `Bearer ${adminToken}`,
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

async function runTests() {
  console.log('================================================================');
  console.log('  MULTI-DOMAIN & MULTI-SUBDOMAIN VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  const cleanupGoals = [];
  const cleanupRoadmaps = [];

  try {
    // 0. Fetch available domains
    console.log('[Setup] Fetching available engineering domains...');
    const domRes = await request('/api/domains?all=true');
    assert(domRes.status === 200, 'GET /api/domains returns HTTP 200');
    const domains = domRes.data;
    assert(Array.isArray(domains) && domains.length >= 2, 'Found at least 2 domains in database');

    const domA = domains.find(d => d.fields && d.fields.length >= 2) || domains[0];
    const domB = domains.find(d => d._id !== domA._id && d.fields && d.fields.length >= 1) || domains[1];

    console.log(`  Domain A: "${domA.name}" (ID: ${domA._id}, ${domA.fields?.length || 0} subdomains)`);
    console.log(`  Domain B: "${domB.name}" (ID: ${domB._id}, ${domB.fields?.length || 0} subdomains)\n`);

    const subA1 = domA.fields[0]._id;
    const subA2 = domA.fields[1]._id;
    const subB1 = domB.fields[0]._id;

    // 1. Goal with 1 domain and multiple subdomains
    console.log('[Test 1] Create Goal with 1 domain and multiple subdomains');
    const goal1Res = await request('/api/goals', {
      method: 'POST',
      body: {
        title: 'AutoTest Goal 1: Single Domain Multi Subdomain',
        category: domA.name,
        timeHorizon: 'Strategic Goal',
        priority: 'High',
        domainAssociations: [
          { domainId: domA._id, subdomainIds: [subA1, subA2] }
        ]
      }
    });
    if (goal1Res.status !== 201) {
      console.error('Goal 1 error response:', goal1Res.status, goal1Res.data);
    }
    assert(goal1Res.status === 201, 'POST /api/goals returns HTTP 201 Created');
    const g1 = goal1Res.data;
    cleanupGoals.push(g1._id);
    assert(g1.domainAssociations.length === 1, 'Goal has exactly 1 domain association');
    assert(g1.domainAssociations[0].subdomainIds.length === 2, 'Goal has 2 subdomain IDs associated');
    assert(g1.domainAssociations[0].subdomains.length === 2, 'Goal has 2 enriched subdomains with names and slugs');
    assert(String(g1.primaryDomain?._id || g1.primaryDomain) === String(domA._id), 'Legacy primaryDomain is correctly synced to domain A');
    assert(String(g1.subdomainId) === String(subA1), 'Legacy subdomainId is correctly synced to first subdomain');
    console.log('  Passed Test 1.\n');

    // 2. Goal with multiple domains, each with multiple subdomains
    console.log('[Test 2] Create Goal with multiple domains, each with subdomains');
    const goal2Res = await request('/api/goals', {
      method: 'POST',
      body: {
        title: 'AutoTest Goal 2: Multi Domain Multi Subdomain',
        category: domA.name,
        timeHorizon: 'Strategic Goal',
        priority: 'High',
        domainAssociations: [
          { domainId: domA._id, subdomainIds: [subA1, subA2] },
          { domainId: domB._id, subdomainIds: [subB1] }
        ]
      }
    });
    assert(goal2Res.status === 201, 'POST /api/goals returns HTTP 201 Created');
    const g2 = goal2Res.data;
    cleanupGoals.push(g2._id);
    assert(g2.domainAssociations.length === 2, 'Goal has 2 domain associations');
    assert(g2.domainAssociations[0].subdomainIds.length === 2, 'Domain A has 2 subdomains');
    assert(g2.domainAssociations[1].subdomainIds.length === 1, 'Domain B has 1 subdomain');
    assert(String(g2.primaryDomain?._id || g2.primaryDomain) === String(domA._id), 'Legacy primaryDomain synced to Domain A');
    assert(Array.isArray(g2.secondaryDomains) && g2.secondaryDomains.some(sd => String(sd?._id || sd) === String(domB._id)), 'Legacy secondaryDomains contains Domain B');
    console.log('  Passed Test 2.\n');

    // 3. Goal with a domain that has no subdomains selected
    console.log('[Test 3] Create Goal with domain but NO subdomains');
    const goal3Res = await request('/api/goals', {
      method: 'POST',
      body: {
        title: 'AutoTest Goal 3: Domain with No Subdomains',
        category: domA.name,
        timeHorizon: 'Short-term Goal',
        priority: 'Normal',
        domainAssociations: [
          { domainId: domA._id, subdomainIds: [] }
        ]
      }
    });
    assert(goal3Res.status === 201, 'POST /api/goals returns HTTP 201 Created');
    const g3 = goal3Res.data;
    cleanupGoals.push(g3._id);
    assert(g3.domainAssociations.length === 1, 'Goal has 1 domain association');
    assert(g3.domainAssociations[0].subdomainIds.length === 0, 'Domain association has 0 subdomains');
    console.log('  Passed Test 3.\n');

    // 4. Attempt to assign a subdomain to the wrong parent domain (Must be rejected with 400)
    console.log('[Test 4] Attempting to assign Domain B subdomain to Domain A (Strict 400 rejection)');
    const invalidGoalRes = await request('/api/goals', {
      method: 'POST',
      body: {
        title: 'AutoTest Goal 4: Invalid Subdomain Assignment',
        category: domA.name,
        domainAssociations: [
          { domainId: domA._id, subdomainIds: [subB1] } // subB1 belongs to domB, NOT domA
        ]
      }
    });
    assert(invalidGoalRes.status === 400, `Rejected with HTTP 400 Bad Request (Actual: ${invalidGoalRes.status})`);
    assert(
      (invalidGoalRes.data.message || '').includes('does not belong to domain') || (invalidGoalRes.data.message || '').includes('Invalid'),
      `Validation returned clear error message: "${invalidGoalRes.data.message}"`
    );
    console.log('  Passed Test 4.\n');

    // 5. Create a Roadmap with multiple domains and subdomains
    console.log('[Test 5] Create Roadmap with multiple domains and subdomains');
    const testSlug = `autotest-roadmap-${Date.now()}`;
    const roadmapRes = await request('/api/roadmaps', {
      method: 'POST',
      body: {
        title: 'AutoTest Roadmap 5: Cross-Domain Architecture',
        slug: testSlug,
        category: domA.name,
        difficulty: 'Advanced',
        domainAssociations: [
          { domainId: domA._id, subdomainIds: [subA1] },
          { domainId: domB._id, subdomainIds: [subB1] }
        ],
        phases: [
          {
            title: 'Phase 1: Foundations',
            order: 1,
            steps: [
              {
                title: 'Step 1.1: Core Blueprint',
                completed: false,
                status: 'available',
                weight: 1
              }
            ]
          }
        ]
      }
    });
    assert(roadmapRes.status === 201, 'POST /api/roadmaps returns HTTP 201 Created');
    const rm = roadmapRes.data;
    cleanupRoadmaps.push(rm._id);
    assert(rm.domainAssociations.length === 2, 'Roadmap has 2 domain associations');
    assert(String(rm.primaryDomain?._id || rm.primaryDomain) === String(domA._id), 'Legacy primaryDomain populated with Domain A');
    assert(rm.phases.length === 1 && rm.phases[0].steps.length === 1, 'Roadmap phases and steps properly created');
    console.log('  Passed Test 5.\n');

    // 6. Update existing Roadmap without losing phase/step progress
    console.log('[Test 6] Update Roadmap associations without losing phase/step progress');
    const updateRmRes = await request(`/api/roadmaps/${rm._id}`, {
      method: 'PUT',
      body: {
        ...rm,
        title: 'AutoTest Roadmap 5: Cross-Domain Architecture (Updated)',
        domainAssociations: [
          { domainId: domA._id, subdomainIds: [subA1, subA2] }, // Added subA2
          { domainId: domB._id, subdomainIds: [subB1] }
        ]
      }
    });
    assert(updateRmRes.status === 200, 'PUT /api/roadmaps/:id returns HTTP 200 OK');
    const updatedRm = updateRmRes.data;
    assert(updatedRm.domainAssociations[0].subdomainIds.length === 2, 'Domain A now has 2 subdomains');
    assert(updatedRm.phases.length === 1, 'Phase count preserved');
    assert(updatedRm.phases[0].steps[0].title === 'Step 1.1: Core Blueprint', 'Step details and progress preserved');
    console.log('  Passed Test 6.\n');

    // 7. Filter Goals by primary domain and subdomain
    console.log('[Test 7] Filter Goals by domain and subdomain');
    const filterGoalDomRes = await request(`/api/goals?domainId=${domA._id}`);
    assert(filterGoalDomRes.status === 200, 'GET /api/goals?domainId=... returns HTTP 200');
    assert(
      filterGoalDomRes.data.some(g => g._id === g1._id),
      'Filtered goals by domainId contains Goal 1'
    );

    const filterGoalSubRes = await request(`/api/goals?subdomainId=${subA2}`);
    assert(filterGoalSubRes.status === 200, 'GET /api/goals?subdomainId=... returns HTTP 200');
    assert(
      filterGoalSubRes.data.some(g => g._id === g1._id),
      'Filtered goals by subdomainId contains Goal 1'
    );
    console.log('  Passed Test 7.\n');

    // 8. Filter Roadmaps by primary domain and subdomain
    console.log('[Test 8] Filter Roadmaps by domain and subdomain');
    const filterRmDomRes = await request(`/api/roadmaps?domainId=${domA._id}`);
    assert(filterRmDomRes.status === 200, 'GET /api/roadmaps?domainId=... returns HTTP 200');
    assert(
      filterRmDomRes.data.some(r => r._id === rm._id),
      'Filtered roadmaps by domainId contains test roadmap'
    );

    const filterRmSubRes = await request(`/api/roadmaps?subdomainId=${subA1}`);
    assert(filterRmSubRes.status === 200, 'GET /api/roadmaps?subdomainId=... returns HTTP 200');
    assert(
      filterRmSubRes.data.some(r => r._id === rm._id),
      'Filtered roadmaps by subdomainId contains test roadmap'
    );
    console.log('  Passed Test 8.\n');

    // 9. Legacy compatibility check
    console.log('[Test 9] Legacy compatibility verification');
    const singleGoalRes = await request(`/api/goals/${g1._id}`);
    assert(singleGoalRes.status === 200, 'GET /api/goals/:id returns HTTP 200');
    const sg = singleGoalRes.data;
    assert(sg.primaryDomain !== undefined, 'Single goal response contains legacy primaryDomain');
    assert(sg.subdomainId !== undefined, 'Single goal response contains legacy subdomainId');
    assert(Array.isArray(sg.domainAssociations), 'Single goal response contains domainAssociations array');

    const singleRmRes = await request(`/api/roadmaps/${rm._id}`);
    assert(singleRmRes.status === 200, 'GET /api/roadmaps/:id returns HTTP 200');
    const srm = singleRmRes.data;
    assert(srm.primaryDomain !== undefined, 'Single roadmap response contains legacy primaryDomain');
    assert(Array.isArray(srm.domainAssociations), 'Single roadmap response contains domainAssociations array');
    console.log('  Passed Test 9.\n');

    console.log('================================================================');
    console.log('  ALL 9 MULTI-DOMAIN ASSOCIATION TESTS PASSED SUCCESSFULLY! ✅');
    console.log('================================================================');
  } finally {
    // Cleanup created test records
    console.log('\n[Cleanup] Cleaning up created test entities...');
    for (const id of cleanupGoals) {
      await request(`/api/goals/${id}`, { method: 'DELETE' });
    }
    for (const id of cleanupRoadmaps) {
      await request(`/api/roadmaps/${id}`, { method: 'DELETE' });
    }
    console.log(`Cleaned up ${cleanupGoals.length} test goals and ${cleanupRoadmaps.length} test roadmaps.`);
  }
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
