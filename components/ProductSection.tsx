import { ImageFrame } from '@/components/ImageFrame';

const BENEFITS = [
  {
    num: '01',
    title: 'Nourrit à la racine',
    body: 'Les actifs pénètrent le cuir chevelu — pas seulement la surface du cheveu. Le résultat se construit semaine après semaine.',
  },
  {
    num: '02',
    title: 'Non gras. Zéro résidu.',
    body: 'Formule légère à base d\'huile sèche. Vous pouvez l\'appliquer le matin avant de sortir, sans re-laver.',
  },
  {
    num: '03',
    title: 'Rituel 60 secondes',
    body: 'Quelques gouttes, un massage doux de 60 secondes. C\'est tout. Conçu pour les femmes qui n\'ont pas de temps à perdre.',
  },
];

const COMPARE = [
  { label: 'Texture',         ordinary: 'Lourde, grasse',          selverine: 'Légère, sèche' },
  { label: 'Résidu',          ordinary: 'Visible sur cheveux',      selverine: 'Zéro résidu' },
  { label: 'Absorption',      ordinary: 'En surface',               selverine: 'Cuir chevelu profond' },
  { label: 'Temps séchage',   ordinary: '30–60 min',                selverine: 'Immédiat' },
  { label: 'Silicones',       ordinary: '✓ Présents',               selverine: '✗ Absence totale' },
  { label: 'Parabènes',       ordinary: '✓ Présents',               selverine: '✗ Absence totale' },
];

export function ProductSection() {
  return (
    <section className="product-section">
      <div className="section-inner">

        <div className="product-section__header">
          <p className="product-section__eyebrow">La différence SELVERINE</p>
          <h2 className="product-section__headline">
            Pas une huile ordinaire.<br />
            <em>Une formule de laboratoire.</em>
          </h2>
        </div>

        <div className="product-section__grid">
          <div className="product-section__image">
            <ImageFrame
              variant="product-lg"
              label="Flacon SELVERINE — packshot"
              desc="Flacon en verre ambré 50ml · Compte-gouttes en liège · Fond lin naturel · Branche verte séchée · Lumière latérale douce · Style pharmacie de luxe · Ombres subtiles · Couleur Forest Green"
            />
          </div>
          <div className="product-section__benefits">
            {BENEFITS.map((b) => (
              <div key={b.num} className="benefit-row">
                <span className="benefit-row__num">{b.num}</span>
                <div>
                  <h3 className="benefit-row__title">{b.title}</h3>
                  <p className="benefit-row__body">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="compare-table">
          <h3 className="compare-table__title">Huile ordinaire vs SELVERINE</h3>
          <div className="compare-table__wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th className="compare-table__col--bad">Huile ordinaire</th>
                  <th className="compare-table__col--good">SELVERINE</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label}>
                    <td className="compare-table__label">{row.label}</td>
                    <td className="compare-table__bad">{row.ordinary}</td>
                    <td className="compare-table__good">{row.selverine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
