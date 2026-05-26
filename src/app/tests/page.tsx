'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, Activity, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchCatalog() {
      const { data } = await supabase
        .from('catalog')
        .select('*')
        .eq('category', 'test')
        .eq('is_available', true);
      setItems(data || []);
      setIsLoading(false);
    }
    fetchCatalog();
  }, []);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Diagnostic Tests</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Browse our comprehensive list of individual blood tests and diagnostic services.</p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-md p-2 flex items-center border">
          <Search className="text-gray-400 w-6 h-6 ml-3" />
          <input 
            type="text" 
            placeholder="Search for tests..." 
            className="flex-1 p-3 outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl"></div>)
        ) : filteredItems.map((item) => (
          <div key={item.id} className="bg-white p-8 rounded-3xl border hover:border-blue-500 hover:shadow-xl transition group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition">
                <Activity className="text-blue-600 w-8 h-8" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Price</p>
                <span className="text-3xl font-black text-gray-900">₹{item.price}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.name}</h3>
            <p className="text-gray-600 mb-8 flex-grow">{item.description}</p>
            <Link 
              href={`/book/${item.id}`} 
              className="w-full block text-center py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Book Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
