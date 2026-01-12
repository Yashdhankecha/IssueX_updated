
try {
    const User = require('../models/User');
    console.log('User model loaded successfully');
} catch (error) {
    console.error('Error loading User model:', error);
}
