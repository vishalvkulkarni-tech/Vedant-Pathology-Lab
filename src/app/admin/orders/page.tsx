'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { FileUp, ClipboardList, CheckCircle, Clock, MapPin, Loader2, Search } from 'lucide-react';

export default function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setOrders(data || []);
    setIsLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) alert(error.message);
    else fetchOrders();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, order: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOrderId(order.id);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${order.patient_name.replace(/\s+/g, '_')}_${order.id.slice(0, 8)}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploadingOrderId(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(filePath);

    // Save to reports table
    const { error: reportError } = await supabase.from('reports').insert([{
      order_id: order.id,
      user_id: order.user_id,
      file_url: publicUrl,
      file_name: fileName
    }]);

    if (reportError) alert(reportError.message);
    else {
      alert('Report uploaded successfully!');
      updateStatus(order.id, 'completed');
    }
    
    setUploadingOrderId(null);
  }

  const filteredOrders = orders.filter(o => 
    o.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Search orders..." 
            className="pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20"><Loader2 className="animate-spin inline-block mr-2" /> Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">No orders found.</div>
        ) : filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${order.collection_type === 'home' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {order.collection_type === 'home' ? <MapPin /> : <ClipboardList />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg text-gray-900">{order.patient_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{order.patient_phone} • {order.order_items?.[0]?.item_name}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-400 space-x-4">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {order.scheduled_date} at {order.scheduled_slot}</span>
                    <span className="font-bold text-gray-700">₹{order.total_amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {order.status !== 'completed' && (
                  <>
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'confirmed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                      >
                        Confirm Order
                      </button>
                    )}
                    <label className={`cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center ${uploadingOrderId === order.id ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploadingOrderId === order.id ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                      Upload Report
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileUpload(e, order)} />
                    </label>
                  </>
                )}
                {order.status === 'completed' && (
                  <div className="flex items-center text-green-600 font-bold text-sm">
                    <CheckCircle className="w-5 h-5 mr-1" /> Completed
                  </div>
                )}
              </div>
            </div>
            {order.collection_type === 'home' && order.address && (
              <div className="px-6 pb-4 pt-0 text-sm text-gray-600 border-t border-gray-50 flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                <span className="italic">{order.address}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
