/* Shared init for legal, thank-you & secondary pages */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-secondary', 'page-enter');

  // Reveal legal / thank-you content
  const reveal = document.querySelector('.legal-page__inner, .thankyou-layout');
  if (reveal) {
    requestAnimationFrame(() => reveal.classList.add('is-visible'));
  }

  // Nav shadow on scroll
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.style.boxShadow = window.scrollY > 8 ? '0 2px 20px rgba(16,40,32,0.08)' : '';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile hamburger
  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.querySelector('.nav__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', (e) => {
      if (!nav?.contains(e.target)) {
        navLinks.classList.remove('is-open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Fade out when leaving for another page
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
    if (!href.includes('.html') && !href.startsWith('/index')) return;
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || link.target === '_blank') return;
      e.preventDefault();
      document.body.style.transition = 'opacity 0.22s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 200);
    });
  });
});
