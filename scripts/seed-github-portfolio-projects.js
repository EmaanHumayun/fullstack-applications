import 'dotenv/config';
import jwt from 'jsonwebtoken';

async function seedPortfolioProjects() {
  const token = jwt.sign(
    { id: 'superadmin', role: 'super_admin' },
    process.env.JWT_SECRET || 'fallback-secret-key-12345',
    { expiresIn: '1h' }
  );

  const projectsToSeed = [
    {
      title: 'DevOps & Cloud Infrastructure Practice Labs',
      slug: 'devops-practice-labs',
      summary: 'Modular hands-on engineering labs covering Linux automation, Docker multi-stage builds, Kubernetes orchestration, Helm, Terraform, and Observability.',
      description: 'A comprehensive, multi-module production lab suite engineered to verify and automate modern cloud infrastructure from first principles. Features automated log rotators, health monitoring daemons, Kubernetes rolling update manifests, and complete CI/CD vulnerability scanning pipelines.',
      technologies: ['Kubernetes', 'Docker', 'Terraform', 'Helm', 'Bash', 'Prometheus', 'ArgoCD'],
      domain: 'Cloud Infrastructure & DevOps',
      status: 'Completed',
      priority: 'High',
      progress: 100,
      featured: true,
      published: true,
      githubUrl: 'https://github.com/EmaanHumayun/devops-practice-labs',
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/devops-practice-labs', type: 'github' }
      ]
    },
    {
      title: 'Production Cloud Infrastructure as Code',
      slug: 'cloud-infrastructure-iac',
      summary: 'Production-grade Terraform and OpenTofu modules for multi-AZ AWS VPCs, Elastic Kubernetes Service (EKS) clusters, RDS databases, and GitOps automation.',
      description: 'Declarative, immutable cloud platform provisioning with remote S3 encrypted state and DynamoDB distributed locks. Integrates IAM Roles for Service Accounts (IRSA) and automated PR plan checks via GitHub Actions.',
      technologies: ['Terraform', 'OpenTofu', 'AWS', 'EKS', 'GitOps', 'S3', 'DynamoDB'],
      domain: 'Cloud Infrastructure & DevOps',
      status: 'Completed',
      priority: 'High',
      progress: 100,
      featured: true,
      published: true,
      githubUrl: 'https://github.com/EmaanHumayun/cloud-infrastructure-iac',
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/cloud-infrastructure-iac', type: 'github' }
      ]
    },
    {
      title: 'Enterprise Full-Stack Cloud-Native Platform',
      slug: 'fullstack-cloud-native-app',
      summary: 'Enterprise microservice full-stack architecture with automated container builds, health/metrics telemetry endpoints, and Kubernetes manifests.',
      description: 'Full-stack application engineered from first principles combining a modern React frontend, Node.js REST API with Prometheus exporters, multi-stage Docker builds, and production Kubernetes deployment specs.',
      technologies: ['React', 'Node.js', 'Docker', 'Kubernetes', 'CI/CD', 'Redis', 'MongoDB'],
      domain: 'Full-Stack Development',
      status: 'Completed',
      priority: 'High',
      progress: 100,
      featured: true,
      published: true,
      githubUrl: 'https://github.com/EmaanHumayun/fullstack-cloud-native-app',
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/fullstack-cloud-native-app', type: 'github' }
      ]
    },
    {
      title: '50 JavaScript Production Projects Suite',
      slug: '50-javascript-projects',
      summary: 'Comprehensive JavaScript engineering foundations, DOM manipulation, asynchronous algorithms, API consumption, and interactive web tools.',
      description: 'Curated suite of 50 standalone, practical JavaScript applications focusing on vanilla web standards, event loops, clean modular code, and responsive design.',
      technologies: ['JavaScript', 'Web APIs', 'DOM Manipulation', 'CSS3', 'Async/Await'],
      domain: 'Frontend & Architecture',
      status: 'Completed',
      priority: 'Medium',
      progress: 100,
      featured: false,
      published: true,
      githubUrl: 'https://github.com/EmaanHumayun/50-javascript-projects',
      links: [
        { label: 'GitHub Repository', url: 'https://github.com/EmaanHumayun/50-javascript-projects', type: 'github' }
      ]
    }
  ];

  for (const proj of projectsToSeed) {
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(proj)
      });
      const data = await res.json();
      console.log(`[SEED PROJECT] ${proj.title} -> status: ${res.status}`);
    } catch (err) {
      console.error(`Failed to seed ${proj.title}:`, err.message);
    }
  }
}

seedPortfolioProjects().catch(console.error);

