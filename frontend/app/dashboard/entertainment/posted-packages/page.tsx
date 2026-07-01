'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaEdit, FaEye, FaFileInvoice, FaHeart, FaMoon, FaPlus, FaTrash } from 'react-icons/fa';

type EntertainmentCategory = 'live-bands' | 'djs' | 'traditional-performers';

interface VendorUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  organizationName?: string;
}

interface PackageRow {
  id: string;
  category: EntertainmentCategory;
  title: string;
  pricePerDay: number;
  services: string[];
  photos: string[];
  duration?: string;
  discount?: string;
  discountType?: string;
}

const categories: EntertainmentCategory[] = ['live-bands', 'djs', 'traditional-performers'];

const normalizeCategory = (category?: string): EntertainmentCategory => {
  if (category === 'djs') return 'djs';
  if (category === 'traditional-performers') return 'traditional-performers';
  return 'live-bands';
};

const categoryLabel = (category: EntertainmentCategory) =>
  category === 'live-bands' ? 'Live Bands' : category === 'djs' ? 'DJs' : 'Traditional Performers';

export default function EntertainmentPostedPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<EntertainmentCategory>('live-bands');
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const organizationLabel = user?.organizationName || user?.name || 'Entertainment Vendor';
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
          .filter((offering) => !offering.isDraft)
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
          })),
      );
    } catch (error) {
      console.error('Unable to load entertainment packages', error);
      setToast({ message: 'Unable to load posted packages.', type: 'error' });
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await apiFetch(`/offerings/${id}`, { method: 'DELETE' });
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
      setToast({ message: 'Package deleted successfully.', type: 'success' });
    } catch (error) {
      console.error('Unable to delete entertainment package', error);
      setToast({ message: 'Unable to delete package.', type: 'error' });
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
              <p className="text-xs text-gray-500">entertainment services</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button>
            <button onClick={() => router.push('/dashboard/entertainment')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaFileInvoice /> Posted Packages</button>
            <button onClick={() => router.push('/dashboard/entertainment/draft-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaEdit /> Draft Package</button>
          </div>
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button onClick={() => router.push('/dashboard/entertainment/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button>
            <button onClick={() => router.push('/dashboard/entertainment/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button>
            <button onClick={() => router.push('/dashboard/entertainment/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button>
            <button onClick={() => router.push('/dashboard/entertainment/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all" style={{ backgroundColor: '#755A7B' }}><FaMoon /> Logout</button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: 'url(/band.png)', backgroundSize: 'cover', backgroundPosition: 'center', height: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(117, 90, 123, 0.2)' }}>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>{categoryLabel(activeCategory)} Packages</h2>
          <p className="text-sm md:text-xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>View and manage your posted entertainment packages</p>
        </div>

        <div className="mb-6 flex gap-2 md:gap-6 justify-center overflow-x-auto pb-2">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap" style={{ borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999', fontWeight: activeCategory === category ? 'bold' : 'normal' }}>
              {categoryLabel(category)}
            </button>
          ))}
        </div>

        {filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No packages found</h3>
            <p className="text-gray-500 mb-6">You have not posted any packages in this category yet.</p>
            <button onClick={() => router.push('/dashboard/entertainment')} className="px-6 py-3 rounded-lg font-medium text-white" style={{ backgroundColor: '#755A7B' }}><FaPlus className="inline mr-2" /> Create Your First Package</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPackages.map((pkg) => (
              <article key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  <img src={pkg.photos[0] || '/band.png'} alt={pkg.title} className="w-full h-full object-cover" />
                  {pkg.discount && <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">{pkg.discount} OFF</div>}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{pkg.title}</h3>
                  <p className="text-2xl font-bold mb-3" style={{ color: '#755A7B' }}>Rs. {pkg.pricePerDay.toLocaleString()}</p>
                  {pkg.discountType && <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">{pkg.discountType}</span>}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pkg.services.slice(0, 3).map((service) => <span key={service} className="text-xs bg-gray-100 px-2 py-1 rounded">{service}</span>)}
                    {pkg.services.length > 3 && <span className="text-xs bg-gray-100 px-2 py-1 rounded">+{pkg.services.length - 3} more</span>}
                  </div>
                  {pkg.duration && <p className="text-sm text-gray-600 mb-4">Duration: <span className="font-semibold">{pkg.duration}</span></p>}
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/dashboard/entertainment?edit=${pkg.id}`)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all" style={{ backgroundColor: '#755A7B' }}><FaEdit /> Edit</button>
                    <button onClick={() => handleDeletePackage(pkg.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg font-medium text-red-600 border-red-600 hover:bg-red-50 transition-all"><FaTrash /> Delete</button>
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
