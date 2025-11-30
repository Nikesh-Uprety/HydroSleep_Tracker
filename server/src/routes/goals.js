import express from 'express';
import { body, validationResult } from 'express-validator';
import Goal from '../models/Goal.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: 1 });
    
    res.json(goals.map(goal => ({
      id: goal._id,
      type: goal.type,
      label: goal.label,
      value: goal.value,
      unit: goal.unit,
      isDefault: goal.isDefault
    })));
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/',
  authMiddleware,
  [
    body('label').trim().notEmpty().withMessage('Label is required'),
    body('value').isNumeric().withMessage('Value must be a number'),
    body('unit').trim().notEmpty().withMessage('Unit is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { label, value, unit } = req.body;

      const goal = new Goal({
        userId: req.userId,
        type: 'custom',
        label,
        value,
        unit,
        isDefault: false
      });

      await goal.save();

      res.status(201).json({
        id: goal._id,
        type: goal.type,
        label: goal.label,
        value: goal.value,
        unit: goal.unit,
        isDefault: goal.isDefault
      });
    } catch (error) {
      console.error('Create goal error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.put('/:id',
  authMiddleware,
  [
    body('value').optional().isNumeric().withMessage('Value must be a number'),
    body('label').optional().trim().notEmpty().withMessage('Label cannot be empty'),
    body('unit').optional().trim().notEmpty().withMessage('Unit cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { id } = req.params;
      const { value, label, unit } = req.body;

      const goal = await Goal.findOne({ _id: id, userId: req.userId });
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      if (value !== undefined) goal.value = value;
      if (!goal.isDefault) {
        if (label) goal.label = label;
        if (unit) goal.unit = unit;
      }

      await goal.save();

      res.json({
        id: goal._id,
        type: goal.type,
        label: goal.label,
        value: goal.value,
        unit: goal.unit,
        isDefault: goal.isDefault
      });
    } catch (error) {
      console.error('Update goal error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.put('/type/:type',
  authMiddleware,
  [
    body('value').isNumeric().withMessage('Value must be a number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { type } = req.params;
      const { value } = req.body;

      const goal = await Goal.findOneAndUpdate(
        { userId: req.userId, type },
        { value },
        { new: true }
      );

      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      res.json({
        id: goal._id,
        type: goal.type,
        label: goal.label,
        value: goal.value,
        unit: goal.unit,
        isDefault: goal.isDefault
      });
    } catch (error) {
      console.error('Update goal by type error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    if (goal.isDefault) {
      return res.status(400).json({ error: 'Cannot delete default goals' });
    }

    await Goal.deleteOne({ _id: id });

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
