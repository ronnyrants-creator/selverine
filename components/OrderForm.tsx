'use client';
import { useState } from 'react';
import { BUNDLES, useCart, type BundleQty } from '@/context/CartContext';

interface FormState {
  name: string;
  phone: string;
  city: string;
}

const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'FÃ¨s', 'Tanger', 'Agadir',
  'MeknÃ¨s', 'Oujda', 'KÃ©nitra', 'TÃ©touan', 'SalÃ©', 'Autre',
];

export function OrderForm() {
  const { bundle, setBundle } = useCart();
  const [form, setForm] = useState<FormState>({ name: '', phone: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const selected = BUNDLES.find(b => b.qty === bundle)!;
  const total = selected.price + selected.shipping;
  const [orderNum, setOrderNum] = useState('');

  function update(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  }

  function validate() {
    if (!form.name.trim()) return 'Veuillez saisir votre nom complet.';
    if (!/^[0-9\s\+]{9,15}$/.test(form.phone.replace(/\s/g, '')))
      return 'NumÃ©ro de tÃ©lÃ©phone invalide (ex: 06 12 34 56 78).';
    if (!form.city) return 'Veuillez sÃ©lectionner votre ville.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);

    try {
      const ref = `SLV-${Date.now().toString(36).toUpperCase()}`;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          city: form.city,
          bundle: selected.qty,
          total,
          ref,
        }),
      });

      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setOrderNum(data.ref ?? ref);
      setDone(true);
    } catch {
      setError('Une erreur est survenue. Veuillez rÃ©essayer.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <section className="order-form-section" id="order">
        <div className="section-inner">
          <div className="order-success">
            <div className="order-success__icon">âœ“</div>
            <h2 className="order-success__title">Commande confirmÃ©e !</h2>
            <p className="order-success__ref">RÃ©fÃ©rence : <strong>{orderNum}</strong></p>
            <p className="order-success__body">
              Merci {form.name.split(' ')[0]} â€” votre commande est bien enregistrÃ©e.
              Notre Ã©quipe vous contactera dans les 2 heures pour confirmer la livraison.
            </p>
            <div className="order-success__details">
              <p><strong>{selected.label}</strong> â€” {total} DH</p>
              <p>Paiement Ã  la livraison Â· Livraison Ã  {form.city}</p>
            </div>
            <a
              href={`https://wa.me/212600000000?text=Bonjour, j'ai passÃ© une commande SELVERINE. RÃ©f: ${orderNum}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp"
            >
              ðŸ“² Confirmer via WhatsApp
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="order-form-section" id="order">
      <div className="section-inner">
        <div className="order-form-wrap">

          {/* â”€â”€ LEFT: Summary â”€â”€ */}
          <div className="order-summary">
            <h3 className="order-summary__title">Votre commande</h3>

            {/* Bundle Selector */}
            <div className="order-summary__bundles">
              {BUNDLES.map((b) => (
                <div
                  key={b.qty}
                  className={`order-bundle${bundle === b.qty ? ' order-bundle--on' : ''}`}
                  onClick={() => setBundle(b.qty as BundleQty)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setBundle(b.qty as BundleQty)}
                >
                  <span className={`order-bundle__dot${bundle === b.qty ? ' order-bundle__dot--on' : ''}`} />
                  <span className="order-bundle__label">{b.label}</span>
                  {b.badge && <span className="order-bundle__badge">{b.badge}</span>}
                  <span className="order-bundle__price">{b.price} DH</span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="order-summary__breakdown">
              <div className="order-summary__line">
                <span>{selected.label}</span>
                <span>{selected.price} DH</span>
              </div>
              <div className="order-summary__line">
                <span>Livraison</span>
                <span>{selected.shipping === 0 ? 'Offerte ðŸŽ' : `${selected.shipping} DH`}</span>
              </div>
              {selected.original > selected.price && (
                <div className="order-summary__line order-summary__line--savings">
                  <span>Ã‰conomie</span>
                  <span>âˆ’{selected.original - selected.price} DH</span>
                </div>
              )}
              <div className="order-summary__total">
                <span>Total</span>
                <span>{total} DH</span>
              </div>
            </div>

            {/* Trust */}
            <div className="order-summary__trust">
              <p>ðŸ’³ Paiement Ã  la livraison</p>
              <p>ðŸšš Livraison 24-48h au Maroc</p>              <p>ðŸ“² Support WhatsApp inclus</p>
            </div>
          </div>

          {/* â”€â”€ RIGHT: Form â”€â”€ */}
          <form className="order-form" onSubmit={handleSubmit} noValidate>
            <h2 className="order-form__title">Finaliser ma commande</h2>
            <p className="order-form__sub">Vous payez en espÃ¨ces Ã  la rÃ©ception du colis.</p>

            <div className="form-field">
              <label htmlFor="order-name" className="form-label">Nom complet *</label>
              <input
                id="order-name"
                type="text"
                className="form-input"
                placeholder="Votre prÃ©nom et nom"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="order-phone" className="form-label">TÃ©lÃ©phone *</label>
              <input
                id="order-phone"
                type="tel"
                inputMode="tel"
                className="form-input"
                placeholder="06 XX XX XX XX"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                autoComplete="tel"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="order-city" className="form-label">Ville *</label>
              <select
                id="order-city"
                className="form-input form-select"
                value={form.city}
                onChange={e => update('city', e.target.value)}
                required
              >
                <option value="">SÃ©lectionnez votre ville</option>
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="form-error" role="alert">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn--gold btn--xl btn--full"
              disabled={loading}
            >
              {loading ? 'Traitement en coursâ€¦' : `Confirmer la commande â€” ${total} DH`}
            </button>

            <p className="order-form__note">
              Aucun paiement maintenant Â· Vous payez Ã  la livraison
            </p>
          </form>

        </div>
      </div>
    </section>
  );
}

