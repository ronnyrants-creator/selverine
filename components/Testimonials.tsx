import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

const REVIEWS = [
  { name: 'Salma B.', city: 'Casablanca', role: 'Directrice, 34 ans', quote: 'Après deux grossesses, mes cheveux n\'étaient plus les mêmes. SELVERINE a changé ma relation à mon cuir chevelu. Dès la 4ème semaine, je voyais une différence.', featured: false },
  { name: 'Imane K.', city: 'Rabat',       role: 'Entrepreneur, 29 ans', quote: 'J\'avais essayé beaucoup de choses. Rien ne se comparait à ça. La texture est incroyable — on oublie qu\'on l\'a mis. Les résultats parlent d\'eux-mêmes après 8 semaines.', featured: true },
  { name: 'Zineb R.', city: 'Marrakech',   role: 'Médecin, 38 ans', quote: 'Le stress du travail avait impacté mes cheveux. SELVERINE est devenu mon rituel du matin — une façon de prendre soin de moi avant de prendre soin des autres.', featured: false },
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
          {REVIEWS.map(({ name, city, quote, featured }, i) => (
            <ScrollReveal key={name} delay={i * 100} className={`testimonial-card${featured ? ' testimonial-card--featured' : ''}`}>
              <div className="testimonial-card__portrait">
                <ImageFrame variant="circle" label="PORTRAIT 1:1" />
              </div>
              <div className="testimonial-card__stars">★★★★★</div>
              <blockquote>"{quote}"</blockquote>
              <cite>{name} · {city}</cite>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
