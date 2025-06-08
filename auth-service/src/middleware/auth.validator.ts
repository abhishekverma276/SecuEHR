import { body, param } from "express-validator";

export const loginValidator = [
    body('username').isString().notEmpty().withMessage('Uername is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
    body('otp').optional().isNumeric().withMessage('OTP is required'),
];

export const registerValidator = [
    body('username').isString().notEmpty().withMessage('Uername is required'),
    body('password').isString().notEmpty().isLength({ min: 8 }).withMessage('Password is required'),
    body('email').isEmail().withMessage('Invalid email address'),
];

export const twoFASetupValidator = [
    param('userId').notEmpty().withMessage('User ID is required'),
];

export const twoFAVarifyValidator = [
    body('token').isNumeric().notEmpty().withMessage('OTP is required'),
    param('userId').notEmpty().withMessage('User ID is required'),
];

export const passwordChangeValidator = [
    body('oldPassword').notEmpty().withMessage('Old Password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New Password must be at least 8 characters'),
];

export const passwordResetRequestValidator = [
    body('email').isEmail().withMessage('Invalid email address'),
];

export const passwordResetValidator = [
    body('token').notEmpty().withMessage('Token is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('newPassword').isLength({ min: 8 }).withMessage('newPassword must be at least 8 characters'),
];