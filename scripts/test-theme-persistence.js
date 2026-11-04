import 'dotenv/config';
import http from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'engineering-hub-pro-super-secure-jwt-secret-key-32-chars';
const BASE_URL = 'http://localhost:5000';

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
          resolve({ status: res.statusCode, data: parsed });
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

async function run() {
  console.log('Testing Theme Activation & Persistence...');

  // 1. Activate 'teal-citrus' by themeId string
  const res1 = await request('/api/themes/teal-citrus/activate', { method: 'PUT' });
  if (res1.status !== 200 || !res1.data.ok) {
    throw new Error(`Failed to activate teal-citrus: ${JSON.stringify(res1.data)}`);
  }
  console.log('✓ Successfully activated teal-citrus via PUT /api/themes/teal-citrus/activate');

  // 2. Query public list
  const listRes1 = await request('/api/themes', { unauthenticated: true });
  const active1 = listRes1.data.find(t => t.isActive);
  if (!active1 || active1.themeId !== 'teal-citrus') {
    throw new Error(`Expected teal-citrus to be active, got: ${active1?.themeId}`);
  }
  console.log(`✓ Confirmed teal-citrus is active in database: ${active1.name}`);

  // 3. Activate 'burgundy-gold'
  const res2 = await request('/api/themes/burgundy-gold/activate', { method: 'PUT' });
  if (res2.status !== 200 || !res2.data.ok) {
    throw new Error(`Failed to activate burgundy-gold: ${JSON.stringify(res2.data)}`);
  }
  console.log('✓ Successfully activated burgundy-gold');

  // 4. Query public list again
  const listRes2 = await request('/api/themes', { unauthenticated: true });
  const active2 = listRes2.data.find(t => t.isActive);
  if (!active2 || active2.themeId !== 'burgundy-gold') {
    throw new Error(`Expected burgundy-gold to be active, got: ${active2?.themeId}`);
  }
  console.log(`✓ Confirmed burgundy-gold is active in database: ${active2.name}`);

  console.log('\n🎉 ALL THEME PERSISTENCE TESTS PASSED!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});

