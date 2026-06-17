'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaHeart, FaSearch, FaFilter, FaMapMarkerAlt, FaStar, FaShoppingCart, FaCalculator, FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { apiFetch } from '@/lib/api';
import {
  CeremonialCategory,
  CEREMONIAL_CATEGORY_LABELS,
  isCeremonialCategory,
  normalizeCeremonialCategory,
  resolveOfferingImage,
} from '@/lib/ceremonial-dashboard';

interface Vendor {
  id: string;
  name: string;
  organizationName: string;
  category: CeremonialCategory[];
  location: string;
  rating: number;
  reviewCount: number;
  minPrice: number;
  maxPrice: number;
  image: string;
  packageCount: number;
  services: string[];
}

export default function CeremonialServices() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CeremonialCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<{name: string; email: string} | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesList, setServicesList] = useState<string[]>([]);

  useEffect(() => {
    // Load user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } else {
      // Demo user
      setUser({
        name: 'Dinusha Herath',
        email: 'DinushaHerath@gmail.com'
      });
    }
    fetchCeremonialOfferings();
  }, []);

  const fetchCeremonialOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await apiFetch<any[]>('/offerings');
      const vendorMap = new Map<number, any>();
      const allServices = new Set<string>();

      offerings.forEach((offering) => {
        if (offering.isDraft || !offering.vendor || !isCeremonialCategory(offering.category)) {
          return;
        }

        const vendor = offering.vendor;
        const vendorId = vendor.id;
        const category = normalizeCeremonialCategory(offering.category);

        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            id: vendorId.toString(),
            name: vendor.organizationName,
            organizationName: vendor.organizationName,
            location: vendor.location || 'Not specified',
            categories: new Set<CeremonialCategory>(),
            offerings: [],
            services: new Set<string>(),
            image: resolveOfferingImage(offering.images, '/poruwa.png'),
          });
        }

        const vendorData = vendorMap.get(vendorId)!;
        vendorData.categories.add(category);
        vendorData.offerings.push(offering);

        if (Array.isArray(offering.facilities)) {
          offering.facilities.forEach((service: string) => {
            vendorData.services.add(service);
            allServices.add(service);
          });
        }
      });

      const displayVendors: Vendor[] = Array.from(vendorMap.values()).map((vendorData) => {
        const prices = vendorData.offerings.map((offering: any) => Number(offering.price) || 0);

        return {
          id: vendorData.id,
          name: vendorData.name,
          organizationName: vendorData.organizationName,
          category: Array.from(vendorData.categories),
          location: vendorData.location,
          rating: 4.7,
          reviewCount: Math.floor(Math.random() * 200) + 50,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          image: vendorData.image,
          packageCount: vendorData.offerings.length,
          services: Array.from(vendorData.services),
        };
      });

      setVendors(displayVendors);
      setServicesList(Array.from(allServices));
    } catch (error) {
      console.error('Failed to fetch ceremonial offerings:', error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const filteredVendors = vendors.filter(vendor => {
    // Category filter
    if (selectedCategory !== 'all' && !vendor.category.includes(selectedCategory)) {
      return false;
    }

    // Search filter
    if (searchQuery && !vendor.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !vendor.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Services filter
    if (selectedServices.length > 0 && !selectedServices.every(s => vendor.services.includes(s))) {
      return false;
    }

    // Price filter
    if (vendor.minPrice > priceRange[1] || vendor.maxPrice < priceRange[0]) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm sticky top-0 z-50" style={{backgroundColor: '#755A7B'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
            <h1 className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h1>
          </Link>
          <nav className="flex items-center gap-4">
            {/* Services Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShowServicesDropdown(true)}
              onMouseLeave={() => setShowServicesDropdown(false)}
            >
              <button
                className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80 flex items-center gap-2"
              >
                Services <FaChevronDown className="text-sm" />
              </button>
              
              {showServicesDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                  <Link
                    href="/services/venue-accommodation"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Venue & Accommodation
                  </Link>
                  <Link
                    href="/services/photography-videography"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Photography & Videography
                  </Link>
                  <Link
                    href="/services/fashion-beauty"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Fashion & Beauty
                  </Link>
                  <Link
                    href="/services/entertainment"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Entertainment
                  </Link>
                  <Link
                    href="/services/transportation"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Transportation
                  </Link>
                  <Link
                    href="/services/ceremonial"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Ceremonial Services
                  </Link>
                  <Link
                    href="/services/cake-decoration"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Cake Decoration
                  </Link>
                  <Link
                    href="/services/gifting-souvenirs"
                    className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                    style={{color: '#755A7B'}}
                  >
                    Gifting & Souvenirs
                  </Link>
                </div>
              )}
            </div>

            <Link href="/budget-calculator" className="p-2 rounded-full hover:bg-purple-700" title="Budget Calculator">
              <FaCalculator className="text-xl text-white" />
            </Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-purple-700 relative" title="Cart">
              <FaShoppingCart className="text-xl text-white" />
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{backgroundColor: '#ff4444'}}>
                0
              </span>
            </Link>

            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-purple-400">
                <FaUserCircle className="text-3xl text-white" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-purple-200">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg border-2 border-white hover:bg-white hover:bg-opacity-20 flex items-center gap-2 font-medium transition-colors text-white"
                >
                  <FaSignOutAlt className="text-lg" /> Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src="/poruwa.png" 
          alt="Ceremonial Services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4" style={{fontFamily: 'var(--font-season)'}}>
              Ceremonial Services
            </h1>
            <p className="text-lg">Find the perfect ceremonial services for your special day</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service provider or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors hover:opacity-90"
              style={{backgroundColor: '#755A7B'}}
            >
              <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={selectedCategory === 'all' ? {backgroundColor: '#755A7B'} : {}}
            >
              All Ceremonial
            </button>
            <button
              onClick={() => setSelectedCategory('poruwa-ceremony')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === 'poruwa-ceremony'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={selectedCategory === 'poruwa-ceremony' ? {backgroundColor: '#755A7B'} : {}}
            >
              {CEREMONIAL_CATEGORY_LABELS['poruwa-ceremony']}
            </button>
            <button
              onClick={() => setSelectedCategory('religious-services')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === 'religious-services'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={selectedCategory === 'religious-services' ? {backgroundColor: '#755A7B'} : {}}
            >
              {CEREMONIAL_CATEGORY_LABELS['religious-services']}
            </button>
            <button
              onClick={() => setSelectedCategory('cultural-events')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === 'cultural-events'
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={selectedCategory === 'cultural-events' ? {backgroundColor: '#755A7B'} : {}}
            >
              {CEREMONIAL_CATEGORY_LABELS['cultural-events']}
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Services Filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{color: '#755A7B'}}>Services</h3>
                  <div className="space-y-2">
                    {servicesList.map(service => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service)}
                          onChange={() => toggleService(service)}
                          className="w-5 h-5 rounded border-gray-300 focus:ring-purple-500"
                          style={{accentColor: '#755A7B'}}
                        />
                        <span className="text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{color: '#755A7B'}}>Price Range</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">
                        Rs {priceRange[0].toLocaleString()} - Rs {priceRange[1].toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                        style={{accentColor: '#755A7B'}}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setSelectedServices([]);
                        setPriceRange([0, 100000]);
                      }}
                      className="text-sm font-medium hover:underline"
                      style={{color: '#755A7B'}}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading ceremonial vendors...' : <>Showing <span className="font-semibold">{filteredVendors.length}</span> {filteredVendors.length === 1 ? 'vendor' : 'vendors'}</>}
          </p>
        </div>

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <img
                  src={vendor.image}
                  alt={vendor.organizationName}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                  <FaHeart className="text-xl text-gray-400 hover:text-red-500" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold mb-1" style={{color: '#755A7B'}}>
                      {vendor.organizationName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <FaMapMarkerAlt className="mr-1" />
                      {vendor.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-semibold">{vendor.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({vendor.reviewCount} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {vendor.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs rounded-full"
                      style={{backgroundColor: '#f3f0f4', color: '#755A7B'}}
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Starting from</p>
                    <p className="text-2xl font-bold" style={{color: '#755A7B'}}>
                      Rs {vendor.minPrice.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/services/ceremonial/${vendor.id}`}
                    className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                    style={{backgroundColor: '#755A7B'}}
                  >
                    View Details
                  </Link>
                </div>

                <p className="text-sm text-gray-500 mt-3 text-center">
                  {vendor.packageCount} Packages Available
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No vendors found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8" style={{backgroundColor: '#755A7B'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
              <span className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</span>
            </div>
            <p className="text-purple-200 text-sm">© 2024 Wedora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
