'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VENDOR_CATEGORIES } from '@/lib/constants';
import { FaUser, FaUpload } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';

interface VendorRecord {
  id: number;
  email: string;
  organizationName: string;
  location: string;
  categories: string[];
}

interface Offering {
  id: number;
  name: string;
  category: string;
  price: string | number;
}

interface Booking {
  id: number;
  eventDate: string;
  status: string;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
}

interface VendorUser {
  id?: number;
  organizationName: string;
  email: string;
  role: string;
  location: string;
  categories: string[];
  accessToken?: string;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({ offerings: 0, bookings: 0, reviews: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userStr || !token) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'vendor') {
      router.push('/login');
      return;
    }

    setUser(userData);

    const loadVendorData = async () => {
      try {
        const vendors = await apiFetch<VendorRecord[]>('/vendors');
        const currentVendor = vendors.find((vendor) => vendor.email === userData.email);

        if (!currentVendor) {
          setStats({ offerings: 0, bookings: 0, reviews: 0 });
          return;
        }

        const [offerings, bookings, reviews] = await Promise.all([
          apiFetch<Offering[]>(`/offerings?vendorId=${currentVendor.id}`),
          apiFetch<Booking[]>(`/bookings?vendorId=${currentVendor.id}`),
          apiFetch<Review[]>(`/reviews?vendorId=${currentVendor.id}`),
        ]);

        setStats({
          offerings: offerings.length,
          bookings: bookings.length,
          reviews: reviews.length,
        });
      } catch {
        setStats({ offerings: 0, bookings: 0, reviews: 0 });
      } finally {
        setLoadingData(false);
      }
    };

    loadVendorData();

    // Load profile image from localStorage
    const savedProfileImage = localStorage.getItem('vendorProfileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        localStorage.setItem('vendorProfileImage', imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = VENDOR_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#E5D4CC'}}>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Profile Picture */}
            <div className="relative group">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-16 h-16 rounded-full overflow-hidden border-4 transition-all hover:border-purple-400"
                style={{borderColor: '#755A7B'}}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl" style={{backgroundColor: '#755A7B'}}>
                    <FaUser />
                  </div>
                )}
              </button>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                <FaUpload className="text-sm" style={{color: '#755A7B'}} />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'var(--font-season)'}}>{user.organizationName}</h1>
              <p className="text-sm text-gray-600">Vendor Dashboard - {user.location}</p>
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
        {/* Business Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Organization Name</p>
              <p className="text-lg font-medium">{user.organizationName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-lg font-medium">{user.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Categories</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.categories.map((catId) => (
                  <span
                    key={catId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{backgroundColor: '#D2C8D3', color: '#755A7B'}}
                  >
                    {getCategoryName(catId)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - Venue Management (Conditional) */}
          {user.categories.includes('venue-accommodation') && (
            <Link href="/dashboard/venue-accommodation">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="shrink-0 rounded-md p-3" style={{backgroundColor: '#755A7B'}}>
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Venue Manager</h3>
                      <p className="mt-1 text-sm text-gray-500">Manage packages & bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Card 2 - Manage Services */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="shrink-0 rounded-md p-3" style={{backgroundColor: '#755A7B'}}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Manage Services</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {loadingData ? 'Loading offerings...' : `${stats.offerings} live offerings from backend`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Bookings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="shrink-0 rounded-md p-3" style={{backgroundColor: '#A495A8'}}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Bookings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {loadingData ? 'Loading bookings...' : `${stats.bookings} bookings from backend`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Reviews */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="shrink-0 rounded-md p-3" style={{backgroundColor: '#C2A499'}}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {loadingData ? 'Loading reviews...' : `${stats.reviews} reviews from backend`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 - Gallery */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="shrink-0 rounded-md p-3" style={{backgroundColor: '#D2C8D3'}}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Gallery</h3>
                  <p className="mt-1 text-sm text-gray-500">Showcase your work</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5 - Profile */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="shrink-0 rounded-md p-3" style={{backgroundColor: '#755A7B'}}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                  <p className="mt-1 text-sm text-gray-500">Update business details</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6 - Analytics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="shrink-0 rounded-md p-3" style={{backgroundColor: '#A495A8'}}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                  <p className="mt-1 text-sm text-gray-500">View your performance from live backend data</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <p className="text-gray-600 mb-4">
            Your dashboard is now connected to the backend and will reflect real vendor data.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 text-white rounded-md transition-colors hover:opacity-90" style={{backgroundColor: '#755A7B'}}>
              Add New Service
            </button>
            <button className="px-6 py-3 text-white rounded-md transition-colors hover:opacity-90" style={{backgroundColor: '#A495A8'}}>
              View Pending Bookings
            </button>
            <button className="px-6 py-3 text-white rounded-md transition-colors hover:opacity-90" style={{backgroundColor: '#C2A499'}}>
              Update Profile
            </button>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6 text-center" style={{fontFamily: 'var(--font-season)', color: '#755A7B'}}>
              Profile Picture
            </h3>
            
            <div className="flex flex-col items-center gap-6">
              {/* Current Profile Picture */}
              <div className="w-40 h-40 rounded-full overflow-hidden border-4" style={{borderColor: '#755A7B'}}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl" style={{backgroundColor: '#755A7B'}}>
                    <FaUser />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="w-full">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    id="profile-upload"
                  />
                  <div className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-md cursor-pointer transition-all hover:opacity-90" style={{backgroundColor: '#755A7B'}}>
                    <FaUpload />
                    <span>Upload New Photo</span>
                  </div>
                </label>
              </div>

              {profileImage && (
                <button
                  onClick={() => {
                    setProfileImage(null);
                    localStorage.removeItem('vendorProfileImage');
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full mt-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
