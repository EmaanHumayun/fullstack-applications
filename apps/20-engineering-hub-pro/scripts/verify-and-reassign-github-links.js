import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ECOSYSTEM_BASE = path.join(__dirname, '..', 'github-ecosystem');

const GITHUB_USERNAME = 'EmaanHumayun';

async function reassignLinks() {
  console.log('[REASSIGN] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[REASSIGN] Connected successfully.');

  const db = mongoose.connection.db;
  const projectCol = db.collection('projects');
  const labCol = db.collection('practicelabs');
  const assignmentCol = db.collection('assignments');

  let updatedProjects = 0;
  let missingProjects = 0;

  // 1. Level Repositories & Subproject Mapping Configurations
  const LEVEL_MAPPINGS = [
    // Backend
    { repo: 'backend-beginner-projects', sub: 'projects', start: 1, end: 5, ecosystem: 'Backend Engineering Ecosystem' },
    { repo: 'backend-intermediate-projects', sub: 'projects', start: 6, end: 10, ecosystem: 'Backend Engineering Ecosystem' },
    { repo: 'backend-advanced-projects', sub: 'projects', start: 11, end: 15, ecosystem: 'Backend Engineering Ecosystem' },
    { repo: 'backend-professional-projects', sub: 'projects', start: 16, end: 20, ecosystem: 'Backend Engineering Ecosystem' },

    // Automation & Integrations
    { repo: 'automation-beginner-projects', sub: '', start: 1, end: 5, ecosystem: 'Automation & Integration Engineering Ecosystem' },
    { repo: 'automation-intermediate-projects', sub: '', start: 6, end: 10, ecosystem: 'Automation & Integration Engineering Ecosystem' },
    { repo: 'automation-advanced-projects', sub: '', start: 11, end: 15, ecosystem: 'Automation & Integration Engineering Ecosystem' },
    { repo: 'automation-professional-projects', sub: '', start: 16, end: 20, ecosystem: 'Automation & Integration Engineering Ecosystem' },

    // AI Agents
    { repo: 'ai-agents-beginner-projects', sub: 'projects', start: 1, end: 5, ecosystem: 'AI Agent Engineering & Agentic Systems' },
    { repo: 'ai-agents-intermediate-projects', sub: 'projects', start: 6, end: 10, ecosystem: 'AI Agent Engineering & Agentic Systems' },
    { repo: 'ai-agents-advanced-projects', sub: 'projects', start: 11, end: 15, ecosystem: 'AI Agent Engineering & Agentic Systems' },
    { repo: 'ai-agents-professional-projects', sub: 'projects', start: 16, end: 20, ecosystem: 'AI Agent Engineering & Agentic Systems' }
  ];

  console.log('\n--- SCANNING AND REASSIGNING 60 PROGRESSIVE PROJECTS ---');

  for (const m of LEVEL_MAPPINGS) {
    const repoDiskPath = path.join(ECOSYSTEM_BASE, m.repo);
    if (!fs.existsSync(repoDiskPath)) {
      console.error(`[WARN] Repository not found on disk: ${m.repo}`);
      continue;
    }

    const searchDir = m.sub ? path.join(repoDiskPath, m.sub) : repoDiskPath;
    if (!fs.existsSync(searchDir)) {
      console.error(`[WARN] Search directory not found: ${searchDir}`);
      continue;
    }

    const existingDirs = fs.readdirSync(searchDir).filter(d => {
      try { return fs.statSync(path.join(searchDir, d)).isDirectory(); } catch { return false; }
    });

    for (let num = m.start; num <= m.end; num++) {
      const prefix = String(num).padStart(2, '0');
      const matchedDir = existingDirs.find(d => d.startsWith(`${prefix}-`));

      if (!matchedDir) {
        console.error(`[NOT FOUND] Project #${prefix} in ${m.repo}`);
        missingProjects++;
        continue;
      }

      const relativeFolder = m.sub ? `${m.sub}/${matchedDir}` : matchedDir;
      const accurateGithubUrl = `https://github.com/${GITHUB_USERNAME}/${m.repo}/tree/main/${relativeFolder}`;
      const accurateLocalPath = path.join(repoDiskPath, relativeFolder).replace(/\\/g, '/');

      // Find the project document in MongoDB
      // Match by ecosystem and projectNumber
      const projectDoc = await projectCol.findOne({
        ecosystem: m.ecosystem,
        projectNumber: num
      });

      if (projectDoc) {
        await projectCol.updateOne(
          { _id: projectDoc._id },
          {
            $set: {
              githubUrl: accurateGithubUrl,
              localPath: accurateLocalPath,
              githubVerified: true,
              links: [
                {
                  label: 'GitHub Directory',
                  url: accurateGithubUrl,
                  type: 'github'
                }
              ],
              updatedAt: new Date()
            }
          }
        );
        console.log(`[UPDATED] #${prefix} ${projectDoc.title} -> ${accurateGithubUrl}`);
        updatedProjects++;
      } else {
        console.warn(`[MONGO MISSING] No DB record for ${m.ecosystem} #${num}`);
      }
    }
  }

  // 2. Reassign Root Hubs and Level Repositories
  console.log('\n--- REASSIGNING HUB & LEVEL REPOSITORIES ---');
  const ALL_ROOT_REPOS = [
    { slug: 'backend-engineering-hub', name: 'Backend Engineering Master Hub' },
    { slug: 'backend-beginner-projects', name: 'Backend Beginner Projects (Level 1)' },
    { slug: 'backend-intermediate-projects', name: 'Backend Intermediate Projects (Level 2)' },
    { slug: 'backend-advanced-projects', name: 'Backend Advanced Projects (Level 3)' },
    { slug: 'backend-professional-projects', name: 'Backend Professional Projects (Level 4)' },

    { slug: 'automation-integration-hub', name: 'Automation & Integration Engineering Hub' },
    { slug: 'automation-beginner-projects', name: 'Automation Beginner Projects (Level 1)' },
    { slug: 'automation-intermediate-projects', name: 'Automation Intermediate Projects (Level 2)' },
    { slug: 'automation-advanced-projects', name: 'Automation Advanced Projects (Level 3)' },
    { slug: 'automation-professional-projects', name: 'Automation Professional Projects (Level 4)' },

    { slug: 'ai-agent-engineering-hub', name: 'AI Agent Engineering & Systems Hub' },
    { slug: 'ai-agents-beginner-projects', name: 'AI Agents Beginner Projects (Level 1)' },
    { slug: 'ai-agents-intermediate-projects', name: 'AI Agents Intermediate Projects (Level 2)' },
    { slug: 'ai-agents-advanced-projects', name: 'AI Agents Advanced Projects (Level 3)' },
    { slug: 'ai-agents-professional-projects', name: 'AI Agents Professional Projects (Level 4)' },

    { slug: 'devops-engineering-bootcamp', name: 'DevOps Engineering Bootcamp Archive' },
    { slug: 'devops-practice-labs', name: 'DevOps & Cloud Practice Labs' },
    { slug: 'cloud-infrastructure-iac', name: 'Production Cloud Infrastructure as Code (IaC)' },
    { slug: 'devops-assignments-challenges', name: 'DevOps Systems Architecture & Case Studies' },

    { slug: 'fullstack-applications', name: 'Full-Stack Applications Portfolio' },
    { slug: 'fullstack-cloud-native-app', name: 'Enterprise Cloud-Native Full-Stack Platform' },
    { slug: '50-javascript-projects', name: '50 JavaScript Production Projects Suite' },
    { slug: 'engineering-portfolio', name: 'Central Engineering Portfolio & Architecture Hub' },
    { slug: 'EmaanHumayun', name: 'Emaan Humayun Profile & Identity' }
  ];

  for (const r of ALL_ROOT_REPOS) {
    const rootGhUrl = `https://github.com/${GITHUB_USERNAME}/${r.slug}`;
    const rootLocalPath = path.join(ECOSYSTEM_BASE, r.slug).replace(/\\/g, '/');

    const res = await projectCol.updateOne(
      { slug: r.slug },
      {
        $set: {
          githubUrl: rootGhUrl,
          localPath: rootLocalPath,
          githubVerified: true,
          links: [
            {
              label: 'GitHub Repository',
              url: rootGhUrl,
              type: 'github'
            }
          ],
          updatedAt: new Date()
        }
      }
    );
    if (res.matchedCount > 0) {
      console.log(`[REPO UPDATED] ${r.slug} -> ${rootGhUrl}`);
    }
  }

  // 3. Reassign Flagship App: Engineering Hub Pro inside fullstack-applications
  console.log('\n--- REASSIGNING FLAGSHIP APPS ---');
  const hubProUrl = `https://github.com/${GITHUB_USERNAME}/fullstack-applications/tree/main/apps/20-engineering-hub-pro`;
  const hubProLocal = path.join(ECOSYSTEM_BASE, 'fullstack-applications', 'apps', '20-engineering-hub-pro').replace(/\\/g, '/');
  await projectCol.updateOne(
    { slug: 'engineering-hub-pro' },
    {
      $set: {
        githubUrl: hubProUrl,
        localPath: hubProLocal,
        githubVerified: true,
        links: [{ label: 'GitHub Source', url: hubProUrl, type: 'github' }]
      }
    }
  );
  console.log(`[APP UPDATED] engineering-hub-pro -> ${hubProUrl}`);

  // 4. Reassign DevOps Practice Labs
  console.log('\n--- REASSIGNING DEVOPS PRACTICE LABS ---');
  const labsOnDisk = [
    { labId: 'lab-01', folder: 'module-01-linux-automation' },
    { labId: 'lab-02', folder: 'module-02-docker-containerization' },
    { labId: 'lab-03', folder: 'module-03-kubernetes-orchestration' },
    { labId: 'lab-04', folder: 'module-04-networking-troubleshooting' },
    { labId: 'lab-05', folder: 'module-05-terraform-opentofu-iac' },
    { labId: 'lab-06', folder: 'module-06-cicd-github-actions' },
    { labId: 'lab-07', folder: 'module-07-helm-packaging' },
    { labId: 'lab-08', folder: 'module-08-observability-telemetry' }
  ];

  for (const l of labsOnDisk) {
    const labUrl = `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/${l.folder}`;
    await labCol.updateOne(
      { $or: [{ labId: l.labId }, { slug: l.folder }, { title: new RegExp(l.folder.replace(/-/g, ' '), 'i') }] },
      {
        $set: {
          githubUrl: labUrl,
          externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`,
          updatedAt: new Date()
        }
      }
    );
    console.log(`[LAB UPDATED] ${l.folder} -> ${labUrl}`);
  }

  // 5. Reassign DevOps Architecture Assignments
  console.log('\n--- REASSIGNING DEVOPS ARCHITECTURE ASSIGNMENTS ---');
  const assignmentsOnDisk = [
    { num: 1, folder: 'assignment-01-high-availability-vpc' },
    { num: 2, folder: 'assignment-02-zero-downtime-k8s-rollout' },
    { num: 3, folder: 'assignment-03-secure-ci-cd-pipeline' }
  ];

  for (const a of assignmentsOnDisk) {
    const assignUrl = `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges/tree/main/${a.folder}`;
    await assignmentCol.updateOne(
      { $or: [{ assignmentNumber: a.num }, { slug: a.folder }, { title: new RegExp(a.folder.replace(/-/g, ' '), 'i') }] },
      {
        $set: {
          githubUrl: assignUrl,
          externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges`,
          updatedAt: new Date()
        }
      }
    );
    console.log(`[ASSIGNMENT UPDATED] ${a.folder} -> ${assignUrl}`);
  }

  console.log(`\n======================================================`);
  console.log(`   REASSIGNMENT SUMMARY:`);
  console.log(`   Projects Updated: ${updatedProjects}/60`);
  console.log(`   Missing: ${missingProjects}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

reassignLinks().catch(err => {
  console.error('[FATAL REASSIGN ERROR]', err);
  process.exit(1);
});
