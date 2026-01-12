import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Shield, 
  Lock, 
  Trash2, 
  LogOut, 
  Save, 
  ChevronRight,
  Eye,
  EyeOff,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateProfile, updatePreferences, logout } = useAuth();
  const { selectedLocation, updateRadius, radius } = useLocation();
  const [loading, setLoading] = useState(false);

  // States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const [deleteData, setDeleteData] = useState({ password: '', confirmText: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simple toggles for preferences
  const [anonymousReport, setAnonymousReport] = useState(user?.preferences?.privacy?.anonymousReports ?? false);
  const [emailNotifs, setEmailNotifs] = useState(user?.preferences?.notifications?.email ?? true);

  const handleCreateProfileUpdate = async () => {
    setLoading(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
        setLoading(false);
    }
  };

  const handlePreferenceToggle = async (type) => {
      try {
          if(type === 'anonymous') {
              const newVal = !anonymousReport;
              setAnonymousReport(newVal);
              await updatePreferences({ privacy: { ...user?.preferences?.privacy, anonymousReports: newVal }});
          } else if (type === 'email') {
              const newVal = !emailNotifs;
              setEmailNotifs(newVal);
              await updatePreferences({ notifications: { ...user?.preferences?.notifications, email: newVal }});
          }
      } catch(e) { console.error(e); }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
        const res = await api.put('/api/auth/change-password', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        if(res.data.success) {
            toast.success('Password changed');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    } catch (e) {
        toast.error(e.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
      if(deleteData.confirmText !== 'DELETE') return toast.error('Type DELETE to confirm');
      if(!deleteData.password) return toast.error('Password required');
      
      try {
          const res = await api.delete('/api/auth/delete-account', { data: { password: deleteData.password } });
          if(res.data.success) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
          }
      } catch(e) {
          toast.error(e.response?.data?.message || 'Failed to delete');
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100 px-4 py-4 flex items-center gap-4">
          <Link to="/profile" className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full">
              <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-8">
          
          {/* Section: Profile */}
          <section className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Account</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-50">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name</label>
                      <input 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full text-slate-900 font-semibold focus:outline-none placeholder:text-slate-300"
                        placeholder="Your Name"
                      />
                  </div>
                  <div className="p-4 border-b border-slate-50">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Phone</label>
                      <input 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full text-slate-900 font-semibold focus:outline-none placeholder:text-slate-300"
                        placeholder="+91..."
                      />
                  </div>
                   <div className="p-4 bg-slate-50/50">
                      <button 
                         onClick={handleCreateProfileUpdate}
                         disabled={loading}
                         className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50"
                      >
                          {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                   </div>
              </div>
          </section>

          {/* Section: App Preferences */}
          <section className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Preferences</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                  
                  {/* Location Radius */}
                  <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
                          <div>
                              <div className="font-bold text-slate-900">Search Radius</div>
                              <div className="text-xs text-slate-500">Distance for local issues</div>
                          </div>
                          <div className="ml-auto font-bold text-slate-900">{radius}km</div>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="20" 
                        value={radius} 
                        onChange={(e) => updateRadius(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                          <span>1km</span>
                          <span>20km</span>
                      </div>
                  </div>

                  {/* Anonymous Reporting */}
                  <div className="p-5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Shield size={20} /></div>
                          <div>
                              <div className="font-bold text-slate-900">Anonymous Mode</div>
                              <div className="text-xs text-slate-500">Hide stats from public profile</div>
                          </div>
                       </div>
                       <button 
                          onClick={() => handlePreferenceToggle('anonymous')}
                          className={`w-11 h-6 rounded-full transition-colors relative ${anonymousReport ? 'bg-indigo-600' : 'bg-slate-200'}`}
                       >
                           <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${anonymousReport ? 'left-6' : 'left-1'}`} />
                       </button>
                  </div>

                  {/* Notifications */}
                  <div className="p-5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Bell size={20} /></div>
                          <div>
                              <div className="font-bold text-slate-900">Email Updates</div>
                              <div className="text-xs text-slate-500">Get important alerts via email</div>
                          </div>
                       </div>
                       <button 
                          onClick={() => handlePreferenceToggle('email')}
                          className={`w-11 h-6 rounded-full transition-colors relative ${emailNotifs ? 'bg-amber-500' : 'bg-slate-200'}`}
                       >
                           <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${emailNotifs ? 'left-6' : 'left-1'}`} />
                       </button>
                  </div>

              </div>
          </section>

          {/* Section: Security */}
          <section className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Security</h2>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-5">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Lock size={20} /></div>
                      <div>
                          <div className="font-bold text-slate-900">Change Password</div>
                          <div className="text-xs text-slate-500">Update your login credentials</div>
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <input 
                         type={showPassword ? "text" : "password"}
                         placeholder="Current Password"
                         className="w-full p-3 bg-slate-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-200"
                         value={passwordData.currentPassword}
                         onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                       <input 
                         type={showPassword ? "text" : "password"}
                         placeholder="New Password"
                         className="w-full p-3 bg-slate-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-200"
                         value={passwordData.newPassword}
                         onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                       <input 
                         type={showPassword ? "text" : "password"}
                         placeholder="Confirm Password"
                         className="w-full p-3 bg-slate-50 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-200"
                         value={passwordData.confirmPassword}
                         onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                      <div className="flex gap-2 pt-2">
                          <button 
                             onClick={() => setShowPassword(!showPassword)}
                             className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold"
                          >
                             {showPassword ? 'Hide' : 'Show'}
                          </button>
                          <button 
                             onClick={handleChangePassword}
                             className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                             disabled={loading}
                          >
                             Update Password
                          </button>
                      </div>
                  </div>
              </div>
          </section>

          {/* Section: Danger */}
          <section className="space-y-4 pt-4">
              <button 
                 onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                 className="w-full p-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-between border border-red-100"
              >
                  <span className="flex items-center gap-3">
                      <Trash2 size={20} />
                      Delete Account
                  </span>
                  <ChevronRight size={20} className={`transition-transform ${showDeleteConfirm ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                  {showDeleteConfirm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white rounded-2xl border-2 border-red-100 p-5 space-y-4 overflow-hidden"
                      >
                          <p className="text-sm text-slate-600">
                              This will permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <input 
                             type="password"
                             className="w-full p-3 border border-slate-200 rounded-xl text-sm"
                             placeholder="Enter your password"
                             value={deleteData.password}
                             onChange={e => setDeleteData({...deleteData, password: e.target.value})}
                          />
                          <input 
                             className="w-full p-3 border border-slate-200 rounded-xl text-sm"
                             placeholder="Type DELETE to confirm"
                             value={deleteData.confirmText}
                             onChange={e => setDeleteData({...deleteData, confirmText: e.target.value})}
                          />
                          <button 
                             onClick={handleDeleteAccount}
                             className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm"
                          >
                             Permanently Delete Account
                          </button>
                      </motion.div>
                  )}
              </AnimatePresence>
          </section>

          <button 
             onClick={logout}
             className="w-full p-4 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 rounded-2xl transition-colors"
          >
              <LogOut size={20} />
              Log Out
          </button>
          
          <div className="text-center text-xs text-slate-300 py-4">
              v1.0.0 • Civic Issue Tracker
          </div>

      </div>
    </div>
  );
};

export default SettingsPage; 