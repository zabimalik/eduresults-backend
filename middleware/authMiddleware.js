import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            if (!process.env.JWT_SECRET) {
                console.error('❌ protect middleware: JWT_SECRET is missing');
                return res.status(500).json({
                    success: false,
                    message: 'Server configuration error: JWT_SECRET is missing',
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Wait/Check for database connection (Vercel serverless persistence)
            if (Admin.db.readyState !== 1) {
                console.warn('⚠️ protect middleware: Database not connected (readyState: ' + Admin.db.readyState + ')');
            }

            // Get admin from the token
            req.admin = await Admin.findById(decoded.id).select('-password');

            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, admin not found',
                });
            }

            next();
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
            });
        }
    }

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Not authorized, no token',
        });
    }
};


