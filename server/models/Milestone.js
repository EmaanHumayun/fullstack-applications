import mongoose from 'mongoose';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function sanitizeObjectIdArray(val) {
  if (!val) return [];
  if (!Array.isArray(val)) return [];
  return val.filter(id => id && id !== '' && id !== 'none' && mongoose.Types.ObjectId.isValid(String(id)));
}

const milestoneSubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedMinutes: {
    type: Number,
    default: 30
  }
}, { _id: true });

const milestoneEvidenceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['repository', 'pull_request', 'deployment', 'certification', 'document', 'test_results', 'benchmark', 'other'],
    default: 'repository'
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  from: {
    type: String,
    default: ''
  },
  to: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: true });

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Career', 'Project', 'Learning', 'Personal', 'Certification', 'Architecture'],
    default: 'Career',
    index: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'Medium', 'High', 'Critical', 'Urgent'],
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    enum: ['not_started', 'planned', 'in_progress', 'completed', 'blocked', 'archived'],
    default: 'planned',
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  weight: {
    type: Number,
    default: 1,
    min: 1
  },

  // Dates & Tracking
  startDate: {
    type: String,
    default: ''
  },
  targetDate: {
    type: String,
    default: ''
  },
  dueDate: {
    type: String,
    default: ''
  },
  completionDate: {
    type: String,
    default: ''
  },

  // Acceptance Criteria & Subtasks
  successCriteria: {
    type: [String],
    default: []
  },
  // Backward compatibility alias for tasks
  tasks: {
    type: [String],
    default: []
  },
  subtasks: [milestoneSubtaskSchema],

  // Direct Evidence & Documentation
  evidence: [milestoneEvidenceSchema],
  evidenceUrl: {
    type: String,
    default: ''
  },
  evidenceNotes: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  statusHistory: [statusHistorySchema],

  // Dependencies (Other Milestones that must complete before this one)
  dependsOn: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone'
    }],
    default: [],
    set: sanitizeObjectIdArray
  },

  // 1. Goal Relationship (Bidirectional)
  parentGoalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v,
    index: true
  },

  // 2. Domain & Subdomain System
  primaryDomain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain',
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v,
    index: true
  },
  subdomain: {
    type: String,
    default: '',
    trim: true
  },
  subdomainId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v
  },
  secondaryDomains: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain'
    }],
    default: [],
    set: sanitizeObjectIdArray
  },

  // 3. Roadmap & Steps Integration
  relatedRoadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v,
    index: true
  },
  relatedPhaseId: {
    type: String,
    default: ''
  },
  relatedStepId: {
    type: String,
    default: ''
  },
  relatedStepIds: {
    type: [String],
    default: []
  },

  // 4. Skills Connections (Plural array + legacy single ref)
  relatedSkills: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill'
    }],
    default: [],
    set: sanitizeObjectIdArray
  },
  relatedSkillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v,
    index: true
  },

  // 5. Projects Connections (Plural array + legacy single ref)
  relatedProjects: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    default: [],
    set: sanitizeObjectIdArray
  },
  relatedProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null,
    set: v => (!v || v === '' || v === 'none' || !mongoose.Types.ObjectId.isValid(v)) ? null : v,
    index: true
  },

  // 6. Certifications Connections
  relatedCertifications: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate'
    }],
    default: [],
    set: sanitizeObjectIdArray
  },

  // 7. Resources Connections
  relatedResources: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }],
    default: [],
    set: sanitizeObjectIdArray
  },

  // 8. Work Logs Connections
  relatedWorkLogs: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkLog'
    }],
    default: [],
    set: sanitizeObjectIdArray
  },

  // Visibility & Portfolio Showcasing
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
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

// Virtual aliases for compatibility
milestoneSchema.virtual('goalId').get(function () {
  return this.parentGoalId;
});

milestoneSchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});

// Overdue helper virtual
milestoneSchema.virtual('isOverdue').get(function () {
  if (this.status === 'completed' || this.status === 'archived') return false;
  const target = this.dueDate || this.targetDate;
  if (!target) return false;
  const d = new Date(target);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d < now;
});

milestoneSchema.set('toJSON', { virtuals: true });
milestoneSchema.set('toObject', { virtuals: true });

// Pre-save lifecycle hooks
milestoneSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Auto-generate slug
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  // Normalize targetDate and dueDate
  if (this.targetDate && !this.dueDate) {
    this.dueDate = this.targetDate;
  } else if (this.dueDate && !this.targetDate) {
    this.targetDate = this.dueDate;
  }

  // Sync legacy single refs with arrays
  if (this.relatedSkillId && (!this.relatedSkills || !this.relatedSkills.some(id => String(id) === String(this.relatedSkillId)))) {
    this.relatedSkills = this.relatedSkills || [];
    this.relatedSkills.push(this.relatedSkillId);
  } else if (this.relatedSkills && this.relatedSkills.length > 0 && !this.relatedSkillId) {
    this.relatedSkillId = this.relatedSkills[0];
  }

  if (this.relatedProjectId && (!this.relatedProjects || !this.relatedProjects.some(id => String(id) === String(this.relatedProjectId)))) {
    this.relatedProjects = this.relatedProjects || [];
    this.relatedProjects.push(this.relatedProjectId);
  } else if (this.relatedProjects && this.relatedProjects.length > 0 && !this.relatedProjectId) {
    this.relatedProjectId = this.relatedProjects[0];
  }

  // Calculate progress from subtasks if present
  if (this.subtasks && this.subtasks.length > 0) {
    const completedCount = this.subtasks.filter(st => st.completed).length;
    this.progress = Math.round((completedCount / this.subtasks.length) * 100);
    if (this.progress === 100 && this.status !== 'completed') {
      this.status = 'completed';
      if (!this.completionDate) {
        this.completionDate = new Date().toISOString().split('T')[0];
      }
    }
  } else if (this.status === 'completed') {
    this.progress = 100;
    if (!this.completionDate) {
      this.completionDate = new Date().toISOString().split('T')[0];
    }
  }

  // Track status changes in statusHistory
  if (this.isModified('status')) {
    const prevStatus = this._previousStatus || (this.isNew ? 'none' : 'planned');
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      from: prevStatus,
      to: this.status,
      date: new Date(),
      notes: this.status === 'completed' ? 'Marked completed' : `Status changed to ${this.status}`
    });
  }

  next();
});

// Static helper to detect circular dependencies
milestoneSchema.statics.detectCycle = async function (milestoneId, proposedDependsOn) {
  if (!milestoneId || !proposedDependsOn || proposedDependsOn.length === 0) {
    return false;
  }

  const targetIdStr = String(milestoneId);
  // Direct self-reference
  if (proposedDependsOn.some(id => String(id) === targetIdStr)) {
    return true;
  }

  const visited = new Set();
  const queue = [...proposedDependsOn.map(id => String(id))];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (currentId === targetIdStr) {
      return true; // Cycle detected!
    }

    if (!visited.has(currentId)) {
      visited.add(currentId);
      const node = await this.findById(currentId).select('dependsOn');
      if (node && node.dependsOn && node.dependsOn.length > 0) {
        for (const depId of node.dependsOn) {
          queue.push(String(depId));
        }
      }
    }
  }

  return false;
};

export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);
