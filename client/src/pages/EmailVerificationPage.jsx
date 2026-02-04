import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Send, Loader2, Clock, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';

const EmailVerificationPage = () => {
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    if (auth.currentUser.emailVerified) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Email sent!');
      setCountdown(60);
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        toast.success('Email verified!');
        navigate('/dashboard');
      } else {
        toast.error('Not verified yet. Check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to check');
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay" />
      </div>

      {/* Content */}
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

            {/* Icon */}
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <Mail className="text-blue-400" size={32} />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
              <p className="text-slate-400 text-sm mb-1">We sent a link to</p>
              <p className="text-white font-medium">{auth.currentUser?.email}</p>
            </div>

            {/* Steps */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/5">
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">1</span>
                  Check your inbox
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">2</span>
                  Click the verification link
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">3</span>
                  Come back and click below
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                onClick={handleCheckVerification}
                disabled={isChecking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 border border-green-500/20 disabled:opacity-50"
              >
                {isChecking ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                <span>I've Verified</span>
              </motion.button>

              <motion.button
                onClick={handleResendEmail}
                disabled={isResending || countdown > 0}
                whileHover={{ scale: countdown > 0 ? 1 : 1.02 }}
                whileTap={{ scale: countdown > 0 ? 1 : 0.98 }}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 border ${
                  countdown > 0 ? 'bg-white/5 text-slate-500 border-white/5' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                }`}
              >
                {isResending ? <Loader2 size={18} className="animate-spin" /> : countdown > 0 ? <Clock size={18} /> : <Send size={18} />}
                <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}</span>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-sm">
              <button onClick={handleLogout} className="text-slate-400 hover:text-white">Sign Out</button>
              <span className="text-slate-700">•</span>
              <Link to="/login" className="text-blue-400 hover:text-blue-300">Back to Login</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
