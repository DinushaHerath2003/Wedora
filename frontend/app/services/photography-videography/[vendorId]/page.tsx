'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getBudgetStorageKeys, safeParseArray } from '@/lib/budget-storage';
import { addCartItem, getCartCount } from '@/lib/cart-storage';
import Toast, { ToastProps } from '@/components/Toast';
import { FaHeart, FaShoppingCart, FaCalculator, FaMapMarkerAlt, FaStar, FaCheck, FaArrowLeft, FaBookmark, FaRegBookmark, FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

type PhotoCategory = 'wedding-photography' | 'pre-wedding-shoots' | 'videography';

function normalizePhotoCategory(category: string | undefined): PhotoCategory | null {
  if (!category) return null;
  if (category === 'wedding-photography') return 'wedding-photography';
  if (category === 'pre-wedding-shoots' || category === 'pre-wedding-shoot') return 'pre-wedding-shoots';
  if (category === 'videography' || category === 'video') return 'videography';
  return null;
}

interface OfferingResponse {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number | string;
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
    description?: string;
  };
}

interface Package {
  id: string;
  vendorId: string;
  category: PhotoCategory;
  title: string;
  price: number;
  features: string[];
  photos: string[];
  stock?: number;
  discount?: string;
  discountType?: string;
  description?: string;
}

interface Vendor {
  id: string;
  name: string;
  organizationName: string;
  category: PhotoCategory[];
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  about: string;
  features: string[];
}

interface SavedPackage {
  packageId: string;
  vendorId: string;
  title: string;
  price: number;
  image: string;
  vendorName: string;
}

interface BudgetPackageDetail extends SavedPackage {
  category?: string;
  quantity?: number;
  href?: string;
  serviceSlug?: string;
}

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
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

