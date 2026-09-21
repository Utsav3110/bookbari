import express from 'express';
import { Book } from '../models/Book';
import { Loan, LoanStatus } from '../models/Loan';
import { Author } from '../models/Author';
import { User, Role } from '../models/User';
import { protect, adminOnly } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// Get Admin Overview stats
router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();

    const [
      totalBooks,
      activeLoansCount,
      overdueLoansCount,
      totalAuthors,
      totalAdmins,
      recentOverdueLoans
    ] = await Promise.all([
      Book.countDocuments({ deletedAt: null }),
      Loan.countDocuments({ status: LoanStatus.BORROWED }),
      Loan.countDocuments({ status: LoanStatus.BORROWED, dueDate: { $lt: now } }),
      Author.countDocuments(),
      User.countDocuments({ role: { $in: [Role.ADMIN, Role.SUPER_ADMIN] } }),
      Loan.find({ status: LoanStatus.BORROWED, dueDate: { $lt: now } })
        .populate({ path: 'bookId', populate: { path: 'authorId' } })
        .sort({ dueDate: 1 })
        .limit(5)
    ]);

    sendSuccess(res, 'Overview metrics retrieved', {
      totalBooks,
      activeLoansCount,
      overdueLoansCount,
      totalAuthors,
      totalAdmins,
      recentOverdueLoans
    });
  } catch (error) {
    console.error('Error fetching stats overview:', error);
    sendError(res, 'Failed to load dashboard metrics', 500);
  }
});

export default router;
