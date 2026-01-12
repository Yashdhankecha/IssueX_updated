import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-60 h-60 bg-indigo-200 rounded-full opacity-20"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-6xl flex items-center justify-center gap-8">
          {/* Features Preview - Left Side */}
          <motion.div
            className="hidden lg:flex flex-col space-y-6 w-80"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 text-lg mb-2">Secure Reset</h3>
              <p className="text-slate-600 text-sm">Your password reset is protected with enterprise-grade security measures.</p>
            </motion.div>
            
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 text-lg mb-2">Quick Delivery</h3>
              <p className="text-slate-600 text-sm">Reset instructions are sent instantly to your verified email address.</p>
            </motion.div>
            
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 text-lg mb-2">Easy Recovery</h3>
              <p className="text-slate-600 text-sm">Get back to fixing your community issues in just a few simple steps.</p>
            </motion.div>
          </motion.div>

          {/* Success Form - Right Side */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 w-full max-w-md"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle className="text-green-600" size={28} />
              </motion.div>
              
              <motion.h1
                className="text-2xl font-bold text-slate-900 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Check Your Email
              </motion.h1>
              
              <motion.p
                className="text-slate-600 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </motion.p>
            </motion.div>
            
            <motion.div
              className="bg-blue-50 p-4 rounded-xl mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> If you don't see the email, check your spam folder. The reset link will expire in 24 hours.
              </p>
            </motion.div>
            
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                Back to Login
              </Link>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 py-3 px-6 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                Send Another Email
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-60 h-60 bg-indigo-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex items-center justify-center gap-8">
        {/* Features Preview - Left Side */}
        <motion.div
          className="hidden lg:flex flex-col space-y-6 w-80"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 text-lg mb-2">Secure Reset</h3>
            <p className="text-slate-600 text-sm">Your password reset is protected with enterprise-grade security measures.</p>
          </motion.div>
          
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 text-lg mb-2">Quick Delivery</h3>
            <p className="text-slate-600 text-sm">Reset instructions are sent instantly to your verified email address.</p>
          </motion.div>
          
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 text-lg mb-2">Easy Recovery</h3>
            <p className="text-slate-600 text-sm">Get back to fixing your community issues in just a few simple steps.</p>
          </motion.div>
        </motion.div>

        {/* Forgot Password Form - Right Side */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 w-full max-w-md"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link
                to="/login"
                className="flex items-center text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Login
              </Link>
            </motion.div>
            
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="text-white" size={28} />
            </motion.div>
            
            <motion.h1
              className="text-2xl font-bold text-slate-900 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Forgot Password?
            </motion.h1>
            
            <motion.p
              className="text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Enter your email address and we'll send you a link to reset your password.
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Email */}
            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email address"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.div
                    className="flex items-center space-x-2 mt-2 text-red-600 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle size={14} />
                    <span>{errors.email.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className="flex items-center justify-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    className="flex items-center justify-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Mail size={18} />
                    <span>Send Reset Link</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          {/* Additional Info */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <p className="text-sm text-slate-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            className="mt-6 p-4 bg-blue-50 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  For your security, we'll only send password reset emails to verified email addresses. 
                  If you don't receive an email within a few minutes, check your spam folder.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 