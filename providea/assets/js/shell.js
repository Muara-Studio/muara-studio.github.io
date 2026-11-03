// Shell (agent A): theme toggle, language dropdown, menu overlay, footer rotating word and clocks.
(() => {
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  // Strings made here follow <html lang>: lang.js sets it on load, applyLang below keeps it current
  const isEn = () => root.lang === 'en';

  /* Theme: saved choice (pv-theme), else the system preference. Icons crossfade in CSS. */
  const savedTheme = store.get('pv-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
  const sysDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches);
  const paintTheme = () => {
    const d = isDark();
    $$('[data-theme-toggle]').forEach(b => {
      b.setAttribute('aria-label', isEn() ? (d ? 'Light mode' : 'Dark mode') : (d ? 'Mode terang' : 'Mode gelap'));
      b.setAttribute('aria-pressed', d ? 'true' : 'false');
    });
  };
  $$('[data-theme-toggle]').forEach(b => b.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    store.set('pv-theme', root.dataset.theme);
    paintTheme();
  }));
  sysDark.addEventListener('change', paintTheme);
  paintTheme();

  /* Language dropdown (listbox). We store the choice, set <html lang> and raise pv:lang; lang.js swaps the text. */
  const langHooks = []; // re-render of text made by this file, run on every language change
  const dds = $$('.lang-dd');
  let lang = store.get('pv-lang');
  if (lang !== 'id' && lang !== 'en') lang = 'id';
  const opts = dd => $$('[role=option]', dd);
  const paintLang = () => dds.forEach(dd => {
    $('.lang-cur', dd).textContent = lang.toUpperCase();
    $('.lang-btn', dd).setAttribute('aria-label', (lang === 'en' ? 'Language: ' : 'Bahasa: ') + lang.toUpperCase());
    opts(dd).forEach(o => o.setAttribute('aria-selected', String(o.dataset.langOpt === lang)));
  });
  const applyLang = (l, emit) => {
    lang = l; root.lang = l; root.dataset.lang = l; paintLang(); paintTheme();
    langHooks.forEach(fn => fn());
    if (emit) { store.set('pv-lang', l); window.dispatchEvent(new CustomEvent('pv:lang', { detail: l })); }
  };
  // Changes that came from elsewhere (back/forward cache, another tab) arrive as pv:lang too
  window.addEventListener('pv:lang', e => { if ((e.detail === 'en' ? 'en' : 'id') !== lang) applyLang(e.detail === 'en' ? 'en' : 'id', false); });
  const closeDD = (dd, refocus) => {
    if (!dd.classList.contains('open')) return;
    dd.classList.remove('open');
    const btn = $('.lang-btn', dd);
    btn.setAttribute('aria-expanded', 'false');
    if (refocus) btn.focus({ preventScroll: true });
  };
  const openDD = (dd, which) => {
    dds.forEach(o => o !== dd && closeDD(o));
    dd.classList.add('open');
    $('.lang-btn', dd).setAttribute('aria-expanded', 'true');
    const list = opts(dd);
    const i = which === 'last' ? list.length - 1 : Math.max(0, list.findIndex(o => o.dataset.langOpt === lang));
    list[i].focus({ preventScroll: true });
  };
  const pick = (dd, o) => { if (o.dataset.langOpt !== lang) applyLang(o.dataset.langOpt, true); closeDD(dd, true); };
  dds.forEach(dd => {
    const btn = $('.lang-btn', dd);
    btn.addEventListener('click', () => (dd.classList.contains('open') ? closeDD(dd, true) : openDD(dd)));
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openDD(dd, e.key === 'ArrowUp' ? 'last' : null); }
    });
    $('[role=listbox]', dd).addEventListener('keydown', e => {
      const list = opts(dd), i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus();
      } else if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault(); list[e.key === 'Home' ? 0 : list.length - 1].focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); if (i > -1) pick(dd, list[i]);
      } else if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation(); closeDD(dd, true);
      } else if (e.key === 'Tab') closeDD(dd, false);
    });
    opts(dd).forEach(o => o.addEventListener('click', () => pick(dd, o)));
  });
  document.addEventListener('pointerdown', e => dds.forEach(dd => { if (!dd.contains(e.target)) closeDD(dd, false); }));
  applyLang(lang, false);

  /* Menu overlay: circle reveal from the Menu button, scroll lock, focus in and back, Esc closes */
  const menu = $('#menu'), openBtn = $('[data-menu]');
  let menuOpen = false;
  if (menu && openBtn) {
    const closeBtn = $('[data-menu-close]', menu);
    let others = [];
    const origin = () => {
      const r = openBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 4;
      menu.style.setProperty('--mx', x + 'px');
      menu.style.setProperty('--my', y + 'px');
      menu.style.setProperty('--mr', R + 'px');
    };
    const open = () => {
      if (menuOpen) return;
      menuOpen = true;
      origin();
      root.style.setProperty('--sbw', (innerWidth - root.clientWidth) + 'px');
      root.classList.add('pv-locked');
      others = [...document.body.children].filter(el => el !== menu && !el.inert && !/^(script|svg)$/i.test(el.tagName));
      others.forEach(el => { el.inert = true; });
      menu.inert = false;
      menu.classList.add('open');
      openBtn.setAttribute('aria-expanded', 'true');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    };
    const close = refocus => {
      if (!menuOpen) return;
      menuOpen = false;
      dds.forEach(dd => closeDD(dd, false));
      origin();
      menu.classList.remove('open');
      menu.inert = true;
      others.forEach(el => { el.inert = false; });
      others = [];
      root.classList.remove('pv-locked');
      openBtn.setAttribute('aria-expanded', 'false');
      if (refocus) openBtn.focus({ preventScroll: true });
    };
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', () => close(true));
    menu.addEventListener('click', e => { if (e.target.closest('a')) close(false); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const dd = dds.find(d => d.classList.contains('open'));
      if (dd) { closeDD(dd, true); return; }
      if (menuOpen) close(true);
    });
    addEventListener('resize', () => { if (menuOpen) origin(); }, { passive: true });
  }

  /* Wordmark: read the solid background under it and pick white or near-black (images keep the theme ink) */
  const hdr = $('.hdr'), brand = hdr && $('.brand', hdr);
  if (brand) {
    let raf = 0;
    const tone = () => {
      raf = 0;
      if (menuOpen) return;
      const r = brand.getBoundingClientRect();
      let t = '';
      for (const el of document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)) {
        if (hdr.contains(el)) continue;
        if (/^(IMG|VIDEO|CANVAS|PICTURE)$/.test(el.tagName)) break;
        const cs = getComputedStyle(el);
        if (cs.backgroundImage !== 'none' && el !== document.body && el !== root) break;
        const m = cs.backgroundColor.match(/[\d.]+/g);
        if (m && (m.length < 4 || +m[3] >= 0.5)) { t = 0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2] < 128 ? 'dark' : 'light'; break; }
      }
      hdr.classList.toggle('on-dark', t === 'dark');
      hdr.classList.toggle('on-light', t === 'light');
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(tone); };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req, { passive: true });
    new MutationObserver(() => setTimeout(req, 350)).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    sysDark.addEventListener('change', () => setTimeout(req, 350));
    req();
  }

  /* FAB: step aside while the CTA section (#jadwal, with its own WhatsApp chat) is on screen */
  const fab = $('.fab'), cta = $('#jadwal');
  if (fab) {
    fab.addEventListener('animationend', () => { fab.style.animation = 'none'; }, { once: true });
    if (cta) new IntersectionObserver(([e]) => fab.classList.toggle('fab-off', e.isIntersecting), { rootMargin: '0px 0px -12% 0px' }).observe(cta);
  }

  /* Footer: rotating word (blur + slide, inline width animates) */
  const rot = $('.foot .rot');
  if (rot && rot.firstElementChild) {
    const WORDS = { id: ['website', 'aplikasi', 'aktivasi'], en: ['website', 'app', 'activation'] };
    const words = () => WORDS[isEn() ? 'en' : 'id'];
    let w = 0, cur = rot.firstElementChild, timer = 0;
    const swap = () => {
      w = (w + 1) % words().length;
      const n = document.createElement('span');
      n.className = 'enter';
      n.textContent = words()[w];
      rot.style.width = cur.offsetWidth + 'px';
      rot.append(n);
      rot.style.width = n.offsetWidth + 'px';
      cur.classList.add('leave');
      cur.setAttribute('aria-hidden', 'true');
      n.classList.remove('enter');
      const old = cur;
      cur = n;
      setTimeout(() => { old.remove(); rot.style.width = ''; }, 650);
    };
    const run = on => { clearInterval(timer); if (on) timer = setInterval(swap, reduced.matches ? 4200 : 2600); };
    new IntersectionObserver(([e]) => run(e.isIntersecting)).observe(rot);
    // Language change: show the same word in the new language (the word's width follows its text)
    langHooks.push(() => { [...rot.children].forEach(c => { if (!c.classList.contains('leave')) c.textContent = words()[w]; }); });
  }

  /* Footer: analog + digital clocks per office, every 30 s */
  const pad = n => String(n).padStart(2, '0');
  const clocks = $$('.loc').map(loc => {
    const t = $('time[data-tz]', loc), svg = $('.clock', loc);
    if (!t || !svg) return null;
    const tz = t.dataset.tz;
    return {
      t, svg, h: $('.hh', svg), m: $('.mh', svg), ha: null, ma: null,
      parts: new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' }),
      tz, label: null,
    };
  }).filter(Boolean);
  // Digital label in the active locale (24 h in both: 20.41 in Indonesian, 20:41 in English)
  const labels = () => clocks.forEach(c => {
    c.label = new Intl.DateTimeFormat(isEn() ? 'en-GB' : 'id-ID', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  });
  // Always turn forward, so 59 → 0 minutes does not spin the hand backwards
  const forward = (prev, deg) => (prev === null ? deg : prev + (((deg - prev) % 360) + 360) % 360);
  const tick = () => {
    const now = new Date();
    clocks.forEach(c => {
      const p = {};
      c.parts.formatToParts(now).forEach(x => { p[x.type] = +x.value; });
      const H = p.hour % 24, M = p.minute, S = p.second;
      c.ma = forward(c.ma, (M + S / 60) * 6);
      c.ha = forward(c.ha, ((H % 12) + M / 60) * 30);
      c.m.style.rotate = c.ma + 'deg';
      c.h.style.rotate = c.ha + 'deg';
      c.t.textContent = c.label.format(now);
      c.t.dateTime = pad(H) + ':' + pad(M);
    });
  };
  if (clocks.length) {
    labels();
    langHooks.push(() => { labels(); tick(); });
    tick();
    requestAnimationFrame(() => requestAnimationFrame(() => clocks.forEach(c => c.svg.classList.add('live'))));
    setInterval(tick, 30000);
  }

  /* Header slides away while scrolling down and comes back on scroll up, so it never sits on content. */
  if (hdr) {
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      ticking = false;
      const y = scrollY, menuOpen = root.classList.contains('pv-locked');
      if (menuOpen || y < 120 || y < lastY - 4) hdr.classList.remove('hdr-away');
      else if (y > lastY + 4) hdr.classList.add('hdr-away');
      if (Math.abs(y - lastY) > 4) lastY = y;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  }
})();
