(() => {
  'use strict';

  const CONFIG = {
    links: {
      // REPLACE WITH ACTUAL LYNK.ID CHECKOUT URL for each package.
      default:   'https://lynk.id/USERNAME',
      quick:     'https://lynk.id/USERNAME',
      signature: 'https://lynk.id/USERNAME',
      full:      'https://lynk.id/USERNAME',
      bundle:    'https://lynk.id/USERNAME'
    },
    social: {
      instagram: 'https://instagram.com/USERNAME',
      tiktok:    'https://tiktok.com/@USERNAME'
    }
  };

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Split headings into words for reveal */
  $$('[data-split]').forEach(el => {
    const txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map((w, i) => '<span class="w" aria-hidden="true"><i style="--k:' + i + '">' + w + '</i></span>').join(' ');
    el.classList.add('split');
  });
  $$('.real-list li').forEach((li, i) => li.style.setProperty('--k', i));
  $$('.tile').forEach((t, i) => t.style.setProperty('--d', i % 4));

  /* Broken image fallback */
  document.addEventListener('error', e => {
    const t = e.target;
    if (t && t.tagName === 'IMG') { t.style.display = 'none'; t.parentElement.classList.add('img-fail'); }
  }, true);

  $$('[data-order]').forEach(a => { a.href = CONFIG.links[a.dataset.order] || CONFIG.links.default; a.target = '_blank'; a.rel = 'noopener noreferrer'; });
  $$('[data-social]').forEach(a => { const url = CONFIG.social[a.dataset.social]; if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; } });

  /* Nav */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('.nav-toggle');
  const menu = $('#nav-menu');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    menu.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Reveal on scroll */
  const revealEls = $$('.rv, .rvimg');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* Count-up stats */
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const run = () => {
      if (reduce) { el.textContent = target + suffix; return; }
      const t0 = performance.now(), ms = 1100;
      requestAnimationFrame(function step(t) {
        const p = Math.min(1, (t - t0) / ms);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(step);
      });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { run(); io.disconnect(); } }, { threshold: .6 });
      io.observe(el);
    } else run();
  });

  /* Before / After sliders */
  const tween = (from, to, ms, fn) => {
    const t0 = performance.now();
    let raf = requestAnimationFrame(function step(t) {
      const p = Math.min(1, (t - t0) / ms);
      fn(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(raf);
  };

  $$('[data-cmp]').forEach(cmp => {
    const range = $('.cmp-input', cmp);
    let dragging = false, stopSweep = null;

    const set = v => {
      v = Math.max(0, Math.min(100, v));
      cmp.style.setProperty('--pos', v + '%');
      range.value = v;
      range.setAttribute('aria-valuetext', Math.round(100 - v) + '% after');
    };
    const touched = () => { if (stopSweep) { stopSweep(); stopSweep = null; } cmp.classList.add('is-touched'); };
    const fromEvent = e => { const r = cmp.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };

    cmp.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; touched(); cmp.classList.add('is-dragging');
      try { cmp.setPointerCapture(e.pointerId); } catch (_) {}
      if (e.pointerType === 'mouse') fromEvent(e);
    });
    cmp.addEventListener('pointermove', e => { if (dragging) fromEvent(e); });
    const end = () => { dragging = false; cmp.classList.remove('is-dragging'); };
    cmp.addEventListener('pointerup', end);
    cmp.addEventListener('pointercancel', end);
    range.addEventListener('input', () => { touched(); set(+range.value); });

    if (cmp.hasAttribute('data-sweep') && !reduce) {
      set(100);
      setTimeout(() => { if (!cmp.classList.contains('is-touched')) stopSweep = tween(100, 52, 1500, set); }, 700);
    } else {
      set(cmp.hasAttribute('data-sweep') ? 52 : (+cmp.dataset.start || 50));
    }
    if (!cmp.hasAttribute('data-sweep') && !reduce) {
      let wt = [];
      const wiggle = () => {
        wt.forEach(clearTimeout);
        const s0 = +cmp.dataset.start || 50, ok = () => !cmp.classList.contains('is-touched');
        wt = [setTimeout(() => { if (ok()) tween(s0, s0 - 24, 700, set); }, 500),
              setTimeout(() => { if (ok()) tween(s0 - 24, s0 + 18, 900, set); }, 1250),
              setTimeout(() => { if (ok()) tween(s0 + 18, s0, 700, set); }, 2200)];
      };
      cmp._wiggle = wiggle;
      if ('IntersectionObserver' in window && cmp.classList.contains('is-active')) {
        const demo = new IntersectionObserver(([en]) => { if (en.isIntersecting) { demo.disconnect(); wiggle(); } }, { threshold: .55 });
        demo.observe(cmp);
      }
    }
  });

  /* Style selector */
  const vFrame = $('#vibe-frame');
  const vButtons = $$('.vibe');
  vButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      vButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      const name = btn.firstChild.textContent.trim();
      vFrame.dataset.vibe = btn.dataset.vibe;
      $('#vibe-name').textContent = name;
      $('#vibe-note').textContent = name;
      $('#vibe-desc').textContent = btn.dataset.desc;
    });
  });

  /* FAQ accordion */
  $$('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
    });
  });

  /* Use-case grid: show all on mobile */
  const mason = $('#mason'), more = $('#mason-more');
  more.addEventListener('click', () => { mason.classList.remove('is-collapsed'); more.hidden = true; });


  /* Scroll progress */
  const pg = $('#progress');
  const upd = () => { const h = document.documentElement; pg.style.transform = 'scaleX(' + (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)) + ')'; };
  upd(); window.addEventListener('scroll', upd, { passive: true });

  if (!reduce && matchMedia('(hover:hover)').matches) {
    /* Cursor glow */
    const glow = $('#glow');
    window.addEventListener('pointermove', e => { glow.classList.add('on'); glow.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)'; }, { passive: true });
    document.addEventListener('pointerleave', () => glow.classList.remove('on'));

    /* Hero parallax + phone tilt */
    const hero = $('.hero'), phone = $('.phone'), meshH = $('.hero .mesh');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      phone.style.setProperty('--ry', (x * 10) + 'deg'); phone.style.setProperty('--rx', (-y * 8) + 'deg');
      meshH.style.transform = 'translate3d(' + (x * -34) + 'px,' + (y * -26) + 'px,0)';
    });
    hero.addEventListener('pointerleave', () => { phone.style.removeProperty('--ry'); phone.style.removeProperty('--rx'); meshH.style.transform = ''; });

    /* Magnetic buttons */
    $$('.btn--lg, .btn--primary').forEach(b => {
      b.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .18) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .28) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); });
    });

    /* Spotlight cards */
    $$('.plan, .svc, .testi, .bundle').forEach(el => {
      el.classList.add('spot');
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--px', (e.clientX - r.left) + 'px'); el.style.setProperty('--py', (e.clientY - r.top) + 'px'); });
    });
  }

  /* Vibe shutter flash + auto-cycle until the visitor picks one */
  let vi = 0, vt = null, vUser = false;
  vButtons.forEach((b, i) => b.addEventListener('click', e => {
    if (e.isTrusted) { vUser = true; clearInterval(vt); }
    vi = i; vFrame.classList.remove('flash'); void vFrame.offsetWidth; vFrame.classList.add('flash');
  }));
  if (!reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      clearInterval(vt);
      if (en.isIntersecting && !vUser) vt = setInterval(() => { vi = (vi + 1) % vButtons.length; vButtons[vi].click(); }, 3200);
    }, { threshold: .4 }).observe(vFrame);
  }


  /* Showcase tabs (+ autoplay until the visitor interacts) */
  const tabs = $$('.tab'), panes = $$('.pane'), stageCmps = $$('.stage-cmp');
  let ti = 0, tt = null, tUser = false;
  const goTab = (i, user) => {
    ti = i;
    tabs.forEach((t, k) => { const on = k === i; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; t.classList.remove('auto'); });
    panes.forEach((p, k) => p.classList.toggle('is-active', k === i));
    stageCmps.forEach((c, k) => c.classList.toggle('is-active', k === i));
    if (!user && !tUser && !reduce) { void tabs[i].offsetWidth; tabs[i].classList.add('auto'); }
    const c = stageCmps[i];
    if (c && c._wiggle && !c.classList.contains('is-touched')) c._wiggle();
  };
  const stopTabs = () => { tUser = true; clearInterval(tt); tabs.forEach(t => t.classList.remove('auto')); };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { stopTabs(); goTab(i, true); });
    t.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault(); stopTabs();
      const n = (i + d + tabs.length) % tabs.length; goTab(n, true); tabs[n].focus();
    });
  });
  stageCmps.forEach(c => c.addEventListener('pointerdown', stopTabs));
  if (!reduce && 'IntersectionObserver' in window && tabs.length) {
    new IntersectionObserver(([en]) => {
      clearInterval(tt);
      if (en.isIntersecting && !tUser) {
        tabs[ti].classList.add('auto');
        tt = setInterval(() => goTab((ti + 1) % tabs.length), 6500);
      }
    }, { threshold: .4 }).observe($('.sc-grid'));
  }

  /* Mobile sticky CTA */
  const sticky = $('#sticky-cta'), stickyLink = $('a', sticky);
  const heroEl = $('.hero'), finalEl = $('#order');
  let heroVisible = true, finalVisible = false;
  const updateSticky = () => {
    const show = !heroVisible && !finalVisible;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', String(!show));
    stickyLink.tabIndex = show ? 0 : -1;
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; updateSticky(); }, { threshold: 0 }).observe(heroEl);
    new IntersectionObserver(([en]) => { finalVisible = en.isIntersecting; updateSticky(); }, { threshold: 0.2 }).observe(finalEl);
  }
})();
