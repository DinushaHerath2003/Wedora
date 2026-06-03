'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaArrowLeft, FaHome, FaPhone, FaEnvelope, FaStar, FaHeart, FaShare, FaCheckCircle, FaClock, FaMoneyBillWave, FaCalculator, FaCalendarAlt } from 'react-icons/fa';

interface PackageDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  facilities: string[];
  roomType?: string;
  stock?: number;
  discount?: string;
  discountType?: string;
  images: string[];
  isDraft: boolean;
  createdAt: string;
  vendorId: number;
}

interface VendorUser {
  id?: number;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function PackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;
  
  const [user, setUser] = useState<VendorUser | null>(null);
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [budgetPackages, setBudgetPackages] = useState<string[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const budget = localStorage.getItem('budgetPackages');
    if (budget) {
      setBudgetPackages(JSON.parse(budget));
    }
  }, []);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch<PackageDetail>(`/offerings/${packageId}`);
        setPackageData(data);
      } catch (error) {
        console.error('Failed to load package details:', error);
        setToast({
          message: `Failed to load package details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        });
        setTimeout(() => router.push('/dashboard/venue-accommodation/posted-packages'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    if (packageId) {
      fetchPackageDetail();
    }
  }, [packageId, router]);

  const getCategoryDisplay = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'hotel-rooms': 'Hotel Rooms',
      'hotel-room': 'Hotel Rooms',
      'banquet-halls': 'Banquet Halls',
      'banquet-hall': 'Banquet Halls',
      'outdoor-venues': 'Outdoor Venues',
      'outdoor-venue': 'Outdoor Venues',
    };
    return categoryMap[category] || category;
  };

  const handleAddToBudgetCalculator = () => {
    if (!packageData) return;

    if (!budgetPackages.includes(packageData.id.toString())) {
      const updatedBudgetPackages = [...budgetPackages, packageData.id.toString()];
      setBudgetPackages(updatedBudgetPackages);
      localStorage.setItem('budgetPackages', JSON.stringify(updatedBudgetPackages));

      const budgetPackageDetails = JSON.parse(localStorage.getItem('budgetPackageDetails') || '[]');
      budgetPackageDetails.push({
        packageId: packageData.id.toString(),
        vendorId: packageData.vendorId.toString(),
        title: packageData.name,
        price: packageData.price,
        image: packageData.images[0] || '/pack1.png',
        vendorName: 'Venue Accommodation',
      });
      localStorage.setItem('budgetPackageDetails', JSON.stringify(budgetPackageDetails));

      setToast({
        message: 'Package added to budget calculator.',
        type: 'success',
      });
    } else {
      setToast({
        message: 'Package is already in your budget calculator.',
        type: 'error',
      });
    }
  };

  const handleBookMeeting = () => {
    router.push(`/services/venue-accommodation/${packageData?.vendorId}/book-meeting/${packageData?.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f5f5f7' }}>
        <div className="text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#755A7B' }}></div>
          </div>
          <p className="mt-4 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f5f5f7' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-6">The package you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/venue-accommodation/posted-packages')}
            className="px-6 py-2 rounded-lg font-medium text-white transition-all"
            style={{ backgroundColor: '#755A7B' }}
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const mainImage = packageData.images && packageData.images.length > 0 ? packageData.images[selectedImageIndex] : '/pack1.png';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f7' }}>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Navigation */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              <FaArrowLeft /> Back
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Package Details</h1>
              <p className="text-sm text-gray-500">Venue accommodation dashboard</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <FaHome /> Home
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              {/* Main Image */}
              <div className="relative h-72 md:h-96 bg-gray-100 overflow-hidden">
                <img
                  src={mainImage}
                  alt={packageData.name}
                  className="w-full h-full object-cover"
                />
                {packageData.discount && (
                  <div className="absolute top-6 right-6 bg-red-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                    {packageData.discount} OFF
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {packageData.images && packageData.images.length > 1 && (
                <div className="p-6 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Gallery</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {packageData.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-purple-600 shadow-lg'
                            : 'border-gray-200 hover:border-purple-400'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Package Description */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">About This Package</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {packageData.description}
                </p>
              </div>

              {/* Facilities Section */}
              {packageData.facilities && packageData.facilities.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">✨ Included Facilities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {packageData.facilities.map((facility, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}
                      >
                        <FaCheckCircle style={{ color: '#755A7B' }} />
                        <span className="text-gray-700 font-medium">{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Type Section */}
              {packageData.roomType && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Room Type</h3>
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#755A7B' }}>
                    {packageData.roomType.charAt(0).toUpperCase() + packageData.roomType.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Details & Booking */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-24">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#755A7B' }}>
                  Rs. {packageData.price.toLocaleString()}
                </h2>
                <p className="text-gray-500 text-sm">per day</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FaClock style={{ color: '#755A7B' }} />
                  <span className="font-semibold text-gray-800">Availability</span>
                </div>
                {packageData.stock !== undefined ? (
                  <p className={`text-sm font-medium ${packageData.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {packageData.stock > 0 ? `${packageData.stock} Available` : 'Out of Stock'}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Not specified</p>
                )}
              </div>

              {/* Discount Info */}
              {packageData.discount && packageData.discountType && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)' }}>
                  <p className="text-xs font-semibold text-red-600 mb-1">SPECIAL OFFER</p>
                  <p className="text-sm font-medium text-gray-800">{packageData.discountType}</p>
                  <p className="text-lg font-bold text-red-600 mt-2">{packageData.discount} Discount</p>
                </div>
              )}

              {/* Category Badge */}
              <div className="mb-6 p-4 rounded-lg border-2" style={{ borderColor: '#755A7B' }}>
                <p className="text-xs font-semibold text-gray-600 mb-2">CATEGORY</p>
                <p className="text-sm font-medium text-gray-800">{getCategoryDisplay(packageData.category)}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border-2 ${
                    isFavorite
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:bg-red-50'
                  }`}
                >
                  <FaHeart /> {isFavorite ? 'Saved' : 'Save'}
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: '#755A7B' }}>
                  <FaMoneyBillWave /> Book Now
                </button>
                <button
                  onClick={handleAddToBudgetCalculator}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium border-2 transition-all"
                  style={{ borderColor: '#755A7B', color: '#755A7B', backgroundColor: 'white' }}
                >
                  <FaCalculator /> Add to Budget Calculator
                </button>
                <button
                  onClick={handleBookMeeting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#10b981' }}
                >
                  <FaCalendarAlt /> Book a Meeting
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-gray-700 transition-all border-2 border-gray-300 hover:border-gray-400">
                  <FaShare /> Share
                </button>
              </div>

              {/* Vendor Contact */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wide">Need Help?</p>
                <div className="space-y-2">
                  <a
                    href="tel:+94771234567"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <FaPhone className="text-gray-600" />
                    <span className="text-sm text-gray-700">+94 77 123 4567</span>
                  </a>
                  <a
                    href="mailto:vendor@example.com"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-50"
                  >
                    <FaEnvelope className="text-gray-600" />
                    <span className="text-sm text-gray-700 truncate">info@venue.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Ratings Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Reviews & Ratings</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={18} style={{ color: '#fbbf24' }} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">5.0</span>
                <span className="text-sm text-gray-500">(12 reviews)</span>
              </div>
              <button className="w-full px-4 py-2 rounded-lg font-medium text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-colors">
                Read All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
