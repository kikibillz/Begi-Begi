import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, ArrowUpRight, Loader2, BadgeCheck } from 'lucide-react';
import { cn, formatPoints } from '../lib/utils';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { mockLeaders } from '../mockData';

export default function Leaders() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      if (hasSupabaseConfig) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('points', { ascending: false })
            .limit(10);
          
          if (error) throw error;
          setLeaders(data || []);
        } catch (error) {
          console.error('Error fetching leaders:', error);
          setLeaders(mockLeaders);
        }
      } else {
        setLeaders(mockLeaders);
      }
      setLoading(false);
    }
    fetchLeaders();
  }, []);

  const getMedalColor = (index: number) => {
    switch(index) {
      case 0: return "bg-begi-yellow text-white border-begi-navy";
      case 1: return "bg-slate-300 text-begi-navy border-begi-navy";
      case 2: return "bg-orange-200 text-orange-600 border-orange-400";
      default: return "bg-begi-bg text-begi-navy border-begi-navy";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-begi-turquoise animate-spin mb-4" />
        <p className="baloo font-bold text-slate-400">Consulting the Hall of Fame...</p>
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const remaining = leaders.slice(3);

  return (
    <div className="space-y-8 pt-6 pb-24">
      {/* Top 3 Podium */}
      <div className="relative pt-24 pb-8 flex justify-center items-end h-[340px]">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center mr-[-15px] z-10 animate-in slide-in-from-bottom-5 duration-500 delay-150">
            <div className="relative mb-2">
              <img className="w-16 h-16 rounded-full border-4 border-begi-navy bg-white shadow-[2px_2px_0px_0px_#011627]" src={topThree[1].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].username}`} />
              <div className="absolute -top-1 -right-1 bg-slate-300 text-begi-navy w-8 h-8 rounded-full border-2 border-begi-navy flex items-center justify-center font-bold text-xs shadow-[1px_1px_0px_0px_#011627]">2</div>
            </div>
            <div className="baloo font-bold text-sm text-begi-navy truncate max-w-[80px]">{topThree[1].username}</div>
            <div className="h-28 w-20 bg-slate-100 border-x-4 border-t-4 border-begi-navy rounded-t-2xl mt-2 flex items-end justify-center pb-2">
              <Medal className="text-slate-400 w-8 h-8" />
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center z-20 animate-in slide-in-from-bottom-10 duration-700">
            <div className="relative mb-2 -mt-16">
              <Trophy className="text-begi-yellow absolute -top-14 left-1/2 -translate-x-1/2 w-12 h-12 bounce drop-shadow-[0_0_10px_rgba(255,204,0,0.3)]" />
              <img className="w-24 h-24 rounded-full border-4 border-begi-navy bg-white shadow-[4px_4px_0px_0px_#011627]" src={topThree[0].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].username}`} />
              <div className="absolute -top-1 -right-1 bg-begi-yellow text-white w-10 h-10 rounded-full border-2 border-begi-navy flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_0px_#011627]">1</div>
            </div>
            <div className="baloo font-black text-xl text-begi-navy truncate max-w-[120px]">{topThree[0].username}</div>
            <div className="h-44 w-28 bg-begi-yellow border-x-4 border-t-4 border-begi-navy rounded-t-3xl mt-2 flex items-end justify-center pb-4 shadow-[4px_0px_0px_0px_#011627]">
              <BadgeCheck className="text-white w-10 h-10" />
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center ml-[-15px] z-10 animate-in slide-in-from-bottom-5 duration-500 delay-300">
            <div className="relative mb-2">
              <img className="w-16 h-16 rounded-full border-4 border-begi-navy bg-white shadow-[2px_2px_0px_0px_#011627]" src={topThree[2].avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].username}`} />
              <div className="absolute -top-1 -right-1 bg-begi-orange text-white w-8 h-8 rounded-full border-2 border-begi-navy flex items-center justify-center font-bold text-xs shadow-[1px_1px_0px_0px_#011627]">3</div>
            </div>
            <div className="baloo font-bold text-sm text-begi-navy truncate max-w-[80px]">{topThree[2].username}</div>
            <div className="h-20 w-18 bg-orange-100 border-x-4 border-t-4 border-begi-navy rounded-t-xl mt-2 flex items-end justify-center pb-2">
              <Medal className="text-begi-orange w-8 h-8" />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="baloo text-2xl font-bold text-begi-navy text-left px-1">Top Kind Souls</h3>
        <div className="space-y-4">
          {remaining.length > 0 ? remaining.map((leader, index) => (
            <div key={leader.id} className="bg-white p-4 rounded-2xl border-2 border-begi-navy cartoon-shadow flex items-center gap-4 btn-pop transition-transform hover:-translate-y-1">
              <span className="baloo font-black text-slate-300 w-6 text-center text-xl">{index + 4}</span>
              <img className="w-12 h-12 rounded-xl border-2 border-begi-navy object-cover bg-white" src={leader.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.username}`} />
              <div className="flex-1 text-left">
                <p className="baloo font-bold text-begi-navy text-lg leading-tight">{leader.username}</p>
                <div className="flex items-center gap-1 opacity-50">
                  <Star className="w-3 h-3 text-begi-blue fill-current" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Level {leader.level || 1}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="baloo font-black text-begi-turquoise leading-none">✨ {formatPoints(leader.points)}</p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mt-1">Ibeg pts</p>
              </div>
            </div>
          )) : (
            <div className="py-10 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center text-center opacity-60">
              <p className="baloo font-bold text-slate-400">Work your way up the ranks!</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[32px] border-4 border-dashed border-slate-200 flex flex-col items-center text-center space-y-4 mb-20">
        <div className="w-16 h-16 rounded-full bg-begi-bg flex items-center justify-center border-2 border-slate-100">
          <Star className="w-8 h-8 text-begi-blue opacity-50" />
        </div>
        <div>
          <p className="baloo text-2xl font-bold text-begi-navy">Can you reach the top?</p>
          <p className="font-sans text-sm text-slate-500 mt-1">Help others and grant a beg to climb the ranks!</p>
        </div>
      </div>
    </div>
  );
}
