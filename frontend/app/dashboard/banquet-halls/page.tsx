'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaBell, FaEdit, FaTrash, FaCalendarAlt, FaEye } from 'react-icons/fa';

type VenueCategory = 'hotel-rooms' | 'banquet-halls' | 'outdoor-venues';
type AppointmentStatus = 'new' | 'accepted' | 'rejected' | 'rescheduled';

interface Package {
  id: string;
  category: VenueCategory;
  title: string;
  pricePerDay: number;
  facilities: string[];
  photos: string[];
  createdAt: Date;
  blockedDates?: string[];
  foodBeveragePrice?: number;
  decorationPrice?: number;
  guestServiceCharge?: number;
}

interface Appointment {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  requestedDate: string;
  requestedTime: string;
  weddingDate: string;
  packageInterest: string;
  expectedGuests: string;
  message: string;
  status: AppointmentStatus;
  venueName: string;
}

interface VendorUser {
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function BanquetHallsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory] = useState<VenueCategory>('banquet-halls');
  const [showNewPackageForm, setShowNewPackageForm] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState<AppointmentStatus>('new');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCalendar, setShowCalendar] = useState<string | null>(null);
  const [newPackage, setNewPackage] = useState({
    title: '',
    pricePerDay: '',
    facilities: '',
    foodBeveragePrice: '',
    decorationPrice: '',
    guestServiceCharge: '',
    photos: [] as File[],
  });

  // Mock appointments data
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      customerName: 'John & Diana',
      email: 'john@email.com',
      phone: '+94 77 123 4567',
      requestedDate: 'Jan 15, 2026',
      requestedTime: '2:00 PM',
      weddingDate: 'Feb 14, 2026',
      packageInterest: 'Full Wedding Package - Banquet Hall',
      expectedGuests: '200-250 people',
      message: 'We are interested in booking the banquet hall for our wedding. Would love to discuss customization options.',
      status: 'new',
      venueName: 'Cinderella Hotel'
    },
    {
      id: '2',
      customerName: 'Sarah & Mike',
      email: 'sarah@email.com',
      phone: '+94 77 987 6543',
      requestedDate: 'Jan 12, 2026',
      requestedTime: '10:00 AM',
      weddingDate: 'March 20, 2026',
      packageInterest: 'Hotel Rooms Package',
      expectedGuests: '100-150 people',
      message: 'Looking for accommodation for wedding guests.',
      status: 'accepted',
      venueName: 'Cinderella Hotel'
    }
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } else {
      setUser({
        name: 'Demo Vendor',
        email: 'demo@wedora.com',
        role: 'vendor',
        organizationName: 'Demo Venue Company'
      });
    }
    
    const savedPackages = localStorage.getItem('venuePackages');
    if (savedPackages) {
      setPackages(JSON.parse(savedPackages));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPackage({
        ...newPackage,
        photos: Array.from(e.target.files),
      });
    }
  };

  const handleSubmitPackage = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData: Package = {
      id: Date.now().toString(),
      category: activeCategory,
      title: newPackage.title,
      pricePerDay: parseFloat(newPackage.pricePerDay),
      facilities: newPackage.facilities.split(',').map(f => f.trim()),
      photos: newPackage.photos.map(f => URL.createObjectURL(f)),
      createdAt: new Date(),
      blockedDates: [],
      foodBeveragePrice: newPackage.foodBeveragePrice ? parseFloat(newPackage.foodBeveragePrice) : undefined,
      decorationPrice: newPackage.decorationPrice ? parseFloat(newPackage.decorationPrice) : undefined,
      guestServiceCharge: newPackage.guestServiceCharge ? parseFloat(newPackage.guestServiceCharge) : undefined,
    };

    const updatedPackages = [...packages, packageData];
    setPackages(updatedPackages);
    localStorage.setItem('venuePackages', JSON.stringify(updatedPackages));

    setNewPackage({
      title: '',
      pricePerDay: '',
      facilities: '',
      foodBeveragePrice: '',
      decorationPrice: '',
      guestServiceCharge: '',
      photos: [],
    });
    setShowNewPackageForm(false);
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const updatedPackages = packages.filter(pkg => pkg.id !== id);
      setPackages(updatedPackages);
      localStorage.setItem('venuePackages', JSON.stringify(updatedPackages));
    }
  };

  const getCategoryPackages = () => {
    return packages.filter(pkg => pkg.category === activeCategory);
  };

  const getFilteredAppointments = () => {
    return appointments.filter(apt => apt.status === appointmentFilter);
  };

  const handleAppointmentAction = (action: 'accept' | 'reject' | 'reschedule') => {
    alert(`Appointment ${action}ed successfully!`);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f8f5ff'}}>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold" style={{fontFamily: 'var(--font-season)', color: '#755A7B'}}>Cinderella Hotel</h1>
              <p className="text-sm" style={{color: '#755A7B'}}>Banquet Halls</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white rounded-md transition-colors hover:opacity-90"
            style={{backgroundColor: '#755A7B'}}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Selection Buttons - Line style */}
        <div className="mb-8">
          <div className="flex gap-6 justify-center items-center">
            <button
              onClick={() => router.push('/dashboard/venue-accommodation')}
              className="px-8 py-3 font-medium transition-all border-b-4"
              style={{
                borderColor: 'transparent',
                color: '#999',
                fontWeight: 'normal',
                background: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A495A8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              Hotel Rooms
            </button>
            <button
              className="px-8 py-3 font-medium transition-all border-b-4"
              style={{
                borderColor: '#755A7B',
                color: '#755A7B',
                fontWeight: 'bold',
                background: 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))'
              }}
            >
              Banquet Halls
            </button>
            <button
              onClick={() => router.push('/dashboard/outdoor-venues')}
              className="px-8 py-3 font-medium transition-all border-b-4"
              style={{
                borderColor: 'transparent',
                color: '#999',
                fontWeight: 'normal',
                background: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A495A8'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = activeCategory === 'outdoor-venues' ? '#755A7B' : 'transparent'}
            >
              Outdoor Venues
            </button>
          </div>
        </div>

        {/* Banner Section */}
        <div 
          className="mb-8 rounded-lg overflow-hidden shadow-lg" 
          style={{
            backgroundImage: 'url(/11.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid rgba(117, 90, 123, 0.2)'
          }}
        >
          <h2 className="text-5xl font-bold text-white mb-3" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.7)', fontFamily: 'var(--font-season)'}}>
            Banquet Halls Manager Dashboard
          </h2>
          <p className="text-2xl text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)', fontFamily: 'var(--font-season)'}}>
            Manage your banquet hall services here
          </p>
        </div>

        {/* Post New Package Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowNewPackageForm(!showNewPackageForm)}
            className="px-8 py-3 text-white rounded-md font-medium transition-all hover:shadow-lg"
            style={{backgroundColor: '#755A7B'}}
          >
            {showNewPackageForm ? 'Cancel' : '+ Post New Package'}
          </button>
        </div>

        {/* New Package Form */}
        {showNewPackageForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8" style={{border: '2px solid rgba(117, 90, 123, 0.2)'}}>
            <h4 className="text-xl font-bold mb-4" style={{fontFamily: 'var(--font-season)', color: '#755A7B'}}>Create New Package</h4>
            <form onSubmit={handleSubmitPackage}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Title</label>
                  <input
                    type="text"
                    required
                    value={newPackage.title}
                    onChange={(e) => setNewPackage({...newPackage, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Deluxe Suite with Ocean View"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Day (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={newPackage.pricePerDay}
                    onChange={(e) => setNewPackage({...newPackage, pricePerDay: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 15000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facilities (comma-separated)</label>
                  <textarea
                    required
                    value={newPackage.facilities}
                    onChange={(e) => setNewPackage({...newPackage, facilities: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="e.g., WiFi, AC, TV, Mini Bar, Balcony"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Food & Beverage Price (Rs.)</label>
                    <input
                      type="number"
                      value={newPackage.foodBeveragePrice}
                      onChange={(e) => setNewPackage({...newPackage, foodBeveragePrice: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Decoration Price (Rs.)</label>
                    <input
                      type="number"
                      value={newPackage.decorationPrice}
                      onChange={(e) => setNewPackage({...newPackage, decorationPrice: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 3000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest Service Charge (Rs.)</label>
                    <input
                      type="number"
                      value={newPackage.guestServiceCharge}
                      onChange={(e) => setNewPackage({...newPackage, guestServiceCharge: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-sm text-gray-500 mt-1">You can select multiple photos</p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 text-white rounded-md font-medium transition-colors hover:opacity-90"
                    style={{backgroundColor: '#755A7B'}}
                  >
                    Publish Package
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewPackageForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md font-medium transition-colors hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Packages List */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8" style={{border: '2px solid rgba(117, 90, 123, 0.2)'}}>
          <h3 className="text-2xl font-bold mb-6" style={{fontFamily: 'var(--font-season)', color: '#755A7B'}}>Posted Available Packages</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCategoryPackages().length === 0 ? (
              /* Static Demo Package Card */
              <div className="bg-white rounded-lg shadow-xl overflow-hidden transform transition-all hover:scale-105" style={{border: '2px solid rgba(117, 90, 123, 0.2)'}}>
                <div className="relative h-64">
                  <img
                    src="/room.jpg"
                    alt="Wedding Package"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                    <p className="text-sm font-semibold" style={{color: '#755A7B'}}>FULL PACKAGE</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-2xl font-bold mb-4 text-center" style={{color: '#755A7B', fontFamily: 'var(--font-season)'}}>
                    Get 20% Discount
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Package Title</label>
                      <p className="text-lg font-medium text-gray-800">Luxury Room Package</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Price Per Day (Rs.)</label>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold" style={{color: '#755A7B'}}>Rs. 25,000</span>
                        <span className="text-lg text-gray-400 line-through ml-2">Rs. 31,250</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Facilities</label>
                      <div className="flex flex-wrap gap-2">
                        {['AC', 'WiFi', 'Parking', 'Catering', 'Attached Bathrooms'].map((facility) => (
                          <span
                            key={facility}
                            className="px-3 py-1 text-sm rounded-full"
                            style={{backgroundColor: '#D2C8D3', color: '#755A7B'}}
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 italic">
                      This package is for the couples who want guidance in planning their wedding from the beginning to the end.
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <button 
                        onClick={() => setShowCalendar('demo')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all hover:shadow-md"
                        style={{backgroundColor: '#E5D4CC', color: '#755A7B'}}
                      >
                        <FaCalendarAlt /> Calendar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 text-white rounded-md transition-all hover:opacity-90" style={{backgroundColor: '#755A7B'}}>
                        <FaEdit /> Edit
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 text-white rounded-md transition-all hover:opacity-90" style={{backgroundColor: '#d9534f'}}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              getCategoryPackages().map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105" style={{border: '2px solid rgba(117, 90, 123, 0.2)'}}>
                  {pkg.photos.length > 0 && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={pkg.photos[0]}
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{pkg.title}</h4>
                    <p className="text-2xl font-bold mb-4" style={{color: '#755A7B'}}>
                      Rs. {pkg.pricePerDay.toLocaleString()}/day
                    </p>
                    
                    {/* Additional Pricing */}
                    {(pkg.foodBeveragePrice || pkg.decorationPrice || pkg.guestServiceCharge) && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Additional Services:</h5>
                        {pkg.foodBeveragePrice && (
                          <p className="text-sm text-gray-600">• Food & Beverage: Rs. {pkg.foodBeveragePrice.toLocaleString()}</p>
                        )}
                        {pkg.decorationPrice && (
                          <p className="text-sm text-gray-600">• Decoration: Rs. {pkg.decorationPrice.toLocaleString()}</p>
                        )}
                        {pkg.guestServiceCharge && (
                          <p className="text-sm text-gray-600">• Guest Service: Rs. {pkg.guestServiceCharge.toLocaleString()}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Facilities:</h5>
                      <div className="flex flex-wrap gap-2">
                        {pkg.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm rounded-full"
                            style={{backgroundColor: '#D2C8D3', color: '#755A7B'}}
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      Posted: {new Date(pkg.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                      <button 
                        onClick={() => setShowCalendar(pkg.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all hover:shadow-md"
                        style={{backgroundColor: '#E5D4CC', color: '#755A7B'}}
                      >
                        <FaCalendarAlt /> Calendar
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 text-white rounded-md transition-all hover:opacity-90" style={{backgroundColor: '#755A7B'}}>
                        <FaEdit /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-white rounded-md transition-all hover:opacity-90" 
                        style={{backgroundColor: '#d9534f'}}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booking Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCalendar(null)}>
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-4" style={{fontFamily: 'var(--font-season)', color: '#755A7B'}}>Booking Availability Calendar</h3>
              <p className="text-gray-600 mb-4">Select dates to block/unblock for bookings</p>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <FaCalendarAlt className="text-6xl mx-auto mb-4" style={{color: '#755A7B'}} />
                <p className="text-gray-600">Calendar component will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">You can select dates to mark as unavailable</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowCalendar(null)}
                  className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                <button 
                  className="px-6 py-2 text-white rounded-md hover:opacity-90"
                  style={{backgroundColor: '#755A7B'}}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Request Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 overflow-hidden" style={{border: '2px solid rgba(117, 90, 123, 0.2)'}}>
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold mb-2" style={{fontFamily: 'var(--font-season)', color: '#755A7B'}}>
              Requested Appointments to Discussion
            </h3>
            <p className="text-gray-600">Manage customer appointment requests</p>
          </div>
          
          {/* Status Filter Tabs */}
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            {(['new', 'accepted', 'rejected', 'rescheduled'] as AppointmentStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setAppointmentFilter(status)}
                className="px-6 py-2 rounded-full font-medium transition-all capitalize"
                style={{
                  backgroundColor: appointmentFilter === status ? '#755A7B' : '#f3f4f6',
                  color: appointmentFilter === status ? 'white' : '#755A7B',
                  border: `2px solid ${appointmentFilter === status ? '#755A7B' : '#e5e7eb'}`
                }}
              >
                {status} ({appointments.filter(a => a.status === status).length})
              </button>
            ))}
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {getFilteredAppointments().map((appointment) => (
              <div 
                key={appointment.id}
                className="bg-purple-50 rounded-lg p-5 border-2 transition-all hover:shadow-md"
                style={{borderColor: '#D2C8D3'}}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>
                      {appointment.customerName.split(' ')[0].charAt(0)}{appointment.customerName.split(' ')[1]?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{appointment.customerName}</h4>
                      <p className="text-sm text-gray-600">{appointment.requestedDate} at {appointment.requestedTime}</p>
                      <p className="text-sm" style={{color: '#755A7B'}}>{appointment.venueName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(appointment)}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-all hover:opacity-90"
                    style={{backgroundColor: '#755A7B'}}
                  >
                    <FaEye /> See More
                  </button>
                </div>
              </div>
            ))}
            
            {getFilteredAppointments().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No {appointmentFilter} appointments found
              </div>
            )}
          </div>
        </div>

        {/* Detailed Appointment Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedAppointment(null)}>
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-3xl font-bold mb-6 text-center" style={{fontFamily: 'var(--font-season)', color: '#755A7B'}}>
                Appointment Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{backgroundColor: '#755A7B'}}>
                    {selectedAppointment.customerName.split(' ')[0].charAt(0)}{selectedAppointment.customerName.split(' ')[1]?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedAppointment.customerName}</h4>
                    <p className="text-sm text-gray-600">Wedding Date: {selectedAppointment.weddingDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Contact Email</p>
                    <p className="text-gray-900">{selectedAppointment.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Phone</p>
                    <p className="text-gray-900">{selectedAppointment.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Requested Date</p>
                    <p className="text-gray-900">{selectedAppointment.requestedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Requested Time</p>
                    <p className="text-gray-900">{selectedAppointment.requestedTime}</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Interested Package</p>
                  <p className="text-gray-900">{selectedAppointment.packageInterest}</p>
                  <p className="text-sm text-gray-600 mt-2">Expected Guests: {selectedAppointment.expectedGuests}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Message</p>
                  <p className="text-gray-900 italic">&quot;{selectedAppointment.message}&quot;</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Venue</p>
                  <p className="text-gray-900">{selectedAppointment.venueName}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => handleAppointmentAction('accept')}
                  className="flex-1 py-3 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg"
                  style={{backgroundColor: '#28a745'}}
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleAppointmentAction('reschedule')}
                  className="flex-1 py-3 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg"
                  style={{backgroundColor: '#755A7B'}}
                >
                  Reschedule
                </button>
                <button 
                  onClick={() => handleAppointmentAction('reject')}
                  className="flex-1 py-3 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg"
                  style={{backgroundColor: '#d9534f'}}
                >
                  Reject
                </button>
              </div>
              
              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full mt-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
