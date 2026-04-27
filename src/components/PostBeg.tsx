import React, { useState } from 'react';
import { Package2, Banknote, HandHeart, Ticket, Coffee, Heart, Camera, X, ArrowRight, Loader2, Sparkles, Utensils } from 'lucide-react';
import { toast } from 'sonner';
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
  const [recipientUsername, setRecipientUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateReward = (desc: string, cat: string) => {
    let base = 20;
    const lengthBonus = Math.floor(desc.length / 50) * 10;
    const categoryMod = cat === 'Money' ? 30 : (cat === 'Help' || cat === 'Favors' ? 20 : 10);
    return base + lengthBonus + categoryMod;
  };

  const categories: { id: Category; icon: React.ReactNode; color: string }[] = [
    { id: 'Items', icon: <Package2 />, color: 'bg-begi-turquoise' },
    { id: 'Money', icon: <Banknote />, color: 'bg-begi-orange' },
    { id: 'Favors', icon: <HandHeart />, color: 'bg-slate-200' },
    { id: 'Experiences', icon: <Ticket />, color: 'bg-begi-yellow' },
    { id: 'Coffee', icon: <Coffee />, color: 'bg-begi-pink' },
    { id: 'Food', icon: <Utensils />, color: 'bg-begi-orange' },
    { id: 'Help', icon: <Heart className="w-8 h-8 text-white" />, color: 'bg-begi-turquoise' },
  ];

  const pointsReward = calculateReward(description, category);

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
        if (!user) throw new Error('You must be logged in to post a beg.');

        // 1. Resolve recipient if provided
        let target_user_id = null;
        if (recipientUsername.trim()) {
          const cleanUsername = recipientUsername.trim().replace('@', '');
          const { data: targetProfile, error: targetError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', cleanUsername)
            .maybeSingle();
          
          if (targetError) throw targetError;
          if (!targetProfile) {
            throw new Error(`Could not find user "@${cleanUsername}". Please check the spelling!`);
          }
          target_user_id = targetProfile.id;
        }

        // 2. Ensure profile exists and check points
        const { data: profile, error: profileFetchError } = await supabase
          .from('profiles')
          .select('id, points')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileFetchError) throw profileFetchError;
        
        if (!profile) {
          // Attempt to create if missing
          const baseUsername = user.user_metadata?.username || user.email?.split('@')[0] || `user_${user.id.slice(0, 5)}`;
          // Use insert instead of upsert to avoid RLS update conflicts on first visit
          const { error: profileCreateError } = await supabase.from('profiles').insert({
            id: user.id,
            username: baseUsername,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            points: 100, // Client insert works if SQL policies from above are applied
            level: 1,
            xp: 0
          });

          if (profileCreateError) {
            // If it already exists, just ignore the error and proceed
            if (profileCreateError.code !== '23505') {
              console.error('Profile creation error:', profileCreateError);
              // We don't throw here to allow the beg to be posted regardless
            }
          }
        } else if ((profile.points || 0) < 5) {
          throw new Error('Insufficient Karma Points. You need at least 5 pts to launch a mission!');
        }

        // 3. Insert beg
        const pointsRewardTotal = calculateReward(description, category);
        const { error: begError } = await supabase.from('begs').insert({
          user_id: user.id,
          target_user_id,
          title: recipientUsername ? `Private ${category} for ${recipientUsername}` : `${category} Mission`,
          description: description.trim(),
          category,
          points_reward: pointsRewardTotal,
          is_urgent: description.length > 200,
          location: 'Remote',
          status: 'pending'
        });

        if (begError) throw new Error(`Database error: ${begError.message}`);

        // 4. Deduct Karma Fee (5 pts)
        const { error: rpcError } = await supabase.rpc('increment_user_points', {
          user_id: user.id,
          amount: -5,
          xp_amount: 10
        });
        
        if (rpcError) {
          console.warn('Points deduction failed (likely missing SQL function). Mission still launched.', rpcError);
          // Don't throw here, the beg was already created successfully
        }

        await supabase.from('activity_history').insert({
          user_id: user.id,
          title: `Proposed: ${category}`,
          granted_to: recipientUsername || 'Public',
          points: -5,
          type: 'creation',
          icon: 'auto_awesome'
        });

        toast.success('Mission Launched! Check your points.');
        onSuccess();
      } catch (error) {
        console.error('Error posting beg:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to post beg.');
      }
    } else {
      setTimeout(() => onSuccess(), 1000);
    }
    setLoading(false);
  };

  return (
    <div className="pt-6 px-1">
      <div className="mb-10 text-left">
        <div className="flex justify-between items-end mb-3">
          <h1 className="font-display text-3xl font-black text-begi-navy">Post a Beg</h1>
          <span className="font-display font-medium text-begi-blue text-sm">Step {step} of 2</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full border-2 border-begi-navy relative overflow-hidden text-left">
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
            <label className="block font-display text-xs font-black text-slate-400 mb-4 uppercase tracking-[0.2em] text-left">Choose a Category</label>
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "btn-pop group flex flex-col items-center justify-center p-6 border-4 border-begi-navy rounded-[28px] transition-all",
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
                    "font-display text-lg font-black text-begi-navy"
                  )}>{cat.id}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-2">
              <label className="block font-display text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-left">The Mission</label>
              <div className="relative">
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[160px] bg-white border-4 border-begi-navy rounded-[28px] p-6 font-sans text-base font-medium focus:shadow-none transition-all placeholder:text-slate-200 outline-none text-left"
                  placeholder="I really need a pizza because I just finished my finals and I'm starving..."
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <div className="bg-begi-turquoise/10 text-begi-turquoise border-2 border-begi-turquoise px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    +{pointsReward} Ibeg Points for Grantor
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-full border-2 border-begi-navy">
                    <span className="font-display font-black text-[10px] text-begi-navy">{description.length}/300</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-display text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-left">Private Beg (Optional)</label>
              <div className="relative">
                <input 
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  className="w-full bg-white border-4 border-begi-navy rounded-2xl p-4 font-sans text-sm font-bold focus:shadow-none transition-all placeholder:text-slate-200 outline-none text-left"
                  placeholder="@username (Leave blank for public)"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic px-2 text-left">Only you and the recipient will see this beg if you set a username.</p>
            </div>

            <div className="bg-begi-navy text-white p-6 rounded-[28px] cartoon-shadow flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-begi-turquoise mb-1">Karma Fee</p>
                <p className="text-xs font-medium opacity-80">Building your legacy costs a small act of Karma.</p>
              </div>
              <div className="bg-white text-begi-navy px-4 py-2 rounded-2xl font-display font-black text-lg">
                -5 <span className="text-[10px]">pts</span>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-24 left-0 w-full px-6 flex gap-4 z-40 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pt-12 pb-6">
        <button 
          onClick={step === 1 ? onCancel : () => setStep(1)}
          className="flex-1 py-4 bg-white border-2 border-begi-navy rounded-2xl font-display font-black text-begi-navy cartoon-shadow btn-pop"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading || (step === 2 && !description.trim())}
          className="flex-[2] py-4 bg-begi-turquoise border-2 border-begi-navy rounded-2xl font-display font-black text-white cartoon-shadow btn-pop flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {step === 1 ? 'Next Step' : 'Launch Beg'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
