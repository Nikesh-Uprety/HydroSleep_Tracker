import express from 'express';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import SleepEntry from '../models/SleepEntry.js';
import WaterLog from '../models/WaterLog.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const goals = await Goal.find({ userId: req.userId });

    const latestSleep = await SleepEntry.findOne({ userId: req.userId })
      .sort({ date: -1 })
      .limit(1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayWater = await WaterLog.findOne({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const weekWaterLogs = await WaterLog.find({
      userId: req.userId,
      date: { $gte: startOfWeek, $lt: endOfWeek }
    });

    const waterGoal = goals.find(g => g.type === 'water');
    const dailyGoalMl = waterGoal ? waterGoal.value * 1000 : 3000;

    let weeklyGoalMetCount = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      if (date > today) continue;

      const log = weekWaterLogs.find(l => {
        const lDate = new Date(l.date);
        return lDate.toDateString() === date.toDateString();
      });

      if (log && log.amountMl >= dailyGoalMl) {
        weeklyGoalMetCount++;
      }
    }

    const pastDays = Math.min(7, Math.ceil((today - startOfWeek) / (1000 * 60 * 60 * 24)) + 1);
    const weeklyGoalMet = weeklyGoalMetCount === pastDays && pastDays > 0;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        profileImageUrl: user.profileImageUrl
      },
      water: {
        todayAmountMl: todayWater ? todayWater.amountMl : 0,
        dailyGoalMl,
        progress: todayWater ? Math.min((todayWater.amountMl / dailyGoalMl) * 100, 100) : 0,
        weeklyGoalMet,
        weeklyGoalMetCount
      },
      sleep: latestSleep ? {
        date: latestSleep.date,
        durationMinutes: latestSleep.durationMinutes,
        durationFormatted: `${Math.floor(latestSleep.durationMinutes / 60)}h ${(latestSleep.durationMinutes % 60).toString().padStart(2, '0')}m`,
        restedPercent: latestSleep.restedPercent,
        remPercent: latestSleep.remPercent,
        deepSleepPercent: latestSleep.deepSleepPercent
      } : null,
      goals: goals.map(g => ({
        id: g._id,
        type: g.type,
        label: g.label,
        value: g.value,
        unit: g.unit,
        isDefault: g.isDefault
      }))
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
