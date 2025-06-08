import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
      } catch (err) {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(401);
    }
};

// Middleware to check user roles
export const authorizeRoles = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
};