
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const isStatic = document.documentElement.classList.contains('static');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const bar = $('[data-bar]');
if (bar) {
let ticking = false;
const paint = () => { ticking = false; bar.dataset.solid = String(window.scrollY > 24); };
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
paint();
}
const openDialog = (dlg, opener) => {
if (!dlg || typeof dlg.showModal !== 'function') return false;
dlg._opener = opener || document.activeElement;
dlg.showModal();
return true;
};
$$('dialog').forEach((dlg) => {
dlg.addEventListener('close', () => { if (dlg._opener) dlg._opener.focus({ preventScroll: true }); });
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
});
const film = $('[data-video]');
const vid = film && $('[data-video-el]', film);
$$('[data-video-open]').forEach((b) => b.addEventListener('click', () => {
if (!openDialog(film, b)) return;
if (vid.dataset.poster && !vid.poster) vid.poster = vid.dataset.poster;
vid.preload = 'auto';
const p = vid.play();
if (p && p.catch) p.catch(() => {});
vid.focus({ preventScroll: true });
}));
if (film) {
$('[data-video-close]', film).addEventListener('click', () => film.close());
film.addEventListener('close', () => vid.pause());
}
const credits = $('[data-credits]');
$$('[data-credits-open]').forEach((b) => b.addEventListener('click', () => openDialog(credits, b)));
if (credits) $('[data-credits-close]', credits).addEventListener('click', () => credits.close());
if (location.hash === '#kredit' && credits) openDialog(credits);
const lb = $('[data-lightbox]');
const lbImg = lb && $('[data-lightbox-img]', lb);
const lbCap = lb && $('[data-lightbox-cap]', lb);
const openLightbox = (btn) => {
if (!lb) return;
lbImg.src = btn.dataset.lightboxSrc;
lbImg.width = Number(btn.dataset.lightboxW);
lbImg.height = Number(btn.dataset.lightboxH);
lbImg.alt = btn.dataset.lightboxAlt || '';
lbCap.textContent = btn.dataset.lightboxCap || '';
openDialog(lb, btn);
};
$$('.shot__open').forEach((b) => b.addEventListener('click', () => openLightbox(b)));
if (lb) $('[data-lightbox-close]', lb).addEventListener('click', () => lb.close());
const reveals = $$('[data-reveal]');
const bySection = new Map();
reveals.forEach((el) => {
const s = el.closest('section, footer') || document.body;
const n = bySection.get(s) || 0;
el.style.setProperty('--d', `${Math.min(n, 4) * 70}ms`);
bySection.set(s, n + 1);
});
if (isStatic || !('IntersectionObserver' in window)) {
reveals.forEach((el) => el.classList.add('is-in'));
} else {
const io = new IntersectionObserver((entries) => {
for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
reveals.forEach((el) => io.observe(el));
}
const mock = $('[data-tilt]');
if (mock && fine.matches && !reduce.matches && !isStatic) {
let raf = 0;
window.addEventListener('pointermove', (e) => {
if (raf) return;
raf = requestAnimationFrame(() => {
raf = 0;
const x = e.clientX / window.innerWidth - 0.5;
const y = e.clientY / window.innerHeight - 0.5;
mock.style.setProperty('--ry', `${-20 + x * 14}deg`);
mock.style.setProperty('--rx', `${6 - y * 8}deg`);
});
}, { passive: true });
}
const viewer = $('[data-viewer]');
if (viewer) {
const imgs = $$('[data-view]', viewer);
const line = $('[data-viewer-line]', viewer);
const lines = $$('p', $('[data-viewer-lines]', viewer).content).map((p) => p.textContent);
$('[data-viewer-tabs]', viewer).addEventListener('change', (e) => {
const i = Number(e.target.value);
imgs.forEach((img) => { const on = Number(img.dataset.view) === i; img.classList.toggle('is-on', on); if (on) img.loading = 'eager'; });
line.textContent = lines[i] || '';
});
}
const form = $('[data-badge-form]');
if (form) {
const img = $('[data-badge-img]');
const cap = $('[data-badge-cap]');
const sel = $('[data-badge-museum]', form);
const TIER = { perunggu: ['Perunggu', 'kunjungan ke-1'], perak: ['Perak', 'kunjungan ke-5'], emas: ['Emas', 'kunjungan ke-10'] };
let token = 0;
const show = () => {
const id = sel.value;
const tier = ($('input[name="tier"]:checked', form) || {}).value || 'emas';
const name = sel.options[sel.selectedIndex].text;
const src = `assets/img/v2/lencana/${id}-${tier}-384.webp`;
const t = ++token;
const swap = () => {
if (t !== token) return;
img.src = src;
img.alt = `Lencana ${name}, tingkat ${TIER[tier][0].toLowerCase()}`;
cap.textContent = `${name}. ${TIER[tier][0]}, ${TIER[tier][1]}.`;
requestAnimationFrame(() => img.classList.remove('is-swapping'));
};
const pre = new Image();
pre.decoding = 'async';
pre.src = src;
if (reduce.matches) { pre.onload = swap; pre.onerror = swap; return; }
img.classList.add('is-swapping');
const ready = pre.decode ? pre.decode().catch(() => {}) : Promise.resolve();
Promise.all([ready, new Promise((r) => setTimeout(r, 220))]).then(swap);
};
form.addEventListener('change', show);
form.addEventListener('submit', (e) => e.preventDefault());
}
const model = $('[data-model]');
if (model && 'IntersectionObserver' in window) {
const stage = $('[data-model-stage]', model);
const MV = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js';
const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.async = true; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
const start = async () => {
try {
await loadScript('assets/3d/meshopt_decoder.js');
await import(MV);
await customElements.whenDefined('model-viewer');
customElements.get('model-viewer').meshoptDecoderLocation = 'data:text/javascript,';
const small = matchMedia('(max-width: 47.99rem)').matches;
const mv = document.createElement('model-viewer');
mv.setAttribute('src', small ? model.dataset.srcSmall : model.dataset.src);
mv.setAttribute('alt', 'Model 3D Arca Prajnaparamita. Seret untuk memutar.');
mv.setAttribute('camera-controls', '');
mv.setAttribute('disable-zoom', '');
mv.setAttribute('disable-pan', '');
mv.setAttribute('interaction-prompt', 'none');
mv.setAttribute('camera-orbit', '20deg 80deg auto');
mv.setAttribute('min-camera-orbit', 'auto 55deg auto');
mv.setAttribute('max-camera-orbit', 'auto 100deg auto');
mv.setAttribute('shadow-intensity', '1');
mv.setAttribute('shadow-softness', '0.8');
mv.setAttribute('exposure', '0.9');
mv.setAttribute('tone-mapping', 'aces');
mv.setAttribute('touch-action', 'pan-y');
mv.setAttribute('loading', 'eager');
if (!reduce.matches) { mv.setAttribute('auto-rotate', ''); mv.setAttribute('auto-rotate-delay', '600'); mv.setAttribute('rotation-per-second', '14deg'); }
mv.addEventListener('load', () => stage.classList.add('is-ready'), { once: true });
mv.addEventListener('camera-change', (e) => { if (e.detail && e.detail.source === 'user-interaction') stage.classList.add('is-touched'); });
stage.insertBefore(mv, stage.firstChild);
} catch (err) {
stage.classList.add('is-failed'); // the poster stays
}
};
const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { near.disconnect(); start(); } }, { rootMargin: '500px 0px' });
near.observe(model);
}
const flow = $('[data-flow]');
if (flow) {
const stage = $('[data-flow-stage]', flow);
const slides = $$('.flow__slide', stage);
const cap = $('[data-flow-caption]', flow);
const status = $('[data-flow-status]', flow);
const playBtn = $('[data-flow-play]', flow);
const n = slides.length;
let active = 0, started = false;
const MAX = 3;
const layout = () => {
const flat = reduce.matches;
const w = stage.clientWidth;
const sw = slides[0].offsetWidth || w * 0.8;
const step = Math.min(sw * 0.42, (w - sw) / 2 / 1.6 + sw * 0.22);
slides.forEach((s, i) => {
let d = i - active;
if (d > n / 2) d -= n;
if (d < -n / 2) d += n;
const a = Math.abs(d);
const on = d === 0;
s.classList.toggle('is-active', on);
s.setAttribute('aria-hidden', on ? 'false' : 'true');
const btn = $('button', s);
btn.tabIndex = on ? 0 : -1;
if (on && started) $('img', s).loading = 'eager';
if (flat) {
s.style.transform = 'none';
s.style.opacity = on ? '1' : '0';
s.style.zIndex = on ? '2' : '1';
s.style.pointerEvents = on ? 'auto' : 'none';
return;
}
const visible = a <= MAX;
s.style.transform = `translateX(${d * step}px) translateZ(${-180 * a}px) rotateY(${d === 0 ? 0 : d > 0 ? -45 : 45}deg) scale(${Math.max(0.4, 1 - 0.15 * a)})`;
s.style.opacity = visible ? String(a === 0 ? 1 : Math.max(0.35, 1 - a * 0.22)) : '0';
s.style.filter = a === 0 ? 'none' : `brightness(${Math.max(0.5, 1 - a * 0.16)})`;
s.style.zIndex = String(10 - a);
s.style.pointerEvents = visible ? 'auto' : 'none';
});
cap.textContent = slides[active].dataset.caption || '';
status.textContent = `Layar ${active + 1} dari ${n}`;
};
const go = (i) => { started = true; active = (i + n) % n; layout(); };
$('[data-flow-prev]', flow).addEventListener('click', () => { go(active - 1); hold(); });
$('[data-flow-next]', flow).addEventListener('click', () => { go(active + 1); hold(); });
slides.forEach((s, i) => $('button', s).addEventListener('click', (e) => {
if (dragged) { e.preventDefault(); return; }
if (i === active) openLightbox(e.currentTarget); else go(i);
}));
flow.addEventListener('keydown', (e) => {
if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); hold(); }
if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); hold(); }
});
let x0 = 0, t0 = 0, down = false, dragged = false;
stage.addEventListener('pointerdown', (e) => { down = true; dragged = false; x0 = e.clientX; t0 = performance.now(); });
stage.addEventListener('pointermove', (e) => { if (down && Math.abs(e.clientX - x0) > 8) dragged = true; });
const end = (e) => {
if (!down) return;
down = false;
const dx = e.clientX - x0;
const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
if (Math.abs(dx) > 60 || (v > 0.5 && Math.abs(dx) > 20)) { go(active + (dx < 0 ? 1 : -1)); hold(); }
setTimeout(() => { dragged = false; }, 0);
};
stage.addEventListener('pointerup', end);
stage.addEventListener('pointercancel', () => { down = false; });
let timer = 0, userPaused = reduce.matches || isStatic, hovered = false, focused = false, seen = false;
const tick = () => go(active + 1);
const sync = () => {
const run = !userPaused && !hovered && !focused && seen && !document.hidden;
if (run && !timer) timer = setInterval(tick, 6000);
if (!run && timer) { clearInterval(timer); timer = 0; }
playBtn.setAttribute('aria-pressed', String(!userPaused));
$('span', playBtn).textContent = userPaused ? 'Putar otomatis' : 'Jeda putar otomatis';
$('use', playBtn).setAttribute('href', userPaused ? '#i-player-play' : '#i-player-pause');
};
const hold = () => { if (timer) { clearInterval(timer); timer = 0; sync(); } };
playBtn.addEventListener('click', () => { userPaused = !userPaused; sync(); });
if (reduce.matches) playBtn.hidden = true;
flow.addEventListener('mouseenter', () => { hovered = true; sync(); });
flow.addEventListener('mouseleave', () => { hovered = false; sync(); });
flow.addEventListener('focusin', () => { focused = true; sync(); });
flow.addEventListener('focusout', (e) => { if (!flow.contains(e.relatedTarget)) { focused = false; sync(); } });
document.addEventListener('visibilitychange', sync);
if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { threshold: 0.4 }).observe(stage);
reduce.addEventListener && reduce.addEventListener('change', layout);
window.addEventListener('resize', layout, { passive: true });
layout();
sync();
}
$$('[data-disclose]').forEach((btn) => {
const panel = document.getElementById(btn.getAttribute('aria-controls'));
if (!panel) return;
btn.addEventListener('click', () => {
const open = btn.getAttribute('aria-expanded') !== 'true';
btn.setAttribute('aria-expanded', String(open));
panel.dataset.open = String(open);
if (open) {
panel.inert = false;
$$('img', panel).forEach((img) => { img.loading = 'eager'; });
} else {
const done = () => { if (btn.getAttribute('aria-expanded') === 'false') panel.inert = true; };
if (reduce.matches) done(); else setTimeout(done, 650);
}
});
});
const card = $('[data-bcard]');
if (card) {
const tilt = $('[data-bcard-tilt]', card);
const inner = $('.bcard__inner', card);
const front = $('[data-bcard-front]', card);
const back = $('[data-bcard-back]', card);
const flipBtn = $('[data-bcard-flip]', card);
const label = $('[data-bcard-flip-label]', card);
const flip = () => {
const on = card.dataset.flipped !== 'true';
card.dataset.flipped = String(on);
front.inert = on;
back.inert = !on;
flipBtn.setAttribute('aria-pressed', String(on));
label.textContent = on ? 'Balik kartu: lihat depan' : 'Balik kartu: lihat kontak';
};
flipBtn.addEventListener('click', flip);
tilt.addEventListener('click', (e) => { if (!e.target.closest('a') && !window.getSelection().toString()) flip(); });
tilt.addEventListener('keydown', (e) => {
if (e.target !== tilt) return;
if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
});
if (fine.matches && !reduce.matches && !isStatic) {
tilt.addEventListener('pointermove', (e) => {
const r = tilt.getBoundingClientRect();
const x = (e.clientX - r.left) / r.width - 0.5;
const y = (e.clientY - r.top) / r.height - 0.5;
card.classList.add('is-tilting');
inner.style.setProperty('--ry', `${x * 16}deg`);
inner.style.setProperty('--rx', `${-y * 12}deg`);
});
tilt.addEventListener('pointerleave', () => {
card.classList.remove('is-tilting');
inner.style.setProperty('--ry', '0deg');
inner.style.setProperty('--rx', '0deg');
});
}
}
})();
(() => {
const root = document.querySelector('[data-voices]');
if (!root) return;
const track = root.querySelector('[data-voices-track]');
const prev = root.querySelector('[data-voices-prev]');
const next = root.querySelector('[data-voices-next]');
if (!track || !prev || !next) return;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const cards = Array.from(track.children);
const behavior = () => (reduce.matches ? 'auto' : 'smooth');
const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
const go = (dir) => track.scrollBy({ left: dir * step(), behavior: behavior() });
const sync = () => {
const max = track.scrollWidth - track.clientWidth - 4;
prev.setAttribute('aria-disabled', String(track.scrollLeft <= 4));
next.setAttribute('aria-disabled', String(track.scrollLeft >= max));
};
prev.addEventListener('click', () => go(-1));
next.addEventListener('click', () => go(1));
track.addEventListener('keydown', (e) => {
if (e.key === 'ArrowRight') go(1);
else if (e.key === 'ArrowLeft') go(-1);
else if (e.key === 'Home') track.scrollTo({ left: 0, behavior: behavior() });
else if (e.key === 'End') track.scrollTo({ left: track.scrollWidth, behavior: behavior() });
else return;
e.preventDefault();
});
let ticking = false;
track.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; sync(); }); } }, { passive: true });
window.addEventListener('resize', sync);
sync();
})();
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const isStatic = document.documentElement.classList.contains('static');
const card = document.querySelector('[data-kartu]');
if (card) {
const btn = card.querySelector('[data-kartu-btn]');
const hint = card.querySelector('[data-kartu-hint]');
btn.addEventListener('click', () => {
const back = btn.getAttribute('aria-pressed') !== 'true';
btn.setAttribute('aria-pressed', String(back));
card.classList.toggle('is-back', back);
if (hint) hint.textContent = back ? 'Ketuk kartu untuk melihat sisi depan.' : 'Ketuk kartu untuk melihat sisi belakang.';
});
if (!isStatic && 'IntersectionObserver' in window) {
new IntersectionObserver((entries) => entries.forEach((e) => card.classList.toggle('is-live', e.isIntersecting && !reduce.matches)), { rootMargin: '0px' }).observe(card);
}
if (!isStatic) {
let frame = 0, last = null;
const paint = () => {
frame = 0;
if (!last) return;
const r = btn.getBoundingClientRect();
const x = Math.min(1, Math.max(0, (last.clientX - r.left) / r.width));
const y = Math.min(1, Math.max(0, (last.clientY - r.top) / r.height));
const s = card.style;
s.setProperty('--ry', `${((x - 0.5) * 16).toFixed(2)}deg`);
s.setProperty('--rx', `${((0.5 - y) * 12).toFixed(2)}deg`);
s.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
s.setProperty('--my', `${(y * 100).toFixed(1)}%`);
s.setProperty('--hx', `${(x * 100).toFixed(1)}%`);
s.setProperty('--hy', `${(y * 100).toFixed(1)}%`);
s.setProperty('--px', x.toFixed(3));
s.setProperty('--py', y.toFixed(3));
};
btn.addEventListener('pointermove', (e) => {
if (!fine.matches || reduce.matches || e.pointerType === 'touch') return;
card.classList.add('is-tilting');
last = e;
if (!frame) frame = requestAnimationFrame(paint);
});
btn.addEventListener('pointerleave', () => {
last = null;
card.classList.remove('is-tilting');
['--rx', '--ry', '--mx', '--my', '--hx', '--hy', '--px', '--py'].forEach((p) => card.style.removeProperty(p));
});
}
}
const tiers = document.querySelector('[data-tiers]');
if (tiers) {
const steps = Array.from(tiers.querySelectorAll('.tiers__step'));
const sync = () => {
const on = tiers.querySelector('input:checked');
if (!on) return;
const i = steps.findIndex((s) => s.contains(on));
tiers.dataset.tier = on.value;
steps.forEach((s, k) => s.classList.toggle('is-reached', k <= i));
};
tiers.addEventListener('change', sync);
sync();
}
})();
