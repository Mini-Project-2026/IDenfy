import main from '../../chaincode-config/registerUser.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (userId, roll_no, email, role) => {
    return jwt.sign(
        { userId, roll_no, email, role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Admin-created user
export const createUser = async (req, res) => {
    try {
        const { roll_no, name, email, password, dob, role, department } = req.body;
        const normalizedRole = role ? role.toLowerCase() : 'user';

        // Only admin can create users/subadmins
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. Admin access required.' });
        }

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, Email, and Password are required' });
        }

        if (normalizedRole === 'user' && !roll_no) {
            return res.status(400).json({ error: 'Roll No is required for user role' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        if (normalizedRole === 'admin') {
            return res.status(400).json({ error: 'Creating a new admin is not allowed.' });
        }

        if (!['subadmin', 'user'].includes(normalizedRole)) {
            return res.status(400).json({ error: 'Role must be subadmin or user' });
        }

        if (normalizedRole === 'user') {
            if (!department) {
                return res.status(400).json({ error: 'Department is required for user role' });
            }
            if (!dob) {
                return res.status(400).json({ error: 'Date of birth is required for user role' });
            }
        } else {
            if (dob) {
                return res.status(400).json({ error: 'Date of birth is only allowed for user role' });
            }
        }

        const existingUser = await User.findOne({ $or: [{ roll_no: roll_no || null }, { email }] });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this Roll No or Email already exists' });
        }

        const user = new User({
            roll_no: normalizedRole === 'user' ? roll_no : null,
            name,
            email,
            password,
            fabric_identity: normalizedRole === 'user' ? roll_no : null,
            dob: normalizedRole === 'user' ? dob : null,
            department: normalizedRole === 'user' ? department : null,
            role: normalizedRole
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        await main().catch(console.error); // Register user on blockchain asynchronously

        res.status(201).json({
            message: 'User created successfully',
            user: userResponse,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User login/authentication
export const loginUser = async (req, res) => {
    try {
        const { roll_no, email, password } = req.body;

        if (!password || (!roll_no && !email)) {
            return res.status(400).json({ error: 'Email/Roll No and Password are required' });
        }

        const user = await User.findOne({
            $or: [{ roll_no }, { email }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user._id, user.roll_no, user.email, user.role);

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users (admin and subadmin)
export const getAllUsers = async (req, res) => {
    try {
        if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. Admin or subadmin access required.' });
        }

        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get my profile
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please login.' });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Change own password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please login.' });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordMatch = await user.comparePassword(currentPassword);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user by roll number
export const getUserByRollNo = async (req, res) => {
    try {
        const { roll_no } = req.params;

        if (req.user.role !== 'admin' && req.user.roll_no !== roll_no) {
            return res.status(403).json({ error: 'Forbidden. Access denied.' });
        }

        const user = await User.findOne({ roll_no }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user by email
export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        if (req.user.role !== 'admin' && req.user.email !== email) {
            return res.status(403).json({ error: 'Forbidden. Access denied.' });
        }

        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user by roll number
export const updateUser = async (req, res) => {
    try {
        const { roll_no } = req.params;
        const { name, dob, department} = req.body;

        if (req.user.role !== 'admin' && req.user.roll_no !== roll_no) {
            return res.status(403).json({ error: 'Forbidden. Access denied.' });
        }

        const targetUser = await User.findOne({ roll_no });
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Email should never be changed after admin assignment
        if (req.body.email) {
            return res.status(400).json({ error: 'Email cannot be changed' });
        }

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (dob && targetUser.role !== 'user') {
            return res.status(400).json({ error: 'Date of birth is only allowed for user role' });
        }

        const updateData = { name };
        if (dob !== undefined) {
            updateData.dob = dob;
        }

        if (department !== undefined) {
            if (targetUser.role !== 'user') {
                return res.status(400).json({ error: 'Department is only allowed for user role' });
            }
            updateData.department = department;
        }

        const user = await User.findOneAndUpdate(
            { roll_no },
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete user by roll number
export const deleteUser = async (req, res) => {
    try {
        const { roll_no } = req.params;

        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. Admin access required.' });
        }

        const user = await User.findOneAndDelete({ roll_no });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
