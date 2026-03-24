import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (userId, roll_no, email) => {
    return jwt.sign(
        { userId, roll_no, email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Create a new user
export const createUser = async (req, res) => {
    try {
        const { roll_no, name, email, password, fabric_identity, dob } = req.body;

        // Validate required fields
        if (!roll_no || !name || !email || !password) {
            return res.status(400).json({ error: 'Roll No, Name, Email, and Password are required' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ roll_no }, { email }] });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this Roll No or Email already exists' });
        }

        const user = new User({
            roll_no,
            name,
            email,
            password,
            fabric_identity,
            dob
        });

        await user.save();
        
        // Generate token
        const token = generateToken(user._id, user.roll_no, user.email);
        
        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json({ 
            message: 'User created successfully', 
            user: userResponse,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User login/authentication
export const loginUser = async (req, res) => {
    try {
        const { roll_no, email, password } = req.body;

        // Validate required fields
        if (!password || (!roll_no && !email)) {
            return res.status(400).json({ error: 'Email/Roll No and Password are required' });
        }

        // Find user by roll_no or email
        const user = await User.findOne({
            $or: [{ roll_no }, { email }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare passwords
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user._id, user.roll_no, user.email);

        // Return user without password
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

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user by roll number
export const getUserByRollNo = async (req, res) => {
    try {
        const { roll_no } = req.params;
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
        const { name, email, fabric_identity, dob, password } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }

        // Prepare update object
        const updateData = { name, email, fabric_identity, dob };

        // If password is provided, add it to update
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long' });
            }
            updateData.password = password;
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
        const user = await User.findOneAndDelete({ roll_no });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
