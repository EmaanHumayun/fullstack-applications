import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  // Identity & Content
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    index: true
  },
  summary: {
    type: String,
    default: '',
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: [true, 'Destination URL is required'],
    trim: true
  },
  attachmentUrl: {
    type: String,
    default: '',
    trim: true
  },
  coverImageUrl: {
    type: String,
    default: '',
    trim: true
  },
  type: {
    type: String,
    default: 'Documentation',
    index: true
  },
  provider: {
    type: String,
    default: '',
    trim: true
  },
  author: {
    type: String,
    default: '',
    trim: true
  },
  publicationDate: {
    type: Date,
    default: null
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'Intermediate'
  },
  status: {
    type: String,
    enum: [
      'To Learn', 'Learning', 'Completed', 'Reference', 'Archived',
      'To Explore', 'In Progress' // Backward compatibility
    ],
    default: 'To Learn',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  isFavorite: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  collections: [{
    type: String,
    trim: true
  }],

  // Organization & Cross-Section Relationships
  primaryDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    index: true
  },
  domainName: {
    type: String,
    default: '',
    trim: true
  },
  secondaryDomains: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  }],
  relatedDomains: [{
    type: String,
    trim: true
  }],
  subdomain: {
    type: String,
    default: '',
    trim: true
  },
  subdomainId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedFields: [{
    type: String,
    trim: true
  }],
  relatedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    index: true
  }],
  relatedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  }],
  relatedRoadmaps: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    index: true
  }],
  relatedMilestones: [{
    type: String,
    trim: true
  }],
  relatedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    index: true
  }],

  // Personal Learning Workflow
  notes: {
    type: String,
    default: ''
  },
  intendedOutcome: {
    type: String,
    default: ''
  },
  estimatedDuration: {
    type: String,
    default: ''
  },
  completionDate: {
    type: Date,
    default: null
  },
  lastAccessedDate: {
    type: Date,
    default: null
  },

  // Type-specific custom metadata (repoLanguage, repoOwner, license, isbn, doi, toolCategory, etc.)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Visibility & Auditing
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
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for fast searching & multi-filter performance
resourceSchema.index({ title: 'text', description: 'text', summary: 'text', tags: 'text', notes: 'text', provider: 'text', author: 'text' });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ primaryDomain: 1, subdomain: 1 });
resourceSchema.index({ status: 1, priority: 1 });

resourceSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
