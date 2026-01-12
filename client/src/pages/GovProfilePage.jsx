import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Building, Camera, Loader2, Save } from 'lucide-react';
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
                toast.success('Profile updated');
                setIsEditing(false);
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-24">
            <div className="max-w-2xl mx-auto space-y-6">
                 <h1 className="text-2xl font-bold text-slate-900">Officer Profile</h1>

                 {/* Profile Card */}
                 <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                     
                     <div className="relative mt-12 mb-6">
                         <div className="w-32 h-32 mx-auto bg-white rounded-full p-1 shadow-xl">
                             <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                 {user?.profilePicture ? (
                                     <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                 ) : (
                                     <User size={48} className="text-slate-400" />
                                 )}
                             </div>
                         </div>
                     </div>

                     <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name}</h2>
                     <p className="text-slate-500 font-medium mb-6">{user?.department?.toUpperCase()} Department</p>

                     <div className="flex justify-center gap-2 mb-8">
                         <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                             GOVERNMENT OFFICIAL
                         </span>
                         <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                             VERIFIED
                         </span>
                     </div>
                 </div>

                 {/* Details Form */}
                 <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                     <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
                         {!isEditing ? (
                             <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold text-sm">Edit</button>
                         ) : (
                             <div className="flex gap-2">
                                 <button onClick={() => setIsEditing(false)} className="text-slate-400 font-bold text-sm">Cancel</button>
                                 <button onClick={handleSave} disabled={isLoading} className="text-blue-600 font-bold text-sm flex items-center gap-1">
                                     {isLoading ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save</>}
                                 </button>
                             </div>
                         )}
                     </div>

                     <div className="space-y-4">
                         <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                 <User size={20} />
                             </div>
                             <div className="flex-1">
                                 <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                                 {isEditing ? (
                                     <input 
                                       className="w-full bg-transparent font-bold text-slate-900 focus:outline-none border-b border-transparent focus:border-blue-500"
                                       value={formData.name}
                                       onChange={(e) => setFormData({...formData, name: e.target.value})}
                                     />
                                 ) : (
                                     <p className="font-bold text-slate-900">{user?.name}</p>
                                 )}
                             </div>
                         </div>

                         <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                 <Mail size={20} />
                             </div>
                             <div className="flex-1">
                                 <label className="text-xs font-bold text-slate-400 uppercase">Email Address</label>
                                 <p className="font-bold text-slate-500">{user?.email}</p>
                             </div>
                         </div>

                         <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                 <Building size={20} />
                             </div>
                             <div className="flex-1">
                                 <label className="text-xs font-bold text-slate-400 uppercase">Department</label>
                                 <p className="font-bold text-slate-500 capitalize">{user?.department}</p>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default GovProfilePage;
