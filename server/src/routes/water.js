import express from 'express';
import { body, validationResult } from 'express-validator';
import WaterLog from '../models/WaterLog.js';
import Goal from '../models/Goal.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/week', authMiddleware, async (req, res) => {
  try {
    const { start } = req.query;
    
    let startDate;
    if (start) {
      startDate = new Date(start);
    } else {
      startDate = new Date();
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
    }
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const logs = await WaterLog.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: 1 });

    const waterGoal = await Goal.findOne({ userId: req.userId, type: 'water' });
    const dailyGoalMl = waterGoal ? waterGoal.value * 1000 : 3000;

    const weekData = [];
    let goalMetCount = 0;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const log = logs.find(l => {
        const lDate = new Date(l.date);
        return lDate.toDateString() === date.toDateString();
      });

      const amountMl = log ? log.amountMl : 0;
      const goalMet = amountMl >= dailyGoalMl && date <= today;
      if (goalMet) goalMetCount++;

      weekData.push({
        date: date.toISOString(),
        amountMl,
        goalMet,
        id: log ? log._id : null
      });
    }

    const pastDays = weekData.filter(d => new Date(d.date) <= today).length;
    const weeklyGoalMet = goalMetCount === pastDays && pastDays > 0;

    res.json({
      startDate: startDate.toISOString(),
      dailyGoalMl,
      dailyGoalLiters: dailyGoalMl / 1000,
      weeklyGoalMet,
      goalMetCount,
      entries: weekData
    });
  } catch (error) {
    console.error('Get week water error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await WaterLog.findOne({
      userId: req.userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const waterGoal = await Goal.findOne({ userId: req.userId, type: 'water' });
    const dailyGoalMl = waterGoal ? waterGoal.value * 1000 : 3000;

    res.json({
      date: today.toISOString(),
      amountMl: log ? log.amountMl : 0,
      dailyGoalMl,
      progress: log ? Math.min((log.amountMl / dailyGoalMl) * 100, 100) : 0
    });
  } catch (error) {
    console.error('Get today water error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/',
  authMiddleware,
  [
    body('amountMl').isInt({ min: 1 }).withMessage('Amount must be a positive number'),
    body('date').optional().isISO8601().withMessage('Valid date is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      let { amountMl, date } = req.body;

      const logDate = date ? new Date(date) : new Date();
      logDate.setHours(0, 0, 0, 0);

      let waterLog = await WaterLog.findOne({
        userId: req.userId,
        date: logDate
      });

      if (waterLog) {
        waterLog.amountMl += amountMl;
        await waterLog.save();
      } else {
        waterLog = new WaterLog({
          userId: req.userId,
          date: logDate,
          amountMl
        });
        await waterLog.save();
      }

      const waterGoal = await Goal.findOne({ userId: req.userId, type: 'water' });
      const dailyGoalMl = waterGoal ? waterGoal.value * 1000 : 3000;

      res.status(201).json({
        id: waterLog._id,
        date: waterLog.date,
        amountMl: waterLog.amountMl,
        dailyGoalMl,
        progress: Math.min((waterLog.amountMl / dailyGoalMl) * 100, 100)
      });
    } catch (error) {
      console.error('Create water log error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.put('/:id',
  authMiddleware,
  [
    body('amountMl').isInt({ min: 0 }).withMessage('Amount must be a non-negative number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { id } = req.params;
      const { amountMl } = req.body;

      const waterLog = await WaterLog.findOneAndUpdate(
        { _id: id, userId: req.userId },
        { amountMl },
        { new: true }
      );

      if (!waterLog) {
        return res.status(404).json({ error: 'Water log not found' });
      }

      res.json({
        id: waterLog._id,
        date: waterLog.date,
        amountMl: waterLog.amountMl
      });
    } catch (error) {
      console.error('Update water log error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
