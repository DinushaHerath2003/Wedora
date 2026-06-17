'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { CEREMONIAL_DASHBOARD_BASE, CEREMONIAL_CATEGORY_LABELS, normalizeCeremonialCategory, resolveOfferingImage } from '@/lib/ceremonial-dashboard';
import { FaArrowLeft, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

interface PackageDetail {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  facilities: string[];
  roomType?: string;
  discount?: string;
  discountType?: string;
  images: string[];
  isDraft: boolean;
  createdAt: string;
}

export default function CeremonialPackageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params.id as string;
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const fetchPackageDetail = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch<PackageDetail>(`/offerings/${packageId}`);
        setPackageData(data);
      } catch (error) {
        setToast({
          message: `Failed to load package: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        });
        setTimeout(() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/posted-packages`), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    if (packageId) fetchPackageDetail();
  }, [packageId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#755A7B' }} />
      </div>
    );
  }

  if (!packageData) return null;

  const categoryLabel = CEREMONIAL_CATEGORY_LABELS[normalizeCeremonialCategory(packageData.category)];

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="shadow-sm sticky top-0 z-30" style={{ backgroundColor: '#755A7B' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/posted-packages`)}
            className="flex items-center gap-2 text-white hover:opacity-80"
          >
            <FaArrowLeft /> Back to Packages
          </button>
          <button
            onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}?edit=${packageData.id}`)}
            className="px-4 py-2 bg-white rounded-lg font-medium"
            style={{ color: '#755A7B' }}
          >
            Edit Package
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={resolveOfferingImage(packageData.images)}
              alt={packageData.name}
              className="w-full h-80 object-cover"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">{categoryLabel}</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-4">{packageData.name}</h1>
            <p className="text-3xl font-bold mb-6" style={{ color: '#755A7B' }}>
              Rs. {Number(packageData.price).toLocaleString()}
            </p>

            {packageData.discount && (
              <p className="mb-4 text-green-600 font-semibold">
                {packageData.discount} OFF {packageData.discountType ? `(${packageData.discountType})` : ''}
              </p>
            )}

            {packageData.roomType && (
              <p className="text-gray-600 mb-4">
                <FaCalendarAlt className="inline mr-2" />
                Duration / Type: {packageData.roomType}
              </p>
            )}

            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{packageData.description || 'No description provided.'}</p>
            </div>

            {packageData.facilities?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Services Included</h3>
                <div className="flex flex-wrap gap-2">
                  {packageData.facilities.map((service) => (
                    <span key={service} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700">
                      <FaCheckCircle className="text-xs" /> {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Posted on {new Date(packageData.createdAt).toLocaleDateString()}
              {packageData.isDraft ? ' · Draft' : ' · Published'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
