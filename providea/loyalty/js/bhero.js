/* Perspective-tunnel hero, ported from the Providea site (providea/site/assets/js/hero.js, a vanilla port of the
   21st.dev "perspective-tunnel-hero"). Natural page scroll only: the 260vh .bh section is the track, a sticky stage
   shows the scene. Springs smooth scroll and pointer; the loop sleeps when settled or off screen.
   Changes for the Loyalty demo: scoped to .bh, the stage sits under the demo bar, a CTA row fades with the sub,
   and window.PLHero.init() returns a destroy function so the page can re-render on a language switch. */
(function () {
  'use strict';
  function init() {
    var hero = document.querySelector('.bh'); var stage = hero && hero.querySelector('.bh-stage');
    if (!stage) return function () {};
    var ac = new AbortController(), sig = { signal: ac.signal, passive: true };
    var q = function (s) { return hero.querySelector(s); };
    var cards = [].slice.call(hero.querySelectorAll('.tn-card')), rings = [].slice.call(hero.querySelectorAll('.tn-ring'));
    var title = q('.tn-title'), h1 = q('.tn-h1'), l1 = q('.tn-l1'), l2 = q('.tn-l2');
    var eyebrow = q('.tn-eyebrow'), sub = q('.tn-sub'), cta = q('.tn-cta'), cue = q('.tn-cue'), glow = q('.tn-glow'), grid = q('.tn-grid');
    var N = cards.length, mqReduce = matchMedia('(prefers-reduced-motion: reduce)'), mqPhone = matchMedia('(max-width: 640px)');
    var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; }, lerp = function (a, b, t) { return a + (b - a) * t; };
    var LEAD = 0.1, vw = 0, vh = 0, top = 0, span = 1, h1H = 0, reduce = false, P = 1200, Z0 = -1700, Z1 = 500, ZT = 300, PAR = 45, base = [];
    function measure() {
      reduce = mqReduce.matches; var phone = mqPhone.matches;
      vw = stage.clientWidth; vh = stage.clientHeight;
      P = phone ? 900 : 1200; Z0 = phone ? -1200 : -1700; Z1 = phone ? 350 : 500; ZT = phone ? 210 : 300; PAR = phone ? 20 : 45;
      var bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 0;
      top = hero.getBoundingClientRect().top + scrollY - bar;
      span = Math.max(1, hero.offsetHeight - vh);
      h1H = h1.offsetHeight;
      base = cards.map(function (_, i) { var a = (i * 137.5 * Math.PI) / 180; return [Math.cos(a) * vw * (0.28 + (i % 3) * 0.08), Math.sin(a) * vh * (0.26 + (i % 2) * 0.09), (i % 2 ? -1 : 1) * (3 + (i % 5) * 2)]; });
      title.style.transform = 'translate(-50%,-50%) translate3d(0,0,' + ZT + 'px) scale(' + ((P - ZT) / P).toFixed(4) + ')';
    }
    function spring(k, c) { return { x: 0, v: 0, t: 0, k: k, c: c }; }
    var prog = spring(120, 24), lead = spring(40, 13), px = spring(60, 16), py = spring(60, 16), springs = [prog, lead, px, py];
    function stepSpring(s, dt) { s.v += (s.k * (s.t - s.x) - s.c * s.v) * dt; s.x += s.v * dt; if (Math.abs(s.t - s.x) < 1e-4 && Math.abs(s.v) < 1e-4) { s.x = s.t; s.v = 0; return true; } return false; }
    var vis = cards.map(function () { return false; });
    function setVis(i, on) { if (vis[i] !== on) { vis[i] = on; cards[i].style.visibility = on ? 'visible' : 'hidden'; } }
    function cardOpacity(l) { return l < 0.18 ? l / 0.18 : l < 0.82 ? 1 : l < 0.98 ? 1 - (l - 0.82) / 0.16 : 0; }
    function render() {
      var p = prog.x, cp = reduce ? 0 : lead.x + p * (1 - lead.x), ox = -px.x * PAR, oy = -py.x * PAR;
      for (var i = 0; i < N; i++) {
        var local = reduce ? 0.5 : clamp01((cp - (i / N) * 0.45) / 0.55), z = Z0 + (Z1 - Z0) * local, o = cardOpacity(local), b = base[i];
        setVis(i, o > 0.002); if (!vis[i]) continue;
        cards[i].style.transform = 'translate3d(' + (b[0] + ox).toFixed(1) + 'px,' + (b[1] + oy).toFixed(1) + 'px,' + z.toFixed(1) + 'px) rotate(' + b[2] + 'deg)';
        cards[i].style.opacity = o.toFixed(3);
      }
      if (rings[0]) rings[0].style.transform = 'translate3d(0,0,' + lerp(Z0 * 0.85, Z0 * 0.15, p).toFixed(1) + 'px)';
      if (rings[1]) rings[1].style.transform = 'translate3d(0,0,' + lerp(Z0 * 0.45, Z1 * 0.25, p).toFixed(1) + 'px) rotate(' + (p * 50).toFixed(2) + 'deg)';
      glow.style.transform = 'translate3d(' + (-ox * 0.2).toFixed(1) + 'px,' + (-oy * 0.2).toFixed(1) + 'px,0) scale(' + (1 + p * 0.35).toFixed(4) + ')';
      grid.style.transform = 'scale(' + (1 + p * 0.22).toFixed(4) + ')';
      if (reduce) return;
      var s = p < 0.5 ? 0.7 + p * 0.6 : 1 + (p - 0.5) * 1.6, out = clamp01((p - 0.5) / 0.18);
      title.style.opacity = (1 - out).toFixed(3);
      title.style.filter = out > 0 && out < 1 ? 'blur(' + (out * 6).toFixed(2) + 'px)' : 'none';
      title.style.visibility = out >= 1 ? 'hidden' : 'visible';
      h1.style.transform = 'scale(' + s.toFixed(4) + ')';
      var d = ((1 - s) * h1H) / 2, side = (1 - clamp01((p - 0.3) / 0.15)).toFixed(3);
      eyebrow.style.opacity = side; sub.style.opacity = side; if (cta) { cta.style.opacity = side; cta.style.visibility = +side > 0.05 ? 'visible' : 'hidden'; }
      eyebrow.style.transform = 'translate3d(0,' + d.toFixed(1) + 'px,0)'; sub.style.transform = 'translate3d(0,' + (-d).toFixed(1) + 'px,0)'; if (cta) cta.style.transform = sub.style.transform;
      var a = clamp01((p - 0.18) / 0.1), b2 = clamp01((p - 0.22) / 0.1);
      l1.style.opacity = (1 - a).toFixed(3); l1.style.transform = 'scale(' + (1 + a * 0.06).toFixed(4) + ')'; l1.style.filter = a > 0 && a < 1 ? 'blur(' + (a * 10).toFixed(2) + 'px)' : 'none';
      l2.style.opacity = b2.toFixed(3); l2.style.transform = 'scale(' + (0.92 + b2 * 0.08).toFixed(4) + ')'; l2.style.filter = b2 > 0 && b2 < 1 ? 'blur(' + ((1 - b2) * 8).toFixed(2) + 'px)' : 'none';
      var co = 1 - clamp01(p / 0.12); cue.style.opacity = co.toFixed(3); cue.style.visibility = co > 0 ? 'visible' : 'hidden';
    }
    var raf = 0, last = 0, onScreen = true;
    function frame(now) {
      raf = 0; var dt = last ? Math.min(0.033, Math.max(0, (now - last) / 1000)) : 1 / 60; last = now;
      var settled = true; springs.forEach(function (s) { settled = stepSpring(s, dt) && settled; });
      render(); if (!settled && onScreen) raf = requestAnimationFrame(frame); else last = 0;
    }
    function kick() { if (!raf && onScreen && !reduce) raf = requestAnimationFrame(frame); }
    function readScroll() { prog.t = clamp01((scrollY - top) / span); }
    function resetInline() {
      [title, h1, l1, l2, eyebrow, sub, cta, cue].forEach(function (el) { if (el) { el.style.opacity = ''; el.style.filter = ''; el.style.visibility = ''; } });
      [h1, l1, l2, eyebrow, sub, cta].forEach(function (el) { if (el) el.style.transform = ''; });
    }
    function setup() {
      measure();
      if (reduce) { if (raf) { cancelAnimationFrame(raf); raf = 0; } springs.forEach(function (s) { s.x = s.t = 0; s.v = 0; }); resetInline(); render(); return; }
      readScroll(); lead.t = LEAD; render(); kick();
    }
    addEventListener('scroll', function () { if (reduce) return; readScroll(); kick(); }, sig);
    addEventListener('pointermove', function (e) { if (reduce || (e.pointerType !== 'mouse' && e.pointerType !== 'pen')) return; px.t = (e.clientX / vw) * 2 - 1; py.t = (e.clientY / vh) * 2 - 1; kick(); }, sig);
    document.documentElement.addEventListener('pointerleave', function () { px.t = py.t = 0; kick(); }, sig);
    var rz = 0;
    addEventListener('resize', function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(function () { measure(); if (!reduce) readScroll(); render(); kick(); }); }, sig);
    addEventListener('load', function () { measure(); if (!reduce) readScroll(); render(); kick(); }, sig);
    mqReduce.addEventListener('change', setup, sig); mqPhone.addEventListener('change', setup, sig);
    var io = new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen) kick(); }); io.observe(hero);
    setup();
    return function destroy() { ac.abort(); io.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }
  window.PLHero = { init: init };
})();
