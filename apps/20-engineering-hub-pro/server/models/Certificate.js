import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Certificate title is required'],
    trim: true
  },
  issuer: {
    type: String,
    default: ''
  },
  issuedAt: {
    type: String,
    default: ''
  },
  expiryDate: {
    type: String,
    default: ''
  },
  credentialId: {
    type: String,
    default: ''
  },
  credentialUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: 'image'
  },
  primaryDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    index: true
  },
  domain: {
    type: String,
    default: ''
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
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'expired'],
    default: 'completed',
    index: true
  },
  evidence: {
    type: String,
    default: ''
  },
  relatedSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
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
  relatedResources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  }],
  description: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
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

certificateSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Certificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
