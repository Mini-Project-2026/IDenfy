import express from 'express';
import {
    createUser,
    loginUser,
    getAllUsers,
    getUserByRollNo,
    getUserByEmail,
    updateUser,
    deleteUser
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create a new user
router.post('/create', createUser);

// User login
router.post('/login', loginUser);

// Get all users (protected route)
router.get('/all', verifyToken, getAllUsers);

// Get user by roll number (protected route)
router.get('/roll/:roll_no', verifyToken, getUserByRollNo);

// Get user by email (protected route)
router.get('/email/:email', verifyToken, getUserByEmail);

// Update user by roll number (protected route)
router.put('/update/:roll_no', verifyToken, updateUser);

// Delete user by roll number (protected route)
router.delete('/delete/:roll_no', verifyToken, deleteUser);

export default router;
