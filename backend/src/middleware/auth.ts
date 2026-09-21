import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser, Role } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const SUPER_ADMIN_ID = '000000000000000000000001';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Check if it's the super admin from env
    if (decoded.email === process.env.SUPER_ADMIN_EMAIL || decoded.id === 'super_admin_id' || decoded.id === SUPER_ADMIN_ID) {
      req.user = {
        _id: new mongoose.Types.ObjectId(SUPER_ADMIN_ID),
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL,
        role: Role.SUPER_ADMIN,
        status: 'APPROVED'
      } as any;
      return next();
    }

    // Otherwise find user in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const superAdminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === Role.SUPER_ADMIN) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a super admin' });
  }
};
