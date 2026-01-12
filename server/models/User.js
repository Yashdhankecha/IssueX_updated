const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    default: 'N/A',
    trim: true
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: false, // Not required for Firebase users
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot be more than 200 characters'],
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false // Default false, synced with Firebase
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'government', 'manager', 'field_worker'],
    default: 'user'
  },
  department: {
    type: String,
    enum: ['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions', null],
    default: null
  },

  // Gamification Fields
  impactScore: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  badges: [{
    type: String
  }],
  redeemedRewards: [{
    rewardId: String,
    redeemedAt: { type: Date, default: Date.now },
    code: String
  }],

  // Track issues the user has voted on
  upvotedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  downvotedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
      locationSharing: { type: Boolean, default: true },
      anonymousReports: { type: Boolean, default: false }
    },
    appearance: {
      darkMode: { type: Boolean, default: false },
      theme: { type: String, enum: ['blue', 'green', 'purple', 'orange'], default: 'blue' }
    },
    location: {
      radius: { type: Number, default: 5, min: 1, max: 50 }
    }
  }
}, {
  timestamps: true
})

// Index for better query performance
userSchema.index({ email: 1 })

// Pre-save middleware
userSchema.pre('save', async function (next) {
  // Handle empty department
  if (this.department === '') {
    this.department = null;
  }

  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to get user data without sensitive information
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

// Virtual for member since (formatted date)
userSchema.virtual('memberSince').get(function () {
  return this.createdAt ? this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A'
})

// Virtual for member since (relative time)
userSchema.virtual('memberSinceRelative').get(function () {
  if (!this.createdAt) return 'N/A'

  const now = new Date()
  const diff = now - this.createdAt
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)

  if (years > 0) {
    return `${years} year${years !== 1 ? 's' : ''} ago`
  } else if (months > 0) {
    return `${months} month${months !== 1 ? 's' : ''} ago`
  } else if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else {
    return 'Today'
  }
})

module.exports = mongoose.model('User', userSchema) 