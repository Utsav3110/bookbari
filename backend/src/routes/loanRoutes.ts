import express from 'express';
import mongoose from 'mongoose';
import { Loan, LoanStatus } from '../models/Loan';
import { Book } from '../models/Book';
import { protect, adminOnly, SUPER_ADMIN_ID } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// Get all checkouts (active)
router.get('/active', protect, adminOnly, async (req, res) => {
  try {
    const loans = await Loan.find({ status: LoanStatus.BORROWED })
      .populate({ path: 'bookId', populate: { path: 'authorId' } })
      .populate('issuedById', 'name email')
      .sort({ createdAt: -1 });
    sendSuccess(res, 'Active checkouts retrieved', loans);
  } catch (error) {
    console.error('Error fetching active loans:', error);
    sendError(res, 'Failed to fetch active checkouts', 500);
  }
});

// Get all returned loans
router.get('/returned', protect, adminOnly, async (req, res) => {
  try {
    const loans = await Loan.find({ status: LoanStatus.RETURNED })
      .populate({ path: 'bookId', populate: { path: 'authorId' } })
      .populate('issuedById', 'name email')
      .sort({ returnDate: -1 });
    sendSuccess(res, 'Returned checkouts history retrieved', loans);
  } catch (error) {
    console.error('Error fetching returned loans:', error);
    sendError(res, 'Failed to fetch returned checkouts', 500);
  }
});

// Get overdue loans
router.get('/overdue', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const loans = await Loan.find({
      status: LoanStatus.BORROWED,
      dueDate: { $lt: now }
    })
      .populate({ path: 'bookId', populate: { path: 'authorId' } })
      .populate('issuedById', 'name email')
      .sort({ dueDate: 1 });
    sendSuccess(res, 'Overdue checkouts report retrieved', loans);
  } catch (error) {
    console.error('Error fetching overdue loans:', error);
    sendError(res, 'Failed to fetch overdue report', 500);
  }
});

// Issue a loan checkout
router.post('/', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { bookId, borrowerName, borrowerSurname, borrowerMobile, durationDays, issueDate, dueDate: customDueDate } = req.body;

    if (!bookId || !borrowerName || !borrowerMobile) {
      return sendError(res, 'Book, Borrower Name, and Mobile number are required', 400);
    }

    const book = await Book.findById(bookId);
    if (!book || book.deletedAt) {
      return sendError(res, 'Book not found', 404);
    }

    // Check available copies
    const activeLoans = await Loan.countDocuments({ bookId, status: LoanStatus.BORROWED });
    if (book.totalQuantity - activeLoans <= 0) {
      return sendError(res, 'No available copies left for this book', 400);
    }

    // Check if this exact borrower already has an active loan for this exact book
    const existingActiveLoan = await Loan.findOne({
      bookId,
      borrowerName: borrowerName.trim(),
      borrowerMobile: borrowerMobile.trim(),
      status: LoanStatus.BORROWED,
    });

    if (existingActiveLoan) {
      return sendError(res, 'This member already has an active checkout for this book.', 400);
    }

    let calculatedDueDate: Date;
    if (customDueDate) {
      calculatedDueDate = new Date(customDueDate);
    } else {
      const days = Number(durationDays) || 15;
      calculatedDueDate = new Date();
      calculatedDueDate.setDate(calculatedDueDate.getDate() + days);
    }

    const loan = await Loan.create({
      bookId,
      borrowerName: borrowerName.trim(),
      borrowerSurname: borrowerSurname ? borrowerSurname.trim() : '',
      borrowerMobile: borrowerMobile.trim(),
      issuedById: mongoose.Types.ObjectId.isValid(req.user._id) ? req.user._id : new mongoose.Types.ObjectId(SUPER_ADMIN_ID),
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: calculatedDueDate,
      status: LoanStatus.BORROWED,
    });

    const populatedLoan = await Loan.findById(loan._id)
      .populate({ path: 'bookId', populate: { path: 'authorId' } })
      .populate('issuedById', 'name email');

    sendSuccess(res, 'Book checkout issued successfully', populatedLoan, 201);
  } catch (error) {
    console.error('Error issuing loan:', error);
    sendError(res, 'Failed to issue book checkout', 500);
  }
});

// Return a loan
router.post('/:id/return', protect, adminOnly, async (req, res: any) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return sendError(res, 'Borrowing record not found', 404);
    }

    if (loan.status === LoanStatus.RETURNED) {
      return sendError(res, 'Book is already marked returned', 400);
    }

    loan.status = LoanStatus.RETURNED;
    loan.returnDate = new Date();
    await loan.save();

    const updatedLoan = await Loan.findById(loan._id)
      .populate({ path: 'bookId', populate: { path: 'authorId' } })
      .populate('issuedById', 'name email');

    sendSuccess(res, 'Book copy marked returned successfully', updatedLoan);
  } catch (error) {
    console.error('Error returning loan:', error);
    sendError(res, 'Failed to process return', 500);
  }
});

export default router;
