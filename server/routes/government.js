const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const DepartmentThreshold = require('../models/DepartmentThreshold');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Middleware to check if user has government role
const requireGovernment = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role !== 'government' && req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({
                success: false,
                message: 'Government access required'
            });
        }

        next();
    } catch (error) {
        console.error('Government verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during government verification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// GET /api/government/dashboard - Get comprehensive government dashboard statistics
router.get('/dashboard', protect, requireGovernment, async (req, res) => {
    try {
        const userDepartment = req.user.department;

        // Build query based on user's department (if set)
        let departmentFilter = {};
        if (userDepartment && req.user.role !== 'admin') {
            departmentFilter = { category: userDepartment };
        }

        // Get all thresholds
        const thresholds = await DepartmentThreshold.getAllThresholds();
        const thresholdMap = {};
        thresholds.forEach(t => {
            thresholdMap[t.department] = t;
        });

        // Get current time for overdue calculations
        const now = new Date();

        // Fetch all relevant issues
        const allIssues = await Issue.find({
            ...departmentFilter,
            isActive: true
        }).select('title category status createdAt statusLogs severity priority location images');

        // Calculate statistics
        const stats = {
            total: allIssues.length,
            reported: 0,
            inProgress: 0,
            resolved: 0,
            closed: 0,
            overdue: {
                pending: [],
                inProgress: []
            },
            byDepartment: {},
            bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
            completionRate: 0
        };

        // Initialize department stats
        let departments = ['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'];

        // If Restricted to one department
        if (userDepartment && req.user.role !== 'admin' && req.user.role !== 'manager') {
            departments = [userDepartment];
        }

        departments.forEach(dept => {
            stats.byDepartment[dept] = {
                total: 0,
                reported: 0,
                inProgress: 0,
                resolved: 0,
                closed: 0,
                overdueCount: 0,
                threshold: thresholdMap[dept] || { maxPendingHours: 72, maxInProgressHours: 168 }
            };
        });

        // Process each issue
        allIssues.forEach(issue => {
            const dept = issue.category;
            const threshold = thresholdMap[dept] || { maxPendingHours: 72, maxInProgressHours: 168 };

            // Count by status
            stats[issue.status === 'in_progress' ? 'inProgress' : issue.status]++;
            if (stats.byDepartment[dept]) {
                stats.byDepartment[dept].total++;
                stats.byDepartment[dept][issue.status === 'in_progress' ? 'inProgress' : issue.status]++;
            }

            // Count by severity
            if (issue.severity && stats.bySeverity[issue.severity] !== undefined) {
                stats.bySeverity[issue.severity]++;
            }

            // Check for overdue issues
            const issueAge = (now - new Date(issue.createdAt)) / (1000 * 60 * 60); // age in hours

            if (issue.status === 'reported') {
                const maxHours = threshold.maxPendingHours || 72;
                if (issueAge > maxHours) {
                    const overdueIssue = {
                        _id: issue._id,
                        title: issue.title,
                        category: issue.category,
                        status: issue.status,
                        severity: issue.severity,
                        priority: issue.priority,
                        createdAt: issue.createdAt,
                        overdueBy: Math.round(issueAge - maxHours),
                        thresholdHours: maxHours,
                        location: issue.location
                    };
                    stats.overdue.pending.push(overdueIssue);
                    if (stats.byDepartment[dept]) {
                        stats.byDepartment[dept].overdueCount++;
                    }
                }
            } else if (issue.status === 'in_progress') {
                // Find when status changed to in_progress
                const inProgressLog = issue.statusLogs?.find(log => log.status === 'in_progress');
                const inProgressSince = inProgressLog?.changedAt || issue.createdAt;
                const inProgressAge = (now - new Date(inProgressSince)) / (1000 * 60 * 60);
                const maxHours = threshold.maxInProgressHours || 168;

                if (inProgressAge > maxHours) {
                    const overdueIssue = {
                        _id: issue._id,
                        title: issue.title,
                        category: issue.category,
                        status: issue.status,
                        severity: issue.severity,
                        priority: issue.priority,
                        createdAt: issue.createdAt,
                        inProgressSince: inProgressSince,
                        overdueBy: Math.round(inProgressAge - maxHours),
                        thresholdHours: maxHours,
                        location: issue.location
                    };
                    stats.overdue.inProgress.push(overdueIssue);
                    if (stats.byDepartment[dept]) {
                        stats.byDepartment[dept].overdueCount++;
                    }
                }
            }
        });

        // Calculate completion rate
        const completedCount = stats.resolved + stats.closed;
        stats.completionRate = stats.total > 0 ? Math.round((completedCount / stats.total) * 100) : 0;

        // Sort overdue issues by overdueBy (most overdue first)
        stats.overdue.pending.sort((a, b) => b.overdueBy - a.overdueBy);
        stats.overdue.inProgress.sort((a, b) => b.overdueBy - a.overdueBy);

        res.json({
            success: true,
            data: {
                stats,
                thresholds,
                userDepartment
            },
            message: 'Government dashboard statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Government dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/government/overdue-issues - Get detailed list of overdue issues
router.get('/overdue-issues', protect, requireGovernment, async (req, res) => {
    try {
        const { department, status, page = 1, limit = 20, sortBy = 'overdueBy' } = req.query;
        const userDepartment = req.user.department;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build department filter
        let departmentFilter = {};
        if (department && department !== 'all') {
            departmentFilter = { category: department };
        } else if (userDepartment && req.user.role !== 'admin') {
            departmentFilter = { category: userDepartment };
        }

        // Build status filter
        let statusFilter = {};
        if (status && status !== 'all') {
            statusFilter = { status };
        } else {
            statusFilter = { status: { $in: ['reported', 'in_progress'] } };
        }

        // Get thresholds
        const thresholds = await DepartmentThreshold.getAllThresholds();
        const thresholdMap = {};
        thresholds.forEach(t => {
            thresholdMap[t.department] = t;
        });

        const now = new Date();

        // Fetch all pending/in-progress issues
        const issues = await Issue.find({
            ...departmentFilter,
            ...statusFilter,
            isActive: true
        })
            .populate({
                path: 'reportedBy',
                select: 'name email profilePicture',
                strictPopulate: false
            })
            .populate({
                path: 'assignedTo',
                select: 'name email department',
                strictPopulate: false
            })
            .select('title description category status createdAt statusLogs severity priority location images assignedTo reportedBy')
            .sort({ createdAt: 1 }); // Oldest first

        // Filter and calculate overdue status
        const overdueIssues = issues.filter(issue => {
            const threshold = thresholdMap[issue.category] || { maxPendingHours: 72, maxInProgressHours: 168 };

            if (issue.status === 'reported') {
                const issueAge = (now - new Date(issue.createdAt)) / (1000 * 60 * 60);
                return issueAge > (threshold.maxPendingHours || 72);
            } else if (issue.status === 'in_progress') {
                const inProgressLog = issue.statusLogs?.find(log => log.status === 'in_progress');
                const inProgressSince = inProgressLog?.changedAt || issue.createdAt;
                const inProgressAge = (now - new Date(inProgressSince)) / (1000 * 60 * 60);
                return inProgressAge > (threshold.maxInProgressHours || 168);
            }
            return false;
        }).map(issue => {
            const threshold = thresholdMap[issue.category] || { maxPendingHours: 72, maxInProgressHours: 168 };
            let overdueBy = 0;
            let thresholdHours = 0;

            if (issue.status === 'reported') {
                const issueAge = (now - new Date(issue.createdAt)) / (1000 * 60 * 60);
                thresholdHours = threshold.maxPendingHours || 72;
                overdueBy = Math.round(issueAge - thresholdHours);
            } else if (issue.status === 'in_progress') {
                const inProgressLog = issue.statusLogs?.find(log => log.status === 'in_progress');
                const inProgressSince = inProgressLog?.changedAt || issue.createdAt;
                const inProgressAge = (now - new Date(inProgressSince)) / (1000 * 60 * 60);
                thresholdHours = threshold.maxInProgressHours || 168;
                overdueBy = Math.round(inProgressAge - thresholdHours);
            }

            return {
                ...issue.toObject(),
                overdueBy,
                thresholdHours,
                overdueDays: Math.floor(overdueBy / 24),
                overdueHours: overdueBy % 24
            };
        });

        // Sort based on sortBy parameter
        if (sortBy === 'overdueBy') {
            overdueIssues.sort((a, b) => b.overdueBy - a.overdueBy);
        } else if (sortBy === 'severity') {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            overdueIssues.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));
        } else if (sortBy === 'createdAt') {
            overdueIssues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        // Paginate
        const total = overdueIssues.length;
        const paginatedIssues = overdueIssues.slice(skip, skip + parseInt(limit));

        res.json({
            success: true,
            data: {
                issues: paginatedIssues,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                summary: {
                    totalOverdue: total,
                    pending: overdueIssues.filter(i => i.status === 'reported').length,
                    inProgress: overdueIssues.filter(i => i.status === 'in_progress').length
                }
            },
            message: 'Overdue issues retrieved successfully'
        });
    } catch (error) {
        console.error('Government overdue issues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching overdue issues',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/government/thresholds - Get all department thresholds
router.get('/thresholds', protect, requireGovernment, async (req, res) => {
    try {
        const thresholds = await DepartmentThreshold.getAllThresholds();

        res.json({
            success: true,
            data: thresholds,
            message: 'Department thresholds retrieved successfully'
        });
    } catch (error) {
        console.error('Get thresholds error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching thresholds',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT /api/government/thresholds/:department - Update department threshold
router.put('/thresholds/:department', protect, requireGovernment, async (req, res) => {
    try {
        const { department } = req.params;
        const { maxPendingHours, maxInProgressHours, description } = req.body;

        // Validate department
        const validDepartments = ['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions'];
        if (!validDepartments.includes(department)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department'
            });
        }

        // Validate hours
        if (maxPendingHours && maxPendingHours < 1) {
            return res.status(400).json({
                success: false,
                message: 'Max pending hours must be at least 1'
            });
        }

        if (maxInProgressHours && maxInProgressHours < 1) {
            return res.status(400).json({
                success: false,
                message: 'Max in-progress hours must be at least 1'
            });
        }

        // Update or create threshold
        const threshold = await DepartmentThreshold.findOneAndUpdate(
            { department },
            {
                department,
                maxPendingHours: maxPendingHours || 72,
                maxInProgressHours: maxInProgressHours || 168,
                description: description || '',
                updatedBy: req.user._id,
                isActive: true
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            data: threshold,
            message: `Threshold for ${department} updated successfully`
        });
    } catch (error) {
        console.error('Update threshold error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating threshold',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/government/department-stats - Get detailed stats per department
router.get('/department-stats', protect, requireGovernment, async (req, res) => {
    try {
        const { timeRange = '30' } = req.query; // Days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        // Get thresholds
        const thresholds = await DepartmentThreshold.getAllThresholds();
        const thresholdMap = {};
        thresholds.forEach(t => {
            thresholdMap[t.department] = t;
        });

        const now = new Date();

        const userDepartment = req.user.department;

        // Build match query
        let matchQuery = {
            createdAt: { $gte: startDate },
            isActive: true
        };

        if (userDepartment && req.user.role !== 'admin' && req.user.role !== 'manager') {
            matchQuery.category = userDepartment;
        }

        // Aggregate stats by department
        const departmentStats = await Issue.aggregate([
            {
                $match: matchQuery
            },
            {
                $group: {
                    _id: '$category',
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
                    closed: {
                        $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                    },
                    critical: {
                        $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
                    },
                    high: {
                        $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
                    },
                    avgResolutionTime: {
                        $avg: {
                            $cond: [
                                { $eq: ['$status', 'resolved'] },
                                { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000] }, // Hours
                                null
                            ]
                        }
                    }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        // Calculate overdue counts for each department
        const overdueStats = await Promise.all(
            departmentStats.map(async (dept) => {
                const threshold = thresholdMap[dept._id] || { maxPendingHours: 72, maxInProgressHours: 168 };

                // Count overdue 'reported' issues
                const overdueReportedDate = new Date(now - (threshold.maxPendingHours || 72) * 3600000);
                const overdueReported = await Issue.countDocuments({
                    category: dept._id,
                    status: 'reported',
                    createdAt: { $lt: overdueReportedDate },
                    isActive: true
                });

                // For in_progress, we'd need to check statusLogs - simplified count here
                const overdueInProgressDate = new Date(now - (threshold.maxInProgressHours || 168) * 3600000);
                const overdueInProgress = await Issue.countDocuments({
                    category: dept._id,
                    status: 'in_progress',
                    createdAt: { $lt: overdueInProgressDate },
                    isActive: true
                });

                return {
                    ...dept,
                    threshold: threshold,
                    overdueReported,
                    overdueInProgress,
                    totalOverdue: overdueReported + overdueInProgress,
                    completionRate: dept.total > 0 ? Math.round(((dept.resolved + dept.closed) / dept.total) * 100) : 0
                };
            })
        );

        res.json({
            success: true,
            data: {
                departments: overdueStats,
                timeRange: parseInt(timeRange)
            },
            message: 'Department statistics retrieved successfully'
        });
    } catch (error) {
        console.error('Department stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching department statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/government/escalate/:issueId - Escalate an overdue issue
router.post('/escalate/:issueId', protect, requireGovernment, async (req, res) => {
    try {
        const { issueId } = req.params;
        const { escalationNote, newPriority } = req.body;

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }

        // Update priority if specified
        if (newPriority) {
            issue.priority = newPriority;
        } else {
            // Auto-escalate priority
            const priorityOrder = ['low', 'medium', 'high', 'urgent'];
            const currentIndex = priorityOrder.indexOf(issue.priority);
            if (currentIndex < priorityOrder.length - 1) {
                issue.priority = priorityOrder[currentIndex + 1];
            }
        }

        // Add escalation to status logs
        issue.statusLogs = issue.statusLogs || [];
        issue.statusLogs.push({
            status: issue.status,
            changedAt: new Date(),
            changedBy: req.user._id,
            adminNote: `ESCALATED: ${escalationNote || 'Issue escalated due to being overdue'}`
        });

        await issue.save();

        // Create notification for assigned user/department
        if (issue.assignedTo) {
            await Notification.create({
                userId: issue.assignedTo,
                title: 'Issue Escalated',
                message: `Issue "${issue.title}" has been escalated. Priority: ${issue.priority}. ${escalationNote || ''}`,
                type: 'escalation',
                issueId: issue._id
            });
        }

        res.json({
            success: true,
            data: issue,
            message: 'Issue escalated successfully'
        });
    } catch (error) {
        console.error('Escalate issue error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while escalating issue',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/government/issues - Get all issues for the filtered department
router.get('/issues', protect, requireGovernment, async (req, res) => {
    try {
        const userDepartment = req.user.department;
        const { status, limit = 20, page = 1 } = req.query;

        // Build query based on user's department
        let query = { isActive: true };
        if (userDepartment && req.user.role !== 'admin') {
            query.category = userDepartment;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const issues = await Issue.find(query)
            .populate('reportedBy', 'name email')
            .populate('comments.user', 'name email')
            .populate('assignedTo', 'name email department')
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
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Government issues error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching government issues'
        });
    }
});

module.exports = router;
