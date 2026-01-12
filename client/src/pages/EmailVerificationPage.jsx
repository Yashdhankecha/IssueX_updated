import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, RefreshCw, LogOut, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { user, logout, checkEmailVerification, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if no user logged in
  useEffect(() => {
    // Check if we have ANY indication of a user (Context user, Firebase User, or Passed State)
    const hasUser = user || auth.currentUser || location.state?.email;
    
    if (!loading && !hasUser) {
      toast.error("Please login to verify your email");
      navigate('/login');
    }
  }, [user, loading, navigate, location]);

  const email = location.state?.email || user?.email || auth.currentUser?.email;

  const handleCheckVerification = async () => {
    setIsLoading(true);
    try {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        toast.success('Email verified successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Email not verified yet. Please check your inbox.');
      }
    } catch (error) {
      console.error('Verification check error:', error);
      toast.error('Failed to check verification status.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent!');
    } catch (error) {
        // Firebase throws error if too many requests
        if (error.code === 'auth/too-many-requests') {
            toast.error('Too many requests. Please wait a moment.');
        } else {
            console.error('Resend error:', error);
            toast.error('Failed to send email.');
        }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-60 h-60 bg-indigo-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [-360, -180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {loading ? (
        <div className="relative z-10 p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl flex flex-col items-center">
             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-600 font-medium">Checking authentication...</p>
        </div>
      ) : (
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Mail className="w-10 h-10 text-blue-600" />
              <motion.div
                className="absolute -right-2 -bottom-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                 <Shield className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="text-center mb-8">
            <motion.h1 
                className="text-2xl font-bold text-slate-900 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Verify your email
            </motion.h1>
            <motion.p 
                className="text-slate-600 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                We've sent a verification link to 
                <span className="font-semibold text-slate-800 block mt-1">{email}</span>
            </motion.p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <motion.button
              onClick={handleCheckVerification}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
               {isLoading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                   <>
                    <span>I've Verified My Email</span>
                    <ArrowRight size={18} />
                   </>
               )}
            </motion.button>

            <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full py-3 px-6 rounded-xl font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
            >
                {isResending ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                    <RefreshCw size={18} />
                )}
                <span>Resend Verification Email</span>
            </button>
          </div>

          {/* Footer - Logout */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-4">Wrong email address?</p>
            <button
                onClick={logout}
                className="text-slate-400 hover:text-slate-600 font-medium text-sm flex items-center justify-center space-x-1 mx-auto transition-colors"
            >
                <LogOut size={14} />
                <span>Log out</span>
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </div>
  );
};

export default EmailVerificationPage;
