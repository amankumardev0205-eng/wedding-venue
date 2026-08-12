import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import venueManagementRoutes from './routes/venueManagement.js';
import inquiryRoutes from './routes/inquiries.js';
import bookingRoutes from './routes/bookings.js';
import favoritesRoutes from './routes/favorites.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';
import paymentsRoutes from './routes/payments.js';
import chatRoutes from './routes/chat.js';
import { seedVenues } from './config/seedVenues.js';
import User from './models/User.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { requireHTTPS } from './middleware/requireHTTPS.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.set('trust proxy', 1);

// Connect to database
await connectDB();

// Seed database with sample data when explicitly enabled
if (process.env.SEED_VENUES === 'true') {
  setTimeout(async () => {
    try {
      let organizer = await User.findOne({ email: 'organizer@example.com' });
      if (!organizer) {
        organizer = new User({
          name: 'Sample Organizer',
          email: 'organizer@example.com',
          passwordHash: 'password123',
          role: 'organizer',
        });
        await organizer.save();
      }
      await seedVenues(organizer.id || organizer._id);
    } catch (error) {
      console.error('Seed error:', error.message);
    }
  }, 1000);
}

// Security middleware
app.use(requireHTTPS);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://firebasestorage.googleapis.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInput);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/venue-management', venueManagementRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'WedVenue API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

export default app;
