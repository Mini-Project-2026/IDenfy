import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    roll_no: {
        type: String,
        required: function() {
            return this.role === 'user';
        },
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fabric_identity: {
        type: String,
        required: function() {
            return this.role === 'user';
        }
    },
    dob: {
        type: Date,
        required: function() {
            return this.role === 'user';
        }
    },
    department: {
        type: String,
        required: function() {
            return this.role === 'user';
        }
    },
    role: {
        type: String,
        enum: ['admin','subadmin','user'],
        default: 'user'
    }
}, { timestamps: true, collection: 'users' });

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return ;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        console.log(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);