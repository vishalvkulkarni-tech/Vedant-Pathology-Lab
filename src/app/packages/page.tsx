'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function PackagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchCatalog() {
      const { data } = await supabase
        .from('catalog')
        .select('*')
        .eq('category', 'package')
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
        <h1 className="text-4xl font-black text-gray-900 mb-4">Health Packages</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive health checkups designed for you and your family.</p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white rounded-2xl shadow-md p-2 flex items-center border">
          <Search className="text-gray-400 w-6 h-6 ml-3" />
          <input 
            type="text" 
            placeholder="Search for packages..." 
            className="flex-1 p-3 outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-3xl"></div>)
        ) : filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl border-2 hover:border-blue-500 hover:shadow-2xl transition group flex flex-col overflow-hidden">
            <div className="bg-blue-600 p-8 text-white text-center">
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
              <p className="text-blue-100 text-sm opacity-80">Full Body Coverage</p>
            </div>
            
            <div className="p-8 flex-grow">
              <div className="text-center mb-8">
                <span className="text-sm text-gray-500 font-medium">Starting from</span>
                <div className="text-4xl font-black text-gray-900">₹{item.price}</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {item.description.split(',').map((feat: string, i: number) => (
                  <li key={i} className="flex items-start text-gray-600">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feat.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 pt-0">
              <Link 
                href={`/book/${item.id}`} 
                className="w-full block text-center py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg"
              >
                Book Package
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
