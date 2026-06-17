'use client';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';

export function StickyBar() {
  const [visible, setVisible] = useState(false);
  const { selectAndOrder } = useCart();

  useEffect(() => {
    const el = document.getElementById('hero');
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(!e.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={`sticky-bar${visible ? ' is-visible' : ''}`}
      aria-hidden={!visible}
      role="complementary"
      aria-label="Commander SELVERINE"
    >
      {/* Mobile layout */}
      <div className="sticky-bar__mobile">
        <div className="sticky-bar__mobile-top">
          <span className="sticky-bar__mobile-name">SELVERINE</span>
          <span className="sticky-bar__mobile-stars">★★★★★</span>
          <span className="sticky-bar__mobile-price">dès 299 DH</span>
        </div>
        <button
          className="btn btn--gold btn--full"
          onClick={() => selectAndOrder(2)}
        >
          Commander maintenant →
        </button>
      </div>

      {/* Desktop layout */}
      <div className="sticky-bar__desktop">
        <div className="sticky-bar__inner">
          <span className="sticky-bar__label">
            SELVERINE · ★★★★★ · Livraison 24-48h · Paiement à la livraison
          </span>
          <div className="sticky-bar__actions">
            <span className="sticky-bar__price">dès 299 DH</span>
            <button
              className="btn btn--sm btn--gold"
              onClick={() => selectAndOrder(2)}
            >
              Commander maintenant →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
