'use client';
import { createContext, useContext, useState, useCallback } from 'react';

export const BUNDLES = [
  { qty: 1, label: '1 Flacon',    price: 299, original: 299, shipping: 30,  badge: null,              tag: null },
  { qty: 2, label: '2 Flacons',   price: 539, original: 598, shipping: 0,   badge: 'MEILLEURE VENTE', tag: 'Économisez 59 DH + livraison offerte' },
  { qty: 3, label: '3 Flacons',   price: 759, original: 897, shipping: 0,   badge: 'ROUTINE COMPLÈTE',tag: 'Économisez 138 DH + livraison offerte' },
] as const;

export type BundleQty = 1 | 2 | 3;

interface CartCtx {
  bundle: BundleQty;
  setBundle: (qty: BundleQty) => void;
  scrollToOrder: () => void;
  selectAndOrder: (qty: BundleQty) => void;
}

const Ctx = createContext<CartCtx>({
  bundle: 2,
  setBundle: () => {},
  scrollToOrder: () => {},
  selectAndOrder: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [bundle, setBundle] = useState<BundleQty>(2);

  const scrollToOrder = useCallback(() => {
    const el = document.getElementById('order');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const selectAndOrder = useCallback((qty: BundleQty) => {
    setBundle(qty);
    setTimeout(scrollToOrder, 50);
  }, [scrollToOrder]);

  return (
    <Ctx.Provider value={{ bundle, setBundle, scrollToOrder, selectAndOrder }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
