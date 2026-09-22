import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import loanRoutes from './routes/loanRoutes';
import userRoutes from './routes/userRoutes';
import authorRoutes from './routes/authorRoutes';
import statsRoutes from './routes/statsRoutes';
import languageRoutes from './routes/languageRoutes';
import genreRoutes from './routes/genreRoutes';
import healthRoutes from './routes/healthRoutes';

// Load env vars strictly from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// CORS configuration supporting environment variable FRONTEND_URL & local dev origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or allowed origins
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some((o) => origin.startsWith(o)) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS Policy: Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Connect Database
connectDB();

// Health Check Routes
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

// Main Domain Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/languages', languageRoutes);
app.use('/api/genres', genreRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Bookbaari API is running...',
    health: '/api/health',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
