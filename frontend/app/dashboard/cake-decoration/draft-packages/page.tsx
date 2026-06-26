'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaEdit, FaEye, FaFileInvoice, FaHeart, FaHome, FaMoon, FaPlus, FaTrash } from 'react-icons/fa';

type CakeCategory = 'wedding-cakes' | 'tiered-cakes' | 'custom-designs';

interface VendorUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  organizationName?: string;
}

interface PackageItem {
  id: number;
  name: string;
  category: string;
  price: number;
  facilities?: string[];
  images?: string[];
  discount?: string;
  discountType?: string;
  isDraft?: boolean;
  createdAt?: string;
}

const normalizeCakeCategory = (category: string | undefined): CakeCategory => {
  if (category === 'wedding-cakes') return 'wedding-cakes';
  if (category === 'tiered-cakes') return 'tiered-cakes';
  if (category === 'custom-designs') return 'custom-designs';
  return 'wedding-cakes';
};

export default function CakeDecorationDraftPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<CakeCategory>('wedding-cakes');
  const [toast, setToast] = useState<ToastProps | null>(null);

  const organizationLabel = user?.organizationName || user?.name || 'Cake Vendor';
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

    const loadDrafts = async () => {
      try {
        const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
        setPackages(
          offerings
            .filter((offering) => offering.isDraft)
            .map((offering) => ({
              id: offering.id,
              name: offering.name,
              category: offering.category,
              price: Number(offering.price),
              facilities: offering.facilities || [],
              images: offering.images || [],
              discount: offering.discount,
              discountType: offering.discountType,
              isDraft: offering.isDraft,
              createdAt: offering.createdAt,
            }))
        );
      } catch (error) {
        console.error('Failed to load cake drafts', error);
        setToast({ message: 'Unable to load draft packages.', type: 'error' });
      }
    };

    loadDrafts();
  }, [router]);

  const filteredPackages = packages.filter((pkg) => normalizeCakeCategory(pkg.category) === activeCategory);

  const handlePublish = async (id: number) => {
    const currentPackage = packages.find((pkg) => pkg.id === id);
    if (!currentPackage) return;

    try {
      await apiFetch(`/offerings/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isDraft: false }),
      });
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      setToast({ message: 'Draft published successfully.', type: 'success' });
    } catch (error) {
      console.error('Failed to publish draft', error);
      setToast({ message: 'Unable to publish draft package.', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this draft package?')) return;
    try {
      await apiFetch(`/offerings/${id}`, { method: 'DELETE' });
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      setToast({ message: 'Draft removed successfully.', type: 'success' });
    } catch (error) {
      setToast({ message: 'Unable to remove draft package.', type: 'error' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#755A7B' }}>{organizationInitial}</div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">cake decoration</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button onClick={() => router.push('/dashboard/cake-decoration/overview')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button>
            <button onClick={() => router.push('/dashboard/cake-decoration')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaEdit /> Draft Package</button>
          </div>
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button onClick={() => router.push('/dashboard/cake-decoration/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button>
            <button onClick={() => router.push('/dashboard/cake-decoration/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button>
            <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white" style={{ backgroundColor: '#755A7B' }}><FaMoon /> Logout</button>
          </div>
        </nav>
      </aside>
      <div className="flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
            <h1 className="text-2xl font-bold text-gray-900">Draft Packages</h1>
          </div>
          <button onClick={() => router.push('/dashboard/cake-decoration')} className="rounded-lg px-4 py-2 text-white" style={{ backgroundColor: '#755A7B' }}>Create Package</button>
        </div>

        <div className="mb-6 flex gap-2 justify-center overflow-x-auto pb-2">
          {['wedding-cakes', 'tiered-cakes', 'custom-designs'].map((category) => (
            <button key={category} onClick={() => setActiveCategory(category as CakeCategory)} className="px-4 py-3 font-medium border-b-4 whitespace-nowrap" style={{ borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999' }}>
              {category === 'wedding-cakes' ? 'Wedding Cakes' : category === 'tiered-cakes' ? 'Tiered Cakes' : 'Custom Designs'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-48 bg-gray-100">
                <img src={pkg.images?.[0] || '/pack1.png'} alt={pkg.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{pkg.name}</h3>
                <p className="text-sm text-gray-600 mb-4">Rs. {pkg.price.toLocaleString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => handlePublish(pkg.id)} className="flex-1 rounded-lg px-4 py-2 text-white" style={{ backgroundColor: '#755A7B' }}>Post Now</button>
                  <button onClick={() => router.push(`/dashboard/cake-decoration?edit=${pkg.id}`)} className="flex-1 rounded-lg px-4 py-2 border border-gray-300">Edit</button>
                </div>
                <button onClick={() => handleDelete(pkg.id)} className="mt-3 w-full rounded-lg px-4 py-2 border border-red-300 text-red-600">Delete Draft</button>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No draft packages found</h3>
            <p className="text-gray-500 mb-6">Save a package as draft and it will appear here.</p>
            <button onClick={() => router.push('/dashboard/cake-decoration')} className="px-6 py-3 rounded-lg text-white" style={{ backgroundColor: '#755A7B' }}>Create Draft</button>
          </div>
        )}
      </div>
    </div>
  );
}
