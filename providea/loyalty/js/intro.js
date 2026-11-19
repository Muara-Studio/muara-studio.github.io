/* Loading screen, ported from the Providea Influence intro (same build): 680 dots start as a circle and settle
   into the Providea Loyalty mark (the Providea P and star with three small stars set as an L), the pointer pushes them aside, and the screen
   fades out once the page has loaded (at least 1,6 s, at most 6 s; a tap ends it). Once per browser session.
   Skipped for automated browsers and with prefers-reduced-motion it shows the mark still, then fades. ?intro forces it. */
(function () {
  'use strict';
  function want() {
    try { return /[?&#]intro\b/.test(location.search + location.hash) || (!navigator.webdriver && !sessionStorage.getItem('pl-intro')); } catch (e) { return false; }
  }
  if (!want()) return;
  var W = 400, H = 400, CX = W / 2, CY = H / 2, N = 680, MARKH = 250, MIN = 1600, MAX = 6000;
  var BOX = { x: 10, y: 8, w: 76, h: 80 }, K = MARKH / BOX.h, OX = CX - BOX.w * K / 2 - BOX.x * K, OY = CY - MARKH / 2 - BOX.y * K;
  var MARK = 'M20.63 8H56.42C72.7 8 85.89 21.2 85.89 37.47V41.68C85.89 57.96 72.7 71.16 56.42 71.16H44.84C40.77 71.16 37.47 74.46 37.47 78.53V84.84C37.47 86.59 36.06 88 34.32 88H13.26C11.74 88 10.46 86.92 10.17 85.48C10.87 72.04 17.23 61.44 29.66 53.84C24.22 56.03 17.59 57.31 10.11 58.13V18.53C10.11 12.71 14.82 8 20.63 8ZM59.91 26.62Q48 36.38 36.09 26.62Q45.86 38.53 36.09 50.44Q48 40.67 59.91 50.44Q50.14 38.53 59.91 26.62ZM36.09 50.44C33.79 51.49 31.65 52.63 29.66 53.84C32.04 52.89 34.19 51.77 36.09 50.44ZM21.5 31Q19 33.05 16.5 31Q18.55 33.5 16.5 36Q19 33.95 21.5 36Q19.45 33.5 21.5 31ZM22.4 40.1Q19 42.89 15.6 40.1Q18.39 43.5 15.6 46.9Q19 44.11 22.4 46.9Q19.61 43.5 22.4 40.1ZM31 41Q28.5 43.05 26 41Q28.05 43.5 26 46Q28.5 43.95 31 46Q28.95 43.5 31 41Z';
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ang = function (x, y) { return Math.atan2(y - CY, x - CX); };
  function shape(kind) {
    if (kind === 'circle') { var c = new Path2D(); c.arc(CX, CY, 132, 0, Math.PI * 2); return { p: c, t: [1, 0, 0, 1, 0, 0] }; }
    return { p: new Path2D(MARK), t: [K, 0, 0, K, OX, OY] };
  }
  function points(kind) {
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var g = cv.getContext('2d'); if (!g) return [];
    var s = shape(kind); g.setTransform.apply(g, s.t);
    var area = 0, x, y, r, i;
    for (y = 1; y < H; y += 2) for (x = 1; x < W; x += 2) if (g.isPointInPath(s.p, x, y, 'evenodd')) area += 4;
    var dx = Math.sqrt(area / N * (2 / Math.sqrt(3))), dy = dx * Math.sqrt(3) / 2, pts = [];
    for (y = dy / 2, r = 0; y < H; y += dy, r++) for (x = dx / 2 + (r % 2) * (dx / 2); x < W; x += dx) if (g.isPointInPath(s.p, x, y, 'evenodd')) pts.push([x, y]);
    var out = []; for (i = 0; i < N; i++) out.push(pts[Math.floor(i * pts.length / N)]);
    return out;
  }
  function start() {
    var wrap = document.createElement('div'); wrap.className = 'pvl'; wrap.setAttribute('role', 'status');
    wrap.innerHTML = '<div class="ptc"><canvas class="ptc-canvas" aria-hidden="true"></canvas></div><span class="sr-only">' + (document.documentElement.lang === 'en' ? 'Loading Providea Loyalty' : 'Memuat Providea Loyalty') + '</span>';
    document.body.appendChild(wrap);
    var cv = wrap.querySelector('canvas'), reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var dots = [], ptr = null, raf = 0, timers = [], t0 = performance.now(), done = false;
    function morph(kind) {
      var tg = points(kind);
      if (!dots.length) { dots = tg.map(function (p) { return { hx: p[0], hy: p[1], x: p[0], y: p[1], vx: 0, vy: 0 }; }); return; }
      var a = dots.map(function (d, i) { return [ang(d.x, d.y), i]; }).sort(function (p, q) { return p[0] - q[0]; });
      var b = tg.map(function (p, i) { return [ang(p[0], p[1]), i]; }).sort(function (p, q) { return p[0] - q[0]; });
      a.forEach(function (e, n) { var t = tg[b[n][1]], d = dots[e[1]]; d.hx = t[0]; d.hy = t[1]; if (reduce) { d.x = t[0]; d.y = t[1]; } });
    }
    function draw() {
      var g = cv.getContext('2d'); if (!g) return; var s = cv.width / W;
      g.setTransform(s, 0, 0, s, 0, 0); g.clearRect(0, 0, W, H); g.fillStyle = getComputedStyle(cv).color;
      var r = 2.1; g.beginPath();
      dots.forEach(function (d) {
        var v = Math.hypot(d.vx, d.vy);
        if (v < 0.3) { g.moveTo(d.x + r, d.y); g.arc(d.x, d.y, r, 0, Math.PI * 2); }
        else { var st = Math.min(2.6, 1 + v * 0.12), a = Math.atan2(d.vy, d.vx); g.moveTo(d.x + Math.cos(a) * r * st, d.y + Math.sin(a) * r * st); g.ellipse(d.x, d.y, r * st, r / Math.sqrt(st), a, 0, Math.PI * 2); }
      });
      g.fill();
    }
    function run() {
      if (raf) return; var last = 0;
      var step = function (now) {
        var k = last ? clamp((now - last) / 16.67, 0, 2.5) : 1; last = now; var moving = !!ptr;
        dots.forEach(function (d) {
          if (ptr) { var dx = d.x - ptr.x, dy = d.y - ptr.y, dist = Math.hypot(dx, dy); if (dist < 80 && dist > 0.01) { var f = Math.pow(1 - dist / 80, 2) * 6.6; d.vx += dx / dist * f * k; d.vy += dy / dist * f * k; } }
          d.vx = (d.vx + (d.hx - d.x) * 0.05 * k) * Math.pow(0.84, k); d.vy = (d.vy + (d.hy - d.y) * 0.05 * k) * Math.pow(0.84, k);
          d.x += d.vx * k; d.y += d.vy * k;
          if (Math.abs(d.hx - d.x) < 0.05 && Math.abs(d.hy - d.y) < 0.05 && Math.abs(d.vx) < 0.02 && Math.abs(d.vy) < 0.02) { d.x = d.hx; d.y = d.hy; d.vx = 0; d.vy = 0; } else moving = true;
        });
        draw(); raf = moving ? requestAnimationFrame(step) : 0;
      };
      raf = requestAnimationFrame(step);
    }
    function burst(c) { dots.forEach(function (d) { var dx = d.x - c.x, dy = d.y - c.y, dist = Math.hypot(dx, dy); if (dist > 220 || dist < 0.01) return; var f = (1 - dist / 220) * 33; d.vx += dx / dist * f; d.vy += dy / dist * f; }); }
    var at = function (e) { var b = cv.getBoundingClientRect(), s = b.width / W; return { x: (e.clientX - b.left) / s, y: (e.clientY - b.top) / s }; };
    morph('circle'); draw();
    if (reduce) { morph('mark'); draw(); } else timers.push(setTimeout(function () { morph('mark'); run(); }, 260));
    var move = function (e) { ptr = at(e); run(); }, leave = function () { ptr = null; run(); };
    if (!reduce) { cv.addEventListener('pointermove', move); cv.addEventListener('pointerleave', leave); }
    function finish() {
      if (done) return; done = true;
      try { sessionStorage.setItem('pl-intro', '1'); } catch (e) {}
      if (!reduce) { burst({ x: CX, y: CY }); ptr = null; run(); }
      timers.push(setTimeout(function () { wrap.classList.add('out'); timers.push(setTimeout(function () { cancelAnimationFrame(raf); timers.forEach(clearTimeout); wrap.remove(); }, 650)); }, reduce ? 0 : 220));
    }
    wrap.addEventListener('pointerdown', function () { if (document.readyState === 'complete') finish(); });
    var loaded = function () { timers.push(setTimeout(finish, Math.max(0, MIN - (performance.now() - t0)))); };
    if (document.readyState === 'complete') loaded(); else addEventListener('load', loaded, { once: true });
    timers.push(setTimeout(finish, MAX));
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
