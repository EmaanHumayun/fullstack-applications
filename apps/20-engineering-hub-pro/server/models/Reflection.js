import mongoose from 'mongoose';

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  periodType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
    index: true
  },
  periodKey: {
    type: String,
    required: true,
    index: true
  },
  accomplishments: {
    type: String,
    default: ''
  },
  lessonsLearned: {
    type: String,
    default: ''
  },
  challenges: {
    type: String,
    default: ''
  },
  nextPriorities: {
    type: String,
    default: ''
  },
  habitsScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  tags: {
    type: [String],
    default: []
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

reflectionSchema.index({ periodType: 1, periodKey: 1, userId: 1 }, { unique: true });

reflectionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Reflection = mongoose.models.Reflection || mongoose.model('Reflection', reflectionSchema);
