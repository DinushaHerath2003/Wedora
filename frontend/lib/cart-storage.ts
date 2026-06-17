export interface CartItem {
  id: string;
  vendorId: string;
  vendorName: string;
  packageName: string;
  category: string;
  price: number;
  quantity: number;
  features: string[];
  image?: string;
}

const CART_STORAGE_KEY = 'cartItems';

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = savedCart ? JSON.parse(savedCart) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function getCartCount() {
  return getCartItems().reduce((sum, item) => sum + item.quantity, 0);
}

export function addCartItem(item: Omit<CartItem, 'quantity'>) {
  const items = getCartItems();
  const existingIndex = items.findIndex((cartItem) => cartItem.id === item.id);

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + 1,
    };
  } else {
    items.push({ ...item, quantity: 1 });
  }

  saveCartItems(items);
  return items;
}
