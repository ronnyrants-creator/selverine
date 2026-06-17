import { ScrollReveal } from './ScrollReveal';

const REVIEWS = [
  {
    name: 'Salma B.',
    role: 'Directrice, 34 ans',
    quote: 'Après deux grossesses, mes cheveux n\'étaient plus les mêmes. SELVERINE a changé ma relation à mon cuir chevelu. Dès la 4ème semaine, je voyais une différence.',
    featured: false,
  },
  {
    name: 'Imane K.',
    role: 'Entrepreneur, 29 ans',
    quote: 'J\'avais essayé beaucoup de choses. Rien ne se comparait à ça. La texture est incroyable — on oublie qu\'on l\'a mis. Les résultats parlent d\'eux-mêmes après 8 semaines.',
    featured: true,
  },
  {
    name: 'Zineb R.',
    role: 'Médecin, 38 ans',
    quote: 'Le stress du travail avait impacté mes cheveux. SELVERINE est devenu mon rituel du matin — une façon de prendre soin de moi avant de prendre soin des autres.',
    featured: false,
  },
  {
    name: 'Nadia O.',
    role: 'Enseignante, 31 ans',
    quote: 'Cuir chevelu ultra-sec depuis mes 30 ans — squames constantes. En 5 semaines avec SELVERINE, tout a changé. Je peux enfin porter du noir sans me retourner.',
    featured: false,
  },
  {
    name: 'Meryem A.',
    role: 'Comptable, 36 ans',
    quote: 'Après mon deuxième post-partum, mes tempes étaient quasi vides. Deux mois de SELVERINE ont changé la donne. Ma coiffeuse me demande ce que j\'ai fait de différent.',
    featured: false,
  },
  {
    name: 'Khadija M.',
    role: 'Architecte, 28 ans',
    quote: 'Je pensais que c\'était génétique — ma mère a les mêmes cheveux fins. Après 6 semaines, j\'ai de vrais petits cheveux courts qui poussent sur la raie.',
    featured: false,
  },
];

export function Testimonials() {
  return (
    <section className="testimonials section-white" id="avis">
      <div className="container">
        <ScrollReveal className="testimonials__header">
          <p className="eyebrow">Elles témoignent</p>
          <h2 className="section-headline">Des femmes réelles.<br /><em>Des résultats réels.</em></h2>
          <div className="testimonials__count">
            <span className="count-num">15 000+</span>
            <span className="count-label">femmes ont transformé leur routine capillaire avec SELVERINE</span>
          </div>
        </ScrollReveal>

        <div className="testimonials__grid">
          {REVIEWS.map(({ name, role, quote, featured }, i) => (
            <ScrollReveal key={name} delay={i * 100} className={`testimonial-card${featured ? ' testimonial-card--featured' : ''}`}>
              <div className="testimonial-card__stars">★★★★★</div>
              <blockquote>"{quote}"</blockquote>
              <cite>{name} · {role}</cite>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
