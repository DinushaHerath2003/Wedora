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

export type CartUser = {
  id?: string | number;
  email?: string;
};

export function getStoredCartUser(): CartUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function getCartScope(user: CartUser | null = getStoredCartUser()) {
  if (!user) return 'guest';
  const scopeId = user.id ?? user.email?.trim().toLowerCase();
  return scopeId ? `user:${scopeId}` : 'guest';
}

export function getCartStorageKey(user: CartUser | null = getStoredCartUser()) {
  return `${getCartScope(user)}:cartItems`;
}

function parseCartItems(value: string | null): CartItem[] {
  try {
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCartItems(user: CartUser | null = getStoredCartUser()): CartItem[] {
  if (typeof window === 'undefined') return [];

  return parseCartItems(localStorage.getItem(getCartStorageKey(user)));
}

export function saveCartItems(items: CartItem[], user: CartUser | null = getStoredCartUser()) {
  localStorage.setItem(getCartStorageKey(user), JSON.stringify(items));
  window.dispatchEvent(new Event('cart-updated'));
}

export function clearCartItems(user: CartUser | null = getStoredCartUser()) {
  localStorage.removeItem(getCartStorageKey(user));
  window.dispatchEvent(new Event('cart-updated'));
}

export function getCartCount(user: CartUser | null = getStoredCartUser()) {
  return getCartItems(user).reduce((sum, item) => sum + item.quantity, 0);
}

export function addCartItem(item: Omit<CartItem, 'quantity'>, user: CartUser | null = getStoredCartUser()) {
  const items = getCartItems(user);
  const existingIndex = items.findIndex((cartItem) => cartItem.id === item.id);

  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      quantity: items[existingIndex].quantity + 1,
    };
  } else {
    items.push({ ...item, quantity: 1 });
  }

  saveCartItems(items, user);
  return items;
}
