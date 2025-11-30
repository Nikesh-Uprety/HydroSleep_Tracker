import mongoose from 'mongoose';

const waterLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  amountMl: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

waterLogSchema.index({ userId: 1, date: -1 });

export default mongoose.model('WaterLog', waterLogSchema);
