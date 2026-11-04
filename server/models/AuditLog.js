import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  actorId: {
    type: String,
    default: 'system'
  },
  actorEmail: {
    type: String,
    default: 'system'
  },
  actorRole: {
    type: String,
    default: 'system'
  },
  targetResource: {
    type: String,
    index: true
  },
  targetId: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
