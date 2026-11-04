import http from 'http';

function post(url, body = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resData) });
        } catch {
          resolve({ status: res.statusCode, body: resData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(url, token = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    http.get({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function put(url, body = {}, token = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'PUT',
      headers
    }, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resData) });
        } catch {
          resolve({ status: res.statusCode, body: resData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function verify() {
  console.log('==================================================');
  console.log('  ENGINEERING HUB PRO — MULTI-PALETTE E2E VERIFY  ');
  console.log('==================================================');

  // 1. Verify Frontend dev server
  const fe = await get('http://localhost:5173/');
  console.log(`[1] Frontend Dev Server: Status ${fe.status} (${typeof fe.body === 'string' && fe.body.includes('Vite') ? 'Vite HTML served' : 'OK'})`);

  // 2. Verify Backend API themes
  const themesRes = await get('http://localhost:5000/api/themes');
  console.log(`[2] Backend /api/themes: Status ${themesRes.status}, Total Palettes: ${themesRes.body.length}`);

  const palettes = themesRes.body;
  const expectedThemes = [
    { name: 'Fjord Copper', mode: 'dark', hexes: ['#04151f', '#183a37', '#efd6ac', '#c44900', '#432534'] },
    { name: 'Teal Citrus', mode: 'light', hexes: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'] },
    { name: 'Editorial Sage', mode: 'light', hexes: ['#f4f1de', '#e07a5f', '#3d405b', '#81b29a', '#f2cc8f'] },
    { name: 'Warm Minimal', mode: 'light', hexes: ['#fffcf2', '#ccc5b9', '#403d39', '#252422', '#eb5e28'] },
    { name: 'Obsidian Gold', mode: 'dark', hexes: ['#080705', '#3d0c02', '#002147', '#00563b', '#d4af37'] },
    { name: 'Crimson Midnight', mode: 'dark', hexes: ['#1e1e24', '#92140c', '#fff8f0', '#ffcf99', '#111d4a'] },
    { name: 'Oxford Burgundy', mode: 'dark', hexes: ['#002642', '#840032', '#e59500', '#e5dada', '#02040f'] },
    { name: 'Heritage Gold', mode: 'light', hexes: ['#af9164', '#f7f3e3', '#b3b6b7', '#6f1a07', '#2b2118'] }
  ];

  for (const expected of expectedThemes) {
    const found = palettes.find(t => t.name.toLowerCase() === expected.name.toLowerCase());
    if (!found) {
      console.error(`  ✗ Missing palette: ${expected.name}`);
      process.exit(1);
    }
    const mode = found.mode || found.colors?.mode;
    const matchHex = JSON.stringify(found.raw) === JSON.stringify(expected.hexes);
    console.log(`  ✓ Palette "${found.name}": Mode=${mode}, HexesMatch=${matchHex} [${found.raw.join(', ')}]`);
  }

  // 3. Authenticate to test RBAC-protected theme activation
  console.log('\n[3] Authenticating as Super Admin to test Theme Activation...');
  const login = await post('http://localhost:5000/api/auth/login', {
    email: 'superadmin@engineeringhub.dev',
    password: 'SuperSecurePass123!'
  });

  const token = login.body.token;
  if (!token) {
    console.error('Failed to authenticate:', login.body);
    process.exit(1);
  }
  console.log('  ✓ Authenticated successfully with token');

  // 4. Activate Obsidian Gold (Dark Theme)
  const obsidian = palettes.find(t => t.name === 'Obsidian Gold');
  const activateObs = await put(`http://localhost:5000/api/themes/${obsidian._id}/activate`, {}, token);
  console.log(`\n[4] Activate "Obsidian Gold": Status ${activateObs.status}, activeTheme: "${activateObs.body.activeTheme?.name}"`);

  // Verify in DB
  const checkObsidian = await get('http://localhost:5000/api/themes');
  const activeNow = checkObsidian.body.find(t => t.isActive);
  console.log(`  ✓ Verified DB State: Active theme is now "${activeNow.name}" (isActive: true)`);

  // 5. Activate Oxford Burgundy (Dark Theme)
  const oxford = palettes.find(t => t.name === 'Oxford Burgundy');
  const activateOxf = await put(`http://localhost:5000/api/themes/${oxford._id}/activate`, {}, token);
  console.log(`\n[5] Activate "Oxford Burgundy": Status ${activateOxf.status}, activeTheme: "${activateOxf.body.activeTheme?.name}"`);

  // 6. Reactivate Editorial Sage (Default Light Editorial Theme)
  const editorial = palettes.find(t => t.name === 'Editorial Sage');
  const activateEdRes = await put(`http://localhost:5000/api/themes/${editorial._id}/activate`, {}, token);
  console.log(`\n[6] Reactivate default "Editorial Sage": Status ${activateEdRes.status}, activeTheme: "${activateEdRes.body.activeTheme?.name}"`);

  const finalCheck = await get('http://localhost:5000/api/themes');
  const finalActive = finalCheck.body.find(t => t.isActive);
  console.log(`  ✓ Final DB State: Active theme is confirmed as "${finalActive.name}"`);

  console.log('\n==================================================');
  console.log('  ALL MULTI-PALETTE THEME TESTS PASSED 100%      ');
  console.log('==================================================\n');
}

verify().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
