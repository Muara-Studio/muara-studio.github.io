/* ══ Providea loader: the logogram, gathered from dots ════════════
   Adapted from Bencho's "Particles" (MIT licence, bencho.dev/licence).
   The React component became plain JS here because this site has no
   build step; the physics, the numbers and most of the comments are
   Bencho's. What changed: one shape is the Providea logogram, the
   swarm opens as a circle and sweeps into the mark, and when the page
   has loaded a shockwave throws the dots out as the screen fades.

   When it runs: the first page of a visit, any reload, or ?intro.
   The inline script in <head> decides (class "pv-ld" on <html>), so
   the cover is painted before anything else and nothing flashes.

   ── ONE SET OF DOTS, MANY SHAPES ────────────────────────
   The dots never change, only where home is. Every shape is
   sampled to the same number of points, and a change of shape
   pairs each dot with a new home by angle round the middle, so
   the swarm sweeps round into the new outline rather than
   crossing itself.

   ── STRETCHED BY SPEED ──────────────────────────────────
   A dot at rest is round; a moving one is drawn a little long
   along the way it is going, which is what makes a burst read
   as a splash rather than a scatter of points. */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('pv-ld')) return;

  /* Read once. A preference, not a live input. */
  const still = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const en = () => root.lang === 'en';

  /* the logogram (tools/logo/marks-final.json), in its own 0..96 box */
  const MARK = 'M20.63 8H56.42C72.7 8 85.89 21.2 85.89 37.47V41.68C85.89 57.96 72.7 71.16 56.42 71.16H44.84C40.77 71.16 37.47 74.46 37.47 78.53V84.84C37.47 86.59 36.06 88 34.32 88H13.26C11.74 88 10.46 86.92 10.17 85.48C10.87 72.04 17.23 61.44 29.66 53.84C24.22 56.03 17.59 57.31 10.11 58.13V18.53C10.11 12.71 14.82 8 20.63 8ZM59.91 26.62Q48 36.38 36.09 26.62Q45.86 38.53 36.09 50.44Q48 40.67 59.91 50.44Q50.14 38.53 59.91 26.62ZM36.09 50.44C33.79 51.49 31.65 52.63 29.66 53.84C32.04 52.89 34.19 51.77 36.09 50.44Z';
  const VB = { x: 10, y: 8, w: 76, h: 80 };

  const W = 400;
  const H = 400;
  const CX = W / 2;
  const CY = H / 2;
  /* how many dots every shape is sampled to */
  const N = 680;
  /* the mark fills this much of the canvas height */
  const MARK_H = 250;
  /* never shorter than this, so the gather is seen; never longer than MAX */
  const MIN_MS = 2300;
  const MAX_MS = 7000;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const angle = (x, y) => Math.atan2(y - CY, x - CX);

  /* the mark as a Path2D, placed in the middle of the canvas */
  const k = MARK_H / VB.h;
  const mx = CX - (VB.w * k) / 2 - VB.x * k;
  const my = CY - MARK_H / 2 - VB.y * k;
  function outline(shape) {
    if (shape === 'circle') { const p = new Path2D(); p.arc(CX, CY, 132, 0, Math.PI * 2); return { p, t: [1, 0, 0, 1, 0, 0] }; }
    return { p: new Path2D(MARK), t: [k, 0, 0, k, mx, my] };
  }

  /* ── N points, spread evenly over the inside of a shape ──
     A hex grid spaced so the shape holds about N of them — its
     area over N, which is the spacing that fills it evenly — then
     trimmed or topped up to exactly N. It was a fixed fine grid
     thinned by a stride, and the stride beat against the grid:
     the circle came out in zigzag bands. */
  function homes(shape) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const { p, t } = outline(shape);
    g.setTransform(...t);                 /* isPointInPath tests in canvas space, through the transform */
    let area = 0;
    for (let y = 1; y < H; y += 2) for (let x = 1; x < W; x += 2) if (g.isPointInPath(p, x, y)) area += 4;
    const sp = Math.sqrt((area / N) * (2 / Math.sqrt(3)));
    const rowH = (sp * Math.sqrt(3)) / 2;
    const pts = [];
    for (let y = rowH / 2, row = 0; y < H; y += rowH, row++) {
      for (let x = sp / 2 + (row % 2) * (sp / 2); x < W; x += sp) {
        if (g.isPointInPath(p, x, y)) pts.push([x, y]);
      }
    }
    /* within a few of N either way; drop evenly or repeat evenly */
    const out = [];
    for (let i = 0; i < N; i++) out.push(pts[Math.floor((i * pts.length) / N)]);
    return out;
  }

  /* ── the overlay ─────────────────────────────────────── */
  const box = document.createElement('div');
  box.className = 'pvl';
  box.setAttribute('role', 'status');
  box.innerHTML = '<div class="ptc"><canvas class="ptc-canvas" aria-hidden="true"></canvas></div><span class="pvl-sr"></span>';
  box.querySelector('.pvl-sr').textContent = en() ? 'Loading Providea' : 'Memuat Providea';
  document.body.appendChild(box);
  const cv = box.querySelector('canvas');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);

  let dots = [];
  let hand = null;
  let raf = 0;
  const t0 = performance.now();

  /* ── give every dot a home in a shape ────────────────── */
  function become(shape) {
    const next = homes(shape);
    if (!dots.length) { dots = next.map(([x, y]) => ({ hx: x, hy: y, x, y, vx: 0, vy: 0 })); return; }
    /* pair by angle round the middle, so the swarm sweeps */
    const a = dots.map((d, i) => [angle(d.x, d.y), i]).sort((p, q) => p[0] - q[0]);
    const b = next.map((h, i) => [angle(h[0], h[1]), i]).sort((p, q) => p[0] - q[0]);
    a.forEach(([, di], j) => {
      const h = next[b[j][1]];
      dots[di].hx = h[0]; dots[di].hy = h[1];
      if (still) { dots[di].x = h[0]; dots[di].y = h[1]; }
    });
  }

  function draw() {
    const x = cv.getContext('2d');
    const s0 = cv.width / W;
    x.setTransform(s0, 0, 0, s0, 0, 0);
    x.clearRect(0, 0, W, H);
    /* drawn in the canvas's own `color`, so the theme carries the ink */
    x.fillStyle = getComputedStyle(cv).color;
    const r = 2.1;
    x.beginPath();
    for (const d of dots) {
      const sp = Math.hypot(d.vx, d.vy);
      if (sp < 0.3) {
        x.moveTo(d.x + r, d.y);
        x.arc(d.x, d.y, r, 0, Math.PI * 2);
      } else {
        /* long along its path, a little thin across it */
        const s = Math.min(2.6, 1 + sp * 0.12);
        const rot = Math.atan2(d.vy, d.vx);
        x.moveTo(d.x + Math.cos(rot) * r * s, d.y + Math.sin(rot) * r * s);
        x.ellipse(d.x, d.y, r * s, r / Math.sqrt(s), rot, 0, Math.PI * 2);
      }
    }
    x.fill();
  }

  /* ── one spring, for everything that settles ───────────────
     Frames, not milliseconds. `dt` is expressed in sixtieths of
     a second and the damping is RAISED to it rather than
     multiplied by it, so a dropped frame decays the same amount
     of energy as the two frames it replaced. Multiplying is the
     version that makes a spring behave differently on a busy
     page, which is the hardest kind of bug to see.
     The loop parks itself the moment everything has settled. */
  function run() {
    if (raf) return;
    let prev = 0;
    const tick = (t) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      const h = hand;
      const R = 80;              /* how far the pointer's push reaches */
      const S = 0.6 * 11;        /* how hard it pushes (force 60 of 100) */
      let busy = !!h;
      for (const d of dots) {
        if (h) {
          const dx = d.x - h.x, dy = d.y - h.y, dd = Math.hypot(dx, dy);
          if (dd < R && dd > 0.01) {
            const f = Math.pow(1 - dd / R, 2) * S;
            d.vx += (dx / dd) * f * dt;
            d.vy += (dy / dd) * f * dt;
          }
        }
        d.vx = (d.vx + (d.hx - d.x) * 0.05 * dt) * Math.pow(0.84, dt);
        d.vy = (d.vy + (d.hy - d.y) * 0.05 * dt) * Math.pow(0.84, dt);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (Math.abs(d.hx - d.x) < 0.05 && Math.abs(d.hy - d.y) < 0.05 && Math.abs(d.vx) < 0.02 && Math.abs(d.vy) < 0.02) {
          d.x = d.hx; d.y = d.hy; d.vx = 0; d.vy = 0;
        } else busy = true;
      }
      draw();
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    raf = requestAnimationFrame(tick);
  }

  /* the shockwave: dots near p are thrown outward, harder the closer they are */
  function burst(p, S = 1.1) {
    for (const d of dots) {
      const dx = d.x - p.x, dy = d.y - p.y, dd = Math.hypot(dx, dy);
      if (dd > 220 || dd < 0.01) continue;
      const f = (1 - dd / 220) * 30 * S;
      d.vx += (dx / dd) * f; d.vy += (dy / dd) * f;
    }
  }

  const where = (e) => {
    const r = cv.getBoundingClientRect();
    const s = r.width / W;
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  };

  /* ── the sequence: circle → logogram → (loaded) burst + fade ── */
  become('circle');
  draw();
  if (still) { become('mark'); draw(); }
  else { setTimeout(() => { become('mark'); run(); }, 260); }

  if (!still) {
    cv.addEventListener('pointermove', (e) => { hand = where(e); run(); });
    cv.addEventListener('pointerleave', () => { hand = null; run(); });
  }

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    try { sessionStorage.setItem('pv-intro', '1'); } catch (e) {}
    if (!still) { burst({ x: CX, y: CY }); hand = null; run(); }
    setTimeout(() => {
      box.classList.add('out');
      root.classList.remove('pv-ld');
      setTimeout(() => { cancelAnimationFrame(raf); box.remove(); }, 650);
    }, still ? 0 : 220);
  }
  /* a press skips the wait once the page is ready */
  box.addEventListener('pointerdown', () => { if (document.readyState === 'complete') finish(); });

  const ready = () => setTimeout(finish, Math.max(0, MIN_MS - (performance.now() - t0)));
  if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready, { once: true });
  setTimeout(finish, MAX_MS);
})();
