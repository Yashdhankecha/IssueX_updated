import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Mail, AlertCircle, CheckCircle, Send, ArrowLeft, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await resetPassword(data.email);
      if (result.success) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await resetPassword(getValues('email'));
      toast.success('Reset link sent again!');
    } catch (error) {
      console.error('Resend error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
      </div>

      {/* Form */}
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl" />
          
          <div className="relative bg-[#0B1221]/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
            
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center gap-3 mb-8">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-[#0F172A] rounded-xl w-full h-full flex items-center justify-center border border-white/10">
                  <Zap size={24} className="text-blue-400" fill="currentColor" />
                </div>
              </div>
              <span className="font-bold text-2xl">IssueX</span>
            </Link>

            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-slate-400 text-sm">Enter your email to reset</p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300 ml-1">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })}
                          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-slate-600 transition-all outline-none"
                          placeholder="your@email.com"
                        />
                      </div>
                      <AnimatePresence>
                        {errors.email && (
                          <motion.p className="text-red-400 text-xs flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <AlertCircle size={12} /> {errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={20} />
                          <span>Send Reset Link</span>
                        </>
                      )}
                    </motion.button>
                  </form>

                  <p className="mt-6 text-center">
                    <Link to="/login" className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-2">
                      <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                    <CheckCircle className="text-green-400" size={32} />
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                  <p className="text-slate-400 mb-1 text-sm">Reset link sent to</p>
                  <p className="text-white font-medium mb-6">{getValues('email')}</p>

                  <div className="space-y-3">
                    <motion.button
                      onClick={handleResend}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> Resend Link
                    </motion.button>

                    <Link to="/login">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold border border-white/10">
                        Back to Sign In
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;