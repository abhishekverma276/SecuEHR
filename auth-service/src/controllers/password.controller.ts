import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppDataSource } from "../data-source";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendEmail } from "../utility/email.service";
import { User } from "../entity/User";
import logger from "../utility/logger";

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Step 1: Request Password Reset (Send Reset Token)
export const requestPasswordReset = async (req: Request, res: Response) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);

        user.resetToken = hashedToken;
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes from now
        await userRepository.save(user);
        
        // send email with reset link
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/?token=${resetToken}&email=${email}`;
        await sendEmail(email, 'Password Reset Request', `Click the link to reset: ${resetLink}`); 

        return res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        logger.error('Error requesting password reset:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
    
// Step 2: Reset Password (verify token & reset password)
export const resetPassword = async (req: Request, res: Response) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { token, email, newPassword } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({ where: { email } });
        if (!user || !user.resetToken || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const isTokenValid = await bcrypt.compare(token, user.resetToken);
        if (!isTokenValid) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await userRepository.save(user);

        return res.status(200).json({ message: 'Password reset successfully' });    
    } catch (error) {
        logger.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

        


        


        
        
