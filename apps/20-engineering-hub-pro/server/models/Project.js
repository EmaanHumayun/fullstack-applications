import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Project slug is required'],
    unique: true,
    index: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['folder', 'project', 'directory', 'subdirectory', 'resource'],
    default: 'project',
    index: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
    index: true
  },
  order: {
    type: Number,
    default: 0
  },
  domain: {
    type: String,
    default: 'Backend Engineering',
    index: true
  },
  domainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    index: true
  },
  primaryDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    index: true
  },
  fieldId: {
    type: String,
    default: null
  },
  fieldName: {
    type: String,
    default: ''
  },
  subdomain: {
    type: String,
    default: ''
  },
  subdomainId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  secondaryDomains: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  }],
  entityType: {
    type: String,
    enum: ['project', 'learning_path', 'lab', 'tool', 'paper', 'folder', 'resource'],
    default: 'project',
    index: true
  },
  summary: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Planned', 'In progress', 'Completed', 'Maintained', 'Archived'],
    default: 'In progress',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  manualProgressOverride: {
    type: Boolean,
    default: false
  },
  startDate: { type: String, default: '' },
  targetDate: { type: String, default: '' },
  completionDate: { type: String, default: '' },
  technologies: {
    type: [String],
    default: []
  },
  links: [{
    label: { type: String, required: true },
    url: { type: String, required: true },
    type: {
      type: String,
      enum: ['github', 'vercel', 'demo', 'api', 'docs', 'custom'],
      default: 'custom'
    }
  }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  tasks: [{
    id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    weight: { type: Number, default: 1 },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate: { type: String, default: '' },
    subtasks: [{
      id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }]
  }],
  relatedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  relatedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  relatedMilestones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  }],
  relatedCertifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  relatedRoadmaps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap'
  }],
  coverImage: { type: String, default: '' },
  screenshots: {
    type: [String],
    default: []
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'draft'],
    default: 'public',
    index: true
  },
  published: {
    type: Boolean,
    default: true,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date,
    default: null
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

projectSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
