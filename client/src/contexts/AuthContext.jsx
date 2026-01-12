import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // const navigate = useNavigate(); // Removed to avoid circular dependency if AuthProvider is outside Router, but here it is inside. Kept if needed.

  // Helper to get cached user safely
  const tryGetCachedUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Optimistic UI: Set user immediately from LocalStorage or Firebase data
          // This unblocks the UI ("loading too much") while the server wakes up
          const cachedUser = tryGetCachedUser();
          const tempUser = cachedUser || {
              _id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email,
              role: 'user', // Assume user initially
              photoURL: firebaseUser.photoURL
          };
          
          setUser(tempUser);
          setIsAdmin(tempUser.role === 'admin');
          setLoading(false); // <--- UNBLOCK UI IMMEDIATELY

          // Fetch fresh user data from backend in background
          const response = await api.post('/api/auth/login'); 
          
          if (response.data.success) {
            const userData = response.data.data.user;
            
            // Ensures we have the latest gamification stats
            console.log('User data loaded:', userData.impactScore);

            if (!firebaseUser.emailVerified) {
                // Just a toast, don't block
                toast('Please verify your email address.', { icon: '📧', id: 'email-verification-warning' });
            }

            setUser(userData);
            setIsAdmin(userData.role === 'admin');
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          
           if (error.response?.status === 401) {
               const errorMessage = error.response?.data?.message || '';
               if (errorMessage.includes('User not found')) {
                   console.log('User not found in MongoDB yet. Waiting for registration...');
               } else {
                   toast.error('Session expired. Please login again.');
                   signOut(auth);
                   setUser(null);
                   localStorage.removeItem('token');
                   localStorage.removeItem('user');
               }
           } else {
               // Silent fail for network/server errors if we have tempUser
               console.log('Running in offline/optimistic mode');
           }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getFriendlyErrorMessage = (error) => {
    // Handle specific Firebase Auth error codes
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          return 'Invalid email or password.';
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters.';
        case 'auth/too-many-requests':
          return 'Too many failed login attempts. Please reset your password or try again later.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.';
        case 'auth/popup-closed-by-user':
          return 'Sign in was cancelled.';
        default:
          // Clean up generic Firebase errors, e.g., "Firebase: Error (auth/some-error)."
          // Extracts "some-error" or keeps specific message parts if readable
          // But usually better to just show a generic message for unknown codes to avoid exposing internals to non-devs
          return 'Authentication failed. Please try again.'; 
      }
    }
    
    // Handle weird string formats if they slip through
    if (typeof error === 'string') return error;

    // Backend or other errors
    return error.response?.data?.message || error.message || 'An unexpected error occurred.';
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back to IssueX!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = getFriendlyErrorMessage(error);
      toast.error(message);
      setLoading(false);
      return { success: false, error: message };
    } 
    // Do NOT set loading to false here on success. 
    // Let onAuthStateChanged handle it to ensure backend user data is fetched before we show the UI.
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Starting registration flow:', { email: userData.email, name: userData.fullName });
      
      // 1. Create user in Firebase
      console.log('Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      console.log('Firebase user created:', firebaseUser.uid);
      
      // Send verification email
      console.log('Sending verification email...');
      await sendEmailVerification(firebaseUser);

      console.log('Getting ID token...');
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('token', token);
      
      // 2. Set API header for the subsequent request
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Create user in MongoDB
      console.log('Sending registration request to backend...');
      const response = await api.post('/api/auth/register', {
        name: userData.fullName || userData.name,
        email: userData.email.toLowerCase(),
      });
      console.log('Registration response:', response.data);

      if (response.data.success) {
         const newUser = response.data.data.user;
         setUser(newUser); // Manually set user state since onAuthStateChanged might have missed it
         localStorage.setItem('user', JSON.stringify(newUser));
         toast.success('Account created! Please check your email to verify your account.');
         setLoading(false);
         return { success: true };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
       // If MongoDB creation fails, we should probably delete the Firebase user to avoid orphaned accounts
       // or just let them retry.
      console.error('Registration error:', error);
      if (error.response) {
          console.error('Registration server error:', error.response.data);
      }
      
      const message = getFriendlyErrorMessage(error);
      toast.error(message);
      setLoading(false);
      return { success: false, error: message };
    } 
    // Similar to login, let onAuthStateChanged handle loading=false on success
  };


  // Alias for backward compatibility if names differ
  const signUp = register; 

  const verifyEmail = async (email, otp) => {
     // Firebase handles email verification differently (link based)
     // kept for interface compatibility
      toast.success('Feature not implemented in Firebase version yet');
      return { success: true };
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // State cleanup handled by onAuthStateChanged
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/api/auth/profile', updates);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await api.put('/api/auth/preferences', preferences);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Preferences updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update preferences';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      const message = getFriendlyErrorMessage(error);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, newPassword) => {
    // Firebase handles reset via email link, this function might be legacy
    // Unless we use confirmPasswordReset
    toast.error('Please use the link sent to your email to reset password.');
    return { success: false, message: 'Use email link' };
  };
  
  // checkAuthStatus is now irrelevant as onAuthStateChanged handles it, 
  // but kept for compatibility if called directly
  const checkEmailVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        // Optional: Update local user state if needed, but usually we just return status
        // You might want to update the 'user' state to remove any "unverified" flags if you had them
      }
      return auth.currentUser.emailVerified;
    }
    return false;
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    register,
    signUp,
    verifyEmail,
    logout,
    updateUser,
    updateProfile,
    updatePreferences,
    forgotPassword,
    resetPassword,
    checkEmailVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 