const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Mock Rewards Data
const REWARDS = [
    { id: 'r1', title: 'Coffee Discount', description: '20% off at Local Cafe', cost: 100, type: 'coupon' },
    { id: 'r2', title: 'Bus Pass Credit', description: '$5 Credit for Public Transport', cost: 300, type: 'credit' },
    { id: 'r3', title: 'Utility Bill Cashback', description: '5% Cashback on Water Bill', cost: 550, type: 'cashback' },
    { id: 'r4', title: 'Civic Hero Badge', description: 'Digital Certificate of Appreciation', cost: 800, type: 'certificate' },
    { id: 'r5', title: 'City Guardian Access', description: 'Priority Issue Review Access', cost: 1200, type: 'privilege' }
];

// @desc    Get Leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 10, area } = req.query;

        let query = { role: 'user' };
        if (area) {
            // Assuming user.location or department might be used, but let's stick to global for now
            // or user.location field if it stores city/area strings
        }

        const leaders = await User.find(query)
            .sort({ impactScore: -1 })
            .limit(parseInt(limit))
            .select('name profilePicture impactScore level badges');

        res.json({
            success: true,
            data: leaders
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get Rewards (with user status)
// @route   GET /api/gamification/rewards
// @access  Private
router.get('/rewards', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const userRewards = REWARDS.map(reward => {
            const isRedeemed = user.redeemedRewards.some(r => r.rewardId === reward.id);
            const isUnlocked = user.impactScore >= reward.cost;

            return {
                ...reward,
                isUnlocked,
                isRedeemed,
                progress: Math.min(100, (user.impactScore / reward.cost) * 100)
            };
        });

        res.json({
            success: true,
            data: userRewards,
            userScore: user.impactScore,
            userLevel: user.level
        });
    } catch (error) {
        console.error('Rewards error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Redeem Reward
// @route   POST /api/gamification/redeem
// @access  Private
router.post('/redeem', protect, async (req, res) => {
    try {
        const { rewardId } = req.body;
        const reward = REWARDS.find(r => r.id === rewardId);

        if (!reward) {
            return res.status(404).json({ success: false, message: 'Reward not found' });
        }

        const user = await User.findById(req.user.id);

        // Check if unlocked
        if (user.impactScore < reward.cost) {
            return res.status(400).json({ success: false, message: 'Not enough points to unlock this reward' });
        }

        // Check if already redeemed
        if (user.redeemedRewards.some(r => r.rewardId === rewardId)) {
            return res.status(400).json({ success: false, message: 'Reward already redeemed' });
        }

        // "Redeem" - In this model, we don't deduct points, we just issue the code.
        // If you wanted to deduct points: user.impactScore -= reward.cost; 
        // But then leveling down would happen. Let's assume points are permanent score.

        const code = Math.random().toString(36).substring(7).toUpperCase();

        user.redeemedRewards.push({
            rewardId,
            code,
            redeemedAt: new Date()
        });

        await user.save();

        res.json({
            success: true,
            message: 'Reward redeemed successfully',
            code: code,
            reward
        });

    } catch (error) {
        console.error('Redeem error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
