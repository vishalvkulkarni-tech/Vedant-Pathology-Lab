import BookingForm from '@/components/booking/BookingForm';

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="py-12 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Booking</h1>
        <p className="text-gray-600 mt-2">Accurate results start with a simple booking</p>
      </div>
      <BookingForm itemId={id} />
    </div>
  );
}
