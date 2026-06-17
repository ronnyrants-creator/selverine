import { ImageFrame } from '@/components/ImageFrame';

export function ShelfBeauty() {
  return (
    <section className="shelf-beauty">
      <div className="section-inner">
        <div className="shelf-beauty__grid">
          <div className="shelf-beauty__image">
            <ImageFrame
              variant="tall"
              label="SELVERINE sur une étagère de salle de bain"
              desc="Étagère salle de bain épurée · Carrelage zellige vert · Flacon SELVERINE au centre · Bougies neutres · Plante verte · Serviette beige roulée · Lumière chaude · Style intérieur marocain moderne · Tons Forest Green et Warm Beige"
            />
          </div>
          <div className="shelf-beauty__content">
            <p className="shelf-beauty__eyebrow">Votre nouvelle routine matinale</p>
            <h2 className="shelf-beauty__headline">
              Simple à adopter.<br /><em>Impossible à lâcher.</em>
            </h2>
            <p className="shelf-beauty__body">
              Pas besoin de revoir toute votre routine.
              SELVERINE s'intègre en 60 secondes — avant votre douche,
              avant de sortir, ou à n'importe quel moment de la journée.
            </p>
            <ul className="shelf-beauty__list">
              <li>✓ Flacon élégant pensé pour votre salle de bain</li>
              <li>✓ Format voyage inclus dans le pack 3 flacons</li>
              <li>✓ Parfum boisé discret — aucune trace sur vos vêtements</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
