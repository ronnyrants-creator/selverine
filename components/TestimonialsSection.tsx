import { ImageFrame } from '@/components/ImageFrame';

const REVIEWS = [
  {
    name: 'Salma B.',
    city: 'Casablanca',
    stars: 5,
    date: 'Il y a 3 semaines',
    verified: true,
    quote: 'Je n\'osais plus me faire des queues de cheval à cause de ma raie. Après quelques semaines de SELVERINE, j\'ai récupéré une vraie densité. Non gras, ça ne laisse rien sur les cheveux. Je recommande vraiment.',
    detail: 'Cheveux fins · Utilisation quotidienne',
  },
  {
    name: 'Imane K.',
    city: 'Rabat',
    stars: 5,
    date: 'Il y a 1 mois',
    verified: true,
    quote: 'J\'ai testé beaucoup de produits. SELVERINE est différent parce que vous sentez réellement que ça travaille au niveau du cuir chevelu. La texture légère fait toute la différence pour une femme active.',
    detail: 'Cuir chevelu sensible · 2 mois d\'utilisation',
  },
  {
    name: 'Zineb R.',
    city: 'Marrakech',
    stars: 5,
    date: 'Il y a 2 mois',
    verified: true,
    quote: 'La livraison était rapide, le produit bien emballé. Mais ce qui m\'a convaincue c\'est le résultat. Moins de cheveux dans la brosse, plus de volume à la racine. Je vais commander le pack 3 flacons.',
    detail: 'Perte post-accouchement · Résultats visibles',
  },
];

export function TestimonialsSection() {
  return (
    <section className="testimonials-v2">
      <div className="section-inner">
        <p className="testimonials-v2__eyebrow">+15 000 femmes satisfaites au Maroc</p>
        <h2 className="testimonials-v2__headline">
          Elles ont essayé.<br /><em>Elles ont vu la différence.</em>
        </h2>

        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <div key={r.name} className="review-card">
              <div className="review-card__header">
                <div className="review-card__avatar">
                  <ImageFrame
                    variant="circle"
                    label={`Photo de ${r.name}`}
                    desc={`Femme marocaine · Portrait éditorial · Sourire naturel · ${r.city}`}
                  />
                </div>
                <div>
                  <p className="review-card__name">{r.name}</p>
                  <p className="review-card__city">{r.city}</p>
                </div>
                <div className="review-card__stars">
                  {'★'.repeat(r.stars)}
                </div>
              </div>
              <blockquote className="review-card__quote">
                "{r.quote}"
              </blockquote>
              <div className="review-card__footer">
                <span className="review-card__detail">{r.detail}</span>
                {r.verified && <span className="review-card__verified">✓ Achat vérifié</span>}
              </div>
              <p className="review-card__date">{r.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
