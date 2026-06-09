import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

// ES Module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes (try both paths)
let authRoutes, listingsRoutes, inquiriesRoutes, chatsRoutes, reportsRoutes, uploadRoutes;
let runMigrations;

try {
  // Try backend folder path first (Render deployment structure)
  authRoutes = (await import('./backend/routes/auth.js')).default;
  listingsRoutes = (await import('./backend/routes/listings.js')).default;
  inquiriesRoutes = (await import('./backend/routes/inquiries.js')).default;
  chatsRoutes = (await import('./backend/routes/chats.js')).default;
  reportsRoutes = (await import('./backend/routes/reports.js')).default;
  uploadRoutes = (await import('./backend/routes/upload.js')).default;
  const migrations = await import('./backend/migrations/migrate.js');
  runMigrations = migrations.runMigrations;
  console.log('✅ Loaded routes from ./backend/');
} catch (err) {
  console.log('⚠️ Failed to load from ./backend/, trying ./routes/...', err.message);
  try {
    // Try routes folder path (alternative structure)
    authRoutes = (await import('./routes/auth.js')).default;
    listingsRoutes = (await import('./routes/listings.js')).default;
    inquiriesRoutes = (await import('./routes/inquiries.js')).default;
    chatsRoutes = (await import('./routes/chats.js')).default;
    reportsRoutes = (await import('./routes/reports.js')).default;
    uploadRoutes = (await import('./routes/upload.js')).default;
    const migrations = await import('./migrations/migrate.js');
    runMigrations = migrations.runMigrations;
    console.log('✅ Loaded routes from ./routes/');
  } catch (err2) {
    console.error('❌ Failed to load routes from both paths:', err2.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'https://doonproperties.in',
  'https://doonproperties.hostingerapp.com',
  'https://doonproperties.onrender.com'
];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true);
    }
  },
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

// DEBUG ROUTE - Check file structure
app.get('/debug-files', (req, res) => {
  const checkDir = (dirPath) => {
    try {
      if (fs.existsSync(dirPath)) {
        return fs.readdirSync(dirPath);
      }
      return 'Directory not found';
    } catch (e) {
      return `Error: ${e.message}`;
    }
  };
  
  res.json({
    currentDir: __dirname,
    rootFiles: checkDir('.'),
    backendFiles: checkDir('./backend'),
    backendRoutesFiles: checkDir('./backend/routes'),
    routesFiles: checkDir('./routes'),
    backendConfigFiles: checkDir('./backend/config'),
    configFiles: checkDir('./config'),
    hasAuthRoute: fs.existsSync('./backend/routes/auth.js') || fs.existsSync('./routes/auth.js')
  });
});

// Static files for uploads
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// API Routes (only if routes loaded successfully)
if (authRoutes) app.use('/api/auth', authRoutes);
if (listingsRoutes) app.use('/api/listings', listingsRoutes);
if (inquiriesRoutes) app.use('/api/inquiries', inquiriesRoutes);
if (chatsRoutes) app.use('/api/chats', chatsRoutes);
if (reportsRoutes) app.use('/api/reports', reportsRoutes);
if (uploadRoutes) app.use('/api/upload', uploadRoutes);

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
    if (runMigrations) {
      await runMigrations();
    } else {
      console.log('⚠️ Migrations not loaded, skipping...');
    }
    
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