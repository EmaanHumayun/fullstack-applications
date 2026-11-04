import mongoose from 'mongoose';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const completionEvidenceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, default: '', trim: true },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now }
}, { _id: true });

const roadmapStepSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 9)
  },
  title: {
    type: String,
    required: [true, 'Step title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  acceptanceCriteria: {
    type: [String],
    default: []
  },
  prerequisites: {
    type: [String],
    default: [] // Array of step IDs or titles
  },
  estimatedEffort: {
    type: String,
    default: '2h'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['locked', 'available', 'in_progress', 'completed', 'blocked'],
    default: 'available',
    index: true
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  weight: {
    type: Number,
    min: 1,
    default: 1
  },
  // Bidirectional connections
  linkedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  // Backward compatibility alias
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    default: null
  },
  linkedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  linkedMilestones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  }],
  linkedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  linkedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  linkedCertifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  resources: [{
    title: { type: String, default: '' },
    url: { type: String, default: '' }
  }],
  completionEvidence: [completionEvidenceSchema],
  reflectionNotes: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { _id: true });

const roadmapPhaseSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 9)
  },
  title: {
    type: String,
    required: [true, 'Phase title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    default: null
  },
  steps: [roadmapStepSchema]
}, { _id: true });

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

const roadmapReviewSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  reviewer: { type: String, default: 'Self' }
}, { _id: true });

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Roadmap title is required'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  purpose: {
    type: String,
    default: ''
  },
  learningOutcomes: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: 'Backend Engineering',
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'planned', 'in_progress', 'in-progress', 'completed', 'archived'],
    default: 'in_progress',
    index: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'All Levels'],
    default: 'Intermediate',
    index: true
  },
  estimatedDuration: {
    type: String,
    default: '6 weeks'
  },
  targetDate: {
    type: String,
    default: ''
  },
  prerequisites: {
    type: [String],
    default: []
  },
  coverImage: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },

  // Central Domain & Subdomain System connections
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
  subdomain: {
    type: String,
    default: '',
    trim: true
  },
  subdomainId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  secondaryDomains: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  }],

  // Primary ordered phases & steps
  phases: [roadmapPhaseSchema],

  // Backward compatibility alias for legacy stages
  stages: [roadmapPhaseSchema],

  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Roadmap-level entity links
  linkedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  linkedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  linkedMilestones: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone'
  }],
  linkedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  linkedCertifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],

  // Review history & private notes
  reviews: [roadmapReviewSchema],
  notes: {
    type: String,
    default: ''
  },

  // Publication & visibility
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

// Calculate weighted progress
export function calculateRoadmapProgressWeighted(phases = []) {
  if (!phases || !phases.length) return 0;
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const phase of phases) {
    const steps = phase.steps || [];
    for (const step of steps) {
      const w = Math.max(1, Number(step.weight) || 1);
      totalWeight += w;
      if (step.completed || step.status === 'completed') {
        earnedWeight += w;
      }
    }
  }

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

// Indices
roadmapSchema.index({ 'domainAssociations.domainId': 1 });
roadmapSchema.index({ 'domainAssociations.subdomainIds': 1 });

// Auto-sync, slugify, and calculate progress before saving
roadmapSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Slugify if absent
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  if (this.status === 'in-progress') {
    this.status = 'in_progress';
  }

  // Bidirectional sync for backward compatibility
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

  // Synchronize phases and stages for complete backward compatibility
  if ((!this.phases || this.phases.length === 0) && (this.stages && this.stages.length > 0)) {
    this.phases = this.stages;
  } else if ((!this.stages || this.stages.length === 0) && (this.phases && this.phases.length > 0)) {
    this.stages = this.phases;
  } else if (this.phases && this.phases.length > 0) {
    this.stages = this.phases;
  }

  // Keep step completion & status in sync
  const activePhases = this.phases || [];
  const completedStepIds = new Set();

  // First pass: collect completed steps
  for (const phase of activePhases) {
    for (const step of (phase.steps || [])) {
      if (step.completed) {
        step.status = 'completed';
        if (!step.completedAt) step.completedAt = new Date();
        if (step._id) completedStepIds.add(String(step._id));
        if (step.id) completedStepIds.add(String(step.id));
      } else if (step.status === 'completed') {
        step.completed = true;
        if (!step.completedAt) step.completedAt = new Date();
        if (step._id) completedStepIds.add(String(step._id));
        if (step.id) completedStepIds.add(String(step.id));
      }
    }
  }

  // Second pass: check prerequisites and assign locked/available states
  for (const phase of activePhases) {
    for (const step of (phase.steps || [])) {
      if (step.completed || step.status === 'completed') continue;

      if (step.prerequisites && step.prerequisites.length > 0) {
        const hasUnmetPrereq = step.prerequisites.some(pr => !completedStepIds.has(String(pr)));
        if (hasUnmetPrereq) {
          step.status = 'locked';
        } else if (step.status === 'locked') {
          step.status = 'available';
        }
      } else if (step.status === 'locked') {
        step.status = 'available';
      }
    }
  }

  // Calculate weighted progress
  this.progress = calculateRoadmapProgressWeighted(activePhases);

  // Auto-update status if 100% progress
  if (this.progress === 100 && this.status === 'in_progress') {
    this.status = 'completed';
  }

  next();
});

export const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);