export default function PhotographyVendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params?.vendorId as string;

  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'all'>('all');
  const [savedPackages, setSavedPackages] = useState<string[]>([]);
  const [budgetPackages, setBudgetPackages] = useState<string[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [reviewsByPackage, setReviewsByPackage] = useState<Record<string, PackageReview[]>>({});
  const [reviewForms, setReviewForms] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [selectedPackageForReview, setSelectedPackageForReview] = useState<Package | null>(null);

  // Mock vendor data
  const mockVendor: Vendor = {
    id: vendorId,
    name: 'Lens & Light Studios',
    organizationName: 'Lens & Light Studios',
    category: ['wedding-photography', 'videography'],
    location: 'Colombo, Sri Lanka',
    rating: 4.9,
    reviewCount: 156,
    image: '/ven1.png',
    about: 'Lens & Light Studios is a premier photography and videography service specializing in capturing your most precious moments. With over 15 years of experience, our team of professional photographers and videographers use state-of-the-art equipment to deliver stunning visual memories.',
    features: ['HD Photos', 'Album', 'Online Gallery', '4K Video', 'Drone Shots']
  };

  // Mock packages data
  const mockPackages: Package[] = [
    {
      id: '1',
      vendorId: vendorId,
      category: 'wedding-photography',
      title: 'Premium Wedding Photography',
      price: 85000,
      features: ['HD Photos', 'Album', 'Online Gallery', 'Edited Photos'],
      photos: ['/pack1.png'],
      stock: 8,
      discount: '10%',
      discountType: 'Early Bird',
      description: 'Comprehensive wedding photography package with high-quality edited photos and album.'
    },
    {
      id: '2',
      vendorId: vendorId,
      category: 'wedding-photography',
      title: 'Classic Wedding Package',
      price: 50000,
      features: ['HD Photos', 'Online Gallery', 'Edited Photos'],
      photos: ['/pack2.png'],
      stock: 12,
      description: 'Essential wedding photography coverage with professional editing and online gallery.'
    },
    {
      id: '3',
      vendorId: vendorId,
      category: 'videography',
      title: 'Cinematic Wedding Video',
      price: 95000,
      features: ['4K Video', 'Drone Shots', 'Same Day Edit', 'Highlight Reel'],
      photos: ['/pack3.png'],
      stock: 5,
      discount: '15%',
      discountType: 'Weekend Special',
      description: 'Professional 4K wedding videography with cinematic editing and drone footage.'
    },
    {
      id: '4',
      vendorId: vendorId,
      category: 'videography',
      title: 'Standard Video Coverage',
      price: 60000,
      features: ['4K Video', 'Highlight Reel', 'Raw Footage'],
      photos: ['/pack4.png'],
      stock: 10,
      description: 'Complete video coverage of your wedding day in stunning 4K quality.'
    },
    {
      id: '5',
      vendorId: vendorId,
      category: 'pre-wedding-shoots',
      title: 'Romantic Pre-Wedding Shoot',
      price: 35000,
      features: ['HD Photos', 'Location Scouting', 'Edited Photos', 'Online Gallery'],
      photos: ['/pack1.png'],
      stock: 15,
      description: 'Beautiful pre-wedding photography session at scenic locations.'
    },
    {
      id: '6',
      vendorId: vendorId,
      category: 'pre-wedding-shoots',
      title: 'Destination Pre-Wedding',
      price: 75000,
      features: ['HD Photos', 'Drone Shots', 'Album', 'Online Gallery', 'Travel Included'],
      photos: ['/pack2.png'],
      stock: 6,
      discount: '12%',
      discountType: 'Limited Offer',
      description: 'Exclusive destination shoot with drone coverage and premium album.'
    }
  ];

  const [vendor, setVendor] = useState<Vendor>(mockVendor);
  const [packages, setPackages] = useState<Package[]>(mockPackages);

  useEffect(() => {
    let currentUser: CustomerUser | null = null;

    // Load user from localStorage
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

    // Load saved packages from localStorage
    const saved = localStorage.getItem('savedPackages');
    if (saved) {
      setSavedPackages(JSON.parse(saved));
    }

    // Load budget packages from localStorage
    const budget = localStorage.getItem(getBudgetStorageKeys(currentUser).budgetPackages) || localStorage.getItem('budgetPackages');
    if (budget) {
      setBudgetPackages(JSON.parse(budget));
    }

    setCartCount(getCartCount());
    fetchVendorPackages();
  }, []);

  const getUserBudgetKeys = () => getBudgetStorageKeys(user);

  const fetchVendorPackages = async () => {
    try {
      setLoading(true);
      const [offerings, vendorReviews] = await Promise.all([
        apiFetch<OfferingResponse[]>(`/offerings?vendorId=${vendorId}`),
        apiFetch<PackageReview[]>(`/reviews?vendorId=${vendorId}`),
      ]);

      setReviewsByPackage(
        (vendorReviews || []).reduce<Record<string, PackageReview[]>>((groups, review) => {
          const key = review.offeringId.toString();
          groups[key] = [...(groups[key] || []), review];
          return groups;
        }, {})
      );

      const livePackages = offerings
        .flatMap((offering): Package[] => {
          const normalizedCategory = normalizePhotoCategory(offering.category);
          if (offering.isDraft || !normalizedCategory) return [];

          return [{
            id: offering.id.toString(),
            vendorId,
            category: normalizedCategory,
            title: offering.name,
            price: Number(offering.price) || 0,
            features: Array.isArray(offering.facilities) ? offering.facilities.filter(Boolean) : [],
            photos: Array.isArray(offering.images) && offering.images.length ? offering.images : ['/photography.png'],
            stock: offering.stock,
            discount: offering.discount,
            discountType: offering.discountType,
            description: offering.description,
          }];
        });

      if (livePackages.length) {
        const firstOffering = offerings.find((offering) => offering.vendor)?.vendor;
        const categories = Array.from(new Set(livePackages.map((pkg) => pkg.category)));
        const vendorFeatures = Array.from(new Set(livePackages.flatMap((pkg) => pkg.features)));
        const organizationName = firstOffering?.organizationName || firstOffering?.businessName || firstOffering?.name || 'Photography Vendor';

        setVendor({
          id: vendorId,
          name: organizationName,
          organizationName,
          category: categories,
          location: firstOffering?.location || 'Not specified',
          rating: 4.7,
          reviewCount: 0,
          image: livePackages[0].photos[0] || '/photography.png',
          about: firstOffering?.description || 'Professional photography and videography packages for weddings and special events.',
          features: vendorFeatures,
        });
        setPackages(livePackages);
      } else {
        setPackages([]);
        setVendor((current) => ({
          ...current,
          category: [],
          features: [],
        }));
      }
    } catch (error) {
      console.error('Failed to fetch photography vendor packages:', error);
      setVendor(mockVendor);
      setPackages(mockPackages);
    } finally {
      setLoading(false);
    }
  };

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
    const budgetKeys = getUserBudgetKeys();
    
    if (!budgetPackages.includes(pkg.id)) {
      const newBudgetPackages = [...budgetPackages, pkg.id];
      setBudgetPackages(newBudgetPackages);
      localStorage.setItem(budgetKeys.budgetPackages, JSON.stringify(newBudgetPackages));

      const canonicalBudgetItems = safeParseArray<BudgetItem>(localStorage.getItem(budgetKeys.budgetItems));
      canonicalBudgetItems.push({
        id: `pkg-${pkg.id}`,
        category: pkg.category,
        name: `${vendor.organizationName} - ${pkg.title}`,
        price: pkg.price,
        quantity: 1,
      });
      localStorage.setItem(budgetKeys.budgetItems, JSON.stringify(canonicalBudgetItems));

      // Save package details for budget calculator
      const budgetPackageDetails: BudgetPackageDetail[] = safeParseArray<BudgetPackageDetail>(localStorage.getItem(budgetKeys.budgetPackageDetails));
      budgetPackageDetails.push({
        packageId: pkg.id,
        vendorId: vendor.id,
        category: pkg.category,
        title: pkg.title,
        price: pkg.price,
        image: pkg.photos[0],
        vendorName: vendor.organizationName,
        quantity: 1,
        href: `/services/photography-videography/${vendor.id}`,
        serviceSlug: 'photography-videography',
      });
      localStorage.setItem(budgetKeys.budgetPackageDetails, JSON.stringify(budgetPackageDetails));

      setToast({ message: 'Package added to budget calculator.', type: 'success' });
    } else {
      setToast({ message: 'Package is already in your budget calculator.', type: 'error' });
    }
  };

  const handleAddToCart = (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCart = addCartItem({
      id: `photography-videography-${vendor.id}-${pkg.id}`,
      vendorId: vendor.id,
      vendorName: vendor.organizationName,
      packageName: pkg.title,
      category: pkg.category,
      price: calculateDiscountedPrice(pkg.price, pkg.discount),
      features: pkg.features,
      image: pkg.photos[0],
    });

    setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
    setToast({ message: `${pkg.title} added to cart.`, type: 'success' });
  };

  const getPackageReviews = (packageId: string) => reviewsByPackage[packageId] || [];

  const getAverageRating = (packageId: string) => {
    const packageReviews = getPackageReviews(packageId);
    if (packageReviews.length === 0) return 0;
    return packageReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / packageReviews.length;
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

  const handleSubmitReview = async (pkg: Package) => {
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

      const reviewWithUser: PackageReview = {
        ...created,
        user: {
          name: user.name,
          email: user.email,
        },
      };

      setReviewsByPackage((prev) => ({
        ...prev,
        [pkg.id]: [reviewWithUser, ...(prev[pkg.id] || [])],
      }));
      setReviewForms((prev) => ({
        ...prev,
        [pkg.id]: { rating: 5, comment: '' },
      }));
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

  const filteredPackages = selectedCategory === 'all'
    ? packages
    : packages.filter(pkg => pkg.category === selectedCategory);

  const calculateDiscountedPrice = (price: number, discount?: string) => {
    if (!discount) return price;
    const discountPercent = parseInt(discount.replace('%', ''));
    return price - (price * discountPercent / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-purple-100 border-t-purple-700 animate-spin" />
          <p className="text-gray-600 font-medium">Loading photographer packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
          <FaArrowLeft /> Back to Photographers
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
                <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.features.map(feature => (
                    <span
                      key={feature}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{backgroundColor: '#f3e8ff', color: '#755A7B'}}
                    >
                      <FaCheck className="inline mr-1" /> {feature}
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
          {vendor.category.includes('wedding-photography') && (
            <button
              onClick={() => setSelectedCategory('wedding-photography')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'wedding-photography' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'wedding-photography' ? 'white' : '#6b7280'
              }}
            >
              Wedding Photography
            </button>
          )}
          {vendor.category.includes('pre-wedding-shoots') && (
            <button
              onClick={() => setSelectedCategory('pre-wedding-shoots')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'pre-wedding-shoots' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'pre-wedding-shoots' ? 'white' : '#6b7280'
              }}
            >
              Pre-Wedding Shoots
            </button>
          )}
          {vendor.category.includes('videography') && (
            <button
              onClick={() => setSelectedCategory('videography')}
              className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedCategory === 'videography' ? '#755A7B' : '#f3f4f6',
                color: selectedCategory === 'videography' ? 'white' : '#6b7280'
              }}
            >
              Videography
            </button>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map(pkg => {
            const discountedPrice = calculateDiscountedPrice(pkg.price, pkg.discount);
            const isSaved = savedPackages.includes(pkg.id);
            const isInBudget = budgetPackages.includes(pkg.id);
            const packageReviews = getPackageReviews(pkg.id);
            const averageRating = getAverageRating(pkg.id);

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
                <div className="p-5 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{pkg.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <FaStar
                          key={index}
                          size={14}
                          style={{ color: index < Math.round(averageRating) ? '#fbbf24' : '#d1d5db' }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {averageRating ? averageRating.toFixed(1) : 'No ratings'}
                    </span>
                    <span className="text-xs text-gray-500">({packageReviews.length})</span>
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
                      {pkg.features.slice(0, 4).map(feature => (
                        <span
                          key={feature}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{backgroundColor: '#f3e8ff', color: '#755A7B'}}
                        >
                          {feature}
                        </span>
                      ))}
                      {pkg.features.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{pkg.features.length - 4} more
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
                        onClick={() => router.push(`/dashboard/photography/posted-packages/${pkg.id}`)}
                        className="px-4 py-2 rounded-lg font-medium border-2 transition-all hover:shadow-sm"
                        style={{ borderColor: '#755A7B', color: '#755A7B', backgroundColor: 'white' }}
                      >
                        See More
                      </button>
                      <button
                        onClick={() => setSelectedPackageForReview(pkg)}
                        className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: '#755A7B' }}
                      >
                        Reviews ({packageReviews.length})
                      </button>
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

      {/* Reviews Modal */}
      {selectedPackageForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Reviews for {selectedPackageForReview.title}</h3>
              <button
                onClick={() => setSelectedPackageForReview(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                aria-label="Close reviews"
              >
                x
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold" style={{color: '#755A7B'}}>
                        {getAverageRating(selectedPackageForReview.id).toFixed(1)}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, index) => (
                          <FaStar
                            key={index}
                            style={{ color: index < Math.round(getAverageRating(selectedPackageForReview.id)) ? '#fbbf24' : '#d1d5db' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <p className="text-2xl font-bold text-gray-800">{getPackageReviews(selectedPackageForReview.id).length}</p>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="font-semibold text-gray-800 mb-3">Write a Review</p>
                <p className="text-xs font-semibold text-gray-700 mb-3">Rate this package</p>

                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const reviewForm = reviewForms[selectedPackageForReview.id] || { rating: 5, comment: '' };
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateReviewForm(selectedPackageForReview.id, { rating: star })}
                        className="text-3xl transition-transform hover:scale-110"
                        aria-label={`${star} star rating`}
                      >
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
