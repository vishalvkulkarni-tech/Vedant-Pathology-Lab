'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Users, ClipboardList, Beaker, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    catalogItems: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      
      const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: catalogCount } = await supabase.from('catalog').select('*', { count: 'exact', head: true });
      const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('payment_status', 'paid');
      
      const revenue = revenueData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

      setStats({
        totalOrders: ordersCount || 0,
        pendingOrders: pendingCount || 0,
        catalogItems: catalogCount || 0,
        totalRevenue: revenue,
      });
      setIsLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: CheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'Catalog Items', value: stats.catalogItems, icon: Beaker, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h3 className="text-lg font-semibold mb-2">Welcome to your Lab Admin Panel</h3>
        <p className="text-gray-600 mb-6">Manage your tests, view orders, and update global settings from the sidebar.</p>
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">View Recent Orders</button>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Upload Reports</button>
        </div>
      </div>
    </div>
  );
}
