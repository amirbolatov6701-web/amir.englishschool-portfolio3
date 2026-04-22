/* =========================================================
   FluentAI — script.js
   Vanilla JS: nav, scroll reveal, counters, sliders,
   pricing toggle, progress bars, journey animation
   ========================================================= */

/* ---------- UTILS ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- NAV: scroll shadow + mobile toggle ---------- */
(function initNav() {
  const nav    = $('#nav');
  const burger = $('#burger');
  const menu   = $('#mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  /* close mobile menu on link click */
  $$('a', menu).forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
})();

/* ---------- SMOOTH SCROLL for anchor links ---------- */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---------- SCROLL REVEAL ---------- */
(function initReveal() {
  const items = $$('.reveal');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      /* stagger siblings inside the same parent */
      const siblings = $$('.reveal', entry.target.parentElement);
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${idx * 0.08}s`;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();

/* ---------- HERO PROGRESS BARS ---------- */
(function initProgressBars() {
  const bars = $$('.progress-fill');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target;
      fill.style.width = fill.dataset.width + '%';
      io.unobserve(fill);
    });
  }, { threshold: 0.3 });

  bars.forEach(b => io.observe(b));
})();

/* ---------- ANIMATED COUNTERS ---------- */
(function initCounters() {
  const statEls = $$('.stat-card__number');

  function animateCounter(el) {
    const target  = parseFloat(el.dataset.target);
    const decimal = parseInt(el.dataset.decimal || 0);
    const duration = 1800;
    const step = 16;
    const steps = duration / step;
    const increment = target / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      /* ease-out: slow down near the end */
      const progress = frame / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = target * eased;

      if (frame >= steps) {
        current = target;
        clearInterval(timer);
      }

      el.textContent = decimal
        ? current.toFixed(decimal)
        : Math.floor(current).toLocaleString();
    }, step);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  statEls.forEach(el => io.observe(el));
})();

/* ---------- JOURNEY: animated progress line ---------- */
(function initJourney() {
  const steps = $$('.journey__step');
  const lines = $$('.journey__line-fill');
  const isMobile = () => window.innerWidth <= 768;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      /* animate each line with a delay */
      lines.forEach((line, i) => {
        setTimeout(() => {
          if (isMobile()) {
            line.style.height = '100%';
          } else {
            line.style.width = '100%';
          }
        }, 400 + i * 600);
      });

      /* light up nodes in sequence */
      steps.forEach((step, i) => {
        setTimeout(() => step.classList.add('lit'), i * 600);
      });

      io.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  const track = $('.journey__track');
  if (track) io.observe(track);
})();

/* ---------- COMMUNITY: horizontal scroll / carousel ---------- */
(function initCommunity() {
  const track    = $('#communityTrack');
  const btnPrev  = $('#commPrev');
  const btnNext  = $('#commNext');
  if (!track) return;

  const cardWidth = 260 + 20; /* card width + gap */
  let offset = 0;

  function clamp(val) {
    const max = track.scrollWidth - track.parentElement.clientWidth + 96;
    return Math.min(Math.max(val, 0), max);
  }

  function move(dir) {
    offset = clamp(offset + dir * cardWidth * 2);
    track.style.transform = `translateX(-${offset}px)`;
  }

  btnNext.addEventListener('click', () => move(1));
  btnPrev.addEventListener('click', () => move(-1));

  /* touch / drag support */
  let startX = 0, dragging = false;
  track.addEventListener('pointerdown', e => { startX = e.clientX; dragging = true; });
  track.addEventListener('pointermove', e => {
    if (!dragging) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 5) track.style.transform = `translateX(-${clamp(offset + diff)}px)`;
  });
  track.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    const diff = startX - e.clientX;
    offset = clamp(offset + diff);
    track.style.transform = `translateX(-${offset}px)`;
  });
  track.addEventListener('pointerleave', () => { dragging = false; });
})();

/* ---------- TESTIMONIALS SLIDER ---------- */
(function initTestimonials() {
  const track    = $('#testiTrack');
  const dotsWrap = $('#testiDots');
  const btnPrev  = $('#testiPrev');
  const btnNext  = $('#testiNext');
  if (!track) return;

  const cards = $$('.testi-card', track);
  let current = 0;

  /* build dots */
  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getVisible() {
    if (window.innerWidth <= 480)  return 1;
    if (window.innerWidth <= 900)  return 2;
    return 3;
  }

  function goTo(idx) {
    const visible = getVisible();
    const max = cards.length - visible;
    current = Math.min(Math.max(idx, 0), max);

    const cardW = cards[0].offsetWidth + 24; /* card + gap */
    track.style.transform = `translateX(-${current * cardW}px)`;

    $$('.testi-dot', dotsWrap).forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
  }

  btnNext.addEventListener('click', () => goTo(current + 1));
  btnPrev.addEventListener('click', () => goTo(current - 1));

  /* auto-advance every 5 s */
  let autoPlay = setInterval(() => {
    const visible = getVisible();
    goTo(current + 1 < cards.length - visible + 1 ? current + 1 : 0);
  }, 5000);

  /* pause on hover */
  track.addEventListener('mouseenter', () => clearInterval(autoPlay));
  track.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => {
      const visible = getVisible();
      goTo(current + 1 < cards.length - visible + 1 ? current + 1 : 0);
    }, 5000);
  });

  /* recalculate on resize */
  window.addEventListener('resize', () => goTo(current), { passive: true });
})();

/* ---------- PRICING TOGGLE (monthly / annual) ---------- */
(function initPricing() {
  const toggle    = $('#billingToggle');
  const lblMonth  = $('#toggleMonthly');
  const lblAnnual = $('#toggleAnnual');
  const prices    = $$('.price');
  if (!toggle) return;

  let annual = false;

  function update() {
    prices.forEach(el => {
      const val = annual ? el.dataset.annual : el.dataset.monthly;
      el.textContent = '$' + val;
    });
    toggle.classList.toggle('on', annual);
    toggle.setAttribute('aria-checked', annual);
    lblMonth.classList.toggle('toggle-label--active', !annual);
    lblAnnual.classList.toggle('toggle-label--active',  annual);
  }

  toggle.addEventListener('click', () => { annual = !annual; update(); });
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); annual = !annual; update(); }
  });
})();

/* ---------- RIPPLE effect on buttons ---------- */
(function initRipple() {
  $$('.ripple').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        transform:scale(0);
        animation:rippleAnim .6s linear;
        background:rgba(255,255,255,.35);
        width:120px; height:120px;
        left:${x - 60}px; top:${y - 60}px;
        pointer-events:none;
      `;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* inject ripple keyframes once */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- ACTIVE NAV LINK on scroll ---------- */
(function initActiveNav() {
  const sections = $$('section[id]');
  const links    = $$('.nav__links a');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => {
        a.style.color = '';
        a.style.fontWeight = '';
      });
      const active = links.find(a => a.getAttribute('href') === '#' + entry.target.id);
      if (active) {
        active.style.color = 'var(--primary)';
        active.style.fontWeight = '600';
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
})();

/* ---------- WORD CHIPS: hover glow in dashboard ---------- */
(function initWordChips() {
  $$('.word-chip').forEach(chip => {
    chip.addEventListener('mouseenter', () => {
      chip.style.transform = 'scale(1.08)';
      chip.style.transition = 'transform 0.2s ease';
    });
    chip.addEventListener('mouseleave', () => {
      chip.style.transform = '';
    });
  });
})();
