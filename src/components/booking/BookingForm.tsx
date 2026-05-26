'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Building, CreditCard, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format, addDays, startOfDay, isAfter, parse } from 'date-fns';

const MapPicker = dynamic(() => import('./MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

interface BookingFormProps {
  itemId: string;
}

export default function BookingForm({ itemId }: BookingFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [item, setItem] = useState<any>(null);
  const [labDetails, setLabDetails] = useState<any>(null);
  const [timeslotsConfig, setTimeslotsConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    collection_type: 'lab',
    address: '',
    location_lat: 19.0760, // Default to Mumbai or similar
    location_lng: 72.8777,
    scheduled_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    scheduled_slot: '',
  });

  useEffect(() => {
    async function fetchData() {
      const [itemRes, settingsRes] = await Promise.all([
        supabase.from('catalog').select('*').eq('id', itemId).single(),
        supabase.from('settings').select('*')
      ]);

      if (itemRes.data) setItem(itemRes.data);
      
      settingsRes.data?.forEach(s => {
        if (s.key === 'lab_details') setLabDetails(s.value);
        if (s.key === 'timeslots') setTimeslotsConfig(s.value);
      });

      setIsLoading(false);
    }
    fetchData();
  }, [itemId]);

  const generateSlots = () => {
    if (!timeslotsConfig) return [];
    const slots = [];
    let current = parse(timeslotsConfig.start, 'HH:mm', new Date());
    const end = parse(timeslotsConfig.end, 'HH:mm', new Date());
    
    while (isAfter(end, current)) {
      slots.push(format(current, 'hh:mm a'));
      current = new Date(current.getTime() + timeslotsConfig.interval * 60000);
    }
    return slots;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        patient_name: formData.patient_name,
        patient_phone: formData.patient_phone,
        collection_type: formData.collection_type,
        address: formData.address,
        location_lat: formData.collection_type === 'home' ? formData.location_lat : null,
        location_lng: formData.collection_type === 'home' ? formData.location_lng : null,
        scheduled_date: formData.scheduled_date,
        scheduled_slot: formData.scheduled_slot,
        total_amount: item.price,
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      alert(orderError.message);
      setIsSubmitting(false);
      return;
    }

    // Insert order item
    await supabase.from('order_items').insert([{
      order_id: orderData.id,
      item_id: item.id,
      item_name: item.name,
      price_at_time: item.price
    }]);

    router.push(`/booking-success?id=${orderData.id}`);
  };

  const upiUrl = labDetails ? `upi://pay?pa=${labDetails.upi_id}&pn=${encodeURIComponent(labDetails.name)}&am=${item?.price}&cu=INR&tn=Order_for_${encodeURIComponent(item?.name)}` : '';

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Progress Sidebar */}
        <div className="bg-blue-600 md:w-64 p-8 text-white">
          <h2 className="text-xl font-bold mb-8">Booking Process</h2>
          <div className="space-y-6">
            {[
              { n: 1, label: 'Patient Info' },
              { n: 2, label: 'Date & Time' },
              { n: 3, label: 'Collection' },
              { n: 4, label: 'Payment' }
            ].map((s) => (
              <div key={s.n} className={`flex items-center space-x-3 ${step >= s.n ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === s.n ? 'bg-white text-blue-600' : 'bg-blue-500 text-white border border-blue-400'}`}>
                  {s.n}
                </div>
                <span className="font-medium">{s.label}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-4 bg-blue-500 rounded-2xl border border-blue-400">
            <p className="text-sm opacity-80 mb-1">Selected Test</p>
            <p className="font-bold text-lg leading-tight">{item.name}</p>
            <p className="text-2xl font-black mt-2">₹{item.price}</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-gray-900">Patient Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input 
                  className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter patient's full name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <input 
                  className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="10-digit mobile number"
                  value={formData.patient_phone}
                  onChange={(e) => setFormData({...formData, patient_phone: e.target.value})}
                />
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.patient_name || !formData.patient_phone}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition disabled:bg-gray-300"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-gray-900">Select Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="date"
                      min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                      className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeslot</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select 
                      className="w-full pl-12 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={formData.scheduled_slot}
                      onChange={(e) => setFormData({...formData, scheduled_slot: e.target.value})}
                    >
                      <option value="">Select a slot</option>
                      {generateSlots().map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 border rounded-2xl font-bold text-gray-600 hover:bg-gray-50">Back</button>
                <button 
                  onClick={() => setStep(3)} 
                  disabled={!formData.scheduled_slot}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition disabled:bg-gray-300"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-2xl font-bold text-gray-900">Collection Method</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, collection_type: 'lab'})}
                  className={`p-6 rounded-2xl border-2 transition text-left flex flex-col items-center justify-center space-y-2 ${formData.collection_type === 'lab' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                >
                  <Building className="w-8 h-8" />
                  <span className="font-bold">Visit Lab</span>
                </button>
                <button 
                  onClick={() => setFormData({...formData, collection_type: 'home'})}
                  className={`p-6 rounded-2xl border-2 transition text-left flex flex-col items-center justify-center space-y-2 ${formData.collection_type === 'home' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                >
                  <MapPin className="w-8 h-8" />
                  <span className="font-bold">Home Pickup</span>
                </button>
              </div>

              {formData.collection_type === 'home' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pick up Location (Drop Pin)</label>
                    <MapPicker 
                      lat={formData.location_lat} 
                      lng={formData.location_lng} 
                      onChange={(lat, lng) => setFormData({...formData, location_lat: lat, location_lng: lng})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Address Details</label>
                    <textarea 
                      placeholder="Flat/House No, Building Name, Landmark..."
                      className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {formData.collection_type === 'lab' && (
                <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 mb-1">Lab Address:</p>
                  <p className="font-semibold text-gray-700">{labDetails?.address}</p>
                </div>
              )}

              <div className="flex space-x-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 border rounded-2xl font-bold text-gray-600 hover:bg-gray-50">Back</button>
                <button 
                  onClick={() => setStep(4)} 
                  disabled={formData.collection_type === 'home' && !formData.address}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition disabled:bg-gray-300"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-center">
              <h3 className="text-2xl font-bold text-gray-900">Payment (Scan & Pay)</h3>
              <p className="text-gray-600">Scan the QR code below using any UPI app to complete the payment of <span className="font-bold text-gray-900">₹{item.price}</span>.</p>
              
              <div className="bg-white p-6 inline-block rounded-3xl border shadow-sm mx-auto">
                <QRCodeSVG value={upiUrl} size={200} />
                <div className="mt-4 flex items-center justify-center text-gray-700 font-mono text-sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {labDetails?.upi_id}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 text-sm text-yellow-800">
                Please take a screenshot of your payment confirmation to show at the lab or to our phlebotomist.
              </div>

              <div className="flex space-x-4 pt-4">
                <button onClick={() => setStep(3)} className="flex-1 py-4 border rounded-2xl font-bold text-gray-600 hover:bg-gray-50">Back</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition shadow-lg flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
