'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Toast, { ToastProps } from '@/components/Toast';
import {
  buildCeremonialOfferingPayload,
  CeremonialCategory,
  CEREMONIAL_DASHBOARD_BASE,
  normalizeCeremonialCategory,
} from '@/lib/ceremonial-dashboard';
import CeremonialSidebar from '@/components/ceremonial/CeremonialSidebar';
import { FaUpload } from 'react-icons/fa';

interface VendorUser {
  id?: number | string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function CeremonialDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CeremonialCategory>('poruwa-ceremony');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackageType, setSelectedPackageType] = useState<string>('');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [newPackage, setNewPackage] = useState({
    title: '',
    pricePerDay: '',
    services: '',
    duration: '',
    discount: '',
    discountType: '',
    photos: [] as File[],
  });

  const organizationLabel = user?.organizationName || user?.name || 'Ceremonial Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  const getCategoryBannerText = () => {
    switch(activeCategory) {
      case 'poruwa-ceremony':
        return 'Manage Poruwa Ceremonies';
      case 'religious-services':
        return 'Manage Religious Services';
      case 'cultural-events':
        return 'Manage Cultural Events';
      default:
        return 'Ceremonial Package Manager';
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
        setActiveCategory(normalizeCeremonialCategory(data.category));
        setSelectedServices(Array.isArray(data.facilities) ? data.facilities : []);
        setSelectedPackageType(data.roomType || '');
        setNewPackage({
          title: data.name || '',
          pricePerDay: String(data.price || ''),
          services: data.description || '',
          duration: data.roomType || '',
          discount: data.discount || '',
          discountType: data.discountType || '',
          photos: [],
        });
        setToast({
          message: 'Package loaded for editing.',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to load package for edit', error);
        setToast({
          message: 'Unable to load this package for editing.',
          type: 'error',
        });
      }
    };

    loadPackageForEdit();
  }, [searchParams]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPackage({
        ...newPackage,
        photos: Array.from(e.target.files),
      });
    }
  };

  const handleSubmitPackage = async (e?: React.FormEvent, isDraft = false) => {
    if (e) e.preventDefault();

    const vendorId = Number(user?.id);
    if (!user || !Number.isFinite(vendorId) || vendorId <= 0) {
      setToast({ message: 'Invalid session. Please log in again.', type: 'error' });
      router.push('/login');
      return;
    }

    if (!newPackage.title || !newPackage.pricePerDay) {
      setToast({
        message: 'Please fill in service name and price.',
        type: 'error',
      });
      return;
    }

    const description =
      newPackage.services.trim() ||
      selectedServices.join(', ') ||
      `${newPackage.title} ceremonial service package`;

    const payload = buildCeremonialOfferingPayload({
      title: newPackage.title,
      description,
      category: activeCategory,
      pricePerDay: newPackage.pricePerDay,
      selectedServices,
      packageType: selectedPackageType,
      duration: newPackage.duration,
      discount: newPackage.discount,
      discountType: newPackage.discountType,
      photos: newPackage.photos,
      vendorId,
      isDraft,
    });

    try {
      const requestPath = editingPackageId ? `/offerings/${editingPackageId}` : '/offerings';
      await apiFetch(requestPath, {
        method: editingPackageId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

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
        message: isDraft
          ? 'Package saved as draft successfully!'
          : 'Ceremonial package posted successfully!',
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to save package',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <CeremonialSidebar
        activePage="post"
        organizationLabel={organizationLabel}
        organizationInitial={organizationInitial}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Banner Section */}
          <div 
            className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" 
            style={{
              backgroundImage: 'url(/poruwa.png)',
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
            <p className="text-sm md:text-xl text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>Create and manage your ceremonial service packages</p>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('poruwa-ceremony')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'poruwa-ceremony' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'poruwa-ceremony' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'poruwa-ceremony' ? 'bold' : 'normal',
                  background: activeCategory === 'poruwa-ceremony' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Poruwa Ceremony
              </button>
              <button
                onClick={() => setActiveCategory('religious-services')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'religious-services' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'religious-services' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'religious-services' ? 'bold' : 'normal',
                  background: activeCategory === 'religious-services' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Religious Services
              </button>
              <button
                onClick={() => setActiveCategory('cultural-events')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'cultural-events' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'cultural-events' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'cultural-events' ? 'bold' : 'normal',
                  background: activeCategory === 'cultural-events' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Cultural Events
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
                'Poruwa Setup',
                'Religious Rituals',
                'Cultural Performances',
                'Priest Services',
                'Traditional Music',
                'Ceremony Coordination',
                'Sacred Items',
                'Blessing Services'
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
          <form onSubmit={handleSubmitPackage} className="bg-white rounded-lg shadow p-4 md:p-6">
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
                  placeholder="e.g., Complete Poruwa Ceremony Package"
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

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                style={{backgroundColor: '#755A7B'}}
              >
                {editingPackageId ? 'Update Package' : 'Post Package'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmitPackage(undefined, true)}
                className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition-all"
                style={{backgroundColor: '#A495A8'}}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => {
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
                }}
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
