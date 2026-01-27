import express from 'express';
import { authAdmin, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/login
router.post('/login', authAdmin);

// @route   POST /api/auth/change-password
router.post('/change-password', protect, changePassword);

export default router;
