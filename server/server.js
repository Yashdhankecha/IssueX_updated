const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()
console.log('🔍 Loaded Cloud Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '✅ Found' : '❌ Missing'
});

const authRoutes = require('./routes/auth')
const issueRoutes = require('./routes/issues')
const notificationRoutes = require('./routes/notifications')
const adminRoutes = require('./routes/admin')
const gamificationRoutes = require('./routes/gamification')
const governmentRoutes = require('./routes/government')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      process.env.FRONTEND_URL || 'https://issuex-app.netlify.app',
      'https://issuex.netlify.app',
      'https://your-custom-domain.com'
    ]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))

// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production'
    ? (process.env.RATE_LIMIT_MAX || 1000)
    : 5000, // Much higher limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/api/health' || req.path.startsWith('/uploads/');
  }
})
app.use('/api/', limiter)

// More lenient rate limiting for issues endpoint in development
if (process.env.NODE_ENV !== 'production') {
  const issuesLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500, // Increased to 500 requests per minute for development
    message: {
      error: 'Too many requests to issues endpoint, please try again later.'
    }
  })
  app.use('/api/issues', issuesLimiter)
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/gamification', gamificationRoutes)
app.use('/api/government', governmentRoutes)
app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const axios = require('axios');

    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        'User-Agent': 'IssueX-CivicAPI/1.0'
      }
    });

    const data = response.data;
    const addr = data.address || {};

    // Construct a more detailed address
    // Priority: Road/Street -> Suburb/Neighborhood -> City/Town -> State -> Postcode
    const addressParts = [
      addr.road || addr.pedestrian || addr.footway || addr.path,
      addr.suburb || addr.neighbourhood || addr.residential,
      addr.city || addr.town || addr.village || addr.hamlet || addr.municipality,
      addr.state || addr.province,
      addr.postcode
    ].filter(Boolean); // Remove null/undefined/empty strings

    const formattedAddress = addressParts.join(', ');

    res.json({
      success: true,
      data: {
        address: formattedAddress || data.display_name, // Fallback to display_name if construction fails
        raw: data
      }
    });

  } catch (error) {
    console.error('Geocode proxy error:', error.message);
    res.status(500).json({ error: 'Geocoding service unavailable' });
  }
});
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
})

// Test endpoint for location queries
app.get('/api/test/location', (req, res) => {
  const { lat, lng, radius } = req.query;

  res.json({
    success: true,
    message: 'Location test endpoint working',
    received: { lat, lng, radius },
    parsed: {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: parseFloat(radius)
    },
    valid: !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) && !isNaN(parseFloat(radius))
  })
})

// Error handling middleware
app.use(errorHandler)

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // 404 handler for development/production
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found'
    });
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found'
    });
  });
}

// Database connection - Using local MongoDB for FixIt
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issuex'

// Set Mongoose options to handle strictPopulate
mongoose.set('strictPopulate', false);

// Check if MongoDB is available
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
  console.log('💡 Make sure MongoDB is running locally on port 27017')
  console.log('💡 Or set MONGODB_URI environment variable')
})

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to IssueX MongoDB Database')
  console.log(`📊 Database: ${MONGODB_URI}`)
})

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected')
})

// Attempt to connect to MongoDB with retry logic
// Attempt to connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    // Mongoose 7+ defaults to these settings, so explicit options are not needed
    await mongoose.connect(MONGODB_URI)
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    console.log('💡 If using MongoDB Atlas, check your IP whitelist and credentials')
    console.log('💡 Or set MONGODB_URI environment variable correctly')
    console.log('💡 Server will continue running but database features will be unavailable')

    // Retry connection every 30 seconds
    setTimeout(connectDB, 30000)
  }
}

connectDB()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 IssueX Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log(`📊 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})