import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

const STEPS = [
  { n: '01', title: 'Le matin, avant de partir', body: 'Appliquez quelques gouttes directement sur le cuir chevelu sec ou légèrement humide.', desc: 'Flacon SELVERINE, salle de bain matinale.' },
  { n: '02', title: 'Massez doucement',           body: 'Effectuez des mouvements circulaires pendant 60 secondes pour activer la microcirculation.', desc: 'Mains massant le cuir chevelu. Style lifestyle.' },
  { n: '03', title: 'Laissez agir',               body: 'Aucun rinçage nécessaire. La formule ultra-légère est invisible et indétectable.', desc: 'Femme prête pour sa journée. Style éditorial.' },
];

export function Ritual() {
  return (
    <section className="ritual section-beige" id="ritual">
      <div className="container">
        <ScrollReveal className="ritual__header">
          <p className="eyebrow">Mode d'Emploi</p>
          <h2 className="section-headline">Trois gestes.<br /><em>Soixante secondes.</em></h2>
        </ScrollReveal>
        <div className="ritual__cards">
          {STEPS.map(({ n, title, body, desc }, i) => (
            <ScrollReveal key={n} delay={i * 150} className="ritual-card">
              <ImageFrame variant="portrait" label={`PORTRAIT 4:5`} desc={desc} />
              <div className="ritual-card__content">
                <span className="ritual-card__step">{n}</span>
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
