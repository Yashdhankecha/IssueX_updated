const User = require('../models/User');

/**
 * Finds the appropriate Government Department user for a given issue category.
 * @param {string} category - The issue category (e.g., 'roads', 'water').
 * @returns {Promise<User|null>} - The assigned user or null if not found.
 */
const assignIssueToDepartment = async (category) => {
    try {
        if (!category) return null;

        // Find a user with role 'government' and the matching department
        const govUser = await User.findOne({
            role: 'government',
            department: category,
            isActive: true
        });

        return govUser;
    } catch (error) {
        console.error('Auto-assignment error:', error);
        return null;
    }
};

module.exports = { assignIssueToDepartment };
