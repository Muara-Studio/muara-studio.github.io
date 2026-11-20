/* Providea Loyalty demo · member view on a phone (the brand's own member page, no app). */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc, ACT = P.ACT;
  P.setView('member');
  var app = document.getElementById('app');

  var route = (location.hash.replace(/^#\/?/, '') || 'home');
  var draft = { name: 'Nadia Putri', phone: '081312345678', email: 'nadia.putri@example.com', bday: '', consent: true, promo: false, age: true };
  try { var jp = sessionStorage.getItem('pl-join-phone'); if (jp) { draft.phone = jp[0] === '0' ? jp : '0' + jp.replace(/^62/, ''); sessionStorage.removeItem('pl-join-phone'); } } catch (e) {}
  var joinTab = 'phone', otp = '', vTab = 'mine', walletTab = 'apple', checkDone = false, qrTimer = null, notifTimer = null;
  /* WhatsApp scheme (js/wa.js): the member sends from their own WhatsApp to the Providea Loyalty number (Cloud API) */
  var W = window.PLWA, joinOpen = false, waBack = '', waTimer = null, waS = {}, loginVia = 'wa', signInAs = 'm-rina', cs = null;
  draft.lphone = '081288304471';
  var WA_ROUTES = { wa: 'daftar', undangan: 'invite', 'masuk-wa': 'masuk', 'wa-kode': 'otp' };

  var STEPS = [
    { g: 'Member baru · lewat WhatsApp', items: [['scan', 'Pindai QR Daftar via WhatsApp'], ['wa', 'Kirim pesan, dapat tautan kartu'], ['welcome', 'Kartu member baru']] },
    { g: 'Cara lain', items: [['join', 'Halaman daftar merek'], ['otp', 'Daftar pakai kode OTP'], ['undangan', 'Undangan WhatsApp dari kasir'], ['masuk', 'Masuk ke halaman member']] },
    { g: 'Member lama · Rina (Gold)', items: [['checkin', 'Check-in dari QR meja kasir'], ['home', 'Kartu, poin, stempel, tier'], ['voucher', 'Voucher, tukar poin, bayar pakai poin'], ['riwayat', 'Riwayat'], ['wallet', 'Kartu di Apple / Samsung Wallet'], ['promo', 'Kotak promo'], ['akun', 'Akun dan data pribadi']] }
  ];
  var NOTES = {
    scan: ['QR Daftar via WhatsApp', 'Pelanggan memindai QR di standee meja kasir dengan kamera HP. WhatsApp terbuka dengan pesan pendaftaran yang sudah terisi.', ['Tanpa unduh aplikasi dan tanpa isi formulir', 'Pesan masuk ke nomor resmi Providea Loyalty lewat WhatsApp Cloud API', 'QR kecil di bawahnya untuk check-in member lama']],
    wa: ['Kirim satu pesan', 'Pelanggan cukup menekan kirim. Nomornya langsung terverifikasi karena pesan datang dari nomor itu. Balasan berisi tautan kartu member.', ['Nomor terverifikasi otomatis, tanpa OTP', 'Balasan untuk pesan dari pelanggan tidak kena biaya WhatsApp', 'Member baru langsung muncul di tablet kasir']],
    join: ['Halaman daftar merek', 'Untuk pelanggan yang datang dari Instagram atau tautan. Tombol utama membuka WhatsApp. Nomor HP atau email tetap bisa dipakai.', ['Persetujuan syarat terpisah dari izin promo', 'Cek usia sebelum daftar', 'Data disimpan di Jakarta, sesuai UU PDP']],
    otp: ['Daftar pakai kode', 'Cara kedua: kode 6 angka dikirim lewat WhatsApp. Member yang daftar pakai email mendapat kode lewat email.', ['Pesan kode memakai tarif WhatsApp authentication, sekitar Rp357 sebelum PPN', 'Ketuk notifikasi untuk mengisi kode']],
    undangan: ['Undangan dari kasir', 'Kasir mengetik nomor pelanggan dan mencentang persetujuan. Pelanggan menerima pesan WhatsApp untuk melengkapi pendaftaran.', ['Pesan template utility, sekitar Rp357 sebelum PPN', 'Poin bisa masuk sejak pembelian pertama', 'Pelanggan mengisi nama dan persetujuan sendiri']],
    masuk: ['Masuk tanpa SMS', 'Member yang ganti HP atau keluar bisa masuk lagi. Cara utama: kirim kode lewat WhatsApp, halaman langsung masuk.', ['Pesan dari member tidak kena biaya', 'Cara kedua: kode OTP lewat WhatsApp, berlaku 10 menit', 'Cara ketiga: kode lewat email']],
    welcome: ['Langsung jadi member', 'Member baru mulai di Silver dan langsung dapat voucher sambutan. Kasir bisa menambah poin pada pembelian pertama.', ['Pesan sambutan terkirim lewat WhatsApp', 'Member baru muncul di dashboard pemilik']],
    checkin: ['Check-in di kasir', 'Member lama memindai QR check-in di standee yang sama. Tablet kasir langsung menampilkan "Rina · Gold".', ['Kasir tidak perlu mengetik nomor HP', 'Voucher yang bisa dipakai ikut tampil di kasir']],
    home: ['Kartu member', 'Satu halaman berisi QR member, poin, stempel, tier, dan voucher.', ['@mult', 'Naik tier otomatis begitu belanja 12 bulan melewati batas', 'QR berganti tiap 30 detik, jadi tangkapan layar tidak bisa dipakai']],
    voucher: ['Voucher sekali pakai', 'Setiap voucher punya QR dan kode sendiri. Setelah dipakai di kasir, voucher tidak bisa dipakai lagi.', ['Tukar poin jadi voucher di katalog', 'Bayar pakai poin di kasir: 1 poin = Rp500', 'Voucher bisa dikunci untuk tier tertentu']],
    riwayat: ['Semua tercatat', 'Penjualan, poin, stempel, voucher, naik tier, dan pembatalan tercatat dengan waktu dan outlet.', ['Penjualan yang dibatalkan kasir mengurangi poin lagi']],
    wallet: ['Kartu di dompet HP', 'Kartu masuk ke Apple Wallet atau Samsung Wallet. Poin di kartu berubah sendiri setelah belanja.', ['Google Wallet belum resmi di Indonesia', 'HP lain memasang halaman member ke layar utama', 'Kartu Wallet bisa menerima notifikasi promo']],
    promo: ['Kotak promo', 'Promo datang lewat WhatsApp, email, atau notifikasi kartu Wallet, sesuai izin member.', ['Member bisa berhenti menerima promo kapan saja', 'Pemilik melihat biaya sebelum mengirim']],
    akun: ['Data milik member', 'Member bisa mengubah izin promo, mengunduh data, atau menghapus akun.', ['Sesuai UU PDP', 'Hapus akun juga menghapus poin dan voucher']]
  };
  /* "1 poin tiap Rp10.000; Doyan 1,25×, Sultan 1,5×" from the active brand's tiers */
  function multLine() { return T('1 poin tiap Rp10.000; {list}', { list: P.S.rules.tiers.slice(1).map(function (t) { return t.name + ' ' + P.dec(t.mult) + '×'; }).join(', ') }); }

  function me() { return P.member(P.S.me) || P.member('m-rina'); }
  function first(n) { return n.split(' ')[0]; }
  function unread(m) { return P.S.inbox.filter(function (i) { return i.memberId === m.id && !i.read; }).length; }
  function go(r) { clearTimeout(waTimer); route = r; if (location.hash !== '#/' + r) history.replaceState(null, '', '#/' + r); render(); }

  /* ── layout ── */
  function render() {
    clearTimeout(notifTimer);
    if (['checkin', 'home', 'voucher', 'riwayat', 'wallet', 'promo', 'akun'].indexOf(route) >= 0 && P.S.me !== 'm-rina' && isOld(route) && !userPickedNew) { P.S.me = 'm-rina'; P.save(); }
    app.innerHTML = '<div class="mv">' +
      '<aside class="mv-steps"><div class="npanel"><div class="npanel-head"><span class="npanel-title">' + ic('route', 16) + T('Alur demo') + '</span></div><div class="npanel-body pad-sm"><div class="steps">' +
      STEPS.map(function (g) {
        return '<div class="steps-group">' + T(g.g) + '</div>' + g.items.map(function (s) {
          var n = stepNo(s[0]);
          return '<button type="button" class="step' + (activeStep() === s[0] ? ' is-active' : '') + '" data-act="step" data-r="' + s[0] + '"><span class="step-n">' + n + '</span><span>' + T(s[1]) + '</span></button>';
        }).join('');
      }).join('') + '</div></div></div></aside>' +
      '<div class="mv-phone"><div class="phone dev-black"><div class="phone-screen" id="ps"></div></div></div>' +
      '<aside class="mv-notes" id="notes"></aside></div>';
    renderPhone(); renderNotes();
  }
  var userPickedNew = false;
  /* the last group is the existing member (Rina); the others are ways in for a new member */
  function isOld(r) { return STEPS[STEPS.length - 1].items.some(function (s) { return s[0] === r; }); }
  function stepNo(r) { var all = [].concat.apply([], STEPS.map(function (g) { return g.items; })); for (var i = 0; i < all.length; i++) if (all[i][0] === r) return i + 1; return ''; }
  var SUB = { 'masuk-wa': 'masuk', 'masuk-kode': 'masuk', 'wa-kode': 'masuk' };
  function activeStep() { return route === 'home' && P.S.me !== 'm-rina' ? 'welcome' : (SUB[route] || route); }

  function renderNotes() {
    var k = activeStep(), n = NOTES[k] || NOTES.home;
    var links = '';
    if (k === 'checkin' || k === 'voucher' || k === 'wa' || k === 'undangan') links = '<a class="btn btn-secondary btn-sm" href="kasir.html">' + ic('device-tablet', 16) + '<span class="btn-label">' + T('Lihat di layar kasir') + '</span></a>' + (k === 'wa' || k === 'undangan' ? '<a class="btn btn-secondary btn-sm" href="dashboard.html#/whatsapp">' + ic('brand-whatsapp', 16) + '<span class="btn-label">' + T('Pengaturan WhatsApp') + '</span></a>' : '');
    else if (k === 'masuk') links = '<a class="btn btn-secondary btn-sm" href="dashboard.html#/whatsapp">' + ic('brand-whatsapp', 16) + '<span class="btn-label">' + T('Pengaturan WhatsApp') + '</span></a>';
    else if (k === 'welcome' || k === 'home' || k === 'riwayat' || k === 'akun') links = '<a class="btn btn-secondary btn-sm" href="dashboard.html#/member/' + me().id + '">' + ic('layout-dashboard', 16) + '<span class="btn-label">' + T('Lihat di dashboard') + '</span></a>';
    else if (k === 'promo') links = '<a class="btn btn-secondary btn-sm" href="dashboard.html#/kampanye">' + ic('speakerphone', 16) + '<span class="btn-label">' + T('Kirim promo dari dashboard') + '</span></a>';
    document.getElementById('notes').innerHTML = '<div class="npanel"><div class="npanel-head"><span class="npanel-title">' + ic('info-circle', 16) + T('Yang terjadi') + '</span></div><div class="npanel-body pad-md"><div class="note-body">' +
      '<h3 class="t-h3">' + T(n[0]) + '</h3><p>' + T(n[1]) + '</p><ul class="note-list">' + n[2].map(function (x) { return '<li>' + ic('check', 16) + '<span>' + (x === '@mult' ? esc(multLine()) : T(x)) + '</span></li>'; }).join('') + '</ul>' +
      (links ? '<div class="row wrap">' + links + '</div>' : '') +
      '<div class="demo-note">' + ic('info-circle', 14) + '<span>' + T('Merek Kamtono, orang, dan angka di demo ini fiktif.') + '</span></div></div></div></div>';
  }

  var DARK = { scan: 1, checkin: 1 };
  function renderPhone() {
    clearInterval(qrTimer);
    var ps = document.getElementById('ps'); if (!ps) return;
    var r = route === 'welcome' ? 'home' : route;
    var dark = DARK[route] && !(route === 'checkin' && checkDone), isWa = !!WA_ROUTES[r];
    var body = (SCR[r] || SCR.home)();
    var tabs = ['home', 'voucher', 'riwayat', 'promo', 'akun', 'wallet'].indexOf(r) >= 0;
    ps.style.setProperty('--st-bg', isWa ? 'var(--wa-head)' : dark ? '#121211' : 'var(--bg-canvas)');
    ps.classList.toggle('is-wa', isWa);
    ps.innerHTML = '<div class="ps-status" style="background:var(--st-bg);' + (dark || isWa ? 'color:#fff' : '') + '"><span class="num">09.41</span><span class="ps-island"></span><span class="ps-sig">' + ic('wifi', 16) + '<svg width="24" height="12" viewBox="0 0 24 12" aria-hidden="true"><rect x="0.5" y="0.5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity=".5"/><rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/><rect x="21.5" y="4" width="1.5" height="4" rx=".75" fill="currentColor" opacity=".5"/></svg></span></div>' +
      '<div class="ps-body" id="psb">' + body + '</div>' + (tabs ? tabbar(r) : '') + '<div class="ps-layer" id="psl"></div>';
    afterRender(r);
  }
  function tabbar(r) {
    var m = me(), u = unread(m);
    var t = [['home', 'id', 'Kartu'], ['voucher', 'ticket', 'Voucher'], ['riwayat', 'history', 'Riwayat'], ['promo', 'bell', 'Promo'], ['akun', 'user-circle', 'Akun']];
    return '<nav class="ps-tabbar" aria-label="' + T('Menu member') + '">' + t.map(function (x) {
      return '<button type="button" class="ps-tab' + ((r === x[0] || (r === 'wallet' && x[0] === 'home')) ? ' is-active' : '') + '" data-act="go" data-r="' + x[0] + '">' + ic(x[1], 22) + '<span>' + T(x[2]) + '</span>' + (x[0] === 'promo' && u ? '<span class="badge num">' + u + '</span>' : '') + '</button>';
    }).join('') + '</nav>';
  }
  function head(title, right) { return '<div class="ps-head"><span class="ps-head-title">' + title + '</span>' + (right || '') + '</div>'; }
  function brandHead() {
    var m = me(), u = unread(m);
    return head('<span class="sj-lock">' + (P.BRAND.noHeadIcon ? '' : P.sjLogo(32)) + P.wordmark(34) + '</span>', '<button type="button" class="icon-btn" data-act="go" data-r="promo" aria-label="' + T('Kotak promo') + '">' + ic('bell', 20) + (u ? '<span class="icon-btn-badge num">' + u + '</span>' : '') + '</button>');
  }

  /* ── screens ── */
  var SCR = {};
  /* counter standee: the big QR opens WhatsApp with the sign-up message (new members); the small one is the check-in
     QR for existing members. The yellow ring shows which code the camera has picked up. */
  function camera(mode) {
    var wa = mode === 'join';
    return '<div class="cam"><div class="cam-hint">' + T('Arahkan kamera ke QR di meja kasir') + '</div>' +
      '<div class="cam-frame"><div class="standee">' + P.wordmark(40, 'light') +
      '<span class="std-chip">' + ic('brand-whatsapp', 15) + '<span>' + T('Daftar via WhatsApp') + '</span></span>' +
      '<span class="std-qr' + (wa ? ' is-target' : '') + '">' + P.qr('wa-daftar-' + P.brand()) + '</span>' +
      '<span class="t-small">' + T('Kirim satu pesan, kartu langsung aktif') + '</span>' +
      '<span class="std-sub"><span class="std-qr-sm' + (!wa ? ' is-target' : '') + '">' + P.qr('counter-' + P.brand()) + '</span><span class="t-small">' + T('Sudah member? Pindai untuk check-in') + '</span></span>' +
      '<span class="t-caption">' + T('Outlet Cempaka') + '</span></div><span class="scanline"></span></div>' +
      (wa ? '<button type="button" class="cam-pill" data-act="openWaJoin">' + ic('brand-whatsapp', 18) + '<span>' + T('Daftar via WhatsApp') + '</span><span style="opacity:.7">' + T('Buka') + '</span>' + ic('chevron-right', 16) + '</button>'
        : '<button type="button" class="cam-pill" data-act="doCheckin">' + ic('world', 18) + '<span>' + esc(P.BRAND.domain) + '</span><span style="opacity:.7">' + T('Check-in') + '</span>' + ic('chevron-right', 16) + '</button>') +
      '<div class="cam-hint">' + (wa ? T('Ketuk tautan kuning untuk membuka WhatsApp') : T('Ketuk tautan kuning untuk membuka halaman member')) + '</div></div>';
  }
  SCR.scan = function () { return camera('join'); };

  /* ── WhatsApp screens (a simplified illustration, see js/wa.js) ── */
  function wst(kind) { return waS[kind] || (waS[kind] = { sent: false, typing: false, replied: false }); }
  function resetWa(kind) { waS[kind] = { sent: false, typing: false, replied: false }; }
  function tick(read) { return '<span class="wa-meta">' + P.ftime(Date.now()) + (read == null ? '' : ic('checks', 15, read ? 'is-read' : '')) + '</span>'; }
  function waOut(text, read) { return '<div class="wa-msg is-out"><span>' + text + '</span>' + tick(!!read) + '</div>'; }
  function waIn(o) {
    return '<div class="wa-msg is-in">' + (o.head ? '<span class="wa-h">' + o.head + '</span>' : '') + '<span class="wa-txt">' + o.body + '</span>' + (o.foot ? '<span class="wa-foot">' + o.foot + '</span>' : '') + tick() +
      (o.btns ? '<span class="wa-tbtns">' + o.btns.map(function (b) { return '<button type="button" class="wa-tbtn" data-act="' + b[0] + '">' + ic(b[1], 16) + '<span>' + b[2] + '</span></button>'; }).join('') + '</span>' : '') + '</div>';
  }
  function waView(kind) {
    var st = wst(kind), m = me(), thread = '', compose = '', safe = '';
    var sendable = (kind === 'daftar' || kind === 'masuk') && !st.sent;
    var text = kind === 'daftar' ? W.kwJoin() : kind === 'masuk' ? W.kwLogin() : '';
    if (kind === 'daftar') {
      if (st.sent) thread += waOut(esc(text), st.replied);
      if (st.replied) thread += waIn({ body: T('Halo {n}, kamu sudah jadi member Kamtono. Nomor WhatsApp kamu sudah terverifikasi.', { n: esc(first(m.name)) }) + '\n\n' + T('Kartu member kamu:') + '\n<span class="wa-link">' + esc(W.link(m)) + '</span>\n\n' + T('Hadiah sambutan sudah ada di kartu.'),
        foot: T('Dengan mendaftar, kamu setuju dengan Syarat dan Kebijakan Privasi Kamtono.'), btns: [['waOpenCard', 'external-link', T('Buka kartu member')]] });
      safe = ic('shield-check', 14) + '<span>' + T('Nomor terverifikasi otomatis, tanpa OTP') + '</span>';
    } else if (kind === 'masuk') {
      if (st.sent) thread += waOut(esc(text), st.replied);
      if (st.replied) thread += waIn({ body: T('Kamu sudah masuk ke halaman member Kamtono. Kembali ke browser untuk melihat kartu.'), btns: [['signIn', 'external-link', T('Kembali ke halaman member')]] });
      safe = ic('lock-check', 14) + '<span>' + T('Gratis, tanpa SMS. Kode berlaku 10 menit.') + '</span>';
    } else if (kind === 'invite') {
      var inv = W.lastInvite(), im = inv ? P.member(inv.memberId) : null;
      thread += waIn({ head: T('Lengkapi pendaftaran member Kamtono'), body: T('Halo {n}, nomor ini didaftarkan sebagai member Kamtono di Outlet Cempaka. Ketuk tombol di bawah untuk melengkapi pendaftaran dan melihat kartu member.', { n: esc(first(im ? im.name : 'Dimas')) }),
        foot: T('Bukan kamu? Abaikan pesan ini.'), btns: [['waInviteOpen', 'external-link', T('Buka kartu member')]] });
    } else if (kind === 'otp') {
      thread += waIn({ body: T('{c} adalah kode verifikasi kamu. Demi keamanan, jangan bagikan kode ini.', { c: '<b class="num">' + W.code + '</b>' }), foot: T('Berlaku 10 menit.'), btns: [['copyCode', 'copy', T('Salin kode')]] });
    }
    if (st.typing && !st.replied) thread += '<div class="wa-typing" aria-label="' + T('Providea Loyalty sedang mengetik') + '"><i></i><i></i><i></i></div>';
    compose = '<div class="wa-compose"><div class="wa-input' + (sendable ? '' : ' is-empty') + '">' + (sendable ? '<span class="wa-typed">' + esc(text) + '</span><span class="wa-caret"></span>' : '<span>' + T('Ketik pesan') + '</span>') + '</div>' +
      '<button type="button" class="wa-send' + (sendable ? ' is-ready' : '') + '" data-act="waSend" data-k="' + kind + '" aria-label="' + T('Kirim') + '"' + (sendable ? '' : ' disabled') + '>' + ic('send', 20) + '</button></div>';
    return '<div class="wa" data-kind="' + kind + '"><div class="wa-top"><button type="button" class="wa-back" data-act="waBack" aria-label="' + T('Kembali') + '">' + ic('arrow-left', 22) + '</button>' + W.avatar(38) +
      '<span class="wa-who"><span class="wa-name">Providea Loyalty</span>' + W.chip() + '</span></div>' +
      '<div class="wa-chat" id="wac"><div class="wa-note">' + ic('info-circle', 14) + '<span>' + T('Ilustrasi demo. Pesan lewat WhatsApp Cloud API resmi, dari nomor Providea Loyalty.') + '</span></div><div class="wa-day">' + T('Hari ini') + '</div>' + thread + '</div>' +
      (safe ? '<div class="wa-safe">' + safe + '</div>' : '') + compose + '</div>';
  }
  SCR.wa = function () { return waView('daftar'); };
  SCR.undangan = function () { var inv = W.lastInvite(); if (inv && !inv.seen) { inv.seen = true; inv.notified = true; P.save(); } return waView('invite'); };
  SCR['masuk-wa'] = function () { return waView('masuk'); };
  SCR['wa-kode'] = function () { return waView('otp'); };

  /* ── sign in again (after "Keluar", or "Sudah member? Masuk") ── */
  SCR.masuk = function () {
    return '<div class="ps-head"><span class="ps-head-title"><span class="sj-lock">' + (P.BRAND.noHeadIcon ? '' : P.sjLogo(30)) + P.wordmark(30) + '</span></span></div>' +
      '<div class="ps-pad" style="padding-top:8px"><div class="stack" style="--gap:4px"><h1 class="ps-title">' + T('Masuk ke kartu member') + '</h1><p class="ps-sub">' + T('Pakai nomor WhatsApp yang terdaftar di Kamtono.') + '</p></div>' +
      '<section class="wa-login"><div class="wa-login-head"><span class="wa-login-title">' + ic('brand-whatsapp', 20) + '<span>' + T('Masuk lewat WhatsApp') + '</span></span><span class="tag tag-success tag-sm">' + T('gratis, tanpa SMS') + '</span></div>' +
      '<p class="t-small sec">' + T('Kirim kode ini ke Providea Loyalty dari WhatsApp kamu. Halaman ini langsung masuk setelah pesan terkirim.') + '</p>' +
      '<div class="wa-code num" aria-label="' + T('Kode masuk {c}', { c: W.code }) + '">' + W.fmtCode() + '</div>' +
      '<button type="button" class="btn btn-wa btn-block" style="height:48px" data-act="loginWa">' + ic('brand-whatsapp', 18) + '<span class="btn-label">' + T('Buka WhatsApp') + '</span></button>' +
      '<span class="t-small muted center">' + T('Kode berlaku 10 menit.') + '</span></section>' +
      '<div class="or-line"><span>' + T('atau') + '</span></div>' +
      field(T('Nomor WhatsApp'), '<div class="input input-lg"><span class="input-suffix" style="font-size:14px">+62</span><input data-bind="lphone" inputmode="tel" value="' + esc(P.fmtPhone(draft.lphone).replace(/^0/, '')) + '"></div>') +
      '<button type="button" class="btn btn-secondary btn-block" style="height:48px" data-act="loginOtp">' + ic('message-2', 18) + '<span class="btn-label">' + T('Kirim kode OTP') + '</span></button>' +
      '<p class="t-small sec center">' + T('Tidak pakai WhatsApp?') + ' <button type="button" class="link" data-act="loginMail">' + T('Kirim lewat email') + '</button></p>' +
      '<div class="divider" style="margin:0"></div><p class="t-small sec center">' + T('Belum member?') + ' <button type="button" class="link" data-act="go" data-r="join">' + T('Daftar') + '</button></p></div>';
  };
  SCR['masuk-kode'] = function () { return otpScreen('login'); };

  SCR.join = function () {
    var ph = joinTab === 'phone';
    var ok = draft.consent && draft.age && draft.name.trim() && (ph ? draft.phone.replace(/\D/g, '').length >= 10 : /.+@.+\..+/.test(draft.email));
    var mascot = { kamtono: 'img/kamtono/mascot.webp', mendaya: 'img/brands/mendaya/emblem-cream.webp' }[P.brand()];
    return '<div class="sj-hero">' + (mascot ? '<img class="sj-hero-mascot" src="' + mascot + '" alt="" decoding="async">' : '') + '<div class="row">' + P.wordmark(46, P.brand() === 'bobs' ? 'light' : 'dark') + '<span class="t-small sj-hero-sub">' + T('Froyo · Outlet Cempaka') + '</span></div>' +
      '<h1 class="ps-title">' + T('Jadi member Kamtono') + '</h1>' +
      '<div class="perk">' + ic('coin', 18) + '<span>' + T('1 poin tiap belanja Rp10.000') + '</span></div>' +
      '<div class="perk">' + ic('rubber-stamp', 18) + '<span>' + T('Kumpulkan 10 stempel, dapat cup kecil gratis') + '</span></div>' +
      '<div class="perk">' + ic('gift', 18) + '<span>' + T('Gratis topping untuk member baru') + '</span></div></div>' +
      '<div class="ps-pad"><div class="stack" style="--gap:8px"><button type="button" class="btn btn-wa btn-block" style="height:52px" data-act="joinWa">' + ic('brand-whatsapp', 20) + '<span class="btn-label">' + T('Daftar via WhatsApp') + '</span></button>' +
      '<p class="t-small sec center">' + T('Kirim satu pesan {kw}. Nomor terverifikasi otomatis, tanpa OTP.', { kw: '<b class="wa-kw">' + esc(W.kwJoin()) + '</b>' }) + '</p></div>' +
      '<div class="or-line"><span>' + T('atau') + '</span></div>' +
      (joinOpen ? joinForm(ph, ok) : '<button type="button" class="btn btn-secondary btn-block" style="height:48px" data-act="joinForm">' + ic('device-mobile', 18) + '<span class="btn-label">' + T('Daftar dengan nomor HP atau email') + '</span></button>') +
      '<p class="t-small sec center">' + T('Sudah member?') + ' <button type="button" class="link" data-act="go" data-r="masuk">' + T('Masuk') + '</button></p>' +
      '<p class="t-small muted center">' + T('Data kamu disimpan di Jakarta dan hanya dipakai oleh Kamtono. Layanan oleh Providea Loyalty.') + '</p></div>';
  };
  /* the earlier sign-up path, now the second option: phone or email, then a 6-digit code */
  function joinForm(ph, ok) {
    return '<div class="stack join-form" style="--gap:16px"><span class="t-strong">' + T('Daftar dengan nomor HP atau email') + '</span><div class="seg-switch" role="tablist"><button type="button" class="' + (ph ? 'is-active' : '') + '" data-act="joinTab" data-v="phone">' + ic('brand-whatsapp', 16) + T('Nomor HP') + '</button><button type="button" class="' + (!ph ? 'is-active' : '') + '" data-act="joinTab" data-v="email">' + ic('mail', 16) + T('Email') + '</button></div>' +
      field(T('Nama panggilan'), '<div class="input input-lg"><input data-bind="name" value="' + esc(draft.name) + '" autocomplete="name"></div>') +
      (ph ? field(T('Nomor WhatsApp'), '<div class="input input-lg"><span class="input-suffix" style="font-size:14px">+62</span><input data-bind="phone" inputmode="tel" value="' + esc(draft.phone.replace(/^0/, '')) + '"></div>', T('Kode daftar dikirim ke nomor ini lewat WhatsApp.'))
        : field(T('Email'), '<div class="input input-lg"><input data-bind="email" type="email" inputmode="email" value="' + esc(draft.email) + '"></div>', T('Kode daftar dikirim ke email ini.'))) +
      field(T('Tanggal lahir (boleh dikosongkan)'), '<div class="input input-lg"><input data-bind="bday" type="date" value="' + esc(draft.bday) + '"></div>', T('Untuk hadiah ulang tahun.')) +
      '<div class="stack" style="--gap:10px">' + check('consent', T('Saya setuju dengan Syarat dan Kebijakan Privasi Kamtono.'), draft.consent) +
      check('age', T('Umur saya 17 tahun ke atas, atau saya sudah dapat izin orang tua.'), draft.age) +
      check('promo', ph ? T('Kirim info promo ke WhatsApp saya. Bisa berhenti kapan saja.') : T('Kirim info promo ke email saya. Bisa berhenti kapan saja.'), draft.promo) + '</div>' +
      '<button type="button" class="btn btn-primary btn-block" style="height:48px" data-act="sendCode"' + (ok ? '' : ' disabled') + '>' + ic(ph ? 'brand-whatsapp' : 'mail', 18) + '<span class="btn-label">' + (ph ? T('Kirim kode lewat WhatsApp') : T('Kirim kode lewat email')) + '</span></button></div>';
  }
  function field(label, control, hint) { return '<label class="field"><span class="field-label">' + label + '</span>' + control + (hint ? '<span class="field-hint">' + hint + '</span>' : '') + '</label>'; }
  function check(k, label, on) { return '<label class="check" style="align-items:flex-start"><input type="checkbox" data-bind="' + k + '"' + (on ? ' checked' : '') + '><span class="check-box" style="margin-top:1px">' + ic('check', 14) + '</span><span class="check-label t-small">' + label + '</span></label>'; }

  SCR.otp = function () { return otpScreen('join'); };
  /* one code screen for the second sign-up path (join) and for signing in again (login) */
  function otpScreen(mode) {
    var login = mode === 'login', ph = login ? loginVia !== 'mail' : joinTab === 'phone';
    var num = login ? draft.lphone : draft.phone, mail = login ? (P.member(signInAs) || me()).email || 'rina.maharani@example.com' : draft.email;
    var to = ph ? '+62 ' + P.fmtPhone(num.replace(/\D/g, '').replace(/^62/, '0')).replace(/^0/, '') : mail;
    var cells = ''; for (var i = 0; i < 6; i++) cells += '<span class="' + (otp[i] ? 'is-filled' : (i === otp.length ? 'is-caret' : '')) + '">' + (otp[i] || '') + '</span>';
    var sub = ph ? (login ? T('Kode 6 angka sudah dikirim ke WhatsApp {to}. Berlaku 10 menit.', { to: esc(to) }) : T('Kode 6 angka sudah dikirim ke WhatsApp {to}.', { to: esc(to) })) : T('Kode 6 angka sudah dikirim ke email {to}.', { to: esc(to) });
    return '<div class="ps-head"><button type="button" class="ps-back" data-act="go" data-r="' + (login ? 'masuk' : 'join') + '">' + ic('chevron-left', 18) + T('Kembali') + '</button></div>' +
      '<div class="ps-pad"><h1 class="ps-title">' + (login ? T('Masukkan kode masuk') : T('Masukkan kode')) + '</h1><p class="ps-sub">' + sub + '</p>' +
      '<div class="otp-wrap"><div class="otp">' + cells + '</div><input class="otp-input" data-bind="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" aria-label="' + T('Kode 6 angka') + '" value="' + otp + '"></div>' +
      '<button type="button" class="btn btn-primary btn-block" style="height:48px" data-act="verify"' + (otp.length === 6 ? '' : ' disabled') + '>' + (login ? T('Masuk') : T('Verifikasi')) + '</button>' +
      '<p class="t-small sec center">' + T('Belum dapat kode?') + ' <button type="button" class="link" data-act="resend">' + T('Kirim ulang') + '</button></p>' +
      '<div class="info-note">' + ic('shield-lock', 16) + '<span>' + T('Jangan berikan kode ini ke siapa pun, termasuk kasir.') + '</span></div></div>';
  }

  SCR.home = function () {
    var m = me(), t = P.tierOf(m), nt = P.nextTier(m), vs = P.memberVouchers(m.id), R = P.S.rules;
    var pct = nt ? Math.min(100, m.spend / nt.min * 100) : 100;
    var stamps = ''; for (var i = 0; i < R.stampGoal; i++) stamps += '<span class="stamp' + (i < m.stamps ? ' is-on' : '') + (i === R.stampGoal - 1 && i >= m.stamps ? ' is-gift' : '') + '">' + (i < m.stamps ? P.cup(24) : (i === R.stampGoal - 1 ? ic('gift', 18) : i + 1)) + '</span>';
    var periodEnd = P.fdate(m.joined + 365 * P.DAY);
    return brandHead() + '<div class="ps-pad" style="padding-top:4px">' +
      '<div><div class="t-small sec">' + T('Halo,') + '</div><div class="t-h2">' + esc(first(m.name)) + '</div></div>' +
      '<button type="button" class="mcard" data-act="showQr" aria-label="' + T('Tunjukkan QR member') + '"><div class="mcard-top"><span class="mcard-brand">' + P.wordmark(38, 'dark') + '</span>' + P.tierTag(t) + '</div>' +
      '<div style="position:relative;z-index:1"><div class="mcard-sub">' + T('Poin') + '</div><div class="mcard-pts">' + P.num(m.points) + '</div><div class="mcard-sub">' + T('Senilai {rp} bila dipakai bayar', { rp: P.rp(m.points * R.pointValue) }) + '</div></div>' +
      '<div class="mcard-row"><div><div style="font-weight:600">' + esc(m.name) + '</div><div class="mcard-sub num">' + T('No. member') + ' ' + m.no + '</div></div><span class="mcard-qr">' + P.qr(m.no) + '</span></div></button>' +
      '<button type="button" class="btn btn-primary btn-block" style="height:48px" data-act="showQr">' + ic('qrcode', 18) + '<span class="btn-label">' + T('Tunjukkan QR ke kasir') + '</span></button>' +
      '<div class="pcard"><div class="pcard-head"><span class="row">' + P.tierTag(t) + '<span class="t-small sec">' + T('poin {x}×', { x: P.dec(t.mult) }) + '</span></span><button type="button" class="link t-small" data-act="tiers">' + T('Lihat semua tier') + '</button></div>' +
      '<div class="pbar' + (P.tierLook(t) === 'gold' ? ' is-gold' : '') + '"><span style="width:' + pct.toFixed(1) + '%"></span></div>' +
      '<div class="t-small sec">' + (nt ? T('Belanja {rp} lagi sebelum {d} untuk naik ke {t}.', { rp: '<b class="c-primary num">' + P.rp(nt.min - m.spend) + '</b>', d: periodEnd, t: nt.name }) : T('Kamu di tier tertinggi. Tier dicek lagi tiap 12 bulan.')) + '</div>' +
      '<div class="t-small muted num">' + T('Belanja 12 bulan: {rp}', { rp: P.rp(m.spend) }) + '</div></div>' +
      '<div class="pcard"><div class="pcard-head"><span class="pcard-title">' + T('Kartu stempel') + '</span><span class="tag tag-brand num">' + m.stamps + ' / ' + R.stampGoal + '</span></div><div class="stamps">' + stamps + '</div>' +
      '<div class="t-small sec">' + T('{n} cup lagi, dapat cup kecil gratis.', { n: R.stampGoal - m.stamps }) + '</div></div>' +
      '<div class="pcard"><div class="pcard-head"><span class="pcard-title">' + T('Voucher kamu') + '</span><button type="button" class="link t-small" data-act="go" data-r="voucher">' + T('Lihat semua') + '</button></div>' +
      (vs.length ? vs.slice(0, 2).map(vchip).join('') : '<p class="t-small sec">' + T('Belum ada voucher. Tukar poin di menu Voucher.') + '</p>') + '</div>' +
      '<div class="pcard"><div class="row top" style="--gap:12px"><span class="vchip-ic">' + ic('coins', 22) + '</span><div class="stack" style="--gap:2px"><span class="pcard-title">' + T('Bayar pakai poin') + '</span><span class="t-small sec">' + T('Bilang ke kasir: pakai poin. 1 poin = {v}. Saldo kamu senilai {rp}.', { v: P.rp(R.pointValue), rp: P.rp(m.points * R.pointValue) }) + '</span></div></div></div>' +
      (m.wallet ? '<button type="button" class="pcard" data-act="go" data-r="wallet" style="text-align:left"><span class="row">' + ic('wallet', 20) + '<span class="grow t-small">' + (m.wallet === 'apple' ? T('Kartu ada di Apple Wallet') : T('Kartu ada di Samsung Wallet')) + '</span>' + ic('chevron-right', 16) + '</span></button>'
        : '<div class="stack" style="--gap:8px"><button type="button" class="btn btn-wallet btn-block" data-act="walletGo" data-v="apple">' + ic('brand-apple', 18) + '<span class="btn-label">' + T('Tambah ke Apple Wallet') + '</span></button><button type="button" class="btn btn-samsung btn-block" data-act="walletGo" data-v="samsung">' + ic('wallet', 18) + '<span class="btn-label">' + T('Tambah ke Samsung Wallet') + '</span></button></div>') +
      '</div>';
  };
  function vchip(v) {
    var used = !!v.used, exp = v.exp < Date.now();
    var icn = v.kind === 'pct' ? 'percentage' : v.kind === 'rp' ? 'discount' : 'gift';
    return '<button type="button" class="vchip' + (used || exp ? ' is-used' : '') + '" data-act="voucher" data-id="' + v.id + '"><span class="vchip-ic">' + ic(icn, 22) + '</span><span class="vchip-main"><span class="t-strong ellip">' + esc(T(v.title)) + '</span><span class="t-small sec ellip">' + esc(T(v.src)) + '</span>' +
      '<span class="row" style="--gap:6px">' + (used ? '<span class="tag tag-sm">' + T('Sudah dipakai') + '</span>' : exp ? '<span class="tag tag-sm">' + T('Kedaluwarsa') + '</span>' : '<span class="tag tag-sm tag-outline">' + T('s.d. {d}', { d: P.fdate(v.exp, true) }) + '</span>') + (v.tier ? P.tierTag(P.tierById(v.tier), true) : '') + '</span></span>' + ic('chevron-right', 16) + '</button>';
  }

  SCR.voucher = function () {
    var m = me(), R = P.S.rules, mine = P.memberVouchers(m.id), all = P.memberVouchers(m.id, true), old = all.filter(function (v) { return mine.indexOf(v) < 0; });
    var body;
    if (vTab === 'mine') {
      body = (mine.length ? mine.map(vchip).join('') : '<div class="empty"><span class="empty-icon">' + ic('ticket', 20) + '</span><p class="empty-text">' + T('Belum ada voucher aktif.') + '</p></div>') +
        (old.length ? '<div class="month-label">' + T('Sudah dipakai atau kedaluwarsa') + '</div>' + old.map(vchip).join('') : '');
    } else {
      body = '<div class="pcard"><div class="pcard-head"><span class="pcard-title">' + T('Poin kamu') + '</span><span class="t-h3 num">' + P.num(m.points) + '</span></div></div>' +
        P.CATALOG.map(function (c) {
          var can = m.points >= c.pts;
          return '<div class="vchip"><span class="vchip-ic">' + ic(c.kind === 'rp' ? 'discount' : 'gift', 22) + '</span><span class="vchip-main"><span class="t-strong">' + T(c.title) + '</span><span class="t-small sec num">' + T('{n} poin', { n: c.pts }) + '</span></span><button type="button" class="btn btn-sm ' + (can ? 'btn-primary' : 'btn-secondary') + '" data-act="redeem" data-id="' + c.id + '"' + (can ? '' : ' disabled') + '>' + T('Tukar') + '</button></div>';
        }).join('') +
        '<div class="pcard"><div class="row top" style="--gap:12px"><span class="vchip-ic">' + ic('coins', 22) + '</span><div class="stack" style="--gap:4px"><span class="pcard-title">' + T('Bayar pakai poin di kasir') + '</span><span class="t-small sec">' + T('1 poin = {v}. Contoh: tagihan Rp42.000, pakai 60 poin, potongan Rp30.000, sisa bayar Rp12.000.', { v: P.rp(R.pointValue) }) + '</span></div></div></div>';
    }
    return head(T('Voucher'), '<span class="tag tag-brand num">' + T('{n} poin', { n: P.num(m.points) }) + '</span>') + '<div class="ps-pad" style="padding-top:4px">' +
      '<div class="seg-switch"><button type="button" class="' + (vTab === 'mine' ? 'is-active' : '') + '" data-act="vTab" data-v="mine">' + T('Voucher saya') + ' <span class="num muted">' + mine.length + '</span></button><button type="button" class="' + (vTab === 'tukar' ? 'is-active' : '') + '" data-act="vTab" data-v="tukar">' + T('Tukar poin') + '</button></div>' + body + '</div>';
  };

  SCR.riwayat = function () {
    var m = me(), items = P.S.log.filter(function (l) { return l.memberId === m.id; }).sort(function (a, b) { return b.at - a.at; });
    var out = '', lastM = '';
    items.forEach(function (l) {
      var mo = P.fmonth(l.at); if (mo !== lastM) { out += '<div class="month-label">' + mo + '</div>'; lastM = mo; }
      out += histRow(l);
    });
    return head(T('Riwayat')) + '<div class="ps-pad" style="padding-top:4px"><div class="pcard"><div class="row between"><span class="t-small sec">' + T('Belanja 12 bulan') + '</span><span class="t-strong num">' + P.rp(m.spend) + '</span></div><div class="row between"><span class="t-small sec">' + T('Kunjungan') + '</span><span class="t-strong num">' + P.num(m.visits) + '</span></div></div><div>' + (out || '<p class="sec">' + T('Belum ada riwayat.') + '</p>') + '</div></div>';
  };
  function histRow(l) {
    var when = P.fdate(l.at, true) + ' · ' + P.ftime(l.at);
    if (l.kind === 'sale') return '<div class="hist-row"><span class="hist-ic">' + ic('receipt', 18) + '</span><span class="hist-main"><span class="t-strong' + (l.void ? ' strike' : '') + '">' + T('Belanja di {o}', { o: l.outlet }) + ' <span class="num">' + P.rp(l.amount) + '</span></span><span class="t-small sec">' + when + ' · ' + l.receipt + (l.void ? ' · <span class="c-danger">' + T('Dibatalkan') + '</span>' : '') + '</span></span><span class="hist-side">' +
      (l.void ? '<span class="minus num t-small">' + T('{n} poin', { n: '−' + l.points }) + '</span>' : '<span class="plus num t-small">' + T('{n} poin', { n: '+' + l.points }) + '</span>' + (l.stamps ? '<span class="t-small sec num">' + T('{n} stempel', { n: '+' + l.stamps }) + '</span>' : '')) + '</span></div>';
    if (l.kind === 'tier') return '<div class="hist-row"><span class="hist-ic is-up">' + ic('crown', 18) + '</span><span class="hist-main"><span class="t-strong">' + T('Naik ke {t}', { t: l.title }) + '</span><span class="t-small sec">' + when + '</span></span></div>';
    if (l.kind === 'redeem') return '<div class="hist-row"><span class="hist-ic">' + ic('gift', 18) + '</span><span class="hist-main"><span class="t-strong">' + T('Tukar poin: {v}', { v: T(l.title) }) + '</span><span class="t-small sec">' + when + '</span></span><span class="hist-side"><span class="minus num t-small">' + T('{n} poin', { n: '−' + Math.abs(l.points) }) + '</span></span></div>';
    if (l.kind === 'pay') return '<div class="hist-row"><span class="hist-ic">' + ic('coins', 18) + '</span><span class="hist-main"><span class="t-strong">' + T('Bayar pakai poin') + '</span><span class="t-small sec">' + when + ' · ' + T('potongan {rp}', { rp: P.rp(l.amount) }) + '</span></span><span class="hist-side"><span class="minus num t-small">' + T('{n} poin', { n: '−' + Math.abs(l.points) }) + '</span></span></div>';
    if (l.kind === 'voucher') return '<div class="hist-row"><span class="hist-ic">' + ic('ticket', 18) + '</span><span class="hist-main"><span class="t-strong">' + T('Voucher dipakai: {v}', { v: T(l.title) }) + '</span><span class="t-small sec">' + when + ' · ' + esc(l.outlet || '') + '</span></span></div>';
    if (l.kind === 'join') return '<div class="hist-row"><span class="hist-ic">' + ic('user-plus', 18) + '</span><span class="hist-main"><span class="t-strong">' + T('Mulai jadi member Kamtono') + '</span><span class="t-small sec">' + when + '</span></span></div>';
    if (l.kind === 'adjust') return '<div class="hist-row"><span class="hist-ic">' + ic('adjustments', 18) + '</span><span class="hist-main"><span class="t-strong">' + T('Penyesuaian poin') + '</span><span class="t-small sec">' + when + ' · ' + esc(l.title || '') + '</span></span><span class="hist-side"><span class="' + (l.points < 0 ? 'minus' : 'plus') + ' num t-small">' + T('{n} poin', { n: (l.points > 0 ? '+' : '−') + Math.abs(l.points) }) + '</span></span></div>';
    return '';
  }

  function passHtml(m, kind) {
    var t = P.tierOf(m);
    return '<div class="pass' + (kind === 'samsung' ? ' is-samsung' : '') + '"><div class="pass-head"><span class="mcard-brand">' + P.sjLogo(28) + P.wordmark(30) + '</span><span class="t-small" style="opacity:.8">' + esc(m.name) + '</span></div>' +
      '<div class="pass-fields"><div><div class="pass-label">' + T('POIN') + '</div><div class="pass-val">' + P.num(m.points) + '</div></div><div><div class="pass-label">' + T('TIER') + '</div><div class="pass-val">' + esc(t.name) + '</div></div><div><div class="pass-label">' + T('STEMPEL') + '</div><div class="pass-val">' + m.stamps + '/' + P.S.rules.stampGoal + '</div></div></div>' +
      '<div class="pass-qr">' + P.qr(m.no + 'w') + '</div><div class="center t-small" style="opacity:.75;padding:0 0 14px">' + T('No. member') + ' ' + m.no + '</div></div>';
  }
  SCR.wallet = function () {
    var m = me(), ap = walletTab === 'apple', has = m.wallet === walletTab;
    return head('<button type="button" class="ps-back" data-act="go" data-r="home">' + ic('chevron-left', 18) + T('Kartu') + '</button>') + '<div class="ps-pad" style="padding-top:0"><h1 class="ps-title">' + T('Kartu di Wallet') + '</h1>' +
      '<div class="seg-switch"><button type="button" class="' + (ap ? 'is-active' : '') + '" data-act="wTab" data-v="apple">' + ic('brand-apple', 16) + 'Apple Wallet</button><button type="button" class="' + (!ap ? 'is-active' : '') + '" data-act="wTab" data-v="samsung">' + ic('wallet', 16) + 'Samsung Wallet</button></div>' +
      passHtml(m, walletTab) +
      (has ? '<div class="result is-ok">' + ic('circle-check', 20) + '<div class="stack" style="--gap:2px"><span class="t-strong">' + (ap ? T('Sudah ada di Apple Wallet') : T('Sudah ada di Samsung Wallet')) + '</span><span class="t-small">' + T('Poin di kartu berubah sendiri setelah belanja.') + '</span></div></div><button type="button" class="btn btn-secondary btn-block" data-act="walletNotif">' + ic('bell', 18) + '<span class="btn-label">' + T('Lihat contoh notifikasi kartu') + '</span></button>'
        : '<button type="button" class="btn ' + (ap ? 'btn-wallet' : 'btn-samsung') + ' btn-block" style="height:48px" data-act="walletAdd">' + ic(ap ? 'brand-apple' : 'wallet', 18) + '<span class="btn-label">' + (ap ? T('Tambah ke Apple Wallet') : T('Tambah ke Samsung Wallet')) + '</span></button>') +
      '<div class="info-note">' + ic('info-circle', 16) + '<span>' + T('Google Wallet belum resmi tersedia di Indonesia. HP lain bisa memasang halaman member ini ke layar utama.') + '</span></div>' +
      '<button type="button" class="btn btn-secondary btn-block" data-act="install">' + ic('device-mobile', 18) + '<span class="btn-label">' + T('Pasang di layar utama') + '</span></button></div>';
  };

  function iv(v) { if (!v || !v.t) return v; var o = {}; for (var k in v) o[k] = v[k]; o.t = P.tn(v.t); return o; }
  SCR.promo = function () {
    var m = me(), items = P.S.inbox.filter(function (i) { return i.memberId === m.id; }).sort(function (a, b) { return b.at - a.at; });
    var CH = { wa: ['ch-wa', 'brand-whatsapp', 'WhatsApp'], email: ['ch-email', 'mail', 'Email'], wallet: ['ch-wallet', 'wallet', 'Wallet'] };
    return head(T('Kotak promo'), '<button type="button" class="link t-small" data-act="go" data-r="akun">' + T('Atur izin promo') + '</button>') + '<div class="ps-pad" style="padding-top:0"><div>' +
      (items.length ? items.map(function (i) {
        var c = CH[i.ch];
        return '<button type="button" class="inbox-row" data-act="msg" data-id="' + i.id + '"><span class="unread-dot' + (i.read ? ' is-read' : '') + '"></span><span class="stack grow" style="--gap:4px"><span class="row between"><span class="ch ' + c[0] + '">' + ic(c[1], 12) + c[2] + '</span><span class="t-small muted">' + P.fdate(i.at, true) + '</span></span><span class="t-strong">' + esc(T(i.title, iv(i.v))) + '</span><span class="t-small sec" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(T(i.body, iv(i.v))) + '</span></span></button>';
      }).join('') : '<div class="empty"><span class="empty-icon">' + ic('inbox', 20) + '</span><p class="empty-text">' + T('Belum ada promo.') + '</p></div>') + '</div></div>';
  };

  SCR.akun = function () {
    var m = me();
    function tog(k, label, hint) { return '<div class="row between" style="padding:6px 0"><span class="stack" style="--gap:0"><span class="t-strong">' + label + '</span>' + (hint ? '<span class="t-small sec">' + hint + '</span>' : '') + '</span><button type="button" class="toggle' + (m[k] ? ' is-on' : '') + '" role="switch" aria-checked="' + !!m[k] + '" aria-label="' + esc(label) + '" data-act="pref" data-k="' + k + '"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></div>'; }
    return head(T('Akun')) + '<div class="ps-pad" style="padding-top:0">' +
      '<div class="pcard"><div class="row" style="--gap:12px">' + P.avatar(m, 48) + '<div class="stack grow" style="--gap:2px"><span class="t-h3">' + esc(m.name) + '</span><span class="row" style="--gap:6px">' + P.tierTag(P.tierOf(m), true) + '<span class="t-small sec">' + T('member sejak {d}', { d: P.fmonth(m.joined) }) + '</span></span></div></div>' +
      '<div class="lv-list"><div class="lv-row"><span class="lv-label">' + T('Nomor HP') + '</span><span class="lv-value num">' + (m.phone ? P.fmtPhone(m.phone) : '–') + '</span></div><div class="lv-row"><span class="lv-label">' + T('Email') + '</span><span class="lv-value">' + esc(m.email || '–') + '</span></div><div class="lv-row"><span class="lv-label">' + T('Ulang tahun') + '</span><span class="lv-value">' + esc(m.bday || '–') + '</span></div></div></div>' +
      '<div class="pcard"><span class="pcard-title">' + T('Izin promo') + '</span>' + tog('promoWa', T('Promo lewat WhatsApp')) + tog('promoEmail', T('Promo lewat email')) +
      '<span class="t-small muted">' + T('Pesan penting (kode, poin, tier) tetap dikirim.') + '</span></div>' +
      '<div class="pcard"><span class="pcard-title">' + T('Data saya') + '</span><button type="button" class="btn btn-secondary btn-block" data-act="exportMe">' + ic('download', 18) + '<span class="btn-label">' + T('Unduh data saya') + '</span></button><button type="button" class="btn btn-ghost btn-block c-danger" data-act="deleteMe">' + ic('trash', 18) + '<span class="btn-label">' + T('Hapus akun') + '</span></button></div>' +
      '<button type="button" class="btn btn-secondary btn-block" data-act="logout">' + ic('logout', 18) + '<span class="btn-label">' + T('Keluar') + '</span></button>' +
      '<div class="pcard"><span class="pcard-title">' + T('Ganti akun demo') + '</span><div class="row wrap"><button type="button" class="chip' + (m.id === 'm-rina' ? ' is-selected' : '') + '" data-act="persona" data-id="m-rina">Rina · ' + esc(P.tierOf(P.member('m-rina')).name) + '</button>' + (P.member('m-new') ? '<button type="button" class="chip' + (m.id === 'm-new' ? ' is-selected' : '') + '" data-act="persona" data-id="m-new">' + esc(first(P.member('m-new').name)) + ' · ' + T('baru') + '</button>' : '') + '</div></div>' +
      '<p class="t-small muted center">' + T('Syarat · Kebijakan privasi · Layanan oleh Providea Loyalty') + '</p></div>';
  };

  SCR.checkin = function () {
    if (!checkDone) return camera('checkin');
    var m = P.member('m-rina'), vs = P.memberVouchers(m.id);
    return brandHead() + '<div class="ps-pad center" style="padding-top:24px"><span class="success-burst">' + ic('circle-check', 36) + '</span>' +
      '<h1 class="ps-title">' + T('Kamu sudah check-in') + '</h1><p class="ps-sub">' + T('Kamtono · Outlet Cempaka. Kasir sudah melihat namamu. Sebut pesananmu, poin masuk otomatis.') + '</p>' +
      '<div class="pcard" style="text-align:left"><div class="row" style="--gap:12px">' + P.avatar(m, 44) + '<div class="stack grow" style="--gap:2px"><span class="t-strong">' + esc(m.name) + '</span><span class="row" style="--gap:6px">' + P.tierTag(P.tierOf(m), true) + '<span class="t-small sec num">' + T('{n} poin', { n: P.num(m.points) }) + ' · ' + T('stempel {a}/{b}', { a: m.stamps, b: P.S.rules.stampGoal }) + '</span></span></div></div>' +
      (vs.length ? '<div class="t-small sec">' + T('{n} voucher bisa dipakai hari ini.', { n: vs.length }) + '</div>' : '') + '</div>' +
      '<button type="button" class="btn btn-primary btn-block" style="height:48px" data-act="go" data-r="home">' + T('Lihat kartu') + '</button>' +
      '<a class="btn btn-secondary btn-block" href="kasir.html">' + ic('device-tablet', 18) + '<span class="btn-label">' + T('Buka layar kasir') + '</span></a></div>';
  };

  /* ── after render ── */
  function afterRender(r) {
    if ((r === 'otp' || r === 'masuk-kode') && otp.length < 6) {
      var nk = r === 'otp' ? (joinTab === 'phone' ? 'wa' : 'mail') : (loginVia === 'mail' ? 'mail' : 'wa-auth');
      notifTimer = setTimeout(function () { showNotif(nk); }, 900);
      var inp = document.querySelector('.otp-input'); if (inp && window.innerWidth > 767) inp.focus({ preventScroll: true });
    }
    if (route === 'welcome' && !welcomeShown) { welcomeShown = true; setTimeout(welcomeSheet, 250); }
    var c = document.getElementById('wac'); if (c) c.scrollTop = c.scrollHeight;
    if (!WA_ROUTES[r]) setTimeout(checkInvite, 600);
  }
  var welcomeShown = false;

  /* a cashier invite sent from the tablet (shared demo state) arrives as a WhatsApp banner on the phone */
  function checkInvite() {
    var inv = W.lastInvite(); if (!inv || inv.notified || inv.seen || WA_ROUTES[route]) return;
    if (document.querySelector('.psheet, .pnotif')) return;
    inv.notified = true; P.save(); showNotif('invite');
  }

  function showNotif(kind) {
    var l = document.getElementById('psl'); if (!l) return;
    var html;
    if (kind === 'invite' || kind === 'wa-auth') {
      var inv = kind === 'invite';
      html = '<button type="button" class="pnotif" data-act="' + (inv ? 'openInvite' : 'openAuth') + '"><span class="pnotif-app">' + ic('brand-whatsapp', 20) + '</span><span class="stack grow" style="--gap:2px"><span class="row between"><b>Providea Loyalty</b><span class="t-small muted">' + T('sekarang') + '</span></span>' +
        '<span class="t-small">' + (inv ? T('Lengkapi pendaftaran member Kamtono') : T('{c} adalah kode verifikasi kamu. Demi keamanan, jangan bagikan kode ini.', { c: W.code })) + '</span><span class="t-small c-brand">' + T('Ketuk untuk membuka WhatsApp') + '</span></span></button>';
      l.innerHTML = html;
      return;
    }
    if (kind === 'wallet') {
      var m = me();
      html = '<button type="button" class="pnotif" data-act="dismissNotif"><span class="pnotif-app is-wallet">' + ic('wallet', 20) + '</span><span class="stack grow" style="--gap:2px"><span class="row between"><b>' + esc(P.BRAND.name) + '</b><span class="t-small muted">' + T('sekarang') + '</span></span><span class="t-small">' + T('Poin bertambah. Saldo kamu {n} poin, {t}.', { n: P.num(m.points), t: P.tierOf(m).name }) + '</span></span></button>';
    } else {
      html = '<button type="button" class="pnotif" data-act="fillOtp"><span class="pnotif-app"' + (kind === 'mail' ? ' style="background:#1f5799"' : '') + '>' + ic(kind === 'mail' ? 'mail' : 'brand-whatsapp', 20) + '</span><span class="stack grow" style="--gap:2px"><span class="row between"><b>' + (kind === 'mail' ? T('Email') + ' · ' : '') + esc(P.BRAND.name) + '</b><span class="t-small muted">' + T('sekarang') + '</span></span><span class="t-small">' + T('Kode member Kamtono: 482 913. Jangan berikan kode ini ke siapa pun.') + '</span><span class="t-small c-brand">' + T('Ketuk untuk mengisi kode') + '</span></span></button>';
    }
    l.innerHTML = html;
    if (kind === 'wallet') setTimeout(function () { if (l.firstChild) l.innerHTML = ''; }, 5000);
  }

  function sheet(title, body) {
    var l = document.getElementById('psl'); if (!l) return;
    l.innerHTML = '<div class="psheet-scrim" data-act="closeSheet"></div><div class="psheet" role="dialog" aria-label="' + esc(title) + '"><div class="psheet-grip"></div><div class="psheet-head"><span class="t-h3">' + esc(title) + '</span><button type="button" class="icon-btn" data-act="closeSheet" aria-label="' + T('Tutup') + '">' + ic('x', 18) + '</button></div><div class="psheet-body">' + body + '</div></div>';
  }
  function closeSheet() { clearInterval(qrTimer); var l = document.getElementById('psl'); if (l) l.innerHTML = ''; }

  function welcomeSheet() {
    var m = me();
    if (m.pending) { completeSheet(m); return; }
    sheet(T('Selamat datang'), '<span class="success-burst">' + ic('mood-smile', 36) + '</span><h3 class="t-h2 center">' + T('Halo {n}, kamu member Silver', { n: esc(first(m.name)) }) + '</h3><p class="sec center">' + T('Hadiah sambutan sudah ada di Voucher: gratis topping. Tunjukkan QR ke kasir setiap belanja.') + '</p>' +
      '<button type="button" class="btn btn-primary btn-block" data-act="closeSheet">' + T('Lihat kartu') + '</button><button type="button" class="btn btn-wallet btn-block" data-act="walletGo" data-v="apple">' + ic('brand-apple', 18) + '<span class="btn-label">' + T('Tambah ke Apple Wallet') + '</span></button>');
  }
  /* invited by the cashier: the customer adds a name and gives consent on their own phone */
  function completeSheet(m) {
    cs = { id: m.id, name: m.name, bday: '', consent: false, age: false, promo: false };
    function ck(k, label) { return '<label class="check" style="align-items:flex-start"><input type="checkbox" data-cs="' + k + '"><span class="check-box" style="margin-top:1px">' + ic('check', 14) + '</span><span class="check-label t-small">' + label + '</span></label>'; }
    sheet(T('Lengkapi pendaftaran'), '<p class="sec">' + T('Kasir Kamtono sudah mendaftarkan nomor {p}. Lengkapi data ini untuk mengaktifkan kartu.', { p: '<span class="num">' + esc(P.fmtPhone(m.phone)) + '</span>' }) + '</p>' +
      field(T('Nama panggilan'), '<div class="input input-lg"><input data-cs="name" value="' + esc(m.name) + '" autocomplete="name"></div>') +
      field(T('Tanggal lahir (boleh dikosongkan)'), '<div class="input input-lg"><input data-cs="bday" type="date"></div>', T('Untuk hadiah ulang tahun.')) +
      '<div class="stack" style="--gap:10px">' + ck('consent', T('Saya setuju dengan Syarat dan Kebijakan Privasi Kamtono.')) + ck('age', T('Umur saya 17 tahun ke atas, atau saya sudah dapat izin orang tua.')) + ck('promo', T('Kirim info promo ke WhatsApp saya. Bisa berhenti kapan saja.')) + '</div>' +
      '<button type="button" class="btn btn-primary btn-block" style="height:48px" data-act="completeGo" disabled>' + T('Simpan dan buka kartu') + '</button>');
  }
  function csOk() { return cs && cs.consent && cs.age && String(cs.name || '').trim(); }

  /* ── actions ── */
  ACT.go = function (el) { closeSheet(); go(el.dataset.r); document.getElementById('psb') && (document.getElementById('psb').scrollTop = 0); };
  ACT.step = function (el) {
    var r = el.dataset.r; checkDone = false;
    if (r === 'welcome') { if (!P.member('m-new')) createNew(); P.S.me = 'm-new'; userPickedNew = true; P.save(); welcomeShown = false; }
    else if (isOld(r)) { P.S.me = 'm-rina'; userPickedNew = false; P.save(); }
    if (r === 'otp') { otp = ''; joinOpen = true; }
    if (r === 'wa') { resetWa('daftar'); waBack = 'scan'; }
    if (r === 'undangan') { if (!W.lastInvite()) W.invite({ name: 'Dimas Aryo', phone: '081355508812' }); waBack = 'home'; }
    if (r === 'masuk') otp = '';
    go(r);
  };
  ACT.openJoin = function () { otp = ''; go('join'); };
  ACT.joinTab = function (el) { joinTab = el.dataset.v; renderPhone(); };
  /* open the second path and scroll the phone body (not the page) to it */
  ACT.joinForm = function () {
    joinOpen = true; renderPhone();
    var f = document.querySelector('.join-form'), b = document.getElementById('psb'); if (!f || !b) return;
    b.scrollTo({ top: f.getBoundingClientRect().top - b.getBoundingClientRect().top + b.scrollTop - 12, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  ACT.sendCode = function () { otp = ''; go('otp'); };
  ACT.resend = function () { otp = ''; renderPhone(); P.toast(T('Kode baru dikirim')); };
  ACT.fillOtp = function () { otp = W.code; renderPhone(); setTimeout(ACT.verify, 500); };
  ACT.dismissNotif = function () { var l = document.getElementById('psl'); if (l) l.innerHTML = ''; };
  ACT.verify = function () {
    if (otp.length < 6) return;
    if (route === 'masuk-kode') { signIn(); return; }
    if (route !== 'otp') return;
    createNew(); P.S.me = 'm-new'; userPickedNew = true; P.save(); welcomeShown = false; go('welcome');
  };

  /* WhatsApp: sign up by sending one message (main path) */
  ACT.openWaJoin = function () { resetWa('daftar'); waBack = route; go('wa'); };
  ACT.joinWa = ACT.openWaJoin;
  ACT.waBack = function () { var k = WA_ROUTES[route], st = k && waS[k]; go(waBack && waBack !== route ? waBack : (k === 'masuk' ? 'masuk' : k === 'otp' ? 'masuk-kode' : st && st.replied ? 'welcome' : 'scan')); };
  ACT.waSend = function (el) {
    var kind = el.dataset.k, st = wst(kind); if (st.sent) return;
    st.sent = true;
    if (kind === 'daftar') { W.joinViaWa({ name: draft.name, phone: draft.phone }); P.S.me = 'm-new'; userPickedNew = true; P.save(); }
    renderPhone();
    clearTimeout(waTimer);
    waTimer = setTimeout(function () {
      if (WA_ROUTES[route] !== kind) return;
      st.typing = true; renderPhone();
      waTimer = setTimeout(function () {
        if (WA_ROUTES[route] !== kind) return;
        st.replied = true; renderPhone();
        /* signing in: the browser page has been waiting for this message and signs in by itself */
        if (kind === 'masuk') waTimer = setTimeout(function () { if (route === 'masuk-wa') signIn(); }, 2200);
      }, 900);
    }, 600);
  };
  ACT.waOpenCard = function () { welcomeShown = false; P.S.me = 'm-new'; userPickedNew = true; P.save(); go('welcome'); };

  /* WhatsApp: invite sent by the cashier */
  ACT.openInvite = function () { ACT.dismissNotif(); waBack = route; go('undangan'); };
  ACT.waInviteOpen = function () {
    var inv = W.lastInvite(); if (!inv) return;
    inv.seen = true; P.S.me = inv.memberId; userPickedNew = true; welcomeShown = false; P.save(); go('welcome');
  };
  ACT.completeGo = function () {
    var m = cs && P.member(cs.id); if (!m || !csOk()) return;
    m.name = cs.name.trim(); m.promoWa = !!cs.promo; m.pending = false;
    if (cs.bday) m.bday = P.fdate(new Date(cs.bday).getTime(), true);
    P.S.inbox.forEach(function (i) { if (i.memberId === m.id && i.kind === 'invite') i.read = true; });
    P.save(); cs = null; closeSheet(); renderPhone(); welcomeSheet();
  };

  /* sign in again */
  ACT.logout = function () { signInAs = me().id; otp = ''; closeSheet(); go('masuk'); P.toast(T('Kamu sudah keluar'), 'logout'); };
  ACT.loginWa = function () { resetWa('masuk'); waBack = 'masuk'; go('masuk-wa'); };
  ACT.loginOtp = function () { loginVia = 'wa'; otp = ''; go('masuk-kode'); };
  ACT.loginMail = function () { loginVia = 'mail'; otp = ''; go('masuk-kode'); };
  ACT.openAuth = function () { ACT.dismissNotif(); waBack = 'masuk-kode'; go('wa-kode'); };
  ACT.copyCode = function () {
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(W.code).catch(function () {}); } catch (e) {}
    P.toast(T('Kode disalin'), 'copy'); otp = W.code; go('masuk-kode'); clearTimeout(waTimer); waTimer = setTimeout(ACT.verify, 700);
  };
  ACT.signIn = function () { signIn(); };
  function signIn() {
    clearTimeout(waTimer);
    var id = P.member(signInAs) ? signInAs : 'm-rina';
    P.S.me = id; userPickedNew = id !== 'm-rina'; otp = ''; P.save(); closeSheet(); go('home');
    var b = document.getElementById('psb'); if (b) b.scrollTop = 0;
    P.toast(T('Kamu sudah masuk'), 'login');
  }
  ACT.showQr = function () {
    var m = me(), left = 30, tick = 0;
    function body() { return '<div class="qr-box" style="width:240px;margin:0 auto">' + P.qr(m.no + ':' + tick) + '</div><div class="center stack" style="--gap:2px"><span class="t-h3">' + esc(m.name) + '</span><span class="t-small sec num">' + T('No. member') + ' ' + m.no + '</span></div>' +
      '<div class="row" style="justify-content:center">' + P.tierTag(P.tierOf(m)) + '<span class="tag tag-outline num">' + T('Kode berganti dalam {s} detik', { s: left }) + '</span></div><p class="t-small sec center">' + T('Tunjukkan ke kasir untuk dapat poin, pakai voucher, atau bayar pakai poin. Tangkapan layar tidak bisa dipakai.') + '</p>'; }
    sheet(T('QR member'), body());
    qrTimer = setInterval(function () { left -= 1; if (left <= 0) { left = 30; tick += 1; } var b = document.querySelector('.psheet-body'); if (b) b.innerHTML = body(); else clearInterval(qrTimer); }, 1000);
  };
  ACT.closeSheet = function () { closeSheet(); };
  ACT.tiers = function () {
    var m = me(), cur = P.tierOf(m);
    sheet(T('Tier member'), P.S.rules.tiers.map(function (t) {
      return '<div class="pcard"' + (t === cur ? ' style="border-color:var(--sj)"' : '') + '><div class="pcard-head">' + P.tierTag(t) + (t === cur ? '<span class="tag tag-brand">' + T('Tier kamu') + '</span>' : '') + '</div><span class="t-small sec">' + (t.min ? T('Belanja {rp} dalam 12 bulan', { rp: P.rp(t.min) }) : T('Mulai dari pembelian pertama')) + '</span>' + (P.tierMean(t) ? '<span class="tier-mean">' + esc(P.tierMean(t)) + '</span>' : '') +
        '<ul class="note-list">' + P.benefits(t).map(function (b) { return '<li>' + ic('check', 16) + '<span>' + esc(b) + '</span></li>'; }).join('') + '</ul></div>';
    }).join('') + '<p class="t-small muted">' + T('Naik tier langsung saat batas tercapai. Turun tier hanya saat tinjauan 12 bulan.') + '</p>');
  };
  ACT.voucher = function (el) {
    var v = P.S.vouchers.filter(function (x) { return x.id === el.dataset.id; })[0]; if (!v) return;
    var used = v.used;
    sheet(T(v.title), '<span class="t-small sec center">' + esc(T(v.src)) + '</span><div class="qr-box" style="width:220px;margin:0 auto;' + (used ? 'opacity:.35' : '') + '">' + P.qr(v.code) + '</div>' +
      '<div class="center t-h2 num" style="letter-spacing:.08em">' + esc(P.vcode(v.code)) + '</div>' +
      (used ? '<div class="result is-bad">' + ic('circle-x', 20) + '<span class="t-small">' + T('Sudah dipakai {d} pukul {t} di {o}.', { d: P.fdate(used.at), t: P.ftime(used.at), o: esc(P.ol(used.outlet)) }) + '</span></div>'
        : '<div class="row wrap" style="justify-content:center"><span class="tag tag-brand">' + T('Sekali pakai') + '</span><span class="tag tag-outline">' + T('Berlaku s.d. {d}', { d: P.fdate(v.exp) }) + '</span>' + (v.tier ? '<span class="tag tag-outline">' + T('Khusus {t} ke atas', { t: P.tierById(v.tier).name }) + '</span>' : '') + '</div><p class="t-small sec center">' + T('Tunjukkan QR ini ke kasir, atau sebutkan kodenya.') + '</p>') +
      '<button type="button" class="btn btn-secondary btn-block" data-act="closeSheet">' + T('Tutup') + '</button>');
  };
  ACT.vTab = function (el) { vTab = el.dataset.v; renderPhone(); };
  ACT.redeem = function (el) {
    var c = P.CATALOG.filter(function (x) { return x.id === el.dataset.id; })[0], m = me();
    sheet(T('Tukar poin'), '<p>' + T('Tukar {n} poin jadi {v}?', { n: c.pts, v: '<b>' + T(c.title) + '</b>' }) + '</p><div class="lv-list"><div class="lv-row"><span class="lv-label">' + T('Poin sekarang') + '</span><span class="lv-value num">' + P.num(m.points) + '</span></div><div class="lv-row"><span class="lv-label">' + T('Sisa poin') + '</span><span class="lv-value num">' + P.num(m.points - c.pts) + '</span></div></div>' +
      '<button type="button" class="btn btn-primary btn-block" data-act="redeemGo" data-id="' + c.id + '">' + T('Tukar') + '</button><button type="button" class="btn btn-secondary btn-block" data-act="closeSheet">' + T('Batal') + '</button>');
  };
  ACT.redeemGo = function (el) {
    var c = P.CATALOG.filter(function (x) { return x.id === el.dataset.id; })[0], m = me();
    if (m.points < c.pts) return;
    m.points -= c.pts;
    P.S.vouchers.unshift({ id: P.uid('v-'), memberId: m.id, title: c.title, src: 'Tukar poin', code: P.code('TP' + c.pts % 10), exp: Date.now() + 30 * P.DAY, kind: c.kind, value: c.value });
    P.S.log.unshift({ id: P.uid('l'), kind: 'redeem', memberId: m.id, at: Date.now(), points: -c.pts, title: c.title, by: first(m.name) });
    P.save(); closeSheet(); vTab = 'mine'; renderPhone(); P.toast(T('Voucher {v} sudah ada di Voucher saya', { v: T(c.title) }));
  };
  ACT.walletGo = function (el) { closeSheet(); walletTab = el.dataset.v; go('wallet'); };
  ACT.wTab = function (el) { walletTab = el.dataset.v; renderPhone(); };
  ACT.walletAdd = function () {
    var m = me(), ap = walletTab === 'apple';
    sheet(ap ? 'Apple Wallet' : 'Samsung Wallet', passHtml(m, walletTab) + '<p class="t-small sec center">' + T('Kartu ini akan diperbarui otomatis oleh Kamtono.') + '</p><button type="button" class="btn ' + (ap ? 'btn-wallet' : 'btn-samsung') + ' btn-block" data-act="walletAddGo">' + T('Tambah') + '</button>');
  };
  ACT.walletAddGo = function () { var m = me(); m.wallet = walletTab; P.save(); closeSheet(); renderPhone(); P.toast(T('Kartu masuk ke Wallet')); };
  ACT.walletNotif = function () { showNotif('wallet'); };
  ACT.install = function () { P.toast(T('Halaman member dipasang di layar utama (demo)')); };
  ACT.msg = function (el) {
    var i = P.S.inbox.filter(function (x) { return x.id === el.dataset.id; })[0]; if (!i) return;
    i.read = true; P.save(); renderPhone();
    var inv = i.kind === 'invite' && me().pending;
    sheet(T(i.title, iv(i.v)), '<p class="sec">' + esc(T(i.body, iv(i.v))) + '</p><span class="t-small muted">' + P.fdate(i.at) + ' · ' + P.ftime(i.at) + '</span>' +
      (inv ? '<button type="button" class="btn btn-primary btn-block" data-act="completeOpen">' + T('Lengkapi pendaftaran') + '</button>' : '<button type="button" class="btn btn-primary btn-block" data-act="go" data-r="voucher">' + T('Lihat voucher') + '</button>'));
  };
  ACT.pref = function (el) { var m = me(), k = el.dataset.k; m[k] = !m[k]; P.save(); renderPhone(); P.toast(m[k] ? T('Izin promo dinyalakan') : T('Izin promo dimatikan')); };
  ACT.exportMe = function () { P.toast(T('Data kamu dikirim ke email dalam bentuk file (demo)')); };
  ACT.deleteMe = function () {
    sheet(T('Hapus akun?'), '<p class="sec">' + T('Poin, voucher, dan riwayat kamu di Kamtono akan dihapus. Ini tidak bisa dibatalkan.') + '</p><button type="button" class="btn btn-danger btn-block" data-act="deleteGo">' + T('Hapus akun') + '</button><button type="button" class="btn btn-secondary btn-block" data-act="closeSheet">' + T('Batal') + '</button>');
  };
  ACT.deleteGo = function () {
    var m = me(); closeSheet();
    if (m.id !== 'm-new') { P.toast(T('Demo: akun contoh Rina tidak dihapus')); return; }
    P.S.members = P.S.members.filter(function (x) { return x.id !== 'm-new'; });
    P.S.vouchers = P.S.vouchers.filter(function (x) { return x.memberId !== 'm-new'; });
    P.S.log = P.S.log.filter(function (x) { return x.memberId !== 'm-new'; });
    P.S.inbox = P.S.inbox.filter(function (x) { return x.memberId !== 'm-new'; });
    P.S.me = 'm-rina'; userPickedNew = false; P.save(); P.toast(T('Akun dihapus')); go('scan');
  };
  ACT.persona = function (el) { P.S.me = el.dataset.id; userPickedNew = el.dataset.id !== 'm-rina'; P.save(); render(); };
  ACT.doCheckin = function () {
    checkDone = true;
    P.S.checkins.unshift({ id: P.uid('c'), memberId: 'm-rina', at: Date.now(), seen: false });
    P.save(); renderPhone();
    P.toast(T('Check-in terkirim ke tablet kasir'));
  };

  function createNew() {
    var now = Date.now(), ph = joinTab === 'phone';
    var digits = draft.phone.replace(/\D/g, '').replace(/^62/, '0'); if (digits[0] !== '0') digits = '0' + digits;
    ['members', 'vouchers', 'log', 'inbox'].forEach(function (k) { P.S[k] = P.S[k].filter(function (x) { return (x.memberId || x.id) !== 'm-new'; }); });
    P.S.members.unshift({ id: 'm-new', name: draft.name.trim() || 'Nadia Putri', phone: ph ? digits : '', email: ph ? '' : draft.email, spend: 0, points: 0, stamps: 0, visits: 0, joined: now, last: now,
      promoWa: ph && draft.promo, promoEmail: !ph && draft.promo, bday: draft.bday ? P.fdate(new Date(draft.bday).getTime(), true) : '', no: '2611-' + String(2000 + Math.floor(Math.random() * 7000)), wallet: '' });
    P.S.vouchers.unshift({ id: P.uid('v-'), memberId: 'm-new', title: 'Gratis topping', src: 'Hadiah sambutan', code: P.code('WL' + Math.floor(Math.random() * 9)), exp: now + 30 * P.DAY, kind: 'free', value: 8000 });
    P.S.log.unshift({ id: P.uid('l'), kind: 'join', memberId: 'm-new', at: now, by: 'QR meja kasir', outlet: 'Cempaka' });
    P.S.inbox.unshift({ id: P.uid('i'), memberId: 'm-new', ch: ph ? 'wa' : 'email', title: 'Selamat datang di Kamtono', body: 'Kamu member Silver. Voucher gratis topping sudah ada di halaman member.', at: now, read: false });
    P.S.checkins.unshift({ id: P.uid('c'), memberId: 'm-new', at: now, seen: false, isNew: true });
  }

  ACT.completeOpen = function () { completeSheet(me()); };

  /* inputs */
  app.addEventListener('input', function (e) {
    var c = e.target.getAttribute('data-cs');
    if (c && cs) { cs[c] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; var g = document.querySelector('[data-act="completeGo"]'); if (g) g.disabled = !csOk(); return; }
    var k = e.target.getAttribute('data-bind'); if (!k) return;
    if (k === 'otp') { otp = e.target.value.replace(/\D/g, '').slice(0, 6); var pos = otp.length; renderPhone(); var i = document.querySelector('.otp-input'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } if (otp.length === 6) setTimeout(ACT.verify, 300); return; }
    if (e.target.type === 'checkbox') return;
    draft[k] = k === 'phone' || k === 'lphone' ? '0' + e.target.value.replace(/\D/g, '').replace(/^0/, '') : e.target.value;
    var btn = document.querySelector('[data-act="sendCode"]');
    if (btn) { var ph = joinTab === 'phone'; btn.disabled = !(draft.consent && draft.age && draft.name.trim() && (ph ? draft.phone.replace(/\D/g, '').length >= 10 : /.+@.+\..+/.test(draft.email))); }
  });
  app.addEventListener('change', function (e) {
    var c = e.target.getAttribute('data-cs');
    if (c && cs) { cs[c] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; var g = document.querySelector('[data-act="completeGo"]'); if (g) g.disabled = !csOk(); return; }
    var k = e.target.getAttribute('data-bind'); if (k && e.target.type === 'checkbox') { draft[k] = e.target.checked; renderPhone(); }
  });

  window.addEventListener('hashchange', function () { var r = location.hash.replace(/^#\/?/, '') || 'home'; if (r !== route) { route = r; render(); } });
  P.onLang = render;
  P.onBrand = function () { clearInterval(qrTimer); render(); };
  P.onSync = function () { if (!document.querySelector('.psheet')) renderPhone(); checkInvite(); };
  if (route === 'welcome') { if (!P.member('m-new')) createNew(); P.S.me = 'm-new'; userPickedNew = true; P.save(); }
  else if (P.S.me === 'm-new' && P.member('m-new')) userPickedNew = true;
  render();
})();
