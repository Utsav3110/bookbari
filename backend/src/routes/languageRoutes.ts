import express from 'express';
import { Language } from '../models/Language';
import { protect, adminOnly } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

const DEFAULT_LANGUAGES = ['English', 'Hindi', 'Gujarati'];

// Get all languages (auto-seeds defaults if DB empty)
router.get('/', async (req, res) => {
  try {
    let languages = await Language.find().sort({ name: 1 });

    if (languages.length === 0) {
      for (const langName of DEFAULT_LANGUAGES) {
        await Language.updateOne(
          { name: langName },
          { name: langName },
          { upsert: true }
        );
      }
      languages = await Language.find().sort({ name: 1 });
    }

    sendSuccess(res, 'Languages retrieved successfully', languages);
  } catch (error) {
    console.error('Error fetching languages:', error);
    sendError(res, 'Failed to fetch languages', 500);
  }
});

// Create new Language (Admin only)
router.post('/', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, 'Language name is required', 400);
    }

    const trimmedName = name.trim();

    const existing = await Language.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existing) {
      return sendError(res, `Language "${existing.name}" already exists!`, 400);
    }

    const newLang = await Language.create({ name: trimmedName });
    sendSuccess(res, `Language "${newLang.name}" created successfully`, newLang, 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'Language already exists', 400);
    }
    sendError(res, 'Failed to create language', 500);
  }
});

// Edit Language
router.put('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return sendError(res, 'Language name is required', 400);
    }

    const trimmedName = name.trim();
    const existing = await Language.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${trimmedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });

    if (existing) {
      return sendError(res, `Language "${existing.name}" already exists!`, 400);
    }

    const updated = await Language.findByIdAndUpdate(
      req.params.id,
      { name: trimmedName },
      { new: true }
    );
    sendSuccess(res, 'Language updated successfully', updated);
  } catch (error) {
    sendError(res, 'Failed to update language', 500);
  }
});

// Delete Language
router.delete('/:id', protect, adminOnly, async (req: any, res: any) => {
  try {
    await Language.findByIdAndDelete(req.params.id);
    sendSuccess(res, 'Language deleted successfully', { id: req.params.id });
  } catch (error) {
    sendError(res, 'Failed to delete language', 500);
  }
});

export default router;
