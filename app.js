/* Tech Art Car — interactions */
(function(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero entrance ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => hero.classList.add('is-ready'));
    });
  }

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    const toggle = (force) => {
      const open = typeof force === 'boolean' ? force : !navMobile.classList.contains('is-open');
      navMobile.classList.toggle('is-open', open);
      navToggle.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    navToggle.addEventListener('click', () => toggle());
    navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
    // Auto-close if window crosses breakpoint
    window.addEventListener('resize', () => { if (window.innerWidth > 980) toggle(false); });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .step');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Stat counter ---------- */
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const counters = document.querySelectorAll('.count[data-target]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = parseInt(el.dataset.duration || '1600', 10);
    if (reduced) { el.textContent = target.toFixed(decimals); return; }
    const start = performance.now();
    const fmt = (n) => decimals ? n.toFixed(decimals).replace('.', ',') : Math.round(n).toString();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = fmt(target * easeOutCubic(t));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Hero ambient parallax (rAF-throttled) ---------- */
  if (hero && !reduced) {
    let target = 0, current = 0, rafId = null;
    const onScroll = () => {
      const r = hero.getBoundingClientRect();
      const range = window.innerHeight + r.height;
      const progress = Math.max(0, Math.min(1, (window.innerHeight - r.top) / range));
      target = progress * 60; // 0..60px
      if (!rafId) rafId = requestAnimationFrame(loop);
    };
    const loop = () => {
      current += (target - current) * 0.12;
      hero.style.setProperty('--hp', current.toFixed(2));
      if (Math.abs(target - current) > 0.1) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
