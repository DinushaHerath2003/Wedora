'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { getBudgetStorageKeys, safeParseArray } from '@/lib/budget-storage';
import { addCartItem, getCartCount } from '@/lib/cart-storage';
import Toast, { ToastProps } from '@/components/Toast';
import { FaCalculator, FaCheck, FaChevronDown, FaHeart, FaMapMarkerAlt, FaRegBookmark, FaShoppingCart, FaSignOutAlt, FaStar, FaUserCircle } from 'react-icons/fa';

type GiftCategory = 'wedding-favors' | 'gift-boxes' | 'custom-souvenirs';

function normalizeGiftCategory(category?: string): GiftCategory | null {
  if (!category) return null;
  if (category === 'wedding-favors') return 'wedding-favors';
  if (category === 'gift-boxes' || category === 'return-gifts') return 'gift-boxes';
  if (category === 'custom-souvenirs' || category === 'personalized-items') return 'custom-souvenirs';
  return null;
}

function categoryLabel(category: GiftCategory) {
  if (category === 'wedding-favors') return 'Wedding Favors';
  if (category === 'gift-boxes') return 'Gift Boxes';
  return 'Custom Souvenirs';
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
  category: GiftCategory;
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
  category: GiftCategory[];
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  about: string;
  features: string[];
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

const emptyVendor = (vendorId: string): Vendor => ({
  id: vendorId,
  name: 'Gifting Vendor',
  organizationName: 'Gifting Vendor',
  category: [],
  location: 'Not specified',
  rating: 4.7,
  reviewCount: 0,
  image: '/gift.png',
  about: 'Professional gifting and souvenir packages for weddings and special events.',
  features: [],
});

export default function GiftVendorDetail() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params?.vendorId as string;

  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | 'all'>('all');
  const [savedPackages, setSavedPackages] = useState<string[]>([]);
  const [budgetPackages, setBudgetPackages] = useState<string[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [vendor, setVendor] = useState<Vendor>(() => emptyVendor(vendorId));
  const [packages, setPackages] = useState<Package[]>([]);
  const [reviewsByPackage, setReviewsByPackage] = useState<Record<string, PackageReview[]>>({});
  const [reviewForms, setReviewForms] = useState<Record<string, { rating: number; comment: string }>>({});
  const [selectedPackageForReview, setSelectedPackageForReview] = useState<Package | null>(null);
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastProps | null>(null);

  useEffect(() => {
    let currentUser: CustomerUser | null = null;
    const userStr = localStorage.getItem('user');

    if (userStr) {
      currentUser = JSON.parse(userStr) as CustomerUser;
      setUser(currentUser);
    } else {
      currentUser = { name: 'Demo User', email: 'demo@wedora.com' };
      setUser(currentUser);
    }

    setSavedPackages(safeParseArray<string>(localStorage.getItem('savedPackages')));
    const budget = localStorage.getItem(getBudgetStorageKeys(currentUser).budgetPackages) || localStorage.getItem('budgetPackages');
    if (budget) setBudgetPackages(safeParseArray<string>(budget));
    setCartCount(getCartCount());
    fetchVendorPackages();
  }, [vendorId]);

  const fetchVendorPackages = async () => {
    try {
      setLoading(true);
      const [offerings, vendorReviews] = await Promise.all([
        apiFetch<OfferingResponse[]>(`/offerings?vendorId=${vendorId}`),
        apiFetch<PackageReview[]>(`/reviews?vendorId=${vendorId}`),
      ]);

      setReviewsByPackage((vendorReviews || []).reduce<Record<string, PackageReview[]>>((groups, review) => {
        const key = review.offeringId.toString();
        groups[key] = [...(groups[key] || []), review];
        return groups;
      }, {}));

      const livePackages = offerings.flatMap((offering): Package[] => {
        const normalizedCategory = normalizeGiftCategory(offering.category);
        if (offering.isDraft || !normalizedCategory) return [];

        return [{
          id: offering.id.toString(),
          vendorId,
          category: normalizedCategory,
          title: offering.name,
          price: Number(offering.price) || 0,
          features: Array.isArray(offering.facilities) ? offering.facilities.filter(Boolean) : [],
          photos: Array.isArray(offering.images) && offering.images.length ? offering.images : ['/gift.png'],
          stock: offering.stock,
          discount: offering.discount,
          discountType: offering.discountType,
          description: offering.description,
        }];
      });

      const firstOfferingVendor = offerings.find((offering) => offering.vendor)?.vendor;
      const organizationName = firstOfferingVendor?.organizationName || firstOfferingVendor?.businessName || firstOfferingVendor?.name || 'Gifting Vendor';

      setPackages(livePackages);
      setVendor({
        id: vendorId,
        name: organizationName,
        organizationName,
        category: Array.from(new Set(livePackages.map((pkg) => pkg.category))),
        location: firstOfferingVendor?.location || 'Not specified',
        rating: 4.7,
        reviewCount: vendorReviews.length,
        image: livePackages[0]?.photos[0] || '/gift.png',
        about: firstOfferingVendor?.description || livePackages[0]?.description || 'Professional gifting and souvenir packages for weddings and special events.',
        features: Array.from(new Set(livePackages.flatMap((pkg) => pkg.features))),
      });
    } catch (error) {
      console.error('Failed to fetch gift vendor packages:', error);
      setVendor(emptyVendor(vendorId));
      setPackages([]);
      setToast({ message: 'Unable to load gifting vendor packages.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const filteredPackages = selectedCategory === 'all' ? packages : packages.filter((pkg) => pkg.category === selectedCategory);
  const getPackageReviews = (packageId: string) => reviewsByPackage[packageId] || [];
  const getAverageRating = (packageId: string) => {
    const packageReviews = getPackageReviews(packageId);
    if (packageReviews.length === 0) return 0;
    return packageReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / packageReviews.length;
  };

  const calculateDiscountedPrice = (price: number, discount?: string) => {
    if (!discount) return price;
    const discountPercent = parseInt(discount.replace('%', ''));
    return Number.isFinite(discountPercent) ? price - (price * discountPercent / 100) : price;
  };

  const toggleSavePackage = (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSavedPackages = savedPackages.includes(pkg.id) ? savedPackages.filter((id) => id !== pkg.id) : [...savedPackages, pkg.id];
    setSavedPackages(nextSavedPackages);
    localStorage.setItem('savedPackages', JSON.stringify(nextSavedPackages));
  };

  const addToBudgetCalculator = (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation();
    const budgetKeys = getBudgetStorageKeys(user);

    if (budgetPackages.includes(pkg.id)) {
      setToast({ message: 'Package is already in your budget calculator.', type: 'error' });
      return;
    }

    const price = calculateDiscountedPrice(pkg.price, pkg.discount);
    const nextBudgetPackages = [...budgetPackages, pkg.id];
    setBudgetPackages(nextBudgetPackages);
    localStorage.setItem(budgetKeys.budgetPackages, JSON.stringify(nextBudgetPackages));

    const budgetItems = safeParseArray<BudgetItem>(localStorage.getItem(budgetKeys.budgetItems));
    budgetItems.push({ id: `pkg-${pkg.id}`, category: pkg.category, name: `${vendor.organizationName} - ${pkg.title}`, price, quantity: 1 });
    localStorage.setItem(budgetKeys.budgetItems, JSON.stringify(budgetItems));

    const budgetPackageDetails = safeParseArray<BudgetPackageDetail>(localStorage.getItem(budgetKeys.budgetPackageDetails));
    budgetPackageDetails.push({ packageId: pkg.id, vendorId: vendor.id, category: pkg.category, title: pkg.title, price, image: pkg.photos[0], vendorName: vendor.organizationName, quantity: 1, href: `/services/gifting-souvenirs/${vendor.id}`, serviceSlug: 'gifting-souvenirs' });
    localStorage.setItem(budgetKeys.budgetPackageDetails, JSON.stringify(budgetPackageDetails));
    setToast({ message: 'Package added to budget calculator.', type: 'success' });
  };

  const handleAddToCart = (pkg: Package, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCart = addCartItem({
      id: `gifting-souvenirs-${vendor.id}-${pkg.id}`,
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

  const updateReviewForm = (packageId: string, changes: Partial<{ rating: number; comment: string }>) => {
    setReviewForms((prev) => ({ ...prev, [packageId]: { rating: prev[packageId]?.rating || 5, comment: prev[packageId]?.comment || '', ...changes } }));
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
        body: JSON.stringify({ userId: String(user.id), offeringId: Number(pkg.id), vendorId: Number(pkg.vendorId), rating: form.rating, comment: form.comment.trim() }),
      });
      setReviewsByPackage((prev) => ({ ...prev, [pkg.id]: [{ ...created, user: { name: user.name, email: user.email } }, ...(prev[pkg.id] || [])] }));
      setReviewForms((prev) => ({ ...prev, [pkg.id]: { rating: 5, comment: '' } }));
      setToast({ message: 'Review submitted successfully.', type: 'success' });
    } catch (error) {
      console.error('Failed to submit gift review', error);
      setToast({ message: `Unable to submit review: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    } finally {
      setSubmittingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-purple-100 border-t-purple-700 animate-spin" />
          <p className="text-gray-600 font-medium">Loading gift packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="shadow-sm sticky top-0 z-50" style={{ backgroundColor: '#755A7B' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" />
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-season)' }}>Wedora</h1>
          </Link>
          <nav className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowServicesDropdown(!showServicesDropdown)} className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80 flex items-center gap-2">
                Services <FaChevronDown className="text-sm" />
              </button>
              {showServicesDropdown && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 999 }} onClick={() => setShowServicesDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2" style={{ zIndex: 1000 }}>
                    {[
                      ['/services/venue-accommodation', 'Venue & Accommodation'],
                      ['/services/photography-videography', 'Photography & Videography'],
                      ['/services/fashion-beauty', 'Fashion & Beauty'],
                      ['/services/entertainment', 'Entertainment'],
                      ['/services/transportation', 'Transportation'],
                      ['/services/ceremonial', 'Ceremonial Services'],
                      ['/services/cake-decoration', 'Cake Decoration'],
                      ['/services/gifting-souvenirs', 'Gifting & Souvenirs'],
                    ].map(([href, label]) => (
                      <Link key={href} href={href} onClick={() => setShowServicesDropdown(false)} className="block px-4 py-2 hover:bg-purple-50 transition-colors" style={{ color: '#755A7B' }}>{label}</Link>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/budget-calculator" className="p-2 rounded-full hover:bg-purple-700" title="Budget Calculator"><FaCalculator className="text-xl text-white" /></Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-purple-700 relative" title="Cart">
              <FaShoppingCart className="text-xl text-white" />
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#ff4444' }}>{cartCount}</span>
            </Link>
            {user && (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-purple-400">
                <FaUserCircle className="text-3xl text-white" />
                <div className="text-left"><p className="text-sm font-semibold text-white">{user.name}</p><p className="text-xs text-purple-200">{user.email}</p></div>
                <button onClick={handleLogout} className="px-3 py-2 rounded-lg border-2 border-white hover:bg-white hover:bg-opacity-20 flex items-center gap-2 font-medium transition-colors text-white"><FaSignOutAlt className="text-lg" /> Logout</button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/services/gifting-souvenirs" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">Back to Gifting & Souvenirs</Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            <div className="md:col-span-1">
              <img src={vendor.image} alt={vendor.organizationName} className="w-full h-64 object-cover rounded-lg shadow-md" />
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#755A7B' }}>{vendor.organizationName}</h1>
                  <div className="flex items-center text-gray-600 mb-3"><FaMapMarkerAlt className="mr-2" />{vendor.location}</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1"><FaStar className="text-yellow-400 text-xl" /><span className="text-xl font-semibold">{vendor.rating}</span></div>
                    <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
                  </div>
                </div>
                <button className="p-3 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors"><FaHeart className="text-2xl text-gray-400 hover:text-red-500" /></button>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">{vendor.about}</p>
              <div>
                <h3 className="font-semibold mb-2" style={{ color: '#755A7B' }}>Specialties:</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.features.length ? vendor.features.map((feature) => <span key={feature} className="px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#f3f0f4', color: '#755A7B' }}>{feature}</span>) : <span className="text-sm text-gray-500">No specialties listed yet.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-6" style={{ color: '#755A7B' }}>Available Packages</h2>
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setSelectedCategory('all')} className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all" style={{ backgroundColor: selectedCategory === 'all' ? '#755A7B' : '#f3f4f6', color: selectedCategory === 'all' ? 'white' : '#6b7280' }}>All Packages</button>
          {vendor.category.map((category) => (
            <button key={category} onClick={() => setSelectedCategory(category)} className="px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all" style={{ backgroundColor: selectedCategory === category ? '#755A7B' : '#f3f4f6', color: selectedCategory === category ? 'white' : '#6b7280' }}>{categoryLabel(category)}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => {
            const discountedPrice = calculateDiscountedPrice(pkg.price, pkg.discount);
            const packageReviews = getPackageReviews(pkg.id);
            const averageRating = getAverageRating(pkg.id);
            const isInBudget = budgetPackages.includes(pkg.id);

            return (
              <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <img src={pkg.photos[0]} alt={pkg.title} className="w-full h-full object-cover" />
                  {pkg.discount && <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-bold" style={{ backgroundColor: '#755A7B' }}>{pkg.discount} OFF</div>}
                  <button onClick={(e) => toggleSavePackage(pkg, e)} className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                    <FaRegBookmark style={{ color: savedPackages.includes(pkg.id) ? '#755A7B' : '#9ca3af' }} />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#755A7B' }}>{pkg.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">{[...Array(5)].map((_, index) => <FaStar key={index} size={14} style={{ color: index < Math.round(averageRating) ? '#fbbf24' : '#d1d5db' }} />)}</div>
                    <span className="text-xs font-semibold text-gray-700">{averageRating ? averageRating.toFixed(1) : 'No ratings'}</span>
                    <span className="text-xs text-gray-500">({packageReviews.length})</span>
                  </div>
                  {pkg.description && <p className="text-gray-600 mb-4 text-sm overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{pkg.description}</p>}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.features.slice(0, 4).map((feature) => <span key={feature} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#f3e8ff', color: '#755A7B' }}>{feature}</span>)}
                    {pkg.features.length > 4 && <span className="px-2 py-1 text-xs text-gray-500">+{pkg.features.length - 4} more</span>}
                  </div>
                  <div className="mb-4">
                    {pkg.discount ? <><span className="text-sm text-gray-400 line-through mr-2">Rs {pkg.price.toLocaleString()}</span><span className="text-2xl font-bold" style={{ color: '#755A7B' }}>Rs {discountedPrice.toLocaleString()}</span></> : <span className="text-2xl font-bold" style={{ color: '#755A7B' }}>Rs {pkg.price.toLocaleString()}</span>}
                    {pkg.discountType && <p className="text-xs mt-1" style={{ color: '#755A7B' }}>{pkg.discountType}</p>}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setSelectedPackageForReview(pkg)} className="px-4 py-2 rounded-lg font-medium border-2 transition-all hover:shadow-sm" style={{ borderColor: '#755A7B', color: '#755A7B', backgroundColor: 'white' }}>Reviews ({packageReviews.length})</button>
                    <button onClick={(e) => handleAddToCart(pkg, e)} className="px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: '#755A7B' }}><FaShoppingCart className="inline mr-1" /> Add to Cart</button>
                    <button onClick={(e) => addToBudgetCalculator(pkg, e)} disabled={isInBudget} className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${isInBudget ? 'bg-green-500 cursor-not-allowed' : 'hover:opacity-90'}`} style={{ backgroundColor: isInBudget ? '#10b981' : '#755A7B' }}>
                      {isInBudget ? <><FaCheck className="inline mr-1" /> In Budget</> : <><FaCalculator className="inline mr-1" /> Add to Budget</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPackages.length === 0 && <div className="text-center py-16"><p className="text-xl text-gray-500">No packages available in this category</p></div>}
      </div>

      {selectedPackageForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Reviews for {selectedPackageForReview.title}</h3>
              <button onClick={() => setSelectedPackageForReview(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold" aria-label="Close reviews">x</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="font-semibold text-gray-800 mb-3">Write a Review</p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const reviewForm = reviewForms[selectedPackageForReview.id] || { rating: 5, comment: '' };
                    return <button key={star} type="button" onClick={() => updateReviewForm(selectedPackageForReview.id, { rating: star })} className="text-3xl transition-transform hover:scale-110" aria-label={`${star} star rating`}><FaStar style={{ color: star <= reviewForm.rating ? '#fbbf24' : '#d1d5db' }} /></button>;
                  })}
                </div>
                {(() => {
                  const reviewForm = reviewForms[selectedPackageForReview.id] || { rating: 5, comment: '' };
                  return (
                    <>
                      <textarea value={reviewForm.comment} onChange={(e) => updateReviewForm(selectedPackageForReview.id, { comment: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-900 placeholder-gray-400 mb-3" placeholder="Share your experience with this package..." />
                      <button type="button" onClick={() => handleSubmitReview(selectedPackageForReview)} disabled={submittingReviewId === selectedPackageForReview.id} className="w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70" style={{ backgroundColor: '#755A7B' }}>{submittingReviewId === selectedPackageForReview.id ? 'Submitting...' : 'Submit Review'}</button>
                    </>
                  );
                })()}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Customer Reviews</h4>
                <div className="space-y-4">
                  {getPackageReviews(selectedPackageForReview.id).length > 0 ? getPackageReviews(selectedPackageForReview.id).map((review) => (
                    <div key={review.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div><p className="font-semibold text-gray-800">{review.user?.name || review.user?.email || 'Customer'}</p><p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p></div>
                        <div className="flex gap-0.5">{[...Array(5)].map((_, index) => <FaStar key={index} size={14} style={{ color: index < review.rating ? '#fbbf24' : '#d1d5db' }} />)}</div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{review.comment || 'No comment provided.'}</p>
                    </div>
                  )) : <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center"><p className="text-gray-500">No reviews yet. Be the first to review this package.</p></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-16 py-8" style={{ backgroundColor: '#755A7B' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0"><img src="/logo.png" alt="Wedora Logo" className="h-10 w-10" /><span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-season)' }}>Wedora</span></div>
            <p className="text-purple-200 text-sm">&copy; 2026 Wedora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
