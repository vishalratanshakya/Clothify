import express from 'express';
import { getUserProfile, getUserProfileById, updateUserProfile } from '../controllers/userProfileController.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authUser, getUserProfile);

// Get user profile by ID (admin only)
router.get('/user', adminAuth, getUserProfileById);

// Update user profile  
router.post('/update', authUser, updateUserProfile);

export default router;
