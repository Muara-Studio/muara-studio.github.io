// Sections: scroll-driven process steps. Owner: agent C (see providea/REVISI-2026-11-03.md).
(() => {
  const track = document.querySelector('[data-proc]');
  if (!track) return;
  const panel = track.querySelector('.proc-panel');
  const btns = [...track.querySelectorAll('[data-step]')];
  const slides = [...track.querySelectorAll('[data-i]')]; // image, caption and copy of each step
  const bar = track.querySelector('.pbar');
  const N = btns.length;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let top = 0, range = 1, active = -1, queued = false;

  // Cached, so the scroll handler reads no layout: the section's top in the page and its scroll length.
  const measure = () => {
    top = track.getBoundingClientRect().top + scrollY;
    range = Math.max(1, track.offsetHeight - panel.offsetHeight);
    update();
  };

  const show = i => {
    if (i === active) return;
    active = i;
    track.style.setProperty('--a', i);
    btns.forEach((b, j) => {
      if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.classList.toggle('done', j < i);
    });
    slides.forEach(el => {
      const on = +el.dataset.i === i;
      el.classList.toggle('on', on);
      if (el.matches('.pimg')) el.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
  };

  // Scroll progress picks the step; the remainder inside the step fills the thin bar.
  const update = () => {
    queued = false;
    const x = Math.min(N, Math.max(0, (scrollY - top) / range * N));
    const i = Math.min(N - 1, Math.floor(x));
    show(i);
    bar.style.setProperty('--k', Math.min(1, x - i).toFixed(3));
  };

  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);

  // Clicking a step scrolls to the start of that step's stretch.
  btns.forEach((b, i) => b.addEventListener('click', () => {
    scrollTo({ top: top + (i + 0.02) / N * range, behavior: still.matches ? 'auto' : 'smooth' });
  }));

  measure();
})();
