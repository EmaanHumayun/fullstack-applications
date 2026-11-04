import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  themeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  description: {
    type: String,
    default: ''
  },
  raw: {
    type: [String],
    default: []
  },
  colors: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  isPreset: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { minimize: false });

themeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Theme = mongoose.models.Theme || mongoose.model('Theme', themeSchema);
