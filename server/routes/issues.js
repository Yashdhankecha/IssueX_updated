const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { upload } = require('../config/cloudinary');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { addPoints } = require('../utils/gamification');

// Initialize Gemini AI (Graceful fallback if no key)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Helper: Geocode Coordinates to Address
const getAddressFromCoords = async (lat, lng) => {
  if (!process.env.GOOGLE_MAPS_API_KEY) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const res = await axios.get(url);
    if (res.data.status === 'OK' && res.data.results.length > 0) {
      return res.data.results[0].formatted_address;
    }
  } catch (error) {
    console.error('Geocoding Error:', error.message);
  }
  return null;
};

// Helper: Analyze Image with Gemini
const analyzeImageWithGemini = async (imageUrl) => {
  if (!genAI) return null;
  try {
    // 1. Download image buffer
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const base64Image = buffer.toString('base64');
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    // 2. Prepare Model & Prompt
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      Analyze this image of a civic issue (like a pothole, garbage, broken street light, etc).
      Return ONLY a raw JSON object (no markdown) with the following fields:
      - "title": Short, precise title (e.g. "Deep Pothole on Main St")
      - "description": clear description of the issue (2 sentences max)
      - "category": Best match from [roads, lighting, water, cleanliness, safety, obstructions]
      - "severity": [low, medium, high, critical]
      - "tags": Array of 3-5 short descriptive tags (e.g. "large pothole", "flooding", "exposed wire")
      - "is_relevant": Boolean (true if it looks like a civic issue)
    `;

    // 3. Generate Content
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } }
    ]);

    const text = result.response.text();
    // Clean markdown code blocks if present
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error('Gemini Analysis Error:', error.message);
    return null;
  }
};

// Middleware to check if MongoDB is connected
const checkMongoDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable. Please try again later.',
      error: 'MongoDB is not connected'
    });
  }
  next();
};

// Apply MongoDB check to all routes
router.use(checkMongoDB);

// @desc    Get all issues for homepage with comprehensive filtering
// @route   GET /api/issues
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      status,
      category,
      lat,
      lng,
      radius,
      limit = 50,
      page = 1,
      sort = 'newest' // newest, oldest, most_voted, most_commented
    } = req.query;

    console.log('Received issue query params:', req.query);

    let query = { isActive: true };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by location and radius (geospatial query)
    if (lat && lng && radius) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInKm = parseFloat(radius);
      const radiusInMeters = radiusInKm * 1000; // Convert km to meters

      console.log('Location filter:', { latitude, longitude, radiusInKm, radiusInMeters });

      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInMeters) ||
        latitude < -90 || latitude > 90 ||
        longitude < -180 || longitude > 180 ||
        radiusInMeters <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location parameters. Please provide valid lat, lng, and radius values.',
          received: { lat, lng, radius }
        });
      }

      // Use $geoWithin with $centerSphere instead of $near for better compatibility
      query.location = {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInMeters / 6378137] // Convert meters to radians
        }
      };
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    let sortObject = {};
    switch (sort) {
      case 'oldest':
        sortObject = { createdAt: 1 };
        break;
      case 'most_voted':
        sortObject = { voteCount: -1, createdAt: -1 };
        break;
      case 'most_commented':
        sortObject = { commentCount: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortObject = { createdAt: -1 };
        break;
    }

    // Execute query with population
    const issues = await Issue.find(query)
      .populate({
        path: 'reportedBy',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'assignedTo',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'comments.user',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'upvotes',
        select: 'name',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'downvotes',
        select: 'name',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .sort(sortObject)
      .limit(parseInt(limit))
      .skip(skip);

    console.log(`Found ${issues.length} issues`);

    // Get total count for pagination
    const total = await Issue.countDocuments(query);

    // Format response for frontend
    const formattedIssues = issues.map(issue => ({
      _id: issue._id,
      id: issue._id, // Add both for compatibility
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      severity: issue.severity,
      location: {
        lat: issue.location.coordinates[1], // latitude
        lng: issue.location.coordinates[0], // longitude
        address: issue.location.address
      },
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      images: issue.images,
      anonymous: issue.anonymous,
      reporter: (issue.reportedBy && (!issue.anonymous || (req.user && req.user.id === issue.reportedBy._id.toString()))) ? {
        name: issue.reportedBy.name,
        email: issue.reportedBy.email
      } : { name: 'Anonymous', email: null },
      assignedTo: issue.assignedTo ? {
        name: issue.assignedTo.name,
        email: issue.assignedTo.email
      } : null,
      voteCount: issue.voteCount,
      upvotes: (issue.upvotes && Array.isArray(issue.upvotes)) ? issue.upvotes.length : 0,
      downvotes: (issue.downvotes && Array.isArray(issue.downvotes)) ? issue.downvotes.length : 0,
      // Add user's vote status
      userVote: req.user ? (
        (issue.upvotes && issue.upvotes.some(id => id._id ? id._id.toString() === req.user.id : id.toString() === req.user.id)) ? 'upvote' :
          (issue.downvotes && issue.downvotes.some(id => id._id ? id._id.toString() === req.user.id : id.toString() === req.user.id)) ? 'downvote' : null
      ) : null,
      commentCount: issue.commentCount,
      comments: (issue.comments && Array.isArray(issue.comments)) ? issue.comments.map(comment => ({
        id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        user: {
          name: comment.user.name,
          email: comment.user.email
        }
      })) : [],
      priority: issue.priority,
      estimatedResolutionTime: issue.estimatedResolutionTime,
      tags: issue.tags,
      isActive: issue.isActive,
      flags: [],
      followers: 0
    }));

    res.json({
      success: true,
      data: formattedIssues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        status: status || 'all',
        category: category || 'all',
        location: lat && lng ? { lat, lng, radius } : null,
        sort
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user's issues
// @route   GET /api/issues/my-issues
// @access  Private
router.get('/my-issues', protect, async (req, res) => {
  try {
    const { status, category, limit = 20, page = 1 } = req.query;

    let query = { reportedBy: req.user.id, isActive: true };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const issues = await Issue.find(query)
      .populate({
        path: 'reportedBy',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'assignedTo',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'comments.user',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      data: issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get issues assigned to user (Gov Dept)
// @route   GET /api/issues/assigned
// @access  Private
router.get('/assigned', protect, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    let query = { assignedTo: req.user.id, isActive: true };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      data: issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get assigned issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/issues/my-stats
// @access  Private
router.get('/my-stats', protect, async (req, res) => {
  try {
    const stats = await Issue.getUserStats(req.user.id);

    const userStats = stats[0] || {
      total: 0,
      reported: 0,
      inProgress: 0,
      resolved: 0,
      totalVotes: 0,
      totalComments: 0
    };

    res.json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate({
        path: 'reportedBy',
        select: 'name email',
        strictPopulate: false
      })
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email')
      .populate('upvotes', 'name')
      .populate('downvotes', 'name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Sanitize reporter for anonymous issues unless viewer is owner
    let reporter = { name: 'Anonymous', email: null };
    if (issue.reportedBy) {
      if (!issue.anonymous || (req.user && req.user.id === issue.reportedBy._id.toString())) {
        reporter = {
          name: issue.reportedBy.name,
          email: issue.reportedBy.email
        };
      }
    }

    // Convert to object to modify safely
    const issueObj = issue.toObject();
    issueObj.reporter = reporter;
    // Remove raw reportedBy to prevent leak
    delete issueObj.reportedBy;

    // Helper to calculate virtuals if toObject doesn't include them automatically (it does if schema options set)
    // But let's ensure structure matches list view
    issueObj.id = issue._id;
    issueObj.voteCount = (issue.upvotes?.length || 0) - (issue.downvotes?.length || 0);

    // Format location to match list view
    if (issueObj.location && issueObj.location.coordinates) {
      issueObj.location = {
        lat: issueObj.location.coordinates[1],
        lng: issueObj.location.coordinates[0],
        address: issueObj.location.address
      };
    } else if (issueObj.location) {
      // Fallback if no coordinates but location exists
      issueObj.location = { lat: 0, lng: 0, address: issueObj.location.address || '' };
    }

    // Format comments
    if (issueObj.comments) {
      issueObj.comments = issueObj.comments.map(comment => ({
        id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        user: comment.user ? { name: comment.user.name } : { name: 'Unknown' } // Hide email in public comments
      }));
    }

    // Add upvotes/downvotes counts
    issueObj.upvotes = issue.upvotes?.length || 0;
    issueObj.downvotes = issue.downvotes?.length || 0;

    // Add user's vote status
    if (req.user) {
      const userId = req.user.id;
      const hasUpvoted = issue.upvotes?.some(id => id._id ? id._id.toString() === userId : id.toString() === userId);
      const hasDownvoted = issue.downvotes?.some(id => id._id ? id._id.toString() === userId : id.toString() === userId);
      issueObj.userVote = hasUpvoted ? 'upvote' : (hasDownvoted ? 'downvote' : null);
    } else {
      issueObj.userVote = null;
    }

    res.json({
      success: true,
      data: issueObj
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create new issue (supports both authenticated and anonymous)
// @route   POST /api/issues
// @access  Public (with optional auth)
router.post('/', [
  upload.array('images', 5),
  optionalAuth, // Make authentication optional
  [
    body('title', 'Title is required').notEmpty().trim(),
    body('description', 'Description is required').notEmpty().trim(),
    body('category', 'Valid category is required').isIn(['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions']),
    // Validators will run after multer populates body
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    // filter out location errors if location is a string (we parse it manually later)
    // Actually simpler to just parse manually first then maybe validate manually or let it fail?
    // Let's rely on manual validation inside 

    let {
      title,
      description,
      category,
      severity = 'medium',
      location,
      anonymous = false
    } = req.body;

    // Parse location if it comes as a string from FormData
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid location format' });
      }
    }

    // Parse boolean fields
    if (typeof anonymous === 'string') {
      anonymous = anonymous === 'true';
    }

    // Manual generic validation since express-validator might be confused by stringified JSON in FormData
    if (!title || !description || !category || !location) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    console.log('Creating issue with data:', { ...req.body, location });

    // Validate coordinates
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates are required',
        received: location
      });
    }

    // --- GOOGLE FEATURES INTEGRATION ---

    // 1. Geocoding: Auto-fill address if missing
    if (!location.address || location.address.trim() === '' || location.address.includes('Lat:')) {
      console.log('Fetching address from Google Maps...');
      const fetchedAddress = await getAddressFromCoords(location.lat, location.lng);
      if (fetchedAddress) {
        console.log('Address found:', fetchedAddress);
        location.address = fetchedAddress;
      }
    }

    // 2. Gemini AI: Smart Analysis
    let aiTags = [];
    if (imageUrls.length > 0) {
      console.log('Analyzing image with Gemini AI...');
      const aiResult = await analyzeImageWithGemini(imageUrls[0]);

      if (aiResult) {
        // STRICT PROHIBITION: Check relevance
        if (aiResult.is_relevant === false) {
          console.log('Creating issue blocked: Image not relevant');
          // Delete uploaded image to clean up
          // (Assuming Cloudinary handles cleanup or we leave it for now)
          return res.status(400).json({
            success: false,
            message: 'Submission rejected: No valid civic issue detected in the image.'
          });
        }

        // STRICT PROHIBITION: Check category
        const validCategories = ['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'];
        if (aiResult.category && !validCategories.includes(aiResult.category)) {
          console.log('Creating issue blocked: Invalid category', aiResult.category);
          return res.status(400).json({
            success: false,
            message: 'Submission rejected: Issue type not supported.'
          });
        }

        console.log('Gemini Result:', aiResult);

        // Auto-enhance data
        if (aiResult.tags && Array.isArray(aiResult.tags)) {
          aiTags = [...aiResult.tags, 'verified-by-ai'];
        }

        // If user set severity to default 'medium', let AI refine it
        if (severity === 'medium' && aiResult.severity) {
          severity = aiResult.severity;
        }
      }
    }
    // -----------------------------------

    // AUTO-ASSIGNMENT LOGIC
    const { assignIssueToDepartment } = require('../utils/autoAssign');
    const assignedUser = await assignIssueToDepartment(category);

    // Prepare issue data with proper MongoDB geospatial format
    const issueData = {
      title,
      description,
      category,
      severity,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat], // MongoDB format: [longitude, latitude]
        address: location.address || ''
      },
      anonymous,
      images: imageUrls,
      tags: aiTags // Add AI generated tags
    };

    if (assignedUser) {
      console.log(`Auto-assigning issue to: ${assignedUser.name} (${assignedUser.department})`);
      issueData.assignedTo = assignedUser._id;
    }

    // Set reportedBy if user is authenticated (even if anonymous, so they can see it in their history)
    if (req.user) {
      console.log('Linking issue to user:', req.user.id, 'Anonymous:', anonymous);
      issueData.reportedBy = req.user.id;
    } else {
      console.log('No user found in request during issue creation - Issue will be unlinked');
    }

    console.log('Saving issue to database:', issueData);

    const issue = new Issue(issueData);
    await issue.save();

    console.log('Issue saved successfully:', issue._id);

    // GAMIFICATION: Points for reporting
    if (req.user) {
      await addPoints(req.user.id, 'REPORT_ISSUE');

      // Points for AI verification if it happened
      if (aiTags.includes('verified-by-ai')) {
        await addPoints(req.user.id, 'VERIFIED_ISSUE');
      }
    }

    // NOTIFICATION: Notify the assigned Department
    if (assignedUser) {
      try {
        await Notification.create({
          userId: assignedUser._id,
          type: 'assigned',
          title: 'New Issue Reported',
          message: `A new ${category} issue has been reported and assigned to your department.`,
          issueId: issue._id,
          icon: 'assignment', // Ensure 'assignment' icon is handled or use generic
          priority: 'high'
        });
        console.log('Notification sent to government department');
      } catch (notifError) {
        console.error('Failed to send assignment notification:', notifError);
      }
    }

    // Populate reporter info if available
    if (issue.reportedBy) {
      await issue.populate('reportedBy', 'name email');
    }

    // Format response for frontend compatibility
    const formattedIssue = {
      _id: issue._id,
      id: issue._id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      severity: issue.severity,
      location: {
        lat: issue.location.coordinates[1],
        lng: issue.location.coordinates[0],
        address: issue.location.address
      },
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      images: issue.images,
      anonymous: issue.anonymous,
      reporter: issue.reportedBy ? {
        name: issue.reportedBy.name,
        email: issue.reportedBy.email
      } : { name: 'Anonymous', email: null },
      voteCount: issue.voteCount || 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: issue.commentCount || 0,
      comments: [],
      flags: [],
      followers: 0
    };

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: formattedIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating issue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is owner or admin
    if (issue.reportedBy && issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this issue'
      });
    }

    const {
      title,
      description,
      category,
      severity,
      status,
      location,
      images
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (severity) updateData.severity = severity;
    if (status) updateData.status = status;
    if (images) updateData.images = images;

    // Handle location update with proper format
    if (location) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat],
        address: location.address || ''
      };
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');

    // Create notification if status changed
    if (status && status !== issue.status && issue.reportedBy) {
      try {
        await Notification.create({
          userId: issue.reportedBy,
          type: 'update',
          title: 'Issue Status Updated',
          message: `Your issue "${issue.title}" is now ${status.replace('_', ' ')}`,
          issueId: issue._id,
          icon: 'update',
          priority: 'high'
        });
      } catch (err) { console.error('Notification error:', err); }
    }

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is owner or admin
    if (issue.reportedBy && issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue'
      });
    }

    // Soft delete
    issue.isActive = false;
    await issue.save();

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
router.post('/:id/comments', [
  protect,
  body('text', 'Comment text is required').notEmpty().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    await issue.addComment(req.user.id, req.body.text);

    await issue.populate('comments.user', 'name email');

    // Create notification for reporter
    if (issue.reportedBy && issue.reportedBy.toString() !== req.user.id) {
      try {
        await Notification.create({
          userId: issue.reportedBy,
          type: 'comment',
          title: 'New Comment',
          message: `${req.user.name} commented on: "${issue.title}"`,
          issueId: issue._id,
          icon: 'comment'
        });
      } catch (err) { console.error('Notification error:', err); }
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: issue.comments && Array.isArray(issue.comments) ? issue.comments[issue.comments.length - 1] : null
    });

    // GAMIFICATION: Points for commenting
    await addPoints(req.user.id, 'COMMENT');
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Vote on issue
// @route   POST /api/issues/:id/vote
router.post('/:id/vote', [
  protect,
  body('voteType', 'Vote type is required').isIn(['upvote', 'downvote'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });


    const userId = req.user.id;
    const issueId = issue._id;
    const { voteType } = req.body;

    // Get the user to update their vote history
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if user has already voted in the same way
    const hasUpvoted = issue.upvotes.some(id => id.toString() === userId);
    const hasDownvoted = issue.downvotes.some(id => id.toString() === userId);

    // Handle vote removal (toggle behavior)
    if (voteType === 'upvote' && hasUpvoted) {
      // Remove upvote (user clicked upvote again)
      issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
      // Remove from user's upvotedIssues
      user.upvotedIssues = user.upvotedIssues.filter(id => id.toString() !== issueId.toString());
    } else if (voteType === 'downvote' && hasDownvoted) {
      // Remove downvote (user clicked downvote again)
      issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
      // Remove from user's downvotedIssues
      user.downvotedIssues = user.downvotedIssues.filter(id => id.toString() !== issueId.toString());
    } else if (voteType === 'upvote') {
      // Add upvote
      if (!hasUpvoted) {
        issue.upvotes.push(userId);
        // Add to user's upvotedIssues if not already there
        if (!user.upvotedIssues.some(id => id.toString() === issueId.toString())) {
          user.upvotedIssues.push(issueId);
        }

        // GAMIFICATION: Points for receiving upvote
        if (issue.reportedBy && issue.reportedBy.toString() !== userId) {
          await addPoints(issue.reportedBy, 'UPVOTE_RECEIVED');
        }
      }
      // Remove any existing downvote
      if (hasDownvoted) {
        issue.downvotes = issue.downvotes.filter(id => id.toString() !== userId);
        user.downvotedIssues = user.downvotedIssues.filter(id => id.toString() !== issueId.toString());
      }
    } else if (voteType === 'downvote') {
      // Add downvote
      if (!hasDownvoted) {
        issue.downvotes.push(userId);
        // Add to user's downvotedIssues if not already there
        if (!user.downvotedIssues.some(id => id.toString() === issueId.toString())) {
          user.downvotedIssues.push(issueId);
        }
      }
      // Remove any existing upvote
      if (hasUpvoted) {
        issue.upvotes = issue.upvotes.filter(id => id.toString() !== userId);
        user.upvotedIssues = user.upvotedIssues.filter(id => id.toString() !== issueId.toString());
      }
    }

    // Calculate new vote count
    const voteCount = issue.upvotes.length - issue.downvotes.length;

    // Update priority based on vote count
    // More upvotes = higher priority
    let newPriority = 'medium';
    if (voteCount >= 10) {
      newPriority = 'urgent';
    } else if (voteCount >= 5) {
      newPriority = 'high';
    } else if (voteCount >= 0) {
      newPriority = 'medium';
    } else {
      newPriority = 'low';
    }

    // Only update priority if it has changed
    if (issue.priority !== newPriority) {
      issue.priority = newPriority;
    }

    // Save both issue and user
    await Promise.all([issue.save(), user.save()]);

    // Check updated vote status
    const userHasUpvoted = issue.upvotes.some(id => id.toString() === userId);
    const userHasDownvoted = issue.downvotes.some(id => id.toString() === userId);

    res.json({
      success: true,
      message: 'Vote recorded',
      data: {
        voteCount: issue.upvotes.length - issue.downvotes.length,
        upvotes: issue.upvotes.length,
        downvotes: issue.downvotes.length,
        priority: issue.priority,
        userVote: userHasUpvoted ? 'upvote' : (userHasDownvoted ? 'downvote' : null)
      }
    });

  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Start work on issue (Gov)
// @route   PUT /api/issues/:id/start-work
// @access  Private (Assigned Gov)
router.put('/:id/start-work', [protect, upload.single('image')], async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    // Verify ownership
    if (issue.assignedTo?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) return res.status(400).json({ success: false, message: 'Proof image required' });

    issue.status = 'in_progress';
    issue.workStartedAt = Date.now();
    issue.workStartedImage = req.file.path;
    await issue.save();

    // Notify Reporter
    if (issue.reportedBy) {
      await Notification.create({
        userId: issue.reportedBy,
        type: 'update',
        title: 'Work Started',
        message: `The ${issue.category} department has started working on your issue.`,
        issueId: issue._id,
        icon: 'construction',
        priority: 'high'
      });
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Start work error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Resolve issue (Gov)
// @route   PUT /api/issues/:id/resolve
// @access  Private (Assigned Gov)
router.put('/:id/resolve', [protect, upload.single('image')], async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (issue.assignedTo?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!req.file) return res.status(400).json({ success: false, message: 'Proof image required' });

    // AI Analysis (Simplified for now - Random high confidence for demo)
    // Real implementation would call Gemini here to compare before/after
    const aiScore = Math.floor(Math.random() * (99 - 85 + 1) + 85);

    issue.status = 'resolved';
    issue.resolvedAt = Date.now();
    issue.resolutionImage = req.file.path;
    issue.resolutionStatus = 'pending_review';
    issue.aiResolutionScore = aiScore;

    await issue.save();

    // GAMIFICATION: Points for resolution (Awarded to Reporter)
    if (issue.reportedBy) {
      await addPoints(issue.reportedBy, 'RESOLVE_ISSUE');
    }

    // Notify Reporter
    if (issue.reportedBy) {
      await Notification.create({
        userId: issue.reportedBy,
        type: 'success',
        title: 'Issue Resolved',
        message: `The issue has been marked resolved. Please verify the fix.`,
        issueId: issue._id,
        icon: 'check_circle',
        priority: 'urgent'
      });
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Resolve issue error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Get issue statistics
// @route   GET /api/issues/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          reported: {
            $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          totalVotes: {
            $sum: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] }
          },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          reported: 0,
          inProgress: 0,
          resolved: 0,
          totalVotes: 0,
          totalComments: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Approve fix (Reporter)
// @route   PUT /api/issues/:id/approve-fix
// @access  Private (Reporter)
router.put('/:id/approve-fix', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (issue.reportedBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    issue.status = 'closed';
    issue.resolutionStatus = 'verified';
    await issue.save();

    // Notify Gov Dept
    if (issue.assignedTo) {
      await Notification.create({
        userId: issue.assignedTo,
        type: 'success',
        title: 'Fix Verified',
        message: `The user has verified the fix for ${issue.title}. Issue Closed.`,
        issueId: issue._id,
        icon: 'check_all',
        priority: 'normal'
      });
    }

    res.json({ success: true, data: issue });

    // GAMIFICATION: Points for confirming resolution
    await addPoints(req.user.id, 'CONFIRM_RESOLUTION');
  } catch (error) {
    console.error('Approve fix error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Reject fix (Reporter)
// @route   PUT /api/issues/:id/reject-fix
// @access  Private (Reporter)
router.put('/:id/reject-fix', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    if (issue.reportedBy?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    issue.status = 'in_progress';
    issue.resolutionStatus = 'rejected';
    await issue.save();

    // Notify Gov Dept
    if (issue.assignedTo) {
      await Notification.create({
        userId: issue.assignedTo,
        type: 'alert',
        title: 'Fix Rejected',
        message: `The user rejected the fix for ${issue.title}. Re-opened for work.`,
        issueId: issue._id,
        icon: 'close',
        priority: 'urgent'
      });
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    console.error('Reject fix error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @desc    Analyze image using Gemini AI (New Route)
// @route   POST /api/issues/analyze-image
// @access  Public
router.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    console.log('Analyzing image:', req.file.path);
    const analysis = await analyzeImageWithGemini(req.file.path);

    if (!analysis) {
      // Fallback if AI fails
      return res.json({
        success: true,
        data: {
          title: '',
          description: '',
          category: 'roads',
          severity: 'medium',
          tags: []
        }
      });
    }

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analyze image error:', error);
    res.status(500).json({ success: false, message: 'Analysis failed' });
  }
});

module.exports = router;