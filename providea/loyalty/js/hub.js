/* Providea Loyalty demo · start page: the client case and the switcher into the three views. */
(function () {
  'use strict';
  var P = PL, T = P.T;
  P.setView('hub');
  var app = document.getElementById('app');
  function li(s) { return '<li>' + ic('check', 16) + '<span>' + T(s) + '</span></li>'; }
  function card(href, icon, title, sub, items) {
    return '<a class="hub-card" href="' + href + '"><span class="hub-card-icon">' + ic(icon, 22) + '</span><span class="stack" style="--gap:4px"><span class="t-h3">' + T(title) + '</span><span class="t-small sec">' + T(sub) + '</span></span><ul>' + items.map(li).join('') + '</ul><span class="hub-go">' + T('Buka') + ic('arrow-right', 16) + '</span></a>';
  }
  function render() {
    app.innerHTML = '<div class="hub"><section class="hub-hero"><div><span class="tag tag-brand">' + T('Demo klik · data contoh') + '</span><h1 class="mt-12">' + T('Kartu member dan poin, tanpa unduh aplikasi') + '</h1>' +
      '<p class="hub-lede">' + T('Providea Loyalty untuk merek dengan 1 sampai 20 outlet. Member daftar di kasir dengan nomor HP atau email, dapat poin atau stempel setiap belanja, naik tier otomatis, dan menyimpan kartu di dompet HP. Jalan bersama POS apa pun, mulai dari iSeller.') + '</p></div>' +
      '<div class="hub-case"><span class="row">' + P.sjLogo(36) + '<span class="stack" style="--gap:0"><span class="t-h3">Sejuk Froyo Bar</span><span class="t-small sec">' + T('Merek contoh · outlet pertama di Cempaka') + '</span></span></span>' +
      '<p class="sec">' + T('Bar frozen yogurt yang baru membuka outlet pertamanya. Kasir memakai tablet POS. Pelanggan jadi member di kasir, poin dan stempel masuk setiap belanja, voucher dicek di kasir, dan kartu member ada di HP.') + '</p>' +
      '<div class="demo-note">' + ic('info-circle', 14) + '<span>' + T('Sejuk Froyo Bar, orang, dan semua angka di demo ini fiktif.') + '</span></div></div></section>' +
      '<section class="hub-cards">' +
      card('anggota.html#/scan', 'device-mobile', 'HP member', 'Halaman member milik merek, di browser HP', ['Pindai QR di meja kasir, daftar pakai nomor HP atau email', 'Kode lewat WhatsApp', 'Kartu dengan QR, poin, stempel, dan tier', 'Voucher sekali pakai, tukar poin, bayar pakai poin', 'Kartu di Apple Wallet dan Samsung Wallet', 'Kotak promo dan data pribadi']) +
      card('kasir.html', 'device-tablet', 'Kasir', 'Tablet kasir, aplikasi web atau di dalam POS', ['Pop-up check-in: "Rina · Gold"', 'Cari member dengan nomor HP, email, atau QR', 'Tambah penjualan, poin dan stempel masuk', 'Pakai voucher dengan pindai atau kode', 'Bayar pakai poin dan batalkan penjualan', 'Alur yang sama di POS seperti iSeller']) +
      card('dashboard.html', 'layout-dashboard', 'Dashboard pemilik', 'Untuk pemilik merek, di laptop', ['Laporan: join rate, member aktif, repeat rate, poin beredar', 'Daftar dan profil member', 'Tier, aturan poin, dan bayar pakai poin', 'Voucher dan 5 segmen siap pakai', 'Kampanye WhatsApp, email, dan Wallet dengan perkiraan biaya', 'Outlet, peran staf, dan log audit']) + '</section>' +
      '<section class="stack" style="--gap:12px"><h2 class="t-h2">' + T('Coba urutan ini') + '</h2><div class="hub-path">' +
      [['Daftar di HP', 'Buka HP member, pindai QR, isi nomor, ketuk notifikasi WhatsApp.', 'anggota.html#/scan'], ['Check-in dan belanja', 'Buka Kasir. Pop-up Rina muncul. Tambah penjualan Rp47.000.', 'kasir.html'], ['Pakai voucher', 'Di Kasir, pakai voucher Rina. Coba kode yang sama lagi: ditolak.', 'kasir.html'], ['Lihat hasilnya', 'Buka Dashboard. Penjualan, member baru, dan poin ikut berubah.', 'dashboard.html']].map(function (s, i) {
        return '<a class="hub-step" href="' + s[2] + '"><b class="num">' + (i + 1) + '</b><span class="stack" style="--gap:2px"><span class="t-strong">' + T(s[0]) + '</span><span class="t-small sec">' + T(s[1]) + '</span></span></a>';
      }).join('') + '</div><p class="t-small muted">' + T('Klik di demo tersimpan di browser ini saja. Tombol ulang di kanan atas mengembalikan data contoh awal.') + '</p></section></div>';
  }
  P.onLang = render;
  render();
})();
