import { ScrollReveal } from './ScrollReveal';

const CARDS = [
  { title: 'Transparence Totale',   body: 'INCI complet disponible. Aucun ingrédient caché, aucune formule secrète — juste de la science partagée.' },
  { title: 'Philosophie Cuir Chevelu', body: 'Nous ne traitons pas la fibre. Nous soignons la source. Une approche rare dans l\'industrie cosmétique.' },
  { title: 'Standards Mondiaux',    body: 'Conforme aux recommandations de l\'OMS. Évalué selon les protocoles ENSA pour la sécurité et l\'efficacité.' },
  { title: 'Accompagnement Expert', body: 'Une équipe disponible pour répondre à vos questions — sur la formule, le rituel, et vos résultats.' },
];

const ICONS = [
  <svg key="a" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18382F" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  <svg key="b" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18382F" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  <svg key="c" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18382F" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg key="d" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18382F" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
];

export function Trust() {
  return (
    <section className="trust-section section-beige" id="confiance">
      <div className="container">
        <ScrollReveal className="trust-section__header">
          <p className="eyebrow">Nos Engagements</p>
          <h2 className="section-headline">La confiance ne s'annonce pas.<br /><em>Elle se prouve.</em></h2>
        </ScrollReveal>
        <div className="trust-cards trust-cards--4">
          {CARDS.map(({ title, body }, i) => (
            <ScrollReveal key={title} delay={i * 100} className="trust-card">
              <div className="trust-card__icon">{ICONS[i]}</div>
              <h3>{title}</h3>
              <p>{body}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
