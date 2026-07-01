'use client';

import { useEffect, useState } from 'react';
import { CartUser, getCartCount, getStoredCartUser } from './cart-storage';

export function useCartCount(user?: CartUser | null) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setCartCount(getCartCount(user === undefined ? getStoredCartUser() : user));
    };

    refresh();

    window.addEventListener('cart-updated', refresh);
    window.addEventListener('auth-changed', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      window.removeEventListener('cart-updated', refresh);
      window.removeEventListener('auth-changed', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [user]);

  return cartCount;
}
