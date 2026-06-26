'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaBell, FaEdit, FaTrash, FaCalendarAlt, FaEye, FaUpload, FaChartBar, FaFileInvoice, FaCog, FaMoon, FaPlus, FaHome } from 'react-icons/fa';

type CakeCategory = 'wedding-cakes' | 'tiered-cakes' | 'custom-designs';

interface Package {
  id: string;
  category: CakeCategory;
  title: string;
  pricePerDay: number;
  services: string[];
  photos: string[];
  createdAt: Date;
  duration?: string;
  discount?: string;
  discountType?: string;
  isDraft?: boolean;
}

interface VendorUser {
  id?: number | string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function CakeDecorationDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeCategory, setActiveCategory] = useState<CakeCategory>('wedding-cakes');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackageType, setSelectedPackageType] = useState<string>('');
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

  const getCategoryBannerText = () => {
    switch(activeCategory) {
      case 'wedding-cakes':
        return 'Manage Wedding Cakes';
      case 'tiered-cakes':
        return 'Manage Tiered Cakes';
      case 'custom-designs':
        return 'Manage Custom Designs';
      default:
        return 'Cake Decoration Manager';
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const selectPackageType = (packageType: string) => {
    setSelectedPackageType(packageType);
  };

  const normalizeCakeCategory = (category: string | undefined): CakeCategory => {
    if (category === 'wedding-cakes') return 'wedding-cakes';
    if (category === 'tiered-cakes') return 'tiered-cakes';
    if (category === 'custom-designs') return 'custom-designs';
    return 'wedding-cakes';
  };

  const fetchVendorPackages = async (vendorId: number) => {
    try {
      const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setPackages(
        offerings.map((offering) => ({
          id: offering.id.toString(),
          category: normalizeCakeCategory(offering.category),
          title: offering.name,
          pricePerDay: Number(offering.price),
          services: offering.facilities || [],
          photos: offering.images || [],
          createdAt: new Date(offering.createdAt),
          duration: offering.roomType || offering.description || undefined,
          discount: offering.discount,
          discountType: offering.discountType,
          isDraft: offering.isDraft,
        }))
      );
    } catch (error) {
      console.error('Unable to load cake packages', error);
    }
  };

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

    fetchVendorPackages(vendorId);
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
        setActiveCategory(normalizeCakeCategory(data.category));
        setSelectedServices(Array.isArray(data.facilities) ? data.facilities : []);
        setSelectedPackageType(data.roomType || '');
        setNewPackage({
          title: data.name || '',
          pricePerDay: String(data.price || ''),
          services: Array.isArray(data.facilities) ? data.facilities.join(', ') : '',
          duration: data.description || '',
          discount: data.discount || '',
          discountType: data.discountType || '',
          photos: Array.isArray(data.images) ? data.images : [],
        });
        setToast({ message: 'Package loaded for editing.', type: 'success' });
      } catch (error) {
        console.error('Failed to load cake package for edit', error);
        setToast({ message: 'Unable to load this package for editing.', type: 'error' });
      }
    };

    loadPackageForEdit();
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadedUrls = await Promise.all(files.map((file) => uploadImageToCloudinary(file)));
      setNewPackage((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls],
      }));
      setToast({ message: 'Images uploaded successfully.', type: 'success' });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Image upload failed',
        type: 'error',
      });
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleSubmitPackage = async (e?: React.FormEvent, isDraft = false) => {
    if (e) e.preventDefault();

    if (uploadingImages) {
      setToast({ message: 'Please wait until image uploads are complete.', type: 'error' });
      return;
    }

    const vendorId = Number((user as any)?.id);
    if (!user || !Number.isFinite(vendorId) || vendorId <= 0) {
      setToast({ message: 'Invalid user session. Please log in again.', type: 'error' });
      router.push('/login');
      return;
    }

    if (!newPackage.title.trim() || !newPackage.pricePerDay) {
      setToast({ message: 'Please fill in the package name and price.', type: 'error' });
      return;
    }

    const combinedServices = Array.from(
      new Set([
        ...selectedServices,
        ...newPackage.services.split(',').map((service) => service.trim()).filter(Boolean),
      ])
    );

    const payload = {
      name: newPackage.title.trim(),
      description: [selectedPackageType, newPackage.duration, newPackage.services].filter(Boolean).join(' | '),
      category: activeCategory,
      price: parseFloat(newPackage.pricePerDay),
      facilities: combinedServices,
      roomType: selectedPackageType || undefined,
      discount: newPackage.discount || undefined,
      discountType: newPackage.discountType || undefined,
      images: newPackage.photos,
      vendorId,
      isDraft,
    };

    try {
      const requestPath = editingPackageId ? `/offerings/${editingPackageId}` : '/offerings';
      const createdPackage = await apiFetch<any>(requestPath, {
        method: editingPackageId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      const packageData: Package = {
        id: createdPackage.id.toString(),
        category: normalizeCakeCategory(createdPackage.category),
        title: createdPackage.name,
        pricePerDay: Number(createdPackage.price),
        services: createdPackage.facilities || [],
        photos: createdPackage.images || [],
        createdAt: new Date(createdPackage.createdAt),
        duration: createdPackage.roomType || createdPackage.description || undefined,
        discount: createdPackage.discount,
        discountType: createdPackage.discountType,
        isDraft: createdPackage.isDraft,
      };

      setPackages((prev) =>
        editingPackageId
          ? prev.map((pkg) => (pkg.id === packageData.id ? packageData : pkg))
          : [...prev, packageData]
      );

      setNewPackage({
        title: '',
        pricePerDay: '',
        services: '',
        duration: '',
        discount: '',
        discountType: '',
        photos: [],
      });
      setSelectedServices([]);
      setSelectedPackageType('');
      setEditingPackageId(null);
      setToast({
        message: editingPackageId
          ? (isDraft ? 'Draft updated successfully.' : 'Package updated successfully.')
          : (isDraft ? 'Package saved as draft successfully.' : 'Package posted successfully.'),
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to submit cake package', error);
      setToast({
        message: `Unable to save package: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const handleReset = () => {
    setNewPackage({
      title: '',
      pricePerDay: '',
      services: '',
      duration: '',
      discount: '',
      discountType: '',
      photos: [],
    });
    setSelectedServices([]);
    setSelectedPackageType('');
    setEditingPackageId(null);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>
              SC
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Sweet Celebrations</h2>
              <p className="text-xs text-gray-500">Artisan Cake Decoration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button 
              onClick={() => router.push('/dashboard/cake-decoration/overview')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaChartBar /> Overview
            </button>
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors"
              style={{backgroundColor: '#755A7B', color: 'white'}}
            >
              <FaPlus /> Post Package
            </button>
            <button 
              onClick={() => router.push('/dashboard/cake-decoration/posted-packages')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaFileInvoice /> Posted Packages
            </button>
            <button 
              onClick={() => router.push('/dashboard/cake-decoration/draft-packages')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaEdit /> Draft Package
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button 
              onClick={() => router.push('/dashboard/cake-decoration/place-booking')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"
            >
              <FaCalendarAlt /> Place a Booking
            </button>
            <button onClick={() => router.push('/dashboard/cake-decoration/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaEye /> Accept Booking
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaBell /> Notifications
            </button>
            <button onClick={() => router.push('/dashboard/cake-decoration/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaHeart /> Feedback
            </button>
            <button onClick={() => router.push('/dashboard/cake-decoration/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaCog /> Setting
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-white transition-all"
              style={{backgroundColor: '#755A7B'}}
            >
              <FaMoon /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Banner Section */}
          <div 
            className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" 
            style={{
              backgroundImage: 'url(/cake.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '150px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              border: '2px solid rgba(117, 90, 123, 0.2)'
            }}
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.7)'}}>{getCategoryBannerText()}</h2>
            <p className="text-sm md:text-xl text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>Create and manage your cake decoration packages</p>
          </div>

          <div className="flex items-center justify-between gap-4 mb-4 text-sm text-gray-600">
            <span>Loaded packages: <span className="font-semibold text-gray-900">{packages.filter((pkg) => pkg.category === activeCategory).length}</span></span>
            {editingPackageId && <span className="font-semibold" style={{color: '#755A7B'}}>Editing package #{editingPackageId}</span>}
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('wedding-cakes')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'wedding-cakes' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'wedding-cakes' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'wedding-cakes' ? 'bold' : 'normal',
                  background: activeCategory === 'wedding-cakes' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Wedding Cakes
              </button>
              <button
                onClick={() => setActiveCategory('tiered-cakes')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'tiered-cakes' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'tiered-cakes' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'tiered-cakes' ? 'bold' : 'normal',
                  background: activeCategory === 'tiered-cakes' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Tiered Cakes
              </button>
              <button
                onClick={() => setActiveCategory('custom-designs')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'custom-designs' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'custom-designs' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'custom-designs' ? 'bold' : 'normal',
                  background: activeCategory === 'custom-designs' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Custom Designs
              </button>
            </div>
          </div>

          {/* Package Type Selection */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">SELECT PACKAGE TYPE</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Basic Package', 'Standard Package', 'Premium Package', 'Luxury Package', 'Custom Package'].map((type) => (
                <button
                  key={type}
                  onClick={() => selectPackageType(type)}
                  className="p-4 border-2 rounded-lg text-center transition-all hover:shadow-lg"
                  style={{
                    borderColor: selectedPackageType === type ? '#755A7B' : '#e5e7eb',
                    backgroundColor: selectedPackageType === type ? 'rgba(117, 90, 123, 0.05)' : 'white',
                    color: selectedPackageType === type ? '#755A7B' : '#6b7280',
                    fontWeight: selectedPackageType === type ? 'bold' : 'normal'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Services Selection */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">SERVICES INCLUDED</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Live Band Performance',
                'DJ Services',
                'Sound System',
                'Lighting Setup',
                'Traditional Dancers',
                'MC Services',
                'Stage Setup',
                'Backup Equipment'
              ].map((service) => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className="p-3 border-2 rounded-lg text-sm transition-all hover:shadow-md"
                  style={{
                    borderColor: selectedServices.includes(service) ? '#755A7B' : '#e5e7eb',
                    backgroundColor: selectedServices.includes(service) ? 'rgba(117, 90, 123, 0.05)' : 'white',
                    color: selectedServices.includes(service) ? '#755A7B' : '#6b7280',
                    fontWeight: selectedServices.includes(service) ? 'bold' : 'normal'
                  }}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Package Form */}
          <form onSubmit={(event) => handleSubmitPackage(event, false)} className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-lg font-bold mb-6" style={{color: '#755A7B'}}>Package Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                <input
                  type="text"
                  required
                  value={newPackage.title}
                  onChange={(e) => setNewPackage({...newPackage, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Complete Wedding Entertainment"
                  style={{borderColor: '#e5e7eb'}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (Rs.) *</label>
                <input
                  type="number"
                  required
                  value={newPackage.pricePerDay}
                  onChange={(e) => setNewPackage({...newPackage, pricePerDay: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter price"
                  style={{borderColor: '#e5e7eb'}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Duration</label>
                <input
                  type="text"
                  value={newPackage.duration}
                  onChange={(e) => setNewPackage({...newPackage, duration: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 4-5 hours"
                  style={{borderColor: '#e5e7eb'}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services (comma-separated)</label>
                <input
                  type="text"
                  value={newPackage.services}
                  onChange={(e) => setNewPackage({...newPackage, services: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., DJ, Sound, Lighting"
                  style={{borderColor: '#e5e7eb'}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  value={newPackage.discount}
                  onChange={(e) => setNewPackage({...newPackage, discount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter discount percentage"
                  style={{borderColor: '#e5e7eb'}}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select
                  value={newPackage.discountType}
                  onChange={(e) => setNewPackage({...newPackage, discountType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{borderColor: '#e5e7eb'}}
                >
                  <option value="">Select type</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="early-bird">Early Bird</option>
                  <option value="bulk">Bulk Booking</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{borderColor: '#755A7B'}}>
                <FaUpload className="mx-auto text-4xl mb-3" style={{color: '#755A7B'}} />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer text-gray-600 hover:text-purple-600">
                  Click to upload or drag and drop
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </label>
                {newPackage.photos.length > 0 && (
                  <p className="mt-2 text-sm" style={{color: '#755A7B'}}>
                    {newPackage.photos.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={(event) => handleSubmitPackage(event as unknown as React.FormEvent, true)}
                disabled={uploadingImages}
                className="flex-1 py-3 px-6 rounded-lg text-white font-medium hover:opacity-90 transition-all disabled:opacity-60"
                style={{backgroundColor: '#755A7B'}}
              >
                {editingPackageId ? 'Update Draft' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={uploadingImages}
                className="flex-1 py-3 px-6 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                style={{backgroundColor: '#755A7B'}}
              >
                {editingPackageId ? 'Update Package' : 'Post Package'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 border-2 rounded-lg font-medium hover:bg-gray-50 transition-all"
                style={{borderColor: '#755A7B', color: '#755A7B'}}
              >
                Reset
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
