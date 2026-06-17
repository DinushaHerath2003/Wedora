'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaShoppingCart, FaCalculator, FaChevronDown, FaUserCircle, FaSignOutAlt, FaEdit } from "react-icons/fa";

type HomeUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  organizationName?: string;
};

export default function Home() {
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<HomeUser | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr) as HomeUser;
      setUser(userData);
      setProfileForm({
        name: userData.name || '',
        email: userData.email || '',
      });
    }
  }, []);

  const handleProfileSave = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: profileForm.name,
      email: profileForm.email,
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowProfileEditor(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowProfileMenu(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image */}
        <img 
          src="/4.jpg" 
          alt="Wedding background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-red bg-opacity-40" style={{ zIndex: 1 }}></div>
        
        {/* Header */}
        <header className="relative bg-transparent" style={{ zIndex: 100 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Wedora Logo" className="h-12 w-12" />
              <h1 className="text-2xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h1>
            </div>
            <nav className="flex items-center gap-6">
              {/* Services Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                  className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80 flex items-center gap-2"
                >
                  Services <FaChevronDown className="text-sm" />
                </button>
                
                {showServicesDropdown && (
                  <>
                    {/* Invisible overlay to close dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0" 
                      style={{ zIndex: 999 }}
                      onClick={() => setShowServicesDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2" style={{ zIndex: 1000 }}>
                    <Link
                      href="/services/venue-accommodation"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Venue & Accommodation
                    </Link>
                    <Link
                      href="/services/photography-videography"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Photography & Videography
                    </Link>
                    <Link
                      href="/services/fashion-beauty"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Fashion & Beauty
                    </Link>
                    <Link
                      href="/services/entertainment"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Entertainment
                    </Link>
                    <Link
                      href="/services/transportation"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Transportation
                    </Link>
                    <Link
                      href="/services/ceremonial"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Ceremonial Services
                    </Link>
                    <Link
                      href="/services/cake-decoration"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Cake Decoration
                    </Link>
                    <Link
                      href="/services/gifting-souvenirs"
                      onClick={() => setShowServicesDropdown(false)}
                      className="block px-4 py-2 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                    >
                      Gifting & Souvenirs
                    </Link>
                  </div>
                  </>
                )}
              </div>

              <Link
                href="/budget-calculator"
                className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80 flex items-center gap-2"
              >
                <FaCalculator /> Budget Calculator
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80"
              >
                Contact
              </Link>
              <Link
                href="/cart"
                className="px-3 py-2 font-medium text-white transition-colors hover:opacity-80 relative"
                title="Cart"
              >
                <FaShoppingCart className="text-xl" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="flex items-center gap-3 rounded-full border border-white/70 px-3 py-2 text-white transition hover:bg-white/10"
                  >
                    <FaUserCircle className="text-2xl" />
                    <div className="text-left leading-tight">
                      <p className="text-sm font-semibold">{user.name || 'User'}</p>
                      <p className="text-[11px] text-white/80 truncate max-w-36">{user.email}</p>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <>
                      <button
                        className="fixed inset-0 z-40 cursor-default"
                        aria-label="Close profile menu"
                        onClick={() => setShowProfileMenu(false)}
                      />
                      <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white p-4 shadow-2xl z-50">
                        <div className="mb-4 rounded-xl p-4" style={{ backgroundColor: 'rgba(117, 90, 123, 0.08)' }}>
                          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Signed in as</p>
                          <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                          <p className="text-sm text-gray-600 break-all">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowProfileEditor(true);
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 rounded-lg px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <FaEdit /> Manage Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="mt-2 w-full flex items-center gap-2 rounded-lg px-4 py-3 text-left font-medium text-red-600 hover:bg-red-50"
                        >
                          <FaSignOutAlt /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-white rounded-md font-medium border-2 border-white transition-all hover:bg-white hover:text-black"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-white rounded-md font-medium border-2 border-white transition-all hover:bg-white hover:text-black"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {showProfileEditor && user && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4" style={{ zIndex: 2000 }}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Profile</p>
                  <h3 className="text-2xl font-bold text-gray-900">Manage your account</h3>
                </div>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowProfileEditor(false)}>×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#755A7B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#755A7B]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowProfileEditor(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  className="rounded-lg px-4 py-2 font-medium text-white"
                  style={{ backgroundColor: '#755A7B' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl" style={{fontFamily: 'var(--font-season)'}}>
              Plan Your Dream
              <span className="block text-white">Wedding</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-white">
              Connect with the best wedding vendors in your area. From venues to photographers, 
              we have everything you need to make your special day unforgettable.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 text-lg font-medium rounded-md border-2 border-white text-white transition-all hover:bg-white hover:text-black"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 text-lg font-medium rounded-md border-2 border-white text-white transition-all hover:bg-white hover:text-black"
              >
                Learn More
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{fontFamily: 'var(--font-season)'}}>
            Why Choose Wedora?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{backgroundColor: '#D2C8D3'}}>
                <svg className="w-6 h-6" style={{color: '#755A7B'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'var(--font-season)'}}>Find Vendors</h3>
              <p className="text-gray-600">
                Browse through hundreds of verified vendors across 11 categories
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{backgroundColor: '#E5D4CC'}}>
                <svg className="w-6 h-6" style={{color: '#755A7B'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'var(--font-season)'}}>Easy Booking</h3>
              <p className="text-gray-600">
                Book and manage all your wedding services in one place
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{backgroundColor: '#D2C8D3'}}>
                <svg className="w-6 h-6" style={{color: '#A495A8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2" style={{fontFamily: 'var(--font-season)'}}>Trusted Reviews</h3>
              <p className="text-gray-600">
                Read authentic reviews from couples who've used our vendors
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Categories */}
        <div className="py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6" style={{fontFamily: 'var(--font-season)'}}>
            Vendor Dashboards
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Click on any category to access the vendor management dashboard (Dev Mode - No Authentication)
          </p>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
            {[
              { name: 'Venue & Accommodation', route: '/dashboard/venue-accommodation' },
              { name: 'Photography & Videography', route: '/dashboard/photography' },
              { name: 'Fashion & Beauty', route: '/dashboard/fashion-beauty' },
              { name: 'Entertainment', route: '/dashboard/entertainment' },
              { name: 'Transportation', route: '/dashboard/transportation' },
              { name: 'Ceremonial Services', route: '/dashboard/ceremonial' },
              { name: 'Cake Decoration', route: '/dashboard/cake-decoration' },
              { name: 'Gifting & Souvenirs', route: '/dashboard/gifting' }
            ].map((category) => (
              <Link
                key={category.name}
                href={category.route}
                className="text-center transition-all transform hover:scale-105 hover:shadow-2xl rounded-xl shadow-lg"
                style={{
                  backgroundColor: '#755A7B',
                  padding: '24px 16px',
                  borderRadius: '12px',
                  border: '2px solid #5a4463'
                }}
              >
                <p className="font-bold text-white text-sm leading-tight">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section with Background Image */}
        <div className="pb-20 px-4">
          <div 
            className="relative rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: 'url(/15.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '400px'
            }}
          >
            {/* Transparent overlay container */}
            <div 
              className="relative z-10 p-12 text-center flex flex-col items-center justify-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                minHeight: '400px'
              }}
            >
              <h2 className="text-4xl font-bold text-white mb-4" style={{fontFamily: 'var(--font-season)'}}>
                Ready to Plan Your Perfect Wedding?
              </h2>
              <p className="text-white text-lg mb-8 max-w-2xl">
                Join thousands of couples who have found their perfect vendors on Wedora
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-4 text-lg font-medium rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105"
                style={{backgroundColor: '#FFFFFF', color: '#755A7B'}}
              >
                Create Your Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white" style={{backgroundColor: '#755A7B'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <li><Link href="/" className="text-purple-100 hover:text-white text-sm transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-purple-100 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-purple-100 hover:text-white text-sm transition-colors">Contact</Link></li>
                <li><Link href="/signup" className="text-purple-100 hover:text-white text-sm transition-colors">Sign Up</Link></li>
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
  );
}
