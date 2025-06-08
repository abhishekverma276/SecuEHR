import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { validationResult } from "express-validator";
import logger from "../utility/logger";


const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

//Register a new user
export const registerUser = async (req: Request, res: Response) => {
    // Validation request inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { username, password, email } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        
        // Check if the user already exists
        const existingUser = await userRepository.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        //Hash the password
        const passwordHash = await bcrypt.hash(password, 10);
        

        // Create a new user
        const user = userRepository.create({
            username,
            passwordHash,
            role: 'user',
            email,
        });

        // Save the user to the database
        await userRepository.save(user);
        return res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        logger.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//Login a user and check if user is registered for TOPT if not then issue jwt token
export const loginUser = async (req: Request, res: Response) => {
    // Validation request inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password, otp} = req.body;
        const userRepository = AppDataSource.getRepository(User);
        
        // Check if the user exists
        const user = await userRepository.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check for TOPT registered
        if (user.totpSecret) {
            if (!otp) {
                return res.status(401).json({ message: 'OTP is required' });
            }

            // Verify the OTP
            const isValidOTP = await verifyOTP(otp, user.totpSecret);
            if (!isValidOTP) {
                return res.status(401).json({ message: 'Invalid OTP' });
            }
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login successful', token });
    
    } catch (error) {
        logger.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }   
};

// Setup TOTP for a user (Generate secret & QR Code)
export const setupTOTP = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { userId } = req.params;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate TOTP secret for the user
        const secret = speakeasy.generateSecret({length: 20});
        user.totpSecret = secret.base32
        await userRepository.save(user);

        // Generate QR code URL
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

        return res.status(200).json({ secret: secret.base32, qrCode: qrCodeUrl });
    } catch (error) {
        logger.error('TOTP setup error:', error)
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Verify OTP for a user
export const verifyOTPForTOTP = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { userId } = req.params;
        const { token } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user || !user.totpSecret) {
            return res.status(404).json({ message: 'TOTP is not set up' });
        }
        const isValidOTP = await verifyOTP(token, user.totpSecret);
        
        if (!isValidOTP) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        logger.error('OTP verification error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
        

const verifyOTP = async (otp: string, secret: string): Promise<boolean> => {
    try {   
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: otp,
            window: 1
        });
    } catch (error) {
        logger.error('OTP verification error:', error);
        return false;
    }
};

// Password change
export const changePassword = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = (req as any).user.id; // Extract user ID from JWT
        const { oldPassword, newPassword } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user){
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newPasswordHash;
        await userRepository.save(user);

        return res.status(200).json({ message: 'Password changed successfully' });
        
    } catch (error) {
        logger.error('Password change error : ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};  
        

      
