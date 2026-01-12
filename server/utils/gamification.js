const User = require('../models/User');

const POINTS = {
    REPORT_ISSUE: 10,
    VERIFIED_ISSUE: 5,
    RESOLVE_ISSUE: 20,
    CONFIRM_RESOLUTION: 10,
    UPVOTE_RECEIVED: 2, // When your issue gets upvoted (optional interpretation) or when YOU upvote? Prompt says "Issue upvoted by another user" -> triggers +2. Usually this means the *reporter* gets points.
    COMMENT: 3,
    SPAM_PENALTY: -15
};

const LEVELS = [
    { level: 1, minScore: 0, title: 'Civic Observer' },
    { level: 2, minScore: 200, title: 'Active Citizen' },
    { level: 3, minScore: 400, title: 'Civic Contributor' },
    { level: 4, minScore: 600, title: 'Community Champion' },
    { level: 5, minScore: 800, title: 'City Guardian' }
];

const calculateLevel = (score) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].minScore) {
            return LEVELS[i].level;
        }
    }
    return 1;
};

const addPoints = async (userId, actionType) => {
    try {
        const points = POINTS[actionType];
        if (!points) return; // Invalid action

        const user = await User.findById(userId);
        if (!user) return;

        user.impactScore += points;

        // Check for level up
        const newLevel = calculateLevel(user.impactScore);
        if (newLevel > user.level) {
            user.level = newLevel;
            // You could add a notification here later
        }

        await user.save();
        return { newScore: user.impactScore, newLevel: user.level };
    } catch (error) {
        console.error('Error adding points:', error);
    }
};

module.exports = {
    POINTS,
    addPoints
};
