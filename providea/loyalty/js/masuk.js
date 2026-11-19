/* Providea Loyalty demo · demo sign-in page (masuk.html).
   Path a: sample demo account (credentials shown, nothing is sent) → pick a view → the view opens with a tour offer (?tur=1).
   Path b: request access for your own brand → PLAsk.access() (composes an email, no backend). */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc;
  P.setView('site');
  var app = document.getElementById('app');
  var ACC = { email: 'pemilik@kamtono.demo', pass: 'demo-kamtono' };
  var signedIn = false;
  try { signedIn = sessionStorage.getItem('pl-demo-in') === '1'; } catch (e) {}

  var ROLES = [
    { href: 'dashboard.html?tur=1', icon: 'layout-dashboard', name: 'Pemilik merek', open: 'Buka dashboard', desc: 'Laporan, member, dan program loyalitas.',
      tries: ['Lihat ringkasan angka contoh', 'Ubah syarat tier dan nilai poin', 'Susun kampanye WhatsApp dan lihat biayanya sebelum kirim'] },
    { href: 'kasir.html?tur=1', icon: 'device-tablet', name: 'Kasir', open: 'Buka kasir', desc: 'Tablet kasir di Outlet Cempaka.',
      tries: ['Cari Rina, lalu tambah penjualan', 'Pakai voucher atau bayar pakai poin', 'Lihat alur yang sama di POS'] },
    { href: 'anggota.html?tur=1#/scan', icon: 'device-mobile', name: 'Pelanggan', open: 'Buka HP member', desc: 'Halaman member di HP, tanpa unduh aplikasi.',
      tries: ['Pindai QR dan daftar pakai nomor HP', 'Masukkan kode dari WhatsApp', 'Lihat kartu, poin, dan stempel'] }
  ];

  function feed() {
    var rows = P.S.log.filter(function (l) { return l.kind === 'sale' && !l.void && P.member(l.memberId); }).sort(function (a, b) { return b.at - a.at; }).slice(0, 4);
    return '<div class="ms-feed"><div class="ms-feed-head"><span>' + T('Penjualan member terakhir') + '</span><span class="tag tag-warning tag-sm">' + T('Angka contoh') + '</span></div>' +
      rows.map(function (l) {
        var m = P.member(l.memberId);
        return '<div class="ms-feed-row">' + P.avatar(m, 32) + '<span class="ms-feed-main"><span class="row" style="--gap:6px"><span class="t-strong ellip">' + esc(m.name) + '</span>' + P.tierTag(P.tierOf(m), true) + '</span>' +
          '<span class="t-small sec">' + P.ago(l.at) + ' · ' + T('Outlet Cempaka') + '</span></span>' +
          '<span class="ms-feed-side"><b class="num">' + P.rp(l.amount) + '</b><span class="t-small sec num">' + T('{n} poin', { n: '+' + l.points }) + '</span></span></div>';
      }).join('') + '</div>';
  }

  function aside() {
    return '<aside class="ms-aside" aria-label="' + T('Tentang akun demo') + '"><div class="ms-aside-top">' + P.sjLogo(28) + '<span>' + T('Kamtono · Outlet Cempaka') + '</span></div>' +
      '<div class="ms-aside-mid"><h2 class="ms-aside-title">' + T('Satu akun demo, tiga layar.') + '</h2>' +
      '<p class="ms-aside-sub">' + T('Pemilik membuka dashboard, kasir memakai tablet, pelanggan memakai HP. Data contoh yang sama muncul di ketiganya.') + '</p>' + feed() + '</div>' +
      '<p class="ms-aside-foot">' + T('Merek Kamtono, orang, dan angka di demo ini fiktif.') + '</p></aside>';
  }

  function field(id, label, value) {
    return '<div class="field"><label class="field-label" for="' + id + '">' + label + '</label><div class="input"><input id="' + id + '" type="text" value="' + esc(value) + '" readonly spellcheck="false" autocomplete="off"></div></div>';
  }
  function loginStep() {
    return '<div class="ms-step ms-head"><a class="back-link" href="index.html">' + ic('chevron-left', 16) + T('Kembali ke beranda') + '</a>' +
      '<h1 class="ms-title" tabindex="-1">' + T('Masuk') + '</h1><p class="ms-sub">' + T('Coba Providea Loyalty dengan akun demo, atau minta akses untuk merekmu.') + '</p></div>' +
      '<section class="npanel ms-card ms-step" id="akun-demo" aria-labelledby="msDemoT"><div class="npanel-head"><span class="npanel-title" id="msDemoT">' + ic('user-circle', 16) + T('Coba dengan akun demo') + '</span></div>' +
      '<div class="npanel-body"><p class="info-note">' + ic('lock', 16) + '<span>' + T('Email dan kata sandi sudah terisi. Data contoh hanya tersimpan di browser ini. Demo bisa diulang kapan saja.') + '</span></p>' +
      '<div class="ms-cred">' + field('msEmail', T('Email'), ACC.email) + field('msPass', T('Kata sandi'), ACC.pass) + '</div>' +
      '<button type="button" class="btn btn-primary btn-block ms-go" data-ms="login">' + ic('login-2', 18) + '<span class="btn-label">' + T('Masuk ke demo') + '</span></button></div></section>' +
      '<div class="ms-or ms-step">' + T('atau') + '</div>' +
      '<section class="npanel ms-card ms-step" aria-labelledby="msAccT"><div class="npanel-head"><span class="npanel-title" id="msAccT">' + ic('key', 16) + T('Minta akses untuk merekmu') + '</span></div>' +
      '<div class="npanel-body"><p class="sec">' + T('Untuk merek dengan 1 sampai 20 outlet. Isi nama, email, dan jumlah outlet. Tim kami membalas lewat email.') + '</p>' +
      '<button type="button" class="btn btn-secondary btn-block" data-act="access" data-feature="masuk-minta-akses">' + ic('mail', 18) + '<span class="btn-label">' + T('Minta akses') + '</span></button></div></section>';
  }
  function rolesStep() {
    return '<div class="ms-step ms-head"><button type="button" class="back-link" data-ms="logout">' + ic('chevron-left', 16) + T('Ganti akun') + '</button>' +
      '<h1 class="ms-title" tabindex="-1">' + T('Pilih tampilan') + '</h1><p class="ms-sub">' + T('Mulai dari layar mana saja.') + '</p></div>' +
      '<div class="ms-who ms-step"><span class="avatar avatar-brand" style="width:32px;height:32px;font-size:12px">SW</span><span class="grow stack" style="--gap:0"><span class="t-strong ellip">' + ACC.email + '</span><span class="t-small sec">' + T('Akun demo · Kamtono') + '</span></span><span class="tag tag-success tag-sm">' + T('Sudah masuk') + '</span></div>' +
      '<div class="ms-roles ms-step">' + ROLES.map(function (r) {
        return '<a class="npanel ms-role" href="' + r.href + '"><div class="npanel-head"><span class="npanel-title">' + ic(r.icon, 18) + T(r.name) + '</span><span class="npanel-action">' + T(r.open) + ic('arrow-right', 16) + '</span></div>' +
          '<div class="npanel-body"><span class="sec">' + T(r.desc) + '</span><ul class="ms-role-try" aria-label="' + T('Yang bisa dicoba') + '">' + r.tries.map(function (x) { return '<li>' + ic('check', 16) + '<span>' + T(x) + '</span></li>'; }).join('') + '</ul></div></a>';
      }).join('') + '</div>' +
      '<p class="ms-fine ms-step">' + T('Di setiap tampilan ada tombol Tur halaman ini dan titik ? untuk bertanya ke tim.') + '</p>';
  }

  function render() {
    document.title = T('Masuk') + ' · Providea Loyalty';
    app.innerHTML = '<div class="ms"><div class="ms-main" id="msMain">' + (signedIn ? rolesStep() : loginStep()) + '</div>' + aside() + '</div>' + P.footer();
  }
  function main(focus) {
    document.getElementById('msMain').innerHTML = signedIn ? rolesStep() : loginStep();
    if (focus) { var h = document.querySelector('.ms-title'); if (h) h.focus({ preventScroll: true }); }
  }
  function focusDemo() {
    var card = document.getElementById('akun-demo');
    if (!card) { var r = document.querySelector('.ms-role'); if (r) { r.scrollIntoView({ block: 'center' }); r.focus({ preventScroll: true }); } return; }
    card.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    var b = card.querySelector('[data-ms="login"]'); if (b) b.focus({ preventScroll: true });
    card.classList.add('is-focus'); setTimeout(function () { card.classList.remove('is-focus'); }, 1600);
  }

  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ms]'); if (!b) return;
    if (b.dataset.ms === 'login') {
      b.setAttribute('aria-busy', 'true');
      b.innerHTML = '<span class="ms-spin" aria-hidden="true"></span><span class="btn-label">' + T('Masuk…') + '</span>';
      setTimeout(function () {
        signedIn = true; try { sessionStorage.setItem('pl-demo-in', '1'); } catch (x) {}
        main(true); scrollTo({ top: 0 });
      }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : 600);
    } else if (b.dataset.ms === 'logout') {
      signedIn = false; try { sessionStorage.removeItem('pl-demo-in'); } catch (x) {}
      main(true);
    }
  });
  addEventListener('hashchange', function () { if (location.hash === '#demo') focusDemo(); });

  P.onLang = render;
  render();
  if (location.hash === '#demo') setTimeout(focusDemo, 60);
})();
