'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { addCartItem, getCartCount } from '@/lib/cart-storage';
import { apiFetch } from '@/lib/api';
import {
  CeremonialCategory,
  CEREMONIAL_CATEGORY_LABELS,
  isCeremonialCategory,
  normalizeCeremonialCategory,
  resolveOfferingImage,
} from '@/lib/ceremonial-dashboard';
import { FaHeart, FaShoppingCart, FaCalculator, FaMapMarkerAlt, FaStar, FaCheck, FaArrowLeft, FaBookmark, FaRegBookmark, FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

interface Package {
  id: string;
  vendorId: string;
  category: CeremonialCategory;
  title: string;
  price: number;
  services: string[];
  photos: string[];
  stock?: number;
  discount?: string;
  discountType?: string;
  description?: string;
  duration?: string;
}

interface Vendor {
  id: string;
  name: string;
  organizationName: string;
  category: CeremonialCategory[];
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  about: string;
  services: string[];
}

interface SavedPackage {
  packageId: string;
  vendorId: string;
  title: string;
  price: number;
  image: string;
  vendorName: string;
}

export default function CeremonialVendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params?.vendorId as string;

  const [selectedCategory, setSelectedCategory] = useState<CeremonialCategory | 'all'>('all');
  const [savedPackages, setSavedPackages] = useState<string[]>([]);
  const [budgetPackages, setBudgetPackages] = useState<string[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<{name: string; email: string} | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Mock vendor data
  const mockVendor: Vendor = {
    id: vendorId,
    name: 'Traditional Wedding Specialists',
    organizationName: 'Traditional Wedding Specialists',
    category: ['poruwa-ceremony', 'religious-services'],
    location: 'Negombo, Sri Lanka',
    rating: 4.9,
    reviewCount: 189,
    image: '/ven1.png',
    about: 'Traditional Wedding Specialists brings over 20 years of experience in conducting authentic Sri Lankan wedding ceremonies. Our team of certified priests, experienced astrologers, and traditional musicians ensures every ritual is performed with precision and reverence, making your wedding day spiritually meaningful and culturally rich.',
    services: ['Horoscope Matching', 'Auspicious Times', 'Religious Rituals', 'Poruwa Ceremony', 'Traditional Music', 'Blessing Ceremonies']
  };

  // Mock packages data
  const mockPackages: Package[] = [
    {
      id: '1',
      vendorId: vendorId,
      category: 'poruwa-ceremony',
      title: 'Complete Astrological Package',
      price: 35000,
      services: ['Horoscope Matching', 'Auspicious Times', 'Blessing Ceremonies', 'Written Report'],
      photos: ['/pack1.png'],
      stock: 10,
      discount: '10%',
      discountType: 'Early Bird',
      description: 'Comprehensive astrological services including horoscope matching, auspicious time selection, and detailed written reports.',
      duration: '2-3 consultations'
    },
    {
      id: '2',
      vendorId: vendorId,
      category: 'poruwa-ceremony',
      title: 'Horoscope Matching Service',
      price: 15000,
      services: ['Horoscope Matching', 'Compatibility Report'],
      photos: ['/pack2.png'],
      stock: 15,
      description: 'Professional horoscope matching service with detailed compatibility analysis.',
      duration: '1 consultation'
    },
    {
      id: '3',
      vendorId: vendorId,
      category: 'religious-services',
      title: 'Traditional Poruwa Ceremony',
      price: 65000,
      services: ['Religious Rituals', 'Poruwa Ceremony', 'Traditional Music', 'Blessing Ceremonies'],
      photos: ['/pack3.png'],
      stock: 8,
      discount: '12%',
      discountType: 'Weekend Special',
      description: 'Complete traditional Poruwa ceremony with experienced priests and traditional musicians.',
      duration: '3-4 hours'
    },
    {
      id: '4',
      vendorId: vendorId,
      category: 'religious-services',
      title: 'Buddhist Wedding Rituals',
      price: 45000,
      services: ['Religious Rituals', 'Blessing Ceremonies', 'Traditional Music'],
      photos: ['/pack4.png'],
      stock: 12,
      description: 'Traditional Buddhist wedding rituals conducted by experienced priests.',
      duration: '2-3 hours'
    },
    {
      id: '5',
      vendorId: vendorId,
      category: 'cultural-events',
      title: 'Premium Traditional Package',
      price: 95000,
      services: ['Horoscope Matching', 'Religious Rituals', 'Poruwa Ceremony', 'Traditional Music', 'Blessing Ceremonies', 'Auspicious Times'],
      photos: ['/pack1.png'],
      stock: 5,
      discount: '15%',
      discountType: 'Limited Offer',
      description: 'Complete traditional wedding package including all ceremonies, astrological services, and traditional music.',
      duration: 'Full wedding day'
    },
    {
      id: '6',
      vendorId: vendorId,
      category: 'cultural-events',
      title: 'Traditional Music & Rituals',
      price: 55000,
      services: ['Traditional Music', 'Religious Rituals', 'Blessing Ceremonies'],
      photos: ['/pack2.png'],
      stock: 10,
      description: 'Traditional instrumental music and religious rituals for your wedding ceremony.',
      duration: '3-4 hours'
    }
  ];

  const [vendor, setVendor] = useState<Vendor>(mockVendor);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    // Load saved packages from localStorage
    const saved = localStorage.getItem('savedPackages');
    if (saved) {
      setSavedPackages(JSON.parse(saved));
    }

    // Load budget packages from localStorage
    const budget = localStorage.getItem('budgetPackages');
    if (budget) {
      setBudgetPackages(JSON.parse(budget));
    }

    // Load user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } else {
      // Demo user
      setUser({
        name: 'Demo User',
        email: 'demo@wedora.com'
      });
    }
    setCartCount(getCartCount());
  }, []);

  useEffect(() => {
    const fetchCeremonialVendorData = async () => {
      try {
        const vendorIdNum = Number(vendorId);
        const offerings = await apiFetch<any[]>(`/offerings?vendorId=${vendorIdNum}`);
        const ceremonialOfferings = (offerings || []).filter(
          (offering) => !offering.isDraft && isCeremonialCategory(offering.category),
        );

        if (ceremonialOfferings.length === 0) {
          setPackages([]);
          return;
        }

        const vendorData = ceremonialOfferings[0].vendor;
        const categories = new Set<CeremonialCategory>();
        const services = new Set<string>();

        ceremonialOfferings.forEach((offering) => {
          categories.add(normalizeCeremonialCategory(offering.category));
          if (Array.isArray(offering.facilities)) {
            offering.facilities.forEach((service: string) => services.add(service));
          }
        });

        setVendor({
          id: vendorIdNum.toString(),
          name: vendorData?.organizationName || 'Ceremonial Vendor',
          organizationName: vendorData?.organizationName || 'Ceremonial Vendor',
          category: Array.from(categories),
          location: vendorData?.location || 'Not specified',
          rating: 4.7,
          reviewCount: Math.floor(Math.random() * 200) + 50,
          image: resolveOfferingImage(ceremonialOfferings[0].images, '/poruwa.png'),
          about: `Ceremonial wedding services in ${vendorData?.location || 'Sri Lanka'}.`,
          services: Array.from(services),
        });

        setPackages(
          ceremonialOfferings.map((offering) => ({
            id: offering.id.toString(),
            vendorId: vendorIdNum.toString(),
            category: normalizeCeremonialCategory(offering.category),
            title: offering.name || 'Ceremonial Package',
            price: Number(offering.price) || 0,
            services: offering.facilities || [],
            photos: offering.images?.length ? offering.images : ['/poruwa.png'],
            stock: offering.stock,
            discount: offering.discount,
            discountType: offering.discountType,
            description: offering.description,
            duration: offering.roomType,
          })),
        );
      } catch (error) {
        console.error('Failed to fetch ceremonial vendor data:', error);
        setPackages([]);
      }
    };

    if (vendorId) {
      fetchCeremonialVendorData();
    }
  }, [vendorId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const toggleSavePackage = (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newSavedPackages = savedPackages.includes(pkg.id)
      ? savedPackages.filter(id => id !== pkg.id)
      : [...savedPackages, pkg.id];
    
    setSavedPackages(newSavedPackages);
    localStorage.setItem('savedPackages', JSON.stringify(newSavedPackages));

    // Also save package details for later retrieval
    if (!savedPackages.includes(pkg.id)) {
      const savedPackageDetails: SavedPackage[] = JSON.parse(localStorage.getItem('savedPackageDetails') || '[]');
      savedPackageDetails.push({
        packageId: pkg.id,
        vendorId: vendor.id,
        title: pkg.title,
        price: pkg.price,
        image: pkg.photos[0],
        vendorName: vendor.organizationName
      });
      localStorage.setItem('savedPackageDetails', JSON.stringify(savedPackageDetails));
    }
  };

  const addToBudgetCalculator = (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!budgetPackages.includes(pkg.id)) {
      const newBudgetPackages = [...budgetPackages, pkg.id];
      setBudgetPackages(newBudgetPackages);
      localStorage.setItem('budgetPackages', JSON.stringify(newBudgetPackages));

      // Save package details for budget calculator
      const budgetPackageDetails: SavedPackage[] = JSON.parse(localStorage.getItem('budgetPackageDetails') || '[]');
      budgetPackageDetails.push({
        packageId: pkg.id,
        vendorId: vendor.id,
        title: pkg.title,
        price: pkg.price,
        image: pkg.photos[0],
        vendorName: vendor.organizationName
      });
      localStorage.setItem('budgetPackageDetails', JSON.stringify(budgetPackageDetails));

      alert('Package added to budget calculator!');
    } else {
      alert('Package already in budget calculator!');
    }
  };

  const handleAddToCart = (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCart = addCartItem({
      id: `ceremonial-${vendor.id}-${pkg.id}`,
      vendorId: vendor.id,
      vendorName: vendor.organizationName,
      packageName: pkg.title,
      category: pkg.category,
      price: calculateDiscountedPrice(pkg.price, pkg.discount),
      features: pkg.services,
      image: pkg.photos[0],
    });

    setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
    alert(`${pkg.title} added to cart!`);
  };

  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter(pkg => pkg.category === selectedCategory);

  const calculateDiscountedPrice = (price: number, discount?: string) => {
    if (!discount) return price;
    const discountPercent = parseInt(discount.replace('%', ''));
    return price - (price * discountPercent / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm sticky top-0" style={{backgroundColor: '#755A7B', zIndex: 100}}>
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
                  <div 
                    className="fixed inset-0" 
                    style={{zIndex: 999}}
                    onClick={() => setShowServicesDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2" style={{zIndex: 1000}}>
                    <Link
                      href="/services/venue-accommodation"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Venue & Accommodation
                    </Link>
                    <Link
                      href="/services/photography-videography"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Photography & Videography
                    </Link>
                    <Link
                      href="/services/fashion-beauty"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Fashion & Beauty
                    </Link>
                    <Link
                      href="/services/entertainment"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Entertainment
                    </Link>
                    <Link
                      href="/services/transportation"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Transportation
                    </Link>
                    <Link
                      href="/services/ceremonial"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Ceremonial Services
                    </Link>
                    <Link
                      href="/services/cake-decoration"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Cake Decoration
                    </Link>
                    <Link
                      href="/services/gifting-souvenirs"
                      className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors"
                      style={{color: '#755A7B'}}
                      onClick={() => setShowServicesDropdown(false)}
                    >
                      Gifting & Souvenirs
                    </Link>
                  </div>
                </>
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

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          <FaArrowLeft /> Back to Ceremonial Services
        </button>
      </div>

      {/* Vendor Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={vendor.image}
              alt={vendor.organizationName}
              className="w-full md:w-64 h-64 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{vendor.organizationName}</h1>
              
              <div className="flex items-center gap-2 mb-3">
                <FaMapMarkerAlt className="text-gray-400" />
                <span className="text-gray-600">{vendor.location}</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <FaStar style={{color: '#FFD700'}} />
                  <span className="font-semibold text-gray-800 text-lg">{vendor.rating}</span>
                </div>
                <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
              </div>

              <p className="text-gray-600 mb-4">{vendor.about}</p>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.services.map(service => (
                    <span
                      key={service}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{backgroundColor: '#f3e8ff', color: '#755A7B'}}
                    >
                      <FaCheck className="inline mr-1" /> {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Packages</h2>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: selectedCategory === 'all' ? '#755A7B' : '#f3f4f6',
              color: selectedCategory === 'all' ? 'white' : '#6b7280'
            }}
          >
            All Packages
          </button>
          {vendor.category.includes('poruwa-ceremony') && (
            <button
              onClick={() => setSelectedCategory('poruwa-ceremony')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'poruwa-ceremony' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'poruwa-ceremony' ? 'white' : '#6b7280'
              }}
            >
              {CEREMONIAL_CATEGORY_LABELS['poruwa-ceremony']}
            </button>
          )}
          {vendor.category.includes('religious-services') && (
            <button
              onClick={() => setSelectedCategory('religious-services')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'religious-services' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'religious-services' ? 'white' : '#6b7280'
              }}
            >
              {CEREMONIAL_CATEGORY_LABELS['religious-services']}
            </button>
          )}
          {vendor.category.includes('cultural-events') && (
            <button
              onClick={() => setSelectedCategory('cultural-events')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'cultural-events' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'cultural-events' ? 'white' : '#6b7280'
              }}
            >
              {CEREMONIAL_CATEGORY_LABELS['cultural-events']}
            </button>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => {
            const discountedPrice = calculateDiscountedPrice(pkg.price, pkg.discount);
            const isSaved = savedPackages.includes(pkg.id);
            const isInBudget = budgetPackages.includes(pkg.id);

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Package Image */}
                <div className="relative h-48">
                  <img
                    src={pkg.photos[0]}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                  />
                  {pkg.discount && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-bold" style={{backgroundColor: '#755A7B'}}>
                      {pkg.discount} OFF
                    </div>
                  )}
                  <button
                    onClick={(e) => toggleSavePackage(pkg, e)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    {isSaved ? (
                      <FaBookmark style={{color: '#755A7B'}} />
                    ) : (
                      <FaRegBookmark className="text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Package Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{pkg.title}</h3>
                  
                  {pkg.description && (
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                  )}

                  {pkg.duration && (
                    <p className="text-xs text-gray-500 mb-2">
                      ⏱️ Duration: {pkg.duration}
                    </p>
                  )}

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {pkg.services.slice(0, 4).map(service => (
                        <span
                          key={service}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{backgroundColor: '#f3e8ff', color: '#755A7B'}}
                        >
                          {service}
                        </span>
                      ))}
                      {pkg.services.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{pkg.services.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {pkg.stock && (
                    <p className="text-sm text-gray-500 mb-3">
                      {pkg.stock} available
                    </p>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="mb-3">
                      {pkg.discount ? (
                        <>
                          <p className="text-sm text-gray-400 line-through">
                            Rs {pkg.price.toLocaleString()}
                          </p>
                          <p className="text-xl font-bold" style={{color: '#755A7B'}}>
                            Rs {discountedPrice.toLocaleString()}
                          </p>
                          {pkg.discountType && (
                            <p className="text-xs" style={{color: '#755A7B'}}>
                              {pkg.discountType}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xl font-bold" style={{color: '#755A7B'}}>
                          Rs {pkg.price.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={(e) => handleAddToCart(pkg, e)}
                        className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: '#755A7B' }}
                      >
                        <FaShoppingCart className="inline mr-1" /> Add to Cart
                      </button>
                      <button
                        onClick={(e) => addToBudgetCalculator(pkg, e)}
                        disabled={isInBudget}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
                          isInBudget ? 'bg-green-500 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                        style={{backgroundColor: isInBudget ? '#10b981' : '#755A7B'}}
                      >
                        {isInBudget ? (
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
              </div>
            );
          })}
        </div>

        {/* No Packages */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No packages available in this category</p>
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
    </div>
  );
}
