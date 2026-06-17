/* ═══════════════════════════════════════════════
   SELVERINE — Premium Landing Page Scripts
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── SCROLL ANIMATIONS ──────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay) || 0;
        setTimeout(() => el.classList.add('in-view'), delay);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.fade-up, .fade-in')
    .forEach(el => revealObserver.observe(el));


  // ── STICKY BAR ─────────────────────────────────────────────
  const stickyBar = document.getElementById('stickyBar');
  const hero      = document.getElementById('hero');

  if (hero && stickyBar) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => stickyBar.classList.toggle('is-visible', !e.isIntersecting));
    }, { threshold: 0.2 }).observe(hero);
  }

  // ── STICKY BAR HEIGHT → CSS VAR (mobile only) ──────────────
  function syncStickyBarHeight() {
    if (window.innerWidth <= 768 && stickyBar) {
      document.documentElement.style.setProperty(
        '--mobile-cta-height',
        stickyBar.offsetHeight + 'px'
      );
    } else {
      document.documentElement.style.removeProperty('--mobile-cta-height');
    }
  }
  syncStickyBarHeight();
  window.addEventListener('resize', syncStickyBarHeight);


  // ── FAQ ACCORDION ──────────────────────────────────────────
  // Open first item on load
  const firstFaq = document.querySelector('.faq-item--open');
  if (firstFaq) {
    const firstAnswer = firstFaq.querySelector('.faq-item__answer');
    if (firstAnswer) firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
  }

  document.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-item').forEach(i => {
        i.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-item__answer').style.maxHeight = '0';
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });


  // ── BUNDLE SELECTION ───────────────────────────────────────
  let selectedBundle = { bundle: 2, price: 429 };

  const bundleInput       = document.getElementById('bundleInput');
  const priceInput        = document.getElementById('priceInput');
  const bundleSummaryName = document.getElementById('bundleSummaryName');
  const bundleSummaryDet  = document.getElementById('bundleSummaryDetail');
  const formSubmitBtn     = document.getElementById('formSubmitBtn');
  const heroCta           = document.getElementById('heroCta');
  const stickyPrice       = document.querySelector('.sticky-bar__price');

  const bundleDetails = {
    1: { name: 'Découverte',          detail: '1 bouteille · 269 DH',                      submitLabel: 'Commander — 269 DH →', heroLabel: 'Commencer ma routine · 269 DH →' },
    2: { name: 'Routine recommandée', detail: '2 bouteilles · 429 DH · Économisez 109 DH', submitLabel: 'Commander — 429 DH →', heroLabel: 'Commencer ma routine · 429 DH →' },
    3: { name: 'Cure complète',       detail: '3 bouteilles · 90 jours · Garantie incluse · 549 DH', submitLabel: 'Commander — 549 DH →', heroLabel: 'Commencer ma routine · 549 DH →' },
  };

  function selectBundle(bundle, price) {
    selectedBundle = { bundle, price };
    if (bundleInput)  bundleInput.value  = bundle;
    if (priceInput)   priceInput.value   = price;

    const info = bundleDetails[bundle];
    if (bundleSummaryName) bundleSummaryName.textContent = info.name;
    if (bundleSummaryDet)  bundleSummaryDet.textContent  = info.detail;
    if (formSubmitBtn)     formSubmitBtn.textContent      = info.submitLabel;
    if (heroCta)           heroCta.textContent            = info.heroLabel;
    if (stickyPrice)       stickyPrice.textContent        = price + ' DH';

    // Update hero bundle-option active state
    document.querySelectorAll('.bundle-option').forEach(el => el.classList.remove('bundle-option--active'));
    const activeEl = document.querySelector(`.bundle-option[data-bundle="${bundle}"]`);
    if (activeEl) activeEl.classList.add('bundle-option--active');

    // Sync modal: active state, hidden inputs, submit label
    document.querySelectorAll('.m-bundle').forEach(el =>
      el.classList.toggle('m-bundle--active', parseInt(el.dataset.bundle) === bundle));
    const mBundleInput = document.getElementById('mBundleInput');
    const mPriceInput  = document.getElementById('mPriceInput');
    const mSubmit      = document.getElementById('mSubmit');
    if (mBundleInput) mBundleInput.value = bundle;
    if (mPriceInput)  mPriceInput.value  = price;
    if (mSubmit)      mSubmit.textContent = `Confirmer ma commande — ${price} DH →`;
  }

  // Click on any bundle-option (in hero)
  document.querySelectorAll('.bundle-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const bundle = parseInt(opt.dataset.bundle);
      const price  = parseInt(opt.dataset.price);
      selectBundle(bundle, price);
    });
  });

  // Init default (popular — bundle 2)
  selectBundle(2, 429);


  // ── ORDER MODAL ────────────────────────────────────────────
  const orderModal = document.getElementById('orderModal');

  function openOrderModal() {
    if (!orderModal) return;
    orderModal.classList.add('is-open');
    orderModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => document.getElementById('mName')?.focus(), 350);
  }
  function closeOrderModal() {
    if (!orderModal) return;
    orderModal.classList.remove('is-open');
    orderModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  // Open from any [data-order] trigger
  document.querySelectorAll('[data-order]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openOrderModal();
    });
  });

  // "Modifier" link in form section also opens the modal
  document.querySelectorAll('.bundle-summary__change').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); openOrderModal(); });
  });

  // Close handlers
  if (orderModal) {
    orderModal.querySelectorAll('[data-close]').forEach(el =>
      el.addEventListener('click', closeOrderModal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && orderModal.classList.contains('is-open')) closeOrderModal();
    });
  }

  // Modal bundle selection
  document.querySelectorAll('.m-bundle').forEach(opt => {
    opt.addEventListener('click', () => {
      selectBundle(parseInt(opt.dataset.bundle), parseInt(opt.dataset.price));
    });
  });


  // ── TEXTURE BARS ───────────────────────────────────────────
  const textureSection = document.querySelector('.texture');
  const fills          = document.querySelectorAll('.texture-prop__fill');

  if (textureSection && fills.length) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          fills.forEach((fill, i) => setTimeout(() => fill.classList.add('animated'), i * 150));
        }
      });
    }, { threshold: 0.3 }).observe(textureSection);
  }


  // ── SMOOTH SCROLL (in-page anchors only) ───────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      if (link.hasAttribute('data-order')) return; // handled by modal opener
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── PAGE EXIT FADE for legal / thank-you links ─────────────
  document.querySelectorAll('a[href$=".html"], a[href^="/mentions"], a[href^="/confidentialite"], a[href^="/cgv"], a[href^="/livraison"], a[href^="/retours"], a[href^="/merci"]').forEach(link => {
    if (link.getAttribute('href')?.startsWith('#')) return;
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('mailto:')) return;
      e.preventDefault();
      document.body.style.transition = 'opacity 0.25s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 220);
    });
  });


  // ── NAV — shadow on scroll + hamburger ─────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (!nav) return;
    nav.style.boxShadow = window.scrollY > 60 ? '0 2px 20px rgba(0,0,0,0.06)' : '';
  }, { passive: true });

  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.querySelector('.nav__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    // Close on nav link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // ── PARALLAX HERO (desktop only — skip on touch devices) ───
  const heroImg = document.querySelector('.hero__image');
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (heroImg && !isTouchDevice) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroImg.style.transform = `translateY(${y * 0.12}px)`;
      }
    }, { passive: true });
  }


  // ── ORBIT FLOAT (desktop only) ─────────────────────────────
  if (!isTouchDevice) {
    document.querySelectorAll('.orbit-item').forEach((item, i) => {
      const amp   = 5 + i * 2;
      const speed = 2800 + i * 600;
      const phase = i * (Math.PI / 2);
      let start   = null;

      const animate = (ts) => {
        if (!start) start = ts;
        const y = Math.sin(((ts - start) / speed) * Math.PI * 2 + phase) * amp;
        item.style.transform = `translateY(${y}px)`;
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    });
  }


  // ── LEAD FORM — submit ─────────────────────────────────────
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    // Real-time validation on blur
    ['fullname', 'phone', 'city'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('blur', () => {
        const group = input.closest('.form-group');
        if (!group) return;
        if (!input.value.trim()) {
          group.classList.add('form-group--error');
        } else {
          group.classList.remove('form-group--error');
          group.classList.add('form-group--valid');
        }
      });
      input.addEventListener('focus', () => {
        input.closest('.form-group')?.classList.remove('form-group--error');
      });
    });

    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn   = leadForm.querySelector('.form-submit');
      const name  = leadForm.fullname.value.trim();
      const phone = leadForm.phone.value.trim();
      const city  = leadForm.city.value.trim();

      if (!name || !phone || !city) {
        if (!name)  document.getElementById('fullname')?.closest('.form-group')?.classList.add('form-group--error');
        if (!phone) document.getElementById('phone')?.closest('.form-group')?.classList.add('form-group--error');
        if (!city)  document.getElementById('city')?.closest('.form-group')?.classList.add('form-group--error');
        return;
      }

      const originalText = btn.textContent;
      btn.textContent = 'Envoi en cours…';
      btn.disabled    = true;

      try {
        const ref = `SLV-${Date.now().toString(36).toUpperCase()}`;
        let orderRef = ref;

        try {
          const res = await fetch('/api/orders', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              name, phone, city,
              bundle: selectedBundle.bundle || 2,
              total:  selectedBundle.price  || 429,
              ref,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            orderRef = data.ref || ref;
          }
        } catch { /* offline / API down — still show thank-you */ }

        const firstName = name.split(' ')[0];
        const bundleInfo = bundleDetails[selectedBundle.bundle] || bundleDetails[2];
        const orderData = {
          name: firstName,
          ref: orderRef,
          total: String(selectedBundle.price || 429),
          bundle: bundleInfo.name,
        };
        sessionStorage.setItem('selverine_order', JSON.stringify(orderData));

        const params = new URLSearchParams(orderData);
        window.location.href = `/merci.html?${params.toString()}`;
        return;

      } catch {
        btn.textContent = 'Erreur — veuillez réessayer';
        btn.disabled    = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    });
  }


  // ── MODAL ORDER FORM — submit ──────────────────────────────
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    ['mName', 'mPhone', 'mCity'].forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('blur', () => {
        const group = input.closest('.form-group');
        if (!group) return;
        group.classList.toggle('form-group--error', !input.value.trim());
        if (input.value.trim()) group.classList.add('form-group--valid');
      });
      input.addEventListener('focus', () =>
        input.closest('.form-group')?.classList.remove('form-group--error'));
    });

    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn   = document.getElementById('mSubmit');
      const name  = orderForm.fullname.value.trim();
      const phone = orderForm.phone.value.trim();
      const city  = orderForm.city.value.trim();

      if (!name || !phone || !city) {
        if (!name)  document.getElementById('mName')?.closest('.form-group')?.classList.add('form-group--error');
        if (!phone) document.getElementById('mPhone')?.closest('.form-group')?.classList.add('form-group--error');
        if (!city)  document.getElementById('mCity')?.closest('.form-group')?.classList.add('form-group--error');
        return;
      }

      const originalText = btn.textContent;
      btn.textContent = 'Envoi en cours…';
      btn.disabled    = true;

      const ref = `SLV-${Date.now().toString(36).toUpperCase()}`;
      let orderRef = ref;
      try {
        const res = await fetch('/api/orders', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            name, phone, city,
            bundle: selectedBundle.bundle || 2,
            total:  selectedBundle.price  || 429,
            ref,
          }),
        });
        if (res.ok) { const data = await res.json(); orderRef = data.ref || ref; }
      } catch { /* offline / API down — still show thank-you */ }

      const firstName  = name.split(' ')[0];
      const bundleInfo = bundleDetails[selectedBundle.bundle] || bundleDetails[2];
      const orderData = {
        name:  firstName,
        ref:   orderRef,
        total: String(selectedBundle.price || 429),
        bundle: bundleInfo.name,
      };
      sessionStorage.setItem('selverine_order', JSON.stringify(orderData));
      window.location.href = `/merci.html?${new URLSearchParams(orderData).toString()}`;
    });
  }

});
