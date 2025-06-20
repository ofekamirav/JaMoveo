import { NextFunction, Request, Response } from 'express';
import User from "../models/user"; 
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { Instrument } from '../types/instrument';

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: Types.ObjectId;
                name: string;
                role: 'admin' | 'player';
                instrument: Instrument;
                refreshTokens?: string;
            };
        }
    }
}
interface CustomJwtPayload extends JwtPayload {
    _id: string;
}

const generateTokens = (_id: string): { accessToken: string, refreshToken: string } => {
    const secrets = {
        access: process.env.ACCESS_TOKEN_SECRET,
        refresh: process.env.REFRESH_TOKEN_SECRET,
    };
    const expirations = {
        access: process.env.ACCESS_TOKEN_EXPIRATION,
        refresh: process.env.REFRESH_TOKEN_EXPIRATION,
    };

    if (!secrets.access || !secrets.refresh || !expirations.access || !expirations.refresh) {
        console.error("FATAL ERROR: JWT environment variables are not set.");
        throw new Error('Server authentication configuration is incomplete.');
    }

    const payload = { _id };

    const accessToken = jwt.sign(payload, secrets.access, { expiresIn: expirations.access } as SignOptions);
    const refreshToken = jwt.sign(payload, secrets.refresh, { expiresIn: expirations.refresh } as SignOptions);

    return { accessToken, refreshToken };
};

const register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, instrument } = req.body;
    const role = req.path.includes('admin') ? 'admin' : 'player';

    if (role === 'player' && !instrument) {
            res.status(400).json({ message: 'Instrument is required for players' });
            return;
        }

    if (!name || !email || !password || (role === 'player' && !instrument)) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: 'A user with this email already exists.' }); 
            return;
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword, instrument, role });

        const tokens = generateTokens(user._id.toString());
        user.refreshTokens = tokens.refreshToken;
        await user.save();

        res.status(201).json({
            userId: user._id,
            name: user.name,
            email: user.email,
            instrument: user.instrument,
            role: user.role,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });

    } catch (error: any) {
        console.error('Registration Error:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Invalid data provided.', details: error.message });
            return;
        }
        res.status(500).json({ message: 'An internal server error occurred during registration.' });
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials.' });
            return;
        }

        const tokens = generateTokens(user._id.toString());
        user.refreshTokens = user.refreshTokens;

        await user.save();

        res.status(200).json({
            userId: user._id,
            name: user.name,
            email: user.email,
            instrument: user.instrument,
            role: user.role,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });

    } catch (error: any) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'An internal server error occurred during login.' });
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required.' });
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as CustomJwtPayload;
        
        await User.updateOne({ _id: decoded._id, refreshToken: refreshToken }, { refreshToken: null });
        
        res.status(200).json({ message: 'Logged out successfully.' });

    } catch (error) {
        res.status(200).json({ message: 'Logged out (token was invalid).' });
    }
};

const refresh = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required.' });
        return;
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as CustomJwtPayload;
        const user = await User.findById(decoded._id);

        if (!user || !user.refreshTokens?.includes(refreshToken)) {
            res.status(403).json({ message: 'Forbidden: Invalid or revoked refresh token. Please log in again.' });
            return;
        }
        const tokens = generateTokens(user._id.toString());
        const newTokens = {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
        user.refreshTokens = newTokens.refreshToken
        await user.save();

        res.status(200).json({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
        });

    } catch (error) {
        res.status(403).json({ message: 'Forbidden: Refresh token is expired or invalid.' });
    }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers['authorization'];

    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        console.error("authMiddleware FAILED: Header is missing or malformed.", authHeader);
        res.status(401).json({ message: 'Not authorized, token is missing or malformed.' });
        return;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as CustomJwtPayload;

        if (!decoded || !decoded._id) {
            console.error("authMiddleware FAILED: Token payload is invalid.", decoded);
            res.status(401).json({ message: 'Not authorized, token is invalid.' });
            return;
        }

        const user = await User.findById(decoded._id).select("_id name role instrument");
        if (!user) {
            res.status(401).json({ message: 'User not found.' });
            return;
        }

        req.user = {
            _id: user._id,
            name: user.name,
            role: user.role,
            instrument: user.instrument,
        };

        console.log(`authMiddleware SUCCESS: User ${user._id} (${user.role}) authorized.`);
        next();
    } catch (error) {
        console.error("authMiddleware FAILED: Token verification failed.", error);
        res.status(401).json({ message: 'Not authorized, token failed verification.' });
    }
};

const authController = { register, login, logout, refresh };
export default authController;