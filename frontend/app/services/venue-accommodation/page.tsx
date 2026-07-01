'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useCartCount } from '@/lib/use-cart-count';
import { FaHeart, FaSearch, FaFilter, FaMapMarkerAlt, FaShoppingCart, FaCalculator, FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

type VenueCategory = 'hotel-rooms' | 'banquet-halls' | 'outdoor-venues';

function normalizeVenueCategory(category: string | undefined): VenueCategory | null {
  if (category === 'hotel-rooms' || category === 'hotel-room') return 'hotel-rooms';
  if (category === 'banquet-halls' || category === 'banquet-hall') return 'banquet-halls';
  if (category === 'outdoor-venues' || category === 'outdoor-venue') return 'outdoor-venues';
  return null;
}

interface VendorOffering {
  id: number;
  name: string;
  price: number;
  category: string;
  facilities: string[];
  images: string[];
}

interface Vendor {
  id: string;
  id_text: string;
  organizationName: string;
  location: string;
  phone: string;
  contactPerson?: string;
  offerings: VendorOffering[];
}

interface DisplayVendor {
  id: string;
  name: string;
  organizationName: string;
  category: VenueCategory[];
  location: string;
  minPrice: number;
  maxPrice: number;
  image: string;
  packageCount: number;
  facilities: string[];
}

export default function VenueAccommodationServices() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<VenueCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<{name: string; email: string} | null>(null);
  const [vendors, setVendors] = useState<DisplayVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<string[]>(['WiFi', 'AC', 'Parking', 'Catering', 'Stage', 'Beach Access', 'Outdoor Setup']);
  const cartCount = useCartCount(user);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;
    setUser(userData);
    fetchVendorOfferings();
  }, []);

  const fetchVendorOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await apiFetch<any[]>('/offerings');
      
      const vendorMap = new Map<number, any>();
      const categoryMap = new Map<string, string>();
      const allFacilities = new Set<string>();

      offerings.forEach((offering) => {
        const normalizedCategory = normalizeVenueCategory(offering.category);

        if (!offering.isDraft && offering.vendor && normalizedCategory) {
          const vendor = offering.vendor;
          const vendorId = vendor.id;

          if (!vendorMap.has(vendorId)) {
            vendorMap.set(vendorId, {
              id: vendorId.toString(),
              name: vendor.organizationName,
              organizationName: vendor.organizationName,
              location: vendor.location || 'Not specified',
              phone: vendor.phone || '',
              categories: new Set<string>(),
              offerings: [],
              allFacilities: new Set<string>()
            });
          }

          const vendorData = vendorMap.get(vendorId)!;
          vendorData.offerings.push(offering);
          
          vendorData.categories.add(normalizedCategory);
          
          if (offering.facilities && Array.isArray(offering.facilities)) {
            offering.facilities.forEach((f: string) => {
              vendorData.allFacilities.add(f);
              allFacilities.add(f);
            });
          }
        }
      });

      const displayVendors: DisplayVendor[] = Array.from(vendorMap.values()).map(v => {
        const prices = v.offerings.map((o: any) => Number(o.price) || 0);
        const minPrice = Math.min(...prices, 0);
        const maxPrice = Math.max(...prices, 500000);

        return {
          id: v.id,
          name: v.name,
          organizationName: v.organizationName,
          category: Array.from(v.categories) as VenueCategory[],
          location: v.location,
          minPrice,
          maxPrice,
          image: '/ven1.png',
          packageCount: v.offerings.length,
          facilities: Array.from(v.allFacilities)
        };
      });

      setVendors(displayVendors);
      setFacilities(Array.from(allFacilities).slice(0, 7));
    } catch (error) {
      console.error('Failed to fetch vendor offerings:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const filteredVendors = vendors.filter(vendor => {
    if (selectedCategory !== 'all' && !vendor.category.includes(selectedCategory)) {
      return false;
    }
    if (searchQuery && !vendor.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !vendor.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedFacilities.length > 0 && !selectedFacilities.every(f => vendor.facilities.includes(f))) {
      return false;
    }
    if (vendor.minPrice > priceRange[1] || vendor.maxPrice < priceRange[0]) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-4 text-4xl">⏳</div>
            <p className="text-gray-600 font-medium">Loading venue packages...</p>
          </div>
        </div>
      ) : (
        <>
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
                {cartCount}
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
          src="/9.png" 
          alt="Venue & Accommodation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4" style={{fontFamily: 'var(--font-season)'}}>
              Venue & Accommodation
            </h1>
            <p className="text-lg">Find the perfect venue for your special day</p>
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
                placeholder="Search by venue name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 text-white transition-colors"
              style={{backgroundColor: '#755A7B'}}
            >
              <FaFilter /> Filters
            </button>
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'all' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'all' ? 'white' : '#6b7280'
              }}
            >
              All Venues
            </button>
            <button
              onClick={() => setSelectedCategory('hotel-rooms')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'hotel-rooms' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'hotel-rooms' ? 'white' : '#6b7280'
              }}
            >
              Hotel Rooms
            </button>
            <button
              onClick={() => setSelectedCategory('banquet-halls')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'banquet-halls' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'banquet-halls' ? 'white' : '#6b7280'
              }}
            >
              Banquet Halls
            </button>
            <button
              onClick={() => setSelectedCategory('outdoor-venues')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'outdoor-venues' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'outdoor-venues' ? 'white' : '#6b7280'
              }}
            >
              Outdoor Venues
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facilities Filter */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Facilities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {facilities.map(facility => (
                      <label key={facility} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFacilities.includes(facility)}
                          onChange={() => toggleFacility(facility)}
                          className="rounded"
                          style={{accentColor: '#755A7B'}}
                        />
                        <span className="text-sm text-gray-600">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Price Range (per day)</h3>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-600">Min Price</label>
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-600">Max Price</label>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500000])}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setSelectedFacilities([]);
                  setPriceRange([0, 500000]);
                }}
                className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredVendors.length}</span> venue{filteredVendors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Vendor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <div
              key={vendor.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push(`/services/venue-accommodation/${vendor.id}`)}
            >
              {/* Vendor Image */}
              <div className="relative h-48">
                <img
                  src={vendor.image}
                  alt={vendor.organizationName}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to favorites logic
                  }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <FaHeart className="text-gray-400 hover:text-red-500" />
                </button>
              </div>

              {/* Vendor Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{vendor.organizationName}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <FaMapMarkerAlt className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600">{vendor.location}</span>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {vendor.facilities.slice(0, 3).map(facility => (
                      <span
                        key={facility}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{backgroundColor: '#f3e8ff', color: '#755A7B'}}
                      >
                        {facility}
                      </span>
                    ))}
                    {vendor.facilities.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{vendor.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Starting from</p>
                    <p className="text-lg font-bold" style={{color: '#755A7B'}}>
                      Rs {vendor.minPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{vendor.packageCount} packages</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredVendors.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">No venues found matching your criteria</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSelectedFacilities([]);
                setPriceRange([0, 500000]);
              }}
              className="px-6 py-3 rounded-lg font-medium text-white"
              style={{backgroundColor: '#755A7B'}}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white" style={{backgroundColor: '#755A7B'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <li><Link href="/" className="text-purple-100 hover:text-white text-sm transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-purple-100 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-purple-100 hover:text-white text-sm transition-colors">Contact</Link></li>
                <li><Link href="/signup" className="text-purple-100 hover:text-white text-sm transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-purple-100 text-sm">Venue & Accommodation</span></li>
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
        </>
      )}
    </div>
  );
}
