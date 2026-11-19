/* Providea Loyalty demo: shared core (state, rules, format, i18n, overlays, demo bar).
   Plain JS, no build step. All brands, people and numbers are fictional sample data. */
(function () {
  'use strict';
  var KEY = 'pl-demo-v2';
  var DAY = 864e5, HOUR = 36e5, MIN = 6e4;

  /* ── i18n: Indonesian strings are the keys; window.EN holds English ── */
  var LANG = 'id';
  try { LANG = localStorage.getItem('pl-lang') === 'en' ? 'en' : 'id'; } catch (e) {}
  function T(s, v) {
    var r = (LANG === 'en' && window.EN && window.EN[s]) || s;
    if (v) r = r.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; });
    return r;
  }

  /* ── format (Indonesian number format in both languages) ── */
  var nf = new Intl.NumberFormat('id-ID');
  function num(n) { return nf.format(Math.round(n)); }
  function rp(n) { return (n < 0 ? '−' : '') + 'Rp' + nf.format(Math.abs(Math.round(n))); }
  function dec(n) { return String(n).replace('.', ','); }
  var MON = { id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
  function fdate(t, noYear) { var d = new Date(t); return d.getDate() + ' ' + MON[LANG][d.getMonth()] + (noYear ? '' : ' ' + d.getFullYear()); }
  function fmonth(t) { var d = new Date(t); return MON[LANG][d.getMonth()] + ' ' + d.getFullYear(); }
  function ftime(t) { var d = new Date(t); return String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0'); }
  function ago(t) {
    var m = Math.round((Date.now() - t) / MIN);
    if (m < 1) return T('baru saja');
    if (m < 60) return T('{n} menit lalu', { n: m });
    var h = Math.round(m / 60); if (h < 24) return T('{n} jam lalu', { n: h });
    return T('{n} hari lalu', { n: Math.round(h / 24) });
  }
  function daysSince(t) { return Math.floor((Date.now() - t) / DAY); }
  function maskPhone(p) { return p ? p.slice(0, 4) + '-****-' + p.slice(-4) : ''; }
  function fmtPhone(p) { return p ? p.slice(0, 4) + '-' + p.slice(4, 8) + '-' + p.slice(8) : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(n) { return n.split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function uid(p) { return p + Math.random().toString(36).slice(2, 8); }
  function code(prefix) { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return 'SJK-' + prefix + '-' + s.slice(0, 3) + s.slice(3); }

  /* ── rules + seed ── */
  var BRAND = { name: 'Sejuk Froyo Bar', short: 'Sejuk', outlet: 'Cempaka', outletFull: 'Sejuk · Outlet Cempaka', domain: 'sejuk.providea.id' };
  function rules0() {
    return {
      type: 'both', earnPer: 10000, pointValue: 500, payMode: 'voucher', capSale: 50, capDay: 100, expiry: 12, period: 'rolling',
      stampGoal: 10, stampReward: 'Cup kecil gratis', bday: 25000,
      tiers: [
        { id: 'silver', name: 'Silver', min: 0, mult: 1 },
        { id: 'gold', name: 'Gold', min: 1500000, mult: 1.25 },
        { id: 'platinum', name: 'Platinum', min: 4000000, mult: 1.5 }
      ]
    };
  }
  var CATALOG = [
    { id: 'c1', title: 'Gratis topping', pts: 15, kind: 'free', value: 8000 },
    { id: 'c2', title: 'Potongan Rp20.000', pts: 40, kind: 'rp', value: 20000 },
    { id: 'c3', title: 'Cup sedang gratis', pts: 80, kind: 'free', value: 42000 }
  ];
  var MENU = [
    { id: 'p1', cat: 'froyo', name: 'Froyo Original · cup kecil', price: 32000, cup: 1 },
    { id: 'p2', cat: 'froyo', name: 'Froyo Original · cup sedang', price: 42000, cup: 1 },
    { id: 'p3', cat: 'froyo', name: 'Froyo Original · cup besar', price: 55000, cup: 1 },
    { id: 'p4', cat: 'froyo', name: 'Froyo Mangga Ketan', price: 48000, cup: 1 },
    { id: 'p5', cat: 'froyo', name: 'Froyo Stroberi Kemangi', price: 46000, cup: 1 },
    { id: 'p6', cat: 'froyo', name: 'Froyo Kopi Gula Aren', price: 46000, cup: 1 },
    { id: 't1', cat: 'topping', name: 'Topping buah segar', price: 8000 },
    { id: 't2', cat: 'topping', name: 'Topping granola madu', price: 8000 },
    { id: 't3', cat: 'topping', name: 'Topping mochi', price: 9000 },
    { id: 't4', cat: 'topping', name: 'Saus cokelat', price: 6000 },
    { id: 'd1', cat: 'minum', name: 'Smoothie yogurt', price: 38000 },
    { id: 'd2', cat: 'minum', name: 'Air mineral', price: 8000 }
  ];

  function seed() {
    var now = Date.now();
    function M(id, name, phone, email, spend, points, stamps, visits, joinedD, lastD, o) {
      var m = { id: id, name: name, phone: phone, email: email, spend: spend, points: points, stamps: stamps, visits: visits,
        joined: now - joinedD * DAY, last: now - lastD * DAY, promoWa: true, promoEmail: !!email, bday: '', no: '26' + String(7 + (id.length % 4)).padStart(2, '0') + '-' + String(1000 + Math.floor(spend / 997) % 9000), wallet: '' };
      for (var k in o) m[k] = o[k];
      return m;
    }
    var members = [
      M('m-rina', 'Rina Maharani', '081288304471', 'rina.maharani@example.com', 1742000, 186, 7, 38, 138, 3, { no: '2607-0412', bday: '14 Mar', wallet: 'apple' }),
      M('m-bagus', 'Bagus Santoso', '081377120938', '', 4215000, 402, 4, 81, 137, 1, { bday: '2 Feb', wallet: 'samsung' }),
      M('m-anisa', 'Anisa Rahmawati', '085711023356', 'anisa.r@example.com', 2310000, 233, 2, 46, 130, 6, { wallet: 'samsung' }),
      M('m-kevin', 'Kevin Tanoto', '081911870214', '', 1920000, 205, 9, 40, 121, 9, { wallet: 'apple' }),
      M('m-citra', 'Citra Ayuningtyas', '082122485510', 'citra.ayu@example.com', 1588000, 171, 5, 33, 110, 14),
      M('m-laras', 'Laras Kinanti', '087820116645', '', 1120000, 112, 3, 25, 97, 4, { override: 'gold', overrideWhy: 'Kompensasi keluhan pesanan 2 Nov, disetujui pemilik' }),
      M('m-hendra', 'Hendra Wijaya', '081564450021', '', 640000, 64, 6, 14, 88, 41, { promoWa: false }),
      M('m-melati', 'Melati Sari', '089611237780', '', 380000, 38, 8, 8, 52, 12),
      M('m-putri', 'Putri Anggraini', '081287765501', 'putri.ang@example.com', 96000, 9, 2, 2, 5, 2),
      M('m-gilang', 'Gilang Ramadhan', '085280014472', '', 210000, 21, 4, 4, 18, 8),
      M('m-yosef', 'Yosef Manurung', '081298870035', '', 455000, 45, 1, 10, 126, 72),
      M('m-teguh', 'Teguh Prasetyo', '087755612209', '', 95000, 9, 2, 2, 115, 96, { promoWa: false })
    ];
    var log = [];
    var n = 1240;
    function sale(mid, at, amount, pts, stamps, by) { n++; log.push({ id: 'l' + n, kind: 'sale', memberId: mid, at: at, amount: amount, points: pts, stamps: stamps, receipt: 'C-00' + n, by: by || 'Ayu', outlet: 'Cempaka', channel: n % 3 ? 'pos' : 'kasir' }); }
    var ra = [47000, 42000, 55000, 42000, 64000, 32000, 46000, 42000];
    for (var i = 0; i < ra.length; i++) sale('m-rina', now - (3 + i * 4) * DAY - (5 + i) * HOUR, ra[i], Math.floor(Math.floor(ra[i] / 10000) * (i < 5 ? 1.25 : 1)), 1, i % 2 ? 'Lia' : 'Ayu');
    log.push({ id: 'l-tier1', kind: 'tier', memberId: 'm-rina', at: now - 22 * DAY - 6 * HOUR, title: 'Gold', by: 'Sistem' });
    log.push({ id: 'l-red1', kind: 'redeem', memberId: 'm-rina', at: now - 30 * DAY, points: -40, title: 'Potongan Rp20.000', by: 'Rina' });
    log.push({ id: 'l-pay1', kind: 'pay', memberId: 'm-rina', at: now - 46 * DAY, points: -60, amount: 30000, by: 'Ayu', outlet: 'Cempaka' });
    log.push({ id: 'l-v1', kind: 'voucher', memberId: 'm-rina', at: now - 136 * DAY, title: 'Gratis topping', by: 'Ayu', outlet: 'Cempaka' });
    log.push({ id: 'l-join1', kind: 'join', memberId: 'm-rina', at: now - 138 * DAY, by: 'QR meja kasir', outlet: 'Cempaka' });
    /* today at the till */
    sale('m-bagus', now - 25 * MIN, 64000, 9, 1, 'Ayu');
    sale('m-laras', now - 48 * MIN, 42000, 5, 1, 'Ayu');
    sale('m-putri', now - 80 * MIN, 50000, 5, 1, 'Lia');
    sale('m-kevin', now - 130 * MIN, 46000, 5, 1, 'Lia');
    log.push({ id: 'l-join2', kind: 'join', memberId: 'm-putri', at: now - 5 * DAY, by: 'Kasir: Lia', outlet: 'Cempaka' });
    log.push({ id: 'l-tier2', kind: 'tier', memberId: 'm-laras', at: now - 17 * DAY, title: 'Gold', by: 'Fajar (manual)' });

    var vouchers = [
      { id: 'v-r1', memberId: 'm-rina', title: 'Gratis topping', src: 'Hadiah naik Gold', code: 'SJK-GT7-Q4M', exp: now + 42 * DAY, kind: 'free', value: 8000 },
      { id: 'v-r2', memberId: 'm-rina', title: 'Diskon 20% cup besar', src: 'Selasa Gold', code: 'SJK-SG2-K8P', exp: now + 12 * DAY, tier: 'gold', kind: 'pct', value: 20 },
      { id: 'v-r0', memberId: 'm-rina', title: 'Gratis topping', src: 'Hadiah sambutan', code: 'SJK-WL8-H2D', exp: now - 40 * DAY, kind: 'free', value: 8000, used: { at: now - 136 * DAY, by: 'Ayu', outlet: 'Cempaka' } },
      { id: 'v-b1', memberId: 'm-bagus', title: 'Beli 1 gratis 1', src: 'Platinum bulanan', code: 'SJK-PB1-7RX', exp: now + 11 * DAY, tier: 'platinum', kind: 'free', value: 42000 },
      { id: 'v-p1', memberId: 'm-putri', title: 'Gratis topping', src: 'Hadiah sambutan', code: 'SJK-WL3-N6T', exp: now + 25 * DAY, kind: 'free', value: 8000 },
      { id: 'v-k1', memberId: 'm-kevin', title: 'Diskon 20% cup besar', src: 'Selasa Gold', code: 'SJK-SG5-W2C', exp: now + 12 * DAY, tier: 'gold', kind: 'pct', value: 20 }
    ];
    var inbox = [
      { id: 'i1', memberId: 'm-rina', ch: 'email', title: 'Poinmu cukup untuk cup sedang gratis', body: 'Kamu punya 186 poin. Tukar 80 poin jadi cup sedang gratis di menu Voucher.', at: now - 5 * DAY, read: false },
      { id: 'i2', memberId: 'm-rina', ch: 'wa', title: 'Selasa Gold: diskon 20% cup besar', body: 'Khusus member Gold dan Platinum. Tunjukkan voucher di kasir setiap Selasa sampai akhir bulan.', at: now - 8 * DAY, read: false },
      { id: 'i3', memberId: 'm-rina', ch: 'wallet', title: 'Menu baru: Froyo Mangga Ketan', body: 'Sudah ada di Outlet Cempaka. Member Gold dapat topping gratis untuk menu baru minggu ini.', at: now - 9 * DAY, read: true },
      { id: 'i4', memberId: 'm-rina', ch: 'wa', title: 'Selamat, kamu naik ke Gold', body: 'Mulai sekarang poinmu 1,25×. Hadiah naik tier: gratis topping, sudah ada di Voucher.', at: now - 22 * DAY, read: true }
    ];
    var campaigns = [
      { id: 'k1', name: 'Poin hampir cukup', seg: 'active', ch: ['email'], at: now - 5 * DAY, sent: 512, read: 196, used: 58, cost: 0, status: 'sent' },
      { id: 'k2', name: 'Selasa Gold', seg: 'gold', ch: ['wa'], at: now - 8 * DAY, sent: 231, read: 201, used: 64, cost: 135442, status: 'sent' },
      { id: 'k3', name: 'Menu baru Mangga Ketan', seg: 'all', ch: ['wallet'], at: now - 9 * DAY, sent: 1310, read: 0, used: 188, cost: 0, status: 'sent' },
      { id: 'k4', name: 'Kangen Sejuk', seg: 'risk', ch: ['wa'], at: now - 16 * DAY, sent: 286, read: 233, used: 41, cost: 167690, status: 'sent' }
    ];
    var vtpl = [
      { id: 'vt1', name: 'Hadiah sambutan · gratis topping', trigger: 'Saat daftar', tier: 'all', issued: 2140, used: 1426, on: true },
      { id: 'vt2', name: 'Hadiah naik Gold · gratis topping', trigger: 'Naik ke Gold', tier: 'gold', issued: 231, used: 152, on: true },
      { id: 'vt3', name: 'Ulang tahun · potongan Rp25.000', trigger: 'Bulan ulang tahun', tier: 'all', issued: 164, used: 97, on: true },
      { id: 'vt4', name: 'Selasa Gold · diskon 20% cup besar', trigger: 'Kampanye', tier: 'gold', issued: 256, used: 64, on: true },
      { id: 'vt5', name: 'Kartu stempel penuh · cup kecil gratis', trigger: '10 stempel', tier: 'all', issued: 318, used: 271, on: true },
      { id: 'vt6', name: 'Platinum bulanan · beli 1 gratis 1', trigger: 'Tiap bulan', tier: 'platinum', issued: 75, used: 49, on: true },
      { id: 'vt7', name: 'Tukar 15 poin · gratis topping', trigger: 'Tukar poin', tier: 'all', issued: 402, used: 377, on: true },
      { id: 'vt8', name: 'Tukar 40 poin · potongan Rp20.000', trigger: 'Tukar poin', tier: 'all', issued: 188, used: 161, on: true },
      { id: 'vt9', name: 'Tukar 80 poin · cup sedang gratis', trigger: 'Tukar poin', tier: 'all', issued: 64, used: 51, on: true }
    ];
    var staff = [
      { id: 's1', name: 'Sinta Wirawan', role: 'owner', outlet: 'Semua outlet', last: now - 10 * MIN, joins: null },
      { id: 's2', name: 'Fajar Nugroho', role: 'lead', outlet: 'Cempaka', last: now - 3 * HOUR, joins: [102, 150] },
      { id: 's3', name: 'Ayu Kartika', role: 'cashier', outlet: 'Cempaka', last: now - 4 * MIN, joins: [168, 200] },
      { id: 's4', name: 'Lia Safitri', role: 'cashier', outlet: 'Cempaka', last: now - 26 * HOUR, joins: [142, 200] }
    ];
    var audit = [
      { at: now - 2 * HOUR, who: 'Ayu Kartika', what: 'Membatalkan penjualan {r} (alasan: {why})', v: { r: 'C-001198', why: 'Salah input' } },
      { at: now - 5 * DAY, who: 'Sinta Wirawan', what: 'Mengekspor {n} member ke CSV', v: { n: '2.140' } },
      { at: now - 17 * DAY, who: 'Fajar Nugroho', what: 'Mengubah tier {m} ke {t} (alasan: {why})', v: { m: 'Laras Kinanti', t: 'Gold', why: 'Kompensasi keluhan pesanan 2 Nov' } },
      { at: now - 24 * DAY, who: 'Sinta Wirawan', what: 'Mengubah aturan tier dan poin', v: {} }
    ];
    return { v: 2, rules: rules0(), members: members, log: log, vouchers: vouchers, inbox: inbox, campaigns: campaigns, vtpl: vtpl, staff: staff, audit: audit, checkins: [], me: 'm-rina', receiptNo: 1290 };
  }

  var S;
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.v === 2) return s; } catch (e) {}
    return seed();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function reset() { try { localStorage.removeItem(KEY); localStorage.removeItem('pl-visited'); } catch (e) {} S = seed(); save(); }
  /* demo stamp card on the landing: which views a visitor has opened */
  function visited() { try { return JSON.parse(localStorage.getItem('pl-visited') || '{}') || {}; } catch (e) { return {}; } }
  function visit(k) { try { var v = visited(); if (!v[k]) { v[k] = 1; localStorage.setItem('pl-visited', JSON.stringify(v)); } } catch (e) {} }
  S = load();

  /* ── domain helpers ── */
  function member(id) { return S.members.filter(function (m) { return m.id === id; })[0]; }
  function tierById(id) { return S.rules.tiers.filter(function (t) { return t.id === id; })[0]; }
  function tierOf(m) {
    if (m.override) return tierById(m.override);
    var t = S.rules.tiers[0];
    S.rules.tiers.forEach(function (x) { if (m.spend >= x.min) t = x; });
    return t;
  }
  function nextTier(m) { var t = tierOf(m), i = S.rules.tiers.indexOf(t); return S.rules.tiers[i + 1] || null; }
  function earnFor(amount, m) { return Math.min(S.rules.capSale, Math.floor(Math.floor(amount / S.rules.earnPer) * tierOf(m).mult)); }
  function earnedToday(m) { var d = new Date(); d.setHours(0, 0, 0, 0); return S.log.filter(function (l) { return l.memberId === m.id && l.kind === 'sale' && !l.void && l.at >= d.getTime(); }).reduce(function (a, l) { return a + l.points; }, 0); }
  function segOf(m) {
    var last = daysSince(m.last);
    if (last > 60) return 'lapsed';
    if (last > 30) return 'risk';
    if (daysSince(m.joined) <= 30) return 'new';
    return 'active';
  }
  function isTop(m) { return m.spend >= 2000000; }
  function memberVouchers(id, all) { return S.vouchers.filter(function (v) { return v.memberId === id && (all || (!v.used && v.exp > Date.now())); }); }
  function addAudit(who, what, v) { S.audit.unshift({ at: Date.now(), who: who, what: what, v: v || {} }); }
  function nextReceipt() { S.receiptNo += 1; return 'C-00' + S.receiptNo; }
  function bumpReceipt(r) { var n = parseInt(String(r).replace(/\D/g, ''), 10); if (n > S.receiptNo) S.receiptNo = n; return r; }

  /* record a sale and return {points, stamps, tierUp, stampReward} */
  function recordSale(m, amount, cups, opts) {
    opts = opts || {};
    var before = tierOf(m), pts = earnFor(amount, m);
    var room = Math.max(0, S.rules.capDay - earnedToday(m)); var capped = pts > room; pts = Math.min(pts, room);
    var stamps = S.rules.type === 'points' ? 0 : cups;
    m.points += pts; m.spend += amount; m.visits += 1; m.last = Date.now();
    var reward = null;
    m.stamps += stamps;
    if (m.stamps >= S.rules.stampGoal) {
      m.stamps -= S.rules.stampGoal;
      reward = { id: uid('v-'), memberId: m.id, title: 'Cup kecil gratis', src: 'Kartu stempel penuh', code: code('ST' + Math.floor(Math.random() * 9)), exp: Date.now() + 60 * DAY, kind: 'free', value: 32000 };
      S.vouchers.unshift(reward);
    }
    var item = { id: uid('l'), kind: 'sale', memberId: m.id, at: Date.now(), amount: amount, points: pts, stamps: stamps, receipt: opts.receipt ? bumpReceipt(opts.receipt) : nextReceipt(), by: opts.by || 'Ayu', outlet: 'Cempaka', channel: opts.channel || 'kasir', paidPoints: opts.paidPoints || 0 };
    S.log.unshift(item);
    var after = tierOf(m), tierUp = after !== before && S.rules.tiers.indexOf(after) > S.rules.tiers.indexOf(before);
    if (tierUp) {
      S.log.unshift({ id: uid('l'), kind: 'tier', memberId: m.id, at: Date.now() + 1, title: after.name, by: 'Sistem' });
      S.inbox.unshift({ id: uid('i'), memberId: m.id, ch: 'wa', title: 'Selamat, kamu naik ke {t}', body: 'Mulai sekarang poinmu {x}×. Kartu di Wallet ikut berubah.', v: { t: after.name, x: dec(after.mult) }, at: Date.now(), read: false });
    }
    return { item: item, points: pts, stamps: stamps, tierUp: tierUp ? after : null, reward: reward, capped: capped };
  }

  /* ── fake QR (looks like a QR, not scannable) ── */
  function qr(seedStr, cls) {
    var h = 2166136261; for (var i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    function rnd() { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; }
    var n = 25, d = '';
    function inF(x, y) { return (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { if (inF(x, y)) continue; if (rnd() < 0.5) d += 'M' + (x + 2) + ' ' + (y + 2) + 'h1v1h-1z'; }
    function f(x, y) { return 'M' + (x + 2) + ' ' + (y + 2) + 'h7v7h-7zM' + (x + 3) + ' ' + (y + 3) + 'v5h5v-5zM' + (x + 4) + ' ' + (y + 4) + 'h3v3h-3z'; }
    d += f(0, 0) + f(n - 7, 0) + f(0, n - 7);
    return '<svg class="qr ' + (cls || '') + '" viewBox="0 0 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path fill="#141413" fill-rule="evenodd" d="' + d + '"/></svg>';
  }

  /* ── small UI pieces ── */
  var MARK = 'M20.63 8H56.42C72.7 8 85.89 21.2 85.89 37.47V41.68C85.89 57.96 72.7 71.16 56.42 71.16H44.84C40.77 71.16 37.47 74.46 37.47 78.53V84.84C37.47 86.59 36.06 88 34.32 88H13.26C11.74 88 10.46 86.92 10.17 85.48C10.87 72.04 17.23 61.44 29.66 53.84C24.22 56.03 17.59 57.31 10.11 58.13V18.53C10.11 12.71 14.82 8 20.63 8ZM59.91 26.62Q48 36.38 36.09 26.62Q45.86 38.53 36.09 50.44Q48 40.67 59.91 50.44Q50.14 38.53 59.91 26.62ZM36.09 50.44C33.79 51.49 31.65 52.63 29.66 53.84C32.04 52.89 34.19 51.77 36.09 50.44Z';
  function mark(s) { return '<svg width="' + (s || 24) + '" height="' + (s || 24) + '" viewBox="8 6 80 84" fill="currentColor" aria-hidden="true"><path d="' + MARK + '"/></svg>'; }
  function tierTag(t, sm) { return '<span class="tier tier-' + t.id + (sm ? ' tier-sm' : '') + '">' + ic('crown', sm ? 12 : 13) + esc(t.name) + '</span>'; }
  function avatar(m, s, cls) { return '<span class="avatar avatar-brand ' + (cls || '') + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * 0.38) + 'px">' + esc(initials(m.name)) + '</span>'; }
  var SEG = { 'new': ['Baru', 'info'], active: ['Aktif', 'success'], risk: ['Berisiko', 'warning'], lapsed: ['Hilang', 'danger'] };
  function segTag(s) { return '<span class="tag tag-' + SEG[s][1] + ' tag-sm">' + T(SEG[s][0]) + '</span>'; }
  function sjLogo(s) { return '<span class="sj-logo" style="--s:' + (s || 28) + 'px">' + ic('ice-cream-2', Math.round((s || 28) * 0.6)) + '</span>'; }

  /* toast */
  function toast(msg, icon) {
    var reg = document.querySelector('.toast-region');
    if (!reg) { reg = document.createElement('div'); reg.className = 'toast-region'; reg.setAttribute('role', 'status'); document.body.appendChild(reg); }
    var el = document.createElement('div'); el.className = 'toast';
    el.innerHTML = ic(icon || 'circle-check', 18) + '<span class="toast-msg">' + esc(msg) + '</span>';
    reg.appendChild(el);
    setTimeout(function () { el.setAttribute('data-leaving', ''); setTimeout(function () { el.remove(); }, 180); }, 3200);
  }

  /* modal / sheet. host: element to mount in (defaults to body) */
  function modal(o) {
    var host = o.host || document.body;
    var wrap = document.createElement('div');
    wrap.className = 'overlay ' + (o.kind === 'sheet' ? 'overlay-sheet' : 'overlay-modal') + (o.cls ? ' ' + o.cls : '');
    wrap.setAttribute('data-open', '');
    wrap.innerHTML = '<div class="overlay-scrim" data-close></div><div class="overlay-panel" role="dialog" aria-modal="true" aria-label="' + esc(o.title || '') + '" tabindex="-1" style="--panel-w:' + (o.width || 520) + 'px">' +
      '<div class="overlay-grip"></div><div class="overlay-head"><div class="overlay-titles"><h2 class="t-h2">' + esc(o.title || '') + '</h2>' + (o.desc ? '<p class="overlay-desc">' + o.desc + '</p>' : '') + '</div>' +
      '<button type="button" class="icon-btn" data-close aria-label="' + T('Tutup') + '">' + ic('x', 18) + '</button></div>' +
      '<div class="overlay-body"></div><div class="overlay-foot"></div></div>';
    host.appendChild(wrap);
    var api = {
      el: wrap, body: wrap.querySelector('.overlay-body'), foot: wrap.querySelector('.overlay-foot'),
      set: function (body, foot) { api.body.innerHTML = body || ''; api.foot.innerHTML = foot || ''; api.foot.style.display = foot ? '' : 'none'; },
      close: function () { if (!wrap.isConnected) return; wrap.removeAttribute('data-open'); document.removeEventListener('keydown', onKey); setTimeout(function () { wrap.remove(); }, 160); if (o.onClose) o.onClose(); }
    };
    function onKey(e) { if (e.key === 'Escape') api.close(); }
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) api.close(); });
    api.set(o.body, o.foot);
    setTimeout(function () { var f = wrap.querySelector('[autofocus]') || wrap.querySelector('.overlay-panel'); f && f.focus({ preventScroll: true }); }, 30);
    return api;
  }

  /* delegated actions: data-act="name" → ACT.name(el, event) */
  var ACT = {};
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]');
    if (!a || a.disabled) return;
    var f = ACT[a.getAttribute('data-act')];
    if (f) { e.preventDefault(); f(a, e); }
  });

  /* theme */
  function theme() { var t = document.documentElement.dataset.theme; if (t) return t; return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  ACT.theme = function () { var t = theme() === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('pl-theme', t); } catch (e) {} renderBar(); };
  ACT.lang = function () { LANG = LANG === 'en' ? 'id' : 'en'; try { localStorage.setItem('pl-lang', LANG); } catch (e) {} document.documentElement.lang = LANG; renderBar(); if (window.PL.onLang) window.PL.onLang(); };
  ACT.resetDemo = function () {
    var m = modal({ title: T('Ulang demo?'), desc: T('Semua klik di demo ini kembali ke data contoh awal. Data hanya tersimpan di browser ini.'), width: 440,
      foot: '<button class="btn btn-secondary" data-close>' + T('Batal') + '</button><button class="btn btn-primary" id="rsGo">' + ic('refresh', 18) + '<span class="btn-label">' + T('Ulang demo') + '</span></button>' });
    m.el.querySelector('#rsGo').onclick = function () { reset(); m.close(); location.reload(); };
  };

  /* demo bar: switcher between the three views */
  var VIEW = '';
  function renderBar() {
    var el = document.getElementById('demobar'); if (!el) return;
    var tabs = [['anggota.html', 'device-mobile', 'HP member', 'member'], ['kasir.html', 'device-tablet', 'Kasir', 'kasir'], ['dashboard.html', 'layout-dashboard', 'Dashboard', 'dash']];
    el.innerHTML = '<a class="logo" href="./" aria-label="Providea Loyalty">' + '<span class="logo-mark">' + mark(24) + '</span><span class="logo-word">Providea Loyalty</span></a>' +
      '<nav class="tabs-segmented tabs-sm demo-switch" aria-label="' + T('Pilih tampilan') + '">' + tabs.map(function (t) {
        return '<a class="tab' + (VIEW === t[3] ? ' is-active' : '') + '" href="' + t[0] + '"' + (VIEW === t[3] ? ' aria-current="page"' : '') + ' title="' + T(t[2]) + '">' + ic(t[1], 16) + '<span>' + T(t[2]) + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="demobar-actions"><span class="tag tag-warning demo-tag">' + ic('info-circle', 14) + '<span class="demo-tag-long">' + T('Demo · data contoh') + '</span><span class="demo-tag-short">Demo</span></span>' +
      '<button type="button" class="btn btn-secondary btn-sm lang-btn" data-act="lang" aria-label="' + T('Ganti bahasa') + '">' + (LANG === 'en' ? 'ID' : 'EN') + '</button>' +
      '<button type="button" class="icon-btn" data-act="theme" aria-label="' + T('Ganti tema') + '" title="' + T('Ganti tema') + '">' + ic(theme() === 'dark' ? 'sun' : 'moon', 18) + '</button>' +
      '<button type="button" class="icon-btn demo-reset" data-act="resetDemo" aria-label="' + T('Ulang demo') + '" title="' + T('Ulang demo') + '">' + ic('refresh', 18) + '</button></div>';
  }

  function setView(v) { VIEW = v; document.documentElement.lang = LANG; renderBar(); if (v !== 'hub') visit(v); }

  /* cross-tab sync: another view changed the demo data */
  window.addEventListener('storage', function (e) { if (e.key === KEY) { S = load(); window.PL.S = S; if (window.PL.onSync) window.PL.onSync(); } });

  window.PL = {
    get S() { return S; }, set S(v) { S = v; },
    T: T, num: num, rp: rp, dec: dec, fdate: fdate, fmonth: fmonth, ftime: ftime, ago: ago, daysSince: daysSince, maskPhone: maskPhone, fmtPhone: fmtPhone,
    esc: esc, initials: initials, uid: uid, code: code, DAY: DAY, HOUR: HOUR, MIN: MIN,
    BRAND: BRAND, CATALOG: CATALOG, MENU: MENU, rules0: rules0,
    save: save, reset: reset, member: member, tierOf: tierOf, tierById: tierById, nextTier: nextTier, earnFor: earnFor, earnedToday: earnedToday,
    segOf: segOf, isTop: isTop, memberVouchers: memberVouchers, addAudit: addAudit, recordSale: recordSale, nextReceipt: nextReceipt,
    qr: qr, mark: mark, tierTag: tierTag, avatar: avatar, segTag: segTag, SEG: SEG, sjLogo: sjLogo,
    toast: toast, modal: modal, ACT: ACT, setView: setView, renderBar: renderBar, visit: visit, visited: visited,
    lang: function () { return LANG; }, onLang: null, onSync: null
  };
})();
