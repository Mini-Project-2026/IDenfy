import express from 'express';
import {
    createUser,
    loginUser,
    getAllUsers,
    getUserByRollNo,
    getUserByEmail,
    getMyProfile,
    changePassword,
    updateUser,
    deleteUser,
    getStudentCount,
    updateSubadmin
} from '../controllers/user.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get count of students (admin/subadmin only)
router.get('/student-count', verifyToken, requireRole('admin', 'subadmin'), getStudentCount);


// Admin creates users
router.post('/create', verifyToken, requireRole('admin', 'subadmin'), createUser);

// User login
router.post('/login', loginUser);

// Get all users (admin only)
router.get('/all', verifyToken, requireRole('admin', 'subadmin'), getAllUsers);

// Get logged-in user profile
router.get('/me', verifyToken, getMyProfile);

// Change own password
router.put('/change-password', verifyToken, changePassword);

// Get user by roll number
router.get('/roll/:roll_no', verifyToken, getUserByRollNo);

// Get user by email
router.get('/email/:email', verifyToken, getUserByEmail);

// Update user by roll number
router.put('/update/:roll_no', verifyToken, updateUser);

// Delete user by roll number (admin only)
router.delete('/delete/:roll_no', verifyToken, requireRole('admin'), deleteUser);

// Update subadmin by _id
router.put('/update-subadmin/:id', verifyToken, requireRole('admin'), updateSubadmin);

export default router;
