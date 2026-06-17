import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

const PAINS = [
  { title: 'Cheveux partout', body: "Sur l'oreiller, dans la douche, sur le siège de bureau. La quantité augmente sans raison apparente." },
  { title: 'Volume perdu',    body: "La queue-de-cheval est plus fine. La chevelure manque de corps. Les coiffures d'autrefois ne tiennent plus." },
  { title: 'Cuir chevelu visible', body: "La raie s'élargit. Vous changez votre façon de vous coiffer pour compenser ce que vous voyez." },
];

export function Moment() {
  return (
    <section className="moment section-beige" id="moment">
      <div className="container">
        <div className="moment__grid">
          <ScrollReveal className="moment__content">
            <p className="eyebrow">Le signal d'alarme</p>
            <h2 className="section-headline">Quand se brosser les cheveux<br />devient une source de stress.</h2>
            <p className="section-body" style={{ margin: '1.5rem 0 2rem' }}>
              Vous regardez la brosse. Vous comptez les cheveux perdus. Ce n'est pas de la coquetterie — c'est votre corps qui parle.
            </p>
            <div className="pain-cards">
              {PAINS.map(({ title, body }, i) => (
                <div className="pain-card" key={title} style={{ transitionDelay: `${i * 100}ms` }}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="moment__image">
            <ImageFrame variant="editorial" label="EDITORIAL 3:4" desc="Femme tenant sa brosse à cheveux pleine de cheveux perdus. Lumière douce, style éditorial premium." />
          </div>
        </div>
      </div>
    </section>
  );
}
