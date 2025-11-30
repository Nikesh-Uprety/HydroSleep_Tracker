import express from 'express';
import { body, query, validationResult } from 'express-validator';
import SleepEntry from '../models/SleepEntry.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const SLEEP_SUGGESTIONS = [
  "A consistent sleep schedule helps your body recover.",
  "Try to avoid screens 30 minutes before bed for better sleep quality.",
  "Keep your bedroom cool and dark for optimal rest.",
  "Regular exercise can improve your sleep quality.",
  "Avoid caffeine in the afternoon for better sleep.",
  "A bedtime routine can signal your body it's time to sleep.",
  "Consider limiting naps to 20-30 minutes during the day."
];

const getSuggestion = () => {
  return SLEEP_SUGGESTIONS[Math.floor(Math.random() * SLEEP_SUGGESTIONS.length)];
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
};

router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const sleepEntry = await SleepEntry.findOne({ userId: req.userId })
      .sort({ date: -1 })
      .limit(1);

    if (!sleepEntry) {
      return res.json({
        entry: null,
        suggestion: "Start tracking your sleep for personalized insights!"
      });
    }

    res.json({
      entry: {
        id: sleepEntry._id,
        date: sleepEntry.date,
        durationMinutes: sleepEntry.durationMinutes,
        durationFormatted: formatDuration(sleepEntry.durationMinutes),
        restedPercent: sleepEntry.restedPercent,
        remPercent: sleepEntry.remPercent,
        deepSleepPercent: sleepEntry.deepSleepPercent,
        notes: sleepEntry.notes
      },
      suggestion: getSuggestion()
    });
  } catch (error) {
    console.error('Get latest sleep error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

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

    const entries = await SleepEntry.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: 1 });

    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const entry = entries.find(e => {
        const eDate = new Date(e.date);
        return eDate.toDateString() === date.toDateString();
      });

      weekData.push({
        date: date.toISOString(),
        durationMinutes: entry ? entry.durationMinutes : 0,
        entry: entry ? {
          id: entry._id,
          restedPercent: entry.restedPercent,
          remPercent: entry.remPercent,
          deepSleepPercent: entry.deepSleepPercent
        } : null
      });
    }

    res.json({
      startDate: startDate.toISOString(),
      entries: weekData
    });
  } catch (error) {
    console.error('Get week sleep error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/',
  authMiddleware,
  [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('durationMinutes').isInt({ min: 0 }).withMessage('Duration must be a positive number'),
    body('restedPercent').isInt({ min: 0, max: 100 }).withMessage('Rested percent must be 0-100'),
    body('remPercent').isInt({ min: 0, max: 100 }).withMessage('REM percent must be 0-100'),
    body('deepSleepPercent').isInt({ min: 0, max: 100 }).withMessage('Deep sleep percent must be 0-100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { date, durationMinutes, restedPercent, remPercent, deepSleepPercent, notes } = req.body;

      const entryDate = new Date(date);
      entryDate.setHours(0, 0, 0, 0);

      let sleepEntry = await SleepEntry.findOne({
        userId: req.userId,
        date: entryDate
      });

      if (sleepEntry) {
        sleepEntry.durationMinutes = durationMinutes;
        sleepEntry.restedPercent = restedPercent;
        sleepEntry.remPercent = remPercent;
        sleepEntry.deepSleepPercent = deepSleepPercent;
        sleepEntry.notes = notes || '';
        await sleepEntry.save();
      } else {
        sleepEntry = new SleepEntry({
          userId: req.userId,
          date: entryDate,
          durationMinutes,
          restedPercent,
          remPercent,
          deepSleepPercent,
          notes: notes || ''
        });
        await sleepEntry.save();
      }

      res.status(201).json({
        id: sleepEntry._id,
        date: sleepEntry.date,
        durationMinutes: sleepEntry.durationMinutes,
        durationFormatted: formatDuration(sleepEntry.durationMinutes),
        restedPercent: sleepEntry.restedPercent,
        remPercent: sleepEntry.remPercent,
        deepSleepPercent: sleepEntry.deepSleepPercent,
        notes: sleepEntry.notes
      });
    } catch (error) {
      console.error('Create sleep error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.put('/:id',
  authMiddleware,
  [
    body('durationMinutes').optional().isInt({ min: 0 }).withMessage('Duration must be a positive number'),
    body('restedPercent').optional().isInt({ min: 0, max: 100 }).withMessage('Rested percent must be 0-100'),
    body('remPercent').optional().isInt({ min: 0, max: 100 }).withMessage('REM percent must be 0-100'),
    body('deepSleepPercent').optional().isInt({ min: 0, max: 100 }).withMessage('Deep sleep percent must be 0-100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { id } = req.params;
      const updates = {};

      if (req.body.durationMinutes !== undefined) updates.durationMinutes = req.body.durationMinutes;
      if (req.body.restedPercent !== undefined) updates.restedPercent = req.body.restedPercent;
      if (req.body.remPercent !== undefined) updates.remPercent = req.body.remPercent;
      if (req.body.deepSleepPercent !== undefined) updates.deepSleepPercent = req.body.deepSleepPercent;
      if (req.body.notes !== undefined) updates.notes = req.body.notes;

      const sleepEntry = await SleepEntry.findOneAndUpdate(
        { _id: id, userId: req.userId },
        updates,
        { new: true }
      );

      if (!sleepEntry) {
        return res.status(404).json({ error: 'Sleep entry not found' });
      }

      res.json({
        id: sleepEntry._id,
        date: sleepEntry.date,
        durationMinutes: sleepEntry.durationMinutes,
        durationFormatted: formatDuration(sleepEntry.durationMinutes),
        restedPercent: sleepEntry.restedPercent,
        remPercent: sleepEntry.remPercent,
        deepSleepPercent: sleepEntry.deepSleepPercent,
        notes: sleepEntry.notes
      });
    } catch (error) {
      console.error('Update sleep error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SleepEntry.deleteOne({ _id: id, userId: req.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sleep entry not found' });
    }

    res.json({ message: 'Sleep entry deleted successfully' });
  } catch (error) {
    console.error('Delete sleep error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
