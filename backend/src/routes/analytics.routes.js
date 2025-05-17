import express from 'express';
import { getDashboardStats, getUserActivityStats } from '../controllers/analytics.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All analytics routes are protected and require admin access
router.use(protect, admin);

// Analytics routes
router.get('/dashboard', getDashboardStats);
router.get('/user-activity', getUserActivityStats);

export default router;