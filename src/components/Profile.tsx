import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Coins, ChevronRight, MapPin, HandHeart, Palette, Coffee, Sparkles, Dog, LogOut, Loader2 } from 'lucide-react';
import { cn, formatPoints } from '../lib/utils';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { mockProfile, mockBadges } from '../mockData';

import { toast } from 'sonner';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (hasSupabaseConfig) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Fetch profile
            const { data: profileData, error: profileErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (profileData) {
              setProfile(profileData);
              setNewBio(profileData.bio || '');
              setNewUsername(profileData.username || '');
              // Extract seed from dicebear URL if possible
              const seedMatch = profileData.avatar_url?.match(/seed=(.*)/);
              setAvatarSeed(seedMatch ? seedMatch[1] : profileData.username);
            } else {
              console.warn('Profile not found for authenticated user');
              const fallbackUsername = user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`;
              setProfile({ 
                ...mockProfile, 
                username: fallbackUsername,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
              });
              setNewUsername(fallbackUsername);
            }

            // Fetch history
            const { data: historyData } = await supabase
              .from('activity_history')
              .select('*')
              .eq('user_id', user.id)
              .order('timestamp', { ascending: false });
            
            if (historyData) setHistory(historyData);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(mockProfile);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expired. Please login again.');

      const updates = { 
        bio: newBio.trim(), 
        username: newUsername.trim().replace('@', ''),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || newUsername}`
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        if (error.code === '23505') throw new Error('That username is already taken!');
        throw error;
      }

      setProfile({ ...profile, ...updates });
      setIsEditing(false);
      toast.success('Identity updated successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getBadgeIcon = (iconName: string) => {
    switch(iconName) {
      case 'volunteer_activism': return <HandHeart className="w-8 h-8 text-white" />;
      case 'palette': return <Palette className="w-8 h-8 text-white" />;
      default: return <Sparkles className="w-8 h-8 text-white" />;
    }
  };

  const getHistoryIcon = (iconName: string) => {
    const icon = iconName.toLowerCase();
    switch(icon) {
      case 'coffee': return <Coffee className="w-6 h-6" />;
      case 'food': return <Sparkles className="w-6 h-6" />;
      case 'volunteer_activism': return <HandHeart className="w-6 h-6" />;
      case 'favors': return <HandHeart className="w-6 h-6" />;
      case 'help': return <Sparkles className="w-6 h-6" />;
      case 'money': return <Coins className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6 font-bold" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-begi-turquoise animate-spin mb-4" />
        <p className="baloo font-bold text-slate-400">Loading your legacy...</p>
      </div>
    );
  }

  const activeProfile = profile || mockProfile;

  return (
    <div className="space-y-8 pt-6 pb-32">
      <section className="flex flex-col items-center text-center space-y-6">
        <div className="relative group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="w-36 h-36 rounded-[40px] border-4 border-begi-navy overflow-hidden bg-white shadow-[6px_6px_0px_0px_#011627] relative z-10"
          >
            <img 
              src={isEditing ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || newUsername}` : (activeProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeProfile.username}`)} 
              alt="User Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute -inset-2 bg-begi-turquoise/20 rounded-[44px] blur-xl z-0 group-hover:bg-begi-orange/20 transition-colors" />
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-pop absolute -bottom-2 -right-2 bg-begi-orange p-3 rounded-2xl border-2 border-begi-navy shadow-[4px_4px_0px_0px_#011627] z-20"
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        <div className="w-full">
          {isEditing ? (
            <div className="mt-4 space-y-4 w-full max-w-sm mx-auto text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Chosen Identity</label>
                <input 
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-white border-4 border-begi-navy rounded-2xl p-4 text-sm font-bold focus:shadow-none transition-all outline-none"
                  placeholder="Username"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Avatar Seed</label>
                <input 
                  type="text"
                  value={avatarSeed}
                  onChange={(e) => setAvatarSeed(e.target.value)}
                  className="w-full bg-white border-4 border-begi-navy rounded-2xl p-4 text-sm font-bold focus:shadow-none transition-all outline-none"
                  placeholder="Random word for avatar"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bio / Mission</label>
                <textarea 
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full bg-white border-4 border-begi-navy rounded-2xl p-4 text-sm font-bold focus:shadow-none transition-all outline-none"
                  placeholder="Share your kindness mission..."
                  rows={3}
                />
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-6 py-4 text-xs font-black uppercase tracking-wider"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-[2] bg-begi-turquoise text-white border-2 border-begi-navy rounded-xl px-8 py-4 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#011627] btn-pop flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save Identity
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-4xl font-black text-begi-navy tracking-tight">{activeProfile.username}</h1>
              <div className="group relative inline-block mt-2">
                <p className="font-sans text-base font-medium text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                  {activeProfile.bio || 'Spread kindness, one beg at a time! ✨'}
                </p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-begi-turquoise"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* LVL & XP BAR */}
        <div className="w-full bg-white border-4 border-begi-navy rounded-[36px] p-8 cartoon-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-begi-yellow/20 text-begi-yellow border-2 border-begi-yellow rounded-xl px-3 py-1 font-black text-[10px] uppercase tracking-tighter">
              RANK: ROOKIE
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-display text-5xl font-black text-begi-navy">LVL {activeProfile.level || 1}</span>
                  <div className="w-3 h-3 rounded-full bg-begi-turquoise animate-pulse" />
                </div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] mt-2">Kindness Journey Started</p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-black text-begi-turquoise">{formatPoints(activeProfile.xp || 0)}</span>
                <span className="text-slate-300 font-black text-xs ml-1">XP</span>
                <p className="text-[10px] font-black text-slate-300 uppercase mt-1">Goal: {formatPoints((activeProfile.level || 1) * 1000)}</p>
              </div>
            </div>

            <div className="h-6 w-full bg-slate-100 rounded-2xl border-4 border-begi-navy overflow-hidden relative shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((activeProfile.xp || 0) / ((activeProfile.level || 1) * 1000)) * 100, 100)}%` }}
                className="h-full bg-begi-turquoise transition-all duration-1000 ease-out relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <div className="absolute top-1 left-2 right-2 h-[30%] bg-white/30 rounded-full" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-begi-orange border-4 border-begi-navy rounded-[32px] p-6 cartoon-shadow text-white flex flex-col items-center relative overflow-hidden group hover:-rotate-1 transition-transform">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-white/20 rounded-full blur-xl" />
            <Coins className="w-8 h-8 mb-2 drop-shadow-md" />
            <span className="font-display text-3xl font-black">{formatPoints(activeProfile.points)}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Ibeg Points</span>
          </div>
          <div className="bg-begi-navy border-4 border-begi-navy rounded-[32px] p-6 cartoon-shadow text-white flex flex-col items-center relative overflow-hidden group hover:rotate-1 transition-transform">
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-begi-turquoise/20 rounded-full blur-xl" />
            <HandHeart className="w-8 h-8 mb-2 text-begi-turquoise drop-shadow-md" />
            <span className="font-display text-3xl font-black">{history.filter(i => i.type === 'grant').length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Lives Touched</span>
          </div>
        </div>
      </section>

      {/* RECENT ACTIONS */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-display text-2xl font-black text-begi-navy italic underline decoration-begi-turquoise decoration-4 underline-offset-4">Recent Kindess</h2>
          <button className="text-[10px] font-black uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-400 hover:bg-slate-200 transition-colors">Clear</button>
        </div>
        
        <div className="space-y-4">
          {history.length > 0 ? history.slice(0, 5).map((item) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border-2 border-begi-navy rounded-2xl p-4 flex items-center gap-4 hover:shadow-[4px_4px_0px_0px_#2EC4B6] transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-begi-navy flex items-center justify-center text-begi-turquoise group-hover:bg-begi-turquoise group-hover:text-white transition-colors">
                {getHistoryIcon(item.icon)}
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-display font-black text-sm text-begi-navy leading-tight">{item.title}</h4>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] mt-1 italic">
                  {item.type === 'grant' ? `Granted to @${item.granted_to}` : 'Proposed new mission'}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <span className="font-black text-begi-turquoise text-sm">+{item.points}</span>
                  <div className="w-1 h-1 rounded-full bg-begi-turquoise" />
                </div>
                <p className="text-[8px] font-black text-slate-300 uppercase mt-1">
                  {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </motion.div>
          )) : (
            <div className="py-16 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center text-center px-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border-2 border-slate-100 mb-4 shadow-sm">
                <Sparkles className="w-8 h-8 text-slate-200" />
              </div>
              <p className="font-display font-black text-slate-300 text-lg uppercase tracking-wider">Your saga begins here.</p>
              <p className="text-slate-200 text-xs font-bold mt-1">Start granting begs to see your impact history!</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <button 
          onClick={handleLogout}
          className="w-full py-5 bg-white border-4 border-begi-navy rounded-[32px] cartoon-shadow btn-pop flex items-center justify-center gap-2 font-display font-black text-lg text-begi-pink mb-12"
        >
          <LogOut className="w-6 h-6" />
          Disconnect Identity
        </button>
      </div>
    </div>
  );
}
