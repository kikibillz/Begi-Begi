/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import BegCard from './components/BegCard';
import CategoryFilter from './components/CategoryFilter';
import RecentMissions from './components/RecentMissions';
import PostBeg from './components/PostBeg';
import Leaders from './components/Leaders';
import Profile from './components/Profile';
import Auth from './components/Auth';
import ConfirmModal from './components/ConfirmModal';
import { mockBegs, mockProfile } from './mockData';
import { Plus, Loader2, Sparkles, Heart } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase, hasSupabaseConfig } from './lib/supabase';
import { isUUID } from './lib/utils';
import confetti from 'canvas-confetti';
import type { Beg } from './types';
import type { User } from '@supabase/supabase-js';

type Tab = 'home' | 'beg' | 'leaders' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [begs, setBegs] = useState<Beg[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [points, setPoints] = useState(mockProfile.points);
  const [activeCategory, setActiveCategory] = useState('All Begs');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchFullProfile() {
      if (hasSupabaseConfig && user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) {
          setProfile(data);
          setPoints(data.points);
        }
      } else if (!user) {
        setProfile(null);
        setPoints(mockProfile.points);
      }
    }
    fetchFullProfile();
  }, [user, activeTab]); // Re-fetch on tab change to profile/home to keep sync

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (hasSupabaseConfig) {
        try {
          const { data, error } = await supabase
            .from('begs')
            .select(`
              *,
              author:profiles!user_id (
                username,
                avatar_url
              )
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

          if (error) throw error;
          setBegs(data || []);
        } catch (error) {
          console.error('Error fetching begs:', error);
          setBegs(mockBegs);
        }
      } else {
        setBegs(mockBegs);
      }
      setLoading(false);
    }

    fetchData();

    // Set up realtime listener
    if (hasSupabaseConfig) {
      const channel = supabase
        .channel('begs_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'begs' }, () => {
          fetchData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const handleGrant = async (id: string) => {
    const beg = begs.find(b => b.id === id);
    if (!beg) return;

    if (beg.user_id === user?.id) {
      toast.error("You can't grant your own mission! Let someone else help.");
      setConfirmId(null);
      return;
    }
    
    if (hasSupabaseConfig && user && isUUID(id)) {
      try {
        // 1. Update beg status
        const { error: begError } = await supabase
          .from('begs')
          .update({ 
            status: 'granted',
            granted_by: user.id 
          })
          .eq('id', id);
        
        if (begError) {
          console.error('Beg update error:', begError);
          throw new Error(begError.message);
        }

        // 2. Atomic points increment via RPC
        const { error: rpcError } = await supabase.rpc('increment_user_points', {
          user_id: user.id,
          amount: beg.points_reward,
          xp_amount: beg.points_reward * 2
        });

        if (rpcError) {
          console.warn('RPC failed or not installed, falling back to manual update', rpcError);
          // Fallback if RPC is not installed in Supabase DB yet
          const { data: profileData, error: profileFetchError } = await supabase
            .from('profiles')
            .select('points, xp')
            .eq('id', user.id)
            .single();

          if (profileFetchError) {
            console.error('Fallback profile fetch error:', profileFetchError);
          } else if (profileData) {
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({ 
                points: (profileData.points || 0) + beg.points_reward,
                xp: (profileData.xp || 0) + (beg.points_reward * 2)
              })
              .eq('id', user.id);
            
            if (profileUpdateError) {
              console.error('Fallback profile update error:', profileUpdateError);
            }
          }
        }

        // 3. Record activity
        const { error: historyError } = await supabase.from('activity_history').insert({
          user_id: user.id,
          title: beg.title,
          granted_to: beg.author?.username || 'User',
          points: beg.points_reward,
          type: 'grant',
          icon: 'volunteer_activism'
        });

        if (historyError) {
          console.warn('Activity history recording failed:', historyError);
        }

        // Update local points state
        setPoints(prev => prev + beg.points_reward);
        
        // Success celebration!
        toast.success(`Mission Granted! You earned ${beg.points_reward} points.`);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2EC4B6', '#FF9F1C', '#FF006E']
        });

      } catch (error) {
        console.error('Error in handleGrant:', error);
        toast.error(error instanceof Error ? `Failed: ${error.message}` : 'Failed to grant beg. Please try again.');
      }
    } else {
      // Mock fallback
      setPoints(prev => prev + beg.points_reward);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    
    // Optimistic UI update
    setBegs(prev => prev.filter(b => b.id !== id));
    setConfirmId(null);
  };

  const filteredBegs = activeCategory === 'All Begs' 
    ? begs 
    : begs.filter(b => b.category === activeCategory);

  const handleActionWithAuth = (action: () => void) => {
    if (!user) {
      setActiveTab('profile');
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen pb-32 max-w-2xl mx-auto flex flex-col font-sans bg-slate-50 selection:bg-begi-turquoise/20">
      <Toaster position="top-center" richColors />
      <Header points={points} avatarUrl={profile?.avatar_url || user?.user_metadata?.avatar_url} />
      
      <main className="flex-1 px-5 mt-10 overflow-y-auto no-scrollbar">
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="mb-12 text-left relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-begi-turquoise/10 rounded-full blur-3xl -z-10" />
              <div className="flex items-center gap-3 mb-3">
                <div className="px-3 py-1 bg-begi-navy text-white text-[10px] font-black uppercase tracking-widest rounded-lg transform -rotate-2">
                  DAILY DOSE
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-400">12+ active beggars</span>
              </div>
              <h1 className="font-display text-5xl font-black text-begi-navy leading-[1.1] mb-3 tracking-tighter">
                {user ? (
                  <>What's the mission,<br /><span className="text-begi-turquoise">{profile?.username || user?.user_metadata?.username || 'Legend'}</span>?</>
                ) : (
                  <>Ready to<br /><span className="text-begi-turquoise">Help Out?</span></>
                )}
              </h1>
              <p className="text-slate-400 font-medium text-lg max-w-[280px]">
                {user ? "Brighten someone's day with a small act of kindness." : "Join the community to start granting wishes."}
              </p>
            </header>
            
            <CategoryFilter 
              activeCategory={activeCategory} 
              onSelect={setActiveCategory} 
            />
            
            <RecentMissions />
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                <Loader2 className="w-12 h-12 text-begi-navy animate-spin mb-4" />
                <p className="font-display font-black uppercase tracking-widest text-begi-navy/20">Syncing Kindness...</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {filteredBegs.length > 0 ? (
                  filteredBegs.map(beg => (
                    <BegCard 
                      key={beg.id} 
                      beg={beg} 
                      onGrant={(id) => handleActionWithAuth(() => setConfirmId(id))} 
                    />
                  ))
                ) : (
                  <div className="text-center py-24 bg-white border-4 border border-slate-100 rounded-[40px] shadow-sm flex flex-col items-center px-10">
                    <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6">
                      <Heart className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-display font-black text-2xl uppercase tracking-tighter leading-none mb-4">No Begs<br />Available</p>
                    <button 
                      onClick={() => handleActionWithAuth(() => setActiveTab('beg'))}
                      className="bg-begi-navy text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_#2EC4B6] btn-pop"
                    >
                      Create a Mission
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={() => handleActionWithAuth(() => setActiveTab('beg'))}
              className="fixed bottom-32 right-6 w-16 h-16 bg-begi-turquoise text-white border-4 border-begi-navy rounded-[24px] flex items-center justify-center cartoon-shadow btn-pop z-50 group hover:bg-begi-navy transition-colors"
            >
              <Plus className="w-8 h-8 text-white transition-transform group-hover:rotate-90 group-hover:scale-110" />
            </button>
          </div>
        )}

        {/* Modals & Overlays */}
        <ConfirmModal 
          isOpen={!!confirmId}
          onClose={() => setConfirmId(null)}
          onConfirm={() => confirmId && handleGrant(confirmId)}
          title="Grant this Beg?"
          message="By confirming, you agree to help this person. You'll earn XP and a warm fuzzy feeling!"
          confirmText="Yes, I'll Help!"
          cancelText="Not Now"
        />

        {activeTab === 'beg' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {user ? (
              <PostBeg 
                onSuccess={() => setActiveTab('home')} 
                onCancel={() => setActiveTab('home')} 
              />
            ) : (
              <Auth onSuccess={() => setActiveTab('beg')} />
            )}
          </div>
        )}

        {activeTab === 'leaders' && (
          <div className="animate-in fade-in duration-500">
            <Leaders />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-500">
            {user ? <Profile /> : <Auth onSuccess={() => setActiveTab('profile')} />}
          </div>
        )}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
}

