import 'dotenv/config';
import { connectDB } from '../server/config/db.js';
import { Domain } from '../server/models/Domain.js';
import { Skill } from '../server/models/Skill.js';
import { Goal } from '../server/models/Goal.js';
import { Project } from '../server/models/Project.js';
import { Certificate } from '../server/models/Certificate.js';
import { Milestone } from '../server/models/Milestone.js';
import { Resource } from '../server/models/Resource.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DOMAIN_SUBDOMAINS_MAP = {
  'Cybersecurity': [
    { name: 'Network Security', icon: 'shield', description: 'Firewalls, IDS/IPS, packet analysis, secure topologies, and zero trust architecture.' },
    { name: 'Web Application Security', icon: 'globe', description: 'OWASP Top 10, XSS, CSRF, SSRF, injection vulnerabilities, and secure coding practices.' },
    { name: 'Application Security', icon: 'code', description: 'SAST, DAST, secure SDLC, dependency scanning, and threat modeling.' },
    { name: 'Security Operations', icon: 'terminal', description: 'SIEM, log analysis, incident response, SOC workflows, and alert triage.' },
    { name: 'Cloud Security', icon: 'cloud', description: 'IAM policies, cloud posture management (CSPM), container security, and secret handling.' },
    { name: 'Digital Forensics', icon: 'database', description: 'Memory forensics, disk analysis, malware reverse engineering, and chain of custody.' }
  ],
  'Backend Engineering': [
    { name: 'API Development', icon: 'server', description: 'REST, GraphQL, gRPC, versioning, request validation, and API gateways.' },
    { name: 'Authentication and Authorization', icon: 'key', description: 'JWT, OAuth2, OpenID Connect, RBAC, ABAC, and session security.' },
    { name: 'Database Engineering', icon: 'database', description: 'Schema design, indexing, transactions, query optimization, and caching with Redis.' },
    { name: 'Backend Architecture', icon: 'layers', description: 'Clean architecture, domain-driven design, modular monoliths, and event-driven patterns.' },
    { name: 'Application Security', icon: 'shield', description: 'Defensive backend coding, rate limiting, helmet headers, and cryptographic controls.' },
    { name: 'Testing and Observability', icon: 'check-circle', description: 'Unit testing, integration testing, structured logging, distributed tracing, and metrics.' }
  ],
  'AI Engineering': [
    { name: 'Machine Learning', icon: 'cpu', description: 'Supervised and unsupervised models, feature engineering, and scikit-learn.' },
    { name: 'LLM Applications', icon: 'sparkles', description: 'Prompt engineering, structured outputs, function calling, and token optimization.' },
    { name: 'Retrieval-Augmented Generation', icon: 'search', description: 'Vector databases, dense retrieval, embedding models, chunking, and re-ranking.' },
    { name: 'AI Agents', icon: 'workflow', description: 'Multi-agent orchestration, tool use, reflection loops, and autonomous workflows.' },
    { name: 'Model Evaluation', icon: 'award', description: 'Benchmarking, RAG triaging, hallucination detection, and red-teaming.' }
  ],
  'Computer Networking': [
    { name: 'Network Fundamentals', icon: 'network', description: 'OSI 7 layers, TCP/IP stack, IP addressing, subnetting, and CIDR notation.' },
    { name: 'Routing and Switching', icon: 'server', description: 'VLANs, trunking, static routing, OSPF, BGP, and spanning tree protocol.' },
    { name: 'Network Protocols', icon: 'globe', description: 'DNS, DHCP, HTTP/2 & HTTP/3, TLS 1.3, SSH, and WebSocket protocols.' },
    { name: 'Network Troubleshooting', icon: 'tool', description: 'Wireshark packet capture, traceroute, tcpdump, ping latency analysis, and MTU diagnostics.' },
    { name: 'Network Security', icon: 'shield', description: 'Stateful firewalling, VPNs, WireGuard, IPsec tunnels, and network access control (NAC).' }
  ],
  'Cloud Computing & DevOps': [
    { name: 'Containerization & Kubernetes', icon: 'box', description: 'Docker multi-stage builds, pods, deployments, services, ingress, and Helm.' },
    { name: 'CI/CD Pipelines', icon: 'workflow', description: 'Automated test runners, build pipelines, release management, and GitHub Actions.' },
    { name: 'Infrastructure as Code', icon: 'code', description: 'Terraform, declarative provisioning, drift detection, and modular configs.' },
    { name: 'Cloud Architecture', icon: 'cloud', description: 'Multi-region architectures, load balancers, serverless functions, and auto-scaling.' },
    { name: 'Monitoring & Observability', icon: 'activity', description: 'Prometheus metrics, Grafana dashboards, alerting rules, and APM tracing.' }
  ],
  'Software Architecture & Design': [
    { name: 'Clean Architecture', icon: 'layers', description: 'Hexagonal / onion architecture, separation of concerns, and dependency inversion.' },
    { name: 'Distributed Systems', icon: 'share-2', description: 'Consensus algorithms, CAP theorem trade-offs, message brokers (Kafka/RabbitMQ), and partition tolerance.' },
    { name: 'Design Patterns', icon: 'cpu', description: 'Creational, structural, and behavioral patterns applied to production codebases.' },
    { name: 'Microservices', icon: 'boxes', description: 'Service boundaries, inter-service RPC, saga pattern, and distributed transactions.' },
    { name: 'Event-Driven Architecture', icon: 'zap', description: 'Event sourcing, CQRS, pub-sub architectures, and dead-letter queues.' }
  ]
};

