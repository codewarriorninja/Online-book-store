import express from 'express'
import {register,login, logout,getCurrentUser, updateProfile} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate, registerSchema, loginSchema,updateUserSchema } from '../lib/validation.js'

const router = express.Router();

//Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema),login);
router.post('/logout',logout);

//Protected routes)
router.get('/me',protect,getCurrentUser);
router.put('/update',protect, validate(updateUserSchema), updateProfile)

export default router;