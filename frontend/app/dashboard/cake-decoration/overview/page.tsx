'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaEdit, FaEye, FaFileInvoice, FaHeart, FaHome, FaMoon, FaPlus, FaStar } from 'react-icons/fa';

type CakeCategory = 'wedding-cakes' | 'tiered-cakes' | 'custom-designs';
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface VendorUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  organizationName?: string;
}

interface OfferingItem {
  id: number;
  name: string;
  category: string;
  price: number;
  isDraft?: boolean;
}

interface BookingItem {
  id: number;
  vendorId: number;
  offeringId: number;
  eventDate: string;
  eventTime: string | null;
  clientName: string | null;
  clientEmail: string | null;
  notes: string | null;
  status: BookingStatus;
  createdAt: string;
  offering?: {
    id: number;
    name: string;
    category: string;
    price: number;
  };
}

const normalizeCakeCategory = (category: string | undefined): CakeCategory => {
  if (category === 'wedding-cakes') return 'wedding-cakes';
  if (category === 'tiered-cakes') return 'tiered-cakes';
  if (category === 'custom-designs') return 'custom-designs';
  return 'wedding-cakes';
};

export default function CakeDecorationOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [offerings, setOfferings] = useState<OfferingItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const organizationLabel = user?.organizationName || user?.name || 'Cake Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr) as VendorUser;
    setUser(userData);
    if (userData.role !== 'vendor') {
      router.push('/');
      return;
    }

    const vendorId = Number(userData.id);
    if (!Number.isFinite(vendorId) || vendorId <= 0) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [offeringsData, bookingsData] = await Promise.all([
          apiFetch<OfferingItem[]>(`/offerings?vendorId=${vendorId}`),
          apiFetch<BookingItem[]>(`/bookings?vendorId=${vendorId}`),
        ]);
        setOfferings(offeringsData || []);
        setBookings(bookingsData || []);
      } catch (error) {
        console.error('Failed to load cake overview', error);
        setToast({ message: 'Unable to load overview data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const postedOfferings = offerings.filter((item) => !item.isDraft);
  const draftOfferings = offerings.filter((item) => item.isDraft);
  const cakeBookings = bookings.filter((booking) => normalizeCakeCategory(booking.offering?.category) === normalizeCakeCategory(booking.offering?.category));

  const counts = bookings.reduce(
    (acc, booking) => {
      acc[booking.status] += 1;
      return acc;
    },
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 } as Record<BookingStatus, number>
  );

  const totalRevenue = bookings
    .filter((booking) => booking.status === 'confirmed' || booking.status === 'completed')
    .reduce((sum, booking) => sum + (Number(booking.offering?.price) || 0), 0);

  const upcomingBookings = useMemo(() => [...bookings].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()).slice(0, 5), [bookings]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#755A7B' }}>{organizationInitial}</div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">cake decoration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button onClick={() => router.push('/dashboard/cake-decoration/overview')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaChartBar /> Overview</button>
            <button onClick={() => router.push('/dashboard/cake-decoration')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/draft-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEdit /> Draft Package</button>
          </div>
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button onClick={() => router.push('/dashboard/cake-decoration/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white" style={{ backgroundColor: '#755A7B' }}><FaMoon /> Logout</button>
          </div>
        </nav>
      </aside>
      <div className="flex-1 p-4 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"><FaHome /> Home</button>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Posted Packages', value: postedOfferings.length },
            { label: 'Draft Packages', value: draftOfferings.length },
            { label: 'Total Bookings', value: bookings.length },
            { label: 'Revenue', value: `Rs. ${totalRevenue.toLocaleString()}` },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-md p-5">
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">Loading overview data...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(counts).map(([status, value]) => (
                    <div key={status} className="rounded-lg p-4" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{status}</p>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Latest Bookings</h2>
                  <button onClick={() => router.push('/dashboard/cake-decoration/place-booking')} className="rounded-lg px-4 py-2 text-white" style={{ backgroundColor: '#755A7B' }}>Open Calendar</button>
                </div>
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-800">{booking.clientName || 'Guest'}</p>
                        <p className="text-sm text-gray-500">{booking.eventDate} at {booking.eventTime || 'Any time'}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#755A7B' }}>{booking.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button onClick={() => router.push('/dashboard/cake-decoration')} className="w-full rounded-lg px-4 py-3 font-medium text-white" style={{ backgroundColor: '#755A7B' }}>Create Package</button>
                  <button onClick={() => router.push('/dashboard/cake-decoration/posted-packages')} className="w-full rounded-lg px-4 py-3 font-medium border border-gray-300">View Packages</button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Categories</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Wedding Cakes</p>
                  <p>Tiered Cakes</p>
                  <p>Custom Designs</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
