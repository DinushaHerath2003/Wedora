'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";

type NavUser = {
  name?: string;
  email?: string;
};

export default function AboutUs() {
  const [user, setUser] = useState<NavUser | null>(null);

  const loadUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(userStr));
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('auth-changed', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('auth-changed', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="relative"
          style={{
            backgroundImage: 'url(/home2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '500px'
          }}
        >
          {/* Header */}
          <header className="relative bg-transparent" style={{ zIndex: 10 }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Wedora Logo" className="h-12 w-12" />
                <h1 className="text-2xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h1>
              </div>
              <nav className="flex items-center gap-6">
                <Link
                  href="/"
                  className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80"
                >
                  Home
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
                {user ? (
                  <div className="flex items-center gap-3 rounded-full border border-white/70 px-3 py-2 text-white">
                    <FaUserCircle className="text-2xl" />
                    <div className="text-left leading-tight">
                      <p className="text-sm font-semibold">{user.name || 'User'}</p>
                      <p className="text-[11px] text-white/80 truncate max-w-36">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-1 rounded-full p-2 text-white hover:bg-white/10"
                      title="Logout"
                    >
                      <FaSignOutAlt />
                    </button>
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

          {/* Hero Content */}
          <div 
            className="relative z-10 flex items-center justify-center"
            style={{
              minHeight: '400px',
              padding: '60px 20px'
            }}
          >
            <div className="text-center max-w-4xl">
              <h1 className="text-5xl font-bold text-white mb-6" style={{fontFamily: 'var(--font-season)'}}>
                About Wedora
              </h1>
              <p className="text-xl text-white mb-8 leading-relaxed">
                Your trusted partner in creating unforgettable wedding experiences. 
                We connect couples with the finest wedding vendors across all categories.
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-4 text-lg font-medium rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105"
                style={{backgroundColor: '#FFFFFF', color: '#755A7B'}}
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            {/* Our Story */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'var(--font-season)'}}>
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Wedora was born from a simple idea: making wedding planning easier and more enjoyable for couples. 
                We understand that your wedding day is one of the most important moments of your life, and finding 
                the right vendors shouldn't be stressful.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Founded in 2024, we've grown to become the leading wedding vendor marketplace, connecting thousands 
                of couples with trusted professionals across 11 different categories.
              </p>
            </div>

            {/* Our Mission */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6" style={{fontFamily: 'var(--font-season)'}}>
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We're dedicated to simplifying the wedding planning process by providing a comprehensive platform 
                where couples can discover, compare, and book all their wedding services in one place.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our goal is to ensure every couple has access to quality vendors, transparent pricing, and authentic 
                reviews to make informed decisions for their special day.
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20">
            <div className="text-center p-6 rounded-lg" style={{backgroundColor: '#F3F4F6'}}>
              <div className="text-4xl font-bold mb-2" style={{color: '#755A7B'}}>5000+</div>
              <div className="text-gray-600">Happy Couples</div>
            </div>
            <div className="text-center p-6 rounded-lg" style={{backgroundColor: '#F3F4F6'}}>
              <div className="text-4xl font-bold mb-2" style={{color: '#755A7B'}}>1000+</div>
              <div className="text-gray-600">Verified Vendors</div>
            </div>
            <div className="text-center p-6 rounded-lg" style={{backgroundColor: '#F3F4F6'}}>
              <div className="text-4xl font-bold mb-2" style={{color: '#755A7B'}}>11</div>
              <div className="text-gray-600">Service Categories</div>
            </div>
            <div className="text-center p-6 rounded-lg" style={{backgroundColor: '#F3F4F6'}}>
              <div className="text-4xl font-bold mb-2" style={{color: '#755A7B'}}>4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" style={{fontFamily: 'var(--font-season)'}}>
              Why Choose Wedora?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#D2C8D3'}}>
                  <svg className="w-8 h-8" style={{color: '#755A7B'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3" style={{fontFamily: 'var(--font-season)'}}>
                  Verified Vendors
                </h3>
                <p className="text-gray-600">
                  All our vendors are carefully vetted and verified to ensure quality service
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#E5D4CC'}}>
                  <svg className="w-8 h-8" style={{color: '#755A7B'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3" style={{fontFamily: 'var(--font-season)'}}>
                  Time Saving
                </h3>
                <p className="text-gray-600">
                  Find and book all your wedding services in one convenient platform
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{backgroundColor: '#D2C8D3'}}>
                  <svg className="w-8 h-8" style={{color: '#755A7B'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3" style={{fontFamily: 'var(--font-season)'}}>
                  Trusted Reviews
                </h3>
                <p className="text-gray-600">
                  Read authentic reviews from real couples to make informed decisions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div 
            className="relative rounded-2xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: 'url(/15.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '400px'
            }}
          >
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
                className="inline-block px-10 py-4 text-lg font-medium border-2 rounded-md shadow-lg transition-all hover:bg-white hover:text-purple-700 hover:shadow-xl"
                style={{borderColor: '#755A7B', color: '#755A7B', backgroundColor: 'transparent'}}
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
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
                <h3 className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h3>
              </div>
              <p className="text-purple-100 text-sm">Your trusted partner in creating unforgettable wedding experiences.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-purple-100 hover:text-white text-sm transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-purple-100 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-purple-100 hover:text-white text-sm transition-colors">Contact</Link></li>
                <li><Link href="/signup" className="text-purple-100 hover:text-white text-sm transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-purple-100 text-sm">Venue & Accommodation</span></li>
                <li><span className="text-purple-100 text-sm">Photography</span></li>
                <li><span className="text-purple-100 text-sm">Fashion & Beauty</span></li>
                <li><span className="text-purple-100 text-sm">Entertainment</span></li>
              </ul>
            </div>
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
