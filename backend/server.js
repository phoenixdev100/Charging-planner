const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    hasMongoUri: !!process.env.MONGODB_URI
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Database connection middleware for serverless
let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected && process.env.MONGODB_URI) {
    try {
      const connectDB = require('./config/database');
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error.message);
      // Don't block requests, just log the error
    }
  }
  next();
});

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Lazy load routes to prevent initialization errors
app.use('/api/chargers', (req, res, next) => {
  const chargerRoutes = require('./routes/chargerRoutes');
  chargerRoutes(req, res, next);
});

app.use('/api/cost', (req, res, next) => {
  const costRoutes = require('./routes/costRoutes');
  costRoutes(req, res, next);
});

app.use('/api/planning', (req, res, next) => {
  const planningRoutes = require('./routes/planningRoutes');
  planningRoutes(req, res, next);
});

app.use('/api/vehicles', (req, res, next) => {
  const vehicleRoutes = require('./routes/vehicleRoutes');
  vehicleRoutes(req, res, next);
});

app.use('/api/auth', (req, res, next) => {
  const authRoutes = require('./routes/authRoutes');
  authRoutes(req, res, next);
});

app.use('/api/reports', (req, res, next) => {
  const reportRoutes = require('./routes/reportRoutes');
  reportRoutes(req, res, next);
});

app.use('/api/visualization', (req, res, next) => {
  const visualizationRoutes = require('./routes/visualizationRoutes');
  visualizationRoutes(req, res, next);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Start server only if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
