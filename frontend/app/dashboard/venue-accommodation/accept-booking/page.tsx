'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaBell, FaEdit, FaTrash, FaCalendarAlt, FaEye, FaChartBar, FaFileInvoice, FaCog, FaMoon, FaPlus, FaHome, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';

type VenueCategory = 'hotel-rooms' | 'banquet-halls' | 'outdoor-venues';
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface BookingRow {
  id: number;
  eventDate: string;
  eventTime: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  notes: string | null;
  status: BookingStatus;
  offering?: {
    id: number;
    name: string;
    category: string;
    price: number;
    images?: string[];
  } | null;
}

interface VendorUser {
  id?: number | string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function AcceptBookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<VenueCategory>('hotel-rooms');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const organizationLabel = user?.organizationName || user?.name || 'Venue Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const category = booking.offering?.category || 'hotel-room';
      const normalized = category === 'hotel-rooms' || category === 'hotel-room'
        ? 'hotel-rooms'
        : category === 'banquet-halls' || category === 'banquet-hall'
        ? 'banquet-halls'
        : 'outdoor-venues';
      return normalized === activeCategory;
    });
  }, [activeCategory, bookings]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr) as VendorUser;
      setUser(userData);
      const vendorId = Number(userData.id);
      if (userData.role !== 'vendor') {
        router.push('/');
        return;
      }
      if (Number.isFinite(vendorId) && vendorId > 0) {
        fetchBookings(vendorId);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchBookings = async (vendorId: number) => {
    try {
      setLoading(true);
      const data = await apiFetch<BookingRow[]>(`/bookings?vendorId=${vendorId}`);
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings', error);
      setToast({
        message: 'Unable to load booking requests.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const updateBookingStatus = async (id: number, status: BookingStatus) => {
    try {
      const updated = await apiFetch<BookingRow>(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      setBookings((prev) => prev.map((booking) => (booking.id === id ? updated : booking)));
      setToast({
        message: status === 'confirmed' ? 'Booking approved successfully!' : 'Booking rejected successfully!',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to update booking status', error);
      setToast({
        message: 'Unable to update booking status.',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#755A7B' }}>
              {organizationInitial}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">venue and accommodation</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button onClick={() => router.push('/dashboard/venue-accommodation/overview')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100">
              <FaChartBar /> Overview
            </button>
            <button onClick={() => router.push('/dashboard/venue-accommodation')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100">
              <FaPlus /> Post Package
            </button>
            <button onClick={() => router.push('/dashboard/venue-accommodation/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100">
              <FaFileInvoice /> Posted Packages
            </button>
            <button onClick={() => router.push('/dashboard/venue-accommodation/draft-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100">
              <FaEdit /> Draft Package
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button onClick={() => router.push('/dashboard/venue-accommodation/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaCalendarAlt /> Place a Booking
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{ backgroundColor: '#755A7B', color: 'white' }}>
              <FaEye /> Accept Booking
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaBell /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaHeart /> Feedback
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaCog /> Setting
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all" style={{ backgroundColor: '#755A7B' }}>
              <FaMoon /> Logout
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: 'url(/roombanner.png)', backgroundSize: 'cover', backgroundPosition: 'center', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(117, 90, 123, 0.2)' }}>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>Accept Booking</h2>
            <p className="text-sm md:text-xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Review customer booking requests and approve available slots</p>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
              {['hotel-rooms', 'banquet-halls', 'outdoor-venues'].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category as VenueCategory)}
                  className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                  style={{
                    borderColor: activeCategory === category ? '#755A7B' : 'transparent',
                    color: activeCategory === category ? '#755A7B' : '#999',
                    fontWeight: activeCategory === category ? 'bold' : 'normal',
                    background: activeCategory === category ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent',
                  }}
                >
                  {category === 'hotel-rooms' ? 'Hotel Rooms' : category === 'banquet-halls' ? 'Banquet Hall' : 'Outdoor Venue'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span>appointment</span>
            <span>/</span>
            <span className="font-semibold" style={{ color: '#755A7B' }}>accept booking</span>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block mb-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#755A7B' }} /></div>
              <p className="text-gray-600">Loading booking requests...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl shadow-md p-5 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FaHourglassHalf style={{ color: booking.status === 'pending' ? '#f59e0b' : '#10b981' }} />
                          <h3 className="text-lg font-bold text-gray-800">{booking.clientName || 'Guest Booking'}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{booking.clientEmail || 'No email provided'}</p>
                        <p className="text-sm text-gray-600">{booking.clientPhone || 'No phone provided'}</p>
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{booking.notes || 'No notes provided'}</p>
                      </div>
                      <div className="text-sm text-gray-600 md:text-right">
                        <p className="font-semibold" style={{ color: '#755A7B' }}>{booking.eventDate}</p>
                        <p>{booking.eventTime || 'Any time'}</p>
                        <p className="mt-1 capitalize">Status: {booking.status}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-[0.2em] mb-1">Service</p>
                        <p className="font-semibold text-gray-800">{booking.offering?.name || 'Venue package'}</p>
                        <p className="text-sm text-gray-600">{booking.offering?.category || 'venue package'}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 justify-start md:justify-end">
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                          className="inline-flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition hover:opacity-90"
                          style={{ backgroundColor: '#10b981' }}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                          className="inline-flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition hover:opacity-90"
                          style={{ backgroundColor: '#ef4444' }}
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredBookings.length === 0 && (
                  <div className="bg-white rounded-xl shadow-md p-10 text-center">
                    <FaCalendarAlt className="mx-auto mb-4 text-5xl text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No booking requests found</h3>
                    <p className="text-gray-500">Requests for the selected venue category will appear here.</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Status Summary</h3>
                  <div className="space-y-3 text-sm">
                    {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                      <div key={status} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                        <span className="capitalize text-gray-700">{status}</span>
                        <span className="font-semibold text-gray-900">{bookings.filter((booking) => booking.status === status).length}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button onClick={() => router.push('/dashboard/venue-accommodation/place-booking')} className="w-full rounded-lg px-4 py-3 font-medium text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-colors">
                      Open Calendar
                    </button>
                    <button onClick={() => router.push('/dashboard/venue-accommodation/posted-packages')} className="w-full rounded-lg px-4 py-3 font-medium text-white transition-colors" style={{ backgroundColor: '#755A7B' }}>
                      View Posted Packages
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
