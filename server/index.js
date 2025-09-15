const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');

const app = express();

// ✅ CORS Configuration - MUST BE FIRST
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite React port
    'http://localhost:3000',  // Regular React port  
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
};

app.use(cors(corsOptions));

// ✅ FIXED: Manual CORS preflight handling
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
    res.header('Access-Control-Allow-Credentials', true);
    return res.status(200).end();
  }
  next();
});

// Security and performance middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files with CORS headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// ✅ Health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: '🌊 Ocean Research API is running!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/upload', uploadRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ocean-research', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('🌊 MongoDB connected successfully');
  console.log('📁 Database: ocean-research');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.log('💡 Make sure MongoDB is running: mongod');
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server Error:', error);
  const status = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Ocean Research Backend Started!');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin.join(', ')}`);
  console.log('💡 Ready to accept file uploads!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated');
    mongoose.connection.close();
  });
});

module.exports = app;
