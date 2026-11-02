import mongoose from 'mongoose';

const workLogEvidenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    enum: ['repository', 'pull_request', 'commit', 'demo', 'documentation', 'benchmark', 'screenshot', 'other'],
    default: 'repository'
  },
  notes: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const workLogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Work log title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    required: [true, 'Date is required (YYYY-MM-DD)'],
    index: true
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  },
  timeSpentMinutes: {
    type: Number,
    required: [true, 'Duration in minutes is required'],
    default: 60,
    min: [1, 'Time spent must be at least 1 minute'],
    max: [1440, 'Time spent cannot exceed 24 hours (1440 minutes)']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  category: {
    type: String,
    default: 'Development',
    trim: true,
    index: true
  },
  activityType: {
    type: String,
    default: 'Coding',
    trim: true
  },
  status: {
    type: String,
    enum: ['completed', 'in_progress', 'planned', 'blocked'],
    default: 'completed',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  // Cross-Module Engineering Relationships
  primaryDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    index: true
  },
  subdomain: {
    type: String,
    default: '',
    trim: true,
    index: true
  },
  subdomainId: {
    type: String,
    default: ''
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
    index: true
  },
  skillIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    index: true
  }],
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    default: null,
    index: true
  },
  roadmapPhaseId: {
    type: String,
    default: ''
  },
  roadmapStepId: {
    type: String,
    default: ''
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null,
    index: true
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    default: null,
    index: true
  },
  resourceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate',
    default: null
  },

  // Outcomes & Qualitative Intelligence
  outcome: {
    type: String,
    default: ''
  },
  whatLearned: {
    type: String,
    default: ''
  },
  problemEncountered: {
    type: String,
    default: ''
  },
  problemSolution: {
    type: String,
    default: ''
  },
  blockers: {
    type: String,
    default: ''
  },
  nextAction: {
    type: String,
    default: ''
  },
  reflectionNotes: {
    type: String,
    default: ''
  },
  evidence: [workLogEvidenceSchema],

  tags: {
    type: [String],
    default: []
  },
  links: [{
    label: String,
    url: String
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
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

workLogSchema.index({ date: -1, isArchived: 1 });
workLogSchema.index({ primaryDomain: 1, date: -1 });
workLogSchema.index({ projectId: 1, date: -1 });

workLogSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const WorkLog = mongoose.models.WorkLog || mongoose.model('WorkLog', workLogSchema);
