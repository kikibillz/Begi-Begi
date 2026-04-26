import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, User } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || email}`,
            }
          }
        });
        if (error) throw error;
        
        // Profiles are automatically created via triggers usually, 
        // but here we'll assume a profile is needed.
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username: username || email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || email}`,
            points: 100 // Starting gift
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-begi-bg">
      <div className="w-full max-w-md bg-white border-4 border-begi-navy rounded-[32px] p-8 cartoon-shadow text-left">
        <h1 className="baloo text-4xl font-extrabold text-begi-navy mb-2">Welcome! 👋</h1>
        <p className="text-slate-500 font-medium mb-8">Join the kindest begging community.</p>

        <form onSubmit={handleAuth} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <label className="baloo font-bold text-sm text-slate-400 uppercase tracking-widest px-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 bg-slate-50 border-2 border-begi-navy rounded-xl focus:ring-0 focus:border-begi-turquoise transition-colors"
                  placeholder="TheBestBegger"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="baloo font-bold text-sm text-slate-400 uppercase tracking-widest px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-slate-50 border-2 border-begi-navy rounded-xl focus:ring-0 focus:border-begi-turquoise transition-colors"
                placeholder="you@kindness.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="baloo font-bold text-sm text-slate-400 uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-slate-50 border-2 border-begi-navy rounded-xl focus:ring-0 focus:border-begi-turquoise transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-begi-turquoise text-white baloo font-bold text-xl border-2 border-begi-navy rounded-xl cartoon-shadow btn-pop flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? 'Join Begi-begi' : 'Log In')}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-6 text-slate-400 font-bold text-sm hover:text-begi-turquoise transition-colors"
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Join us"}
        </button>
      </div>
    </div>
  );
}
