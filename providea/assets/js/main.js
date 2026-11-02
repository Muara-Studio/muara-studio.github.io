// Providea site v0.1. Fill CONFIG when the real number and booking link exist.
const CONFIG = {
  whatsapp: '',  // e.g. '62812xxxxxxx'; empty opens WhatsApp with the message and lets the user pick a chat
  booking: '',   // Google Calendar appointment link; empty scrolls to the CTA section
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Theme, language, menu, footer word and clocks live in shell.js.

// CTA links
$$('[data-wa]').forEach(a => {
  const msg = encodeURIComponent(a.dataset.wa || 'Halo Providea, saya ingin konsultasi untuk bisnis saya.');
  a.href = `https://wa.me/${CONFIG.whatsapp}?text=${msg}`;
  a.target = '_blank'; a.rel = 'noopener';
});
$$('[data-book]').forEach(a => { a.href = CONFIG.booking || '#jadwal'; if (CONFIG.booking) { a.target = '_blank'; a.rel = 'noopener'; } });
const waForm = $('[data-wa-form]');
if (waForm) waForm.addEventListener('submit', e => {
  e.preventDefault();
  const v = encodeURIComponent($('input', waForm).value || 'Halo Providea, saya ingin konsultasi untuk bisnis saya.');
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${v}`, '_blank', 'noopener');
});

// Scroll reveals, staggered inside each parent
const REVEAL = '.intro p,.intro h2,.work-head>*,.proc-head>*,.faq h2,.faq details,.cta h2,.cta .sub,.split>*,.foot h2,.loc,.flinks,.case-intro>div,.scope li,.bento figure,.more-work .head h2,.mw a,.clients>*,.scard .cols,.scard .gallery';
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$(REVEAL).forEach(el => {
  const sibs = [...el.parentElement.children].filter(c => c.matches(REVEAL));
  el.style.setProperty('--d', Math.min(sibs.indexOf(el) * 0.08, 0.4) + 's');
  el.classList.add('reveal'); io.observe(el);
});

// Count-up numbers
const fmt = n => Math.round(n).toLocaleString('id-ID');
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, to = +el.dataset.count, from = +(el.dataset.from || 0), t0 = performance.now(), dur = 1400;
  const step = t => { const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * ease); if (k < 1) requestAnimationFrame(step); };
  el.textContent = fmt(from); requestAnimationFrame(step);
}), { threshold: 0.6 });
$$('[data-count]').forEach(el => cio.observe(el));

// Stacked pillar cards: the covered card shrinks and dims as the next one slides over it
const cards = $$('.scard');
let ticking = false;
const depth = () => {
  ticking = false;
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    if (!next) return c.style.setProperty('--p', 0);
    const gap = next.getBoundingClientRect().top - c.getBoundingClientRect().top;
    c.style.setProperty('--p', Math.max(0, Math.min(1, 1 - gap / c.offsetHeight)).toFixed(3));
  });
};
if (cards.length) { addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(depth); } }, { passive: true }); depth(); }
$$('[data-year]').forEach(y => y.textContent = new Date().getFullYear());
