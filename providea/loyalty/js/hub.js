/* Providea Loyalty demo · landing page (v6, 20 Nov 2026), Providea Influence family.
   Order: hero slider (what it is + three sample brands + "one sale, three places") → how it works (PLFlow, 3D scroll)
   → one sale recorded in three places (live relay) → benefits for customers and the brand → set up for your business
   → the three screens → sample stories (with a link to each story page) → for customers, cashiers and owners
   → FAQ bento → closing call to try the demo → site footer (core.js). */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc;
  P.setView('hub');
  var app = document.getElementById('app');
  var scTab = 'member', scTimer = null, scTouched = false, openQ = -1, flowOff = null;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');

  function rd(i) { return ' data-reveal style="--rd:' + i * 70 + 'ms"'; }
  function go(label) { return '<span class="lp-go">' + label + ic('arrow-right', 16) + '</span>'; }
  function $(id) { return document.getElementById(id); }
  function ini(n) { return n.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2); }
  function tag(id) { return P.tierTag(P.tierById(id), true); }
  function head(id, title, sub, extra, center) {
    return '<div class="lp-head' + (center ? ' is-center' : ' lp-head-row') + '"><div><h2 id="' + id + '" class="lp-h2">' + T(title) + '</h2>' + (sub ? '<p class="lp-sub">' + T(sub) + '</p>' : '') + '</div>' + (extra || '') + '</div>';
  }

  /* ── data ── */
  var RELAY = [
    { n: 'Rina Maharani', t: 'gold', p: 186, add: 5, s: 7, cups: 1, amt: 47000, item: '1 cup, 2 topping' },
    { n: 'Kevin Tanoto', t: 'gold', p: 205, add: 6, s: 9, cups: 1, amt: 55000, item: '1 cup besar' },
    { n: 'Putri Anggraini', t: 'silver', p: 9, add: 8, s: 2, cups: 2, amt: 84000, item: '2 cup sedang' }
  ];
  var TX0 = 38, BARS = [31, 35, 29, 40, 44, 36], BAR_MAX = 52;
  var MX = [
    { k: 'stempel', t: 'Alasan untuk datang lagi', x: 'Setiap cup menambah satu stempel. Stempel ke-10 jadi hadiah.', win: 'Pelanggan punya target untuk kembali.', cta: 'Coba di kasir', href: 'kasir.html' },
    { k: 'poin', t: 'Belanja terasa lebih berharga', x: '1 poin tiap belanja Rp10.000. Poin bisa dipakai untuk bayar.', win: 'Pelanggan memilih tempatmu dibanding tempat lain.', cta: 'Lihat kartu member', href: 'anggota.html#/home' },
    { k: 'tier', t: 'Pelanggan setia diperlakukan istimewa', x: 'Silver, Gold, dan Platinum naik otomatis dari total belanja. Tier tinggi, poin lebih banyak.', win: 'Kamu tahu siapa pelanggan terbaik, dan bisa merawatnya.', cta: 'Atur tier', href: 'dashboard.html#/tier' },
    { k: 'voucher', t: 'Ajak kembali yang mulai jarang datang', x: 'Voucher sekali pakai dikirim lewat WhatsApp ke pelanggan yang tepat.', win: 'Promo tepat sasaran, biayanya terlihat sebelum kirim.', cta: 'Lihat voucher', href: 'anggota.html#/voucher' }
  ];
  var WINS = [
    ['database', 'Data pelanggan milik merekmu', 'Nama, nomor HP, dan riwayat belanja tersimpan rapi dan bisa diekspor.'],
    ['users-group', 'Promo ke orang yang tepat', 'Segmen otomatis: member baru, aktif, mulai jarang, dan lama tidak datang.'],
    ['receipt-off', 'Tanpa biaya cetak kartu', 'Kartu ada di HP dan di Apple Wallet atau Samsung Wallet.'],
    ['chart-line', 'Hasil terlihat tiap minggu', 'Repeat rate, member aktif, dan voucher dipakai di satu layar.']
  ];
  var STORY = [
    ['Minggu 1', 'QR di meja kasir', 'Kasir mengajak daftar saat pelanggan bayar. Kode masuk lewat WhatsApp.'],
    ['Bulan 1', 'Kartu stempel 10 cup', 'Member baru mendapat voucher sambutan: gratis topping.'],
    ['Bulan 2', 'Tier Gold dan Platinum', 'Pelanggan tetap mendapat poin 1,25× dan 1,5×.'],
    ['Bulan 3 dan 4', 'Pengingat WhatsApp', 'Member yang 30 hari tidak datang menerima satu pesan dengan voucher.']
  ];
  /* sample brands (fictional): hero line about the habit that changed, what was solved, timeline, figures */
  var CASES = [
    { k: 'kamtono', name: 'Kamtono', ind: 'Froyo · outlet pertama', meta: 'Outlet Cempaka · 1 kasir · mulai dari 0 member',
      photo: 'img/kamtono/cafe-counter-', photoM: 'img/kamtono/cafe-wide-', alt: 'Ilustrasi meja kasir Kamtono: tablet kasir dan HP member',
      hTitle: 'Dulu datang sekali. Sekarang datang lagi.', hText: 'Kamtono baru buka dan belum kenal pelanggannya. Kartu stempel di HP memberi alasan untuk kembali: cup ke-10 gratis.', hFig: ['41%', 'member datang lagi dalam 30 hari'],
      solved: [['Belum ada data pelanggan', '2.140 member terdaftar dalam 4 bulan'], ['Pelanggan tidak punya alasan kembali', 'Kartu stempel 10 cup dan tier otomatis'], ['Promo dibagikan ke semua orang', 'Pengingat WhatsApp hanya untuk yang mulai jarang datang']],
      story: STORY,
      figs: [['2.140', 2140, 'member', 'dari 0, dalam 4 bulan'], ['38%', 38, 'transaksi', 'memakai kartu member'], ['41%', 41, 'member', 'datang 2 kali atau lebih dalam 30 hari'], ['312', 312, 'voucher', 'dipakai dalam 30 hari']] },
    { k: 'mendaya', name: 'Mendaya Ramen', ind: 'Ramen · 6 outlet', meta: '6 outlet di Jakarta dan Tangerang · makan di tempat',
      photo: 'img/brands/mendaya/shop-', alt: 'Ilustrasi meja kasir Mendaya Ramen: tablet kasir dengan pop-up check-in dan HP member',
      hTitle: 'Tetap ramai di luar jam makan siang.', hText: 'Pelanggan Mendaya biasa datang saat makan malam. Voucher WhatsApp untuk pukul 14.00 sampai 17.00 membuat mereka mampir lebih awal.', hFig: ['+24%', 'transaksi di jam sepi'],
      solved: [['Data tersebar di 6 outlet', 'Satu kartu dan satu laporan untuk semua outlet'], ['Jam 14.00 sampai 17.00 selalu sepi', 'Voucher jam sepi lewat WhatsApp, transaksi naik 24%'], ['Kasir tidak kenal pelanggan', 'Check-in dari QR meja, nama dan tier muncul di kasir']],
      story: [['Minggu 1', 'QR di setiap meja', 'Pelanggan check-in saat duduk. Kasir melihat nama dan tier sebelum pesanan dibayar.'],
        ['Minggu 3', 'Satu kartu untuk 6 outlet', 'Poin dan tier sama di semua outlet. Dashboard membandingkan outlet satu per satu.'],
        ['Bulan 2', 'Mangkuk ke-8 gratis', 'Kartu stempel per mangkuk, dan telur ajitama gratis di bulan ulang tahun.'],
        ['Bulan 3', 'Voucher jam sepi', 'Member yang 45 hari tidak datang menerima voucher untuk Senin sampai Kamis, 14.00 sampai 17.00.']],
      figs: [['9.800', 9800, 'member', 'dalam 6 bulan di 6 outlet'], ['+24%', 24, 'transaksi', 'di jam 14.00 sampai 17.00'], ['31%', 31, 'member', 'makan di 2 outlet atau lebih'], ['Rp118.000', 118000, 'per kunjungan', 'rata-rata belanja member']] },
    { k: 'bobs', name: 'Bobs', ind: 'Boba milk tea · 18 outlet', meta: '18 outlet · sebelumnya kartu stempel kertas',
      photo: 'img/brands/bobs/shop-', alt: 'Ilustrasi meja kasir Bobs: POS dengan member dan web-app member di HP, kartu stempel kertas lama di meja',
      hTitle: 'Kartu kertas bisa hilang. Kartu di HP tidak.', hText: 'Pelanggan Bobs sering lupa membawa kartu stempel. Sekarang kartunya ada di HP, dan setiap stempel tercatat dari POS yang sudah dipakai.', hFig: ['71%', 'kartu kertas pindah ke HP'],
      solved: [['Kartu kertas hilang dan dipalsukan', 'Kartu di HP, setiap stempel berasal dari transaksi POS'], ['Bobs tidak kenal pelanggannya', '26.400 member terdaftar dalam 4 bulan'], ['Takut harus ganti sistem kasir', 'Tetap pakai POS yang sama, data masuk lewat webhook']],
      story: [['Minggu 1', 'Web-app member Bobs', 'Halaman member dengan logo dan warna Bobs, di domain mereka sendiri. Tanpa unduh aplikasi.'],
        ['Minggu 2', 'Webhook dari POS', 'Setiap transaksi di POS langsung masuk ke Providea Loyalty. Poin dan stempel dihitung otomatis.'],
        ['Bulan 1', 'Tukar kartu kertas', 'Kasir memindai kartu kertas lama satu kali. Stempelnya pindah ke web-app.'],
        ['Bulan 2', 'Stempel tidak bisa dipalsukan', 'Setiap stempel berasal dari transaksi POS, jadi stempel tulisan tangan tidak berlaku lagi.']],
      figs: [['26.400', 26400, 'member', 'dalam 4 bulan di 18 outlet'], ['71%', 71, 'kartu kertas', 'sudah pindah ke web-app'], ['Rp0', 0, 'cetak kartu', 'tidak ada kartu kertas baru'], ['2,3×', null, 'per bulan', 'rata-rata kunjungan per member']] }
  ];
  var SC = {
    member: { label: 'HP pelanggan', icon: 'device-mobile', text: 'Kartu, poin, stempel, voucher, dan Wallet. Terbuka di browser, tanpa unduh aplikasi.', href: 'anggota.html#/home' },
    kasir: { label: 'Kasir', icon: 'device-tablet', text: 'Check-in, tambah penjualan, pindai voucher, dan bayar pakai poin di tablet kasir.', href: 'kasir.html' },
    dash: { label: 'Dashboard', icon: 'layout-dashboard', text: 'Laporan, member, tier, voucher, segmen, dan promo WhatsApp untuk pemilik merek.', href: 'dashboard.html' }
  };
  var PEOPLE = [
    { k: 'cust', icon: 'device-mobile', title: 'Untuk pelanggan', text: 'Daftar 30 detik, langsung dapat hadiah.', points: ['Tanpa unduh aplikasi, cukup pindai QR', 'Kartu, poin, stempel, dan voucher di satu halaman', 'Kartu bisa disimpan di Apple Wallet atau Samsung Wallet'], cta: 'Coba sebagai pelanggan', href: 'anggota.html#/scan' },
    { k: 'kasir', icon: 'device-tablet', title: 'Untuk kasir', text: 'Kenali pelanggan tanpa bertanya.', points: ['Nama dan tier muncul saat pelanggan check-in', 'Voucher dipindai, kode yang sudah dipakai otomatis ditolak', 'Poin dan stempel masuk sendiri dari setiap penjualan'], cta: 'Coba sebagai kasir', href: 'kasir.html' },
    { k: 'owner', icon: 'layout-dashboard', title: 'Untuk pemilik merek', text: 'Tahu siapa yang kembali, dan kenapa.', points: ['Enam angka utama, dari member baru sampai repeat rate', 'Kirim promo ke segmen yang tepat, biaya terlihat dulu', 'Atur program, outlet, dan staf dari satu tempat'], cta: 'Coba sebagai pemilik', href: 'dashboard.html' }
  ];
  var FAQ = [
    ['Apakah pelanggan harus unduh aplikasi?', 'Tidak. Halaman member terbuka di browser HP, dan kartu bisa disimpan di Apple Wallet atau Samsung Wallet. HP lain bisa memasang halaman member ke layar utama.'],
    ['Apakah bisa dipakai dengan POS yang sudah ada?', 'Bisa. Providea Loyalty terhubung dengan POS yang sudah kamu pakai lewat integrasi yang fleksibel. Outlet tanpa POS bisa memakai aplikasi kasir di browser tablet.'],
    ['Bagaimana bila internet outlet putus?', 'Aplikasi kasir tetap mencatat penjualan. Data dikirim saat internet kembali.'],
    ['Berapa biaya kirim promo?', 'Promo WhatsApp memakai tarif WhatsApp untuk Indonesia, sekitar Rp586 per pesan sebelum PPN 11%. Email dan notifikasi Wallet termasuk paket. Biaya selalu tampil sebelum kampanye dikirim.'],
    ['Apakah poin bisa dicairkan jadi uang?', 'Tidak. Poin hanya dipakai sebagai potongan atau hadiah di merek itu sendiri, misalnya 1 poin = Rp500 saat bayar.'],
    ['Apakah data pelanggan aman?', 'Data disimpan di Jakarta. Persetujuan syarat terpisah dari izin promo, member bisa unduh atau hapus datanya, dan setiap ekspor tercatat di log audit.']
  ];

  /* ── hero slider ── */
  var SLIDES = ['promo', 'kamtono', 'mendaya', 'bobs', 'sale'];
  var SLIDE_LABEL = { promo: 'Providea Loyalty', kamtono: 'Kamtono', mendaya: 'Mendaya Ramen', bobs: 'Bobs', sale: 'Satu penjualan' };
  var hs = { i: 0, timer: null, paused: false, io: null, visible: true };
  function brandMark(k, s) { return k === 'kamtono' ? P.sjLogo(s) : '<span class="sj-logo is-flat" style="--s:' + s + 'px"><img src="img/brands/' + k + '/icon.webp" alt="" decoding="async"></span>'; }
  function slidePromo(L) {
    return '<article class="hs-slide kh-panel is-promo" aria-roledescription="slide" aria-label="' + T('{a} dari {b}', { a: 1, b: 5 }) + '">' +
      '<div class="kh-stage"><img class="kh-photo" src="img/scan-' + L + '.webp" width="2560" height="1440" alt="' + T('Ilustrasi: pelanggan menunjukkan QR member di HP, tablet kasir yang terhubung ke POS langsung mengenalinya') + '" fetchpriority="high" decoding="async"></div>' +
      '<span class="kh-pin is-tab"><b>' + T('Kasir mengenali member') + '</b></span><span class="kh-pin is-hp"><b>' + T('QR member di HP') + '</b></span>' +
      '<div class="kh-copy"><p class="kh-brand"><span class="logo-mark">' + P.mark(22) + '</span><span>Providea Loyalty</span></p>' +
      '<h1 class="kh-h1" id="lp-title">' + T('Pembeli sekali jadi pelanggan tetap.') + '</h1>' +
      '<p class="kh-sub">' + T('Kartu member, poin, dan voucher langsung di HP pelanggan. Tanpa aplikasi, tanpa kartu kertas, dan terhubung ke kasirmu.') + '</p>' +
      '<div class="lh-cta"><a class="lh-btn" href="masuk.html#demo">' + T('Coba demo gratis') + ic('arrow-right', 16) + '</a><a class="lh-btn is-glass" href="#cara-kerja">' + ic('player-play', 16) + T('Lihat cara kerja') + '</a></div></div>' +
      '<p class="kh-note">' + ic('info-circle', 13) + T('Ilustrasi. Layar di tablet dan HP diambil dari demo ini.') + '</p></article>';
  }
  function slideCase(c, n, L) {
    return '<article class="hs-slide kh-panel is-case is-' + c.k + '" aria-roledescription="slide" aria-label="' + T('{a} dari {b}', { a: n, b: 5 }) + '">' +
      '<div class="kh-stage"><img class="kh-photo" src="' + c.photo + L + '.webp" width="2400" height="1350" alt="' + T(c.alt) + '" loading="lazy" decoding="async"></div>' +
      '<div class="kh-copy"><p class="kh-brand">' + brandMark(c.k, 24) + '<span>' + T('Kisah {b} · {i}', { b: c.name, i: T(c.ind) }) + '</span></p>' +
      '<h2 class="kh-h1">' + T(c.hTitle) + '</h2><p class="kh-sub">' + T(c.hText) + '</p>' +
      '<p class="hs-fig"><b class="num">' + c.hFig[0] + '</b><span>' + T(c.hFig[1]) + '</span><small>' + T('Angka contoh') + '</small></p>' +
      '<div class="lh-cta"><a class="lh-btn" href="kisah.html?k=' + c.k + '">' + T('Baca kisah {b}', { b: c.name }) + ic('arrow-right', 16) + '</a></div></div>' +
      '<p class="kh-note">' + ic('info-circle', 13) + T('Merek fiktif. Ilustrasi, layar diambil dari demo ini.') + '</p></article>';
  }
  function slideSale(L) {
    return '<article class="hs-slide kh-panel is-sale" aria-roledescription="slide" aria-label="' + T('{a} dari {b}', { a: 5, b: 5 }) + '">' +
      '<div class="lp-tex" aria-hidden="true"><img src="img/hero.webp" alt="" loading="lazy" decoding="async"></div>' +
      '<div class="hs-trio" aria-hidden="true"><div class="hs-dash"><img src="img/sc-dash-' + L + '.webp" alt="" loading="lazy" decoding="async"></div><div class="hs-tab"><img src="img/sc-kasir-' + L + '.webp" alt="" loading="lazy" decoding="async"></div><div class="hs-hp"><img src="img/sc-member-' + L + '.webp" alt="" loading="lazy" decoding="async"></div></div>' +
      '<div class="kh-copy"><p class="kh-brand"><span class="logo-mark">' + P.mark(22) + '</span><span>' + T('Satu penjualan, tiga tempat') + '</span></p>' +
      '<h2 class="kh-h1">' + T('Kasir input sekali. Semua langsung tercatat.') + '</h2>' +
      '<p class="kh-sub">' + T('Poin masuk ke HP pelanggan, dan laporannya muncul di dashboard pemilik. Tanpa input ulang, tanpa rekap manual.') + '</p>' +
      '<div class="lh-cta"><a class="lh-btn" href="#satu-penjualan">' + T('Lihat contohnya') + ic('arrow-down', 16) + '</a><a class="lh-btn is-glass" href="kasir.html">' + ic('device-tablet', 16) + T('Coba di layar kasir') + '</a></div></div></article>';
  }
  function heroSlider() {
    var L = P.lang();
    return '<section class="lp-wrap hs" id="hs" aria-roledescription="carousel" aria-label="' + T('Sorotan Providea Loyalty') + '"><div class="hs-view" id="hsView">' +
      '<div class="hs-track" id="hsTrack" style="--i:' + hs.i + '">' + slidePromo(L) + CASES.map(function (c, n) { return slideCase(c, n + 2, L); }).join('') + slideSale(L) + '</div>' +
      '<button type="button" class="hs-arrow is-prev" data-act="hs" data-d="-1" aria-label="' + T('Slide sebelumnya') + '">' + ic('chevron-left', 20) + '</button>' +
      '<button type="button" class="hs-arrow is-next" data-act="hs" data-d="1" aria-label="' + T('Slide berikutnya') + '">' + ic('chevron-right', 20) + '</button></div>' +
      '<div class="hs-tabs" role="tablist" aria-label="' + T('Pilih slide') + '">' + SLIDES.map(function (k, n) {
        return '<button type="button" role="tab" class="hs-dot is-' + k + (n === hs.i ? ' is-active' : '') + '" aria-selected="' + (n === hs.i) + '" data-act="hsGo" data-n="' + n + '"><span>' + T(SLIDE_LABEL[k]) + '</span><i></i></button>'; }).join('') + '</div></section>';
  }
  function hsSet(n, user) {
    hs.i = (n + SLIDES.length) % SLIDES.length;
    var tr = $('hsTrack'); if (tr) tr.style.setProperty('--i', hs.i);
    document.querySelectorAll('.hs-dot').forEach(function (b, j) { var on = j === hs.i; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    document.querySelectorAll('.hs-slide').forEach(function (s, j) { s.toggleAttribute('inert', j !== hs.i); s.setAttribute('aria-hidden', j !== hs.i); });
    if (user) hsPlay();
  }
  function hsPlay() {
    clearTimeout(hs.timer); var v = $('hs'); if (!v) return;
    v.classList.remove('is-run'); void v.offsetWidth;
    if (reduce.matches || hs.paused || !hs.visible) return;
    v.classList.add('is-run');
    hs.timer = setTimeout(function () { hsSet(hs.i + 1); hsPlay(); }, 7000);
  }
  function hsInit() {
    var v = $('hs'); if (!v) return; hsSet(hs.i);
    v.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hs.paused = true; v.classList.add('is-paused'); clearTimeout(hs.timer); } });
    v.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hs.paused = false; v.classList.remove('is-paused'); hsPlay(); } });
    v.addEventListener('focusin', function () { hs.paused = true; clearTimeout(hs.timer); v.classList.add('is-paused'); });
    v.addEventListener('focusout', function () { hs.paused = false; v.classList.remove('is-paused'); hsPlay(); });
    var x0 = null;
    $('hsView').addEventListener('pointerdown', function (e) { x0 = e.clientX; }, { passive: true });
    $('hsView').addEventListener('pointerup', function (e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) hsSet(hs.i + (dx < 0 ? 1 : -1), true); }, { passive: true });
    v.querySelector('.hs-tabs').addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { hsSet(hs.i + (e.key === 'ArrowRight' ? 1 : -1), true); var b = document.querySelectorAll('.hs-dot')[hs.i]; if (b) b.focus(); e.preventDefault(); } });
    if (hs.io) hs.io.disconnect();
    if (typeof IntersectionObserver !== 'undefined') { hs.io = new IntersectionObserver(function (es) { hs.visible = es[0].isIntersecting; hsPlay(); }, { threshold: 0.3 }); hs.io.observe(v); }
    hsPlay();
  }
  P.ACT.hs = function (el) { hsSet(hs.i + (+el.dataset.d), true); };
  P.ACT.hsGo = function (el) { hsSet(+el.dataset.n, true); };

  /* ── one sale, three places (live relay) ── */
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
  function relay() {
    var r = RELAY[0];
    return '<section class="lp-wrap lh" id="satu-penjualan" aria-labelledby="rl-t"><div class="lh-panel">' +
      '<div class="lp-tex lh-tex" aria-hidden="true"><img src="img/hero.webp" alt="" loading="lazy" decoding="async"></div>' +
      '<div class="lh-top"><h2 class="lh-h1 is-h2" id="rl-t">' + T('Satu penjualan,') + ' <span>' + T('tercatat di tiga tempat.') + '</span></h2>' +
      '<div class="lh-side"><p class="lh-sub">' + T('Begini yang terjadi saat Rina membayar Rp47.000. Kasir cukup input sekali, sisanya berjalan sendiri dalam hitungan detik.') + '</p>' +
      '<div class="lh-cta"><a class="lh-btn is-glass" href="kasir.html">' + ic('device-tablet', 16) + T('Coba di layar kasir') + '</a></div></div></div>' +
      '<div class="rl" id="relay" role="group" aria-label="' + T('Contoh: satu penjualan di tiga layar') + '">' +
      '<article class="rl-card" data-k="0"><header class="rl-h">' + ic('device-tablet', 16) + '<b>' + T('Kasir') + '</b><span>' + T('input sekali') + '</span><i class="rl-n">1</i></header><div class="rl-b">' +
        '<div class="rl-who"><span class="avatar avatar-brand rl-av" id="rlAv">' + ini(r.n) + '</span><span class="rl-who-t"><b id="rlName">' + r.n + '</b><span id="rlTier">' + tag(r.t) + '</span></span></div>' +
        '<div class="rl-sale"><small>' + T('Penjualan') + '</small><b class="num" id="rlAmt">' + P.rp(r.amt) + '</b><span id="rlItem">' + T(r.item) + '</span></div>' +
        '<span class="rl-btn" id="rlBtn">' + ic('plus', 16) + T('Tambah penjualan') + '</span></div></article>' +
      '<span class="rl-link" data-k="1" aria-hidden="true"><i></i></span>' +
      '<article class="rl-card" data-k="2"><header class="rl-h">' + ic('device-mobile', 16) + '<b>' + T('HP pelanggan') + '</b><span>' + T('poin masuk') + '</span><i class="rl-n">2</i></header><div class="rl-b">' +
        '<div class="rl-mc"><div class="rl-mc-top">' + P.wordmark(26) + '<span id="rlTier2">' + tag(r.t) + '</span></div><small>' + T('Poin') + ' · <span id="rlWho">' + r.n.split(' ')[0] + '</span></small>' +
        '<div class="rl-mc-pts"><b class="num" id="rlPts">' + P.num(r.p) + '</b><span class="rl-plus" id="rlPlus">+' + r.add + ' ' + T('poin') + '</span></div></div>' +
        '<div class="rl-st" id="rlSt">' + stampsHtml(r.s) + '</div><small class="rl-note" id="rlNote">' + noteFor(r.s) + '</small>' +
        '<div class="rl-wa" id="rlWa">' + ic('brand-whatsapp', 15) + '<span id="rlWaT">' + waText(r) + '</span></div></div></article>' +
      '<span class="rl-link" data-k="3" aria-hidden="true"><i></i></span>' +
      '<article class="rl-card" data-k="4"><header class="rl-h">' + ic('layout-dashboard', 16) + '<b>' + T('Dashboard pemilik') + '</b><span>' + T('laporan bertambah') + '</span><i class="rl-n">3</i></header><div class="rl-b">' +
        '<div class="stat"><span class="stat-label">' + T('Transaksi member') + '</span><span class="stat-row"><b class="rl-big num" id="rlTx">' + TX0 + '</b><span class="unit-pill">' + T('hari ini') + '</span></span></div>' +
        '<div class="rl-chart" aria-hidden="true"><div class="rl-bars">' + barsHtml(TX0) + '</div><div class="rl-days">' + days() + '</div></div>' +
        '<div class="rl-last"><span>' + T('Terakhir') + '</span><b id="rlLast">' + T('Belum ada') + '</b></div></div></article>' +
      '</div><p class="lh-cap">' + ic('info-circle', 14) + T('Contoh dengan data demo. Coba sendiri: tambah penjualan di layar kasir, lalu buka HP pelanggan dan dashboard.') + '</p></div></section>';
  }
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
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); clearTimeout(hs.timer); } else { if (rl.visible && !reduce.matches) cycle(); hsPlay(); } });

  /* ── benefits: what keeps customers close, and what the brand gains ── */
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
  function benefits() {
    return '<section class="lp-wrap" id="manfaat" aria-labelledby="mx-t">' + head('mx-t', 'Pelanggan makin dekat. Bisnis ikut untung.', 'Empat cara Providea Loyalty mengikat pelanggan ke produkmu. Pakai satu atau semuanya, aturannya bisa diubah kapan saja.', '<a href="dashboard.html#/tier">' + go(T('Atur program di dashboard')) + '</a>') +
      '<div class="mx-grid">' + MX.map(function (m, i) { return '<a class="mx" href="' + m.href + '"' + rd(i) + '><div class="mx-well is-' + m.k + '">' + well(m.k) + '</div><div class="mx-txt"><h3>' + T(m.t) + '</h3><p>' + T(m.x) + '</p><p class="mx-win">' + ic('trending-up', 16) + '<span><b>' + T('Untuk merek:') + '</b> ' + T(m.win) + '</span></p></div>' + go(T(m.cta)) + '</a>'; }).join('') + '</div>' +
      '<div class="wins" data-reveal><header class="wins-h">' + ic('building-store', 18) + '<b>' + T('Yang didapat merekmu') + '</b></header><div class="wins-in">' +
      WINS.map(function (w) { return '<div class="win">' + ic(w[0], 22) + '<b>' + T(w[1]) + '</b><span>' + T(w[2]) + '</span></div>'; }).join('') + '</div></div></section>';
  }

  /* ── set up for your business ── */
  function personalize() {
    var L = P.lang(), cards = [['kamtono', 'img/kamtono/card-'], ['mendaya', 'img/brands/mendaya/card-'], ['bobs', 'img/brands/bobs/card-']];
    return '<section class="lp-wrap" id="solusi" aria-labelledby="id-t">' + head('id-t', 'Disesuaikan dengan cara bisnismu berjalan.', 'Tampilan, program, dan koneksi kasir diatur sesuai kebutuhan merekmu. Kamu yang memilih, kami yang memasang.') + '<div class="lp-bento">' +
      '<div class="lp-tile is-big"' + rd(0) + '><div class="lp-tex"><img src="img/hero.webp" alt="" loading="lazy" decoding="async"></div><div class="stack" style="--gap:12px">' + ic('palette', 30, 'big') + '<span class="lp-tile-t">' + T('Kartu member dengan wajah merekmu') + '</span><span class="lp-tile-x">' + T('Logo, warna, dan nama merekmu tampil di HP pelanggan. Pelanggan cukup memakai nomor HP, tanpa unduh aplikasi.') + '</span></div>' +
        '<div class="pz-cards" aria-hidden="true">' + cards.map(function (c, i) { return '<img class="pz-card is-' + c[0] + '" style="--i:' + i + '" src="' + c[1] + L + '.webp" alt="" loading="lazy" decoding="async">'; }).join('') + '</div>' +
        '<span class="pz-cap">' + T('Contoh: kartu Kamtono, Mendaya Ramen, dan Bobs') + '</span></div>' +
      '<div class="lp-tile is-wide"' + rd(1) + '>' + ic('plug-connected', 30, 'big') + '<span class="lp-tile-t">' + T('Terhubung dengan POS yang sudah dipakai') + '</span><span class="lp-tile-x">' + T('Penjualan masuk otomatis lewat integrasi yang fleksibel. Belum punya POS? Pakai aplikasi kasir di browser tablet.') + '</span>' +
        '<span class="lp-chips"><span class="is-on">' + ic('plug-connected', 14) + T('Integrasi fleksibel') + '</span><span>' + T('Aplikasi kasir di browser') + '</span><span>' + T('Satu data untuk semua outlet') + '</span></span></div>' +
      '<div class="lp-tile"' + rd(2) + '>' + ic('adjustments-horizontal', 30, 'big') + '<span class="lp-tile-t">' + T('Program sesuai jenis usaha') + '</span><span class="lp-tile-x">' + T('Stempel untuk kopi dan froyo, poin untuk restoran, tier untuk pelanggan rutin.') + '</span></div>' +
      '<div class="lp-tile"' + rd(3) + '>' + ic('brand-whatsapp', 30, 'big') + '<span class="lp-tile-t">' + T('Promo lewat saluran yang dibaca') + '</span><span class="lp-tile-x">' + T('WhatsApp, email, atau notifikasi Wallet. Biaya tiap kampanye terlihat sebelum kirim.') + '</span></div></div>' +
      '<div class="pz-cta" data-reveal><div><b>' + T('Lihat dulu, lalu putuskan.') + '</b><span>' + T('Masuk dengan akun demo dan coba semua layar. Atau minta akses untuk merekmu sendiri.') + '</span></div>' +
      '<div class="pz-btns"><a class="btn btn-primary" href="masuk.html#demo">' + ic('login-2', 18) + T('Coba akun demo') + '</a><button type="button" class="btn btn-secondary" data-act="access">' + ic('mail', 18) + T('Minta akses') + '</button></div></div></section>';
  }

  /* ── the three screens ── */
  function shot() {
    var src = 'img/sc-' + scTab + '-' + P.lang() + '.webp';
    if (scTab === 'dash') return '<div class="lsc-frame"><div class="lsc-chrome"><i></i>loyalty.providea.id/kamtono</div><img class="lsc-img" src="' + src + '" alt="' + T('Dashboard pemilik Providea Loyalty, contoh') + '" loading="lazy" decoding="async"></div>';
    return '<div class="lsc-device is-' + scTab + '"><img class="lsc-img" src="' + src + '" alt="' + (scTab === 'member' ? T('Halaman member di HP, contoh') : T('Aplikasi kasir di tablet, contoh')) + '" loading="lazy" decoding="async"></div>';
  }
  function showcase() {
    return '<section class="lp-wrap" aria-labelledby="sc-t">' + head('sc-t', 'Lihat layarnya, lalu coba sendiri.', 'Tiga layar memakai data yang sama. Semuanya bisa diklik dengan akun demo.') +
      '<div class="lp-show' + (scTouched ? ' is-static' : '') + '" id="lpShow"><div class="lp-tabs" role="tablist">' + Object.keys(SC).map(function (k) { return '<button type="button" role="tab" class="lp-tab' + (scTab === k ? ' is-active' : '') + '" aria-selected="' + (scTab === k) + '" data-act="sc" data-v="' + k + '">' + ic(SC[k].icon, 22) + '<b>' + T(SC[k].label) + '</b><span>' + T(SC[k].text) + '</span><i class="lp-tab-bar"></i></button>'; }).join('') +
      '<a id="scTry" href="' + SC[scTab].href + '">' + go(T('Coba {v}', { v: T(SC[scTab].label) })) + '</a></div><div class="lp-screen" data-reveal><div class="lsc-shot" id="scShot">' + shot() + '</div></div></div></section>';
  }

  /* ── sample stories ── */
  var csTab = 'kamtono';
  function caseLogo(k) {
    var src = { kamtono: 'img/kamtono/wordmark.svg', mendaya: 'img/brands/mendaya/word-cream.webp', bobs: 'img/brands/bobs/logo.webp' }[k];
    return '<img class="cs-logo is-' + k + '" src="' + src + '" alt="" decoding="async">';
  }
  function casePanel(c) {
    var L = P.lang();
    return '<article class="cs is-' + c.k + '" id="csPanel" role="tabpanel" aria-label="' + esc(c.name) + '"><header class="cs-h">' + caseLogo(c.k) + '<span class="cs-id"><b class="sr-only">' + esc(c.name) + '</b><small>' + T(c.meta) + '</small></span><span class="tag tag-warning">' + ic('info-circle', 13) + T('Angka contoh') + '</span></header>' +
      '<figure class="cs-photo"><picture>' + (c.photoM ? '<source media="(max-width: 860px)" srcset="' + c.photoM + L + '.webp">' : '') + '<img src="' + c.photo + L + '.webp" width="2400" height="1350" alt="' + T(c.alt) + '" loading="lazy" decoding="async"></picture><figcaption>' + ic('info-circle', 13) + T('Ilustrasi. Layar diambil dari demo ini.') + '</figcaption>' +
      '<a class="cs-more" href="kisah.html?k=' + c.k + '">' + T('Lihat detail kisah') + ic('arrow-right', 16) + '</a></figure>' +
      '<div class="cs-solved"><h3>' + ic('circle-check', 18) + T('Yang kami selesaikan') + '</h3><ol>' + c.solved.map(function (s) { return '<li><span class="cs-was">' + T(s[0]) + '</span>' + ic('arrow-right', 16) + '<b>' + T(s[1]) + '</b></li>'; }).join('') + '</ol></div>' +
      '<div class="cs-in"><ol class="cs-tl">' + c.story.map(function (s) { return '<li><span class="cs-when">' + T(s[0]) + '</span><span class="cs-rail" aria-hidden="true"></span><span class="cs-step"><b>' + T(s[1]) + '</b><span>' + T(s[2]) + '</span></span></li>'; }).join('') + '</ol>' +
      '<div class="cs-figs">' + c.figs.map(function (f) { return '<div class="cs-fig"><span class="stat-row"><b class="cs-big num"' + (f[1] != null ? ' data-count="' + f[1] + '" data-text="' + f[0] + '"' : '') + '>' + f[0] + '</b><span class="unit-pill">' + T(f[2]) + '</span></span><small>' + T(f[3]) + '</small></div>'; }).join('') + '</div></div></article>';
  }
  function caseStudy() {
    var c = CASES.filter(function (x) { return x.k === csTab; })[0];
    return '<section class="lp-wrap" id="kisah" aria-labelledby="case-t">' + head('case-t', 'Tiga bisnis, tiga cara pengunjung datang.', 'Contoh dari tiga merek fiktif: kedai froyo yang baru buka, jaringan ramen, dan kedai boba. Lihat masalahnya, apa yang dipasang, dan hasilnya.') +
      '<div class="cs-tabs" role="tablist" aria-label="' + T('Pilih kisah contoh') + '">' + CASES.map(function (x) { var on = x.k === csTab; return '<button type="button" role="tab" class="cs-tab is-' + x.k + (on ? ' is-active' : '') + '" aria-selected="' + on + '" data-act="cs" data-v="' + x.k + '">' + brandMark(x.k, 32) + '<span><b>' + esc(x.name) + '</b><small>' + T(x.ind) + '</small></span></button>'; }).join('') + '</div>' +
      '<div id="csWrap" data-reveal>' + casePanel(c) + '</div></section>';
  }
  P.ACT.cs = function (el) {
    csTab = el.dataset.v;
    document.querySelectorAll('.cs-tab').forEach(function (b) { var on = b.dataset.v === csTab; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce.matches ? 'auto' : 'smooth' });
    var w = $('csWrap'); if (w) { w.innerHTML = casePanel(CASES.filter(function (x) { return x.k === csTab; })[0]); countUp(); }
  };

  /* ── people ── */
  function people() {
    return '<section class="lp-wrap" aria-labelledby="pp-t">' + head('pp-t', 'Mudah untuk pelanggan, kasir, dan pemilik.', 'Setiap orang di tokomu mendapat layar yang dibuat untuk tugasnya.', '', true) + '<div class="lp-people">' +
      PEOPLE.map(function (p, i) { return '<a class="lp-person is-' + p.k + '" href="' + p.href + '"' + rd(i) + '><span class="lp-person-ic">' + ic(p.icon, 24) + '</span><small class="lp-person-k">' + T(p.title) + '</small><h3>' + T(p.text) + '</h3><ul class="lp-checks">' + p.points.map(function (x) { return '<li>' + ic('check', 18) + '<span>' + T(x) + '</span></li>'; }).join('') + '</ul>' + go(T(p.cta)) + '</a>'; }).join('') + '</div></section>';
  }

  /* ── FAQ: bento on desktop (every answer visible), accordion on phones ── */
  function faq() {
    return '<section class="lp-wrap" id="faq" aria-labelledby="faq-t">' + head('faq-t', 'Pertanyaan yang sering muncul', '', '', true) + '<div class="lp-faq">' +
      FAQ.map(function (f, i) { var open = openQ === i; return '<div class="lp-qa is-q' + i + (open ? ' is-open' : '') + '">' + (i === 0 || i === 3 ? '<div class="lp-tex"><img src="img/' + (i === 0 ? 'hero' : 'arc') + '.webp" alt="" loading="lazy" decoding="async"></div>' : '') +
        '<button type="button" class="lp-q" aria-expanded="' + open + '" aria-controls="faq-a' + i + '" data-act="faq" data-i="' + i + '"><span class="lp-q-t">' + T(f[0]) + '</span><span class="lp-q-more">' + T('Lihat jawaban') + '<span class="lp-q-ic">' + ic(open ? 'minus' : 'plus', 16) + '</span></span></button>' +
        '<div class="lp-a" id="faq-a' + i + '"><small>' + T(f[0]) + '</small><p>' + T(f[1]) + '</p></div></div>'; }).join('') +
      '<div class="lp-qa is-ask"><span class="lp-ask-ic">' + ic('message-question', 22) + '</span><b>' + T('Masih ada pertanyaan?') + '</b><p>' + T('Tulis pertanyaanmu. Tim kami membalas lewat email.') + '</p><button type="button" class="btn btn-secondary" data-act="ask" data-feature="faq" data-title="' + esc(T('Pertanyaan tentang Providea Loyalty')) + '">' + ic('mail', 16) + T('Tanya tim kami') + '</button></div></div></section>';
  }
  P.ACT.faq = function (el) {
    var i = +el.dataset.i; openQ = openQ === i ? -1 : i;
    document.querySelectorAll('.lp-qa:not(.is-ask)').forEach(function (q, j) { var open = j === openQ; q.classList.toggle('is-open', open); q.querySelector('.lp-q').setAttribute('aria-expanded', open); q.querySelector('.lp-q-ic').innerHTML = ic(open ? 'minus' : 'plus', 16); });
  };

  /* ── closing call ── */
  function closing() {
    var steps = [['device-mobile', 'Daftar jadi member', 'Pindai QR, isi nomor HP, dapat hadiah sambutan.', 'anggota.html#/scan'], ['device-tablet', 'Tambah penjualan di kasir', 'Lihat poin dan stempel masuk ke HP pelanggan.', 'kasir.html'], ['layout-dashboard', 'Lihat hasilnya di dashboard', 'Member baru, repeat rate, dan promo berikutnya.', 'dashboard.html']];
    return '<section class="lp-close" id="mulai" aria-labelledby="cl-t"><div class="lp-tex"><img src="img/arc.webp" alt="" loading="lazy" decoding="async"></div><div data-reveal>' +
      '<h2 id="cl-t" class="lp-close-t">' + T('Mulai kenali pelangganmu hari ini.') + '</h2>' +
      '<p class="lp-close-x">' + T('Rasakan punya bisnis yang dekat dengan pelanggannya. Coba demo dengan akun contoh, cukup 2 menit.') + '</p>' +
      '<div class="lp-close-btns"><a class="lp-close-btn" href="masuk.html#demo">' + T('Coba demo sekarang') + ic('arrow-right', 18) + '</a><button type="button" class="lp-close-btn is-glass" data-act="access">' + T('Minta akses untuk merekmu') + '</button></div></div>' +
      '<ol class="lp-steps">' + steps.map(function (s, i) { return '<li' + rd(i) + '><a href="' + s[3] + '"><span class="lp-step-n num">' + (i + 1) + '</span><span><b>' + T(s[1]) + '</b><small>' + T(s[2]) + '</small></span>' + ic(s[0], 22) + '</a></li>'; }).join('') + '</ol></section>';
  }

  function render() {
    if (flowOff) { flowOff(); flowOff = null; }
    app.innerHTML = '<div class="landing page" style="padding:0;max-width:none"><div class="lp" id="lp">' +
      heroSlider() + (window.PLFlow ? PLFlow.html() : '') + relay() + benefits() + personalize() + showcase() + caseStudy() + people() + faq() + closing() +
      '</div></div>' + P.footer();
    reveal(); hsInit(); startRelay(); countUp(); startRotate();
    if (window.PLFlow) flowOff = PLFlow.init() || null;
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
  /* until the guide module (PLAsk) is on the page, ask and access fall back to email */
  if (!P.ACT.ask) P.ACT.ask = function (el) { location.href = 'mailto:hello@providea.com?subject=' + encodeURIComponent('[Providea Loyalty] ' + (el.dataset.title || 'Pertanyaan')); };
  if (!P.ACT.access) P.ACT.access = function () { location.href = 'mailto:hello@providea.com?subject=' + encodeURIComponent('[Providea Loyalty] Minta akses'); };

  P.onLang = function () { var y = scrollY; render(); scrollTo(0, y); };
  render();
})();
