'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Log in to access your reports and history</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email / Mobile ID</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                required
                className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="yourname@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                required
                className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Don't have an account? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Sign up for free</Link>
        </div>
      </div>
    </div>
  );
}
