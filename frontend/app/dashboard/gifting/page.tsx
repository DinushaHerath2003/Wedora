'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaHeart, FaBell, FaEdit, FaTrash, FaCalendarAlt, FaEye, FaUpload, FaUserCircle, FaChartBar, FaMoneyBillWave, FaFileInvoice, FaUndo, FaCog, FaMoon, FaPlus } from 'react-icons/fa';

type GiftingCategory = 'wedding-favors' | 'gift-boxes' | 'custom-souvenirs';

interface Package {
  id: string;
  category: GiftingCategory;
  title: string;
  pricePerDay: number;
  services: string[];
  photos: string[];
  createdAt: Date;
  duration?: string;
  discount?: string;
  discountType?: string;
}

interface VendorUser {
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export default function GiftingDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeCategory, setActiveCategory] = useState<GiftingCategory>('wedding-favors');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackageType, setSelectedPackageType] = useState<string>('');
  const [newPackage, setNewPackage] = useState({
    title: '',
    pricePerDay: '',
    services: '',
    duration: '',
    discount: '',
    discountType: '',
    photos: [] as File[],
  });

  const getCategoryBannerText = () => {
    switch(activeCategory) {
      case 'wedding-favors':
        return 'Manage Wedding Favors';
      case 'gift-boxes':
        return 'Manage Gift Boxes';
      case 'custom-souvenirs':
        return 'Manage Custom Souvenirs';
      default:
        return 'Gifting Package Manager';
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
    
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } else {
      setUser({
        name: 'Demo Vendor',
        email: 'demo@wedora.com',
        role: 'vendor',
        organizationName: 'Memorable Gifts'
      });
    }
    
    const savedPackages = localStorage.getItem('giftingPackages');
    if (savedPackages) {
      setPackages(JSON.parse(savedPackages));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPackage({
        ...newPackage,
        photos: Array.from(e.target.files),
      });
    }
  };

  const handleSubmitPackage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const packageData: Package = {
      id: Date.now().toString(),
      category: activeCategory,
      title: newPackage.title,
      pricePerDay: parseFloat(newPackage.pricePerDay),
      services: newPackage.services.split(',').map(s => s.trim()),
      photos: newPackage.photos.map(f => URL.createObjectURL(f)),
      createdAt: new Date(),
      duration: newPackage.duration || undefined,
      discount: newPackage.discount || undefined,
      discountType: newPackage.discountType || undefined,
    };

    const updatedPackages = [...packages, packageData];
    setPackages(updatedPackages);
    localStorage.setItem('giftingPackages', JSON.stringify(updatedPackages));

    setNewPackage({
      title: '',
      pricePerDay: '',
      services: '',
      duration: '',
      discount: '',
      discountType: '',
      photos: [],
    });
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{backgroundColor: '#f5f5f7'}}>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: '#755A7B'}}>
              MG
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Memorable Gifts</h2>
              <p className="text-xs text-gray-500">Wedding Gifts & Souvenirs</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Main Menu</p>
            <button 
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
              onClick={() => router.push('/dashboard/gifting/posted-packages')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaFileInvoice /> Posted Packages
            </button>
            <button 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-600 hover:bg-gray-100"
            >
              <FaEdit /> Draft Package
            </button>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">Appointment</p>
            <button 
              onClick={() => router.push('/dashboard/gifting/place-booking')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100"
            >
              <FaCalendarAlt /> Place a Booking
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaEye /> Accept Booking
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2 px-3">General</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaBell /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
              <FaHeart /> Feedback
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-600 hover:bg-gray-100">
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
              backgroundImage: 'url(/gift.png)',
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
            <p className="text-sm md:text-xl text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>Create and manage your gifting packages</p>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 md:gap-6 justify-center items-center overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('wedding-favors')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'wedding-favors' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'wedding-favors' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'wedding-favors' ? 'bold' : 'normal',
                  background: activeCategory === 'wedding-favors' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Wedding Favors
              </button>
              <button
                onClick={() => setActiveCategory('gift-boxes')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'gift-boxes' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'gift-boxes' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'gift-boxes' ? 'bold' : 'normal',
                  background: activeCategory === 'gift-boxes' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Gift Boxes
              </button>
              <button
                onClick={() => setActiveCategory('custom-souvenirs')}
                className="px-4 md:px-8 py-3 font-medium transition-all border-b-4 whitespace-nowrap"
                style={{
                  borderColor: activeCategory === 'custom-souvenirs' ? '#755A7B' : 'transparent',
                  color: activeCategory === 'custom-souvenirs' ? '#755A7B' : '#999',
                  fontWeight: activeCategory === 'custom-souvenirs' ? 'bold' : 'normal',
                  background: activeCategory === 'custom-souvenirs' ? 'linear-gradient(to bottom, transparent, rgba(117, 90, 123, 0.05))' : 'transparent'
                }}
              >
                Custom Souvenirs
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
                type="submit"
                className="flex-1 py-3 px-6 rounded-lg text-white font-medium hover:opacity-90 transition-all"
                style={{backgroundColor: '#755A7B'}}
              >
                Post Package
              </button>
              <button
                type="button"
                onClick={() => setNewPackage({
                  title: '',
                  pricePerDay: '',
                  services: '',
                  duration: '',
                  discount: '',
                  discountType: '',
                  photos: [],
                })}
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
