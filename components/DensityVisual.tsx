const METRICS = [
  { label: 'Densité capillaire',   before: 38, after: 74 },
  { label: 'Force de la racine',   before: 42, after: 81 },
  { label: 'Hydratation du cuir',  before: 29, after: 77 },
  { label: 'Volume perçu',         before: 35, after: 72 },
];

export function DensityVisual() {
  return (
    <section className="density-visual">
      <div className="section-inner">
        <p className="density-visual__eyebrow">Résultats observés</p>
        <h2 className="density-visual__headline">
          Ce que votre cuir chevelu<br /><em>peut retrouver.</em>
        </h2>
        <p className="density-visual__sub">
          Indicateurs constatés lors de l'utilisation régulière du rituel SELVERINE.
          Les résultats varient selon les profils.
        </p>

        <div className="density-bars">
          {METRICS.map((m) => (
            <div key={m.label} className="density-bar">
              <div className="density-bar__label">{m.label}</div>
              <div className="density-bar__tracks">
                <div className="density-bar__track density-bar__track--before">
                  <div
                    className="density-bar__fill density-bar__fill--before"
                    style={{ width: `${m.before}%` }}
                  />
                  <span className="density-bar__pct">{m.before}%</span>
                </div>
                <div className="density-bar__track density-bar__track--after">
                  <div
                    className="density-bar__fill density-bar__fill--after"
                    style={{ width: `${m.after}%` }}
                  />
                  <span className="density-bar__pct">{m.after}%</span>
                </div>
              </div>
              <div className="density-bar__legend">
                <span className="density-bar__legend-before">Avant</span>
                <span className="density-bar__legend-after">Après rituel</span>
              </div>
            </div>
          ))}
        </div>

        <p className="density-visual__disclaimer">
          * Résultats basés sur l'utilisation régulière. Les résultats individuels peuvent varier.
        </p>
      </div>
    </section>
  );
}
