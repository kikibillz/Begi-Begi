import React from 'react';
import { Bell, Coins } from 'lucide-react';
import { formatPoints } from '../lib/utils';

export default function Header({ points, avatarUrl }: { points: number; avatarUrl?: string }) {
  return (
    <header className="flex justify-between items-center w-full px-6 py-4 sticky top-0 z-50 bg-white border-b-4 border-begi-navy cartoon-shadow">
      <div className="flex items-center gap-2">
        <span className="text-4xl font-extrabold tracking-tight text-begi-turquoise baloo">Begi-begi</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-begi-yellow border-2 border-begi-navy rounded-xl px-4 py-1 cartoon-shadow">
          <Coins className="w-5 h-5 text-begi-navy fill-begi-orange/20" />
          <span className="baloo font-bold text-begi-navy text-lg">{formatPoints(points)}</span>
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 text-begi-navy hover:bg-begi-bg transition-colors rounded-xl btn-pop">
            <Bell className="w-6 h-6 outline-2" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-begi-navy overflow-hidden bg-white shadow-[2px_2px_0px_0px_#011627]">
            <img 
              src={avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky"} 
              alt="User Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
