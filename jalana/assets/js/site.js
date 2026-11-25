
window.jt = (text, vars) => {
const en = window.JALANA_EN;
const out = en && Object.prototype.hasOwnProperty.call(en, text) && typeof en[text] === 'string' ? en[text] : text;
return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m)) : out;
};
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const isStatic = document.documentElement.classList.contains('static');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const jt = window.jt;
const asset = (u) => (!u || /^(?:[a-z][a-z0-9+.-]*:|\/|\.|#)/i.test(u) ? u : (window.JALANA_BASE || '') + u);
$$('.lang a').forEach((a) => {
const keep = () => { a.href = a.getAttribute('href').split('#')[0] + location.hash; };
a.addEventListener('pointerdown', keep);
a.addEventListener('click', keep);
});
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
if (vid.dataset.poster && !vid.poster) vid.poster = asset(vid.dataset.poster);
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
lbImg.src = asset(btn.dataset.lightboxSrc);
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
const TIER = {
perunggu: () => [jt('Perunggu'), jt('kunjungan ke-1')],
perak: () => [jt('Perak'), jt('kunjungan ke-5')],
emas: () => [jt('Emas'), jt('kunjungan ke-10')],
};
let token = 0;
const show = () => {
const id = sel.value;
const tier = ($('input[name="tier"]:checked', form) || {}).value || 'emas';
const name = sel.options[sel.selectedIndex].text;
const src = (window.JALANA_BASE || '') + `assets/img/v2/lencana/${id}-${tier}-384.webp`;
const [tierName, visit] = (TIER[tier] || TIER.emas)();
const t = ++token;
const swap = () => {
if (t !== token) return;
img.src = src;
img.alt = jt('Lencana {name}, tingkat {tier}', { name, tier: tierName.toLowerCase() });
cap.textContent = jt('{name}. {tier}, {visit}.', { name, tier: tierName, visit });
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
await loadScript((window.JALANA_BASE || '') + 'assets/3d/meshopt_decoder.js');
await import(MV);
await customElements.whenDefined('model-viewer');
customElements.get('model-viewer').meshoptDecoderLocation = 'data:text/javascript,';
const small = matchMedia('(max-width: 47.99rem)').matches;
const mv = document.createElement('model-viewer');
mv.setAttribute('src', asset(small ? model.dataset.srcSmall : model.dataset.src));
mv.setAttribute('alt', jt('Model 3D Arca Prajnaparamita. Seret untuk memutar.'));
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
status.textContent = jt('Layar {n} dari {total}', { n: active + 1, total: n });
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
$('span', playBtn).textContent = userPaused ? jt('Putar otomatis') : jt('Jeda putar otomatis');
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
label.textContent = on ? jt('Balik kartu: lihat depan') : jt('Balik kartu: lihat kontak');
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
if (hint) hint.textContent = back ? window.jt('Ketuk kartu untuk melihat sisi depan.') : window.jt('Ketuk kartu untuk melihat sisi belakang.');
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
(() => {
const show = document.querySelector('[data-arc-show]');
if (!show) return;
const slides = [...show.querySelectorAll('.arc__slide')];
const dots = [...show.querySelectorAll('.arc__dot')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const still = document.documentElement.classList.contains('static');
let at = 0, timer = 0, visible = false, hold = false;
const go = (n) => {
at = (n + slides.length) % slides.length;
slides.forEach((s, k) => { s.classList.toggle('is-on', k === at); s.setAttribute('aria-hidden', String(k !== at)); });
dots.forEach((d, k) => d.setAttribute('aria-current', String(k === at)));
};
const stop = () => { clearInterval(timer); timer = 0; };
const start = () => {
stop();
if (visible && !hold && !still && !reduce.matches && !document.hidden) timer = setInterval(() => go(at + 1), 4500);
};
dots.forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
show.addEventListener('pointerenter', () => { hold = true; stop(); });
show.addEventListener('pointerleave', () => { hold = false; start(); });
show.addEventListener('focusin', () => { hold = true; stop(); });
show.addEventListener('focusout', () => { hold = false; start(); });
document.addEventListener('visibilitychange', start);
reduce.addEventListener?.('change', start);
new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.4 }).observe(show);
})();
(() => {
const wall = document.querySelector('[data-wall]');
const form = document.querySelector('[data-join]');
const done = document.querySelector('[data-join-done]');
const tpl = document.querySelector('[data-join-card]');
if (!wall || !form || !done || !tpl) return;
const jt = window.jt || ((t) => t);
const cols = Array.from(wall.querySelectorAll('[data-wall-col]'));
const lead = document.querySelector('[data-join-lead]');
const play = document.querySelector('[data-wall-play]');
const thanks = done.querySelector('[data-join-thanks]');
const next = done.querySelector('[data-join-next]');
const waLink = done.querySelector('[data-join-wa]');
const again = done.querySelector('[data-join-again]');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const isStatic = document.documentElement.classList.contains('static');
const KEY = 'jalana.daftar.v1';
const endpoint = () => (form.dataset.endpoint || '').trim();
const waNumber = () => (form.dataset.wa || '').replace(/\D/g, '');
const mode = () => (endpoint() ? 'endpoint' : waNumber() ? 'wa' : 'preview');
const copy = (li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.dataset.clone = ''; c.classList.remove('kcard--new'); return c; };
if (!reduce.matches && !isStatic) {
cols.forEach((col) => Array.from(col.children).forEach((li) => col.appendChild(copy(li))));
wall.setAttribute('data-run', '');
if (play) {
play.hidden = false;
play.addEventListener('click', () => {
const paused = wall.toggleAttribute('data-paused');
play.querySelector('span').textContent = paused ? jt('Lanjutkan gerak') : jt('Jeda gerak');
play.querySelector('use').setAttribute('href', paused ? '#i-player-play' : '#i-player-pause');
});
}
if ('IntersectionObserver' in window) {
new IntersectionObserver((entries) => entries.forEach((en) => wall.toggleAttribute('data-off', !en.isIntersecting)), { rootMargin: '200px 0px' }).observe(wall);
}
}
const fmt = new Intl.DateTimeFormat(document.documentElement.lang === 'en' ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const makeCard = (d) => {
const li = tpl.content.firstElementChild.cloneNode(true);
const when = new Date(d.waktu);
li.querySelector('[data-card-pesan]').textContent = d.pesan;
li.querySelector('[data-card-nama]').textContent = d.nama;
li.querySelector('[data-card-tanggal]').textContent = Number.isNaN(when.getTime()) ? '' : fmt.format(when);
return li;
};
const dropCard = () => wall.querySelectorAll('.kcard--you').forEach((n) => n.remove());
const addCard = (d, fresh) => {
dropCard();
const col = cols[0];
if (!col) return;
const firstCopy = col.querySelector('[data-clone]');
const own = makeCard(d);
if (fresh) own.classList.add('kcard--new');
col.insertBefore(own, col.firstChild);
if (firstCopy) col.insertBefore(copy(makeCard(d)), firstCopy);
place(col);
};
const place = (col) => {
col.style.animation = 'none';
void col.offsetWidth;
col.style.animation = '';
col.style.animationDelay = '';
if (!wall.hasAttribute('data-run')) { wall.scrollTo({ left: 0, top: 0 }); return; }
const cs = getComputedStyle(col);
const dur = parseFloat(cs.animationDuration) || 60;
const gap = parseFloat(cs.columnGap) || 16;
const vertical = cs.flexDirection === 'column';
const loop = ((vertical ? col.scrollHeight : col.scrollWidth) + gap) / 2;
const box = wall.getBoundingClientRect();
const cardW = col.firstElementChild.getBoundingClientRect().width;
const offset = vertical ? Math.round(box.height * 0.09) + 20 : Math.max(16, (box.width - cardW) / 2);
col.style.animationDelay = `${-((1 - offset / loop) * dur).toFixed(2)}s`;
};
const f = form.elements;
const err = form.querySelector('[data-join-error]');
const send = form.querySelector('[data-join-send]');
const sendLabel = form.querySelector('[data-join-send-label]');
const note = form.querySelector('[data-join-note]');
const sendText = sendLabel ? sendLabel.textContent : '';
if (note && mode() === 'wa') note.textContent = jt('Tombol ini membuka WhatsApp dengan pesan siap kirim. Kami memakai datamu hanya untuk kabar Jalana.');
const clear = () => { err.hidden = true; err.textContent = ''; [f.nama, f.email, f.pesan].forEach((el) => el.removeAttribute('aria-invalid')); };
const fail = (el, msg) => { err.textContent = msg; err.hidden = false; if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); } };
const busy = (on) => { send.disabled = on; if (sendLabel) sendLabel.textContent = on ? jt('Mengirim') : sendText; };
const waUrl = (d) => {
const text = [
jt('Halo Muara, saya ingin gabung waitlist Jalana.'),
'',
`${jt('Nama')}: ${d.nama}`,
`${jt('Email')}: ${d.email}`,
`${jt('Pesan')}: ${d.pesan}`,
].join('\n');
return `https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`;
};
const showDone = (d, how, url) => {
const fresh = how !== 'saved';
form.hidden = true;
if (lead) lead.hidden = true;
done.hidden = false;
thanks.textContent = fresh ? jt('Terima kasih, {nama}. Kartumu sudah masuk.', { nama: d.nama }) : jt('Kartumu tersimpan di perangkat ini.');
const line = how === 'wa' ? jt('Satu langkah lagi: tekan kirim di WhatsApp supaya namamu tercatat.')
: how === 'preview' ? jt('Mode pratinjau: formulir ini belum aktif. Kami belum mengirim datamu.')
: '';
if (next) { next.textContent = line; next.hidden = !line; }
if (waLink) {
if (how === 'wa' && url) { waLink.href = url; waLink.hidden = false; }
else { waLink.hidden = true; waLink.setAttribute('href', '#daftar'); }
}
if (fresh) {
done.focus({ preventScroll: true });
const target = matchMedia('(min-width: 64rem)').matches ? form.closest('.join__side') || done : done;
target.scrollIntoView({ block: 'start', behavior: reduce.matches || isStatic ? 'auto' : 'smooth' });
}
};
const finish = (d, how, url) => {
try { localStorage.setItem(KEY, JSON.stringify({ nama: d.nama, pesan: d.pesan, waktu: d.waktu })); } catch (_) { /* private mode: the card still shows now */ }
addCard(d, true);
showDone(d, how, url);
};
form.addEventListener('submit', (e) => {
e.preventDefault();
if (send.disabled) return;
clear();
const d = { nama: f.nama.value.trim().replace(/\s+/g, ' '), email: f.email.value.trim(), pesan: f.pesan.value.trim().replace(/\s+/g, ' '), waktu: Date.now() };
if (d.nama.length < 2) return fail(f.nama, jt('Isi namamu dulu.'));
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return fail(f.email, jt('Email ini belum benar. Contoh: nama@email.com.'));
if (d.pesan.length < 3) return fail(f.pesan, jt('Tulis satu pesan dulu.'));
const how = mode();
const url = how === 'wa' ? waUrl(d) : '';
const bot = !!(f.situs && f.situs.value);
if (how === 'wa' && !bot) {
window.open(url, '_blank', 'noopener');
}
if (how !== 'endpoint' || bot) return finish(d, how, url);
busy(true);
fetch(endpoint(), { method: 'POST', body: new URLSearchParams({ nama: d.nama, email: d.email, pesan: d.pesan }) })
.then((res) => res.json())
.then((out) => { if (!out || out.ok !== true) throw new Error('ditolak'); })
.then(() => { busy(false); finish(d, how, url); }, () => { busy(false); fail(null, jt('Belum terkirim. Periksa koneksimu, lalu coba lagi.')); });
});
if (again) again.addEventListener('click', () => {
try { localStorage.removeItem(KEY); } catch (_) { /* no storage: nothing was saved */ }
dropCard();
form.reset();
clear();
busy(false);
if (waLink) { waLink.hidden = true; waLink.setAttribute('href', '#daftar'); }
done.hidden = true;
if (lead) lead.hidden = false;
form.hidden = false;
f.nama.focus();
});
try {
const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
if (saved && typeof saved.nama === 'string' && typeof saved.pesan === 'string' && saved.nama && saved.pesan) {
const d = { nama: saved.nama.slice(0, 40), pesan: saved.pesan.slice(0, 140), waktu: saved.waktu };
addCard(d, false);
showDone(d, 'saved');
}
} catch (_) { /* no storage: start with the empty form */ }
})();
(() => {
const dlg = document.querySelector('[data-stepbox]');
const tiles = Array.from(document.querySelectorAll('button.step[data-step]'));
if (!dlg || !tiles.length || typeof dlg.showModal !== 'function') return;
const jt = window.jt || ((t) => t);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const isStatic = document.documentElement.classList.contains('static');
const img = dlg.querySelector('[data-stepbox-img]');
const count = dlg.querySelector('[data-stepbox-count]');
const title = dlg.querySelector('[data-stepbox-title]');
const desc = dlg.querySelector('[data-stepbox-desc]');
const closeBtn = dlg.querySelector('[data-stepbox-close]');
const prev = dlg.querySelector('[data-stepbox-prev]');
const next = dlg.querySelector('[data-stepbox-next]');
const total = tiles.length;
const asset = (u) => (!u || /^(?:[a-z][a-z0-9+.-]*:|\/|\.|#)/i.test(u) ? u : (window.JALANA_BASE || '') + u);
const srcOf = (i) => asset(tiles[i].dataset.src || '');
const warm = [];
let at = 0;
[count, title, desc].forEach((el) => { if (el) el.setAttribute('aria-live', 'polite'); });
const show = (i, fade) => {
at = ((i % total) + total) % total;
const t = tiles[at];
if (img) { img.src = srcOf(at); img.alt = t.dataset.alt || ''; }
if (count) count.textContent = jt('Langkah {n} dari {total}', { n: at + 1, total });
if (title) title.textContent = t.dataset.title || '';
if (desc) desc.textContent = t.dataset.desc || '';
dlg.dataset.at = String(at + 1);
if (fade && !reduce.matches && !isStatic) {
[img, title, desc].forEach((el) => { if (el && el.animate) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' }); });
}
const n = (at + 1) % total;
if (!warm[n]) { warm[n] = new Image(); warm[n].decoding = 'async'; warm[n].src = srcOf(n); }
};
tiles.forEach((t, i) => t.addEventListener('click', () => {
show(i, false);
dlg._opener = t;
if (!dlg.open) dlg.showModal();
if (!dlg.contains(document.activeElement) && closeBtn) closeBtn.focus({ preventScroll: true });
}));
if (closeBtn) closeBtn.addEventListener('click', () => dlg.close());
if (prev) prev.addEventListener('click', () => show(at - 1, true));
if (next) next.addEventListener('click', () => show(at + 1, true));
dlg.addEventListener('keydown', (e) => {
if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1, true); }
if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1, true); }
});
})();
