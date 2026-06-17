'use client';
import { useCart } from '@/context/CartContext';

const TRUST = [
  'â˜…â˜…â˜…â˜…â˜… +15 000 clientes',
  'Livraison 24-48h au Maroc',
  'Paiement Ã  la livraison',
  'Support WhatsApp 7j/7',
  ];

interface Props {
  headline?: string;
  urgency?: string;
  cta?: string;
  bundle?: 1 | 2 | 3;
  dark?: boolean;
}

export function CtaBlock({
  headline,
  urgency = 'ExpÃ©diÃ© aujourd\'hui avant 14h Â· Stock limitÃ©',
  cta = 'Je commence ma routine',
  bundle = 2,
  dark = false,
}: Props) {
  const { selectAndOrder } = useCart();

  return (
    <div className={`cta-block${dark ? ' cta-block--dark' : ''}`}>
      <div className="cta-block__inner">
        <div className="cta-block__trust">
          {TRUST.map(t => (
            <span key={t} className="cta-block__trust-item">{t}</span>
          ))}
        </div>
        {headline && <p className="cta-block__headline">{headline}</p>}
        <div className="cta-block__row">
          <p className="cta-block__urgency">âš¡ {urgency}</p>
          <button
            className="btn btn--gold btn--lg"
            onClick={() => selectAndOrder(bundle)}
          >
            {cta} â†’
          </button>
        </div>
      </div>
    </div>
  );
}

