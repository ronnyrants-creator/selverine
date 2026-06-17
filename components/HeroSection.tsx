import { ImageFrame } from '@/components/ImageFrame';

export function HeroSection() {
  return (
    <section className="hero-v2" id="hero">
      <div className="hero-v2__grid">

        {/* ── IMAGE ── */}
        <div className="hero-v2__media">
          <ImageFrame
            variant="hero"
            label="SELVERINE — Photo produit héros"
            desc="Femme marocaine, 28–35 ans · Salle de bain lumineuse · Lumière naturelle matinale · Chemise blanche oversize · Tient le flacon SELVERINE vers l'objectif · Cheveux volumineux et naturels · Regard direct, expression sereine · Style éditorial premium"
          />
          <div className="hero-v2__badge-row">
            <span className="hero-v2__badge">★★★★★ Avis vérifiés</span>
            <span className="hero-v2__badge">🚚 Livraison 24-48h</span>
            <span className="hero-v2__badge">💳 Paiement à la livraison</span>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="hero-v2__content">
          <p className="hero-v2__eyebrow">Rituel capillaire · Formulé en laboratoire · Maroc</p>

          <h1 className="hero-v2__headline">
            Arrêtez de perdre<br />
            <em>vos cheveux.</em><br />
            Nourrissez vos racines.
          </h1>

          <p className="hero-v2__sub">
            SELVERINE agit là où ça compte — le cuir chevelu.
            Non gras, absorbé en 60 secondes. Livré partout au Maroc en 24-48h.
          </p>

          <ul className="hero-v2__bullets">
            <li>✓ Résultats visibles dès la 3e semaine</li>
            <li>✓ Non gras — partez directement après l'application</li>
            <li>✓ Sans silicones, sans parabènes, testé dermato</li>
          </ul>

          <div className="hero-v2__cta-group">
            <a href="#pricing" className="btn btn--gold btn--xl">
              Commencer ma routine →
            </a>
            <p className="hero-v2__cta-note">
              Paiement à la livraison · Retour gratuit 30 jours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
