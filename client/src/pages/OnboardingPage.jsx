import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Users, 
  TrendingUp,
  Globe,
  Zap,
  Heart,
  Star,
  Award,
  Camera,
  Bell,
  Cpu,
  Radar,
  Terminal
} from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import toast from 'react-hot-toast';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { getCurrentLocation, locationPermission } = useLocation();

  const steps = [
    {
      id: 1,
      title: 'Initialize System',
      subtitle: 'Welcome to IssueX',
      description: 'Join the decentralized network of citizens monitoring and improving urban infrastructure.',
      icon: Terminal,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/50',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
      features: [
        { icon: Shield, text: 'Encrypted Data', description: 'Reports are anonymized and secured.' },
        { icon: Users, text: 'Civic Network', description: 'Collaborate with local operatives.' },
        { icon: TrendingUp, text: 'Live Telemetry', description: 'Real-time status updates on issues.' }
      ]
    },
    {
      id: 2,
      title: 'Geospatial Access',
      subtitle: 'Locate Sector Issues',
      description: 'Grant location permissions to identify anomalies in your immediate vicinity.',
      icon: Radar,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
      features: [
        { icon: Globe, text: 'Sector Scanning', description: 'Detect issues within your radius.' },
        { icon: Camera, text: 'Visual Evidence', description: 'Capture and upload visual data.' },
        { icon: Bell, text: 'Proximity Alerts', description: 'Receive tactical updates nearby.' }
      ]
    },
    {
      id: 3,
      title: 'System Ready',
      subtitle: 'Deploy to Field',
      description: 'Configuration complete. You are now authorized to submit reports and validate fixes.',
      icon: Cpu,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/50',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
      features: [
        { icon: Heart, text: 'Community Impact', description: 'Upgrade your living standards.' },
        { icon: Star, text: 'Reputation System', description: 'Earn rank for verified reports.' },
        { icon: Zap, text: 'Rapid Deployment', description: 'Submit issues in seconds.' }
      ]
    }
  ];

  const currentStepData = steps[currentStep - 1];

  const handleGetLocation = async () => {
    setIsLoading(true);
    try {
      await getCurrentLocation();
      toast.success('Coordinates Acquired');
      setCurrentStep(3);
    } catch (error) {
      toast.error('Location Signal Lost');
      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep(3);
  };

  const handleComplete = () => {
    toast.success('System Online');
    navigate('/');
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden font-sans text-white flex items-center justify-center">
      
      {/* Ambient Tech Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
         {/* Grid overlay */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl p-4 flex items-center justify-center gap-12 lg:gap-20">
        
        {/* Left Side - Features Preview (Desktop) */}
        <motion.div
          className="hidden lg:flex flex-col space-y-4 w-96"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {currentStepData.features.map((feature, index) => (
            <motion.div
              key={feature.text}
              className="bg-[#0B1221]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/5 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ x: 5 }}
            >
               <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom"></div>

              <div className="flex items-center space-x-4 relative z-10">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${currentStepData.color}`}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wide mb-1">{feature.text}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Center - Main Content */}
        <motion.div
          className="w-full max-w-md bg-[#0B1221]/90 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {/* Top Gloss */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3 font-mono text-xs text-slate-500">
                <span>SEQUENCE {currentStep} / {steps.length}</span>
                <span>{Math.round((currentStep / steps.length) * 100)}% COMPLETE</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-1.5 border border-white/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-8"
              >
                <motion.div
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 relative border-2 ${currentStepData.borderColor} bg-white/5 backdrop-blur-md ${currentStepData.glow}`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                   {/* Inner scanning effect */}
                   <div className="absolute inset-0 rounded-[22px] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent -translate-y-full animate-[scan_2s_ease-in-out_infinite]"></div>
                   </div>
                  <currentStepData.icon className={currentStepData.color} size={42} />
                </motion.div>
                
                <div className="space-y-2 mb-6">
                    <motion.h2 
                        className={`text-xs font-bold uppercase tracking-[0.2em] ${currentStepData.color}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        {currentStepData.title}
                    </motion.h2>
                    <motion.h1
                        className="text-3xl font-black text-white tracking-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                    {currentStepData.subtitle}
                    </motion.h1>
                </div>
                
                <motion.p
                  className="text-slate-400 leading-relaxed text-sm max-w-xs mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentStepData.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* Step-specific Actions */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <motion.button
                    onClick={handleNext}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-wide text-sm group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Execute Setup</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <motion.button
                    onClick={handleGetLocation}
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-wide text-sm disabled:opacity-50 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Radar size={18} className="animate-pulse" />
                        <span>Enable Tracking</span>
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={handleSkip}
                    className="w-full bg-transparent hover:bg-white/5 text-slate-400 hover:text-white py-4 px-6 rounded-xl font-bold transition-all uppercase tracking-wide text-xs border border-white/5 hover:border-white/10"
                  >
                    Override Location
                  </motion.button>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Status Checks */}
                  <div className="space-y-2 mb-6 border border-white/5 rounded-2xl p-4 bg-black/20">
                      <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">ACCOUNT STATUS</span>
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> VERIFIED</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-400">GPS MODULE</span>
                          {locationPermission === 'granted' ? (
                               <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> ACTIVE</span>
                          ) : (
                               <span className="text-amber-400 flex items-center gap-1"><Bell size={10} /> BYPASSED</span>
                          )}
                      </div>
                  </div>

                  <motion.button
                    onClick={handleComplete}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center space-x-2 uppercase tracking-wide text-sm group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles size={16} />
                    <span>Launch Interface</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Footer */}
            {currentStep > 1 && (
              <motion.div
                className="mt-8 flex justify-between items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={handleBack}
                  className="text-slate-500 hover:text-white transition-colors duration-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index + 1 === currentStep
                          ? 'bg-white scale-125 shadow-[0_0_5px_white]'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingPage;