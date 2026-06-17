const COLS = [
  {
    title: 'Produit',
    links: [
      ['#pricing',    'Offres & Tarifs'],
      ['#order',      'Commander'],
      ['#faq',        'FAQ'],
    ],
  },
  {
    title: 'Service',
    links: [
      ['#', 'Livraison au Maroc'],
      ['#', 'Retours & Remboursements'],
      ['https://wa.me/212600000000', 'WhatsApp Support'],
    ],
  },
  {
    title: 'Légal',
    links: [
      ['#', 'Mentions légales'],
      ['#', 'Confidentialité'],
      ['#', 'CGV'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">SELVERINE</span>
            <p className="footer__tagline">
              Rituel Capillaire Premium — Formulé en laboratoire.<br />
              Conçu pour les femmes actives du Maroc.
            </p>
            <div className="footer__trust">
              <span>💳 Paiement à la livraison</span>
              <span>🚚 Livraison 24-48h</span>
              <span>↩ 30 jours satisfaite ou remboursée</span>
            </div>
            <div className="footer__socials">
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
              </a>
              <a href="#" aria-label="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>
              <a href="https://wa.me/212600000000" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>
          <nav className="footer__nav" aria-label="Footer navigation">
            {COLS.map(({ title, links }) => (
              <div className="footer__col" key={title}>
                <h4>{title}</h4>
                {links.map(([href, label]) => (
                  <a key={label} href={href}>{label}</a>
                ))}
              </div>
            ))}
          </nav>
        </div>
        <div className="footer__bottom">
          <p>© 2026 SELVERINE. Tous droits réservés.</p>
          <p className="footer__made">Formulé avec soin · Livré au Maroc</p>
        </div>
      </div>
    </footer>
  );
}
