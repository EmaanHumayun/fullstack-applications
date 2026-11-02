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

const assignmentTaskSchema = new mongoose.Schema({
  id: { type: String, default: () => Math.random().toString(36).substring(2, 9) },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  order: { type: Number, default: 1 }
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

const submissionRecordSchema = new mongoose.Schema({
  version: { type: Number, default: 1 },
  submittedAt: { type: Date, default: Date.now },
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  textResponse: { type: String, default: '' },
  notes: { type: String, default: '' },
  files: { type: [attachmentFileSchema], default: [] },
  status: { type: String, default: 'Submitted' }
}, { _id: true });

const rubricItemSchema = new mongoose.Schema({
  criterion: { type: String, required: true },
  maxScore: { type: Number, default: 10 },
  description: { type: String, default: '' }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    index: true
  },
  assignmentId: {
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
  objective: {
    type: String,
    default: ''
  },
  assignmentType: {
    type: String,
    enum: ['Coding', 'Practical', 'Research', 'Documentation', 'Case Study', 'Configuration', 'Project-Based', 'Assessment'],
    default: 'Practical',
    index: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
    index: true
  },
  estimatedDuration: {
    type: String,
    default: '2 hours'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical', 'Urgent'],
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Assigned', 'Not Started', 'In Progress', 'Submitted', 'Under Review', 'Revision Required', 'Reviewed', 'Completed', 'Archived'],
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

  // Instructions & Requirements
  instructions: { type: String, default: '' },
  tasks: {
    type: [assignmentTaskSchema],
    default: []
  },
  technicalRequirements: [{ type: String, trim: true }],
  constraints: [{ type: String, trim: true }],
  prerequisites: [{ type: String, trim: true }],
  expectedResults: { type: String, default: '' },
  completionCriteria: [{ type: String, trim: true }],

  // Scheduling
  assignedDate: { type: Date, default: null },
  startDate: { type: Date, default: null },
  dueDate: { type: Date, default: null, index: true },
  submissionDate: { type: Date, default: null },
  reviewDate: { type: Date, default: null },

  // Deliverables
  expectedDeliverables: [{ type: String, trim: true }],

  // Submissions (supports revisions with complete history!)
  submissions: {
    type: [submissionRecordSchema],
    default: []
  },

  // Evaluation & Grading (Optional)
  evaluationCriteria: { type: String, default: '' },
  rubric: {
    type: mongoose.Schema.Types.Mixed,
    default: ''
  },
  maxMarks: { type: Number, default: 0 },
  obtainedMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  reviewComments: { type: String, default: '' },
  revisionRequests: { type: String, default: '' },
  evaluatedAt: { type: Date, default: null },

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
  relatedPracticeLabs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeLab'
  }],
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  relatedMilestones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  }],

  // Private Notes
  privateNotes: { type: String, default: '' },

  // Meta & Visibility
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

assignmentSchema.index({ 'domainAssociations.domainId': 1 });
assignmentSchema.index({ 'domainAssociations.subdomainIds': 1 });

assignmentSchema.pre('save', async function (next) {
  // Generate Assignment ID if missing
  if (!this.assignmentId) {
    const count = await this.constructor.countDocuments();
    this.assignmentId = `ASN-${String(count + 1).padStart(3, '0')}`;
  }

  // Generate unique slug from title if missing
  if (!this.slug) {
    let base = (this.title || 'assignment')
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

  // Grade Percentage calculation
  if (this.maxMarks && this.maxMarks > 0 && typeof this.obtainedMarks === 'number') {
    this.percentage = Math.round((this.obtainedMarks / this.maxMarks) * 100);
  }

  next();
});

export const Assignment = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
