import express from 'express';
import { getAllUsers, getUserById, updateUserRole, toggleUserStatus } from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { validate, updateUserRoleSchema } from '../lib/validation.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(protect, admin);

// Admin routes for user management
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.patch('/:id/status', toggleUserStatus);

export default router;