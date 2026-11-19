/* Providea Loyalty demo · landing page, in the Providea Influence family (crimson reeded-glass panel,
   nested white panels, Inter, tabular numbers) with its own composition:
   - hero: one sale at the till travels to the member's phone and the owner's dashboard (live loop);
   - four ways customers come back (stamps, points, tiers, vouchers), each with a small live UI;
   - showcase of the real demo screens, an Indonesia bento, the sample case as a nested panel with a
     timeline and big figures, three people, FAQ, and a closing demo stamp card. */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc;
  P.setView('hub');
  var app = document.getElementById('app');
  var scTab = 'member', scTimer = null, scTouched = false, openQ = 0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');

  function rd(i) { return ' data-reveal style="--rd:' + i * 70 + 'ms"'; }
  function go(label) { return '<span class="lp-go">' + label + ic('arrow-right', 16) + '</span>'; }
  function $(id) { return document.getElementById(id); }
  function ini(n) { return n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); }
  function tag(id) { return P.tierTag(P.tierById(id), true); }

  /* hero relay: three members from the demo data, earn = floor(Rp / 10.000) × tier multiplier */
  var RELAY = [
    { n: 'Rina Maharani', t: 'gold', p: 186, add: 5, s: 7, cups: 1, amt: 47000, item: '1 cup, 2 topping' },
    { n: 'Kevin Tanoto', t: 'gold', p: 205, add: 6, s: 9, cups: 1, amt: 55000, item: '1 cup besar' },
    { n: 'Putri Anggraini', t: 'silver', p: 9, add: 8, s: 2, cups: 2, amt: 84000, item: '2 cup sedang' }
  ];
  var TX0 = 38, BARS = [31, 35, 29, 40, 44, 36], BAR_MAX = 52;
  var MX = [
    { k: 'stempel', t: 'Kartu stempel', x: 'Setiap cup menambah satu stempel. Stempel ke-10 menjadi cup kecil gratis.', cta: 'Coba di kasir', href: 'kasir.html' },
    { k: 'poin', t: 'Poin', x: '1 poin tiap belanja Rp10.000. Saat bayar, 1 poin bernilai Rp500.', cta: 'Lihat kartu member', href: 'anggota.html#/home' },
    { k: 'tier', t: 'Tier', x: 'Silver, Gold, dan Platinum dihitung dari belanja 12 bulan. Tier lebih tinggi mendapat poin lebih banyak.', cta: 'Atur tier', href: 'dashboard.html#/tier' },
    { k: 'voucher', t: 'Voucher', x: 'Voucher sekali pakai dengan QR. Kode yang sudah dipakai ditolak di kasir.', cta: 'Lihat voucher', href: 'anggota.html#/voucher' }
  ];
  var STORY = [
    ['Minggu 1', 'QR di meja kasir', 'Kasir mengajak daftar saat pelanggan bayar. Kode masuk lewat WhatsApp.'],
    ['Bulan 1', 'Kartu stempel 10 cup', 'Member baru mendapat voucher sambutan: gratis topping.'],
    ['Bulan 2', 'Tier Gold dan Platinum', 'Pelanggan tetap mendapat poin 1,25× dan 1,5×.'],
    ['Bulan 3 dan 4', 'Pengingat WhatsApp', 'Member yang 30 hari tidak datang menerima satu pesan dengan voucher.']
  ];
  var CASE = [['2.140', 2140, 'member', 'dari 0, dalam 4 bulan'], ['38%', 38, 'transaksi', 'memakai kartu member'], ['41%', 41, 'member', 'datang 2 kali atau lebih dalam 30 hari'], ['312', 312, 'voucher', 'dipakai dalam 30 hari']];
  var SC = {
    member: { label: 'HP member', icon: 'device-mobile', text: 'Kartu, poin, stempel, voucher, dan Wallet. Terbuka di browser, tanpa unduh aplikasi.', href: 'anggota.html#/home' },
    kasir: { label: 'Kasir', icon: 'device-tablet', text: 'Check-in, tambah penjualan, pindai voucher, dan bayar pakai poin di tablet kasir.', href: 'kasir.html' },
    dash: { label: 'Dashboard', icon: 'layout-dashboard', text: 'Laporan, member, tier, voucher, segmen, dan kampanye untuk pemilik merek.', href: 'dashboard.html' }
  };
  var PEOPLE = [
    { acc: '#1535BD', icon: 'device-mobile', title: 'Untuk pelanggan', text: 'Daftar dalam 30 detik, tanpa unduh aplikasi.', points: ['Kartu dengan QR yang berganti tiap 30 detik', 'Poin, stempel, dan tier dalam satu halaman', 'Kartu di Apple Wallet dan Samsung Wallet'], cta: 'Buka HP member', href: 'anggota.html#/home' },
    { acc: '#c4232c', icon: 'device-tablet', title: 'Untuk kasir', text: 'Cepat di jam ramai. Kasir tidak perlu mengetik nomor HP.', points: ['Pop-up saat member check-in dari QR meja', 'Voucher dipindai; kode yang sudah dipakai ditolak', 'Bayar pakai poin, dan batalkan penjualan dengan alasan'], cta: 'Buka layar kasir', href: 'kasir.html' },
    { acc: '#1f1e1c', icon: 'layout-dashboard', title: 'Untuk pemilik merek', text: 'Lihat apakah pelanggan datang lagi, lalu atur program dari satu tempat.', points: ['Laporan 6 angka: member baru, join rate, member aktif, repeat rate, poin beredar, voucher dipakai', 'Kampanye WhatsApp, email, dan Wallet dengan perkiraan biaya', 'Peran staf per outlet dan log audit'], cta: 'Buka dashboard', href: 'dashboard.html' }
  ];
  var FAQ = [
    ['Apakah pelanggan harus unduh aplikasi?', 'Tidak. Halaman member terbuka di browser HP, dan kartu bisa disimpan di Apple Wallet atau Samsung Wallet. Google Wallet belum resmi di Indonesia, jadi HP lain memasang halaman member ke layar utama.'],
    ['Apakah bisa dipakai dengan POS yang sudah ada?', 'Bisa. iSeller lebih dulu, lalu Moka, majoo, dan ESB. Outlet tanpa POS yang terhubung memakai aplikasi kasir di browser tablet.'],
    ['Bagaimana bila internet outlet putus?', 'Aplikasi kasir tetap mencatat penjualan. Data dikirim saat internet kembali.'],
    ['Berapa biaya kirim promo?', 'Promo WhatsApp memakai tarif WhatsApp untuk Indonesia, sekitar Rp586 per pesan sebelum PPN 11%. Email dan notifikasi Wallet termasuk paket. Biaya selalu tampil sebelum kampanye dikirim.'],
    ['Apakah poin bisa dicairkan jadi uang?', 'Tidak. Poin hanya dipakai sebagai potongan atau hadiah di merek itu sendiri, misalnya 1 poin = Rp500 saat bayar.'],
    ['Apakah data pelanggan aman?', 'Data disimpan di Jakarta. Persetujuan syarat terpisah dari izin promo, member bisa unduh atau hapus datanya, dan setiap ekspor tercatat di log audit.']
  ];
  var STAMPS = [['member', 'device-mobile', 'HP member', 'Daftar dan lihat kartu', 'anggota.html#/scan'], ['kasir', 'device-tablet', 'Kasir', 'Tambah penjualan', 'kasir.html'],
    ['pos', 'cash-register', 'Alur di POS', 'Bayar dengan member', 'kasir.html#/pos'], ['dash', 'layout-dashboard', 'Dashboard', 'Lihat hasilnya', 'dashboard.html']];

  /* ── hero ── */
  function stampsHtml(n, fresh) {
    var h = '';
    for (var k = 1; k <= 10; k++) h += '<i class="' + (k <= n ? 'is-on' : '') + (fresh && k > n - fresh && k <= n ? ' is-new' : '') + '">' + (k <= n ? P.cup(13) : k === 10 ? ic('gift', 11) : '') + '</i>';
    return h;
  }
  function waText(r) { return T('+{p} poin dari belanja {r}. Saldo {b} poin.', { p: r.add, r: P.rp(r.amt), b: P.num(r.p + r.add) }); }
  function days() {
    var loc = P.lang() === 'en' ? 'en-GB' : 'id-ID', out = '';
    for (var i = 6; i >= 0; i--) out += '<span>' + new Date(Date.now() - i * 864e5).toLocaleDateString(loc, { weekday: 'short' }).replace('.', '') + '</span>';
    return out;
  }
  function noteFor(s) { return s >= 10 ? T('Kartu penuh. Cup kecil gratis masuk ke voucher.') : T('{n} cup lagi, dapat cup kecil gratis', { n: 10 - s }); }
  function barsHtml(tx) { return BARS.map(function (v) { return '<i style="--h:' + Math.round(v / BAR_MAX * 100) + '%"></i>'; }).join('') + '<i class="is-today" id="rlBar" style="--h:' + Math.round(tx / BAR_MAX * 100) + '%"></i>'; }
  function hero() {
    var r = RELAY[0];
    return '<section class="lp-wrap lh" aria-labelledby="rl-t"><div class="lh-panel">' +
      '<div class="lp-tex lh-tex" aria-hidden="true"><img src="img/hero.webp" alt="" decoding="async" fetchpriority="high"></div>' +
      '<div class="lh-top"><h2 class="lh-h1 is-h2" id="rl-t">' + T('Satu penjualan,') + ' <span>' + T('tiga layar.') + '</span></h2>' +
      '<div class="lh-side"><p class="lh-sub">' + T('Kasir menambah penjualan. Poin dan stempel langsung masuk ke HP member, dan angkanya muncul di dashboard pemilik.') + '</p>' +
      '<div class="lh-cta"><a class="lh-btn is-glass" href="kasir.html">' + ic('device-tablet', 16) + T('Coba di layar kasir') + '</a></div></div></div>' +
      '<div class="rl" id="relay" role="group" aria-label="' + T('Contoh: satu penjualan di tiga layar') + '">' +
      '<article class="rl-card" data-k="0"><header class="rl-h">' + ic('device-tablet', 16) + '<b>' + T('Kasir') + '</b><span>' + T('Outlet Cempaka') + '</span><i class="rl-n">1</i></header><div class="rl-b">' +
        '<div class="rl-who"><span class="avatar avatar-brand rl-av" id="rlAv">' + ini(r.n) + '</span><span class="rl-who-t"><b id="rlName">' + r.n + '</b><span id="rlTier">' + tag(r.t) + '</span></span></div>' +
        '<div class="rl-sale"><small>' + T('Penjualan') + '</small><b class="num" id="rlAmt">' + P.rp(r.amt) + '</b><span id="rlItem">' + T(r.item) + '</span></div>' +
        '<span class="rl-btn" id="rlBtn">' + ic('plus', 16) + T('Tambah penjualan') + '</span></div></article>' +
      '<span class="rl-link" data-k="1" aria-hidden="true"><i></i></span>' +
      '<article class="rl-card" data-k="2"><header class="rl-h">' + ic('device-mobile', 16) + '<b>' + T('HP member') + '</b><span id="rlWho">' + r.n.split(' ')[0] + '</span><i class="rl-n">2</i></header><div class="rl-b">' +
        '<div class="rl-mc"><div class="rl-mc-top">' + P.wordmark(26) + '<span id="rlTier2">' + tag(r.t) + '</span></div><small>' + T('Poin') + '</small>' +
        '<div class="rl-mc-pts"><b class="num" id="rlPts">' + P.num(r.p) + '</b><span class="rl-plus" id="rlPlus">+' + r.add + ' ' + T('poin') + '</span></div></div>' +
        '<div class="rl-st" id="rlSt">' + stampsHtml(r.s) + '</div><small class="rl-note" id="rlNote">' + noteFor(r.s) + '</small>' +
        '<div class="rl-wa" id="rlWa">' + ic('brand-whatsapp', 15) + '<span id="rlWaT">' + waText(r) + '</span></div></div></article>' +
      '<span class="rl-link" data-k="3" aria-hidden="true"><i></i></span>' +
      '<article class="rl-card" data-k="4"><header class="rl-h">' + ic('layout-dashboard', 16) + '<b>' + T('Dashboard') + '</b><span>' + T('Hari ini') + '</span><i class="rl-n">3</i></header><div class="rl-b">' +
        '<div class="stat"><span class="stat-label">' + T('Transaksi member') + '</span><span class="stat-row"><b class="rl-big num" id="rlTx">' + TX0 + '</b><span class="unit-pill">' + T('hari ini') + '</span></span></div>' +
        '<div class="rl-chart" aria-hidden="true"><div class="rl-bars">' + barsHtml(TX0) + '</div><div class="rl-days">' + days() + '</div></div>' +
        '<div class="rl-last"><span>' + T('Terakhir') + '</span><b id="rlLast">' + T('Belum ada') + '</b></div></div></article>' +
      '</div><p class="lh-cap">' + ic('info-circle', 14) + T('Contoh dengan data demo. Di demo, penjualan dari layar kasir masuk ke HP member dan dashboard dengan cara yang sama.') + '</p></div></section>';
  }

  /* hero: the sample brand's cafe (illustration, Figma AI) with the real demo screens on the tablet and phone */
  function cafeHero() {
    var L = P.lang();
    return '<section class="lp-wrap kh" aria-labelledby="lp-title"><div class="kh-panel">' +
      '<div class="kh-stage"><picture><source media="(max-width: 860px)" srcset="img/kamtono/cafe-counter-' + L + '.webp"><img class="kh-photo" src="img/kamtono/cafe-wide-' + L + '.webp" width="1536" height="864" alt="' + T('Ilustrasi kafe Kamtono: tablet kasir dan HP member di meja kasir, mural teman berbagi froyo di dinding') + '" fetchpriority="high" decoding="async"></picture>' +
      '<span class="kh-pin is-tab"><b>' + T('Tablet kasir') + '</b></span><span class="kh-pin is-hp"><b>' + T('HP member') + '</b></span></div>' +
      '<div class="kh-copy"><p class="kh-brand">' + P.sjLogo(26) + '<span>' + T('Contoh: Kamtono, Outlet Cempaka') + '</span></p>' +
      '<h1 class="kh-h1" id="lp-title">' + T('Pelanggan datang lagi.') + ' <span>' + T('Tanpa unduh aplikasi.') + '</span></h1>' +
      '<p class="kh-sub">' + T('Kartu member, poin, dan voucher untuk merek dengan 1 sampai 20 outlet. Pelanggan daftar di kasir dengan nomor HP, kartunya ada di WhatsApp dan dompet HP.') + '</p>' +
      '<div class="lh-cta"><a class="lh-btn" href="anggota.html#/scan">' + T('Coba demo') + ic('arrow-right', 16) + '</a><a class="lh-btn is-glass" href="kasir.html">' + ic('device-tablet', 16) + T('Layar kasir') + '</a></div></div>' +
      '<p class="kh-note">' + ic('info-circle', 13) + T('Ilustrasi. Layar di tablet dan HP diambil dari demo ini.') + '</p></div></section>';
  }
  /* relay loop: kasir → link → HP member → link → dashboard, then the next member */
  var rl = { i: 0, tx: TX0, timers: [], io: null, visible: false };
  function at(ms, fn) { rl.timers.push(setTimeout(fn, ms)); }
  function stop() { rl.timers.forEach(clearTimeout); rl.timers = []; }
  function tick(el, a, b, ms) {
    if (!el) return; var t0 = performance.now();
    (function f(now) { var k = Math.min(1, (now - t0) / ms); el.textContent = P.num(Math.round(a + (b - a) * k)); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function setActive(k) { document.querySelectorAll('#relay [data-k]').forEach(function (el) { var d = +el.dataset.k; el.classList.toggle('is-on', d === k); el.classList.toggle('is-done', d < k); }); }
  function load(r) {
    if (!$('rlAv')) return;
    $('rlAv').textContent = ini(r.n); $('rlName').textContent = r.n; $('rlTier').innerHTML = tag(r.t); $('rlAmt').textContent = P.rp(r.amt); $('rlItem').textContent = T(r.item);
    $('rlWho').textContent = r.n.split(' ')[0]; $('rlTier2').innerHTML = tag(r.t); $('rlPts').textContent = P.num(r.p);
    $('rlPlus').textContent = '+' + r.add + ' ' + T('poin'); $('rlPlus').classList.remove('is-pop'); $('rlSt').innerHTML = stampsHtml(r.s); $('rlNote').textContent = noteFor(r.s);
    $('rlBtn').classList.remove('is-press'); $('rlWaT').textContent = waText(r); $('rlWa').classList.remove('is-pop');
  }
  function earn(r, animate) {
    var s = r.s + r.cups;
    if (animate) tick($('rlPts'), r.p, r.p + r.add, 600); else $('rlPts').textContent = P.num(r.p + r.add);
    $('rlPlus').classList.add('is-pop'); $('rlWa').classList.add('is-pop'); $('rlSt').innerHTML = stampsHtml(Math.min(10, s), animate ? r.cups : 0); $('rlNote').textContent = noteFor(s);
  }
  function report(r, animate) {
    rl.tx++; if (animate) tick($('rlTx'), rl.tx - 1, rl.tx, 400); else $('rlTx').textContent = P.num(rl.tx);
    $('rlBar').style.setProperty('--h', Math.min(100, Math.round(rl.tx / BAR_MAX * 100)) + '%');
    $('rlLast').textContent = r.n.split(' ')[0] + ' · ' + P.rp(r.amt);
  }
  function cycle() {
    stop(); var r = RELAY[rl.i % RELAY.length];
    if (rl.tx >= 48) { rl.tx = TX0; if ($('rlTx')) { $('rlTx').textContent = TX0; $('rlBar').style.setProperty('--h', Math.round(TX0 / BAR_MAX * 100) + '%'); } }
    load(r); setActive(0);
    at(1200, function () { $('rlBtn').classList.add('is-press'); });
    at(1550, function () { $('rlBtn').classList.remove('is-press'); setActive(1); });
    at(2150, function () { setActive(2); earn(r, true); });
    at(3700, function () { setActive(3); });
    at(4300, function () { setActive(4); report(r, true); });
    at(7000, function () { rl.i++; cycle(); });
  }
  function startRelay() {
    stop(); if (rl.io) rl.io.disconnect(); rl.i = 0; rl.tx = TX0;
    var el = $('relay'); if (!el) return;
    if (reduce.matches || typeof IntersectionObserver === 'undefined') { var r = RELAY[0]; load(r); earn(r, false); report(r, false); setActive(-1); return; }
    rl.io = new IntersectionObserver(function (es) { rl.visible = es[0].isIntersecting; if (rl.visible && !document.hidden) cycle(); else stop(); }, { threshold: 0.25 });
    rl.io.observe(el);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (rl.visible && !reduce.matches) cycle(); });

  /* ── four ways back ── */
  function well(k) {
    if (k === 'stempel') return '<div class="mx-st">' + stampsHtml(7).replace(/<i class="is-on"><svg class="cup" width="13" height="13"/g, '<i class="is-on"><svg class="cup" width="26" height="26"') + '</div><div class="mx-cap"><span>' + T('Kartu Rina') + '</span><span class="tag tag-brand num">7 / 10</span></div>';
    if (k === 'poin') return '<span class="stat-row"><b class="mx-big num">186</b><span class="unit-pill">' + T('poin') + '</span></span><span class="mx-eq">' + T('= {r} bila dipakai bayar', { r: P.rp(93000) }) + '</span>' +
      '<span class="mx-chips"><span class="tag tag-outline num">' + T('1 poin / Rp10.000') + '</span><span class="tag tag-outline num">' + T('1 poin = Rp500') + '</span></span>';
    if (k === 'tier') return '<div class="mx-tiers">' + [['silver', 0, '1×'], ['gold', 1500000, '1,25×'], ['platinum', 4000000, '1,5×']].map(function (t) {
      return '<div class="mx-tr' + (t[0] === 'gold' ? ' is-me' : '') + '">' + tag(t[0]) + '<span class="num">' + (t[1] ? P.rp(t[1]) : T('Mulai')) + '</span><b class="num">' + t[2] + '</b></div>'; }).join('') + '</div>' +
      '<div class="mx-bar" aria-hidden="true"><i style="width:43.6%"></i></div><small class="mx-small num">' + T('Rina: {r} lagi ke Platinum', { r: P.rp(2258000) }) + '</small>';
    return '<div class="mx-vc is-used"><span><b>' + T('Gratis topping') + '</b><small class="num">KMT-WL8-H2D</small></span><span class="tag tag-sm">' + T('Sudah dipakai') + '</span></div>' +
      '<div class="mx-vc"><span><b>' + T('Gratis topping') + '</b><small>' + T('Hadiah naik Gold') + '</small><small class="num">KMT-GT7-Q4M</small></span><span class="mx-qr">' + ic('qrcode', 34) + '</span></div>';
  }
  function ways() {
    return '<section class="lp-wrap" aria-labelledby="mx-t"><div class="lp-head lp-head-row"><div><h2 id="mx-t" class="lp-h2">' + T('Empat alasan untuk kembali') + '</h2><p class="lp-sub">' + T('Pakai satu atau semuanya. Aturan bisa diubah di dashboard kapan saja.') + '</p></div>' +
      '<a href="dashboard.html#/tier">' + go(T('Atur program')) + '</a></div><div class="mx-grid">' +
      MX.map(function (m, i) { return '<a class="mx" href="' + m.href + '"' + rd(i) + '><div class="mx-well is-' + m.k + '">' + well(m.k) + '</div><div class="mx-txt"><h3>' + T(m.t) + '</h3><p>' + T(m.x) + '</p></div>' + go(T(m.cta)) + '</a>'; }).join('') + '</div></section>';
  }

  /* ── sample case: nested panel, timeline + figures ── */
  /* sample cases: three fictional brands, one problem each, own colours and photo (Kamtono, Mendaya Ramen, Bobs) */
  var CASES = [
    { k: 'kamtono', name: 'Kamtono', ind: 'Froyo · outlet pertama', meta: 'Outlet Cempaka · 1 kasir · mulai dari 0 member',
      photo: 'img/kamtono/cafe-counter-', photoM: 'img/kamtono/cafe-wide-', alt: 'Ilustrasi meja kasir Kamtono: tablet kasir dan HP member',
      prob: 'Outlet baru dengan satu kasir. Belum ada data pelanggan, dan pelanggan belum punya alasan untuk kembali.',
      sol: 'Kartu member di HP tanpa unduh aplikasi, kartu stempel 10 cup, tier yang naik otomatis, dan pengingat WhatsApp.',
      story: STORY, figs: CASE },
    { k: 'mendaya', name: 'Mendaya Ramen', ind: 'Ramen · 6 outlet', meta: '6 outlet di Jakarta dan Tangerang · makan di tempat',
      photo: 'img/brands/mendaya/shop-', alt: 'Ilustrasi meja kasir Mendaya Ramen: tablet kasir dengan pop-up check-in dan HP member',
      prob: 'Pelanggan setia datang 1 sampai 2 kali sebulan, tetapi datanya tersebar di 6 outlet. Jam 14.00 sampai 17.00 selalu sepi.',
      sol: 'Satu kartu member untuk semua outlet. Pelanggan check-in dari QR di meja, dan voucher jam sepi dikirim lewat WhatsApp ke member yang lama tidak datang.',
      story: [['Minggu 1', 'QR di setiap meja', 'Pelanggan check-in saat duduk. Kasir melihat nama dan tier sebelum pesanan dibayar.'],
        ['Minggu 3', 'Satu kartu untuk 6 outlet', 'Poin dan tier sama di semua outlet. Dashboard membandingkan outlet satu per satu.'],
        ['Bulan 2', 'Mangkuk ke-8 gratis', 'Kartu stempel per mangkuk, dan telur ajitama gratis di bulan ulang tahun.'],
        ['Bulan 3', 'Voucher jam sepi', 'Member yang 45 hari tidak datang menerima voucher untuk Senin sampai Kamis, 14.00 sampai 17.00.']],
      figs: [['9.800', 9800, 'member', 'dalam 6 bulan di 6 outlet'], ['+24%', 24, 'transaksi', 'di jam 14.00 sampai 17.00'], ['31%', 31, 'member', 'makan di 2 outlet atau lebih'], ['Rp118.000', 118000, 'per kunjungan', 'rata-rata belanja member']] },
    { k: 'bobs', name: 'Bobs', ind: 'Boba milk tea · 18 outlet', meta: '18 outlet · sebelumnya kartu stempel kertas',
      photo: 'img/brands/bobs/shop-', alt: 'Ilustrasi meja kasir Bobs: POS dengan member dan web-app member di HP, kartu stempel kertas lama di meja',
      prob: 'Kartu stempel kertas sering hilang dan mudah dipalsukan. Bobs tidak tahu siapa pelanggannya, dan tidak bisa menghubungi mereka.',
      sol: 'Providea Loyalty membuatkan web-app member dengan nama dan warna Bobs. Data penjualan masuk lewat webhook dari POS yang sudah mereka pakai. Kami sudah bekerja sama dengan penyedia POS tersebut untuk koneksi ini, jadi kasir tetap memakai POS yang sama.',
      story: [['Minggu 1', 'Web-app member Bobs', 'Halaman member dengan logo dan warna Bobs, di domain mereka sendiri. Tanpa unduh aplikasi.'],
        ['Minggu 2', 'Webhook dari POS', 'Setiap transaksi di POS langsung masuk ke Providea Loyalty. Poin dan stempel dihitung otomatis.'],
        ['Bulan 1', 'Tukar kartu kertas', 'Kasir memindai kartu kertas lama satu kali. Stempelnya pindah ke web-app.'],
        ['Bulan 2', 'Stempel tidak bisa dipalsukan', 'Setiap stempel berasal dari transaksi POS, jadi stempel tulisan tangan tidak berlaku lagi.']],
      figs: [['26.400', 26400, 'member', 'dalam 4 bulan di 18 outlet'], ['71%', 71, 'kartu kertas', 'sudah pindah ke web-app'], ['Rp0', 0, 'cetak kartu', 'tidak ada kartu kertas baru'], ['2,3×', null, 'per bulan', 'rata-rata kunjungan per member']] }
  ];
  var csTab = 'kamtono';
  function brandMark(k, s) { return k === 'kamtono' ? P.sjLogo(s) : '<span class="sj-logo is-flat" style="--s:' + s + 'px"><img src="img/brands/' + k + '/icon.webp" alt="" decoding="async"></span>'; }
  function caseLogo(k) {
    var src = { kamtono: 'img/kamtono/wordmark.svg', mendaya: 'img/brands/mendaya/word-cream.webp', bobs: 'img/brands/bobs/logo.webp' }[k];
    return '<img class="cs-logo is-' + k + '" src="' + src + '" alt="" decoding="async">';
  }
  function casePanel(c) {
    var L = P.lang();
    return '<article class="cs is-' + c.k + '" id="csPanel" role="tabpanel" aria-label="' + esc(c.name) + '"><header class="cs-h">' + caseLogo(c.k) + '<span class="cs-id"><b class="sr-only">' + esc(c.name) + '</b><small>' + T(c.meta) + '</small></span><span class="tag tag-warning">' + ic('info-circle', 13) + T('Angka contoh') + '</span></header>' +
      '<figure class="cs-photo"><picture>' + (c.photoM ? '<source media="(max-width: 860px)" srcset="' + c.photoM + L + '.webp">' : '') + '<img src="' + c.photo + L + '.webp" width="2400" height="1350" alt="' + T(c.alt) + '" loading="lazy" decoding="async"></picture><figcaption>' + ic('info-circle', 13) + T('Ilustrasi. Layar diambil dari demo ini.') + '</figcaption></figure>' +
      '<div class="cs-ps"><div><small>' + T('Masalah') + '</small><p>' + T(c.prob) + '</p></div><div><small>' + T('Solusi Providea Loyalty') + '</small><p>' + T(c.sol) + '</p></div></div>' +
      '<div class="cs-in"><ol class="cs-tl">' + c.story.map(function (s) { return '<li><span class="cs-when">' + T(s[0]) + '</span><span class="cs-rail" aria-hidden="true"></span><span class="cs-step"><b>' + T(s[1]) + '</b><span>' + T(s[2]) + '</span></span></li>'; }).join('') + '</ol>' +
      '<div class="cs-figs">' + c.figs.map(function (f) { return '<div class="cs-fig"><span class="stat-row"><b class="cs-big num"' + (f[1] != null ? ' data-count="' + f[1] + '" data-text="' + f[0] + '"' : '') + '>' + f[0] + '</b><span class="unit-pill">' + T(f[2]) + '</span></span><small>' + T(f[3]) + '</small></div>'; }).join('') + '</div></div></article>';
  }
  function caseStudy() {
    var c = CASES.filter(function (x) { return x.k === csTab; })[0];
    return '<section class="lp-wrap" aria-labelledby="case-t"><div class="lp-head lp-head-row"><div><h2 id="case-t" class="lp-h2">' + T('Kisah contoh: tiga merek, tiga masalah') + '</h2><p class="lp-sub">' + T('Merek fiktif dari tiga industri. Providea Loyalty dipasang sesuai masalah masing-masing.') + '</p></div></div>' +
      '<div class="cs-tabs" role="tablist" aria-label="' + T('Pilih kisah contoh') + '">' + CASES.map(function (x) { var on = x.k === csTab; return '<button type="button" role="tab" class="cs-tab is-' + x.k + (on ? ' is-active' : '') + '" aria-selected="' + on + '" data-act="cs" data-v="' + x.k + '">' + brandMark(x.k, 32) + '<span><b>' + esc(x.name) + '</b><small>' + T(x.ind) + '</small></span></button>'; }).join('') + '</div>' +
      '<div id="csWrap" data-reveal>' + casePanel(c) + '</div></section>';
  }
  P.ACT.cs = function (el) {
    csTab = el.dataset.v;
    document.querySelectorAll('.cs-tab').forEach(function (b) { var on = b.dataset.v === csTab; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    var w = $('csWrap'); if (w) { w.innerHTML = casePanel(CASES.filter(function (x) { return x.k === csTab; })[0]); countUp(); }
  };

  function shot() {
    var src = 'img/sc-' + scTab + '-' + P.lang() + '.webp';
    if (scTab === 'dash') return '<div class="lsc-frame"><div class="lsc-chrome"><i></i>loyalty.providea.id/kamtono</div><img class="lsc-img" src="' + src + '" alt="' + T('Dashboard pemilik Providea Loyalty, contoh') + '" loading="lazy" decoding="async"></div>';
    return '<div class="lsc-device is-' + scTab + '"><img class="lsc-img" src="' + src + '" alt="' + (scTab === 'member' ? T('Halaman member di HP, contoh') : T('Aplikasi kasir di tablet, contoh')) + '" loading="lazy" decoding="async"></div>';
  }
  function stampCard() {
    var v = P.visited(), done = STAMPS.filter(function (s) { return v[s[0]]; }).length, next = STAMPS.filter(function (s) { return !v[s[0]]; })[0];
    return '<section class="lp-close" aria-labelledby="cl-t"><div class="lp-tex"><img src="img/arc.webp" alt="" loading="lazy"></div><div data-reveal>' +
      '<h2 id="cl-t" class="lp-close-t">' + (done === 4 ? T('Kartu stempel penuh. Semua tampilan sudah dicoba.') : T('Kumpulkan 4 stempel demo')) + '</h2>' +
      '<p class="lp-close-x">' + T('Buka setiap tampilan. Stempel terisi sendiri, seperti kartu stempel di kasir.') + '</p>' +
      '<a class="lp-close-btn" href="' + (next ? next[4] : 'anggota.html#/scan') + '">' + (next ? T('Lanjut: {v}', { v: T(next[2]) }) : T('Coba lagi dari HP member')) + ic('arrow-right', 18) + '</a></div>' +
      '<div><div class="lp-stamps">' + STAMPS.map(function (s, i) { var on = !!v[s[0]]; return '<a class="lp-stamp' + (on ? ' is-on' : '') + '" href="' + s[4] + '"' + rd(i) + '><span class="lp-stamp-dot">' + ic(on ? 'check' : s[1], 22) + '</span><span><b>' + T(s[2]) + '</b><small>' + (on ? T('Sudah dicoba') : T(s[3])) + '</small></span></a>'; }).join('') + '</div>' +
      '<p class="lp-count num">' + T('{a} dari 4 stempel', { a: done }) + '</p></div></section>';
  }

  function render() {
    app.innerHTML = '<div class="landing page" style="padding:0;max-width:none"><div class="lp" id="lp">' +
      cafeHero() + hero() + ways() +
      /* showcase */
      '<section class="lp-wrap" aria-labelledby="sc-t"><div class="lp-head lp-head-row"><div><h2 id="sc-t" class="lp-h2">' + T('Buka tiga layarnya') + '</h2><p class="lp-sub">' + T('Semua layar di demo bisa diklik dan memakai data yang sama di browser ini.') + '</p></div></div>' +
      '<div class="lp-show' + (scTouched ? ' is-static' : '') + '" id="lpShow"><div class="lp-tabs" role="tablist">' + Object.keys(SC).map(function (k) { return '<button type="button" role="tab" class="lp-tab' + (scTab === k ? ' is-active' : '') + '" aria-selected="' + (scTab === k) + '" data-act="sc" data-v="' + k + '">' + ic(SC[k].icon, 22) + '<b>' + T(SC[k].label) + '</b><span>' + T(SC[k].text) + '</span><i class="lp-tab-bar"></i></button>'; }).join('') +
      '<a id="scTry" href="' + SC[scTab].href + '">' + go(T('Coba {v}', { v: T(SC[scTab].label) })) + '</a></div><div class="lp-screen" data-reveal><div class="lsc-shot" id="scShot">' + shot() + '</div></div></div></section>' +
      /* bento */
      '<section class="lp-wrap" aria-labelledby="id-t"><div class="lp-head lp-head-row"><div><h2 id="id-t" class="lp-h2">' + T('Dibuat untuk outlet di <em>Indonesia</em>') + '</h2><p class="lp-sub">' + T('Bahasa Indonesia lebih dulu, nomor HP sebagai ID, dan jalan di HP Android murah.') + '</p></div></div><div class="lp-bento">' +
      '<a class="lp-tile is-big" href="anggota.html#/join"' + rd(0) + '><div class="lp-tex"><img src="img/hero.webp" alt="" loading="lazy"></div><div class="stack" style="--gap:12px">' + ic('brand-whatsapp', 34, 'big') + '<span class="lp-tile-t">' + T('WhatsApp jadi kartu member') + '</span><span class="lp-tile-x">' + T('Nomor HP adalah ID member. Kode daftar, poin baru, dan promo datang lewat WhatsApp.') + '</span></div>' +
      '<div class="lp-wa"><span class="lp-wa-h">' + ic('brand-whatsapp', 15) + 'Kamtono</span><span>' + T('Halo Rina, terima kasih sudah mampir. +5 poin masuk. Saldo 191 poin, 2 cup lagi dapat cup kecil gratis.') + '</span><span class="lp-wa-t">15.12</span></div>' + go(T('Lihat di demo')) + '</a>' +
      '<a class="lp-tile is-wide" href="kasir.html#/pos"' + rd(1) + '>' + ic('cash-register', 30, 'big') + '<span class="lp-tile-t">' + T('Jalan di kasir yang sudah ada') + '</span><span class="lp-tile-x">' + T('Aplikasi kasir di browser, atau langsung di POS. Member dan poin sama di semua outlet.') + '</span><span class="lp-chips"><span class="is-on">' + ic('plug-connected', 14) + 'iSeller</span><span>' + T('Tanpa POS: aplikasi kasir') + '</span><span>' + T('Moka, majoo, ESB: segera') + '</span></span></a>' +
      '<a class="lp-tile" href="dashboard.html#/kampanye/baru"' + rd(2) + '><span class="lp-fig num">Rp586</span><span class="lp-tile-t">' + T('Biaya terlihat sebelum kirim') + '</span><span class="lp-tile-x">' + T('Per promo WhatsApp, sebelum PPN. Email dan notifikasi Wallet termasuk paket.') + '</span></a>' +
      '<a class="lp-tile" href="anggota.html#/akun"' + rd(3) + '>' + ic('shield-lock', 30, 'big') + '<span class="lp-tile-t">' + T('Data di Jakarta') + '</span><span class="lp-tile-x">' + T('Sesuai UU PDP. Member bisa unduh atau hapus datanya sendiri.') + '</span></a></div></section>' +
      caseStudy() +
      /* people */
      '<section class="lp-wrap" aria-labelledby="pp-t"><div class="lp-head is-center"><h2 id="pp-t" class="lp-h2">' + T('Satu sistem, <em>tiga pengguna</em>') + '</h2></div><div class="lp-people">' +
      PEOPLE.map(function (p, i) { return '<a class="lp-person" href="' + p.href + '" style="--acc:' + p.acc + '"' + rd(i) + '><span class="lp-person-ic">' + ic(p.icon, 24) + '</span><h3>' + T(p.title) + '</h3><p class="sec">' + T(p.text) + '</p><ul class="lp-checks">' + p.points.map(function (x) { return '<li>' + ic('check', 18) + '<span>' + T(x) + '</span></li>'; }).join('') + '</ul>' + go(T(p.cta)) + '</a>'; }).join('') + '</div></section>' +
      /* faq */
      '<section class="lp-wrap" aria-labelledby="faq-t"><div class="lp-head is-center"><h2 id="faq-t" class="lp-h2">' + T('Pertanyaan umum') + '</h2></div><div class="lp-faq">' +
      FAQ.map(function (f, i) { var open = openQ === i; return '<div class="lp-qa' + (open ? ' is-open' : '') + '"><button type="button" class="lp-q" aria-expanded="' + open + '" data-act="faq" data-i="' + i + '">' + T(f[0]) + '<span class="lp-q-ic">' + ic(open ? 'minus' : 'plus', 16) + '</span></button><p class="lp-a"' + (open ? '' : ' hidden') + '>' + T(f[1]) + '</p></div>'; }).join('') + '</div></section>' +
      stampCard() +
      '<footer class="lp-wrap lfoot"><span class="row" style="--gap:10px"><span class="logo-mark">' + P.mark(20) + '</span><b>Providea Loyalty</b></span><span class="t-small sec">' + T('Demo. Merek Kamtono, Mendaya Ramen, dan Bobs, orang, dan semua angka di halaman ini fiktif. Gambar kafe adalah ilustrasi. Klik di demo tersimpan di browser ini saja.') + '</span><span class="row wrap t-small"><a class="link-quiet" href="../influence/">Providea Influence</a><a class="link-quiet" href="../">Providea</a></span></footer>' +
      '</div></div>';
    reveal();
    startRelay();
    countUp();
    startRotate();
  }

  function setSc(k) {
    scTab = k;
    document.querySelectorAll('.lp-tab').forEach(function (b) { var on = b.dataset.v === k; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    var s = $('scShot'); if (s) s.innerHTML = shot();
    var a = $('scTry'); if (a) { a.href = SC[k].href; a.innerHTML = go(T('Coba {v}', { v: T(SC[k].label) })); }
  }
  function startRotate() {
    clearInterval(scTimer); if (scTouched || reduce.matches) return;
    scTimer = setInterval(function () { var ks = Object.keys(SC); setSc(ks[(ks.indexOf(scTab) + 1) % ks.length]); }, 6000);
  }
  P.ACT.sc = function (el) { scTouched = true; clearInterval(scTimer); var s = $('lpShow'); if (s) s.classList.add('is-static'); setSc(el.dataset.v); };
  P.ACT.faq = function (el) {
    var i = +el.dataset.i; openQ = openQ === i ? -1 : i;
    document.querySelectorAll('.lp-qa').forEach(function (q, j) { var open = j === openQ; q.classList.toggle('is-open', open); q.querySelector('.lp-q').setAttribute('aria-expanded', open); q.querySelector('.lp-a').hidden = !open; q.querySelector('.lp-q-ic').innerHTML = ic(open ? 'minus' : 'plus', 16); });
  };
  /* count-up for the case figures */
  function countUp() {
    var els = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length || typeof IntersectionObserver === 'undefined' || reduce.matches) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, txt = el.dataset.text, t0 = performance.now();
        (function step(now) { var k = Math.min(1, (now - t0) / 1200), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          el.textContent = txt.replace(/[\d.]+(?=%|$)/, P.num(v)); if (k < 1) requestAnimationFrame(step); else el.textContent = txt; })(t0);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }
  function reveal() {
    var el = $('lp');
    if (!el || typeof IntersectionObserver === 'undefined' || reduce.matches) return;
    el.classList.add('is-anim');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.setAttribute('data-shown', ''); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    el.querySelectorAll('[data-reveal]:not([data-shown])').forEach(function (n) { io.observe(n); });
  }

  P.onLang = function () { var y = scrollY; render(); scrollTo(0, y); };
  /* coming back from another view (bfcache): refresh the stamp card */
  window.addEventListener('pageshow', function (e) { if (e.persisted) { var y = scrollY; render(); scrollTo(0, y); } });
  render();
})();
