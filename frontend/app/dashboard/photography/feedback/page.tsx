'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaComments, FaEdit, FaEye, FaFileInvoice, FaHeart, FaHome, FaMoon, FaPlus, FaStar } from 'react-icons/fa';

interface VendorUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  organizationName?: string;
}

interface VendorReview {
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
  offering?: {
    id: number;
    name: string;
    category: string;
    price: number;
    images?: string[];
  } | null;
}

export default function PhotographyFeedbackPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [loading, setLoading] = useState(true);

  const organizationLabel = user?.organizationName || user?.name || 'Photography Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr) as VendorUser;
    setUser(userData);

    if (userData.role !== 'vendor') {
      router.push('/');
      return;
    }

    const vendorId = Number(userData.id);
    if (!Number.isFinite(vendorId) || vendorId <= 0) {
      router.push('/login');
      return;
    }

    const loadReviews = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<VendorReview[]>(`/reviews?vendorId=${vendorId}`);
        setReviews(data || []);
      } catch (error) {
        console.error('Failed to load feedback', error);
        setToast({ message: 'Unable to load customer feedback.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [router]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    }));
  }, [reviews]);

  const groupedByPackage = useMemo(() => {
    return reviews.reduce<Record<string, VendorReview[]>>((groups, review) => {
      const key = review.offering?.name || `Package #${review.offeringId}`;
      groups[key] = [...(groups[key] || []), review];
      return groups;
    }, {});
  }, [reviews]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#755A7B' }}>
              {organizationInitial}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">photography & videography</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button onClick={() => router.push('/dashboard/photography/overview')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button>
            <button onClick={() => router.push('/dashboard/photography')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button>
            <button onClick={() => router.push('/dashboard/photography/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button>
            <button onClick={() => router.push('/dashboard/photography/draft-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaEdit /> Draft Package</button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button onClick={() => router.push('/dashboard/photography/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button>
            <button onClick={() => router.push('/dashboard/photography/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaHeart /> Feedback</button>
            <button onClick={() => router.push('/dashboard/photography/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all" style={{ backgroundColor: '#755A7B' }}><FaMoon /> Logout</button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                <FaHome /> Home
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">Customer Feedback</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <section className="bg-white rounded-xl shadow-md p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Average Rating</p>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-5xl font-bold" style={{ color: '#755A7B' }}>{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
                <span className="text-gray-500 mb-2">/ 5</span>
              </div>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar key={index} style={{ color: index < Math.round(averageRating) ? '#fbbf24' : '#d1d5db' }} />
                ))}
              </div>
              <p className="text-sm text-gray-500">{reviews.length} total review{reviews.length === 1 ? '' : 's'}</p>
            </section>

            <section className="xl:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Rating Breakdown</h2>
              <div className="space-y-3">
                {ratingCounts.map((item) => {
                  const percent = reviews.length > 0 ? Math.round((item.count / reviews.length) * 100) : 0;
                  return (
                    <div key={item.rating} className="flex items-center gap-3">
                      <span className="w-12 text-sm font-semibold text-gray-700">{item.rating} star</span>
                      <div className="h-3 flex-1 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: '#755A7B' }} />
                      </div>
                      <span className="w-8 text-right text-sm text-gray-500">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block mb-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#755A7B' }} /></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedByPackage).map(([packageName, packageReviews]) => (
                <section key={packageName} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Package</p>
                      <h2 className="text-xl font-bold text-gray-900">{packageName}</h2>
                    </div>
                    <button
                      onClick={() => router.push(`/services/photography-videography/${user?.id || ''}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white"
                      style={{ backgroundColor: '#755A7B' }}
                    >
                      <FaEye /> View Package
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {packageReviews.map((review) => (
                      <article key={review.id} className="rounded-xl border border-gray-200 p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-gray-800">{review.user?.name || review.user?.email || 'Customer'}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, index) => (
                              <FaStar key={index} size={15} style={{ color: index < review.rating ? '#fbbf24' : '#d1d5db' }} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{review.comment || 'No comment provided.'}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <FaComments className="mx-auto text-5xl text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No feedback yet</h2>
              <p className="text-gray-500">Customer reviews for your photography packages will appear here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

