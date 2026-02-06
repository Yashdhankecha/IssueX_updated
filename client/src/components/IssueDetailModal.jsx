import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Flag,
  Share,
  Heart,
  User,
  Calendar,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useIssue } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const IssueDetailModal = ({ issue, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { flagIssue, followIssue, unfollowIssue } = useIssue();
  const { user } = useAuth();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'reported':
        return { 
          icon: AlertCircle, 
          color: 'text-red-400', 
          bg: 'bg-red-500/10', 
          border: 'border-red-500/20',
          label: 'Pending Review'
        };
      case 'in_progress':
        return { 
          icon: Clock, 
          color: 'text-blue-400', 
          bg: 'bg-blue-500/10', 
          border: 'border-blue-500/20',
          label: 'In Progress'
        };
      case 'resolved':
        return { 
          icon: CheckCircle, 
          color: 'text-emerald-400', 
          bg: 'bg-emerald-500/10', 
          border: 'border-emerald-500/20',
          label: 'Resolved'
        };
      default:
        return { 
          icon: Shield, 
          color: 'text-slate-400', 
          bg: 'bg-slate-500/10', 
          border: 'border-slate-500/20',
          label: 'Unknown'
        };
    }
  };

  const statusConfig = getStatusConfig(issue.status);
  const StatusIcon = statusConfig.icon;

  const handleFlag = async () => {
    const reason = prompt('Initialize flagging protocol. Reason:');
    if (reason) {
      try {
        await flagIssue(issue._id, reason);
        toast.success('Flagged for review');
      } catch (error) {
        toast.error('Flag failed');
      }
    }
  };

  const handleFollow = async () => {
    try {
      setIsActionLoading(true);
      if (issue.isFollowing) {
        await unfollowIssue(issue._id);
        toast.success('Unfollowed issue');
      } else {
        await followIssue(issue._id);
        toast.success('Following issue updates');
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0B1221] w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl border border-white/10 flex flex-col relative overflow-hidden"
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5 relative z-10 bg-[#0B1221]/50 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border backdrop-blur-sm uppercase tracking-wider ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                  <StatusIcon size={12} strokeWidth={2.5} />
                  {statusConfig.label}
                </span>
                <span className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                  ID: #{issue._id?.slice(-6)}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 line-clamp-1">
                {issue.title}
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 hover:border-white/20 active:scale-95 group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - Visuals */}
              <div className="space-y-6">
                {/* Main Image */}
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0F172A] relative group shadow-2xl">
                  {issue.images && issue.images.length > 0 ? (
                    <>
                      <img
                        src={issue.images[currentImageIndex].url || issue.images[currentImageIndex]}
                        alt="Issue Evidence"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1221] via-transparent to-transparent opacity-60" />
                      
                      {/* Image Navigation Dots */}
                      {issue.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {issue.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                        <AlertCircle size={48} className="opacity-20" />
                        <span className="text-xs font-mono uppercase tracking-widest opacity-50">No Visual Data Available</span>
                     </div>
                  )}
                </div>

                {/* Thumbnails */}
                {issue.images && issue.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                     {issue.images.map((img, idx) => (
                        <button
                           key={idx}
                           onClick={() => setCurrentImageIndex(idx)}
                           className={`aspect-video rounded-lg overflow-hidden border transition-all ${
                              idx === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-500/20 opacity-100' 
                              : 'border-white/5 opacity-50 hover:opacity-100'
                           }`}
                        >
                           <img 
                              src={img.url || img} 
                              alt={`Evidence ${idx}`}
                              className="w-full h-full object-cover"
                           />
                        </button>
                     ))}
                  </div>
                )}

                {/* Location Card */}
                <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/5 flex items-start gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                     <MapPin size={20} />
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-1">Location Coordinates</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">
                        {issue.location?.address || 'Geolocation data unavailable'}
                     </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details & Timeline */}
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <SubjectIcon category={issue.category} />
                     Incident Report
                  </h3>
                  <div className="bg-[#0F172A]/50 p-6 rounded-2xl border border-white/5 text-slate-300 leading-relaxed text-sm font-light">
                     {issue.description}
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0F172A] p-4 rounded-2xl border border-white/5">
                     <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Category</div>
                     <div className="text-white font-bold capitalize flex items-center gap-2">
                        {issue.category}
                     </div>
                  </div>
                  <div className="bg-[#0F172A] p-4 rounded-2xl border border-white/5">
                     <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Submitted</div>
                     <div className="text-white font-bold flex items-center gap-2">
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                     </div>
                  </div>
                </div>

                 {/* Reporter Info */}
                 {!issue.anonymous && issue.reportedBy && (
                   <div className="flex items-center gap-4 py-4 border-t border-b border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                         {(issue.reportedBy.name?.[0] || 'U')}
                      </div>
                      <div>
                         <div className="text-sm font-bold text-white">{issue.reportedBy.name}</div>
                         <div className="text-xs text-slate-500 font-mono">Civilian Reporter</div>
                      </div>
                   </div>
                 )}

                {/* Timeline */}
                <div>
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Activity size={14} />
                      Activity Log
                   </h3>
                   <div className="space-y-0 relative pl-4 border-l-2 border-white/5">
                      {issue.timeline?.map((event, index) => (
                         <div key={index} className="relative pb-6 last:pb-0">
                            <div className="absolute -left-[21px] top-0 w-4 h-4 rounded-full bg-[#0B1221] border-2 border-blue-500/50 z-10" />
                            <div className="flex flex-col gap-1">
                               <span className="text-xs font-bold text-white uppercase tracking-wide">
                                  {event.status.replace('_', ' ')}
                               </span>
                               <span className="text-[10px] font-mono text-slate-500">
                                  {format(new Date(event.timestamp), 'MMM dd, yyyy • HH:mm')}
                               </span>
                               {event.comment && (
                                  <p className="mt-2 text-sm text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                                     "{event.comment}"
                                  </p>
                               )}
                            </div>
                         </div>
                      ))}
                      {(!issue.timeline || issue.timeline.length === 0) && (
                         <div className="text-sm text-slate-600 italic pl-2">No activity recorded yet.</div>
                      )}
                   </div>
                </div>

              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/5 bg-[#0B1221]/50 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3">
                <button
                   onClick={handleFollow}
                   disabled={isActionLoading}
                   className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border ${
                      issue.isFollowing 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/50' 
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'
                   }`}
                >
                   <Heart size={16} className={issue.isFollowing ? 'fill-current' : ''} />
                   {issue.isFollowing ? 'Following' : 'Follow Updates'}
                </button>

                <button
                   onClick={handleShare}
                   className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                >
                   <Share size={16} />
                   Share
                </button>
             </div>

             <button
                onClick={handleFlag}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-red-500/5 text-red-500/70 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-all"
             >
                <Flag size={16} />
                Report Anomaly
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SubjectIcon = ({ category }) => {
   // Helper to return icon based on category, strictly simplified for display
   const icons = {
      default: AlertCircle
   };
   const Icon = icons[category] || icons.default;
   return <Icon size={14} />;
}

export default IssueDetailModal; 