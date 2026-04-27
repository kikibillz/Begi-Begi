import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, User } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

import { toast } from 'sonner';

export default function Auth({ onSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) throw new Error('Username is required');

        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim().replace('@', ''),
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (user) {
          // Create profile immediately with starting stats
          // Using insert + specific fields help avoid RLS conflicts with existing auto-generated profiles
          const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            username: username.trim().replace('@', ''),
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            points: 100,
            level: 1,
            xp: 0
          });
          
          if (profileError) {
             if (profileError.code === '23505') {
               // Username already taken error
               toast.error('Username already taken. Please pick another one.');
               // Don't throw here so we don't break the auth flow, but let them know
             } else {
               console.error('Initial profile creation error:', profileError);
             }
          } else {
            toast.success('Legacy created! Welcome to the tribe.');
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Identity verified. Entering iBeg...');
      }
      onSuccess();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-slate-50">
      <div className="w-full max-w-sm bg-white border-4 border-begi-navy rounded-[40px] p-10 cartoon-shadow text-left">
        <h1 className="font-display text-4xl font-black text-begi-navy mb-2 tracking-tighter">
          {isSignUp ? 'Create Legacy' : 'Welcome Back'}
        </h1>
        <p className="text-slate-400 font-medium mb-10">
          {isSignUp ? 'Start your kindness journey.' : 'Your tribe awaits your return.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <label className="font-display text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 bg-white border-4 border-begi-navy rounded-2xl font-sans text-sm font-bold focus:shadow-none outline-none transition-all"
                  placeholder="kindness_hero"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-display text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-white border-4 border-begi-navy rounded-2xl font-sans text-sm font-bold focus:shadow-none outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-display text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-white border-4 border-begi-navy rounded-2xl font-sans text-sm font-bold focus:shadow-none outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-begi-turquoise text-white font-display font-black text-xl border-4 border-begi-navy rounded-[28px] cartoon-shadow btn-pop flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? 'Join Tribe' : 'Authenticate')}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-8 text-slate-400 font-display font-black text-xs uppercase tracking-widest hover:text-begi-turquoise transition-colors"
        >
          {isSignUp ? 'Return to login' : 'Establish new identity'}
        </button>
      </div>
    </div>
  );
}
