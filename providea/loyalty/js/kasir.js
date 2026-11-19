/* Providea Loyalty demo · cashier tablet: the Providea cashier web app, and the same flow inside a connected POS. */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc, ACT = P.ACT;
  P.setView('kasir');
  var app = document.getElementById('app');

  var mode = location.hash === '#/pos' ? 'pos' : 'kasir';
  var sel = null, leftTab = 'checkin', q = '';
  var cart = [], posMember = null, posVoucher = null, posPoints = 0, posCat = P.BRAND.cats[0][0], posReceipt = P.S.receiptNo + 1;
  var STEPS = [['checkin', 'Check-in muncul'], ['find', 'Cari atau pindai member'], ['join', 'Daftarkan member baru'], ['sale', 'Tambah penjualan'], ['voucher', 'Pakai voucher'], ['points', 'Bayar pakai poin'], ['void', 'Batalkan penjualan'], ['pos', 'Alur di POS']];

  function ts() { return document.getElementById('ts'); }
  function cur() { return sel ? P.member(sel) : null; }
  function startOfDay() { var d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function todaySales() { return P.S.log.filter(function (l) { return l.kind === 'sale' && l.at >= startOfDay(); }).sort(function (a, b) { return b.at - a.at; }); }
  function vIcon(v) { return v.kind === 'pct' ? 'percentage' : v.kind === 'rp' ? 'discount' : 'gift'; }

  function render() {
    app.innerHTML = '<div class="kv"><div class="kv-steps" aria-label="' + T('Alur demo') + '">' + STEPS.map(function (s, i) {
      return '<button type="button" class="chip" data-act="demo" data-k="' + s[0] + '"><b class="num">' + (i + 1) + '</b>' + T(s[1]) + '</button>';
    }).join('') + '</div>' +
      '<div class="tablet dev-black"><div class="tablet-screen" id="ts"><div class="ts-app" id="tsa"></div></div></div>' +
      '<p class="t-small muted center" style="max-width:720px;padding:0 16px">' + T('Tablet kasir Kamtono, Outlet Cempaka. Merek, orang, dan angka fiktif. Data demo tersimpan di browser ini dan ikut muncul di tampilan HP member dan dashboard.') + '</p></div>';
    renderTablet();
  }
  function renderTablet() {
    var el = document.getElementById('tsa'); if (!el) return;
    el.innerHTML = '<div class="k-bar"><span class="logo-mark">' + P.mark(22) + '</span><span class="k-bar-brand">' + P.sjLogo(28) + '<span class="k-bar-title"><span class="t-strong ellip">' + T('Kasir') + ' · ' + esc(P.BRAND.name) + '</span><span class="t-small sec ellip">' + T('Outlet Cempaka · Ayu Kartika (kasir)') + '</span></span></span>' +
      '<div class="grow"></div><nav class="tabs-segmented tabs-sm k-mode" aria-label="' + T('Mode kasir') + '"><button type="button" class="tab' + (mode === 'kasir' ? ' is-active' : '') + '" data-act="mode" data-v="kasir">' + ic('device-tablet', 16) + T('Aplikasi kasir') + '</button><button type="button" class="tab' + (mode === 'pos' ? ' is-active' : '') + '" data-act="mode" data-v="pos">' + ic('cash-register', 16) + T('Di POS') + '</button></nav>' +
      '<span class="k-status">' + T('Online · tersinkron') + '</span></div>' + (mode === 'kasir' ? kasirApp() : posApp());
    if (mode === 'pos') P.visit('pos');
  }

  /* ── Cashier web app ── */
  function kasirApp() {
    var list;
    if (q.trim()) {
      var qq = q.toLowerCase().replace(/[\s-]/g, ''), res = P.S.members.filter(function (m) { return (m.phone && m.phone.indexOf(qq.replace(/^\+?62/, '0')) >= 0) || (m.email && m.email.toLowerCase().indexOf(qq) >= 0) || m.name.toLowerCase().replace(/\s/g, '').indexOf(qq) >= 0 || m.no.replace('-', '').indexOf(qq) >= 0; });
      list = '<div class="steps-group">' + T('Hasil cari') + ' <span class="num">' + res.length + '</span></div>' + (res.length ? res.map(function (m) { return mRow(m, P.maskPhone(m.phone) || m.email); }).join('') : '<p class="t-small sec" style="padding:8px 10px">' + T('Tidak ada member dengan data itu. Daftarkan sebagai member baru?') + '</p><div style="padding:0 10px"><button type="button" class="btn btn-secondary btn-sm" data-act="join">' + ic('user-plus', 16) + '<span class="btn-label">' + T('Daftarkan member baru') + '</span></button></div>');
    } else if (leftTab === 'checkin') {
      var cis = P.S.checkins.slice(0, 12);
      list = cis.length ? cis.map(function (c) { var m = P.member(c.memberId); return m ? mRow(m, T('QR meja kasir') + ' · ' + P.ago(c.at), c.isNew) : ''; }).join('') : '<div class="empty"><span class="empty-icon">' + ic('scan', 20) + '</span><p class="empty-text t-small">' + T('Belum ada check-in. Member memindai QR di meja kasir, lalu namanya muncul di sini.') + '</p></div>';
    } else {
      var ss = todaySales();
      list = ss.length ? ss.map(function (l) {
        var m = P.member(l.memberId); if (!m) return '';
        return '<div class="k-row' + (sel === m.id ? ' is-active' : '') + '"><button type="button" class="k-row-main" style="text-align:left" data-act="pick" data-id="' + m.id + '"><span class="row between"><span class="t-strong ellip' + (l.void ? ' strike' : '') + '">' + esc(m.name) + '</span><span class="num t-strong' + (l.void ? ' strike' : '') + '">' + P.rp(l.amount) + '</span></span><span class="t-small sec">' + P.ftime(l.at) + ' · ' + l.receipt + ' · ' + (l.void ? '<span class="c-danger">' + T('Dibatalkan') + '</span>' : T('{n} poin', { n: '+' + l.points })) + '</span></button>' +
          (l.void ? '' : '<button type="button" class="icon-btn icon-btn-sm" data-act="void" data-id="' + l.id + '" aria-label="' + T('Batalkan penjualan') + '" title="' + T('Batalkan penjualan') + '">' + ic('arrow-back-up', 16) + '</button>') + '</div>';
      }).join('') : '<p class="t-small sec" style="padding:10px">' + T('Belum ada penjualan hari ini.') + '</p>';
    }
    return '<div class="k-app"><aside class="k-left"><div class="k-left-top">' +
      '<div class="input"><span class="input-icon">' + ic('search', 18) + '</span><input id="kq" placeholder="' + T('Nomor HP, email, atau nomor member') + '" value="' + esc(q) + '" aria-label="' + T('Cari member') + '"></div>' +
      '<div class="row"><button type="button" class="btn btn-secondary btn-sm grow" data-act="scan">' + ic('scan', 16) + '<span class="btn-label">' + T('Pindai QR') + '</span></button><button type="button" class="btn btn-secondary btn-sm grow" data-act="join">' + ic('user-plus', 16) + '<span class="btn-label">' + T('Member baru') + '</span></button></div>' +
      '<div class="tabs-segmented tabs-sm" style="width:100%"><button type="button" class="tab' + (leftTab === 'checkin' ? ' is-active' : '') + '" data-act="left" data-v="checkin">' + T('Check-in') + ' <span class="tab-count num">' + P.S.checkins.length + '</span></button><button type="button" class="tab' + (leftTab === 'sales' ? ' is-active' : '') + '" data-act="left" data-v="sales">' + T('Penjualan hari ini') + ' <span class="tab-count num">' + todaySales().length + '</span></button></div></div>' +
      '<div class="k-list">' + list + '</div></aside><section class="k-main">' + memberPanel() + '</section></div>';
  }
  function mRow(m, sub, isNew) {
    return '<button type="button" class="k-row' + (sel === m.id ? ' is-active' : '') + '" data-act="pick" data-id="' + m.id + '">' + P.avatar(m, 36) + '<span class="k-row-main"><span class="row" style="--gap:6px"><span class="t-strong ellip">' + esc(m.name) + '</span>' + P.tierTag(P.tierOf(m), true) + (isNew ? '<span class="tag tag-info tag-sm">' + T('Baru') + '</span>' : '') + '</span><span class="t-small sec ellip">' + sub + '</span></span></button>';
  }
  function memberPanel() {
    var m = cur();
    if (!m) return '<div class="empty k-empty"><span class="empty-icon">' + ic('users', 22) + '</span><h2 class="t-h3">' + T('Pilih member untuk mulai') + '</h2><p class="empty-text">' + T('Cari dengan nomor HP atau email, pindai QR di HP member, atau buka check-in terbaru di kiri.') + '</p><div class="empty-actions"><button type="button" class="btn btn-primary" data-act="scan">' + ic('scan', 18) + '<span class="btn-label">' + T('Pindai QR member') + '</span></button><button type="button" class="btn btn-secondary" data-act="join">' + ic('user-plus', 18) + '<span class="btn-label">' + T('Daftarkan member baru') + '</span></button></div></div>';
    var t = P.tierOf(m), nt = P.nextTier(m), R = P.S.rules, vs = P.memberVouchers(m.id);
    var acts = P.S.log.filter(function (l) { return l.memberId === m.id; }).sort(function (a, b) { return b.at - a.at; }).slice(0, 5);
    return '<div class="k-member">' + P.avatar(m, 56) + '<div class="stack grow" style="--gap:4px"><span class="row wrap" style="--gap:8px"><span class="t-h2">' + esc(m.name) + '</span>' + P.tierTag(t) + (m.override ? '<span class="tag tag-outline tag-sm" title="' + esc(T(m.overrideWhy || '')) + '">' + T('tier manual') + '</span>' : '') + '</span>' +
      '<span class="t-small sec num">' + (m.phone ? P.maskPhone(m.phone) : esc(m.email)) + ' · ' + T('No. member') + ' ' + m.no + ' · ' + T('member sejak {d}', { d: P.fmonth(m.joined) }) + '</span></div><button type="button" class="btn btn-ghost btn-sm" data-act="clear">' + ic('x', 16) + '<span class="btn-label">' + T('Ganti member') + '</span></button></div>' +
      '<div class="k-stats"><div class="k-stat"><span class="t-small sec">' + T('Poin') + '</span><span class="k-stat-val">' + P.num(m.points) + '</span><span class="t-small sec">' + T('senilai {rp}', { rp: P.rp(m.points * R.pointValue) }) + '</span></div>' +
      '<div class="k-stat"><span class="t-small sec">' + T('Stempel') + '</span><span class="k-stat-val">' + m.stamps + ' / ' + R.stampGoal + '</span><span class="t-small sec">' + T('{n} cup lagi, cup kecil gratis', { n: R.stampGoal - m.stamps }) + '</span></div>' +
      '<div class="k-stat"><span class="t-small sec">' + T('Belanja 12 bulan') + '</span><span class="k-stat-val">' + P.rp(m.spend) + '</span>' + (nt ? '<div class="pbar' + (P.tierLook(t) === 'gold' ? ' is-gold' : '') + '"><span style="width:' + Math.min(100, m.spend / nt.min * 100).toFixed(1) + '%"></span></div><span class="t-small sec">' + T('{rp} lagi ke {t}', { rp: P.rp(nt.min - m.spend), t: nt.name }) + '</span>' : '<span class="t-small sec">' + T('Tier tertinggi') + '</span>') + '</div></div>' +
      '<div class="k-actions"><button type="button" class="k-act is-primary" data-act="sale">' + ic('receipt', 24) + '<span class="t-h3">' + T('Tambah penjualan') + '</span><span class="t-small sec">' + T('Poin dan stempel masuk otomatis') + '</span></button>' +
      '<button type="button" class="k-act" data-act="voucher">' + ic('ticket', 24) + '<span class="t-h3">' + T('Pakai voucher') + '</span><span class="t-small sec">' + T('Pindai QR atau ketik kode · {n} aktif', { n: vs.length }) + '</span></button>' +
      '<button type="button" class="k-act" data-act="points">' + ic('coins', 24) + '<span class="t-h3">' + T('Bayar pakai poin') + '</span><span class="t-small sec">' + T('1 poin = {rp}', { rp: P.rp(R.pointValue) }) + '</span></button></div>' +
      '<div class="dash-2e" style="gap:16px"><div class="npanel"><div class="npanel-head"><span class="npanel-title">' + ic('ticket', 16) + T('Voucher member') + '<span class="npanel-count">' + vs.length + '</span></span></div><div class="npanel-body pad-sm stack" style="--gap:8px">' +
      (vs.length ? vs.map(function (v) { return '<div class="vrow"><span class="vchip-ic">' + ic(vIcon(v), 20) + '</span><span class="vchip-main"><span class="t-strong ellip">' + esc(T(v.title)) + '</span><span class="t-small sec">' + T('s.d. {d}', { d: P.fdate(v.exp, true) }) + (v.tier ? ' · ' + T('khusus {t}', { t: P.tierById(v.tier).name }) : '') + '</span></span><button type="button" class="btn btn-secondary btn-sm" data-act="useV" data-id="' + v.id + '">' + T('Pakai') + '</button></div>'; }).join('') : '<p class="t-small sec">' + T('Tidak ada voucher aktif.') + '</p>') + '</div></div>' +
      '<div class="npanel"><div class="npanel-head"><span class="npanel-title">' + ic('history', 16) + T('Aktivitas terakhir') + '</span></div><div class="npanel-body pad-sm"><div class="timeline">' + acts.map(actItem).join('') + '</div></div></div></div>';
  }
  function actItem(l) {
    var title = '', side = '';
    if (l.kind === 'sale') { title = (l.void ? T('Penjualan dibatalkan') : T('Penjualan')) + ' ' + P.rp(l.amount); side = l.void ? T('{n} poin', { n: '−' + l.points }) : T('{n} poin', { n: '+' + l.points }); }
    else if (l.kind === 'tier') title = T('Naik ke {t}', { t: esc(P.tn(l.title)) });
    else if (l.kind === 'redeem') { title = T('Tukar poin: {v}', { v: T(l.title) }); side = T('{n} poin', { n: '−' + Math.abs(l.points) }); }
    else if (l.kind === 'pay') { title = T('Bayar pakai poin'); side = T('{n} poin', { n: '−' + Math.abs(l.points) }); }
    else if (l.kind === 'voucher') title = T('Voucher dipakai: {v}', { v: T(l.title) });
    else if (l.kind === 'join') title = T('Jadi member');
    else if (l.kind === 'adjust') { title = T('Penyesuaian poin'); side = T('{n} poin', { n: (l.points > 0 ? '+' : '−') + Math.abs(l.points) }); }
    return '<div class="tl-item' + (l.kind === 'tier' ? ' tl-current' : ' tl-signed') + '"><span class="tl-mark"></span><span class="tl-main"><span class="tl-title' + (l.void ? ' strike' : '') + '">' + title + '</span><span class="tl-sub">' + P.fdate(l.at, true) + ' · ' + P.ftime(l.at) + (l.by ? ' · ' + esc(T(l.by)) : '') + '</span></span><span class="tl-side"><span class="tl-date num">' + side + '</span></span></div>';
  }

  /* keypad amount control */
  function keypad(id) { var k = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del']; return '<div class="keypad" data-pad="' + id + '">' + k.map(function (x) { return '<button type="button" data-key="' + x + '" aria-label="' + (x === 'del' ? T('Hapus') : x) + '">' + (x === 'del' ? ic('backspace', 20) : x) + '</button>'; }).join('') + '</div>'; }
  function padKey(val, key) { var s = String(val || ''); if (key === 'del') s = s.slice(0, -1); else s = (s === '0' ? '' : s) + key; var n = parseInt(s || '0', 10); return Math.min(n, 99999999); }

  /* ── Add sale ── */
  ACT.sale = function () {
    var m = cur(); if (!m) return;
    var st = { amount: P.BRAND.sale0.amount, cups: P.BRAND.sale0.cups, receipt: 'C-00' + (P.S.receiptNo + 1) };
    var md = P.modal({ host: ts(), title: T('Tambah penjualan'), desc: esc(m.name) + ' · ' + P.tierOf(m).name, width: 760 });
    function draw() {
      var pts = P.earnFor(st.amount, m), room = Math.max(0, P.S.rules.capDay - P.earnedToday(m)), got = Math.min(pts, room), t = P.tierOf(m), base = Math.floor(st.amount / P.S.rules.earnPer);
      var stampsAfter = m.stamps + st.cups;
      md.set('<div class="two-col"><div class="stack" style="--gap:12px"><div class="amount">' + P.rp(st.amount) + '</div>' +
        '<div class="row wrap">' + P.BRAND.quick.map(function (c, i) { return '<button type="button" class="chip" data-quick="' + c[1] + '" data-add="' + (i === 3 ? 1 : 0) + '">' + T(c[0]) + ' <span class="num muted">' + P.rp(c[1]) + '</span></button>'; }).join('') + '</div>' + keypad('sale') + '</div>' +
        '<div class="stack" style="--gap:14px"><div class="field"><span class="field-label">' + T('Jumlah cup froyo') + '</span><span class="stepper"><button type="button" data-cups="-1" aria-label="' + T('Kurangi') + '"' + (st.cups <= 0 ? ' disabled' : '') + '>' + ic('minus', 16) + '</button><span class="stepper-value num">' + st.cups + '</span><button type="button" data-cups="1" aria-label="' + T('Tambah') + '">' + ic('plus', 16) + '</button></span><span class="field-hint">' + T('1 cup = 1 stempel') + '</span></div>' +
        '<label class="field"><span class="field-label">' + T('No. struk') + '</span><span class="input"><input id="srec" value="' + st.receipt + '"></span></label>' +
        '<div class="preview-box"><div class="row between"><span class="sec">' + T('Poin didapat') + '</span><b class="num">' + T('{n} poin', { n: '+' + got }) + '</b></div><div class="t-small sec num">' + T('{b} poin dasar × {x} ({t})', { b: base, x: P.dec(t.mult), t: t.name }) + '</div>' +
        '<div class="row between"><span class="sec">' + T('Stempel') + '</span><b class="num">+' + st.cups + ' (' + Math.min(stampsAfter, P.S.rules.stampGoal) + '/' + P.S.rules.stampGoal + ')</b></div>' +
        '<div class="row between"><span class="sec">' + T('Belanja 12 bulan') + '</span><b class="num">' + P.rp(m.spend + st.amount) + '</b></div></div>' +
        (got < pts ? '<div class="demo-note">' + ic('alert-triangle', 14) + '<span>' + T('Batas poin harian member tercapai. Poin yang masuk: {n}.', { n: got }) + '</span></div>' : '') +
        (st.amount >= 1000000 ? '<div class="demo-note">' + ic('alert-triangle', 14) + '<span>' + T('Penjualan besar. Tercatat di peringatan pemilik.') + '</span></div>' : '') +
        (stampsAfter >= P.S.rules.stampGoal ? '<div class="result is-ok">' + ic('gift', 18) + '<span class="t-small">' + T('Kartu stempel penuh. Voucher cup kecil gratis dibuat otomatis.') + '</span></div>' : '') + '</div></div>',
        '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="sgo"' + (st.amount > 0 ? '' : ' disabled') + '>' + ic('check', 18) + '<span class="btn-label">' + T('Simpan penjualan') + '</span></button>');
      md.el.querySelector('#srec').oninput = function (e) { st.receipt = e.target.value; };
      md.el.querySelector('#sgo').onclick = function () {
        var r = P.recordSale(m, st.amount, st.cups, { receipt: st.receipt, channel: 'kasir' }); P.save();
        md.set(successHtml(m, r), '<button type="button" class="btn btn-primary" data-close>' + T('Selesai') + '</button>');
        renderTablet();
      };
    }
    md.el.addEventListener('click', function (e) {
      var k = e.target.closest('[data-key]'), qk = e.target.closest('[data-quick]'), c = e.target.closest('[data-cups]');
      if (k) { st.amount = padKey(st.typed || k.dataset.key === 'del' ? st.amount : 0, k.dataset.key); st.typed = true; draw(); }  /* the first key replaces the prefilled amount */
      else if (qk) { st.amount = qk.dataset.add === '1' ? st.amount + +qk.dataset.quick : +qk.dataset.quick; st.typed = true; draw(); }
      else if (c) { st.cups = Math.max(0, st.cups + +c.dataset.cups); draw(); }
    });
    draw();
  };
  function successHtml(m, r) {
    return '<div class="stack center" style="--gap:12px;padding:8px 0"><span class="success-burst">' + ic('circle-check', 36) + '</span><h3 class="t-h2">' + T('{n} poin', { n: '+' + r.points }) + (r.stamps ? ' · ' + T('{n} stempel', { n: '+' + r.stamps }) : '') + '</h3>' +
      '<p class="sec">' + T('Saldo {n} poin. {name} dapat pesan WhatsApp berisi poin baru.', { n: P.num(m.points), name: esc(m.name.split(' ')[0]) }) + '</p>' +
      (r.tierUp ? '<div class="result is-ok" style="text-align:left">' + ic('crown', 20) + '<div class="stack" style="--gap:2px"><span class="t-strong">' + T('Naik ke {t}', { t: esc(r.tierUp.name) }) + '</span><span class="t-small">' + T('Kartu Wallet dan halaman member ikut berubah sekarang.') + '</span></div></div>' : '') +
      (r.reward ? '<div class="result is-ok" style="text-align:left">' + ic('gift', 20) + '<div class="stack" style="--gap:2px"><span class="t-strong">' + T('Kartu stempel penuh') + '</span><span class="t-small">' + T('Voucher cup kecil gratis sudah masuk ke halaman member.') + '</span></div></div>' : '') +
      (r.capped ? '<div class="demo-note">' + ic('alert-triangle', 14) + '<span>' + T('Batas poin harian tercapai.') + '</span></div>' : '') + '</div>';
  }

  /* ── Voucher: scan or code ── */
  ACT.voucher = function (el, e, preset) {
    var m = cur(), tab = preset ? 'code' : 'scan', codeVal = preset || '', result = null;
    var md = P.modal({ host: ts(), title: T('Pakai voucher'), desc: m ? esc(m.name) : '', width: 560 });
    function check(c) {
      c = (c || '').trim().toUpperCase(); codeVal = c;
      var key = P.vcodeIn(c), v = P.S.vouchers.filter(function (x) { return x.code === key; })[0];
      if (!v) result = { bad: T('Kode tidak ditemukan. Cek lagi huruf dan angkanya.') };
      else if (v.used) result = { bad: T('Voucher sudah dipakai {d} pukul {t} di {o}, oleh {by}.', { d: P.fdate(v.used.at), t: P.ftime(v.used.at), o: esc(P.ol(v.used.outlet)), by: esc(v.used.by) }), v: v };
      else if (v.exp < Date.now()) result = { bad: T('Voucher kedaluwarsa sejak {d}.', { d: P.fdate(v.exp) }), v: v };
      else if (v.tier && P.S.rules.tiers.indexOf(P.tierOf(P.member(v.memberId))) < P.S.rules.tiers.indexOf(P.tierById(v.tier))) result = { bad: T('Voucher ini khusus {t} ke atas.', { t: P.tierById(v.tier).name }), v: v };
      else result = { ok: true, v: v };
      draw();
    }
    function draw() {
      var own = m ? P.memberVouchers(m.id) : [], used = m ? P.S.vouchers.filter(function (v) { return v.memberId === m.id && v.used; }) : [];
      var res = '';
      if (result && result.ok) { var vm = P.member(result.v.memberId); res = '<div class="result is-ok">' + ic('circle-check', 20) + '<div class="stack" style="--gap:2px"><span class="t-strong">' + T('Voucher sah: {v}', { v: esc(T(result.v.title)) }) + '</span><span class="t-small">' + esc(vm.name) + ' · ' + T('berlaku s.d. {d}', { d: P.fdate(result.v.exp) }) + ' · ' + T('sekali pakai') + '</span></div></div>'; }
      else if (result) res = '<div class="result is-bad">' + ic('circle-x', 20) + '<div class="stack" style="--gap:2px"><span class="t-strong">' + T('Voucher tidak bisa dipakai') + '</span><span class="t-small">' + result.bad + '</span></div></div>';
      md.set('<div class="tabs-segmented tabs-sm" style="margin-bottom:12px"><button type="button" class="tab' + (tab === 'scan' ? ' is-active' : '') + '" data-tab="scan">' + ic('scan', 16) + T('Pindai QR') + '</button><button type="button" class="tab' + (tab === 'code' ? ' is-active' : '') + '" data-tab="code">' + ic('pencil', 16) + T('Ketik kode') + '</button></div>' +
        (tab === 'scan' ? '<div class="k-cam"><div class="cam-frame"><span class="scanline"></span></div><span style="position:absolute;bottom:12px" class="t-small">' + T('Arahkan kamera ke QR voucher di HP member') + '</span></div><div class="t-small sec mt-12">' + T('Simulasi pindai untuk demo:') + '</div><div class="row wrap mt-8">' +
          own.concat(used.slice(0, 1)).map(function (v) { return '<button type="button" class="chip" data-code="' + v.code + '">' + ic(v.used ? 'ban' : 'qrcode', 14) + esc(T(v.title)) + (v.used ? ' · ' + T('sudah dipakai') : '') + '</button>'; }).join('') + '</div>'
          : '<div class="row"><span class="input grow"><input id="vcode" placeholder="' + P.vcode('KMT-XXX-XXX') + '" value="' + esc(codeVal) + '" aria-label="' + T('Kode voucher') + '" autocomplete="off"></span><button type="button" class="btn btn-secondary" id="vchk">' + T('Cek') + '</button></div><p class="field-hint mt-8">' + T('Coba kode KMT-WL8-H2D untuk melihat voucher yang sudah dipakai.') + '</p>') +
        (res ? '<div class="mt-16">' + res + '</div>' : ''),
        '<button type="button" class="btn btn-secondary" data-close>' + T('Tutup') + '</button>' + (result && result.ok ? '<button type="button" class="btn btn-primary" id="vgo">' + ic('check', 18) + '<span class="btn-label">' + T('Pakai voucher sekarang') + '</span></button>' : ''));
      var go = md.el.querySelector('#vgo');
      if (go) go.onclick = function () {
        var v = result.v; v.used = { at: Date.now(), by: 'Ayu', outlet: 'Cempaka' };
        P.S.log.unshift({ id: P.uid('l'), kind: 'voucher', memberId: v.memberId, at: Date.now(), title: v.title, by: 'Ayu', outlet: 'Cempaka' }); P.save();
        md.set('<div class="stack center" style="--gap:12px;padding:8px 0"><span class="success-burst">' + ic('ticket', 32) + '</span><h3 class="t-h2">' + T('Voucher dipakai') + '</h3><p class="sec">' + T('{v} untuk {name}. Kode ini tidak bisa dipakai lagi.', { v: esc(T(v.title)), name: esc(P.member(v.memberId).name) }) + '</p></div>', '<button type="button" class="btn btn-primary" data-close>' + T('Selesai') + '</button>');
        renderTablet();
      };
      var chk = md.el.querySelector('#vchk'); if (chk) { chk.onclick = function () { check(md.el.querySelector('#vcode').value); }; md.el.querySelector('#vcode').onkeydown = function (e) { if (e.key === 'Enter') check(e.target.value); }; }
    }
    md.el.addEventListener('click', function (e) { var t = e.target.closest('[data-tab]'), c = e.target.closest('[data-code]'); if (t) { tab = t.dataset.tab; result = null; draw(); } else if (c) check(c.dataset.code); });
    draw();
    if (preset) check(preset);
  };
  ACT.useV = function (el) { var v = P.S.vouchers.filter(function (x) { return x.id === el.dataset.id; })[0]; if (v) ACT.voucher(null, null, v.code); };

  /* ── Pay with points ── */
  ACT.points = function () {
    var m = cur(); if (!m) return;
    var R = P.S.rules, st = { bill: 42000, use: 0 };
    var md = P.modal({ host: ts(), title: T('Bayar pakai poin'), desc: esc(m.name) + ' · ' + T('{n} poin', { n: P.num(m.points) }), width: 760 });
    function max() { return Math.max(0, Math.min(m.points, Math.floor(st.bill / R.pointValue))); }
    function draw() {
      st.use = Math.min(st.use, max());
      var cut = st.use * R.pointValue, rest = st.bill - cut, earn = P.earnFor(rest, m);
      md.set('<div class="two-col"><div class="stack" style="--gap:12px"><span class="field-label">' + T('Total tagihan') + '</span><div class="amount">' + P.rp(st.bill) + '</div>' + keypad('bill') + '</div>' +
        '<div class="stack" style="--gap:14px"><div class="field"><span class="field-label">' + T('Poin yang dipakai') + '</span><input type="range" id="prange" min="0" max="' + max() + '" step="1" value="' + st.use + '" aria-label="' + T('Poin yang dipakai') + '"><div class="row between"><span class="t-h3 num">' + T('{n} poin', { n: P.num(st.use) }) + '</span><button type="button" class="btn btn-secondary btn-sm" id="pmax">' + T('Pakai maksimal') + '</button></div><span class="field-hint">' + T('1 poin = {rp}. Maksimal {n} poin untuk tagihan ini.', { rp: P.rp(R.pointValue), n: max() }) + '</span></div>' +
        '<div class="lv-list"><div class="lv-row"><span class="lv-label">' + T('Tagihan') + '</span><span class="lv-value num">' + P.rp(st.bill) + '</span></div><div class="lv-row"><span class="lv-label">' + T('Potongan poin') + '</span><span class="lv-value num c-success">' + P.rp(-cut) + '</span></div><div class="lv-row is-total"><span class="lv-label">' + T('Sisa bayar') + '</span><span class="lv-value num t-h3">' + P.rp(rest) + '</span></div><div class="lv-row"><span class="lv-label">' + T('Poin baru dari sisa bayar') + '</span><span class="lv-value num">' + T('{n} poin', { n: '+' + earn }) + '</span></div></div>' +
        '<div class="info-note">' + ic('info-circle', 16) + '<span>' + T('Member menyebut "pakai poin" di kasir. Poin dipotong setelah member setuju. Sisa bayar lewat tunai, QRIS, atau kartu.') + '</span></div></div></div>',
        '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="pgo"' + (st.use > 0 ? '' : ' disabled') + '>' + ic('coins', 18) + '<span class="btn-label">' + T('Potong {n} poin', { n: P.num(st.use) }) + '</span></button>');
      md.el.querySelector('#prange').oninput = function (e) { st.use = +e.target.value; draw(); var r = md.el.querySelector('#prange'); r && r.focus(); };
      md.el.querySelector('#pmax').onclick = function () { st.use = max(); draw(); };
      md.el.querySelector('#pgo').onclick = function () {
        var used = st.use, cut2 = used * R.pointValue, rest2 = st.bill - cut2;
        m.points -= used;
        P.S.log.unshift({ id: P.uid('l'), kind: 'pay', memberId: m.id, at: Date.now(), points: -used, amount: cut2, by: 'Ayu', outlet: 'Cempaka' });
        var r = rest2 > 0 ? P.recordSale(m, rest2, 1, { channel: 'kasir', paidPoints: used }) : null; P.save();
        md.set('<div class="stack center" style="--gap:12px;padding:8px 0"><span class="success-burst">' + ic('coins', 32) + '</span><h3 class="t-h2">' + T('Potongan {rp}', { rp: P.rp(cut2) }) + '</h3><p class="sec">' + T('{n} poin dipakai. Sisa bayar {rp}.', { n: P.num(used), rp: P.rp(rest2) }) + (r ? ' ' + T('Poin baru {n}. Saldo sekarang {s} poin.', { n: '+' + r.points, s: P.num(m.points) }) : '') + '</p></div>', '<button type="button" class="btn btn-primary" data-close>' + T('Selesai') + '</button>');
        renderTablet();
      };
    }
    md.el.addEventListener('click', function (e) { var k = e.target.closest('[data-key]'); if (k) { st.bill = padKey(st.billTyped || k.dataset.key === 'del' ? st.bill : 0, k.dataset.key); st.billTyped = true; draw(); } });
    draw();
  };

  /* ── Void a sale ── */
  ACT.void = function (el) {
    var l = P.S.log.filter(function (x) { return x.id === el.dataset.id; })[0]; if (!l || l.void) return;
    var m = P.member(l.memberId);
    var md = P.modal({ host: ts(), title: T('Batalkan penjualan?'), desc: l.receipt + ' · ' + P.ftime(l.at) + ' · ' + esc(m.name), width: 500,
      body: '<div class="lv-list"><div class="lv-row"><span class="lv-label">' + T('Nominal') + '</span><span class="lv-value num">' + P.rp(l.amount) + '</span></div><div class="lv-row"><span class="lv-label">' + T('Poin ditarik') + '</span><span class="lv-value num c-danger">' + T('{n} poin', { n: '−' + l.points }) + '</span></div><div class="lv-row"><span class="lv-label">' + T('Stempel ditarik') + '</span><span class="lv-value num c-danger">−' + l.stamps + '</span></div></div>' +
        '<label class="field mt-16"><span class="field-label">' + T('Alasan') + '</span><span class="select"><select id="vwhy"><option>' + T('Salah input nominal') + '</option><option>' + T('Pelanggan batal') + '</option><option>' + T('Retur produk') + '</option><option>' + T('Lainnya') + '</option></select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span><span class="field-hint">' + T('Pembatalan tercatat di log audit, dengan nama kasir.') + '</span></label>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Kembali') + '</button><button type="button" class="btn btn-danger" id="vdo">' + ic('arrow-back-up', 18) + '<span class="btn-label">' + T('Batalkan penjualan') + '</span></button>' });
    md.el.querySelector('#vdo').onclick = function () {
      var why = md.el.querySelector('#vwhy').value;
      l.void = true; l.voidWhy = why; m.points = Math.max(0, m.points - l.points); m.stamps = Math.max(0, m.stamps - l.stamps); m.spend = Math.max(0, m.spend - l.amount); m.visits = Math.max(0, m.visits - 1);
      P.addAudit('Ayu Kartika', 'Membatalkan penjualan {r} (alasan: {why})', { r: l.receipt, why: why }); P.save();
      md.close(); sel = m.id; renderTablet(); P.toast(T('Penjualan {r} dibatalkan. Poin ditarik.', { r: l.receipt }));
    };
  };

  /* ── Scan member QR (simulated camera) ── */
  ACT.scan = function (el, e, forPos) {
    var md = P.modal({ host: ts(), title: T('Pindai QR member'), desc: T('Kamera tablet membaca QR di HP member.'), width: 520 });
    var opts = ['m-rina', 'm-bagus', 'm-putri', 'm-new'].map(P.member).filter(Boolean);
    md.set('<div class="k-cam"><div class="cam-frame"><span class="scanline"></span></div><span style="position:absolute;bottom:12px" class="t-small">' + T('Arahkan kamera ke QR di HP member') + '</span></div><div class="t-small sec mt-12">' + T('Simulasi pindai untuk demo:') + '</div><div class="row wrap mt-8">' +
      opts.map(function (m) { return '<button type="button" class="chip" data-mid="' + m.id + '">' + ic('qrcode', 14) + esc(m.name) + '</button>'; }).join('') + '</div>');
    md.el.addEventListener('click', function (ev) { var c = ev.target.closest('[data-mid]'); if (!c) return; md.close(); if (forPos) { posMember = c.dataset.mid; } else { sel = c.dataset.mid; q = ''; } renderTablet(); P.toast(T('Member ditemukan: {n}', { n: P.member(c.dataset.mid).name })); });
  };

  /* ── Join at the till ── */
  ACT.join = function () {
    var st = { tab: 'phone', name: 'Dimas Aryo', phone: '081355508812', email: '', consent: false, step: 1, code: '' };
    var md = P.modal({ host: ts(), title: T('Daftarkan member baru'), desc: T('Member mendaftar di kasir dengan nomor HP atau email.'), width: 520 });
    function draw() {
      if (st.step === 1) {
        var ok = st.consent && st.name.trim() && (st.tab === 'phone' ? st.phone.replace(/\D/g, '').length >= 10 : /.+@.+\..+/.test(st.email));
        md.set('<div class="tabs-segmented tabs-sm" style="margin-bottom:12px"><button type="button" class="tab' + (st.tab === 'phone' ? ' is-active' : '') + '" data-jt="phone">' + ic('brand-whatsapp', 16) + T('Nomor HP') + '</button><button type="button" class="tab' + (st.tab === 'email' ? ' is-active' : '') + '" data-jt="email">' + ic('mail', 16) + T('Email') + '</button></div><div class="stack" style="--gap:12px">' +
          '<label class="field"><span class="field-label">' + T('Nama panggilan') + '</span><span class="input"><input data-j="name" value="' + esc(st.name) + '"></span></label>' +
          (st.tab === 'phone' ? '<label class="field"><span class="field-label">' + T('Nomor WhatsApp') + '</span><span class="input"><input data-j="phone" inputmode="tel" value="' + esc(st.phone) + '"></span></label>' : '<label class="field"><span class="field-label">' + T('Email') + '</span><span class="input"><input data-j="email" type="email" value="' + esc(st.email) + '" placeholder="nama@example.com"></span></label>') +
          '<label class="check" style="align-items:flex-start"><input type="checkbox" data-j="consent"' + (st.consent ? ' checked' : '') + '><span class="check-box" style="margin-top:1px">' + ic('check', 14) + '</span><span class="check-label t-small">' + T('Member sudah membaca dan setuju syarat serta kebijakan privasi Kamtono (ditampilkan di layar pelanggan).') + '</span></label></div>',
          '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="jgo"' + (ok ? '' : ' disabled') + '>' + ic(st.tab === 'phone' ? 'brand-whatsapp' : 'mail', 18) + '<span class="btn-label">' + (st.tab === 'phone' ? T('Kirim kode ke WhatsApp member') : T('Kirim kode ke email member')) + '</span></button>');
        md.el.querySelector('#jgo').onclick = function () { st.step = 2; draw(); };
      } else {
        md.set('<p class="sec">' + (st.tab === 'phone' ? T('Kode 6 angka terkirim ke WhatsApp {to}. Minta member membacakan kodenya.', { to: P.fmtPhone(st.phone) }) : T('Kode 6 angka terkirim ke {to}. Minta member membacakan kodenya.', { to: esc(st.email) })) + '</p>' +
          '<label class="field mt-12"><span class="field-label">' + T('Kode dari member') + '</span><span class="input input-lg"><input data-j="code" inputmode="numeric" maxlength="6" value="' + esc(st.code) + '" placeholder="······" style="font-size:20px;letter-spacing:.2em"></span><span class="field-hint">' + T('Demo: kodenya 482913.') + '</span></label>',
          '<button type="button" class="btn btn-secondary" id="jback">' + T('Kembali') + '</button><button type="button" class="btn btn-primary" id="jdo"' + (st.code.length === 6 ? '' : ' disabled') + '>' + ic('user-check', 18) + '<span class="btn-label">' + T('Daftarkan') + '</span></button>');
        md.el.querySelector('#jback').onclick = function () { st.step = 1; draw(); };
        md.el.querySelector('#jdo').onclick = function () {
          var id = 'm-k-' + Date.now().toString(36), now = Date.now();
          P.S.members.unshift({ id: id, name: st.name.trim(), phone: st.tab === 'phone' ? st.phone.replace(/\D/g, '') : '', email: st.tab === 'email' ? st.email : '', spend: 0, points: 0, stamps: 0, visits: 0, joined: now, last: now, promoWa: false, promoEmail: false, bday: '', no: '2611-' + String(3000 + Math.floor(Math.random() * 6000)), wallet: '' });
          P.S.vouchers.unshift({ id: P.uid('v-'), memberId: id, title: 'Gratis topping', src: 'Hadiah sambutan', code: P.code('WL' + Math.floor(Math.random() * 9)), exp: now + 30 * P.DAY, kind: 'free', value: 8000 });
          P.S.log.unshift({ id: P.uid('l'), kind: 'join', memberId: id, at: now, by: 'Kasir: Ayu', outlet: 'Cempaka' });
          P.save(); md.close(); sel = id; q = ''; renderTablet(); P.toast(T('{n} terdaftar sebagai member Silver', { n: st.name.trim() }));
        };
      }
    }
    md.el.addEventListener('click', function (e) { var t = e.target.closest('[data-jt]'); if (t) { st.tab = t.dataset.jt; draw(); } });
    md.el.addEventListener('input', function (e) { var k = e.target.dataset.j; if (!k) return; if (k === 'consent') return; st[k] = k === 'code' ? e.target.value.replace(/\D/g, '').slice(0, 6) : e.target.value; var b = md.el.querySelector('#jgo') || md.el.querySelector('#jdo'); if (b) b.disabled = st.step === 1 ? !(st.consent && st.name.trim() && (st.tab === 'phone' ? st.phone.replace(/\D/g, '').length >= 10 : /.+@.+\..+/.test(st.email))) : st.code.length !== 6; });
    md.el.addEventListener('change', function (e) { if (e.target.dataset.j === 'consent') { st.consent = e.target.checked; draw(); } });
    draw();
  };

  /* ── Check-in pop-up ── */
  function popCheckin(c) {
    var m = P.member(c.memberId), el = ts(); if (!m || !el) return;
    var old = el.querySelector('.checkin-pop'); if (old) old.remove();
    var vs = P.memberVouchers(m.id).length;
    var d = document.createElement('div'); d.className = 'checkin-pop'; d.setAttribute('role', 'alert');
    d.innerHTML = '<div class="row between"><span class="tag tag-success">' + ic('map-pin', 14) + T('Check-in baru') + '</span><span class="t-small muted">' + P.ago(c.at) + '</span></div>' +
      '<div class="row" style="--gap:12px">' + P.avatar(m, 44, 'ring') + '<div class="stack grow" style="--gap:2px"><span class="t-h3">' + esc(m.name.split(' ')[0]) + ' · ' + P.tierOf(m).name + '</span><span class="t-small sec num">' + T('{n} poin', { n: P.num(m.points) }) + ' · ' + T('{n} voucher aktif', { n: vs }) + (c.isNew ? ' · ' + T('member baru') : '') + '</span></div></div>' +
      '<div class="row"><button type="button" class="btn btn-primary btn-sm grow" data-act="openCi" data-id="' + m.id + '">' + T('Buka member') + '</button><button type="button" class="btn btn-ghost btn-sm" data-act="closeCi">' + T('Nanti') + '</button></div>';
    el.appendChild(d); c.seen = true; P.save();
  }
  ACT.openCi = function (el) { var p = ts().querySelector('.checkin-pop'); if (p) p.remove(); mode = 'kasir'; sel = el.dataset.id; leftTab = 'checkin'; q = ''; renderTablet(); };
  ACT.closeCi = function () { var p = ts().querySelector('.checkin-pop'); if (p) p.remove(); };
  function simulateCheckin(mid) { var c = { id: P.uid('c'), memberId: mid || 'm-rina', at: Date.now(), seen: false }; P.S.checkins.unshift(c); P.save(); renderTablet(); popCheckin(c); }
  function checkUnseen() { var c = P.S.checkins.filter(function (x) { return !x.seen && Date.now() - x.at < 30 * P.MIN; })[0]; if (c) { renderTablet(); popCheckin(c); return true; } return false; }

  /* ── POS flow (generic POS, not a copy of any vendor UI) ── */
  function posApp() {
    if (!P.BRAND.cats.some(function (c) { return c[0] === posCat; })) posCat = P.BRAND.cats[0][0];
    var items = P.MENU.filter(function (x) { return x.cat === posCat; });
    var m = posMember ? P.member(posMember) : null, tot = posTotals();
    return '<div class="pos-banner">' + ic('info-circle', 16) + '<span>' + T('Contoh alur di POS yang terhubung. Tampilan POS ini ilustrasi, bukan tampilan aplikasi POS mana pun.') + '</span></div>' +
      '<div class="pos"><section class="pos-menu"><div class="tabs-segmented tabs-sm">' + P.BRAND.cats.map(function (c) { return '<button type="button" class="tab' + (posCat === c[0] ? ' is-active' : '') + '" data-act="posCat" data-v="' + c[0] + '">' + T(c[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="pos-grid">' + items.map(function (it) { return '<button type="button" class="pos-item" data-act="posAdd" data-id="' + it.id + '">' + P.prodThumb(it) + '<span class="t-strong pos-name">' + T(it.name) + '</span><span class="sec num pos-price">' + P.rp(it.price) + '</span></button>'; }).join('') + '</div></section>' +
      '<aside class="pos-order"><div class="pos-order-body"><div class="row between"><span class="t-h3">' + T('Pesanan') + ' <span class="num">C-00' + posReceipt + '</span></span><span class="t-small sec">Ayu · ' + esc(P.ol('Cempaka')) + '</span></div>' +
      (m ? '<div class="pos-member is-set">' + P.avatar(m, 36) + '<div class="stack grow" style="--gap:2px"><span class="row" style="--gap:6px"><span class="t-strong ellip">' + esc(m.name) + '</span>' + P.tierTag(P.tierOf(m), true) + '</span><span class="t-small sec num">' + T('{n} poin', { n: P.num(m.points) }) + ' · ' + T('{n} voucher', { n: P.memberVouchers(m.id).length }) + '</span></div><button type="button" class="icon-btn icon-btn-sm" data-act="posUnset" aria-label="' + T('Lepas member') + '">' + ic('x', 16) + '</button></div>' +
        '<div class="row"><button type="button" class="btn btn-secondary btn-sm grow" data-act="posVoucher">' + ic('ticket', 16) + '<span class="btn-label">' + (posVoucher ? T('Voucher dipasang') : T('Voucher member')) + '</span></button><button type="button" class="btn btn-secondary btn-sm grow" data-act="posPts">' + ic('coins', 16) + '<span class="btn-label">' + (posPoints ? T('{n} poin dipakai', { n: posPoints }) : T('Pakai poin')) + '</span></button></div>'
        : '<button type="button" class="pos-member" data-act="posFind">' + ic('user-plus', 20) + '<span class="stack grow" style="--gap:2px;text-align:left"><span class="t-strong">' + T('Tambah member') + '</span><span class="t-small sec">' + T('Dari Providea Loyalty: nomor HP, email, atau QR') + '</span></span>' + ic('chevron-right', 16) + '</button>') +
      (cart.length ? cart.map(function (c) { var it = P.MENU.filter(function (x) { return x.id === c.id; })[0]; return '<div class="pos-line">' + P.prodThumb(it) + '<span class="grow stack" style="--gap:0;min-width:0"><span class="t-strong ellip">' + T(it.name) + '</span><span class="t-small sec num">' + P.rp(it.price) + '</span></span><span class="stepper"><button type="button" data-act="posQty" data-id="' + c.id + '" data-d="-1" aria-label="' + T('Kurangi') + '">' + ic('minus', 14) + '</button><span class="stepper-value num">' + c.qty + '</span><button type="button" data-act="posQty" data-id="' + c.id + '" data-d="1" aria-label="' + T('Tambah') + '">' + ic('plus', 14) + '</button></span></div>'; }).join('')
        : '<p class="t-small sec center" style="padding:24px 0">' + T('Pilih menu di kiri.') + '</p>') + '</div>' +
      '<div class="pos-foot"><div class="pos-sum t-small"><span class="sec">' + T('Subtotal') + '</span><span class="num">' + P.rp(tot.sub) + '</span></div>' +
      (tot.vcut ? '<div class="pos-sum t-small"><span class="sec">' + T('Voucher') + '</span><span class="num c-success">' + P.rp(-tot.vcut) + '</span></div>' : '') +
      (tot.pcut ? '<div class="pos-sum t-small"><span class="sec">' + T('Bayar pakai poin') + '</span><span class="num c-success">' + P.rp(-tot.pcut) + '</span></div>' : '') +
      '<div class="pos-sum"><span class="t-strong">' + T('Total') + '</span><span class="num pos-total">' + P.rp(tot.total) + '</span></div>' +
      (m ? '<div class="pos-sum t-small"><span class="sec">' + T('Poin didapat') + '</span><span class="num c-brand">' + T('{n} poin', { n: '+' + P.earnFor(tot.total, m) }) + ' · ' + T('{n} stempel', { n: '+' + tot.cups }) + '</span></div>' : '') +
      '<button type="button" class="btn btn-primary btn-block" style="height:48px" data-act="posPay"' + (cart.length ? '' : ' disabled') + '>' + T('Bayar {rp}', { rp: P.rp(tot.total) }) + '</button></div></aside></div>';
  }
  function posTotals() {
    var sub = 0, cups = 0, maxFroyo = 0;
    cart.forEach(function (c) { var it = P.MENU.filter(function (x) { return x.id === c.id; })[0]; sub += it.price * c.qty; if (it.cup) { cups += c.qty; maxFroyo = Math.max(maxFroyo, it.price); } });
    var vcut = 0; if (posVoucher) { var v = P.S.vouchers.filter(function (x) { return x.id === posVoucher; })[0]; if (v) vcut = v.kind === 'pct' ? Math.round(maxFroyo * v.value / 100) : Math.min(v.value, sub); }
    var after = Math.max(0, sub - vcut), pcut = Math.min(after, posPoints * P.S.rules.pointValue);
    return { sub: sub, cups: cups, vcut: vcut, pcut: pcut, total: Math.max(0, after - pcut) };
  }
  ACT.posCat = function (el) { posCat = el.dataset.v; renderTablet(); };
  ACT.posAdd = function (el) { var c = cart.filter(function (x) { return x.id === el.dataset.id; })[0]; if (c) c.qty++; else cart.push({ id: el.dataset.id, qty: 1 }); renderTablet(); };
  ACT.posQty = function (el) { var c = cart.filter(function (x) { return x.id === el.dataset.id; })[0]; if (!c) return; c.qty += +el.dataset.d; if (c.qty <= 0) cart = cart.filter(function (x) { return x !== c; }); renderTablet(); };
  ACT.posUnset = function () { posMember = null; posVoucher = null; posPoints = 0; renderTablet(); };
  ACT.posFind = function () {
    var md = P.modal({ host: ts(), title: T('Tambah member ke pesanan'), desc: T('Data diambil dari Providea Loyalty lewat koneksi POS.'), width: 520 });
    function draw(qs) {
      var qq = (qs || '').toLowerCase().replace(/[\s-]/g, '');
      var list = qq ? P.S.members.filter(function (m) { return (m.phone || '').indexOf(qq) >= 0 || m.name.toLowerCase().replace(/\s/g, '').indexOf(qq) >= 0 || (m.email || '').indexOf(qq) >= 0; }) : P.S.checkins.slice(0, 4).map(function (c) { return P.member(c.memberId); }).filter(Boolean);
      md.body.querySelector('#plist').innerHTML = '<div class="steps-group" style="padding-left:0">' + (qq ? T('Hasil cari') : T('Check-in terbaru')) + '</div>' + (list.length ? list.map(function (m) { return '<button type="button" class="k-row" data-mid="' + m.id + '">' + P.avatar(m, 32) + '<span class="k-row-main"><span class="row" style="--gap:6px"><span class="t-strong ellip">' + esc(m.name) + '</span>' + P.tierTag(P.tierOf(m), true) + '</span><span class="t-small sec num">' + (P.maskPhone(m.phone) || esc(m.email)) + '</span></span></button>'; }).join('') : '<p class="t-small sec">' + T('Tidak ada hasil.') + '</p>');
    }
    md.set('<div class="row"><span class="input grow"><span class="input-icon">' + ic('search', 18) + '</span><input id="pq" placeholder="' + T('Nomor HP, email, atau nama') + '" autofocus></span><button type="button" class="btn btn-secondary" id="pscan">' + ic('scan', 18) + '<span class="btn-label">' + T('Pindai') + '</span></button></div><div id="plist" class="mt-12 stack" style="--gap:2px"></div>');
    draw('');
    md.el.querySelector('#pq').oninput = function (e) { draw(e.target.value); };
    md.el.querySelector('#pscan').onclick = function () { md.close(); ACT.scan(null, null, true); };
    md.el.addEventListener('click', function (e) { var r = e.target.closest('[data-mid]'); if (r) { posMember = r.dataset.mid; posVoucher = null; posPoints = 0; md.close(); renderTablet(); } });
  };
  ACT.posVoucher = function () {
    var m = P.member(posMember), vs = P.memberVouchers(m.id);
    var md = P.modal({ host: ts(), title: T('Voucher member'), desc: esc(m.name), width: 480,
      body: '<div class="stack" style="--gap:8px">' + (vs.length ? vs.map(function (v) { return '<button type="button" class="vrow" data-vid="' + v.id + '" style="text-align:left' + (posVoucher === v.id ? ';border-color:var(--action-primary)' : '') + '"><span class="vchip-ic">' + ic(vIcon(v), 20) + '</span><span class="vchip-main"><span class="t-strong">' + esc(T(v.title)) + '</span><span class="t-small sec">' + T('s.d. {d}', { d: P.fdate(v.exp, true) }) + '</span></span>' + (posVoucher === v.id ? ic('circle-check', 20) : '') + '</button>'; }).join('') : '<p class="sec">' + T('Tidak ada voucher aktif.') + '</p>') + '</div><p class="field-hint mt-12">' + T('Voucher ditandai terpakai setelah pembayaran selesai.') + '</p>',
      foot: (posVoucher ? '<button type="button" class="btn btn-ghost" id="vrm">' + T('Lepas voucher') + '</button>' : '') + '<button type="button" class="btn btn-secondary" data-close>' + T('Tutup') + '</button>' });
    md.el.addEventListener('click', function (e) { var r = e.target.closest('[data-vid]'); if (r) { posVoucher = r.dataset.vid; md.close(); renderTablet(); } if (e.target.closest('#vrm')) { posVoucher = null; md.close(); renderTablet(); } });
  };
  ACT.posPts = function () {
    var m = P.member(posMember), R = P.S.rules, t0 = posTotals(), maxP = Math.min(m.points, Math.floor((t0.sub - t0.vcut) / R.pointValue)), use = posPoints || Math.min(maxP, 40);
    var md = P.modal({ host: ts(), title: T('Bayar pakai poin'), desc: esc(m.name) + ' · ' + T('{n} poin', { n: P.num(m.points) }), width: 460 });
    function draw() {
      md.set('<input type="range" id="pp" min="0" max="' + maxP + '" value="' + use + '" style="width:100%" aria-label="' + T('Poin yang dipakai') + '"><div class="row between mt-8"><span class="t-h3 num">' + T('{n} poin', { n: use }) + '</span><span class="num c-success">' + P.rp(-use * R.pointValue) + '</span></div><p class="field-hint mt-8">' + T('1 poin = {rp}. Maksimal {n} poin untuk pesanan ini.', { rp: P.rp(R.pointValue), n: maxP }) + '</p>',
        '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="ppgo">' + T('Pakai') + '</button>');
      md.el.querySelector('#pp').oninput = function (e) { use = +e.target.value; draw(); md.el.querySelector('#pp').focus(); };
      md.el.querySelector('#ppgo').onclick = function () { posPoints = use; md.close(); renderTablet(); };
    }
    draw();
  };
  ACT.posPay = function () {
    var tot = posTotals(), method = 'qris';
    var md = P.modal({ host: ts(), title: T('Bayar {rp}', { rp: P.rp(tot.total) }), width: 520 });
    function draw() {
      md.set('<div class="radio-cards" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + [['cash', 'Tunai', 'cash'], ['qris', 'QRIS', 'qrcode'], ['card', 'Kartu debit', 'credit-card']].map(function (x) { return '<button type="button" class="radio-card' + (method === x[0] ? ' is-on' : '') + '" data-pm="' + x[0] + '"><span class="radio-dot"></span><span class="stack" style="--gap:4px">' + ic(x[2], 20) + '<span class="t-strong">' + T(x[1]) + '</span></span></button>'; }).join('') + '</div>',
        '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="paygo">' + ic('check', 18) + '<span class="btn-label">' + T('Pembayaran diterima') + '</span></button>');
      md.el.querySelector('#paygo').onclick = finish;
    }
    function finish() {
      var m = posMember ? P.member(posMember) : null, rec = 'C-00' + posReceipt, r = null, v = null;
      if (m) {
        if (posVoucher) { v = P.S.vouchers.filter(function (x) { return x.id === posVoucher; })[0]; v.used = { at: Date.now(), by: 'Ayu', outlet: 'Cempaka' }; P.S.log.unshift({ id: P.uid('l'), kind: 'voucher', memberId: m.id, at: Date.now(), title: v.title, by: 'Ayu', outlet: 'Cempaka' }); }
        if (posPoints) { m.points -= posPoints; P.S.log.unshift({ id: P.uid('l'), kind: 'pay', memberId: m.id, at: Date.now(), points: -posPoints, amount: tot.pcut, by: 'Ayu', outlet: 'Cempaka' }); }
        r = P.recordSale(m, tot.total, tot.cups, { receipt: rec, channel: 'pos' });
      }
      P.S.receiptNo = Math.max(P.S.receiptNo, posReceipt); P.save();
      var lines = cart.map(function (c) { var it = P.MENU.filter(function (x) { return x.id === c.id; })[0]; return '<div class="rline"><span>' + c.qty + '× ' + T(it.name) + '</span><span class="num">' + P.rp(it.price * c.qty) + '</span></div>'; }).join('');
      md.set('<div class="receipt"><div class="center"><span class="receipt-brand">' + P.sjLogo(22) + '<b>' + esc(P.BRAND.name) + '</b></span><br><span>' + T('Outlet Cempaka') + ' · ' + rec + '</span><br><span>' + P.fdate(Date.now()) + ' ' + P.ftime(Date.now()) + '</span></div><div class="rdash"></div>' + lines + '<div class="rdash"></div>' +
        '<div class="rline"><span>' + T('Subtotal') + '</span><span class="num">' + P.rp(tot.sub) + '</span></div>' + (tot.vcut ? '<div class="rline"><span>' + T('Voucher') + '</span><span class="num">' + P.rp(-tot.vcut) + '</span></div>' : '') + (tot.pcut ? '<div class="rline"><span>' + T('Poin') + '</span><span class="num">' + P.rp(-tot.pcut) + '</span></div>' : '') +
        '<div class="rline"><b>' + T('Total') + '</b><b class="num">' + P.rp(tot.total) + '</b></div>' +
        (m ? '<div class="loyal"><b>' + esc(m.name) + ' · ' + P.tierOf(m).name + '</b><span class="num">' + T('{n} poin', { n: '+' + r.points }) + ' · ' + T('saldo {n} poin', { n: P.num(m.points) }) + '</span><span class="num">' + T('Stempel {a}/{b}', { a: m.stamps, b: P.S.rules.stampGoal }) + '</span>' + (r.tierUp ? '<span>' + T('Naik ke {t}', { t: esc(r.tierUp.name) }) + '</span>' : '') + '</div>' : '') + '</div>' +
        (m ? '<p class="t-small sec center mt-12">' + T('Poin, stempel, dan voucher terkirim ke Providea Loyalty lewat koneksi POS.') + '</p>' : ''),
        '<button type="button" class="btn btn-primary" data-close>' + T('Pesanan baru') + '</button>');
      cart = []; posMember = null; posVoucher = null; posPoints = 0; posReceipt = P.S.receiptNo + 1; renderTablet();
    }
    md.el.addEventListener('click', function (e) { var b = e.target.closest('[data-pm]'); if (b) { method = b.dataset.pm; draw(); } });
    draw();
  };

  /* ── misc actions ── */
  ACT.mode = function (el) { mode = el.dataset.v; history.replaceState(null, '', mode === 'pos' ? '#/pos' : '#/'); renderTablet(); };
  ACT.left = function (el) { leftTab = el.dataset.v; renderTablet(); };
  ACT.pick = function (el) { sel = el.dataset.id; renderTablet(); };
  ACT.clear = function () { sel = null; renderTablet(); };
  ACT.demo = function (el) {
    var k = el.dataset.k;
    if (k !== 'pos' && mode !== 'kasir') { mode = 'kasir'; history.replaceState(null, '', '#/'); }
    if (k === 'checkin') { sel = null; simulateCheckin('m-rina'); return; }
    if (k === 'find') { renderTablet(); var i = document.getElementById('kq'); q = '0812-8830'; renderTablet(); i = document.getElementById('kq'); if (i) { i.focus(); i.setSelectionRange(q.length, q.length); } return; }
    if (k === 'join') { renderTablet(); ACT.join(); return; }
    if (k === 'pos') { mode = 'pos'; history.replaceState(null, '', '#/pos'); if (!cart.length) cart = [{ id: 'p2', qty: 1 }, { id: 't2', qty: 1 }]; posMember = 'm-rina'; renderTablet(); return; }
    if (k === 'void') { leftTab = 'sales'; q = ''; renderTablet(); var l = todaySales().filter(function (x) { return !x.void; })[0]; if (l) ACT.void({ dataset: { id: l.id } }); return; }
    sel = sel || 'm-rina'; q = ''; renderTablet();
    if (k === 'sale') ACT.sale(); else if (k === 'voucher') ACT.voucher(); else if (k === 'points') ACT.points();
  };

  app.addEventListener('input', function (e) { if (e.target.id === 'kq') { q = e.target.value; var pos = e.target.selectionStart; renderTablet(); var i = document.getElementById('kq'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } } });

  P.onLang = render;
  P.onBrand = function () {
    cart = []; posMember = null; posVoucher = null; posPoints = 0; posCat = P.BRAND.cats[0][0];
    document.querySelectorAll('.overlay').forEach(function (o) { o.remove(); });
    render();
  };
  P.onSync = function () { if (document.querySelector('.overlay')) return; renderTablet(); checkUnseen(); };
  render();
  setTimeout(function () {
    if (checkUnseen()) return;
    var shown = false; try { shown = sessionStorage.getItem('pl-ci-demo') === '1'; sessionStorage.setItem('pl-ci-demo', '1'); } catch (e) {}
    if (!shown && mode === 'kasir') simulateCheckin('m-rina');
  }, 1400);
})();
