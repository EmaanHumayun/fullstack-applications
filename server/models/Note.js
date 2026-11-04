import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Note slug is required'],
    unique: true,
    index: true,
    trim: true
  },
  category: {
    type: String,
    default: 'Backend',
    index: true
  },
  folder: {
    type: String,
    default: 'General',
    index: true
  },
  content: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  pinned: {
    type: Boolean,
    default: false,
    index: true
  },
  draft: {
    type: Boolean,
    default: false,
    index: true
  },
  relatedProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  relatedSkillIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  visibility: {
    type: String,
    enum: ['public', 'private', 'draft'],
    default: 'draft',
    index: true
  },
  published: {
    type: Boolean,
    default: false,
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

noteSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
