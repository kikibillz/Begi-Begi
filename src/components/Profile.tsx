import React, { useEffect, useState } from 'react';
import { Edit2, Coins, ChevronRight, MapPin, HandHeart, Palette, Coffee, Sparkles, Dog, LogOut, Loader2 } from 'lucide-react';
import { cn, formatPoints } from '../lib/utils';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { mockProfile, mockBadges } from '../mockData';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (hasSupabaseConfig) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
            setNewBio(profileData.bio || '');
          } else {
            setProfile({ ...mockProfile, username: user.user_metadata.username });
          }

          // Fetch history
          const { data: historyData } = await supabase
            .from('activity_history')
            .select('*')
            .eq('user_id', user.id)
            .order('timestamp', { ascending: false });
          
          if (historyData) setHistory(historyData);
        }
      } else {
        setProfile(mockProfile);
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ bio: newBio })
        .eq('id', user.id);
      
      if (error) throw error;
      setProfile({ ...profile, bio: newBio });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
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
    switch(iconName) {
      case 'coffee': return <Coffee className="w-6 h-6" />;
      case 'auto_awesome': return <Sparkles className="w-6 h-6" />;
      case 'pets': return <Dog className="w-6 h-6" />;
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
      <section className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-begi-navy overflow-hidden bg-white shadow-[4px_4px_0px_0px_#011627]">
            <img 
              src={activeProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeProfile.username}`} 
              alt="User Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <button className="squish-button absolute bottom-0 right-0 bg-begi-orange p-2 rounded-full border-2 border-begi-navy cartoon-shadow">
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        </div>
        <div>
          <h1 className="baloo text-3xl font-extrabold text-begi-navy">{activeProfile.username}</h1>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea 
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className="w-full bg-slate-50 border-2 border-begi-navy rounded-xl p-3 text-sm font-medium focus:border-begi-turquoise outline-none"
                placeholder="Write your kindness bio..."
                rows={2}
              />
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white border-2 border-begi-navy rounded-lg px-4 py-1 text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBio}
                  disabled={saving}
                  className="bg-begi-turquoise text-white border-2 border-begi-navy rounded-lg px-4 py-1 text-xs font-bold flex items-center gap-1"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative inline-block">
              <p className="font-sans text-sm font-medium text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
                {activeProfile.bio || 'Spread kindness, one beg at a time! ✨'}
              </p>
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-begi-turquoise"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="w-full bg-begi-turquoise border-4 border-begi-navy rounded-[24px] p-6 flex items-center justify-between cartoon-shadow">
          <div className="text-left">
            <p className="font-display text-[12px] font-extrabold text-[#011627] opacity-60 uppercase tracking-widest mb-1">Total Balance</p>
            <div className="flex items-center gap-2">
              <span className="baloo text-4xl font-extrabold text-white drop-shadow-[2px_2px_0px_#011627]">{formatPoints(activeProfile.points)}</span>
              <span className="baloo text-xl font-bold text-white opacity-80">Ibeg</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-2xl border-2 border-begi-navy transform rotate-12 shadow-[2px_2px_0px_0px_#011627]">
            <Coins className="w-10 h-10 text-begi-orange fill-current" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="baloo text-2xl font-bold text-begi-navy">Earned Badges</h2>
          <button className="text-begi-blue font-bold text-sm">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {mockBadges.slice(0, 2).map((badge) => (
            <div key={badge.id} className="bg-white border-2 border-begi-navy rounded-2xl p-4 flex flex-col items-center text-center space-y-1 cartoon-shadow">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center border-2 border-begi-navy mb-2", badge.color)}>
                {getBadgeIcon(badge.icon)}
              </div>
              <span className="baloo font-bold text-sm text-begi-navy">{badge.name}</span>
              <span className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-widest">{badge.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="baloo text-2xl font-bold text-begi-navy px-1 text-left">Activity History</h2>
        <div className="space-y-4">
          {history.length > 0 ? history.map((item) => (
            <div key={item.id} className="bg-white border-2 border-begi-navy rounded-2xl p-4 flex items-center gap-4 btn-pop cartoon-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-begi-bg border-2 border-begi-navy flex items-center justify-center text-begi-turquoise">
                {getHistoryIcon(item.icon)}
              </div>
              <div className="flex-1 text-left">
                <h4 className="baloo font-bold text-base text-begi-navy leading-tight">{item.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.type === 'grant' ? `Granted to ${item.granted_to}` : 'Posted new Beg'}
                </p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-begi-turquoise text-sm">+{item.points} Ibeg</span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          )) : (
            <div className="py-10 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center text-center">
              <Sparkles className="w-10 h-10 text-slate-200 mb-2" />
              <p className="baloo font-bold text-slate-400">No activity yet. Start giving!</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <section className="bg-white border-4 border-begi-navy rounded-[24px] p-6 space-y-4 cartoon-shadow">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <h3 className="baloo text-2xl font-extrabold text-begi-navy leading-none">Level {activeProfile.level}</h3>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Begg-master Apprentice</p>
            </div>
            <span className="text-begi-blue font-black text-sm">{formatPoints(activeProfile.xp)} / 2,000 XP</span>
          </div>
          <div className="h-4 w-full bg-begi-bg rounded-full border-2 border-begi-navy overflow-hidden relative">
            <div 
              className="h-full bg-begi-turquoise rounded-full border-r-2 border-begi-navy relative transition-all duration-500" 
              style={{ width: `${(activeProfile.xp / 2000) * 100}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-[40%] bg-white/30 rounded-full mt-0.5 ml-0.5"></div>
            </div>
          </div>
        </section>

        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-white border-4 border-begi-navy rounded-[24px] cartoon-shadow btn-pop flex items-center justify-center gap-2 baloo font-bold text-lg text-red-500 mb-12"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
}
