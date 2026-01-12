import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Gift, Shield, Award, Lock, CheckCircle, Zap, Activity } from 'lucide-react';
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
      toast.error('Failed to load civic data');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      const res = await api.post('/api/gamification/redeem', { rewardId });
      toast.success(`Redeemed: ${res.data.reward.title}`);
      // Refresh data to show updated state
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Redemption failed');
    }
  };

  const getLevelTitle = (level) => {
    const titles = ['Civic Observer', 'Active Citizen', 'Civic Contributor', 'Community Champion', 'City Guardian'];
    return titles[level - 1] || 'Citizen';
  };

  const getLevelColor = (level) => {
    const colors = ['bg-gray-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
    return colors[level - 1] || 'bg-blue-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-emerald-600" />
              Civic Impact Hub
            </h1>
            <div className="flex gap-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full px-3 py-1 items-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{userData?.score || 0} pts</span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 mt-2">
            {[
              { id: 'impact', label: 'My Impact', icon: Activity },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'rewards', label: 'Rewards', icon: Gift },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Award className="w-64 h-64" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${getLevelColor(userData?.level)}`}>
                    {userData?.level}
                  </div>
                  
                  <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{getLevelTitle(userData?.level)}</h2>
                    <p className="text-gray-500 mt-1">Keep reporting and verifying issues to reach the next level!</p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                        <span>Current Score: {userData?.score}</span>
                        <span>Level {userData?.level + 1} Goal: {(userData?.level || 1) * 200}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${getLevelColor(userData?.level)}`}
                          style={{ width: `${Math.min(100, (userData?.score / ((userData?.level || 1) * 200)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Impact Score</h3>
                    <p className="text-2xl font-bold text-gray-900">{userData?.score}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Current Level</h3>
                    <p className="text-2xl font-bold text-gray-900">{userData?.level}</p>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                     {/* Placeholder for badges count or something similar */}
                    <h3 className="text-sm font-medium text-gray-500">Next Reward</h3>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {rewards.find(r => !r.isUnlocked)?.title || 'Max Level Reached!'}
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Top Civic Champions</h3>
                  <p className="text-sm text-gray-500">Citizens making the most impact in your area</p>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {leaderboard.map((user, index) => (
                    <div key={user._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 w-8 text-center font-bold text-gray-400">
                        {index + 1}
                      </div>
                      
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                            <Trophy className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{user.name}</h4>
                        <p className="text-xs text-gray-500">{getLevelTitle(user.level)} • Level {user.level}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold text-sm">
                        <Zap className="w-3.5 h-3.5 fill-emerald-700" />
                        {user.impactScore}
                      </div>
                    </div>
                  ))}
                  
                  {leaderboard.length === 0 && (
                     <div className="p-8 text-center text-gray-500">
                        No active users found yet. Be the first!
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
                  className={`relative p-6 rounded-2xl border transition-all ${
                    reward.isUnlocked ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-75'
                  }`}
                >
                  {!reward.isUnlocked && (
                    <div className="absolute top-4 right-4 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                  )}
                  
                  {reward.isRedeemed && (
                    <div className="absolute top-4 right-4 text-emerald-500">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${reward.isUnlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-200 text-gray-400'}`}>
                       <Gift className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{reward.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                         <div className="text-sm font-medium text-gray-600">
                            Cost: <span className="text-amber-600 font-bold">{reward.cost} pts</span>
                         </div>
                         
                         {reward.isRedeemed ? (
                           <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                             Redeemed
                           </span>
                         ) : reward.isUnlocked ? (
                           <button 
                              onClick={() => redeemReward(reward.id)}
                              className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
                           >
                             Redeem
                           </button>
                         ) : (
                           <div className="text-xs text-gray-400 bg-gray-200 px-3 py-1.5 rounded-full">
                             Locked
                           </div>
                         )}
                      </div>
                      
                      {!reward.isUnlocked && (
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                           <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${reward.progress}%` }}></div>
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
