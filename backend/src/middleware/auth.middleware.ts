import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { env } from '../config/env.js';

// Extend Express Request type to include user
export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

interface JwtPayload {
    id: string;
}

// Protect routes - verify JWT token
export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                status: 'error',
                message: 'Not authorized to access this route',
            });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        // Find user by id from token
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }

        // Attach user to request
        (req as AuthRequest).user = {
            id: user._id.toString(),
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route',
        });
    }
};
