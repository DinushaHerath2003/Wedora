'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaCheckCircle, FaHome, FaMoneyBillWave, FaPaperPlane, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

type VenueCategory = 'hotel-rooms' | 'banquet-halls' | 'outdoor-venues';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface PackageDetail {
  id: number;
  vendorId: number;
  name: string;
  description: string;
  category: string;
  price: number;
  facilities: string[] | null;
  roomType?: string;
  stock?: number;
  discount?: string;
  discountType?: string;
  images: string[] | null;
  isDraft: boolean;
  createdAt: string;
}

interface BookingItem {
  id: number;
  eventDate: string;
  eventTime: string | null;
  status: BookingStatus;
  clientName?: string | null;
}

interface VendorUser {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  organizationName?: string;
}

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.vendorId as string;
  const packageId = params.packageId as string;

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [user, setUser] = useState<VendorUser | null>(null);
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [bookingNote, setBookingNote] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const calendarMonth = useMemo(() => currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }), [currentDate]);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDayOfWeek = firstDay.getDay();

  const organizationName = packageData ? `${packageData.name}` : 'Book a Meeting';

  const getCategoryLabel = (category: string) => {
    if (category === 'hotel-rooms' || category === 'hotel-room') return 'Hotel Rooms';
    if (category === 'banquet-halls' || category === 'banquet-hall') return 'Banquet Halls';
    if (category === 'outdoor-venues' || category === 'outdoor-venue') return 'Outdoor Venues';
    return category;
  };

  const dateKey = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isSlotBooked = (dateStr: string, timeSlot: string) =>
    bookings.some((booking) => booking.eventDate === dateStr && booking.eventTime === timeSlot && booking.status !== 'cancelled');

  const bookingsForDate = (dateStr: string) => bookings.filter((booking) => booking.eventDate === dateStr && booking.status !== 'cancelled');

  const hasBookingOnDate = (dateStr: string) => bookings.some((booking) => booking.eventDate === dateStr && booking.status !== 'cancelled');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr) as VendorUser;
      setUser(userData);
      setClientPhone(userData.phone || '');
    } else {
      setUser({ name: '', email: '' });
    }
  }, []);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const [offering, bookingList] = await Promise.all([
          apiFetch<PackageDetail>(`/offerings/${packageId}`),
          apiFetch<BookingItem[]>(`/bookings?vendorId=${vendorId}`),
        ]);

        setPackageData(offering);
        setBookings(bookingList.map((booking) => ({
          id: booking.id,
          eventDate: booking.eventDate.slice(0, 10),
          eventTime: booking.eventTime,
          status: booking.status,
          clientName: booking.clientName,
        })));

        if (bookingList.length > 0) {
          const today = new Date();
          setSelectedDate(dateKey(today));
        } else {
          setSelectedDate(dateKey(new Date()));
        }
      } catch (error) {
        console.error('Failed to load meeting booking data', error);
        setToast({
          message: 'Unable to load booking calendar. Please try again.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (vendorId && packageId) {
      fetchBookingData();
    }
  }, [packageId, vendorId]);

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleRequestBooking = async () => {
    if (!packageData || !selectedDate) {
      setToast({ message: 'Select a date before requesting a booking.', type: 'error' });
      return;
    }

    if (isSlotBooked(selectedDate, selectedTime)) {
      setToast({ message: 'That time slot is already booked. Please choose another slot.', type: 'error' });
      return;
    }

    const userId = typeof user?.id === 'string' || typeof user?.id === 'number' ? String(user.id) : '';

    if (!userId) {
      setToast({ message: 'Please log in before requesting a booking.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiFetch<any>('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          offeringId: packageData.id,
          vendorId: packageData.vendorId,
          userId,
          eventDate: selectedDate,
          eventTime: selectedTime,
          clientName: user?.name || 'Guest User',
          clientEmail: user?.email || '',
          clientPhone,
          notes: bookingNote || `Meeting request for ${packageData.name}`,
        }),
      });

      const nextBooking: BookingItem = {
        id: Number(response.id),
        eventDate: selectedDate,
        eventTime: selectedTime,
        status: response.status || 'pending',
        clientName: user?.name || 'Guest User',
      };

      setBookings((prev) => [...prev, nextBooking]);
      setToast({
        message: 'Booking request sent. The venue will review and approve it.',
        type: 'success',
      });
      setBookingNote('');
    } catch (error) {
      console.error('Failed to create booking request', error);
      setToast({
        message: `Unable to create booking request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#755A7B' }} />
          </div>
          <p className="text-gray-600">Loading meeting calendar...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f5f5f7' }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Package not found</h2>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg text-white"
            style={{ backgroundColor: '#755A7B' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const selectedBookings = selectedDate ? bookingsForDate(selectedDate) : [];

  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, dateStr };
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              <FaArrowLeft /> Back
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Book a Meeting</h1>
              <p className="text-sm text-gray-500">{packageData.name}</p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <FaHome /> Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-72 md:h-96 bg-gray-100 overflow-hidden">
              <img
                src={packageData.images?.[0] || '/pack1.png'}
                alt={packageData.name}
                className="w-full h-full object-cover"
              />
              {packageData.discount && (
                <div className="absolute top-6 right-6 bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                  {packageData.discount} OFF
                </div>
              )}
            </div>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">{getCategoryLabel(packageData.category)}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{packageData.name}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">{packageData.description}</p>
              <div className="flex flex-wrap gap-2">
                {(packageData.facilities || []).map((facility) => (
                  <span key={facility} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(117, 90, 123, 0.08)', color: '#755A7B' }}>
                    <FaCheckCircle className="inline mr-1" /> {facility}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Select Date</h3>
                <p className="text-sm text-gray-500">Booked dates and time slots are shown on the calendar.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={goPrevMonth} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><FaChevronLeft /></button>
                <button onClick={goNextMonth} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><FaChevronRight /></button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold text-gray-800">{calendarMonth}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> Available</span>
                <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> Booked</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="rounded-xl bg-transparent h-16 md:h-20" />
              ))}
              {calendarDays.map(({ day, dateStr }) => {
                const booked = hasBookingOnDate(dateStr);
                const selected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-16 md:h-20 rounded-xl border-2 p-2 text-left transition-all ${selected ? 'shadow-lg' : ''}`}
                    style={{
                      borderColor: selected ? '#755A7B' : booked ? '#ef4444' : '#e5e7eb',
                      backgroundColor: selected ? 'rgba(117, 90, 123, 0.08)' : booked ? 'rgba(239, 68, 68, 0.05)' : 'white',
                    }}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <span className="text-sm font-semibold text-gray-800">{day}</span>
                      <span className={`text-[10px] font-semibold ${booked ? 'text-red-500' : 'text-green-600'}`}>
                        {booked ? 'Booked' : 'Open'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">Meeting Request</p>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#755A7B' }}>Rs. {packageData.price.toLocaleString()}</h3>
              <p className="text-gray-500 text-sm">per day</p>
            </div>

            <div className="mb-5 p-4 rounded-lg" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
              <div className="flex items-center gap-2 mb-2">
                <FaClock style={{ color: '#755A7B' }} />
                <span className="font-semibold text-gray-800">Selected Date</span>
              </div>
              <p className="text-sm text-gray-700">{selectedDate || 'Choose a date from the calendar'}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const booked = selectedDate ? isSlotBooked(selectedDate, slot) : false;
                  const active = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked}
                      onClick={() => setSelectedTime(slot)}
                      className="rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: booked ? '#fee2e2' : active ? '#755A7B' : '#f3f4f6',
                        color: booked ? '#991b1b' : active ? 'white' : '#4b5563',
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                placeholder="07X XXX XXXX"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Note</label>
              <textarea
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
                placeholder="Tell the venue what you'd like to discuss in the meeting..."
              />
            </div>

            <button
              onClick={handleRequestBooking}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: '#755A7B' }}
            >
              <FaPaperPlane /> {submitting ? 'Sending Request...' : 'Request Booking'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Booked Slots</h3>
            {selectedBookings.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedBookings.map((booking) => (
                  <div key={booking.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{booking.eventTime || 'Time not set'}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#755A7B' }}>{booking.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">{booking.clientName || 'Guest booking'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No bookings found for the selected date.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
