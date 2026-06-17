import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

const ITEMS = [
  { n: 1, name: 'Huile de Ricin Bio',         sci: 'Riche en acide ricinoléique, elle stimule la microcirculation et renforce l\'ancrage des follicules pileux.', benefit: 'Réduit la chute visible en 3–4 semaines', reverse: false },
  { n: 2, name: 'Extrait de Romarin',          sci: 'Les études cliniques montrent que l\'extrait de romarin rivalise avec le minoxidil pour stimuler la repousse — sans effets secondaires.', benefit: 'Stimule la repousse, clarifie le cuir chevelu', reverse: true },
  { n: 3, name: 'Huile de Jojoba',             sci: 'Mimétique du sébum naturel, elle régule la production de sébum et nourrit profondément sans obstruer les follicules.', benefit: 'Équilibre et nourrit sans alourdir', reverse: false },
  { n: 4, name: 'Panthénol (Pro-Vitamine B5)', sci: 'Agent humectant puissant, il pénètre la fibre capillaire et renforce la structure de la kératine de l\'intérieur.', benefit: 'Densité et brillance dès la 1ère utilisation', reverse: true },
];

export function Ingredients() {
  return (
    <section className="ingredients section-white" id="ingredients">
      <div className="container">
        <ScrollReveal className="ingredients__header">
          <p className="eyebrow">Formulation Premium</p>
          <h2 className="section-headline">Chaque ingrédient<br /><em>a une raison d'être.</em></h2>
          <p className="section-body" style={{ maxWidth: 520, margin: '1rem auto 0' }}>
            Nous n'ajoutons rien pour remplir. Chaque composant est sélectionné pour son efficacité clinique.
          </p>
        </ScrollReveal>

        <div className="ingredients__list">
          {ITEMS.map(({ n, name, sci, benefit, reverse }) => (
            <ScrollReveal key={n} className={`ingredient-card${reverse ? ' ingredient-card--reverse' : ''}`}>
              <div className="ingredient-card__image">
                <ImageFrame variant="square" label={`INGREDIENT 1:1`} desc={name} />
              </div>
              <div className="ingredient-card__content">
                <p className="eyebrow">Actif N°{n}</p>
                <h3>{name}</h3>
                <p className="ingredient-science">{sci}</p>
                <div className="ingredient-benefit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B99A5A" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  {benefit}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
