import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Flag,
  Eye,
  Calendar,
  Navigation
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const IssueCard = ({ issue }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      case 'in_progress':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      case 'resolved':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reported':
        return 'Reported';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'roads':
        return 'bg-orange-500';
      case 'lighting':
        return 'bg-yellow-500';
      case 'water':
        return 'bg-blue-500';
      case 'cleanliness':
        return 'bg-brown-500';
      case 'safety':
        return 'bg-red-500';
      case 'obstructions':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'roads':
        return 'Road';
      case 'lighting':
        return 'Streetlights';
      case 'water':
        return 'Water';
      case 'cleanliness':
        return 'Garbage Collection';
      case 'safety':
        return 'Safety';
      case 'obstructions':
        return 'Obstructions';
      default:
        return category;
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300 relative">
      <Link to={`/issue/${issue._id || issue.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${issue.title}`} />
      
      {/* Image */}
      {/* Image or Placeholder - Fixed Height */}
      <div className="w-full h-40 md:h-48 bg-slate-100 relative overflow-hidden pointer-events-none">
        {issue.images && issue.images.length > 0 ? (
          <img
            src={issue.images[0]}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
             <div className="mb-2 p-3 bg-white rounded-full shadow-sm">
                <AlertCircle size={24} className="opacity-50" />
             </div>
             <span className="text-xs italic">No image provided</span>
          </div>
        )}
        
        {/* Category Badge - Always overlaid */}
        <div className="absolute top-2 right-2">
            <span className={`${getCategoryColor(issue.category)} text-white px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm`}>
              {getCategoryLabel(issue.category)}
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 relative z-10 pointer-events-none">
        {/* Header: Status & Date */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center space-x-1.5">
              {getStatusIcon(issue.status)}
              <span className="text-xs font-medium text-slate-600 capitalize">{getStatusText(issue.status)}</span>
           </div>
           <span className="text-[10px] text-slate-400">
              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
           </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors">
            {issue.title}
        </h3>
        
        {/* Address */}
        <div className="flex items-start space-x-1 mb-3 h-8">
            <MapPin size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
               {issue.location?.address || 'Location details not available'}
            </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-1 pointer-events-auto">
             <div className="flex items-center space-x-3">
                 <button 
                  className="flex items-center space-x-1 text-slate-400 hover:text-blue-600 transition-colors relative z-20"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* Add flag logic here if needed */ }}
                 >
                    <Flag size={14} />
                 </button>
             </div>
             
             {/* Removed specific 'Details' button as requested. Entire card is clickable. */}
        </div>
      </div>
    </div>
  );
};

export default IssueCard; 