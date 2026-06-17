'use client';
import { useEffect, useState } from 'react';
import { BUNDLES, useCart, type BundleQty } from '@/context/CartContext';

export function StickyBar() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { bundle, setBundle, scrollToOrder } = useCart();

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

  const selected = BUNDLES.find(b => b.qty === bundle)!;

  function handleOrder() {
    setExpanded(false);
    scrollToOrder();
  }

  return (
    <div className={`popup-footer${visible ? ' popup-footer--visible' : ''}`} role="complementary">
      {/* Collapsed bar */}
      <div className="popup-footer__bar" onClick={() => setExpanded(e => !e)}>
        <div className="popup-footer__bar-left">
          <span className="popup-footer__name">SELVERINE</span>
          <span className="popup-footer__stars">★★★★★</span>
        </div>
        <div className="popup-footer__bar-right">
          <div className="popup-footer__price-wrap">
            <span className="popup-footer__price">{selected.price} DH</span>
            {selected.original > selected.price && (
              <span className="popup-footer__original">{selected.original} DH</span>
            )}
          </div>
          <button
            className="btn btn--gold btn--sm popup-footer__cta"
            onClick={(e) => { e.stopPropagation(); handleOrder(); }}
          >
            Commander →
          </button>
          <span className={`popup-footer__chevron${expanded ? ' popup-footer__chevron--up' : ''}`} aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          </span>
        </div>
      </div>

      {/* Expanded bundle picker */}
      {expanded && (
        <div className="popup-footer__panel">
          <p className="popup-footer__panel-label">Choisissez votre offre</p>
          <div className="popup-footer__bundles">
            {BUNDLES.map((b) => {
              const savings = b.original - b.price;
              return (
                <button
                  key={b.qty}
                  className={`popup-bundle${bundle === b.qty ? ' popup-bundle--on' : ''}`}
                  onClick={() => setBundle(b.qty as BundleQty)}
                >
                  <span className={`popup-bundle__dot${bundle === b.qty ? ' popup-bundle__dot--on' : ''}`} />
                  <span className="popup-bundle__label">{b.label}</span>
                  {b.badge && <span className="popup-bundle__badge">{b.badge}</span>}
                  <span className="popup-bundle__prices">
                    <span className="popup-bundle__price">{b.price} DH</span>
                    {savings > 0 && <span className="popup-bundle__old">{b.original} DH</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <button className="btn btn--gold btn--xl btn--full popup-footer__order" onClick={handleOrder}>
            Confirmer ma commande — {selected.price} DH →
          </button>
          <p className="popup-footer__trust">
            💳 Paiement à la livraison · 🚚 Livraison 24-48h · {selected.shipping === 0 ? '🎁 Livraison offerte' : `+${selected.shipping} DH livraison`}
          </p>
        </div>
      )}
    </div>
  );
}
