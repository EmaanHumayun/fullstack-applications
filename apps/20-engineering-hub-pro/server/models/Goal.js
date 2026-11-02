import mongoose from 'mongoose';

const goalMilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sequence: { type: Number, default: 0 },
  dueDate: { type: Date, default: null },
  isCompleted: { type: Boolean, default: false },
  weight: { type: Number, default: 1 },
  completedAt: { type: Date, default: null },
  evidenceUrl: { type: String, default: '' }
}, { _id: true });

const goalTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  dueDate: { type: Date, default: null },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Critical'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed', 'blocked'],
    default: 'todo'
  },
  estimatedHours: { type: Number, default: 1 },
  actualHours: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  associatedSkill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    default: null
  }
}, { _id: true });

const goalReviewSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  completedSummary: { type: String, default: '' },
  uncompletedSummary: { type: String, default: '' },
  blockers: { type: String, default: '' },
  learnings: { type: String, default: '' },
  isDeadlineRealistic: { type: Boolean, default: true },
  nextCommitments: { type: String, default: '' }
}, { _id: true });

const goalRequiredSkillSchema = new mongoose.Schema({
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  targetLevel: {
    type: String,
    enum: ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  isAcquired: {
    type: Boolean,
    default: false
  }
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

const goalResourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, default: '' },
  completed: { type: Boolean, default: false }
}, { _id: true });

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  whyItMatters: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Technical Mastery',
    index: true
  },
  domainAssociations: {
    type: [domainAssociationSchema],
    default: []
  },
  primaryDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v,
    index: true
  },
  subdomain: {
    type: String,
    default: '',
    trim: true
  },
  subdomainId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v
  },
  secondaryDomains: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  }],
  timeHorizon: {
    type: String,
    enum: ['Long-term Vision', 'Strategic Goal', 'Short-term Goal', 'Weekly Action'],
    default: 'Strategic Goal',
    index: true
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Planned',
      'Active',
      'In Progress',
      'On hold',
      'Completed',
      'Achieved',
      'Cancelled',
      'Deferred',
      'Archived'
    ],
    default: 'Active',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'Medium', 'High', 'Critical', 'Urgent'],
    default: 'High',
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: String,
    default: ''
  },
  deadline: {
    type: Date,
    default: null
  },
  completionDate: {
    type: Date,
    default: null
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  progressMode: {
    type: String,
    enum: ['milestones', 'tasks', 'manual'],
    default: 'milestones'
  },
  measurableSuccessCriteria: {
    type: String,
    default: ''
  },
  targetOutcome: {
    type: String,
    default: ''
  },
  currentOutcome: {
    type: String,
    default: ''
  },
  parentGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v
  },
  childGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  linkedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  requiredSkills: [goalRequiredSkillSchema],
  associatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  linkedRoadmaps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap'
  }],
  learningResources: [goalResourceSchema],
  certifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  milestonesList: [goalMilestoneSchema],
  tasks: [goalTaskSchema],
  reviews: [goalReviewSchema],
  blockers: {
    type: [String],
    default: []
  },
  risks: {
    type: [String],
    default: []
  },
  milestones: {
    type: [String],
    default: []
  },
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

// Auto-recalculate progress helper function
goalSchema.methods.recalculateProgress = function () {
  if (this.progressMode === 'milestones') {
    if (this.milestonesList && this.milestonesList.length > 0) {
      const totalWeight = this.milestonesList.reduce((acc, m) => acc + (m.weight || 1), 0);
      const completedWeight = this.milestonesList
        .filter(m => m.isCompleted)
        .reduce((acc, m) => acc + (m.weight || 1), 0);
      this.progress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    }
  } else if (this.progressMode === 'tasks') {
    if (this.tasks && this.tasks.length > 0) {
      const completedTasks = this.tasks.filter(t => t.isCompleted || t.status === 'completed').length;
      this.progress = Math.round((completedTasks / this.tasks.length) * 100);
    }
  }
  if (this.progress === 100 && (this.status === 'Active' || this.status === 'In Progress')) {
    this.status = 'Completed';
    this.completionDate = new Date();
  }
  return this.progress;
};

// Virtual populate for Milestone entities pointing to this Goal
goalSchema.virtual('externalMilestones', {
  ref: 'Milestone',
  localField: '_id',
  foreignField: 'parentGoalId'
});

goalSchema.index({ 'domainAssociations.domainId': 1 });
goalSchema.index({ 'domainAssociations.subdomainIds': 1 });

goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

goalSchema.pre('save', async function (next) {
  this.updatedAt = new Date();

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

  if (this.progressMode !== 'manual') {
    this.recalculateProgress();
  }
  next();
});

export const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);
