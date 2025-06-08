import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { validationResult } from "express-validator";
import logger from "../utility/logger";

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({ select: ['id', 'username', 'email', 'role', 'createdAt'] });
        return res.status(200).json(users);               
    } catch (error) {
        // console.error('Error fetching users:', error);
        logger.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user's role
export const updateUserRole = async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.role = role;
        await userRepository.save(user);
        
        return res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        logger.error('Error updating user role:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
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

        await userRepository.remove(user);
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error('Error deleting user  :', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};  