async function run() {
  await connectDB();
  console.log('🔄 Connected to MongoDB. Synchronizing central Domain and Subdomain hierarchy...');

  const domains = await Domain.find({});
  console.log(`Found ${domains.length} domains in system.`);

  // 1. Ensure subdomains are present in domain records
  for (const dom of domains) {
    const predefinedSubdomains = DOMAIN_SUBDOMAINS_MAP[dom.name];
    if (predefinedSubdomains && predefinedSubdomains.length > 0) {
      const existingFields = dom.fields || [];
      const updatedFields = [...existingFields];

      for (const sub of predefinedSubdomains) {
        const subSlug = slugify(sub.name);
        const exists = updatedFields.some(f => f.slug === subSlug || f.name.toLowerCase() === sub.name.toLowerCase());
        if (!exists) {
          updatedFields.push({
            name: sub.name,
            slug: subSlug,
            description: sub.description,
            icon: sub.icon || 'code',
            order: updatedFields.length,
            isFeatured: true,
            visibility: 'public'
          });
        }
      }

      dom.fields = updatedFields;
      await dom.save();
      console.log(`✅ Updated domain "${dom.name}" with ${dom.fields.length} subdomains.`);
    }
  }

  // Reload fresh domain list
  const freshDomains = await Domain.find({});
  const domainNameToDoc = new Map(freshDomains.map(d => [d.name.toLowerCase(), d]));

  // Helper to match domain
  function findDomain(str) {
    if (!str) return freshDomains[0];
    const key = str.toLowerCase();
    for (const [dName, doc] of domainNameToDoc.entries()) {
      if (dName === key || dName.includes(key) || key.includes(dName)) return doc;
    }
    return freshDomains[0];
  }

  // 2. Link Skills
  const skills = await Skill.find({});
  console.log(`Linking ${skills.length} skills to primary domains and subdomains...`);
  for (const s of skills) {
    const targetDomain = findDomain(s.category);
    if (targetDomain) {
      s.primaryDomain = targetDomain._id;
      // Match or assign subdomain
      if (!s.subdomain && s.subcategory) {
        s.subdomain = s.subcategory;
      }
      if (!s.subdomain && targetDomain.fields && targetDomain.fields.length > 0) {
        s.subdomain = targetDomain.fields[0].name;
        s.subdomainId = targetDomain.fields[0]._id;
      }
      await s.save();
    }
  }

  // 3. Link Goals
  const goals = await Goal.find({});
  console.log(`Linking ${goals.length} goals to primary domains and subdomains...`);
  for (const g of goals) {
    const targetDomain = findDomain(g.category);
    if (targetDomain) {
      g.primaryDomain = targetDomain._id;
      if (!g.subdomain && targetDomain.fields && targetDomain.fields.length > 0) {
        g.subdomain = targetDomain.fields[0].name;
        g.subdomainId = targetDomain.fields[0]._id;
      }
      await g.save();
    }
  }

  // 4. Link Milestones
  const milestones = await Milestone.find({});
  console.log(`Linking ${milestones.length} milestones...`);
  for (const m of milestones) {
    if (m.parentGoalId) {
      const parentGoal = await Goal.findById(m.parentGoalId);
      if (parentGoal) {
        m.primaryDomain = parentGoal.primaryDomain;
        m.subdomain = parentGoal.subdomain;
        m.subdomainId = parentGoal.subdomainId;
      }
    }
    if (!m.primaryDomain) {
      const defaultDomain = freshDomains[0];
      m.primaryDomain = defaultDomain._id;
      m.subdomain = defaultDomain.fields?.[0]?.name || '';
      m.subdomainId = defaultDomain.fields?.[0]?._id || null;
    }
    await m.save();
  }

  // 5. Link Projects
  const projects = await Project.find({});
  console.log(`Linking ${projects.length} projects to primary domains and subdomains...`);
  for (const p of projects) {
    const targetDomain = findDomain(p.domain);
    if (targetDomain) {
      p.primaryDomain = targetDomain._id;
      p.domainId = targetDomain._id;
      if (!p.subdomain && p.fieldName) {
        p.subdomain = p.fieldName;
      }
      if (!p.subdomain && targetDomain.fields && targetDomain.fields.length > 0) {
        p.subdomain = targetDomain.fields[0].name;
        p.fieldName = targetDomain.fields[0].name;
        p.fieldId = String(targetDomain.fields[0]._id);
        p.subdomainId = targetDomain.fields[0]._id;
      }
      await p.save();
    }
  }

  // 6. Link Certificates
  const certs = await Certificate.find({});
  console.log(`Linking ${certs.length} certificates to primary domains and subdomains...`);
  for (const c of certs) {
    const targetDomain = findDomain(c.domain || 'Cybersecurity');
    if (targetDomain) {
      c.primaryDomain = targetDomain._id;
      c.domain = targetDomain.name;
      if (!c.subdomain && targetDomain.fields && targetDomain.fields.length > 0) {
        c.subdomain = targetDomain.fields[0].name;
        c.subdomainId = targetDomain.fields[0]._id;
      }
      if (!c.status) c.status = 'completed';
      await c.save();
    }
  }

  // 7. Seed Sample Learning Resources across domains if empty
  const existingResourceCount = await Resource.countDocuments({});
  console.log(`Existing Learning Resources count: ${existingResourceCount}`);
  if (existingResourceCount === 0) {
    console.log('Seeding curated learning resources across technical domains...');
    const seedResources = [
      {
        title: 'OWASP Web Security Testing Guide (WSTG v4.2)',
        url: 'https://owasp.org/www-project-web-security-testing-guide/',
        type: 'Documentation',
        difficulty: 'Intermediate',
        status: 'In Progress',
        domainKey: 'Cybersecurity',
        subdomainName: 'Web Application Security',
        description: 'Comprehensive manual for web application penetration testing, vulnerability discovery, and input validation verification.',
        rating: 5,
        visibility: 'public'
      },
      {
        title: 'PortSwigger Web Security Academy Labs',
        url: 'https://portswigger.net/web-security',
        type: 'Practical labs',
        difficulty: 'Advanced',
        status: 'In Progress',
        domainKey: 'Cybersecurity',
        subdomainName: 'Web Application Security',
        description: 'Interactive vulnerability labs covering SQLi, XSS, CSRF, SSRF, JWT vulnerabilities, and race conditions.',
        rating: 5,
        visibility: 'public'
      },
      {
        title: 'Wireshark Certified Network Analyst Blueprint & Labs',
        url: 'https://www.wireshark.org/docs/',
        type: 'Documentation',
        difficulty: 'Intermediate',
        status: 'Completed',
        domainKey: 'Computer Networking',
        subdomainName: 'Network Troubleshooting',
        description: 'Deep packet inspection techniques, TCP handshake anomaly triage, and retransmission analysis.',
        rating: 5,
        visibility: 'public'
      },
      {
        title: 'Designing Data-Intensive Applications (Kleppmann)',
        url: 'https://dataintensive.net/',
        type: 'Books and papers',
        difficulty: 'Advanced',
        status: 'Completed',
        domainKey: 'Backend Engineering',
        subdomainName: 'Database Engineering',
        description: 'Definitive resource on replication, partitioning, transactions, consensus, and stream processing architectures.',
        rating: 5,
        visibility: 'public'
      },
      {
        title: 'Clean Architecture & Domain-Driven Design Handbook',
        url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
        type: 'Documentation',
        difficulty: 'Intermediate',
        status: 'Completed',
        domainKey: 'Backend Engineering',
        subdomainName: 'Backend Architecture',
        description: 'Hexagonal boundaries, domain entities, use-case interactors, and interface adapters in TypeScript and Node.',
        rating: 5,
        visibility: 'public'
      },
      {
        title: 'DeepLearning.AI: Building Agentic Workflows with LangGraph',
        url: 'https://www.deeplearning.ai/short-courses/ai-agents-in-langgraph/',
        type: 'Courses',
        difficulty: 'Advanced',
        status: 'In Progress',
        domainKey: 'AI Engineering',
        subdomainName: 'AI Agents',
        description: 'Stateful multi-actor systems, reflection loops, human-in-the-loop validation, and tool orchestration.',
        rating: 5,
        visibility: 'public'
      },
      {
        title: 'Pinecone Vector Database Architecture & Dense Retrieval Paper',
        url: 'https://www.pinecone.io/learn/vector-database/',
        type: 'Documentation',
        difficulty: 'Intermediate',
        status: 'Completed',
        domainKey: 'AI Engineering',
        subdomainName: 'Retrieval-Augmented Generation',
        description: 'Hierarchical Navigable Small World (HNSW) graphs, cosine similarity metrics, and hybrid dense-sparse search.',
        rating: 5,
        visibility: 'public'
      },
      {
        title: 'Kubernetes Up & Running (Kelsey Hightower et al.)',
        url: 'https://kubernetes.io/docs/home/',
        type: 'Books and papers',
        difficulty: 'Intermediate',
        status: 'In Progress',
        domainKey: 'Cloud Computing & DevOps',
        subdomainName: 'Containerization & Kubernetes',
        description: 'Container orchestrator internals: kubelet, etcd consensus, service mesh ingress, and zero-downtime rolling updates.',
        rating: 5,
        visibility: 'public'
      }
    ];

    for (const resData of seedResources) {
      const targetDomain = findDomain(resData.domainKey);
      let matchedSubdomain = null;
      if (targetDomain && targetDomain.fields) {
        matchedSubdomain = targetDomain.fields.find(
          f => f.name.toLowerCase() === resData.subdomainName.toLowerCase()
        ) || targetDomain.fields[0];
      }

      await Resource.create({
        title: resData.title,
        url: resData.url,
        type: resData.type,
        difficulty: resData.difficulty,
        status: resData.status,
        description: resData.description,
        rating: resData.rating,
        visibility: resData.visibility,
        primaryDomain: targetDomain ? targetDomain._id : null,
        domainName: targetDomain ? targetDomain.name : resData.domainKey,
        subdomain: matchedSubdomain ? matchedSubdomain.name : resData.subdomainName,
        subdomainId: matchedSubdomain ? matchedSubdomain._id : null
      });
    }
    console.log(`✅ Seeded ${seedResources.length} curated learning resources.`);
  }

  console.log('🎉 Domain & Subdomain synchronization and relationship linking completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
