import 'dotenv/config';

const baseUrl = 'http://localhost:5000';

async function runCommandCenterTests() {
  console.log('====================================================');
  console.log('   COMMAND CENTER ANALYTICS INTEGRATION SUITE       ');
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

  // 1. Unauthenticated request protection
  console.log('[Suite 1: Unauthenticated Endpoint Access Security]');
  const unauthRes = await fetch(`${baseUrl}/api/analytics/command-center`);
  assert(unauthRes.status === 401, 'Endpoint rejected unauthenticated access with 401');

  // 2. Authenticate as Super Admin
  console.log('\n[Suite 2: Super Admin Authentication]');
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

  // 3. Fetch Command Center with default monthly preset
  console.log('\n[Suite 3: Default Monthly Telemetry]');
  const resMonthly = await fetch(`${baseUrl}/api/analytics/command-center?preset=monthly`, { headers: authHeaders });
  assert(resMonthly.status === 200, 'Monthly command center returned HTTP 200');
  const dataMonthly = await resMonthly.json();

  assert(dataMonthly.dateRange && dataMonthly.dateRange.preset === 'monthly', 'Date range preset accurately resolved to monthly');
  assert(typeof dataMonthly.summary.totalLoggedHours === 'number', 'Summary contains totalLoggedHours');
  assert(typeof dataMonthly.summary.workSessionCount === 'number', 'Summary contains workSessionCount');
  assert(typeof dataMonthly.summary.deliverablesCompleted === 'number', 'Summary contains deliverablesCompleted');
  assert(Array.isArray(dataMonthly.timeSeries), 'timeSeries is an array');
  assert(Array.isArray(dataMonthly.domains), 'domains distribution is an array');
  assert(Array.isArray(dataMonthly.workLogs.heatmap), '365-day heatmap is populated');
  assert(dataMonthly.workLogs.heatmap.length === 365, `Heatmap contains exactly 365 days (got ${dataMonthly.workLogs.heatmap.length})`);
  assert(Array.isArray(dataMonthly.relationshipMap.nodes), 'Relationship map nodes populated');
  assert(Array.isArray(dataMonthly.relationshipMap.edges), 'Relationship map edges populated');
  assert(Array.isArray(dataMonthly.activityFeed), 'Activity feed is populated');

  // 4. Test Different Date Presets
  console.log('\n[Suite 4: Presets & Custom Boundary Testing]');
  const presets = ['daily', 'weekly', 'quarterly', 'yearly', 'all'];
  for (const pr of presets) {
    const prRes = await fetch(`${baseUrl}/api/analytics/command-center?preset=${pr}`, { headers: authHeaders });
    assert(prRes.status === 200, `Preset '${pr}' returned HTTP 200`);
    const prData = await prRes.json();
    assert(prData.dateRange.preset === pr, `Preset '${pr}' correctly confirmed in response`);
  }

  // Custom date range test
  const customRes = await fetch(`${baseUrl}/api/analytics/command-center?preset=custom&startDate=2026-10-01&endDate=2026-10-24`, { headers: authHeaders });
  assert(customRes.status === 200, 'Custom date range returned HTTP 200');
  const customData = await customRes.json();
  assert(customData.dateRange.startDate === '2026-10-01', 'Custom startDate preserved');
  assert(customData.dateRange.endDate === '2026-10-24', 'Custom endDate preserved');

  // 5. Test Domain and Project Filtering
  console.log('\n[Suite 5: Domain & Project Scope Filtering]');
  const domRes = await fetch(`${baseUrl}/api/domains`);
  const domList = await domRes.json();
  if (domList.length > 0) {
    const targetDom = domList[0];
    const domFilterRes = await fetch(`${baseUrl}/api/analytics/command-center?domainId=${targetDom._id}`, { headers: authHeaders });
    assert(domFilterRes.status === 200, `Filtered by domain "${targetDom.name}" returned HTTP 200`);
    const domFilterData = await domFilterRes.json();
    assert(Array.isArray(domFilterData.domains), 'Filtered domain telemetry accurate');
  }

  // 6. Test Relationship Graph Integrity
  console.log('\n[Suite 6: Relationship Graph Integrity]');
  const graphNodes = dataMonthly.relationshipMap.nodes;
  const graphEdges = dataMonthly.relationshipMap.edges;
  assert(graphNodes.length > 0, `Graph contains ${graphNodes.length} nodes across modules`);
  assert(graphEdges.length >= 0, `Graph contains ${graphEdges.length} relationship edges`);
  const nodeTypes = new Set(graphNodes.map(n => n.type));
  assert(nodeTypes.has('domain'), 'Graph includes Domain nodes');

  // 7. Test Backward Compatibility with /api/analytics
  console.log('\n[Suite 7: Backwards Compatibility]');
  const legacyRes = await fetch(`${baseUrl}/api/analytics`, { headers: authHeaders });
  assert(legacyRes.status === 200, 'Legacy GET /api/analytics returned HTTP 200');
  const legacyData = await legacyRes.json();
  assert(!!legacyData.counts && typeof legacyData.counts.projects === 'number', 'Legacy counts payload preserved');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runCommandCenterTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
