// owner: agent A (i18n), see providea/REVISI-2026-11-03b.md
// Indonesian is the default text in the HTML. English sits in data-en* attributes on the same element:
//   data-en            -> replaces the element's innerHTML (textContent for <title>, <textarea>)
//   data-en-<attr>     -> replaces that attribute (aria-label, placeholder, alt, title, content, value, wa -> data-wa)
// shell.js owns the dropdown: it stores pv-lang, sets <html lang> and raises window "pv:lang" (detail 'id' | 'en').
// This file does not store anything. It applies the saved choice on load and swaps text when pv:lang fires.
// The Indonesian original is cached in data-pv-id (html) and data-pv-id-<attr> the first time an element is swapped.
(() => {
  const root = document.documentElement;
  const KEY = 'pv-lang';
  const ATTRS = ['aria-label', 'placeholder', 'alt', 'title', 'content', 'value', 'wa'];
  const SEL = '[data-en],' + ATTRS.map(a => '[data-en-' + a + ']').join(',');
  const PLAIN = /^(title|textarea|option)$/;

  const saved = () => {
    try { const v = localStorage.getItem(KEY); return v === 'en' || v === 'id' ? v : null; } catch (e) { return null; }
  };
  let cur = root.lang === 'en' ? 'en' : 'id';

  const swap = (el, en) => {
    if (el.hasAttribute('data-en')) {
      const plain = PLAIN.test(el.localName);
      if (!el.hasAttribute('data-pv-id') && en) el.setAttribute('data-pv-id', plain ? el.textContent : el.innerHTML);
      if (el.hasAttribute('data-pv-id')) {
        const v = el.getAttribute(en ? 'data-en' : 'data-pv-id');
        if (plain) el.textContent = v; else el.innerHTML = v;
      }
    }
    for (const a of ATTRS) {
      const k = 'data-en-' + a;
      if (!el.hasAttribute(k)) continue;
      const target = a === 'wa' ? 'data-wa' : a, cache = 'data-pv-id-' + a;
      if (!el.hasAttribute(cache)) {
        if (!en) continue;
        el.setAttribute(cache, el.getAttribute(target) || '');
      }
      el.setAttribute(target, el.getAttribute(en ? k : cache));
      // WhatsApp links are built once by main.js: keep their prefilled text in step with the language
      if (a === 'wa') {
        const h = el.getAttribute('href');
        if (h && /^https:\/\/wa\.me\//.test(h)) el.setAttribute('href', h.split('?')[0] + '?text=' + encodeURIComponent(el.getAttribute('data-wa')));
      }
    }
  };

  const apply = (l, scope) => {
    const en = l === 'en';
    const base = scope || document;
    if (scope && scope.matches && scope.matches(SEL)) swap(scope, en);
    base.querySelectorAll(SEL).forEach(el => swap(el, en));
  };

  const set = l => {
    cur = l === 'en' ? 'en' : 'id';
    root.lang = cur;
    root.dataset.lang = cur;
    apply(cur);
  };

  // On load: only English needs work, the HTML already holds Indonesian
  const start = saved();
  if (start) { cur = start; root.lang = start; root.dataset.lang = start; }
  if (cur === 'en') apply('en');

  // shell.js raises this after the dropdown choice (it has already stored it)
  window.addEventListener('pv:lang', e => set(e.detail));

  // Back/forward cache and other tabs: if the saved choice changed while this page was away, follow it
  const follow = () => {
    const s = saved();
    if (s && s !== cur) window.dispatchEvent(new CustomEvent('pv:lang', { detail: s }));
  };
  window.addEventListener('pageshow', e => { if (e.persisted) follow(); });
  window.addEventListener('storage', e => { if (e.key === KEY) follow(); });

  // For scripts that add translated markup later: pvLang.apply(element) swaps just that subtree
  window.pvLang = { get: () => cur, apply: scope => apply(cur, scope) };
})();
