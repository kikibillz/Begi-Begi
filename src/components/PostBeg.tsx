import React, { useState } from 'react';
import { Package2, Banknote, HandHeart, Ticket, Camera, X, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import type { Category } from '../types';

interface PostBegProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PostBeg({ onSuccess, onCancel }: PostBegProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category>('Money');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: { id: Category; icon: React.ReactNode; color: string }[] = [
    { id: 'Items', icon: <Package2 />, color: 'bg-begi-turquoise' },
    { id: 'Money', icon: <Banknote />, color: 'bg-begi-orange' },
    { id: 'Favors', icon: <HandHeart />, color: 'bg-slate-200' },
    { id: 'Experiences', icon: <Ticket />, color: 'bg-begi-yellow' },
  ];

  const handleSubmit = async () => {
    if (step < 2) {
      setStep(prev => prev + 1);
      return;
    }

    if (!description.trim()) return;

    setLoading(true);
    if (hasSupabaseConfig) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase.from('begs').insert({
          user_id: user.id,
          title: `${category} Request`,
          description,
          category,
          points_reward: 50, // Default reward for now
          is_urgent: false,
          location: 'Remote'
        });

        if (error) throw error;
        onSuccess();
      } catch (error) {
        console.error('Error posting beg:', error);
        alert('Failed to post beg. Make sure you are logged in!');
      }
    } else {
      // Mock success for demo
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
    setLoading(false);
  };

  return (
    <div className="pt-6 px-1">
      <div className="mb-10 text-left">
        <div className="flex justify-between items-end mb-3">
          <h1 className="baloo text-3xl font-extrabold text-begi-navy">Post a Beg</h1>
          <span className="baloo font-bold text-begi-blue text-sm">Step {step} of 2</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full border-2 border-begi-navy relative overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-begi-turquoise rounded-full border-r-2 border-begi-navy transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="space-y-10 pb-40">
        {step === 1 && (
          <section>
            <label className="block baloo text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest text-left">Choose a Category</label>
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "btn-pop group flex flex-col items-center justify-center p-6 border-4 border-begi-navy rounded-[24px] transition-all",
                    category === cat.id 
                      ? `bg-white cartoon-shadow` 
                      : "bg-white opacity-40 border-slate-200 grayscale hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-begi-navy mb-2 transition-transform group-hover:rotate-12",
                    cat.color
                  )}>
                    {React.cloneElement(cat.icon as React.ReactElement, { className: "w-8 h-8 text-white fill-current" })}
                  </div>
                  <span className={cn(
                    "baloo text-lg font-bold text-begi-navy"
                  )}>{cat.id}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-3 animate-in fade-in slide-in-from-right-4">
            <label className="block baloo text-sm font-bold text-slate-400 uppercase tracking-widest text-left">The "Why"</label>
            <div className="relative">
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[180px] bg-white border-4 border-begi-navy rounded-[24px] p-6 font-sans text-base font-medium focus:ring-0 focus:border-begi-turquoise transition-colors placeholder:text-slate-200 outline-none text-left"
                placeholder="I really need a pizza because I just finished my finals and I'm starving..."
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-begi-bg px-3 py-1 rounded-full border-2 border-begi-navy">
                <span className="baloo font-bold text-[10px] text-begi-navy">{description.length}/300</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic px-2 text-left">Be honest and mischievous – it works better!</p>
          </section>
        )}
      </div>

      <div className="fixed bottom-24 left-0 w-full px-6 flex gap-4 z-40 bg-gradient-to-t from-begi-bg via-begi-bg to-transparent pt-12 pb-6">
        <button 
          onClick={step === 1 ? onCancel : () => setStep(1)}
          className="flex-1 py-4 bg-white border-2 border-begi-navy rounded-xl baloo font-bold text-begi-navy cartoon-shadow btn-pop"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading || (step === 2 && !description.trim())}
          className="flex-[2] py-4 bg-begi-turquoise border-2 border-begi-navy rounded-xl baloo font-bold text-white cartoon-shadow btn-pop flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {step === 1 ? 'Continue' : 'Post Beg'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
