'use client';
import { useState } from 'react';

const LINKS = [
  { href: '#pricing',    label: 'Offres' },
  { href: '#order',      label: 'Commander' },
  { href: '#faq',        label: 'FAQ' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav" id="nav">
      <div className="nav__inner">
        <a href="#" className="nav__logo" onClick={close}>SELVERINE</a>

        <nav className="nav__links" aria-label="Navigation principale">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
        </nav>

        <div className="nav__cta">
          <a href="#order" className="btn btn--sm btn--gold">Commander →</a>
        </div>

        <button
          className={`nav__hamburger${open ? ' is-open' : ''}`}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen(p => !p)}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav__drawer${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!open}>
        {LINKS.map(l => (
          <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
        ))}
        <a href="#order" className="btn btn--gold nav__drawer-cta" onClick={close}>
          Commander — Paiement à la livraison
        </a>
      </div>
    </header>
  );
}
