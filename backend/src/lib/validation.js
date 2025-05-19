import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
  }),
});

// Book validation schemas
export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  author: z.string().min(1, 'Author is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  publishedDate: z.string().optional(),
  language: z.string().optional().default('English'),
  pageCount: z.number().min(1, 'Page count must be at least 1').optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  author: z.string().min(1, 'Author is required').optional(),
  price: z.number().min(0, 'Price must be a positive number').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters').optional(),
  publishedDate: z.string().optional(),
  language: z.string().optional(),
  pageCount: z.number().min(1, 'Page count must be at least 1').optional(),
  tags: z.array(z.string()).optional(),
});

// Review validation schema
export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Comment must be at least 5 characters'),
});

// Validation middleware
export const validate = (schema) => (req, res, next) => {
  try {
    // Handle form data conversion for numeric fields
    const data = { ...req.body };
    
    // Convert numeric strings to numbers for validation
    if (data.price && typeof data.price === 'string') {
      data.price = parseFloat(data.price);
    }
    
    if (data.pageCount && typeof data.pageCount === 'string') {
      data.pageCount = parseInt(data.pageCount, 10);
    }
    
    if (data.rating && typeof data.rating === 'string') {
      data.rating = parseFloat(data.rating);
    }
    
    // Parse and validate
    schema.parse(data);
    
    // Update req.body with converted values
    req.body = data;
    next();
  } catch (error) {
    const errors = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    
    res.status(400).json({ errors });
  }
};