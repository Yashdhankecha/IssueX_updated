import React, { useState, useEffect } from 'react';
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
    Navigation,
    ThumbsUp,
    ThumbsDown,
    ArrowBigUp,
    ArrowBigDown,
    Shield,
    Terminal
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useIssue } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const IssueDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getIssueById, flagIssue, followIssue, unfollowIssue, voteOnIssue } = useIssue();
    const { user } = useAuth();
    const issue = getIssueById(id);
    const [activeImage, setActiveImage] = useState(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [localVoteData, setLocalVoteData] = useState({
        voteCount: 0,
        upvotes: 0,
        downvotes: 0,
        userVote: null
    });

    // Initialize local vote data when issue loads
    useEffect(() => {
        if (issue) {
            setLocalVoteData({
                voteCount: issue.voteCount || 0,
                upvotes: issue.upvotesCount || issue.upvotes || 0,
                downvotes: issue.downvotesCount || issue.downvotes || 0,
                userVote: issue.userVote || null
            });
        }
    }, [issue]);

    const handleVote = async (voteType) => {
        if (!user) {
            toast.error('Authentication Required', { style: { background: '#1e293b', color: '#fff' } });
            return;
        }
        if (isVoting) return;

        setIsVoting(true);
        try {
            const result = await voteOnIssue(issue._id || issue.id, voteType);
            if (result.success && result.data) {
                setLocalVoteData({
                    voteCount: result.data.voteCount,
                    upvotes: result.data.upvotes,
                    downvotes: result.data.downvotes,
                    userVote: result.data.userVote
                });
            }
        } finally {
            setIsVoting(false);
        }
    };

    if (!issue) return (
        <div className="min-h-screen bg-[#030712] grid place-items-center">
             <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                <p className="text-blue-400 font-mono text-sm animate-pulse">RETRIEVING ENCRYPTED FILE...</p>
             </div>
        </div>
    );

    const statusConfig = {
        reported: { color: 'bg-red-500', label: 'Alert Lvl 1', sub: 'Detected', text: 'text-red-500', border: 'border-red-500/50' },
        in_progress: { color: 'bg-amber-500', label: 'Active Op', sub: 'Deployment', text: 'text-amber-500', border: 'border-amber-500/50' },
        resolved: { color: 'bg-green-500', label: 'Secured', sub: 'Resolved', text: 'text-green-500', border: 'border-green-500/50' },
    }[issue.status] || { color: 'bg-slate-500', label: issue.status, sub: 'Unknown', text: 'text-slate-500', border: 'border-slate-500/50' };

    const handleAction = async (action) => {
        if (action === 'follow') {
            issue.isFollowing ? await unfollowIssue(issue.id) : await followIssue(issue.id);
        } else if (action === 'flag') {
            const reason = prompt('Reason for flagging:');
            if (reason) { await flagIssue(issue.id, reason); toast.success('Flagged for review'); }
        }
    };

    const shareText = `Civic Anomaly Detected: ${issue.title}`;
    const shareUrl = window.location.href;

    const handleShare = (platform) => {
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link Copied to Clipboard');
        } else if (platform === 'native') {
            if (navigator.share) {
                navigator.share({ title: issue.title, text: shareText, url: shareUrl }).catch(() => { });
            } else {
                toast.error('System sharing not supported');
            }
        }
        setIsShareMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#030712] text-white font-sans pb-20 relative overflow-hidden">
             
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
                 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="font-bold text-white truncate max-w-[200px] md:max-w-md flex items-center gap-2">
                        <Terminal size={14} className="text-blue-500" />
                        <span className="uppercase tracking-wide text-sm">Case #{String(issue._id).slice(-4)}</span>
                    </div>
                    <button className="p-2 -mr-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                        <MoreHorizontal size={24} />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">

                {/* Title & Status Block */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#030712] ${statusConfig.color} shadow-lg shadow-${statusConfig.color}/20`}>
                            {statusConfig.label}
                        </span>
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-500/30 px-2 py-0.5 rounded bg-blue-500/5">
                            {issue.category}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                        {issue.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm font-medium">
                        <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white mr-2 border border-white/10">
                                {issue.reporter?.name?.[0] || 'U'}
                            </div>
                            <span className="font-mono text-xs uppercase tracking-wide">{issue.reporter?.name || (issue.anonymous ? 'Anonymous Operative' : 'Unknown Agent')}</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="font-mono text-xs">{formatDistanceToNow(new Date(issue.createdAt))} ago</span>
                        <div className="w-1 h-1 bg-slate-600 rounded-full" />
                        <div className="flex items-center hover:text-blue-400 cursor-pointer transition-colors group" onClick={() => navigate('/map')}>
                            <MapPin size={14} className="mr-1 group-hover:animate-bounce" />
                            <span className="underline decoration-slate-600 underline-offset-4 decoration-1 group-hover:decoration-blue-400">{issue.location?.town || 'Locate on Grid'}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">

                    {/* Left Col: Visuals */}
                    <div className="md:col-span-7 space-y-6">
                        {/* Main Image */}
                        <div className="relative aspect-[4/3] md:aspect-video bg-[#0B1221] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                            {issue.images?.length > 0 ? (
                                <>
                                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mix-blend-overlay"></div>
                                    <img
                                        src={issue.images[activeImage]}
                                        alt="Issue"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer opacity-90 group-hover:opacity-100"
                                        onClick={() => setIsImageModalOpen(true)}
                                    />
                                    {/* Tech Overlay lines */}
                                    <div className="absolute inset-0 border border-white/5 pointer-events-none"></div>
                                    <div className="absolute top-4 left-4 border-t-2 border-l-2 border-white/20 w-8 h-8 pointer-events-none"></div>
                                    <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-white/20 w-8 h-8 pointer-events-none"></div>
                                    
                                    <button
                                        onClick={() => setIsImageModalOpen(true)}
                                        className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl shadow-lg hover:bg-black/80 transition-colors z-20 border border-white/10"
                                    >
                                        <Maximize2 size={18} className="text-white" />
                                    </button>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-white/5">
                                    <div className="p-4 bg-white/5 rounded-full shadow-sm mb-3 border border-white/5"><AlertCircle size={32} /></div>
                                    <span className="font-bold text-slate-500 uppercase tracking-widest text-xs">Visual Data Missing</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {issue.images?.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                {issue.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Vote Section - Tech Design */}
                        <div className="bg-[#0B1221]/80 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Consensus Protocol</p>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${localVoteData.voteCount > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'}`}>
                                    SCORE: {localVoteData.voteCount > 0 ? '+' : ''}{localVoteData.voteCount}
                                </div>
                            </div>
                            

                            {/* Vote Buttons Row */}
                            <div className="flex gap-3 mb-1">
                                {/* Upvote */}
                                <button
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border
                                        ${localVoteData.userVote === 'upvote'
                                            ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                            : 'bg-white/5 text-slate-400 border-white/5 hover:border-green-500/30 hover:text-green-400 hover:bg-white/10'
                                        }
                                        ${!user ? 'opacity-50' : ''}
                                        ${isVoting ? 'opacity-50' : ''}
                                    `}
                                    onClick={() => handleVote('upvote')}
                                    disabled={!user || isVoting}
                                >
                                    <ArrowBigUp size={20} className={localVoteData.userVote === 'upvote' ? 'fill-current' : ''} />
                                    <span className="hidden sm:inline uppercase tracking-wide">Validate</span>
                                    <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded">
                                        {localVoteData.upvotes}
                                    </span>
                                </button>

                                {/* Downvote */}
                                <button
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border
                                        ${localVoteData.userVote === 'downvote'
                                            ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                            : 'bg-white/5 text-slate-400 border-white/5 hover:border-red-500/30 hover:text-red-400 hover:bg-white/10'
                                        }
                                        ${!user ? 'opacity-50' : ''}
                                        ${isVoting ? 'opacity-50' : ''}
                                    `}
                                    onClick={() => handleVote('downvote')}
                                    disabled={!user || isVoting}
                                >
                                    <ArrowBigDown size={20} className={localVoteData.userVote === 'downvote' ? 'fill-current' : ''} />
                                    <span className="hidden sm:inline uppercase tracking-wide">Reject</span>
                                    <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded">
                                        {localVoteData.downvotes}
                                    </span>
                                </button>
                            </div>

                            {!user && (
                                <p className="text-[10px] text-slate-500 text-center mt-3 uppercase tracking-wider">Authentication Required for Consensus</p>
                            )}
                        </div>

                        {/* Primary Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => handleAction('follow')}
                                className={`flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold transition-all border ${issue.isFollowing
                                    ? 'bg-slate-800 text-blue-400 border-blue-500/30'
                                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] border-transparent'
                                    }`}
                            >
                                <Heart size={16} className={`mr-2 ${issue.isFollowing ? 'fill-current' : ''}`} />
                                {issue.isFollowing ? 'TRACKING' : 'TRACK ISSUE'}
                            </button>
                            <button
                                onClick={() => setIsShareMenuOpen(true)}
                                className="flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                                <Share2 size={16} className="mr-2" /> SHARE DATA
                            </button>
                        </div>
                    </div>

                    {/* Verification Section */}
                    {issue.status === 'resolved' && (user?._id === issue.reporter?._id || user?.role === 'admin') && (
                        <div className="md:col-span-12 bg-green-500/5 border border-green-500/20 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-32 bg-green-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                <div className="flex-1 space-y-4 text-center md:text-left">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/20 mb-2">
                                        <CheckCircle size={12} className="mr-1" /> Pending Verification
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Confirm Resolution</h2>
                                    <p className="text-slate-400 text-sm">Deploying agency has marked this anomaly as neutralized. Verify integrity of the fix.</p>

                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.put(`/api/issues/${issue._id}/approve-fix`);
                                                    toast.success('Resolution Verified');
                                                    navigate(0);
                                                } catch (e) { toast.error('Error verifying fix'); }
                                            }}
                                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-500 transition-all text-sm uppercase tracking-wide border border-green-400/20"
                                        >
                                            Confirm Fix
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await api.put(`/api/issues/${issue._id}/reject-fix`);
                                                    toast.error('Resolution Rejected');
                                                    navigate(0);
                                                } catch (e) { toast.error('Error rejecting fix'); }
                                            }}
                                            className="px-6 py-3 bg-white/5 text-red-400 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/10 transition-all text-sm uppercase tracking-wide"
                                        >
                                            Reject Fix
                                        </button>
                                    </div>
                                </div>

                                {/* Comparison Images */}
                                <div className="flex gap-4 items-center">
                                    <div className="w-32 md:w-48 aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-lg relative bg-black">
                                        <img src={issue.images?.[0]} className="w-full h-full object-cover grayscale opacity-60" alt="Before" />
                                        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10">BEFORE</div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-[#0B1221] border border-green-500/50 shadow flex items-center justify-center shrink-0 z-10 -ml-6 -mr-6">
                                        <CheckCircle size={16} className="text-green-500" />
                                    </div>
                                    <div className="w-32 md:w-48 aspect-square rounded-2xl overflow-hidden border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] relative bg-black">
                                        <img src={issue.resolutionImage || issue.images?.[0]} className="w-full h-full object-cover" alt="After" />
                                        <div className="absolute bottom-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded">AFTER</div>
                                        {issue.aiResolutionScore && (
                                            <div className="absolute top-2 right-2 bg-black/80 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
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
                                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Terminal size={12}/> Mission Brief
                                </h3>
                                <p className="text-lg text-slate-300 leading-relaxed font-light border-l-2 border-blue-500/30 pl-4">
                                    {issue.description}
                                </p>
                            </div>

                            <div className="p-6 bg-[#0B1221]/80 backdrop-blur rounded-2xl border border-white/10 shadow-lg">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Coordinates</h3>
                                <div className="flex items-start mb-6">
                                    <MapPin className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                    <div>
                                        <p className="font-bold text-white text-lg">{issue.location?.town || 'Sector Unknown'}</p>
                                        <p className="text-sm text-slate-400 mt-0.5 font-mono">{issue.location?.address || 'Grid unavailable'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/map')}
                                    className="w-full py-3 bg-white/5 border border-white/10 hover:bg-blue-600/10 hover:border-blue-500/30 hover:text-blue-400 rounded-xl text-sm font-bold text-slate-300 transition-all flex items-center justify-center uppercase tracking-wide"
                                >
                                    <Navigation size={16} className="mr-2" /> Engage Navigation
                                </button>
                            </div>

                            {/* Timeline Preview */}
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">Timeline</h3>
                                <div className="border-l border-white/10 pl-4 space-y-8 ml-2">
                                    <div className="relative">
                                        <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ${statusConfig.color} shadow-[0_0_10px_inherit]`}></span>
                                        <p className="text-sm font-bold text-white mb-0.5">{statusConfig.label}</p>
                                        <p className="text-xs text-slate-500 font-mono">{formatDistanceToNow(new Date(issue.updatedAt || issue.createdAt))} ago</p>
                                    </div>
                                    <div className="relative opacity-50">
                                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-600"></span>
                                        <p className="text-sm font-bold text-slate-400 mb-0.5">Anomaly Detected</p>
                                        <p className="text-xs text-slate-600 font-mono">{format(new Date(issue.createdAt), 'MMM d, yyyy HH:mm')}</p>
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
                            className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
                            onClick={() => setIsShareMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-white/10 z-[70] rounded-t-3xl p-6 md:p-8 shadow-2xl"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-6" />
                                <h3 className="text-xl font-bold text-white mb-6 text-center tracking-wide uppercase">Encrypted Share</h3>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 group">
                                        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors">
                                            <MessageSquare size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">Secure Comms</span>
                                    </button>
                                    <button onClick={() => handleShare('copy')} className="flex flex-col items-center gap-2 group">
                                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-white/10 transition-colors">
                                            <Share2 size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">Copy Uplink</span>
                                    </button>
                                    <button onClick={() => handleShare('native')} className="flex flex-col items-center gap-2 group">
                                        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                            <MoreHorizontal size={24} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">More Options</span>
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsShareMenuOpen(false)}
                                    className="w-full py-4 rounded-xl bg-white/5 text-white font-bold mt-4 hover:bg-white/10 transition-colors border border-white/5"
                                >
                                    Abort
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
                        className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
                    >
                         {/* Tech Scan Line */}
                         <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(transparent_0%,#000_50%,transparent_100%)] bg-[length:100%_4px]"></div>
                        
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50">
                            <Maximize2 size={32} />
                        </button>
                        <img
                            src={issue.images[activeImage]}
                            alt=""
                            className="max-w-full max-h-[90vh] object-contain rounded-md relative z-10 border border-white/10 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IssueDetailPage;