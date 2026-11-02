import http from 'http';
import app from '../server.js';
import { connectDB, disconnectDB } from '../server/config/db.js';
import { User, ROLES } from '../server/models/User.js';

async function runTestSuite() {
  console.log('====================================================');
  console.log('   ENGINEERING HUB PRO — FULL BACKEND TEST SUITE    ');
  console.log('====================================================');

  await connectDB();
  const server = http.createServer(app);
  await new Promise(res => server.listen(0, res));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[test] Server running on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('[Suite 1: Health & System Diagnostics]');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const health = await healthRes.json();
    assert(health.ok === true && health.dbState === 'connected', 'Health endpoint reports operational status and connected DB');

    // 2. Setup status
    console.log('\n[Suite 2: Authentication & Provisioning]');
    const setupRes = await fetch(`${baseUrl}/api/auth/setup-status`);
    const setup = await setupRes.json();
    assert(typeof setup.isSetup === 'boolean', 'Setup status returns valid configuration status');

    // 3. Super Admin Provisioning / Login
    const testAdminEmail = 'superadmin@engineeringhub.dev';
    const testAdminPass = 'SuperSecurePass123!';

    // Ensure clean state for test accounts (idempotent runs)
    await User.deleteMany({ email: { $in: [testAdminEmail, 'editor@engineeringhub.dev'] } });

    // Test bootstrap via /api/auth/setup if no users, or directly create
    let superAdminToken = '';
    const userCount = await User.countDocuments();
    const hasEnvAdmin = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH);

    if (userCount === 0 && !hasEnvAdmin) {
      const setupPost = await fetch(`${baseUrl}/api/auth/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testAdminEmail,
          password: testAdminPass,
          name: 'Chief Super Admin'
        })
      });
      const setupData = await setupPost.json();
      assert(setupPost.status === 201 && setupData.role === 'super_admin', 'Super Admin bootstrap provisions initial super_admin account');
      superAdminToken = setupData.token;
    } else {
      // Create test super admin directly for suite isolation
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash(testAdminPass, 12);
      await User.findOneAndUpdate(
        { email: testAdminEmail },
        {
          email: testAdminEmail,
          passwordHash: hash,
          name: 'Chief Super Admin',
          role: ROLES.SUPER_ADMIN,
          status: 'active'
        },
        { upsert: true, new: true }
      );

      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testAdminEmail, password: testAdminPass })
      });
      const loginData = await loginRes.json();
      assert(loginRes.status === 200 && (loginData.role === 'super_admin' || !!loginData.token), 'Super Admin successfully logs in and receives JWT with role');
      superAdminToken = loginData.token;
    }

    const superHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superAdminToken}`
    };

    // 4. Verify /api/auth/me
    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: superHeaders });
    const me = await meRes.json();
    assert(me.email === testAdminEmail && me.isSuperAdmin === true, 'Session verification correctly identifies Super Admin authority');

    // 5. Super Admin Users Management & Protection
    console.log('\n[Suite 3: RBAC & Privilege Protection]');
    // Create an editor user
    const createEditorRes = await fetch(`${baseUrl}/api/super-admin/users`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({
        email: 'editor@engineeringhub.dev',
        password: 'EditorPassword123!',
        name: 'Content Editor',
        role: 'editor'
      })
    });
    const editorUser = await createEditorRes.json();
    assert(createEditorRes.status === 201 && editorUser.role === 'editor', 'Super Admin can provision new team members with granular roles');

    // Login as editor
    const editorLogin = await (await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'editor@engineeringhub.dev', password: 'EditorPassword123!' })
    })).json();
    const editorHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${editorLogin.token}` };

    // Editor trying to access Super Admin users endpoint should be forbidden (403)
    const editorForbidden = await fetch(`${baseUrl}/api/super-admin/users`, { headers: editorHeaders });
    assert(editorForbidden.status === 403, 'Editor role is strictly forbidden from accessing Super Admin endpoints');

    // Protection: Prevent demoting the last Super Admin
    const otherSuperAdmins = await User.find({ _id: { $ne: me.id }, role: ROLES.SUPER_ADMIN });
    await User.updateMany({ _id: { $ne: me.id }, role: ROLES.SUPER_ADMIN }, { role: ROLES.ADMIN });

    const demoteAttempt = await fetch(`${baseUrl}/api/super-admin/users/${me.id}/role`, {
      method: 'PUT',
      headers: superHeaders,
      body: JSON.stringify({ role: 'admin' })
    });
    const demoteData = await demoteAttempt.json();
    assert(demoteAttempt.status === 400 && demoteData.message.includes('Protection Alert'), 'System rejects demotion of the final active Super Admin');

    for (const osa of otherSuperAdmins) {
      await User.findByIdAndUpdate(osa._id, { role: ROLES.SUPER_ADMIN });
    }

    // 6. Audit Logging Verification
    console.log('\n[Suite 4: Audit Logging]');
    const auditRes = await fetch(`${baseUrl}/api/super-admin/audit-logs`, { headers: superHeaders });
    const auditData = await auditRes.json();
    assert(Array.isArray(auditData.logs) && auditData.logs.length > 0, `Audit logs recorded live operations (Total: ${auditData.total})`);

    // 7. Projects & Hierarchy Cycle Prevention
    console.log('\n[Suite 5: Projects & Hierarchical Tree]');
    const treeRes = await fetch(`${baseUrl}/api/projects?tree=true&all=true`, { headers: superHeaders });
    const tree = await treeRes.json();
    assert(tree.roots?.length > 0, `Projects tree generated with ${tree.roots?.length} root categories and ${tree.flat?.length} total items`);

    // Create item A and item B
    const itemARes = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({ title: 'Parent Component A', type: 'folder' })
    });
    const itemA = await itemARes.json();

    const itemBRes = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({ title: 'Child Component B', parentId: itemA._id, type: 'project' })
    });
    const itemB = await itemBRes.json();
    assert(itemB.parentId?._id === itemA._id || itemB.parentId === itemA._id, 'Hierarchical parent-child relationship persists in database');

    // Attempt to make item A a child of item B (Cycle A -> B -> A)
    const cycleAttempt = await fetch(`${baseUrl}/api/projects/${itemA._id}`, {
      method: 'PUT',
      headers: superHeaders,
      body: JSON.stringify({ parentId: itemB._id })
    });
    const cycleData = await cycleAttempt.json();
    assert(cycleAttempt.status === 400 && cycleData.message.includes('Circular hierarchy'), 'Acyclic validator strictly prevents circular dependencies');

    // Clean up ephemeral test items
    await fetch(`${baseUrl}/api/projects/${itemB._id}`, { method: 'DELETE', headers: superHeaders });
    await fetch(`${baseUrl}/api/projects/${itemA._id}`, { method: 'DELETE', headers: superHeaders });

    // 8. Folders / Collections Route Compatibility
    console.log('\n[Suite 6: Collections & Folders Alias]');
    const foldersRes = await fetch(`${baseUrl}/api/folders`);
    const folders = await foldersRes.json();
    assert(Array.isArray(folders) && folders.length > 0, `Folder collections endpoint returns valid folder list (Count: ${folders.length})`);

    // 9. Skills CRUD & Archive
    console.log('\n[Suite 7: Skills Management]');
    const createSkill = await fetch(`${baseUrl}/api/skills`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({
        name: 'Rust Systems Programming',
        category: 'Systems',
        level: 'Intermediate',
        proficiencyPercentage: 60
      })
    });
    const skill = await createSkill.json();
    assert(createSkill.status === 201 && skill.name === 'Rust Systems Programming', 'Skill created successfully');

    // Archive skill
    const archiveSkill = await fetch(`${baseUrl}/api/skills/${skill._id}/archive`, {
      method: 'PUT',
      headers: superHeaders
    });
    assert(archiveSkill.status === 200, 'Skill can be moved to archive');

    // Verify archived skill does not appear in public query
    const publicSkills = await (await fetch(`${baseUrl}/api/skills`)).json();
    assert(!publicSkills.some(s => s._id === skill._id), 'Archived skill is excluded from public portfolio view');

    // Restore skill
    const restoreSkill = await fetch(`${baseUrl}/api/skills/${skill._id}/restore`, {
      method: 'PUT',
      headers: superHeaders
    });
    assert(restoreSkill.status === 200, 'Skill restored successfully from archive');

    // 10. Interactive Roadmaps & Step Toggling
    console.log('\n[Suite 8: Roadmaps & Step Toggling]');
    const roadmaps = await (await fetch(`${baseUrl}/api/roadmaps`)).json();
    assert(roadmaps.length > 0, `Roadmaps retrieved (Count: ${roadmaps.length})`);

    if (roadmaps[0]?.stages?.[0]?.steps?.[0]) {
      const step = roadmaps[0].stages[0].steps[0];
      const toggleRes = await fetch(`${baseUrl}/api/roadmaps/${roadmaps[0]._id}/toggle-step`, {
        method: 'PUT',
        headers: superHeaders,
        body: JSON.stringify({
          stageId: roadmaps[0].stages[0].id || roadmaps[0].stages[0]._id,
          stepId: step.id || step._id,
          completed: !step.completed
        })
      });
      const toggleData = await toggleRes.json();
      assert(toggleRes.status === 200 && typeof toggleData.progress === 'number', 'Roadmap step toggling dynamically recalculates progress');
    }

    // 11. Goals Module (Section 9.10)
    console.log('\n[Suite 9: Goals Management]');
    const createGoal = await fetch(`${baseUrl}/api/goals`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({
        title: 'Attain CKA Certification',
        category: 'DevOps',
        status: 'In Progress',
        priority: 'High',
        targetDate: '2026-11-30',
        progress: 40
      })
    });
    const goal = await createGoal.json();
    assert(createGoal.status === 201 && goal.title === 'Attain CKA Certification', 'Goal created with defined progress and target dates');

    // 12. Notes & Knowledge Base
    console.log('\n[Suite 10: Notes & PKM]');
    const notes = await (await fetch(`${baseUrl}/api/notes`)).json();
    assert(Array.isArray(notes), `Knowledge notes library accessible (Count: ${notes.length})`);

    // 13. Themes & Live Customizer
    console.log('\n[Suite 11: Themes & Palettes]');
    const themes = await (await fetch(`${baseUrl}/api/themes`)).json();
    const active = themes.find(t => t.isActive);
    assert(themes.length >= 3 && !!active, `Theme palettes present with active theme: ${active?.name}`);

    // 14. Live Analytics
    console.log('\n[Suite 12: System Analytics]');
    const analytics = await (await fetch(`${baseUrl}/api/analytics`, { headers: superHeaders })).json();
    assert(analytics.projects?.total > 0 && typeof analytics.tasks?.completionRate === 'number', 'Live analytics computed from real database records');

    // 15. Unified Archive / Recycle Bin
    console.log('\n[Suite 13: Unified Archive / Recycle Bin]');
    const recycleBin = await (await fetch(`${baseUrl}/api/archive`, { headers: superHeaders })).json();
    assert(typeof recycleBin.totalArchived === 'number', `Recycle Bin accessible with unified multi-module archive count: ${recycleBin.totalArchived}`);

    // 16. Technical Domains & Hierarchy (Level 1 & Level 2)
    console.log('\n[Suite 14: Technical Domains & Fields Hierarchy]');
    const createDomRes = await fetch(`${baseUrl}/api/domains`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({
        name: 'Quantum Computing Lab',
        description: 'Superconducting qubits and quantum algorithm simulation.',
        accentColor: '#4a154b',
        icon: 'cpu',
        order: 99
      })
    });
    const createdDom = await createDomRes.json();
    assert(createDomRes.status === 201 && createdDom.slug === 'quantum-computing-lab', 'Level 1 Domain created with auto-slugification');

    const addFieldRes = await fetch(`${baseUrl}/api/domains/${createdDom._id}/fields`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({
        name: 'Qubit Simulation',
        description: 'Simulating Bell states and Grover search algorithms.',
        icon: 'terminal',
        order: 1
      })
    });
    const domainWithField = await addFieldRes.json();
    const hasField = (domainWithField.fields || []).some(f => f.name === 'Qubit Simulation');
    assert(addFieldRes.status === 201 && hasField, 'Level 2 Specialization Field successfully added to domain');

    // Clean up test domain
    await fetch(`${baseUrl}/api/domains/${createdDom._id}`, {
      method: 'DELETE',
      headers: superHeaders
    });

    // 17. Headless Site Content CMS
    console.log('\n[Suite 15: Headless Site Content CMS]');
    const siteContentRes = await fetch(`${baseUrl}/api/site-content`);
    const siteContent = await siteContentRes.json();
    assert(siteContentRes.status === 200 && typeof siteContent.hero === 'object', 'Public site content accessible with structured hero and sections');

    const updateContentRes = await fetch(`${baseUrl}/api/site-content`, {
      method: 'PUT',
      headers: superHeaders,
      body: JSON.stringify({
        hero: {
          ...siteContent.hero,
          heading: 'Building resilient architectures.'
        }
      })
    });
    const updatedContent = await updateContentRes.json();
    assert(updateContentRes.status === 200 && updatedContent.hero?.heading === 'Building resilient architectures.', 'Site Content successfully updated and persisted');

    // 18. Social Links & Contact Channels
    console.log('\n[Suite 16: Social Links & Contact Channels]');
    const createSocialRes = await fetch(`${baseUrl}/api/social-links`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({
        platform: 'whatsapp',
        label: 'Direct WhatsApp',
        url: 'https://wa.me/923001234567?text=Hello',
        username: '923001234567',
        placement: ['hero', 'contact']
      })
    });
    const createdSocial = await createSocialRes.json();
    assert(createSocialRes.status === 201 && createdSocial.platform === 'whatsapp', 'Social channel created with placement targets and direct link formatting');

    // Clean up test social link
    await fetch(`${baseUrl}/api/social-links/${createdSocial._id}`, {
      method: 'DELETE',
      headers: superHeaders
    });

    // 19. Portfolio Synchronization Verification
    console.log('\n[Suite 17: Portfolio Synchronization Across Modules]');
    const [pubSkills, pubRoadmaps, pubCerts, pubProjects] = await Promise.all([
      (await fetch(`${baseUrl}/api/skills`)).json(),
      (await fetch(`${baseUrl}/api/roadmaps`)).json(),
      (await fetch(`${baseUrl}/api/certificates`)).json(),
      (await fetch(`${baseUrl}/api/projects`)).json()
    ]);
    assert(Array.isArray(pubSkills) && pubSkills.length > 0, `Public skills endpoint serves active competency records (${pubSkills.length} skills)`);
    assert(Array.isArray(pubRoadmaps) && pubRoadmaps.length > 0, `Public roadmaps endpoint serves verified tracks (${pubRoadmaps.length} roadmaps)`);
    assert(Array.isArray(pubCerts) && pubCerts.length > 0, `Public certificates endpoint serves verified credentials (${pubCerts.length} certs)`);
    assert(Array.isArray(pubProjects) && pubProjects.length > 0, `Public projects endpoint delivers published projects (${pubProjects.length} projects)`);

    // 20. Strategic Milestones & Dependencies DAG
    console.log('\n[Suite 18: Strategic Milestones & Dependencies DAG]');
    const milestonesListRes = await fetch(`${baseUrl}/api/milestones`, { headers: superHeaders });
    const initialMilestones = await milestonesListRes.json();
    assert(milestonesListRes.status === 200 && Array.isArray(initialMilestones) && initialMilestones.length >= 3, `Milestones retrieved with populated domains and relations (${initialMilestones.length} milestones)`);

    // Create a new test milestone with subtasks
    const createMsRes = await fetch(`${baseUrl}/api/milestones`, {
      method: 'POST',
      headers: superHeaders,
      body: JSON.stringify({
        title: 'Distributed Transaction Saga Orchestrator',
        category: 'Architecture',
        priority: 'High',
        status: 'in_progress',
        subtasks: [
          { title: 'Define orchestrator state machine', completed: true, estimatedMinutes: 60 },
          { title: 'Implement compensating transaction rollback handlers', completed: false, estimatedMinutes: 90 }
        ],
        successCriteria: ['Strict eventual consistency across independent service boundaries']
      })
    });
    const createdMs = await createMsRes.json();
    assert(createMsRes.status === 201 && createdMs.progress === 50, 'Milestone created with dynamic progress calculation from subtasks (50%)');

    // Verify circular dependency rejection
    const cycleRes = await fetch(`${baseUrl}/api/milestones/${createdMs._id}`, {
      method: 'PUT',
      headers: superHeaders,
      body: JSON.stringify({
        dependsOn: [createdMs._id]
      })
    });
    assert(cycleRes.status === 400, 'Milestone circular dependency strictly rejected with HTTP 400');

    // Verify analytics endpoint
    const analyticsRes = await fetch(`${baseUrl}/api/milestones/analytics`, { headers: superHeaders });
    const msAnalytics = await analyticsRes.json();
    assert(analyticsRes.status === 200 && typeof msAnalytics.total === 'number' && msAnalytics.total > 0, `Milestones analytics computed live metrics (Total: ${msAnalytics.total})`);

    // Clean up test milestone
    await fetch(`${baseUrl}/api/milestones/${createdMs._id}`, {
      method: 'DELETE',
      headers: superHeaders
    });

    console.log('\n====================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED   `);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled test suite error:', err);
    process.exit(1);
  } finally {
    server.close();
    await disconnectDB();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTestSuite();
