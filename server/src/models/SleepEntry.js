import mongoose from 'mongoose';

const sleepEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 0
  },
  restedPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  remPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  deepSleepPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

sleepEntrySchema.index({ userId: 1, date: -1 });

export default mongoose.model('SleepEntry', sleepEntrySchema);
