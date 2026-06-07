import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES Module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import inquiriesRoutes from './routes/inquiries.js';
import chatsRoutes from './routes/chats.js';
import reportsRoutes from './routes/reports.js';
import uploadRoutes from './routes/upload.js';

// Import database
import { runMigrations } from './migrations/migrate.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false // Allow cross-origin resource sharing
}));

// CORS configuration - FIXED for localhost:3000
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files for uploads - WITH CORS HEADERS
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Dehradun Estates API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Dehradun Estates API',
    endpoints: {
      auth: '/api/auth',
      listings: '/api/listings',
      inquiries: '/api/inquiries',
      chats: '/api/chats',
      reports: '/api/reports',
      upload: '/api/upload',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Run database migrations
    await runMigrations();
    
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🏠  Dehradun Estates API Server                     ║
║                                                        ║
║   🚀 Server running on port ${PORT}                    ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                             ║
║   📅 Started at: ${new Date().toLocaleString()}  ║
║                                                        ║
║   API Endpoints:                                       ║
║   • GET  /api/health          - Health check           ║
║   • POST /api/auth/google     - Google OAuth           ║
║   • GET  /api/listings        - Get all listings       ║
║   • POST /api/inquiries       - Submit inquiry         ║
║   • GET  /api/chats           - Get user chats         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;