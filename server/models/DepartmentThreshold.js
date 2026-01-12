const mongoose = require('mongoose');

/**
 * DepartmentThreshold Schema
 * Stores the maximum allowed pending time (in hours) for each department.
 * Issues that exceed this threshold will be flagged as "overdue" in the government dashboard.
 */
const departmentThresholdSchema = new mongoose.Schema({
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'],
    unique: true
  },
  // Maximum hours an issue can remain in 'reported' status before being flagged as overdue
  maxPendingHours: {
    type: Number,
    required: [true, 'Max pending hours is required'],
    default: 72, // Default 72 hours (3 days)
    min: [1, 'Minimum pending hours must be at least 1']
  },
  // Maximum hours an issue can remain in 'in_progress' status before being flagged
  maxInProgressHours: {
    type: Number,
    required: [true, 'Max in-progress hours is required'],
    default: 168, // Default 168 hours (7 days)
    min: [1, 'Minimum in-progress hours must be at least 1']
  },
  // Description of why these thresholds are set
  description: {
    type: String,
    default: ''
  },
  // Last updated by (admin/government user)
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
departmentThresholdSchema.index({ department: 1 });

// Static method to get threshold for a specific department
departmentThresholdSchema.statics.getThreshold = async function(department) {
  let threshold = await this.findOne({ department, isActive: true });
  
  // Return default values if no threshold is configured
  if (!threshold) {
    return {
      department,
      maxPendingHours: 72, // 3 days default
      maxInProgressHours: 168 // 7 days default
    };
  }
  
  return threshold;
};

// Static method to get all thresholds
departmentThresholdSchema.statics.getAllThresholds = async function() {
  const departments = ['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'];
  const thresholds = await this.find({ isActive: true });
  
  // Create a map for quick lookup
  const thresholdMap = {};
  thresholds.forEach(t => {
    thresholdMap[t.department] = t;
  });
  
  // Return thresholds for all departments, using defaults if not configured
  return departments.map(dept => {
    if (thresholdMap[dept]) {
      return thresholdMap[dept];
    }
    return {
      department: dept,
      maxPendingHours: 72,
      maxInProgressHours: 168,
      isDefault: true
    };
  });
};

module.exports = mongoose.model('DepartmentThreshold', departmentThresholdSchema);
