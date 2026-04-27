import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle2, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function RecentMissions() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentGrants() {
      const { data, error } = await supabase
        .from('begs')
        .select(`
          id,
          title,
          points_reward,
          created_at,
          author:profiles!user_id (username, avatar_url),
          benefactor:profiles!granted_by (username, avatar_url)
        `)
        .eq('status', 'granted')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent missions:', error);
      } else {
        setMissions(data || []);
      }
      setLoading(false);
    }

    fetchRecentGrants();
  }, []);

  if (loading) return null;
  if (missions.length === 0) return null;

  return (
    <div className="bg-white/50 backdrop-blur-sm border-4 border-begi-navy p-6 rounded-[32px] cartoon-shadow mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <CheckCircle2 className="w-12 h-12 text-begi-navy" />
      </div>
      
      <h3 className="font-black text-begi-navy uppercase tracking-tighter text-xl mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-6 h-6 text-begi-turquoise" />
        Verified Impact Audit
      </h3>
      
      <div className="space-y-4">
        {missions.map((mission, idx) => (
          <motion.div 
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between gap-4 py-2 border-b-2 border-begi-navy/10 last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex -space-x-2">
                <img 
                  src={mission.author?.avatar_url} 
                  className="w-8 h-8 rounded-full border-2 border-begi-navy bg-white"
                  alt=""
                />
                <div className="w-8 h-8 rounded-full border-2 border-begi-navy bg-begi-turquoise flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-begi-navy/60 uppercase">Mission Accomplished</p>
                <p className="font-black text-begi-navy truncate">{mission.title}</p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="bg-begi-yellow text-begi-navy text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-begi-navy whitespace-nowrap">
                +{mission.points_reward} PK
              </span>
              <p className="text-[10px] font-bold text-begi-navy/40 mt-1">
                {new Date(mission.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t-4 border-begi-navy border-dashed flex justify-between items-center bg-begi-navy/5 -mx-6 -mb-6 px-6 py-3">
        <span className="text-[10px] font-bold text-begi-navy/60">SYSTEM STATUS: TRUSTED</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-begi-turquoise animate-pulse"></div>
          <span className="text-[10px] font-black text-begi-navy">LIVE FEED</span>
        </div>
      </div>
    </div>
  );
}
