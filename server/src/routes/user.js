import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      displayName: user.displayName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/me',
  authMiddleware,
  [
    body('displayName').optional().trim().notEmpty().withMessage('Display name cannot be empty'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { displayName, email } = req.body;
      const updates = {};

      if (displayName) updates.displayName = displayName;
      
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        updates.email = email;
      }

      const user = await User.findByIdAndUpdate(
        req.userId,
        updates,
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.put('/me/password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

router.put('/me/avatar',
  authMiddleware,
  [
    body('profileImageUrl').notEmpty().withMessage('Profile image URL is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { profileImageUrl } = req.body;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { profileImageUrl },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error('Update avatar error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;
