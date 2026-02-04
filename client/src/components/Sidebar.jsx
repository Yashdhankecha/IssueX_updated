import React from 'react';
import { motion } from 'framer-motion';
import { X, Filter, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { filters, updateFilters, getIssueStats } = useIssue();
  const { radius, updateRadius } = useLocation();
  const stats = getIssueStats();

  const statusOptions = [
    { value: 'all', label: 'All Issues', icon: AlertCircle, color: 'text-slate-400' },
    { value: 'reported', label: 'Reported', icon: AlertCircle, color: 'text-red-400' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-amber-400' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-400' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories', color: 'text-slate-400' },
    { value: 'roads', label: 'Roads', color: 'text-orange-400' },
    { value: 'lighting', label: 'Lighting', color: 'text-yellow-400' },
    { value: 'water', label: 'Water Supply', color: 'text-blue-400' },
    { value: 'cleanliness', label: 'Cleanliness', color: 'text-green-400' },
    { value: 'safety', label: 'Public Safety', color: 'text-red-400' },
    { value: 'obstructions', label: 'Obstructions', color: 'text-purple-400' },
  ];

  const radiusOptions = [
    { value: 1, label: '1 km' },
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
  ];

  return (
    <motion.div
      className={`fixed right-0 top-0 h-full w-80 bg-[#0B1221]/95 backdrop-blur-xl border-l border-white/10 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Stats */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3">Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
                <div className="text-xs text-slate-500">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.inProgress}</div>
                <div className="text-xs text-slate-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.reported}</div>
                <div className="text-xs text-slate-500">New</div>
              </div>
            </div>
          </div>

          {/* Radius */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin size={16} className="text-green-400" />
              <h3 className="text-sm font-semibold text-white">Radius</h3>
            </div>
            <div className="space-y-2">
              {radiusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="radius"
                    value={option.value}
                    checked={radius === option.value}
                    onChange={(e) => updateRadius(parseInt(e.target.value))}
                    className="w-4 h-4 text-blue-500 bg-white/5 border-white/20 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center space-x-2 mb-3">
              <Filter size={16} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Status</h3>
            </div>
            <div className="space-y-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={filters.status === option.value}
                      onChange={(e) => updateFilters({ status: e.target.value })}
                      className="w-4 h-4 text-blue-500 bg-white/5 border-white/20 focus:ring-blue-500"
                    />
                    <Icon size={14} className={option.color} />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3">Category</h3>
            <div className="space-y-2">
              {categoryOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value={option.value}
                    checked={filters.category === option.value}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="w-4 h-4 text-blue-500 bg-white/5 border-white/20 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${option.color} group-hover:text-white transition-colors`}>{option.label}</span>
                  {option.value !== 'all' && (
                    <span className="text-xs text-slate-600">
                      ({stats.byCategory[option.value] || 0})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => updateFilters({ status: 'all', category: 'all' })}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;