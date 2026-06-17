import { ImageFrame } from '@/components/ImageFrame';

const PAINS = [
  {
    icon: '🪮',
    title: 'Des cheveux partout.',
    body: 'Sur votre oreiller. Dans votre brosse. Sur votre veste noire avant une réunion.',
  },
  {
    icon: '🔍',
    title: 'Une raie qui s\'élargit.',
    body: 'Vous inclinez la tête pour cacher ce que le miroir révèle chaque matin.',
  },
  {
    icon: '📉',
    title: 'Un volume qui fond.',
    body: 'Les photos d\'il y a 3 ans. La même personne, pas les mêmes cheveux.',
  },
];

export function ProblemSection() {
  return (
    <section className="problem-section">
      <div className="section-inner">

        <div className="problem-section__intro">
          <p className="problem-section__eyebrow">Vous n'êtes pas seule</p>
          <h2 className="problem-section__headline">
            "Encore ces cheveux<br />
            dans ma brosse."
          </h2>
          <p className="problem-section__body">
            Vous inclinez la tête pour cacher ce que le miroir révèle.
            Vous changez de coiffure, pas par envie — par nécessité.
            Ce n'est pas une question de beauté. C'est votre santé capillaire qui parle.
          </p>
        </div>

        <div className="problem-section__grid">
          {PAINS.map((p) => (
            <div key={p.title} className="pain-card">
              <div className="pain-card__icon">{p.icon}</div>
              <h3 className="pain-card__title">{p.title}</h3>
              <p className="pain-card__body">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="problem-section__image">
          <ImageFrame
            variant="wide"
            label="Signal d'alarme — brosse chargée de cheveux"
            desc="Brosse ovale en bois · Nombreux cheveux · Fond marbre blanc · Lumière studio douce · Vue de dessus · Symbolise la perte quotidienne · Tons neutres naturels"
          />
        </div>

        <div className="problem-section__callout">
          <p>
            La chute de cheveux n'est pas une fatalité.<br />
            <strong>C'est un signal du cuir chevelu — et SELVERINE y répond directement.</strong>
          </p>
        </div>

      </div>
    </section>
  );
}
