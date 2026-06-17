'use client';
import { useState } from 'react';

export function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [fields, setFields] = useState({ fullname: '', phone: '', city: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    setTimeout(() => { setStatus('idle'); setFields({ fullname: '', phone: '', city: '' }); }, 4000);
  };

  return (
    <section className="lead-form-section section-dark" id="form">
      <div className="container">
        <div className="lead-form__inner">
          <div className="lead-form__left">
            <p className="eyebrow eyebrow--light">Commencer Maintenant</p>
            <h2 className="lead-form__headline">Votre routine<br />commence <em>ici.</em></h2>
            <p className="lead-form__sub">Notre équipe vous contacte sous 24h pour personnaliser votre rituel SELVERINE.</p>
            <ul className="lead-form__trust">
              {['Livraison rapide', 'Paiement à la livraison', 'Satisfaite ou remboursée'].map(t => (
                <li key={t}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B99A5A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <form className="lead-form__form" onSubmit={handleSubmit} noValidate>
            {status === 'success' ? (
              <div className="lead-form__success">
                <span>✓</span>
                <p>Merci {fields.fullname || ''}! On vous contacte très bientôt.</p>
              </div>
            ) : (
              <>
                {([
                  { id: 'fullname', label: 'Nom complet', placeholder: 'Salma Benali', type: 'text', autocomplete: 'name' },
                  { id: 'phone',    label: 'Téléphone',   placeholder: '+212 6 00 00 00 00', type: 'tel', autocomplete: 'tel' },
                  { id: 'city',     label: 'Ville',       placeholder: 'Casablanca', type: 'text', autocomplete: 'address-level2' },
                ] as const).map(({ id, label, placeholder, type, autocomplete }) => (
                  <div className="form-group" key={id}>
                    <label htmlFor={id}>{label}</label>
                    <input
                      id={id}
                      name={id}
                      type={type}
                      autoComplete={autocomplete}
                      placeholder={placeholder}
                      inputMode={type === 'tel' ? 'tel' : 'text'}
                      value={fields[id as keyof typeof fields]}
                      onChange={e => setFields(f => ({ ...f, [id]: e.target.value }))}
                      required
                    />
                  </div>
                ))}
                <button type="submit" className="btn btn--gold btn--lg form-submit">
                  Commencer ma routine →
                </button>
                <p className="form-note">Vos informations sont confidentielles.</p>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
