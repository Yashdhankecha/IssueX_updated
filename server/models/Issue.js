const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'],
    default: 'roads'
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['reported', 'in_progress', 'resolved', 'closed'],
    default: 'reported'
  },
  statusLogs: [{
    status: {
      type: String,
      required: true,
      enum: ['reported', 'in_progress', 'resolved', 'closed']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  // Fixed location structure for MongoDB geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - MongoDB requirement
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 2 &&
            v[0] >= -180 && v[0] <= 180 && // longitude
            v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.'
      }
    },
    address: {
      type: String,
      default: ''
    }
  },
  images: [{
    type: String
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous reports
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedWorker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // --- Resolution Workflow ---
  workStartedAt: {
    type: Date
  },
  workStartedImage: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  resolutionImage: {
    type: String
  },
  aiResolutionScore: {
    type: Number,
    min: 0,
    max: 100
  },
  resolutionStatus: {
    type: String,
    enum: ['pending_review', 'verified', 'rejected', null]
  },
  // ---------------------------
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedResolutionTime: {
    type: Number, // in days
    default: 7
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for vote count
issueSchema.virtual('voteCount').get(function () {
  // Handle cases where upvotes or downvotes might be undefined
  const upvotesLength = (this.upvotes && Array.isArray(this.upvotes)) ? this.upvotes.length : 0;
  const downvotesLength = (this.downvotes && Array.isArray(this.downvotes)) ? this.downvotes.length : 0;
  return upvotesLength - downvotesLength;
});

// Virtual for comment count
issueSchema.virtual('commentCount').get(function () {
  // Handle cases where comments might be undefined
  return (this.comments && Array.isArray(this.comments)) ? this.comments.length : 0;
});

// Virtual for backward compatibility with frontend
issueSchema.virtual('lat').get(function () {
  return this.location.coordinates[1]; // latitude
});

issueSchema.virtual('lng').get(function () {
  return this.location.coordinates[0]; // longitude
});

// Index for efficient queries
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, category: 1 });
issueSchema.index({ reportedBy: 1, createdAt: -1 });
issueSchema.index({ createdAt: -1 });

// Pre-save middleware to update address if not provided
issueSchema.pre('save', async function (next) {
  if (!this.location.address && this.location.coordinates) {
    try {
      // You can integrate with a geocoding service here
      // For now, we'll create a simple address
      const [lng, lat] = this.location.coordinates;
      this.location.address = `Lat: ${lat}, Lng: ${lng}`;
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  }
  next();
});

// Static method to get issues by user
issueSchema.statics.getUserIssues = function (userId, options = {}) {
  const query = { reportedBy: userId, isActive: true };

  if (options.status) {
    query.status = options.status;
  }

  if (options.category) {
    query.category = options.category;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
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
    });
};

// Static method to get issue statistics
issueSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    { $match: { reportedBy: new mongoose.Types.ObjectId(userId), isActive: true } },
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
};

// Instance method to add comment
issueSchema.methods.addComment = function (userId, text) {
  this.comments.push({
    user: userId,
    text: text
  });
  return this.save();
};

// Instance method to vote
issueSchema.methods.vote = function (userId, voteType) {
  const upvoteIndex = this.upvotes.indexOf(userId);
  const downvoteIndex = this.downvotes.indexOf(userId);

  if (voteType === 'upvote') {
    if (upvoteIndex === -1) {
      this.upvotes.push(userId);
    }
    if (downvoteIndex !== -1) {
      this.downvotes.splice(downvoteIndex, 1);
    }
  } else if (voteType === 'downvote') {
    if (downvoteIndex === -1) {
      this.downvotes.push(userId);
    }
    if (upvoteIndex !== -1) {
      this.upvotes.splice(upvoteIndex, 1);
    }
  }

  return this.save();
};

module.exports = mongoose.model('Issue', issueSchema); 