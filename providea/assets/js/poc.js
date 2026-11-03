// POC page: tag filter, result count (ID/EN), staggered reveal. Owner: agent D.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const grid = $('.poc-grid');
  const bar = $('.poc-bar');
  if (!grid || !bar) return;

  const cards = $$('.poc-card', grid);
  const chips = $$('.chip', bar);
  const countEl = $('.poc-count', bar);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const tagsOf = c => (c.dataset.tags || '').split(/\s+/).filter(Boolean);
  const isEn = () => document.documentElement.lang === 'en';
  let current = 'all';

  // Chip counts come from the cards, so the markup never drifts from the data.
  chips.forEach(ch => {
    const tag = ch.dataset.tag;
    const n = tag === 'all' ? cards.length : cards.filter(c => tagsOf(c).includes(tag)).length;
    const b = document.createElement('b');
    b.textContent = n;
    ch.append(b);
  });

  const renderCount = () => {
    const n = cards.filter(c => !c.hidden).length, total = cards.length;
    const en = isEn();
    countEl.textContent = n === total
      ? (en ? `${total} experiments` : `${total} eksperimen`)
      : (en ? `${n} of ${total} experiments` : `${n} dari ${total} eksperimen`);
  };

  // Scroll reveal: each card fades in once, staggered by its column.
  const cols = () => (innerWidth > 1100 ? 3 : innerWidth > 640 ? 2 : 1);
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  }
  cards.forEach((c, i) => {
    c.style.setProperty('--d', ((i % cols()) * 0.09).toFixed(2) + 's');
    if (io) { c.classList.add('rv'); io.observe(c); }
  });

  const apply = (tag, animate) => {
    current = tag;
    let shown = 0;
    cards.forEach(c => {
      const on = tag === 'all' || tagsOf(c).includes(tag);
      c.hidden = !on;
      if (!on) return;
      c.classList.add('in');            // a filtered-in card must never wait for the observer
      if (io) io.unobserve(c);
      c.classList.remove('pop');
      if (animate && !reduce.matches) {
        c.style.setProperty('--d', (shown * 0.06).toFixed(2) + 's');
        void c.offsetWidth;             // restart the animation
        c.classList.add('pop');
      }
      shown++;
    });
    chips.forEach(ch => ch.setAttribute('aria-pressed', String(ch.dataset.tag === tag)));
    renderCount();
  };

  chips.forEach(ch => ch.addEventListener('click', () => {
    const tag = ch.dataset.tag;
    if (tag === current) return;
    apply(tag, true);
    try { history.replaceState(null, '', tag === 'all' ? location.pathname + location.search : '#' + tag); } catch (_) {}
  }));

  // Deep link: poc.html#ar opens with that filter on.
  const fromHash = decodeURIComponent(location.hash.slice(1));
  if (fromHash && chips.some(ch => ch.dataset.tag === fromHash)) apply(fromHash, false);
  else renderCount();

  // Back/forward or a link to poc.html#tag on the same page.
  addEventListener('hashchange', () => {
    const t = decodeURIComponent(location.hash.slice(1));
    const next = chips.some(ch => ch.dataset.tag === t) ? t : 'all';
    if (next !== current) apply(next, true);
  });

  addEventListener('pv:lang', renderCount);
})();
