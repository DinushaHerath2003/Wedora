'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import CeremonialSidebar from '@/components/ceremonial/CeremonialSidebar';
import { FaChartBar, FaCalendarAlt, FaClock, FaEdit, FaEnvelope, FaFileInvoice, FaMoneyBillWave, FaChartPie, FaCheckCircle, FaTimesCircle, FaComments } from 'react-icons/fa';
import { isCeremonialCategory } from '@/lib/ceremonial-dashboard';

type CeremonialCategory = 'poruwa-ceremony' | 'religious-services' | 'cultural-events';
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface VendorUser {
  id?: number | string;
  name: string;
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
  stock?: number;
  discount?: string;
  createdAt?: string;
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

export default function CeremonialOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [offerings, setOfferings] = useState<OfferingItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const organizationLabel = user?.organizationName || user?.name || 'Ceremonial Vendor';
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

    const loadOverview = async () => {
      try {
        setLoading(true);
        const [offeringsData, bookingsData] = await Promise.all([
          apiFetch<OfferingItem[]>(`/offerings?vendorId=${vendorId}`),
          apiFetch<BookingItem[]>(`/bookings?vendorId=${vendorId}`),
        ]);
        setOfferings((offeringsData || []).filter((item) => isCeremonialCategory(item.category)));
        setBookings(
          (bookingsData || []).filter((item) =>
            !item.offering?.category || isCeremonialCategory(item.offering.category),
          ),
        );
      } catch (error) {
        console.error('Failed to load overview data', error);
        setToast({
          message: 'Unable to load overview data. Please refresh the page.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [router]);

  const postedOfferings = offerings.filter((item) => !item.isDraft);
  const draftOfferings = offerings.filter((item) => item.isDraft);

  const bookingCounts = bookings.reduce(
    (acc, booking) => {
      acc[booking.status] += 1;
      return acc;
    },
    {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    } as Record<BookingStatus, number>
  );

  const totalRevenue = bookings
    .filter((booking) => booking.status === 'confirmed' || booking.status === 'completed')
    .reduce((sum, booking) => sum + (Number(booking.offering?.price) || 0), 0);

  const totalPackageValue = postedOfferings.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const averagePackagePrice = postedOfferings.length > 0 ? Math.round(totalPackageValue / postedOfferings.length) : 0;
  const activePackages = postedOfferings.filter((item) => (item.stock ?? 0) > 0).length;
  const occupancyRate = bookings.length > 0 ? Math.round(((bookingCounts.confirmed + bookingCounts.completed) / bookings.length) * 100) : 0;

  const upcomingBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, 5);
  }, [bookings]);

  const formatMoney = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  const summaryCards = [
    { title: 'Posted Packages', value: postedOfferings.length, icon: FaFileInvoice, color: '#755A7B' },
    { title: 'Draft Packages', value: draftOfferings.length, icon: FaEdit, color: '#10b981' },
    { title: 'Total Bookings', value: bookings.length, icon: FaCalendarAlt, color: '#3b82f6' },
    { title: 'Pending Requests', value: bookingCounts.pending, icon: FaClock, color: '#f59e0b' },
    { title: 'Accepted Bookings', value: bookingCounts.confirmed, icon: FaCheckCircle, color: '#16a34a' },
    { title: 'Rejected Bookings', value: bookingCounts.cancelled, icon: FaTimesCircle, color: '#ef4444' },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <CeremonialSidebar
        activePage="overview"
        organizationLabel={organizationLabel}
        organizationInitial={organizationInitial}
      />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: 'url(/poruwa.png)', backgroundSize: 'cover', backgroundPosition: 'center', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(117, 90, 123, 0.2)' }}>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>Ceremonial Overview</h2>
            <p className="text-sm md:text-xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Summary of packages, booking performance, and customer requests</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span>mainmenu</span>
            <span>/</span>
            <span className="font-semibold" style={{ color: '#755A7B' }}>overview</span>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block mb-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#755A7B' }} /></div>
              <p className="text-gray-600">Loading overview data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {summaryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: card.color }}>
                          <Icon />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Live</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                      <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-800">Financial Snapshot</h3>
                      </div>
                      <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(117, 90, 123, 0.08)' }}>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Occupancy Rate</p>
                        <p className="text-2xl font-bold" style={{ color: '#755A7B' }}>{occupancyRate}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 mb-1">Estimated Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatMoney(totalRevenue)}</p>
                        <p className="text-xs text-gray-500 mt-1">Confirmed and completed bookings</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 mb-1">Average Package Price</p>
                        <p className="text-2xl font-bold text-gray-900">{formatMoney(averagePackagePrice)}</p>
                        <p className="text-xs text-gray-500 mt-1">Across posted packages</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 mb-1">Active Packages</p>
                        <p className="text-2xl font-bold text-gray-900">{activePackages}/{postedOfferings.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Packages with stock available</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Pending', value: bookingCounts.pending, color: '#f59e0b' },
                        { label: 'Confirmed', value: bookingCounts.confirmed, color: '#16a34a' },
                        { label: 'Completed', value: bookingCounts.completed, color: '#3b82f6' },
                        { label: 'Cancelled', value: bookingCounts.cancelled, color: '#ef4444' },
                      ].map((item) => {
                        const percent = bookings.length > 0 ? Math.round((item.value / bookings.length) * 100) : 0;
                        return (
                          <div key={item.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.label}</span>
                              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                            </div>
                            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Packages</p>
                        <h3 className="text-2xl font-bold text-gray-800">Package Health</h3>
                      </div>
                      <button onClick={() => router.push('/dashboard/ceremonial/posted-packages')} className="rounded-lg px-4 py-2 text-white font-medium" style={{ backgroundColor: '#755A7B' }}>
                        Open Packages
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Posted', value: postedOfferings.length, icon: FaFileInvoice },
                        { label: 'Drafts', value: draftOfferings.length, icon: FaEdit },
                        { label: 'Total Package Value', value: formatMoney(totalPackageValue), icon: FaMoneyBillWave },
                        { label: 'Booking Requests', value: bookings.length, icon: FaCalendarAlt },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#755A7B' }}>
                              <Icon />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">{item.label}</p>
                              <p className="text-xl font-bold text-gray-900">{item.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FaComments style={{ color: '#755A7B' }} /> Inquiries</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {upcomingBookings.length > 0 ? upcomingBookings.map((booking) => (
                        <div key={booking.id} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="font-semibold text-gray-800">{booking.clientName || 'Guest'}</p>
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#755A7B' }}>{booking.status}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{booking.notes || 'No notes provided'}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <span>{booking.eventDate}</span>
                            <span>{booking.eventTime || 'No time set'}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                          <FaEnvelope className="mx-auto text-3xl text-gray-300 mb-3" />
                          <p className="text-gray-500 text-sm">No booking inquiries yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><FaChartPie style={{ color: '#755A7B' }} /> Quick Insights</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                        <span className="text-gray-700">Most popular category</span>
                        <span className="font-semibold text-gray-900">{postedOfferings[0]?.category || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                        <span className="text-gray-700">Packages needing attention</span>
                        <span className="font-semibold text-gray-900">{draftOfferings.length}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                        <span className="text-gray-700">Bookings awaiting action</span>
                        <span className="font-semibold text-gray-900">{bookingCounts.pending}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                        <span className="text-gray-700">Total venue value</span>
                        <span className="font-semibold text-gray-900">{formatMoney(totalPackageValue)}</span>
                      </div>
                    </div>
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
