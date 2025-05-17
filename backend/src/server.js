import express from 'express'
import dotenv from 'dotenv'
import cors from'cors'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.route.js'
import bookRoutes from './routes/book.route.js'
import userRoutes from './routes/user.route.js'
import analyticsRoutes from './routes/analytics.routes.js'
import { errorHandler } from './middleware/error.middleware.js'

//Load environment variables
dotenv.config();

const app = express();

connectDB();

app.use(express.urlencoded({extended:true}));

app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.use(express.json());
app.use(cookieParser());

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/users',userRoutes);
app.use('/api/analytics', analyticsRoutes);

//Error handling middleware
app.use(errorHandler);

//Start server 
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});