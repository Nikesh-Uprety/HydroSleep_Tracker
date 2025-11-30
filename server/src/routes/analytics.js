import express from 'express';
import Goal from '../models/Goal.js';
import SleepEntry from '../models/SleepEntry.js';
import WaterLog from '../models/WaterLog.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const getDayName = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const range = req.query.range || '7d';
    const days = parseInt(range) || 7;

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const sleepEntries = await SleepEntry.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const waterLogs = await WaterLog.find({
      userId: req.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    const goals = await Goal.find({ userId: req.userId });

    const waterGoal = goals.find(g => g.type === 'water');
    const sleepGoal = goals.find(g => g.type === 'sleep');
    const dailyGoalMl = waterGoal ? waterGoal.value * 1000 : 3000;
    const dailyGoalLiters = waterGoal ? waterGoal.value : 3;
    const sleepGoalHours = sleepGoal ? sleepGoal.value : 8;

    const sleepDays = [];
    const sleepHours = [];
    const waterDays = [];
    const waterLiters = [];

    let totalSleepHours = 0;
    let sleepDaysCount = 0;
    let waterGoalMetCount = 0;
    let sleepGoalMetCount = 0;
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      if (date > today) continue;

      const dayName = getDayName(date);
      sleepDays.push(dayName);
      waterDays.push(dayName);

      const sleepEntry = sleepEntries.find(e => {
        const eDate = new Date(e.date);
        return eDate.toDateString() === date.toDateString();
      });

      const hours = sleepEntry ? Math.round((sleepEntry.durationMinutes / 60) * 10) / 10 : 0;
      sleepHours.push(hours);
      if (hours > 0) {
        totalSleepHours += hours;
        sleepDaysCount++;
        if (hours >= sleepGoalHours) sleepGoalMetCount++;
      }

      const waterLog = waterLogs.find(l => {
        const lDate = new Date(l.date);
        return lDate.toDateString() === date.toDateString();
      });

      const liters = waterLog ? Math.round((waterLog.amountMl / 1000) * 10) / 10 : 0;
      waterLiters.push(liters);
      if (liters >= dailyGoalLiters) waterGoalMetCount++;
    }

    const sleepAverage = sleepDaysCount > 0 
      ? Math.round((totalSleepHours / sleepDaysCount) * 100) / 100 
      : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayWater = await WaterLog.findOne({
      userId: req.userId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const todaySleep = await SleepEntry.findOne({
      userId: req.userId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    let completedToday = 0;
    if (todayWater && todayWater.amountMl >= dailyGoalMl) completedToday++;
    if (todaySleep && todaySleep.durationMinutes >= sleepGoalHours * 60) completedToday++;

    const totalDaysTracked = sleepDays.length;
    const totalGoalCompletions = waterGoalMetCount + sleepGoalMetCount;
    const totalPossibleCompletions = totalDaysTracked * 2;
    const weeklyCompletionRatePercent = totalPossibleCompletions > 0
      ? Math.round((totalGoalCompletions / totalPossibleCompletions) * 100)
      : 0;

    res.json({
      sleep: {
        days: sleepDays,
        hours: sleepHours,
        average: sleepAverage,
        goalHours: sleepGoalHours,
        goalMetCount: sleepGoalMetCount
      },
      water: {
        days: waterDays,
        liters: waterLiters,
        dailyGoalLiters,
        goalMetCount: waterGoalMetCount
      },
      goals: {
        totalGoals: goals.length,
        completedToday,
        weeklyCompletionRatePercent
      }
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
