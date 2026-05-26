'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsManager() {
  const [labDetails, setLabDetails] = useState({
    name: '',
    address: '',
    phone: '',
    upi_id: '',
  });
  const [timeslots, setTimeslots] = useState({
    start: '07:30',
    end: '21:00',
    interval: 30,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setIsLoading(true);
    const { data, error } = await supabase.from('settings').select('*');
    if (error) {
      console.error('Error fetching settings:', error);
    } else {
      data?.forEach((s) => {
        if (s.key === 'lab_details') setLabDetails(s.value);
        if (s.key === 'timeslots') setTimeslots(s.value);
      });
    }
    setIsLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    
    const updates = [
      { key: 'lab_details', value: labDetails },
      { key: 'timeslots', value: timeslots },
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from('settings')
        .upsert(update, { onConflict: 'key' });
      if (error) {
        alert(`Error saving ${update.key}: ${error.message}`);
        break;
      }
    }
    
    setIsSaving(false);
    alert('Settings saved successfully!');
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin mr-2" /> Loading settings...</div>;

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Global Lab Settings</h2>
      
      <form onSubmit={handleSave} className="space-y-8">
        {/* Lab Details Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Lab Name</label>
              <input 
                value={labDetails.name} 
                onChange={(e) => setLabDetails({...labDetails, name: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contact Phone</label>
              <input 
                value={labDetails.phone} 
                onChange={(e) => setLabDetails({...labDetails, phone: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Lab Address</label>
              <textarea 
                value={labDetails.address} 
                onChange={(e) => setLabDetails({...labDetails, address: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-20" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">UPI ID for Payments</label>
              <input 
                value={labDetails.upi_id} 
                onChange={(e) => setLabDetails({...labDetails, upi_id: e.target.value})}
                placeholder="e.g. yourname@upi"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono" 
              />
            </div>
          </div>
        </section>

        {/* Operational Timings Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Operational Timings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
              <input 
                type="time"
                value={timeslots.start} 
                onChange={(e) => setTimeslots({...timeslots, start: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
              <input 
                type="time"
                value={timeslots.end} 
                onChange={(e) => setTimeslots({...timeslots, end: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Slot Interval (mins)</label>
              <select 
                value={timeslots.interval} 
                onChange={(e) => setTimeslots({...timeslots, interval: parseInt(e.target.value)})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center shadow-lg disabled:bg-blue-400"
          >
            {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
