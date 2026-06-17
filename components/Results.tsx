import { ScrollReveal } from './ScrollReveal';

const WEEKS = [
  { label: 'Semaine 1', title: 'Le cuir chevelu respire',  body: 'Sensation de confort immédiate. Le cuir chevelu est apaisé, moins sensible. La routine s\'installe naturellement.' },
  { label: 'Semaine 3', title: 'La chute ralentit',         body: 'Moins de cheveux dans la brosse. Moins sur l\'oreiller. Le follicule se renforce, l\'ancrage s\'améliore.' },
  { label: 'Semaine 8', title: 'La confiance revient',      body: 'Densité visible. Volume retrouvé. Des petits cheveux courts — le signe que la repousse est active.' },
];

export function Results() {
  return (
    <section className="results section-dark" id="resultats">
      <div className="container container--narrow">
        <ScrollReveal className="results__header">
          <p className="eyebrow eyebrow--light">Le Parcours de Confiance</p>
          <h2 className="section-headline section-headline--light">Ce que vous ressentirez<br /><em>semaine après semaine.</em></h2>
        </ScrollReveal>
        <div className="timeline">
          <div className="timeline__line" aria-hidden="true" />
          {WEEKS.map(({ label, title, body }, i) => (
            <ScrollReveal key={label} delay={i * 150} className="timeline-item">
              <div className="timeline-item__marker"><span>{label}</span></div>
              <div className="timeline-item__content">
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
