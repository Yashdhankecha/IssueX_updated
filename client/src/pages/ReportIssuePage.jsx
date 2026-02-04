import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft, MapPin, Camera, X, CheckCircle,
  Loader2, Sparkles, AlertTriangle, Zap, Droplets,
  Truck, Trees, Shield, ChevronRight, Edit3, Lock,
  Info
} from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const { createIssue } = useIssue();
  const { selectedLocation, getAddressFromCoords } = useLocation();

  // States
  const [step, setStep] = useState('upload'); // 'upload', 'analyzing', 'review'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [aiData, setAiData] = useState(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const selectedCategory = watch('category');

  // Categories Config (Dark Theme Colors)
  const categories = [
    { value: 'roads', label: 'Road Grid', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { value: 'lighting', label: 'Power Grid', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    { value: 'water', label: 'Hydraulics', icon: Droplets, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { value: 'cleanliness', label: 'Sanitation', icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { value: 'obstructions', label: 'Obstructions', icon: Trees, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { value: 'safety', label: 'Security', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  // Address lookup
  useEffect(() => {
    if (selectedLocation) {
      getAddressFromCoords(selectedLocation.lat, selectedLocation.lng)
        .then(address => setLocationAddress(address));
    }
  }, [selectedLocation]);

  // Handle File Drop
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      analyzeImage(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1
  });

  // AI Analysis Function
  const analyzeImage = async (file) => {
    setStep('analyzing');
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Simulate "scanning" feeling with minimum delay
      const minDelay = new Promise(resolve => setTimeout(resolve, 2000));
      const request = api.post('/api/issues/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const [response] = await Promise.all([request, minDelay]);

      if (response.data.success) {
        const data = response.data.data;

        // CHECK: is relevant?
        if (data.is_relevant === false) {
          toast.error('No civic anomaly detected. Upload valid evidence.', {
            icon: '🚫',
            style: { background: '#1e293b', color: '#fff' }
          });
          setStep('upload');
          return;
        }

        // CHECK: proper issue type
        const validCategories = categories.map(c => c.value);
        if (data.category && !validCategories.includes(data.category)) {
          toast.error('Anomaly classification error. Manual entry required.', {
            icon: '⚠️',
            style: { background: '#1e293b', color: '#fff' }
          });
          setStep('upload');
          return;
        }

        setAiData(data);
        // Pre-fill form
        setValue('title', data.title);
        setValue('description', data.description);
        setValue('category', data.category || 'roads');
        setValue('severity', data.severity || 'medium');
        setStep('review');
        toast.success('Analysis Complete.', { icon: '✨', style: { background: '#1e293b', color: '#fff' } });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('AI Link failed. Manual input required.', { style: { background: '#1e293b', color: '#fff' } });
      setStep('review'); // Fallback to manual entry
    }
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error('Geospatial Data Missing!', { style: { background: '#1e293b', color: '#fff' } });
      return;
    }

    setIsSubmitting(true);
    try {
      const issueData = {
        ...data,
        location: {
          ...selectedLocation,
          address: locationAddress
        },
        images: [imageFile],
        tags: aiData?.tags || []
      };

      const result = await createIssue(issueData);
      if (result.success) {
        toast.success('Issue Logged Successfully!', { style: { background: '#1e293b', color: '#fff' } });
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Submission Failed.', { style: { background: '#1e293b', color: '#fff' } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative flex flex-col font-sans text-white overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#030712]/50 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-white text-lg tracking-wide uppercase">New Report</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 pb-24 relative z-10 flex flex-col justify-center box-border pt-8">
        <AnimatePresence mode="wait">

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Identify Anomaly</h1>
                <p className="text-slate-400">Upload visual evidence for AI diagnostic analysis.</p>
              </div>

              <div
                {...getRootProps()}
                className={`w-full aspect-[4/5] max-h-[500px] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden bg-[#0B1221]/80 backdrop-blur-xl shadow-2xl ${
                  isDragActive ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : 'border-white/10 hover:border-blue-400/50 hover:bg-white/5'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <Camera size={40} className="text-white" />
                </div>
                <p className="font-bold text-white text-xl">Tap to Initialize Sensor</p>
                <p className="text-sm text-slate-500 mt-2">or upload from data bank</p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ANALYZING */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-10 w-full px-4 min-h-[50vh]"
            >
              <div className="relative w-full max-w-[300px] aspect-square rounded-3xl overflow-hidden shadow-2xl mb-8 border border-blue-500/30 mx-auto bg-black">
                <img src={imagePreview} alt="Analyzing" className="w-full h-full object-cover opacity-50" />
                
                {/* Scanner Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 border-2 border-blue-500/50 rounded-3xl"></div>
                
                {/* Scanning Beam */}
                <motion.div
                  className="absolute inset-x-0 h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                
                {/* Corner Markers */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/40 backdrop-blur-md p-4 rounded-full border border-white/10">
                    <Sparkles size={40} className="text-blue-400 animate-pulse" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-wide">PROCESSING...</h2>
              <div className="flex flex-col gap-1 items-center">
                   <p className="text-sm md:text-base text-blue-400 font-mono">{'>>'} ANALYZING STRUCTURAL INTEGRITY</p>
                   <p className="text-sm md:text-base text-blue-400 font-mono delay-75">{'>>'} CLASSIFYING HAZARD TYPE</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW & EDIT */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              {/* Image Header */}
              <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10 w-full group">
                <img src={imagePreview} alt="Issue" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 px-3 py-1 rounded-full text-blue-300 text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} className="text-blue-400" /> AI VERIFIED
                </div>
                <button
                  onClick={() => setStep('upload')}
                  className="absolute bottom-3 right-3 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">

                {/* AI Suggestions Section */}
                <div className="bg-[#0B1221]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-2xl border border-white/10 space-y-6 w-full">

                  {/* Title & Desc */}
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1 mb-1 block">Title</label>
                      <input
                        {...register('title', { required: true })}
                        className="w-full text-lg sm:text-xl font-bold text-white bg-transparent border-b border-white/10 py-2 focus:border-blue-500 focus:outline-none placeholder:text-slate-600 break-words transition-colors"
                        placeholder="Issue Title"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1 mb-1 block">Description</label>
                      <textarea
                        {...register('description', { required: true })}
                        rows={3}
                        className="w-full text-sm sm:text-base text-slate-300 bg-white/5 rounded-2xl p-4 border border-white/5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 focus:outline-none resize-none transition-all"
                        placeholder="Describe the anomaly..."
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1 mb-3 block">Category Classification</label>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {categories.map(cat => (
                        <label
                          key={cat.value}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all w-full ${selectedCategory === cat.value
                            ? `${cat.bg} ${cat.border} ring-1 ring-white/20`
                            : 'bg-white/5 border-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'
                            }`}
                        >
                          <input type="radio" value={cat.value} {...register('category')} className="hidden" />
                          <cat.icon size={24} className={`${cat.color} mb-1`} />
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Display */}
                  <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-blue-400 uppercase">Geospatial Tag</p>
                      <input
                        type="text"
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        className="w-full text-sm font-bold text-slate-200 bg-transparent border-b border-blue-500/30 focus:border-blue-400 focus:outline-none placeholder-blue-500/30 py-1"
                        placeholder="Enter coordinates/address..."
                      />
                    </div>
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 w-full border border-white/5">
                    <input
                      type="checkbox"
                      id="anonymous"
                      {...register('anonymous')}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-white/20 bg-black/50"
                    />
                    <label htmlFor="anonymous" className="flex-1 cursor-pointer">
                      <span className="block text-sm font-bold text-white flex items-center gap-2">
                         <Lock size={14} className="text-slate-400"/> Encrypt Identity
                      </span>
                      <span className="block text-xs text-slate-400">Report submits as "Anonymous Operative"</span>
                    </label>
                  </div>

                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:scale-100 border border-white/10"
                >
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Transmit Report'}
                </button>

              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReportIssuePage;