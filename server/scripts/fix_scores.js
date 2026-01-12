const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const fixScores = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/issuex');
        console.log('Connected to DB');

        const users = await User.find({ role: 'user' });
        console.log(`Found ${users.length} users to check.`);

        for (const user of users) {
            if (!user.impactScore) {
                // Random score between 150 and 850 for testing
                const randomScore = Math.floor(Math.random() * (850 - 150 + 1) + 150);
                user.impactScore = randomScore; // Set random score

                // Calculate level
                const LEVELS = [
                    { level: 1, minScore: 0 },
                    { level: 2, minScore: 200 },
                    { level: 3, minScore: 400 },
                    { level: 4, minScore: 600 },
                    { level: 5, minScore: 800 }
                ];

                let level = 1;
                for (let i = LEVELS.length - 1; i >= 0; i--) {
                    if (randomScore >= LEVELS[i].minScore) {
                        level = LEVELS[i].level;
                        break;
                    }
                }
                user.level = level;

                await user.save();
                console.log(`Updated user ${user.email}: Score=${randomScore}, Level=${level}`);
            }
        }

        console.log('--- USER DATA AFTER FIX ---');
        const updatedUsers = await User.find({ role: 'user' }, 'name email impactScore level');
        updatedUsers.forEach(u => {
            console.log(`${u.email}: Score=${u.impactScore}, Level=${u.level}`);
        });
        console.log('---------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixScores();
