'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHome, FaBars, FaTimes, FaSignOutAlt, FaBell } from 'react-icons/fa';

interface DashboardNavbarProps {
  onLogout?: () => void;
}

export default function DashboardNavbar({ onLogout }: DashboardNavbarProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout?.();
    router.push('/');
  };

  const handleHome = () => {
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleHome}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#755A7B' }}>
              W
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-800">Wedora</h1>
              <p className="text-xs text-gray-500">Vendor Dashboard</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={handleHome}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              <FaHome /> Home
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors relative">
              <FaBell /> 
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">0</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: '#755A7B' }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 border-t pt-4">
            <button 
              onClick={() => {
                handleHome();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
            >
              <FaHome /> Home
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-purple-50 rounded-lg transition-colors font-medium">
              <FaBell /> Notifications
            </button>
            <button 
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: '#755A7B' }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
