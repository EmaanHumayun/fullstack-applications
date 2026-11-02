import mongoose from 'mongoose';

const practiceHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  durationMinutes: { type: Number, default: 30 },
  topic: { type: String, trim: true, default: '' },
  learnings: { type: String, default: '' },
  challenges: { type: String, default: '' },
  evidenceUrl: { type: String, default: '' },
  nextAction: { type: String, default: '' }
}, { _id: true });

const practicalEvidenceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now }
}, { _id: true });

const learningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, default: '' },
  type: { type: String, default: 'Documentation' }, // Documentation, Course, Book, Paper, Lab
  completed: { type: Boolean, default: false }
}, { _id: true });

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  category: {
    type: String,
    default: 'Backend Engineering',
    index: true
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
  subcategory: {
    type: String,
    default: '',
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  skillType: {
    type: String,
    enum: ['Technical', 'Architectural', 'Process', 'Tooling', 'Foundational'],
    default: 'Technical'
  },
  description: {
    type: String,
    default: ''
  },
  publicDescription: {
    type: String,
    default: ''
  },
  level: {
    type: String,
    enum: ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
    index: true
  },
  targetProficiency: {
    type: String,
    enum: ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Advanced'
  },
  confidenceRating: {
    type: Number,
    min: 1,
    max: 10,
    default: 7
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: [
      'Planned',
      'Learning',
      'Practising',
      'Demonstrated',
      'Needs revision',
      'On hold',
      'Archived',
      // Legacy backward compatibility
      'Proficient',
      'Mastered',
      'To Learn'
    ],
    default: 'Learning',
    index: true
  },
  proficiencyPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 65
  },
  icon: {
    type: String,
    default: ''
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  lastPractisedDate: {
    type: Date,
    default: null
  },
  lastReviewedDate: {
    type: Date,
    default: null
  },
  nextReviewDate: {
    type: Date,
    default: null
  },
  learningNotes: {
    type: String,
    default: ''
  },
  strengths: {
    type: [String],
    default: []
  },
  knownGaps: {
    type: [String],
    default: []
  },
  nextAction: {
    type: String,
    default: ''
  },
  relatedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  relatedRoadmaps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap'
  }],
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  relatedResources: [learningResourceSchema],
  relatedCertificates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  }],
  practicalEvidence: [practicalEvidenceSchema],
  practiceHistory: [practiceHistorySchema],
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  featuredOrder: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
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

// Auto generate slug if missing
skillSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

export const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);
