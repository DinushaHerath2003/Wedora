'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaHome, FaStar } from 'react-icons/fa';

interface PackageDetail {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  facilities?: string[];
  stock?: number;
  discount?: string;
  discountType?: string;
  images?: string[];
  vendorId: number;
}

interface PackageReview {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

const categoryLabels: Record<string, string> = {
  'bridal-makeup': 'Bridal Makeup',
  'hair-styling': 'Hair Styling',
  'traditional-dressing': 'Traditional Dressing',
};

export default function FashionBeautyPackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [reviews, setReviews] = useState<PackageReview[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      try {
        setIsLoading(true);
        const [offering, packageReviews] = await Promise.all([
          apiFetch<PackageDetail>(`/offerings/${packageId}`),
          apiFetch<PackageReview[]>(`/reviews?offeringId=${packageId}`),
        ]);
        setPackageData(offering);
        setReviews(packageReviews || []);
      } catch (error) {
        console.error('Failed to load fashion beauty package details', error);
        setToast({
          message: `Failed to load package details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (packageId) {
      loadPackage();
    }
  }, [packageId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-purple-100 border-t-purple-700 animate-spin" />
          <p className="text-gray-600 font-medium">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="text-center">
          <FaCheckCircle className="mx-auto text-5xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Package Not Found</h2>
          <button onClick={() => router.back()} className="mt-4 px-6 py-2 rounded-lg font-medium text-white" style={{ backgroundColor: '#755A7B' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const images = packageData.images?.length ? packageData.images : ['/saloon.png'];
  const mainImage = images[selectedImageIndex] || images[0];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200">
              <FaArrowLeft /> Back
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Package Details</h1>
              <p className="text-sm text-gray-500">Fashion & beauty</p>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
            <FaHome /> Home
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative h-72 md:h-96 bg-gray-100">
                <img src={mainImage} alt={packageData.name} className="w-full h-full object-cover" />
                {packageData.discount && (
                  <div className="absolute top-6 right-6 bg-red-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg">
                    {packageData.discount} OFF
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="p-6 border-t">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Gallery</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {images.map((image, index) => (
                      <button
                        key={image}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-purple-600 shadow-lg' : 'border-gray-200 hover:border-purple-400'}`}
                      >
                        <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Package</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{packageData.description || 'No description provided.'}</p>

              {!!packageData.facilities?.length && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Included Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {packageData.facilities.map((service) => (
                      <div key={service} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                        <FaCheckCircle style={{ color: '#755A7B' }} />
                        <span className="text-gray-700 font-medium">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <p className="text-xs font-semibold text-gray-600 mb-2">CATEGORY</p>
              <p className="text-sm font-medium text-gray-800 mb-6">{categoryLabels[packageData.category] || packageData.category}</p>

              <h2 className="text-3xl font-bold mb-2" style={{ color: '#755A7B' }}>
                Rs. {Number(packageData.price || 0).toLocaleString()}
              </h2>
              {packageData.discountType && <p className="text-sm text-red-600 font-semibold mb-4">{packageData.discountType}</p>}

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(117, 90, 123, 0.05)' }}>
                <p className="font-semibold text-gray-800 mb-1">Availability</p>
                <p className="text-sm text-gray-600">{packageData.stock !== undefined ? `${packageData.stock} available` : 'Not specified'}</p>
              </div>

              <button
                onClick={() => router.push(`/services/fashion-beauty/${packageData.vendorId}/book-meeting/${packageData.id}`)}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#10b981' }}
              >
                <FaCalendarAlt /> Book a Meeting
              </button>
            </section>

            <section className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Reviews & Ratings</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, index) => (
                    <FaStar key={index} size={18} style={{ color: index < Math.round(averageRating) ? '#fbbf24' : '#d1d5db' }} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-800">{averageRating ? averageRating.toFixed(1) : 'No ratings'}</span>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{review.user?.name || review.user?.email || 'Customer'}</p>
                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                          <FaStar key={index} size={14} style={{ color: index < review.rating ? '#fbbf24' : '#d1d5db' }} />
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
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
