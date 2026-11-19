/* Providea Loyalty demo · brand owner dashboard (desktop app shell from Providea Influence). */
(function () {
  'use strict';
  var P = PL, T = P.T, esc = P.esc, ACT = P.ACT;
  P.setView('dash');
  var app = document.getElementById('app');
  var WA_RATE = 586.33, PPN = 0.11, TOTAL0 = 2128, OWED0 = 19985;
  var period = '30', drawer = false, fTier = 'all', fSeg = 'all', fQ = '', draftRules = null;
  var SEGS = {
    all: { name: 'Semua member', n: function () { return total(); } },
    'new': { name: 'Baru', rule: 'Daftar 30 hari terakhir', icon: 'user-plus', n: function () { return 400 + extraNew(); }, avg: 68000, tip: 'Dorong kunjungan kedua dalam 14 hari.' },
    active: { name: 'Aktif', rule: 'Datang dalam 30 hari terakhir', icon: 'flame', n: function () { return 862; }, avg: 186000, tip: 'Jaga dengan poin dan kabar menu baru.' },
    risk: { name: 'Berisiko', rule: 'Tidak datang 30–60 hari', icon: 'alert-triangle', n: function () { return 286; }, avg: 142000, tip: 'Kirim pesan kangen dengan voucher kecil.' },
    lapsed: { name: 'Hilang', rule: 'Tidak datang lebih dari 60 hari', icon: 'hourglass', n: function () { return 580; }, avg: 97000, tip: 'Coba sekali. Berhenti kirim bila tidak ada respons.' },
    top: { name: 'Top 10%', rule: '10% member dengan belanja tertinggi', icon: 'award', n: function () { return 214; }, avg: 1940000, tip: 'Beri akses menu baru lebih dulu.' },
    gold: { name: 'Gold dan Platinum', n: function () { return 256; } }
  };
  var ROLES = { owner: ['Pemilik', 'brand'], lead: ['Kepala outlet', 'info'], cashier: ['Kasir', 'neutral'] };

  function total() { return TOTAL0 + P.S.members.length; }
  function extraNew() { return P.S.members.filter(function (m) { return m.id === 'm-new' || m.id.indexOf('m-k-') === 0; }).length; }
  function owedPts() { return OWED0 + P.S.members.reduce(function (a, m) { return a + m.points; }, 0); }
  function route() { var h = location.hash.replace(/^#\/?/, '') || 'ringkasan'; var p = h.split('?'); var q = {}; (p[1] || '').split('&').forEach(function (kv) { var s = kv.split('='); if (s[0]) q[s[0]] = decodeURIComponent(s[1] || ''); }); var seg = p[0].split('/'); return { page: seg[0], id: seg[1], q: q }; }
  function npanel(title, icon, body, action, cls, count) { return '<section class="npanel ' + (cls || '') + '"><header class="npanel-head"><span class="npanel-title">' + (icon ? ic(icon, 16) : '') + title + (count != null ? '<span class="npanel-count num">' + count + '</span>' : '') + '</span>' + (action ? '<span class="npanel-action">' + action + '</span>' : '') + '</header><div class="npanel-body pad-md">' + body + '</div></section>'; }
  function stat(value, unit, status) { return '<div class="stat stat-lg kpi"><span class="stat-row"><span class="stat-value num">' + value + '</span>' + (unit ? '<span class="unit-pill">' + unit + '</span>' : '') + '</span>' + (status ? '<span class="stat-status">' + status + '</span>' : '') + '</div>'; }
  function pageHead(title, sub, actions, back) { return (back ? '<a class="back-link" href="' + back[0] + '">' + ic('chevron-left', 16) + back[1] + '</a>' : '') + '<header class="page-head"><div class="page-head-text"><h1 class="t-h1">' + title + '</h1>' + (sub ? '<p class="page-head-sub">' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="page-head-actions">' + actions + '</div>' : '') + '</header>'; }
  function btn(label, icon, attrs, variant) { return '<button type="button" class="btn btn-' + (variant || 'secondary') + '" ' + (attrs || '') + '>' + (icon ? ic(icon, 18) : '') + '<span class="btn-label">' + label + '</span></button>'; }
  function lbtn(label, icon, href, variant) { return '<a class="btn btn-' + (variant || 'secondary') + '" href="' + href + '">' + (icon ? ic(icon, 18) : '') + '<span class="btn-label">' + label + '</span></a>'; }
  function chCh(c) { var m = { wa: ['ch-wa', 'brand-whatsapp', 'WhatsApp'], email: ['ch-email', 'mail', 'Email'], wallet: ['ch-wallet', 'wallet', 'Wallet'] }[c]; return '<span class="ch ' + m[0] + '">' + ic(m[1], 12) + m[2] + '</span>'; }

  /* ── shell ── */
  var NAV = [
    { items: [['ringkasan', 'layout-dashboard', 'Ringkasan'], ['member', 'users', 'Member'], ['segmen', 'target', 'Segmen']] },
    { label: 'Program', items: [['tier', 'crown', 'Tier dan poin'], ['voucher', 'ticket', 'Voucher'], ['kampanye', 'speakerphone', 'Kampanye']] },
    { label: 'Bisnis', items: [['outlet', 'building-store', 'Outlet dan staf']] }
  ];
  var TITLES = { ringkasan: 'Ringkasan', member: 'Member', segmen: 'Segmen', tier: 'Tier dan poin', voucher: 'Voucher', kampanye: 'Kampanye', outlet: 'Outlet dan staf' };
  function render() {
    var r = route(), page = PAGES[r.page] ? r.page : 'ringkasan';
    var sub = r.id && page === 'member' && P.member(r.id) ? esc(P.member(r.id).name) : r.id === 'baru' ? T('Kampanye baru') : '';
    var crumbs = '<a class="crumb" href="#/ringkasan">Kamtono</a><span class="crumb-sep">/</span>' + (sub ? '<a class="crumb" href="#/' + page + '">' + T(TITLES[page]) + '</a><span class="crumb-sep">/</span><span class="crumb is-current">' + sub + '</span>' : '<span class="crumb is-current">' + T(TITLES[page]) + '</span>');
    app.innerHTML = (drawer ? '<div class="sb-scrim" data-act="drawer"></div>' : '') + '<div class="app"><aside class="sidebar' + (drawer ? ' is-drawer' : '') + '" aria-label="' + T('Menu') + '"><div class="sb-brand"><a class="sb-logo" href="#/ringkasan">' + P.mark(24) + '<span class="sb-logo-word">Providea Loyalty</span></a>' + (drawer ? '<button type="button" class="icon-btn icon-btn-sm" data-act="drawer" aria-label="' + T('Tutup') + '">' + ic('x', 16) + '</button>' : '') + '</div>' +
      '<div class="sb-ws"><div class="ws-card">' + P.sjLogo(30) + '<span class="stack" style="--gap:0;min-width:0"><span class="t-strong ellip">Kamtono</span><span class="t-small sec">' + T('1 outlet · Cempaka') + '</span></span></div></div>' +
      '<nav class="sb-nav">' + NAV.map(function (g) {
        return '<div class="sb-group">' + (g.label ? '<span class="sb-group-label">' + T(g.label) + '</span>' : '') + g.items.map(function (it) { return '<a class="sb-item' + (page === it[0] ? ' is-active' : '') + '" href="#/' + it[0] + '"' + (page === it[0] ? ' aria-current="page"' : '') + '>' + ic(it[1], 20) + '<span class="sb-label">' + T(it[2]) + '</span></a>'; }).join('') + '</div>';
      }).join('') + '</nav><div class="sb-foot"><div class="sb-user"><span class="avatar avatar-brand" style="width:32px;height:32px;font-size:12px">SW</span><span class="sb-user-text"><span class="t-strong">Sinta Wirawan</span><span class="t-small c-secondary">' + T('Pemilik') + '</span></span></div></div></aside>' +
      '<div class="app-main"><header class="topbar"><nav class="crumbs" aria-label="' + T('Lokasi') + '">' + crumbs + '</nav><div class="topbar-actions"><a class="btn btn-ghost btn-sm" href="kasir.html">' + ic('device-tablet', 16) + '<span class="btn-label">' + T('Layar kasir') + '</span></a><a class="btn btn-ghost btn-sm" href="anggota.html">' + ic('device-mobile', 16) + '<span class="btn-label">' + T('HP member') + '</span></a></div></header>' +
      '<div class="m-dash-bar"><button type="button" class="icon-btn" data-act="drawer" aria-label="' + T('Buka menu') + '">' + ic('menu-2', 20) + '</button><span class="t-strong ellip">' + T(TITLES[page]) + '</span></div>' +
      '<div class="app-content"><div class="page">' + PAGES[page](r) + '</div></div></div></div>';
    if (AFTER[page]) AFTER[page](r);
  }
  ACT.drawer = function () { drawer = !drawer; render(); };

  var PAGES = {}, AFTER = {};

  /* ── Ringkasan ── */
  /* summary: the customisable board for the three sample brands (js/board.js, css/board.css) */
  PAGES.ringkasan = function () { return PLBoard.html(); };
  AFTER.ringkasan = function () { PLBoard.mount(); };

  function actRow(l) {
    var m = P.member(l.memberId); if (!m) return '';
    var who = '<a class="link-quiet" href="#/member/' + m.id + '">' + esc(m.name) + '</a>', t = '';
    if (l.kind === 'sale') t = l.void ? T('{m}: penjualan {rp} dibatalkan', { m: who, rp: P.rp(l.amount) }) : T('{m} belanja {rp}, dapat {n} poin', { m: who, rp: P.rp(l.amount), n: l.points });
    else if (l.kind === 'join') t = T('{m} jadi member', { m: who });
    else if (l.kind === 'tier') t = T('{m} naik ke {t}', { m: who, t: l.title });
    else if (l.kind === 'voucher') t = T('{m} memakai voucher {v}', { m: who, v: T(l.title) });
    else if (l.kind === 'redeem') t = T('{m} menukar {n} poin', { m: who, n: Math.abs(l.points) });
    else if (l.kind === 'pay') t = T('{m} bayar pakai {n} poin', { m: who, n: Math.abs(l.points) });
    else if (l.kind === 'adjust') t = T('Poin {m} disesuaikan', { m: who });
    return '<div class="tl-item tl-signed"><span class="tl-mark"></span><span class="tl-main"><span class="tl-title" style="font-weight:400">' + t + '</span><span class="tl-sub">' + P.ago(l.at) + (l.outlet ? ' · ' + l.outlet : '') + '</span></span></div>';
  }
  ACT.period = function (el) { period = el.dataset.v; render(); };
  ACT.report = function () { P.toast(T('Laporan 6 angka diunduh sebagai CSV (demo)'), 'download'); };

  /* ── Member list ── */
  PAGES.member = function (r) {
    if (r.id) return memberProfile(r.id);
    if (r.q.seg) fSeg = r.q.seg;
    var list = P.S.members.filter(function (m) {
      var t = P.tierOf(m), s = P.segOf(m), q = fQ.toLowerCase().replace(/[\s-]/g, '');
      if (fTier !== 'all' && t.id !== fTier) return false;
      if (fSeg === 'top' ? !P.isTop(m) : (fSeg !== 'all' && s !== fSeg)) return false;
      if (q && !(m.name.toLowerCase().replace(/\s/g, '').indexOf(q) >= 0 || (m.phone || '').indexOf(q) >= 0 || (m.email || '').indexOf(q) >= 0)) return false;
      return true;
    }).sort(function (a, b) { return b.last - a.last; });
    return pageHead(T('Member'), T('{n} member · data contoh, tabel menampilkan 12 member pertama', { n: P.num(total()) }), btn(T('Ekspor CSV'), 'file-export', 'data-act="export"')) +
      '<div class="filters" style="margin-bottom:16px"><span class="input"><span class="input-icon">' + ic('search', 18) + '</span><input id="mq" placeholder="' + T('Cari nama, nomor HP, atau email') + '" value="' + esc(fQ) + '"></span>' +
      '<span class="select"><select id="mt" aria-label="' + T('Tier') + '"><option value="all">' + T('Semua tier') + '</option>' + P.S.rules.tiers.map(function (t) { return '<option value="' + t.id + '"' + (fTier === t.id ? ' selected' : '') + '>' + t.name + '</option>'; }).join('') + '</select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span>' +
      [['all', 'Semua'], ['new', 'Baru'], ['active', 'Aktif'], ['risk', 'Berisiko'], ['lapsed', 'Hilang'], ['top', 'Top 10%']].map(function (s) { return '<button type="button" class="chip' + (fSeg === s[0] ? ' is-selected' : '') + '" data-act="fseg" data-v="' + s[0] + '">' + T(s[1]) + '</button>'; }).join('') + '</div>' +
      '<div class="npanel"><div class="npanel-body pad-none"><div class="dtable-wrap"><table class="dtable"><thead><tr><th>' + T('Member') + '</th><th>' + T('Tier') + '</th><th class="al-right">' + T('Poin') + '</th><th class="al-right hide-m">' + T('Belanja 12 bulan') + '</th><th class="al-right hide-m">' + T('Kunjungan') + '</th><th class="hide-m">' + T('Terakhir datang') + '</th><th class="hide-m">' + T('Segmen') + '</th><th class="hide-m">' + T('Izin promo') + '</th></tr></thead><tbody>' +
      (list.length ? list.map(function (m) {
        var t = P.tierOf(m);
        return '<tr class="is-clickable" data-act="openM" data-id="' + m.id + '"><td><span class="m-cell">' + P.avatar(m, 32) + '<span class="m-cell-text"><span class="t-strong">' + esc(m.name) + '</span><span class="t-small sec num">' + (P.maskPhone(m.phone) || esc(m.email)) + '</span></span></span></td><td>' + P.tierTag(t, true) + (m.override ? ' <span class="tag tag-outline tag-sm">' + T('manual') + '</span>' : '') + '</td><td class="al-right num">' + P.num(m.points) + '</td><td class="al-right num hide-m">' + P.rp(m.spend) + '</td><td class="al-right num hide-m">' + m.visits + '</td><td class="hide-m">' + P.ago(m.last) + '</td><td class="hide-m">' + P.segTag(P.segOf(m)) + (P.isTop(m) ? ' <span class="tag tag-brand tag-sm">Top 10%</span>' : '') + '</td><td class="hide-m"><span class="row" style="--gap:6px">' + (m.promoWa ? '<span class="ch ch-wa">' + ic('brand-whatsapp', 12) + 'WA</span>' : '') + (m.promoEmail ? '<span class="ch ch-email">' + ic('mail', 12) + T('Email') + '</span>' : '') + (!m.promoWa && !m.promoEmail ? '<span class="t-small muted">' + T('Tidak') + '</span>' : '') + '</span></td></tr>';
      }).join('') : '<tr><td colspan="8" class="dtable-empty">' + T('Tidak ada member yang cocok dengan filter ini.') + '</td></tr>') + '</tbody></table></div></div></div>';
  };
  AFTER.member = function (r) {
    if (r.id) return;
    var q = document.getElementById('mq'); if (q) q.oninput = function (e) { fQ = e.target.value; var pos = e.target.selectionStart; render(); var i = document.getElementById('mq'); i.focus(); i.setSelectionRange(pos, pos); };
    var t = document.getElementById('mt'); if (t) t.onchange = function (e) { fTier = e.target.value; render(); };
  };
  ACT.fseg = function (el) { fSeg = el.dataset.v; if (location.hash.indexOf('seg=') >= 0) history.replaceState(null, '', '#/member'); render(); };
  ACT.openM = function (el) { location.hash = '#/member/' + el.dataset.id; };
  ACT.export = function () {
    var md = P.modal({ title: T('Ekspor data member?'), desc: T('File CSV berisi {n} member dengan nama, nomor HP, email, tier, dan poin.', { n: P.num(total()) }), width: 480,
      body: '<div class="info-note">' + ic('shield-lock', 16) + '<span>' + T('Ekspor tercatat di log audit dengan nama kamu. Simpan file di tempat aman, sesuai UU PDP.') + '</span></div>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="exgo">' + ic('download', 18) + '<span class="btn-label">' + T('Ekspor CSV') + '</span></button>' });
    md.el.querySelector('#exgo').onclick = function () { P.addAudit('Sinta Wirawan', 'Mengekspor {n} member ke CSV', { n: P.num(total()) }); P.save(); md.close(); P.toast(T('CSV dibuat. Tercatat di log audit.'), 'download'); };
  };

  function memberProfile(id) {
    var m = P.member(id); if (!m) return pageHead(T('Member tidak ditemukan'), '', '', ['#/member', T('Member')]);
    var t = P.tierOf(m), nt = P.nextTier(m), R = P.S.rules, vs = P.memberVouchers(m.id, true);
    var hist = P.S.log.filter(function (l) { return l.memberId === m.id; }).sort(function (a, b) { return b.at - a.at; });
    var audits = P.S.audit.filter(function (a) { return JSON.stringify(a.v || {}).indexOf(m.name) >= 0; });
    var KIND = { sale: 'Penjualan', tier: 'Naik tier', redeem: 'Tukar poin', pay: 'Bayar pakai poin', voucher: 'Voucher dipakai', join: 'Jadi member', adjust: 'Penyesuaian poin' };
    return pageHead('<span class="row wrap" style="--gap:10px">' + P.avatar(m, 44) + esc(m.name) + P.tierTag(t) + (m.override ? '<span class="tag tag-outline" title="' + esc(T(m.overrideWhy || '')) + '">' + T('tier manual') + '</span>' : '') + P.segTag(P.segOf(m)) + '</span>',
      '<span class="num">' + (m.phone ? P.fmtPhone(m.phone) : '') + (m.phone && m.email ? ' · ' : '') + esc(m.email || '') + ' · ' + T('No. member') + ' ' + m.no + ' · ' + T('member sejak {d}', { d: P.fdate(m.joined) }) + '</span>',
      btn(T('Ubah tier'), 'crown', 'data-act="tierOv" data-id="' + m.id + '"') + btn(T('Atur poin'), 'adjustments', 'data-act="adjust" data-id="' + m.id + '"') + lbtn(T('Lihat di HP member'), 'device-mobile', 'anggota.html#/home', 'ghost'), ['#/member', T('Member')]) +
      (m.override ? '<div class="info-note" style="margin-bottom:16px">' + ic('info-circle', 16) + '<span>' + T('Tier diubah manual. Alasan: {why}', { why: esc(T(m.overrideWhy || '')) }) + '</span></div>' : '') +
      '<div class="dash-3">' + npanel(T('Poin'), 'coins', stat(P.num(m.points), T('poin'), T('senilai {rp}', { rp: P.rp(m.points * R.pointValue) }))) +
      npanel(T('Belanja 12 bulan'), 'receipt', stat(P.rp(m.spend), null, nt ? T('{rp} lagi ke {t}', { rp: P.rp(nt.min - m.spend), t: nt.name }) : T('Tier tertinggi')) + (nt ? '<div class="pbar mt-12' + (t.id === 'gold' ? ' is-gold' : '') + '"><span style="width:' + Math.min(100, m.spend / nt.min * 100).toFixed(1) + '%"></span></div>' : '')) +
      npanel(T('Kunjungan'), 'map-pin', stat(P.num(m.visits), T('kali'), T('Terakhir {a} · stempel {s}/{g}', { a: P.ago(m.last), s: m.stamps, g: R.stampGoal }))) + '</div>' +
      '<div class="dash-2 mt-16">' + npanel(T('Riwayat'), 'history', '<div class="dtable-wrap"><table class="dtable"><thead><tr><th>' + T('Waktu') + '</th><th>' + T('Kegiatan') + '</th><th class="hide-m">' + T('Struk') + '</th><th class="al-right">' + T('Nominal') + '</th><th class="al-right">' + T('Poin') + '</th><th class="hide-m">' + T('Oleh') + '</th></tr></thead><tbody>' +
        hist.map(function (l) { var p = l.kind === 'sale' ? (l.void ? '−' : '+') + l.points : l.points ? (l.points > 0 ? '+' : '−') + Math.abs(l.points) : ''; return '<tr><td>' + P.fdate(l.at, true) + ' · ' + P.ftime(l.at) + '</td><td>' + T(KIND[l.kind]) + (l.kind === 'tier' ? ' · ' + l.title : l.title && l.kind !== 'adjust' ? ' · ' + esc(T(l.title)) : '') + (l.void ? ' <span class="tag tag-danger tag-sm">' + T('Dibatalkan') + '</span>' : '') + '</td><td class="hide-m">' + (l.receipt || '') + '</td><td class="al-right num">' + (l.amount ? P.rp(l.amount) : '') + '</td><td class="al-right num ' + (p[0] === '−' ? 'c-danger' : p ? 'c-success' : '') + '">' + p + '</td><td class="hide-m">' + esc(l.by || '') + '</td></tr>'; }).join('') + '</tbody></table></div>', null, '', hist.length) +
      '<div class="stack" style="--gap:16px">' + npanel(T('Voucher'), 'ticket', '<div class="stack" style="--gap:8px">' + (vs.length ? vs.map(function (v) { return '<div class="row between"><span class="stack" style="--gap:0;min-width:0"><span class="t-strong ellip' + (v.used ? ' strike' : '') + '">' + esc(T(v.title)) + '</span><span class="t-small sec">' + esc(T(v.src)) + ' · ' + v.code + '</span></span>' + (v.used ? '<span class="tag tag-sm">' + T('Dipakai') + '</span>' : v.exp < Date.now() ? '<span class="tag tag-sm">' + T('Kedaluwarsa') + '</span>' : '<span class="tag tag-success tag-sm">' + T('Aktif') + '</span>') + '</div>'; }).join('') : '<p class="t-small sec">' + T('Tidak ada voucher.') + '</p>') + '</div>', null, '', vs.length) +
        npanel(T('Izin dan data'), 'shield-lock', '<div class="lv-list"><div class="lv-row"><span class="lv-label">' + T('Promo WhatsApp') + '</span><span class="lv-value">' + (m.promoWa ? '<span class="tag tag-success tag-sm">' + T('Ya') + '</span>' : '<span class="tag tag-sm">' + T('Tidak') + '</span>') + '</span></div><div class="lv-row"><span class="lv-label">' + T('Promo email') + '</span><span class="lv-value">' + (m.promoEmail ? '<span class="tag tag-success tag-sm">' + T('Ya') + '</span>' : '<span class="tag tag-sm">' + T('Tidak') + '</span>') + '</span></div><div class="lv-row"><span class="lv-label">' + T('Kartu Wallet') + '</span><span class="lv-value">' + (m.wallet === 'apple' ? 'Apple Wallet' : m.wallet === 'samsung' ? 'Samsung Wallet' : '–') + '</span></div><div class="lv-row"><span class="lv-label">' + T('Ulang tahun') + '</span><span class="lv-value">' + esc(m.bday || '–') + '</span></div></div>' +
          (audits.length ? '<div class="divider"></div><div class="t-small sec">' + T('Log audit') + '</div>' + audits.map(function (a) { return '<div class="t-small mt-8">' + esc(a.who) + ': ' + esc(T(a.what, a.v)) + ' <span class="muted">· ' + P.ago(a.at) + '</span></div>'; }).join('') : '')) + '</div></div>';
  }
  ACT.tierOv = function (el) {
    var m = P.member(el.dataset.id), cur = m.override || '';
    var md = P.modal({ title: T('Ubah tier {n}', { n: m.name }), desc: T('Tier otomatis sekarang: {t}. Perubahan manual wajib pakai alasan dan tercatat di log audit.', { t: (function () { var o = m.override; m.override = null; var t = P.tierOf(m).name; m.override = o; return t; })() }), width: 500,
      body: '<div class="stack" style="--gap:14px"><label class="field"><span class="field-label">' + T('Tier') + '</span><span class="select"><select id="tov"><option value="">' + T('Otomatis (ikuti belanja)') + '</option>' + P.S.rules.tiers.map(function (t) { return '<option value="' + t.id + '"' + (cur === t.id ? ' selected' : '') + '>' + t.name + '</option>'; }).join('') + '</select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label>' +
        '<label class="field"><span class="field-label">' + T('Alasan') + ' <span class="field-req">*</span></span><textarea class="textarea" id="twhy" placeholder="' + T('Contoh: kompensasi keluhan pesanan 2 Nov') + '"></textarea></label></div>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="tgo" disabled>' + T('Simpan') + '</button>' });
    var why = md.el.querySelector('#twhy'), go = md.el.querySelector('#tgo');
    why.oninput = function () { go.disabled = why.value.trim().length < 4; };
    go.onclick = function () {
      var v = md.el.querySelector('#tov').value; m.override = v || null; m.overrideWhy = why.value.trim();
      P.addAudit('Sinta Wirawan', v ? 'Mengubah tier {m} ke {t} (alasan: {why})' : 'Mengembalikan tier {m} ke otomatis (alasan: {why})', { m: m.name, t: v ? P.tierById(v).name : '', why: why.value.trim() }); P.save(); md.close(); render(); P.toast(T('Tier diperbarui. Kartu Wallet ikut berubah.'));
    };
  };
  ACT.adjust = function (el) {
    var m = P.member(el.dataset.id);
    var md = P.modal({ title: T('Atur poin {n}', { n: m.name }), desc: T('Saldo sekarang {n} poin.', { n: P.num(m.points) }), width: 480,
      body: '<div class="stack" style="--gap:14px"><label class="field"><span class="field-label">' + T('Tambah atau kurangi') + '</span><span class="input"><input id="adn" type="number" value="10" step="1"><span class="input-suffix">' + T('poin') + '</span></span><span class="field-hint">' + T('Pakai angka minus untuk mengurangi.') + '</span></label>' +
        '<label class="field"><span class="field-label">' + T('Alasan') + ' <span class="field-req">*</span></span><textarea class="textarea" id="adw" placeholder="' + T('Contoh: struk lupa dipindai 12 Nov') + '"></textarea></label></div>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="adgo" disabled>' + T('Simpan') + '</button>' });
    var w = md.el.querySelector('#adw'), go = md.el.querySelector('#adgo');
    w.oninput = function () { go.disabled = w.value.trim().length < 4; };
    go.onclick = function () {
      var n = parseInt(md.el.querySelector('#adn').value, 10) || 0; if (!n) return;
      m.points = Math.max(0, m.points + n);
      P.S.log.unshift({ id: P.uid('l'), kind: 'adjust', memberId: m.id, at: Date.now(), points: n, title: w.value.trim(), by: 'Sinta' });
      P.addAudit('Sinta Wirawan', 'Menyesuaikan poin {m} {n} (alasan: {why})', { m: m.name, n: (n > 0 ? '+' : '') + n, why: w.value.trim() }); P.save(); md.close(); render(); P.toast(T('Poin diperbarui'));
    };
  };

  /* ── Tier & points ── */
  var BEN = {
    silver: ['1 poin tiap Rp10.000', 'Voucher ulang tahun', 'Kabar menu khusus member'],
    gold: ['Gratis topping saat naik tier', 'Voucher khusus Gold (Selasa Gold)', 'Voucher ulang tahun lebih besar'],
    platinum: ['Beli 1 gratis 1, sebulan sekali', 'Coba menu baru lebih dulu', 'Undangan acara tasting']
  };
  PAGES.tier = function () {
    var R = draftRules || (draftRules = JSON.parse(JSON.stringify(P.S.rules)));
    var counts = { silver: total() - 256, gold: 231, platinum: 25 };
    var ex = +(draftRules.preview || 45000);
    function seg(id, cur, opts) { return '<div class="tabs-segmented tabs-sm">' + opts.map(function (o) { return '<button type="button" class="tab' + (cur === o[0] ? ' is-active' : '') + '" data-act="rule" data-k="' + id + '" data-v="' + o[0] + '">' + T(o[1]) + '</button>'; }).join('') + '</div>'; }
    function num(id, val, pre, suf) { return '<span class="inline-input">' + (pre ? '<span class="sec">' + pre + '</span>' : '') + '<span class="input input-sm"><input data-rule="' + id + '" type="number" value="' + val + '" min="0"></span>' + (suf ? '<span class="sec">' + suf + '</span>' : '') + '</span>'; }
    function row(label, hint, ctrl) { return '<div class="form-row"><span class="form-row-label"><span class="t-strong">' + label + '</span>' + (hint ? '<span class="t-small sec">' + hint + '</span>' : '') + '</span><div>' + ctrl + '</div></div>'; }
    var rp1 = R.payMode === 'rp1';
    return pageHead(T('Tier dan poin'), T('Aturan berlaku untuk transaksi berikutnya di semua outlet.'), btn(T('Kembalikan contoh awal'), 'arrow-back-up', 'data-act="rulesReset"', 'ghost') + btn(T('Simpan aturan'), 'device-floppy', 'data-act="rulesSave"', 'primary')) +
      '<div class="tier-cards">' + R.tiers.map(function (t, i) {
        return '<div class="tier-card"><div class="row between">' + P.tierTag(t) + '<button type="button" class="btn btn-ghost btn-sm" data-act="tierEdit" data-i="' + i + '">' + ic('pencil', 16) + '<span class="btn-label">' + T('Ubah') + '</span></button></div>' +
          '<div class="stack" style="--gap:2px"><span class="t-small sec">' + T('Syarat') + '</span><span class="t-strong">' + (t.min ? T('Belanja {rp} dalam 12 bulan', { rp: P.rp(t.min) }) : T('Mulai dari pembelian pertama')) + '</span></div>' +
          '<div class="row between"><span class="t-small sec">' + T('Pengali poin') + '</span><span class="t-h3 num">' + P.dec(t.mult) + '×</span></div>' +
          '<ul>' + BEN[t.id].map(function (b) { return '<li>' + ic('check', 16) + '<span>' + T(b) + '</span></li>'; }).join('') + '</ul>' +
          '<div class="row between"><span class="t-small sec">' + T('Member') + '</span><span class="t-strong num">' + P.num(counts[t.id]) + '</span></div></div>';
      }).join('') + '</div>' +
      '<div class="dash-2 mt-16">' + npanel(T('Aturan poin dan stempel'), 'adjustments', '<div class="form-rows">' +
        row(T('Jenis program'), T('Poin untuk tier, stempel untuk cup.'), seg('type', R.type, [['points', 'Poin'], ['stamps', 'Stempel'], ['both', 'Poin dan stempel']])) +
        row(T('Poin didapat'), T('Dikali pengali tier.'), num('earnPer', R.earnPer, T('1 poin per Rp'), T('belanja'))) +
        row(T('Batas per transaksi'), '', num('capSale', R.capSale, '', T('poin'))) +
        row(T('Batas harian per member'), T('Mencegah satu nomor dipakai banyak orang.'), num('capDay', R.capDay, '', T('poin'))) +
        row(T('Masa berlaku poin'), T('Pengingat lewat WhatsApp 14 hari sebelum hangus.'), seg('expiry', String(R.expiry), [['6', '6 bulan'], ['12', '12 bulan'], ['24', '24 bulan']])) +
        row(T('Periode tier'), T('Naik langsung. Turun hanya saat tinjauan.'), seg('period', R.period, [['rolling', '12 bulan berjalan'], ['year', 'Tahun kalender'], ['quarter', 'Kuartal']])) +
        row(T('Kartu stempel'), T('1 cup = 1 stempel.'), num('stampGoal', R.stampGoal, '', T('stempel = cup kecil gratis'))) +
        row(T('Hadiah ulang tahun'), T('Voucher di bulan ulang tahun.'), num('bday', R.bday, 'Rp', '')) + '</div>') +
        '<div class="stack" style="--gap:16px">' + npanel(T('Bayar pakai poin'), 'coins', '<div class="radio-cards" style="grid-template-columns:minmax(0,1fr)">' +
          '<button type="button" class="radio-card' + (!rp1 ? ' is-on' : '') + '" data-act="rule" data-k="payMode" data-v="voucher"><span class="radio-dot"></span><span class="stack" style="--gap:4px"><span class="t-strong">' + T('Poin jadi potongan rupiah') + '</span><span class="t-small sec">' + T('1 poin = {rp}. Member memakai poin di kasir atau menukarnya di katalog hadiah.', { rp: P.rp(R.pointValue) }) + '</span></span></button>' +
          '<button type="button" class="radio-card' + (rp1 ? ' is-on' : '') + '" data-act="rule" data-k="payMode" data-v="rp1"><span class="radio-dot"></span><span class="stack" style="--gap:4px"><span class="t-strong">' + T('1 poin = Rp1') + '</span><span class="t-small sec">' + T('Poin dihitung dari rupiah belanja, misalnya 5% belanja jadi poin. Angka poin terasa besar dan mudah dipahami.') + '</span></span></button></div>' +
          (rp1 ? '<div class="demo-note mt-12">' + ic('info-circle', 14) + '<span>' + T('Di demo ini hanya pratinjau. Mengganti cara ini mengubah saldo semua member, jadi perlu migrasi saldo.') + '</span></div>' : '<div class="mt-12">' + num('pointValue', R.pointValue, T('1 poin = Rp'), '') + '</div>')) +
        npanel(T('Pratinjau hitungan'), 'arrows-exchange', '<span class="inline-input"><span class="sec">' + T('Belanja') + ' Rp</span><span class="input input-sm"><input data-rule="preview" type="number" value="' + ex + '"></span></span><table class="dtable mt-12"><thead><tr><th>' + T('Tier') + '</th><th class="al-right">' + T('Poin') + '</th><th class="al-right">' + T('Nilai') + '</th><th class="al-right">' + T('Persen kembali') + '</th></tr></thead><tbody>' +
          R.tiers.map(function (t) { var pts = rp1 ? Math.round(ex * 0.05 * t.mult) : Math.min(R.capSale, Math.floor(Math.floor(ex / R.earnPer) * t.mult)), val = rp1 ? pts : pts * R.pointValue; return '<tr><td>' + P.tierTag(t, true) + '</td><td class="al-right num">' + P.num(pts) + '</td><td class="al-right num">' + P.rp(val) + '</td><td class="al-right num">' + (ex ? P.dec((val / ex * 100).toFixed(1)) : 0) + '%</td></tr>'; }).join('') + '</tbody></table>') + '</div></div>';
  };
  AFTER.tier = function () {
    document.querySelectorAll('[data-rule]').forEach(function (i) { i.onchange = function () { var k = i.dataset.rule, v = +i.value; if (k === 'preview') draftRules.preview = v; else draftRules[k] = Math.max(k === 'earnPer' || k === 'pointValue' ? 1 : 0, v); render(); }; });
  };
  ACT.rule = function (el) { var k = el.dataset.k, v = el.dataset.v; draftRules[k] = k === 'expiry' ? +v : v; render(); };
  ACT.rulesSave = function () {
    var d = JSON.parse(JSON.stringify(draftRules)); delete d.preview;
    if (d.payMode === 'rp1') { d.payMode = 'voucher'; P.toast(T('Disimpan. Cara "1 poin = Rp1" tetap pratinjau di demo.'), 'info-circle'); } else P.toast(T('Aturan disimpan. Berlaku untuk transaksi berikutnya.'));
    P.S.rules = d; P.addAudit('Sinta Wirawan', 'Mengubah aturan tier dan poin', {}); P.save(); draftRules = null; render();
  };
  ACT.rulesReset = function () { draftRules = P.rules0(); render(); P.toast(T('Contoh awal dimuat. Klik Simpan aturan untuk memakainya.'), 'info-circle'); };
  ACT.tierEdit = function (el) {
    var i = +el.dataset.i, t = draftRules.tiers[i];
    var md = P.modal({ title: T('Ubah tier {t}', { t: t.name }), width: 460,
      body: '<div class="stack" style="--gap:14px"><label class="field"><span class="field-label">' + T('Nama tier') + '</span><span class="input"><input id="tn" value="' + esc(t.name) + '"></span></label>' +
        (i ? '<label class="field"><span class="field-label">' + T('Syarat belanja dalam 12 bulan') + '</span><span class="input"><span class="input-suffix">Rp</span><input id="tm" type="number" value="' + t.min + '"></span></label>' : '<p class="t-small sec">' + T('Tier pertama mulai dari pembelian pertama.') + '</p>') +
        '<label class="field"><span class="field-label">' + T('Pengali poin') + '</span><span class="select"><select id="tx">' + [1, 1.25, 1.5, 2].map(function (x) { return '<option value="' + x + '"' + (t.mult === x ? ' selected' : '') + '>' + P.dec(x) + '×</option>'; }).join('') + '</select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label></div>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="tgo">' + T('Terapkan') + '</button>' });
    md.el.querySelector('#tgo').onclick = function () { t.name = md.el.querySelector('#tn').value.trim() || t.name; if (i) t.min = Math.max(1, +md.el.querySelector('#tm').value || t.min); t.mult = +md.el.querySelector('#tx').value; md.close(); render(); P.toast(T('Diterapkan ke draf. Klik Simpan aturan.'), 'info-circle'); };
  };

  /* ── Vouchers ── */
  PAGES.voucher = function () {
    var iss = 0, used = 0; P.S.vtpl.forEach(function (v) { iss += v.issued; used += v.used; });
    return pageHead(T('Voucher'), T('Setiap voucher sekali pakai, dengan QR dan kode unik per member.'), btn(T('Buat voucher'), 'plus', 'data-act="newV"', 'primary')) +
      '<div class="kpi-grid">' + npanel(T('Voucher aktif di member'), 'ticket', stat(P.num(iss - used), T('voucher'))) + npanel(T('Dipakai 30 hari'), 'circle-check', stat('312', T('voucher'), T('Rata-rata 10 per hari'))) + npanel(T('Tingkat pakai'), 'percentage', stat(Math.round(used / iss * 100) + '%', null, T('{a} dari {b} voucher yang dibagikan', { a: P.num(used), b: P.num(iss) }))) + '</div>' +
      '<div class="npanel mt-16"><div class="npanel-body pad-none"><div class="dtable-wrap"><table class="dtable"><thead><tr><th>' + T('Voucher') + '</th><th class="hide-m">' + T('Pemicu') + '</th><th>' + T('Untuk tier') + '</th><th class="al-right hide-m">' + T('Dibagikan') + '</th><th class="al-right hide-m">' + T('Dipakai') + '</th><th>' + T('Tingkat pakai') + '</th><th>' + T('Aktif') + '</th></tr></thead><tbody>' +
      P.S.vtpl.map(function (v) {
        var pct = v.issued ? Math.round(v.used / v.issued * 100) : 0;
        return '<tr><td class="t-strong">' + esc(T(v.name)) + '</td><td class="hide-m">' + esc(T(v.trigger)) + '</td><td>' + (v.tier === 'all' ? '<span class="tag tag-sm">' + T('Semua') + '</span>' : P.tierTag(P.tierById(v.tier), true)) + '</td><td class="al-right num hide-m">' + P.num(v.issued) + '</td><td class="al-right num hide-m">' + P.num(v.used) + '</td><td><span class="row" style="--gap:8px;min-width:120px"><span class="pbar grow" style="height:6px"><span style="width:' + pct + '%"></span></span><span class="num t-small">' + pct + '%</span></span></td>' +
          '<td><button type="button" class="toggle' + (v.on ? ' is-on' : '') + '" role="switch" aria-checked="' + v.on + '" aria-label="' + esc(T(v.name)) + '" data-act="vOn" data-id="' + v.id + '"><span class="toggle-track"><span class="toggle-thumb"></span></span></button></td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
  };
  ACT.vOn = function (el) { var v = P.S.vtpl.filter(function (x) { return x.id === el.dataset.id; })[0]; v.on = !v.on; P.save(); render(); P.toast(v.on ? T('Voucher diaktifkan') : T('Voucher dihentikan. Voucher yang sudah dibagikan tetap berlaku.')); };
  ACT.newV = function () {
    var md = P.modal({ title: T('Buat voucher'), desc: T('Sekali pakai. Tiap member dapat QR dan kode sendiri.'), width: 560,
      body: '<div class="stack" style="--gap:14px"><label class="field"><span class="field-label">' + T('Nama voucher') + '</span><span class="input"><input id="nvn" value="' + T('Akhir pekan · gratis topping') + '"></span></label>' +
        '<div class="grid cols-2" style="--gap:12px"><label class="field"><span class="field-label">' + T('Jenis') + '</span><span class="select"><select id="nvk"><option value="free">' + T('Produk gratis') + '</option><option value="rp">' + T('Potongan rupiah') + '</option><option value="pct">' + T('Diskon persen') + '</option></select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label>' +
        '<label class="field"><span class="field-label">' + T('Untuk tier') + '</span><span class="select"><select id="nvt"><option value="all">' + T('Semua tier') + '</option><option value="gold">' + T('Gold ke atas') + '</option><option value="platinum">Platinum</option></select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label>' +
        '<label class="field"><span class="field-label">' + T('Pemicu') + '</span><span class="select"><select id="nvg"><option>' + T('Kampanye') + '</option><option>' + T('Saat daftar') + '</option><option>' + T('Bulan ulang tahun') + '</option><option>' + T('Tukar poin') + '</option></select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label>' +
        '<label class="field"><span class="field-label">' + T('Berlaku') + '</span><span class="input"><input type="number" value="14"><span class="input-suffix">' + T('hari') + '</span></span></label></div>' +
        '<div class="info-note">' + ic('lock', 16) + '<span>' + T('Kasir memeriksa voucher dengan memindai QR atau mengetik kode. Voucher yang sudah dipakai ditolak.') + '</span></div></div>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="nvgo">' + T('Buat voucher') + '</button>' });
    md.el.querySelector('#nvgo').onclick = function () {
      P.S.vtpl.unshift({ id: P.uid('vt'), name: md.el.querySelector('#nvn').value.trim() || T('Voucher baru'), trigger: md.el.querySelector('#nvg').value, tier: md.el.querySelector('#nvt').value, issued: 0, used: 0, on: true });
      P.save(); md.close(); render(); P.toast(T('Voucher dibuat'));
    };
  };

  /* ── Segments ── */
  PAGES.segmen = function () {
    var tot = total();
    return pageHead(T('Segmen'), T('5 segmen siap pakai, dihitung ulang setiap malam.')) + '<div class="seg-cards">' +
      ['new', 'active', 'risk', 'lapsed', 'top'].map(function (k) {
        var s = SEGS[k], n = s.n();
        return '<div class="seg-card"><div class="row between"><span class="row"><span class="hub-card-icon" style="width:36px;height:36px">' + ic(s.icon, 18) + '</span><span class="t-h3">' + T(s.name) + '</span></span>' + '<span class="tag tag-sm num">' + T('{p}% member', { p: Math.round(n / tot * 100) }) + '</span>' + '</div>' +
          '<span class="t-small sec">' + T(s.rule) + '</span>' + stat(P.num(n), T('member'), T('Belanja rata-rata {rp} dalam 12 bulan', { rp: P.rp(s.avg) })) +
          '<p class="t-small sec grow">' + T(s.tip) + '</p><div class="row wrap">' + lbtn(T('Lihat member'), 'users', '#/member?seg=' + k) + lbtn(T('Kirim kampanye'), 'send', '#/kampanye/baru?seg=' + k, 'primary') + '</div></div>';
      }).join('') +
      '<div class="seg-card" style="background:var(--bg-subtle)"><div class="row between"><span class="row"><span class="hub-card-icon" style="width:36px;height:36px">' + ic('filter', 18) + '</span><span class="t-h3">' + T('Segmen sendiri') + '</span></span><span class="tag tag-sm">' + T('Segera') + '</span></div><p class="t-small sec grow">' + T('Buat segmen dari menu favorit, outlet, ulang tahun, atau tier. Tersedia di versi berikutnya.') + '</p></div></div>';
  };

  /* ── Campaigns ── */
  var comp = null;
  function compDefault(seg) { return { name: T('Kangen Kamtono November'), seg: seg || 'risk', ch: { wa: true, email: false, wallet: true }, msg: T('Halo {nama}, sudah lama tidak mampir ke Kamtono. Ada gratis topping untukmu sampai akhir bulan. Tunjukkan voucher di kasir, ya.'), voucher: 'Gratis topping', when: 'now', prev: 'wa' }; }
  function reach(c) { var n = SEGS[c.seg].n(); var wa = c.ch.wa ? Math.round(n * 0.82 * 0.97) : 0, em = c.ch.email ? Math.round(n * 0.36) : 0, wl = c.ch.wallet ? Math.round(n * 0.61) : 0; return { n: n, wa: wa, email: em, wallet: wl, skip: c.ch.wa ? Math.round(n * 0.82 * 0.03) : 0, waCost: wa * WA_RATE }; }
  PAGES.kampanye = function (r) {
    if (r.id === 'baru') return composer(r);
    return pageHead(T('Kampanye'), T('Promo lewat WhatsApp, email, dan notifikasi kartu Wallet, ke member yang memberi izin.'), lbtn(T('Buat kampanye'), 'plus', '#/kampanye/baru', 'primary')) +
      '<div class="npanel"><div class="npanel-body pad-none"><div class="dtable-wrap"><table class="dtable"><thead><tr><th>' + T('Kampanye') + '</th><th class="hide-m">' + T('Segmen') + '</th><th>' + T('Saluran') + '</th><th class="al-right">' + T('Terkirim') + '</th><th class="al-right hide-m">' + T('Dibaca') + '</th><th class="al-right hide-m">' + T('Voucher dipakai') + '</th><th class="al-right">' + T('Biaya') + '</th><th class="hide-m">' + T('Tanggal') + '</th></tr></thead><tbody>' +
      P.S.campaigns.slice().sort(function (a, b) { return b.at - a.at; }).map(function (k) {
        return '<tr><td><span class="stack" style="--gap:0"><span class="t-strong">' + esc(T(k.name)) + '</span>' + (k.status === 'scheduled' ? '<span class="t-small c-info">' + T('Terjadwal') + '</span>' : '') + '</span></td><td class="hide-m">' + T(SEGS[k.seg].name) + '</td><td><span class="row" style="--gap:4px">' + k.ch.map(chCh).join('') + '</span></td><td class="al-right num">' + P.num(k.sent) + '</td><td class="al-right num hide-m">' + (k.read ? P.num(k.read) : '–') + '</td><td class="al-right num hide-m">' + (k.used != null ? P.num(k.used) : '–') + '</td><td class="al-right num">' + (k.cost ? P.rp(k.cost) : T('Gratis')) + '</td><td class="hide-m">' + P.fdate(k.at, true) + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>' +
      '<div class="info-note mt-16">' + ic('info-circle', 16) + '<span>' + T('Tarif WhatsApp untuk Indonesia: pesan marketing Rp586,33 dan pesan utility Rp356,65, sebelum PPN 11%. Email dan notifikasi Wallet termasuk paket.') + '</span></div>';
  };
  function composer(r) {
    if (!comp || r.q.seg) { comp = compDefault(r.q.seg); if (r.q.seg) history.replaceState(null, '', '#/kampanye/baru'); }
    var c = comp, R = reach(c), ppn = R.waCost * PPN, prev = c.ch[c.prev] ? c.prev : (c.ch.wa ? 'wa' : c.ch.email ? 'email' : 'wallet');
    var msg = esc(c.msg.replace(/\{nama\}/g, 'Rina').replace(/\{poin\}/g, '186').replace(/\{tier\}/g, 'Gold'));
    var preview = prev === 'wa' ? '<div class="wa-preview"><div class="t-small center sec">' + T('Kamtono · akun bisnis') + '</div><div class="wa-bubble"><b>Kamtono</b><span>' + msg + '</span>' + (c.voucher ? '<span class="t-small sec">' + T('Voucher: {v}', { v: T(c.voucher) }) + '</span><span class="wa-btn">' + T('Lihat voucher') + '</span>' : '') + '<span class="t-small muted" style="align-self:flex-end">09.00</span></div><div class="wa-bubble" style="opacity:.7"><span class="t-small">' + T('Balas BERHENTI untuk tidak menerima promo.') + '</span></div></div>'
      : prev === 'email' ? '<div class="card pad-md stack" style="--gap:8px"><span class="t-small sec">' + T('Dari: Kamtono') + '</span><b>' + esc(c.name) + '</b><p class="sec" style="white-space:pre-wrap">' + msg + '</p>' + (c.voucher ? '<span class="btn btn-primary btn-sm" style="align-self:flex-start">' + T('Lihat voucher') + '</span>' : '') + '<span class="t-small muted">' + T('Berhenti berlangganan') + '</span></div>'
        : '<div class="wa-preview" style="background:linear-gradient(160deg,#2b2b29,#0f0f0e);justify-content:center"><div class="pnotif" style="position:static;animation:none"><span class="pnotif-app is-wallet">' + ic('wallet', 20) + '</span><span class="stack grow" style="--gap:2px"><b>Kamtono</b><span class="t-small">' + msg.slice(0, 120) + (msg.length > 120 ? '…' : '') + '</span></span></div></div>';
    return pageHead(T('Kampanye baru'), T('Pilih segmen dan saluran. Biaya terlihat sebelum dikirim.'), '', ['#/kampanye', T('Kampanye')]) +
      '<div class="dash-2">' + npanel(T('Isi kampanye'), 'pencil', '<div class="stack" style="--gap:16px">' +
        '<label class="field"><span class="field-label">' + T('Nama kampanye') + '</span><span class="input"><input data-c="name" value="' + esc(c.name) + '"></span></label>' +
        '<label class="field"><span class="field-label">' + T('Segmen') + '</span><span class="select"><select data-c="seg">' + ['all', 'new', 'active', 'risk', 'lapsed', 'top', 'gold'].map(function (k) { return '<option value="' + k + '"' + (c.seg === k ? ' selected' : '') + '>' + T(SEGS[k].name) + ' · ' + P.num(SEGS[k].n()) + '</option>'; }).join('') + '</select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label>' +
        '<div class="field"><span class="field-label">' + T('Saluran') + '</span><div class="ch-cards">' +
          [['wa', 'brand-whatsapp', 'WhatsApp', T('Rp586,33 per pesan, sebelum PPN')], ['email', 'mail', 'Email', T('Termasuk paket')], ['wallet', 'wallet', T('Notifikasi Wallet'), T('Gratis, hanya member dengan kartu Wallet')]].map(function (x) { return '<button type="button" class="ch-card' + (c.ch[x[0]] ? ' is-on' : '') + '" data-act="cch" data-v="' + x[0] + '" aria-pressed="' + !!c.ch[x[0]] + '"><span class="ch-card-top"><span class="row" style="--gap:6px">' + ic(x[1], 18) + '<span class="t-strong">' + x[2] + '</span></span>' + (c.ch[x[0]] ? ic('circle-check', 18) : '') + '</span><span class="t-small sec">' + x[3] + '</span></button>'; }).join('') + '</div></div>' +
        '<label class="field"><span class="field-label">' + T('Pesan') + '</span><textarea class="textarea" data-c="msg" rows="4">' + esc(c.msg) + '</textarea><span class="var-chips">' + ['{nama}', '{poin}', '{tier}'].map(function (v) { return '<button type="button" class="chip" data-act="cvar" data-v="' + v + '">' + ic('plus', 14) + v + '</button>'; }).join('') + '</span></label>' +
        '<label class="field"><span class="field-label">' + T('Lampirkan voucher') + '</span><span class="select"><select data-c="voucher"><option value="">' + T('Tanpa voucher') + '</option>' + ['Gratis topping', 'Potongan Rp20.000', 'Diskon 20% cup besar'].map(function (v) { return '<option value="' + v + '"' + (c.voucher === v ? ' selected' : '') + '>' + T(v) + '</option>'; }).join('') + '</select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label>' +
        '<div class="field"><span class="field-label">' + T('Waktu kirim') + '</span><div class="tabs-segmented tabs-sm" style="align-self:flex-start"><button type="button" class="tab' + (c.when === 'now' ? ' is-active' : '') + '" data-act="cwhen" data-v="now">' + T('Kirim sekarang') + '</button><button type="button" class="tab' + (c.when === 'later' ? ' is-active' : '') + '" data-act="cwhen" data-v="later">' + T('Jadwalkan: Jumat 10.00') + '</button></div></div>' +
        '<div class="info-note">' + ic('shield-check', 16) + '<span>' + T('Batas 2 promo per member per minggu. {n} member dilewati karena sudah dapat 2 promo minggu ini.', { n: P.num(R.skip) }) + '</span></div></div>') +
      '<div class="stack" style="--gap:16px">' + npanel(T('Pratinjau'), 'eye', '<div class="tabs-segmented tabs-sm" style="margin-bottom:12px">' + ['wa', 'email', 'wallet'].filter(function (k) { return c.ch[k]; }).map(function (k) { return '<button type="button" class="tab' + (prev === k ? ' is-active' : '') + '" data-act="cprev" data-v="' + k + '">' + { wa: 'WhatsApp', email: 'Email', wallet: 'Wallet' }[k] + '</button>'; }).join('') + '</div>' + (c.ch.wa || c.ch.email || c.ch.wallet ? preview : '<p class="sec">' + T('Pilih minimal satu saluran.') + '</p>')) +
        npanel(T('Perkiraan biaya'), 'cash', '<div class="lv-list">' +
          (c.ch.wa ? '<div class="lv-row"><span class="lv-label">WhatsApp<span class="lv-hint num">' + P.num(R.wa) + ' × Rp586,33</span></span><span class="lv-value num">' + P.rp(R.waCost) + '</span></div><div class="lv-row"><span class="lv-label">' + T('PPN 11%') + '</span><span class="lv-value num">' + P.rp(ppn) + '</span></div>' : '') +
          (c.ch.email ? '<div class="lv-row"><span class="lv-label">Email<span class="lv-hint num">' + T('{n} penerima', { n: P.num(R.email) }) + '</span></span><span class="lv-value">' + T('Termasuk paket') + '</span></div>' : '') +
          (c.ch.wallet ? '<div class="lv-row"><span class="lv-label">' + T('Notifikasi Wallet') + '<span class="lv-hint num">' + T('{n} kartu', { n: P.num(R.wallet) }) + '</span></span><span class="lv-value">' + T('Gratis') + '</span></div>' : '') +
          '<div class="lv-row is-total"><span class="lv-label">' + T('Total perkiraan') + '</span><span class="lv-value num t-h3">' + P.rp(R.waCost + ppn) + '</span></div></div>' +
          '<p class="t-small muted mt-8">' + T('Perkiraan. Tarif mengikuti tarif WhatsApp untuk Indonesia (marketing Rp586,33 per pesan, sebelum PPN).') + '</p>' +
          '<div class="row wrap mt-16">' + btn(T('Kirim tes ke HP saya'), 'device-mobile', 'data-act="ctest"') + btn(c.when === 'now' ? T('Kirim ke {n} member', { n: P.num(R.wa + R.email + R.wallet) }) : T('Jadwalkan'), 'send', 'data-act="csend"' + (c.ch.wa || c.ch.email || c.ch.wallet ? '' : ' disabled'), 'primary') + '</div>') + '</div></div>';
  }
  AFTER.kampanye = function (r) {
    if (r.id !== 'baru') return;
    document.querySelectorAll('[data-c]').forEach(function (el) {
      var k = el.dataset.c;
      if (el.tagName === 'SELECT') el.onchange = function () { comp[k] = el.value; render(); };
      else el.oninput = function () { comp[k] = el.value; if (k === 'msg') { clearTimeout(el._t); el._t = setTimeout(function () { var pos = el.selectionStart; render(); var t = document.querySelector('[data-c="msg"]'); if (t) { t.focus(); t.setSelectionRange(pos, pos); } }, 400); } };
    });
  };
  ACT.cch = function (el) { var k = el.dataset.v; comp.ch[k] = !comp.ch[k]; if (comp.ch[k]) comp.prev = k; render(); };
  ACT.cprev = function (el) { comp.prev = el.dataset.v; render(); };
  ACT.cwhen = function (el) { comp.when = el.dataset.v; render(); };
  ACT.cvar = function (el) { comp.msg += ' ' + el.dataset.v; render(); };
  ACT.ctest = function () { P.toast(T('Pesan tes terkirim ke WhatsApp pemilik (demo)'), 'brand-whatsapp'); };
  ACT.csend = function () {
    var c = comp, R = reach(c), ppn = R.waCost * PPN, chs = ['wa', 'email', 'wallet'].filter(function (k) { return c.ch[k]; });
    var md = P.modal({ title: c.when === 'now' ? T('Kirim kampanye sekarang?') : T('Jadwalkan kampanye?'), desc: esc(c.name) + ' · ' + T(SEGS[c.seg].name), width: 480,
      body: '<div class="lv-list"><div class="lv-row"><span class="lv-label">' + T('Penerima') + '</span><span class="lv-value num">' + P.num(R.wa + R.email + R.wallet) + '</span></div><div class="lv-row"><span class="lv-label">' + T('Saluran') + '</span><span class="lv-value">' + chs.map(chCh).join(' ') + '</span></div><div class="lv-row is-total"><span class="lv-label">' + T('Biaya, termasuk PPN') + '</span><span class="lv-value num">' + P.rp(R.waCost + ppn) + '</span></div></div><p class="t-small sec mt-12">' + T('Pesan yang sudah terkirim tidak bisa ditarik kembali.') + '</p>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="cgo">' + ic('send', 18) + '<span class="btn-label">' + (c.when === 'now' ? T('Kirim') : T('Jadwalkan')) + '</span></button>' });
    md.el.querySelector('#cgo').onclick = function () {
      P.S.campaigns.unshift({ id: P.uid('k'), name: c.name, seg: c.seg, ch: chs, at: Date.now(), sent: R.wa + R.email + R.wallet, read: 0, used: null, cost: Math.round(R.waCost), status: c.when === 'now' ? 'sent' : 'scheduled' });
      var rina = P.member('m-rina');
      if (c.when === 'now' && ['all', 'active', 'gold'].indexOf(c.seg) >= 0 && rina) P.S.inbox.unshift({ id: P.uid('i'), memberId: 'm-rina', ch: c.ch.wa ? 'wa' : c.ch.wallet ? 'wallet' : 'email', title: c.name, body: c.msg.replace(/\{nama\}/g, 'Rina').replace(/\{poin\}/g, String(rina.points)).replace(/\{tier\}/g, P.tierOf(rina).name), at: Date.now(), read: false });
      P.save(); md.close(); comp = null; location.hash = '#/kampanye'; P.toast(c.when === 'now' ? T('Kampanye terkirim') : T('Kampanye terjadwal'), 'send');
    };
  };

  /* ── Outlets & staff ── */
  var POS_OPT = ['POS yang sudah dipakai', 'Aplikasi kasir Providea (browser)', 'Belum ada POS'];
  var PERMS = [['Lihat ringkasan dan laporan', 1, 1, 0], ['Cari member dan tambah penjualan', 1, 1, 1], ['Pakai voucher dan bayar pakai poin', 1, 1, 1], ['Batalkan penjualan', 1, 1, 1], ['Ubah tier atau poin manual', 1, 1, 0], ['Ubah aturan dan voucher', 1, 0, 0], ['Kirim kampanye', 1, 0, 0], ['Ekspor data member', 1, 0, 0], ['Kelola staf dan outlet', 1, 0, 0]];
  PAGES.outlet = function () {
    if (!P.S.outlets) P.S.outlets = [{ id: 'o1', name: 'Cempaka', addr: 'Jl. Cempaka Raya 12 (alamat contoh)', pos: POS_OPT[0], opened: Date.now() - 138 * P.DAY, live: true }];
    /* older saves kept a POS product name or an option that no longer exists: map it to a neutral option */
    P.S.outlets.forEach(function (o) { if (POS_OPT.indexOf(o.pos) < 0) o.pos = /kasir|cashier/i.test(o.pos || '') ? POS_OPT[1] : POS_OPT[0]; });
    var yes = '<span class="ic-yes">' + ic('check', 18) + '</span>', no = '<span class="ic-no">' + ic('minus', 18) + '</span>';
    return pageHead(T('Outlet dan staf'), T('Peran per outlet. Semua perubahan tercatat di log audit.'), btn(T('Undang staf'), 'user-plus', 'data-act="invite"') + btn(T('Tambah outlet'), 'plus', 'data-act="addOutlet"', 'primary')) +
      '<div class="dash-2e eq-row">' + P.S.outlets.map(function (o) {
        return npanel(T('Outlet {n}', { n: esc(o.name) }), 'building-store', '<div class="lv-list"><div class="lv-row"><span class="lv-label">' + T('Alamat') + '</span><span class="lv-value">' + esc(T(o.addr)) + '</span></div><div class="lv-row"><span class="lv-label">' + T('Status') + '</span><span class="lv-value">' + (o.live ? '<span class="tag tag-success tag-dot">' + T('Aktif') + '</span>' : '<span class="tag tag-info tag-dot">' + T('Persiapan') + '</span>') + '</span></div><div class="lv-row"><span class="lv-label">' + T('POS') + '</span><span class="lv-value">' + esc(T(o.pos)) + (o.live ? ' · <span class="c-success">' + T('terhubung') + '</span>' : '') + '</span></div><div class="lv-row"><span class="lv-label">' + T('Tablet kasir') + '</span><span class="lv-value num">' + (o.live ? '1' : '0') + '</span></div><div class="lv-row"><span class="lv-label">' + T('Dibuka') + '</span><span class="lv-value">' + P.fdate(o.opened) + '</span></div></div>',
          btn(T('QR standee'), 'qrcode', 'data-act="standee"'));
      }).join('') + npanel(T('Integrasi'), 'plug-connected', '<div>' +
        [['cash-register', T('POS (integrasi fleksibel)'), T('Terhubung · sinkron {a}', { a: P.ago(Date.now() - 2 * P.MIN) }), 'success'], ['brand-whatsapp', 'WhatsApp Business', T('Nomor bisnis terverifikasi'), 'success'], ['brand-apple', 'Apple Wallet', T('Aktif'), 'success'], ['wallet', 'Samsung Wallet', T('Aktif'), 'success'], ['mail', T('Email'), T('Aktif'), 'success']].map(function (x) { return '<div class="int-row"><span class="int-ic">' + ic(x[0], 18) + '</span><span class="grow t-strong">' + x[1] + '</span><span class="tag tag-' + x[3] + ' tag-sm">' + x[2] + '</span></div>'; }).join('') + '</div>') + '</div>' +
      '<div class="npanel mt-16"><header class="npanel-head"><span class="npanel-title">' + ic('users', 16) + T('Staf') + '<span class="npanel-count num">' + P.S.staff.length + '</span></span></header><div class="npanel-body pad-none"><div class="dtable-wrap"><table class="dtable"><thead><tr><th>' + T('Nama') + '</th><th>' + T('Peran') + '</th><th class="hide-m">' + T('Outlet') + '</th><th class="hide-m">' + T('Target daftar bulan ini') + '</th><th class="hide-m">' + T('Terakhir masuk') + '</th></tr></thead><tbody>' +
        P.S.staff.map(function (s) { var r = ROLES[s.role]; return '<tr><td><span class="m-cell"><span class="avatar avatar-neutral" style="width:32px;height:32px;font-size:12px">' + P.initials(s.name) + '</span><span class="t-strong">' + esc(s.name) + '</span></span></td><td><span class="tag tag-' + r[1] + ' tag-sm">' + T(r[0]) + '</span></td><td class="hide-m">' + esc(T(s.outlet)) + '</td><td class="hide-m">' + (s.joins ? '<span class="row" style="--gap:8px;min-width:140px"><span class="pbar grow" style="height:6px"><span style="width:' + Math.min(100, s.joins[0] / s.joins[1] * 100) + '%"></span></span><span class="num t-small">' + s.joins[0] + '/' + s.joins[1] + '</span></span>' : '–') + '</td><td class="hide-m">' + (s.last ? P.ago(s.last) : T('Undangan terkirim')) + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>' +
      '<div class="dash-2 mt-16">' + npanel(T('Hak akses per peran'), 'shield-lock', '<div class="dtable-wrap"><table class="dtable perm"><thead><tr><th>' + T('Bisa') + '</th><th>' + T('Pemilik') + '</th><th>' + T('Kepala outlet') + '</th><th>' + T('Kasir') + '</th></tr></thead><tbody>' + PERMS.map(function (p) { return '<tr><td>' + T(p[0]) + '</td><td>' + (p[1] ? yes : no) + '</td><td>' + (p[2] ? yes : no) + '</td><td>' + (p[3] ? yes : no) + '</td></tr>'; }).join('') + '</tbody></table></div>') +
        npanel(T('Log audit'), 'list-details', '<div class="timeline">' + P.S.audit.slice(0, 8).map(function (a) { return '<div class="tl-item tl-signed"><span class="tl-mark"></span><span class="tl-main"><span class="tl-title" style="font-weight:400">' + esc(T(a.what, a.v)) + '</span><span class="tl-sub">' + esc(a.who) + ' · ' + P.ago(a.at) + '</span></span></div>'; }).join('') + '</div>') + '</div>';
  };
  ACT.standee = function () { P.toast(T('QR standee meja kasir diunduh sebagai PDF (demo)'), 'download'); };
  ACT.invite = function () {
    var md = P.modal({ title: T('Undang staf'), desc: T('Undangan dikirim lewat WhatsApp. Staf masuk dengan kode, tanpa kata sandi.'), width: 480,
      body: '<div class="stack" style="--gap:14px"><label class="field"><span class="field-label">' + T('Nama') + '</span><span class="input"><input id="in" value="Raka Pratama"></span></label><label class="field"><span class="field-label">' + T('Nomor WhatsApp') + '</span><span class="input"><input id="ip" value="081377001122" inputmode="tel"></span></label>' +
        '<label class="field"><span class="field-label">' + T('Peran') + '</span><span class="select"><select id="ir"><option value="cashier">' + T('Kasir') + '</option><option value="lead">' + T('Kepala outlet') + '</option></select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label></div>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="igo">' + ic('brand-whatsapp', 18) + '<span class="btn-label">' + T('Kirim undangan') + '</span></button>' });
    md.el.querySelector('#igo').onclick = function () { var n = md.el.querySelector('#in').value.trim() || 'Staf baru'; P.S.staff.push({ id: P.uid('s'), name: n, role: md.el.querySelector('#ir').value, outlet: 'Cempaka', last: 0, joins: [0, 150] }); P.addAudit('Sinta Wirawan', 'Mengundang {m} sebagai staf', { m: n }); P.save(); md.close(); render(); P.toast(T('Undangan terkirim lewat WhatsApp'), 'brand-whatsapp'); };
  };
  ACT.addOutlet = function () {
    var md = P.modal({ title: T('Tambah outlet'), width: 480,
      body: '<div class="stack" style="--gap:14px"><label class="field"><span class="field-label">' + T('Nama outlet') + '</span><span class="input"><input id="on" value="Kenari"></span></label><label class="field"><span class="field-label">' + T('Alamat') + '</span><span class="input"><input id="oa" value="' + T('Alamat contoh') + '"></span></label>' +
        '<label class="field"><span class="field-label">' + T('POS di outlet ini') + '</span><span class="select"><select id="op">' + POS_OPT.map(function (o) { return '<option value="' + o + '">' + T(o) + '</option>'; }).join('') + '</select><span class="select-chev">' + ic('chevron-down', 16) + '</span></span></label><div class="info-note">' + ic('info-circle', 16) + '<span>' + T('Member, poin, dan tier berlaku di semua outlet.') + '</span></div></div>',
      foot: '<button type="button" class="btn btn-secondary" data-close>' + T('Batal') + '</button><button type="button" class="btn btn-primary" id="ogo">' + T('Tambah outlet') + '</button>' });
    md.el.querySelector('#ogo').onclick = function () { var n = md.el.querySelector('#on').value.trim() || 'Outlet baru'; P.S.outlets.push({ id: P.uid('o'), name: n, addr: md.el.querySelector('#oa').value, pos: md.el.querySelector('#op').value, opened: Date.now() + 30 * P.DAY, live: false }); P.addAudit('Sinta Wirawan', 'Menambah outlet {m}', { m: n }); P.save(); md.close(); render(); P.toast(T('Outlet ditambahkan')); };
  };

  window.addEventListener('hashchange', function () { drawer = false; render(); window.scrollTo(0, 0); });
  P.onLang = render;
  P.onSync = function () { if (!document.querySelector('.overlay') && document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(document.activeElement.tagName) < 0) render(); };
  render();
})();
