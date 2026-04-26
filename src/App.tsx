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
import PostBeg from './components/PostBeg';
import Leaders from './components/Leaders';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { mockBegs, mockProfile } from './mockData';
import { Plus, Loader2 } from 'lucide-react';
import { supabase, hasSupabaseConfig } from './lib/supabase';
import type { Beg } from './types';
import type { User } from '@supabase/supabase-js';

type Tab = 'home' | 'beg' | 'leaders' | 'me';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [begs, setBegs] = useState<Beg[]>([]);
  const [points, setPoints] = useState(mockProfile.points);
  const [activeCategory, setActiveCategory] = useState('All Begs');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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
    async function fetchData() {
      setLoading(true);
      if (hasSupabaseConfig) {
        try {
          const { data, error } = await supabase
            .from('begs')
            .select(`
              *,
              author:profiles (
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
    
    if (hasSupabaseConfig && user) {
      try {
        // 1. Update beg status
        const { error: begError } = await supabase
          .from('begs')
          .update({ status: 'granted' })
          .eq('id', id);
        
        if (begError) throw begError;

        // 2. Increment user points
        const { data: profile } = await supabase
          .from('profiles')
          .select('points, xp')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ 
              points: profile.points + beg.points_reward,
              xp: profile.xp + (beg.points_reward * 2) // Bonus XP for giving
            })
            .eq('id', user.id);
        }

        // 3. Record activity
        await supabase.from('activity_history').insert({
          user_id: user.id,
          title: beg.title,
          granted_to: beg.author?.username || 'User',
          points: beg.points_reward,
          type: 'grant',
          icon: 'volunteer_activism'
        });

        // Update local points state
        setPoints(prev => prev + beg.points_reward);
      } catch (error) {
        console.error('Error granting beg:', error);
      }
    } else {
      // Mock fallback
      setPoints(prev => prev + beg.points_reward);
    }
    
    // Optimistic UI update
    setBegs(prev => prev.filter(b => b.id !== id));
  };

  const filteredBegs = activeCategory === 'All Begs' 
    ? begs 
    : begs.filter(b => b.category === activeCategory);

  const handleActionWithAuth = (action: () => void) => {
    if (!user) {
      setActiveTab('me');
      return;
    }
    action();
  };

  return (
    <div className="min-h-screen pb-32 max-w-2xl mx-auto flex flex-col font-sans bg-begi-bg">
      <Header points={points} />
      
      <main className="flex-1 px-5 mt-8 overflow-y-auto no-scrollbar">
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-500">
            <section className="mb-10 text-left">
              <h1 className="baloo text-4xl font-extrabold text-begi-navy leading-none mb-2">
                {user ? `Morning, ${user?.user_metadata?.username || 'Felix'}! 👋` : 'Welcome! 👋'}
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                {user ? "Who's begging for your help today?" : "Sign in to start granting wishes!"}
              </p>
            </section>
            
            <CategoryFilter 
              activeCategory={activeCategory} 
              onSelect={setActiveCategory} 
            />
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-begi-turquoise animate-spin mb-4" />
                <p className="baloo font-bold text-slate-400">Sniffing out fresh begs...</p>
              </div>
            ) : (
              <div className="space-y-6 mt-2">
                {filteredBegs.length > 0 ? (
                  filteredBegs.map(beg => (
                    <BegCard 
                      key={beg.id} 
                      beg={beg} 
                      onGrant={(id) => handleActionWithAuth(() => handleGrant(id))} 
                    />
                  ))
                ) : (
                  <div className="text-center py-24 bg-white border-4 border-dashed border-slate-200 rounded-[32px] cartoon-shadow">
                    <p className="text-slate-400 baloo font-bold text-xl">No begs here! Check back soon or</p>
                    <button 
                      onClick={() => handleActionWithAuth(() => setActiveTab('beg'))}
                      className="text-begi-turquoise baloo font-extrabold text-lg underline mt-2 btn-pop"
                    >
                      post your own!
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={() => handleActionWithAuth(() => setActiveTab('beg'))}
              className="fixed bottom-32 right-6 w-16 h-16 bg-begi-orange border-4 border-begi-navy rounded-full flex items-center justify-center cartoon-shadow btn-pop z-50 group"
            >
              <Plus className="w-8 h-8 text-white transition-transform group-hover:rotate-90" />
            </button>
          </div>
        )}

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

        {activeTab === 'me' && (
          <div className="animate-in fade-in duration-500">
            {user ? <Profile /> : <Auth onSuccess={() => setActiveTab('me')} />}
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

