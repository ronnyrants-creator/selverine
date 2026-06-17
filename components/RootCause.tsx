import { ScrollReveal } from './ScrollReveal';

export function RootCause() {
  return (
    <section className="rootcause section-white" id="science">
      <div className="container">
        <ScrollReveal className="rootcause__header">
          <p className="eyebrow">La Science du Cuir Chevelu</p>
          <h2 className="section-headline">Tout commence <em>à la racine.</em></h2>
          <p className="section-body" style={{ maxWidth: 520, margin: '1rem auto 0' }}>
            Le cuir chevelu est le sol de votre chevelure. La plupart des soins traitent la fibre — SELVERINE traite la source.
          </p>
        </ScrollReveal>

        <div className="scalp-diagram">
          <div className="scalp-diagram__track">
            <ScrollReveal className="scalp-diagram__step scalp-diagram__step--bad" delay={0}>
              <svg viewBox="0 0 120 120" fill="none" className="diagram-svg">
                <rect x="10" y="55" width="100" height="16" rx="4" fill="#e8ddd2"/>
                <line x1="30" y1="55" x2="28" y2="20" stroke="#c4b09a" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="50" y1="55" x2="47" y2="18" stroke="#c4b09a" strokeWidth="2.5" strokeLinecap="round" opacity={0.5}/>
                <line x1="70" y1="55" x2="73" y2="22" stroke="#c4b09a" strokeWidth="2.5" strokeLinecap="round" opacity={0.7}/>
                <line x1="90" y1="55" x2="93" y2="19" stroke="#c4b09a" strokeWidth="2.5" strokeLinecap="round" opacity={0.4}/>
                <line x1="58" y1="38" x2="65" y2="90" stroke="#c4b09a" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round"/>
                <ellipse cx="30" cy="67" rx="5" ry="4" fill="#d4a89a"/>
                <ellipse cx="50" cy="67" rx="5" ry="4" fill="#d4a89a" opacity={0.6}/>
                <ellipse cx="70" cy="67" rx="5" ry="4" fill="#d4a89a" opacity={0.7}/>
                <ellipse cx="90" cy="67" rx="5" ry="4" fill="#d4a89a" opacity={0.5}/>
                <circle cx="60" cy="100" r="10" fill="#e8ddd2"/>
                <line x1="55" y1="95" x2="65" y2="105" stroke="#d4a89a" strokeWidth="2"/>
                <line x1="65" y1="95" x2="55" y2="105" stroke="#d4a89a" strokeWidth="2"/>
              </svg>
              <div className="diagram-label diagram-label--bad">
                <span className="diagram-label__tag">Sans soin</span>
                <h4>Cuir chevelu appauvri</h4>
                <ul><li>Follicules fragilisés</li><li>Circulation réduite</li><li>Chute accélérée</li></ul>
              </div>
            </ScrollReveal>

            <div className="scalp-diagram__arrow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#18382F"/>
                <path d="M8 12h8M14 9l3 3-3 3" stroke="#B99A5A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>SELVERINE</span>
            </div>

            <ScrollReveal className="scalp-diagram__step scalp-diagram__step--good" delay={200}>
              <svg viewBox="0 0 120 120" fill="none" className="diagram-svg">
                <rect x="10" y="55" width="100" height="16" rx="4" fill="#c8ddd5"/>
                <line x1="25" y1="55" x2="24" y2="15" stroke="#18382F" strokeWidth="3" strokeLinecap="round"/>
                <line x1="40" y1="55" x2="39" y2="12" stroke="#18382F" strokeWidth="3" strokeLinecap="round"/>
                <line x1="55" y1="55" x2="54" y2="10" stroke="#18382F" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="70" y1="55" x2="71" y2="12" stroke="#18382F" strokeWidth="3" strokeLinecap="round"/>
                <line x1="85" y1="55" x2="86" y2="15" stroke="#18382F" strokeWidth="3" strokeLinecap="round"/>
                <ellipse cx="25" cy="67" rx="6" ry="5" fill="#18382F" opacity={0.5}/>
                <ellipse cx="40" cy="67" rx="6" ry="5" fill="#18382F" opacity={0.5}/>
                <ellipse cx="55" cy="67" rx="7" ry="5" fill="#18382F" opacity={0.6}/>
                <ellipse cx="70" cy="67" rx="6" ry="5" fill="#18382F" opacity={0.5}/>
                <ellipse cx="85" cy="67" rx="6" ry="5" fill="#18382F" opacity={0.5}/>
                <circle cx="60" cy="100" r="10" fill="#c8ddd5"/>
                <path d="M55 100l3 3 7-7" stroke="#18382F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="diagram-label diagram-label--good">
                <span className="diagram-label__tag">Avec SELVERINE</span>
                <h4>Cuir chevelu régénéré</h4>
                <ul><li>Follicules renforcés</li><li>Microcirculation activée</li><li>Repousse stimulée</li></ul>
              </div>
            </ScrollReveal>
          </div>
        </div>

        <div className="rootcause__steps">
          {[
            { n: '01', t: 'Cuir chevelu sain', b: 'Circulation optimale, follicules nourris, production de sébum régulée.' },
            { n: '02', t: 'Racines solides',   b: "L'ancrage capillaire se renforce. Le cycle de croissance s'allonge naturellement." },
            { n: '03', t: 'Cheveux transformés', b: 'Densité, brillance, et résistance — sans artifice, sans compromis.' },
          ].map(({ n, t, b }, i) => (
            <ScrollReveal key={n} delay={i * 100} className="rootcause__step">
              <span className="rootcause__step-num">{n}</span>
              <div><strong>{t}</strong><p>{b}</p></div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
