import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Gift, Shield, Award, Lock, CheckCircle, Zap, Activity, Crown, ZapOff } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const GamificationPage = () => {
  const [activeTab, setActiveTab] = useState('impact'); // impact, leaderboard, rewards
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rewardsRes, leaderboardRes] = await Promise.all([
        api.get('/api/gamification/rewards'),
        api.get('/api/gamification/leaderboard?limit=10')
      ]);

      setRewards(rewardsRes.data.data);
      setUserData({
        score: rewardsRes.data.userScore,
        level: rewardsRes.data.userLevel
      });
      setLeaderboard(leaderboardRes.data.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      toast.error('Failed to decrypt civic data');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      const res = await api.post('/api/gamification/redeem', { rewardId });
      toast.success(`Access Granted: ${res.data.reward.title}`, { icon: '🔓', style: { background: '#1e293b', color: '#fff' } });
      // Refresh data to show updated state
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authorization Failed', { style: { background: '#1e293b', color: '#fff' } });
    }
  };

  const getLevelTitle = (level) => {
    const titles = ['Cadet', 'Agent', 'Specialist', 'Commander', 'Vanguard'];
    return titles[level - 1] || 'Operative';
  };

  const getLevelColor = (level) => {
    const colors = ['bg-slate-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
    return colors[level - 1] || 'bg-blue-500';
  };

  const getLevelBorder = (level) => {
      const colors = ['border-slate-500', 'border-blue-500', 'border-emerald-500', 'border-purple-500', 'border-amber-500'];
      return colors[level - 1] || 'border-blue-500';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712]">
         <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
         <p className="text-emerald-400 font-mono text-sm animate-pulse tracking-widest">SYNCING PROFILE DATA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white pb-20 pt-20 relative font-sans overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <div className=" bg-[#030712]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <Trophy className="w-6 h-6 text-emerald-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">IMPACT HUB</span>
            </h1>
            <div className="flex gap-3 text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 items-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{userData?.score || 0} PTS</span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-8 mt-1 overflow-x-auto scrollbar-none">
            {[
              { id: 'impact', label: 'MY STATS', icon: Activity },
              { id: 'leaderboard', label: 'ELITE LIST', icon: Crown },
              { id: 'rewards', label: 'ARSENAL', icon: Gift },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-1 border-b-2 text-xs font-bold tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : 'border-transparent text-slate-500 hover:text-white hover:border-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <AnimatePresence mode='wait'>
          
          {/* IMPACT TAB */}
          {activeTab === 'impact' && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Level Card */}
              <div className="bg-[#0B1221] rounded-[2rem] p-8 shadow-2xl border border-white/10 overflow-hidden relative group">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-96 h-96 ${getLevelColor(userData?.level).replace('bg-', 'bg-')}/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-colors duration-500`}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className={`w-28 h-28 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 ${getLevelBorder(userData?.level)} ${getLevelColor(userData?.level)}/20 backdrop-blur-md relative`}>
                     <div className={`absolute inset-0 ${getLevelColor(userData?.level)}/20 blur-md`}></div>
                     <span className="relative z-10">{userData?.level}</span>
                  </div>
                  
                  <div className="text-center md:text-left flex-1 space-y-4">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">{getLevelTitle(userData?.level)}</h2>
                        <p className="text-slate-400 font-mono text-sm">Clearance Level {userData?.level} // Active Duty</p>
                    </div>
                    
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        <span>Current XP: <span className="text-white">{userData?.score}</span></span>
                        <span>Next Rank: <span className="text-white">{(userData?.level || 1) * 200}</span></span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${getLevelColor(userData?.level)} shadow-[0_0_10px_currentColor]`}
                          style={{ width: `${Math.min(100, (userData?.score / ((userData?.level || 1) * 200)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0B1221] p-6 rounded-2xl shadow-lg border border-white/10 flex items-center gap-5 hover:bg-[#0F172A] transition-colors group">
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Impact Score</h3>
                    <p className="text-2xl font-black text-white">{userData?.score}</p>
                  </div>
                </div>
                <div className="bg-[#0B1221] p-6 rounded-2xl shadow-lg border border-white/10 flex items-center gap-5 hover:bg-[#0F172A] transition-colors group">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rank Tier</h3>
                    <p className="text-2xl font-black text-white">{userData?.level}</p>
                  </div>
                </div>
                <div className="bg-[#0B1221] p-6 rounded-2xl shadow-lg border border-white/10 flex items-center gap-5 hover:bg-[#0F172A] transition-colors group">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Unlock</h3>
                    <p className="text-sm font-bold text-white mt-1 leading-tight">
                      {rewards.find(r => !r.isUnlocked)?.title || 'MAX LEVEL'}
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="bg-[#0B1221] rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/5">
                  <h3 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                     <Crown size={20} className="text-yellow-500" />
                     Elite Operatives
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">Top performing agents in your sector</p>
                </div>
                
                <div className="divide-y divide-white/5">
                  {leaderboard.map((user, index) => (
                    <div key={user._id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group relative">
                      {/* Rank Number */}
                      <div className={`flex-shrink-0 w-8 text-center font-black text-lg ${index < 3 ? 'text-yellow-400' : 'text-slate-600'}`}>
                        {index + 1}
                      </div>
                      
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 ${index < 3 ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'border-slate-700'}`}>
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 font-bold">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 border-2 border-[#0B1221]">
                            <Crown className="w-3 h-3 text-black fill-black" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{user.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">{getLevelTitle(user.level)} • Lvl {user.level}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                        {user.impactScore}
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  ))}
                  
                  {leaderboard.length === 0 && (
                     <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
                        <ZapOff size={32} className="mb-2 opacity-50"/>
                        <p className="text-sm font-bold">No Data Signals Detected</p>
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* REWARDS TAB */}
          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {rewards.map((reward) => (
                <div 
                  key={reward.id} 
                  className={`relative p-6 rounded-2xl border transition-all overflow-hidden ${
                    reward.isUnlocked 
                    ? 'bg-[#0B1221] border-emerald-500/30 shadow-lg shadow-emerald-900/10' 
                    : 'bg-[#0B1221]/50 border-white/5 opacity-70'
                  }`}
                >
                  {/* Status Badges */}
                  {!reward.isUnlocked && (
                    <div className="absolute top-4 right-4 bg-black/40 p-1.5 rounded-lg border border-white/10 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  
                  {reward.isRedeemed && (
                    <div className="absolute top-4 right-4 bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex items-start gap-5 relative z-10">
                    <div className={`p-4 rounded-xl border ${
                        reward.isUnlocked 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                       <Gift className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${reward.isUnlocked ? 'text-white' : 'text-slate-400'}`}>{reward.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{reward.description}</p>
                      
                      <div className="mt-5 flex items-center justify-between">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            Cost: <span className="text-amber-400">{reward.cost} PTS</span>
                         </div>
                         
                         {reward.isRedeemed ? (
                           <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                             ACQUIRED
                           </span>
                         ) : reward.isUnlocked ? (
                           <button 
                              onClick={() => redeemReward(reward.id)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-600/20 uppercase tracking-widest hover:scale-105 active:scale-95"
                           >
                             Redeem
                           </button>
                         ) : (
                           <div className="text-[10px] text-slate-500 bg-white/5 px-3 py-1.5 rounded border border-white/5 uppercase tracking-wider font-bold">
                             LOCKED
                           </div>
                         )}
                      </div>
                      
                      {!reward.isUnlocked && (
                        <div className="mt-4 w-full bg-slate-800 rounded-full h-1 border border-white/5">
                           <div className="bg-blue-500 h-1 rounded-full shadow-[0_0_5px_currentColor]" style={{ width: `${reward.progress}%` }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamificationPage;
