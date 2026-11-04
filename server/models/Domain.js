import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  icon: { type: String, default: 'code' },
  accentColor: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  parentDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null
  }
}, { timestamps: true });

const domainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Domain name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  accentColor: {
    type: String,
    default: '#bb9457'
  },
  icon: {
    type: String,
    default: 'layers'
  },
  coverImage: {
    type: String,
    default: ''
  },
  parentDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  fields: [fieldSchema],
  isFeatured: {
    type: Boolean,
    default: true
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

// Alias subdomains to fields
domainSchema.virtual('subdomains').get(function () {
  return this.fields;
});
domainSchema.set('toJSON', { virtuals: true });
domainSchema.set('toObject', { virtuals: true });

// Prevent circular hierarchy
domainSchema.pre('save', async function (next) {
  this.updatedAt = new Date();
  if (this.parentDomain) {
    if (String(this._id) === String(this.parentDomain)) {
      return next(new Error('A domain cannot be its own parent.'));
    }
    // Check circular ancestors
    let currentParentId = this.parentDomain;
    const visited = new Set([String(this._id)]);
    while (currentParentId) {
      if (visited.has(String(currentParentId))) {
        return next(new Error('Circular domain hierarchy detected.'));
      }
      visited.add(String(currentParentId));
      const ancestor = await mongoose.models.Domain.findById(currentParentId).select('parentDomain');
      currentParentId = ancestor ? ancestor.parentDomain : null;
    }
  }
  next();
});

export const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema);

