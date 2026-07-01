'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaEdit, FaEye, FaFileInvoice, FaHeart, FaHome, FaMoon, FaPlus, FaTrash } from 'react-icons/fa';

type TransportCategory = 'wedding-cars' | 'luxury-vehicles' | 'guest-transport';

interface VendorUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  organizationName?: string;
}

interface PackageRow {
  id: string;
  category: TransportCategory;
  title: string;
  pricePerDay: number;
  services: string[];
  photos: string[];
  duration?: string;
  discount?: string;
  discountType?: string;
  roomType?: string;
}

const categories: TransportCategory[] = ['wedding-cars', 'luxury-vehicles', 'guest-transport'];

const normalizeCategory = (category?: string): TransportCategory => {
  if (category === 'luxury-vehicles') return 'luxury-vehicles';
  if (category === 'guest-transport') return 'guest-transport';
  return 'wedding-cars';
};

const categoryLabel = (category: TransportCategory) =>
  category === 'wedding-cars' ? 'Wedding Cars' : category === 'luxury-vehicles' ? 'Luxury Vehicles' : 'Guest Transport';

export default function TransportationDraftPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<TransportCategory>('wedding-cars');
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const organizationLabel = user?.organizationName || user?.name || 'Transportation Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr) as VendorUser;
    setUser(userData);
    const vendorId = Number(userData.id);

    if (userData.role !== 'vendor') {
      router.push('/');
      return;
    }

    if (Number.isFinite(vendorId) && vendorId > 0) {
      fetchDrafts(vendorId);
    } else {
      router.push('/login');
    }
  }, [router]);

  const fetchDrafts = async (vendorId: number) => {
    try {
      const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setPackages(
        offerings
          .filter((offering) => offering.isDraft)
          .map((offering) => ({
            id: offering.id.toString(),
            category: normalizeCategory(offering.category),
            title: offering.name || '',
            pricePerDay: Number(offering.price || 0),
            services: Array.isArray(offering.facilities) ? offering.facilities : [],
            photos: Array.isArray(offering.images) ? offering.images : [],
            duration: offering.description || '',
            discount: offering.discount,
            discountType: offering.discountType,
            roomType: offering.roomType,
          })),
      );
    } catch (error) {
      console.error('Unable to load transportation drafts', error);
      setToast({ message: 'Unable to load draft packages.', type: 'error' });
    }
  };

  const handlePublish = async (pkg: PackageRow) => {
    try {
      await apiFetch(`/offerings/${pkg.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: pkg.title,
          description: pkg.duration || '',
          category: pkg.category,
          price: pkg.pricePerDay,
          facilities: pkg.services,
          roomType: pkg.roomType,
          discount: pkg.discount,
          discountType: pkg.discountType,
          images: pkg.photos,
          vendorId: user?.id,
          isDraft: false,
        }),
      });
      setPackages((prev) => prev.filter((item) => item.id !== pkg.id));
      setToast({ message: 'Draft package published successfully.', type: 'success' });
    } catch (error) {
      console.error('Unable to publish transportation draft', error);
      setToast({ message: 'Unable to publish draft package.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this draft package?')) return;

    try {
      await apiFetch(`/offerings/${id}`, { method: 'DELETE' });
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      setToast({ message: 'Draft removed successfully.', type: 'success' });
    } catch (error) {
      console.error('Unable to delete transportation draft', error);
      setToast({ message: 'Unable to remove draft package.', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const filteredPackages = packages.filter((pkg) => pkg.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: '#f5f5f7' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#755A7B' }}>{organizationInitial}</div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">transportation services</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button>
            <button onClick={() => router.push('/dashboard/transportation')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button>
            <button onClick={() => router.push('/dashboard/transportation/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaEdit /> Draft Package</button>
          </div>
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button onClick={() => router.push('/dashboard/transportation/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button>
            <button onClick={() => router.push('/dashboard/transportation/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button>
            <button onClick={() => router.push('/dashboard/transportation/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button>
            <button onClick={() => router.push('/dashboard/transportation/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all" style={{ backgroundColor: '#755A7B' }}><FaMoon /> Logout</button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"><FaHome /> Home</button>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900">Draft Packages</h1>
            </div>
          </div>
          <div className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-900">{filteredPackages.length}</span> draft package{filteredPackages.length === 1 ? '' : 's'}</div>
        </div>

        <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: 'url(/car.png)', backgroundSize: 'cover', backgroundPosition: 'center', height: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(117, 90, 123, 0.2)' }}>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>{categoryLabel(activeCategory)} Drafts</h2>
          <p className="text-sm md:text-xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Publish, edit, or remove saved transportation drafts</p>
        </div>

        <div className="mb-6 flex gap-2 md:gap-6 justify-center overflow-x-auto pb-2">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap" style={{ borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999', fontWeight: activeCategory === category ? 'bold' : 'normal' }}>
              {categoryLabel(category)}
            </button>
          ))}
        </div>

        {filteredPackages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-5xl text-gray-300 mb-4">Draft</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No draft packages found</h3>
            <button onClick={() => router.push('/dashboard/transportation')} className="mt-4 px-6 py-3 rounded-lg font-medium text-white" style={{ backgroundColor: '#755A7B' }}>Create Draft</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <article key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <img src={pkg.photos[0] || '/car.png'} alt={pkg.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <span className="inline-flex mb-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Draft</span>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{pkg.title}</h3>
                  <p className="text-2xl font-bold mb-3" style={{ color: '#755A7B' }}>Rs. {pkg.pricePerDay.toLocaleString()}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pkg.services.slice(0, 3).map((service) => <span key={service} className="text-xs bg-gray-100 px-2 py-1 rounded">{service}</span>)}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => router.push(`/dashboard/transportation?edit=${pkg.id}`)} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ backgroundColor: '#755A7B' }}>Edit</button>
                    <button onClick={() => handlePublish(pkg)} className="rounded-lg px-3 py-2 text-sm font-semibold text-white bg-emerald-600">Publish</button>
                    <button onClick={() => handleDelete(pkg.id)} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 border border-red-500"><FaTrash className="inline" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
