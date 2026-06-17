'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import CeremonialSidebar from '@/components/ceremonial/CeremonialSidebar';
import { FaEdit, FaTrash, FaEye, FaHome, FaUpload, FaPlus } from 'react-icons/fa';

import {
  CeremonialCategory,
  CEREMONIAL_DASHBOARD_BASE,
  normalizeCeremonialCategory,
} from '@/lib/ceremonial-dashboard';

interface Package {
  id: string;
  category: CeremonialCategory;
  title: string;
  pricePerDay: number;
  services: string[];
  photos: string[];
  createdAt: Date;
  stock?: number;
  discount?: string;
  discountType?: string;
  isDraft?: boolean;
}

interface VendorUser {
  id?: number;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function DraftPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<CeremonialCategory>('poruwa-ceremony');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  const organizationLabel = user?.organizationName || user?.name || 'Ceremonial Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  const getCategoryBannerImage = () => {
    switch (activeCategory) {
      case 'poruwa-ceremony':
        return '/ven1.png';
      case 'religious-services':
        return '/ven2.png';
      case 'cultural-events':
        return '/ven3.png';
      default:
        return '/ven1.png';
    }
  };

  const getCategoryBannerText = () => {
    switch (activeCategory) {
      case 'poruwa-ceremony':
        return 'Poruwa Ceremony Drafts';
      case 'religious-services':
        return 'Religious Services Drafts';
      case 'cultural-events':
        return 'Cultural Events Drafts';
      default:
        return 'Draft Packages';
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);

    if (userData.role !== 'vendor') {
      router.push('/');
      return;
    }

    const vendorId = Number(userData.id);
    if (Number.isFinite(vendorId) && vendorId > 0) {
      fetchVendorPackages(vendorId);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchVendorPackages = async (vendorId: number) => {
    try {
      const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setPackages(
        offerings
          .filter((offering) => offering.isDraft)
          .map((offering) => ({
              id: offering.id.toString(),
              category: normalizeCeremonialCategory(offering.category),
              title: offering.name,
              pricePerDay: Number(offering.price),
              services: offering.facilities || [],
              photos: offering.images || [],
              createdAt: new Date(offering.createdAt),
              stock: offering.stock,
              discount: offering.discount,
              discountType: offering.discountType,
              isDraft: offering.isDraft,
            }))
      );
    } catch (error) {
      console.error('Unable to load draft packages', error);
      setToast({
        message: `Failed to load drafts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const handlePublishPackage = async (id: string) => {
    try {
      const currentPackage = packages.find((pkg) => pkg.id === id);
      if (!currentPackage) return;

      await apiFetch(`/offerings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: currentPackage.title,
          description: currentPackage.services.join(' '),
          category: currentPackage.category,
          price: currentPackage.pricePerDay,
          facilities: currentPackage.services,
          stock: currentPackage.stock,
          discount: currentPackage.discount,
          discountType: currentPackage.discountType,
          images: currentPackage.photos,
          vendorId: user?.id,
          isDraft: false,
        }),
      });

      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      setToast({
        message: 'Draft package published successfully! 🎉',
        type: 'success',
      });
    } catch (error) {
      console.error('Unable to publish draft', error);
      setToast({
        message: `Failed to publish draft: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Delete this draft package?')) return;

    try {
      await apiFetch(`/offerings/${id}`, { method: 'DELETE' });
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      setToast({ message: 'Draft removed successfully.', type: 'success' });
    } catch (error) {
      setToast({ message: 'Unable to remove draft package.', type: 'error' });
    }
  };

  const filteredPackages = packages.filter((pkg) => pkg.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <CeremonialSidebar
        activePage="draft-packages"
        organizationLabel={organizationLabel}
        organizationInitial={organizationInitial}
      />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"><FaHome /> Home</button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">Draft Packages</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-900">{filteredPackages.length}</span> draft package{filteredPackages.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: `url(${getCategoryBannerImage()})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(117, 90, 123, 0.2)' }}>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>{getCategoryBannerText()}</h2>
            <p className="text-sm md:text-xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Publish, edit, or refine your saved drafts</p>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
              {['poruwa-ceremony', 'religious-services', 'cultural-events'].map((category) => (
                <button key={category} onClick={() => setActiveCategory(category as CeremonialCategory)} className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap" style={{ borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999', fontWeight: activeCategory === category ? 'bold' : 'normal', background: activeCategory === category ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent' }}>
                  {category === 'poruwa-ceremony' ? 'Poruwa Ceremony' : category === 'religious-services' ? 'Religious Services' : 'Cultural Events'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={pkg.photos[0] || '/pack1.png'} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  {pkg.discount && <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">{pkg.discount} OFF</div>}
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">Draft</div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{pkg.title}</h3>
                  <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gray-100">
                    <span className="text-3xl font-bold" style={{ color: '#755A7B' }}>Rs. {pkg.pricePerDay.toLocaleString()}</span>
                    <span className="text-sm text-gray-500 font-medium">/day</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">📅 Saved: {new Date(pkg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <div className="flex flex-col gap-2">
                      <button onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}/posted-packages/${pkg.id}`)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 font-semibold text-emerald-700 bg-white transition-all hover:bg-emerald-600 hover:text-white">
                        <FaEye size={16} /> Preview
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => handlePublishPackage(pkg.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all" style={{ backgroundColor: '#755A7B' }}>
                          <FaUpload size={16} /> Post Now
                        </button>
                        <button onClick={() => router.push(`${CEREMONIAL_DASHBOARD_BASE}?edit=${pkg.id}`)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all" style={{ borderColor: '#755A7B', color: '#755A7B', backgroundColor: 'white' }}>
                          <FaEdit size={16} /> Edit
                        </button>
                      </div>
                    <button onClick={() => handleDeletePackage(pkg.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-all">
                      <FaTrash size={16} /> Delete Draft
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl text-gray-300 mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No draft packages found</h3>
              <p className="text-gray-500 mb-6">Save a package as draft and it will appear here for quick publishing or editing.</p>
              <button onClick={() => router.push(CEREMONIAL_DASHBOARD_BASE)} className="px-6 py-3 rounded-lg font-medium text-white" style={{ backgroundColor: '#755A7B' }}>
                <FaPlus className="inline mr-2" /> Create a Draft
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
