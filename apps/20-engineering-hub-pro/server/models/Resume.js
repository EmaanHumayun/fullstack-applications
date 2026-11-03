import mongoose from 'mongoose';

const resumeEntrySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  organization: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  bullets: [{ type: String }],
  technologies: [{ type: String }],
  url: { type: String, default: '' },
  githubUrl: { type: String, default: '' }
}, { _id: true });

const resumeSectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sectionType: {
    type: String,
    enum: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications', 'custom'],
    required: true
  },
  title: { type: String, required: true },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  entries: [resumeEntrySchema],
  customContent: { type: String, default: '' }
}, { _id: true });

const resumeSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    default: 'Software Engineer Resume'
  },
  targetRole: {
    type: String,
    default: 'Software Engineer',
    trim: true
  },
  templateId: {
    type: String,
    default: 'modern-pro',
    index: true
  },
  theme: {
    id: { type: String, default: 'burgundy-gold' },
    name: { type: String, default: 'Burgundy & Gold' },
    primary: { type: String, default: '#6f1d1b' },
    secondary: { type: String, default: '#432818' },
    accent: { type: String, default: '#bb9457' },
    text: { type: String, default: '#1f2937' },
    muted: { type: String, default: '#6b7280' },
    background: { type: String, default: '#ffffff' },
    sidebarBg: { type: String, default: '#f9fafb' }
  },
  typography: {
    fontFamily: { type: String, default: 'inter' }, // inter, dm-sans, playfair, jetbrains-mono, merriweather
    fontSize: { type: String, default: 'normal' }, // compact, normal, spacious
    lineHeight: { type: String, default: 'normal' } // tight, normal, relaxed
  },
  personalInformation: {
    fullName: { type: String, default: 'Emaan Humayun' },
    professionalTitle: { type: String, default: 'Software Engineer | DevOps Engineer' },
    email: { type: String, default: 'emaan.humayun@example.com' },
    phone: { type: String, default: '' },
    location: { type: String, default: 'Lahore, Pakistan' },
    linkedinUrl: { type: String, default: 'https://linkedin.com/in/emaanmuhammadhumayun' },
    githubUrl: { type: String, default: 'https://github.com/EmaanHumayun' },
    portfolioUrl: { type: String, default: 'https://emaan.dev' },
    websiteUrl: { type: String, default: '' },
    avatarUrl: { type: String, default: '' }
  },
  professionalSummary: {
    type: String,
    default: 'Software Engineer with an emphasis on backend architectures, automation pipelines, and scalable cloud systems. Experienced in designing deterministic REST APIs, containerized deployments, and agentic workflows built on first-principles computing.'
  },
  sections: [resumeSectionSchema],
  skillsData: {
    categories: [{
      name: { type: String, default: 'Core Technologies' },
      skills: [{ type: String }]
    }]
  },
  workspaceSources: [{
    entityType: { type: String, enum: ['skill', 'project', 'certificate', 'education', 'milestone'] },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    title: { type: String },
    importedAt: { type: Date, default: Date.now }
  }],
  pageSettings: {
    pageSize: { type: String, default: 'A4' },
    margins: { type: String, default: 'normal' },
    showPageNumbers: { type: Boolean, default: false }
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

resumeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
