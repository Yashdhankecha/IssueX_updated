const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
require('dotenv').config();

const POINTS = {
    REPORT_ISSUE: 10,
    VERIFIED_ISSUE: 5,
    RESOLVE_ISSUE: 20,
    CONFIRM_RESOLUTION: 10,
    UPVOTE_RECEIVED: 2,
    COMMENT: 3,
    SPAM_PENALTY: -15
};

const LEVELS = [
    { level: 1, minScore: 0 },
    { level: 2, minScore: 200 },
    { level: 3, minScore: 400 },
    { level: 4, minScore: 600 },
    { level: 5, minScore: 800 }
];

const calculateCalculatedLevel = (score) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].minScore) {
            return LEVELS[i].level;
        }
    }
    return 1;
};

const recalculateScores = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/issuex');
        console.log('Connected to DB');

        const users = await User.find({ role: 'user' });
        console.log(`Found ${users.length} users to process.`);

        for (const user of users) {
            console.log(`Processing user: ${user.email}...`);
            let score = 0;

            // 1. Reported Issues (+10)
            const reportedIssues = await Issue.find({ reportedBy: user._id });
            score += reportedIssues.length * POINTS.REPORT_ISSUE;
            console.log(`  - Reported ${reportedIssues.length} issues (+${reportedIssues.length * POINTS.REPORT_ISSUE})`);

            // 2. Verified Issues (+5) (checking for 'verified-by-ai' tag)
            const verifiedIssues = reportedIssues.filter(issue => issue.tags && issue.tags.includes('verified-by-ai'));
            score += verifiedIssues.length * POINTS.VERIFIED_ISSUE;
            if (verifiedIssues.length > 0) {
                console.log(`  - ${verifiedIssues.length} AI verified issues (+${verifiedIssues.length * POINTS.VERIFIED_ISSUE})`);
            }

            // 3. Resolved Issues (+20) (status is resolved or closed)
            const resolvedIssues = reportedIssues.filter(issue => issue.status === 'resolved' || issue.status === 'closed');
            score += resolvedIssues.length * POINTS.RESOLVE_ISSUE;
            if (resolvedIssues.length > 0) {
                console.log(`  - ${resolvedIssues.length} resolved issues (+${resolvedIssues.length * POINTS.RESOLVE_ISSUE})`);
            }

            // 4. Confirmed Resolution (+10) (status is closed, assuming user confirmed it)
            const confirmedIssues = reportedIssues.filter(issue => issue.status === 'closed');
            score += confirmedIssues.length * POINTS.CONFIRM_RESOLUTION;
            if (confirmedIssues.length > 0) {
                console.log(`  - ${confirmedIssues.length} confirmed closures (+${confirmedIssues.length * POINTS.CONFIRM_RESOLUTION})`);
            }

            // 5. Upvotes Received (+2)
            let upvotesReceived = 0;
            reportedIssues.forEach(issue => {
                if (issue.upvotes && Array.isArray(issue.upvotes)) {
                    // Filter out own upvotes? Logic in addPoints checked for it.
                    // Let's assume upvotes array contains user IDs.
                    // We should filter out where upvote ID == user._id
                    const validUpvotes = issue.upvotes.filter(id => id.toString() !== user._id.toString());
                    upvotesReceived += validUpvotes.length;
                }
            });
            score += upvotesReceived * POINTS.UPVOTE_RECEIVED;
            if (upvotesReceived > 0) {
                console.log(`  - Received ${upvotesReceived} upvotes (+${upvotesReceived * POINTS.UPVOTE_RECEIVED})`);
            }

            // 6. Comments Made (+3)
            // Find ALL issues where comments.user is this user
            const commentedIssues = await Issue.find({ "comments.user": user._id });
            let commentCount = 0;
            commentedIssues.forEach(issue => {
                if (issue.comments) {
                    commentCount += issue.comments.filter(c => c.user.toString() === user._id.toString()).length;
                }
            });
            score += commentCount * POINTS.COMMENT;
            if (commentCount > 0) {
                console.log(`  - Made ${commentCount} comments (+${commentCount * POINTS.COMMENT})`);
            }

            // Update User
            user.impactScore = score;
            user.level = calculateCalculatedLevel(score);
            await user.save();

            console.log(`  => Total Score: ${score}, Level: ${user.level}`);
        }

        console.log('--- SCORE RECALCULATION COMPLETE ---');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

recalculateScores();
