/* Providea Loyalty demo · pricing (20 Nov 2026). Not public until Thomas approves (listed in .deployignore).
   window.PLPrice = { section(), page(), init(root) }
   - section(): landing block <section id="harga"> (toggle, Gratis / Pro / Grup, Enterprise line, PPN note, link to harga.html)
   - page():    full pricing page content for harga.html (plans + Enterprise, add-ons, comparison table, billing FAQ, closing panel)
   - init(root): wires the Bulanan | Tahunan toggle (remembered in localStorage 'pl-billing'), the phone plan switcher and the FAQ.
                 Returns destroy(). Calling init again on the same root replaces the earlier wiring.
   Prices are per brand per month, before PPN 11%. Yearly = 2 months free. WhatsApp: the WhatsApp (Meta) rate + 10% handling. */
(function () {
  'use strict';
  var P = window.PL, T = P.T;
  if (window.ICONS) Object.assign(window.ICONS, {
    headset: '<path d="M4 14v-3a8 8 0 1 1 16 0v3"/><path d="M18 19c0 1.657 -2.686 3 -6 3"/><path d="M4 14a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2v-3"/><path d="M15 14a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2v-3"/>',
    'file-invoice': '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M9 7l1 0"/><path d="M9 13l6 0"/><path d="M13 17l2 0"/>'
  });

  var KEY = 'pl-billing';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var bill = 'm', show = 'pro';
  try { if (localStorage.getItem(KEY) === 'y') bill = 'y'; } catch (e) {}

  /* ── plans (m = per month billed monthly, y = per month billed yearly) ── */
  var PLANS = [
    { k: 'gratis', name: 'Gratis', fit: 'Untuk outlet pertama yang mau mulai mengenal pelanggannya.', m: 0, y: 0, outlets: 1,
      keys: ['1 outlet, sampai 300 member', 'Kartu stempel atau poin', 'Halaman member dengan QR, tanpa aplikasi', 'Aplikasi kasir di browser', '6 angka utama untuk 30 hari terakhir', 'Email promo sampai 500 per bulan'],
      cta: { t: 'Mulai gratis', href: 'masuk.html#demo' }, cap: 'Mulai dengan akun demo dulu.',
      not: [['Tier dan voucher', 'Pro'], ['Kartu Apple Wallet dan Samsung Wallet', 'Pro'], ['Kampanye WhatsApp', 'Pro']],
      note: ['arrow-up-right', 'Naik ke Pro saat member lewat 300 atau outlet kedua dibuka.'] },
    { k: 'pro', name: 'Pro', badge: 'Paling dipilih', fit: 'Untuk merek dengan 1 sampai 3 outlet yang ingin pelanggan kembali lebih sering.', m: 990000, y: 825000, outlets: 3,
      keys: ['Sampai 3 outlet dan 5.000 member', 'Tier dengan nama sendiri, dan voucher', 'Kartu di Apple Wallet dan Samsung Wallet', 'Kampanye WhatsApp ke 5 segmen, biaya terlihat sebelum kirim', 'Terhubung dengan POS yang sudah dipakai (integrasi fleksibel)', 'Tampilan merekmu sendiri, tanpa badge'],
      cta: { t: 'Coba Pro 14 hari', act: 'access' }, cap: 'Semua fitur Pro, tanpa kartu kredit.',
      not: [['Laporan perbandingan outlet', 'Grup'], ['Webhook dan API', 'Grup']],
      note: ['building-store', 'Outlet tambahan {p} per bulan.', 250000] },
    { k: 'grup', name: 'Grup', fit: 'Untuk jaringan 4 sampai 10 outlet dengan tim di setiap outlet.', m: 2490000, y: 2075000, outlets: 10,
      keys: ['Sampai 10 outlet dan 25.000 member', 'Semua fitur Pro', 'Laporan perbandingan outlet', 'Peran staf per outlet dan ekspor log audit', 'Webhook, API, dan domain sendiri untuk halaman member', 'Onboarding dipandu dan dukungan prioritas'],
      cta: { t: 'Hubungi tim', act: 'access' }, cap: 'Kami bantu hitung kebutuhan outletmu.',
      not: [['Beberapa merek dalam satu ID member', 'Enterprise']],
      note: ['building-store', 'Outlet tambahan {p} per bulan, sampai 20 outlet.', 200000] }
  ];
  var ENT = { k: 'enterprise', name: 'Enterprise', fit: 'Untuk jaringan lebih dari 20 outlet, atau grup dengan beberapa merek.',
    keys: ['Semua fitur Grup', 'Lebih dari 20 outlet', 'Beberapa merek dalam satu ID member', 'Kontrak dan SLA sesuai kebutuhan'],
    cta: { t: 'Hubungi kami', act: 'access' }, cap: 'Kontrak tertulis dengan SLA.',
    know: ['Perlu diketahui', 'Satu ID member bisa dipakai di semua merek dalam grupmu.'],
    note: ['message-circle', 'Ceritakan jumlah outlet dan merekmu. Kami siapkan penawarannya.'] };

  /* ── add-ons ── */
  var ADDONS = [
    { ic: 'brand-whatsapp', t: 'Pesan WhatsApp', fig: '+10%', unit: 'di atas tarif WhatsApp',
      x: 'Tarif resmi WhatsApp (Meta) ditambah 10% biaya layanan. Dibayar sesuai pemakaian, dan biaya tampil sebelum kampanye dikirim.',
      rows: [['Pesan promo', 'sekitar {p} per pesan', 645], ['Notifikasi', 'sekitar {p} per pesan', 392]], foot: 'Contoh tarif untuk Indonesia, sebelum PPN. Di Pro, Grup, dan Enterprise.' },
    { ic: 'building-store', t: 'Outlet tambahan', fig: 250000, unit: 'per outlet / bulan',
      x: 'Tambah outlet kapan saja. Outlet baru langsung memakai kartu, aturan poin, dan laporan yang sama.',
      rows: [['Pro', '{p} per outlet', 250000], ['Grup', '{p} per outlet', 200000]], foot: 'Lebih dari 20 outlet memakai Enterprise.' },
    { ic: 'users-group', t: 'Tambahan member', fig: 150000, unit: 'per 5.000 member / bulan',
      x: 'Untuk Pro dan Grup. Tambah saat member mendekati batas paket, tanpa perlu naik paket.',
      rows: [['Pro', '5.000 member termasuk'], ['Grup', '25.000 member termasuk']], foot: 'Member lama tidak pernah dihapus karena batas paket.' },
    { ic: 'rubber-stamp', t: 'Paket setup', fig: 2500000, unit: 'sekali bayar',
      x: 'Kami bantu menyusun program loyalitas, mencetak standee QR untuk meja kasir, dan memberi briefing staf di outlet.',
      rows: [['Desain program', 'stempel, poin, tier'], ['Standee QR', 'untuk setiap outlet']], foot: 'Bisa dipilih di semua paket.' }
  ];

  /* ── comparison (1 = included, 0 = not included, string = text) ── */
  var R = function (n) { return P.rp(n); };
  var CMP = [
    { g: 'Member dan kartu', ic: 'id', rows: [
      ['Outlet termasuk', '1', '3', '10', 'Lebih dari 20'],
      ['Outlet tambahan per bulan', 0, R(250000), R(200000), 'Sesuai kontrak'],
      ['Jumlah member', '300', '5.000', '25.000', 'Sesuai kontrak'],
      ['Tambahan 5.000 member per bulan', 0, R(150000), R(150000), 'Sesuai kontrak'],
      ['Halaman member dengan QR, tanpa aplikasi', 1, 1, 1, 1],
      ['Kartu di Apple Wallet dan Samsung Wallet', 0, 1, 1, 1],
      ['Tampilan merekmu sendiri, tanpa badge', 'Dengan badge Providea', 1, 1, 1],
      ['Domain sendiri untuk halaman member', 0, 0, 1, 1],
      ['Beberapa merek dalam satu ID member', 0, 0, 0, 1]] },
    { g: 'Poin dan hadiah', ic: 'gift', rows: [
      ['Kartu stempel atau poin', 'Pilih salah satu', 'Keduanya', 'Keduanya', 'Keduanya'],
      ['Bayar pakai poin di kasir', 1, 1, 1, 1],
      ['Tier dengan nama sendiri', 0, 1, 1, 1],
      ['Voucher sekali pakai', 0, 1, 1, 1],
      ['Hadiah sambutan untuk member baru', 0, 1, 1, 1]] },
    { g: 'Kasir dan POS', ic: 'device-tablet', rows: [
      ['Aplikasi kasir di browser tablet', 1, 1, 1, 1],
      ['Tetap mencatat saat internet putus', 1, 1, 1, 1],
      ['Terhubung dengan POS yang sudah dipakai (integrasi fleksibel)', 0, 1, 1, 1],
      ['Webhook dan API', 0, 0, 1, 1]] },
    { g: 'Promo dan pesan', ic: 'speakerphone', rows: [
      ['Email promo per bulan', '500', '10.000', '50.000', 'Sesuai kontrak'],
      ['Kampanye WhatsApp, biaya terlihat sebelum kirim', 0, 1, 1, 1],
      ['Biaya pesan WhatsApp', 0, 'Tarif WhatsApp + 10%', 'Tarif WhatsApp + 10%', 'Sesuai kontrak'],
      ['Notifikasi ke kartu Wallet', 0, 1, 1, 1],
      ['Segmen pelanggan', 0, '5 segmen', '5 segmen per outlet', 'Sesuai kebutuhan']] },
    { g: 'Laporan', ic: 'chart-bar', rows: [
      ['6 angka utama', '30 hari terakhir', 'Semua periode', 'Semua periode', 'Semua periode'],
      ['Laporan kampanye: biaya dan hasil', 0, 1, 1, 1],
      ['Laporan perbandingan outlet', 0, 0, 1, 1],
      ['Ekspor data member dan transaksi', 1, 1, 1, 1]] },
    { g: 'Tim dan keamanan', ic: 'shield-lock', rows: [
      ['Akun pemilik dan kasir', 1, 1, 1, 1],
      ['Peran staf per outlet', 0, 0, 1, 1],
      ['Log audit', 1, 1, 1, 1],
      ['Ekspor log audit', 0, 0, 1, 1],
      ['Data disimpan di Jakarta', 1, 1, 1, 1],
      ['Kontrak dan SLA sesuai kebutuhan', 0, 0, 0, 1]] },
    { g: 'Dukungan', ic: 'headset', rows: [
      ['Panduan di aplikasi dan bantuan lewat email', 1, 1, 1, 1],
      ['Onboarding dipandu', 0, 0, 1, 1],
      ['Dukungan prioritas', 0, 0, 1, 1],
      ['Paket setup: desain program, standee QR, briefing staf', R(2500000), R(2500000), R(2500000), 'Sesuai kontrak']] }
  ];
  var COLS = ['gratis', 'pro', 'grup', 'enterprise'];

  /* ── billing FAQ ── */
  var FAQ = [
    ['Bagaimana cara bayar?', 'Bayar lewat transfer bank, virtual account, atau kartu kredit. Tagihan dikirim ke email pemilik akun di awal setiap periode.'],
    ['Bisa ganti paket kapan saja?', 'Bisa. Naik paket berlaku hari itu juga, dan kamu hanya membayar selisih untuk sisa periode. Turun paket berlaku di periode tagihan berikutnya.'],
    ['Bagaimana uji coba Pro 14 hari?', 'Semua fitur Pro terbuka selama 14 hari, tanpa kartu kredit. Setelah itu, pilih Pro atau kembali ke Gratis. Member di atas 300 tetap tersimpan, tapi pendaftaran baru ditahan sampai kamu naik paket.'],
    ['Berapa biaya outlet tambahan?', 'Pro sudah termasuk 3 outlet dan Grup 10 outlet. Outlet berikutnya Rp250.000 per bulan di Pro dan Rp200.000 per bulan di Grup. Untuk lebih dari 20 outlet, hubungi kami soal Enterprise.'],
    ['Apakah harga sudah termasuk PPN?', 'Belum. Semua harga belum termasuk PPN 11%. Faktur dan faktur pajak dikirim ke email setelah pembayaran, sesuai data NPWP merekmu.'],
    ['Bisa berhenti kapan saja?', 'Bisa, dari dashboard dan tanpa biaya. Paket tetap aktif sampai akhir periode yang sudah dibayar. Sebelum berhenti, ekspor data member dan transaksi dalam format CSV. Data itu milik merekmu.']
  ];
  var openQ = 0;

  /* ── helpers ── */
  function both(m, y) { return '<span data-only="m">' + m + '</span><span data-only="y">' + y + '</span>'; }
  function per(p) { return bill === 'y' ? p.y : p.m; }
  function amt(p, cls) { return '<b class="' + (cls || 'hg-amt') + ' num" data-m="' + p.m + '" data-y="' + p.y + '">' + P.rp(per(p)) + '</b>'; }
  function round100(n) { return Math.round(n / 100) * 100; }
  function cta(p, cls) {
    var c = 'btn ' + (cls || '') + (p.k === 'pro' ? ' hg-btn-pro' : ' btn-secondary');
    if (p.cta.href) return '<a class="' + c + '" href="' + p.cta.href + '"><span class="btn-label">' + T(p.cta.t) + '</span>' + ic('arrow-right', 16) + '</a>';
    return '<button type="button" class="' + c + '" data-act="' + p.cta.act + '" data-feature="harga-' + p.k + '"><span class="btn-label">' + T(p.cta.t) + '</span></button>';
  }
  function toggle(id) {
    return '<div class="hg-toggle" role="radiogroup" aria-label="' + T('Periode tagihan') + '"' + (id ? ' id="' + id + '"' : '') + '><span class="hg-thumb" aria-hidden="true"></span>' +
      '<button type="button" role="radio" data-hg-bill="m" aria-checked="' + (bill === 'm') + '" tabindex="' + (bill === 'm' ? 0 : -1) + '">' + T('Bulanan') + '</button>' +
      '<button type="button" role="radio" data-hg-bill="y" aria-checked="' + (bill === 'y') + '" tabindex="' + (bill === 'y' ? 0 : -1) + '">' + T('Tahunan') + '<span class="hg-save">' + T('2 bulan gratis') + '</span></button></div>';
  }

  /* price block: amount + unit, billing line, value line */
  function price(p) {
    if (p.k === 'enterprise') return '<div class="hg-price"><div class="hg-amt-row"><b class="hg-amt is-text">' + T('Hubungi kami') + '</b></div><p class="hg-bill">' + T('Harga sesuai jumlah outlet dan merek.') + '</p></div>';
    if (!p.m) return '<div class="hg-price"><div class="hg-amt-row"><b class="hg-amt num">Rp0</b><span class="hg-unit">' + T('selamanya') + '</span></div>' +
      '<p class="hg-bill">' + T('Tanpa kartu kredit. Tanpa batas waktu.') + '</p><p class="hg-value">' + ic('building-store', 16) + '<span>' + T('1 outlet termasuk.') + '</span></p></div>';
    var o = p.outlets;
    var val = p.k === 'pro'
      ? both(T('{n} outlet termasuk. {p} per outlet, sekitar {d} per hari.', { n: o, p: P.rp(p.m / o), d: P.rp(round100(p.m / o / 30)) }), T('{n} outlet termasuk. {p} per outlet, sekitar {d} per hari.', { n: o, p: P.rp(p.y / o), d: P.rp(round100(p.y / o / 30)) }))
      : both(T('{n} outlet termasuk. {p} per outlet.', { n: o, p: P.rp(p.m / o) }), T('{n} outlet termasuk. {p} per outlet.', { n: o, p: P.rp(p.y / o) }));
    return '<div class="hg-price"><div class="hg-amt-row">' + amt(p) + '<span class="hg-unit">' + T('/ bulan per merek') + '</span></div>' +
      '<p class="hg-bill">' + both(T('Ditagih tiap bulan. Berhenti kapan saja.'), T('{t} ditagih per tahun. Hemat {s}.', { t: '<span class="num">' + P.rp(p.y * 12) + '</span>', s: '<span class="num">' + P.rp((p.m - p.y) * 12) + '</span>' })) + '</p>' +
      '<p class="hg-value">' + ic(p.k === 'pro' ? 'sparkles' : 'building-store', 16) + '<span>' + val + '</span></p></div>';
  }

  function card(p, full) {
    var pro = p.k === 'pro';
    var not = full && p.not ? '<div class="hg-not"><p class="hg-not-h">' + T('Belum termasuk') + '</p><ul>' + p.not.map(function (n) {
      return '<li>' + ic('minus', 16) + '<span>' + T(n[0]) + ' <span class="hg-at">' + T('Ada di {p}', { p: T(n[1]) }) + '</span></span></li>'; }).join('') + '</ul></div>' :
      full && p.know ? '<div class="hg-not"><p class="hg-not-h">' + T(p.know[0]) + '</p><p class="hg-know">' + T(p.know[1]) + '</p></div>' : (full ? '<div class="hg-not"></div>' : '');
    var note = p.note ? '<p class="hg-note">' + ic(p.note[0], 16) + '<span>' + T(p.note[1], p.note[2] ? { p: '<span class="num">' + P.rp(p.note[2]) + '</span>' } : null) + '</span></p>' : '<p class="hg-note"></p>';
    return '<article class="hg-card is-' + p.k + '" aria-labelledby="hg-n-' + p.k + (full ? '-f' : '') + '">' +
      (pro ? '<div class="hg-tex" aria-hidden="true"><img src="img/hero.webp" alt="" loading="lazy" decoding="async"></div>' : '') +
      '<div class="hg-card-head"><h3 class="hg-name" id="hg-n-' + p.k + (full ? '-f' : '') + '">' + T(p.name) + '</h3>' + (p.badge ? '<span class="hg-badge">' + ic('star', 14) + T(p.badge) + '</span>' : '') + '</div>' +
      '<div class="hg-card-body"><p class="hg-fit">' + T(p.fit) + '</p>' + price(p) +
      '<div class="hg-cta">' + cta(p, 'btn-block') + '<p class="hg-cap">' + T(p.cap) + '</p></div>' +
      '<ul class="hg-list">' + p.keys.map(function (k, i) { return '<li' + (p.k === 'grup' && i === 1 || p.k === 'enterprise' && i === 0 ? ' class="is-all"' : '') + '>' + ic('check', 18) + '<span>' + T(k) + '</span></li>'; }).join('') + '</ul>' +
      not + note + '</div></article>';
  }

  /* ── landing section ── */
  function section() {
    return '<section class="lp-wrap hg" id="harga" data-bill="' + bill + '" aria-labelledby="hg-t">' +
      '<div class="lp-head is-center"><h2 id="hg-t" class="lp-h2">' + T('Mulai gratis. Naik paket saat pelanggan bertambah.') + '</h2>' +
      '<p class="lp-sub">' + T('Harga per merek per bulan, tanpa biaya per transaksi. Pilih bulanan, atau tahunan dengan 2 bulan gratis.') + '</p>' + toggle() + '</div>' +
      '<div class="hg-plans" data-reveal>' + PLANS.map(function (p) { return card(p, false); }).join('') + '</div>' +
      '<div class="hg-ent"><span class="hg-ent-ic">' + ic('building-store', 22) + '</span><p><b>' + T('Enterprise') + '</b><span>' + T('Lebih dari 20 outlet, atau beberapa merek dalam satu ID member. Kontrak dan SLA sesuai kebutuhan.') + '</span></p>' +
      '<button type="button" class="btn btn-secondary" data-act="access" data-feature="harga-enterprise">' + T('Hubungi kami') + '</button></div>' +
      '<div class="hg-foot"><p>' + ic('info-circle', 16) + '<span>' + T('Harga belum termasuk PPN 11%. Pesan WhatsApp dibayar sesuai pemakaian.') + '</span></p>' +
      '<a class="lp-go" href="harga.html">' + T('Lihat detail harga') + ic('arrow-right', 16) + '</a></div></section>';
  }

  /* ── full page ── */
  function addons() {
    return '<section class="lp-wrap hg-add" id="tambahan" aria-labelledby="hg-add-t"><div class="lp-head lp-head-row"><div><h2 id="hg-add-t" class="lp-h2">' + T('Tambahan sesuai kebutuhan') + '</h2>' +
      '<p class="lp-sub">' + T('Bayar hanya untuk yang dipakai. Semua harga sebelum PPN 11%.') + '</p></div></div><div class="hg-addons">' +
      ADDONS.map(function (a) {
        var fig = typeof a.fig === 'number' ? P.rp(a.fig) : a.fig;
        return '<article class="npanel hg-addon"><div class="npanel-head"><h3 class="npanel-title">' + ic(a.ic, 16) + T(a.t) + '</h3></div><div class="npanel-body">' +
          '<div class="stat-row"><b class="hg-add-fig num">' + fig + '</b><span class="unit-pill">' + T(a.unit) + '</span></div><p class="hg-add-x">' + T(a.x) + '</p>' +
          '<dl class="hg-add-rows">' + a.rows.map(function (r) { return '<div><dt>' + T(r[0]) + '</dt><dd class="num">' + T(r[1], r[2] ? { p: P.rp(r[2]) } : null) + '</dd></div>'; }).join('') + '</dl>' +
          '<p class="hg-add-foot">' + T(a.foot) + '</p></div></article>';
      }).join('') + '</div></section>';
  }
  function cell(v, k) {
    if (v === 1) return '<td data-p="' + k + '"><span class="hg-yes">' + ic('check', 18) + '<span class="sr-only">' + T('Termasuk') + '</span></span></td>';
    if (v === 0) return '<td data-p="' + k + '"><span class="hg-no">' + ic('minus', 16) + '<span class="sr-only">' + T('Tidak termasuk') + '</span></span></td>';
    return '<td data-p="' + k + '"><span class="hg-txt num">' + T(v) + '</span></td>';
  }
  function thead() {
    var all = PLANS.concat([ENT]);
    return '<thead><tr><th scope="col" class="hg-th-label"><span class="hg-th-hint">' + T('Harga per bulan, sebelum PPN') + '</span></th>' + all.map(function (p) {
      var pr = p.k === 'enterprise' ? '<span class="hg-th-price">' + T('Sesuai kebutuhan') + '</span>' : !p.m ? '<span class="hg-th-price"><b class="num">Rp0</b></span>' :
        '<span class="hg-th-price">' + amt(p, 'hg-amt-sm') + '<span>' + T('/ bulan') + '</span></span>';
      return '<th scope="col" data-p="' + p.k + '"><span class="hg-th-name">' + T(p.name) + (p.badge ? '<span class="hg-dot" aria-hidden="true"></span>' : '') + '</span>' + pr + cta(p, 'btn-sm') + '</th>';
    }).join('') + '</tr></thead>';
  }
  function compare() {
    var all = PLANS.concat([ENT]);
    return '<section class="lp-wrap hg-cmp" id="bandingkan" aria-labelledby="hg-cmp-t"><div class="lp-head lp-head-row"><div><h2 id="hg-cmp-t" class="lp-h2">' + T('Bandingkan semua fitur') + '</h2>' +
      '<p class="lp-sub">' + T('Semua paket memakai data pelanggan yang sama. Pindah paket tidak menghapus apa pun.') + '</p></div>' + toggle() + '</div>' +
      '<div class="hg-switch" role="tablist" aria-label="' + T('Pilih paket untuk dibandingkan') + '">' + all.map(function (p) {
        var on = p.k === show;
        return '<button type="button" role="tab" data-hg-show="' + p.k + '" aria-selected="' + on + '" aria-controls="hgTable" tabindex="' + (on ? 0 : -1) + '"><b>' + T(p.name) + '</b><small class="num">' +
          (p.k === 'enterprise' ? T('Hubungi kami') : !p.m ? 'Rp0' : amt(p, 'hg-amt-xs')) + '</small></button>';
      }).join('') + '</div>' +
      '<table class="hg-table" id="hgTable" data-show="' + show + '"><caption class="sr-only">' + T('Perbandingan fitur paket Providea Loyalty') + '</caption>' +
      '<colgroup><col class="hg-col-label">' + all.map(function (p) { return '<col class="hg-col is-' + p.k + '">'; }).join('') + '</colgroup>' + thead() +
      CMP.map(function (g) {
        return '<tbody><tr class="hg-grp"><th scope="colgroup" colspan="5"><span class="hg-grp-t">' + ic(g.ic, 18) + T(g.g) + '</span></th></tr>' + g.rows.map(function (r) {
          return '<tr><th scope="row">' + T(r[0]) + '</th>' + COLS.map(function (k, i) { return cell(r[i + 1], k); }).join('') + '</tr>';
        }).join('') + '</tbody>';
      }).join('') + '</table>' +
      '<p class="hg-cmp-note">' + ic('info-circle', 16) + '<span>' + T('Harga belum termasuk PPN 11%. Contoh tarif WhatsApp: pesan promo sekitar {a} dan notifikasi sekitar {b} per pesan, sebelum PPN.', { a: P.rp(645), b: P.rp(392) }) + '</span></p></section>';
  }
  function faqHtml() {
    return '<section class="lp-wrap hg-faq" id="tagihan" aria-labelledby="hg-faq-t"><div class="hg-faq-side"><h2 id="hg-faq-t" class="lp-h2">' + T('Soal tagihan') + '</h2>' +
      '<p class="lp-sub">' + T('Hal yang biasa ditanyakan sebelum memilih paket.') + '</p>' +
      '<button type="button" class="btn btn-secondary" data-act="ask" data-feature="harga-faq" data-title="' + P.esc(T('Pertanyaan soal harga Providea Loyalty')) + '">' + ic('mail', 16) + T('Tanya tim kami') + '</button></div>' +
      '<div class="hg-qs">' + FAQ.map(function (f, i) {
        var open = i === openQ;
        return '<div class="hg-qa' + (open ? ' is-open' : '') + '"><h3><button type="button" class="hg-q" data-hg-q="' + i + '" aria-expanded="' + open + '" aria-controls="hg-a' + i + '"><span>' + T(f[0]) + '</span><span class="hg-q-ic">' + ic('plus', 16) + '</span></button></h3>' +
          '<div class="hg-a" id="hg-a' + i + '" role="region"' + (open ? '' : ' hidden') + '><p>' + T(f[1]) + '</p></div></div>';
      }).join('') + '</div></section>';
  }
  function closing() {
    var steps = [['login-2', 'Coba akun demo', 'Kasir, HP member, dan dashboard dengan data contoh.', 'masuk.html#demo'], ['building-store', 'Pakai Gratis di outlet pertama', '300 member, kartu stempel atau poin.', 'index.html#cara-kerja'], ['trending-up', 'Naik ke Pro saat ramai', 'Coba 14 hari tanpa kartu kredit.', '#paket']];
    return '<section class="lp-close hg-close" aria-labelledby="hg-cl-t"><div class="lp-tex"><img src="img/arc.webp" alt="" loading="lazy" decoding="async"></div><div>' +
      '<h2 id="hg-cl-t" class="lp-close-t">' + T('Coba dulu, putuskan nanti.') + '</h2>' +
      '<p class="lp-close-x">' + T('Akun demo berisi data contoh, cukup 2 menit. Paket Gratis bisa dipakai tanpa batas waktu untuk outlet pertama.') + '</p>' +
      '<div class="lp-close-btns"><a class="lp-close-btn" href="masuk.html#demo">' + T('Mulai gratis') + ic('arrow-right', 18) + '</a><button type="button" class="lp-close-btn is-glass" data-act="access" data-feature="harga-penutup">' + T('Minta akses untuk merekmu') + '</button></div></div>' +
      '<ol class="lp-steps">' + steps.map(function (s, i) { return '<li><a href="' + s[3] + '"><span class="lp-step-n num">' + (i + 1) + '</span><span><b>' + T(s[1]) + '</b><small>' + T(s[2]) + '</small></span>' + ic(s[0], 22) + '</a></li>'; }).join('') + '</ol></section>';
  }
  function page() {
    return '<div class="lp hg-page hg" data-bill="' + bill + '">' +
      '<section class="lp-wrap hg-hero" id="paket" aria-labelledby="hg-h1"><nav class="hg-crumb" aria-label="' + T('Lokasi halaman') + '"><a href="index.html">' + T('Beranda') + '</a><span aria-hidden="true">/</span><span aria-current="page">' + T('Harga') + '</span></nav>' +
      '<div class="lp-head is-center"><h1 id="hg-h1" class="lp-h2 hg-h1">' + T('Paket yang pas untuk jumlah outletmu.') + '</h1>' +
      '<p class="lp-sub">' + T('Mulai gratis di outlet pertama. Naik paket saat member dan outlet bertambah. Harga per merek per bulan, tanpa biaya per transaksi.') + '</p>' + toggle() + '</div>' +
      '<div class="hg-plans is-full">' + PLANS.concat([ENT]).map(function (p) { return card(p, true); }).join('') + '</div>' +
      '<div class="hg-foot"><p>' + ic('info-circle', 16) + '<span>' + T('Harga belum termasuk PPN 11%. Pesan WhatsApp dibayar sesuai pemakaian.') + '</span></p>' +
      '<a class="lp-go" href="#bandingkan">' + T('Bandingkan semua fitur') + ic('arrow-down', 16) + '</a></div></section>' +
      addons() + compare() + faqHtml() + closing() + '</div>';
  }

  /* ── behaviour ── */
  function tween(el, from, to) {
    if (reduce.matches || from === to) { el.textContent = P.rp(to); return; }
    var t0 = performance.now(), ms = 420;
    if (el._hgRaf) cancelAnimationFrame(el._hgRaf);
    (function step(now) {
      var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = P.rp(k < 1 ? Math.round((from + (to - from) * e) / 1000) * 1000 : to);
      if (k < 1) el._hgRaf = requestAnimationFrame(step); else el._hgRaf = 0;
    })(t0);
  }
  function place(tg) {
    var b = tg.querySelector('[aria-checked="true"]'), th = tg.querySelector('.hg-thumb');
    if (!b || !th || !b.offsetWidth) return;
    th.style.setProperty('--x', b.offsetLeft + 'px'); th.style.setProperty('--w', b.offsetWidth + 'px');
    if (!tg.classList.contains('is-ready')) { void th.offsetWidth; tg.classList.add('is-ready'); } /* first placement: no slide in from the left */
  }

  function init(root) {
    root = root || document;
    if (root._hgOff) root._hgOff();
    var scopes = function () { var s = [].slice.call(root.querySelectorAll('.hg')); if (root.classList && root.classList.contains('hg')) s.unshift(root); return s; };
    var toggles = function () { return [].slice.call(root.querySelectorAll('.hg-toggle')); };

    function setBill(v, focusEl) {
      if (v !== 'm' && v !== 'y') return;
      var prev = bill; bill = v;
      try { localStorage.setItem(KEY, v); } catch (e) {}
      scopes().forEach(function (s) { s.setAttribute('data-bill', v); });
      toggles().forEach(function (tg) {
        tg.querySelectorAll('[data-hg-bill]').forEach(function (b) { var on = b.getAttribute('data-hg-bill') === v; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
        place(tg);
      });
      if (prev !== v) root.querySelectorAll('[data-m][data-y]').forEach(function (el) { tween(el, +el.getAttribute('data-' + prev), +el.getAttribute('data-' + v)); });
      if (focusEl) focusEl.focus();
    }
    function setShow(k, focus) {
      show = k;
      var t = root.querySelector('.hg-table'); if (t) t.setAttribute('data-show', k);
      root.querySelectorAll('[data-hg-show]').forEach(function (b) { var on = b.getAttribute('data-hg-show') === k; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    }
    function onClick(e) {
      var b = e.target.closest('[data-hg-bill]');
      if (b && root.contains(b)) { setBill(b.getAttribute('data-hg-bill')); return; }
      var s = e.target.closest('[data-hg-show]');
      if (s && root.contains(s)) { setShow(s.getAttribute('data-hg-show')); return; }
      var q = e.target.closest('[data-hg-q]');
      if (q && root.contains(q)) {
        var i = +q.getAttribute('data-hg-q'); openQ = openQ === i ? -1 : i;
        root.querySelectorAll('.hg-qa').forEach(function (qa, j) {
          var open = j === openQ, a = qa.querySelector('.hg-a');
          qa.classList.toggle('is-open', open); qa.querySelector('.hg-q').setAttribute('aria-expanded', open);
          if (open) a.removeAttribute('hidden'); else a.setAttribute('hidden', '');
        });
      }
    }
    function onKey(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return;
      var b = e.target.closest('[data-hg-bill]');
      if (b) { e.preventDefault(); var v = e.key === 'ArrowLeft' || e.key === 'Home' ? 'm' : 'y'; setBill(v, b.parentNode.querySelector('[data-hg-bill="' + v + '"]')); return; }
      var s = e.target.closest('[data-hg-show]');
      if (s) {
        e.preventDefault(); var all = COLS, i = all.indexOf(s.getAttribute('data-hg-show'));
        i = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length;
        setShow(all[i], true);
      }
    }
    var raf = 0;
    function onResize() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { toggles().forEach(place); }); }

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    addEventListener('resize', onResize);
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    toggles().forEach(function (tg) { place(tg); if (ro) ro.observe(tg); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

    function destroy() {
      root.removeEventListener('click', onClick); root.removeEventListener('keydown', onKey); removeEventListener('resize', onResize);
      if (ro) ro.disconnect(); cancelAnimationFrame(raf); root._hgOff = null;
    }
    root._hgOff = destroy;
    return destroy;
  }

  window.PLPrice = { section: section, page: page, init: init, PLANS: PLANS };
})();
