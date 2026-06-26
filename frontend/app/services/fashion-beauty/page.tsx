'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getBudgetStorageKeys, safeParseArray } from '@/lib/budget-storage';
import { addCartItem, getCartCount } from '@/lib/cart-storage';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaSearch, FaFilter, FaMapMarkerAlt, FaStar, FaShoppingCart, FaCalculator, FaChevronDown, FaUserCircle, FaSignOutAlt, FaCheck } from 'react-icons/fa';

type BeautyCategory = 'bridal-makeup' | 'hair-styling' | 'traditional-dressing';

function normalizeBeautyCategory(category: string | undefined): BeautyCategory | null {
  if (!category) return null;
  if (category === 'bridal-makeup') return 'bridal-makeup';
  if (category === 'hair-styling' || category === 'hair-style') return 'hair-styling';
  if (category === 'traditional-dressing' || category === 'traditional-dress') return 'traditional-dressing';
  return null;
}

interface OfferingResponse {
  id: number;
  name: string;
  description?: string;
  price: number | string;
  category: string;
  facilities?: string[];
  images?: string[];
  stock?: number;
  discount?: string;
  discountType?: string;
  isDraft?: boolean;
  vendor?: {
    id: number;
    organizationName?: string;
    businessName?: string;
    name?: string;
    location?: string;
  };
}

interface Vendor {
  id: string;
  name: string;
  organizationName: string;
  category: BeautyCategory[];
  location: string;
  rating: number;
  reviewCount: number;
  minPrice: number;
  maxPrice: number;
  image: string;
  packageCount: number;
  services: string[];
}

interface DisplayPackage {
  id: string;
  vendorId: string;
  vendorName: string;
  category: BeautyCategory;
  location: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  services: string[];
  stock?: number;
  discount?: string;
  discountType?: string;
}

interface CustomerUser {
  id?: string | number;
  name: string;
  email: string;
  role?: string;
}

interface PackageReview {
  id: number;
  userId: string;
  offeringId: number;
  vendorId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

interface BudgetPackageDetail {
  packageId: string;
  vendorId: string;
  category?: string;
  title: string;
  price: number;
  image: string;
  vendorName: string;
  quantity?: number;
}

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
}

