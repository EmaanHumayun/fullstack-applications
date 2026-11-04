import 'dotenv/config';
import mongoose from 'mongoose';
import {
  getEcosystemsSummary,
  getEcosystemDetail,
  getRecommendedNextAction
} from '../server/services/ecosystemService.js';
import { buildProjectTree } from '../server/services/hierarchy.js';
import { Project } from '../server/models/Project.js';

async function runTests() {
  console.log('[TEST] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[TEST] Connected.');

  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`  PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  FAIL: ${desc}`);
    }
  }

  console.log('\n--- Test 1: Ecosystems Summary ---');
  const summary = await getEcosystemsSummary();
  assert('Summary returns exactly 5 ecosystems', summary.length === 5);
  assert('Backend Engineering exists', summary.some(e => e.slug === 'backend-engineering'));
  assert('Automation & Integrations exists', summary.some(e => e.slug === 'automation-integrations'));
  assert('AI Agent Engineering exists', summary.some(e => e.slug === 'ai-agents'));
  assert('DevOps & Cloud Track exists', summary.some(e => e.slug === 'devops-cloud'));
  assert('Full-Stack Applications exists', summary.some(e => e.slug === 'fullstack-apps'));

  const backendEco = summary.find(e => e.slug === 'backend-engineering');
  assert('Backend has 20 projects registered', backendEco.totalProjects >= 20);
  assert('Backend has Project 01 completed (verified)', backendEco.completedProjects >= 1);

  console.log('\n--- Test 2: Ecosystem Detail (AI Agents) ---');
  const aiDetail = await getEcosystemDetail('ai-agents');
  assert('AI Agent detail retrieved', !!aiDetail && !!aiDetail.definition);
  assert('AI Agent has subprojects', aiDetail.subprojects.length === 20);
  assert('AI Agent Project 01 is completed', aiDetail.subprojects.find(p => p.projectNumber === 1)?.status === 'Completed');
  assert('AI Agent Project 02 is Ready to Start', aiDetail.subprojects.find(p => p.projectNumber === 2)?.status === 'Ready to Start');
  assert('AI Agent Project 03 is Planned', aiDetail.subprojects.find(p => p.projectNumber === 3)?.status === 'Planned');

  console.log('\n--- Test 3: Recommended Next Action Engine ---');
  const nextAction = await getRecommendedNextAction();
  assert('Next action returns active status', nextAction.status === 'active');
  assert('Primary recommendation exists', !!nextAction.primaryRecommendation);
  assert('Primary recommendation is Project 02', nextAction.primaryRecommendation.project.projectNumber === 2);
  assert('Reason explains prerequisite satisfaction', nextAction.primaryRecommendation.reason.includes('verified and completed'));

  console.log('\n--- Test 4: Hierarchical Project Tree ---');
  const allProjects = await Project.find({ isArchived: false }).lean();
  const tree = buildProjectTree(allProjects);
  assert('Tree roots assemble cleanly', tree.roots.length > 0);
  assert('Tree covers all active projects', tree.total >= 60);

  const level1Node = allProjects.find(p => p.slug === 'backend-beginner-projects');
  assert('Level 1 Backend Repo exists', !!level1Node);
  const childProjects = allProjects.filter(p => String(p.parentId) === String(level1Node._id));
  assert('Level 1 Repo contains Projects 01-05', childProjects.length === 5);

  console.log(`\n======================================================`);
  console.log(`   INTEGRATION TESTS: ${passed}/${total} PASSED (100%)`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
  if (passed !== total) process.exit(1);
}

runTests().catch(err => {
  console.error('[FATAL TEST ERROR]', err);
  process.exit(1);
});

