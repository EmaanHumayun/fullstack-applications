import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../server/middleware/auth.js';

const API_BASE = 'http://localhost:5000/api';
const token = jwt.sign(
  { sub: 'env_admin', role: 'super_admin', email: 'admin@engineeringhub.dev' },
  getJwtSecret(),
  { expiresIn: '2h' }
);

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

async function run() {
  console.log('--- STARTING COMPREHENSIVE RESOURCES LIBRARY E2E VERIFICATION ---\n');
  let failures = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failures++;
    }
  }

  try {
    // 1. Analytics Check
    console.log('=== 1. Testing GET /api/resources/analytics ===');
    const analyticsRes = await fetch(`${API_BASE}/resources/analytics`, { headers });
    assert(analyticsRes.status === 200, 'Analytics returns status 200');
    const analytics = await analyticsRes.json();
    assert(typeof analytics.total === 'number', 'Analytics returns total count');
    assert(analytics.byType && analytics.byStatus, 'Analytics returns breakdown groups');

    // 2. Fetch existing skills/projects to link
    const skillsRes = await fetch(`${API_BASE}/skills?all=true`, { headers });
    const skills = await skillsRes.json();
    const testSkill = skills[0];

    const projectsRes = await fetch(`${API_BASE}/projects?all=true`, { headers });
    const projects = await projectsRes.json();
    const testProject = projects[0];

    // 3. Create Resource
    console.log('\n=== 2. Testing POST /api/resources (Create Resource) ===');
    const createRes = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Designing Data-Intensive Applications (Martin Kleppmann)',
        summary: 'The definitive guide to distributed databases, replication, partitioning, and stream processing.',
        description: 'Comprehensive architectural guide covering transactions, batch processing, consensus, and fault-tolerant system design.',
        url: 'https://dataintensive.net',
        type: 'Books and ebooks',
        provider: "O'Reilly Media",
        author: 'Martin Kleppmann',
        difficulty: 'Advanced',
        status: 'Learning',
        priority: 'High',
        rating: 5,
        isFavorite: true,
        tags: ['distributed-systems', 'databases', 'consensus', 'scalability'],
        domainName: 'Databases and Data Engineering',
        subdomain: 'Distributed Consensus & Replication',
        relatedSkills: testSkill ? [testSkill._id] : [],
        relatedProjects: testProject ? [testProject._id] : [],
        notes: 'Chapter 5 & 6 notes on Raft/Paxos consensus models.',
        intendedOutcome: 'Master partition tolerance and linearizable storage guarantees.',
        estimatedDuration: '40 hours'
      })
    });

    assert(createRes.status === 201, 'Create Resource status 201');
    const created = await createRes.json();
    const resourceId = created._id;
    assert(resourceId && created.title.includes('Data-Intensive'), 'Resource ID and Title persisted correctly');
    assert(created.isFavorite === true, 'isFavorite persisted as true');
    assert(created.priority === 'High', 'Priority persisted as High');
    assert(created.tags.includes('distributed-systems'), 'Tags persisted as array');
    if (testSkill) {
      assert(created.relatedSkills && created.relatedSkills.length > 0, 'relatedSkills relationship populated');
    }

    // 4. Read Resource by ID
    console.log('\n=== 3. Testing GET /api/resources/:id ===');
    const getRes = await fetch(`${API_BASE}/resources/${resourceId}`, { headers });
    assert(getRes.status === 200, 'GET by ID returns 200');
    const fetched = await getRes.json();
    assert(fetched._id === resourceId, 'Fetched resource ID matches');
    assert(fetched.provider === "O'Reilly Media", 'Provider metadata matches');

    // 5. Query Filtering & Search
    console.log('\n=== 4. Testing Multi-Filter & Search Queries ===');
    // Search query
    const searchRes = await fetch(`${API_BASE}/resources?search=Kleppmann`, { headers });
    const searchItems = await searchRes.json();
    assert(searchItems.some(r => r._id === resourceId), 'Search by author/text returns resource');

    // Priority filter
    const priorityRes = await fetch(`${API_BASE}/resources?priority=High`, { headers });
    const priorityItems = await priorityRes.json();
    assert(priorityItems.every(r => r.priority === 'High'), 'Priority filter returns only High priority');

    // Status filter
    const statusRes = await fetch(`${API_BASE}/resources?status=Learning`, { headers });
    const statusItems = await statusRes.json();
    assert(statusItems.some(r => r._id === resourceId), 'Status filter returns matching resources');

    // Favorites filter
    const favRes = await fetch(`${API_BASE}/resources?favorite=true`, { headers });
    const favItems = await favRes.json();
    assert(favItems.some(r => r._id === resourceId && r.isFavorite), 'Favorite filter returns favorites');

    // 6. Update Resource
    console.log('\n=== 5. Testing PUT /api/resources/:id (Update) ===');
    const updateRes = await fetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: 'Completed',
        notes: 'Completed all 12 chapters with production architecture blueprints.',
        rating: 5
      })
    });
    assert(updateRes.status === 200, 'Update status 200');
    const updated = await updateRes.json();
    assert(updated.status === 'Completed', 'Status updated to Completed');
    assert(updated.notes.includes('Completed all 12 chapters'), 'Notes updated in database');

    // 7. Safe Unlinking
    if (testSkill) {
      console.log('\n=== 6. Testing PATCH /api/resources/:id/unlink ===');
      const unlinkRes = await fetch(`${API_BASE}/resources/${resourceId}/unlink`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          targetType: 'skill',
          targetId: String(testSkill._id)
        })
      });
      assert(unlinkRes.status === 200, 'Unlink skill returned 200');
      const unlinked = await unlinkRes.json();
      assert(!unlinked.relatedSkills.some(s => String(s._id || s) === String(testSkill._id)), 'Skill unlinked from resource');
      // Confirm resource still exists!
      const checkRes = await fetch(`${API_BASE}/resources/${resourceId}`, { headers });
      assert(checkRes.status === 200, 'Resource still exists after unlinking');
    }

    // 8. Delete Resource
    console.log('\n=== 7. Testing DELETE /api/resources/:id ===');
    const deleteRes = await fetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'DELETE',
      headers
    });
    assert(deleteRes.status === 200, 'Delete status 200');
    const deleteData = await deleteRes.json();
    assert(deleteData.ok === true, 'Delete returns ok: true');

    // Verify record is gone from DB
    const verifyDeleteRes = await fetch(`${API_BASE}/resources/${resourceId}`, { headers });
    assert(verifyDeleteRes.status === 404, 'Deleted resource returns 404 on subsequent GET');

    // Verify linked skill and project were NOT deleted
    if (testSkill) {
      const skillCheck = await fetch(`${API_BASE}/skills/${testSkill._id}`, { headers });
      assert(skillCheck.status === 200, 'Unrelated linked skill remains intact after resource deletion');
    }
    if (testProject) {
      const projCheck = await fetch(`${API_BASE}/projects/${testProject._id || testProject.slug}`, { headers });
      assert(projCheck.status === 200, 'Unrelated linked project remains intact after resource deletion');
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failures++;
  }

  console.log(`\n--- E2E TEST SUMMARY: ${failures === 0 ? 'ALL TESTS PASSED (100%)' : `${failures} FAILURES`} ---`);
  process.exit(failures === 0 ? 0 : 1);
}

run();
