'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaBell, FaEdit, FaTrash, FaCalendarAlt, FaEye, FaChartBar, FaFileInvoice, FaCog, FaMoon, FaPlus } from 'react-icons/fa';

type GiftingCategory = 'wedding-favors' | 'gift-boxes' | 'custom-souvenirs';
interface VendorUser { id?: number | string; name?: string; email: string; role: string; organizationName?: string; }
interface PackageRow { id: string; category: GiftingCategory; title: string; pricePerDay: number; services: string[]; photos: string[]; duration?: string; discount?: string; discountType?: string; roomType?: string; }
const categories: GiftingCategory[] = ['wedding-favors', 'gift-boxes', 'custom-souvenirs'];
const normalizeCategory = (category?: string): GiftingCategory => category === 'gift-boxes' ? 'gift-boxes' : category === 'custom-souvenirs' ? 'custom-souvenirs' : 'wedding-favors';
const categoryLabel = (category: GiftingCategory) => category === 'wedding-favors' ? 'Wedding Favors' : category === 'gift-boxes' ? 'Gift Boxes' : 'Custom Souvenirs';

export default function GiftingDraftPackagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [activeCategory, setActiveCategory] = useState<GiftingCategory>('wedding-favors');
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const organizationLabel = user?.organizationName || user?.name || 'Gifting Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { router.push('/login'); return; }
    const userData = JSON.parse(userStr) as VendorUser;
    setUser(userData);
    const vendorId = Number(userData.id);
    if (userData.role !== 'vendor') { router.push('/'); return; }
    if (Number.isFinite(vendorId) && vendorId > 0) fetchDrafts(vendorId); else router.push('/login');
  }, [router]);

  const fetchDrafts = async (vendorId: number) => {
    try {
      const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setPackages(offerings.filter((offering) => offering.isDraft).map((offering) => ({
        id: offering.id.toString(), category: normalizeCategory(offering.category), title: offering.name || '', pricePerDay: Number(offering.price || 0),
        services: Array.isArray(offering.facilities) ? offering.facilities : [], photos: Array.isArray(offering.images) ? offering.images : [],
        duration: offering.description || '', discount: offering.discount, discountType: offering.discountType, roomType: offering.roomType,
      })));
    } catch { setToast({ message: 'Unable to load draft packages.', type: 'error' }); }
  };

  const handlePublish = async (pkg: PackageRow) => {
    try {
      await apiFetch(`/offerings/${pkg.id}`, { method: 'PUT', body: JSON.stringify({ name: pkg.title, description: pkg.duration || '', category: pkg.category, price: pkg.pricePerDay, facilities: pkg.services, roomType: pkg.roomType, discount: pkg.discount, discountType: pkg.discountType, images: pkg.photos, vendorId: user?.id, isDraft: false }) });
      setPackages((prev) => prev.filter((item) => item.id !== pkg.id));
      setToast({ message: 'Draft package published successfully.', type: 'success' });
    } catch { setToast({ message: 'Unable to publish draft package.', type: 'error' }); }
  };
  const handleDelete = async (id: string) => { if (!confirm('Delete this draft package?')) return; try { await apiFetch(`/offerings/${id}`, { method: 'DELETE' }); setPackages((prev) => prev.filter((pkg) => pkg.id !== id)); setToast({ message: 'Draft removed successfully.', type: 'success' }); } catch { setToast({ message: 'Unable to remove draft package.', type: 'error' }); } };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/'); };
  const filteredPackages = packages.filter((pkg) => pkg.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col"><div className="p-6 border-b"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>{organizationInitial}</div><div><h2 className="font-bold text-gray-800">{organizationLabel}</h2><p className="text-xs text-gray-500">wedding gifts and favors</p></div></div></div><nav className="flex-1 p-4"><div className="mb-6"><p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p><button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaChartBar /> Overview</button><button onClick={() => router.push('/dashboard/gifting')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaPlus /> Post Package</button><button onClick={() => router.push('/dashboard/gifting/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button><button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{backgroundColor: '#755A7B', color: 'white'}}><FaEdit /> Draft Package</button></div><div className="mb-6"><p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p><button onClick={() => router.push('/dashboard/gifting/place-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCalendarAlt /> Place a Booking</button><button onClick={() => router.push('/dashboard/gifting/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaEye /> Accept Booking</button></div><div><p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p><button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaBell /> Notifications</button><button onClick={() => router.push('/dashboard/gifting/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaHeart /> Feedback</button><button onClick={() => router.push('/dashboard/gifting/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"><FaCog /> Setting</button><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all" style={{backgroundColor: '#755A7B'}}><FaMoon /> Logout</button></div></nav></aside>
      <main className="flex-1 overflow-y-auto p-4 md:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p><h1 className="text-2xl font-bold text-gray-900">Draft Packages</h1></div><button onClick={() => router.push('/dashboard/gifting')} className="rounded-lg px-4 py-2 text-white" style={{backgroundColor: '#755A7B'}}>Create Package</button></div><div className="mb-6 flex gap-2 justify-center overflow-x-auto pb-2">{categories.map((category) => <button key={category} onClick={() => setActiveCategory(category)} className="px-4 py-3 font-medium border-b-4 whitespace-nowrap" style={{borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999'}}>{categoryLabel(category)}</button>)}</div>{filteredPackages.length === 0 ? <div className="text-center py-16 bg-white rounded-xl shadow-md"><h3 className="text-xl font-semibold text-gray-700 mb-2">No draft packages found</h3></div> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{filteredPackages.map((pkg) => <article key={pkg.id} className="bg-white rounded-xl shadow-md overflow-hidden"><img src={pkg.photos[0] || '/gift.png'} alt={pkg.title} className="h-48 w-full object-cover" /><div className="p-5"><span className="inline-flex mb-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Draft</span><h3 className="text-lg font-bold text-gray-800 mb-2">{pkg.title}</h3><p className="text-2xl font-bold mb-3" style={{color: '#755A7B'}}>Rs. {pkg.pricePerDay.toLocaleString()}</p><div className="grid grid-cols-3 gap-2"><button onClick={() => router.push(`/dashboard/gifting?edit=${pkg.id}`)} className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{backgroundColor: '#755A7B'}}>Edit</button><button onClick={() => handlePublish(pkg)} className="rounded-lg px-3 py-2 text-sm font-semibold text-white bg-emerald-600">Publish</button><button onClick={() => handleDelete(pkg.id)} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 border border-red-500"><FaTrash className="inline" /></button></div></div></article>)}</div>}</main>
    </div>
  );
}
