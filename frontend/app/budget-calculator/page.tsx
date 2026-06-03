'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaShoppingCart, FaCalculator, FaChevronDown, FaUserCircle, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { getBudgetStorageKeys, safeParseArray } from '@/lib/budget-storage';

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
}

export default function BudgetCalculator() {
  const router = useRouter();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<{id?: string | number; name: string; email: string; role?: string} | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } else {
      setUser({
        name: 'Dinusha Herath',
        email: 'DinushaHerath@gmail.com'
      });
    }
  }, []);

  useEffect(() => {
    const storageKeys = getBudgetStorageKeys(user);
    const scopedBudgetItems = safeParseArray<any>(localStorage.getItem(storageKeys.budgetItems));
    const scopedPackageDetails = safeParseArray<any>(localStorage.getItem(storageKeys.budgetPackageDetails));

    const normalizedFromPackages = scopedPackageDetails.map((item, index) => ({
      id: `pkg-${item.packageId || item.id || index}`,
      category: item.category || item.vendorName || 'Added Package',
      name: item.title || item.name || 'Wedding Package',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    }));

    const normalizedFromBudgetItems = scopedBudgetItems.map((item, index) => ({
      id: item.id || `item-${item.packageId || index}`,
      category: item.category || 'Budget Item',
      name: item.name || item.title || 'Budget Item',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    }));

    const primaryItems = normalizedFromBudgetItems.length > 0
      ? normalizedFromBudgetItems
      : normalizedFromPackages;

    const mergedItems = primaryItems.reduce((acc, item) => {
      const existing = acc.find((entry) => entry.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.price = item.price || existing.price;
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as BudgetItem[]);

    setBudgetItems(mergedItems);
    calculateTotal(mergedItems);

    if (normalizedFromBudgetItems.length === 0 && normalizedFromPackages.length > 0) {
      localStorage.setItem(storageKeys.budgetItems, JSON.stringify(mergedItems));
    }
  }, [user]);

  const calculateTotal = (items: BudgetItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalBudget(total);
  };

  const getScopedBudgetItems = () => {
    const storageKeys = getBudgetStorageKeys(user);
    return storageKeys;
  };

  const totalItemQuantity = budgetItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = budgetItems.filter(item => item.id !== id);
    setBudgetItems(updatedItems);
    calculateTotal(updatedItems);
    const storageKeys = getScopedBudgetItems();
    localStorage.setItem(storageKeys.budgetItems, JSON.stringify(updatedItems));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = budgetItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setBudgetItems(updatedItems);
    calculateTotal(updatedItems);
    const storageKeys = getScopedBudgetItems();
    localStorage.setItem(storageKeys.budgetItems, JSON.stringify(updatedItems));
  };

  const clearAllItems = () => {
    if (confirm('Are you sure you want to clear all budget items?')) {
      setBudgetItems([]);
      setTotalBudget(0);
      const storageKeys = getScopedBudgetItems();
      localStorage.removeItem(storageKeys.budgetItems);
      localStorage.removeItem(storageKeys.budgetPackageDetails);
    }
  };

  // Group items by category
  const groupedItems = budgetItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BudgetItem[]>);

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

            <Link href="/budget-calculator" className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors" title="Budget Calculator">
              <FaCalculator className="text-xl text-white" />
            </Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 relative transition-colors" title="Cart">
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
          src="/budget.png" 
          alt="Budget Calculator"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4" style={{fontFamily: 'var(--font-season)'}}>
              Budget Calculator
            </h1>
            <p className="text-lg">Plan and track your wedding expenses</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget Items List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{color: '#755A7B'}}>Budget Items</h2>
                {budgetItems.length > 0 && (
                  <button
                    onClick={clearAllItems}
                    className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white flex items-center gap-2 transition-colors hover:bg-red-600"
                  >
                    <FaTrash /> Clear All
                  </button>
                )}
              </div>

              {/* Budget Items by Category */}
              {budgetItems.length === 0 ? (
                <div className="text-center py-12">
                  <FaCalculator className="text-6xl mx-auto mb-4" style={{color: '#755A7B', opacity: 0.3}} />
                  <p className="text-gray-500 text-lg mb-2">No budget items yet</p>
                  <p className="text-gray-400 mb-6">Browse our services and add packages to your cart, then transfer them here</p>
                  <Link
                    href="/services/venue-accommodation"
                    className="inline-block px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                    style={{backgroundColor: '#755A7B'}}
                  >
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-3" style={{color: '#755A7B'}}>{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(item => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative h-32">
                              <img
                                src="/ven1.png"
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-md"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-gray-800 mb-2">{item.name}</h4>
                              <p className="text-sm text-gray-500 mb-3">Rs {item.price.toLocaleString()} × {item.quantity}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold hover:bg-purple-50"
                                    style={{borderColor: '#755A7B', color: '#755A7B'}}
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold hover:bg-purple-50"
                                    style={{borderColor: '#755A7B', color: '#755A7B'}}
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg" style={{color: '#755A7B'}}>
                                    Rs {(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Budget Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6" style={{color: '#755A7B'}}>Budget Summary</h2>
              
              <div className="space-y-4 mb-6">
                {Object.entries(groupedItems).map(([category, items]) => {
                  const categoryTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  return (
                    <div key={category} className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-600 text-sm">{category}</span>
                      <span className="font-semibold">Rs {categoryTotal.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-purple-200 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Total Items:</span>
                  <span className="text-lg font-semibold">{totalItemQuantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold" style={{color: '#755A7B'}}>Total Budget:</span>
                  <span className="text-2xl font-bold" style={{color: '#755A7B'}}>
                    Rs {totalBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Tip:</strong> Browse our services to add packages directly to your budget calculator!
                </p>
                <Link
                  href="/services/venue-accommodation"
                  className="block w-full mt-3 px-4 py-2 rounded-lg font-medium text-white text-center transition-colors hover:opacity-90"
                  style={{backgroundColor: '#755A7B'}}
                >
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
        </div>
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
