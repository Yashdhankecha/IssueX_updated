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
    { value: 'all', label: 'All Issues', icon: AlertCircle, color: 'text-secondary-600' },
    { value: 'reported', label: 'Reported', icon: AlertCircle, color: 'text-danger-600' },
    { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-warning-600' },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-success-600' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories', color: 'text-secondary-600' },
    { value: 'roads', label: 'Roads', color: 'text-issue-roads' },
    { value: 'lighting', label: 'Lighting', color: 'text-issue-lighting' },
    { value: 'water', label: 'Water Supply', color: 'text-issue-water' },
    { value: 'cleanliness', label: 'Cleanliness', color: 'text-issue-cleanliness' },
    { value: 'safety', label: 'Public Safety', color: 'text-issue-safety' },
    { value: 'obstructions', label: 'Obstructions', color: 'text-issue-obstructions' },
  ];

  const radiusOptions = [
    { value: 1, label: '1 km' },
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
  ];

  return (
    <motion.div
      className={`sidebar ${isOpen ? '' : 'closed'}`}
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900">Filters & Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Statistics */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-secondary-900 mb-3">Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
                <div className="text-xs text-secondary-600">Total Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">{stats.resolved}</div>
                <div className="text-xs text-secondary-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">{stats.inProgress}</div>
                <div className="text-xs text-secondary-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-danger-600">{stats.reported}</div>
                <div className="text-xs text-secondary-600">New</div>
              </div>
            </div>
          </div>

          {/* Radius Filter */}
          <div className="card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin size={16} className="text-secondary-600" />
              <h3 className="text-sm font-semibold text-secondary-900">Search Radius</h3>
            </div>
            <div className="space-y-2">
              {radiusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="radius"
                    value={option.value}
                    checked={radius === option.value}
                    onChange={(e) => updateRadius(parseInt(e.target.value))}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="card p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Filter size={16} className="text-secondary-600" />
              <h3 className="text-sm font-semibold text-secondary-900">Status</h3>
            </div>
            <div className="space-y-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={filters.status === option.value}
                      onChange={(e) => updateFilters({ status: e.target.value })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <Icon size={14} className={option.color} />
                    <span className="text-sm text-secondary-700">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Category Filter */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-secondary-900 mb-3">Category</h3>
            <div className="space-y-2">
              {categoryOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={option.value}
                    checked={filters.category === option.value}
                    onChange={(e) => updateFilters({ category: e.target.value })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className={`text-sm ${option.color}`}>{option.label}</span>
                  {option.value !== 'all' && (
                    <span className="text-xs text-secondary-500">
                      ({stats.byCategory[option.value] || 0})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Category Statistics */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-secondary-900 mb-3">By Category</h3>
            <div className="space-y-2">
              {categoryOptions.slice(1).map((category) => {
                const count = stats.byCategory[category.value] || 0;
                if (count === 0) return null;
                
                return (
                  <div key={category.value} className="flex items-center justify-between">
                    <span className={`text-sm ${category.color}`}>{category.label}</span>
                    <span className="text-sm font-medium text-secondary-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-secondary-200">
          <button
            onClick={() => updateFilters({ status: 'all', category: 'all' })}
            className="w-full btn-outline text-sm"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar; 