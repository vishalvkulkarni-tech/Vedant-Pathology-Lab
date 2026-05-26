'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Phone, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    adminCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log("Starting signup process for:", formData.email);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phone,
            admin_code: formData.adminCode,
          }
        }
      });

      if (authError) {
        console.error("Auth Signup Error:", authError);
        alert(`Auth Error: ${authError.message}`);
      } else {
        console.log("Auth Signup Success, user created:", data.user?.id);
        
        alert('Signup successful! ' + (formData.adminCode === 'VEDANT_ADMIN_2026' ? 'Admin account created.' : 'Please check your email to verify your account.'));
        router.push('/login');
      }
    } catch (err) {
      console.error("Unexpected Error during signup:", err);
      alert(`Unexpected Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join Vedant Lab to track your health journey</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" required
                className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="tel" required
                className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" required
                className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" required
                className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-bold text-gray-700 mb-1">Admin Access Code (Optional)</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password"
                className="w-full pl-12 p-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Leave blank if patient"
                value={formData.adminCode}
                onChange={(e) => setFormData({...formData, adminCode: e.target.value})}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Only for lab staff to gain admin privileges.</p>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
