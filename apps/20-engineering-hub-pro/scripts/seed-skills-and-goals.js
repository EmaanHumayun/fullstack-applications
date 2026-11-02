import 'dotenv/config';
import mongoose from 'mongoose';
import { Skill } from '../server/models/Skill.js';
import { Goal } from '../server/models/Goal.js';
import { Project } from '../server/models/Project.js';
import { Certificate } from '../server/models/Certificate.js';

async function seed() {
  console.log('[seed] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[seed] Connected successfully.');

  // Clean duplicate test records
  const rustSkills = await Skill.find({ name: 'Rust Systems Programming' });
  if (rustSkills.length > 1) {
    const idsToDelete = rustSkills.slice(1).map(s => s._id);
    await Skill.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`[seed] Cleaned up ${idsToDelete.length} duplicate test skills.`);
  }

  const ckaGoals = await Goal.find({ title: 'Attain CKA Certification' });
  if (ckaGoals.length > 1) {
    const idsToDelete = ckaGoals.slice(1).map(g => g._id);
    await Goal.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`[seed] Cleaned up ${idsToDelete.length} duplicate test goals.`);
  }

  // Find existing projects for linking
  const projects = await Project.find({ isArchived: false });
  const hubPro = projects.find(p => p.slug === 'engineering-hub-pro') || projects[0];
  const taxEngine = projects.find(p => p.slug === 'tax-calculation-pipeline') || projects[1] || projects[0];

  // Find existing certificates for linking
  const certs = await Certificate.find({ isArchived: false });
  const sampleCert = certs[0];

  // Define 13 core domain skill blueprints
  const skillDefinitions = [
    // 1. Programming Languages
    {
      name: 'Python',
      category: 'Programming Languages',
      subcategory: 'Scripting & Automation',
      tags: ['python', 'backend', 'data', 'typing'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 88,
      priority: 'High',
      isFeatured: true,
      featuredOrder: 1,
      publicDescription: 'Idiomatic Python 3 for scalable microservices, async workflows, and automated ETL pipelines.',
      description: 'Used extensively for backend APIs, asynchronous workers, and agentic orchestration engines.',
      nextAction: 'Deepen knowledge of C-extensions and memory profiling under high concurrent loads.',
      strengths: ['Clean architectural patterns', 'FastAPI/asyncio mastery', 'Data manipulation'],
      knownGaps: ['C-level extension development', 'Custom Python memory allocators'],
      practicalEvidence: [{
        title: 'Tax Engine Calculation Core',
        url: 'https://github.com/EmaanHumayun',
        description: 'Implemented deterministic mathematical parsing pipeline in Python.',
        date: new Date('2026-08-15')
      }],
      practiceHistory: [{
        date: new Date('2026-10-18'),
        durationMinutes: 90,
        topic: 'Concurrency & Threading Models',
        learnings: 'Evaluated asyncio event loop vs multiprocessing for CPU-bound parsing jobs.',
        challenges: 'Process pool memory overhead with large ASTs.',
        nextAction: 'Benchmark subinterpreters in Python 3.12+'
      }]
    },
    {
      name: 'TypeScript',
      category: 'Programming Languages',
      subcategory: 'Static Typing',
      tags: ['typescript', 'node', 'react', 'types'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 85,
      priority: 'High',
      isFeatured: true,
      featuredOrder: 2,
      publicDescription: 'Strict type systems, generative generics, and bulletproof contracts across client and server.',
      description: 'Core language for full-stack engineering, strict null checks, and type-level assertions.',
      nextAction: 'Explore advanced template literal types for compile-time query validation.'
    },
    {
      name: 'Bash & Shell Scripting',
      category: 'Programming Languages',
      subcategory: 'Automation',
      tags: ['bash', 'linux', 'automation', 'cli'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 7,
      status: 'Practising',
      proficiencyPercentage: 70,
      priority: 'Medium',
      isFeatured: false,
      publicDescription: 'POSIX-compliant shell scripting, CI/CD pipeline automation, and server configuration.',
      description: 'Automates environment bootstrapping, database backups, and health monitoring.'
    },

    // 2. Frontend Engineering
    {
      name: 'React & Vite',
      category: 'Frontend Engineering',
      subcategory: 'Modern UI Engineering',
      tags: ['react', 'vite', 'ui', 'hooks', 'performance'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 90,
      priority: 'High',
      isFeatured: true,
      featuredOrder: 3,
      publicDescription: 'Component architecture, custom hooks, atomic state management, and optimized rendering.',
      description: 'Engineered high-performance administrative dashboards and responsive portfolio showcases with zero layout shift.',
      relatedProjects: hubPro ? [hubPro._id] : []
    },
    {
      name: 'Accessibility & Design Systems',
      category: 'Frontend Engineering',
      subcategory: 'UX Engineering',
      tags: ['a11y', 'wcag', 'css', 'design-tokens'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 8,
      status: 'Practising',
      proficiencyPercentage: 75,
      priority: 'High',
      publicDescription: 'WCAG 2.1 AA compliant UI, keyboard navigation, high-contrast color tokens, and screen reader testing.'
    },

    // 3. Backend Engineering
    {
      name: 'Node.js & Express',
      category: 'Backend Engineering',
      subcategory: 'REST APIs & Middleware',
      tags: ['nodejs', 'express', 'rest', 'api', 'backend'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 92,
      priority: 'Critical',
      isFeatured: true,
      featuredOrder: 4,
      publicDescription: 'Scalable REST APIs, structured middleware pipelines, RBAC auth guards, and enterprise security.',
      description: 'Production architecture powering Engineering Hub Pro with automated audits and rate-limiting.',
      relatedProjects: hubPro ? [hubPro._id] : [],
      practicalEvidence: [{
        title: 'RBAC Authorization Layer',
        description: 'Hierarchical role validator and audit logging middleware in Express.',
        url: 'https://github.com/EmaanHumayun',
        date: new Date('2026-09-01')
      }]
    },
    {
      name: 'Distributed System Design',
      category: 'Backend Engineering',
      subcategory: 'Architecture & Scaling',
      tags: ['system-design', 'microservices', 'caching', 'fault-tolerance'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 8,
      status: 'Practising',
      proficiencyPercentage: 78,
      priority: 'Critical',
      isFeatured: true,
      featuredOrder: 5,
      publicDescription: 'Idempotent APIs, distributed rate limiting, event-driven architecture, and CAP trade-offs.'
    },

    // 4. Databases and Data Engineering
    {
      name: 'MongoDB & Mongoose',
      category: 'Databases and Data Engineering',
      subcategory: 'Document Databases',
      tags: ['mongodb', 'nosql', 'mongoose', 'indexing'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 88,
      priority: 'High',
      isFeatured: true,
      featuredOrder: 6,
      publicDescription: 'Schema design, compound indexes, aggregation pipelines, and transaction coordination.',
      relatedProjects: hubPro ? [hubPro._id] : []
    },
    {
      name: 'SQL & Relational Modeling',
      category: 'Databases and Data Engineering',
      subcategory: 'Relational Databases',
      tags: ['sql', 'postgres', 'normalization', 'acid'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 8,
      status: 'Practising',
      proficiencyPercentage: 76,
      priority: 'High',
      publicDescription: '3NF normalization, foreign key constraints, analytical queries, and ACID transactional semantics.'
    },

    // 5. Full-Stack Engineering
    {
      name: 'Full-Stack Application Architecture',
      category: 'Full-Stack Engineering',
      subcategory: 'End-to-End Systems',
      tags: ['fullstack', 'architecture', 'integration'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 86,
      priority: 'High',
      publicDescription: 'Clean separation of concerns, secure cookie session protocols, and resilient API contracts.',
      relatedProjects: hubPro ? [hubPro._id] : []
    },

    // 6. Integrations and Automation
    {
      name: 'Webhooks & Third-Party APIs',
      category: 'Integrations and Automation',
      subcategory: 'Event Webhooks',
      tags: ['webhooks', 'oauth', 'integrations', 'rest'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 8,
      status: 'Demonstrated',
      proficiencyPercentage: 80,
      priority: 'Medium',
      publicDescription: 'Signature verification, retry queues, exponential backoff, and OAuth2 flow integrations.'
    },

    // 7. AI and Machine Learning
    {
      name: 'Agentic AI & LLM Systems',
      category: 'AI and Machine Learning',
      subcategory: 'Autonomous Agents',
      tags: ['ai', 'llm', 'rag', 'agents', 'prompt-engineering'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 8,
      status: 'Learning',
      proficiencyPercentage: 74,
      priority: 'Critical',
      isFeatured: true,
      featuredOrder: 7,
      publicDescription: 'Multi-agent orchestration, context retrieval (RAG), structured tool calling, and deterministic validation.',
      practiceHistory: [{
        date: new Date('2026-10-20'),
        durationMinutes: 120,
        topic: 'Multi-Step Agent Reflection',
        learnings: 'Implemented automated self-correction loops with structured schema outputs.',
        challenges: 'Context window drift during recursive loops.',
        nextAction: 'Integrate vector similarity reranking'
      }]
    },

    // 8. Cybersecurity
    {
      name: 'Web Application Security',
      category: 'Cybersecurity',
      subcategory: 'Defensive Security',
      tags: ['security', 'owasp', 'jwt', 'rbac', 'sanitization'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 85,
      priority: 'Critical',
      isFeatured: true,
      featuredOrder: 8,
      publicDescription: 'OWASP Top 10 mitigation, secure HTTP-only cookie tokens, input sanitization, and timing attack protection.',
      relatedProjects: hubPro ? [hubPro._id] : []
    },

    // 9. Computer Networking and Systems
    {
      name: 'TCP/IP & Network Protocols',
      category: 'Computer Networking and Systems',
      subcategory: 'Networking Foundations',
      tags: ['networking', 'tcp', 'dns', 'http', 'ssl'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 7,
      status: 'Practising',
      proficiencyPercentage: 72,
      priority: 'Medium',
      publicDescription: 'DNS resolution, TLS handshakes, socket lifecycle, and network layer packet inspection.'
    },

    // 10. Cloud, DevOps and Infrastructure
    {
      name: 'Docker & Containerization',
      category: 'Cloud, DevOps and Infrastructure',
      subcategory: 'Containers',
      tags: ['docker', 'containers', 'devops', 'deployment'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 8,
      status: 'Demonstrated',
      proficiencyPercentage: 78,
      priority: 'High',
      publicDescription: 'Multi-stage Dockerfiles, image size minimization, non-root user containment, and local compose orchestration.'
    },

    // 11. Software Engineering Foundations
    {
      name: 'Data Structures & Algorithms',
      category: 'Software Engineering Foundations',
      subcategory: 'Core Computer Science',
      tags: ['dsa', 'algorithms', 'trees', 'graphs', 'complexity'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 8,
      status: 'Demonstrated',
      proficiencyPercentage: 82,
      priority: 'High',
      publicDescription: 'Graph traversals, dynamic programming, time/space complexity analysis, and invariant verification.'
    },

    // 12. Data, Analytics and BI
    {
      name: 'Telemetry & Analytics Visualization',
      category: 'Data, Analytics and BI',
      subcategory: 'Engineering Metrics',
      tags: ['analytics', 'metrics', 'charts', 'telemetry'],
      level: 'Intermediate',
      targetProficiency: 'Advanced',
      confidenceRating: 8,
      status: 'Demonstrated',
      proficiencyPercentage: 77,
      priority: 'Medium',
      publicDescription: 'Audit logging aggregation, performance metric graphing, and responsive data visualization.'
    },

    // 13. Research and Technical Communication
    {
      name: 'Technical Writing & Architecture Blueprints',
      category: 'Research and Technical Communication',
      subcategory: 'Documentation',
      tags: ['architecture', 'documentation', 'adr', 'blueprints'],
      level: 'Advanced',
      targetProficiency: 'Expert',
      confidenceRating: 9,
      status: 'Demonstrated',
      proficiencyPercentage: 90,
      priority: 'High',
      isFeatured: true,
      featuredOrder: 9,
      publicDescription: 'Comprehensive system architecture documentation, Architectural Decision Records (ADRs), and technical specifications.',
      relatedProjects: hubPro ? [hubPro._id] : []
    }
  ];

  console.log(`[seed] Upserting ${skillDefinitions.length} core engineering skills...`);
  const createdSkills = [];

  for (const def of skillDefinitions) {
    const existing = await Skill.findOne({ name: def.name });
    if (existing) {
      Object.assign(existing, def);
      existing.isArchived = false;
      await existing.save();
      createdSkills.push(existing);
    } else {
      const created = await Skill.create({
        ...def,
        isArchived: false
      });
      createdSkills.push(created);
    }
  }

  console.log(`[seed] Successfully processed ${createdSkills.length} skills.`);

  // Link Skills to Goals and setup comprehensive Goals
  const pythonSkill = createdSkills.find(s => s.name === 'Python');
  const nodeSkill = createdSkills.find(s => s.name === 'Node.js & Express');
  const aiSkill = createdSkills.find(s => s.name === 'Agentic AI & LLM Systems');
  const secSkill = createdSkills.find(s => s.name === 'Web Application Security');
  const distSkill = createdSkills.find(s => s.name === 'Distributed System Design');

  const goalsToSetup = [
    {
      title: 'Production Distributed Systems & Agentic Orchestration',
      category: 'Technical Mastery',
      timeHorizon: 'Strategic Goal',
      priority: 'Critical',
      status: 'Active',
      startDate: new Date('2026-06-01'),
      deadline: new Date('2026-12-15'),
      targetDate: '2026-12-15',
      whyItMatters: 'Transition from basic backend services to fault-tolerant, self-healing distributed agents capable of processing complex enterprise workloads with high reliability.',
      measurableSuccessCriteria: 'Sub-50ms p95 latency on API routes, 99.9% uptime across background worker queues, and automated test coverage exceeding 90%.',
      targetOutcome: 'Full production-grade multi-agent engine deployed on sovereign container cluster.',
      progressMode: 'milestones',
      associatedProjects: hubPro ? [hubPro._id] : [],
      linkedSkills: [nodeSkill?._id, aiSkill?._id, distSkill?._id].filter(Boolean),
      requiredSkills: [
        { skill: distSkill?._id, targetLevel: 'Advanced', isAcquired: false },
        { skill: aiSkill?._id, targetLevel: 'Advanced', isAcquired: false }
      ].filter(r => r.skill),
      milestonesList: [
        {
          title: 'Establish Event-Driven Microservice Architecture',
          description: 'Design decoupled message exchange between API gateway and worker daemons.',
          sequence: 1,
          weight: 2,
          isCompleted: true,
          completedAt: new Date('2026-08-20'),
          evidenceUrl: 'https://github.com/EmaanHumayun'
        },
        {
          title: 'Implement Multi-Palette Design & Telemetry System',
          description: 'Complete application-wide dynamic theming and live database performance monitoring.',
          sequence: 2,
          weight: 2,
          isCompleted: true,
          completedAt: new Date('2026-10-23')
        },
        {
          title: 'Deploy Production Vector Store & Context Reranker',
          description: 'Integrate hybrid dense/sparse retrieval with sub-50ms query latency.',
          sequence: 3,
          weight: 3,
          dueDate: new Date('2026-11-20'),
          isCompleted: false
        },
        {
          title: 'End-to-End Disaster Recovery & Chaos Validation',
          description: 'Simulate database partition and worker failure with automated failover testing.',
          sequence: 4,
          weight: 3,
          dueDate: new Date('2026-12-10'),
          isCompleted: false
        }
      ],
      tasks: [
        {
          title: 'Configure automated connection pooling in MongoDB',
          priority: 'High',
          status: 'completed',
          isCompleted: true,
          completedAt: new Date('2026-10-22'),
          estimatedHours: 4,
          actualHours: 3
        },
        {
          title: 'Benchmark latency distribution across concurrent worker threads',
          priority: 'High',
          status: 'in_progress',
          isCompleted: false,
          dueDate: new Date('2026-11-05'),
          estimatedHours: 6,
          actualHours: 2
        },
        {
          title: 'Write Architectural Decision Record (ADR) for retrieval pipeline',
          priority: 'Normal',
          status: 'todo',
          isCompleted: false,
          dueDate: new Date('2026-11-12'),
          estimatedHours: 3
        }
      ],
      reviews: [
        {
          date: new Date('2026-10-20'),
          completedSummary: 'Finalized multi-palette theme architecture and authenticated RBAC middleware.',
          uncompletedSummary: 'Deferred vector store index clustering to next sprint.',
          blockers: 'None at present; API response times within 25ms threshold.',
          learnings: 'CSS color-mix in srgb provides zero-runtime theme transitions without CSS-in-JS overhead.',
          isDeadlineRealistic: true,
          nextCommitments: 'Integrate comprehensive Skills and Goals analytics with real-time UI charts.'
        }
      ]
    },
    {
      title: 'Deploy Hardened Zero-Trust API Gateway',
      category: 'Projects and Portfolio',
      timeHorizon: 'Short-term Goal',
      priority: 'High',
      status: 'Active',
      startDate: new Date('2026-09-01'),
      deadline: new Date('2026-11-30'),
      targetDate: '2026-11-30',
      whyItMatters: 'Protect all administrative API surfaces against credential stuffing, timing attacks, and privilege escalation.',
      measurableSuccessCriteria: 'Zero critical/high vulnerabilities on automated security scans, strict audit trail logging for all mutations.',
      progressMode: 'milestones',
      associatedProjects: hubPro ? [hubPro._id] : [],
      linkedSkills: [nodeSkill?._id, secSkill?._id].filter(Boolean),
      requiredSkills: [
        { skill: secSkill?._id, targetLevel: 'Expert', isAcquired: false }
      ].filter(r => r.skill),
      milestonesList: [
        {
          title: 'Implement HTTP-Only Cookie Authentication with CSRF Protections',
          sequence: 1,
          weight: 1,
          isCompleted: true,
          completedAt: new Date('2026-09-25')
        },
        {
          title: 'Add Role-Based Access Control (RBAC) with Audit Logging',
          sequence: 2,
          weight: 1,
          isCompleted: true,
          completedAt: new Date('2026-10-15')
        },
        {
          title: 'Implement Granular Rate-Limiting & IP Guard Middleware',
          sequence: 3,
          weight: 1,
          dueDate: new Date('2026-11-15'),
          isCompleted: false
        }
      ]
    },
    {
      title: 'Principal Systems Architect Career Horizon',
      category: 'Career and Professional Growth',
      timeHorizon: 'Long-term Vision',
      priority: 'Normal',
      status: 'Active',
      startDate: new Date('2026-01-01'),
      deadline: new Date('2027-12-31'),
      targetDate: '2027-12-31',
      whyItMatters: 'Attain recognized principal-level engineering depth in distributed cloud systems, security architecture, and autonomous intelligence.',
      measurableSuccessCriteria: 'Published open-source tools with active community adoption, production enterprise references, and verified technical credentials.',
      progressMode: 'milestones',
      milestonesList: [
        {
          title: 'Architect and Publish Production Engineering Hub Pro Platform',
          sequence: 1,
          weight: 1,
          isCompleted: true,
          completedAt: new Date('2026-10-23')
        },
        {
          title: 'Publish 5 Technical Case Studies & System Blueprints',
          sequence: 2,
          weight: 2,
          dueDate: new Date('2027-03-31'),
          isCompleted: false
        },
        {
          title: 'Lead Multi-Node Distributed Architecture Implementation',
          sequence: 3,
          weight: 3,
          dueDate: new Date('2027-09-30'),
          isCompleted: false
        }
      ]
    }
  ];

  console.log(`[seed] Upserting ${goalsToSetup.length} strategic goals...`);
  for (const gDef of goalsToSetup) {
    const existing = await Goal.findOne({ title: gDef.title });
    if (existing) {
      Object.assign(existing, gDef);
      existing.isArchived = false;
      existing.recalculateProgress();
      await existing.save();
    } else {
      const g = new Goal({ ...gDef, isArchived: false });
      g.recalculateProgress();
      await g.save();
    }
  }

  // Update skills with relatedGoals references
  const updatedGoals = await Goal.find({ isArchived: false });
  for (const g of updatedGoals) {
    if (g.linkedSkills && g.linkedSkills.length > 0) {
      for (const sId of g.linkedSkills) {
        await Skill.findByIdAndUpdate(sId, {
          $addToSet: { relatedGoals: g._id }
        });
      }
    }
  }

  console.log('[seed] Skills and Goals successfully linked & synchronized.');
  await mongoose.disconnect();
  console.log('[seed] Done.');
}

seed().catch(err => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
