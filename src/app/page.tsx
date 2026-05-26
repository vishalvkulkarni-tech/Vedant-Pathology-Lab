'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, ChevronRight, Activity, ShieldCheck, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'test' | 'package';
}

export default function Home() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchCatalog() {
      const { data } = await supabase
        .from('catalog')
        .select('*')
        .eq('is_available', true)
        .limit(6);
      setItems(data || []);
      setIsLoading(false);
    }
    fetchCatalog();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Quality Healthcare at Your Doorstep
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Book blood tests and health packages from the comfort of your home. 
            Accurate results, expert care.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
            <Link 
              href="/tests" 
              className="w-full md:w-auto px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Book a Test
            </Link>
            <Link 
              href="/packages" 
              className="w-full md:w-auto px-8 py-4 border-2 border-white rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition"
            >
              Health Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <div className="max-w-4xl mx-auto w-full px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center border">
          <Search className="text-gray-400 w-6 h-6 ml-2" />
          <input 
            type="text" 
            placeholder="Search for blood tests, diabetes profile, thyroid..." 
            className="flex-1 p-3 outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition hidden md:block">
            Search
          </button>
        </div>
      </div>

      {/* Featured Tests */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Tests</h2>
            <p className="text-gray-600 mt-2">Most popular tests booked by our patients</p>
          </div>
          <Link href="/tests" className="text-blue-600 font-semibold flex items-center hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>)
          ) : items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border hover:border-blue-500 hover:shadow-lg transition group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition">
                  <Activity className="text-blue-600 w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">₹{item.price}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-6 line-clamp-2">{item.description}</p>
              <Link 
                href={`/book/${item.id}`} 
                className="w-full block text-center py-3 bg-blue-50 text-blue-600 rounded-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Vedant Pathology Lab?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-6">
                <ShieldCheck className="w-10 h-10 text-green-500" />
              </div>
              <h4 className="text-xl font-bold mb-3">NABL Accredited</h4>
              <p className="text-gray-600">We follow international standards to ensure the highest accuracy for every test.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-6">
                <Clock className="w-10 h-10 text-blue-500" />
              </div>
              <h4 className="text-xl font-bold mb-3">Timely Reports</h4>
              <p className="text-gray-600">Receive your digital reports via SMS and Email within 24 hours.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-6">
                <MapPin className="w-10 h-10 text-red-500" />
              </div>
              <h4 className="text-xl font-bold mb-3">Home Collection</h4>
              <p className="text-gray-600">Free home sample collection by our trained and certified phlebotomists.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Vedant Pathology Lab</h3>
            <p className="text-gray-400 max-w-sm">
              Providing reliable and accurate diagnostic services since 2010. Committed to your health and well-being.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/tests">All Tests</Link></li>
              <li><Link href="/packages">Health Packages</Link></li>
              <li><Link href="/login">Patient Login</Link></li>
              <li><Link href="/admin">Admin Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <p className="text-gray-400">
              123 Main St, City<br />
              +91 9876543210<br />
              support@vedantlab.com
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          © 2026 Vedant Pathology Lab. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
