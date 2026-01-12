const { verifyToken, extractToken } = require('../utils/jwtUtils')
const User = require('../models/User')

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    // Verify Firebase Token
    // We try to require the admin instance here to avoid circular dependency or init issues
    const admin = require('../config/firebaseAdmin');

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (firebaseError) {
      console.error('Firebase token verification failed:', firebaseError);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }

    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }

    // Find user by Firebase UID or Email
    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      // Fallback: try finding by email if verified
      if (decodedToken.email) {
        user = await User.findOne({ email: decodedToken.email });
        // Link firebaseUid if found
        if (user && !user.firebaseUid) {
          user.firebaseUid = decodedToken.uid;
          await user.save();
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found in system.'
      })
    }

    // Sync email verification status
    if (decodedToken.email_verified && !user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    })
  }
}

// Optional authentication - doesn't require token but adds user if available
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req)

    if (token) {
      try {
        const admin = require('../config/firebaseAdmin');
        const decodedToken = await admin.auth().verifyIdToken(token);

        if (decodedToken) {
          let user = await User.findOne({ firebaseUid: decodedToken.uid });

          if (!user && decodedToken.email) {
            user = await User.findOne({ email: decodedToken.email });
            if (user && !user.firebaseUid) {
              user.firebaseUid = decodedToken.uid;
              await user.save();
            }
          }

          if (user && user.isActive) {
            req.user = user;
          }
        }
      } catch (tokenError) {
        // Token verification failed, proceed as unauthenticated
        // console.log('Optional auth token verification failed:', tokenError.message);
      }
    }

    next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    next()
  }
}

module.exports = {
  protect,
  optionalAuth
} 