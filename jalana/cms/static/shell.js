// Panel Jalana frame: menu search (Cmd/Ctrl K), one open menu group at a time, sidebar toggle, theme toggle (dark is the
// default, light is the option; 27 Okt 2026).
// No inline handler is allowed by the CSP, so this is a file. Saved state lives in localStorage under two keys only
// (jalana-tema, jalana-sisi); every access is wrapped because storage can be blocked.
(function () {
  var root = document.documentElement;
  function save(key, value) {
    try {
      if (value) { localStorage.setItem(key, value); } else { localStorage.removeItem(key); }
    } catch (e) { /* storage blocked: the choice lasts for this page only */ }
  }

  // ---- Theme: dark (default, no attribute) <-> light. A saved "dark" from the old three-way toggle still means dark.
  var themeLabels = { '': 'Tema: gelap', light: 'Tema: terang', dark: 'Tema: gelap' };
  function syncTheme() {
    var t = root.getAttribute('data-theme') || '';
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-label', themeLabels[t]);
      buttons[i].setAttribute('title', themeLabels[t]);
    }
  }
  syncTheme();

  // ---- Menu groups: opening one closes the others (not while searching)
  var searching = false;
  var groups = Array.prototype.slice.call(document.querySelectorAll('.nav-group'));
  var initialOpen = groups.map(function (g) { return g.open; });
  groups.forEach(function (g) {
    g.addEventListener('toggle', function () {
      if (g.open && !searching) {
        groups.forEach(function (o) { if (o !== g) { o.open = false; } });
      }
    });
  });

  // ---- Menu search
  var input = document.getElementById('cari-menu');
  var empty = document.querySelector('.nav-empty');
  var kbd = document.querySelector('.side-kbd');
  if (kbd && !/Mac|iPhone|iPad/.test(navigator.platform || '')) { kbd.textContent = 'Ctrl K'; }
  function filter() {
    var q = (input.value || '').trim().toLowerCase();
    searching = q !== '';
    var shown = 0;
    var singles = document.querySelectorAll('.nav > [data-nav-item]');
    for (var i = 0; i < singles.length; i++) {
      var hit = !q || singles[i].textContent.toLowerCase().indexOf(q) >= 0;
      singles[i].hidden = !hit;
      if (hit) { shown++; }
    }
    groups.forEach(function (g, gi) {
      var head = g.querySelector('summary').textContent.toLowerCase();
      var headHit = q && head.indexOf(q) >= 0;
      var items = g.querySelectorAll('[data-nav-item]');
      var hits = 0;
      for (var j = 0; j < items.length; j++) {
        var h = !q || headHit || items[j].textContent.toLowerCase().indexOf(q) >= 0;
        items[j].hidden = !h;
        if (h) { hits++; }
      }
      g.hidden = !!q && hits === 0;
      g.open = q ? hits > 0 : initialOpen[gi];
      shown += q ? hits : 1;
    });
    if (empty) { empty.hidden = !q || shown > 0; }
  }
  if (input) {
    input.addEventListener('input', filter);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        input.value = '';
        filter();
        input.blur();
      } else if (e.key === 'Enter') {
        var first = document.querySelector('.nav [data-nav-item]:not([hidden])');
        var group = first && first.closest('.nav-group');
        if (first && !(group && group.hidden)) { e.preventDefault(); window.location.href = first.getAttribute('href'); }
      }
    });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K') && input) {
      e.preventDefault();
      if (root.classList.contains('side-mini')) { root.classList.add('side-peek'); }
      if (window.matchMedia('(max-width: 900px)').matches) { root.classList.add('side-open'); }
      input.focus();
      input.select();
    }
  });
  if (input) {
    input.addEventListener('blur', function () { root.classList.remove('side-peek'); });
  }

  // ---- Clicks: theme toggle, sidebar toggle, closing the drawer on a phone
  document.addEventListener('click', function (e) {
    var tb = e.target.closest('[data-theme-toggle]');
    if (tb) {
      var cur = root.getAttribute('data-theme') || '';
      var next = cur === 'light' ? '' : 'light';
      if (next) { root.setAttribute('data-theme', next); } else { root.removeAttribute('data-theme'); }
      save('jalana-tema', next);
      syncTheme();
      return;
    }
    var sb = e.target.closest('[data-side-toggle]');
    if (sb) {
      if (window.matchMedia('(max-width: 900px)').matches) {
        root.classList.toggle('side-open');
      } else {
        var mini = root.classList.toggle('side-mini');
        save('jalana-sisi', mini ? 'mini' : '');
      }
      return;
    }
    if (root.classList.contains('side-open') && !e.target.closest('.side')) {
      root.classList.remove('side-open');
    }
  });
})();
