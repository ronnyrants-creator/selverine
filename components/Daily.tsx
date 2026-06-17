import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

export function Daily() {
  return (
    <section className="daily section-white" id="quotidien">
      <div className="container">
        <div className="daily__grid">
          <div className="daily__image">
            <ImageFrame variant="tall" label="LIFESTYLE 9:16" desc="Femme appliquant SELVERINE. Salle de bain minimaliste, lumière naturelle. Café posé à côté du lavabo." />
          </div>
          <ScrollReveal className="daily__content">
            <p className="eyebrow">Le Rituel Quotidien</p>
            <h2 className="section-headline">Une minute pour vous.<br /><em>Avant que la journée commence.</em></h2>
            <p className="section-body">Le rituel SELVERINE n'est pas une corvée de plus. C'est un moment de conscience — un acte de soin que vous vous accordez avant d'accorder votre temps au reste du monde.</p>
            <p className="section-body" style={{ marginTop: '1rem' }}>Appliquez. Massez. Respirez. Partez.</p>
            <a href="#form" className="btn btn--dark btn--lg" style={{ marginTop: '2rem', display: 'inline-flex' }}>Commencer mon rituel</a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
