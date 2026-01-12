import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft, MapPin, Camera, X, CheckCircle,
  Loader2, Sparkles, AlertTriangle, Zap, Droplets,
  Truck, Trees, Shield, ChevronRight, Edit3
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

  // Categories Config
  const categories = [
    { value: 'roads', label: 'Roads', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'lighting', label: 'Lights', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { value: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { value: 'cleanliness', label: 'Garbage', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    { value: 'obstructions', label: 'Obstruction', icon: Trees, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
    { value: 'safety', label: 'Safety', icon: Shield, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
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
          toast.error('No civic issue detected in this image. Please upload a valid issue photo.', {
            icon: '🚫',
            duration: 4000
          });
          setStep('upload');
          return;
        }

        // CHECK: proper issue type
        const validCategories = categories.map(c => c.value);
        if (data.category && !validCategories.includes(data.category)) {
          toast.error('Issue not belongs to any listed issue/department', {
            icon: '🚫',
            duration: 4000
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
        toast.success('AI Analysis Complete!', { icon: '✨' });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('AI Analysis failed, please fill details manually.');
      setStep('review'); // Fallback to manual entry
    }
  };

  const onSubmit = async (data) => {
    if (!selectedLocation) {
      toast.error('Location is missing!');
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
        toast.success('Issue Reported Successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col font-sans">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-3xl animate-pulse pointer-events-none" />

      {/* Navbar */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/50 transition-colors">
          <ArrowLeft size={24} className="text-slate-800" />
        </button>
        <span className="font-bold text-slate-800 text-lg">Report Issue</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 w-full max-w-[100vw] px-6 pb-24 relative z-10 flex flex-col justify-center box-border">
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
                <h1 className="text-3xl font-bold text-slate-900">What did you spot?</h1>
                <p className="text-slate-500">Upload a photo and let our AI handle the rest.</p>
              </div>

              <div
                {...getRootProps()}
                className={`w-full aspect-[4/5] max-h-[500px] border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden bg-white shadow-xl ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-slate-200 hover:border-blue-400'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Camera size={40} className="text-blue-600" />
                </div>
                <p className="font-bold text-slate-700 text-xl">Tap to snap a photo</p>
                <p className="text-sm text-slate-400 mt-2">or upload from gallery</p>
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
              <div className="relative w-full max-w-[300px] aspect-square rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-white mx-auto">
                <img src={imagePreview} alt="Analyzing" className="w-full h-full object-cover" />
                {/* Scanner Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
                  animate={{ top: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                    <Sparkles size={40} className="text-white animate-pulse" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Analyzing Image...</h2>
              <p className="text-sm md:text-base text-slate-500 animate-pulse px-4">Detecting issue type and severity</p>
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
              <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-lg border border-white w-full">
                <img src={imagePreview} alt="Issue" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                  <Sparkles size={12} className="text-yellow-400" /> AI Generated
                </div>
                <button
                  onClick={() => setStep('upload')}
                  className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">

                {/* AI Suggestions Section */}
                <div className="bg-white p-5 sm:p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 space-y-6 border border-slate-100 w-full">

                  {/* Title & Desc */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Title</label>
                      <input
                        {...register('title', { required: true })}
                        className="w-full text-lg sm:text-xl font-bold text-slate-900 bg-transparent border-b border-slate-200 py-2 focus:border-blue-500 focus:outline-none placeholder:text-slate-300 break-words"
                        placeholder="Issue Title"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                      <textarea
                        {...register('description', { required: true })}
                        rows={3}
                        className="w-full text-sm sm:text-base text-slate-600 bg-slate-50 rounded-2xl p-4 mt-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
                        placeholder="Description..."
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-3 block">Category</label>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {categories.map(cat => (
                        <label
                          key={cat.value}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all w-full ${selectedCategory === cat.value
                            ? `${cat.bg} ${cat.border} ring-2 ring-blue-500/30 scale-105`
                            : 'bg-white border-slate-100 opacity-60 hover:opacity-100'
                            }`}
                        >
                          <input type="radio" value={cat.value} {...register('category')} className="hidden" />
                          <cat.icon size={24} className={`${cat.color} mb-1`} />
                          <span className="text-[10px] font-bold text-slate-700">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Display */}
                  <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-blue-400 uppercase">Location Address</p>
                      <input
                        type="text"
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        className="w-full text-sm font-bold text-slate-800 bg-transparent border-b border-blue-200 focus:border-blue-500 focus:outline-none placeholder-blue-300"
                        placeholder="Enter address..."
                      />
                    </div>
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 w-full border border-slate-100">
                    <input
                      type="checkbox"
                      id="anonymous"
                      {...register('anonymous')}
                      className="w-5 h-5 text-slate-900 rounded focus:ring-slate-500 border-gray-300"
                    />
                    <label htmlFor="anonymous" className="flex-1 cursor-pointer">
                      <span className="block text-sm font-bold text-slate-700">Submit Anonymously</span>
                      <span className="block text-xs text-slate-400">Hide your identity from public view</span>
                    </label>
                  </div>

                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/10 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Confirm & Report'}
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