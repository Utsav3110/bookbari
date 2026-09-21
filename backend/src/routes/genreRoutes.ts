import express from 'express';
import { Genre } from '../models/Genre';
import { protect, adminOnly } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

const DEFAULT_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Sci-Fi',
  'Biography',
  'Self-Help',
  'History',
  'Romance',
  'Children',
  'Drama',
  'Philosophy',
  'Poetry'
];

// Get all genres (auto-seeds defaults if empty)
router.get('/', async (req, res) => {
  try {
    let genres = await Genre.find().sort({ name: 1 });

    if (genres.length === 0) {
      for (const genreName of DEFAULT_GENRES) {
        await Genre.updateOne(
          { name: genreName },
          { name: genreName },
          { upsert: true }
        );
      }
      genres = await Genre.find().sort({ name: 1 });
    }

    sendSuccess(res, 'Genres retrieved successfully', genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    sendError(res, 'Failed to fetch genres', 500);
  }
});

// Create new Genre (Admin only)
router.post('/', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, 'Genre name is required', 400);
    }

    const trimmedName = name.trim();

    const existing = await Genre.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existing) {
      return sendError(res, `Genre "${existing.name}" already exists!`, 400);
    }

    const newGenre = await Genre.create({ name: trimmedName });
    sendSuccess(res, `Genre "${newGenre.name}" created successfully`, newGenre, 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'Genre already exists', 400);
    }
    sendError(res, 'Failed to create genre', 500);
  }
});

// Edit Genre
router.put('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, 'Genre name is required', 400);
    }

    const trimmedName = name.trim();
    const existing = await Genre.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existing) {
      return sendError(res, `Genre "${existing.name}" already exists!`, 400);
    }

    const updated = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: trimmedName },
      { new: true }
    );
    sendSuccess(res, 'Genre updated successfully', updated);
  } catch (error) {
    sendError(res, 'Failed to update genre', 500);
  }
});

// Delete Genre
router.delete('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    await Genre.findByIdAndDelete(req.params.id);
    sendSuccess(res, 'Genre deleted successfully', { id: req.params.id });
  } catch (error) {
    sendError(res, 'Failed to delete genre', 500);
  }
});

export default router;
