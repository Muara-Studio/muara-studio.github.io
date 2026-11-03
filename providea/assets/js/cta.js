// CTA (all pages): tilted screenshot grid, chat panel (WhatsApp), meeting panel with the next 5 weekdays.
// Owner: agent D, see providea/REVISI-2026-11-03.md
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const cta = $('section.cta');
  if (!cta) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  // Text made here follows <html lang> (set by lang.js, kept current by shell.js) and is redrawn on window "pv:lang"
  const isEn = () => document.documentElement.lang === 'en';
  const locale = () => (isEn() ? 'en-GB' : 'id-ID');

  /* 1. Tilted grid: built lazily when the section is near, animated only while it is on screen */
  const grid = $('.tgrid', cta);
  const IMGS = ['talia', 'arum', 'pegasus', 'motoijo', 'agungalpra', 'talia-2', 'arum-2', 'pegasus-2', 'motoijo-2', 'agungalpra-2'];
  const COLS = 6, GAP = 16;
  let built = false;
  const build = () => {
    if (built || !grid) return;
    built = true;
    const base = grid.dataset.base || 'assets/img/';
    const stage = document.createElement('div');
    stage.className = 'tg-stage';
    const cols = [];
    for (let c = 0; c < COLS; c++) {
      const col = document.createElement('div');
      col.className = 'tg-col';
      col.style.setProperty('--tg-t', (34 + c * 4) + 's');
      col.style.setProperty('--tg-d', (-c * 9) + 's');
      stage.appendChild(col); cols.push(col);
    }
    grid.appendChild(stage);
    // enough rows to cover the section after the 3D tilt (rows shrink to ~64% on screen)
    const tile = (cols[0].offsetWidth || 240) * 0.625 + GAP;
    const rows = Math.max(8, Math.min(18, Math.ceil((cta.offsetHeight * 1.9) / tile) + 1));
    cols.forEach((col, c) => {
      const frag = document.createDocumentFragment();
      for (let r = 0; r < rows; r++) {
        const img = new Image();
        img.src = base + IMGS[(c * 3 + r * 7) % IMGS.length] + '.webp';
        img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
        frag.appendChild(img);
      }
      col.appendChild(frag);
    });
    $$('.ascii', cta).forEach(a => a.classList.add('on'));
  };
  if ('IntersectionObserver' in window) {
    // build a little before the section arrives
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { build(); near.disconnect(); } }, { rootMargin: '900px 0px' });
    near.observe(cta);
    // run animations only while visible, and never under reduced motion
    new IntersectionObserver(([e]) => cta.classList.toggle('run', e.isIntersecting && !reduce.matches)).observe(cta);
  } else { build(); }

  /* 2. Chat panel */
  const form = $('[data-cta-chat]');
  if (form) {
    const ta = $('textarea', form);
    const stamp = $('time', form);
    const DEFAULT_MSG = () => (isEn() ? 'Hello Providea, I would like a consultation for my business.' : 'Halo Providea, saya ingin berkonsultasi tentang bisnis saya.');
    const number = () => {
      try { if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.whatsapp) return String(CONFIG.whatsapp).replace(/\D/g, ''); } catch (e) {}
      const m = (($('a[data-wa]') || {}).href || '').match(/wa\.me\/(\d+)/);
      return m ? m[1] : '';   // empty number: WhatsApp opens its chat picker
    };
    const fit = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
    const now = () => {
      if (!stamp) return;
      const d = new Date();
      stamp.textContent = new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
      stamp.dateTime = d.toISOString();
    };
    ta.addEventListener('input', () => { fit(); now(); });
    let raf = 0;
    addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    fit(); now();
    // The message text itself is swapped by lang.js (data-en on the textarea, unless the visitor already edited it)
    window.addEventListener('pv:lang', () => { now(); fit(); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = ta.value.trim() || DEFAULT_MSG();
      window.open(`https://wa.me/${number()}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });
    ta.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); }
    });
  }

  /* 3. Meeting panel: next 5 weekdays, named in the active language */
  const days = $('[data-days]', cta);
  if (days) {
    const d = new Date(); d.setHours(12, 0, 0, 0);
    const out = [];
    while (out.length < 5) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) out.push(new Date(d)); }
    const draw = () => {
      const f = o => new Intl.DateTimeFormat(locale(), o);
      const dow = f({ weekday: 'short' }), dnum = f({ day: 'numeric' }), mon = f({ month: 'short' }), full = f({ weekday: 'long', day: 'numeric', month: 'long' });
      days.innerHTML = out.map((x, i) =>
        `<span class="day${i ? '' : ' first'}" title="${full.format(x)}"><span>${dow.format(x)}</span><b>${dnum.format(x)}</b><i>${mon.format(x)}</i></span>`).join('');
    };
    draw();
    window.addEventListener('pv:lang', draw);
  }
})();
