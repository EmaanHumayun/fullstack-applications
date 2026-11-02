import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, default: 'Emaan Humayun' },
  headline: { type: String, default: 'Software Engineer · Backend · AI · Automation' },
  bio: { type: String, default: 'Building practical software, reliable backend architectures, and intelligent agentic workflows.' },
  location: { type: String, default: 'Lahore, Pakistan' },
  contactEmail: { type: String, default: 'emaan.humayun@example.com' },
  email: { type: String, default: 'emaan.humayun@example.com' },
  phone: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  githubUrl: { type: String, default: 'https://github.com/EmaanHumayun' },
  linkedinUrl: { type: String, default: '' },
  twitterUrl: { type: String, default: '' },
  websiteUrl: { type: String, default: '' },
  careerGoals: [String],
  interests: [String],
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    fieldOfStudy: { type: String, default: '' },
    startYear: { type: String, default: '' },
    endYear: { type: String, default: '' },
    grade: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null }
  }],
  achievements: [{
    title: { type: String, required: true },
    year: String,
    issuer: String,
    description: String
  }],
  socialLinks: {
    github: { type: String, default: 'https://github.com/EmaanHumayun' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    website: { type: String, default: '' },
    custom: [{
      platform: String,
      url: String,
      label: String
    }]
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
