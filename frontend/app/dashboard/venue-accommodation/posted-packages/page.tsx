'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaBell, FaEdit, FaTrash, FaCalendarAlt, FaEye, FaChartBar, FaFileInvoice, FaCog, FaMoon, FaPlus, FaHome } from 'react-icons/fa';

type VenueCategory = 'hotel-rooms' | 'banquet-halls' | 'outdoor-venues';

interface Package {
  id: string;
  category: VenueCategory;
  title: string;
  pricePerDay: number;
  facilities: string[];
  photos: string[];
  createdAt: Date;
  stock?: number;
  discount?: string;
  discountType?: string;
}

interface VendorUser {
  id?: number;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function PostedPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<VenueCategory>('hotel-rooms');
  const [toast, setToast] = useState<ToastProps | null>(null);

  const [packages, setPackages] = useState<Package[]>([]);

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
        return 'Hotel Rooms Packages';
      case 'banquet-halls':
        return 'Banquet Hall Packages';
      case 'outdoor-venues':
        return 'Outdoor Venue Packages';
      default:
        return 'Posted Packages';
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      console.log('Fetching packages for vendor:', userData.id);
      fetchVendorPackages(userData.id);
    } else {
      const demoUser = {
        id: 0,
        name: 'Demo Vendor',
        email: 'demo@wedora.com',
        role: 'vendor',
        organizationName: 'Demo Venue Company'
      };
      setUser(demoUser);
      setPackages([]);
    }
  }, [])

  const fetchVendorPackages = async (vendorId: number) => {
    try {
      const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      console.log('Fetched offerings:', offerings);
      setPackages(
        offerings
          .filter((offering) => !offering.isDraft)
          .map((offering) => {
            const category = offering.category;
            let mappedCategory: VenueCategory = 'hotel-rooms';
            
            if (category === 'hotel-rooms' || category === 'hotel-room') {
              mappedCategory = 'hotel-rooms';
            } else if (category === 'banquet-halls' || category === 'banquet-hall') {
              mappedCategory = 'banquet-halls';
            } else if (category === 'outdoor-venues' || category === 'outdoor-venue') {
              mappedCategory = 'outdoor-venues';
            }
            
            return {
              id: offering.id.toString(),
              category: mappedCategory,
              title: offering.name,
              pricePerDay: Number(offering.price),
              facilities: offering.facilities || [],
              photos: offering.images || [],
              createdAt: new Date(offering.createdAt),
              stock: offering.stock,
              discount: offering.discount,
              discountType: offering.discountType,
            };
          })
      );
    } catch (error) {
      console.error('Unable to load posted packages', error);
      setToast({
        message: `Failed to load packages: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      await apiFetch(`/offerings/${id}`, {
        method: 'DELETE',
      });
      setPackages(packages.filter(pkg => pkg.id !== id));
      setToast({
        message: 'Package deleted successfully! ✓',
        type: 'success',
      });
    } catch (error) {
      console.error('Unable to delete package', error);
      setToast({
        message: `Failed to delete package: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const filteredPackages = packages.filter(pkg => pkg.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>
              C
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Cinderella Hotel</h2>
              <p className="text-xs text-gray-500">venue and accommodation</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button 
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors"
              style={{backgroundColor: '#755A7B', color: 'white'}}
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
              onClick={() => router.push('/dashboard/venue-accommodation/place-booking')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"
            >
              <FaCalendarAlt /> Place a Booking
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
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
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <FaHome /> Home
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">Posted Packages</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredPackages.length}</span> posted package{filteredPackages.length !== 1 ? 's' : ''}
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
            <p className="text-sm md:text-xl text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>View and manage your posted packages</p>
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
            <span>mainmenu</span>
            <span>/</span>
            <span className="font-semibold" style={{color: '#755A7B'}}>posted packages</span>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPackages.map((pkg) => (
              <div 
                key={pkg.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Package Image Container */}
                <div className="relative h-48 bg-linear-to-br from-gray-200 to-gray-300 overflow-hidden group">
                  <img 
                    src={pkg.photos[0] || '/pack1.png'} 
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  
                  {/* Discount Badge */}
                  {pkg.discount && (
                    <div className="absolute top-4 right-4 bg-linear-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform">
                      {pkg.discount} OFF
                    </div>
                  )}
                  
                  {/* Stock Badge */}
                  {pkg.stock !== undefined && (
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                      pkg.stock > 0 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {pkg.stock > 0 ? `${pkg.stock} Available` : 'Out of Stock'}
                    </div>
                  )}
                </div>

                {/* Package Details */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {pkg.title}
                  </h3>
                  
                  {/* Price Section */}
                  <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gray-100">
                    <span className="text-3xl font-bold" style={{color: '#755A7B'}}>
                      Rs. {pkg.pricePerDay.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">/day</span>
                  </div>

                  {/* Discount Type Badge */}
                  {pkg.discountType && (
                    <div className="mb-4">
                      <span className="inline-block bg-linear-to-r from-purple-100 to-purple-50 text-purple-700 px-4 py-1 rounded-full text-xs font-semibold border border-purple-200">
                        🏷️ {pkg.discountType}
                      </span>
                    </div>
                  )}

                  {/* Facilities */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">✨ Facilities:</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.facilities.slice(0, 3).map((facility, idx) => (
                        <span key={idx} className="text-xs bg-linear-to-r from-purple-50 to-purple-100 text-purple-700 px-3 py-1 rounded-full border border-purple-200 font-medium">
                          {facility}
                        </span>
                      ))}
                      {pkg.facilities.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                          +{pkg.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-gray-500 mb-4">
                    📅 Posted: {new Date(pkg.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => router.push(`/dashboard/venue-accommodation/posted-packages/${pkg.id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 font-semibold text-emerald-700 bg-white transition-all hover:bg-emerald-600 hover:text-white hover:shadow-lg"
                    >
                      <FaEye size={16} /> See More
                    </button>
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all hover:shadow-lg"
                        style={{
                          borderColor: '#755A7B',
                          color: '#755A7B',
                          backgroundColor: 'white',
                          borderWidth: '2px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(117, 90, 123, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <FaEdit size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg font-medium text-red-600 border-red-600 hover:bg-red-50 transition-all"
                      >
                        <FaTrash size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPackages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl text-gray-300 mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No packages found</h3>
              <p className="text-gray-500 mb-6">You haven't posted any packages in this category yet.</p>
              <button 
                onClick={() => router.push('/dashboard/venue-accommodation')}
                className="px-6 py-3 rounded-lg font-medium text-white"
                style={{backgroundColor: '#755A7B'}}
              >
                <FaPlus className="inline mr-2" /> Create Your First Package
              </button>
            </div>
          )}
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
    </div>
  );
}
