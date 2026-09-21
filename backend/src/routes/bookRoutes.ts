import express from 'express';
import mongoose from 'mongoose';
import { Book } from '../models/Book';
import { Author } from '../models/Author';
import { Loan, LoanStatus } from '../models/Loan';
import { protect, adminOnly, SUPER_ADMIN_ID } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// Helper to format genre input (array or string) into standardized string
const formatGenre = (genreInput: any): string | undefined => {
  if (!genreInput) return undefined;
  if (Array.isArray(genreInput)) {
    const cleaned = genreInput.map((g) => String(g).trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned.join(', ') : undefined;
  }
  return String(genreInput).trim() || undefined;
};

// Get all books with author and available quantity calculation (Optimized with Aggregation & Pagination)
router.get('/', async (req, res) => {
  try {
    const keywordFilter = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword as string,
            $options: 'i',
          },
        }
      : {};

    const genreFilter = req.query.genre
      ? { genre: { $regex: req.query.genre as string, $options: 'i' } }
      : {};

    const languageFilter = req.query.language
      ? { language: { $regex: req.query.language as string, $options: 'i' } }
      : {};

    const filter = { ...keywordFilter, ...genreFilter, ...languageFilter, deletedAt: null };

    // Support optional pagination query parameters (e.g. ?page=1&limit=20)
    const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10)) : undefined;
    const limit = req.query.limit ? Math.max(1, parseInt(req.query.limit as string, 10)) : undefined;

    let booksQuery = Book.find(filter).populate('authorId').sort({ createdAt: -1 });

    if (page && limit) {
      booksQuery = booksQuery.skip((page - 1) * limit).limit(limit);
    }

    const [books, totalCount, activeLoansAggregation] = await Promise.all([
      booksQuery,
      Book.countDocuments(filter),
      Loan.aggregate([
        { $match: { status: LoanStatus.BORROWED } },
        {
          $group: {
            _id: '$bookId',
            activeLoansCount: { $sum: 1 },
            earliestDueDate: { $min: '$dueDate' },
          },
        },
      ]),
    ]);

    // Build fast in-memory map of loan stats
    const loanStatsMap = new Map<string, { activeLoansCount: number; earliestDueDate: Date | null }>();
    activeLoansAggregation.forEach((item) => {
      loanStatsMap.set(item._id.toString(), {
        activeLoansCount: item.activeLoansCount,
        earliestDueDate: item.earliestDueDate ? new Date(item.earliestDueDate) : null,
      });
    });

    const booksWithAvailability = books.map((book) => {
      const stats = loanStatsMap.get(book._id.toString()) || {
        activeLoansCount: 0,
        earliestDueDate: null,
      };
      const availableQuantity = Math.max(0, book.totalQuantity - stats.activeLoansCount);

      let expectedAvailableDate: Date | null = stats.earliestDueDate;
      if (availableQuantity === 0 && !expectedAvailableDate) {
        const defaultExpected = new Date();
        defaultExpected.setDate(defaultExpected.getDate() + 15);
        expectedAvailableDate = defaultExpected;
      }

      return {
        ...book.toObject(),
        activeLoansCount: stats.activeLoansCount,
        availableQuantity,
        expectedAvailableDate,
      };
    });

    if (page && limit) {
      sendSuccess(res, 'Books retrieved successfully', {
        books: booksWithAvailability,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } else {
      sendSuccess(res, 'Books retrieved successfully', booksWithAvailability);
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    sendError(res, 'Failed to fetch books', 500);
  }
});

// Get book by ID
router.get('/:id', async (req, res: any) => {
  try {
    const book = await Book.findById(req.params.id).populate('authorId');
    if (!book || book.deletedAt) {
      return sendError(res, 'Book not found', 404);
    }

    const activeLoansCount = await Loan.countDocuments({
      bookId: book._id,
      status: LoanStatus.BORROWED,
    });
    const availableQuantity = Math.max(0, book.totalQuantity - activeLoansCount);

    let expectedAvailableDate: Date | null = null;
    if (availableQuantity === 0) {
      const earliestActiveLoan = await Loan.findOne({
        bookId: book._id,
        status: LoanStatus.BORROWED,
      }).sort({ dueDate: 1 });

      if (earliestActiveLoan && earliestActiveLoan.dueDate) {
        expectedAvailableDate = new Date(earliestActiveLoan.dueDate);
      } else {
        const defaultExpected = new Date();
        defaultExpected.setDate(defaultExpected.getDate() + 15);
        expectedAvailableDate = defaultExpected;
      }
    }

    sendSuccess(res, 'Book details retrieved', {
      ...book.toObject(),
      activeLoansCount,
      availableQuantity,
      expectedAvailableDate,
    });
  } catch (error) {
    sendError(res, 'Failed to fetch book details', 500);
  }
});

