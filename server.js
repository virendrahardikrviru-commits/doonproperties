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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Simple static imports
import authRoutes from './backend/routes/auth.js';
import listingsRoutes from './backend/routes/listings.js';
import inquiriesRoutes from './backend/routes/inquiries.js';
import chatsRoutes from './backend/routes/chats.js';
import reportsRoutes from './backend/routes/reports.js';
import uploadRoutes from './backend/routes/upload.js';
import { runMigrations } from './backend/migrations/migrate.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'https://doonproperties.in',
  'https://doonproperties.hostingerapp.com',
  'https://doonproperties.onrender.com'
];

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS - Allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 🔍 DEBUG ROUTE - Check what files exist
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
    backendExists: fs.existsSync('./backend'),
    backendRoutesExists: fs.existsSync('./backend/routes'),
    authJsExists: fs.existsSync('./backend/routes/auth.js'),
    backendFiles: checkDir('./backend'),
    routesFiles: checkDir('./backend/routes'),
  });
});

// ✅ TEST ROUTE - Directly mounted to verify routing works
app.post('/api/auth/google', (req, res) => {
  console.log('✅ TEST route /api/auth/google was hit!');
  res.json({ 
    success: true, 
    message: 'Test route working - auth.js not loaded yet',
    receivedBody: req.body 
  });
});

// ✅ Routes - directly mounted
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Dehradun Estates API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

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
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

const startServer = async () => {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;