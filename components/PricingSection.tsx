'use client';
import { BUNDLES, useCart, type BundleQty } from '@/context/CartContext';

export function PricingSection() {
  const { bundle, setBundle, scrollToOrder } = useCart();

  return (
    <section className="pricing-section" id="pricing">
      <div className="section-inner">
        <p className="pricing-section__eyebrow">Choisissez votre offre</p>
        <h2 className="pricing-section__headline">
          Investissez dans<br />vos racines
        </h2>
        <p className="pricing-section__sub">
          💳 Paiement à la livraison · 🚚 Livraison 24-48h partout au Maroc
        </p>

        <div className="bundle-grid">
          {BUNDLES.map((b) => {
            const isSelected = bundle === b.qty;
            const savings = b.original - b.price;

            return (
              <div
                key={b.qty}
                className={`bundle-card${isSelected ? ' bundle-card--selected' : ''}${b.badge === 'MEILLEURE VENTE' ? ' bundle-card--featured' : ''}`}
                onClick={() => setBundle(b.qty as BundleQty)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setBundle(b.qty as BundleQty)}
              >
                {b.badge && (
                  <div className="bundle-card__badge">{b.badge}</div>
                )}

                <div className="bundle-card__radio">
                  <span className={`bundle-card__dot${isSelected ? ' bundle-card__dot--on' : ''}`} />
                </div>

                <div className="bundle-card__info">
                  <p className="bundle-card__label">{b.label}</p>
                  {b.tag && (
                    <p className="bundle-card__tag">{b.tag}</p>
                  )}
                </div>

                <div className="bundle-card__price-col">
                  <p className="bundle-card__price">{b.price} DH</p>
                  {savings > 0 && (
                    <p className="bundle-card__original">{b.original} DH</p>
                  )}
                  {b.shipping === 0 ? (
                    <p className="bundle-card__shipping">🚚 Livraison offerte</p>
                  ) : (
                    <p className="bundle-card__shipping">+ {b.shipping} DH livraison</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pricing-section__cta">
          <button
            className="btn btn--gold btn--xl"
            onClick={scrollToOrder}
          >
            Je commence ma routine →
          </button>
          <p className="pricing-section__guarantee">
            ✓ Paiement à la livraison · ✓ Retour gratuit sous 30 jours · ✓ Support WhatsApp 7j/7
          </p>
        </div>
      </div>
    </section>
  );
}
