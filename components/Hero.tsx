import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

export function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__inner">

        <div className="hero__image">
          <ImageFrame variant="hero" label="HERO IMAGE 4:5" desc="Femme élégante tenant le flacon SELVERINE dans une salle de bain lumineuse." />
          <div className="hero__features">
            <span className="hero__chip">✓ Non gras · Absorption rapide</span>
            <span className="hero__chip">✓ Sans silicones · Sans parabènes</span>
            <span className="hero__chip">✓ Testé dermatologiquement</span>
          </div>
          <div className="hero__badge">
            <div className="hero__badge-count">15 000+</div>
            <div className="hero__badge-stars">★★★★★</div>
            <div className="hero__badge-label">femmes satisfaites</div>
          </div>
        </div>

        <ScrollReveal className="hero__content">
          <p className="eyebrow">Laboratoire Capillaire Premium</p>
          <h1 className="hero__headline">
            Votre chevelure mérite<br /><em>un soin de fond.</em>
          </h1>
          <p className="hero__sub">
            SELVERINE est le premier rituel quotidien du cuir chevelu conçu pour les femmes actives — efficace, non gras, résultats visibles dès la 3ème semaine.
          </p>

          <div className="authority-strip">
            {[
              { icon: '🛡', title: 'Conforme OMS', sub: 'Standards internationaux' },
              { icon: '✓', title: 'Certifié ENSA', sub: 'Évaluation indépendante' },
              { icon: '♥', title: 'Dermato-testé', sub: 'Peau sensible validée' },
            ].map(({ icon, title, sub }) => (
              <div className="authority-badge" key={title}>
                <div className="authority-badge__icon">{icon}</div>
                <div>
                  <strong>{title}</strong>
                  <span>{sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hero__actions">
            <a href="#form" className="btn btn--dark btn--lg">Commencer ma routine</a>
            <a href="#science" className="btn btn--ghost btn--lg">Voir la science</a>
          </div>

          <div className="hero__stats">
            <div className="hero__stat"><span className="hero__stat-num">15 000+</span><span className="hero__stat-label">femmes satisfaites</span></div>
            <div className="hero__stat-divider" />
            <div className="hero__stat"><span className="hero__stat-num">4.9 ★</span><span className="hero__stat-label">note moyenne</span></div>
            <div className="hero__stat-divider" />
            <div className="hero__stat"><span className="hero__stat-num">8 sem.</span><span className="hero__stat-label">résultats visibles</span></div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
