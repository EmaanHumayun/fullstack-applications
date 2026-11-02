import mongoose from 'mongoose';

const timerSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  title: {
    type: String,
    default: 'Engineering Work Session',
    trim: true
  },
  category: {
    type: String,
    default: 'Development',
    trim: true
  },
  activityType: {
    type: String,
    default: 'Coding'
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
    ref: 'Skill'
  }],
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    default: null
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
    default: null
  },
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  pausedAt: {
    type: Date,
    default: null
  },
  totalPausedMs: {
    type: Number,
    default: 0
  },
  isRunning: {
    type: Boolean,
    default: true
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

timerSessionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const TimerSession = mongoose.models.TimerSession || mongoose.model('TimerSession', timerSessionSchema);
