// User roles
export enum UserRole {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

// Vendor categories
export const VENDOR_CATEGORIES = [
  {
    id: 'venue-accommodation',
    name: 'Venue & Accommodation',
    subcategories: [
      'Hotels',
      'Banquet Halls',
      'Outdoor Venues',
      'Destination Resorts',
      'Homestays/Villas',
    ],
  },
  {
    id: 'photography-videography',
    name: 'Photography & Videography',
    subcategories: [
      'Photographers',
      'Videographers',
      'Drones',
      '360° Coverage',
      'Photo Booths',
    ],
  },
  {
    id: 'fashion-beauty',
    name: 'Fashion & Beauty',
    subcategories: [
      'Bridal/Groom Wear',
      'Jewelers',
      'Makeup Artists',
      'Mehendi Artists',
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    subcategories: [
      'DJs',
      'Live Bands',
      'Traditional Dancers',
    ],
  },
  {
    id: 'transportation',
    name: 'Transportation',
    subcategories: [
      'Bridal Car Rentals',
      'Guest Transport',
      'Horse/Chariot Providers',
    ],
  },
  {
    id: 'ceremonial-services',
    name: 'Ceremonial Services',
    subcategories: [
      'Astrologers',
      'Priests',
      'Marriage Registrars',
      'Traditional Instrumentalists',
    ],
  },
  {
    id: 'cake-decoration',
    name: 'Cake Decoration',
    subcategories: [
      'Wedding Cakes',
      'Custom Designs',
      'Cake Toppers',
    ],
  },
  {
    id: 'gifting-souvenirs',
    name: 'Gifting & Souvenirs',
    subcategories: [
      'Gift Shops',
      'Return Gifts',
      'Custom Merchandise',
    ],
  },
];

export type VendorCategory = typeof VENDOR_CATEGORIES[number];

const VENDOR_DASHBOARD_ROUTES: Record<string, string> = {
  'venue-accommodation': '/dashboard/venue-accommodation',
  'photography-videography': '/dashboard/photography',
  'fashion-beauty': '/dashboard/fashion-beauty',
  entertainment: '/dashboard/entertainment',
  transportation: '/dashboard/transportation',
  'ceremonial-services': '/dashboard/ceremonial',
  'cake-decoration': '/dashboard/cake-decoration',
  'gifting-souvenirs': '/dashboard/gifting',
};

export function getVendorDashboardPath(categories: string[] = []): string {
  for (const category of categories) {
    const route = VENDOR_DASHBOARD_ROUTES[category];

    if (route) {
      return route;
    }
  }

  return '/dashboard/vendor';
}
