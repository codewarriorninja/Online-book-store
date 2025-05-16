import Book from '../models/book.model.js';
import Review from '../models/review.model.js';
import Inventory from '../models/inventory.model.js';
import { uploadImage, deleteImage } from '../lib/cloudinary.js';
import fs from 'fs';

// Get all books with filtering
export const getAllBooks = async (req, res, next) => {
  try {
    const { title, author, tag } = req.query;
    
    // Build filter object
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (tag) filter.tags = { $in: [tag] };
    
    // Find books with filter
    const books = await Book.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
};

// Get single book by ID
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name' },
        options: { sort: { createdAt: -1 } },
      });
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// Create a new book
export const createBook = async (req, res, next) => {
  try {
    const { title, description, author } = req.body;
    console.log(req.body);

    let {tags} = req.body;

    //Handle tags comign as string from form-data
    if(tags && typeof tags === 'string'){
        try {
          //Try to parse if it's aJSON string 
          tags = JSON.parse(tags); 
        } catch (error) {
             // If not JSON, split by comma
            tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
    }
    
    // Create book without image first
    const book = await Book.create({
      title,
      description,
      author,
      tags: tags || [],
      createdBy: req.user._id,
    });
    
    // Handle image upload if file exists
    if (req.file) {
      try {
        const result = await uploadImage(req.file.path);
        book.coverImage = {
          url: result.url,
          publicId: result.publicId,
        };
        await book.save();
        
        // Remove temp file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
    
    // Record book addition in inventory
    await Inventory.findOneAndUpdate(
      { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      {
        $inc: { totalBooks: 1, newBooksThisWeek: 1 },
        $push: {
          userActivities: {
            activityType: 'book_added',
            user: req.user._id,
            book: book._id,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );
    
    // Update book category counts
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await Inventory.findOneAndUpdate(
          { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
          {
            $inc: { [`booksByCategory.$[elem].count`]: 1 },
          },
          {
            arrayFilters: [{ 'elem.tag': tag }],
            upsert: true,
          }
        );
        
        // If tag doesn't exist in array, add it
        await Inventory.findOneAndUpdate(
          {
            date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
            'booksByCategory.tag': { $ne: tag },
          },
          {
            $push: {
              booksByCategory: { tag, count: 1 },
            },
          }
        );
      }
    }
    
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
};

// Update a book
export const updateBook = async (req, res, next) => {
  try {
    const { title, description, author, tags } = req.body;
    const bookId = req.params.id;
    
    // Find book
    let book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user is owner or admin
    if (book.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }
    
    // Update fields
    if (title) book.title = title;
    if (description) book.description = description;
    if (author) book.author = author;
    if (tags) book.tags = tags;
    
    // Handle image upload if file exists
    if (req.file) {
      try {
        // Delete old image if exists
        if (book.coverImage && book.coverImage.publicId) {
          await deleteImage(book.coverImage.publicId);
        }
        
        // Upload new image
        const result = await uploadImage(req.file.path);
        book.coverImage = {
          url: result.url,
          publicId: result.publicId,
        };
        
        // Remove temp file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
    
    // Save updated book
    await book.save();
    
    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
};

// Delete a book
export const deleteBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    
    // Find book
    const book = await Book.findById(bookId);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user is owner or admin
    if (book.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }
    
    // Delete image from cloudinary if exists
    if (book.coverImage && book.coverImage.publicId) {
      await deleteImage(book.coverImage.publicId);
    }
    
    // Delete book
    await book.deleteOne();
    
    // Delete all reviews for this book
    await Review.deleteMany({ book: bookId });
    
    // Record book deletion in inventory
    await Inventory.findOneAndUpdate(
      { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      {
        $inc: { totalBooks: -1 },
        $push: {
          userActivities: {
            activityType: 'book_deleted',
            user: req.user._id,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );
    
    // Update book category counts
    if (book.tags && book.tags.length > 0) {
      for (const tag of book.tags) {
        await Inventory.findOneAndUpdate(
          { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
          {
            $inc: { [`booksByCategory.$[elem].count`]: -1 },
          },
          {
            arrayFilters: [{ 'elem.tag': tag }],
          }
        );
      }
    }
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get reviews for a book
export const getBookReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Find reviews for book with pagination
    const reviews = await Review.find({ book: id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Get total count
    const total = await Review.countDocuments({ book: id });
    
    res.status(200).json({
      reviews,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// Add a review to a book
export const addBookReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;
    const userId = req.user._id;
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user already reviewed this book
    const existingReview = await Review.findOne({ book: bookId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    
    // Create review
    const review = await Review.create({
      rating,
      comment,
      book: bookId,
      user: userId,
    });
    
    // Record review in inventory
    await Inventory.findOneAndUpdate(
      { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      {
        $push: {
          userActivities: {
            activityType: 'review_added',
            user: userId,
            book: bookId,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );
    
    // Populate user info
    await review.populate('user', 'name');
    
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};