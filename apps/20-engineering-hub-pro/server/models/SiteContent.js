import mongoose from 'mongoose';

const siteContentSchema = new mongoose.Schema({
  hero: {
    kicker: { type: String, default: 'ENGINEERING WORKSPACE & PORTFOLIO' },
    availabilityText: { type: String, default: 'OPEN TO RESEARCH, BUILDING & COLLABORATION' },
    heading: { type: String, default: 'Building thoughtful software.' },
    headingAccent: { type: String, default: 'Making complexity useful.' },
    description: {
      type: String,
      default: "I build practical software, reliable systems, and intelligent workflows across engineering domains. Sharing the architecture, trade-offs, and learnings behind the work."
    },
    primaryCtaText: { type: String, default: 'Explore Engineering Work' },
    primaryCtaLink: { type: String, default: '/projects' },
    secondaryCtaText: { type: String, default: 'GitHub Repositories' },
    secondaryCtaLink: { type: String, default: 'https://github.com/EmaanHumayun' },
    statusBadge: { type: String, default: 'Exploring system architecture & agentic AI' }
  },
  about: {
    eyebrow: { type: String, default: "WHAT I'M EXPLORING" },
    heading: { type: String, default: 'Curiosity, with a' },
    headingAccent: { type: String, default: 'practical direction.' },
    description: {
      type: String,
      default: 'From resilient APIs and distributed architectures to AI-powered agentic systems and security engineering, I focus on understanding first principles and turning complex technical ideas into reliable, usable software.'
    },
    focusGrid: [{
      title: { type: String, required: true },
      subtitle: { type: String, default: '' },
      icon: { type: String, default: 'code' }
    }]
  },
  sections: {
    projects: {
      eyebrow: { type: String, default: 'SELECTED WORK' },
      title: { type: String, default: 'Projects with an architectural purpose.' },
      description: { type: String, default: 'Practical systems, experiments, and engineering repositories — built from first principles and documented with technical decisions.' },
      visible: { type: Boolean, default: true }
    },
    domains: {
      eyebrow: { type: String, default: 'SPECIALIZATIONS' },
      title: { type: String, default: 'Technical domains & areas of focus.' },
      description: { type: String, default: 'Specialized disciplines across software engineering, artificial intelligence, security, and systems architecture.' },
      visible: { type: Boolean, default: true }
    },
    skills: {
      eyebrow: { type: String, default: 'CORE COMPETENCIES' },
      title: { type: String, default: 'Skills, categorized and verified.' },
      description: { type: String, default: 'A breakdown of programming languages, frameworks, database engines, and architectural patterns in active use.' },
      visible: { type: Boolean, default: true }
    },
    roadmaps: {
      eyebrow: { type: String, default: 'CONTINUOUS MASTERY' },
      title: { type: String, default: 'Learning roadmaps & progression.' },
      description: { type: String, default: 'Transparent technical learning paths and stages tracked in public.' },
      visible: { type: Boolean, default: true }
    },
    practiceLabs: {
      eyebrow: { type: String, default: 'HANDS-ON ENVIRONMENTS' },
      title: { type: String, default: 'Practice Labs & Sandbox Environments.' },
      description: { type: String, default: 'Hands-on architectural exercises, infrastructure labs, and reproducible engineering challenges.' },
      visible: { type: Boolean, default: true }
    },
    assignments: {
      eyebrow: { type: String, default: 'TECHNICAL ASSESSMENTS' },
      title: { type: String, default: 'Architectural Assignments & Case Studies.' },
      description: { type: String, default: 'In-depth problem-solving assignments, code challenges, and system design submissions.' },
      visible: { type: Boolean, default: true }
    },
    education: {
      eyebrow: { type: String, default: 'ACADEMIC BACKGROUND' },
      title: { type: String, default: 'Education & computer science foundations.' },
      description: { type: String, default: 'Formal qualifications and foundational studies in computer science, mathematics, and analytical reasoning.' },
      visible: { type: Boolean, default: true }
    },
    certificates: {
      eyebrow: { type: String, default: 'VERIFIED CREDENTIALS' },
      title: { type: String, default: 'Certificates & qualifications.' },
      description: { type: String, default: 'Verified external certifications, technical assessments, and professional milestones.' },
      visible: { type: Boolean, default: true }
    },
    notes: {
      eyebrow: { type: String, default: 'KNOWLEDGE BASE' },
      title: { type: String, default: 'Technical notes & concept breakdowns.' },
      description: { type: String, default: 'Lessons learned, architecture notes, and deep dives written while building software.' },
      visible: { type: Boolean, default: true }
    },
    contact: {
      eyebrow: { type: String, default: "LET'S CONNECT" },
      title: { type: String, default: 'Good work gets better' },
      headingAccent: { type: String, default: 'when it is shared.' },
      description: { type: String, default: 'Have an interesting engineering problem, collaboration idea, or question? Feel free to reach out directly.' },
      primaryEmail: { type: String, default: 'emaan.humayun@example.com' },
      responseTimeBadge: { type: String, default: 'Typically responds within 24h' },
      locationBadge: { type: String, default: 'Lahore, PK · Remote Available (PKT · UTC+5)' },
      architectureBadge: { type: String, default: 'First-Principles Architecture' },
      guaranteeNote: { type: String, default: '⚡ Guaranteed response within 24 hours · Open to consulting & engineering engagements' },
      channelCardHeader: { type: String, default: 'Direct Communication Channel' },
      channelCardTimezone: { type: String, default: 'PKT · UTC+5' },
      channelsSubheading: { type: String, default: 'VERIFIED PROFESSIONAL CHANNELS' },
      visible: { type: Boolean, default: true }
    }
  },
  navigation: {
    projectsLabel: { type: String, default: 'Projects' },
    domainsLabel: { type: String, default: 'Domains' },
    skillsLabel: { type: String, default: 'Skills' },
    roadmapsLabel: { type: String, default: 'Roadmaps' },
    practiceLabsLabel: { type: String, default: 'Labs' },
    assignmentsLabel: { type: String, default: 'Assignments' },
    educationLabel: { type: String, default: 'Education' },
    certificatesLabel: { type: String, default: 'Credentials' },
    notesLabel: { type: String, default: 'Notes' },
    analyticsLabel: { type: String, default: 'Analytics' },
    contactLabel: { type: String, default: 'Contact' }
  },
  footer: {
    brandText: { type: String, default: 'Built with curiosity and precision' },
    copyrightText: { type: String, default: '© 2026 Emaan Humayun. All rights reserved.' }
  },
  seo: {
    title: { type: String, default: 'Engineering Hub Pro — Technical Portfolio & Workspace' },
    description: { type: String, default: 'A high-performance personal engineering workspace and technical portfolio documenting backend systems, AI workflows, and software architecture.' }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

siteContentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema);
