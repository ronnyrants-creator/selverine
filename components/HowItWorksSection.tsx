const STEPS = [
  {
    num: '1',
    title: '60 secondes le matin',
    body: '5 à 7 gouttes sur le cuir chevelu. Massez doucement du bout des doigts. Pas de rinçage.',
    note: 'Non gras — prêt en 60 secondes.',
  },
  {
    num: '2',
    title: 'Constance, pas intensité',
    body: 'Appliquez chaque matin ou soir. La régularité fait la différence, pas la quantité.',
    note: 'Résultats progressifs et durables.',
  },
  {
    num: '3',
    title: 'Votre cuir chevelu se nourrit',
    body: 'Semaine après semaine, vos racines retrouvent un environnement sain pour se fortifier.',
    note: 'La science travaille pendant que vous vivez.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="how-it-works">
      <div className="section-inner">
        <p className="how-it-works__eyebrow">Le rituel en 3 étapes</p>
        <h2 className="how-it-works__headline">
          60 secondes par jour.<br /><em>Des résultats durables.</em>
        </h2>

        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.num} className="step-card">
              <div className="step-card__num">{s.num}</div>
              <h3 className="step-card__title">{s.title}</h3>
              <p className="step-card__body">{s.body}</p>
              <p className="step-card__note">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
