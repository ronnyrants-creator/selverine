import { ImageFrame } from '@/components/ImageFrame';

const MOROCCAN_TRUST = [
  {
    icon: '💳',
    title: 'Paiement à la livraison',
    body: 'Vous recevez votre colis d\'abord, vous payez ensuite. En espèces. Sans risque.',
  },
  {
    icon: '🚚',
    title: 'Livraison 24-48h au Maroc',
    body: 'Partout au Maroc — expédié le jour même avant 14h.',
  },
  {
    icon: '📲',
    title: 'Support WhatsApp',
    body: 'Notre équipe répond en français et en darija, 7j/7 de 9h à 21h.',
  },
];

const INGREDIENTS = [
  { name: 'Huile de nigelle',    role: 'Fortifie la racine' },
  { name: 'Huile de ricin',      role: 'Densifie le cheveu' },
  { name: 'Argan bio',           role: 'Nourrit le cuir chevelu' },
  { name: 'Romarin actif',       role: 'Stimule la microcirculation' },
  { name: 'Panthénol (B5)',      role: 'Hydratation profonde' },
  { name: 'Kératine végétale',   role: 'Solidifie la fibre capillaire' },
];

export function TrustSection() {
  return (
    <section className="trust-section">
      <div className="section-inner">

        {/* Moroccan Trust */}
        <div className="trust-section__moroccan">
          <p className="trust-section__eyebrow">Conçu pour le Maroc · Livré au Maroc</p>
          <h2 className="trust-section__headline">
            Vous commandez aujourd'hui.<br /><em>Vous recevez demain.</em>
          </h2>

          <div className="moroccan-trust-grid">
            {MOROCCAN_TRUST.map((t) => (
              <div key={t.title} className="moroccan-card">
                <div className="moroccan-card__icon">{t.icon}</div>
                <h3 className="moroccan-card__title">{t.title}</h3>
                <p className="moroccan-card__body">{t.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="trust-section__ingredients">
          <div className="ingredients-layout">
            <div className="ingredients-layout__image">
              <ImageFrame
                variant="square"
                label="Ingrédients naturels SELVERINE"
                desc="Flat lay · Huile de nigelle · Flacon argan · Branche de romarin · Ricin · Fond lin blanc · Lumière naturelle douce · Style apothicaire moderne · Tons dorés naturels"
              />
            </div>
            <div className="ingredients-layout__list">
              <p className="trust-section__eyebrow">Une formule sans compromis</p>
              <h3 className="ingredients-layout__title">
                Des actifs naturels.<br /><em>Une efficacité prouvée.</em>
              </h3>
              <ul className="ingredients-list">
                {INGREDIENTS.map((ing) => (
                  <li key={ing.name} className="ingredients-list__item">
                    <span className="ingredients-list__name">{ing.name}</span>
                    <span className="ingredients-list__role">{ing.role}</span>
                  </li>
                ))}
              </ul>
              <div className="ingredients-layout__badges">
                <span className="ing-badge">Sans silicones</span>
                <span className="ing-badge">Sans parabènes</span>
                <span className="ing-badge">Sans sulfates</span>
                <span className="ing-badge">Vegan</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
