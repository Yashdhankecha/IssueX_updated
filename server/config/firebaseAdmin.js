const admin = require('firebase-admin');
const path = require('path');

try {
    // Check if serviceAccountKey.json exists
    const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

    // Initialize Firebase Admin SDK
    // You need to download the service account key from Firebase Console -> Project Settings -> Service Accounts
    // and save it as 'serviceAccountKey.json' in the server directory.
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    console.log('Please make sure you have "serviceAccountKey.json" in the server directory.');
    console.log('You can download it from Firebase Console -> Project Settings -> Service Accounts');
}

module.exports = admin;
