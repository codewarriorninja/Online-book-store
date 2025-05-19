import express from 'express';
import multer from 'multer';
import { getAllBooks, getBookById, createBook, updateBook, deleteBook, getBookReviews, addBookReview,getUserBooks } from '../controllers/book.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, createBookSchema, updateBookSchema, createReviewSchema } from '../lib/validation.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// Ensure uploads directory exists
import fs from 'fs';
import path from 'path';
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.get('/:id/reviews', getBookReviews);

// Protected routes
router.get('/', protect, getUserBooks);
router.post('/', protect, upload.single('coverImage'), validate(createBookSchema), createBook);
router.patch('/:id', protect, upload.single('coverImage'), validate(updateBookSchema), updateBook);
router.delete('/:id', protect, deleteBook);
router.post('/:id/reviews', protect, validate(createReviewSchema), addBookReview);

export default router;