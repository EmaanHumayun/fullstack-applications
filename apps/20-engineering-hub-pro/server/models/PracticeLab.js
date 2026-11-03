import mongoose from 'mongoose';

const domainAssociationSchema = new mongoose.Schema({
  domainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    required: true
  },
  subdomainIds: [{
    type: mongoose.Schema.Types.ObjectId
  }]
}, { _id: false });

const labTaskSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  order: { type: Number, default: 1 }
}, { _id: false });

const labEvidenceSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
  title: { type: String, required: true, trim: true },
  evidenceType: { type: String, default: 'Screenshot / Terminal Log' },
  description: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  externalUrl: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
}, { _id: false });

const markdownDocumentSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
  title: { type: String, required: true, trim: true },
  filename: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  templateType: { type: String, default: 'Custom' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const attachmentFileSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
  originalFilename: { type: String, required: true },
  storedFilename: { type: String, required: true },
  fileExtension: { type: String, default: '' },
  mimeType: { type: String, default: 'application/octet-stream' },
  sizeBytes: { type: Number, default: 0 },
  fileUrl: { type: String, required: true },
  storageKey: { type: String, default: '' },
  provider: { type: String, default: 'local' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const commandItemSchema = new mongoose.Schema({
  command: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const practiceLabSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lab title is required'],
    trim: true,
    index: true
  },
  labId: {
    type: String,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    index: true
  },
  shortDescription: {
    type: String,
    default: ''
  },
  detailedDescription: {
    type: String,
    default: ''
  },
  learningObjective: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
    index: true
  },
  labType: {
    type: String,
    enum: ['Guided Lab', 'Challenge Lab', 'Simulation', 'Troubleshooting', 'Experiment', 'Practical Exercise'],
    default: 'Guided Lab',
    index: true
  },
  estimatedDuration: {
    type: String,
    default: '1 hour'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Archived'],
    default: 'Not Started',
    index: true
  },

  // Multi-Domain & Multi-Subdomain Associations
  domainAssociations: {
    type: [domainAssociationSchema],
    default: []
  },
  primaryDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    index: true
  },
  subdomainId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  secondaryDomains: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  }],

  // Technical Specification
  technologies: [{ type: String, trim: true }],
  requiredSoftware: [{ type: String, trim: true }],
  requiredEnvironment: { type: String, default: '' },
  operatingSystem: { type: String, default: 'Linux (Ubuntu / Alpine)' },
  hardwareRequirements: { type: String, default: '' },
  commands: {
    type: [commandItemSchema],
    default: []
  },
  prerequisites: [{ type: String, trim: true }],
  expectedOutput: { type: String, default: '' },
  completionCriteria: [{ type: String, trim: true }],

  // Progress Tracking
  tasks: {
    type: [labTaskSchema],
    default: []
  },
  startedAt: { type: Date, default: null },
  lastPracticedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  timeSpentMinutes: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 },
  attemptsCount: { type: Number, default: 0 },
  personalNotes: { type: String, default: '' },
  learningReflection: { type: String, default: '' },

  // Evidence Records
  evidence: {
    type: [labEvidenceSchema],
    default: []
  },

  // First-Class Markdown Documents
  markdownFiles: {
    type: [markdownDocumentSchema],
    default: []
  },

  // File Attachments
  attachments: {
    type: [attachmentFileSchema],
    default: []
  },

  // Relationships
  linkedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  linkedRoadmaps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap'
  }],
  linkedPhases: [{
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
    phaseId: { type: String },
    phaseTitle: { type: String }
  }],
  linkedSteps: [{
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
    stepId: { type: String },
    stepTitle: { type: String }
  }],
  linkedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  linkedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  relatedAssignments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }],

  githubUrl: { type: String, default: '' },
  externalRepositoryUrl: { type: String, default: '' },

  // Meta & Security
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

practiceLabSchema.index({ 'domainAssociations.domainId': 1 });
practiceLabSchema.index({ 'domainAssociations.subdomainIds': 1 });

practiceLabSchema.pre('save', async function (next) {
  // Generate Lab ID if missing
  if (!this.labId) {
    const count = await this.constructor.countDocuments();
    this.labId = `LAB-${String(count + 1).padStart(3, '0')}`;
  }

  // Generate unique slug from title if missing
  if (!this.slug) {
    let base = (this.title || 'lab')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    let candidate = base;
    let idx = 1;
    while (await this.constructor.exists({ slug: candidate, _id: { $ne: this._id } })) {
      candidate = `${base}-${idx++}`;
    }
    this.slug = candidate;
  }

  // Bidirectional legacy synchronization
  if (this.domainAssociations && this.domainAssociations.length > 0) {
    const firstAssoc = this.domainAssociations[0];
    this.primaryDomain = firstAssoc.domainId;
    this.subdomainId = (firstAssoc.subdomainIds && firstAssoc.subdomainIds.length > 0)
      ? firstAssoc.subdomainIds[0]
      : null;
    this.secondaryDomains = this.domainAssociations.slice(1).map(d => d.domainId);
  } else if (this.primaryDomain) {
    this.domainAssociations = [{
      domainId: this.primaryDomain,
      subdomainIds: this.subdomainId ? [this.subdomainId] : []
    }];
    if (this.secondaryDomains && this.secondaryDomains.length > 0) {
      for (const secId of this.secondaryDomains) {
        if (!this.domainAssociations.some(d => String(d.domainId) === String(secId))) {
          this.domainAssociations.push({ domainId: secId, subdomainIds: [] });
        }
      }
    }
  }

  // Progress Calculation
  if (this.tasks && this.tasks.length > 0) {
    const completed = this.tasks.filter(t => t.isCompleted).length;
    this.completionPercentage = Math.round((completed / this.tasks.length) * 100);
    if (this.completionPercentage === 100 && this.status !== 'Completed') {
      this.status = 'Completed';
      this.completedAt = this.completedAt || new Date();
    } else if (this.completionPercentage > 0 && this.status === 'Not Started') {
      this.status = 'In Progress';
      this.startedAt = this.startedAt || new Date();
    }
  } else if (this.status === 'Completed') {
    this.completionPercentage = 100;
    this.completedAt = this.completedAt || new Date();
  }

  next();
});

export const PracticeLab = mongoose.models.PracticeLab || mongoose.model('PracticeLab', practiceLabSchema);
