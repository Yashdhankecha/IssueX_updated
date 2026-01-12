import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Flag,
  Share2,
  Heart,
  ChevronLeft,
  Calendar,
  MoreHorizontal,
  MessageSquare,
  Maximize2,
  Navigation
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useIssue } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getIssueById, flagIssue, followIssue, unfollowIssue } = useIssue();
  const { user } = useAuth();
  const issue = getIssueById(id);
  const [activeImage, setActiveImage] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  if (!issue) return <div className="min-h-screen grid place-items-center"><div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full"/></div>;

  const statusConfig = {
    reported: { color: 'bg-red-500', label: 'Reported', sub: 'Issue received', text: 'text-red-500' },
    in_progress: { color: 'bg-amber-500', label: 'In Progress', sub: 'Being fixed', text: 'text-amber-500' },
    resolved: { color: 'bg-green-500', label: 'Resolved', sub: 'Fixed & Closed', text: 'text-green-500' },
  }[issue.status] || { color: 'bg-slate-500', label: issue.status, sub: 'Status Unknown', text: 'text-slate-500' };

  const handleAction = async (action) => {
    if (action === 'follow') {
      issue.isFollowing ? await unfollowIssue(issue.id) : await followIssue(issue.id);
    } else if (action === 'flag') {
        const reason = prompt('Reason for flagging:');
        if (reason) { await flagIssue(issue.id, reason); toast.success('Flagged'); }
    }
  };

  const shareText = `Check out this civic issue: ${issue.title}`;
  const shareUrl = window.location.href;

  const handleShare = (platform) => {
      if (platform === 'whatsapp') {
         window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      } else if (platform === 'copy') {
         navigator.clipboard.writeText(shareUrl);
         toast.success('Link copied to clipboard');
      } else if (platform === 'native') {
         if (navigator.share) {
           navigator.share({ title: issue.title, text: shareText, url: shareUrl }).catch(() => {});
         } else {
           toast.error('System sharing not supported');
         }
      }
      setIsShareMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <div className="font-semibold text-slate-900 truncate max-w-[200px] md:max-w-md">
                {issue.title}
            </div>
            <button className="p-2 -mr-2 hover:bg-slate-100 rounded-full text-slate-600">
                <MoreHorizontal size={24} />
            </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Title & Status Block */}
        <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
                <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                   {issue.category}
                </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
                {issue.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-2">
                        {issue.reporter?.name?.[0] || 'U'}
                    </div>
                    {issue.reporter?.name || (issue.anonymous ? 'Anonymous' : 'Unknown')}
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <div className="flex items-center hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/map')}>
                    <MapPin size={14} className="mr-1" />
                    <span className="underline decoration-slate-300 underline-offset-4 decoration-1">{issue.location?.town || 'View on Map'}</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            
            {/* Left Col: Visuals */}
            <div className="md:col-span-7 space-y-6">
                {/* Main Image */}
                <div className="relative aspect-[4/3] md:aspect-video bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-slate-100 group">
                    {issue.images?.length > 0 ? (
                        <>
                            <img 
                                src={issue.images[activeImage]} 
                                alt="Issue" 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                                onClick={() => setIsImageModalOpen(true)}
                            />
                            <button 
                                onClick={() => setIsImageModalOpen(true)}
                                className="absolute bottom-4 right-4 p-2 bg-white/90 backdrop-blur rounded-xl shadow-lg hover:bg-white transition-colors"
                            >
                                <Maximize2 size={18} className="text-slate-700" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-3"><AlertCircle size={32} /></div>
                            <span className="font-medium text-slate-400">No images provided</span>
                        </div>
                    )}
                </div>

                {/* Thumbnails */}
                {issue.images?.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {issue.images.map((img, i) => (
                            <button 
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Primary Actions - Moved Below Image */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                        onClick={() => handleAction('follow')}
                        className={`flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                            issue.isFollowing 
                            ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' 
                            : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        <Heart size={16} className={`mr-2 ${issue.isFollowing ? 'fill-current text-red-500' : ''}`} />
                        {issue.isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button 
                        onClick={() => setIsShareMenuOpen(true)}
                        className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                    >
                        <Share2 size={16} className="mr-2" /> Share
                    </button>
                </div>
            </div>

            {/* Verification Section (Full Width or placed in Right Col) */}
            {issue.status === 'resolved' && (user?._id === issue.reporter?._id || user?.role === 'admin') && (
               <div className="md:col-span-12 bg-green-50 border border-green-200 rounded-3xl p-6 md:p-8 mb-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                     <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-2">
                           <CheckCircle size={14} className="mr-1" /> Action Required
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Is this issue fixed?</h2>
                        <p className="text-slate-600">The department has marked this as resolved. Please verify the completion photo below and confirm.</p>
                        
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                           <button 
                             onClick={async () => {
                               try {
                                 await api.put(`/api/issues/${issue._id}/approve-fix`);
                                 toast.success('Fix verified! Issue closed.');
                                 navigate(0);
                               } catch (e) { toast.error('Error verifying fix'); }
                             }}
                             className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 hover:scale-105 transition-all"
                           >
                              Yes, It's Fixed
                           </button>
                           <button 
                             onClick={async () => {
                               try {
                                 await api.put(`/api/issues/${issue._id}/reject-fix`);
                                 toast.error('Fix rejected. Re-opened.');
                                 navigate(0);
                               } catch (e) { toast.error('Error rejecting fix'); }
                             }}
                             className="px-8 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl font-bold hover:bg-rose-50 transition-all"
                           >
                              No, Still Broken
                           </button>
                        </div>
                     </div>

                     {/* Comparison Images */}
                     <div className="flex gap-4 items-center">
                        <div className="w-32 md:w-48 aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-lg relative">
                           <img src={issue.images?.[0]} className="w-full h-full object-cover grayscale opacity-80" alt="Before" />
                           <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">BEFORE</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center shrink-0 z-10 -ml-6 -mr-6">
                           <CheckCircle size={20} className="text-green-500" />
                        </div>
                        <div className="w-32 md:w-48 aspect-square rounded-2xl overflow-hidden border-4 border-green-400 shadow-xl relative">
                           <img src={issue.resolutionImage || issue.images?.[0]} className="w-full h-full object-cover" alt="After" />
                           <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded">AFTER</div>
                           {issue.aiResolutionScore && (
                              <div className="absolute top-2 right-2 bg-white/90 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                 AI Match {issue.aiResolutionScore}%
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* Right Col: Details & Actions */}
            <div className="md:col-span-5 space-y-8">

                {/* Info Blocks */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-lg text-slate-800 leading-relaxed font-medium">
                            {issue.description}
                        </p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Location Details</h3>
                        <div className="flex items-start mb-4">
                            <MapPin className="text-slate-400 mt-1 mr-3 flex-shrink-0" size={20} />
                            <div>
                                <p className="font-semibold text-slate-900">{issue.location?.town || 'Area not detected'}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{issue.location?.address || 'No specific address'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/map')}
                            className="w-full py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-xl text-sm font-bold text-slate-600 transition-colors flex items-center justify-center"
                        >
                            <Navigation size={16} className="mr-2" /> Open Navigation
                        </button>
                    </div>

                    {/* Timeline Preview */}
                    <div>
                         <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Latest Updates</h3>
                         <div className="border-l-2 border-slate-100 pl-4 space-y-6">
                            <div className="relative">
                                <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${statusConfig.color} ring-4 ring-white`}></span>
                                <p className="text-sm font-bold text-slate-900">{statusConfig.label}</p>
                                <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(issue.updatedAt || issue.createdAt))} ago</p>
                            </div>
                            <div className="relative opacity-60">
                                <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></span>
                                <p className="text-sm font-bold text-slate-900">Issue Reported</p>
                                <p className="text-xs text-slate-500">{format(new Date(issue.createdAt), 'MMM d')}</p>
                            </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>
      </div>

       {/* Share Modal */}
      <AnimatePresence>
        {isShareMenuOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
                    onClick={() => setIsShareMenuOpen(false)}
                />
                <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="fixed bottom-0 left-0 right-0 bg-white z-[70] rounded-t-3xl p-6 md:p-8 shadow-2xl"
                >
                    <div className="max-w-md mx-auto">
                        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Share Issue</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                                    <MessageSquare size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">WhatsApp</span>
                            </button>
                            <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-100 transition-colors">
                                    <Share2 size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">Copy Link</span>
                            </button>
                            <button onClick={() => handleShare('native')} className="flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <MoreHorizontal size={24} />
                                </div>
                                <span className="text-xs font-medium text-slate-600">More</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsShareMenuOpen(false)}
                            className="w-full py-4 rounded-xl bg-slate-100 font-bold text-slate-900 mt-2 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && issue.images?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageModalOpen(false)}
            className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          >
             <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                <Maximize2 size={32} />
             </button>
             <img 
               src={issue.images[activeImage]} 
               alt="" 
               className="max-w-full max-h-[90vh] object-contain rounded-md"
               onClick={e => e.stopPropagation()} 
             />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IssueDetailPage; 