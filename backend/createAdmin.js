import { User } from './src/models/user.models.js';
import connectDB from './src/db/dbConnect.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
    try {
        // Connect to MongoDB using shared dbConnect helper
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists:', existingAdmin.email);
            return;
        }

        // Create admin user with values from .env (expecting .env entries provided)
        const admin = new User({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Name:', admin.name);
        console.log('Email:', admin.email);
        
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        process.exit(0);
    }
};

createAdmin();