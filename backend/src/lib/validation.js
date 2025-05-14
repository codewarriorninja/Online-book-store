import {z} from 'zod'

//User validation schemas
export const registerSchema = z.object({
    name:z.string().min(2, 'Name must be at least 2 characters long'),
    email:z.string().email('Invalid email address'),
    password:z.string().min(6, 'Password must be at least 6 characters long'),
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
    role:z.enum(['user','admin'],{
        errorMap: () => ({message:'Role must be either "user" or "admin"'})
    })
})

// Book validation schemas
export const createBookSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    author: z.string().min(1, 'Author is required'),
    tags: z.array(z.string()).optional().default([]),
});

export const updateBookSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    author: z.string().min(1, 'Author is required').optional(),
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
      schema.parse(req.body);
      next();
    } catch (error) {
      const errors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      res.status(400).json({ errors });
    }
};