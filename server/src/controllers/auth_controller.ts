import { NextFunction, Request, Response } from 'express';
import User from "../models/user"; 
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: any; 
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

        const tokens = generateTokens((user._id as string | { toString(): string }).toString());
        user.refreshTokens = [tokens.refreshToken];
        await user.save();

        res.status(201).json({
            _id: user._id,
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

        const tokens = generateTokens((user._id as string | { toString(): string }).toString());

        user.refreshTokens = [...(user.refreshTokens || []), tokens.refreshToken];
        await user.save();

        res.status(200).json({
            _id: user._id,
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
        
        await User.updateOne({ _id: decoded._id }, { $pull: { refreshTokens: refreshToken } });
        
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

        const newTokens = generateTokens((user._id as string | { toString(): string }).toString());
        
        user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
        user.refreshTokens.push(newTokens.refreshToken);
        await user.save();

        res.status(200).json({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
        });

    } catch (error) {
        res.status(403).json({ message: 'Forbidden: Refresh token is expired or invalid.' });
    }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Not authorized, no token provided.' });
        return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as CustomJwtPayload;
        req.user = { _id: decoded._id }; 
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed.' });
    }
};

const authController = { register, login, logout, refresh };
export default authController;