const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/issuex');
        console.log('Connected to DB');

        const users = await User.find({}, 'name email role impactScore level');
        console.log('--- USER DATA DEBUG ---');
        users.forEach(u => {
            console.log(`${u.email} (${u.role}): Score=${u.impactScore}, Level=${u.level}, ScoreType=${typeof u.impactScore}`);
        });
        console.log('-----------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugUsers();
