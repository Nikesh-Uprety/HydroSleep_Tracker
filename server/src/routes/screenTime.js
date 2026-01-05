import express from 'express';
import { body, validationResult } from 'express-validator';
import ScreenTime from '../models/ScreenTime.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/screen-time/sync
 * Sync screen time data from the mobile app.
 * 
 * Request body: Array of ScreenTimeEntry objects
 * [
 *   {
 *     packageName: string,
 *     appName: string,
 *     usageMs: number,
 *     date: string (YYYY-MM-DD)
 *   },
 *   ...
 * ]
 * 
 * Sync strategy: Upsert (update if exists, insert if not)
 * - One record per: userId + appPackage + date
 */
router.post('/sync', 
  authMiddleware,
  [
    body().isArray().withMessage('Request body must be an array'),
    body('*.packageName')
      .trim()
      .notEmpty()
      .withMessage('packageName is required for each entry'),
    body('*.appName')
      .trim()
      .notEmpty()
      .withMessage('appName is required for each entry'),
    body('*.usageMs')
      .isNumeric()
      .isInt({ min: 0 })
      .withMessage('usageMs must be a non-negative integer'),
    body('*.date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('date must be in YYYY-MM-DD format')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.userId;
      const entries = req.body;

      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ error: 'Entries array cannot be empty' });
      }

      // Normalize and validate entries
      const normalizedEntries = entries.map(entry => ({
        userId,
        date: entry.date.trim(),
        appPackage: entry.packageName.trim(),
        appName: entry.appName.trim(),
        usageMs: Math.floor(Number(entry.usageMs))
      }));

      // Bulk upsert operations
      const bulkOps = normalizedEntries.map(entry => ({
        updateOne: {
          filter: {
            userId: entry.userId,
            appPackage: entry.appPackage,
            date: entry.date
          },
          update: {
            $set: {
              appName: entry.appName,
              usageMs: entry.usageMs
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          upsert: true
        }
      }));

      const result = await ScreenTime.bulkWrite(bulkOps, { ordered: false });

      res.json({
        success: true,
        inserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
        totalProcessed: normalizedEntries.length
      });
    } catch (error) {
      console.error('Screen time sync error:', error);
      
      // Handle duplicate key errors (shouldn't happen with upsert, but just in case)
      if (error.code === 11000) {
        return res.status(409).json({ 
          error: 'Duplicate entry detected. Please sync again.' 
        });
      }

      res.status(500).json({ error: 'Server error while syncing screen time data' });
    }
  }
);

/**
 * GET /api/screen-time/summary
 * Get screen time summary for the user.
 * 
 * Query params:
 * - startDate: YYYY-MM-DD (optional, defaults to 7 days ago)
 * - endDate: YYYY-MM-DD (optional, defaults to today)
 */
router.get('/summary',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const endDate = req.query.endDate || today.toISOString().split('T')[0];
      const startDate = req.query.startDate || (() => {
        const date = new Date(today);
        date.setDate(date.getDate() - 7);
        return date.toISOString().split('T')[0];
      })();

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      // Fetch screen time entries
      const entries = await ScreenTime.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1, usageMs: -1 });

      // Aggregate by date
      const dailyTotals = {};
      const appBreakdown = {};

      entries.forEach(entry => {
        // Daily totals
        if (!dailyTotals[entry.date]) {
          dailyTotals[entry.date] = 0;
        }
        dailyTotals[entry.date] += entry.usageMs;

        // App breakdown (aggregate across all dates)
        if (!appBreakdown[entry.appPackage]) {
          appBreakdown[entry.appPackage] = {
            packageName: entry.appPackage,
            appName: entry.appName,
            totalUsageMs: 0
          };
        }
        appBreakdown[entry.appPackage].totalUsageMs += entry.usageMs;
      });

      // Convert app breakdown to array and sort by usage
      const appBreakdownArray = Object.values(appBreakdown)
        .sort((a, b) => b.totalUsageMs - a.totalUsageMs);

      res.json({
        startDate,
        endDate,
        dailyTotals,
        appBreakdown: appBreakdownArray,
        totalEntries: entries.length
      });
    } catch (error) {
      console.error('Screen time summary error:', error);
      res.status(500).json({ error: 'Server error while fetching screen time summary' });
    }
  }
);

export default router;

