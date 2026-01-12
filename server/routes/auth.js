const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { upload } = require('../config/cloudinary')

const User = require('../models/User')
const { generateToken } = require('../utils/jwtUtils')
const { protect } = require('../middleware/auth')
const {
  validateSignUp,
  validateSignIn,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation')

const admin = require('../config/firebaseAdmin');

// @route   POST /api/auth/register
// @desc    Register a new user (with Firebase)
// @access  Public (Authenticated via Firebase token)
router.post('/register', validateSignUp, async (req, res) => {
  try {
    const { name, email } = req.body;
    // Token verification is handled by 'validateSignUp' middleware if any, OR 'protect' if used.
    // But this route uses 'validateSignUp' which is just validation rules.
    // We need to verify the token manually because this route is generally "Public" but with a token.

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token provided' });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (e) {
      console.error("Token verification failed in register:", e.message);
      // Don't fail hard here if just decoding fails, but it SHOULD fail if token is bad.
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    if (decodedToken.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Email mismatch' });
    }

    console.log('FixIt Registration:', { name, email })

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      // Link account if exists
      if (!existingUser.firebaseUid) {
        existingUser.firebaseUid = decodedToken.uid;
        await existingUser.save();
        return res.status(200).json({
          success: true,
          message: 'Account linked successfully!',
          data: {
            user: existingUser
          }
        })
      }
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      firebaseUid: decodedToken.uid,
      isEmailVerified: decodedToken.email_verified || false,
      isActive: true
    })

    await user.save()

    res.status(201).json({
      success: true,
      message: 'FixIt account created successfully!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        }
      }
    })
  } catch (error) {
    console.error('FixIt Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get user data (via Firebase token)
// @access  Private (Token Verification handled by protect)
router.post('/login', protect, async (req, res) => {
  try {
    // protect middleware already verified token and attached user to req.user
    const user = req.user;

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    res.json({
      success: true,
      message: 'Welcome back to FixIt!',
      data: {
        token: req.headers.authorization?.split(' ')[1], // Return the same token back or no need
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          role: user.role,
          upvotedIssues: user.upvotedIssues || [],
          downvotedIssues: user.downvotedIssues || []
        }
      }
    })
  } catch (error) {
    console.error('FixIt Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset (simplified for FixIt)
// @access  Public
router.post('/forgot-password', validateForgotPassword, async (req, res) => {
  try {
    const { email } = req.body
    console.log('FixIt Password reset request:', { email })

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // For offline development, just return success
    // In production, you would send an actual email
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email (offline mode)'
    })
  } catch (error) {
    console.error('FixIt Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password (simplified for FixIt)
// @access  Public
router.post('/reset-password', validateResetPassword, async (req, res) => {
  try {
    const { email, newPassword } = req.body
    console.log('FixIt Password reset:', { email })

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('FixIt Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { notifications, privacy } = req.body;
    const user = await User.findById(req.user.id);

    if (notifications) {
      user.preferences = user.preferences || {};
      user.preferences.notifications = { ...user.preferences.notifications, ...notifications };
    }
    if (privacy) {
      user.preferences = user.preferences || {};
      user.preferences.privacy = { ...user.preferences.privacy, ...privacy };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!user.password && user.firebaseUid) {
      // For firebase-only users, we might need a different flow, but assuming hybrid or mostly password-based for now as per Context
      return res.status(400).json({ success: false, message: 'Social login users should change password via provider' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    // Ideally sync with Firebase too if needed, but keeping it simple for DB sync request
    if (user.firebaseUid) {
      await admin.auth().updateUser(user.firebaseUid, {
        password: newPassword
      });
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (user.password) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
    }

    if (user.firebaseUid) {
      try {
        await admin.auth().deleteUser(user.firebaseUid);
      } catch (e) {
        console.error('Firebase delete warning:', e.message);
      }
    }

    await user.deleteOne();

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          ...req.user.toObject(),
          upvotedIssues: req.user.upvotedIssues || [],
          downvotedIssues: req.user.downvotedIssues || []
        }
      }
    })
  } catch (error) {
    console.error('FixIt Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    })
  }
})

// @route   GET /api/auth/my-votes
// @desc    Get all issues the user has voted on with details
// @access  Private
router.get('/my-votes', protect, async (req, res) => {
  try {
    const Issue = require('../models/Issue');

    // Get user with populated voted issues
    const user = await User.findById(req.user.id)
      .populate({
        path: 'upvotedIssues',
        select: 'title description category status images createdAt location priority',
        options: { sort: { createdAt: -1 } }
      })
      .populate({
        path: 'downvotedIssues',
        select: 'title description category status images createdAt location priority',
        options: { sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Format the voted issues
    const formatIssue = (issue, voteType) => ({
      id: issue._id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      image: issue.images?.[0] || null,
      location: issue.location?.address || 'Unknown location',
      createdAt: issue.createdAt,
      voteType: voteType
    });

    const upvotedIssues = (user.upvotedIssues || []).filter(i => i).map(i => formatIssue(i, 'upvote'));
    const downvotedIssues = (user.downvotedIssues || []).filter(i => i).map(i => formatIssue(i, 'downvote'));

    res.json({
      success: true,
      data: {
        upvotedIssues,
        downvotedIssues,
        totalUpvotes: upvotedIssues.length,
        totalDownvotes: downvotedIssues.length
      }
    });
  } catch (error) {
    console.error('Get my votes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('FixIt Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    })
  }
})

// @route   PUT /api/auth/profile/picture
// @desc    Update profile picture
// @access  Private
router.put('/profile/picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // req.file.path contains the Cloudinary URL
    user.profilePicture = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture, // Return the new URL
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ success: false, message: 'Server error during upload' });
  }
});

// @route   DELETE /api/auth/profile/picture
// @desc    Remove profile picture
// @access  Private
router.delete('/profile/picture', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.profilePicture = undefined; // Or null/empty string depending on schema
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture removed',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: null,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router 