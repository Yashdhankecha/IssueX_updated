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
  Bell,
  Cpu,
  Fingerprint
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
      toast.success('Identity Updated');
    } catch (error) {
      toast.error('Identity Update Failed');
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
              toast.success(`Stealth Mode ${newVal ? 'Engaged' : 'Disengaged'}`);
          } else if (type === 'email') {
              const newVal = !emailNotifs;
              setEmailNotifs(newVal);
              await updatePreferences({ notifications: { ...user?.preferences?.notifications, email: newVal }});
              toast.success(`Email Uplink ${newVal ? 'Active' : 'Severed'}`);
          }
      } catch(e) { console.error(e); }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        return toast.error('Encryption keys do not match');
    }
    setLoading(true);
    try {
        const res = await api.put('/api/auth/change-password', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        if(res.data.success) {
            toast.success('Security Keys Rotated');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    } catch (e) {
        toast.error(e.response?.data?.message || 'Access Denied');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
      if(deleteData.confirmText !== 'DELETE') return toast.error('Confirmation code invalid');
      if(!deleteData.password) return toast.error('Authorization required');
      
      try {
          const res = await api.delete('/api/auth/delete-account', { data: { password: deleteData.password } });
          if(res.data.success) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
          }
      } catch(e) {
          toast.error(e.response?.data?.message || 'Purge Failed');
      }
  };

  return (
    <div className="min-h-screen bg-[#030712] font-sans pb-12 text-white overflow-hidden relative">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <div className="bg-[#030712]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5 py-4">
        <div className="max-w-xl mx-auto px-4 flex items-center gap-4 h-12">
            <Link to="/profile" className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu size={20} className="text-blue-500"/> System Configuration
            </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-10 relative z-10">
          
          {/* Section: Profile */}
          <section className="space-y-4">
              <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest ml-1 mb-4 flex items-center gap-2">
                <Fingerprint size={14}/> Identity Params
              </h2>
              <div className="bg-[#0B1221] rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-wider">Operative Name</label>
                      <input 
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                        className="w-full bg-black/20 text-white font-mono text-sm p-3 rounded-xl border border-white/5 focus:border-blue-500/50 focus:outline-none transition-colors"
                        placeholder="Unknown"
                      />
                  </div>
                  <div className="p-5 border-b border-white/5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-wider">Comm Link</label>
                      <input 
                        value={profileData.phone}
                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full bg-black/20 text-white font-mono text-sm p-3 rounded-xl border border-white/5 focus:border-blue-500/50 focus:outline-none transition-colors"
                        placeholder="No Connection"
                      />
                  </div>
                   <div className="p-5 bg-white/5">
                      <button 
                         onClick={handleCreateProfileUpdate}
                         disabled={loading}
                         className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-wide"
                      >
                          {loading ? 'Overwriting...' : 'Update Identity'}
                      </button>
                   </div>
              </div>
          </section>

          {/* Section: App Preferences */}
          <section className="space-y-4">
              <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest ml-1 mb-4">Protocol Settings</h2>
              <div className="bg-[#0B1221] rounded-3xl shadow-xl border border-white/10 overflow-hidden divide-y divide-white/5">
                  
                  {/* Location Radius */}
                  <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20"><MapPin size={20} /></div>
                          <div>
                              <div className="font-bold text-white text-sm uppercase tracking-wide">Scan Range</div>
                              <div className="text-xs text-slate-500">Area of Operation Diameter</div>
                          </div>
                          <div className="ml-auto font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">{radius} KM</div>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="20" 
                        value={radius} 
                        onChange={(e) => updateRadius(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-mono">
                          <span>1 KM</span>
                          <span>20 KM</span>
                      </div>
                  </div>

                  {/* Anonymous Reporting */}
                  <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20"><Shield size={20} /></div>
                          <div>
                              <div className="font-bold text-white text-sm uppercase tracking-wide">Stealth Mode</div>
                              <div className="text-xs text-slate-500">Mask Identity on Public Records</div>
                          </div>
                       </div>
                       <button 
                          onClick={() => handlePreferenceToggle('anonymous')}
                          className={`w-12 h-6 rounded-full transition-colors relative border ${anonymousReport ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}
                       >
                           <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-transform shadow-sm ${anonymousReport ? 'left-7' : 'left-1'}`} />
                       </button>
                  </div>

                  {/* Notifications */}
                  <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20"><Bell size={20} /></div>
                          <div>
                              <div className="font-bold text-white text-sm uppercase tracking-wide">Email Uplink</div>
                              <div className="text-xs text-slate-500">Receive Critical Alerts via Email</div>
                          </div>
                       </div>
                       <button 
                          onClick={() => handlePreferenceToggle('email')}
                          className={`w-12 h-6 rounded-full transition-colors relative border ${emailNotifs ? 'bg-amber-500 border-amber-500' : 'bg-slate-800 border-slate-700'}`}
                       >
                           <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-transform shadow-sm ${emailNotifs ? 'left-7' : 'left-1'}`} />
                       </button>
                  </div>

              </div>
          </section>

          {/* Section: Security */}
          <section className="space-y-4">
              <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest ml-1 mb-4">Security Protocols</h2>
              <div className="bg-[#0B1221] rounded-3xl shadow-xl border border-white/10 overflow-hidden p-6">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20"><Lock size={20} /></div>
                      <div>
                          <div className="font-bold text-white text-sm uppercase tracking-wide">Access Codes</div>
                          <div className="text-xs text-slate-500">Rotate Encryption Keys</div>
                      </div>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Current Key</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full p-4 bg-black/20 border border-white/5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">New Key</label>
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full p-4 bg-black/20 border border-white/5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Verify Key</label>
                            <input 
                                type={showPassword ? "text" : "password"}
                                className="w-full p-4 bg-black/20 border border-white/5 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-red-500/50 transition-colors"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            />
                         </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                          <button 
                             onClick={() => setShowPassword(!showPassword)}
                             className="px-4 py-3 bg-white/5 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wide border border-white/5 hover:bg-white/10 transition-colors"
                          >
                             {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                          <button 
                             onClick={handleChangePassword}
                             className="flex-1 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold border border-red-500/20 hover:border-red-500 transition-all uppercase tracking-wide"
                             disabled={loading}
                          >
                             Update Credentials
                          </button>
                      </div>
                  </div>
              </div>
          </section>

          {/* Section: Danger */}
          <section className="space-y-4 pt-4">
              <button 
                 onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                 className="w-full p-5 bg-red-500/5 text-red-500 hover:bg-red-500/10 rounded-2xl font-bold flex items-center justify-between border border-red-500/20 transition-colors group"
              >
                  <span className="flex items-center gap-3 uppercase tracking-wide text-xs">
                      <Trash2 size={18} />
                      Purge Identity
                  </span>
                  <ChevronRight size={18} className={`transition-transform duration-300 ${showDeleteConfirm ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                  {showDeleteConfirm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 rounded-2xl border-2 border-red-500/50 p-6 space-y-5 overflow-hidden backdrop-blur-md"
                      >
                          <p className="text-sm text-red-200 font-mono border-l-2 border-red-500 pl-3">
                            WARNING: PERMANENT DATA LOSS. THIS ACTION CANNOT BE REVERSED. CONFIRM AUTHORIZATION.
                          </p>
                          <input 
                             type="password"
                             className="w-full p-4 bg-black/40 border border-red-500/30 rounded-xl text-sm text-white font-mono placeholder:text-red-900/50 focus:outline-none focus:border-red-500"
                             placeholder="AUTHORIZATION PASSWORD"
                             value={deleteData.password}
                             onChange={e => setDeleteData({...deleteData, password: e.target.value})}
                          />
                          <input 
                             className="w-full p-4 bg-black/40 border border-red-500/30 rounded-xl text-sm text-white font-mono placeholder:text-red-900/50 focus:outline-none focus:border-red-500"
                             placeholder="TYPE 'DELETE' TO EXECUTE"
                             value={deleteData.confirmText}
                             onChange={e => setDeleteData({...deleteData, confirmText: e.target.value})}
                          />
                          <button 
                             onClick={handleDeleteAccount}
                             className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(220,38,38,0.4)] uppercase tracking-widest border border-red-400"
                          >
                             Execute Purge
                          </button>
                      </motion.div>
                  )}
              </AnimatePresence>
          </section>

          <button 
             onClick={logout}
             className="w-full p-5 text-slate-500 hover:text-white font-bold flex items-center justify-center gap-2 hover:bg-white/5 rounded-2xl transition-colors uppercase tracking-wide text-xs border border-transparent hover:border-white/10"
          >
              <LogOut size={16} />
              Terminate Session
          </button>
          
          <div className="text-center text-[10px] text-slate-600 py-6 font-mono uppercase tracking-widest">
              System Version 2.0.4.4 // Secure Link
          </div>

      </div>
    </div>
  );
};

export default SettingsPage;