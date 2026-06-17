const MOMENTS = [
  { time: '07h00', icon: '☀️', title: 'Réveil',        body: 'Votre alarme sonne. Vous avez 45 minutes.' },
  { time: '07h10', icon: '☕', title: 'Café',           body: 'Votre rituel du matin commence.' },
  { time: '07h15', icon: '💧', title: 'SELVERINE',      body: '5 gouttes. 60 secondes de massage. C\'est tout.', highlight: true },
  { time: '07h16', icon: '✅', title: 'Prêt(e)',        body: 'Non gras. Pas de résidu. Réunion dans l\'heure.' },
  { time: '09h00', icon: '💼', title: 'Première réunion', body: 'Vous êtes concentrée. Pas vos cheveux.' },
];

export function MorningTimeline() {
  return (
    <section className="morning-timeline">
      <div className="section-inner">
        <p className="morning-timeline__eyebrow">Votre matinée avec SELVERINE</p>
        <h2 className="morning-timeline__headline">
          60 secondes.<br /><em>Toute la journée.</em>
        </h2>

        <div className="timeline">
          {MOMENTS.map((m, i) => (
            <div key={m.time} className={`timeline-item${m.highlight ? ' timeline-item--highlight' : ''}`}>
              <div className="timeline-item__time">{m.time}</div>
              <div className="timeline-item__connector">
                <div className="timeline-item__dot" />
                {i < MOMENTS.length - 1 && <div className="timeline-item__line" />}
              </div>
              <div className="timeline-item__content">
                <span className="timeline-item__icon">{m.icon}</span>
                <h3 className="timeline-item__title">{m.title}</h3>
                <p className="timeline-item__body">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
