import { connectDB, disconnectDB } from '../server/config/db.js';
import { SiteContent } from '../server/models/SiteContent.js';
import { Profile } from '../server/models/Profile.js';

async function updateDevOpsHero() {
  await connectDB();

  console.log('[DevOps Script] Connected to MongoDB...');

  // 1. Update SiteContent Hero
  const devopsHero = {
    kicker: 'DEVOPS & CLOUD INFRASTRUCTURE HUB',
    availabilityText: 'KUBERNETES • CI/CD AUTOMATION • TERRAFORM • SRE',
    heading: 'Automating cloud infrastructure.',
    headingAccent: 'From commit to self-healing cluster.',
    description: 'DevOps & Site Reliability Engineer specializing in resilient multi-cloud architectures, Kubernetes orchestration, zero-downtime CI/CD delivery pipelines, and Infrastructure as Code. Engineering scalable, observable, and automated production platforms.',
    primaryCtaText: 'Explore Cloud Infrastructure',
    primaryCtaLink: '/projects',
    secondaryCtaText: 'Cluster Blueprints & IaC',
    secondaryCtaLink: 'https://github.com/EmaanHumayun',
    statusBadge: 'Orchestrating Kubernetes, Terraform & GitOps Delivery'
  };

  const existingContent = await SiteContent.findOne();
  if (existingContent) {
    existingContent.hero = { ...existingContent.hero, ...devopsHero };
    await existingContent.save();
    console.log('[DevOps Script] SiteContent.hero updated in MongoDB successfully.');
  } else {
    await SiteContent.create({ hero: devopsHero });
    console.log('[DevOps Script] SiteContent created with DevOps hero.');
  }

  // 2. Update Profile headline & bio to align with DevOps
  const existingProfile = await Profile.findOne();
  if (existingProfile) {
    existingProfile.headline = 'DevOps Engineer & SRE · Kubernetes · Cloud Infrastructure · CI/CD';
    existingProfile.bio = 'DevOps & Site Reliability Engineer building automated, fault-tolerant cloud platforms, Kubernetes clusters, and GitOps delivery pipelines. Passionate about infrastructure as code, continuous observability, and high-availability systems.';
    existingProfile.interests = [
      'Kubernetes & Container Orchestration',
      'Infrastructure as Code (Terraform & Helm)',
      'GitOps & CI/CD Automation (ArgoCD)',
      'Observability (Prometheus, Grafana, OpenTelemetry)',
      'Cloud Architecture (AWS / GCP / Hybrid)'
    ];
    await existingProfile.save();
    console.log('[DevOps Script] Profile headline, bio, and interests updated in MongoDB.');
  }

  await disconnectDB();
  console.log('[DevOps Script] Finished successfully.');
}

updateDevOpsHero().catch(err => {
  console.error('[DevOps Script] Error:', err);
  process.exit(1);
});
