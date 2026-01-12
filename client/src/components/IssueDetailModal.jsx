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
  MessageCircle,
  User,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useIssue } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';

const IssueDetailModal = ({ issue, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { flagIssue, followIssue, unfollowIssue } = useIssue();
  const { user } = useAuth();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <AlertCircle size={16} className="text-danger-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-warning-600" />;
      case 'resolved':
        return <CheckCircle size={16} className="text-success-600" />;
      default:
        return <AlertCircle size={16} className="text-secondary-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'bg-danger-100 text-danger-800';
      case 'in_progress':
        return 'bg-warning-100 text-warning-800';
      case 'resolved':
        return 'bg-success-100 text-success-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'roads':
        return 'text-issue-roads';
      case 'lighting':
        return 'text-issue-lighting';
      case 'water':
        return 'text-issue-water';
      case 'cleanliness':
        return 'text-issue-cleanliness';
      case 'safety':
        return 'text-issue-safety';
      case 'obstructions':
        return 'text-issue-obstructions';
      default:
        return 'text-secondary-600';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'roads':
        return 'Roads';
      case 'lighting':
        return 'Lighting';
      case 'water':
        return 'Water Supply';
      case 'cleanliness':
        return 'Cleanliness';
      case 'safety':
        return 'Public Safety';
      case 'obstructions':
        return 'Obstructions';
      default:
        return category;
    }
  };

  const handleFlag = async () => {
    const reason = prompt('Please specify a reason for flagging this issue:');
    if (reason) {
      await flagIssue(issue._id, reason);
    }
  };

  const handleFollow = async () => {
    if (issue.isFollowing) {
      await unfollowIssue(issue._id);
    } else {
      await followIssue(issue._id);
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
      // Show toast notification
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-content max-w-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div className="flex items-center space-x-3">
              {getStatusIcon(issue.status)}
              <span className={`badge ${getStatusColor(issue.status)}`}>
                {issue.status.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Category */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-secondary-900 mb-2">
                {issue.title}
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getCategoryColor(issue.category)}`}>
                  {getCategoryLabel(issue.category)}
                </span>
                {issue.severity && (
                  <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                    {issue.severity}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-secondary-700 mb-6">
              {issue.description}
            </p>

            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div className="mb-6">
                <div className="relative">
                  <img
                    src={issue.images[currentImageIndex].url || issue.images[currentImageIndex]}
                    alt={`Issue ${currentImageIndex + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {issue.images.length > 1 && (
                    <div className="absolute bottom-2 left-2 flex space-x-1">
                      {issue.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {issue.images.length > 1 && (
                  <div className="flex space-x-2 mt-2">
                    {issue.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded overflow-hidden ${
                          index === currentImageIndex
                            ? 'ring-2 ring-primary-500'
                            : ''
                        }`}
                      >
                        <img
                          src={image.url || image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            <div className="flex items-center space-x-2 text-sm text-secondary-600 mb-4">
              <MapPin size={16} />
              <span>{issue.location?.address || 'Location not specified'}</span>
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h3 className="font-semibold text-secondary-900 mb-3">Timeline</h3>
              <div className="space-y-3">
                {issue.timeline?.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-secondary-900">
                        {event.status}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {event.comment && (
                        <div className="text-sm text-secondary-600 mt-1">
                          {event.comment}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reporter Info */}
            {!issue.anonymous && issue.reporter && (
              <div className="flex items-center space-x-2 text-sm text-secondary-600 mb-4">
                <User size={16} />
                <span>Reported by {issue.reporter.name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFollow}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    issue.isFollowing
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  <Heart size={16} className={issue.isFollowing ? 'fill-current' : ''} />
                  <span>{issue.isFollowing ? 'Following' : 'Follow'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-colors"
                >
                  <Share size={16} />
                  <span>Share</span>
                </button>
              </div>
              
              <button
                onClick={handleFlag}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm bg-danger-100 text-danger-700 hover:bg-danger-200 transition-colors"
              >
                <Flag size={16} />
                <span>Flag</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IssueDetailModal; 