export default function FashionBeautyServices() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<BeautyCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [packages, setPackages] = useState<DisplayPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<string[]>(['Bridal Makeup', 'Airbrush Makeup', 'Hair Styling', 'Saree Draping', 'Hair Extensions', 'Traditional Dressing', 'Pre-Wedding Trial']);
  const [cartCount, setCartCount] = useState(0);
  const [budgetPackages, setBudgetPackages] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [reviewsByPackage, setReviewsByPackage] = useState<Record<string, PackageReview[]>>({});
  const [reviewForms, setReviewForms] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [selectedPackageForReview, setSelectedPackageForReview] = useState<DisplayPackage | null>(null);

  // Mock vendor data
  const mockVendors: Vendor[] = [
    {
      id: '1',
      name: 'Glamour Bridal Studio',
      organizationName: 'Glamour Bridal Studio',
      category: ['bridal-makeup', 'hair-styling'],
      location: 'Colombo, Sri Lanka',
      rating: 4.9,
      reviewCount: 178,
      minPrice: 28000,
      maxPrice: 75000,
      image: '/ven1.png',
      packageCount: 6,
      services: ['Bridal Makeup', 'Airbrush Makeup', 'Hair Styling', 'Saree Draping']
    },
    {
      id: '2',
      name: 'Elegance Beauty Lounge',
      organizationName: 'Elegance Beauty Lounge',
      category: ['bridal-makeup', 'traditional-dressing'],
      location: 'Kandy, Sri Lanka',
      rating: 4.8,
      reviewCount: 145,
      minPrice: 15000,
      maxPrice: 45000,
      image: '/ven2.png',
      packageCount: 5,
      services: ['Bridal Makeup', 'Traditional Dressing', 'Hair Styling']
    },
    {
      id: '3',
      name: 'Divine Hair Studio',
      organizationName: 'Divine Hair Studio',
      category: ['hair-styling'],
      location: 'Galle, Sri Lanka',
      rating: 4.7,
      reviewCount: 98,
      minPrice: 12000,
      maxPrice: 35000,
      image: '/ven3.png',
      packageCount: 4,
      services: ['Hair Styling', 'Hair Extensions', 'Hair Treatment']
    },
    {
      id: '4',
      name: 'Radiance Bridal Services',
      organizationName: 'Radiance Bridal Services',
      category: ['bridal-makeup', 'hair-styling', 'traditional-dressing'],
      location: 'Negombo, Sri Lanka',
      rating: 4.6,
      reviewCount: 112,
      minPrice: 20000,
      maxPrice: 60000,
      image: '/ven1.png',
      packageCount: 8,
      services: ['Bridal Makeup', 'Hair Styling', 'Saree Draping', 'Pre-Wedding Trial']
    }
  ];

  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    let currentUser: CustomerUser | null = null;
    const userStr = localStorage.getItem('user');
    if (userStr) {
      currentUser = JSON.parse(userStr) as CustomerUser;
      setUser(currentUser);
    } else {
      currentUser = {
        name: 'Demo User',
        email: 'demo@wedora.com'
      };
      setUser(currentUser);
    }

    const budget = localStorage.getItem(getBudgetStorageKeys(currentUser).budgetPackages) || localStorage.getItem('budgetPackages');
    if (budget) {
      setBudgetPackages(safeParseArray<string>(budget));
    }
    setCartCount(getCartCount());
    fetchBeautyOfferings();
  }, []);

  const fetchBeautyOfferings = async () => {
    try {
      setLoading(true);
      const [offerings, reviews] = await Promise.all([
        apiFetch<OfferingResponse[]>('/offerings'),
        apiFetch<PackageReview[]>('/reviews'),
      ]);

      const vendorMap = new Map<number, {
        id: string;
        organizationName: string;
        location: string;
        categories: Set<BeautyCategory>;
        offerings: OfferingResponse[];
        allServices: Set<string>;
      }>();
      const allServices = new Set<string>();
      const displayPackages: DisplayPackage[] = [];
      const reviewGroups = (reviews || []).reduce<Record<string, PackageReview[]>>((groups, review) => {
        const key = review.offeringId.toString();
        groups[key] = [...(groups[key] || []), review];
        return groups;
      }, {});

      offerings.forEach((offering) => {
        const normalizedCategory = normalizeBeautyCategory(offering.category);
        if (offering.isDraft || !offering.vendor || !normalizedCategory) return;

        const vendorId = offering.vendor.id;
        const organizationName = offering.vendor.organizationName || offering.vendor.businessName || offering.vendor.name || 'Beauty Vendor';
        const packageServices = Array.isArray(offering.facilities) ? offering.facilities.filter(Boolean) : [];
        const packageImage = Array.isArray(offering.images) && offering.images.length ? offering.images[0] : '/saloon.png';

        if (!vendorMap.has(vendorId)) {
          vendorMap.set(vendorId, {
            id: vendorId.toString(),
            organizationName,
            location: offering.vendor.location || 'Not specified',
            categories: new Set<BeautyCategory>(),
            offerings: [],
            allServices: new Set<string>(),
          });
        }

        displayPackages.push({
          id: offering.id.toString(),
          vendorId: vendorId.toString(),
          vendorName: organizationName,
          category: normalizedCategory,
          location: offering.vendor.location || 'Not specified',
          title: offering.name,
          description: offering.description,
          price: Number(offering.price) || 0,
          image: packageImage,
          services: packageServices,
          stock: offering.stock,
          discount: offering.discount,
          discountType: offering.discountType,
        });

        const vendorData = vendorMap.get(vendorId)!;
        vendorData.offerings.push(offering);
        vendorData.categories.add(normalizedCategory);
        packageServices.forEach((service) => {
          vendorData.allServices.add(service);
          allServices.add(service);
        });
      });

      const displayVendors: Vendor[] = Array.from(vendorMap.values()).map((vendorData) => {
        const prices = vendorData.offerings.map((offering) => Number(offering.price) || 0).filter((price) => price > 0);
        const firstImage = vendorData.offerings.flatMap((offering) => offering.images || []).find(Boolean);

        return {
          id: vendorData.id,
          name: vendorData.organizationName,
          organizationName: vendorData.organizationName,
          category: Array.from(vendorData.categories),
          location: vendorData.location,
          rating: 4.7,
          reviewCount: 0,
          minPrice: prices.length ? Math.min(...prices) : 0,
          maxPrice: prices.length ? Math.max(...prices) : 100000,
          image: firstImage || '/saloon.png',
          packageCount: vendorData.offerings.length,
          services: Array.from(vendorData.allServices),
        };
      });

      setVendors(displayVendors);
      setPackages(displayPackages);
      setReviewsByPackage(reviewGroups);
      setServices(allServices.size ? Array.from(allServices).slice(0, 10) : services);
    } catch (error) {
      console.error('Failed to fetch fashion beauty offerings:', error);
      setVendors(mockVendors);
      setPackages([]);
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
    if (selectedCategory !== 'all' && !vendor.category.includes(selectedCategory)) {
      return false;
    }
    if (searchQuery && !vendor.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !vendor.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedServices.length > 0 && !selectedServices.every(s => vendor.services.includes(s))) {
      return false;
    }
    if (vendor.minPrice > priceRange[1] || vendor.maxPrice < priceRange[0]) {
      return false;
    }
    return true;
  });

  const filteredPackages = packages.filter(pkg => {
    if (selectedCategory !== 'all' && pkg.category !== selectedCategory) return false;
    if (searchQuery && !pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pkg.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pkg.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedServices.length > 0 && !selectedServices.every(s => pkg.services.includes(s))) return false;
    if (pkg.price < priceRange[0] || pkg.price > priceRange[1]) return false;
    return true;
  });

  const getUserBudgetKeys = () => getBudgetStorageKeys(user);
  const getPackageReviews = (packageId: string) => reviewsByPackage[packageId] || [];

  const calculateDiscountedPrice = (price: number, discount?: string) => {
    if (!discount) return price;
    const discountPercent = parseInt(discount.replace('%', ''));
    return Number.isFinite(discountPercent) ? price - (price * discountPercent / 100) : price;
  };

  const addToBudgetCalculator = (pkg: DisplayPackage) => {
    const budgetKeys = getUserBudgetKeys();

    if (budgetPackages.includes(pkg.id)) {
      setToast({ message: 'Package is already in your budget calculator.', type: 'error' });
      return;
    }

    const nextBudgetPackages = [...budgetPackages, pkg.id];
    setBudgetPackages(nextBudgetPackages);
    localStorage.setItem(budgetKeys.budgetPackages, JSON.stringify(nextBudgetPackages));

    const budgetItems = safeParseArray<BudgetItem>(localStorage.getItem(budgetKeys.budgetItems));
    budgetItems.push({
      id: `pkg-${pkg.id}`,
      category: pkg.category,
      name: `${pkg.vendorName} - ${pkg.title}`,
      price: calculateDiscountedPrice(pkg.price, pkg.discount),
      quantity: 1,
    });
    localStorage.setItem(budgetKeys.budgetItems, JSON.stringify(budgetItems));

    const budgetPackageDetails = safeParseArray<BudgetPackageDetail>(localStorage.getItem(budgetKeys.budgetPackageDetails));
    budgetPackageDetails.push({
      packageId: pkg.id,
      vendorId: pkg.vendorId,
      category: pkg.category,
      title: pkg.title,
      price: calculateDiscountedPrice(pkg.price, pkg.discount),
      image: pkg.image,
      vendorName: pkg.vendorName,
      quantity: 1,
    });
    localStorage.setItem(budgetKeys.budgetPackageDetails, JSON.stringify(budgetPackageDetails));

    setToast({ message: 'Package added to budget calculator.', type: 'success' });
  };

  const handleAddToCart = (pkg: DisplayPackage) => {
    const updatedCart = addCartItem({
      id: `fashion-beauty-${pkg.vendorId}-${pkg.id}`,
      vendorId: pkg.vendorId,
      vendorName: pkg.vendorName,
      packageName: pkg.title,
      category: pkg.category,
      price: calculateDiscountedPrice(pkg.price, pkg.discount),
      features: pkg.services,
      image: pkg.image,
    });

    setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
    setToast({ message: `${pkg.title} added to cart.`, type: 'success' });
  };

  const updateReviewForm = (packageId: string, changes: Partial<{ rating: number; comment: string }>) => {
    setReviewForms((prev) => ({
      ...prev,
      [packageId]: {
        rating: prev[packageId]?.rating || 5,
        comment: prev[packageId]?.comment || '',
        ...changes,
      },
    }));
  };

  const handleSubmitReview = async (pkg: DisplayPackage) => {
    const form = reviewForms[pkg.id] || { rating: 5, comment: '' };

    if (!user?.id) {
      setToast({ message: 'Please log in as a customer before writing a review.', type: 'error' });
      return;
    }

    if (user.role === 'vendor') {
      setToast({ message: 'Vendor accounts can view reviews, but customer accounts should submit them.', type: 'error' });
      return;
    }

    if (!form.comment.trim()) {
      setToast({ message: 'Please write a short review before submitting.', type: 'error' });
      return;
    }

    try {
      setSubmittingReviewId(pkg.id);
      const created = await apiFetch<PackageReview>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          userId: String(user.id),
          offeringId: Number(pkg.id),
          vendorId: Number(pkg.vendorId),
          rating: form.rating,
          comment: form.comment.trim(),
        }),
      });

      setReviewsByPackage((prev) => ({
        ...prev,
        [pkg.id]: [{ ...created, user: { name: user.name, email: user.email } }, ...(prev[pkg.id] || [])],
      }));
      setReviewForms((prev) => ({ ...prev, [pkg.id]: { rating: 5, comment: '' } }));
      setToast({ message: 'Review submitted successfully.', type: 'success' });
    } catch (error) {
      console.error('Failed to submit review', error);
      setToast({
        message: `Unable to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setSubmittingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-purple-100 border-t-purple-700 animate-spin" />
          <p className="text-gray-600 font-medium">Loading beauty packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="shadow-sm sticky top-0 z-50" style={{backgroundColor: '#755A7B'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
            <h1 className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h1>
          </Link>
          <nav className="flex items-center gap-4">
            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80 flex items-center gap-2"
              >
                Services <FaChevronDown className="text-sm" />
              </button>
              
              {showServicesDropdown && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 999 }} onClick={() => setShowServicesDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2" style={{ zIndex: 1000 }}>
                    <Link href="/services/venue-accommodation" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Venue & Accommodation</Link>
                    <Link href="/services/photography-videography" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Photography & Videography</Link>
                    <Link href="/services/fashion-beauty" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Fashion & Beauty</Link>
                    <Link href="/services/entertainment" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Entertainment</Link>
                    <Link href="/services/transportation" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Transportation</Link>
                    <Link href="/services/ceremonial" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Ceremonial Services</Link>
                    <Link href="/services/cake-decoration" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Cake Decoration</Link>
                    <Link href="/services/gifting-souvenirs" onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>Gifting & Souvenirs</Link>
                  </div>
                </>
              )}
            </div>

            <Link href="/budget-calculator" className="p-2 rounded-full hover:bg-purple-700" title="Budget Calculator">
              <FaCalculator className="text-xl text-white" />
            </Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-purple-700 relative" title="Cart">
              <FaShoppingCart className="text-xl text-white" />
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{backgroundColor: '#ff4444'}}>{cartCount}</span>
            </Link>

            {user && (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-purple-400">
                <FaUserCircle className="text-3xl text-white" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-purple-200">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="px-3 py-2 rounded-lg border-2 border-white hover:bg-white hover:bg-opacity-20 flex items-center gap-2 font-medium transition-colors text-white">
                  <FaSignOutAlt className="text-lg" /> Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-64 overflow-hidden">
        <img src="/saloon.png" alt="Photography & Videography" className="w-full h-full object-cover" />
        <div className="absolute inset-0bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4" style={{fontFamily: 'var(--font-season)'}}>Fashion & Beauty</h1>
            <p className="text-lg">Look stunning on your special day with expert beauty professionals</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by beauty service or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 text-white transition-colors" style={{backgroundColor: '#755A7B'}}>
              <FaFilter /> Filters
            </button>
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => setSelectedCategory('all')} className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all" style={{backgroundColor: selectedCategory === 'all' ? '#755A7B' : '#f3f4f6', color: selectedCategory === 'all' ? 'white' : '#6b7280'}}>All Services</button>
            <button onClick={() => setSelectedCategory('bridal-makeup')} className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all" style={{backgroundColor: selectedCategory === 'bridal-makeup' ? '#755A7B' : '#f3f4f6', color: selectedCategory === 'bridal-makeup' ? 'white' : '#6b7280'}}>Bridal Makeup</button>
            <button onClick={() => setSelectedCategory('hair-styling')} className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all" style={{backgroundColor: selectedCategory === 'hair-styling' ? '#755A7B' : '#f3f4f6', color: selectedCategory === 'hair-styling' ? 'white' : '#6b7280'}}>Hair Styling</button>
            <button onClick={() => setSelectedCategory('traditional-dressing')} className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all" style={{backgroundColor: selectedCategory === 'traditional-dressing' ? '#755A7B' : '#f3f4f6', color: selectedCategory === 'traditional-dressing' ? 'white' : '#6b7280'}}>Traditional Dressing</button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Services</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map(service => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={selectedServices.includes(service)} onChange={() => toggleService(service)} className="rounded" style={{accentColor: '#755A7B'}} />
                        <span className="text-sm text-gray-600">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-600">Min Price</label>
                        <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-600">Max Price</label>
                        <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setSelectedServices([]); setPriceRange([0, 100000]); }} className="mt-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Clear All Filters</button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">Showing <span className="font-semibold">{filteredPackages.length}</span> beauty package{filteredPackages.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                {pkg.discount && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-bold" style={{backgroundColor: '#755A7B'}}>
                    {pkg.discount} OFF
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); }} className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <FaHeart className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{pkg.title}</h3>
                <p className="text-sm font-semibold mb-2" style={{color: '#755A7B'}}>{pkg.vendorName}</p>
                <div className="flex items-center gap-1 mb-2">
                  <FaMapMarkerAlt className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600">{pkg.location}</span>
                </div>
                {pkg.description && (
                  <p
                    className="text-sm text-gray-600 mb-3 overflow-hidden"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {pkg.description}
                  </p>
                )}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {pkg.services.slice(0, 3).map(service => (
                      <span key={service} className="px-2 py-1 text-xs rounded-full" style={{backgroundColor: '#f3e8ff', color: '#755A7B'}}>{service}</span>
                    ))}
                    {pkg.services.length > 3 && <span className="px-2 py-1 text-xs text-gray-500">+{pkg.services.length - 3} more</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Package price</p>
                    <p className="text-lg font-bold" style={{color: '#755A7B'}}>Rs {pkg.price.toLocaleString()}</p>
                  </div>
                  {pkg.stock !== undefined && <p className="text-xs text-gray-500">{pkg.stock} available</p>}
                </div>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  <button
                    onClick={() => router.push(`/dashboard/fashion-beauty/posted-packages/${pkg.id}`)}
                    className="px-3 py-2 rounded-lg font-medium border-2 transition-all hover:shadow-sm"
                    style={{ borderColor: '#755A7B', color: '#755A7B', backgroundColor: 'white' }}
                  >
                    See More
                  </button>
                  <button
                    onClick={() => setSelectedPackageForReview(pkg)}
                    className="px-3 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#755A7B' }}
                  >
                    Reviews ({getPackageReviews(pkg.id).length})
                  </button>
                  <button
                    onClick={() => handleAddToCart(pkg)}
                    className="px-3 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#755A7B' }}
                  >
                    <FaShoppingCart className="inline mr-1" /> Add to Cart
                  </button>
                  <button
                    onClick={() => addToBudgetCalculator(pkg)}
                    disabled={budgetPackages.includes(pkg.id)}
                    className={`px-3 py-2 rounded-lg font-medium text-white transition-all ${
                      budgetPackages.includes(pkg.id) ? 'bg-green-500 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                    style={{backgroundColor: budgetPackages.includes(pkg.id) ? '#10b981' : '#755A7B'}}
                  >
                    {budgetPackages.includes(pkg.id) ? (
                      <>
                        <FaCheck className="inline mr-1" /> In Budget
                      </>
                    ) : (
                      <>
                        <FaCalculator className="inline mr-1" /> Add to Budget
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-4">No beauty packages found matching your criteria</p>
            <button onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setSelectedServices([]); setPriceRange([0, 100000]); }} className="px-6 py-3 rounded-lg font-medium text-white" style={{backgroundColor: '#755A7B'}}>Clear Filters</button>
          </div>
        )}
      </div>

      {selectedPackageForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Reviews for {selectedPackageForReview.title}</h3>
              <button onClick={() => setSelectedPackageForReview(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold" aria-label="Close reviews">
                x
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="font-semibold text-gray-800 mb-3">Write a Review</p>
                <p className="text-xs font-semibold text-gray-700 mb-3">Rate this package</p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const reviewForm = reviewForms[selectedPackageForReview.id] || { rating: 5, comment: '' };
                    return (
                      <button key={star} type="button" onClick={() => updateReviewForm(selectedPackageForReview.id, { rating: star })} className="text-3xl transition-transform hover:scale-110" aria-label={`${star} star rating`}>
                        <FaStar style={{ color: star <= reviewForm.rating ? '#fbbf24' : '#d1d5db' }} />
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const reviewForm = reviewForms[selectedPackageForReview.id] || { rating: 5, comment: '' };
                  return (
                    <>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => updateReviewForm(selectedPackageForReview.id, { comment: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 placeholder-gray-400 mb-3"
                        placeholder="Share your experience with this package..."
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmitReview(selectedPackageForReview)}
                        disabled={submittingReviewId === selectedPackageForReview.id}
                        className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
                        style={{ backgroundColor: '#755A7B' }}
                      >
                        {submittingReviewId === selectedPackageForReview.id ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </>
                  );
                })()}
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Customer Reviews</h4>
                <div className="space-y-4">
                  {getPackageReviews(selectedPackageForReview.id).length > 0 ? (
                    getPackageReviews(selectedPackageForReview.id).map((review) => (
                      <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">{review.user?.name || review.user?.email || 'Customer'}</p>
                            <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, index) => (
                              <FaStar key={index} size={14} style={{ color: index < review.rating ? '#fbbf24' : '#d1d5db' }} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{review.comment || 'No comment provided.'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                      <p className="text-gray-500">No reviews yet. Be the first to review this package.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white" style={{backgroundColor: '#755A7B'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
                <h3 className="text-xl font-bold text-white" style={{fontFamily: 'var(--font-season)'}}>Wedora</h3>
              </div>
              <p className="text-purple-100 text-sm">Your trusted partner in creating unforgettable wedding experiences.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-purple-100 hover:text-white text-sm transition-colors">Home</Link></li>
                <li><Link href="/about" className="text-purple-100 hover:text-white text-sm transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-purple-100 hover:text-white text-sm transition-colors">Contact</Link></li>
                <li><Link href="/signup" className="text-purple-100 hover:text-white text-sm transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><span className="text-purple-100 text-sm">Venue & Accommodation</span></li>
                <li><span className="text-purple-100 text-sm">Photography</span></li>
                <li><span className="text-purple-100 text-sm">Fashion & Beauty</span></li>
                <li><span className="text-purple-100 text-sm">Entertainment</span></li>
              </ul>
            </div>
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
  );
}
