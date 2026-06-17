'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaArrowLeft, FaHome, FaPhone, FaEnvelope, FaStar, FaShare, FaCheckCircle, FaClock, FaCalendarAlt, FaSave, FaTimes } from 'react-icons/fa';

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

interface CurrentUser {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
}

interface PackageReview {
  id: number;
  userId: string;
  offeringId: number;
  vendorId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export default function PackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const packageId = params.id as string;
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [reviews, setReviews] = useState<PackageReview[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    discount: '',
    discountType: '',
    facilities: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(userStr) as CurrentUser);
  }, [router]);

  useEffect(() => {
    const fetchPackageDetail = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch<PackageDetail>(`/offerings/${packageId}`);
        setPackageData(data);
        setEditForm({
          name: data.name || '',
          description: data.description || '',
          price: String(data.price || ''),
          stock: data.stock ? String(data.stock) : '',
          discount: data.discount || '',
          discountType: data.discountType || '',
          facilities: data.facilities?.join(', ') || '',
        });
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiFetch<PackageReview[]>(`/reviews?offeringId=${packageId}`);
        setReviews(data || []);
      } catch (error) {
        console.error('Failed to load package reviews', error);
      }
    };

    if (packageId) {
      fetchReviews();
    }
  }, [packageId]);

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

  const handleBookMeeting = () => {
    router.push(`/services/venue-accommodation/${packageData?.vendorId}/book-meeting/${packageData?.id}`);
  };

  const handleSaveChanges = async () => {
    if (!packageData) return;

    if (!editForm.name.trim() || !editForm.price.trim()) {
      setToast({ message: 'Package name and price are required.', type: 'error' });
      return;
    }

    try {
      const updated = await apiFetch<PackageDetail>(`/offerings/${packageData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          category: packageData.category,
          price: Number(editForm.price),
          facilities: editForm.facilities.split(',').map((item) => item.trim()).filter(Boolean),
          roomType: packageData.roomType,
          stock: editForm.stock ? Number(editForm.stock) : undefined,
          discount: editForm.discount.trim() || undefined,
          discountType: editForm.discountType.trim() || undefined,
          images: packageData.images,
          vendorId: packageData.vendorId,
          isDraft: packageData.isDraft,
        }),
      });

      setPackageData(updated);
      setEditForm({
        name: updated.name || '',
        description: updated.description || '',
        price: String(updated.price || ''),
        stock: updated.stock ? String(updated.stock) : '',
        discount: updated.discount || '',
        discountType: updated.discountType || '',
        facilities: updated.facilities?.join(', ') || '',
      });
      setToast({ message: 'Package saved successfully.', type: 'success' });
      router.replace(`/dashboard/venue-accommodation/posted-packages/${packageData.id}`);
    } catch (error) {
      console.error('Failed to save package changes', error);
      setToast({
        message: `Unable to save package: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!packageData) return;

    if (!currentUser?.id) {
      setToast({ message: 'Please log in before writing a review.', type: 'error' });
      return;
    }

    if (!reviewComment.trim()) {
      setToast({ message: 'Please write a short review before submitting.', type: 'error' });
      return;
    }

    try {
      setSubmittingReview(true);
      const created = await apiFetch<PackageReview>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          userId: String(currentUser.id),
          offeringId: packageData.id,
          vendorId: packageData.vendorId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      setReviews((prev) => [
        {
          ...created,
          user: {
            name: currentUser.name || currentUser.email || 'Customer',
            email: currentUser.email,
          },
        },
        ...prev,
      ]);
      setReviewRating(5);
      setReviewComment('');
      setToast({ message: 'Review submitted successfully.', type: 'success' });
    } catch (error) {
      console.error('Failed to submit review', error);
      setToast({
        message: `Unable to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setSubmittingReview(false);
    }
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
          <FaCheckCircle className="mx-auto text-5xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-6">The package is not available.</p>
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
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;

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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit Package Details' : 'About This Package'}</h2>
              {isEditMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {packageData.description}
                  </p>
                </div>
              )}

              {/* Facilities Section */}
              {(isEditMode || (packageData.facilities && packageData.facilities.length > 0)) && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Included Facilities</h3>
                  {isEditMode ? (
                    <input
                      value={editForm.facilities}
                      onChange={(e) => setEditForm({ ...editForm, facilities: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="WiFi, AC, Parking"
                    />
                  ) : (
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
                  )}
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
                {isEditMode ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per day</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#755A7B' }}>
                      Rs. {packageData.price.toLocaleString()}
                    </h2>
                    <p className="text-gray-500 text-sm">per day</p>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FaClock style={{ color: '#755A7B' }} />
                  <span className="font-semibold text-gray-800">Availability</span>
                </div>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder="Available stock"
                  />
                ) : packageData.stock !== undefined ? (
                  <p className={`text-sm font-medium ${packageData.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {packageData.stock > 0 ? `${packageData.stock} Available` : 'Out of Stock'}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Not specified</p>
                )}
              </div>

              {/* Discount Info */}
              {isEditMode ? (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)' }}>
                  <p className="text-xs font-semibold text-red-600 mb-3">SPECIAL OFFER</p>
                  <div className="space-y-3">
                    <input
                      value={editForm.discountType}
                      onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="Discount type"
                    />
                    <input
                      value={editForm.discount}
                      onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                      placeholder="Discount amount"
                    />
                  </div>
                </div>
              ) : packageData.discount && packageData.discountType && (
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
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: '#755A7B' }}
                    >
                      <FaSave /> Save Changes
                    </button>
                    <button
                      onClick={() => router.replace(`/dashboard/venue-accommodation/posted-packages/${packageData.id}`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-gray-700 transition-all border-2 border-gray-300 hover:border-gray-400"
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleBookMeeting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    <FaCalendarAlt /> Book a Meeting
                  </button>
                )}
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
                    <FaStar key={i} size={18} style={{ color: i < Math.round(averageRating) ? '#fbbf24' : '#d1d5db' }} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">{averageRating ? averageRating.toFixed(1) : 'No ratings'}</span>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>

              {!isEditMode && (
                <div className="rounded-xl border border-gray-200 p-4 mb-5">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Write a review</p>
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="text-2xl transition-transform hover:scale-110"
                        aria-label={`${star} star rating`}
                      >
                        <FaStar style={{ color: star <= reviewRating ? '#fbbf24' : '#d1d5db' }} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-400"
                    placeholder="Share your experience with this package..."
                  />
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="mt-3 w-full rounded-lg px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
                    style={{ backgroundColor: '#755A7B' }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{review.user?.name || review.user?.email || 'Customer'}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={14} style={{ color: i < review.rating ? '#fbbf24' : '#d1d5db' }} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{review.comment || 'No comment provided.'}</p>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center">
                    <FaStar className="mx-auto text-3xl text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No reviews yet for this package.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
