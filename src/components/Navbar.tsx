'use client';

import Link from 'next/link';
import { Beaker, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Beaker className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Vedant Lab</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition">Home</Link>
            <Link href="/tests" className="text-gray-600 hover:text-blue-600 font-medium transition">Tests</Link>
            <Link href="/packages" className="text-gray-600 hover:text-blue-600 font-medium transition">Packages</Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600 font-medium">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          <Link href="/" className="block text-gray-600 font-medium px-2">Home</Link>
          <Link href="/tests" className="block text-gray-600 font-medium px-2">Tests</Link>
          <Link href="/packages" className="block text-gray-600 font-medium px-2">Packages</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-gray-600 font-medium px-2">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="block w-full text-left text-red-600 font-medium px-2"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="block text-blue-600 font-medium px-2">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
