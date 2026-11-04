import 'dotenv/config';
import mongoose from 'mongoose';

async function seed() {
  console.log('[SEED] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected successfully.');

  const db = mongoose.connection.db;

  // 1. Fetch or create domains
  console.log('[SEED] Ensuring Domains...');
  const domainCol = db.collection('domains');
  let domains = await domainCol.find({}).toArray();
  const domainMap = {};
  for (const d of domains) {
    domainMap[d.name] = d._id;
  }

  // 2. Seed Projects
  console.log('[SEED] Seeding Projects...');
  const projectCol = db.collection('projects');

  const projectsToSeed = [
    // DevOps
    {
      title: 'DevOps Engineering Bootcamp Archive',
      slug: 'devops-engineering-bootcamp',
      domain: 'Cloud & Infrastructure',
      domainId: domainMap['Cloud & Infrastructure'],
      summary: 'Structured 10-module DevOps engineering curriculum documenting Linux, networking, Git, automation, containers, CI/CD, cloud, and Kubernetes.',
      description: 'Comprehensive engineering archive containing lecture notes, command transcripts, practical lab reports, and assignment submissions covering the entire modern DevOps landscape.',
      technologies: ['Linux', 'Bash', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'GitHub Actions', 'Prometheus'],
      status: 'In progress',
      priority: 'High',
      progress: 25,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/devops-engineering-bootcamp',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/devops-engineering-bootcamp', type: 'github' }]
    },
    {
      title: 'DevOps & Cloud Practice Labs',
      slug: 'devops-practice-labs',
      domain: 'Cloud & Infrastructure',
      domainId: domainMap['Cloud & Infrastructure'],
      summary: 'Modular hands-on engineering labs covering Linux automation, Docker multi-stage builds, Kubernetes orchestration, Helm, Terraform, and Observability.',
      description: 'Production-ready lab environments and automation scripts verifying container footprints, deployment rolling updates, and monitoring metrics.',
      technologies: ['Linux', 'Docker', 'Kubernetes', 'Helm', 'Terraform', 'Prometheus'],
      status: 'Completed',
      priority: 'High',
      progress: 100,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/devops-practice-labs',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/devops-practice-labs', type: 'github' }]
    },
    {
      title: 'Production Cloud Infrastructure as Code (IaC)',
      slug: 'cloud-infrastructure-iac',
      domain: 'Cloud & Infrastructure',
      domainId: domainMap['Cloud & Infrastructure'],
      summary: 'Modular Terraform and OpenTofu blueprints for multi-AZ AWS VPCs, EKS clusters, and remote S3/DynamoDB state locking.',
      description: 'Production-grade declarative infrastructure enforcing least-privilege security groups, NAT gateways, and automated PR plan checks via GitHub Actions.',
      technologies: ['Terraform', 'OpenTofu', 'AWS', 'EKS', 'S3', 'DynamoDB'],
      status: 'Completed',
      priority: 'High',
      progress: 100,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/cloud-infrastructure-iac',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/cloud-infrastructure-iac', type: 'github' }]
    },
    {
      title: 'DevOps Systems Architecture & Case Studies',
      slug: 'devops-assignments-challenges',
      domain: 'Cloud & Infrastructure',
      domainId: domainMap['Cloud & Infrastructure'],
      summary: 'Real-world scenario case studies: high-availability multi-AZ VPC design, zero-downtime canary rollouts, and secure supply chain CI/CD.',
      description: 'Architectural blueprints and technical evaluation rubrics resolving high-concurrency traffic routing and disaster recovery.',
      technologies: ['AWS', 'Kubernetes', 'Nginx', 'GitHub Actions', 'Security'],
      status: 'In progress',
      priority: 'High',
      progress: 50,
      featured: false,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/devops-assignments-challenges',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/devops-assignments-challenges', type: 'github' }]
    },

    // Backend Engineering
    {
      title: 'Backend Engineering Master Hub',
      slug: 'backend-engineering-hub',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Central architectural hub and progressive master directory for 20 production-grade backend engineering projects.',
      description: 'Coordinated curriculum covering REST APIs, database persistence, RBAC, modular monoliths, distributed job queues, and cloud-native microservices.',
      technologies: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'BullMQ', 'Docker', 'Microservices'],
      status: 'In progress',
      priority: 'High',
      progress: 15,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/backend-engineering-hub',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/backend-engineering-hub', type: 'github' }]
    },
    {
      title: 'Backend Beginner Projects (Level 1)',
      slug: 'backend-beginner-projects',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Level 1 Projects (01-05): Foundational REST APIs, CRUD, databases, JWT auth, and media storage.',
      description: 'Includes fully verified runnable reference implementation of Task Manager REST API with integration test suite and Docker container.',
      technologies: ['Node.js', 'Express', 'JWT', 'SQLite', 'Docker'],
      status: 'In progress',
      priority: 'High',
      progress: 25,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/backend-beginner-projects',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/backend-beginner-projects', type: 'github' }]
    },
    {
      title: 'Backend Intermediate Projects (Level 2)',
      slug: 'backend-intermediate-projects',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Level 2 Projects (06-10): Enterprise RBAC, transactional e-commerce APIs, CMS search, BullMQ queues, webhooks.',
      description: 'Architectural specifications and scaffolding ready for multi-tenant access control and payment integrations.',
      technologies: ['Node.js', 'PostgreSQL', 'Redis', 'BullMQ', 'Stripe API'],
      status: 'Planned',
      priority: 'Medium',
      progress: 0,
      featured: false,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/backend-intermediate-projects',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/backend-intermediate-projects', type: 'github' }]
    },
    {
      title: 'Backend Advanced Projects (Level 3)',
      slug: 'backend-advanced-projects',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Level 3 Projects (11-15): Modular monolithic SaaS, high-throughput API gateway, WebSocket chat, Elasticsearch analytics.',
      description: 'Deep architectural exploration of distributed systems, full-text indexing, and security hardening.',
      technologies: ['TypeScript', 'WebSockets', 'Elasticsearch', 'Redis', 'Docker'],
      status: 'Planned',
      priority: 'Medium',
      progress: 0,
      featured: false,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/backend-advanced-projects',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/backend-advanced-projects', type: 'github' }]
    },
    {
      title: 'Backend Professional Projects (Level 4)',
      slug: 'backend-professional-projects',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Level 4 Projects (16-20): Cloud-native microservices, Kafka event streams, workers, booking engine, multi-tenant SaaS.',
      description: 'Enterprise distributed platforms deploying to Kubernetes with gRPC service meshes and OpenTelemetry tracing.',
      technologies: ['Go', 'Node.js', 'Kafka', 'Kubernetes', 'gRPC', 'PostgreSQL'],
      status: 'Planned',
      priority: 'Medium',
      progress: 0,
      featured: false,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/backend-professional-projects',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/backend-professional-projects', type: 'github' }]
    },

    // Automation & Integration
    {
      title: 'Automation & Integration Engineering Hub',
      slug: 'automation-integration-hub',
      domain: 'Automation & Integrations',
      domainId: domainMap['Automation & Integrations'],
      summary: 'Central hub for 20 progressive projects covering webhook triggers, SaaS APIs, DAG engines, ETL pipelines, and multi-agent AI.',
      description: 'Comprehensive curriculum and architectural guide establishing decoupling patterns, idempotency keys, and zero-trust secret handling.',
      technologies: ['Node.js', 'Python', 'TypeScript', 'Redis', 'RabbitMQ', 'Docker'],
      status: 'In progress',
      priority: 'High',
      progress: 15,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/automation-integration-hub',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/automation-integration-hub', type: 'github' }]
    },
    {
      title: 'Automation Beginner Projects (Level 1)',
      slug: 'automation-beginner-projects',
      domain: 'Automation & Integrations',
      domainId: domainMap['Automation & Integrations'],
      summary: 'Level 1 Projects (01-05): Webhook triggers, Google Sheets sync, form processing, file management, multi-API data integration.',
      description: 'Includes runnable reference implementation of Automated Email Notification System with HMAC-SHA256 signature verification.',
      technologies: ['Node.js', 'Express', 'Nodemailer', 'HMAC', 'Docker'],
      status: 'In progress',
      priority: 'High',
      progress: 25,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/automation-beginner-projects',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/automation-beginner-projects', type: 'github' }]
    },

    // AI Agents
    {
      title: 'AI Agent Engineering & Systems Hub',
      slug: 'ai-agent-engineering-hub',
      domain: 'Artificial Intelligence',
      domainId: domainMap['Artificial Intelligence'],
      summary: 'Central architectural hub, curriculum roadmap, and design guides for 20 progressive AI Agent and Agentic Systems engineering projects.',
      description: 'Structured engineering track from foundational prompt loops and tool schemas to state-machine DAG planning (LangGraph), multi-agent systems, and enterprise gateways.',
      technologies: ['Python', 'Pydantic', 'FastAPI', 'LangGraph', 'Qdrant', 'Docker'],
      status: 'In progress',
      priority: 'High',
      progress: 15,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/ai-agent-engineering-hub',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/ai-agent-engineering-hub', type: 'github' }]
    },
    {
      title: 'AI Agents Beginner Projects (Level 1)',
      slug: 'ai-agents-beginner-projects',
      domain: 'Artificial Intelligence',
      domainId: domainMap['Artificial Intelligence'],
      summary: 'Level 1 Projects (01-05): Intelligent chat agents, deterministic tool calling, research extraction, SQLite task agents, document RAG.',
      description: 'Includes verified runnable Python implementation of Intelligent AI Chat Agent with sliding-window memory and token telemetry.',
      technologies: ['Python', 'Pydantic', 'SQLite', 'Tokenizers', 'Pytest'],
      status: 'In progress',
      priority: 'High',
      progress: 25,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/ai-agents-beginner-projects',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/ai-agents-beginner-projects', type: 'github' }]
    },

    // Full-Stack
    {
      title: 'Full-Stack Applications Portfolio',
      slug: 'fullstack-applications',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Curated collection of production full-stack applications with React frontend, Express backend, and relational/document databases.',
      description: 'Permanent monorepo showcasing decoupled architectures, authentication mechanisms, containerization, and the flagship Engineering Hub Pro platform.',
      technologies: ['React 18', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker'],
      status: 'In progress',
      priority: 'High',
      progress: 50,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/fullstack-applications',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/fullstack-applications', type: 'github' }]
    },
    {
      title: 'Engineering Hub Pro (v2.0)',
      slug: 'engineering-hub-pro',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Production-grade software engineering portfolio, knowledge management, dynamic theme engine, and super admin control workspace.',
      description: 'Decoupled React 18 single-page application with Express 4 backend, MongoDB Atlas persistence, RBAC, DAG cycle prevention for hierarchical project trees, and Headless CMS.',
      technologies: ['React 18', 'Vite', 'Express.js', 'MongoDB', 'Tailwind CSS', 'JWT', 'RBAC'],
      status: 'Completed',
      priority: 'High',
      progress: 100,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/fullstack-applications/tree/main/apps/20-engineering-hub-pro',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/fullstack-applications/tree/main/apps/20-engineering-hub-pro', type: 'github' }]
    },
    {
      title: 'Enterprise Cloud-Native Full-Stack Platform',
      slug: 'fullstack-cloud-native-app',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Enterprise microservices platform with multi-stage Docker builds, health telemetry endpoints, and Kubernetes manifests.',
      description: 'Full-stack application engineered from first principles combining React frontend, Node.js REST API with Prometheus exporters, and production K8s deployment manifests.',
      technologies: ['React', 'Node.js', 'Express', 'Docker', 'Kubernetes', 'Prometheus'],
      status: 'Completed',
      priority: 'High',
      progress: 100,
      featured: true,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/fullstack-cloud-native-app',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/fullstack-cloud-native-app', type: 'github' }]
    },
    {
      title: '50 JavaScript Production Projects Suite',
      slug: '50-javascript-projects',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      summary: 'Comprehensive JavaScript engineering foundations, DOM manipulation, asynchronous algorithms, API consumption, and interactive web tools.',
      description: 'Curated suite of 50 standalone, practical JavaScript applications focusing on vanilla web standards, event loops, clean modular code, and responsive design.',
      technologies: ['JavaScript', 'Web APIs', 'DOM Manipulation', 'CSS3', 'Async/Await'],
      status: 'Completed',
      priority: 'Medium',
      progress: 100,
      featured: false,
      published: true,
      type: 'project',
      githubUrl: 'https://github.com/EmaanHumayun/50-javascript-projects',
      links: [{ label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/50-javascript-projects', type: 'github' }]
    }
  ];

  for (const p of projectsToSeed) {
    await projectCol.updateOne(
      { slug: p.slug },
      { $set: p },
      { upsert: true }
    );
    console.log(`[PROJECT] Upserted: ${p.title}`);
  }

  // 3. Seed Roadmaps
  console.log('[SEED] Seeding Roadmaps...');
  const roadmapCol = db.collection('roadmaps');

  const roadmapsToSeed = [
    {
      title: 'DevOps & Cloud Infrastructure Bootcamp',
      slug: 'devops-engineering-bootcamp-roadmap',
      domain: 'Cloud & Infrastructure',
      domainId: domainMap['Cloud & Infrastructure'],
      description: 'Structured 10-module curriculum from Linux system administration and computer networking to Kubernetes orchestration and DevSecOps.',
      status: 'in_progress',
      priority: 'High',
      progress: 30,
      visibility: 'public',
      published: true,
      phases: [
        {
          title: 'Foundations of DevOps',
          description: 'Mastering the command line, networking fundamentals, and team collaboration workflows.',
          order: 1,
          steps: [
            { title: 'Module 01: Linux & Systems Administration', description: 'File systems, processes, systemd services, users, permissions, and log rotation.', completed: true, status: 'completed', weight: 1 },
            { title: 'Module 02: Computer Networking & Security', description: 'OSI model, TCP/IP, DNS, routing, firewalls, and TLS encryption.', completed: true, status: 'completed', weight: 1 },
            { title: 'Module 03: Git & Version Control', description: 'Branching strategies, interactive rebasing, merge conflict resolution, and pull request workflows.', completed: true, status: 'completed', weight: 1 }
          ]
        },
        {
          title: 'Automation & Containerization',
          description: 'Writing automation daemons, container packaging, and continuous integration pipelines.',
          order: 2,
          steps: [
            { title: 'Module 04: Bash & Python Automation', description: 'Automated health monitoring, backup scripts, and cron scheduling.', completed: false, status: 'in_progress', weight: 2 },
            { title: 'Module 05: Docker & Containerization', description: 'Multi-stage Docker builds, layer caching, non-root users, and compose topologies.', completed: false, status: 'available', weight: 2 },
            { title: 'Module 06: CI/CD & GitHub Actions', description: 'Automated test runners, vulnerability scanning with Trivy, and artifact releases.', completed: false, status: 'available', weight: 2 }
          ]
        },
        {
          title: 'Cloud, IaC & Orchestration',
          description: 'Deploying immutable cloud networks, Kubernetes clusters, and observability stacks.',
          order: 3,
          steps: [
            { title: 'Module 07: AWS Cloud Infrastructure', description: 'VPCs, subnets, EC2, IAM roles, S3 storage, and RDS managed databases.', completed: false, status: 'available', weight: 3 },
            { title: 'Module 08: Infrastructure as Code (Terraform)', description: 'Declarative resource provisioning, remote state locking, and reusable modules.', completed: false, status: 'available', weight: 3 },
            { title: 'Module 09: Kubernetes Orchestration', description: 'Pods, Deployments, Services, ConfigMaps, Secrets, Ingress, and Helm packaging.', completed: false, status: 'available', weight: 3 },
            { title: 'Module 10: Monitoring, Observability & DevSecOps', description: 'Prometheus metrics, Grafana dashboards, Alertmanager, and security scanning.', completed: false, status: 'available', weight: 3 }
          ]
        }
      ]
    },
    {
      title: 'Backend Engineering Master Curriculum',
      slug: 'backend-engineering-master-roadmap',
      domain: 'Software Engineering',
      domainId: domainMap['Software Engineering'],
      description: 'Comprehensive 4-level progressive roadmap featuring 20 practical backend projects from foundational REST APIs to distributed microservices.',
      status: 'in_progress',
      priority: 'High',
      progress: 20,
      visibility: 'public',
      published: true,
      phases: [
        {
          title: 'Level 1: Foundational REST APIs',
          description: 'HTTP contracts, CRUD operations, database persistence, and JWT authentication.',
          order: 1,
          steps: [
            { title: 'Project 01: Task Manager REST API', description: 'Express.js server with validation, error handling, and automated integration tests.', completed: true, status: 'completed', weight: 1 },
            { title: 'Project 02: Contact Management API', description: 'Relational contacts schema with pagination, search, and SQLite/Postgres storage.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 03: URL Shortener Service', description: 'Base62 hashing, redirection metrics, and Redis caching.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 04: Authentication & Authorization API', description: 'Stateless JWT auth, refresh token rotation, and bcrypt password hashing.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 05: File Upload & Media Storage API', description: 'Multer middleware, MIME verification, and S3-compatible object storage.', completed: false, status: 'available', weight: 1 }
          ]
        },
        {
          title: 'Level 2: Intermediate Business Backends',
          description: 'Enterprise RBAC, e-commerce transactions, CMS search, and asynchronous background queues.',
          order: 2,
          steps: [
            { title: 'Project 06: Role-Based Access Control (RBAC) System', description: 'Granular permissions, role assignment, and authorization middleware.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 07: E-Commerce Backend API', description: 'Stripe webhook payment handling, order processing, and transactional consistency.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 08: Content Management API', description: 'Article publishing, tag taxonomies, and full-text search indexing.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 09: Notification Service', description: 'Multi-channel email, SMS, and webhook delivery via BullMQ queues.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 10: API Integration & Webhook Platform', description: 'Third-party API connectors with exponential backoff and replay protection.', completed: false, status: 'available', weight: 2 }
          ]
        },
        {
          title: 'Level 3: Advanced Architectures',
          description: 'Modular monoliths, API gateways, real-time WebSockets, and Elasticsearch indexing.',
          order: 3,
          steps: [
            { title: 'Project 11: Modular Monolithic SaaS Backend', description: 'Domain-driven bounded contexts in a clean modular architecture.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 12: High-Throughput API Gateway', description: 'Token bucket rate limiting, proxy routing, and JWT authorization verification.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 13: Real-Time WebSocket Chat Backend', description: 'Persistent bi-directional socket connections and Redis Pub/Sub room clustering.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 14: Advanced Search & Analytics API', description: 'Elasticsearch document indexing, faceted filtering, and aggregations.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 15: Security Hardening & Penetration Defense', description: 'OWASP Top 10 mitigation, SQL injection defense, and automated security test suite.', completed: false, status: 'available', weight: 3 }
          ]
        },
        {
          title: 'Level 4: Professional Microservices & Distributed Systems',
          description: 'Cloud-native microservices, Kafka event streams, distributed job workers, and multi-tenant SaaS.',
          order: 4,
          steps: [
            { title: 'Project 16: Microservices E-Commerce Platform', description: 'Decoupled services communicating over gRPC with independent databases.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 17: Event-Driven Order Processing System', description: 'Apache Kafka event streams, idempotency, and the Saga pattern for distributed rollbacks.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 18: Distributed Job Processing System', description: 'Worker fleet processing high-throughput batch jobs with dead-letter queues.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 19: Scalable Booking & Reservation Engine', description: 'Distributed locking (Redlock) and concurrent seat reservation mechanics.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 20: Production Multi-Tenant SaaS Platform', description: 'Tenant isolation, subscription billing, Kubernetes manifests, and OpenTelemetry tracing.', completed: false, status: 'available', weight: 4 }
          ]
        }
      ]
    },
    {
      title: 'Automation & Integration Engineering Roadmap',
      slug: 'automation-integration-engineering-roadmap',
      domain: 'Automation & Integrations',
      domainId: domainMap['Automation & Integrations'],
      description: 'End-to-end automation curriculum featuring 20 progressive projects from webhook triggers to DAG workflow engines and AIOps.',
      status: 'in_progress',
      priority: 'High',
      progress: 20,
      visibility: 'public',
      published: true,
      phases: [
        {
          title: 'Phase 1: Automation Fundamentals',
          description: 'Webhook triggers, REST APIs, spreadsheet synchronization, and file system automation.',
          order: 1,
          steps: [
            { title: 'Project 01: Automated Email Notification System', description: 'Authenticated webhook ingestion with HMAC-SHA256 signature verification.', completed: true, status: 'completed', weight: 1 },
            { title: 'Project 02: Google Sheets Data Automation', description: 'Bidirectional spreadsheet synchronization with cron-based scheduling.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 03: Form Submission Automation', description: 'High-throughput form ingestion with deduplication and multi-channel routing.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 04: Automated File Management System', description: 'Directory watcher sorting files by MIME type and syncing to S3 archives.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 05: Multi-API Data Integration System', description: 'Concurrent REST API aggregation with token-bucket rate limiting.', completed: false, status: 'available', weight: 1 }
          ]
        },
        {
          title: 'Phase 2: Business & SaaS Integrations',
          description: 'CRM lead routing, e-commerce order automation, social publishing, and payment reconciliation.',
          order: 2,
          steps: [
            { title: 'Project 06: CRM Lead Management Automation', description: 'Inbound marketing webhooks synced to HubSpot with automated lead scoring.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 07: E-commerce Order Automation', description: 'Stripe webhook listener ensuring idempotent order creation in PostgreSQL.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 08: Social Media Content Publishing Automation', description: 'Multi-platform post scheduling with media aspect-ratio adaptation.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 09: Customer Support Ticket Automation', description: 'Urgency classification, sentiment analysis, and Slack channel dispatch.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 10: Invoice & Payment Reconciliation Automation', description: 'Reconciling daily payment gateway settlements against internal accounting ledgers.', completed: false, status: 'available', weight: 2 }
          ]
        },
        {
          title: 'Phase 3: Distributed Orchestration & ETL',
          description: 'Custom integration platforms, DAG state machines, RabbitMQ event buses, and ETL pipelines.',
          order: 3,
          steps: [
            { title: 'Project 11: Custom Integration Platform', description: 'Modular runtime with standardized connector interfaces and AES-256 encrypted credentials.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 12: Advanced Workflow Orchestration Engine', description: 'Directed Acyclic Graph (DAG) engine supporting parallel branches and rollbacks.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 13: Event-Driven Automation Platform', description: 'RabbitMQ event bus with topic routing keys and dead-letter exchanges.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 14: Data Synchronization & ETL Pipeline', description: 'High-watermark incremental sync extracting and loading relational data.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 15: AI-Powered Business Automation System', description: 'Semi-structured invoice and email extraction via LLMs with Pydantic schemas.', completed: false, status: 'available', weight: 3 }
          ]
        },
        {
          title: 'Phase 4: DevOps & Cloud Infrastructure Automation',
          description: 'AIOps self-healing, GitHub Apps CI/CD automation, cloud FinOps, and enterprise gateways.',
          order: 4,
          steps: [
            { title: 'Project 16: DevOps Infrastructure Automation Platform', description: 'Automated remediation agent executing SSH/Docker runbooks on failed servers.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 17: CI/CD & GitHub Automation Platform', description: 'GitHub App automating pull request triage, linting, and semantic releases.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 18: Cloud Resource Management & FinOps System', description: 'Automated shutdown of idle development instances and tagging compliance auditing.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 19: Multi-Agent Business Process Automation System', description: 'Coordinated AI agent collective with human-in-the-loop review checkpoints.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 20: Enterprise Automation & Integration Platform', description: 'Multi-tenant automation gateway deployed on Kubernetes with OpenTelemetry tracing.', completed: false, status: 'available', weight: 4 }
          ]
        }
      ]
    },
    {
      title: 'AI Agent Engineering & Agentic Systems Roadmap',
      slug: 'ai-agent-engineering-systems-roadmap',
      domain: 'Artificial Intelligence',
      domainId: domainMap['Artificial Intelligence'],
      description: 'Progressive curriculum mastering AI Agents from prompt engineering and function calling to LangGraph state machines and multi-agent systems.',
      status: 'in_progress',
      priority: 'High',
      progress: 20,
      visibility: 'public',
      published: true,
      phases: [
        {
          title: 'Level 1: Foundations of Agentic AI',
          description: 'Model inference, token tracking, deterministic tool calling, and foundational vector RAG.',
          order: 1,
          steps: [
            { title: 'Project 01: Intelligent AI Chat Agent', description: 'Sliding-window context management, token usage calculation, and error recovery.', completed: true, status: 'completed', weight: 1 },
            { title: 'Project 02: Tool-Calling AI Agent', description: 'Deterministic math, date, and unit conversion tools validated via Pydantic v2.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 03: AI Research Assistant', description: 'Web search extraction agent synthesizing findings with inline source citations.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 04: Personal Productivity Agent', description: 'Conversational task management executing SQLite CRUD operations.', completed: false, status: 'available', weight: 1 },
            { title: 'Project 05: Document Q&A Agent', description: 'Retrieval-Augmented Generation (RAG) chunking PDFs and querying vector embeddings.', completed: false, status: 'available', weight: 1 }
          ]
        },
        {
          title: 'Level 2: Stateful & Integrated Agents',
          description: 'Dual-tier memory (Postgres/Redis), Gmail OAuth 2.0, AST code analyzers, and hybrid search RAG.',
          order: 2,
          steps: [
            { title: 'Project 06: Memory-Enabled Personal AI Agent', description: 'Hierarchical dual-layer memory combining Redis working context and PostgreSQL recall.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 07: AI Email Management Agent', description: 'Gmail OAuth 2.0 integration prioritizing emails with human-in-the-loop approvals.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 08: AI Coding Assistant Agent', description: 'AST syntax parsing, static defect detection, and automated PR summaries.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 09: RAG-Based Knowledge Base Agent', description: 'Hybrid search fusion (BM25 + Dense Vectors) with cross-encoder reranking.', completed: false, status: 'available', weight: 2 },
            { title: 'Project 10: API Integration Agent', description: 'FastAPI gateway orchestrating multi-step REST API workflows with backoff retries.', completed: false, status: 'available', weight: 2 }
          ]
        },
        {
          title: 'Level 3: Planning, Multi-Agent & Evaluation',
          description: 'State-machine DAG planning (LangGraph), collaborative multi-agent teams, text-to-SQL, and evaluation.',
          order: 3,
          steps: [
            { title: 'Project 11: Autonomous Planning & Execution Agent', description: 'State-machine DAG planning engine decomposing goals with dynamic replanning.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 12: Multi-Agent Research System', description: 'Specialized agent team (Researcher, Analyst, Fact-Checker, Writer) on shared blackboard.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 13: Multi-Agent Software Development System', description: 'SDLC agent team generating, testing, and verifying code in sandboxed directories.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 14: AI Data Analyst Agent', description: 'Guarded Text-to-SQL analyst validating queries via AST parser and rendering charts.', completed: false, status: 'available', weight: 3 },
            { title: 'Project 15: Agent Evaluation & Testing Platform', description: 'Automated test suite benchmarking tool selection accuracy, hallucinations, and costs.', completed: false, status: 'available', weight: 3 }
          ]
        },
        {
          title: 'Level 4: Professional Enterprise & Autonomous Systems',
          description: 'AIOps infrastructure operations, customer support platforms, enterprise ops, and production gateways.',
          order: 4,
          steps: [
            { title: 'Project 16: DevOps AI Operations Agent (AIOps)', description: 'Alert correlation, log anomaly triage, and runbook remediation under human oversight.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 17: AI Customer Support Multi-Agent Platform', description: 'Intent classification, knowledge retrieval, and CRM ticketing with graceful handoff.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 18: AI Business Operations Agent Platform', description: 'Cross-system business workflow orchestrator with enterprise RBAC and audit ledgers.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 19: Autonomous Software Engineering Platform', description: 'Autonomous repository issue worker resolving bugs in Docker sandboxes and opening PRs.', completed: false, status: 'available', weight: 4 },
            { title: 'Project 20: Enterprise Agentic AI Platform', description: 'High-availability multi-tenant agent gateway running on Kubernetes with OpenTelemetry.', completed: false, status: 'available', weight: 4 }
          ]
        }
      ]
    }
  ];

  for (const r of roadmapsToSeed) {
    await roadmapCol.updateOne(
      { slug: r.slug },
      { $set: r },
      { upsert: true }
    );
    console.log(`[ROADMAP] Upserted: ${r.title}`);
  }

  // 4. Update SiteContent hero & sections
  console.log('[SEED] Updating SiteContent metadata...');
  const siteContentCol = db.collection('sitecontents');
  await siteContentCol.updateOne(
    {},
    {
      $set: {
        'hero.heading': 'Software & DevOps Engineering.',
        'hero.headingAccent': 'Architecting resilient systems.',
        'hero.description': 'I build practical software applications, deterministic backend architectures, and modern cloud deployment pipelines across Software Engineering, DevOps, Automation, and Agentic AI.',
        'hero.statusBadge': '22 Repositories · 5 Comprehensive Roadmaps · Verified Clean Architecture',
        'sections.projects.description': 'A collection of 22 progressive repositories spanning DevOps, Backend Engineering, Automation, Full-Stack, and AI Agent Systems.',
        'sections.domains.description': 'Core technical disciplines across Software Engineering, Cloud Infrastructure, Automation & Integrations, and Artificial Intelligence.'
      }
    },
    { upsert: true }
  );

  console.log('\n======================================================');
  console.log('   ALL ROADMAPS & PROJECTS SEEDED INTO WORKSPACE DB!');
  console.log('======================================================\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('Fatal seed failure:', err);
  process.exit(1);
});