// Create Book (Admin only)
router.post('/', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { title, authorId, authorName, language, genre, totalQuantity, description, coverUrl } = req.body;

    if (!title || !language) {
      return sendError(res, 'Title and Language are required', 400);
    }

    let finalAuthorId = authorId;

    if (!finalAuthorId && authorName && authorName.trim()) {
      const trimmedName = authorName.trim();
      let authorRecord = await Author.findOne({
        name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
      });
      if (!authorRecord) {
        authorRecord = await Author.create({ name: trimmedName });
      }
      finalAuthorId = authorRecord._id;
    }

    if (!finalAuthorId) {
      return sendError(res, 'Author selection is required', 400);
    }

    const book = await Book.create({
      title: title.trim(),
      authorId: finalAuthorId,
      language: language.trim(),
      genre: formatGenre(genre),
      totalQuantity: Number(totalQuantity) || 1,
      description: description ? description.trim() : undefined,
      coverUrl: coverUrl ? coverUrl.trim() : undefined,
      addedById: mongoose.Types.ObjectId.isValid(req.user._id) ? req.user._id : new mongoose.Types.ObjectId(SUPER_ADMIN_ID),
    });

    const populatedBook = await Book.findById(book._id).populate('authorId');
    sendSuccess(res, `Book "${book.title}" created successfully`, populatedBook, 201);
  } catch (error) {
    console.error('Error creating book:', error);
    sendError(res, 'Failed to create book', 500);
  }
});

// Update Book (Admin only)
router.put('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { title, authorId, authorName, language, genre, totalQuantity, description, coverUrl } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book || book.deletedAt) {
      return sendError(res, 'Book not found', 404);
    }

    const activeLoansCount = await Loan.countDocuments({
      bookId: req.params.id,
      status: LoanStatus.BORROWED,
    });

    const newQuantity = Number(totalQuantity);
    if (newQuantity < activeLoansCount) {
      return sendError(
        res,
        `Cannot reduce total quantity to ${newQuantity}. Currently ${activeLoansCount} copy/copies are borrowed by members.`,
        400
      );
    }

    let finalAuthorId = authorId;
    if (!finalAuthorId && authorName && authorName.trim()) {
      const trimmedName = authorName.trim();
      let authorRecord = await Author.findOne({
        name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
      });
      if (!authorRecord) {
        authorRecord = await Author.create({ name: trimmedName });
      }
      finalAuthorId = authorRecord._id;
    }

    if (title) book.title = title.trim();
    if (finalAuthorId) book.authorId = finalAuthorId;
    if (language) book.language = language.trim();
    if (genre !== undefined) book.genre = formatGenre(genre);
    if (totalQuantity !== undefined) book.totalQuantity = newQuantity;
    if (description !== undefined) book.description = description.trim();
    if (coverUrl !== undefined) book.coverUrl = coverUrl.trim();

    await book.save();

    const updatedBook = await Book.findById(book._id).populate('authorId');
    sendSuccess(res, 'Book updated successfully', updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    sendError(res, 'Failed to update book', 500);
  }
});

// Soft Delete Book (Admin only)
router.delete('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    const activeLoansCount = await Loan.countDocuments({
      bookId: req.params.id,
      status: LoanStatus.BORROWED,
    });

    if (activeLoansCount > 0) {
      return sendError(
        res,
        `Cannot delete book. ${activeLoansCount} copy/copies are currently borrowed. Return all copies first.`,
        400
      );
    }

    const book = await Book.findById(req.params.id);
    if (!book || book.deletedAt) {
      return sendError(res, 'Book not found', 404);
    }

    book.deletedAt = new Date();
    await book.save();

    sendSuccess(res, 'Book deleted successfully', { id: req.params.id });
  } catch (error) {
    console.error('Error deleting book:', error);
    sendError(res, 'Failed to delete book', 500);
  }
});

export default router;
