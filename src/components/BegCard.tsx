import React from 'react';
import { MapPin, Heart, Sparkles, Coffee, Share2, ShieldCheck, Lock, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatPoints } from '../lib/utils';
import type { Beg } from '../types';
import { useShare } from '../hooks/useShare';

interface BegCardProps {
  beg: Beg;
  onGrant: (id: string) => void;
  key?: string | number;
}

export default function BegCard({ beg, onGrant }: BegCardProps) {
  const { share } = useShare();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    share({
      title: `Help ${beg.author?.username} with a Beg!`,
      text: beg.description,
      url: window.location.href,
    });
  };

  const getCategoryIcon = () => {
    switch (beg.category) {
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'Food': return <Utensils className="w-4 h-4 text-begi-pink" />;
      case 'Help': return <Heart className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-begi-navy rounded-[28px] p-6 cartoon-shadow relative overflow-hidden mb-6 transition-all hover:bg-slate-50 group"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleShare}
          className="bg-white border-2 border-begi-navy rounded-full p-2 cartoon-shadow btn-pop"
          title="Share this beg"
        >
          <Share2 className="w-4 h-4 text-begi-navy" />
        </button>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 relative">
          <div className="w-14 h-14 rounded-2xl border-2 border-begi-navy bg-slate-100 overflow-hidden shadow-[2px_2px_0px_0px_#011627] transform -rotate-3 transition-transform group-hover:rotate-0">
            <img 
              src={beg.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${beg.author?.username || 'user'}`} 
              alt={beg.author?.username} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {beg.is_urgent && (
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-begi-pink rounded-full border-2 border-white animate-pulse" />
          )}
          {beg.target_user_id && (
            <div className="absolute -bottom-1 -right-1 bg-begi-navy text-white p-1 rounded-lg border-2 border-white">
              <Lock className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display text-lg font-black text-begi-navy leading-none">
              {beg.author?.username || 'Kind Soul'}
            </h4>
            {beg.is_urgent && (
              <span className="text-[9px] font-black uppercase text-begi-pink tracking-tighter">Urgent</span>
            )}
            {beg.target_user_id && (
              <span className="bg-begi-navy text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-2 h-2" />
                Private
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mb-3 text-slate-400">
            <MapPin className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{beg.location}</span>
          </div>
          
          <p className="font-sans text-[15px] font-medium text-slate-600 mb-6 leading-[1.6]">
            {beg.description}
          </p>
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="inline-block bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-md border border-slate-200">
                {beg.category.toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5 text-begi-orange font-black text-base italic">
                <div className="w-2 h-2 rounded-full bg-begi-orange animate-bounce" />
                <span>+{formatPoints(beg.points_reward)} XP</span>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGrant(beg.id);
              }}
              className="bg-begi-turquoise text-white border-2 border-begi-navy rounded-2xl px-8 py-3 font-black text-sm cartoon-shadow btn-pop flex items-center gap-2"
            >
              {getCategoryIcon()}
              Grant Beg
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
