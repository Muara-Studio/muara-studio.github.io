// Work: project filter on karya/index.html, reveal of its cards, and a pause for the home carousel when it is off screen.
// Owner: agent B (see providea/REVISI-2026-11-03b.md). Reads document.documentElement.lang and re-renders on window "pv:lang".
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const isEn = () => document.documentElement.lang === 'en';

  // Home: pause the card 1 carousel while it is off screen.
  const car = $('.gcar');
  if (car && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => car.classList.toggle('off', !e.isIntersecting)), { rootMargin: '80px' }).observe(car);
  }

  // Karya: filter chips.
  const grid = $('.kgrid');
  if (!grid) return;
  const cards = $$('.kcard', grid);
  const chips = $$('.kchip');
  const kn = $('[data-kn]');
  const kc = $('[data-kcount]');
  let cur = 'all';

  const label = n => isEn() ? `Showing ${n} ${n === 1 ? 'project' : 'projects'}` : `Menampilkan ${n} proyek`;
  const matches = c => cur === 'all' || c.dataset.type === cur;

  const paint = animate => {
    let k = 0, shown = 0;
    cards.forEach(c => {
      const ok = matches(c);
      if (!ok) { c.hidden = true; c.classList.remove('kin'); return; }
      shown++;
      const was = c.hidden;
      c.hidden = false;
      if (animate) c.classList.add('in');
      if (animate && was) {
        c.style.setProperty('--kd', Math.min(k, 8) * 0.05 + 's');
        c.classList.remove('kin'); void c.offsetWidth; c.classList.add('kin');
        c.addEventListener('animationend', () => c.classList.remove('kin'), { once: true });
      }
      k++;
    });
    if (kn) kn.textContent = shown;
    if (kc) kc.textContent = label(shown);
  };

  const select = (type, animate = true) => {
    cur = type;
    chips.forEach(b => b.setAttribute('aria-pressed', b.dataset.filter === type ? 'true' : 'false'));
    if (animate) {
      // Cards that stay visible fade in again too, so the whole grid reads as one change.
      cards.forEach(c => { if (matches(c)) c.hidden = true; });
    }
    paint(animate);
    try { history.replaceState(null, '', type === 'all' ? location.pathname + location.search : '#' + type); } catch (e) {}
  };
  chips.forEach(b => b.addEventListener('click', () => { if (b.dataset.filter !== cur) select(b.dataset.filter); }));

  // Counts on the chips.
  chips.forEach(b => {
    const n = $('.n', b);
    if (n) n.textContent = b.dataset.filter === 'all' ? cards.length : cards.filter(c => c.dataset.type === b.dataset.filter).length;
  });

  // Reveal on scroll, staggered by column.
  const cols = () => getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.classList.add('in');
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const stagger = () => { const n = cols(); cards.forEach((c, i) => c.style.setProperty('--d', (i % n) * 0.08 + 's')); };
  stagger(); addEventListener('resize', stagger);
  cards.forEach(c => io.observe(c));

  const start = (location.hash || '').slice(1);
  if (chips.some(b => b.dataset.filter === start)) select(start, false); else paint(false);
  addEventListener('hashchange', () => { const h = (location.hash || '').slice(1) || 'all'; if (h !== cur && chips.some(b => b.dataset.filter === h)) select(h); });
  window.addEventListener('pv:lang', () => { if (kc) kc.textContent = label(cards.filter(c => !c.hidden).length); });
})();
