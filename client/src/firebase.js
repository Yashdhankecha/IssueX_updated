// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA75AOiK6wHAEI4MtkE4TFmEajN5YiDpks",
    authDomain: "ssuex-8a30f.firebaseapp.com",
    projectId: "ssuex-8a30f",
    storageBucket: "ssuex-8a30f.firebasestorage.app",
    messagingSenderId: "98863819832",
    appId: "1:98863819832:web:d5523decb573a41a2a8acd",
    measurementId: "G-E9JH1WMS2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth, analytics };