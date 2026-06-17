/* ═══════════════════════════════════════════════
   SELVERINE — Premium Landing Page Scripts
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── IMAGES: ALWAYS VISIBLE IMMEDIATELY ────────────────────
  // img-frame elements are not animated — they render at full
  // opacity from the start (set in CSS). No JS needed for them.


  // ── INTERSECTION OBSERVER — TEXT ANIMATIONS ────────────────
  // Only text/content blocks get the scroll fade; images are excluded.
  const animatedEls = document.querySelectorAll('.fade-up, .fade-in');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay) || 0;
        setTimeout(() => el.classList.add('in-view'), delay);
        revealObserver.unobserve(el);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px',
  });

  animatedEls.forEach(el => revealObserver.observe(el));


  // ── STICKY BAR — after hero exits viewport ─────────────────
  const stickyBar = document.getElementById('stickyBar');
  const hero = document.getElementById('hero');

  if (hero && stickyBar) {
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        stickyBar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0.2 });
    stickyObserver.observe(hero);
  }


  // ── FAQ ACCORDION ──────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close all
      document.querySelectorAll('.faq-item').forEach(i => {
        i.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-item__answer').style.maxHeight = '0';
      });

      // open this one if it was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });


  // ── TEXTURE BARS — animate with CSS variable approach ──────
  const textureSection = document.querySelector('.texture');
  const fills = document.querySelectorAll('.texture-prop__fill');

  if (textureSection && fills.length) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          fills.forEach((fill, i) => {
            setTimeout(() => fill.classList.add('animated'), i * 150);
          });
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    barObserver.observe(textureSection);
  }


  // ── SMOOTH SCROLL ──────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ── NAV — compact on scroll ────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 60
      ? '0 2px 20px rgba(0,0,0,0.06)'
      : '';
  }, { passive: true });


  // ── ORBIT ITEMS — subtle float ─────────────────────────────
  document.querySelectorAll('.orbit-item').forEach((item, i) => {
    const amp = 5 + i * 2;
    const speed = 2800 + i * 600;
    const phase = i * (Math.PI / 2);
    let start = null;

    const animate = (ts) => {
      if (!start) start = ts;
      const y = Math.sin(((ts - start) / speed) * Math.PI * 2 + phase) * amp;
      item.style.transform = `translateY(${y}px)`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });


  // ── LEAD FORM — submit to /api/orders ─────────────────────
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = leadForm.querySelector('.form-submit');
      const name = leadForm.fullname.value.trim();
      const phone = leadForm.phone.value.trim();
      const city  = leadForm.city.value.trim();

      if (!name || !phone || !city) return;

      const originalText = btn.textContent;
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;

      try {
        const ref = `SLV-${Date.now().toString(36).toUpperCase()}`;
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, city, bundle: 1, total: 0, ref }),
        });

        if (!res.ok) throw new Error();

        btn.textContent = '✓ Merci ' + name.split(' ')[0] + ' ! On vous contacte bientôt.';
        btn.style.background = '#18382F';
        btn.style.color = '#fff';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
          btn.disabled = false;
          leadForm.reset();
        }, 5000);

      } catch {
        btn.textContent = 'Erreur — réessayez';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    });
  }


  // ── WHATSAPP — clear above sticky bar on mobile ────────────
  const waBtn = document.querySelector('.whatsapp-btn');
  if (waBtn && stickyBar) {
    const updateWaPos = () => {
      waBtn.style.bottom = stickyBar.classList.contains('is-visible')
        ? (stickyBar.offsetHeight + 12) + 'px'
        : '24px';
    };
    new MutationObserver(updateWaPos)
      .observe(stickyBar, { attributes: true, attributeFilter: ['class'] });
  }

});
