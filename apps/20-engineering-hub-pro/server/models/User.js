import mongoose from 'mongoose';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  passwordHash: {
    type: String,
    required: false,
    default: ''
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    trim: true,
    default: ''
  },
  avatar: {
    type: String,
    trim: true,
    default: ''
  },
  name: {
    type: String,
    trim: true,
    default: 'Viewer Guest'
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.ADMIN
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  customPermissions: {
    type: [String],
    default: []
  },
  lastLogin: {
    type: Date
  },
  lastLoginIp: {
    type: String,
    default: ''
  },
  lastLoginUserAgent: {
    type: String,
    default: ''
  },
  lastLoginMethod: {
    type: String,
    default: ''
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

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Avoid re-compiling model if already registered
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', userSchema);
