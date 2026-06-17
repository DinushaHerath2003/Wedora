export type CeremonialCategory =
  | 'poruwa-ceremony'
  | 'religious-services'
  | 'cultural-events';

export const CEREMONIAL_CATEGORY_IDS: CeremonialCategory[] = [
  'poruwa-ceremony',
  'religious-services',
  'cultural-events',
];

export const CEREMONIAL_CATEGORY_LABELS: Record<CeremonialCategory, string> = {
  'poruwa-ceremony': 'Poruwa Ceremony',
  'religious-services': 'Religious Services',
  'cultural-events': 'Cultural Events',
};

export const CEREMONIAL_DASHBOARD_BASE = '/dashboard/ceremonial';

export interface CeremonialVendorUser {
  id?: number | string;
  name: string;
  email: string;
  role: string;
  organizationName?: string;
}

export interface CeremonialPackage {
  id: string;
  category: CeremonialCategory;
  title: string;
  pricePerDay: number;
  services: string[];
  photos: string[];
  createdAt: Date;
  duration?: string;
  discount?: string;
  discountType?: string;
  isDraft?: boolean;
  description?: string;
}

export function normalizeCeremonialCategory(category: string | undefined): CeremonialCategory {
  if (category === 'religious-services') return 'religious-services';
  if (category === 'cultural-events') return 'cultural-events';
  return 'poruwa-ceremony';
}

export function isCeremonialCategory(category: string | undefined): boolean {
  return CEREMONIAL_CATEGORY_IDS.includes(normalizeCeremonialCategory(category));
}

export function mapOfferingToCeremonialPackage(offering: {
  id: number;
  name: string;
  category: string;
  price: number | string;
  facilities?: string[] | null;
  images?: string[] | null;
  createdAt: string;
  discount?: string | null;
  discountType?: string | null;
  isDraft?: boolean;
  roomType?: string | null;
  description?: string | null;
}): CeremonialPackage {
  return {
    id: offering.id.toString(),
    category: normalizeCeremonialCategory(offering.category),
    title: offering.name,
    pricePerDay: Number(offering.price),
    services: offering.facilities || [],
    photos: offering.images || [],
    createdAt: new Date(offering.createdAt),
    duration: offering.roomType || undefined,
    discount: offering.discount || undefined,
    discountType: offering.discountType || undefined,
    isDraft: offering.isDraft,
    description: offering.description || undefined,
  };
}

export function buildCeremonialOfferingPayload(options: {
  title: string;
  description: string;
  category: CeremonialCategory;
  pricePerDay: string | number;
  selectedServices: string[];
  packageType: string;
  duration: string;
  discount: string;
  discountType: string;
  photos: File[];
  vendorId: number;
  isDraft: boolean;
}) {
  const servicesList =
    options.selectedServices.length > 0
      ? options.selectedServices
      : options.description
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

  return {
    name: options.title,
    description: options.description,
    category: options.category,
    price: parseFloat(String(options.pricePerDay)),
    facilities: servicesList,
    roomType: options.packageType || options.duration || undefined,
    discount: options.discount || undefined,
    discountType: options.discountType || undefined,
    images: options.photos.map((file) => file.name),
    vendorId: options.vendorId,
    isDraft: options.isDraft,
  };
}

export function getCeremonialVendorId(user: CeremonialVendorUser | null): number | null {
  const vendorId = Number(user?.id);
  if (!Number.isFinite(vendorId) || vendorId <= 0) return null;
  return vendorId;
}
