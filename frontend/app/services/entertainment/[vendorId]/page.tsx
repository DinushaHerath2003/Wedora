'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addCartItem, getCartCount } from '@/lib/cart-storage';
import { FaHeart, FaMapMarkerAlt, FaStar, FaShoppingCart, FaCalculator, FaChevronDown, FaUserCircle, FaSignOutAlt, FaCheck } from 'react-icons/fa';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export default function EntertainmentVendorDetail() {
  const router = useRouter();
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [user, setUser] = useState<{name: string; email: string} | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Mock vendor data
  const vendor = {
    id: '1',
    name: 'Rhythm & Harmony Wedding Band',
    organizationName: 'Rhythm & Harmony Wedding Band',
    location: 'Colombo, Sri Lanka',
    rating: 4.9,
    reviewCount: 178,
    image: '/ven1.png',
    description: 'Professional wedding band with 10+ years of experience creating unforgettable musical experiences. Our talented musicians perform a diverse repertoire from classic hits to contemporary favorites, ensuring your guests dance the night away.',
    specialties: ['Live Band Performance', 'Wedding Ceremony Music', 'Reception Entertainment', 'Cocktail Hour Jazz', 'First Dance Songs', 'Professional Sound & Lighting'],
  };

  const packages: Package[] = [
    {
      id: '1',
      name: 'Classic Band Package - 4 Hours',
      description: 'Professional 5-piece band for your wedding reception',
      price: 85000,
      features: [
        '5-piece live band (vocals, guitar, bass, drums, keys)',
        '4 hours of live music',
        'Professional sound system',
        'Basic stage lighting',
        'Song requests accepted',
        '2 breaks with DJ backup music',
        'Setup and breakdown included'
      ]
    },
    {
      id: '2',
      name: 'Premium Band Package - 5 Hours',
      description: 'Extended performance with enhanced sound and lighting',
      price: 125000,
      features: [
        '7-piece live band with horn section',
        '5 hours of live music',
        'Premium sound system',
        'Professional stage lighting',
        'MC services included',
        'Unlimited song requests',
        'DJ backup during breaks',
        'Pre-event music consultation',
        'Full setup and breakdown'
      ],
      popular: true
    },
    {
      id: '3',
      name: 'Grand Entertainment Package - 6 Hours',
      description: 'Complete entertainment solution for grand celebrations',
      price: 200000,
      features: [
        '9-piece band with strings and horns',
        '6 hours of live performance',
        'State-of-the-art sound system',
        'Full stage lighting with effects',
        'Professional MC services',
        'Special song arrangements',
        'DJ services during breaks',
        'Cocktail hour background music',
        'Rehearsal included',
        'Complete technical setup'
      ]
    },
    {
      id: '4',
      name: 'Acoustic Trio Package - 3 Hours',
      description: 'Intimate acoustic performance for ceremonies and cocktails',
      price: 55000,
      features: [
        'Acoustic trio (guitar, vocals, percussion)',
        '3 hours of performance',
        'Portable sound system',
        'Perfect for ceremonies',
        'Romantic song repertoire',
        'Song requests welcome',
        'Setup included'
      ]
    },
    {
      id: '5',
      name: 'DJ & Live Band Combo - 5 Hours',
      description: 'Best of both worlds with DJ and live band',
      price: 150000,
      features: [
        '5-piece live band',
        'Professional DJ services',
        '5 hours total entertainment',
        'Seamless transitions',
        'Premium sound system',
        'Stage lighting package',
        'MC services',
        'Music library access',
        'Setup and breakdown'
      ]
    },
    {
      id: '6',
      name: 'Full Day Entertainment - 8 Hours',
      description: 'Complete day coverage from ceremony to late night',
      price: 225000,
      features: [
        'Acoustic set for ceremony (1.5 hours)',
        'Cocktail hour jazz trio (1.5 hours)',
        'Full band reception (5 hours)',
        'DJ late night party',
        'Premium sound throughout',
        'Professional lighting',
        'MC services all day',
        'Unlimited song requests',
        'Special arrangements included',
        'Complete technical production'
      ]
    }
  ];

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
    setCartCount(getCartCount());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleAddToCart = (pkg: Package) => {
    setSelectedPackage(pkg.id);
    const updatedCart = addCartItem({
      id: `entertainment-${vendor.id}-${pkg.id}`,
      vendorId: vendor.id,
      vendorName: vendor.organizationName,
      packageName: pkg.name,
      category: 'Entertainment',
      price: pkg.price,
      features: pkg.features,
      image: vendor.image,
    });
    setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
    setTimeout(() => {
      alert(`${pkg.name} added to cart!`);
      setSelectedPackage(null);
    }, 500);
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
            <div 
              className="relative"
              onMouseEnter={() => setShowServicesDropdown(true)}
              onMouseLeave={() => setShowServicesDropdown(false)}
            >
              <button className="px-4 py-2 font-medium text-white transition-colors hover:opacity-80 flex items-center gap-2">
                Services <FaChevronDown className="text-sm" />
              </button>
              
              {showServicesDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                  <Link href="/services/venue-accommodation" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
                    Venue & Accommodation
                  </Link>
                  <Link href="/services/photography-videography" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
                    Photography & Videography
                  </Link>
                  <Link href="/services/fashion-beauty" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
                    Fashion & Beauty
                  </Link>
                  <Link href="/services/entertainment" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
                    Entertainment
                  </Link>
                  <Link href="/services/transportation" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
                    Transportation
                  </Link>
                  <Link href="/services/ceremonial" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
                    Ceremonial Services
                  </Link>
                  <Link href="/services/cake-decoration" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
                    Cake Decoration
                  </Link>
                  <Link href="/services/gifting-souvenirs" className="block px-4 py-2 text-gray-800 hover:bg-purple-50 transition-colors" style={{color: '#755A7B'}}>
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

      {/* Vendor Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/services/entertainment" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Back to Entertainment Services
          </Link>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
            <div className="md:col-span-1">
              <img
                src={vendor.image}
                alt={vendor.organizationName}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{color: '#755A7B'}}>{vendor.organizationName}</h1>
                  <div className="flex items-center text-gray-600 mb-3">
                    <FaMapMarkerAlt className="mr-2" />
                    {vendor.location}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-xl" />
                      <span className="text-xl font-semibold">{vendor.rating}</span>
                    </div>
                    <span className="text-gray-500">({vendor.reviewCount} reviews)</span>
                  </div>
                </div>
                <button className="p-3 bg-white border-2 border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                  <FaHeart className="text-2xl text-gray-400 hover:text-red-500" />
                </button>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{vendor.description}</p>
              
              <div>
                <h3 className="font-semibold mb-2" style={{color: '#755A7B'}}>Specialties:</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{backgroundColor: '#f3f0f4', color: '#755A7B'}}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8" style={{color: '#755A7B'}}>Available Packages</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                pkg.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="text-white text-center py-2 text-sm font-semibold" style={{backgroundColor: '#755A7B'}}>
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{color: '#755A7B'}}>{pkg.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{pkg.description}</p>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{color: '#755A7B'}}>
                    Rs {pkg.price.toLocaleString()}
                  </span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleAddToCart(pkg)}
                  disabled={selectedPackage === pkg.id}
                  className="w-full py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{backgroundColor: '#755A7B'}}
                >
                  {selectedPackage === pkg.id ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
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
