import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'engineering-hub-pro-super-secure-jwt-secret-key-32-chars';

const adminToken = jwt.sign(
  { sub: 'env_admin', username: 'admin', role: 'super_admin' },
  JWT_SECRET,
  { expiresIn: '1h' }
);

let baseUrl = process.env.TEST_BASE_URL || 'http://localhost:5000';
let inProcessServer = null;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
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

async function ensureServer() {
  try {
    const res = await request('/api/health', { unauthenticated: true });
    if (res.status === 200 && res.data?.ok) {
      console.log(`[test] Connected to running server on ${baseUrl}`);
      return;
    }
  } catch (e) {
    // Port 5000 not reachable, spin up in-process server
  }

  console.log('[test] Starting in-process server on ephemeral port...');
  const { default: app } = await import('../server.js');
  const { connectDB } = await import('../server/config/db.js');
  await connectDB();
  inProcessServer = http.createServer(app);
  await new Promise(resolve => inProcessServer.listen(0, resolve));
  const port = inProcessServer.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`[test] In-process server listening on ${baseUrl}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('  ENGINEERING HUB PRO — SOCIAL LINKS & ARCHIVE TEST SUITE       ');
  console.log('================================================================');

  await ensureServer();

  let testLinks = [];

  try {
    // Test 1: Health check
    console.log('\n[Suite 1: Health & Diagnostics]');
    const health = await request('/api/health', { unauthenticated: true });
    assert(health.status === 200 && health.data.ok === true, 'API is operational');

    // Test 2: Public Retrieval & Placement Filtering
    console.log('\n[Suite 2: Public Channel Retrieval & Placements]');
    const pubRes = await request('/api/social-links', { unauthenticated: true });
    assert(pubRes.status === 200 && Array.isArray(pubRes.data), 'Public links endpoint responds with array');

    const heroRes = await request('/api/social-links?placement=hero', { unauthenticated: true });
    assert(heroRes.status === 200 && Array.isArray(heroRes.data), 'Hero placement query succeeds');
    if (heroRes.data.length > 0) {
      assert(heroRes.data.every(l => !l.placement || l.placement.includes('hero')), 'All returned links have hero placement');
    }

    const footerRes = await request('/api/social-links?placement=footer', { unauthenticated: true });
    assert(footerRes.status === 200 && Array.isArray(footerRes.data), 'Footer placement query succeeds');

    const contactRes = await request('/api/social-links?placement=contact', { unauthenticated: true });
    assert(contactRes.status === 200 && Array.isArray(contactRes.data), 'Contact placement query succeeds');

    // Test 3: Creation & Platform URL Normalization
    console.log('\n[Suite 3: Channel Creation & URL Normalization]');
    
    // 3a. WhatsApp normalization
    const waRes = await request('/api/social-links', {
      method: 'POST',
      body: {
        platform: 'whatsapp',
        label: 'Direct WhatsApp Chat',
        url: '+1 (555) 019-2834',
        placement: ['hero', 'contact']
      }
    });
    assert(waRes.status === 201, 'WhatsApp channel created');
    assert(waRes.data.url === 'https://wa.me/15550192834', `WhatsApp URL normalized to wa.me format: ${waRes.data.url}`);
    testLinks.push(waRes.data._id);

    // 3b. Email normalization
    const mailRes = await request('/api/social-links', {
      method: 'POST',
      body: {
        platform: 'email',
        label: 'Lead Architect Inquiries',
        url: 'lead.architect@engineeringhub.dev',
        placement: ['footer', 'contact']
      }
    });
    assert(mailRes.status === 201, 'Email channel created');
    assert(mailRes.data.url === 'mailto:lead.architect@engineeringhub.dev', `Email URL normalized with mailto: prefix: ${mailRes.data.url}`);
    testLinks.push(mailRes.data._id);

    // 3c. Telegram normalization
    const tgRes = await request('/api/social-links', {
      method: 'POST',
      body: {
        platform: 'telegram',
        label: 'Cloud Ops Telegram',
        url: '@cloudops_broadcast',
        placement: ['hero', 'footer']
      }
    });
    assert(tgRes.status === 201, 'Telegram channel created');
    assert(tgRes.data.url === 'https://t.me/cloudops_broadcast', `Telegram URL normalized with t.me prefix: ${tgRes.data.url}`);
    testLinks.push(tgRes.data._id);

    // 3d. Custom Platform Channel
    const customRes = await request('/api/social-links', {
      method: 'POST',
      body: {
        platform: 'custom',
        customPlatformName: 'Substack',
        label: 'System Design Deep Dives',
        url: 'systemdesign.substack.com',
        placement: ['hero', 'footer', 'contact']
      }
    });
    assert(customRes.status === 201, 'Custom brand channel created');
    assert(customRes.data.customPlatformName === 'Substack', 'Custom platform name preserved');
    assert(customRes.data.url === 'https://systemdesign.substack.com', `Custom URL prefixed with https://: ${customRes.data.url}`);
    testLinks.push(customRes.data._id);

    // Test 4: Batch Reordering
    console.log('\n[Suite 4: Batch Reordering Sequences]');
    // 4a. Reorder via orderedIds array
    const reverseOrder = [...testLinks].reverse();
    const reorderRes1 = await request('/api/social-links/reorder/batch', {
      method: 'PUT',
      body: { orderedIds: reverseOrder }
    });
    assert(reorderRes1.status === 200, 'Batch reorder with orderedIds succeeded');

    // 4b. Reorder via items array with explicit order
    const itemsPayload = testLinks.map((id, idx) => ({ _id: id, order: idx + 1 }));
    const reorderRes2 = await request('/api/social-links/reorder/batch', {
      method: 'PUT',
      body: { items: itemsPayload }
    });
    assert(reorderRes2.status === 200, 'Batch reorder with items payload succeeded');

    // Test 5: Soft Archive & Unified Recycle Bin Integration
    console.log('\n[Suite 5: Soft Archive & Unified Recycle Bin]');
    const linkToArchive = testLinks[0];
    const archiveRes = await request(`/api/social-links/${linkToArchive}`, {
      method: 'PUT',
      body: { isArchived: true }
    });
    assert(archiveRes.status === 200 && archiveRes.data.isArchived === true, 'Channel soft-archived');

    // Verify it is excluded from public active list
    const activeList = await request('/api/social-links', { unauthenticated: true });
    assert(!activeList.data.some(l => l._id === linkToArchive), 'Archived channel excluded from active public queries');

    // Verify it appears in Unified Archive
    const unifiedArchive = await request('/api/archive');
    assert(unifiedArchive.status === 200, 'Unified Archive API accessible');
    assert(Array.isArray(unifiedArchive.data.socialLinks), 'Unified Archive includes socialLinks array');
    assert(
      unifiedArchive.data.socialLinks.some(l => l._id === linkToArchive),
      'Archived social link found in Unified Archive module'
    );

    // Restore via Unified Archive
    const restoreRes = await request(`/api/archive/restore/socialLink/${linkToArchive}`, {
      method: 'PUT'
    });
    assert(restoreRes.status === 200 && restoreRes.data.ok, 'Social link restored via Unified Archive API');

    // Verify it reappears in active list
    const restoredList = await request('/api/social-links', { unauthenticated: true });
    assert(restoredList.data.some(l => l._id === linkToArchive), 'Restored social link active again');

    // Test 6: Permanent Cleanup
    console.log('\n[Suite 6: Permanent Cleanup]');
    for (const id of testLinks) {
      const delRes = await request(`/api/social-links/${id}?permanent=true`, {
        method: 'DELETE'
      });
      assert(delRes.status === 200, `Channel ${id} permanently cleaned up`);
    }

    console.log('\n================================================================');
    console.log('  🎉 ALL SOCIAL LINKS & ARCHIVE TESTS PASSED SUCCESSFULLY!       ');
    console.log('================================================================\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED:', err.message);
    process.exit(1);
  } finally {
    if (inProcessServer) {
      await new Promise(resolve => inProcessServer.close(resolve));
    }
  }
}

runTests();
