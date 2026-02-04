import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Building, Camera, Loader2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const GovProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const res = await api.put('/api/auth/profile', formData);
            if (res.data.success) {
                updateUser(res.data.data.user);
                toast.success('Credentials Updated');
                setIsEditing(false);
            }
        } catch (error) {
            toast.error('Update Protocol Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] p-6 pb-24 font-sans relative overflow-hidden">
             {/* Ambient Background */}
            <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
                 <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                     <Shield className="text-blue-500" />
                     Officer Profile
                 </h1>

                 {/* Profile Card */}
                 <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl border border-white/10 text-center relative overflow-hidden group">
                     {/* Tech Grid Overlay */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                     <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent border-b border-white/5"></div>
                     
                     <div className="relative mt-8 mb-6">
                         <div className="w-32 h-32 mx-auto bg-[#0F172A] rounded-full p-1 shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-blue-500/30">
                             <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center overflow-hidden">
                                 {user?.profilePicture ? (
                                     <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover opacity-80" />
                                 ) : (
                                     <User size={48} className="text-slate-600" />
                                 )}
                             </div>
                         </div>
                     </div>

                     <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">{user?.name}</h2>
                     <p className="text-slate-500 font-mono text-xs mb-8 uppercase tracking-widest">{user?.department?.toUpperCase()} Division</p>

                     <div className="flex justify-center gap-3 mb-4">
                         <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                             AUTHORIZED PERSONNEL
                         </span>
                         <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                             ACTIVE STATUS
                         </span>
                     </div>
                 </div>

                 {/* Details Form */}
                 <div className="bg-[#0B1221]/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl border border-white/10 relative overflow-hidden">
                     <div className="flex justify-between items-center mb-8 relative z-10">
                         <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Identification Data</h3>
                         {!isEditing ? (
                             <button 
                                onClick={() => setIsEditing(true)} 
                                className="text-blue-400 hover:text-white font-bold text-xs uppercase tracking-wide bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded transition-all border border-blue-500/20"
                             >
                                Modify Data
                             </button>
                         ) : (
                             <div className="flex gap-2">
                                 <button 
                                    onClick={() => setIsEditing(false)} 
                                    className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wide bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-all"
                                >
                                    Abort
                                </button>
                                 <button 
                                    onClick={handleSave} 
                                    disabled={isLoading} 
                                    className="text-emerald-400 hover:text-emerald-300 font-bold text-xs uppercase tracking-wide bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded transition-all border border-emerald-500/20 flex items-center gap-2"
                                >
                                     {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                     Save Changes
                                 </button>
                             </div>
                         )}
                     </div>

                     <div className="space-y-4 relative z-10">
                         <div className="flex items-center gap-5 p-5 bg-[#0F172A] rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                             <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-slate-500 shadow-inner border border-white/5 group-hover:text-blue-400 transition-colors">
                                 <User size={18} />
                             </div>
                             <div className="flex-1">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Officer Name</label>
                                 {isEditing ? (
                                     <input 
                                       className="w-full bg-black/20 font-bold text-white focus:outline-none border-b border-blue-500/50 focus:border-blue-400 pb-1 font-mono text-sm"
                                       value={formData.name}
                                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                                     />
                                 ) : (
                                     <p className="font-bold text-white font-mono text-sm">{user?.name}</p>
                                 )}
                             </div>
                         </div>

                         <div className="flex items-center gap-5 p-5 bg-[#0F172A] rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                             <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-slate-500 shadow-inner border border-white/5 group-hover:text-purple-400 transition-colors">
                                 <Mail size={18} />
                             </div>
                             <div className="flex-1">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Comms ID (Email)</label>
                                 <p className="font-bold text-slate-400 font-mono text-sm">{user?.email}</p>
                             </div>
                         </div>

                         <div className="flex items-center gap-5 p-5 bg-[#0F172A] rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                             <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-slate-500 shadow-inner border border-white/5 group-hover:text-emerald-400 transition-colors">
                                 <Building size={18} />
                             </div>
                             <div className="flex-1">
                                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Assigned Sector</label>
                                 <p className="font-bold text-slate-400 uppercase font-mono text-sm">{user?.department} Division</p>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default GovProfilePage;
