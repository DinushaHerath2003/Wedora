'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaEdit, FaEye, FaFileInvoice, FaHeart, FaMoon, FaPlus, FaSave, FaTimes, FaTrash } from 'react-icons/fa';

type EntertainmentCategory = 'live-bands' | 'djs' | 'traditional-performers';

interface Booking {
  id: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  category: EntertainmentCategory;
  time: string;
}

interface VendorUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  organizationName?: string;
}

const categories: EntertainmentCategory[] = ['live-bands', 'djs', 'traditional-performers'];

const normalizeCategory = (category?: string): EntertainmentCategory => {
  if (category === 'djs') return 'djs';
  if (category === 'traditional-performers') return 'traditional-performers';
  return 'live-bands';
};

const categoryLabel = (category: EntertainmentCategory) =>
  category === 'live-bands' ? 'Live Bands' : category === 'djs' ? 'DJs' : 'Traditional Performers';

export default function EntertainmentPlaceBookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<EntertainmentCategory>('live-bands');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offerings, setOfferings] = useState<{ id: number; category: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState('');
  const [apiError, setApiError] = useState('');
  const [newBooking, setNewBooking] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: '',
    time: '10:00',
  });

  const organizationLabel = user?.organizationName || user?.name || 'Entertainment Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr) as VendorUser;
    setUser(userData);
    const vendorId = Number(userData.id);

    if (userData.role !== 'vendor') {
      router.push('/');
      return;
    }

    if (Number.isFinite(vendorId) && vendorId > 0) {
      fetchVendorBookings(vendorId);
      fetchVendorOfferings(vendorId);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchVendorBookings = async (vendorId: number) => {
    try {
      const data = await apiFetch<any[]>(`/bookings?vendorId=${vendorId}`);
      setBookings(
        data.map((booking) => ({
          id: booking.id.toString(),
          date: booking.eventDate ? booking.eventDate.slice(0, 10) : '',
          time: booking.eventTime || '10:00',
          clientName: booking.clientName || booking.user?.name || 'Guest',
          clientEmail: booking.clientEmail || booking.user?.email || '',
          clientPhone: booking.clientPhone || '',
          description: booking.notes || '',
          category: normalizeCategory(booking.offering?.category),
        })),
      );
    } catch (error) {
      console.error('Failed to load entertainment bookings', error);
      setApiError('Unable to load bookings from backend.');
    }
  };

  const fetchVendorOfferings = async (vendorId: number) => {
    try {
      const data = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setOfferings(data.map((offering) => ({ id: offering.id, category: offering.category })));
    } catch (error) {
      console.error('Failed to load entertainment offerings', error);
      setApiError('Unable to load packages for booking.');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const formatDate = (date: Date, day: number) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const getBookingsForDate = (dateStr: string) => bookings.filter((booking) => booking.date === dateStr && booking.category === activeCategory);
  const hasBookingOnDate = (dateStr: string) => getBookingsForDate(dateStr).length > 0;

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowBookingModal(true);
    setEditingBooking(null);
    setBookingError('');
    setNewBooking({ clientName: '', clientEmail: '', clientPhone: '', description: '', time: '10:00' });
  };

  const handleSaveBooking = async () => {
    if (!selectedDate) return;

    const duplicateSlot = bookings.some((booking) =>
      booking.date === selectedDate &&
      booking.category === activeCategory &&
      booking.time === newBooking.time &&
      (!editingBooking || booking.id !== editingBooking.id),
    );

    if (duplicateSlot) {
      setBookingError('This time slot is already booked for the selected date. Please choose another time.');
      return;
    }

    const vendorId = Number(user?.id);
    const selectedOffering = offerings.find((offering) => normalizeCategory(offering.category) === activeCategory) || offerings[0];
    if (!user || !Number.isFinite(vendorId) || vendorId <= 0) {
      setBookingError('Unable to save booking: invalid vendor session.');
      return;
    }
    if (!selectedOffering) {
      setBookingError('No entertainment package was found. Please add a package first.');
      return;
    }

    const payload = {
      offeringId: selectedOffering.id,
      vendorId,
      eventDate: selectedDate,
      eventTime: newBooking.time,
      clientName: newBooking.clientName,
      clientEmail: newBooking.clientEmail,
      clientPhone: newBooking.clientPhone,
      notes: newBooking.description,
    };

    try {
      if (editingBooking) {
        await apiFetch<any>(`/bookings/${editingBooking.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        setBookings((prev) => prev.map((booking) => booking.id === editingBooking.id ? { ...booking, clientName: newBooking.clientName, clientEmail: newBooking.clientEmail, clientPhone: newBooking.clientPhone, description: newBooking.description, time: newBooking.time } : booking));
      } else {
        const createdBooking = await apiFetch<any>('/bookings', { method: 'POST', body: JSON.stringify(payload) });
        setBookings((prev) => [...prev, { id: createdBooking.id.toString(), date: selectedDate, clientName: newBooking.clientName, clientEmail: newBooking.clientEmail, clientPhone: newBooking.clientPhone, description: newBooking.description, category: activeCategory, time: newBooking.time }]);
      }
      setShowBookingModal(false);
      setEditingBooking(null);
      setBookingError('');
      setNewBooking({ clientName: '', clientEmail: '', clientPhone: '', description: '', time: '10:00' });
    } catch (error) {
      console.error('Failed to save entertainment booking', error);
      setBookingError('Unable to save booking. Please try again later.');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingError('');
    setNewBooking({ clientName: booking.clientName, clientEmail: booking.clientEmail, clientPhone: booking.clientPhone, description: booking.description, time: booking.time });
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      await apiFetch<any>(`/bookings/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete entertainment booking', error);
    }
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#755A7B' }}>{organizationInitial}</div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">entertainment services</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button>
            <button onClick={() => router.push('/dashboard/entertainment')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button>
            <button onClick={() => router.push('/dashboard/entertainment/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button>
            <button onClick={() => router.push('/dashboard/entertainment/draft-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaEdit /> Draft Package</button>
          </div>
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaCalendarAlt /> Place a Booking</button>
            <button onClick={() => router.push('/dashboard/entertainment/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button>
            <button onClick={() => router.push('/dashboard/entertainment/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button>
            <button onClick={() => router.push('/dashboard/entertainment/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all" style={{ backgroundColor: '#755A7B' }}><FaMoon /> Logout</button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: 'url(/band.png)', backgroundSize: 'cover', backgroundPosition: 'center', height: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(117, 90, 123, 0.2)' }}>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>{categoryLabel(activeCategory)} Bookings</h2>
          <p className="text-sm md:text-xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Schedule client meetings and manage appointments</p>
        </div>

        <div className="mb-6 flex gap-2 md:gap-6 justify-center overflow-x-auto pb-2">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap" style={{ borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999', fontWeight: activeCategory === category ? 'bold' : 'normal' }}>{categoryLabel(category)}</button>
          ))}
        </div>

        {apiError && <div className="max-w-4xl mx-auto mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{apiError}</div>}

        <div className="bg-white rounded-xl shadow-md p-4 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="px-4 py-2 rounded-lg font-medium text-white" style={{ backgroundColor: '#755A7B' }}>Previous</button>
            <h3 className="text-xl font-bold text-gray-800">{monthName}</h3>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="px-4 py-2 rounded-lg font-medium text-white" style={{ backgroundColor: '#755A7B' }}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="text-center font-semibold text-gray-600 py-1 text-sm">{day}</div>)}
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => <div key={`empty-${idx}`} className="aspect-square"></div>)}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = formatDate(currentDate, day);
              const hasBooking = hasBookingOnDate(dateStr);
              return (
                <div key={day} onClick={() => handleDateClick(dateStr)} className="aspect-square border-2 rounded-lg p-1 cursor-pointer hover:border-purple-500 transition-all relative" style={{ borderColor: hasBooking ? '#755A7B' : '#e5e7eb', backgroundColor: hasBooking ? 'rgba(117, 90, 123, 0.05)' : 'white' }}>
                  <div className="text-center font-medium text-sm">{day}</div>
                  {hasBooking && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: '#755A7B' }} />}
                </div>
              );
            })}
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Bookings</h3>
          <div className="space-y-3">
            {bookings.filter((booking) => booking.category === activeCategory).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5).map((booking) => (
              <article key={booking.id} className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-800">{booking.clientName}</h4>
                    <p className="text-sm text-gray-600">{booking.clientEmail} | {booking.clientPhone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedDate(booking.date); handleEditBooking(booking); setShowBookingModal(true); }} className="px-3 py-1 rounded text-white" style={{ backgroundColor: '#755A7B' }}><FaEdit /></button>
                    <button onClick={() => handleDeleteBooking(booking.id)} className="px-3 py-1 rounded bg-red-500 text-white"><FaTrash /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{booking.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="font-semibold" style={{ color: '#755A7B' }}>{new Date(booking.date).toLocaleDateString()}</span>
                  <span className="font-semibold" style={{ color: '#755A7B' }}>{booking.time}</span>
                </div>
              </article>
            ))}
            {bookings.filter((booking) => booking.category === activeCategory).length === 0 && <div className="text-center py-8 text-gray-500"><FaCalendarAlt className="text-4xl mb-2 mx-auto" /><p>No bookings scheduled yet</p></div>}
          </div>
        </section>
      </main>

      {showBookingModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">{editingBooking ? 'Edit Booking' : 'New Booking'}</h3>
                <button onClick={() => { setShowBookingModal(false); setEditingBooking(null); }} className="text-gray-500 hover:text-gray-700"><FaTimes size={24} /></button>
              </div>
              <p className="text-sm text-gray-600 mb-4">Selected Date: <span className="font-bold" style={{ color: '#755A7B' }}>{new Date(selectedDate).toLocaleDateString()}</span></p>
              <div className="space-y-4">
                {bookingError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{bookingError}</div>}
                <input value={newBooking.clientName} onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900" placeholder="Client name" />
                <input type="email" value={newBooking.clientEmail} onChange={(e) => setNewBooking({ ...newBooking, clientEmail: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900" placeholder="Client email" />
                <input value={newBooking.clientPhone} onChange={(e) => setNewBooking({ ...newBooking, clientPhone: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900" placeholder="Client phone" />
                <input type="time" value={newBooking.time} onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900" />
                <textarea value={newBooking.description} onChange={(e) => setNewBooking({ ...newBooking, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900" rows={4} placeholder="Meeting details" />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowBookingModal(false); setEditingBooking(null); }} className="flex-1 px-6 py-3 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveBooking} className="flex-1 px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2" style={{ backgroundColor: '#755A7B' }}><FaSave /> {editingBooking ? 'Update Booking' : 'Save Booking'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
