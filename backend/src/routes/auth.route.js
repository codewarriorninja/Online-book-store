import express from 'express'
import {register} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate, registerSchema } from '../lib/validation.js'

const router = express.Router();

//Public routes
router.post('/register', validate(registerSchema), register);

export default router;