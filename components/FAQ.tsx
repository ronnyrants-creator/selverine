'use client';
import { useState } from 'react';

const ITEMS = [
  {
    q: 'Comment passer commande au Maroc ?',
    a: 'Choisissez votre offre sur cette page, remplissez le formulaire (nom, téléphone, ville), et confirmez. Notre équipe vous appellera dans les 2 heures pour valider la livraison. Vous payez en espèces à la réception.',
  },
  {
    q: 'Est-ce que SELVERINE rend les cheveux gras ?',
    a: 'Non. La formule est à base d\'huile sèche — elle est absorbée rapidement sans laisser de résidu. Vous pouvez l\'appliquer le matin avant de sortir, sans re-laver vos cheveux.',
  },
  {
    q: 'Pour quel type de chute de cheveux est-ce adapté ?',
    a: 'SELVERINE est conçu pour la chute réactionnelle liée au stress, aux fluctuations hormonales, au post-partum ou à la fatigue. Pour une alopécie avancée ou diagnostiquée, consultez un dermatologue.',
  },
  {
    q: 'Combien de temps dure un flacon ?',
    a: 'Un flacon 50ml dure 6 à 8 semaines avec une application quotidienne (4 à 6 gouttes). Le pack 3 flacons couvre une cure de 4 à 5 mois — la durée recommandée pour des résultats durables.',
  },
  {
    q: 'Puis-je retourner le produit si je ne suis pas satisfaite ?',
    a: 'Oui. Garantie 30 jours : si vous n\'êtes pas satisfaite après utilisation régulière, nous remboursons intégralement. Contactez-nous sur WhatsApp, sans paperasse.',
  },
  {
    q: 'Puis-je l\'utiliser enceinte ou pendant l\'allaitement ?',
    a: 'Par précaution, consultez votre médecin avant toute utilisation. La formule ne contient aucun perturbateur endocrinien connu, mais chaque situation médicale est différente.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq" id="faq">
      <div className="section-inner">
        <p className="faq__eyebrow">Questions fréquentes</p>
        <h2 className="faq__headline">
          Vos questions.<br />Nos réponses.
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
