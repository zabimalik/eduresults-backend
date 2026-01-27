import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username });

        if (admin && (await admin.matchPassword(password))) {
            res.json({
                success: true,
                data: {
                    _id: admin._id,
                    username: admin.username,
                    token: generateToken(admin._id),
                },
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const admin = await Admin.findById(req.admin._id);

        if (admin && (await admin.matchPassword(oldPassword))) {
            admin.password = newPassword;
            await admin.save();
            res.json({
                success: true,
                message: 'Password updated successfully',
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid current password',
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

// Seeding function to ensure at least one admin exists
export const seedAdmin = async () => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const defaultPassword = 'admin123';
            await Admin.create({
                username: 'admin',
                password: defaultPassword,
            });
            console.log('✅ Default admin account created (admin/admin123)');
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};
