'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { FileDown, ClipboardList, CheckCircle, Clock, Loader2, User } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const [profileRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('*, reports(*)').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      
      setProfile(profileRes.data);
      setOrders(ordersRes.data || []);
    }
    setIsLoading(false);
  }

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600">View your order history and download reports</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border shadow-sm flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <User className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-none">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 mt-1">{profile?.phone_number}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
        Recent Orders
      </h2>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin inline-block mr-2" /> Loading your history...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed p-10">
            <p className="text-gray-500 mb-6">You haven't booked any tests yet.</p>
            <Link href="/tests" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition">
              Browse Tests
            </Link>
          </div>
        ) : orders.map((order) => (
          <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-xs text-gray-400">Order #{order.id.slice(-6).toUpperCase()}</span>
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">Pathology Test Order</h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {order.scheduled_date}</span>
                  <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                </div>
              </div>

              <div className="flex items-center">
                {order.reports && order.reports.length > 0 ? (
                  <a 
                    href={order.reports[0].file_url} 
                    target="_blank"
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition shadow-lg"
                  >
                    <FileDown className="w-5 h-5 mr-2" />
                    Download Report
                  </a>
                ) : (
                  <div className="flex items-center text-gray-400 font-medium bg-gray-50 px-6 py-3 rounded-2xl border border-dashed">
                    <Clock className="w-5 h-5 mr-2" />
                    Report Pending
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
