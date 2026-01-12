import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useIssue } from '../contexts/IssueContext';
import toast from 'react-hot-toast';

const IssueCard = ({ issue }) => {
  const { user } = useAuth();
  const { voteOnIssue } = useIssue();
  const [isVoting, setIsVoting] = useState(false);

  const statusColors = {
    reported: 'bg-red-500',
    in_progress: 'bg-amber-500',
    resolved: 'bg-green-500'
  };

  const statusLabels = {
    reported: 'Reported',
    in_progress: 'In Progress',
    resolved: 'Resolved'
  };

  const categoryLabels = {
    roads: 'Roads',
    lighting: 'Lighting',
    water: 'Water',
    cleanliness: 'Cleanliness',
    safety: 'Safety',
    obstructions: 'Obstructions'
  };

  const handleVote = async (e, voteType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to vote');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      await voteOnIssue(issue._id || issue.id, voteType);
    } finally {
      setIsVoting(false);
    }
  };

  const voteCount = issue.voteCount || 0;
  const upvotesCount = issue.upvotesCount || issue.upvotes || 0;
  const downvotesCount = issue.downvotesCount || issue.downvotes || 0;
  const userVote = issue.userVote || null;
  const hasUpvoted = userVote === 'upvote';
  const hasDownvoted = userVote === 'downvote';

  return (
    <Link
      to={`/issue/${issue._id || issue.id}`}
      className="block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200 active:scale-[0.99]"
    >
      {/* Image Section */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-slate-100">
        {issue.images?.[0] ? (
          <img src={issue.images[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <AlertCircle size={32} />
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium rounded-lg">
          {categoryLabels[issue.category] || issue.category}
        </span>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg">
          <span className={`w-2 h-2 rounded-full ${statusColors[issue.status]}`}></span>
          <span className="text-[10px] sm:text-xs font-medium text-slate-700">{statusLabels[issue.status]}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 mb-1.5 leading-snug">
          {issue.title}
        </h3>

        {/* Location */}
        <div className="flex items-start gap-1 mb-3">
          <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-500 line-clamp-1">
            {issue.location?.address || 'Location not available'}
          </p>
        </div>

        {/* Vote Section */}
        <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
          {/* Upvote */}
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all
              ${hasUpvoted
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
              }
              ${!user ? 'opacity-50' : ''}
              ${isVoting ? 'opacity-50' : ''}
            `}
            onClick={(e) => handleVote(e, 'upvote')}
            disabled={!user || isVoting}
          >
            <ArrowUp size={16} className={hasUpvoted ? 'stroke-[2.5]' : ''} />
            <span className="hidden xs:inline">{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${hasUpvoted ? 'bg-white/20' : 'bg-slate-200/80'}`}>
              {upvotesCount}
            </span>
          </button>

          {/* Downvote */}
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all
              ${hasDownvoted
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'
              }
              ${!user ? 'opacity-50' : ''}
              ${isVoting ? 'opacity-50' : ''}
            `}
            onClick={(e) => handleVote(e, 'downvote')}
            disabled={!user || isVoting}
          >
            <ArrowDown size={16} className={hasDownvoted ? 'stroke-[2.5]' : ''} />
            <span className="hidden xs:inline">{hasDownvoted ? 'Downvoted' : 'Downvote'}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${hasDownvoted ? 'bg-white/20' : 'bg-slate-200/80'}`}>
              {downvotesCount}
            </span>
          </button>

          {/* Score */}
          <div className={`px-3 py-2 rounded-xl text-sm font-bold min-w-[50px] text-center
            ${voteCount > 0 ? 'bg-emerald-50 text-emerald-600' :
              voteCount < 0 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}
          `}>
            {voteCount > 0 ? '+' : ''}{voteCount}
          </div>
        </div>

        {/* Time */}
        <p className="text-[10px] sm:text-xs text-slate-400 mt-2 text-right">
          {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
};

export default IssueCard;