'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { FaHeart, FaBell, FaEdit, FaTrash, FaCalendarAlt, FaEye, FaChartBar, FaFileInvoice, FaCog, FaMoon, FaPlus, FaTimes, FaSave, FaHome } from 'react-icons/fa';

type VenueCategory = 'hotel-rooms' | 'banquet-halls' | 'outdoor-venues';

interface Booking {
  id: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  category: VenueCategory;
  time: string;
}

interface VendorUser {
  id?: number | string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function PlaceBookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  
  const organizationLabel = user?.organizationName || user?.name || 'Venue Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();
  const [activeCategory, setActiveCategory] = useState<VenueCategory>('hotel-rooms');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offerings, setOfferings] = useState<{ id: number; category: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newBooking, setNewBooking] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    description: '',
    time: '10:00'
  });
  const [bookingError, setBookingError] = useState('');
  const [apiError, setApiError] = useState('');

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  const getCategoryBannerImage = () => {
    switch(activeCategory) {
      case 'hotel-rooms':
        return '/ven1.png';
      case 'banquet-halls':
        return '/ven2.png';
      case 'outdoor-venues':
        return '/ven3.png';
      default:
        return '/ven1.png';
    }
  };

  const getCategoryBannerText = () => {
    switch(activeCategory) {
      case 'hotel-rooms':
        return 'Hotel Rooms Bookings';
      case 'banquet-halls':
        return 'Banquet Hall Bookings';
      case 'outdoor-venues':
        return 'Outdoor Venue Bookings';
      default:
        return 'Place Bookings';
    }
  };

  const normalizeVenueCategory = (category: string | undefined): VenueCategory => {
    if (category === 'hotel-rooms' || category === 'hotel-room') {
      return 'hotel-rooms';
    }
    if (category === 'banquet-halls' || category === 'banquet-hall') {
      return 'banquet-halls';
    }
    if (category === 'outdoor-venues' || category === 'outdoor-venue') {
      return 'outdoor-venues';
    }
    return 'hotel-rooms';
  };

  const getPackageCategory = (category: VenueCategory) => {
    switch (category) {
      case 'hotel-rooms':
        return 'hotel-room';
      case 'banquet-halls':
        return 'banquet-hall';
      case 'outdoor-venues':
        return 'outdoor-venue';
      default:
        return 'hotel-room';
    }
  };

  const isTimeSlotBooked = (dateStr: string, timeSlot: string, ignoreBookingId?: string) => {
    return bookings.some(booking =>
      booking.date === dateStr &&
      booking.category === activeCategory &&
      booking.time === timeSlot &&
      booking.id !== ignoreBookingId
    );
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      const vendorId = Number(userData.id);
      if (userData.role !== 'vendor') {
        router.push('/');
        return;
      }
      if (!Number.isNaN(vendorId) && vendorId > 0) {
        fetchVendorBookings(vendorId);
        fetchVendorOfferings(vendorId);
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchVendorBookings = async (vendorId: number) => {
    try {
      const data = await apiFetch<any[]>(`/bookings?vendorId=${vendorId}`);
      const mapped = data.map((booking) => ({
        id: booking.id.toString(),
        date: booking.eventDate ? booking.eventDate.slice(0, 10) : '',
        time: booking.eventTime || '09:00',
        clientName: booking.clientName || booking.user?.name || 'Guest',
        clientEmail: booking.clientEmail || booking.user?.email || '',
        clientPhone: booking.clientPhone || '',
        description: booking.notes || '',
        category: normalizeVenueCategory(booking.offering?.category) as VenueCategory,
      }));
      setBookings(mapped);
    } catch (error) {
      console.error('Failed to load vendor bookings', error);
      setApiError('Unable to load bookings from backend. Showing local bookings only.');
    }
  };

  const fetchVendorOfferings = async (vendorId: number) => {
    try {
      const data = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setOfferings(
        data.map((offering) => ({
          id: offering.id,
          category: offering.category,
        }))
      );
    } catch (error) {
      console.error('Failed to load offerings', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date, day: number) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const hasBookingOnDate = (dateStr: string) => {
    return bookings.some(
      booking => booking.date === dateStr && booking.category === activeCategory
    );
  };

  const getBookingsForDate = (dateStr: string) => {
    return bookings.filter(
      booking => booking.date === dateStr && booking.category === activeCategory
    );
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowBookingModal(true);
    setEditingBooking(null);
    setBookingError('');
    setNewBooking({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: '',
      time: '09:00'
    });
  };

  const handleSaveBooking = async () => {
    if (!selectedDate) return;

    const duplicateSlot = bookings.some(booking =>
      booking.date === selectedDate &&
      booking.category === activeCategory &&
      booking.time === newBooking.time &&
      (!editingBooking || booking.id !== editingBooking.id)
    );

    if (duplicateSlot) {
      setBookingError('This time slot is already booked for the selected date. Please choose a different time.');
      return;
    }

    const vendorId = Number((user as any).id);
    const offeringCategory = getPackageCategory(activeCategory);
    const selectedOffering = offerings.find((offering) => offering.category === offeringCategory) || offerings[0];

    if (!user || Number.isNaN(vendorId) || vendorId <= 0) {
      setBookingError('Unable to save booking: invalid vendor session.');
      return;
    }

    const payload = {
      offeringId: selectedOffering?.id ?? 0,
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
        await apiFetch<any>(`/bookings/${editingBooking.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        const updatedBookings = bookings.map((booking) =>
          booking.id === editingBooking.id
            ? {
                ...booking,
                clientName: newBooking.clientName,
                clientEmail: newBooking.clientEmail,
                clientPhone: newBooking.clientPhone,
                description: newBooking.description,
                time: newBooking.time,
              }
            : booking
        );
        setBookings(updatedBookings);
      } else {
        if (!selectedOffering) {
          setBookingError('No service package was found for this category. Please add a package first.');
          return;
        }

        const createdBooking = await apiFetch<any>('/bookings', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const booking: Booking = {
          id: createdBooking.id.toString(),
          date: selectedDate,
          clientName: newBooking.clientName,
          clientEmail: newBooking.clientEmail,
          clientPhone: newBooking.clientPhone,
          description: newBooking.description,
          category: activeCategory,
          time: newBooking.time,
        };
        setBookings((prev) => [...prev, booking]);
      }

      setShowBookingModal(false);
      setNewBooking({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        description: '',
        time: '10:00'
      });
      setBookingError('');
    } catch (error) {
      console.error('Failed to save booking', error);
      setBookingError('Unable to save booking. Please try again later.');
    }

    setShowBookingModal(false);
    setNewBooking({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      description: '',
      time: '10:00'
    });
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingError('');
    setNewBooking({
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone,
      description: booking.description,
      time: booking.time
    });
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await apiFetch<any>(`/bookings/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete booking', error);
    }

    const updatedBookings = bookings.filter(booking => booking.id !== id);
    setBookings(updatedBookings);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>
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
            <button 
              onClick={() => router.push('/dashboard/venue-accommodation/overview')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaChartBar /> Overview
            </button>
            <button 
              onClick={() => router.push('/dashboard/venue-accommodation')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaPlus /> Post Package
            </button>
            <button 
              onClick={() => router.push('/dashboard/venue-accommodation/posted-packages')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaFileInvoice /> Posted Packages
            </button>
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaEdit /> Draft Package
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors"
              style={{backgroundColor: '#755A7B', color: 'white'}}
            >
              <FaCalendarAlt /> Place a Booking
            </button>
            <button onClick={() => router.push('/dashboard/venue-accommodation/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaEye /> Accept Booking
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaBell /> Notifications
            </button>
            <button onClick={() => router.push('/dashboard/venue-accommodation/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaHeart /> Feedback
            </button>
            <button onClick={() => router.push('/dashboard/venue-accommodation/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaCog /> Setting
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all"
              style={{backgroundColor: '#755A7B'}}
            >
              <FaMoon /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                <FaHome /> Home
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">Place a Booking</h1>
              </div>
            </div>
          </div>

          {/* Banner Section */}
          <div 
            className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" 
            style={{
              backgroundImage: `url(${getCategoryBannerImage()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid rgba(117, 90, 123, 0.2)'
            }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.7)'}}>{getCategoryBannerText()}</h2>
            <p className="text-sm md:text-xl text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>Schedule client meetings and manage appointments</p>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('hotel-rooms')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'hotel-rooms' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'hotel-rooms' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'hotel-rooms' ? 'bold' : 'normal',
                  background: activeCategory === 'hotel-rooms' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Hotel Rooms
              </button>
              <button
                onClick={() => setActiveCategory('banquet-halls')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'banquet-halls' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'banquet-halls' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'banquet-halls' ? 'bold' : 'normal',
                  background: activeCategory === 'banquet-halls' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Banquet Hall
              </button>
              <button
                onClick={() => setActiveCategory('outdoor-venues')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'outdoor-venues' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'outdoor-venues' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'outdoor-venues' ? 'bold' : 'normal',
                  background: activeCategory === 'outdoor-venues' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Outdoor Venue
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span>appointment</span>
            <span>/</span>
            <span className="font-semibold" style={{color: '#755A7B'}}>place a booking</span>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 max-w-4xl mx-auto">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{backgroundColor: '#755A7B'}}
              >
                ← Previous
              </button>
              <h3 className="text-xl font-bold text-gray-800">{monthName}</h3>
              <button
                onClick={nextMonth}
                className="px-4 py-2 rounded-lg font-medium text-white"
                style={{backgroundColor: '#755A7B'}}
              >
                Next →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 py-1 text-sm">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square"></div>
              ))}

              {/* Calendar Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = formatDate(currentDate, day);
                const hasBooking = hasBookingOnDate(dateStr);
                const dayBookings = getBookingsForDate(dateStr);

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(dateStr)}
                    className="aspect-square border-2 rounded-lg p-1 cursor-pointer hover:border-purple-500 transition-all relative"
                    style={{
                      borderColor: hasBooking ? '#755A7B' : '#e5e7eb',
                      backgroundColor: hasBooking ? 'rgba(117, 90, 123, 0.05)' : 'white'
                    }}
                  >
                    <div className="text-center font-medium text-sm">{day}</div>
                    {hasBooking && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayBookings.map((_, idx) => (
                          <div
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{backgroundColor: '#755A7B'}}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Bookings</h3>
            <div className="space-y-3">
              {bookings
                .filter(b => b.category === activeCategory)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="border-2 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-800">{booking.clientName}</h4>
                        <p className="text-sm text-gray-600">{booking.clientEmail} | {booking.clientPhone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedDate(booking.date);
                            handleEditBooking(booking);
                            setShowBookingModal(true);
                          }}
                          className="px-3 py-1 rounded text-white"
                          style={{backgroundColor: '#755A7B'}}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="px-3 py-1 rounded bg-red-500 text-white"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{booking.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold" style={{color: '#755A7B'}}>
                        📅 {new Date(booking.date).toLocaleDateString()}
                      </span>
                      <span className="font-semibold" style={{color: '#755A7B'}}>
                        🕐 {booking.time}
                      </span>
                    </div>
                  </div>
                ))}

              {bookings.filter(b => b.category === activeCategory).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaCalendarAlt className="text-4xl mb-2 mx-auto" />
                  <p>No bookings scheduled yet</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t" style={{backgroundColor: '#755A7B', width: '100%'}}>
          <div className="px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* About Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
                  <h3 className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h3>
                </div>
                <p className="text-purple-100 text-sm">
                  Your trusted partner in creating unforgettable wedding experiences.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="/" className="text-purple-100 hover:text-white text-sm transition-colors">Home</a></li>
                  <li><a href="/about" className="text-purple-100 hover:text-white text-sm transition-colors">About Us</a></li>
                  <li><a href="/contact" className="text-purple-100 hover:text-white text-sm transition-colors">Contact</a></li>
                  <li><a href="/signup" className="text-purple-100 hover:text-white text-sm transition-colors">Sign Up</a></li>
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-white font-bold mb-4">Services</h4>
                <ul className="space-y-2">
                  <li><span className="text-purple-100 text-sm">Venue & Accommodation</span></li>
                  <li><span className="text-purple-100 text-sm">Photography</span></li>
                  <li><span className="text-purple-100 text-sm">Fashion & Beauty</span></li>
                  <li><span className="text-purple-100 text-sm">Entertainment</span></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-white font-bold mb-4">Contact Us</h4>
                <ul className="space-y-2">
                  <li className="text-purple-100 text-sm">Email: info@wedora.com</li>
                  <li className="text-purple-100 text-sm">Phone: +94 77 123 4567</li>
                  <li className="text-purple-100 text-sm">Address: Colombo, Sri Lanka</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-purple-400 pt-8">
              <div className="text-center text-purple-100">
                <p>&copy; 2026 Wedora. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingBooking ? 'Edit Booking' : 'New Booking'}
                </h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setEditingBooking(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Selected Date: <span className="font-bold" style={{color: '#755A7B'}}>
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </p>
              </div>

              {/* Show existing bookings for this date */}
              {!editingBooking && getBookingsForDate(selectedDate).length > 0 && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-800">Existing Bookings:</h4>
                  {getBookingsForDate(selectedDate).map((booking) => (
                    <div key={booking.id} className="text-sm mb-2 flex justify-between items-center">
                      <span>{booking.time} - {booking.clientName}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="px-2 py-1 text-xs rounded text-white"
                          style={{backgroundColor: '#755A7B'}}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteBooking(booking.id);
                            if (getBookingsForDate(selectedDate).length === 1) {
                              setShowBookingModal(false);
                            }
                          }}
                          className="px-2 py-1 text-xs rounded bg-red-500 text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={newBooking.clientName}
                    onChange={(e) => setNewBooking({...newBooking, clientName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={newBooking.clientEmail}
                    onChange={(e) => setNewBooking({...newBooking, clientEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                  <input
                    type="tel"
                    value={newBooking.clientPhone}
                    onChange={(e) => setNewBooking({...newBooking, clientPhone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => {
                      const booked = isTimeSlotBooked(selectedDate, slot, editingBooking?.id ?? undefined);
                      const selected = newBooking.time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={booked}
                          onClick={() => {
                            if (!booked) {
                              setNewBooking({ ...newBooking, time: slot });
                              setBookingError('');
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${selected ? 'bg-red-500 text-white border-red-500' : booked ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-500 hover:text-purple-700'}`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {bookingError && (
                    <p className="mt-2 text-sm text-red-600">{bookingError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newBooking.description}
                    onChange={(e) => setNewBooking({...newBooking, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="Meeting details, special requests, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setEditingBooking(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBooking}
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2"
                  style={{backgroundColor: '#755A7B'}}
                >
                  <FaSave /> {editingBooking ? 'Update Booking' : 'Save Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
