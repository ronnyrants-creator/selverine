import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

export function FinalCTA() {
  return (
    <section className="cta-final section-dark" id="acheter">
      <div className="container container--narrow">
        <div className="cta-final__inner">
          <div className="cta-final__product">
            <ImageFrame variant="product-lg" label="PRODUCT HERO 3:4" desc="Flacon SELVERINE. Ã‰clairage luxe, Ã©tiquette visible." />
          </div>
          <ScrollReveal className="cta-final__content">
            <p className="eyebrow eyebrow--light">Commencez dÃ¨s aujourd'hui</p>
            <h2 className="cta-final__headline">Le soin commence<br /><em>Ã  la racine.</em></h2>
            <p className="cta-final__sub">Plus de 15 000 femmes au Maroc ont retrouvÃ© des cheveux plus forts et plus denses avec SELVERINE.</p>
            <div className="cta-final__offer">
              <div className="offer-price">
                <span className="offer-price__amount">299 DH</span>
                <span className="offer-price__unit">/ flacon 50ml â€” 6 Ã  8 semaines de cure</span>
              </div>
              <div className="offer-badge">ðŸšš Livraison offerte dÃ¨s 2 flacons</div>
            </div>
            <a href="#pricing" className="btn btn--gold btn--xl">Voir les offres â†’</a>
            <div className="cta-trust-row">
              {[
                'Paiement Ã  la livraison',
                'Livraison 24-48h au Maroc',
                              ].map(t => (
                <span key={t}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

