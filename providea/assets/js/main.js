// Providea site v0.1. Fill CONFIG when the real number and booking link exist.
const CONFIG = {
  whatsapp: '',  // e.g. '62812xxxxxxx'; empty opens WhatsApp with the message and lets the user pick a chat
  booking: '',   // Google Calendar appointment link; empty scrolls to the CTA section
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Theme: saved choice, else system preference
const root = document.documentElement;
try { const t = localStorage.getItem('pv-theme'); if (t) root.dataset.theme = t; } catch (e) {}
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
const paintThemeIcon = () => $$('[data-theme-toggle]').forEach(b => b.setAttribute('aria-label', isDark() ? 'Mode terang' : 'Mode gelap'));
$$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('pv-theme', root.dataset.theme); } catch (e) {}
  paintThemeIcon();
}));
paintThemeIcon();

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

// Menu
const menu = $('#menu');
$$('[data-menu]').forEach(b => b.addEventListener('click', () => menu.classList.toggle('open')));
if (menu) menu.addEventListener('click', e => { if (e.target === menu || e.target.tagName === 'A') menu.classList.remove('open'); });
addEventListener('keydown', e => { if (e.key === 'Escape' && menu) menu.classList.remove('open'); });

// Process steps
const STEPS = [
  ['Audit', 'Kami cek kecepatan di ponsel, posisi di Google, jawaban AI, jalur WhatsApp, dan data pengunjung sebelum meeting pertama.'],
  ['Rancang', 'Alur, isi, dan desain disepakati bersama sebelum dibangun, mulai dari halaman yang paling sering dikunjungi.'],
  ['Bangun', 'Website, aplikasi, atau aktivasi dibangun dengan progres mingguan yang bisa Anda lihat.'],
  ['Uji', 'Diuji di perangkat nyata: kecepatan, tampilan ponsel, aksesibilitas, dan setiap tombol menuju WhatsApp.'],
  ['Rilis dan dampingi', 'Tim Anda dilatih memakai CMS, lalu kami pantau data dan heatmap untuk perbaikan berikutnya.'],
];
const stepBtns = $$('[data-step]');
const pcopy = $('.pcopy'), sprog = $('.sprog');
['#step-title', '#step-copy', '#step-num'].forEach(s => $(s) && $(s).classList.add('swap'));
let step = 0, stepTimer = null, stepVisible = false;
const STEP_MS = 4500;
const showStep = i => {
  step = i;
  stepBtns.forEach(x => x.classList.toggle('on', +x.dataset.step === i));
  pcopy.classList.add('fade');
  setTimeout(() => {
    $('#step-title').textContent = STEPS[i][0];
    $('#step-copy').textContent = STEPS[i][1];
    $('#step-num').textContent = String(i + 1).padStart(2, '0');
    pcopy.classList.remove('fade');
  }, 300);
  if (sprog) { sprog.classList.remove('run'); void sprog.offsetWidth; sprog.style.setProperty('--dur', STEP_MS + 'ms'); if (stepVisible) sprog.classList.add('run'); }
};
const runSteps = () => { clearInterval(stepTimer); if (!stepVisible) return; sprog && sprog.classList.add('run'); stepTimer = setInterval(() => showStep((step + 1) % STEPS.length), STEP_MS); };
stepBtns.forEach(b => b.addEventListener('click', () => { showStep(+b.dataset.step); runSteps(); }));
if (pcopy) new IntersectionObserver(([e]) => { stepVisible = e.isIntersecting; if (stepVisible) runSteps(); else { clearInterval(stepTimer); sprog && sprog.classList.remove('run'); } }, { threshold: 0.35 }).observe($('.process'));

// Footer: rotating word with a short slide
const rot = $('.rot');
if (rot) {
  const words = ['website', 'aplikasi', 'aktivasi'];
  let w = 0;
  setInterval(() => {
    rot.classList.add('out');
    setTimeout(() => { w = (w + 1) % words.length; rot.textContent = words[w]; rot.classList.remove('out'); }, 350);
  }, 2400);
}

// Scroll reveals, staggered inside each parent
const REVEAL = '.intro p,.intro h2,.work-head>*,.process>h2,.pvisual,.pcopy,.faq h2,.faq details,.cta h2,.cta .sub,.split>*,.foot h2,.loc,.flinks,.case-intro>div,.scope li,.bento figure,.more-work .head h2,.mw a,.clients span,.scard .cols,.scard .gallery';
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
const tick = () => $$('[data-tz]').forEach(t => {
  t.textContent = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: t.dataset.tz }).format(new Date());
});
tick(); setInterval(tick, 30000);
$$('[data-year]').forEach(y => y.textContent = new Date().getFullYear());
