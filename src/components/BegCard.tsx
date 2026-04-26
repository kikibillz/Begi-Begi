import React from 'react';
import { MapPin, Heart, Sparkles, Coffee, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatPoints } from '../lib/utils';
import type { Beg } from '../types';
import { useShare } from '../hooks/useShare';

interface BegCardProps {
  beg: Beg;
  onGrant: (id: string) => void;
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

  return (
    <article className="bg-white border-4 border-begi-navy rounded-[24px] p-6 cartoon-shadow relative overflow-hidden mb-8">
      {beg.is_urgent && (
        <div className="absolute top-0 right-0 p-4">
          <span className="bg-red-100 border-2 border-red-500 rounded-full px-3 py-1 text-[10px] font-black uppercase text-red-500 shadow-[2px_2px_0px_0px_#991b1b]">
            Urgent
          </span>
        </div>
      )}
      
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-16 h-16 rounded-full border-2 border-begi-navy bg-begi-bg overflow-hidden shadow-[2px_2px_0px_0px_#011627]">
          <img 
            src={beg.author?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
            alt={beg.author?.username} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h4 className="baloo text-xl font-bold text-begi-navy">@{beg.author?.username?.toLowerCase().replace(/\s+/g, '_')}</h4>
          <div className="flex items-center gap-1 mb-3 opacity-60">
            <MapPin className="text-begi-blue w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{beg.location}</span>
          </div>
          
          <p className="font-sans text-base font-medium text-slate-600 mb-6 leading-relaxed">
            {beg.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="bg-begi-bg text-begi-turquoise text-[10px] font-bold px-3 py-1 rounded-full border-2 border-begi-turquoise">
                {beg.category.toUpperCase()}
              </span>
              <div className="flex items-center gap-1 text-begi-orange font-black text-sm">
                <Heart className="w-4 h-4 fill-current" />
                <span>+{formatPoints(beg.points_reward)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="bg-white border-2 border-begi-navy rounded-xl p-2 cartoon-shadow btn-pop flex items-center justify-center"
                title="Share this beg"
              >
                <Share2 className="w-5 h-5 text-begi-navy" />
              </button>
              <button
                onClick={() => onGrant(beg.id)}
                className="bg-begi-turquoise text-white border-2 border-begi-navy rounded-xl px-6 py-2 font-bold text-sm cartoon-shadow btn-pop flex items-center gap-2"
              >
                {beg.category === 'Coffee' ? <Coffee className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                Grant
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
