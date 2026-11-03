// owner: see providea/REVISI-2026-11-03.md (Agent B, hero)
// Perspective tunnel hero, a vanilla port of the 21st.dev "perspective-tunnel-hero".
// Natural page scroll only: the 260vh section is the track, a sticky 100svh stage shows the scene.
// Scroll progress and pointer are smoothed with springs in rAF; the loop sleeps when settled or off-screen.
(() => {
  const hero = document.querySelector('.hero');
  const stage = hero && hero.querySelector('.hero-stage');
  if (!stage) return;
  const q = s => hero.querySelector(s);
  const cards = [...hero.querySelectorAll('.tn-card')];
  const rings = [...hero.querySelectorAll('.tn-ring')];
  const title = q('.tn-title'), h1 = q('.tn-h1'), l1 = q('.tn-l1'), l2 = q('.tn-l2');
  const eyebrow = q('.tn-eyebrow'), sub = q('.tn-sub'), cue = q('.tn-cue'), glow = q('.tn-glow'), grid = q('.tn-grid');
  const N = cards.length;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqPhone = matchMedia('(max-width: 640px)');

  // Temporary hotlinks: fall back to a local image when one fails
  cards.forEach(c => {
    const img = c.querySelector('img');
    const fb = () => { const f = img.dataset.fallback; if (f && !img.src.endsWith(f)) img.src = f; };
    img.addEventListener('error', fb, { once: true });
    if (img.complete && img.naturalWidth === 0) fb();
  });

  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const LEAD = 0.1; // cards start a little way into their flight, so the first screen already shows depth

  // Cached viewport + layout (refreshed on resize only)
  let vw = 0, vh = 0, top = 0, span = 1, h1H = 0, reduce = false;
  let P = 1200, Z0 = -1700, Z1 = 500, ZT = 300, PAR = 45;
  let base = [];
  const measure = () => {
    reduce = mqReduce.matches;
    const phone = mqPhone.matches;
    vw = stage.clientWidth; vh = stage.clientHeight;
    P = phone ? 900 : 1200; Z0 = phone ? -1200 : -1700; Z1 = phone ? 350 : 500;
    ZT = phone ? 210 : 300; PAR = phone ? 20 : 45;
    top = hero.getBoundingClientRect().top + scrollY;
    span = Math.max(1, hero.offsetHeight - vh);
    h1H = h1.offsetHeight;
    base = cards.map((_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      return [
        Math.cos(a) * vw * (0.28 + (i % 3) * 0.08),
        Math.sin(a) * vh * (0.26 + (i % 2) * 0.09),
        (i % 2 ? -1 : 1) * (3 + (i % 5) * 2),
      ];
    });
    // Title plane sits at depth ZT, scaled back so it reads at its layout size
    title.style.transform = `translate(-50%,-50%) translate3d(0,0,${ZT}px) scale(${((P - ZT) / P).toFixed(4)})`;
  };

  // Springs (semi-implicit Euler, dt clamped)
  const spring = (k, c) => ({ x: 0, v: 0, t: 0, k, c });
  const prog = spring(120, 24), lead = spring(40, 13), px = spring(60, 16), py = spring(60, 16);
  const springs = [prog, lead, px, py];
  const stepSpring = (s, dt) => {
    s.v += (s.k * (s.t - s.x) - s.c * s.v) * dt;
    s.x += s.v * dt;
    if (Math.abs(s.t - s.x) < 1e-4 && Math.abs(s.v) < 1e-4) { s.x = s.t; s.v = 0; return true; }
    return false;
  };

  const vis = cards.map(() => false);
  const setVis = (i, on) => { if (vis[i] !== on) { vis[i] = on; cards[i].style.visibility = on ? 'visible' : 'hidden'; } };
  const cardOpacity = l => (l < 0.18 ? l / 0.18 : l < 0.82 ? 1 : l < 0.98 ? 1 - (l - 0.82) / 0.16 : 0);

  const render = () => {
    const p = prog.x;
    const cp = reduce ? 0 : lead.x + p * (1 - lead.x);
    const ox = -px.x * PAR, oy = -py.x * PAR;

    for (let i = 0; i < N; i++) {
      const local = reduce ? 0.5 : clamp01((cp - (i / N) * 0.45) / 0.55);
      const z = Z0 + (Z1 - Z0) * local;
      const o = cardOpacity(local);
      const [bx, by, r] = base[i];
      setVis(i, o > 0.002);
      if (!vis[i]) continue;
      cards[i].style.transform = `translate3d(${(bx + ox).toFixed(1)}px,${(by + oy).toFixed(1)}px,${z.toFixed(1)}px) rotate(${r}deg)`;
      cards[i].style.opacity = o.toFixed(3);
    }

    // Depth rings drift toward the viewer; the dashed one turns slowly
    if (rings[0]) rings[0].style.transform = `translate3d(0,0,${lerp(Z0 * 0.85, Z0 * 0.15, p).toFixed(1)}px)`;
    if (rings[1]) rings[1].style.transform = `translate3d(0,0,${lerp(Z0 * 0.45, Z1 * 0.25, p).toFixed(1)}px) rotate(${(p * 50).toFixed(2)}deg)`;
    glow.style.transform = `translate3d(${(-ox * 0.2).toFixed(1)}px,${(-oy * 0.2).toFixed(1)}px,0) scale(${(1 + p * 0.35).toFixed(4)})`;
    grid.style.transform = `scale(${(1 + p * 0.22).toFixed(4)})`;

    if (reduce) return;

    // Title: 0.7 -> 1, then flies past the viewer and is gone by .68, so the last stretch is cards only.
    // Eyebrow and sub leave first (.30-.45), right after the line swap.
    const s = p < 0.5 ? 0.7 + p * 0.6 : 1 + (p - 0.5) * 1.6;
    const out = clamp01((p - 0.5) / 0.18);
    title.style.opacity = (1 - out).toFixed(3);
    title.style.filter = out > 0 && out < 1 ? `blur(${(out * 6).toFixed(2)}px)` : 'none';
    title.style.visibility = out >= 1 ? 'hidden' : 'visible';
    h1.style.transform = `scale(${s.toFixed(4)})`;
    const d = ((1 - s) * h1H) / 2; // keep eyebrow and sub hugging the scaled h1
    const side = (1 - clamp01((p - 0.3) / 0.15)).toFixed(3);
    eyebrow.style.opacity = side;
    sub.style.opacity = side;
    eyebrow.style.transform = `translate3d(0,${d.toFixed(1)}px,0)`;
    sub.style.transform = `translate3d(0,${(-d).toFixed(1)}px,0)`;

    // Line swap around .18-.32: the first blurs out, the second fades in with a slight scale
    const a = clamp01((p - 0.18) / 0.1), b = clamp01((p - 0.22) / 0.1);
    l1.style.opacity = (1 - a).toFixed(3);
    l1.style.transform = `scale(${(1 + a * 0.06).toFixed(4)})`;
    l1.style.filter = a > 0 && a < 1 ? `blur(${(a * 10).toFixed(2)}px)` : 'none';
    l2.style.opacity = b.toFixed(3);
    l2.style.transform = `scale(${(0.92 + b * 0.08).toFixed(4)})`;
    l2.style.filter = b > 0 && b < 1 ? `blur(${((1 - b) * 8).toFixed(2)}px)` : 'none';

    const co = 1 - clamp01(p / 0.12);
    cue.style.opacity = co.toFixed(3);
    cue.style.visibility = co > 0 ? 'visible' : 'hidden';
  };

  // rAF loop: runs only while the hero is on screen and something is still moving
  let raf = 0, last = 0, onScreen = true;
  const frame = now => {
    raf = 0;
    const dt = last ? Math.min(0.033, Math.max(0, (now - last) / 1000)) : 1 / 60;
    last = now;
    let settled = true;
    for (const s of springs) settled = stepSpring(s, dt) && settled;
    render();
    if (!settled && onScreen) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const kick = () => { if (!raf && onScreen && !reduce) raf = requestAnimationFrame(frame); };

  const readScroll = () => { prog.t = clamp01((scrollY - top) / span); };
  const resetInline = () => {
    [title, h1, l1, l2, eyebrow, sub, cue].forEach(el => { el.style.opacity = ''; el.style.filter = ''; el.style.visibility = ''; });
    [h1, l1, l2, eyebrow, sub].forEach(el => (el.style.transform = ''));
  };
  const setup = () => {
    measure();
    if (reduce) {
      if (raf) cancelAnimationFrame(raf), (raf = 0);
      springs.forEach(s => { s.x = s.t = 0; s.v = 0; });
      resetInline();
      render();
      return;
    }
    readScroll();
    lead.t = LEAD;
    render();
    kick();
  };

  addEventListener('scroll', () => { if (reduce) return; readScroll(); kick(); }, { passive: true });
  addEventListener('pointermove', e => {
    if (reduce || (e.pointerType !== 'mouse' && e.pointerType !== 'pen')) return;
    px.t = (e.clientX / vw) * 2 - 1;
    py.t = (e.clientY / vh) * 2 - 1;
    kick();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { px.t = py.t = 0; kick(); });

  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { measure(); if (!reduce) readScroll(); render(); kick(); }); }, { passive: true });
  addEventListener('load', () => { measure(); if (!reduce) readScroll(); render(); kick(); });
  mqReduce.addEventListener('change', setup);
  mqPhone.addEventListener('change', setup);

  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) kick(); }).observe(hero);

  // Language change (lang.js swaps the text first): the headline can wrap differently, so measure again
  addEventListener('pv:lang', () => requestAnimationFrame(() => { measure(); if (!reduce) readScroll(); render(); kick(); }));

  setup();
})();
