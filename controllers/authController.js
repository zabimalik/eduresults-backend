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

        // Use plain text comparison
        if (admin && admin.password === password) {
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

        if (admin && admin.password === oldPassword) {
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
        const defaultUsername = 'admin@gmail.com';
        const defaultPassword = 'admin123';

        let admin = await Admin.findOne({ username: defaultUsername });

        if (!admin) {
            await Admin.create({
                username: defaultUsername,
                password: defaultPassword,
            });
            console.log(`✅ Default admin account created (${defaultUsername}/${defaultPassword})`);
        } else {
            console.log(`ℹ️ Admin account already exists (${defaultUsername})`);
        }
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
    }
};


