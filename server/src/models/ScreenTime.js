import mongoose from 'mongoose';

const screenTimeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    // Format: YYYY-MM-DD
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  appPackage: {
    type: String,
    required: true,
    trim: true
  },
  appName: {
    type: String,
    required: true,
    trim: true
  },
  usageMs: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries: userId + date
screenTimeSchema.index({ userId: 1, date: -1 });

// Unique compound index: userId + appPackage + date (prevents duplicates)
screenTimeSchema.index(
  { userId: 1, appPackage: 1, date: 1 },
  { unique: true }
);

// Index for appPackage queries (optional, useful for analytics)
screenTimeSchema.index({ userId: 1, appPackage: 1 });

export default mongoose.model('ScreenTime', screenTimeSchema);

