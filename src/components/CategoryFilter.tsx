import React from 'react';
import { ShoppingBag, Heart, CircleDollarSign, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Category } from '../types';

interface CategoryFilterProps {
  activeCategory: string;
  onSelect: (category: string) => void;
}

const categories = [
  { name: 'All Begs', icon: <Compass className="w-5 h-5" />, color: 'bg-begi-turquoise' },
  { name: 'Coffee', icon: <div className="text-lg">☕</div>, color: 'bg-white' },
  { name: 'Study', icon: <div className="text-lg">📚</div>, color: 'bg-white' },
  { name: 'Gifts', icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-white' },
];

export default function CategoryFilter({ activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-6 px-1">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={cn(
            "btn-pop flex items-center gap-2 px-6 py-2 rounded-xl font-bold border-2 border-begi-navy whitespace-nowrap cartoon-shadow baloo text-sm",
            activeCategory === cat.name 
              ? `${cat.color} text-begi-navy` 
              : "bg-white text-slate-400 opacity-80"
          )}
        >
          {cat.icon}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
