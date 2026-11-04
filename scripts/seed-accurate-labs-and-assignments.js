import 'dotenv/config';
import mongoose from 'mongoose';

const GITHUB_USERNAME = 'EmaanHumayun';

const PRACTICE_LABS = [
  {
    labId: 'LAB-001',
    slug: 'module-01-linux-automation',
    title: 'Linux Automation & Shell Scripting Daemons',
    shortDescription: 'Automated server health checks, log rotation engines, and cron job daemon scripting in POSIX Bash.',
    difficulty: 'Beginner',
    technologies: ['Linux', 'Bash', 'Cron', 'Systemd'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-01-linux-automation`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  },
  {
    labId: 'LAB-002',
    slug: 'module-02-docker-containerization',
    title: 'Docker Multi-Stage Containerization',
    shortDescription: 'Production Dockerfile optimization with multi-stage builds, non-root user execution, and distroless base images.',
    difficulty: 'Intermediate',
    technologies: ['Docker', 'Alpine', 'Docker Compose'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-02-docker-containerization`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  },
  {
    labId: 'LAB-003',
    slug: 'module-03-kubernetes-orchestration',
    title: 'Kubernetes Workload Orchestration & Probes',
    shortDescription: 'Declarative K8s manifests for Deployments, ClusterIP Services, ConfigMaps, Secrets, and Liveness/Readiness probes.',
    difficulty: 'Intermediate',
    technologies: ['Kubernetes', 'kubectl', 'YAML'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-03-kubernetes-orchestration`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  },
  {
    labId: 'LAB-004',
    slug: 'module-04-networking-troubleshooting',
    title: 'TCP/IP & Network Troubleshooting',
    shortDescription: 'Diagnostic runbooks for socket reachability, DNS resolution, egress NAT gateways, and CIDR subnet allocation.',
    difficulty: 'Intermediate',
    technologies: ['Networking', 'TCP/IP', 'DNS', 'iptables'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-04-networking-troubleshooting`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  },
  {
    labId: 'LAB-005',
    slug: 'module-05-terraform-opentofu-iac',
    title: 'Terraform & OpenTofu AWS Infrastructure as Code',
    shortDescription: 'Modular Terraform definitions for multi-tier AWS VPCs, public/private subnets, internet gateways, and remote S3 backend state locking.',
    difficulty: 'Advanced',
    technologies: ['Terraform', 'OpenTofu', 'AWS', 'S3', 'DynamoDB'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-05-terraform-opentofu-iac`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  },
  {
    labId: 'LAB-006',
    slug: 'module-06-cicd-github-actions',
    title: 'CI/CD Pipelines with GitHub Actions',
    shortDescription: 'End-to-end automated continuous integration workflow executing unit tests, Docker builds, and security scans on PR triggers.',
    difficulty: 'Advanced',
    technologies: ['GitHub Actions', 'YAML', 'Docker', 'CI/CD'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-06-cicd-github-actions`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  },
  {
    labId: 'LAB-007',
    slug: 'module-07-helm-packaging',
    title: 'Helm Chart Packaging & Release Management',
    shortDescription: 'Parameterizing Kubernetes workloads using Helm templates, values.yaml override files, and semantic chart versioning.',
    difficulty: 'Advanced',
    technologies: ['Helm', 'Kubernetes', 'YAML'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-07-helm-packaging`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  },
  {
    labId: 'LAB-008',
    slug: 'module-08-observability-telemetry',
    title: 'Prometheus Observability & Metrics Exporters',
    shortDescription: 'Exposing application telemetry endpoints, configuring Prometheus scrape jobs, and writing threshold-based alerting rules.',
    difficulty: 'Advanced',
    technologies: ['Prometheus', 'Grafana', 'Node Exporter'],
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs/tree/main/module-08-observability-telemetry`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-practice-labs`
  }
];

const ASSIGNMENTS = [
  {
    assignmentId: 'ASN-001',
    slug: 'assignment-01-high-availability-vpc',
    title: 'High-Availability Multi-AZ AWS VPC Design',
    shortDescription: 'Architecting and provisioning a fault-tolerant cloud network across 3 availability zones with isolated private application tiers.',
    difficulty: 'Advanced',
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges/tree/main/assignment-01-high-availability-vpc`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges`
  },
  {
    assignmentId: 'ASN-002',
    slug: 'assignment-02-zero-downtime-k8s-rollout',
    title: 'Zero-Downtime Kubernetes Canary Deployment Architecture',
    shortDescription: 'Designing a weighted canary rollout strategy using Nginx Ingress annotations and automated rollback triggers.',
    difficulty: 'Expert',
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges/tree/main/assignment-02-zero-downtime-k8s-rollout`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges`
  },
  {
    assignmentId: 'ASN-003',
    slug: 'assignment-03-secure-ci-cd-pipeline',
    title: 'DevSecOps Supply Chain Security & Container Scanning',
    shortDescription: 'Engineering a hardened delivery pipeline integrating Trivy container scanning, Gitleaks secret detection, and signed artifacts.',
    difficulty: 'Expert',
    githubUrl: `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges/tree/main/assignment-03-secure-ci-cd-pipeline`,
    externalRepositoryUrl: `https://github.com/${GITHUB_USERNAME}/devops-assignments-challenges`
  }
];

async function seed() {
  console.log('[SEED] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected.');

  const db = mongoose.connection.db;
  const labCol = db.collection('practicelabs');
  const assignCol = db.collection('assignments');

  // Upsert Labs
  console.log('[SEED] Seeding 8 Practice Labs with verified GitHub URLs...');
  for (const lab of PRACTICE_LABS) {
    await labCol.updateOne(
      { slug: lab.slug },
      {
        $set: {
          ...lab,
          status: 'Completed',
          visibility: 'public',
          isArchived: false,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`  Lab: ${lab.title} -> ${lab.githubUrl}`);
  }

  // Remove old duplicated placeholder labs
  await labCol.deleteMany({
    title: 'Automated Container Health Probing & Restart Simulation'
  });

  // Upsert Assignments
  console.log('[SEED] Seeding 3 Architecture Assignments with verified GitHub URLs...');
  for (const a of ASSIGNMENTS) {
    await assignCol.updateOne(
      { slug: a.slug },
      {
        $set: {
          ...a,
          status: 'Completed',
          visibility: 'public',
          isArchived: false,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`  Assignment: ${a.title} -> ${a.githubUrl}`);
  }

  // Remove old duplicated placeholder assignments
  await assignCol.deleteMany({
    title: 'Automated Multi-Region Infrastructure Deployment Script'
  });

  console.log('[SEED] Labs and assignments updated successfully.');
  await mongoose.disconnect();
}

seed().catch(console.error);

