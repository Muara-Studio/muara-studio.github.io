/* Providea Loyalty demo · in-app guide.
   1. PLAsk: "ask the team" and "request access" forms. No backend: they compose an email to hello@providea.com.
   2. Guided tour per view (own small driver.js-style engine): dim overlay, spotlight, popover.
   3. "?" info dots next to key elements, and a hover chip on important buttons (mouse only).
   Never edits the views' DOM: everything lives in its own fixed layers and follows the targets. */
(function () {
  'use strict';
  var P = window.PL; if (!P) return;
  var T = P.T, esc = P.esc;
  Object.assign(window.ICONS, {
    'help': '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 17l0 .01"/><path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4"/>',
    'eye-off': '<path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"/><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"/><path d="M3 3l18 18"/>',
    'key': '<path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0"/><path d="M15 9h.01"/>',
    'mail-forward': '<path d="M12 18h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7.5"/><path d="M3 6l9 6l9 -6"/><path d="M15 18h6"/><path d="M18 15l3 3l-3 3"/>'
  });

  var MAIL = 'hello@providea.com';
  var reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  var fineMq = matchMedia('(hover: hover) and (pointer: fine)');
  function reduced() { return reduceMq.matches; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ════════════════ 1. PLAsk ════════════════ */

  /* simple interest tracker: what visitors ask about (this browser only) */
  function track(kind, feature, title, step) {
    var a = store('pl-asks'); if (!Array.isArray(a)) a = [];
    a.push({ kind: kind, feature: feature || '', title: title || '', step: step, time: new Date().toISOString(), page: (location.pathname.split('/').pop() || 'index.html') + location.hash });
    store('pl-asks', a.slice(-100));
  }
  function me() { return store('pl-ask-me') || {}; }
  function mailUrl(subject, body) { return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.replace(/\r?\n/g, '\r\n')); }
  function openMail(url) { var a = document.createElement('a'); a.href = url; a.hidden = true; document.body.appendChild(a); a.click(); a.remove(); }
  function emailOk(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function input(name, label, val, o) {
    o = o || {};
    var id = 'pg-' + name;
    var ctl = o.area ? '<textarea class="textarea" id="' + id + '" name="' + name + '" rows="' + (o.rows || 4) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + '>' + esc(val || '') + '</textarea>'
      : '<div class="input"><input id="' + id + '" name="' + name + '" type="' + (o.type || 'text') + '" value="' + esc(val || '') + '"' + (o.ac ? ' autocomplete="' + o.ac + '"' : '') + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.focus ? ' autofocus' : '') + (o.req ? ' required aria-required="true"' : '') + '></div>';
    return '<div class="field" data-f="' + name + '"><label class="field-label" for="' + id + '">' + label + (o.opt ? ' <span class="pg-opt-hint">' + T('(opsional)') + '</span>' : '') + '</label>' + ctl + '<span class="field-error" hidden></span></div>';
  }
  function note() { return '<p class="pg-honest">' + ic('info-circle', 16) + '<span>' + T('Halaman ini tidak mengirim data. Tombol di bawah membuka aplikasi email kamu dengan pesan yang sudah terisi.') + '</span></p>'; }
  function setErr(form, name, msg) {
    var f = form.querySelector('[data-f="' + name + '"]'); if (!f) return;
    var e = f.querySelector('.field-error'), box = f.querySelector('.input'); if (!e) return;
    e.hidden = !msg; e.textContent = msg || ''; if (box) box.classList.toggle('is-invalid', !!msg);
  }
  function val(form, name) { var el = form.elements[name]; return el ? String(el.value || '').trim() : ''; }
  function checkPerson(form) {
    var ok = true, n = val(form, 'name'), e = val(form, 'email');
    setErr(form, 'name', n ? '' : T('Isi nama kamu.')); if (!n) ok = false;
    setErr(form, 'email', emailOk(e) ? '' : T('Isi email yang benar, misalnya nama@merek.com.')); if (!emailOk(e)) ok = false;
    if (!ok) { var bad = form.querySelector('.is-invalid input'); if (bad) bad.focus(); }
    return ok;
  }

  function done(m, url, subject, text) {
    m.set('<div class="pg-done"><span class="pg-done-ic">' + ic('mail-forward', 22) + '</span><h3 class="t-h3">' + T('Email siap dikirim dari aplikasi email kamu') + '</h3>' +
      '<p class="sec">' + T('Pesan belum terkirim. Periksa aplikasi email yang terbuka, lalu tekan Kirim.') + '</p></div>' +
      '<div class="pg-fallback"><p class="t-small sec">' + T('Aplikasi email tidak terbuka? Salin pesan ini, lalu kirim ke {m}.', { m: '<a href="mailto:' + MAIL + '">' + MAIL + '</a>' }) + '</p>' +
      '<div class="pg-mailtext"><b>' + esc(subject) + '</b>\n\n' + esc(text) + '</div>' +
      '<div class="pg-fallback-btns"><button type="button" class="btn btn-secondary btn-sm" data-pg="copy">' + ic('copy', 16) + '<span class="btn-label">' + T('Salin pesan') + '</span></button>' +
      '<a class="btn btn-ghost btn-sm" href="' + esc(url) + '">' + ic('mail', 16) + '<span class="btn-label">' + T('Buka email lagi') + '</span></a></div></div>',
      '<button type="button" class="btn btn-primary" data-close>' + T('Selesai') + '</button>');
    m.el.querySelector('[data-pg="copy"]').onclick = function () {
      var all = subject + '\n\n' + text;
      function ok() { P.toast(T('Pesan disalin')); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(all).then(ok, fallbackCopy);
      else fallbackCopy();
      function fallbackCopy() { var ta = document.createElement('textarea'); ta.value = all; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} ta.remove(); }
    };
    var f = m.el.querySelector('.overlay-foot .btn'); if (f) f.focus();
  }
  function footer(by) { return '\n\n---\n' + T('Halaman') + ': ' + location.href + '\n' + T('Fitur yang ditanya') + ': ' + by; }

  function ask(o) {
    o = o || {};
    var feature = o.feature || 'umum', title = o.title || T('Providea Loyalty');
    track('ask', feature, title, 'open');
    var p = me();
    var m = P.modal({ title: T('Tanya tim Providea'), desc: esc(T('Tentang: {t}', { t: title })), width: 480, cls: 'pg-askm',
      body: '<form id="pgAskForm" class="pg-form" novalidate><div class="pg-row2">' + input('name', T('Nama'), p.name, { ac: 'name', req: 1, focus: !p.name }) + input('email', T('Email'), p.email, { type: 'email', ac: 'email', req: 1 }) + '</div>' +
        input('msg', T('Pesan'), T('Saya ingin tahu lebih lanjut tentang: {t}', { t: title }), { area: 1, rows: 4 }) + note() + '</form>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="submit" form="pgAskForm" class="btn btn-primary">' + ic('mail', 18) + '<span class="btn-label">' + T('Siapkan email') + '</span></button>' });
    var form = m.el.querySelector('form');
    if (p.name) setTimeout(function () { var t = form.elements.msg; if (t && m.el.isConnected) { t.focus(); t.setSelectionRange(t.value.length, t.value.length); } }, 60);
    form.addEventListener('input', function (e) { var f = e.target.closest('[data-f]'); if (f) setErr(form, f.dataset.f, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkPerson(form)) return;
      var n = val(form, 'name'), em = val(form, 'email'), msg = val(form, 'msg') || T('Saya ingin tahu lebih lanjut tentang: {t}', { t: title });
      store('pl-ask-me', { name: n, email: em });
      var subject = '[Providea Loyalty] ' + title;
      var text = T('Nama') + ': ' + n + '\n' + T('Email') + ': ' + em + '\n\n' + msg + footer(feature);
      var url = mailUrl(subject, text);
      track('ask', feature, title, 'mail');
      openMail(url); done(m, url, subject, text);
    });
    return m;
  }

  var OUTLETS = ['1', '2–5', '6–20', 'lebih dari 20'];
  function access(o) {
    o = o || {};
    var feature = o.feature || 'minta-akses';
    track('access', feature, T('Minta akses untuk merekmu'), 'open');
    var p = me();
    var m = P.modal({ title: T('Minta akses untuk merekmu'), desc: T('Ceritakan sedikit tentang merekmu. Tim kami membalas lewat email.'), width: 560, cls: 'pg-askm',
      body: '<form id="pgAccessForm" class="pg-form" novalidate><div class="pg-row2">' + input('name', T('Nama'), p.name, { ac: 'name', req: 1, focus: !p.name }) + input('email', T('Email'), p.email, { type: 'email', ac: 'email', req: 1 }) + '</div>' +
        input('brand', T('Nama merek'), '', { ac: 'organization', req: 1, focus: !!p.name, ph: T('Misalnya Kopi Senja') }) +
        '<fieldset class="field pg-fs" data-f="outlets"><legend class="field-label">' + T('Jumlah outlet') + '</legend><div class="pg-opts">' + OUTLETS.map(function (x, i) {
          return '<label class="pg-opt"><input type="radio" name="outlets" value="' + x + '"' + (i === 0 ? ' checked' : '') + '><span>' + T(x) + '</span></label>'; }).join('') + '</div></fieldset>' +
        input('pos', T('POS yang dipakai'), '', { opt: 1, ph: T('Nama aplikasi kasir, kalau ada') }) +
        input('msg', T('Pesan'), '', { area: 1, rows: 3, opt: 1, ph: T('Misalnya: kami ingin mulai di satu outlet dulu.') }) + note() + '</form>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="submit" form="pgAccessForm" class="btn btn-primary">' + ic('mail', 18) + '<span class="btn-label">' + T('Siapkan email') + '</span></button>' });
    var form = m.el.querySelector('form');
    form.addEventListener('input', function (e) { var f = e.target.closest('[data-f]'); if (f) setErr(form, f.dataset.f, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = checkPerson(form), b = val(form, 'brand');
      setErr(form, 'brand', b ? '' : T('Isi nama merekmu.'));
      if (!ok) return; if (!b) { form.elements.brand.focus(); return; }
      var n = val(form, 'name'), em = val(form, 'email'), out = (form.querySelector('[name=outlets]:checked') || {}).value || '1', pos = val(form, 'pos'), msg = val(form, 'msg');
      store('pl-ask-me', { name: n, email: em });
      var subject = '[Providea Loyalty] ' + T('Minta akses') + ': ' + b;
      var text = T('Nama') + ': ' + n + '\n' + T('Email') + ': ' + em + '\n' + T('Merek') + ': ' + b + '\n' + T('Jumlah outlet') + ': ' + T(out) + '\n' + T('POS yang dipakai') + ': ' + (pos || '-') +
        (msg ? '\n\n' + T('Pesan') + ':\n' + msg : '') + footer(feature);
      var url = mailUrl(subject, text);
      track('access', feature, b, 'mail');
      openMail(url); done(m, url, subject, text);
    });
    return m;
  }

  window.PLAsk = { open: ask, access: access, track: track, list: function () { return store('pl-asks') || []; } };
  P.ACT.ask = function (el) { ask({ feature: el.dataset.feature, title: el.dataset.title }); };
  P.ACT.access = function (el) { access({ feature: el && el.dataset && el.dataset.feature }); };

  /* ════════════════ 2. Tour definitions per view ════════════════ */
  /* sel: what to spotlight (first visible match). hover: show the hover chip on these. dot: show a "?" dot. */
  var VIEWS = {
    member: {
      role: 'pelanggan', name: 'Kartu member di HP', steps: [
        { id: 'member-alur', sel: '.mv-steps .npanel', title: 'Alur demo', text: 'Klik langkah mana saja untuk melompat. Langkah 1 sampai 3: daftar lewat WhatsApp. Langkah 4 sampai 7: cara lain. Langkah 8 sampai 14: member lama.' },
        { id: 'member-pindai', sel: '.cam-pill', hover: 1, dot: 1, title: 'Pindai QR Daftar via WhatsApp', text: 'Pelanggan memindai QR di standee dengan kamera HP. WhatsApp terbuka dengan pesan pendaftaran yang sudah terisi, tanpa unduh aplikasi.' },
        { id: 'member-wa-kirim', sel: '.wa-send.is-ready', hover: 1, dot: 1, title: 'Kirim satu pesan', text: 'Pelanggan cukup menekan kirim. Nomor WhatsApp-nya otomatis terverifikasi, tanpa kode OTP. Pesan masuk ke nomor resmi Providea Loyalty.' },
        { id: 'member-wa-balas', sel: '.wa-tbtn[data-act=waOpenCard], .wa-tbtn[data-act=waInviteOpen]', hover: 1, title: 'Balasan berisi tautan kartu', text: 'Providea Loyalty membalas dengan tautan kartu member. Member baru langsung muncul di tablet kasir dan dashboard.' },
        { id: 'member-daftar', sel: '.ps-body [data-act=joinWa]', hover: 1, dot: 1, title: 'Halaman daftar merek', text: 'Tombol utama membuka WhatsApp. Daftar dengan nomor HP atau email tetap ada sebagai cara kedua.' },
        { id: 'member-masuk-wa', sel: '.ps-body [data-act=loginWa]', hover: 1, dot: 1, title: 'Masuk lewat WhatsApp', text: 'Member yang keluar atau ganti HP mengirim kode lewat WhatsApp, lalu halaman langsung masuk. Gratis, tanpa SMS. Kode OTP dan email tetap tersedia.' },
        { id: 'member-kirim-kode', sel: '[data-act=sendCode]', hover: 1, title: 'Kirim kode', text: 'Kode 6 angka dikirim lewat WhatsApp atau email. Dengan begitu nomor dan email member pasti benar.' },
        { id: 'member-kode', sel: '.pnotif', title: 'Kode masuk', text: 'Di demo ini, ketuk notifikasi untuk mengisi kode secara otomatis.' },
        { id: 'member-verifikasi', sel: '[data-act=verify]', hover: 1, title: 'Verifikasi', text: 'Setelah kode benar, pelanggan langsung jadi member Silver dan mendapat voucher sambutan.' },
        { id: 'member-kartu', sel: '.mcard', hover: 1, dot: 1, title: 'Kartu member dan QR', text: 'Kartu ini milik merek, bukan aplikasi pihak lain. Poin, tier, dan nomor member tampil di satu tempat. Ketuk kartu untuk menampilkan QR.' },
        { id: 'member-tunjukkan-qr', sel: '.ps-body .btn-primary[data-act=showQr]', hover: 1, title: 'Tunjukkan QR ke kasir', text: 'Kasir memindai QR ini untuk menambah poin dan stempel. QR berganti tiap 30 detik, jadi tangkapan layar tidak bisa dipakai.' },
        { id: 'member-tier', sel: '.ps-body .pcard:has(.pbar)', dot: 1, title: 'Tier member', text: 'Bilah ini menunjukkan sisa belanja sampai tier berikutnya. Gold mendapat poin 1,25×, Platinum 1,5×.' },
        { id: 'member-stempel', sel: '.ps-body .pcard:has(.stamps)', dot: 1, title: 'Kartu stempel', text: 'Setiap cup menambah satu stempel. Stempel ke-10 menjadi voucher cup kecil gratis.' },
        { id: 'member-voucher', sel: '.ps-body .pcard:has(.vchip)', dot: 1, title: 'Voucher', text: 'Voucher sekali pakai dengan kode sendiri. Ketuk voucher untuk melihat QR yang dipindai kasir.' },
        { id: 'member-tukar-poin', sel: '.ps-body .seg-switch:has([data-act=vTab])', dot: 1, title: 'Voucher dan tukar poin', text: 'Lihat voucher yang dimiliki, atau tukar poin jadi voucher dari katalog merek.' },
        { id: 'member-wallet', sel: '.ps-body [data-act=go][data-r=wallet].pcard, .ps-body [data-act=walletGo], .ps-body .seg-switch:has([data-act=wTab])', hover: '.ps-body [data-act=go][data-r=wallet].pcard, .ps-body [data-act=walletGo]', dot: 1, title: 'Kartu di Wallet', text: 'Kartu bisa masuk ke Apple Wallet atau Samsung Wallet. Poin di kartu ikut berubah setelah belanja.' },
        { id: 'member-catatan', sel: '.mv-notes .npanel', title: 'Yang terjadi', text: 'Panel ini menjelaskan apa yang terjadi di balik layar pada langkah yang sedang dibuka.' }
      ]
    },
    kasir: {
      role: 'kasir', name: 'Aplikasi kasir',
      extra: function () { return document.querySelector('.k-app') && !document.querySelector('.k-member') ? 4 : 0; },
      prepare: function () {
        if (document.querySelector('.checkin-pop') && P.ACT.closeCi) P.ACT.closeCi();
        if (document.querySelector('.k-app') && !document.querySelector('.k-member') && P.ACT.pick) P.ACT.pick({ dataset: { id: 'm-rina' } });
      },
      steps: [
        { id: 'kasir-alur', sel: '.kv-steps', title: 'Alur demo kasir', text: 'Setiap tombol memutar satu kejadian di kasir: check-in, penjualan, voucher, sampai alur di POS.' },
        { id: 'kasir-cari', sel: '.k-left-top .input', dot: 1, title: 'Cari member', text: 'Ketik nomor HP, email, atau nomor member. Hasilnya muncul saat mengetik.' },
        { id: 'kasir-pindai', sel: '.k-left-top [data-act=scan]', hover: '[data-act=scan]', title: 'Pindai QR member', text: 'Kamera tablet memindai QR di HP member. Nama, tier, dan voucher langsung tampil.' },
        { id: 'kasir-wa', sel: '.k-left-top [data-act=join]', hover: '[data-act=join]', dot: 1, title: 'Member baru lewat WhatsApp', text: 'Tablet menampilkan QR Daftar via WhatsApp untuk dipindai pelanggan. Kasir juga bisa mengirim undangan WhatsApp ke nomor pelanggan, dengan persetujuannya.' },
        { id: 'kasir-member', sel: '.k-member', dot: 1, dotIn: 1, title: 'Panel member', text: 'Poin, stempel, belanja 12 bulan, dan voucher aktif terlihat sebelum transaksi.' },
        { id: 'kasir-penjualan', sel: '.k-act[data-act=sale]', hover: 1, dot: 1, title: 'Tambah penjualan', text: 'Masukkan total belanja. Poin dan stempel dihitung otomatis sesuai tier member.' },
        { id: 'kasir-voucher', sel: '.k-act[data-act=voucher]', hover: 1, title: 'Pakai voucher', text: 'Pindai QR voucher atau ketik kodenya. Voucher yang sudah dipakai tidak bisa dipakai lagi.' },
        { id: 'kasir-bayar-poin', sel: '.k-act[data-act=points]', hover: 1, title: 'Bayar pakai poin', text: 'Member membayar sebagian dengan poin. 1 poin = Rp500, dan saldo poin langsung berkurang.' },
        { id: 'kasir-pos-member', sel: '.pos-member', hover: '[data-act=posFind]', dot: 1, title: 'Member di POS', text: 'Kasir menambahkan member dari dalam POS dengan nomor HP, email, atau QR.' },
        { id: 'kasir-pos-bayar', sel: '[data-act=posPay]', hover: 1, title: 'Bayar di POS', text: 'Setelah dibayar, poin dan stempel masuk ke kartu member.' },
        { id: 'kasir-mode-pos', sel: '.k-mode', hover: '.k-mode .tab', dot: 1, title: 'Mode POS', text: 'Alur yang sama bisa jalan di POS yang sudah dipakai. Providea Loyalty terhubung dengan POS yang sudah dipakai (integrasi fleksibel).' }
      ]
    },
    dash: {
      role: 'pemilik merek', name: 'Dashboard pemilik', steps: [
        { id: 'dash-menu', sel: '.sidebar .sb-nav, .m-dash-bar [data-act=drawer]', title: 'Menu pemilik', text: 'Semua bagian dashboard ada di sini: ringkasan, member, segmen, tier dan poin, voucher, kampanye, serta outlet dan staf.' },
        { id: 'dash-ringkasan', sel: '[data-w="kpis"]', dot: 1, dotIn: 1, title: 'Ringkasan angka', text: 'Member baru, join rate, member aktif, repeat rate, poin beredar, dan voucher dipakai. Semua angka di demo ini angka contoh.' },
        { id: 'dash-periode', sel: '.page-head .tabs-segmented:has([data-act=period])', hover: '[data-act=period]', title: 'Periode', text: 'Ganti 7, 30, atau 90 hari. Angka di halaman ikut berubah.' },
        { id: 'dash-laporan', sel: '[data-act=report]', hover: 1, title: 'Unduh laporan', text: 'Unduh angka periode ini sebagai file CSV.' },
        { id: 'dash-member', side: 'right', sel: '.sidebar .sb-item[href="#/member"]', title: 'Member', text: 'Daftar semua member dengan tier, poin, dan kunjungan. Klik satu baris untuk melihat riwayatnya.' },
        { id: 'dash-tier', side: 'right', sel: '.sidebar .sb-item[href="#/tier"]', title: 'Tier dan poin', text: 'Atur syarat tier, nilai poin, stempel, dan masa berlaku. Pratinjau hitungan muncul sebelum disimpan.' },
        { id: 'dash-voucher', side: 'right', sel: '.sidebar .sb-item[href="#/voucher"]', title: 'Voucher', text: 'Buat voucher dan pilih pemicunya: saat daftar, naik tier, ulang tahun, atau tukar poin.' },
        { id: 'dash-kampanye', side: 'right', sel: '.sidebar .sb-item[href="#/kampanye"]', title: 'Kampanye dengan biaya', text: 'Kirim promo ke satu segmen lewat WhatsApp, email, atau Wallet. Perkiraan biaya terlihat sebelum dikirim.' },
        { id: 'dash-outlet', side: 'right', sel: '.sidebar .sb-item[href="#/outlet"]', title: 'Outlet dan staf', text: 'Tambah outlet, undang staf, atur hak akses tiap peran, dan lihat log audit.' },
        { id: 'dash-whatsapp', side: 'right', sel: '.sidebar .sb-item[href="#/whatsapp"]', title: 'WhatsApp', text: 'Nomor pengirim Providea Loyalty, template pesan, batas kirim harian, dan biaya per pesan.' },
        /* inner pages */
        { id: 'dash-cari-member', sel: '.page .input:has(#mq)', title: 'Cari dan saring member', text: 'Cari nama atau nomor, lalu saring per tier atau segmen. Hasilnya bisa diekspor ke CSV.' },
        { id: 'dash-detail-member', sel: 'tr[data-act=openM]', title: 'Detail member', text: 'Klik satu baris untuk melihat poin, voucher, dan riwayat member itu.' },
        { id: 'dash-syarat-tier', sel: '.tier-cards', dot: 1, dotIn: 1, title: 'Syarat tier', text: 'Setiap tier punya syarat belanja 12 bulan dan pengali poin. Klik Ubah untuk menggantinya.' },
        { id: 'dash-simpan-aturan', sel: '[data-act=rulesSave]', hover: 1, title: 'Simpan aturan', text: 'Aturan baru dipakai untuk transaksi berikutnya. Setiap perubahan tercatat di log audit.' },
        { id: 'dash-buat-voucher', sel: '[data-act=newV]', hover: 1, title: 'Buat voucher', text: 'Pilih isi voucher, pemicu, tier, dan masa berlaku.' },
        { id: 'dash-kampanye-baru', sel: '.page-head a[href="#/kampanye/baru"]', hover: 'a[href^="#/kampanye/baru"]', title: 'Kampanye baru', text: 'Pilih segmen dan saluran, tulis pesan, lalu lihat biayanya sebelum mengirim.' },
        { id: 'dash-saluran', sel: '.ch-cards', dot: 1, title: 'Saluran', text: 'Pilih WhatsApp, email, atau notifikasi Wallet. Tarif WhatsApp tampil per pesan, sebelum PPN.' },
        { id: 'dash-biaya', sel: '.npanel:has([data-act=csend])', dot: 1, dotIn: 1, title: 'Perkiraan biaya', text: 'Biaya dihitung dari jumlah member di segmen dan tarif tiap saluran, sebelum pesan dikirim.' },
        { id: 'dash-kirim', sel: '[data-act=csend]', hover: 1, title: 'Kirim kampanye', text: 'Di demo ini tidak ada pesan yang benar-benar terkirim.' },
        { id: 'dash-wa-biaya', sel: '.npanel:has(.wa-cost)', dot: 1, dotIn: 1, title: 'Biaya per pesan', text: 'Utility dan authentication sekitar Rp357, marketing sekitar Rp586, sebelum PPN 11%. Balasan untuk pesan dari member gratis.' },
        { id: 'dash-wa-tahap', sel: '.wa-next', title: 'Nomor milik merek sendiri', text: 'Sekarang pesan dikirim dari nomor Providea Loyalty. Nomor WhatsApp milik merek sendiri menyusul di tahap berikutnya.' },
        { id: 'dash-standee', sel: '[data-act=standee]', hover: 1, dot: 1, title: 'QR standee', text: 'Cetak QR untuk meja kasir. QR yang sama dipakai untuk daftar dan check-in.' },
        { id: 'dash-undang', sel: '[data-act=invite]', hover: 1, title: 'Undang staf', text: 'Undang kasir dan kepala outlet. Hak akses mengikuti peran.' }
      ]
    }
  };
  var VKEY = ['member', 'kasir', 'dash'].filter(function (k) { return document.body.classList.contains(k); })[0];
  var V = VKEY ? VIEWS[VKEY] : null;
  function stepById(id) { return V && V.steps.filter(function (s) { return s.id === id; })[0]; }

  /* ── geometry ── */
  function visible(el) {
    if (!el || !el.isConnected) return false;
    var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
    return getComputedStyle(el).visibility !== 'hidden';
  }
  function find(sel) { var l; try { l = document.querySelectorAll(sel); } catch (e) { return null; } for (var i = 0; i < l.length; i++) if (visible(l[i]) && !l[i].closest('.pg-layer')) return l[i]; return null; }
  function clipRect(el) {
    var r = el.getBoundingClientRect(), x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom;
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      var cs = getComputedStyle(p);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { var q = p.getBoundingClientRect(); x1 = Math.max(x1, q.left); y1 = Math.max(y1, q.top); x2 = Math.min(x2, q.right); y2 = Math.min(y2, q.bottom); }
      if (cs.position === 'fixed') break;
    }
    x1 = Math.max(x1, 0); y1 = Math.max(y1, 0); x2 = Math.min(x2, innerWidth); y2 = Math.min(y2, innerHeight);
    return { left: x1, top: y1, right: x2, bottom: y2, width: Math.max(0, x2 - x1), height: Math.max(0, y2 - y1) };
  }
  /* bottom edge of the sticky bars at the top (demo bar, dashboard top bar) */
  function headerBottom() {
    var b = 0;
    document.querySelectorAll('#demobar, .topbar, .m-dash-bar').forEach(function (h) { var r = h.getBoundingClientRect(); if (r.height && r.top < 130 && r.bottom > b) { var p = getComputedStyle(h).position; if (p === 'sticky' || p === 'fixed') b = r.bottom; } });
    return b;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ── shared layer ── */
  var layer = document.createElement('div'); layer.className = 'pg-layer';
  document.body.appendChild(layer);

  /* ════════════════ 3. Tour engine ════════════════ */
  var tour = null;
  function steps0() { return V.steps.filter(function (s) { return find(s.sel); }); }
  function count() { return steps0().length + (V.extra ? V.extra() : 0); }

  function start(fromId, single, el) {
    if (!V) return;
    close(true); hideChip(); menu(false); hideWelcome();
    if (!single && V.prepare) V.prepare();
    var list = single ? [stepById(fromId)] : steps0();
    if (!list.length || !list[0]) { P.toast(T('Tidak ada bagian untuk dijelaskan di layar ini.'), 'info-circle'); return; }
    var i = 0; if (fromId && !single) list.forEach(function (s, k) { if (s.id === fromId) i = k; });
    var root = document.createElement('div'); root.className = 'pg-tour';
    root.innerHTML = '<div class="pg-block" data-b="t"></div><div class="pg-block" data-b="b"></div><div class="pg-block" data-b="l"></div><div class="pg-block" data-b="r"></div>' +
      '<div class="pg-spot"></div><div class="pg-pop" role="dialog" aria-modal="false" aria-labelledby="pgPopTitle" tabindex="-1"></div>';
    layer.appendChild(root);
    tour = { list: list, i: i, single: !!single, root: root, spot: root.querySelector('.pg-spot'), pop: root.querySelector('.pg-pop'), pin: el || null, key: '', back: document.activeElement };
    root.addEventListener('click', onTourClick);
    requestAnimationFrame(function () { root.classList.add('is-on'); });
    renderDots();
    go(i);
    loop();
  }
  function go(i) {
    if (!tour) return;
    tour.i = clamp(i, 0, tour.list.length - 1);
    var s = tour.list[tour.i];
    var el = tour.pin && visible(tour.pin) ? tour.pin : find(s.sel);
    tour.target = el; tour.key = '';
    tour.root.classList.add('is-moving'); clearTimeout(tour.mv); tour.mv = setTimeout(function () { if (tour) tour.root.classList.remove('is-moving'); }, 420);
    var n = tour.list.length, last = tour.i === n - 1;
    tour.pop.innerHTML = (tour.single ? '' : '<span class="pg-prog" aria-hidden="true"><span style="width:' + ((tour.i + 1) / n * 100).toFixed(1) + '%"></span></span>') +
      '<div class="pg-pop-head"><span class="pg-kicker">' + (tour.single ? ic('help', 14) + T('Apa fungsinya?') : T('Langkah {x} dari {y}', { x: tour.i + 1, y: n })) + '</span></div>' +
      '<h3 class="pg-pop-title" id="pgPopTitle">' + T(s.title) + '</h3><p class="pg-pop-text">' + T(s.text) + '</p>' +
      '<button type="button" class="pg-askl" data-pg="ask">' + ic('message-question', 16) + T('Tanya tim tentang ini') + '</button>' +
      '<div class="pg-pop-foot">' + (tour.single
        ? '<button type="button" class="btn btn-ghost btn-sm" data-pg="close">' + T('Tutup') + '</button><span class="grow"></span><button type="button" class="btn btn-primary btn-sm" data-pg="cont">' + T('Lanjut tur') + ic('arrow-right', 16) + '</button>'
        : '<button type="button" class="btn btn-ghost btn-sm" data-pg="close">' + T('Tutup') + '</button><span class="grow"></span>' +
          (tour.i > 0 ? '<button type="button" class="btn btn-secondary btn-sm" data-pg="prev">' + T('Kembali') + '</button>' : '') +
          '<button type="button" class="btn btn-primary btn-sm" data-pg="next">' + (last ? T('Selesai') : T('Lanjut') + ic('arrow-right', 16)) + '</button>') + '</div>';
    var cr = el ? clipRect(el) : null, full = el && Math.abs(cr.height - el.getBoundingClientRect().height) < 2 && cr.top >= headerBottom() && cr.bottom <= innerHeight - 8;
    if (el && !full) {
      var tall = el.getBoundingClientRect().height > innerHeight * 0.55, prev = el.style.scrollMarginTop;
      if (tall) el.style.scrollMarginTop = (headerBottom() + 16) + 'px';
      el.scrollIntoView({ block: tall ? 'start' : 'center', inline: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
      if (tall) setTimeout(function () { el.style.scrollMarginTop = prev; }, 1200);
    }
    place();
    var b = tour.pop.querySelector('[data-pg="next"], [data-pg="cont"]'); if (b) b.focus({ preventScroll: true });
  }
  function onTourClick(e) {
    var b = e.target.closest('[data-pg]');
    if (e.target.closest('.pg-block')) { close(); return; }
    if (!b) return;
    var k = b.dataset.pg, s = tour.list[tour.i];
    if (k === 'close') close();
    else if (k === 'next') { if (tour.i >= tour.list.length - 1) { close(); P.toast(T('Tur selesai. Titik ? di layar menjelaskan bagian lain.'), 'circle-check'); } else go(tour.i + 1); }
    else if (k === 'prev') go(tour.i - 1);
    else if (k === 'cont') { var id = s.id; close(true); start(steps0().some(function (x) { return x.id === id; }) ? id : null); }
    else if (k === 'ask') { close(true); ask({ feature: s.id, title: T(s.title) }); }
  }
  function close(silent) {
    if (!tour) return;
    var t = tour; tour = null; cancelAnimationFrame(t.raf);
    t.root.classList.remove('is-on'); t.root.classList.add('is-off');
    setTimeout(function () { t.root.remove(); schedule(); }, reduced() ? 0 : 160);
    if (!silent && t.back && t.back.isConnected && t.back.focus) t.back.focus({ preventScroll: true });
    renderDots();
  }
  function loop() { if (!tour) return; place(); tour.raf = requestAnimationFrame(loop); }
  function place() {
    if (!tour) return;
    var s = tour.list[tour.i];
    if (!tour.target || !tour.target.isConnected || !visible(tour.target)) tour.target = (tour.pin && visible(tour.pin)) ? tour.pin : find(s.sel);
    var el = tour.target, r = el ? clipRect(el) : null, pad = 6, vw = innerWidth, vh = innerHeight;
    if (r && (r.width < 2 || r.height < 2)) r = null;
    var pop = tour.pop, pw = pop.offsetWidth, ph = pop.offsetHeight;
    var key = r ? [r.left, r.top, r.width, r.height].map(Math.round).join() : 'none';
    key += '|' + vw + 'x' + vh + '|' + pw + 'x' + ph;
    if (key === tour.key) return;
    tour.key = key;
    var sp = tour.spot.style;
    var hole = r ? { l: r.left - pad, t: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 } : { l: vw / 2, t: vh / 2, w: 0, h: 0 };
    sp.transform = 'translate(' + hole.l + 'px,' + hole.t + 'px)'; sp.width = hole.w + 'px'; sp.height = hole.h + 'px';
    if (el) { var br = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0; sp.borderRadius = Math.min(24, br + pad) + 'px'; }
    tour.spot.classList.toggle('is-empty', !r);
    var B = tour.root.querySelectorAll('.pg-block');
    function box(n, l, t, w, h) { var st = B[n].style; st.left = l + 'px'; st.top = t + 'px'; st.width = Math.max(0, w) + 'px'; st.height = Math.max(0, h) + 'px'; }
    box(0, 0, 0, vw, hole.t); box(1, 0, hole.t + hole.h, vw, vh - hole.t - hole.h); box(2, 0, hole.t, hole.l, hole.h); box(3, hole.l + hole.w, hole.t, vw - hole.l - hole.w, hole.h);
    /* popover */
    var m = 12, gap = 12, hb = headerBottom(), x, y;
    pop.classList.toggle('is-docked', vw < 640);
    if (vw < 640) {
      var below = r ? vh - (r.bottom + pad) : vh, above = r ? (r.top - pad) - hb : 0;
      x = m; y = (below >= ph + m * 2 || below >= above) ? vh - ph - m : hb + 8;
    } else if (!r) { x = (vw - pw) / 2; y = vh - ph - 24; }
    else {
      var cand = {
        bottom: [r.left + r.width / 2 - pw / 2, r.bottom + pad + gap], top: [r.left + r.width / 2 - pw / 2, r.top - pad - gap - ph],
        right: [r.right + pad + gap, r.top + r.height / 2 - ph / 2], left: [r.left - pad - gap - pw, r.top + r.height / 2 - ph / 2]
      };
      var order = r.height > vh * 0.45 ? ['right', 'left', 'bottom', 'top'] : ['bottom', 'top', 'right', 'left'], pick = null;
      if (s.side) order = [s.side].concat(order.filter(function (o) { return o !== s.side; }));
      for (var i = 0; i < order.length && !pick; i++) {
        var c = cand[order[i]], ok = order[i] === 'bottom' ? c[1] + ph <= vh - m : order[i] === 'top' ? c[1] >= hb + m : order[i] === 'right' ? c[0] + pw <= vw - m : c[0] >= m;
        if (ok) pick = c;
      }
      if (!pick) pick = [vw - pw - 24, vh - ph - 24];
      x = clamp(pick[0], m, vw - pw - m); y = clamp(pick[1], hb + m, vh - ph - m);
    }
    pop.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  }

  /* keyboard + clicks inside the spotlight (the visitor tries the real button: let it through, end the tour) */
  document.addEventListener('keydown', function (e) {
    if (!tour) { if (e.key === 'Escape') { hideChip(); menu(false); } return; }
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '');
    if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); close(); }
    else if (!typing && e.key === 'ArrowRight' && !tour.single) { e.preventDefault(); if (tour.i < tour.list.length - 1) go(tour.i + 1); }
    else if (!typing && e.key === 'ArrowLeft' && !tour.single) { e.preventDefault(); if (tour.i > 0) go(tour.i - 1); }
  }, true);
  document.addEventListener('click', function (e) {
    if (tour && tour.target && tour.target.contains(e.target)) close(true);
  }, true);

  /* ════════════════ 4. Info dots ════════════════ */
  var dotsLayer = document.createElement('div'); dotsLayer.className = 'pg-dots'; layer.appendChild(dotsLayer);
  var dotEls = {};
  function dotsOn() { var v = store('pl-guide-dots'); return v !== false; }
  function renderDots() {
    if (!V) return;
    var on = dotsOn() && !tour && !document.querySelector('.overlay[data-open]');
    var want = {};
    if (on) V.steps.forEach(function (s) { if (s.dot) { var el = find(s.sel); if (el) want[s.id] = el; } });
    Object.keys(dotEls).forEach(function (id) { if (!want[id]) dotEls[id].hidden = true; });
    dotsLayer.classList.add('is-probing');
    Object.keys(want).forEach(function (id) {
      var el = want[id], r = clipRect(el), s = stepById(id);
      var d = dotEls[id];
      if (!d) {
        d = dotEls[id] = document.createElement('button'); d.type = 'button'; d.className = 'pg-dot'; d.dataset.id = id; d.hidden = true;
        d.innerHTML = '<span aria-hidden="true">?</span>';
        dotsLayer.appendChild(d);
      }
      d.setAttribute('aria-label', T('Apa fungsinya: {t}', { t: T(s.title) })); d.title = T(s.title);
      var show = r.width > 14 && r.height > 14;
      if (show) {
        var px = r.right - 10, py = r.top + 10, hit = document.elementFromPoint(px, py);
        show = !!hit && (hit === el || el.contains(hit));
      }
      d.hidden = !show;
      if (show) {
        var ix = s.dotIn ? r.right - 30 : r.right - 13, iy = s.dotIn ? r.top + 12 : r.top - 7;
        d.style.transform = 'translate(' + Math.round(clamp(ix, 2, innerWidth - 22)) + 'px,' + Math.round(Math.max(iy, 2)) + 'px)';
      }
    });
    dotsLayer.classList.remove('is-probing');
  }
  dotsLayer.addEventListener('click', function (e) { var d = e.target.closest('.pg-dot'); if (d) start(d.dataset.id, true); });

  /* ════════════════ 5. Hover chip (mouse only) ════════════════ */
  var chip = document.createElement('div'); chip.className = 'pg-chip'; chip.setAttribute('role', 'toolbar'); chip.hidden = true; layer.appendChild(chip);
  var chipFor = null, chipStep = null, chipT = 0, hideT = 0, pending = null;
  function arm(h) { clearTimeout(chipT); pending = h; chipT = setTimeout(function () { if (pending === h && h.el.isConnected && h.el.matches(':hover')) showChip(h.el, h.s); }, 520); }
  function hoverHit(t) {
    if (!V || !t || !t.closest || t.closest('.pg-layer, .overlay')) return null;
    for (var i = 0; i < V.steps.length; i++) {
      var s = V.steps[i]; if (!s.hover) continue;
      var el = t.closest(s.hover === 1 ? s.sel : s.hover);
      if (el) return { el: el, s: s };
    }
    return null;
  }
  function showChip(el, s) {
    if (tour || !el.isConnected || !visible(el)) return;
    chipFor = el; chipStep = s; pending = null;
    chip.innerHTML = '<button type="button" data-c="what">' + ic('help', 15) + T('Apa fungsinya?') + '</button><span class="pg-chip-sep"></span><button type="button" data-c="ask">' + ic('message-question', 15) + T('Tanya tim') + '</button>';
    chip.hidden = false; chip.classList.remove('is-in');
    var r = el.getBoundingClientRect(), cw = chip.offsetWidth, ch = chip.offsetHeight, hb = headerBottom();
    var y = r.top - ch - 6; if (y < hb + 4) y = r.bottom + 6;
    var x = clamp(r.left + r.width / 2 - cw / 2, 8, innerWidth - cw - 8);
    chip.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    requestAnimationFrame(function () { chip.classList.add('is-in'); });
  }
  function hideChip(keep) { if (keep && chipFor && !pending) pending = { el: chipFor, s: chipStep };
    clearTimeout(chipT); clearTimeout(hideT); chip.hidden = true; chipFor = null; chipStep = null; if (keep && pending) arm(pending); else pending = null; }
  function hideSoon() { clearTimeout(hideT); hideT = setTimeout(function () { hideChip(); }, 280); }
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse' || !fineMq.matches || tour || !V) return;
    if (chip.contains(e.target)) { clearTimeout(hideT); return; }
    var h = hoverHit(e.target);
    if (h && h.el === chipFor) { clearTimeout(hideT); return; }
    clearTimeout(chipT); pending = null;
    if (!h) { if (chipFor) hideSoon(); return; }
    if (chipFor) hideSoon();
    arm(h);
  }, true);
  document.addEventListener('pointerdown', function (e) { if (!chip.contains(e.target)) hideChip(); }, true);
  chip.addEventListener('click', function (e) {
    var b = e.target.closest('[data-c]'); if (!b || !chipStep) return;
    var s = chipStep, el = chipFor; hideChip();
    if (b.dataset.c === 'what') start(s.id, true, el); else ask({ feature: s.id, title: T(s.title) });
  });

  /* ════════════════ 6. Floating "Tur halaman ini" button ════════════════ */
  var fab = null, welcome = null;
  function renderFab() {
    if (!V) return;
    if (!fab) {
      fab = document.createElement('div'); fab.className = 'pg-fabw'; layer.appendChild(fab);
      fab.addEventListener('click', function (e) {
        var b = e.target.closest('[data-f]'); if (!b) return;
        var k = b.dataset.f;
        if (k === 'fab') { menu(fab.querySelector('.pg-menu').hidden); return; }
        menu(false);
        if (k === 'tour') start();
        else if (k === 'ask') ask({ feature: VKEY + '-umum', title: T(V.name) });
        else if (k === 'access') access({ feature: 'minta-akses-' + VKEY });
        else if (k === 'dots') { store('pl-guide-dots', !dotsOn()); renderFab(); renderDots(); P.toast(dotsOn() ? T('Titik bantuan ditampilkan') : T('Titik bantuan disembunyikan'), dotsOn() ? 'eye' : 'eye-off'); }
      });
    }
    var open = !!fab.querySelector('.pg-menu:not([hidden])');
    fab.innerHTML = '<div class="pg-menu" role="menu" aria-label="' + T('Bantuan demo') + '"' + (open ? '' : ' hidden') + '>' +
      '<button type="button" role="menuitem" class="menu-item" data-f="tour">' + ic('route', 18) + '<span class="menu-label">' + T('Mulai tur') + '</span><span class="menu-hint num" data-n></span></button>' +
      '<button type="button" role="menuitem" class="menu-item" data-f="ask">' + ic('message-question', 18) + '<span class="menu-label">' + T('Tanya tim') + '</span></button>' +
      '<button type="button" role="menuitem" class="menu-item" data-f="access">' + ic('key', 18) + '<span class="menu-label">' + T('Minta akses') + '</span></button>' +
      '<div class="menu-divider"></div>' +
      '<button type="button" role="menuitem" class="menu-item" data-f="dots">' + ic(dotsOn() ? 'eye-off' : 'eye', 18) + '<span class="menu-label">' + (dotsOn() ? T('Sembunyikan titik bantuan') : T('Tampilkan titik bantuan')) + '</span></button></div>' +
      '<button type="button" class="pg-fab" data-f="fab" aria-haspopup="menu" aria-expanded="' + open + '" aria-label="' + T('Tur halaman ini') + '">' + ic('help', 20) + '<span class="pg-fab-label">' + T('Tur halaman ini') + '</span></button>';
    placeFab();
  }
  function menu(open) {
    if (!fab) return;
    var m = fab.querySelector('.pg-menu'), b = fab.querySelector('.pg-fab'); if (!m) return;
    if (open) { var n = count(); var h = m.querySelector('[data-n]'); if (h) h.textContent = T('{n} langkah', { n: n }); hideWelcome(); }
    m.hidden = !open; b.setAttribute('aria-expanded', !!open);
    if (open) { var f = m.querySelector('.menu-item'); if (f) f.focus(); }
  }
  document.addEventListener('click', function (e) { if (fab && !fab.contains(e.target)) menu(false); });
  /* keep the button above the member phone's tab bar on small screens */
  /* on phones the button sits in the free gap of the demo bar, so it never covers the view; else bottom-right */
  function barSlot() {
    if (innerWidth >= 768) return null;
    var bar = document.getElementById('demobar'); if (!bar) return null;
    var br = bar.getBoundingClientRect(), nav = bar.querySelector('nav'), acts = bar.querySelector('.demobar-actions');
    if (!nav || !acts || br.height < 40 || br.top < -1 || br.top > 2) return null;
    var first = null; [].forEach.call(acts.children, function (c) { var r = c.getBoundingClientRect(); if (r.width && (!first || r.left < first.left)) first = r; });
    var nr = nav.getBoundingClientRect(); if (!first) return null;
    var gap = first.left - nr.right; if (gap < 44) return null;
    return { x: Math.round(nr.right + (gap - 36) / 2), y: Math.round(br.top + (br.height - 36) / 2) };
  }
  function placeFab() {
    if (!fab) return;
    var slot = barSlot();
    fab.classList.toggle('is-top', !!slot);
    if (slot) { fab.style.setProperty('--pg-x', slot.x + 'px'); fab.style.setProperty('--pg-y', slot.y + 'px'); fab.classList.remove('is-compact'); return; }
    var lift = innerWidth < 768 ? 16 : 24, tb = document.querySelector('.ps-tabbar, .wa-compose');  /* the member phone's tab bar, or the WhatsApp compose bar */
    if (tb && visible(tb)) { var r = tb.getBoundingClientRect(); if (r.bottom >= innerHeight - 4 && r.top < innerHeight) lift = Math.max(lift, innerHeight - r.top + 12); }
    fab.style.setProperty('--pg-lift', lift + 'px');
    if (innerWidth >= 768) {
      var fx = innerWidth - 24 - 170, fy = innerHeight - lift - 44, hit = false;
      document.querySelectorAll('.tablet, .phone').forEach(function (d) { var q = d.getBoundingClientRect(); if (q.width && q.right > fx && q.left < innerWidth - 24 && q.bottom > fy && q.top < innerHeight - lift) hit = true; });
      fab.classList.toggle('is-compact', hit);
    } else fab.classList.remove('is-compact');
  }

  /* welcome bubble after "Masuk ke demo" (masuk.html sends ?tur=1) */
  function showWelcome() {
    if (!fab || tour) return;
    var n = count();
    welcome = document.createElement('div'); welcome.className = 'pg-welcome'; welcome.setAttribute('role', 'dialog'); welcome.setAttribute('aria-labelledby', 'pgWTitle');
    welcome.innerHTML = '<div class="pg-pop-head"><span class="pg-kicker">' + ic('user-circle', 14) + T('Akun demo · data contoh') + '</span></div>' +
      '<h3 class="pg-pop-title" id="pgWTitle">' + T('Kamu masuk sebagai {r}', { r: T(V.role) }) + '</h3>' +
      '<p class="pg-pop-text">' + T('Tur singkat menunjukkan fungsi tiap bagian. Klik titik ? atau arahkan kursor ke tombol penting untuk bertanya kapan saja.') + '</p>' +
      '<div class="pg-pop-foot"><button type="button" class="btn btn-ghost btn-sm" data-w="close">' + T('Nanti') + '</button><span class="grow"></span><button type="button" class="btn btn-primary btn-sm" data-w="go">' + T('Mulai tur') + ' <span class="num">· ' + T('{n} langkah', { n: n }) + '</span></button></div>';
    fab.appendChild(welcome);
    welcome.addEventListener('click', function (e) { var b = e.target.closest('[data-w]'); if (!b) return; e.stopPropagation(); hideWelcome(); if (b.dataset.w === 'go') start(); });
    var g = welcome.querySelector('[data-w="go"]'); if (g) g.focus({ preventScroll: true });
  }
  function hideWelcome() { if (welcome) { welcome.remove(); welcome = null; } }

  /* ════════════════ wiring ════════════════ */
  var queued = false;
  function schedule() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; renderDots(); placeFab(); if (chipFor && (!chipFor.isConnected || !visible(chipFor))) hideChip(); }); }
  addEventListener('scroll', function () { hideChip(true); schedule(); }, { capture: true, passive: true });
  addEventListener('resize', schedule);
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) if (!layer.contains(ms[i].target)) { schedule(); return; }
  }).observe(document.body, { childList: true, subtree: true });
  /* language switch: core calls ACT.lang, the view re-renders; relabel our pieces too */
  var langOrig = P.ACT.lang;
  if (langOrig) P.ACT.lang = function (el, e) { langOrig(el, e); renderFab(); schedule(); if (tour) go(tour.i); };

  window.PLGuide = { start: function (id) { start(id || null); }, explain: function (id) { start(id, true); }, close: function () { close(); }, view: VKEY || null };

  if (V) {
    renderFab(); schedule();
    var q = new URLSearchParams(location.search);
    if (q.has('tur')) {
      history.replaceState(null, '', location.pathname + location.hash);
      setTimeout(showWelcome, 700);
    }
  }
})();
