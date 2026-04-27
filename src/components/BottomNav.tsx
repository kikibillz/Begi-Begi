import React from 'react';
import { Home, PlusSquare, Trophy, User } from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'home' | 'beg' | 'leaders' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" /> },
    { id: 'beg', label: 'Beg', icon: <PlusSquare className="w-6 h-6" /> },
    { id: 'leaders', label: 'Leaders', icon: <Trophy className="w-6 h-6" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-8 bg-white border-t-4 border-begi-navy rounded-t-[32px] cartoon-shadow">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex flex-col items-center justify-center transition-all duration-100 px-4 py-2 rounded-2xl btn-pop",
            activeTab === tab.id 
              ? "bg-begi-turquoise text-white border-2 border-begi-navy shadow-[3px_3px_0px_0px_#011627] -translate-y-1" 
              : "text-slate-400 hover:text-begi-turquoise"
          )}
        >
          {React.cloneElement(tab.icon as React.ReactElement, {
            className: cn("w-6 h-6", activeTab === tab.id && "fill-current")
          })}
          <span className="font-display text-[10px] font-black uppercase tracking-widest mt-1">
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
