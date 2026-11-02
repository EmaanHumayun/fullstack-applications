import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  portfolioVisibility: {
    hero: { type: Boolean, default: true },
    about: { type: Boolean, default: true },
    education: { type: Boolean, default: true },
    skills: { type: Boolean, default: true },
    roadmaps: { type: Boolean, default: true },
    projects: { type: Boolean, default: true },
    milestones: { type: Boolean, default: true },
    notes: { type: Boolean, default: true },
    certificates: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
    goals: { type: Boolean, default: false }
  },
  sectionOrder: {
    type: [String],
    default: ['hero', 'stats', 'projects', 'skills', 'roadmaps', 'education', 'certificates', 'milestones', 'notes', 'contact']
  },
  defaultProjectStatus: {
    type: String,
    default: 'In progress'
  },
  dateFormat: {
    type: String,
    default: 'MMM D, YYYY'
  },
  allowPublicResume: {
    type: Boolean,
    default: true
  },
  seoTitle: {
    type: String,
    default: 'Engineering Hub Pro — Software Engineering Command Center'
  },
  seoDescription: {
    type: String,
    default: 'Personal engineering management hub, hierarchical project repository, skills roadmaps, and technical notes.'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
