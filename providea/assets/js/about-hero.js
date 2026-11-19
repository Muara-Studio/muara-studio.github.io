/* Tentang hero: the grey Providea mark drifts behind the reeded glass.
   Reveal on load, then a slow drift plus a light pointer parallax, so the ribs seem to
   refract it. Off for reduced motion. */
(function () {
  var hero = document.querySelector('.ab-hero');
  if (!hero) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('ab-in'); }); });
  if (reduce) return;
  var px = 0, t0 = performance.now(), raf = 0, visible = true;
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width - 0.5) * 2; // -1 … 1
  });
  hero.addEventListener('pointerleave', function () { px = 0; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !raf) loop(); }).observe(hero);
  }
  var cur = 0;
  function loop() {
    raf = 0;
    if (!visible) return;
    var t = (performance.now() - t0) / 1000;
    var target = Math.sin(t * 0.35) * 10 + px * 18; // px: slow drift ± pointer
    cur += (target - cur) * 0.06;
    hero.style.setProperty('--abx', cur.toFixed(2) + 'px');
    raf = requestAnimationFrame(loop);
  }
  loop();
})();
