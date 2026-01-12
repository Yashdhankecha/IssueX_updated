import React, { useState, useEffect } from 'react';
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
  Settings
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
      title: 'Welcome to IssueX',
      subtitle: 'Your Community, Your Voice',
      description: 'Join thousands of citizens making their communities better, one issue at a time.',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      features: [
        { icon: Shield, text: 'Secure & Private', description: 'Your data is protected with enterprise-grade security' },
        { icon: Users, text: 'Community Driven', description: 'Connect with neighbors and local authorities' },
        { icon: TrendingUp, text: 'Real-time Updates', description: 'Track issue progress and get notified of updates' }
      ]
    },
    {
      id: 2,
      title: 'Enable Location Access',
      subtitle: 'Find Issues Near You',
      description: 'We use your location to show relevant issues in your neighborhood and help you report problems accurately.',
      icon: MapPin,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      features: [
        { icon: Globe, text: 'Local Issues', description: 'See problems reported in your area' },
        { icon: Camera, text: 'Photo Reports', description: 'Add photos to make your reports more effective' },
        { icon: Bell, text: 'Smart Notifications', description: 'Get updates on issues you care about' }
      ]
    },
    {
      id: 3,
      title: 'You\'re All Set!',
      subtitle: 'Ready to Make a Difference',
      description: 'Your account is ready. Start exploring and reporting issues to improve your community.',
      icon: Award,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      features: [
        { icon: Heart, text: 'Community Impact', description: 'Help make your neighborhood better' },
        { icon: Star, text: 'Earn Recognition', description: 'Build your reputation as a community leader' },
        { icon: Zap, text: 'Quick & Easy', description: 'Report issues in just a few taps' }
      ]
    }
  ];

  const currentStepData = steps[currentStep - 1];

  const handleGetLocation = async () => {
    setIsLoading(true);
    try {
      await getCurrentLocation();
      toast.success('Location access enabled!');
      setCurrentStep(3);
    } catch (error) {
      toast.error('Location access denied. You can still use the app without location.');
      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    setCurrentStep(3);
  };

  const handleComplete = () => {
    toast.success('Welcome to IssueX! 🎉');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex items-center justify-center gap-8">
          {/* Left Side - Features Preview */}
          <motion.div
            className="hidden lg:flex flex-col space-y-6 w-80"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {currentStepData.features.map((feature, index) => (
              <motion.div
                key={feature.text}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${currentStepData.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <feature.icon className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{feature.text}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Center - Main Content */}
          <motion.div
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-md"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Step {currentStep} of {steps.length}</span>
                <span className="text-sm font-medium text-gray-900">{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 bg-gradient-to-r ${currentStepData.color} rounded-full`}
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
                  className={`w-20 h-20 bg-gradient-to-br ${currentStepData.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <currentStepData.icon className="text-white" size={32} />
                </motion.div>
                
                <motion.h1
                  className="text-3xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  {currentStepData.title}
                </motion.h1>
                
                <motion.p
                  className="text-lg font-medium text-gray-600 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {currentStepData.subtitle}
                </motion.p>
                
                <motion.p
                  className="text-gray-600 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    {currentStepData.features.map((feature, index) => (
                      <motion.div
                        key={feature.text}
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      >
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 text-sm">{feature.text}</div>
                          <div className="text-gray-600 text-xs">{feature.description}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <span>Get Started</span>
                    <ArrowRight size={18} />
                  </motion.button>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <motion.div
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Privacy First</span>
                    </div>
                    <p className="text-sm text-blue-600 leading-relaxed">
                      We only use your location to show relevant issues in your neighborhood. 
                      Your location is never shared with others and you can disable it anytime.
                    </p>
                  </motion.div>
                  
                  <div className="space-y-3">
                    <motion.button
                      onClick={handleGetLocation}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <MapPin size={18} />
                          <span>Enable Location Access</span>
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={handleSkip}
                      className="w-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      Skip for now
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <motion.div
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <CheckCircle size={20} className="text-green-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm">Account created successfully</div>
                        <div className="text-gray-600 text-xs">Your profile is ready to go</div>
                      </div>
                    </motion.div>
                    
                    {locationPermission === 'granted' && (
                      <motion.div
                        className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <CheckCircle size={20} className="text-blue-600" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 text-sm">Location access enabled</div>
                          <div className="text-gray-600 text-xs">You'll see local issues</div>
                        </div>
                      </motion.div>
                    )}
                    
                    <motion.div
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <CheckCircle size={20} className="text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900 text-sm">Ready to report issues</div>
                        <div className="text-gray-600 text-xs">Start making a difference</div>
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  <motion.button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Sparkles size={18} />
                    <span>Start Exploring</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep > 1 && (
              <motion.div
                className="mt-6 flex justify-between items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm font-medium"
                >
                  ← Back
                </button>
                
                <div className="flex space-x-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index + 1 === currentStep
                          ? `bg-gradient-to-r ${currentStepData.color}`
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage; 