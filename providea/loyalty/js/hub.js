/* Providea Loyalty demo · landing page. Its own look (light, warm, card and stamp motifs), on the
   Providea design system: peach hero with a floating member-card scene and an activity ticker, the
   member loop, a showcase of the real demo screens, an Indonesia bento, the sample case, three
   people, FAQ cards, and a closing demo stamp card that fills as each view is opened. */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc;
  P.setView('hub');
  var app = document.getElementById('app');
  var scTab = 'member', scTimer = null, scTouched = false, openQ = 0;

  function rd(i) { return ' data-reveal style="--rd:' + i * 70 + 'ms"'; }
  function go(label) { return '<span class="lp-go">' + label + ic('arrow-right', 16) + '</span>'; }

  var LOOP = [
    ['scan', 'Daftar di kasir', 'Pindai QR meja atau sebut nomor HP.', 'anggota.html#/scan'],
    ['coin', 'Poin dan stempel', '1 poin tiap Rp10.000, 1 stempel tiap cup.', 'kasir.html'],
    ['crown', 'Naik tier', 'Gold dan Platinum otomatis, poin 1,25× dan 1,5×.', 'anggota.html#/home'],
    ['ticket', 'Pakai voucher', 'Voucher sekali pakai, atau bayar pakai poin.', 'anggota.html#/voucher'],
    ['refresh', 'Datang lagi', 'Promo WhatsApp untuk member yang mulai jarang datang.', 'dashboard.html#/segmen']
  ];
  var SC = {
    member: { label: 'HP member', icon: 'device-mobile', text: 'Kartu, poin, stempel, voucher, dan Wallet. Terbuka di browser, tanpa unduh aplikasi.', href: 'anggota.html#/home' },
    kasir: { label: 'Kasir', icon: 'device-tablet', text: 'Check-in, tambah penjualan, pindai voucher, dan bayar pakai poin di tablet kasir.', href: 'kasir.html' },
    dash: { label: 'Dashboard', icon: 'layout-dashboard', text: 'Laporan, member, tier, voucher, segmen, dan kampanye untuk pemilik merek.', href: 'dashboard.html' }
  };
  var STATS = [['2.140', 'member dalam 4 bulan'], ['38%', 'transaksi pakai member'], ['41%', 'member datang 2 kali atau lebih dalam 30 hari'], ['312', 'voucher dipakai dalam 30 hari']];
  var STEPS = [['qrcode', 'Pasang QR di meja kasir', 'Satu standee untuk daftar dan check-in.'], ['user-plus', 'Kasir ajak daftar saat bayar', 'Cukup nomor HP. Poin pertama langsung masuk.'], ['sparkles', 'Program jalan sendiri', 'Tier naik otomatis, voucher dan pengingat terkirim lewat WhatsApp.']];
  var PEOPLE = [
    { acc: '#0f6b6f', icon: 'device-mobile', title: 'Untuk pelanggan', text: 'Daftar dalam 30 detik, tanpa unduh aplikasi.', points: ['Kartu dengan QR yang berganti tiap 30 detik', 'Poin, stempel, dan tier dalam satu halaman', 'Kartu di Apple Wallet dan Samsung Wallet'], cta: 'Buka HP member', href: 'anggota.html#/home' },
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

  function product() {
    return '<div class="lp-product"><div class="lp-phone"><img src="img/sc-member-' + P.lang() + '.webp" alt="' + T('Halaman member Sejuk Froyo Bar di HP, contoh') + '" width="390" height="844" fetchpriority="high" decoding="async"></div>' +
      '<div class="lp-notif" role="img" aria-label="' + T('Contoh pesan WhatsApp setelah belanja') + '"><span class="lp-notif-app">' + ic('brand-whatsapp', 20) + '</span><span class="stack" style="--gap:2px"><span class="row between"><b>Sejuk Froyo Bar</b><span class="t-small muted">' + T('sekarang') + '</span></span><p>' + T('+5 poin dari belanja Rp47.000 di Cempaka. Saldo 191 poin.') + '</p></span></div>' +
      '<span class="lp-product-cap">' + ic('device-mobile', 14) + T('Layar dari demo · data contoh') + '</span></div>';
  }
  function shot() {
    var src = 'img/sc-' + scTab + '-' + P.lang() + '.webp';
    if (scTab === 'dash') return '<div class="lsc-frame"><div class="lsc-chrome"><i></i>loyalty.providea.id/sejuk</div><img class="lsc-img" src="' + src + '" alt="' + T('Dashboard pemilik Providea Loyalty, contoh') + '" loading="lazy" decoding="async"></div>';
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
      '<section class="lp-hero" aria-labelledby="lp-title"><div class="lp-hero-in"><div class="lp-copy">' +
      '<h1 id="lp-title" class="lp-h1">' + T('Pelanggan datang lagi, tanpa unduh aplikasi.') + '</h1>' +
      '<p class="lp-lead">' + T('Kartu member, poin, dan voucher untuk merek dengan 1 sampai 20 outlet. Pelanggan daftar di kasir dengan nomor HP. Kartunya ada di WhatsApp dan dompet HP.') + '</p>' +
      '<form class="lp-form" id="ldJoin" aria-label="' + T('Coba daftar jadi member') + '"><span class="input input-lg"><span class="input-icon">' + ic('brand-whatsapp', 20) + '</span><input id="ldPhone" inputmode="tel" placeholder="' + T('Nomor WhatsApp kamu') + '" aria-label="' + T('Nomor WhatsApp') + '"></span><button type="submit" class="lp-form-btn">' + T('Coba daftar') + ic('arrow-right', 18) + '</button></form>' +
      '<p class="lp-form-note">' + T('Demo dengan merek contoh. Nomor hanya dipakai di browser ini.') + '</p>' +
      '<ul class="lp-facts">' + [['clock', 'Daftar dalam 30 detik'], ['coin', '1 poin tiap Rp10.000'], ['wallet', 'Kartu di dompet HP'], ['plug-connected', 'Jalan bersama iSeller']].map(function (f) { return '<li>' + ic(f[0], 20) + '<span>' + T(f[1]) + '</span></li>'; }).join('') + '</ul>' +
      '<p class="lp-also">' + T('Lihat juga') + ' <a href="kasir.html">' + T('Layar kasir') + ic('arrow-right', 15) + '</a><a href="dashboard.html">' + T('Dashboard pemilik') + ic('arrow-right', 15) + '</a></p></div>' + product() + '</div></section>' +
      /* loop */
      '<section class="lp-wrap" aria-labelledby="loop-t"><div class="lp-head lp-head-row"><div><h2 id="loop-t" class="lp-h2">' + T('Satu siklus, dari kunjungan pertama sampai <em>kembali lagi</em>') + '</h2><p class="lp-sub">' + T('Setiap langkah bisa dicoba di demo dengan merek contoh Sejuk Froyo Bar.') + '</p></div></div>' +
      '<div class="lp-loop">' + LOOP.map(function (s, i) { return '<a class="lp-step' + (i === 4 ? ' is-back' : '') + '" href="' + s[3] + '"' + rd(i) + '><span class="lp-step-n num">0' + (i + 1) + '</span><span class="lp-step-ic">' + ic(s[0], 22) + '</span><span class="lp-step-t">' + T(s[1]) + '</span><span class="lp-step-x">' + T(s[2]) + '</span>' + go(T('Coba')) + '</a>'; }).join('') + '</div></section>' +
      /* showcase */
      '<section class="lp-wrap" aria-labelledby="sc-t"><div class="lp-head lp-head-row"><div><h2 id="sc-t" class="lp-h2">' + T('Satu data, <em>tiga layar</em>') + '</h2><p class="lp-sub">' + T('Penjualan di kasir langsung masuk ke HP member dan dashboard pemilik.') + '</p></div></div>' +
      '<div class="lp-show' + (scTouched ? ' is-static' : '') + '" id="lpShow"><div class="lp-tabs" role="tablist">' + Object.keys(SC).map(function (k) { return '<button type="button" role="tab" class="lp-tab' + (scTab === k ? ' is-active' : '') + '" aria-selected="' + (scTab === k) + '" data-act="sc" data-v="' + k + '">' + ic(SC[k].icon, 22) + '<b>' + T(SC[k].label) + '</b><span>' + T(SC[k].text) + '</span><i class="lp-tab-bar"></i></button>'; }).join('') +
      '<a id="scTry" href="' + SC[scTab].href + '">' + go(T('Coba {v}', { v: T(SC[scTab].label) })) + '</a></div><div class="lp-screen" data-reveal><div class="lsc-shot" id="scShot">' + shot() + '</div></div></div></section>' +
      /* bento */
      '<section class="lp-wrap" aria-labelledby="id-t"><div class="lp-head lp-head-row"><div><h2 id="id-t" class="lp-h2">' + T('Dibuat untuk outlet di <em>Indonesia</em>') + '</h2><p class="lp-sub">' + T('Bahasa Indonesia lebih dulu, nomor HP sebagai ID, dan jalan di HP Android murah.') + '</p></div></div><div class="lp-bento">' +
      '<a class="lp-tile is-big" href="anggota.html#/join"' + rd(0) + '><div class="lp-tex"><img src="img/hero.webp" alt="" loading="lazy"></div><div class="stack" style="--gap:12px">' + ic('brand-whatsapp', 34, 'big') + '<span class="lp-tile-t">' + T('WhatsApp jadi kartu member') + '</span><span class="lp-tile-x">' + T('Nomor HP adalah ID member. Kode daftar, poin baru, dan promo datang lewat WhatsApp.') + '</span></div>' +
      '<div class="lp-wa"><span class="lp-wa-h">' + ic('brand-whatsapp', 15) + 'Sejuk Froyo Bar</span><span>' + T('Halo Rina, terima kasih sudah mampir. +5 poin masuk. Saldo 191 poin, 2 cup lagi dapat cup kecil gratis.') + '</span><span class="lp-wa-t">15.12</span></div>' + go(T('Lihat di demo')) + '</a>' +
      '<a class="lp-tile is-wide" href="kasir.html#/pos"' + rd(1) + '>' + ic('cash-register', 30, 'big') + '<span class="lp-tile-t">' + T('Jalan di kasir yang sudah ada') + '</span><span class="lp-tile-x">' + T('Aplikasi kasir di browser, atau langsung di POS. Member dan poin sama di semua outlet.') + '</span><span class="lp-chips"><span class="is-on">' + ic('plug-connected', 14) + 'iSeller</span><span>' + T('Tanpa POS: aplikasi kasir') + '</span><span>' + T('Moka, majoo, ESB: segera') + '</span></span></a>' +
      '<a class="lp-tile" href="dashboard.html#/kampanye/baru"' + rd(2) + '><span class="lp-fig num">Rp586</span><span class="lp-tile-t">' + T('Biaya terlihat sebelum kirim') + '</span><span class="lp-tile-x">' + T('Per promo WhatsApp, sebelum PPN. Email dan notifikasi Wallet termasuk paket.') + '</span></a>' +
      '<a class="lp-tile" href="anggota.html#/akun"' + rd(3) + '>' + ic('shield-lock', 30, 'big') + '<span class="lp-tile-t">' + T('Data di Jakarta') + '</span><span class="lp-tile-x">' + T('Sesuai UU PDP. Member bisa unduh atau hapus datanya sendiri.') + '</span></a></div></section>' +
      /* case */
      '<section class="lp-wrap" aria-labelledby="case-t"><div class="lp-head lp-head-row"><div><h2 id="case-t" class="lp-h2">' + T('Kisah contoh: outlet pertama Sejuk Froyo Bar') + '</h2><p class="lp-sub">' + T('Bar frozen yogurt yang baru buka, dengan satu tablet POS di kasir. Empat bulan setelah QR dipasang di meja kasir:') + '</p></div><span class="tag tag-warning">' + ic('info-circle', 14) + T('Angka contoh') + '</span></div>' +
      '<div class="lstats">' + STATS.map(function (s, i) { return '<div class="lstat"' + rd(i) + '><span class="lstat-n num">' + s[0] + '</span><span class="lstat-l">' + T(s[1]) + '</span></div>'; }).join('') + '</div>' +
      '<ol class="lsteps">' + STEPS.map(function (s, i) { return '<li class="lstep"' + rd(i) + '><span class="lstep-ic">' + ic(s[0], 22) + '</span><span class="lstep-n num">0' + (i + 1) + '</span><span class="t-h3">' + T(s[1]) + '</span><span class="sec">' + T(s[2]) + '</span></li>'; }).join('') + '</ol></section>' +
      /* people */
      '<section class="lp-wrap" aria-labelledby="pp-t"><div class="lp-head is-center"><h2 id="pp-t" class="lp-h2">' + T('Satu sistem, <em>tiga pengguna</em>') + '</h2></div><div class="lp-people">' +
      PEOPLE.map(function (p, i) { return '<a class="lp-person" href="' + p.href + '" style="--acc:' + p.acc + '"' + rd(i) + '><span class="lp-person-ic">' + ic(p.icon, 24) + '</span><h3>' + T(p.title) + '</h3><p class="sec">' + T(p.text) + '</p><ul class="lp-checks">' + p.points.map(function (x) { return '<li>' + ic('check', 18) + '<span>' + T(x) + '</span></li>'; }).join('') + '</ul>' + go(T(p.cta)) + '</a>'; }).join('') + '</div></section>' +
      /* faq */
      '<section class="lp-wrap" aria-labelledby="faq-t"><div class="lp-head is-center"><h2 id="faq-t" class="lp-h2">' + T('Pertanyaan umum') + '</h2></div><div class="lp-faq">' +
      FAQ.map(function (f, i) { var open = openQ === i; return '<div class="lp-qa' + (open ? ' is-open' : '') + '"><button type="button" class="lp-q" aria-expanded="' + open + '" data-act="faq" data-i="' + i + '">' + T(f[0]) + '<span class="lp-q-ic">' + ic(open ? 'minus' : 'plus', 16) + '</span></button><p class="lp-a"' + (open ? '' : ' hidden') + '>' + T(f[1]) + '</p></div>'; }).join('') + '</div></section>' +
      stampCard() +
      '<footer class="lp-wrap lfoot"><span class="row" style="--gap:10px"><span class="logo-mark">' + P.mark(20) + '</span><b>Providea Loyalty</b></span><span class="t-small sec">' + T('Demo. Merek Sejuk Froyo Bar, orang, dan semua angka di halaman ini fiktif. Klik di demo tersimpan di browser ini saja.') + '</span><span class="row wrap t-small"><a class="link-quiet" href="../influence/">Providea Influence</a><a class="link-quiet" href="../">Providea</a></span></footer>' +
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
    document.querySelectorAll('.lp-tab').forEach(function (b) { var on = b.dataset.v === k; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    var s = document.getElementById('scShot'); if (s) s.innerHTML = shot();
    var a = document.getElementById('scTry'); if (a) { a.href = SC[k].href; a.innerHTML = go(T('Coba {v}', { v: T(SC[k].label) })); }
  }
  function startRotate() {
    clearInterval(scTimer); if (scTouched || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scTimer = setInterval(function () { var ks = Object.keys(SC); setSc(ks[(ks.indexOf(scTab) + 1) % ks.length]); }, 6000);
  }
  P.ACT.sc = function (el) { scTouched = true; clearInterval(scTimer); var s = document.getElementById('lpShow'); if (s) s.classList.add('is-static'); setSc(el.dataset.v); };
  P.ACT.faq = function (el) {
    var i = +el.dataset.i; openQ = openQ === i ? -1 : i;
    document.querySelectorAll('.lp-qa').forEach(function (q, j) { var open = j === openQ; q.classList.toggle('is-open', open); q.querySelector('.lp-q').setAttribute('aria-expanded', open); q.querySelector('.lp-a').hidden = !open; q.querySelector('.lp-q-ic').innerHTML = ic(open ? 'minus' : 'plus', 16); });
  };
  function reveal() {
    var el = document.getElementById('lp');
    if (!el || typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add('is-anim');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.setAttribute('data-shown', ''); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    el.querySelectorAll('[data-reveal]:not([data-shown])').forEach(function (n) { io.observe(n); });
  }

  P.onLang = function () { var y = scrollY; render(); scrollTo(0, y); };
  /* coming back from another view (bfcache): refresh the stamp card */
  window.addEventListener('pageshow', function (e) { if (e.persisted) { var y = scrollY; render(); scrollTo(0, y); } });
  render();
})();
