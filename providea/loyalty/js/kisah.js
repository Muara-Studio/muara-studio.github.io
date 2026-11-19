/* Providea Loyalty demo · case page (kisah.html?k=kamtono|mendaya|bobs).
   One template for the three fictional sample brands, built like a Providea case page
   (hero, what we solved, image bento, before, what was installed, a normal day now, results,
   other stories, closing panel) in the Loyalty/Influence look. Each page wears its brand colours.
   Facts come from the CASES block in hub.js; all numbers are sample numbers. */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc;
  P.setView('site');
  var app = document.getElementById('app');

  /* icons not in icons.js (Tabler outline) */
  Object.assign(window.ICONS, {
    webhook: '<path d="M4.876 13.61a4 4 0 1 0 6.124 3.39h6"/><path d="M15.066 20.502a4 4 0 1 0 1.934 -7.502c-.706 0 -1.424 .179 -2 .5l-3 -5.5"/><path d="M16 8a4 4 0 1 0 -8 0c0 1.506 .77 2.818 2 3.5l-3 5.5"/>',
    'arrow-down': '<path d="M12 5l0 14"/><path d="M18 13l-6 6"/><path d="M6 13l6 6"/>',
    'file-off': '<path d="M3 3l18 18"/><path d="M7 3h7l5 5v7m0 4a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-14"/>'
  });

  var CASES = {
    kamtono: {
      name: 'Kamtono', ind: 'Froyo · outlet pertama', icon: 'img/kamtono/icon.webp', art: 'img/kamtono/mascot.webp', glyph: 'img/kamtono/cup.svg',
      facts: [['Industri', 'Frozen yogurt'], ['Outlet', '1 outlet, Cempaka'], ['Di Providea Loyalty', '4 bulan'], ['Titik awal', '0 member']],
      title: 'Outlet pertama Kamtono: dari 0 sampai 2.140 member',
      outcome: 'Dalam 4 bulan, 41% member datang lagi 2 kali atau lebih dalam 30 hari.',
      solved: [
        ['users', 'Belum ada data pelanggan', 'Nomor HP jadi ID member. Pelanggan daftar di kasir dalam 30 detik.'],
        ['rubber-stamp', 'Pelanggan baru tidak punya alasan untuk kembali', 'Kartu stempel 10 cup. Stempel ke-10 menjadi cup kecil gratis.'],
        ['crown', 'Pelanggan tetap dilayani sama dengan pelanggan baru', 'Tier Gold dan Platinum naik otomatis dari belanja 12 bulan, dengan poin 1,25× dan 1,5×.'],
        ['brand-whatsapp', 'Pelanggan yang berhenti datang tidak terlihat', 'Member yang 30 hari tidak datang menerima satu pesan WhatsApp dengan voucher.']],
      photo: 'img/kamtono/cafe-counter-', photoAlt: 'Ilustrasi meja kasir Kamtono: tablet kasir dan HP member',
      hpAlt: 'Halaman member Kamtono di HP: kartu Gold Rina dengan 186 poin',
      tabAlt: 'Aplikasi kasir Kamtono di tablet: member Rina dengan poin, stempel, dan belanja 12 bulan',
      rules: [['10', 'cup', 'per kartu stempel'], ['30', 'hari', 'sebelum pengingat WhatsApp dikirim']],
      lead: 'Kamtono adalah bar frozen yogurt fiktif yang baru membuka outlet pertamanya di Cempaka. Satu kasir melayani semua pesanan.',
      before: 'Outlet baru, satu kasir, dan belum ada data pelanggan.',
      pains: [
        ['Pembeli tanpa nama', 'Kasir mencatat penjualan, tetapi tidak tahu siapa yang membeli. Pemilik tidak bisa melihat siapa yang datang lagi.'],
        ['Tidak ada alasan untuk kembali', 'Bar froyo lain ada di jalan yang sama. Pelanggan baru tidak punya alasan untuk memilih Kamtono lagi.'],
        ['Promo hanya lewat Instagram', 'Pemilik memasang promo di Instagram, tetapi tidak bisa mengajak pelanggan lama satu per satu.']],
      built: 'Empat hal yang dipasang dalam 4 bulan.', builtSub: 'Satu per satu, supaya kasir tetap cepat di jam ramai.',
      mods: [
        ['Minggu 1', 'QR di meja kasir', 'Kasir mengajak daftar saat pelanggan bayar. Kode masuk lewat WhatsApp, dan kartu member langsung terbuka di browser HP.', 'card'],
        ['Bulan 1', 'Kartu stempel 10 cup', 'Setiap cup menambah satu stempel. Member baru mendapat voucher sambutan: gratis topping.', 'stamps'],
        ['Bulan 2', 'Tier Gold dan Platinum', 'Gold mulai belanja Rp1.500.000 dan Platinum mulai Rp4.000.000 dalam 12 bulan. Pelanggan tetap mendapat poin 1,25× dan 1,5×.', 'tiers'],
        ['Bulan 3 dan 4', 'Pengingat WhatsApp', 'Member yang 30 hari tidak datang menerima satu pesan dengan voucher. Biaya kirim terlihat sebelum pesan dikirim.', 'wa']],
      wa: 'Halo Rina, sudah 30 hari kamu tidak mampir. Ada voucher gratis topping untuk kunjungan berikutnya, berlaku 14 hari.',
      voucher: ['Gratis topping', 'KMT-GT7-Q4M'],
      day: 'Satu hari biasa di Kamtono', daySub: 'Kasir tidak mengetik nomor HP. Poin, stempel, dan laporan terisi sendiri.',
      steps: [
        ['qrcode', 'Pelanggan menunjukkan QR', 'Kartu member terbuka di HP. Kasir memindai QR, lalu nama dan tier muncul di tablet.'],
        ['cash-register', 'Kasir menambah penjualan', 'Poin dan stempel masuk otomatis sesuai jumlah cup dan tier.'],
        ['device-mobile', 'Member melihat hasilnya', 'Poin baru tampil di HP, dan ringkasannya datang lewat WhatsApp.'],
        ['layout-dashboard', 'Pemilik membaca laporan', 'Member baru, member aktif, dan voucher yang dipakai tampil di dashboard.']],
      after: 'Hasil setelah 4 bulan',
      figs: [['2.140', 'member', 'dari 0, dalam 4 bulan'], ['38%', 'transaksi', 'memakai kartu member'], ['41%', 'member', 'datang 2 kali atau lebih dalam 30 hari'], ['312', 'voucher', 'dipakai dalam 30 hari']]
    },
    mendaya: {
      name: 'Mendaya Ramen', ind: 'Ramen · 6 outlet', icon: 'img/brands/mendaya/icon.webp', art: 'img/brands/mendaya/logo-cream.webp', glyph: 'img/brands/mendaya/glyph.svg',
      facts: [['Industri', 'Ramen, makan di tempat'], ['Outlet', '6 outlet di Jakarta dan Tangerang'], ['Di Providea Loyalty', '6 bulan'], ['Titik awal', 'Data tersebar di 6 outlet']],
      title: 'Tetap ramai di luar jam makan siang.',
      outcome: 'Transaksi jam 14.00 sampai 17.00 naik 24% setelah voucher jam sepi dikirim lewat WhatsApp.',
      solved: [
        ['building-store', 'Data pelanggan tersebar di 6 outlet', 'Satu kartu member untuk semua outlet. Poin dan tier sama di mana pun pelanggan makan.'],
        ['qrcode', 'Kasir tidak tahu siapa yang sedang makan', 'Pelanggan check-in dari QR di meja. Nama dan tier muncul di tablet sebelum pesanan dibayar.'],
        ['bowl-chopsticks', 'Pelanggan setia datang 1 sampai 2 kali sebulan', 'Kartu stempel per mangkuk. Mangkuk ke-8 gratis, dan telur ajitama gratis di bulan ulang tahun.'],
        ['clock', 'Jam 14.00 sampai 17.00 selalu sepi', 'Member yang 45 hari tidak datang menerima voucher jam sepi lewat WhatsApp.']],
      photo: 'img/brands/mendaya/shop-', photoAlt: 'Ilustrasi meja kasir Mendaya Ramen: tablet kasir dengan pop-up check-in dan HP member',
      hpAlt: 'Halaman member Mendaya Ramen di HP: kartu Gold Rina dengan 186 poin',
      tabAlt: 'Aplikasi kasir Mendaya Ramen di tablet: pop-up check-in Rina dari QR meja',
      rules: [['6', 'outlet', 'satu kartu member'], ['45', 'hari', 'sebelum voucher jam sepi dikirim']],
      lead: 'Mendaya Ramen adalah jaringan ramen fiktif dengan 6 outlet di Jakarta dan Tangerang. Hampir semua pelanggan makan di tempat.',
      before: 'Pelanggan setia ada, tetapi tersebar di 6 outlet.',
      pains: [
        ['Catatan per outlet', 'Setiap outlet menyimpan catatannya sendiri. Pelanggan yang makan di dua outlet terlihat seperti dua orang.'],
        ['Kasir tidak mengenal pelanggan', 'Pelanggan tetap dilayani seperti pelanggan baru. Tidak ada hadiah untuk kunjungan berikutnya.'],
        ['Sepi setiap sore', 'Antara 14.00 dan 17.00 banyak meja kosong, padahal dapur dan staf tetap siap.']],
      built: 'Empat hal yang dipasang dalam 3 bulan.', builtSub: 'Dimulai dari QR di meja, karena pelanggan duduk dulu sebelum memesan.',
      mods: [
        ['Minggu 1', 'QR di setiap meja', 'Pelanggan check-in saat duduk. Kasir melihat nama dan tier sebelum pesanan dibayar.', 'tab'],
        ['Minggu 3', 'Satu kartu untuk 6 outlet', 'Poin dan tier sama di semua outlet. Dashboard membandingkan outlet satu per satu.', 'card'],
        ['Bulan 2', 'Mangkuk ke-8 gratis', 'Kartu stempel per mangkuk, dan telur ajitama gratis di bulan ulang tahun.', 'stamps'],
        ['Bulan 3', 'Voucher jam sepi', 'Member yang 45 hari tidak datang menerima voucher untuk Senin sampai Kamis, 14.00 sampai 17.00.', 'wa']],
      tabPos: '100% 21%', tabZoom: '230%',
      wa: 'Halo Rina, sudah 45 hari kamu tidak mampir. Ada voucher Rp15.000 untuk makan Senin sampai Kamis, 14.00 sampai 17.00, di semua outlet Mendaya.',
      voucher: ['Voucher jam sepi Rp15.000', 'MDY-JS4-K8P'],
      day: 'Satu hari biasa di Mendaya Ramen', daySub: 'Pelanggan check-in sebelum memesan, jadi kasir sudah tahu siapa yang datang.',
      steps: [
        ['qrcode', 'Check-in dari QR meja', 'Pelanggan memindai QR saat duduk. Nama dan tier muncul di tablet kasir.'],
        ['receipt', 'Bayar di outlet mana pun', 'Poin dan stempel mangkuk masuk ke kartu yang sama di 6 outlet.'],
        ['clock', 'Jam sepi terisi', 'Member yang memegang voucher datang Senin sampai Kamis, 14.00 sampai 17.00.'],
        ['chart-bar', 'Pemilik membandingkan outlet', 'Dashboard menampilkan member, kunjungan, dan voucher per outlet.']],
      after: 'Hasil setelah 6 bulan',
      figs: [['9.800', 'member', 'dalam 6 bulan di 6 outlet'], ['+24%', 'transaksi', 'di jam 14.00 sampai 17.00'], ['31%', 'member', 'makan di 2 outlet atau lebih'], ['Rp118.000', 'per kunjungan', 'rata-rata belanja member']]
    },
    bobs: {
      name: 'Bobs', ind: 'Boba milk tea · 18 outlet', icon: 'img/brands/bobs/icon.webp', art: 'img/brands/bobs/logo.webp', glyph: 'img/brands/bobs/glyph.svg',
      facts: [['Industri', 'Boba milk tea'], ['Outlet', '18 outlet'], ['Di Providea Loyalty', '4 bulan'], ['Titik awal', 'Kartu stempel kertas']],
      title: 'Bobs: kartu stempel kertas pindah ke web-app member',
      outcome: '71% kartu kertas sudah pindah ke web-app, dan setiap stempel kini berasal dari transaksi POS.',
      solved: [
        ['file-off', 'Kartu stempel kertas sering hilang', 'Stempel tersimpan di web-app member Bobs. Pelanggan cukup membuka HP.'],
        ['ban', 'Stempel kertas mudah dipalsukan', 'Setiap stempel berasal dari transaksi POS. Stempel tulisan tangan tidak berlaku lagi.'],
        ['users', 'Bobs tidak tahu siapa pelanggannya', 'Setiap member terdaftar dengan nomor HP, dan promo bisa dikirim lewat WhatsApp.'],
        ['plug-connected', 'Kasir di 18 outlet tidak ingin ganti POS', 'Penjualan masuk lewat webhook dari POS yang sudah dipakai. Kasir bekerja seperti biasa.']],
      photo: 'img/brands/bobs/shop-', photoAlt: 'Ilustrasi meja kasir Bobs: POS dengan member dan web-app member di HP, kartu stempel kertas lama di meja',
      hpAlt: 'Web-app member Bobs di HP: kartu Gold Rina dengan 186 poin',
      tabAlt: 'POS Bobs di tablet: pesanan dengan member Rina, poin dan stempel yang didapat',
      rules: [['18', 'outlet', 'satu web-app member'], ['1×', 'pindai', 'untuk memindahkan kartu kertas lama']],
      lead: 'Bobs adalah merek boba milk tea fiktif dengan 18 outlet. Sebelumnya, setiap pelanggan membawa kartu stempel kertas.',
      before: 'Kartu kertas di 18 outlet, tanpa satu pun nama pelanggan.',
      pains: [
        ['Kartu hilang, stempel hilang', 'Pelanggan lupa membawa kartu, atau kartunya basah dan sobek. Stempel yang sudah terkumpul ikut hilang.'],
        ['Stempel mudah ditiru', 'Stempel karet dan tulisan tangan mudah dipalsukan. Outlet tidak bisa membedakan stempel asli dan palsu.'],
        ['Tidak ada data pelanggan', 'Bobs terus mencetak kartu baru, tetapi tidak tahu siapa pelanggannya dan tidak bisa menghubungi mereka.']],
      built: 'Empat hal yang dipasang dalam 2 bulan.', builtSub: 'Kasir tetap memakai POS yang sama. Providea Loyalty terhubung dengan POS yang sudah dipakai (integrasi fleksibel).',
      mods: [
        ['Minggu 1', 'Web-app member Bobs', 'Halaman member dengan logo dan warna Bobs, di domain mereka sendiri. Tanpa unduh aplikasi.', 'card'],
        ['Minggu 2', 'Webhook dari POS', 'Setiap transaksi di POS langsung masuk ke Providea Loyalty. Kami sudah bekerja sama dengan penyedia POS tersebut untuk koneksi ini.', 'tab'],
        ['Bulan 1', 'Tukar kartu kertas', 'Kasir memindai kartu kertas lama satu kali. Stempelnya pindah ke web-app.', 'paper'],
        ['Bulan 2', 'Stempel tidak bisa dipalsukan', 'Setiap stempel berasal dari transaksi POS, jadi stempel tulisan tangan tidak berlaku lagi.', 'log']],
      tabPos: '100% 92%', tabZoom: '175%',
      day: 'Satu hari biasa di Bobs', daySub: 'Kasir memakai POS yang sama. Poin dan stempel dihitung di belakang layar.',
      steps: [
        ['qrcode', 'Pelanggan menunjukkan QR', 'Kasir memindai QR dari web-app Bobs dan menambahkan member ke pesanan di POS.'],
        ['webhook', 'POS mengirim transaksi', 'Setelah pembayaran, webhook mengirim transaksi ke Providea Loyalty.'],
        ['rubber-stamp', 'Stempel masuk sendiri', 'Poin dan stempel tampil di web-app member. Tidak ada stempel tulisan tangan.'],
        ['layout-dashboard', 'Bobs mengenal pelanggannya', 'Pemilik melihat member, kunjungan, dan outlet favorit di dashboard, lalu mengirim promo.']],
      after: 'Hasil setelah 4 bulan',
      figs: [['26.400', 'member', 'dalam 4 bulan di 18 outlet'], ['71%', 'kartu kertas', 'sudah pindah ke web-app'], ['Rp0', 'cetak kartu', 'tidak ada kartu kertas baru'], ['2,3×', 'per bulan', 'rata-rata kunjungan per member']]
    }
  };
  var ORDER = ['kamtono', 'mendaya', 'bobs'];
  var k = new URLSearchParams(location.search).get('k');
  if (!CASES[k]) k = 'kamtono';
  var C = CASES[k];

  function L() { return P.lang(); }
  function hp() { return 'img/kisah/' + k + '-hp-' + L() + '.webp'; }
  function tab() { return 'img/kisah/' + k + '-tab-' + L() + '.webp'; }
  function sample(cls) { return '<span class="tag tag-warning ' + (cls || '') + '">' + ic('info-circle', 13) + T('Angka contoh') + '</span>'; }
  function label(t) { return '<p class="ks-label">' + T(t) + '</p>'; }
  function brandIcon(s, src) { return '<span class="ks-ico" style="--s:' + s + 'px"><img src="' + (src || C.icon) + '" alt="" decoding="async"></span>'; }
  function glyph(src, s) { return '<span class="ks-g" style="-webkit-mask-image:url(' + src + ');mask-image:url(' + src + ');--s:' + s + 'px" aria-hidden="true"></span>'; }

  /* ── hero: brand panel, logo art, title, outcome, facts row ── */
  function hero() {
    return '<section class="ks-wrap" aria-labelledby="ks-t"><nav class="ks-crumb" aria-label="' + T('Lokasi halaman') + '"><a href="index.html">' + T('Beranda') + '</a>' + ic('chevron-right', 14) + '<span>' + T('Kisah pelanggan') + '</span>' + ic('chevron-right', 14) + '<span aria-current="page">' + esc(C.name) + '</span></nav>' +
      '<div class="ks-hero"><div class="ks-hero-top"><div class="ks-hero-copy">' +
      '<span class="ks-brand">' + brandIcon(36) + '<span><b>' + esc(C.name) + '</b><small>' + T(C.ind) + '</small></span></span>' +
      '<h1 id="ks-t" class="ks-h1">' + T(C.title) + '</h1><p class="ks-outcome">' + T(C.outcome) + '</p>' +
      '<span class="ks-hero-tags"><span class="ks-chip">' + ic('info-circle', 14) + T('Kisah contoh dengan merek fiktif') + '</span><span class="ks-chip">' + ic('chart-bar', 14) + T('Angka contoh') + '</span></span></div>' +
      '<div class="ks-art" aria-hidden="true"><img src="' + C.art + '" alt="" decoding="async"></div></div>' +
      '<dl class="ks-facts">' + C.facts.map(function (f) { return '<div><dt>' + T(f[0]) + '</dt><dd>' + T(f[1]) + '</dd></div>'; }).join('') + '</dl></div></section>';
  }

  /* ── highlight: what we solved (problem → what changed) ── */
  function solved() {
    return '<section class="ks-wrap" aria-labelledby="ks-solved"><div class="ks-solved"><header class="ks-solved-h"><h2 id="ks-solved" class="ks-h3">' + ic('circle-check', 22) + T('Yang kami selesaikan') + '</h2><span class="ks-solved-n">' + T('{n} masalah, {n} perubahan', { n: C.solved.length }) + '</span></header>' +
      '<ol class="ks-solved-in">' + C.solved.map(function (s, i) {
        return '<li><span class="ks-solved-ic">' + ic(s[0], 22) + '</span><div class="ks-solved-tx"><small>' + T('Masalah') + ' ' + (i + 1) + '</small><b>' + T(s[1]) + '</b>' +
          '<span class="ks-solved-to">' + ic('arrow-down', 16) + '</span><small class="is-now">' + T('Yang berubah') + '</small><p>' + T(s[2]) + '</p></div></li>';
      }).join('') + '</ol></div></section>';
  }

  /* ── image bento: shop photo, member phone, cashier/POS, two rule cards ── */
  function device(kind, alt) {
    return '<div class="ks-dev is-' + kind + '"><img src="' + (kind === 'hp' ? hp() : tab()) + '" alt="' + T(alt) + '" loading="lazy" decoding="async"></div>';
  }
  function bento() {
    return '<section class="ks-wrap" aria-label="' + T('Gambar dan layar') + '"><div class="ks-bento">' +
      '<figure class="ks-b is-photo"><img src="' + C.photo + L() + '.webp" width="2400" height="1350" alt="' + T(C.photoAlt) + '" loading="lazy" decoding="async"><figcaption>' + ic('info-circle', 13) + T('Ilustrasi. Layar diambil dari demo ini.') + '</figcaption></figure>' +
      '<figure class="ks-b is-hp">' + device('hp', C.hpAlt) + '<figcaption>' + T('HP member') + '</figcaption></figure>' +
      '<figure class="ks-b is-tab">' + device('tab', C.tabAlt) + '<figcaption>' + T(k === 'bobs' ? 'POS yang sudah dipakai' : 'Aplikasi kasir') + '</figcaption></figure>' +
      C.rules.map(function (r, i) { return '<figure class="ks-b is-rule is-r' + i + '"><small>' + T('Aturan program') + '</small><span class="ks-rule"><b class="num">' + r[0] + '</b><span>' + T(r[1]) + '</span></span><figcaption>' + T(r[2]) + '</figcaption></figure>'; }).join('') +
      '</div></section>';
  }

  /* ── before ── */
  function before() {
    return '<section class="ks-wrap ks-split" aria-labelledby="ks-before"><div class="ks-side">' + label('Sebelum') + '<p class="ks-lead">' + T(C.lead) + '</p></div>' +
      '<div class="ks-main-col"><h2 id="ks-before" class="ks-h2">' + T(C.before) + '</h2><ol class="ks-pains">' + C.pains.map(function (p, i) {
        return '<li><span class="ks-n num">0' + (i + 1) + '</span><div><h3>' + T(p[0]) + '</h3><p>' + T(p[1]) + '</p></div></li>'; }).join('') + '</ol></div></section>';
  }

  /* ── what was installed: module cards with a small visual each ── */
  function stamps() {
    var of = k === 'mendaya' ? 8 : 10, on = k === 'mendaya' ? 5 : 7, g = C.glyph, s = '';
    for (var i = 1; i <= of; i++) s += '<i class="' + (i <= on ? 'is-on' : '') + (i === of ? ' is-free' : '') + '">' + (i === of ? '<span>' + T('Gratis') + '</span>' : glyph(g, of === 8 ? 26 : 22)) + '</i>';
    return '<div class="ks-stamps is-' + of + '"><div class="ks-st-h"><span>' + T('Kartu stempel Rina') + '</span><span class="tag tag-outline num">' + on + ' / ' + of + '</span></div><div class="ks-st">' + s + '</div>' +
      '<small>' + T(k === 'mendaya' ? '3 mangkuk lagi, mangkuk ke-8 gratis' : '3 cup lagi, cup kecil gratis') + '</small></div>';
  }
  function tiers() {
    return '<div class="ks-tiers">' + [['silver', 0, '1×'], ['gold', 1500000, '1,25×'], ['platinum', 4000000, '1,5×']].map(function (t) {
      return '<div class="ks-tr' + (t[0] === 'gold' ? ' is-me' : '') + '">' + P.tierTag(P.tierById(t[0]), true) + '<span class="num">' + (t[1] ? T('mulai {r}', { r: P.rp(t[1]) }) : T('Saat daftar')) + '</span><b class="num">' + t[2] + '</b></div>'; }).join('') +
      '<div class="ks-bar" aria-hidden="true"><i style="width:43.6%"></i></div><small class="num">' + T('Rina: {r} lagi ke Platinum', { r: P.rp(2258000) }) + '</small></div>';
  }
  function wa() {
    return '<div class="ks-wa"><span class="ks-wa-h">' + brandIcon(24) + '<b>' + esc(C.name) + '</b>' + ic('brand-whatsapp', 16) + '</span><p>' + T(C.wa) + '</p>' +
      '<div class="ks-vc"><span><b>' + T(C.voucher[0]) + '</b><small class="num">' + C.voucher[1] + '</small></span>' + ic('qrcode', 30) + '</div><span class="ks-wa-t num">14.05</span></div>';
  }
  function paper() {
    var a = '', b = '';
    for (var i = 1; i <= 10; i++) { a += '<i class="' + (i <= 6 ? 'is-on' : '') + '">' + (i <= 6 ? ic('rubber-stamp', 16) : '') + '</i>'; b += '<i class="' + (i <= 6 ? 'is-on' : '') + '">' + (i <= 6 ? glyph(C.glyph, 17) : '') + '</i>'; }
    return '<div class="ks-paper"><div class="ks-pp is-old"><small>' + T('Kartu kertas lama') + '</small><div class="ks-pp-st">' + a + '</div></div>' +
      '<span class="ks-pp-go">' + ic('scan', 18) + '<small>' + T('Pindai 1×') + '</small></span>' +
      '<div class="ks-pp is-new"><small>' + T('Web-app Bobs') + '</small><div class="ks-pp-st">' + b + '</div><b class="num">6 / 10</b></div></div>';
  }
  function log() {
    var rows = [['14.02', 'Pesanan C-001291', '+2 stempel', 1], ['13.47', 'Pesanan C-001288', '+1 stempel', 1], ['13.20', 'Pesanan C-001285', '+1 stempel', 1], ['', 'Stempel tulisan tangan', 'Tidak berlaku', 0]];
    return '<div class="ks-log"><div class="ks-log-h">' + ic('webhook', 16) + T('Masuk dari POS lewat webhook') + '</div>' + rows.map(function (r) {
      return '<div class="ks-log-r' + (r[3] ? '' : ' is-bad') + '"><span class="num">' + r[0] + '</span><b>' + T(r[1]) + '</b><span class="ks-log-v">' + ic(r[3] ? 'check' : 'ban', 14) + T(r[2]) + '</span></div>'; }).join('') + '</div>';
  }
  function visual(v) {
    if (v === 'card') return '<div class="ks-vis is-card">' + device('hp', C.hpAlt) + '</div>';
    if (v === 'tab') return '<div class="ks-vis is-tab"><div class="ks-crop" role="img" aria-label="' + T(C.tabAlt) + '" style="background-image:url(' + tab() + ');background-size:' + C.tabZoom + ';background-position:' + C.tabPos + '"></div></div>';
    var f = { stamps: stamps, tiers: tiers, wa: wa, paper: paper, log: log }[v];
    return '<div class="ks-vis is-' + v + '">' + f() + '</div>';
  }
  function built() {
    return '<section class="ks-wrap" aria-labelledby="ks-built"><div class="ks-head">' + label('Yang dipasang') + '<h2 id="ks-built" class="ks-h2">' + T(C.built) + '</h2><p class="ks-sub">' + T(C.builtSub) + '</p></div>' +
      '<ol class="ks-mods">' + C.mods.map(function (m, i) {
        return '<li class="ks-mod">' + visual(m[3]) + '<div class="ks-mod-tx"><span class="ks-when"><span class="num">0' + (i + 1) + '</span>' + T(m[0]) + '</span><h3>' + T(m[1]) + '</h3><p>' + T(m[2]) + '</p></div></li>'; }).join('') + '</ol></section>';
  }

  /* ── now: a normal day, four steps in order ── */
  function day() {
    return '<section class="ks-wrap" aria-labelledby="ks-day"><div class="ks-now"><div class="ks-head">' + label('Sekarang') + '<h2 id="ks-day" class="ks-h2">' + T(C.day) + '</h2><p class="ks-sub">' + T(C.daySub) + '</p></div>' +
      '<ol class="ks-flow" id="ksFlow">' + C.steps.map(function (s, i) {
        return '<li style="--i:' + i + '"><span class="ks-node">' + ic(s[0], 20) + '</span><span class="ks-flow-n num">0' + (i + 1) + '</span><h3>' + T(s[1]) + '</h3><p>' + T(s[2]) + '</p></li>'; }).join('') + '</ol></div></section>';
  }

  /* ── results: four sample figures ── */
  function results() {
    return '<section class="ks-wrap" aria-labelledby="ks-res"><div class="ks-head ks-head-row"><div>' + label('Hasil') + '<h2 id="ks-res" class="ks-h2">' + T(C.after) + '</h2></div><div class="ks-res-note">' + sample() + '<p class="ks-sub">' + T('Merek, orang, dan angka di halaman ini fiktif. Angkanya menunjukkan apa yang diukur di dashboard.') + '</p></div></div>' +
      '<div class="ks-figs">' + C.figs.map(function (f) {
        return '<div class="ks-fig"><span class="ks-fig-v"><b class="num">' + f[0] + '</b><span class="unit-pill">' + T(f[1]) + '</span></span><p>' + T(f[2]) + '</p></div>'; }).join('') + '</div></section>';
  }

  /* ── other stories ── */
  function others() {
    return '<section class="ks-wrap" aria-labelledby="ks-more"><div class="ks-head ks-head-row"><div>' + label('Kisah lain') + '<h2 id="ks-more" class="ks-h2">' + T('Dua merek lain, dua masalah lain.') + '</h2></div></div>' +
      '<div class="ks-more">' + ORDER.filter(function (x) { return x !== k; }).map(function (x) {
        var o = CASES[x];
        return '<a class="ks-card is-' + x + '" href="kisah.html?k=' + x + '"><span class="ks-card-img"><img src="' + o.photo + L() + '.webp" alt="" loading="lazy" decoding="async"></span>' +
          '<span class="ks-card-tx"><span class="ks-brand is-sm">' + brandIcon(32, o.icon) + '<span><b>' + esc(o.name) + '</b><small>' + T(o.ind) + '</small></span></span>' +
          '<span class="ks-card-t">' + T(o.title) + '</span><span class="ks-go">' + T('Baca kisahnya') + ic('arrow-right', 16) + '</span></span></a>';
      }).join('') + '</div></section>';
  }

  /* ── closing panel ── */
  function closing() {
    return '<section class="ks-close" aria-labelledby="ks-cl"><div class="ks-close-tex" aria-hidden="true"><img src="img/arc.webp" alt="" loading="lazy"></div>' +
      '<div class="ks-close-tx"><h2 id="ks-cl" class="ks-close-t">' + T('Program seperti ini bisa jalan di outlet kamu.') + '</h2>' +
      '<p>' + T('Coba demonya dulu. HP member, kasir, dan dashboard memakai data contoh yang sama.') + '</p></div>' +
      '<div class="ks-close-act"><a class="ks-btn is-main" href="masuk.html#demo">' + T('Coba demo') + ic('arrow-right', 18) + '</a>' +
      '<button type="button" class="ks-btn" data-act="access" data-feature="kisah-' + k + '">' + ic('mail', 18) + T('Minta akses') + '</button>' +
      (window.PLAsk ? '' : '<small>' + T('Minta akses membuka email ke hello@providea.com. Email siap dikirim dari aplikasi email kamu.') + '</small>') + '</div></section>';
  }

  /* "Minta akses": the PLAsk module handles it when present; otherwise compose an email */
  if (!P.ACT.access) P.ACT.access = function (el) {
    if (window.PLAsk && typeof window.PLAsk.access === 'function') { window.PLAsk.access({ feature: el.getAttribute('data-feature') || 'kisah' }); return; }
    var body = T('Halo Providea, saya membaca kisah contoh {b} dan ingin mencoba Providea Loyalty untuk merek saya.', { b: C.name }) + '\n\n' + T('Nama merek:') + '\n' + T('Jumlah outlet:') + '\n' + T('POS yang dipakai:') + '\n';
    location.href = 'mailto:hello@providea.com?subject=' + encodeURIComponent(T('Minta akses Providea Loyalty')) + '&body=' + encodeURIComponent(body);
  };

  /* the flow fills step by step when it scrolls into view (shows the order of the day) */
  function flow() {
    var el = document.getElementById('ksFlow');
    if (!el || typeof IntersectionObserver === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add('is-anim');
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add('is-on'); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
  }

  function render() {
    document.title = C.name + ' · ' + T('Kisah contoh') + ' · Providea Loyalty';
    app.innerHTML = '<div class="ks-page">' + hero() + solved() + bento() + before() + built() + day() + results() + others() + closing() + '</div>' + P.footer();
    flow();
  }

  P.onLang = function () { var y = scrollY; render(); scrollTo(0, y); };
  document.body.classList.add('ks', 'is-' + k);
  render();
  /* guide.js (deferred) brings PLAsk, whose "Minta akses" form explains the email itself */
  document.addEventListener('DOMContentLoaded', function () { if (window.PLAsk) { var n = document.querySelector('.ks-close-act small'); if (n) n.remove(); } });
})();
