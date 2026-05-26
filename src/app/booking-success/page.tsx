'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl text-center border">
      <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h1>
      <p className="text-gray-600 mb-8">
        Your order <span className="font-bold text-gray-900">#{orderId?.slice(-6).toUpperCase()}</span> has been placed successfully.
      </p>

      <div className="space-y-4">
        <Link 
          href="/" 
          className="w-full flex items-center justify-center py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition"
        >
          Back to Home <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
        
        <a 
          href={`https://wa.me/919876543210?text=Hi, I just booked a test with Order ID: ${orderId}. Please confirm my appointment.`}
          target="_blank"
          className="w-full flex items-center justify-center py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Update on WhatsApp
        </a>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        You will receive a confirmation message shortly.
      </p>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="py-20 px-4 bg-gray-50 min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
