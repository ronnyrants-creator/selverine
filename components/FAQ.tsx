'use client';
import { useState } from 'react';

const ITEMS = [
  {
    q: 'Comment passer commande au Maroc ?',
    a: 'Choisissez votre offre sur cette page, remplissez le formulaire (nom, tÃ©lÃ©phone, ville), et confirmez. Notre Ã©quipe vous appellera dans les 2 heures pour valider la livraison. Vous payez en espÃ¨ces Ã  la rÃ©ception.',
  },
  {
    q: 'Est-ce que SELVERINE rend les cheveux gras ?',
    a: 'Non. La formule est Ã  base d\'huile sÃ¨che â€” elle est absorbÃ©e rapidement sans laisser de rÃ©sidu. Vous pouvez l\'appliquer le matin avant de sortir, sans re-laver vos cheveux.',
  },
  {
    q: 'Pour quel type de chute de cheveux est-ce adaptÃ© ?',
    a: 'SELVERINE est conÃ§u pour la chute rÃ©actionnelle liÃ©e au stress, aux fluctuations hormonales, au post-partum ou Ã  la fatigue. Pour une alopÃ©cie avancÃ©e ou diagnostiquÃ©e, consultez un dermatologue.',
  },
  {
    q: 'Combien de temps dure un flacon ?',
    a: 'Un flacon 50ml dure 6 Ã  8 semaines avec une application quotidienne (4 Ã  6 gouttes). Le pack 3 flacons couvre une cure de 4 Ã  5 mois â€” la durÃ©e recommandÃ©e pour des rÃ©sultats durables.',
  },
  {
    q: 'Puis-je l\'utiliser enceinte ou pendant l\'allaitement ?',
    a: 'Par prÃ©caution, consultez votre mÃ©decin avant toute utilisation. La formule ne contient aucun perturbateur endocrinien connu, mais chaque situation mÃ©dicale est diffÃ©rente.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq" id="faq">
      <div className="section-inner">
        <p className="faq__eyebrow">Questions frÃ©quentes</p>
        <h2 className="faq__headline">
          Vos questions.<br />Nos rÃ©ponses.
        </h2>

        <div className="faq__list">
          {ITEMS.map(({ q, a }, i) => (
            <div className="faq__item" key={i}>
              <button
                className="faq__question"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{q}</span>
                <span className={`faq__icon${open === i ? ' faq__icon--open' : ''}`} aria-hidden>+</span>
              </button>
              <div className={`faq__answer${open === i ? ' faq__answer--open' : ''}`}>
                <div className="faq__answer-inner">{a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

