'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import Toast, { ToastProps } from '@/components/Toast';
import { FaBell, FaCalendarAlt, FaChartBar, FaCog, FaEdit, FaEye, FaFileInvoice, FaHeart, FaMoon, FaMusic, FaPlus, FaUsers } from 'react-icons/fa';

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
  isDraft?: boolean;
}

const categories: EntertainmentCategory[] = ['live-bands', 'djs', 'traditional-performers'];
const packageTypes = ['Basic Package', 'Standard Package', 'Premium Package', 'Luxury Package', 'Custom Package'];
const serviceOptions = ['Live Band Performance', 'DJ Services', 'Sound System', 'Lighting Setup', 'Traditional Dancers', 'MC Services', 'Stage Setup', 'Backup Equipment'];

const normalizeCategory = (category?: string): EntertainmentCategory => {
  if (category === 'djs') return 'djs';
  if (category === 'traditional-performers') return 'traditional-performers';
  return 'live-bands';
};

const categoryLabel = (category: EntertainmentCategory) =>
  category === 'live-bands' ? 'Live Bands' : category === 'djs' ? 'DJs' : 'Traditional Performers';

export default function EntertainmentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [activeCategory, setActiveCategory] = useState<EntertainmentCategory>('live-bands');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackageType, setSelectedPackageType] = useState('');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: '',
    pricePerDay: '',
    services: '',
    duration: '',
    discount: '',
    discountType: '',
    photos: [] as string[],
  });

  const organizationLabel = user?.organizationName || user?.name || 'Entertainment Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  const mapOffering = (offering: any): PackageRow => ({
    id: offering.id.toString(),
    category: normalizeCategory(offering.category),
    title: offering.name || '',
    pricePerDay: Number(offering.price || 0),
    services: Array.isArray(offering.facilities) ? offering.facilities : [],
    photos: Array.isArray(offering.images) ? offering.images : [],
    duration: offering.description || '',
    discount: offering.discount,
    discountType: offering.discountType,
    isDraft: Boolean(offering.isDraft),
  });

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

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) {
      setEditingPackageId(null);
      return;
    }

    const loadPackageForEdit = async () => {
      try {
        const data = await apiFetch<any>(`/offerings/${editId}`);
        setEditingPackageId(editId);
        setActiveCategory(normalizeCategory(data.category));
        setSelectedPackageType(data.roomType || '');
        setSelectedServices(Array.isArray(data.facilities) ? data.facilities : []);
        setNewPackage({
          title: data.name || '',
          pricePerDay: String(data.price || ''),
          services: Array.isArray(data.facilities) ? data.facilities.join(', ') : '',
          duration: data.description || '',
          discount: data.discount || '',
          discountType: data.discountType || '',
          photos: Array.isArray(data.images) ? data.images : [],
        });
        setToast({ message: 'Package loaded for editing. Update and save when ready.', type: 'success' });
      } catch (error) {
        console.error('Failed to load entertainment package for edit', error);
        setToast({ message: 'Unable to load this package for editing.', type: 'error' });
      }
    };

    loadPackageForEdit();
  }, [searchParams]);

  const fetchVendorPackages = async (vendorId: number) => {
    try {
      const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setPackages(offerings.map(mapOffering));
    } catch (error) {
      console.error('Unable to load entertainment packages', error);
      setToast({ message: 'Unable to load packages.', type: 'error' });
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) => prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service]);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadedUrls = await Promise.all(files.map((file) => uploadImageToCloudinary(file)));
      setNewPackage((prev) => ({ ...prev, photos: [...prev.photos, ...uploadedUrls] }));
      setToast({ message: 'Images uploaded successfully.', type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Image upload failed', type: 'error' });
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setEditingPackageId(null);
    setSelectedServices([]);
    setSelectedPackageType('');
    setNewPackage({ title: '', pricePerDay: '', services: '', duration: '', discount: '', discountType: '', photos: [] });
  };

  const handleSubmitPackage = async (e?: React.FormEvent, isDraft = false) => {
    if (e) e.preventDefault();

    if (uploadingImages) {
      setToast({ message: 'Please wait until image uploads are complete.', type: 'error' });
      return;
    }

    const vendorId = Number(user?.id);
    if (!user || !Number.isFinite(vendorId) || vendorId <= 0) {
      setToast({ message: 'Invalid vendor session. Please log in again.', type: 'error' });
      router.push('/login');
      return;
    }

    if (!newPackage.title.trim() || !newPackage.pricePerDay) {
      setToast({ message: 'Please enter the service name and price.', type: 'error' });
      return;
    }

    const typedServices = newPackage.services.split(',').map((service) => service.trim()).filter(Boolean);
    const services = Array.from(new Set([...selectedServices, ...typedServices]));
    const payload = {
      name: newPackage.title.trim(),
      description: newPackage.duration.trim(),
      category: activeCategory,
      price: parseFloat(newPackage.pricePerDay),
      facilities: services,
      roomType: selectedPackageType || undefined,
      discount: newPackage.discount || undefined,
      discountType: newPackage.discountType || undefined,
      images: newPackage.photos,
      vendorId,
      isDraft,
    };

    try {
      const requestPath = editingPackageId ? `/offerings/${editingPackageId}` : '/offerings';
      const savedPackage = await apiFetch<any>(requestPath, {
        method: editingPackageId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      const packageData = mapOffering(savedPackage);
      setPackages((prev) => editingPackageId ? prev.map((pkg) => pkg.id === packageData.id ? packageData : pkg) : [...prev, packageData]);
      resetForm();
      setToast({
        message: editingPackageId
          ? (isDraft ? 'Draft updated successfully.' : 'Package updated successfully.')
          : (isDraft ? 'Package saved as draft successfully.' : 'Package posted successfully.'),
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to save entertainment package', error);
      setToast({ message: `Failed to save package: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    }
  };

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
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors" style={{ backgroundColor: '#755A7B', color: 'white' }}><FaPlus /> Post Package</button>
            <button onClick={() => router.push('/dashboard/entertainment/posted-packages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"><FaFileInvoice /> Posted Packages</button>
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
        <div className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: 'url(/band.png)', backgroundSize: 'cover', backgroundPosition: 'center', height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid rgba(117, 90, 123, 0.2)' }}>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.7)' }}>Manage {categoryLabel(activeCategory)}</h2>
          <p className="text-sm md:text-xl text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>Create and manage your entertainment packages</p>
        </div>

        <div className="mb-6 flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap" style={{ borderColor: activeCategory === category ? '#755A7B' : 'transparent', color: activeCategory === category ? '#755A7B' : '#999', fontWeight: activeCategory === category ? 'bold' : 'normal' }}>
              {categoryLabel(category)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmitPackage} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {packageTypes.map((type) => (
                  <button key={type} type="button" onClick={() => setSelectedPackageType(type)} className="p-4 border-2 rounded-lg text-center transition-all hover:shadow-lg" style={{ borderColor: selectedPackageType === type ? '#755A7B' : '#e5e7eb', backgroundColor: selectedPackageType === type ? 'rgba(117, 90, 123, 0.05)' : 'white', color: selectedPackageType === type ? '#755A7B' : '#6b7280', fontWeight: selectedPackageType === type ? 'bold' : 'normal' }}>
                    {type}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Services Included</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {serviceOptions.map((service) => (
                  <button key={service} type="button" onClick={() => toggleService(service)} className="p-3 border-2 rounded-lg text-sm transition-all hover:shadow-md" style={{ borderColor: selectedServices.includes(service) ? '#755A7B' : '#e5e7eb', backgroundColor: selectedServices.includes(service) ? 'rgba(117, 90, 123, 0.05)' : 'white', color: selectedServices.includes(service) ? '#755A7B' : '#6b7280', fontWeight: selectedServices.includes(service) ? 'bold' : 'normal' }}>
                    {service}
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Service Name *</span>
                  <input type="text" required value={newPackage.title} onChange={(e) => setNewPackage({ ...newPackage, title: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Complete Wedding Entertainment" />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Package Price *</span>
                  <input type="number" required value={newPackage.pricePerDay} onChange={(e) => setNewPackage({ ...newPackage, pricePerDay: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Rs. 125000" />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Service Duration</span>
                  <input type="text" value={newPackage.duration} onChange={(e) => setNewPackage({ ...newPackage, duration: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="4-5 hours" />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Services (comma-separated)</span>
                  <input type="text" value={newPackage.services} onChange={(e) => setNewPackage({ ...newPackage, services: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="DJ, Sound, Lighting" />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Discount</span>
                  <input type="text" value={newPackage.discount} onChange={(e) => setNewPackage({ ...newPackage, discount: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="10%" />
                </label>
                <label>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Discount Type</span>
                  <input type="text" value={newPackage.discountType} onChange={(e) => setNewPackage({ ...newPackage, discountType: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Early Bird Discount" />
                </label>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Img</h3>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 md:p-6 mb-4">
                <div className="aspect-square bg-gray-50 rounded-lg mb-4 overflow-hidden">
                  {newPackage.photos.length > 0 ? <img src={newPackage.photos[0]} alt="Main" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><div className="w-24 md:w-32 h-24 md:h-32 bg-purple-100 rounded-lg"></div></div>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="aspect-square bg-purple-100 rounded-lg overflow-hidden">
                      {newPackage.photos[idx + 1] && <img src={newPackage.photos[idx + 1]} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />}
                    </div>
                  ))}
                  <button type="button" onClick={() => document.getElementById('entertainment-photo-upload')?.click()} disabled={uploadingImages} className="aspect-square bg-purple-100 rounded-lg flex items-center justify-center text-2xl" style={{ color: '#755A7B' }}>
                    {uploadingImages ? '...' : '+'}
                  </button>
                </div>
                {uploadingImages && <p className="mt-3 text-sm text-gray-500">Uploading images to Cloudinary...</p>}
                <input id="entertainment-photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Category</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <button key={category} type="button" onClick={() => setActiveCategory(category)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all" style={{ backgroundColor: activeCategory === category ? '#755A7B' : '#f3f4f6', color: activeCategory === category ? 'white' : '#4b5563' }}>
                    {category === 'live-bands' ? <FaMusic /> : <FaUsers />} {categoryLabel(category)}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => handleSubmitPackage(undefined, true)} className="w-full py-3 px-6 rounded-lg border-2 font-medium hover:bg-gray-50 transition-all" style={{ borderColor: '#755A7B', color: '#755A7B' }}>
                <FaFileInvoice className="inline mr-2" /> {editingPackageId ? 'Update Draft' : 'Save Draft'}
              </button>
              <button type="submit" className="w-full py-3 px-6 rounded-lg text-white font-medium hover:opacity-90 transition-all" style={{ backgroundColor: '#755A7B' }}>
                {editingPackageId ? 'Save Changes' : 'Post Package'}
              </button>
              <button type="button" onClick={resetForm} className="w-full py-3 border-2 rounded-lg font-medium hover:bg-gray-50 transition-all" style={{ borderColor: '#755A7B', color: '#755A7B' }}>Reset</button>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}
