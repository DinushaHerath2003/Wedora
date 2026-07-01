'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaBell, FaEdit, FaCalendarAlt, FaEye, FaChartBar, FaFileInvoice, FaCog, FaMoon, FaPlus, FaTimes, FaCheck, FaHourglassHalf } from 'react-icons/fa';

type GiftingCategory = 'wedding-favors' | 'gift-boxes' | 'custom-souvenirs';
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
interface VendorUser { id?: number | string; name?: string; email: string; role: string; organizationName?: string; }
interface BookingRow { id: number; eventDate: string; eventTime: string | null; clientName: string | null; clientEmail: string | null; clientPhone: string | null; notes: string | null; status: BookingStatus; offering?: { id: number; name: string; category: string; price: number } | null; }
const categories: GiftingCategory[] = ['wedding-favors', 'gift-boxes', 'custom-souvenirs'];
const normalizeCategory = (category?: string): GiftingCategory => category === 'gift-boxes' ? 'gift-boxes' : category === 'custom-souvenirs' ? 'custom-souvenirs' : 'wedding-favors';
const categoryLabel = (category: GiftingCategory) => category === 'wedding-favors' ? 'Wedding Favors' : category === 'gift-boxes' ? 'Gift Boxes' : 'Custom Souvenirs';

export default function GiftingAcceptBookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [activeCategory, setActiveCategory] = useState<GiftingCategory>('wedding-favors');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [loading, setLoading] = useState(true);
  const organizationLabel = user?.organizationName || user?.name || 'Gifting Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();
  const filteredBookings = useMemo(() => bookings.filter((booking) => normalizeCategory(booking.offering?.category) === activeCategory), [activeCategory, bookings]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { router.push('/login'); return; }
    const userData = JSON.parse(userStr) as VendorUser;
    setUser(userData);
    const vendorId = Number(userData.id);
    if (userData.role !== 'vendor') { router.push('/'); return; }
    if (Number.isFinite(vendorId) && vendorId > 0) fetchBookings(vendorId); else router.push('/login');
  }, [router]);

  const fetchBookings = async (vendorId: number) => {
    try { setLoading(true); setBookings(await apiFetch<BookingRow[]>(`/bookings?vendorId=${vendorId}`) || []); }
    catch { setToast({ message: 'Unable to load booking requests.', type: 'error' }); }
    finally { setLoading(false); }
  };
  const updateBookingStatus = async (id: number, status: BookingStatus) => {
    try { const updated = await apiFetch<BookingRow>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); setBookings((prev) => prev.map((booking) => booking.id === id ? updated : booking)); setToast({ message: status === 'confirmed' ? 'Booking approved successfully.' : 'Booking rejected successfully.', type: 'success' }); }
    catch { setToast({ message: 'Unable to update booking status.', type: 'error' }); }
  };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/'); };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col"><div className="p-6 border-b"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>{organizationInitial}</div><div><h2 className="font-bold text-gray-800">{organizationLabel}</h2><p className="text-xs text-gray-500">wedding gifts and favors</p></div></div></div><nav className="flex-1 p-4"><div className="mb-6"><p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p><button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button><button onClick={() => router.push('/dashboard/gifting')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button><button onClick={() => router.push('/dashboard/gifting/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button><button onClick={() => router.push('/dashboard/gifting/draft-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaEdit /> Draft Package</button></div><div className="mb-6"><p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p><button onClick={() => router.push('/dashboard/gifting/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button><button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1" style={{backgroundColor: '#755A7B', color: 'white'}}><FaEye /> Accept Booking</button></div><div><p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p><button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button><button onClick={() => router.push('/dashboard/gifting/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button><button onClick={() => router.push('/dashboard/gifting/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white" style={{backgroundColor: '#755A7B'}}><FaMoon /> Logout</button></div></nav></aside>
      <main className="flex-1 p-4 md:p-8"><div className="mb-6"><p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p><h1 className="text-2xl font-bold text-gray-900">Accept Booking</h1></div><div className="mb-6 flex gap-2 justify-center overflow-x-auto pb-2">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className="px-4 py-3 font-medium border-b-4 whitespace-nowrap" style={{borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999'}}>{categoryLabel(category)}</button>)}</div>{loading ? <div className="text-center py-16">Loading booking requests...</div> : <div className="space-y-4">{filteredBookings.map((booking) => <article key={booking.id} className="bg-white rounded-xl shadow-md p-5"><div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div><div className="flex items-center gap-2 mb-2"><FaHourglassHalf style={{color: booking.status === 'pending' ? '#f59e0b' : '#10b981'}} /><h3 className="text-lg font-bold text-gray-800">{booking.clientName || 'Guest Booking'}</h3></div><p className="text-sm text-gray-600">{booking.clientEmail || 'No email provided'}</p><p className="text-sm text-gray-600">{booking.clientPhone || 'No phone provided'}</p><p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{booking.notes || 'No notes provided'}</p></div><div className="text-sm text-gray-600 md:text-right"><p className="font-semibold" style={{color: '#755A7B'}}>{booking.eventDate}</p><p>{booking.eventTime || 'Any time'}</p><p className="mt-1 capitalize">Status: {booking.status}</p></div></div><div className="mt-4 flex flex-wrap gap-3 justify-end"><button onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="inline-flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-white bg-emerald-600"><FaCheck /> Approve</button><button onClick={() => updateBookingStatus(booking.id, 'cancelled')} className="inline-flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-white bg-red-500"><FaTimes /> Reject</button></div></article>)}{filteredBookings.length === 0 && <div className="bg-white rounded-xl shadow-md p-10 text-center"><h3 className="text-xl font-semibold text-gray-700 mb-2">No booking requests found</h3></div>}</div>}</main>
    </div>
  );
}
