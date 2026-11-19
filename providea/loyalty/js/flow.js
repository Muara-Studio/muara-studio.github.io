/* Providea Loyalty landing · "Cara kerja" (#cara-kerja): the customer journey in six steps, in pseudo-3D.
   A hand holds a phone (img/flow/hand.webp, keyed in _build/flow/key-hand.py); the live demo screens sit behind
   the photo's transparent screen, inside the same transformed element, so they tilt with the phone.
   Desktop: sticky stage, scroll moves through the steps (rail on the left). Phones (<= 860px) and reduced motion:
   stacked step cards, each with its own still scene. Screens: _build/flow/shoot.mjs + pack.py.
   API: PLFlow.html() returns the section; PLFlow.init() wires it and returns destroy(). */
(function () {
  'use strict';
  var P = window.PL;
  function T(s, v) { return P.T(s, v); }

  /* scr: phone screen for the step. Rina Maharani, Gold: a Rp47.000 sale earns floor(4 x 1,25) = 5 points, 1 stamp. */
  var STEPS = [
    { t: 'Pindai QR', x: 'Pelanggan memindai QR di meja kasir dengan kamera HP.', scr: 'scan' },
    { t: 'Buka di browser', x: 'Halaman member merek langsung terbuka. Tidak perlu unduh aplikasi.', scr: 'join' },
    { t: 'Daftar 30 detik', x: 'Isi nama dan nomor HP. Kode masuk lewat WhatsApp.', scr: 'otp' },
    { t: 'Belanja di kasir', x: 'Saat pelanggan check-in, kasir langsung melihat nama dan tier-nya.', scr: 'checkin' },
    { t: 'Poin masuk', x: 'Poin dan stempel muncul di kartu di HP saat itu juga.', scr: 'home' },
    { t: 'Tercatat otomatis', x: 'Penjualan masuk ke dashboard pemilik dan terhubung dengan POS yang sudah dipakai (integrasi fleksibel). Kasir tidak perlu ganti sistem.', scr: 'home' }
  ];
  var SCREENS = ['scan', 'join', 'otp', 'checkin', 'home'];
  var N = STEPS.length;

  function pic(name, cls, lazy) { return '<img class="' + cls + '" src="img/flow/' + name + '-' + P.lang() + '.webp" alt=""' + (lazy ? ' loading="lazy"' : '') + ' decoding="async">'; }

  /* one scene; mini = a still for one step (stacked layout), otherwise the full stage that changes with data-step */
  function scene(i, mini) {
    var has = function (k) { return !mini || k.indexOf(i) >= 0; };
    var shots = mini ? [STEPS[i].scr] : SCREENS;
    var h = '<div class="fl-scene' + (mini ? ' is-mini' : '') + '" data-step="' + i + '" data-scr="' + STEPS[i].scr + '"' + (mini ? '' : ' id="flScene"') + ' aria-hidden="true">';
    if (has([0])) h += '<div class="fl-standee">' + P.wordmark(30) + '<span>' + T('Jadi member atau check-in') + '</span>' + P.qr('counter-cempaka') + '<small>' + T('Outlet Cempaka') + '</small></div>';
    if (has([3, 4])) h += '<div class="fl-tab"><div class="fl-tab-scr">' + pic('tab-checkin', 'fl-img', true) + '</div></div>';
    if (has([5])) {
      h += '<svg class="fl-wire" viewBox="0 0 100 100" preserveAspectRatio="none"><path id="' + (mini ? 'flw1m' + i : 'flw1') + '" d="M39 44 C45 44 44 27 50 27"/><path id="' + (mini ? 'flw2m' + i : 'flw2') + '" d="M77 46 L77 67"/>' +
        (mini ? '' : '<circle r="0.9"><animateMotion dur="1.8s" repeatCount="indefinite"><mpath href="#flw1"/></animateMotion></circle><circle r="0.9"><animateMotion dur="1.4s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear"><mpath href="#flw2"/></animateMotion></circle>') + '</svg>';
      h += '<div class="fl-dash"><div class="fl-dash-bar"><i></i><span>loyalty.providea.id/kamtono</span></div>' + pic('dash', 'fl-img', true) + '</div>';
      h += '<div class="fl-sale">' + ic('receipt', 16) + '<span><b>' + T('Penjualan baru') + '</b><small class="num">Rina Maharani · ' + P.rp(47000) + '</small></span><em class="num">' + T('+{n} poin', { n: 5 }) + '</em></div>';
      h += '<div class="fl-pos"><span class="fl-pos-ic">' + ic('cash-register', 20) + '</span><span><b>' + T('POS yang sudah dipakai') + '</b><small>' + T('Integrasi fleksibel') + '</small></span></div>';
    }
    h += '<div class="fl-hand"><div class="fl-screen">' + shots.map(function (s) { return '<span class="fl-scr" data-s="' + s + '">' + pic('hp-' + s, 'fl-img', true) + '</span>'; }).join('') + '</div>' +
      '<img class="fl-hand-img" src="img/flow/hand.webp" alt="" width="784" height="1288" loading="lazy" decoding="async"></div>';
    if (has([4])) h += '<div class="fl-earn"><span>' + ic('coin', 16) + '<b class="num">' + T('+{n} poin', { n: 5 }) + '</b></span><span>' + ic('rubber-stamp', 16) + '<b class="num">' + T('+{n} stempel', { n: 1 }) + '</b></span></div>';
    return h + '</div>';
  }

  function html() {
    return '<section id="cara-kerja" class="lp-wrap fl" aria-labelledby="fl-t">' +
      '<div class="lp-head"><h2 id="fl-t" class="lp-h2">' + T('Pelanggan cukup memindai QR') + '</h2>' +
      '<p class="lp-sub">' + T('Dari pindai QR sampai penjualan tercatat. Pelanggan tidak unduh aplikasi, dan kasir tetap memakai sistem yang sama.') + '</p></div>' +
      '<div class="fl-track" id="flTrack" style="--n:' + N + '"><div class="fl-sticky" id="flSticky"><div class="fl-panel">' +
      '<div class="fl-side"><ol class="fl-steps" id="flSteps" style="--fl-p:0">' + STEPS.map(function (s, i) {
        return '<li class="fl-step' + (i === 0 ? ' is-on' : '') + '"' + (i === 0 ? ' aria-current="step"' : '') + '><div class="fl-mini">' + scene(i, true) + '</div>' +
          '<h3 class="fl-step-h"><button type="button" class="fl-jump" data-fl="' + i + '"><span class="fl-num num">' + (i + 1) + '</span><span class="fl-t">' + T(s.t) + '</span></button></h3>' +
          '<div class="fl-step-b"><div><p>' + T(s.x) + '</p></div></div></li>';
      }).join('') + '</ol>' +
      '<a class="fl-try" href="anggota.html#/scan"><span class="lp-go">' + T('Coba alurnya di demo') + ic('arrow-right', 16) + '</span></a></div>' +
      '<div class="fl-stage">' + scene(0, false) + '<p class="fl-note">' + ic('info-circle', 13) + T('Layar diambil dari demo ini. Merek dan angka contoh.') + '</p></div>' +
      '</div></div></div>' +
      '<p class="fl-note is-stacked">' + ic('info-circle', 13) + T('Layar diambil dari demo ini. Merek dan angka contoh.') + '</p></section>';
  }

  function init() {
    var track = document.getElementById('flTrack'), sticky = document.getElementById('flSticky'), list = document.getElementById('flSteps'), sc = document.getElementById('flScene');
    if (!track || !sticky || !list || !sc) return function () {};
    var mq = matchMedia('(max-width: 860px), (prefers-reduced-motion: reduce)');
    var items = [].slice.call(list.children), cur = -1, raf = 0;
    function stacked() { return mq.matches; }
    function geo() {
      var top = parseFloat(getComputedStyle(sticky).top) || 0, r = track.getBoundingClientRect(), total = track.offsetHeight - sticky.offsetHeight;
      return { top: top, r: r, total: Math.max(1, total) };
    }
    function set(i) {
      if (i === cur) return; cur = i;
      sc.setAttribute('data-step', i); sc.setAttribute('data-scr', STEPS[i].scr);
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); li.classList.toggle('is-done', k < i); if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    }
    function update() {
      raf = 0; if (stacked()) return;
      var g = geo(), p = Math.min(1, Math.max(0, (g.top - g.r.top) / g.total));
      list.style.setProperty('--fl-p', p.toFixed(4));
      set(Math.min(N - 1, Math.floor(p * N)));
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    function onClick(e) {
      var b = e.target.closest('[data-fl]'); if (!b || stacked()) return;
      var g = geo(), i = +b.getAttribute('data-fl');
      scrollTo({ top: scrollY + g.r.top - g.top + (i + 0.5) / N * g.total, behavior: 'smooth' });
    }
    function mode() {
      var st = stacked();
      list.querySelectorAll('.fl-jump').forEach(function (b) { if (st) b.setAttribute('tabindex', '-1'); else b.removeAttribute('tabindex'); });
      if (st) { items.forEach(function (li) { li.classList.remove('is-on', 'is-done'); li.removeAttribute('aria-current'); }); cur = -1; } else update();
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    list.addEventListener('click', onClick);
    if (mq.addEventListener) mq.addEventListener('change', mode); else mq.addListener(mode);
    mode();
    return function destroy() {
      removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); list.removeEventListener('click', onClick);
      if (mq.removeEventListener) mq.removeEventListener('change', mode); else mq.removeListener(mode);
      if (raf) cancelAnimationFrame(raf);
    };
  }

  window.PLFlow = { html: html, init: init };
})();
