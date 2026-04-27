import React from 'react';
import { Utensils, Heart, CircleDollarSign, Compass, HandHeart } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Category } from '../types';

interface CategoryFilterProps {
  activeCategory: string;
  onSelect: (category: string) => void;
}

const categories = [
  { name: 'All Begs', icon: <Compass className="w-5 h-5" />, color: 'bg-begi-navy text-white' },
  { name: 'Help', icon: <Heart className="w-5 h-5" />, color: 'bg-begi-turquoise' },
  { name: 'Money', icon: <CircleDollarSign className="w-5 h-5" />, color: 'bg-begi-orange' },
  { name: 'Coffee', icon: <div className="text-lg">☕</div>, color: 'bg-begi-pink' },
  { name: 'Food', icon: <Utensils className="w-5 h-5" />, color: 'bg-begi-orange' },
  { name: 'Favors', icon: <HandHeart className="w-5 h-5" />, color: 'bg-slate-200' },
];

export default function CategoryFilter({ activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-8 px-1">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={cn(
            "btn-pop flex items-center gap-2 px-6 py-3 rounded-2xl font-display text-xs font-black border-2 border-begi-navy whitespace-nowrap uppercase tracking-widest transition-all",
            activeCategory === cat.name 
              ? `${cat.color === 'bg-white' ? 'bg-begi-turquoise text-white' : cat.color + ' text-begi-navy'} cartoon-shadow` 
              : "bg-white text-slate-300 border-slate-100 hover:border-begi-turquoise/30"
          )}
        >
          {cat.icon}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
