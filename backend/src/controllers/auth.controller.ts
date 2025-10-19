import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { env } from '../config/env.js';

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign(
        { id: userId }, 
        env.JWT_SECRET
    );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'Please provide username, email, and password',
            });
            return;
        }

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            res.status(400).json({
                status: 'error',
                message: 'User already exists with this email or username',
            });
            return;
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
        });

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error registering user',
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                status: 'error',
                message: 'Please provide email and password',
            });
            return;
        }

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid credentials',
            });
            return;
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            res.status(401).json({
                status: 'error',
                message: 'Invalid credentials',
            });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error logging in',
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        // User is attached to request by auth middleware
        const user = await User.findById((req as any).user.id);

        if (!user) {
            res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user',
        });
    }
};
