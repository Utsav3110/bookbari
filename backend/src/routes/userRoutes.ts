import express from 'express';
import bcrypt from 'bcryptjs';
import { User, Role, UserStatus } from '../models/User';
import { protect, superAdminOnly } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// Get all admins (Super Admin only)
router.get('/admins', protect, superAdminOnly, async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: [Role.ADMIN, Role.SUPER_ADMIN] } })
      .select('-password')
      .sort({ createdAt: -1 });
    sendSuccess(res, 'Admins retrieved successfully', admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    sendError(res, 'Failed to fetch admins', 500);
  }
});

// Create new Admin (Super Admin only)
router.post('/admin', protect, superAdminOnly, async (req: any, res: any) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : undefined,
      role: Role.ADMIN,
      status: UserStatus.APPROVED,
    });

    const adminData = {
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      status: newAdmin.status,
      phone: newAdmin.phone,
      createdAt: newAdmin.createdAt,
    };

    sendSuccess(res, `Admin account "${newAdmin.name}" created successfully`, adminData, 201);
  } catch (error) {
    console.error('Error creating admin:', error);
    sendError(res, 'Failed to create admin account', 500);
  }
});

// Update Admin status (Approve / Reject)
router.put('/admin/:id/status', protect, superAdminOnly, async (req: any, res: any) => {
  try {
    const { status } = req.body;

    if (![UserStatus.APPROVED, UserStatus.PENDING, UserStatus.REJECTED].includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.status = status;
    await user.save();

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    sendSuccess(res, `Admin status updated to ${status}`, userData);
  } catch (error) {
    console.error('Error updating admin status:', error);
    sendError(res, 'Failed to update admin status', 500);
  }
});

// Delete Admin (Super Admin only)
router.delete('/admin/:id', protect, superAdminOnly, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'Admin not found', 404);
    }

    if (user.role === Role.SUPER_ADMIN) {
      return sendError(res, 'Cannot delete Super Admin account', 400);
    }

    await User.findByIdAndDelete(req.params.id);
    sendSuccess(res, 'Admin deleted successfully', { id: req.params.id });
  } catch (error) {
    console.error('Error deleting admin:', error);
    sendError(res, 'Failed to delete admin', 500);
  }
});

export default router;
