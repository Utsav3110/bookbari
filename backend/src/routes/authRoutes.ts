import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role, UserStatus } from '../models/User';
import { protect, SUPER_ADMIN_ID } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

const generateToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for super admin in env
    if (
      email === process.env.SUPER_ADMIN_EMAIL &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const superAdminUser = {
        id: SUPER_ADMIN_ID,
        name: 'Super Admin',
        email,
        role: Role.SUPER_ADMIN,
        status: UserStatus.APPROVED,
      };
      const token = generateToken(SUPER_ADMIN_ID, email);
      return sendSuccess(res, 'Super Admin login successful', { user: superAdminUser, token });
    }

    // Check database user
    const user = await User.findOne({ email });

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (user.status !== UserStatus.APPROVED) {
      return sendError(res, 'Account is not approved yet', 403);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    const token = generateToken(user.id, user.email);

    sendSuccess(res, 'Login successful', { user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Server error during authentication', 500);
  }
});

// Get current user profile
router.get('/me', protect, (req: any, res) => {
  if (req.user) {
    sendSuccess(res, 'Profile retrieved', req.user);
  } else {
    sendError(res, 'User not found', 404);
  }
});

export default router;
