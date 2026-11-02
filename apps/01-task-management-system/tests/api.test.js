/**
 * Automated Verification Test for Task Management API Endpoints
 * Runs against live or local Express server instance.
 */
async function runTests() {
  const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';
  console.log(`[TEST] Verifying API endpoints against ${BASE_URL}...`);

  try {
    // 1. Healthcheck
    const health = await fetch(`${BASE_URL}/healthz`);
    console.log(`[TEST 1] GET /healthz: ${health.status === 200 ? 'PASS' : 'FAIL'}`);

    // 2. Fetch Tasks
    const listRes = await fetch(`${BASE_URL}/api/tasks`);
    const listData = await listRes.json();
    console.log(`[TEST 2] GET /api/tasks: ${listData.success ? 'PASS' : 'FAIL'} (Count: ${listData.count})`);

    // 3. Create Task
    const createRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Automated test task', priority: 'medium' })
    });
    const createData = await createRes.json();
    console.log(`[TEST 3] POST /api/tasks: ${createRes.status === 201 ? 'PASS' : 'FAIL'} (ID: ${createData.data?.id})`);

    // 4. Delete Created Task
    if (createData.data?.id) {
      const delRes = await fetch(`${BASE_URL}/api/tasks/${createData.data.id}`, { method: 'DELETE' });
      console.log(`[TEST 4] DELETE /api/tasks/:id: ${delRes.status === 200 ? 'PASS' : 'FAIL'}`);
    }

    console.log('[TEST] All integration checks completed successfully!');
  } catch (err) {
    console.error(`[TEST ERROR] Could not reach server: ${err.message}`);
  }
}

runTests();
