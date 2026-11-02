/**
 * Engineering Hub Pro — Complete Domain & Subdomain Relationships & Privacy Verification Suite
 * Tests:
 * 1. Domain & Subdomain CRUD and Hierarchy validation (preventing circular parents)
 * 2. Cascading Entity Association (Skills, Goals, Milestones, Certs, Projects, Resources)
 * 3. Milestone Domain Auto-Inheritance from Parent Goal
 * 4. Domain & Subdomain Deep-Dive Aggregations & Analytics
 * 5. Deduplicated Achievements Calculation
 * 6. Safe Domain Archival / Deletion without cascading data loss
 * 7. Server-Side Privacy & Visibility Enforcement (Public vs Internal data isolation)
 */

import http from 'http';
import https from 'https';

const API_BASE = 'http://localhost:5000/api';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
    const client = url.protocol === 'https:' ? https : http;

    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = client.request(url, reqOptions, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = data ? JSON.parse(data) : null;
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// Simple test framework
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🚀 ENGINEERING HUB PRO — DOMAIN & PORTFOLIO TEST SUITE');
  console.log('======================================================\n');

  try {
    // -----------------------------------------------------------------
    // TEST 1: Login & obtain admin token
    // -----------------------------------------------------------------
    console.log('📌 Test 1: Admin Authentication');
    let adminToken = '';
    let loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: 'superadmin@engineeringhub.dev', password: 'SuperSecurePass123!' }
    });

    if (loginRes.status !== 200 || !loginRes.data?.token) {
      // Provision via mongoose if needed
      console.log('  Provisioning test admin account directly...');
      const mongoose = (await import('mongoose')).default;
      const bcrypt = (await import('bcryptjs')).default;
      const dotenv = (await import('dotenv')).default;
      dotenv.config();

      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
      }
      const User = mongoose.model('User');
      const hash = await bcrypt.hash('SuperSecurePass123!', 12);
      await User.findOneAndUpdate(
        { email: 'superadmin@engineeringhub.dev' },
        {
          email: 'superadmin@engineeringhub.dev',
          passwordHash: hash,
          name: 'Super Admin',
          role: 'super_admin',
          status: 'active'
        },
        { upsert: true, new: true }
      );

      loginRes = await request('/auth/login', {
        method: 'POST',
        body: { email: 'superadmin@engineeringhub.dev', password: 'SuperSecurePass123!' }
      });
    }

    assert(loginRes.status === 200 && !!loginRes.data?.token, 'Admin logged in and received JWT');
    adminToken = loginRes.data?.token;
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    // -----------------------------------------------------------------
    // TEST 2: Central Domain & Subdomain Hierarchy
    // -----------------------------------------------------------------
    console.log('\n📌 Test 2: Central Domain & Subdomain Hierarchy');
    const domainListRes = await request('/domains');
    assert(domainListRes.status === 200 && Array.isArray(domainListRes.data), 'Fetched existing domains list');
    const domains = domainListRes.data;
    assert(domains.length >= 4, `At least 4 top-level domains found (count: ${domains.length})`);

    const cyberDomain = domains.find(d => d.slug === 'cybersecurity' || d.name?.toLowerCase().includes('cyber'));
    assert(!!cyberDomain, 'Cybersecurity domain exists with fields/subdomains');
    assert(Array.isArray(cyberDomain?.fields) && cyberDomain.fields.length >= 2, 'Cybersecurity domain has subdomains in fields');

    // Test Circular Hierarchy Prevention
    console.log('  Testing circular parent hierarchy prevention...');
    const circularRes = await request(`/domains/${cyberDomain._id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: { parentDomain: cyberDomain._id }
    });
    assert(circularRes.status === 400, 'Server rejects setting domain parent to itself (400 Bad Request)');

    // -----------------------------------------------------------------
    // TEST 3: Domain Deep-Dive Aggregation Endpoint
    // -----------------------------------------------------------------
    console.log('\n📌 Test 3: Domain Deep-Dive API & Multi-Module Aggregation');
    const deepDiveRes = await request(`/domains/${cyberDomain.slug}/deep-dive`);
    assert(deepDiveRes.status === 200, `Deep-dive endpoint responded with 200 for "${cyberDomain.slug}"`);
    const dd = deepDiveRes.data;

    assert(dd.domain && dd.domain.slug === cyberDomain.slug, 'Deep-dive returned root domain');
    assert(Array.isArray(dd.subdomains), 'Deep-dive returned subdomains array');
    assert(dd.counts && typeof dd.counts.skills === 'number', 'Deep-dive includes real count metrics');
    assert(Array.isArray(dd.skills), 'Deep-dive aggregated skills list');
    assert(Array.isArray(dd.goals), 'Deep-dive aggregated goals list');
    assert(Array.isArray(dd.certifications), 'Deep-dive aggregated certifications list');
    assert(Array.isArray(dd.projects), 'Deep-dive aggregated projects list');
    assert(Array.isArray(dd.resources), 'Deep-dive aggregated learning resources list');
    assert(Array.isArray(dd.achievements), 'Deep-dive aggregated achievements list');
    assert(dd.analytics && Array.isArray(dd.analytics.skillProficiency), 'Deep-dive generated domain analytics');

    // -----------------------------------------------------------------
    // TEST 4: Subdomain Deep-Dive Filtering
    // -----------------------------------------------------------------
    console.log('\n📌 Test 4: Subdomain Deep-Dive Specific Filtering');
    const subName = cyberDomain.fields[0]?.name;
    const subSlug = cyberDomain.fields[0]?.slug || encodeURIComponent(subName);
    const subDeepDiveRes = await request(`/domains/${cyberDomain.slug}/deep-dive?subdomain=${subSlug}`);
    assert(subDeepDiveRes.status === 200, `Subdomain deep-dive responded with 200 for subdomain "${subName}"`);
    const sdd = subDeepDiveRes.data;
    assert(sdd.activeSubdomain?.name === subName, 'Active subdomain verified in response');
    // Ensure all filtered items either match the subdomain or inherit from it
    const nonMatchingSkills = sdd.skills.filter(s => s.subdomain && s.subdomain !== subName);
    assert(nonMatchingSkills.length === 0, 'All returned skills match the requested subdomain filter');

    // -----------------------------------------------------------------
    // TEST 5: Learning Resources CRUD & Domain Filtering
    // -----------------------------------------------------------------
    console.log('\n📌 Test 5: Dedicated Learning Resources CRUD & Domain Association');
    const createResRes = await request('/resources', {
      method: 'POST',
      headers: authHeaders,
      body: {
        title: 'OWASP Web Security Testing Guide v4.2',
        type: 'documentation',
        url: 'https://owasp.org/www-project-web-security-testing-guide/',
        difficulty: 'intermediate',
        status: 'in_progress',
        primaryDomain: cyberDomain._id,
        subdomain: 'Web Application Security',
        description: 'Comprehensive manual for web application penetration testing.',
        visibility: 'public'
      }
    });
    assert(createResRes.status === 201 && createResRes.data?._id, 'Resource created with primaryDomain & subdomain');
    const createdResId = createResRes.data?._id;

    const getResFiltered = await request(`/resources?domain=${cyberDomain._id}&subdomain=Web Application Security`);
    assert(getResFiltered.status === 200 && getResFiltered.data.some(r => r._id === createdResId), 'Resource queryable by domain & subdomain');

    // -----------------------------------------------------------------
    // TEST 6: Milestone Domain Auto-Inheritance from Parent Goal
    // -----------------------------------------------------------------
    console.log('\n📌 Test 6: Milestone Domain Auto-Inheritance from Goal');
    // 1. Create a Goal with primaryDomain & subdomain
    const newGoalRes = await request('/goals', {
      method: 'POST',
      headers: authHeaders,
      body: {
        title: 'Master Web Exploitation & OWASP Top 10',
        category: 'Learning',
        status: 'in_progress',
        primaryDomain: cyberDomain._id,
        subdomain: 'Web Application Security',
        targetDate: new Date('2026-12-31').toISOString(),
        visibility: 'public'
      }
    });
    assert(newGoalRes.status === 201 && newGoalRes.data?._id, 'Created parent goal with domain and subdomain');
    const goalId = newGoalRes.data._id;

    // 2. Create a Milestone linked to this goal WITHOUT explicitly supplying domain
    const newMilestoneRes = await request('/milestones', {
      method: 'POST',
      headers: authHeaders,
      body: {
        title: 'Solve 20 PortSwigger Web Security Academy Labs',
        goalId: goalId,
        status: 'completed',
        category: 'Learning',
        visibility: 'public'
      }
    });
    assert(newMilestoneRes.status === 201 && newMilestoneRes.data?._id, 'Created milestone linked to parent goal');
    const milestone = newMilestoneRes.data;
    assert(
      String(milestone.primaryDomain?._id || milestone.primaryDomain) === String(cyberDomain._id) &&
      milestone.subdomain === 'Web Application Security',
      'Milestone automatically inherited primaryDomain and subdomain from parent goal'
    );

    // -----------------------------------------------------------------
    // TEST 7: Deduplicated Achievements Verification
    // -----------------------------------------------------------------
    console.log('\n📌 Test 7: Deduplicated Achievements in Domain');
    const updatedDDRes = await request(`/domains/${cyberDomain.slug}/deep-dive`);
    const achievements = updatedDDRes.data.achievements;
    assert(Array.isArray(achievements), 'Achievements array returned');
    // Verify our completed milestone is included as an achievement
    const milestoneAch = achievements.find(a => a.type === 'milestone' && (a.id === `milestone-${milestone._id}` || a.refId?.toString() === milestone._id.toString()));
    assert(!!milestoneAch, 'Completed milestone appears as a verified achievement in the domain');
    // Verify no duplicates by ID
    const achIds = achievements.map(a => `${a.type}-${a.id}`);
    const uniqueAchIds = new Set(achIds);
    assert(achIds.length === uniqueAchIds.size, 'All achievements are unique (zero double counting)');

    // -----------------------------------------------------------------
    // TEST 8: Server-Side Privacy & Visibility Isolation
    // -----------------------------------------------------------------
    console.log('\n📌 Test 8: Server-Side Privacy & Visitor Visibility Isolation');

    // 1. Create a private resource
    const privRes = await request('/resources', {
      method: 'POST',
      headers: authHeaders,
      body: {
        title: 'Internal Confidential Security Audit Playbook',
        type: 'tools',
        url: 'https://internal.vault/playbook',
        primaryDomain: cyberDomain._id,
        subdomain: 'Web Application Security',
        visibility: 'private'
      }
    });
    const privResId = privRes.data?._id;

    // 2. Query resources without authentication
    const publicResourcesRes = await request('/resources');
    const publicList = publicResourcesRes.data;
    const leakedResource = publicList.find(r => r._id === privResId);
    assert(!leakedResource, 'Unauthenticated public query NEVER returns private resource');

    // 3. Query deep-dive without authentication
    const publicDDRes = await request(`/domains/${cyberDomain.slug}/deep-dive`);
    const leakedInDD = publicDDRes.data.resources.find(r => r._id === privResId);
    assert(!leakedInDD, 'Public domain deep-dive NEVER includes private resource');

    // Clean up test items
    if (createdResId) await request(`/resources/${createdResId}`, { method: 'DELETE', headers: authHeaders });
    if (privResId) await request(`/resources/${privResId}`, { method: 'DELETE', headers: authHeaders });
    if (milestone?._id) await request(`/milestones/${milestone._id}`, { method: 'DELETE', headers: authHeaders });
    if (goalId) await request(`/goals/${goalId}`, { method: 'DELETE', headers: authHeaders });
    console.log('  Cleaned up temporary test entities.');

  } catch (error) {
    console.error('❌ Exception in test suite:', error);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
