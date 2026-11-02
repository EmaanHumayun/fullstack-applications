import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: 'custom'
  },
  customPlatformName: {
    type: String,
    trim: true,
    default: ''
  },
  label: {
    type: String,
    required: [true, 'Display label is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Destination URL is required'],
    trim: true
  },
  username: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'globe'
  },
  order: {
    type: Number,
    default: 0,
    index: true
  },
  isEnabled: {
    type: Boolean,
    default: true,
    index: true
  },
  placement: {
    type: [String],
    default: ['hero', 'footer', 'contact']
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

socialLinkSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const SocialLink = mongoose.models.SocialLink || mongoose.model('SocialLink', socialLinkSchema);
