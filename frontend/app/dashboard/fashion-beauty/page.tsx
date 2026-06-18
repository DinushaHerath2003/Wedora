'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaBell, FaEdit, FaCalendarAlt, FaEye, FaChartBar, FaFileInvoice, FaCog, FaMoon, FaPlus, FaCamera, FaVideo, FaHome, FaCheck } from 'react-icons/fa';

type BeautyCategory = 'bridal-makeup' | 'hair-styling' | 'traditional-dressing';

interface Package {
  id: string;
  category: BeautyCategory;
  title: string;
  pricePerDay: number;
  features: string[];
  photos: string[];
  createdAt: Date;
  stock?: number;
  discount?: string;
  discountType?: string;
}

interface VendorUser {
  id?: number | string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function FashionBeautyDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeCategory, setActiveCategory] = useState<BeautyCategory>('bridal-makeup');
  const [packageCategory, setPackageCategory] = useState('bridal-makeup');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: '',
    pricePerDay: '',
    features: '',
    stock: '',
    discount: '',
    discountType: '',
    photos: [] as string[],
  });

  const organizationLabel = user?.organizationName || user?.name || 'Fashion & Beauty Vendor';
  const organizationInitial = organizationLabel.charAt(0).toUpperCase();

  const getCategoryBannerText = () => {
    switch(activeCategory) {
      case 'bridal-makeup':
        return 'Manage Bridal Makeup';
      case 'hair-styling':
        return 'Manage Hair Styling';
      case 'traditional-dressing':
        return 'Manage Traditional Dressing';
      default:
        return 'Beauty Package Manager';
    }
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const selectPackageType = (packageType: string) => {
    setSelectedRoomType(packageType);
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');

    if (userStr) {
      const userData = JSON.parse(userStr);
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
        setActiveCategory(
          data.category === 'hair-styling'
            ? 'hair-styling'
            : data.category === 'traditional-dressing'
            ? 'traditional-dressing'
            : 'bridal-makeup'
        );
        setPackageCategory(data.category || 'bridal-makeup');
        setSelectedFeatures(Array.isArray(data.facilities) ? data.facilities : []);
        setSelectedRoomType(data.roomType || '');
        setNewPackage({
          title: data.name || '',
          pricePerDay: String(data.price || ''),
          features: data.description || '',
          stock: data.stock ? String(data.stock) : '',
          discount: data.discount || '',
          discountType: data.discountType || '',
          photos: Array.isArray(data.images) ? data.images : [],
        });
        setToast({
          message: 'Package loaded for editing. Update and save when ready.',
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

  useEffect(() => {
    setPackageCategory(activeCategory);
  }, [activeCategory]);

  const fetchVendorPackages = async (vendorId: number) => {
    try {
      const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorId}`);
      setPackages(
        offerings.map((offering) => ({
          id: offering.id.toString(),
          category: offering.category as BeautyCategory,
          title: offering.name,
          pricePerDay: Number(offering.price),
          features: offering.facilities || [],
          photos: offering.images || [],
          createdAt: new Date(offering.createdAt),
          stock: offering.stock,
          discount: offering.discount,
          discountType: offering.discountType,
        }))
      );
    } catch (error) {
      console.error('Unable to load vendor packages', error);
    }
  };

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
      const uploadedUrls = await Promise.all(
        files.map((file) => uploadImageToCloudinary(file)),
      );

      setNewPackage((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls],
      }));
      setToast({
        message: 'Images uploaded successfully!',
        type: 'success',
      });
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
      setToast({
        message: 'Please wait until image uploads are complete.',
        type: 'error',
      });
      return;
    }

    const vendorId = Number((user as any).id);

    if (!user || !('id' in user) || Number.isNaN(vendorId) || vendorId <= 0) {
      setToast({
        message: 'Invalid user session. Please log in again.',
        type: 'error',
      });
      router.push('/login');
      return;
    }

    if (!newPackage.title || !packageCategory || !newPackage.pricePerDay) {
      setToast({
        message: 'Please fill in all required fields: Package Name, Category, and Price',
        type: 'error',
      });
      return;
    }

    // Validate description word count
    const wordCount = newPackage.features.trim().split(/\s+/).filter(w => w).length;
    if (!isDraft && wordCount < 200) {
      setToast({
        message: `Description must be at least 200 words. Currently: ${wordCount} words`,
        type: 'error',
      });
      return;
    }

    const payload = {
      name: newPackage.title,
      description: newPackage.features,
      category: packageCategory,
      price: parseFloat(newPackage.pricePerDay),
      facilities: selectedFeatures,
      roomType: selectedRoomType,
      stock: newPackage.stock ? parseInt(newPackage.stock) : undefined,
      discount: newPackage.discount || undefined,
      discountType: newPackage.discountType || undefined,
      images: newPackage.photos,
      vendorId,
      isDraft,
    };

    try {
      console.log('Submitting package payload:', JSON.stringify(payload, null, 2));
      const requestPath = editingPackageId ? `/offerings/${editingPackageId}` : '/offerings';
      const createdPackage = await apiFetch<any>(requestPath, {
        method: editingPackageId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      const packageData: Package = {
        id: createdPackage.id.toString(),
        category: createdPackage.category as BeautyCategory,
        title: createdPackage.name,
        pricePerDay: Number(createdPackage.price),
        features: createdPackage.facilities || [],
        photos: createdPackage.images || [],
        createdAt: new Date(createdPackage.createdAt),
        stock: createdPackage.stock,
        discount: createdPackage.discount,
        discountType: createdPackage.discountType,
      };

      setPackages((prev) =>
        editingPackageId
          ? prev.map((pkg) => (pkg.id === packageData.id ? packageData : pkg))
          : [...prev, packageData]
      );
      setNewPackage({
        title: '',
        pricePerDay: '',
        features: '',
        stock: '',
        discount: '',
        discountType: '',
        photos: [],
      });
      setSelectedFeatures([]);
      setSelectedRoomType('');
      setPackageCategory(activeCategory);
      
      setEditingPackageId(null);
      setToast({
        message: editingPackageId
          ? (isDraft ? 'Draft updated successfully.' : 'Package updated successfully.')
          : (isDraft ? 'Package saved as draft successfully.' : 'Package posted successfully.'),
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to submit package', err);
      setToast({
        message: `Error: ${err instanceof Error ? err.message : 'Failed to create package'}`,
        type: 'error',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>
              {organizationInitial}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{organizationLabel}</h2>
              <p className="text-xs text-gray-500">fashion & beauty</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button 
              onClick={() => router.push('/dashboard/fashion-beauty/overview')}
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
              onClick={() => router.push('/dashboard/fashion-beauty/posted-packages')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaFileInvoice /> Posted Packages
            </button>
            <button 
              onClick={() => router.push('/dashboard/fashion-beauty/draft-packages')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaEdit /> Draft Package
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button 
              onClick={() => router.push('/dashboard/fashion-beauty/place-booking')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"
            >
              <FaCalendarAlt /> Place a Booking
            </button>
            <button onClick={() => router.push('/dashboard/fashion-beauty/accept-booking')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaEye /> Accept Booking
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaBell /> Notifications
            </button>
            <button onClick={() => router.push('/dashboard/fashion-beauty/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaHeart /> Feedback
            </button>
            <button onClick={() => router.push('/dashboard/fashion-beauty/settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                <FaHome /> Home
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Vendor Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">{editingPackageId ? 'Edit Package' : 'Post Package'}</h1>
              </div>
            </div>
          </div>

          {/* Banner Section */}
          <div 
            className="mb-6 md:mb-8 rounded-lg overflow-hidden shadow-lg" 
            style={{
              backgroundImage: 'url(/saloon.png)',
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
            <p className="text-sm md:text-xl text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>Create and manage your beauty packages</p>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('bridal-makeup')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'bridal-makeup' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'bridal-makeup' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'bridal-makeup' ? 'bold' : 'normal',
                  background: activeCategory === 'bridal-makeup' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Bridal Makeup
              </button>
              <button
                onClick={() => setActiveCategory('hair-styling')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'hair-styling' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'hair-styling' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'hair-styling' ? 'bold' : 'normal',
                  background: activeCategory === 'hair-styling' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Hair Styling
              </button>
              <button
                onClick={() => setActiveCategory('traditional-dressing')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'traditional-dressing' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'traditional-dressing' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'traditional-dressing' ? 'bold' : 'normal',
                  background: activeCategory === 'traditional-dressing' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Traditional Dressing
              </button>
            </div>
          </div>

          {/* Breadcrumb and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>mainmenu</span>
                <span>/</span>
                <span className="font-semibold" style={{color: '#755A7B'}}>add new package</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">{editingPackageId ? 'Edit Package' : 'Add New Package'}</h2>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={(e) => handleSubmitPackage(e, true)}
                disabled={uploadingImages}
                className="px-4 md:px-6 py-2.5 border-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm md:text-base"
                style={{borderColor: '#e5e7eb'}}
              >
                <FaFileInvoice /> {editingPackageId ? 'Update Draft' : 'Save Draft'}
              </button>
              <button 
                onClick={(e) => handleSubmitPackage(e, false)}
                disabled={uploadingImages}
                className="px-4 md:px-6 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-opacity flex items-center gap-2 text-sm md:text-base"
                style={{backgroundColor: '#755A7B'}}
              >
                <FaCheck /> {editingPackageId ? 'Save Changes' : 'Add Package'}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Package Information */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name of Package</label>
                    <input
                      type="text"
                      required
                      value={newPackage.title}
                      onChange={(e) => setNewPackage({...newPackage, title: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400"
                      placeholder="Premium Bridal Makeup Package"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-gray-700">Description of Package</label>
                      <span className="text-xs text-gray-500 ml-2">
                        {newPackage.features.trim().split(/\s+/).filter(w => w).length} / 200 words
                      </span>
                    </div>
                    <textarea
                      required
                      value={newPackage.features}
                      onChange={(e) => setNewPackage({...newPackage, features: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-400"
                      style={{
                        borderColor: newPackage.features.trim().split(/\s+/).filter(w => w).length < 200 ? '#d1d5db' : '#10b981'
                      }}
                      rows={5}
                      placeholder="Professional wedding beauty package with high-quality equipment. Includes full-day coverage, edited photos, online gallery, albums, optional drone shots, and cinematic storytelling for the celebration..."
                    />
                    {newPackage.features.trim().split(/\s+/).filter(w => w).length < 200 && newPackage.features.trim().length > 0 && (
                      <p className="text-xs text-orange-600 mt-2">
                        Description must be at least 200 words. {200 - newPackage.features.trim().split(/\s+/).filter(w => w).length} more words needed.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                      <p className="text-xs text-gray-500 mb-2">Select Available Features</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['Bridal Makeup', 'Hair Styling', 'Saree Draping', 'Touch-up Service'].map((facility) => (
                          <button
                            key={facility}
                            type="button"
                            onClick={() => toggleFeature(facility)}
                            className="px-4 py-2 rounded-lg font-medium transition-all text-sm"
                            style={{
                              backgroundColor: selectedFeatures.includes(facility) ? '#755A7B' : '#f3f4f6',
                              color: selectedFeatures.includes(facility) ? 'white' : '#6b7280'
                            }}
                          >
                            {facility}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
                      <p className="text-xs text-gray-500 mb-2">Select Package Type</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {[
                          { value: 'basic', label: 'Basic Package', desc: '4 hours coverage, 100 edited photos', icon: FaCamera },
                          { value: 'standard', label: 'Standard Package', desc: 'Makeup, hair styling, and draping', icon: FaCamera },
                          { value: 'premium', label: 'Premium Package', desc: 'Premium products and touch-up service', icon: FaCamera },
                          { value: 'luxury', label: 'Luxury Package', desc: 'Trial session and full bridal look', icon: FaCamera },
                          { value: 'groom-basic', label: 'Groom Grooming', desc: 'Groom styling and grooming package', icon: FaVideo },
                          { value: 'traditional-premium', label: 'Traditional Premium', desc: 'Traditional dressing and full styling', icon: FaVideo }
                        ].map((room) => (
                          <button
                            key={room.value}
                            type="button"
                            onClick={() => selectPackageType(room.value)}
                            className="w-full text-left px-3 py-2 rounded-lg transition-all"
                            style={{
                              backgroundColor: selectedRoomType === room.value ? '#755A7B' : '#f3f4f6',
                              color: selectedRoomType === room.value ? 'white' : '#6b7280'
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <room.icon className="mt-1 shrink-0" />
                              <div>
                                <div className="text-sm font-medium">{room.label}</div>
                                <div className="text-xs opacity-80">{room.desc}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing of Package */}
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing of Package</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Price</label>
                    <input
                      type="number"
                      required
                      value={newPackage.pricePerDay}
                      onChange={(e) => setNewPackage({...newPackage, pricePerDay: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400"
                      placeholder="Rs. 45,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                    <input
                      type="text"
                      value={newPackage.discount}
                      onChange={(e) => setNewPackage({...newPackage, discount: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400"
                      placeholder="10%"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newPackage.discountType}
                        onChange={(e) => setNewPackage({...newPackage, discountType: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400"
                        placeholder="Early Bird Discount"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800"></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Stock</label>
                    <input
                      type="number"
                      value={newPackage.stock}
                      onChange={(e) => setNewPackage({...newPackage, stock: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 font-medium placeholder-gray-400"
                      placeholder="10"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Upload Images & Category */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Img</h3>
                
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 md:p-6 mb-4">
                  <div className="aspect-square bg-gray-50 rounded-lg mb-4 overflow-hidden">
                    {newPackage.photos.length > 0 ? (
                      <img 
                        src={newPackage.photos[0]} 
                        alt="Main" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 md:w-32 h-24 md:h-32 bg-purple-100 rounded-lg"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="aspect-square bg-purple-100 rounded-lg overflow-hidden">
                        {newPackage.photos[idx + 1] && (
                          <img 
                            src={newPackage.photos[idx + 1]} 
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={uploadingImages}
                      className="aspect-square bg-purple-100 rounded-lg flex items-center justify-center text-2xl"
                      style={{color: '#755A7B'}}
                    >
                      {uploadingImages ? '...' : '+'}
                    </button>
                  </div>

                  {uploadingImages && (
                    <p className="mt-3 text-sm text-gray-500">Uploading images to Cloudinary...</p>
                  )}
                  
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Category</label>
                  <div className="relative mb-4">
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 appearance-none"
                      value={packageCategory}
                      onChange={(e) => setPackageCategory(e.target.value)}
                    >
                      <option value="bridal-makeup">Bridal Makeup</option>
                      <option value="hair-styling">Hair Styling</option>
                      <option value="traditional-dressing">Traditional Dressing</option>
                      <option value="combo-package">Beauty Combo Package</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800"></div>
                  </div>
                  
                  <button
                    type="button"
                    className="w-full py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                    style={{backgroundColor: '#755A7B'}}
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-8" style={{backgroundColor: '#755A7B'}}>
          <div className="px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* About Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
                  <h3 className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h3>
                </div>
                <p className="text-purple-100 text-sm">
                  Your trusted partner in creating unforgettable wedding experiences.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="/" className="text-purple-100 hover:text-white text-sm transition-colors">Home</a></li>
                  <li><a href="/about" className="text-purple-100 hover:text-white text-sm transition-colors">About Us</a></li>
                  <li><a href="/contact" className="text-purple-100 hover:text-white text-sm transition-colors">Contact</a></li>
                  <li><a href="/signup" className="text-purple-100 hover:text-white text-sm transition-colors">Sign Up</a></li>
                </ul>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-white font-bold mb-4">Services</h4>
                <ul className="space-y-2">
                  <li><span className="text-purple-100 text-sm">Fashion & Beauty</span></li>
                  <li><span className="text-purple-100 text-sm">Photography</span></li>
                  <li><span className="text-purple-100 text-sm">Fashion & Beauty</span></li>
                  <li><span className="text-purple-100 text-sm">Entertainment</span></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-white font-bold mb-4">Contact Us</h4>
                <ul className="space-y-2">
                  <li className="text-purple-100 text-sm">Email: info@wedora.com</li>
                  <li className="text-purple-100 text-sm">Phone: +94 77 123 4567</li>
                  <li className="text-purple-100 text-sm">Address: Colombo, Sri Lanka</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-purple-400 pt-8">
              <div className="text-center text-purple-100">
                <p>&copy; 2026 Wedora. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}



