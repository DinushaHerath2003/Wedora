'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaShoppingCart, FaCalculator, FaChevronDown, FaUserCircle, FaSignOutAlt, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getBudgetStorageKeys, safeParseArray } from '@/lib/budget-storage';
import { CartItem, clearCartItems, getCartItems, saveCartItems } from '@/lib/cart-storage';

interface BudgetCalculatorItem {
  id: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
}

export default function Cart() {
  const router = useRouter();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<{id?: string | number; name: string; email: string; role?: string} | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const calculateTotals = (items: CartItem[]) => {
    const sub = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = sub * 0.05; // 5% tax
    setSubtotal(sub);
    setTax(taxAmount);
    setTotal(sub + taxAmount);
  };

  useEffect(() => {
    // Load user from localStorage
    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;
    setUser(userData);

    const items = getCartItems(userData);
    setCartItems(items);
    calculateTotals(items);
  }, []);

  const getUserBudgetKeys = () => getBudgetStorageKeys(user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('auth-changed'));
    router.push('/');
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    calculateTotals(updatedItems);
    saveCartItems(updatedItems, user);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    calculateTotals(updatedItems);
    saveCartItems(updatedItems, user);
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      setSubtotal(0);
      setTax(0);
      setTotal(0);
      clearCartItems(user);
    }
  };

  const addToBudgetCalculator = () => {
    const budgetItems = cartItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      category: item.category,
      name: `${item.vendorName} - ${item.packageName}`,
      price: item.price,
      quantity: item.quantity
    }));

    const budgetKeys = getUserBudgetKeys();
    const currentBudget = safeParseArray<BudgetCalculatorItem>(localStorage.getItem(budgetKeys.budgetItems));
    const updatedBudget = [...currentBudget, ...budgetItems];
    
    localStorage.setItem(budgetKeys.budgetItems, JSON.stringify(updatedBudget));
    alert('Cart items added to Budget Calculator!');
    router.push('/budget-calculator');
  };

  const proceedToCheckout = () => {
    alert('Checkout functionality will be implemented soon!');
    // Future: Redirect to checkout page
  };

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

            <Link href="/budget-calculator" className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors" title="Budget Calculator">
              <FaCalculator className="text-xl text-white" />
            </Link>
            <Link href="/cart" className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 relative transition-colors" title="Cart">
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
          src="/cart.png" 
          alt="Shopping Cart"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4" style={{fontFamily: 'var(--font-season)'}}>
              Shopping Cart
            </h1>
            <p className="text-lg">Review your selected packages and proceed to checkout</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{color: '#755A7B'}}>
                  Cart Items ({cartItems.length})
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white flex items-center gap-2 transition-colors hover:bg-red-600"
                  >
                    <FaTrash /> Clear Cart
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <FaShoppingCart className="text-6xl mx-auto mb-4" style={{color: '#755A7B', opacity: 0.3}} />
                  <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                  <p className="text-gray-400 mb-6">Browse our services and add packages to your cart</p>
                  <Link
                    href="/services/venue-accommodation"
                    className="inline-block px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                    style={{backgroundColor: '#755A7B'}}
                  >
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                        {/* Image Section */}
                        <div className="relative h-48 md:h-auto md:col-span-1">
                          <img 
                            src={item.image || '/ven1.png'} 
                            alt={item.packageName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Content Section */}
                        <div className="md:col-span-3 p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2" style={{backgroundColor: '#f3f0f4', color: '#755A7B'}}>
                                {item.category}
                              </span>
                              <h3 className="text-lg font-bold text-gray-800">{item.vendorName}</h3>
                              <p className="text-gray-600">{item.packageName}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          {item.features && item.features.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Features:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {item.features.slice(0, 3).map((feature, idx) => (
                                  <li key={idx}>• {feature}</li>
                                ))}
                                {item.features.length > 3 && (
                                  <li className="text-purple-600">+ {item.features.length - 3} more features</li>
                                )}
                              </ul>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border-2 flex items-center justify-center hover:bg-purple-50"
                                style={{borderColor: '#755A7B', color: '#755A7B'}}
                              >
                                <FaMinus className="text-xs" />
                              </button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border-2 flex items-center justify-center hover:bg-purple-50"
                                style={{borderColor: '#755A7B', color: '#755A7B'}}
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Rs {item.price.toLocaleString()} each</p>
                              <p className="text-xl font-bold" style={{color: '#755A7B'}}>
                                Rs {(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6" style={{color: '#755A7B'}}>Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (5%)</span>
                  <span className="font-semibold">Rs {tax.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-purple-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold" style={{color: '#755A7B'}}>Total</span>
                    <span className="text-xl font-bold" style={{color: '#755A7B'}}>
                      Rs {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{backgroundColor: '#755A7B'}}
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={addToBudgetCalculator}
                  disabled={cartItems.length === 0}
                  className="w-full px-6 py-3 rounded-lg font-medium border-2 transition-colors hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{borderColor: '#755A7B', color: '#755A7B'}}
                >
                  Add to Budget Calculator
                </button>
              </div>

              <div className="mt-6 bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Final pricing may vary based on your specific requirements and customization requests.
                </p>
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
