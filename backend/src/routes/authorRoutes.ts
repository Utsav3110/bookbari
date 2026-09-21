import express from 'express';
import { Author } from '../models/Author';
import { Book } from '../models/Book';
import { protect, adminOnly } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// Get all authors with book count (Optimized with Aggregation)
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find().sort({ name: 1 }).lean();

    const countsAggregation = await Book.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$authorId', count: { $sum: 1 } } }
    ]);

    const countsMap = new Map<string, number>();
    countsAggregation.forEach((c) => {
      if (c._id) countsMap.set(c._id.toString(), c.count);
    });

    const authorsWithCount = authors.map((author) => ({
      _id: author._id,
      name: author.name,
      createdAt: author.createdAt,
      bookCount: countsMap.get(author._id.toString()) || 0
    }));

    sendSuccess(res, 'Authors retrieved successfully', authorsWithCount);
  } catch (error) {
    console.error('Error fetching authors:', error);
    sendError(res, 'Failed to fetch authors', 500);
  }
});

// Create author (Admin only) - PREVENT DUPLICATE AUTHOR
router.post('/', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 'Author name is required', 400);
    }

    const trimmedName = name.trim();

    // Check case-insensitive duplicate
    const existingAuthor = await Author.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existingAuthor) {
      return sendError(res, `Author "${existingAuthor.name}" already exists! Cannot add duplicate author.`, 400, existingAuthor);
    }

    const newAuthor = await Author.create({ name: trimmedName });
    sendSuccess(res, `Author "${newAuthor.name}" created successfully`, newAuthor, 201);
  } catch (error: any) {
    console.error('Error creating author:', error);
    if (error.code === 11000) {
      return sendError(res, 'Author already exists', 400);
    }
    sendError(res, 'Failed to create author', 500);
  }
});

// Edit author (Admin only)
router.put('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 'Author name is required', 400);
    }

    const trimmedName = name.trim();

    // Check case-insensitive duplicate with another record
    const existingAuthor = await Author.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existingAuthor) {
      return sendError(res, `Author "${existingAuthor.name}" already exists!`, 400);
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      req.params.id,
      { name: trimmedName },
      { new: true }
    );

    if (!updatedAuthor) {
      return sendError(res, 'Author not found', 404);
    }

    sendSuccess(res, 'Author updated successfully', updatedAuthor);
  } catch (error) {
    sendError(res, 'Failed to update author', 500);
  }
});

// Delete author (Admin only)
router.delete('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    const bookCount = await Book.countDocuments({
      authorId: req.params.id,
      deletedAt: null
    });

    if (bookCount > 0) {
      return sendError(res, `Cannot delete author. ${bookCount} active book(s) are associated with this author.`, 400);
    }

    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return sendError(res, 'Author not found', 404);
    }

    sendSuccess(res, 'Author deleted successfully', { id: req.params.id });
  } catch (error) {
    sendError(res, 'Failed to delete author', 500);
  }
});

export default router;
