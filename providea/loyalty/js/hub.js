/* Providea Loyalty demo · landing page, built on the Providea Influence landing (css/landing.css):
   reeded-glass hero with a moving column of member activity, feature tiles, a showcase of the real
   demo screens, the Indonesia band, the sample case, roles, FAQ and the closing field. */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc;
  P.setView('hub');
  var app = document.getElementById('app');
  var scTab = 'member', scTimer = null, scTouched = false, openQ = 0;

  function rd(i) { return ' data-reveal style="--rd:' + i * 80 + 'ms"'; }
  function tex(name, flip, extra) { return '<div class="ld-tex' + (flip ? ' is-flip' : '') + (extra ? ' ' + extra : '') + '"><img src="img/' + name + '.webp" alt="" decoding="async"' + (name === 'hero' ? ' fetchpriority="high"' : ' loading="lazy"') + '></div>'; }

  /* hero reel: member activity at the Cempaka till (sample data) */
  var FEED = [
    ['Rina Maharani', 'Gold', [['coin', '+5 poin'], ['rubber-stamp', 'stempel 8/10']]],
    ['Bagus Santoso', 'Platinum', [['ticket', 'voucher dipakai'], ['gift', 'Beli 1 gratis 1']]],
    ['Putri Anggraini', 'Silver', [['user-plus', 'member baru'], ['scan', 'QR meja kasir']]],
    ['Kevin Tanoto', 'Gold', [['rubber-stamp', 'stempel 10/10'], ['gift', 'cup kecil gratis']]],
    ['Anisa Rahmawati', 'Gold', [['coins', 'bayar pakai poin'], ['discount', 'potongan Rp30.000']]],
    ['Laras Kinanti', 'Gold', [['map-pin', 'check-in'], ['clock', 'baru saja']]],
    ['Gilang Ramadhan', 'Silver', [['wallet', 'kartu di Wallet'], ['device-mobile', 'Samsung Wallet']]],
    ['Citra Ayuningtyas', 'Gold', [['coin', '+5 poin'], ['receipt', 'Rp46.000']]],
    ['Yosef Manurung', 'Silver', [['brand-whatsapp', 'promo dibaca'], ['refresh', 'datang lagi']]],
    ['Melati Sari', 'Silver', [['coin', '+5 poin'], ['crown', '1,25× bulan depan']]]
  ];
  function chip(f) {
    return '<li class="hr-chip"><span class="hr-avatar">' + esc(P.initials(f[0])) + '</span><span class="hr-id"><b>' + esc(f[0]) + '</b><small>' + f[1] + ' · Outlet Cempaka</small></span>' +
      '<span class="hr-plat">' + f[2].map(function (x) { return '<span>' + ic(x[0], 13) + T(x[1]) + '</span>'; }).join('') + '</span></li>';
  }
  function reel() {
    var a = FEED.filter(function (_, i) { return i % 2 === 0; }), b = FEED.filter(function (_, i) { return i % 2 === 1; });
    return '<div class="hr" aria-hidden="true" inert>' + [a, b].map(function (list, c) { return '<ul class="hr-col' + (c ? ' is-rev' : '') + '">' + list.concat(list).map(chip).join('') + '</ul>'; }).join('') + '</div>';
  }

  var TILES = [
    ['card', 'scan', 'Daftar di kasir', 'QR meja, nomor HP, atau email', 'anggota.html#/scan'],
    ['rays', 'coin', 'Poin dan stempel', '1 poin tiap Rp10.000, 10 cup dapat 1 gratis', 'anggota.html#/home'],
    ['sky', 'crown', 'Tier otomatis', 'Silver, Gold, Platinum', 'dashboard.html#/tier'],
    ['arc', 'ticket', 'Voucher sekali pakai', 'QR dan kode unik per member', 'kasir.html'],
    ['hero', 'wallet', 'Kartu di dompet HP', 'Apple Wallet dan Samsung Wallet', 'anggota.html#/wallet'],
    ['deep', 'speakerphone', 'Promo terukur', 'WhatsApp, email, dan notifikasi Wallet', 'dashboard.html#/kampanye/baru']
  ];
  var SC = {
    member: { label: 'HP member', icon: 'device-mobile', text: 'Kartu, poin, stempel, voucher, dan Wallet. Terbuka di browser, tanpa unduh aplikasi.', href: 'anggota.html#/home' },
    kasir: { label: 'Kasir', icon: 'device-tablet', text: 'Check-in, tambah penjualan, pindai voucher, dan bayar pakai poin di tablet kasir.', href: 'kasir.html' },
    dash: { label: 'Dashboard', icon: 'layout-dashboard', text: 'Laporan, member, tier, voucher, segmen, dan kampanye untuk pemilik merek.', href: 'dashboard.html' }
  };
  var BAND = [
    ['brand-whatsapp', 'WhatsApp jadi kartu member', 'Nomor HP adalah ID member. Kode daftar, poin baru, dan promo datang lewat WhatsApp.', 'anggota.html#/join', 'Utama'],
    ['device-tablet', 'Jalan di kasir yang sudah ada', 'Pakai aplikasi kasir di browser, atau langsung di POS seperti iSeller. Member dan poin sama di semua outlet.', 'kasir.html#/pos'],
    ['receipt', 'Biaya terlihat sebelum kirim', 'Promo WhatsApp Rp586,33 per pesan sebelum PPN. Email dan notifikasi Wallet termasuk paket.', 'dashboard.html#/kampanye/baru'],
    ['shield-lock', 'Data di Jakarta', 'Persetujuan terpisah dari izin promo. Member bisa unduh atau hapus datanya, sesuai UU PDP.', 'anggota.html#/akun']
  ];
  var STATS = [['2.140', 'member dalam 4 bulan'], ['38%', 'transaksi pakai member'], ['41%', 'member datang 2 kali atau lebih dalam 30 hari'], ['312', 'voucher dipakai dalam 30 hari']];
  var STEPS = [['qrcode', 'Pasang QR di meja kasir', 'Satu standee untuk daftar dan check-in.'], ['user-plus', 'Kasir ajak daftar saat bayar', 'Cukup nomor HP. Poin pertama langsung masuk.'], ['sparkles', 'Program jalan sendiri', 'Tier naik otomatis, voucher dan pengingat terkirim lewat WhatsApp.']];
  var ROLES = [
    { dark: true, icon: 'layout-dashboard', title: 'Untuk pemilik merek', text: 'Lihat apakah pelanggan datang lagi, lalu atur program dari satu tempat.', points: ['Laporan 6 angka: member baru, join rate, member aktif, repeat rate, poin beredar, voucher dipakai', 'Tier, poin, stempel, dan voucher diatur sendiri', 'Kampanye WhatsApp, email, dan Wallet dengan perkiraan biaya', 'Peran staf per outlet dan log audit'], cta: 'Buka dashboard', href: 'dashboard.html' },
    { dark: false, icon: 'device-tablet', title: 'Untuk kasir', text: 'Cepat di jam ramai. Kasir tidak perlu mengetik nomor HP.', points: ['Pop-up saat member check-in dari QR meja', 'Tambah penjualan, poin dan stempel masuk otomatis', 'Voucher dipindai; kode yang sudah dipakai ditolak', 'Bayar pakai poin, dan batalkan penjualan dengan alasan'], cta: 'Buka layar kasir', href: 'kasir.html' }
  ];
  var FAQ = [
    ['Apakah pelanggan harus unduh aplikasi?', 'Tidak. Halaman member terbuka di browser HP, dan kartu bisa disimpan di Apple Wallet atau Samsung Wallet. Google Wallet belum resmi di Indonesia, jadi HP lain memasang halaman member ke layar utama.'],
    ['Apakah bisa dipakai dengan POS yang sudah ada?', 'Bisa. iSeller lebih dulu, lalu Moka, majoo, dan ESB. Outlet tanpa POS yang terhubung memakai aplikasi kasir di browser tablet.'],
    ['Bagaimana bila internet outlet putus?', 'Aplikasi kasir tetap mencatat penjualan. Data dikirim saat internet kembali.'],
    ['Berapa biaya kirim promo?', 'Promo WhatsApp memakai tarif WhatsApp untuk Indonesia, sekitar Rp586 per pesan sebelum PPN 11%. Email dan notifikasi Wallet termasuk paket. Biaya selalu tampil sebelum kampanye dikirim.'],
    ['Apakah poin bisa dicairkan jadi uang?', 'Tidak. Poin hanya dipakai sebagai potongan atau hadiah di merek itu sendiri, misalnya 1 poin = Rp500 saat bayar.'],
    ['Apakah data pelanggan aman?', 'Data disimpan di Jakarta. Persetujuan syarat terpisah dari izin promo, member bisa unduh atau hapus datanya, dan setiap ekspor tercatat di log audit.']
  ];

  function wall() {
    var order = ['card', 'voucher', 'pass', 'voucher', 'pass', 'card', 'pass', 'card', 'voucher'], n = { card: 0, pass: 0, voucher: 0 };
    var cards = order.map(function (k, i) {
      var j = n[k]++;
      if (k === 'card') return '<div class="wc wc-card"><span class="row between">' + P.sjLogo(20) + '<span class="tier tier-' + ['gold', 'platinum', 'silver'][j] + ' tier-sm">' + ['Gold', 'Platinum', 'Silver'][j] + '</span></span><span><span class="wc-big num">' + [186, 402, 21][j] + '</span><span class="wc-small"> ' + T('poin') + '</span></span></div>';
      if (k === 'pass') return '<div class="wc wc-pass"><span class="row between"><span class="wc-small">' + T('POIN') + '</span><b class="num">' + [191, 233, 75][j] + '</b></span><span class="wc-qr">' + P.qr('wall' + i) + '</span></div>';
      return '<div class="wc wc-voucher">' + ic(['gift', 'ticket', 'percentage'][j], 22) + '<b>' + T(['Gratis topping', 'Cup kecil gratis', 'Diskon 20% cup besar'][j]) + '</b><span class="wc-small">' + T('Sekali pakai') + '</span></div>';
    });
    return '<div class="ld-wall" aria-hidden="true">' + cards.join('') + '</div>';
  }

  function scFrame() {
    var lang = P.lang(), src = 'img/sc-' + scTab + '-' + lang + '.webp';
    if (scTab === 'dash') return '<div class="sc-frame lsc-frame"><div class="sc-chrome"><span class="sc-dots"><i></i><i></i><i></i></span><span class="sc-url">' + ic('lock', 12) + 'loyalty.providea.id/sejuk</span></div><img class="lsc-img" src="' + src + '" alt="' + T('Dashboard pemilik Providea Loyalty, contoh') + '" loading="lazy" decoding="async"></div>';
    return '<div class="lsc-device is-' + scTab + '"><img class="lsc-img" src="' + src + '" alt="' + (scTab === 'member' ? T('Halaman member di HP, contoh') : T('Aplikasi kasir di tablet, contoh')) + '" loading="lazy" decoding="async"></div>';
  }

  function render() {
    app.innerHTML = '<div class="landing page"><div class="ld" id="ld">' +
      /* hero */
      '<section class="ld-hero" aria-labelledby="ld-title">' + tex('hero', true, 'ld-hero-tex') + '<div class="ld-hero-in"><div class="ld-hero-copy">' +
      '<h1 id="ld-title" class="ld-h1">' + T('Pelanggan datang lagi. Tanpa unduh aplikasi.') + '</h1>' +
      '<p class="ld-lead">' + T('Kartu member, poin, dan voucher untuk merek dengan 1 sampai 20 outlet. Pelanggan daftar di kasir dengan nomor HP, kartunya ada di WhatsApp dan dompet HP, dan semuanya jalan bersama POS yang sudah kamu pakai.') + '</p>' +
      '<form class="ld-search" id="ldJoin" role="search" aria-label="' + T('Coba daftar jadi member') + '"><span class="input input-lg"><span class="input-icon">' + ic('brand-whatsapp', 20) + '</span><input id="ldPhone" inputmode="tel" placeholder="' + T('Nomor WhatsApp, misalnya 0813 1234 5678') + '" aria-label="' + T('Nomor WhatsApp') + '"></span>' +
      '<button type="submit" class="ld-search-btn">' + ic('device-mobile', 18) + T('Coba daftar') + '</button></form>' +
      '<div class="ld-niches"><span class="ld-niches-label">' + T('Atau buka langsung') + '</span><div class="ld-niche-list">' +
      [['HP member', 'anggota.html#/scan'], ['Kasir', 'kasir.html'], ['Alur di POS', 'kasir.html#/pos'], ['Dashboard pemilik', 'dashboard.html']].map(function (x) { return '<a class="ld-niche" href="' + x[1] + '">' + T(x[0]) + '</a>'; }).join('') + '</div></div></div>' + reel() + '</div></section>' +
      /* tiles */
      '<section class="ld-wrap ld-sec ld-first" aria-labelledby="ft-t"><div class="ld-head ld-head-row"><div><h2 id="ft-t" class="ld-h2">' + T('Semua yang dibutuhkan outlet pertama') + '</h2><p class="ld-sub">' + T('Dari daftar di kasir sampai promo WhatsApp. Klik untuk mencobanya di demo.') + '</p></div><a class="ld-more-link" href="anggota.html#/scan">' + T('Mulai dari HP member') + ic('arrow-right', 18) + '</a></div>' +
      '<div class="ld-cats">' + TILES.map(function (t, i) { return '<a class="ld-cat" href="' + t[4] + '"' + rd(i) + '>' + tex(t[0], i % 2) + '<span class="ld-cat-top">' + ic(t[1], 26) + '<span class="ld-cat-go">' + ic('arrow-up-right', 20) + '</span></span><span class="ld-cat-text"><span class="ld-cat-name">' + T(t[2]) + '</span><span class="ld-cat-n">' + T(t[3]) + '</span></span></a>'; }).join('') + '</div></section>' +
      /* showcase */
      '<section class="ld-wrap ld-sec" aria-labelledby="sc-t"><div class="ld-head ld-head-row ld-head-split"><div><h2 id="sc-t" class="ld-h2 ld-h2-wide">' + T('Satu data, tiga layar. Semua langsung tersambung.') + '</h2></div><p class="ld-sub ld-sub-side">' + T('Penjualan di kasir langsung masuk ke HP member dan dashboard pemilik.') + '</p></div>' +
      '<div class="sc"><div class="sc-stage" data-reveal>' + tex('sky') + '<div class="tabs-segmented" role="tablist">' + Object.keys(SC).map(function (k) { return '<button type="button" role="tab" class="tab' + (scTab === k ? ' is-active' : '') + '" aria-selected="' + (scTab === k) + '" data-act="sc" data-v="' + k + '">' + ic(SC[k].icon, 16) + T(SC[k].label) + '</button>'; }).join('') + '</div><div id="scShot" class="lsc-shot">' + scFrame() + '</div></div>' +
      '<div class="sc-captions">' + Object.keys(SC).map(function (k) { return '<div class="sc-cap' + (scTab === k ? ' is-active' : '') + '" data-cap="' + k + '"><button type="button" class="lsc-capbtn" data-act="sc" data-v="' + k + '"><span class="t-strong">' + T(SC[k].label) + '</span><span class="t-small sec">' + T(SC[k].text) + '</span></button><a class="ld-more-link lsc-try" href="' + SC[k].href + '">' + T('Coba') + ic('arrow-right', 16) + '</a></div>'; }).join('') + '</div></div></section>' +
      /* band */
      '<section class="ld-band" aria-labelledby="band-t">' + tex('deep', true) + '<div class="ld-band-in"><div class="ld-band-head"><div><h2 id="band-t" class="ld-h2">' + T('Dibuat untuk outlet di Indonesia') + '</h2><p class="ld-sub">' + T('Bahasa Indonesia lebih dulu, nomor HP sebagai ID, dan jalan di HP Android murah.') + '</p></div><span class="ld-quota">' + T('Contoh dengan merek fiktif Sejuk Froyo Bar') + '</span></div>' +
      '<div class="ld-tools">' + BAND.map(function (b, i) { return '<a class="ld-tool' + (i === 0 ? ' is-top' : '') + '" href="' + b[3] + '"' + rd(i) + '><span class="ld-tool-top">' + ic(b[0], 30) + (b[4] ? '<span class="ld-tool-badge">' + T(b[4]) + '</span>' : '') + '</span><span class="ld-tool-title">' + T(b[1]) + '</span><span class="ld-tool-text">' + T(b[2]) + '</span><span class="ld-tool-go">' + T('Lihat di demo') + ic('arrow-right', 16) + '</span></a>'; }).join('') + '</div></div></section>' +
      /* sample case */
      '<section class="ld-wrap ld-sec" aria-labelledby="case-t"><div class="ld-head ld-head-row"><div><h2 id="case-t" class="ld-h2">' + T('Kisah contoh: outlet pertama Sejuk Froyo Bar') + '</h2><p class="ld-sub">' + T('Bar frozen yogurt yang baru buka, dengan satu tablet POS di kasir. Empat bulan setelah QR dipasang di meja kasir:') + '</p></div><span class="tag tag-warning">' + ic('info-circle', 14) + T('Angka contoh') + '</span></div>' +
      '<div class="lstats">' + STATS.map(function (s, i) { return '<div class="lstat"' + rd(i) + '><span class="lstat-n num">' + s[0] + '</span><span class="lstat-l">' + T(s[1]) + '</span></div>'; }).join('') + '</div>' +
      '<ol class="lsteps">' + STEPS.map(function (s, i) { return '<li class="lstep"' + rd(i) + '><span class="lstep-ic">' + ic(s[0], 22) + '</span><span class="lstep-n num">0' + (i + 1) + '</span><span class="t-h3">' + T(s[1]) + '</span><span class="sec">' + T(s[2]) + '</span></li>'; }).join('') + '</ol></section>' +
      /* roles */
      '<section class="ld-wrap ld-sec ld-roles" aria-label="' + T('Untuk siapa') + '">' + ROLES.map(function (r, i) {
        return '<article class="ld-role' + (r.dark ? ' is-dark' : '') + '"' + rd(i) + '>' + (r.dark ? tex('arc', true) : '') + '<span class="ld-role-icon">' + ic(r.icon, 30) + '</span><h3 class="ld-role-title">' + T(r.title) + '</h3><p class="ld-role-text">' + T(r.text) + '</p><ul class="ld-checks">' + r.points.map(function (p) { return '<li>' + ic('check', 18) + '<span>' + T(p) + '</span></li>'; }).join('') + '</ul><a class="ld-role-btn" href="' + r.href + '">' + T(r.cta) + ic('arrow-right', 16) + '</a></article>';
      }).join('') + '</section>' +
      /* faq */
      '<section class="ld-wrap ld-sec ld-faq" aria-labelledby="faq-t"><div class="ld-faq-side"><h2 id="faq-t" class="ld-h2">' + T('Pertanyaan umum') + '</h2><p class="ld-sub">' + T('Belum terjawab? Coba alurnya langsung di demo.') + '</p><a class="ld-more-link" href="kasir.html">' + T('Buka layar kasir') + ic('arrow-right', 18) + '</a></div><div class="ld-faq-list">' +
      FAQ.map(function (f, i) { var open = openQ === i; return '<div class="ld-qa' + (open ? ' is-open' : '') + '"><button type="button" class="ld-q" aria-expanded="' + open + '" data-act="faq" data-i="' + i + '">' + T(f[0]) + '<span class="ld-q-icon">' + ic(open ? 'minus' : 'plus', 18) + '</span></button><div class="ld-a"' + (open ? '' : ' hidden') + '><p>' + T(f[1]) + '</p></div></div>'; }).join('') + '</div></section>' +
      /* closing */
      '<section class="ld-closing" aria-labelledby="cl-t">' + tex('rays') + '<span class="ld-clouds" aria-hidden="true"></span>' + wall() + '<div class="ld-closing-in" data-reveal><h2 id="cl-t" class="ld-closing-title">' + T('Coba alurnya dalam 2 menit') + '</h2><p class="ld-closing-sub">' + T('Daftar di HP, belanja di kasir, lalu lihat hasilnya di dashboard.') + '</p><a class="ld-closing-btn" href="anggota.html#/scan">' + T('Mulai dari HP member') + ic('arrow-right', 18) + '</a></div></section>' +
      '<footer class="ld-wrap lfoot"><span class="row" style="--gap:10px"><span class="logo-mark">' + P.mark(20) + '</span><b>Providea Loyalty</b></span><span class="t-small sec">' + T('Demo. Merek Sejuk Froyo Bar, orang, dan semua angka di halaman ini fiktif. Klik di demo tersimpan di browser ini saja.') + '</span><span class="row wrap t-small"><a class="link-quiet" href="../influence/">Providea Influence</a><a class="link-quiet" href="../">Providea</a></span></footer>' +
      '</div></div>';
    reveal();
    document.getElementById('ldJoin').onsubmit = function (e) {
      e.preventDefault();
      var d = document.getElementById('ldPhone').value.replace(/\D/g, '');
      try { if (d.length >= 9) sessionStorage.setItem('pl-join-phone', d); } catch (err) {}
      location.href = 'anggota.html#/join';
    };
    startRotate();
  }

  function setSc(k) {
    scTab = k;
    document.querySelectorAll('[role="tab"][data-act="sc"]').forEach(function (b) { var on = b.dataset.v === k; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    document.querySelectorAll('[data-cap]').forEach(function (c) { c.classList.toggle('is-active', c.dataset.cap === k); });
    var s = document.getElementById('scShot'); if (s) s.innerHTML = scFrame();
  }
  function startRotate() {
    clearInterval(scTimer); if (scTouched || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scTimer = setInterval(function () { var ks = Object.keys(SC); setSc(ks[(ks.indexOf(scTab) + 1) % ks.length]); }, 6000);
  }
  P.ACT.sc = function (el) { scTouched = true; clearInterval(scTimer); setSc(el.dataset.v); };
  P.ACT.faq = function (el) { var i = +el.dataset.i; openQ = openQ === i ? -1 : i; var y = scrollY; render(); scrollTo(0, y); };

  /* entrances, as useReveal in the Influence landing */
  function reveal() {
    var el = document.getElementById('ld');
    if (!el || typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add('ld-anim');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.setAttribute('data-shown', ''); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    el.querySelectorAll('[data-reveal]:not([data-shown])').forEach(function (n) { io.observe(n); });
  }

  P.onLang = function () { var y = scrollY; render(); scrollTo(0, y); };
  render();
})();
