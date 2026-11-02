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
  console.log('--- STARTING COMPREHENSIVE CRUD VERIFICATION ---\n');
  let failures = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failures++;
    }
  }

  // ==========================================
  // 1. SKILLS CRUD
  // ==========================================
  console.log('=== 1. Testing SKILLS CRUD ===');
  // Create Skill 1
  const skillRes1 = await fetch(`${API_BASE}/skills`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'E2E Rust Systems Programming',
      category: 'Languages',
      level: 'Advanced',
      proficiencyPercentage: 85,
      status: 'Practising',
      description: 'Systems level programming in Rust with memory safety',
      visibility: 'public'
    })
  });
  assert(skillRes1.status === 201, 'Skill 1 Created (Status 201)');
  const skill1 = await skillRes1.json();
  const skillId = skill1._id;
  assert(skillId && skill1.name === 'E2E Rust Systems Programming', 'Skill 1 ID & Name confirmed');

  // Create Skill 2 (to test independent deletion)
  const skillRes2 = await fetch(`${API_BASE}/skills`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'E2E Go Concurrency',
      category: 'Languages',
      level: 'Developing',
      status: 'Learning'
    })
  });
  const skill2 = await skillRes2.json();
  const skillId2 = skill2._id;
  assert(skillId2 && skill2.name === 'E2E Go Concurrency', 'Skill 2 Created for independent verification');

  // Read
  const skillGetRes = await fetch(`${API_BASE}/skills/${skillId}`, { headers });
  assert(skillGetRes.status === 200, 'Skill 1 Read (Status 200)');
  const skillGet = await skillGetRes.json();
  assert(skillGet._id === skillId && skillGet.level === 'Advanced', 'Skill 1 Read data verified');

  // Update
  const skillPutRes = await fetch(`${API_BASE}/skills/${skillId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      level: 'Expert',
      proficiencyPercentage: 95,
      description: 'Updated: Async Rust & Tokio runtime systems'
    })
  });
  assert(skillPutRes.status === 200, 'Skill 1 Updated (Status 200)');
  const skillPut = await skillPutRes.json();
  assert(skillPut.level === 'Expert' && skillPut.proficiencyPercentage === 95, 'Skill 1 Updated values verified');

  // Read after Update (verifying DB persistence)
  const skillGetAfterUpdate = await (await fetch(`${API_BASE}/skills/${skillId}`, { headers })).json();
  assert(skillGetAfterUpdate.level === 'Expert', 'Skill 1 DB Persistence after update confirmed');

  // Delete Skill 1
  const skillDelRes = await fetch(`${API_BASE}/skills/${skillId}`, {
    method: 'DELETE',
    headers
  });
  assert(skillDelRes.status === 200, 'Skill 1 Deleted (Status 200)');
  const skillDelData = await skillDelRes.json();
  assert(skillDelData.ok === true && skillDelData.deletedId === skillId, 'Skill 1 Delete response verified');

  // Verify Absent from Database
  const skillGetDeleted = await fetch(`${API_BASE}/skills/${skillId}`, { headers });
  assert(skillGetDeleted.status === 404, 'Skill 1 Absent from DB (Status 404 on GET)');

  // Verify Skill 2 is still intact
  const skill2Get = await fetch(`${API_BASE}/skills/${skillId2}`, { headers });
  assert(skill2Get.status === 200, 'Skill 2 remains intact in DB after Skill 1 deleted');

  // Clean up Skill 2
  await fetch(`${API_BASE}/skills/${skillId2}`, { method: 'DELETE', headers });


  // ==========================================
  // 2. GOALS CRUD
  // ==========================================
  console.log('\n=== 2. Testing GOALS CRUD ===');
  // Create Goal 1
  const goalRes1 = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Architect Distributed Event-Driven Broker',
      category: 'System Architecture',
      timeHorizon: 'Strategic Goal',
      priority: 'Critical',
      status: 'In Progress',
      progress: 25,
      description: 'Build low-latency messaging queue with Raft consensus'
    })
  });
  assert(goalRes1.status === 201, 'Goal 1 Created (Status 201)');
  const goal1 = await goalRes1.json();
  const goalId = goal1._id;
  assert(goalId && goal1.title.includes('Distributed Event-Driven'), 'Goal 1 ID & Title verified');

  // Create Goal 2
  const goalRes2 = await fetch(`${API_BASE}/goals`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Publish Open Source CLI Tool',
      category: 'Open Source',
      priority: 'Medium'
    })
  });
  const goal2 = await goalRes2.json();
  const goalId2 = goal2._id;
  assert(goalId2 && goal2.title.includes('Open Source CLI'), 'Goal 2 Created');

  // Read
  const goalGetRes = await fetch(`${API_BASE}/goals/${goalId}`, { headers });
  assert(goalGetRes.status === 200, 'Goal 1 Read (Status 200)');
  const goalGet = await goalGetRes.json();
  assert(goalGet.priority === 'Critical', 'Goal 1 data verified');

  // Update
  const goalPutRes = await fetch(`${API_BASE}/goals/${goalId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      progress: 60,
      status: 'Active',
      description: 'Raft consensus election verified, benchmarking throughput'
    })
  });
  assert(goalPutRes.status === 200, 'Goal 1 Updated (Status 200)');
  const goalPut = await goalPutRes.json();
  assert(goalPut.progress === 60 && goalPut.status === 'Active', 'Goal 1 Updated progress verified');

  // Read after update
  const goalGetAfterUpdate = await (await fetch(`${API_BASE}/goals/${goalId}`, { headers })).json();
  assert(goalGetAfterUpdate.progress === 60, 'Goal 1 DB Persistence after update confirmed');

  // Delete Goal 1
  const goalDelRes = await fetch(`${API_BASE}/goals/${goalId}`, {
    method: 'DELETE',
    headers
  });
  assert(goalDelRes.status === 200, 'Goal 1 Deleted (Status 200)');
  const goalDelData = await goalDelRes.json();
  assert(goalDelData.ok === true && goalDelData.deletedId === goalId, 'Goal 1 Delete response verified');

  // Verify Absent from DB
  const goalGetDeleted = await fetch(`${API_BASE}/goals/${goalId}`, { headers });
  assert(goalGetDeleted.status === 404, 'Goal 1 Absent from DB (Status 404)');

  // Verify Goal 2 intact
  const goal2Get = await fetch(`${API_BASE}/goals/${goalId2}`, { headers });
  assert(goal2Get.status === 200, 'Goal 2 intact after Goal 1 deleted');
  await fetch(`${API_BASE}/goals/${goalId2}`, { method: 'DELETE', headers });


  // ==========================================
  // 3. ROADMAPS CRUD
  // ==========================================
  console.log('\n=== 3. Testing ROADMAPS CRUD ===');
  // Create Roadmap 1
  const roadmapRes1 = await fetch(`${API_BASE}/roadmaps`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Cloud Native & Kubernetes Mastery',
      category: 'Cloud Engineering',
      difficulty: 'Advanced',
      status: 'in_progress',
      description: 'Deep dive into container orchestration, CRDs, and service meshes',
      phases: [
        {
          title: 'Phase 1: Fundamentals',
          order: 1,
          milestones: [
            { title: 'Docker internals and OCI spec', status: 'completed' },
            { title: 'K8s control plane architecture', status: 'in_progress' }
          ]
        }
      ]
    })
  });
  assert(roadmapRes1.status === 201, 'Roadmap 1 Created (Status 201)');
  const roadmap1 = await roadmapRes1.json();
  const roadmapId = roadmap1._id;
  assert(roadmapId && roadmap1.title.includes('Kubernetes'), 'Roadmap 1 ID & Title verified');

  // Create Roadmap 2
  const roadmapRes2 = await fetch(`${API_BASE}/roadmaps`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'MLOps Pipeline Development',
      category: 'AI / Machine Learning',
      difficulty: 'Intermediate'
    })
  });
  const roadmap2 = await roadmapRes2.json();
  const roadmapId2 = roadmap2._id;
  assert(roadmapId2 && roadmap2.title.includes('MLOps'), 'Roadmap 2 Created');

  // Read
  const roadmapGetRes = await fetch(`${API_BASE}/roadmaps/${roadmapId}`, { headers });
  assert(roadmapGetRes.status === 200, 'Roadmap 1 Read (Status 200)');
  const roadmapGet = await roadmapGetRes.json();
  assert(roadmapGet.difficulty === 'Advanced', 'Roadmap 1 data verified');

  // Update
  const roadmapPutRes = await fetch(`${API_BASE}/roadmaps/${roadmapId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      difficulty: 'Expert',
      estimatedDuration: '6 months',
      status: 'completed'
    })
  });
  assert(roadmapPutRes.status === 200, 'Roadmap 1 Updated (Status 200)');
  const roadmapPut = await roadmapPutRes.json();
  assert(roadmapPut.difficulty === 'Expert' && roadmapPut.status === 'completed', 'Roadmap 1 Updated values verified');

  // Read after Update
  const roadmapGetAfter = await (await fetch(`${API_BASE}/roadmaps/${roadmapId}`, { headers })).json();
  assert(roadmapGetAfter.difficulty === 'Expert', 'Roadmap 1 DB Persistence after update confirmed');

  // Delete Roadmap 1
  const roadmapDelRes = await fetch(`${API_BASE}/roadmaps/${roadmapId}`, {
    method: 'DELETE',
    headers
  });
  assert(roadmapDelRes.status === 200, 'Roadmap 1 Deleted (Status 200)');
  const roadmapDelData = await roadmapDelRes.json();
  assert(roadmapDelData.ok === true && roadmapDelData.deletedId === roadmapId, 'Roadmap 1 Delete response verified');

  // Verify Absent from DB
  const roadmapGetDeleted = await fetch(`${API_BASE}/roadmaps/${roadmapId}`, { headers });
  assert(roadmapGetDeleted.status === 404, 'Roadmap 1 Absent from DB (Status 404)');

  // Verify Roadmap 2 intact
  const roadmap2Get = await fetch(`${API_BASE}/roadmaps/${roadmapId2}`, { headers });
  assert(roadmap2Get.status === 200, 'Roadmap 2 intact after Roadmap 1 deleted');
  await fetch(`${API_BASE}/roadmaps/${roadmapId2}`, { method: 'DELETE', headers });


  // ==========================================
  // 4. CERTIFICATES CRUD
  // ==========================================
  console.log('\n=== 4. Testing CERTIFICATES CRUD ===');
  // Create Certificate 1
  const certRes1 = await fetch(`${API_BASE}/certificates`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation',
      credentialId: 'CKA-99887766',
      credentialUrl: 'https://www.cncf.io/certification/cka/',
      issuedAt: '2025-06-15',
      status: 'completed',
      visibility: 'public'
    })
  });
  assert(certRes1.status === 201, 'Certificate 1 Created (Status 201)');
  const cert1 = await certRes1.json();
  const certId = cert1._id;
  assert(certId && cert1.title.includes('CKA'), 'Certificate 1 ID & Title verified');

  // Create Certificate 2
  const certRes2 = await fetch(`${API_BASE}/certificates`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      status: 'completed'
    })
  });
  const cert2 = await certRes2.json();
  const certId2 = cert2._id;
  assert(certId2 && cert2.title.includes('AWS'), 'Certificate 2 Created');

  // Read
  const certGetRes = await fetch(`${API_BASE}/certificates/${certId}`, { headers });
  assert(certGetRes.status === 200, 'Certificate 1 Read (Status 200)');
  const certGet = await certGetRes.json();
  assert(certGet.issuer === 'Cloud Native Computing Foundation', 'Certificate 1 data verified');

  // Update
  const certPutRes = await fetch(`${API_BASE}/certificates/${certId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      expiryDate: '2028-06-15',
      description: 'Demonstrated mastery of Kubernetes administration, storage, and networking'
    })
  });
  assert(certPutRes.status === 200, 'Certificate 1 Updated (Status 200)');
  const certPut = await certPutRes.json();
  assert(certPut.expiryDate === '2028-06-15', 'Certificate 1 Updated values verified');

  // Read after Update
  const certGetAfter = await (await fetch(`${API_BASE}/certificates/${certId}`, { headers })).json();
  assert(certGetAfter.expiryDate === '2028-06-15', 'Certificate 1 DB Persistence after update confirmed');

  // Delete Certificate 1
  const certDelRes = await fetch(`${API_BASE}/certificates/${certId}`, {
    method: 'DELETE',
    headers
  });
  assert(certDelRes.status === 200, 'Certificate 1 Deleted (Status 200)');
  const certDelData = await certDelRes.json();
  assert(certDelData.ok === true && certDelData.deletedId === certId, 'Certificate 1 Delete response verified');

  // Verify Absent from DB
  const certGetDeleted = await fetch(`${API_BASE}/certificates/${certId}`, { headers });
  assert(certGetDeleted.status === 404, 'Certificate 1 Absent from DB (Status 404)');

  // Verify Certificate 2 intact
  const cert2Get = await fetch(`${API_BASE}/certificates/${certId2}`, { headers });
  assert(cert2Get.status === 200, 'Certificate 2 intact after Certificate 1 deleted');
  await fetch(`${API_BASE}/certificates/${certId2}`, { method: 'DELETE', headers });


  // ==========================================
  // 5. ERROR & INVALID ID TESTING
  // ==========================================
  console.log('\n=== 5. Testing Error Handling & Invalid IDs ===');
  const invalidId = '507f1f77bcf86cd799439011'; // valid ObjectId format but nonexistent
  const badSkillDel = await fetch(`${API_BASE}/skills/${invalidId}`, { method: 'DELETE', headers });
  assert(badSkillDel.status === 404, 'Nonexistent skill delete returns 404');

  const badGoalDel = await fetch(`${API_BASE}/goals/${invalidId}`, { method: 'DELETE', headers });
  assert(badGoalDel.status === 404, 'Nonexistent goal delete returns 404');

  const badRoadmapDel = await fetch(`${API_BASE}/roadmaps/${invalidId}`, { method: 'DELETE', headers });
  assert(badRoadmapDel.status === 404, 'Nonexistent roadmap delete returns 404');

  const badCertDel = await fetch(`${API_BASE}/certificates/${invalidId}`, { method: 'DELETE', headers });
  assert(badCertDel.status === 404, 'Nonexistent certificate delete returns 404');

  const unauthDel = await fetch(`${API_BASE}/skills/${invalidId}`, { method: 'DELETE' });
  assert(unauthDel.status === 401, 'Unauthorized delete blocked (Status 401)');

  console.log(`\n==========================================`);
  if (failures === 0) {
    console.log('🎉 ALL CRUD VERIFICATION TESTS PASSED SUCCESSFULLY! (100% PASS)');
  } else {
    console.error(`💥 ${failures} TEST(S) FAILED!`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
