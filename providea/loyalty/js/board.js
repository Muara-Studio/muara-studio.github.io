/* Providea Loyalty demo · owner summary board ("Ringkasan") with three sample brands.
   window.PLBoard = { html(), mount(), chrome(), brand() }
   - html(): the whole ringkasan page (head, brand switcher, widget board). Pure, no DOM work.
   - mount(): call right after html() is in the DOM (and after every dashboard re-render).
   Brand theme: body[data-brand] (css/board.css). Layout per brand (order, width, hidden, widget settings)
   lives in localStorage 'pl-board'. Kamtono reads the live demo state; Mendaya Ramen and Bobs are sample numbers.
   All brands, people and numbers are fictional. */
(function () {
  'use strict';
  var P = window.PL; if (!P) return;
  var T = P.T, esc = P.esc, num = P.num, rp = P.rp, DAY = P.DAY, MIN = P.MIN;

  /* Tabler outline icons this module needs (icons.js stays untouched) */
  var NEW_ICONS = {
    'grip-vertical': '<path d="M8 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M8 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M8 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M14 5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M14 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M14 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
    'dots': '<path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>',
    'eye-off': '<path d="M10.585 10.587a2 2 0 0 0 2.829 2.828"/><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87"/><path d="M3 3l18 18"/>',
    'arrow-narrow-left': '<path d="M5 12l14 0"/><path d="M5 12l4 4"/><path d="M5 12l4 -4"/>',
    'arrow-narrow-right': '<path d="M5 12l14 0"/><path d="M15 16l4 -4"/><path d="M15 8l4 4"/>',
    'layout-grid': '<path d="M4 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/><path d="M14 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/><path d="M4 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/><path d="M14 15a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -4"/>',
    'webhook': '<path d="M4.876 13.61a4 4 0 1 0 6.124 3.39h6"/><path d="M15.066 20.502a4 4 0 1 0 1.934 -7.502c-.706 0 -1.424 .179 -2 .5l-3 -5.5"/><path d="M16 8a4 4 0 1 0 -8 0c0 1.506 .77 2.818 2 3.5l-3 5.5"/>',
    'flame': '<path d="M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235"/>',
    'cards': '<path d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001"/><path d="M15 4h1a1 1 0 0 1 1 1v3.5"/><path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374"/>',
    'arrows-move': '<path d="M18 9l3 3l-3 3"/><path d="M15 12h6"/><path d="M6 9l-3 3l3 3"/><path d="M3 12h6"/><path d="M9 18l3 3l3 -3"/><path d="M12 15v6"/><path d="M15 6l-3 -3l-3 3"/><path d="M12 3v6"/>',
    'photo': '<path d="M15 8h.01"/><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12"/><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"/><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"/>',
    'trophy': '<path d="M8 21l8 0"/><path d="M12 17l0 4"/><path d="M7 4l10 0"/><path d="M17 4v8a5 5 0 0 1 -10 0v-8"/><path d="M3 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/><path d="M17 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>',
    'calendar-stats': '<path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4"/><path d="M18 14v4h4"/><path d="M14 18a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M15 3v4"/><path d="M7 3v4"/><path d="M3 11h16"/>',
    'arrow-up': '<path d="M12 5l0 14"/><path d="M18 11l-6 -6"/><path d="M6 11l6 -6"/>',
    'arrow-down-right': '<path d="M7 7l10 10"/><path d="M17 8l0 9l-9 0"/>',
    'message-question': '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M14 18h-1l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5"/><path d="M19 22v.01"/><path d="M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"/>'
  };
  Object.keys(NEW_ICONS).forEach(function (k) { if (!window.ICONS[k]) window.ICONS[k] = NEW_ICONS[k]; });

  var KEY = 'pl-board';
  var reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return reduceMq.matches; }

  /* ════════════ sample brands ════════════ */
  var BRANDS = ['kamtono', 'mendaya', 'bobs'];
  var B = {
    kamtono: { name: 'Kamtono', icon: 'img/kamtono/icon.webp', bmeta: 'Froyo · 1 outlet', outlets: 1, meta: '1 outlet · Cempaka', sub: 'Kamtono · Outlet Cempaka · dibuka Juli 2026', pdir: 'kamtono' },
    mendaya: { name: 'Mendaya Ramen', icon: 'img/brands/mendaya/icon.webp', bmeta: 'Ramen · 6 outlet', outlets: 6, meta: '6 outlet · Jabodetabek', sub: 'Mendaya Ramen · 6 outlet di Jakarta dan Tangerang · 6 bulan di Providea Loyalty', pdir: 'mendaya' },
    bobs: { name: 'Bobs', icon: 'img/brands/bobs/icon.webp', bmeta: 'Boba · 18 outlet', outlets: 18, meta: '18 outlet', sub: 'Bobs · 18 outlet · 4 bulan di Providea Loyalty', pdir: 'bobs' }
  };
  var PERIODS = [['7', '7 hari'], ['30', '30 hari'], ['90', '90 hari']];
  var PF = { '7': 0.24, '30': 1, '90': 2.9 };

  /* key numbers per period. Kamtono adds the live demo state (new members, points owed). */
  var KD = {
    kamtono: { ac: 862, vp: 28, ms: 46,
      '7': { nm: 96, dnm: 4, jr: 39, jd: 2, tx: 1150, mx: 449, rr: 41, rd: 1, vu: 74, dvu: 6 },
      '30': { nm: 400, dnm: 7, jr: 38, jd: 4, tx: 4920, mx: 1870, rr: 41, rd: 3, vu: 312, dvu: 11 },
      '90': { nm: 1188, dnm: null, jr: 36, jd: null, tx: 13640, mx: 4910, rr: 38, rd: null, vu: 905, dvu: null } },
    mendaya: { ac: 4120, total: 9800, pts: 142600, vp: 31, ms: 52,
      '7': { nm: 296, dnm: 3, jr: 46, jd: 1, tx: 3360, mx: 1546, rr: 14, rd: 1, vu: 320, dvu: 9 },
      '30': { nm: 1250, dnm: -4, jr: 44, jd: 3, tx: 14400, mx: 6336, rr: 36, rd: 4, vu: 1380, dvu: 18 },
      '90': { nm: 4010, dnm: -9, jr: 41, jd: 7, tx: 43200, mx: 17712, rr: 52, rd: 6, vu: 3960, dvu: 41 } },
    bobs: { ac: 15800, total: 26400, pts: 296400, vp: 44, ms: 63,
      '7': { nm: 990, dnm: -2, jr: 62, jd: 1, tx: 23200, mx: 14384, rr: 31, rd: 2, vu: 1140, dvu: 5 },
      '30': { nm: 4320, dnm: -11, jr: 61, jd: 5, tx: 99540, mx: 60720, rr: 57, rd: 6, vu: 4860, dvu: 14 },
      '90': { nm: 16460, dnm: null, jr: 57, jd: null, tx: 286000, mx: 163020, rr: 72, rd: null, vu: 13900, dvu: null } }
  };
  /* new members per week, oldest first (12 weeks) */
  var WEEKS = { kamtono: [104, 99, 95, 90, 86, 82, 79, 76, 98, 92, 87, 96], mendaya: [352, 340, 331, 318, 309, 300, 296, 288, 301, 289, 284, 296], bobs: [1620, 1520, 1430, 1340, 1260, 1190, 1130, 1080, 1040, 1010, 990, 990] };
  /* Silver, Gold, Platinum (Kamtono: Gold and Platinum fixed, Silver from the live total) */
  var TIERS = { kamtono: [null, 231, 25], mendaya: [7640, 1860, 300], bobs: [22300, 3640, 460] };
  /* products: [file, name, price, sold in 30 days, change vs the period before (%)] */
  var PR = {
    kamtono: [['froyo-original', 'Froyo Original · cup kecil', 32000, 1860, 6], ['mangga-ketan', 'Froyo Mangga Ketan', 48000, 1020, 31], ['stroberi-kemangi', 'Froyo Stroberi Kemangi', 46000, 860, -4], ['kopi-gula-aren', 'Froyo Kopi Gula Aren', 46000, 780, 2], ['cup-besar-granola', 'Froyo Original · cup besar', 55000, 740, 9], ['smoothie-yogurt', 'Smoothie yogurt', 38000, 470, -8]],
    mendaya: [['tonkotsu', 'Tonkotsu Ramen', 68000, 7780, 3], ['gyoza', 'Gyoza 6 pcs', 38000, 6240, 12], ['shoyu', 'Shoyu Ramen', 62000, 4990, -2], ['miso-pedas', 'Miso Pedas', 70000, 4380, 8], ['tantanmen', 'Tantanmen', 72000, 3170, 21], ['chashu-don', 'Chashu Don', 55000, 2340, 5]],
    bobs: [['brown-sugar-boba', 'Brown Sugar Boba Milk', 28000, 32100, 12], ['klasik-milk-tea', 'Klasik Milk Tea', 22000, 25200, 4], ['thai-tea-boba', 'Thai Tea Boba', 24000, 19350, 7], ['matcha-latte-boba', 'Matcha Latte Boba', 29000, 14550, 18], ['taro-milk-tea', 'Taro Milk Tea', 25000, 12300, -3], ['cheese-foam-oolong', 'Cheese Foam Oolong', 30000, 11100, 9]]
  };
  var HERO = {
    kamtono: [['Dipesan di {p}% transaksi member', 44], ['Paling laku Sabtu, 15.00 sampai 17.00']],
    mendaya: [['Dipesan di {p}% kunjungan member', 54], ['Paling laku Jumat, 18.00 sampai 20.00']],
    bobs: [['Dipesan di {p}% transaksi member', 38], ['Paling laku 15.00 sampai 17.00, setiap hari']]
  };
  /* outlets: [name, members, member visits in 30 days, average member spend, join rate %] */
  var OUT = {
    mendaya: [['Kelapa Gading', 2140, 1450, 124000, 47], ['Menteng', 1860, 1220, 121000, 45], ['Kemang Raya', 1720, 1110, 116000, 44], ['Tebet', 1510, 960, 113000, 41], ['BSD', 1420, 900, 117000, 43], ['Gading Serpong', 1150, 700, 109000, 38]],
    bobs: [['Tebet', 2110, 4580, 32000, 66], ['Kemang', 1950, 4290, 33500, 64], ['Bintaro', 1790, 4010, 31000, 63], ['Margonda', 1720, 3800, 29500, 65], ['Kelapa Gading', 1660, 4050, 32500, 62], ['Alam Sutera', 1540, 3770, 31500, 61], ['Cibubur', 1480, 3620, 30500, 60], ['Rawamangun', 1430, 3500, 30000, 62], ['Pluit', 1390, 3420, 32000, 59], ['Grogol', 1350, 3330, 31000, 61], ['Cikini', 1400, 3240, 33000, 58], ['Pondok Indah', 1380, 3170, 34000, 57], ['BSD', 1350, 3100, 31500, 60], ['Gading Serpong', 1290, 2960, 30500, 59], ['Sunter', 1230, 2810, 30000, 58], ['Cempaka Putih', 1170, 2680, 29500, 57], ['Pasar Minggu', 1100, 2510, 29000, 56], ['Cinere', 1060, 1880, 30500, 55]]
  };
  var OUT_SUM = {
    mendaya: [['31%', 'member makan di 2 outlet atau lebih'], ['Rp118.000', 'rata-rata belanja member per kunjungan'], ['6', 'outlet, satu kartu member']],
    bobs: [['24%', 'member membeli di 2 outlet atau lebih'], ['Rp31.500', 'rata-rata belanja member per kunjungan'], ['18', 'outlet, satu web-app member']]
  };
  /* busy and quiet hours: average sales per hour (all outlets), 10.00 to 21.00, Monday first */
  var HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  var DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  var HEAT = {
    kamtono: { h: [3, 5, 8, 9, 11, 15, 17, 14, 12, 15, 13, 7], d: [0.8, 0.78, 0.85, 0.9, 1.1, 1.45, 1.35] },
    mendaya: { h: [14, 52, 96, 84, 34, 24, 27, 48, 88, 104, 82, 41], d: [0.85, 0.82, 0.88, 0.92, 1.08, 1.22, 1.18] },
    bobs: { h: [160, 240, 380, 420, 470, 560, 610, 540, 450, 430, 360, 190], d: [0.88, 0.86, 0.9, 0.93, 1.08, 1.25, 1.2] }
  };
  /* Bobs paper cards: share moved per week since launch (%), 16 weeks */
  var PAPER = { cards: 22000, cum: [5, 13, 22, 31, 39, 46, 52, 57, 61, 64, 66, 68, 69, 70, 70.5, 71], stamps: 61300 };
  /* Bobs POS events: [minutes ago, outlet, amount, member, points, stamps, status] */
  var POSEV = [[1, 'Tebet', 52000, 'Rina M.', 5, 2, 'ok'], [2, 'Kemang', 28000, '', 0, 0, 'guest'], [3, 'Margonda', 81000, 'Dimas P.', 8, 3, 'ok'], [5, 'Bintaro', 24000, 'Sari U.', 2, 1, 'retry'], [6, 'Alam Sutera', 58000, 'Kevin H.', 5, 2, 'ok'], [8, 'Kelapa Gading', 30000, '', 0, 0, 'guest'], [9, 'Cibubur', 56000, 'Nadia P.', 5, 2, 'ok'], [11, 'Pluit', 29000, 'Andre W.', 2, 1, 'ok']];
  var WA_RATE = 586.33;
  /* campaigns for the two sample brands (Kamtono reads PL.S.campaigns) */
  var CAMP = {
    mendaya: [
      { name: 'Telur ajitama ulang tahun', seg: 'Ulang tahun bulan ini', ch: ['wa'], d: 3, sent: 386, read: 341, used: 219 },
      { name: 'Voucher jam sepi', seg: 'Tidak datang 45 hari', ch: ['wa'], d: 12, sent: 1640, read: 1402, used: 412 },
      { name: 'Menu baru Tantanmen', seg: 'Semua member', ch: ['email'], d: 20, sent: 6240, read: 2180, used: 530 },
      { name: 'Mangkuk ke-8 gratis', seg: 'Aktif', ch: ['wallet'], d: 34, sent: 4120, read: 0, used: 760 }],
    bobs: [
      { name: 'Stempel ganda Senin', seg: 'Semua member', ch: ['email'], d: 5, sent: 12400, read: 3900, used: 1640 },
      { name: 'Matcha Latte Boba baru', seg: 'Gold dan Platinum', ch: ['wa'], d: 9, sent: 4100, read: 3560, used: 1190 },
      { name: 'Kangen Bobs', seg: 'Berisiko', ch: ['wa'], d: 16, sent: 3300, read: 2710, used: 520 },
      { name: 'Pindahkan kartu kertasmu', seg: 'Pemegang kartu kertas', ch: ['wa'], d: 40, sent: 8200, read: 7050, used: 2460 }]
  };
  var TICKET = { kamtono: 47800, mendaya: 118000, bobs: 31500 };
  /* latest activity for the two sample brands: [minutes ago, kind, member, outlet, …] */
  var ACTS = {
    mendaya: [[4, 'checkin', 'Rina Maharani', 'Kelapa Gading'], [12, 'sale', 'Dimas Pratama', 'Menteng', 236000, 23], [38, 'voucher', 'Sari Utami', 'BSD', 'Voucher jam sepi Rp15.000'], [64, 'tier', 'Ajeng Wulandari', 'Tebet', 'Gold'], [130, 'stamp', 'Bayu Aditya', 'Kemang Raya', 'Mangkuk gratis'], [190, 'join', 'Yudi Hartono', 'Gading Serpong'], [260, 'sale', 'Maya Kusuma', 'Kelapa Gading', 142000, 14], [340, 'join', 'Fikri Ramadhan', 'Menteng']],
    bobs: [[2, 'paper', 'Nadia Putri', 'Tebet', 7], [6, 'sale', 'Kevin Halim', 'Kemang', 56000, 5, 2], [15, 'join', 'Laila Rahma', 'Margonda'], [31, 'voucher', 'Andre Wijaya', 'Bintaro', 'Gratis 1 boba'], [58, 'tier', 'Mega Lestari', 'Alam Sutera', 'Gold'], [95, 'paper', 'Rudi Hartanto', 'Cibubur', 9], [140, 'sale', 'Intan Permata', 'Pluit', 84000, 8, 3], [220, 'join', 'Galih Saputra', 'Cikini']]
  };
  var SEGN = { all: 'Semua member', 'new': 'Baru', active: 'Aktif', risk: 'Berisiko', lapsed: 'Hilang', top: 'Top 10%', gold: 'Gold dan Platinum' };

  /* default layouts: [widget, width in columns] */
  var DEF = {
    kamtono: [['kpis', 3], ['weekly', 2], ['tier', 1], ['products', 3], ['campaigns', 2], ['activity', 1]],
    mendaya: [['kpis', 3], ['outlets', 3], ['heat', 2], ['products', 1], ['campaigns', 3]],
    bobs: [['kpis', 3], ['products', 3], ['paper', 1], ['pos', 2], ['weekly', 3]]
  };

  /* ════════════ state ════════════ */
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!s || typeof s !== 'object') s = {};
    if (!B[s.brand]) s.brand = 'kamtono';
    if (!PF[s.period]) s.period = '30';
    if (!s.L || typeof s.L !== 'object') s.L = {};
    return s;
  }
  var st = load(), edit = false;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function defLayout(b) { var w = {}; DEF[b].forEach(function (x) { w[x[0]] = x[1]; }); return { order: DEF[b].map(function (x) { return x[0]; }), w: w, cfg: {} }; }
  function lay(b) {
    b = b || st.brand;
    var l = st.L[b];
    if (!l || !Array.isArray(l.order)) l = st.L[b] = defLayout(b);
    if (!l.w || typeof l.w !== 'object') l.w = {};
    if (!l.cfg || typeof l.cfg !== 'object') l.cfg = {};
    var seen = {};
    l.order = l.order.filter(function (id) { if (!W[id] || seen[id] || avail(id, b) !== true) return false; seen[id] = 1; return true; });
    return l;
  }
  function avail(id, b) { var a = W[id].avail; return a ? a(b || st.brand) : true; }
  function spanOf(id) { var s = lay().w[id] || W[id].span || 1; return Math.max(1, Math.min(3, s)); }
  function cfg(id) {
    var d = W[id].cfg ? W[id].cfg(st.brand) : {}, c = lay().cfg[id] || {}, o = {};
    Object.keys(d).forEach(function (k) { o[k] = c[k] != null ? c[k] : d[k]; });
    return o;
  }
  function setCfg(id, k, v) { var l = lay(); l.cfg[id] = l.cfg[id] || {}; l.cfg[id][k] = v; save(); }
  function hiddenIds() { var l = lay(); return Object.keys(W).filter(function (id) { return l.order.indexOf(id) < 0; }); }

  /* ════════════ small helpers ════════════ */
  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
  function dec1(n) { return P.dec(Math.round(n * 10) / 10); }
  function per(n) { return Math.round(n * PF[st.period]); }
  function periodLabel() { return T({ '7': '7 hari', '30': '30 hari', '90': '90 hari' }[st.period]); }
  function delta(d, unit) {
    if (d == null) return '';
    var up = d >= 0, txt = (up ? '+' : '−') + Math.abs(d) + (unit === 'pp' ? '' : '%');
    return '<span class="bd-delta ' + (up ? 'is-up' : 'is-down') + '">' + ic(up ? 'trending-up' : 'trending-down', 14) + '<span class="num">' + (unit === 'pp' ? T('{d} poin persen', { d: txt }) : txt) + '</span></span>';
  }
  function extraNew() { return P.S.members.filter(function (m) { return m.id === 'm-new' || m.id.indexOf('m-k-') === 0; }).length; }
  function kTotal() { return 2128 + P.S.members.length; }
  function kOwed() { return 19985 + P.S.members.reduce(function (a, m) { return a + m.points; }, 0); }
  function totalOf(b) { return b === 'kamtono' ? kTotal() : KD[b].total; }
  function chip(c) { var m = { wa: ['ch-wa', 'brand-whatsapp', 'WhatsApp'], email: ['ch-email', 'mail', 'Email'], wallet: ['ch-wallet', 'wallet', 'Wallet'] }[c]; return m ? '<span class="ch ' + m[0] + '">' + ic(m[1], 12) + m[2] + '</span>' : ''; }
  function img(b, file, alt, cls) { return '<img class="' + (cls || '') + '" src="img/products/' + B[b].pdir + '/' + file + '.webp" alt="' + esc(alt) + '" width="360" height="360" loading="lazy" decoding="async">'; }
  function brandIcon(b, s) { return '<span class="bd-bicon" style="--s:' + s + 'px"><img src="' + B[b].icon + '" alt="" decoding="async"></span>'; }
  function segBtns(name, cur, opts, label) {
    return '<div class="tabs-segmented tabs-sm bd-seg" role="group" aria-label="' + esc(label) + '">' + opts.map(function (o) {
      return '<button type="button" class="tab' + (String(cur) === String(o[0]) ? ' is-active' : '') + '" aria-pressed="' + (String(cur) === String(o[0])) + '" data-bd="' + name + '" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  }

  /* ════════════ widgets ════════════ */
  var W = {};

  /* 1 · key numbers */
  W.kpis = {
    name: 'Angka utama', icon: 'chart-line', span: 3, pad: 'none',
    desc: 'Enam angka utama: member baru, join rate, member aktif, repeat rate, poin beredar, dan voucher dipakai.',
    cfg: function () { return { n: 6, delta: 1 }; },
    menu: function () { return [{ h: 'Jumlah angka' }, { k: 'n', v: 3, t: '3 angka' }, { k: 'n', v: 6, t: '6 angka' }, { sep: 1 }, { tog: 'delta', t: 'Bandingkan dengan periode sebelumnya' }]; },
    head: function () { return { pill: periodLabel() }; },
    body: function (b, c) {
      var D = KD[b], K = D[st.period], tot = totalOf(b), nm = K.nm + (b === 'kamtono' ? extraNew() : 0);
      var owed = b === 'kamtono' ? kOwed() : D.pts, pv = P.S.rules.pointValue || 500;
      var tiles = [
        ['user-plus', 'Member baru', num(nm), T('member'), T('Total {n} member', { n: num(tot) }), delta(K.dnm)],
        ['percentage', 'Join rate', K.jr + '%', T('transaksi'), T('{a} dari {b} transaksi pakai member', { a: num(K.mx), b: num(K.tx) }), delta(K.jd, 'pp')],
        ['flame', 'Member aktif 30 hari', num(D.ac), T('member'), T('{p}% dari semua member', { p: pct(D.ac, tot) }), ''],
        ['refresh', 'Repeat rate', K.rr + '%', '', b === 'bobs' ? T('Rata-rata {n} kunjungan per member per bulan', { n: '2,3' }) : T('Member yang datang 2 kali atau lebih dalam periode ini'), delta(K.rd, 'pp')],
        ['coins', 'Poin beredar', rp(owed * pv), '', T('{n} poin × {v}. Ini kewajiban ke member.', { n: num(owed), v: rp(pv) }), ''],
        ['ticket', 'Voucher dipakai', num(K.vu), T('voucher'), T('{p}% dari voucher yang dibagikan', { p: D.vp }), delta(K.dvu)]
      ];
      if (+c.n === 3) tiles = [tiles[0], tiles[3], tiles[5]];
      return '<div class="bd-kpis bd-kpis-' + tiles.length + '">' + tiles.map(function (t) {
        return '<div class="bd-kpi"><span class="bd-kpi-label">' + ic(t[0], 16) + T(t[1]) + '</span><span class="stat-row"><span class="bd-kpi-value num">' + t[2] + '</span>' + (t[3] ? '<span class="unit-pill">' + t[3] + '</span>' : '') + '</span>' +
          '<span class="bd-kpi-note">' + t[4] + '</span>' + (c.delta && t[5] ? '<span class="bd-kpi-delta">' + t[5] + '<span class="muted">' + T('dari {p} sebelumnya', { p: periodLabel() }) + '</span></span>' : '') + '</div>';
      }).join('') + '</div>';
    }
  };

  /* 2 · new members per week */
  W.weekly = {
    name: 'Member baru per minggu', icon: 'chart-bar', span: 2,
    desc: 'Jumlah member baru setiap minggu, 8 atau 12 minggu terakhir.',
    cfg: function () { return { weeks: 12, vals: 1, avg: 1 }; },
    menu: function () { return [{ h: 'Rentang' }, { k: 'weeks', v: 8, t: '8 minggu' }, { k: 'weeks', v: 12, t: '12 minggu' }, { sep: 1 }, { tog: 'vals', t: 'Angka di atas batang' }, { tog: 'avg', t: 'Garis rata-rata' }]; },
    head: function (b, c) { return { pill: T('{n} minggu', { n: c.weeks }) }; },
    body: function (b, c) {
      var all = WEEKS[b].slice(); if (b === 'kamtono') all[11] += extraNew();
      var w = all.slice(-c.weeks), mx = Math.max.apply(null, w) * 1.04, avg = w.reduce(function (a, v) { return a + v; }, 0) / w.length;
      var dates = w.map(function (v, i) { return P.fdate(Date.now() - (w.length - 1 - i) * 7 * DAY, true); });
      var bars = w.map(function (v, i) {
        return '<div class="bd-bcol' + (i === w.length - 1 ? ' is-last' : '') + '"><span class="bd-bar" style="height:' + (v / mx * 100).toFixed(1) + '%" title="' + esc(T('Minggu {d}: {n} member baru', { d: dates[i], n: num(v) })) + '">' + (c.vals ? '<span class="bd-bval num">' + num(v) + '</span>' : '') + '</span></div>';
      }).join('');
      dates[dates.length - 1] = T('Minggu ini');
      return '<div class="bd-chart-legend"><span class="bd-lg"><span class="bd-lg-bar"></span>' + T('Member baru') + '</span><span class="bd-lg"><span class="bd-lg-bar is-last"></span>' + T('Minggu ini') + '</span>' + (c.avg ? '<span class="bd-lg"><span class="bd-lg-avg"></span>' + T('Rata-rata {n} per minggu', { n: num(Math.round(avg)) }) + '</span>' : '') + '</div>' +
        '<div class="bd-chart' + (w.length > 8 ? ' is-dense' : '') + (c.vals ? ' has-vals' : '') + '"><div class="bd-plot" role="img" aria-label="' + esc(T('Member baru per minggu, {n} minggu terakhir', { n: c.weeks })) + '">' + bars +
        (c.avg ? '<span class="bd-avg" style="bottom:' + (avg / mx * 100).toFixed(1) + '%"></span>' : '') + '</div>' +
        '<div class="bd-blbls" aria-hidden="true">' + dates.map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div></div>';
    }
  };

  /* 3 · tier mix */
  W.tier = {
    name: 'Sebaran tier', icon: 'crown', span: 1,
    desc: 'Berapa member di Silver, Gold, dan Platinum.',
    cfg: function () { return { mode: 'n' }; },
    menu: function () { return [{ h: 'Tampilkan' }, { k: 'mode', v: 'n', t: 'Jumlah member' }, { k: 'mode', v: 'pct', t: 'Persen' }]; },
    head: function (b) { return { count: num(totalOf(b)) }; },
    body: function (b, c) {
      var t = TIERS[b].slice(), tot = totalOf(b); if (t[0] == null) t[0] = tot - t[1] - t[2];
      var rows = [['bd-t-silver', 'Silver', t[0], '1×'], ['bd-t-gold', 'Gold', t[1], '1,25×'], ['bd-t-plat', 'Platinum', t[2], '1,5×']];
      return '<div class="bd-tier"><div class="bd-tierbar" role="img" aria-label="' + esc(rows.map(function (r) { return r[1] + ' ' + pct(r[2], tot) + '%'; }).join(', ')) + '">' + rows.map(function (r) { return '<span class="' + r[0] + '" style="flex:' + Math.max(r[2], tot * 0.025) + '"></span>'; }).join('') + '</div>' +
        '<ul class="bd-tier-list">' + rows.map(function (r) {
          return '<li><span class="legend-dot ' + r[0] + '"></span><span class="bd-tier-name">' + r[1] + '<span class="muted">' + T('poin {x}', { x: r[3] }) + '</span></span><span class="num t-strong">' + (c.mode === 'pct' ? pct(r[2], tot) + '%' : num(r[2])) + '</span></li>';
        }).join('') + '</ul>' +
        '<div class="divider"></div><div class="row between"><span class="sec">' + T('Penjualan dari member') + '</span><b class="num">' + KD[b].ms + '%</b></div><div class="pbar bd-pbar"><span style="width:' + KD[b].ms + '%"></span></div></div>';
    }
  };

  /* 4 · best sellers with product photos */
  function prodRows(b, c) {
    var list = PR[b].map(function (p) { var u = per(p[3]); return { file: p[0], name: p[1], price: p[2], units: u, rev: u * p[2], d: p[4] }; });
    var key = c.sort === 'rev' ? 'rev' : 'units', tot = list.reduce(function (a, p) { return a + p[key]; }, 0);
    list.sort(function (x, y) { return y[key] - x[key]; });
    list.forEach(function (p, i) { p.rank = i + 1; p.share = p[key] / tot * 100; });
    return list.slice(0, +c.n);
  }
  function prodMetric(p, c, big) {
    var rev = c.sort === 'rev', main = rev ? rp(p.rev) : num(p.units), sec = rev ? T('{n} terjual', { n: num(p.units) }) : rp(p.rev);
    return '<span class="bd-pm' + (big ? ' is-big' : '') + '"><b class="num">' + main + '</b><span class="bd-pm-x"><span class="bd-pm-l">' + T(rev ? 'pendapatan' : 'terjual') + '</span><span class="bd-pm-s num">' + sec + '</span></span></span>';
  }
  function shareBar(p) { return '<span class="bd-share"><span class="pbar bd-pbar"><span style="width:' + p.share.toFixed(1) + '%"></span></span><span class="num">' + Math.round(p.share) + '%</span></span>'; }
  function prodList(b, c, list) {
    return '<ol class="bd-plist">' + list.map(function (p) {
      return '<li class="bd-prow"><span class="bd-rank num">' + p.rank + '</span>' + img(b, p.file, T(p.name), 'bd-thumb') +
        '<span class="bd-pname"><span class="t-strong ellip" title="' + esc(T(p.name)) + '">' + T(p.name) + '</span><span class="bd-pmeta"><span class="num">' + rp(p.price) + '</span>' + delta(p.d) + '</span>' + shareBar(p) + '</span>' + prodMetric(p, c) + '</li>';
    }).join('') + '</ol>';
  }
  W.products = {
    name: 'Produk terlaris', icon: 'trophy', span: 3,
    desc: 'Menu yang paling banyak terjual, lengkap dengan foto produk.',
    cfg: function (b) { return { sort: 'units', n: 6, view: b === 'bobs' ? 'hero' : b === 'mendaya' ? 'list' : 'cards' }; },
    menu: function () { return [{ h: 'Urutkan' }, { k: 'sort', v: 'units', t: 'Paling banyak terjual' }, { k: 'sort', v: 'rev', t: 'Pendapatan terbesar' }, { sep: 1 }, { h: 'Tampilkan' }, { k: 'n', v: 3, t: '3 produk' }, { k: 'n', v: 5, t: '5 produk' }, { k: 'n', v: 6, t: '6 produk' }, { sep: 1 }, { h: 'Tampilan' }, { k: 'view', v: 'list', t: 'Daftar dengan foto kecil' }, { k: 'view', v: 'cards', t: 'Kartu foto' }, { k: 'view', v: 'hero', t: 'Sorot produk teratas' }]; },
    head: function (b, c) { return { count: c.n, pill: periodLabel() }; },
    body: function (b, c) {
      var list = prodRows(b, c);
      if (c.view === 'cards') {
        return '<ol class="bd-pcards">' + list.map(function (p) {
          return '<li class="bd-pcard"><span class="bd-pimg">' + img(b, p.file, T(p.name)) + '<span class="bd-rank-badge num">' + p.rank + '</span></span><span class="bd-pcard-tx"><span class="t-strong bd-clamp" title="' + esc(T(p.name)) + '">' + T(p.name) + '</span><span class="bd-pmeta"><span class="num">' + rp(p.price) + '</span>' + delta(p.d) + '</span>' + prodMetric(p, c) + shareBar(p) + '</span></li>';
        }).join('') + '</ol>';
      }
      if (c.view === 'hero') {
        var h = list[0], facts = HERO[b];
        return '<div class="bd-phero"><figure class="bd-hero"><span class="bd-hero-img">' + img(b, h.file, T(h.name)) + '<span class="tag tag-brand bd-hero-tag">' + ic('trophy', 14) + T(c.sort === 'rev' ? 'Pendapatan terbesar' : 'Paling banyak terjual') + '</span></span>' +
          '<figcaption class="bd-hero-tx"><span class="bd-hero-name">' + T(h.name) + '</span><span class="bd-pmeta"><span class="num">' + rp(h.price) + '</span>' + delta(h.d) + '<span class="muted">' + T('dari {p} sebelumnya', { p: periodLabel() }) + '</span></span>' +
          '<span class="bd-hero-stats"><span class="stat stat-md"><span class="stat-row"><span class="stat-value num">' + num(h.units) + '</span><span class="unit-pill">' + T('terjual') + '</span></span></span><span class="stat stat-md"><span class="stat-row"><span class="stat-value num">' + rp(h.rev) + '</span></span><span class="t-small sec">' + T('pendapatan') + '</span></span></span>' +
          shareBar(h) + '<ul class="bd-hero-facts">' + facts.map(function (f) { return '<li>' + ic(f[1] != null ? 'users' : 'clock', 16) + '<span>' + T(f[0], { p: f[1] }) + '</span></li>'; }).join('') + '</ul></figcaption></figure>' +
          (list.length > 1 ? '<div class="bd-hero-rest"><p class="bd-sub-h">' + T('Berikutnya') + '</p>' + prodList(b, c, list.slice(1)) + '</div>' : '') + '</div>';
      }
      return prodList(b, c, list);
    }
  };

  /* 5 · outlet comparison */
  W.outlets = {
    name: 'Perbandingan outlet', icon: 'building-store', span: 3,
    desc: 'Member, kunjungan, dan belanja per outlet.',
    avail: function (b) { return OUT[b] ? true : T('{b} baru punya 1 outlet.', { b: B[b].name }); },
    cfg: function () { return { sort: 'members', n: 6 }; },
    menu: function (b) { var m = [{ h: 'Urutkan' }, { k: 'sort', v: 'members', t: 'Member terbanyak' }, { k: 'sort', v: 'visits', t: 'Kunjungan terbanyak' }, { k: 'sort', v: 'spend', t: 'Belanja rata-rata tertinggi' }]; if (b === 'bobs') m.push({ sep: 1 }, { h: 'Tampilkan' }, { k: 'n', v: 6, t: '6 outlet teratas' }, { k: 'n', v: 18, t: 'Semua 18 outlet' }); return m; },
    head: function (b) { return { count: OUT[b].length, pill: periodLabel() }; },
    body: function (b, c) {
      var col = { members: 1, visits: 2, spend: 3 }[c.sort] || 1;
      var rows = OUT[b].slice().sort(function (x, y) { return y[col] - x[col]; }).slice(0, b === 'bobs' ? +c.n : 6);
      var mx = Math.max.apply(null, rows.map(function (r) { return r[col]; }));
      return '<div class="bd-osum">' + OUT_SUM[b].map(function (s) { return '<div class="bd-osum-i"><span class="bd-osum-v num">' + s[0] + '</span><span class="bd-osum-l">' + T(s[1]) + '</span></div>'; }).join('') + '</div>' +
        '<div class="bd-otable" role="table" aria-label="' + esc(T('Perbandingan outlet')) + '"><div class="bd-orow is-head" role="row"><span role="columnheader">' + T('Outlet') + '</span><span role="columnheader" class="al-r">' + T('Member') + '</span><span role="columnheader" class="al-r bd-oc-v">' + T('Kunjungan member') + '</span><span role="columnheader" class="al-r bd-oc-s">' + T('Rata-rata belanja') + '</span><span role="columnheader" class="al-r bd-oc-j">' + T('Join rate') + '</span></div>' +
        rows.map(function (r, i) {
          return '<div class="bd-orow" role="row"><span role="cell" class="bd-oname"><span class="bd-rank num">' + (i + 1) + '</span><span class="stack" style="--gap:6px;min-width:0"><span class="t-strong ellip">' + esc(r[0]) + '</span><span class="pbar bd-pbar bd-obar"><span style="width:' + (r[col] / mx * 100).toFixed(1) + '%"></span></span></span></span>' +
            '<span role="cell" class="al-r num">' + num(r[1]) + '</span><span role="cell" class="al-r num bd-oc-v">' + num(per(r[2])) + '</span><span role="cell" class="al-r num bd-oc-s">' + rp(r[3]) + '</span><span role="cell" class="al-r num bd-oc-j">' + r[4] + '%</span></div>';
        }).join('') + '</div>' + (b === 'bobs' && +c.n < 18 ? '<p class="bd-foot-note">' + T('6 dari 18 outlet. Ubah lewat menu widget.') + '</p>' : '');
    }
  };

  /* 6 · busy and quiet hours */
  function heatData(b, mode) {
    var H = HEAT[b], g = DAYS.map(function (d, di) { return HOURS.map(function (h, hi) { return H.h[hi] * H.d[di]; }); });
    if (b === 'mendaya') {
      var band = function (di, hi) { return HOURS[hi] >= 14 && HOURS[hi] < 17; }, inV = function (di, hi) { return di < 4 && band(di, hi); };
      var all = 0, v = 0;
      g.forEach(function (r, di) { r.forEach(function (x, hi) { if (band(di, hi)) { all += x; if (inV(di, hi)) v += x; } }); });
      var f = 1 + 0.24 * all / v;
      if (mode !== 'before') g = g.map(function (r, di) { return r.map(function (x, hi) { return inV(di, hi) ? x * f : x; }); });
    }
    return g.map(function (r) { return r.map(function (x) { return Math.round(x); }); });
  }
  W.heat = {
    name: 'Jam ramai dan jam sepi', icon: 'calendar-stats', span: 2,
    desc: 'Jam ramai dan jam sepi per hari, dari data transaksi.',
    cfg: function () { return { mode: 'after', nums: 0, days: 'all' }; },
    menu: function () { return [{ h: 'Hari' }, { k: 'days', v: 'all', t: 'Semua hari' }, { k: 'days', v: 'week', t: 'Senin sampai Jumat' }, { sep: 1 }, { tog: 'nums', t: 'Angka di setiap kotak' }]; },
    head: function () { return { pill: T('4 minggu') }; },
    body: function (b, c) {
      var g = heatData(b, c.mode), mx = 0, rows = c.days === 'week' ? 5 : 7;
      g.forEach(function (r) { r.forEach(function (x) { if (x > mx) mx = x; }); });
      var cells = '<span class="bd-hx" style="grid-area:1/1"></span>' + HOURS.map(function (h, hi) { return '<span class="bd-hh num" style="grid-area:1/' + (hi + 2) + '">' + h + '</span>'; }).join('');
      for (var di = 0; di < rows; di++) {
        cells += '<span class="bd-hd" style="grid-area:' + (di + 2) + '/1">' + T(DAYS[di]) + '</span>';
        g[di].forEach(function (x, hi) {
          var a = x / mx;
          cells += '<span class="bd-hc' + (a > 0.56 ? ' is-strong' : '') + '" style="grid-area:' + (di + 2) + '/' + (hi + 2) + ';--a:' + Math.round(10 + a * 90) + '%" title="' + esc(T('{d} {h}.00: {n} transaksi per jam', { d: T(DAYS[di]), h: HOURS[hi], n: num(x) })) + '">' + (c.nums ? '<span class="num">' + x + '</span>' : '') + '</span>';
        });
      }
      var mend = b === 'mendaya';
      if (mend) cells += '<span class="bd-hband" style="grid-area:2/' + (HOURS.indexOf(14) + 2) + '/6/' + (HOURS.indexOf(17) + 2) + '" aria-hidden="true"></span>';
      var top = '';
      if (mend) {
        var gb = heatData(b, 'before'), ga = heatData(b, 'after'), sb = 0, sa = 0, n = 0;
        for (var d = 0; d < 7; d++) for (var h = 0; h < HOURS.length; h++) if (HOURS[h] >= 14 && HOURS[h] < 17) { sb += gb[d][h]; sa += ga[d][h]; n++; }
        top = '<div class="bd-heat-top">' + segBtns('heatMode', c.mode, [['after', T('Sesudah voucher')], ['before', T('Sebelum voucher')]], T('Bandingkan')) +
          '<span class="bd-heat-fig"><b class="num">' + (c.mode === 'before' ? num(Math.round(sb / n)) : '+24%') + '</b><span>' + (c.mode === 'before' ? T('transaksi per jam di 14.00 sampai 17.00, sebelum voucher') : T('transaksi di 14.00 sampai 17.00 setelah voucher jam sepi')) + '</span></span></div>';
      } else {
        var busy = { d: 0, h: 0, v: 0 }, quiet = { d: 0, h: 0, v: 1e9 };
        for (var d2 = 0; d2 < rows; d2++) for (var h2 = 0; h2 < HOURS.length; h2++) { var x2 = g[d2][h2]; if (x2 > busy.v) busy = { d: d2, h: h2, v: x2 }; if (HOURS[h2] >= 12 && HOURS[h2] <= 19 && d2 < 5 && x2 < quiet.v) quiet = { d: d2, h: h2, v: x2 }; }
        top = '<div class="bd-heat-top"><span class="bd-heat-fig"><b>' + T(DAYS[busy.d]) + ' ' + HOURS[busy.h] + '.00</b><span>' + T('jam paling ramai, {n} transaksi', { n: num(busy.v) }) + '</span></span><span class="bd-heat-fig"><b>' + T(DAYS[quiet.d]) + ' ' + HOURS[quiet.h] + '.00</b><span>' + T('jam siang paling sepi, {n} transaksi', { n: num(quiet.v) }) + '</span></span></div>';
      }
      return top + '<div class="bd-heat-scroll"><div class="bd-heat' + (c.nums ? ' has-nums' : '') + '" role="img" aria-label="' + esc(T('Rata-rata transaksi per jam, per hari')) + '" style="grid-template-rows:auto repeat(' + rows + ',minmax(24px,1fr))">' + cells + '</div></div>' +
        '<div class="bd-heat-legend"><span>' + T('Sepi') + '</span><span class="bd-heat-scale" aria-hidden="true"></span><span>' + T('Ramai') + '</span>' + (mend ? '<span class="bd-band-key"><span class="bd-band-sw" aria-hidden="true"></span>' + T('Voucher jam sepi: Senin sampai Kamis, 14.00 sampai 17.00') + '</span>' : '') + '</div>';
    }
  };

  /* 7 · paper stamp cards moving to the web-app (Bobs) */
  W.paper = {
    name: 'Pindah dari kartu kertas', icon: 'cards', span: 1,
    desc: 'Berapa kartu stempel kertas yang sudah pindah ke web-app.',
    avail: function (b) { return b === 'bobs' ? true : T('{b} tidak pernah memakai kartu stempel kertas.', { b: B[b].name }); },
    cfg: function () { return { chart: 'cum' }; },
    menu: function () { return [{ h: 'Grafik' }, { k: 'chart', v: 'cum', t: 'Total yang sudah pindah' }, { k: 'chart', v: 'week', t: 'Kartu dipindai per minggu' }]; },
    head: function () { return { pill: T('16 minggu') }; },
    body: function (b, c) {
      var cum = PAPER.cum, moved = Math.round(PAPER.cards * cum[cum.length - 1] / 100), wk = cum.map(function (v, i) { return Math.round(PAPER.cards * (v - (i ? cum[i - 1] : 0)) / 100); });
      var vals = c.chart === 'week' ? wk : cum, mx = c.chart === 'week' ? Math.max.apply(null, wk) * 1.1 : 100, Wd = 300, Hd = 96;
      var pts = vals.map(function (v, i) { return [(i / (vals.length - 1) * Wd).toFixed(1), (Hd - v / mx * Hd).toFixed(1)]; });
      var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' '), last = pts[pts.length - 1];
      var svg = '<svg class="bd-line" viewBox="-4 -8 ' + (Wd + 8) + ' ' + (Hd + 12) + '" preserveAspectRatio="none" role="img" aria-label="' + esc(c.chart === 'week' ? T('Kartu kertas dipindai per minggu, 16 minggu') : T('Total kartu kertas yang sudah pindah, 16 minggu')) + '">' +
        (c.chart === 'week' ? '' : '<line x1="0" x2="' + Wd + '" y1="' + (Hd - 0.71 * Hd).toFixed(1) + '" y2="' + (Hd - 0.71 * Hd).toFixed(1) + '" class="bd-line-ref"/>') +
        '<path d="' + line + ' L' + Wd + ' ' + Hd + ' L0 ' + Hd + ' Z" class="bd-line-area"/><path d="' + line + '" class="bd-line-path" vector-effect="non-scaling-stroke"/></svg>' +
        '<span class="bd-line-dot" style="left:' + ((+last[0] + 4) / (Wd + 8) * 100).toFixed(1) + '%;top:' + ((+last[1] + 8) / (Hd + 12) * 100).toFixed(1) + '%"></span>';
      return '<div class="stat stat-lg"><span class="stat-row"><span class="stat-value num">71%</span><span class="unit-pill">' + T('kartu kertas') + '</span></span><span class="stat-status sec">' + T('{a} dari sekitar {b} kartu sudah dipindai ke web-app', { a: num(moved), b: num(PAPER.cards) }) + '</span></div>' +
        '<div class="pbar bd-pbar mt-12"><span style="width:71%"></span></div>' +
        '<div class="bd-line-box">' + svg + '</div><div class="bd-line-x t-small muted"><span>' + T('Minggu 1') + '</span><span>' + T('Minggu ini') + '</span></div>' +
        '<ul class="bd-kv"><li><span>' + T('Stempel lama dipindahkan') + '</span><b class="num">' + num(PAPER.stamps) + '</b></li><li><span>' + T('Kartu kertas baru dicetak') + '</span><b class="num">0</b></li><li><span>' + T('Belum pindah') + '</span><b class="num">' + num(PAPER.cards - moved) + '</b></li></ul>';
    }
  };

  /* 8 · POS connection (Bobs) */
  W.pos = {
    name: 'Koneksi POS', icon: 'webhook', span: 2,
    desc: 'Status koneksi dengan POS yang sudah dipakai dan transaksi yang masuk.',
    avail: function (b) { return b === 'bobs' ? true : T('{b} memakai aplikasi kasir Providea Loyalty, jadi tidak perlu koneksi POS.', { b: B[b].name }); },
    cfg: function () { return { n: 4, issues: 0 }; },
    menu: function () { return [{ h: 'Kejadian terakhir' }, { k: 'n', v: 4, t: '4 kejadian' }, { k: 'n', v: 8, t: '8 kejadian' }, { sep: 1 }, { tog: 'issues', t: 'Hanya yang perlu dicek' }]; },
    head: function () { return {}; },
    body: function (b, c) {
      var ev = POSEV.filter(function (e) { return !c.issues || e[6] !== 'ok'; }).slice(0, +c.n);
      var tag = { ok: ['tag-success', 'Diterima'], guest: ['tag-outline', 'Tanpa member'], retry: ['tag-warning', 'Dikirim ulang'] };
      return '<div class="bd-pos-status"><span class="bd-live-dot" aria-hidden="true"></span><span class="stack bd-pos-tx" style="--gap:2px;min-width:0"><span class="t-strong">' + T('Terhubung') + ' · ' + T('18 dari 18 outlet mengirim data') + '</span><span class="t-small sec">' + T('Terhubung dengan POS yang sudah dipakai (integrasi fleksibel). Kasir tetap memakai POS yang sama.') + '</span></span>' +
        '<button type="button" class="btn btn-secondary btn-sm bd-pos-test" data-bd="posTest">' + ic('refresh', 16) + '<span class="btn-label">' + T('Uji koneksi') + '</span></button></div>' +
        '<div class="bd-minis">' + [[num(3284), 'transaksi masuk hari ini'], ['1,2 ' + T('detik'), 'rata-rata sampai di Providea'], ['0', 'gagal · 3 dikirim ulang']].map(function (m) { return '<div class="bd-mini"><b class="num">' + m[0] + '</b><span>' + T(m[1]) + '</span></div>'; }).join('') + '</div>' +
        '<p class="bd-sub-h">' + T('Kejadian terakhir') + '</p><ul class="bd-events">' + (ev.length ? ev.map(function (e) {
          var t = tag[e[6]];
          return '<li class="bd-ev"><span class="bd-ev-time num">' + P.ftime(Date.now() - e[0] * MIN) + '</span><span class="stack" style="--gap:2px;min-width:0"><span class="t-strong ellip">' + T('Transaksi {rp} · {o}', { rp: rp(e[2]), o: esc(e[1]) }) + '</span><span class="t-small sec ellip">' +
            (e[3] ? T('{m} · +{p} poin · {s} stempel', { m: esc(e[3]), p: e[4], s: e[5] }) : T('Pembeli bukan member')) + '</span></span><span class="tag tag-sm ' + t[0] + '">' + T(t[1]) + '</span></li>';
        }).join('') : '<li class="bd-empty">' + T('Tidak ada yang perlu dicek.') + '</li>') + '</ul>';
    }
  };

  /* 9 · campaign results */
  function camps(b) {
    if (b === 'kamtono') {
      return P.S.campaigns.filter(function (k) { return k.status === 'sent'; }).map(function (k) {
        return { name: k.name, seg: SEGN[k.seg] || k.seg, ch: k.ch || [], at: k.at, sent: k.sent || 0, read: k.read || 0, used: k.used || 0, cost: k.cost || 0 };
      });
    }
    return CAMP[b].map(function (k) { var wa = k.ch.indexOf('wa') >= 0; return { name: k.name, seg: k.seg, ch: k.ch, at: Date.now() - k.d * DAY, sent: k.sent, read: k.read, used: k.used, cost: wa ? Math.round(k.sent * WA_RATE) : 0 }; });
  }
  W.campaigns = {
    name: 'Hasil kampanye', icon: 'speakerphone', span: 2,
    desc: 'Hasil promo WhatsApp, email, dan Wallet, lengkap dengan biaya.',
    cfg: function () { return { ch: 'all', sort: 'recent' }; },
    menu: function () { return [{ h: 'Saluran' }, { k: 'ch', v: 'all', t: 'Semua saluran' }, { k: 'ch', v: 'wa', t: 'WhatsApp saja' }, { sep: 1 }, { h: 'Urutkan' }, { k: 'sort', v: 'recent', t: 'Terbaru' }, { k: 'sort', v: 'used', t: 'Paling banyak dipakai' }]; },
    head: function (b, c) { return { count: camps(b).filter(function (k) { return c.ch === 'all' || k.ch.indexOf('wa') >= 0; }).length }; },
    body: function (b, c) {
      var all = camps(b), list = all.filter(function (k) { return c.ch === 'all' || k.ch.indexOf('wa') >= 0; });
      list.sort(function (x, y) { return c.sort === 'used' ? y.used - x.used : y.at - x.at; });
      var wa = all.filter(function (k) { return k.ch.indexOf('wa') >= 0; }), cost = wa.reduce(function (a, k) { return a + k.cost; }, 0), used = wa.reduce(function (a, k) { return a + k.used; }, 0);
      var head = '<div class="bd-minis">' + [[rp(cost), 'biaya WhatsApp, di luar PPN'], [num(used), 'kunjungan dari voucher WhatsApp'], [used ? rp(cost / used) : '–', 'biaya per kunjungan']].map(function (m) { return '<div class="bd-mini"><b class="num">' + m[0] + '</b><span>' + T(m[1]) + '</span></div>'; }).join('') + '</div>';
      return head + '<div class="bd-camps"><div class="bd-camp is-head"><span>' + T('Kampanye') + '</span><span class="al-r">' + T('Terkirim') + '</span><span class="al-r">' + T('Dibaca') + '</span><span class="al-r">' + T('Dipakai') + '</span><span class="al-r">' + T('Biaya') + '</span><span class="al-r">' + T('Penjualan dari voucher') + '</span></div>' +
        (list.length ? list.map(function (k) {
          var sales = k.used * TICKET[b];
          return '<div class="bd-camp"><span class="bd-camp-name"><span class="t-strong ellip">' + esc(T(k.name)) + '</span><span class="bd-camp-meta">' + k.ch.map(chip).join('') + '<span class="t-small sec">' + esc(T(k.seg)) + ' · ' + P.fdate(k.at, true) + '</span></span></span>' +
            '<span class="al-r num" data-l="' + esc(T('Terkirim')) + '">' + num(k.sent) + '</span><span class="al-r num" data-l="' + esc(T('Dibaca')) + '">' + (k.read ? num(k.read) : '–') + '</span><span class="al-r num" data-l="' + esc(T('Dipakai')) + '"><span><b>' + num(k.used) + '</b> <span class="muted">' + pct(k.used, k.sent) + '%</span></span></span>' +
            '<span class="al-r num" data-l="' + esc(T('Biaya')) + '">' + (k.cost ? rp(k.cost) : T('Gratis')) + '</span><span class="al-r num" data-l="' + esc(T('Penjualan dari voucher')) + '">' + rp(sales) + '</span></div>';
        }).join('') : '<p class="bd-empty">' + T('Belum ada kampanye di saluran ini.') + '</p>') + '</div>' +
        '<p class="bd-foot-note">' + T('Biaya WhatsApp {r} per pesan, di luar PPN. Penjualan dihitung dari voucher yang dipakai × rata-rata belanja {t}.', { r: 'Rp586,33', t: rp(TICKET[b]) }) + '</p>';
    }
  };

  /* 10 · latest activity */
  function kamActs(n) {
    return P.S.log.slice().sort(function (a, b) { return b.at - a.at; }).map(function (l) {
      var m = P.member(l.memberId); if (!m) return null;
      var who = '<b>' + esc(m.name) + '</b>', t = '';
      if (l.kind === 'sale') t = l.void ? T('{m}: penjualan {rp} dibatalkan', { m: who, rp: rp(l.amount) }) : T('{m} belanja {rp}, dapat {n} poin', { m: who, rp: rp(l.amount), n: l.points });
      else if (l.kind === 'join') t = T('{m} jadi member', { m: who });
      else if (l.kind === 'tier') t = T('{m} naik ke {t}', { m: who, t: l.title });
      else if (l.kind === 'voucher') t = T('{m} memakai voucher {v}', { m: who, v: T(l.title) });
      else if (l.kind === 'redeem') t = T('{m} menukar {n} poin', { m: who, n: Math.abs(l.points) });
      else if (l.kind === 'pay') t = T('{m} bayar pakai {n} poin', { m: who, n: Math.abs(l.points) });
      else if (l.kind === 'adjust') t = T('Poin {m} disesuaikan', { m: who });
      else return null;
      return [t, l.at, l.outlet || '', l.kind];
    }).filter(Boolean).slice(0, n);
  }
  function sampleActs(b, n) {
    return ACTS[b].slice(0, n).map(function (a) {
      var who = '<b>' + esc(a[2]) + '</b>', t = '';
      if (a[1] === 'checkin') t = T('{m} check-in dari QR meja', { m: who });
      else if (a[1] === 'sale') t = a[6] ? T('{m} belanja {rp}, dapat {n} poin dan {s} stempel', { m: who, rp: rp(a[4]), n: a[5], s: a[6] }) : T('{m} belanja {rp}, dapat {n} poin', { m: who, rp: rp(a[4]), n: a[5] });
      else if (a[1] === 'voucher') t = T('{m} memakai voucher {v}', { m: who, v: T(a[4]) });
      else if (a[1] === 'tier') t = T('{m} naik ke {t}', { m: who, t: a[4] });
      else if (a[1] === 'stamp') t = T('Kartu stempel {m} penuh: {v}', { m: who, v: T(a[4]) });
      else if (a[1] === 'join') t = T('{m} jadi member', { m: who });
      else if (a[1] === 'paper') t = T('{m} memindahkan kartu kertas ({n} stempel)', { m: who, n: a[4] });
      return [t, Date.now() - a[0] * MIN, a[3], a[1]];
    });
  }
  W.activity = {
    name: 'Aktivitas terbaru', icon: 'history', span: 1,
    desc: 'Kegiatan member terbaru dari kasir dan HP member.',
    cfg: function () { return { n: 5 }; },
    menu: function () { return [{ h: 'Jumlah' }, { k: 'n', v: 5, t: '5 kegiatan' }, { k: 'n', v: 8, t: '8 kegiatan' }]; },
    head: function () { return {}; },
    body: function (b, c) {
      var list = b === 'kamtono' ? kamActs(+c.n) : sampleActs(b, +c.n);
      return '<div class="timeline bd-tl">' + list.map(function (a) {
        return '<div class="tl-item' + (a[3] === 'join' || a[3] === 'tier' ? ' tl-current' : ' tl-signed') + '"><span class="tl-mark"></span><span class="tl-main"><span class="tl-title">' + a[0] + '</span><span class="tl-sub">' + P.ago(a[1]) + (a[2] ? ' · ' + esc(a[2]) : '') + '</span></span></div>';
      }).join('') + '</div>';
    }
  };

  /* ════════════ page ════════════ */
  function head() {
    var b = st.brand;
    return '<header class="page-head bd-head"><div class="page-head-text"><h1 class="t-h1">' + T('Ringkasan') + '</h1><p class="page-head-sub">' + T(B[b].sub) + '</p></div>' +
      '<div class="page-head-actions"><div class="tabs-segmented tabs-sm" role="group" aria-label="' + esc(T('Periode')) + '">' + PERIODS.map(function (p) {
        return '<button type="button" class="tab' + (st.period === p[0] ? ' is-active' : '') + '" aria-pressed="' + (st.period === p[0]) + '" data-bd="period" data-v="' + p[0] + '">' + T(p[1]) + '</button>';
      }).join('') + '</div>' +
      (edit ? '<button type="button" class="btn btn-primary" data-bd="edit">' + ic('check', 18) + '<span class="btn-label">' + T('Selesai') + '</span></button>'
        : '<button type="button" class="btn btn-secondary" data-bd="edit">' + ic('layout-grid', 18) + '<span class="btn-label">' + T('Atur ringkasan') + '</span></button>') + '</div></header>' +
      '<div class="bd-brandbar"><span class="bd-brandbar-label" id="bd-brands-l">' + T('Lihat contoh merek') + '</span>' +
      '<div class="bd-brands" role="radiogroup" aria-labelledby="bd-brands-l">' + BRANDS.map(function (id) {
        var on = id === b;
        return '<button type="button" class="bd-brand' + (on ? ' is-on' : '') + '" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-bd="brand" data-v="' + id + '">' + brandIcon(id, 28) +
          '<span class="bd-brand-tx"><span class="bd-brand-name">' + B[id].name + '</span><span class="bd-brand-meta">' + T(B[id].bmeta) + '</span></span></button>';
      }).join('') + '</div>' +
      '<span class="tag tag-warning tag-sm bd-sample">' + ic('info-circle', 13) + T('Angka contoh') + '</span></div>';
  }
  function editBar() {
    return '<div class="bd-editbar" role="region" aria-label="' + esc(T('Mode atur ringkasan')) + '">' + ic('arrows-move', 20) +
      '<span class="bd-editbar-tx"><b>' + T('Mode atur ringkasan.') + '</b> ' + T('Tarik widget dari pegangannya, atau pakai tombol panah.') + ' <span class="bd-wide-only">' + T('Atur lebar 1, 2, atau 3 kolom.') + '</span> ' + T('Susunan disimpan untuk {b} di browser ini.', { b: B[st.brand].name }) + '</span>' +
      '<span class="bd-editbar-act"><button type="button" class="btn btn-ghost btn-sm" data-bd="reset">' + ic('arrow-back-up', 16) + '<span class="btn-label">' + T('Kembalikan susunan awal') + '</span></button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-bd="edit">' + ic('check', 16) + '<span class="btn-label">' + T('Selesai') + '</span></button></span></div>';
  }
  function widget(id) {
    var w = W[id], c = cfg(id), s = spanOf(id), h = (w.head && w.head(st.brand, c)) || {}, name = T(w.name);
    var l = lay(), i = l.order.indexOf(id);
    return '<section class="npanel bd-w bd-s' + s + (edit ? ' is-edit' : '') + '" data-w="' + id + '" aria-labelledby="bdt-' + id + '">' +
      '<header class="npanel-head bd-w-head"><h2 class="npanel-title bd-w-title" id="bdt-' + id + '">' + ic(w.icon, 16) + '<span class="ellip">' + name + '</span>' + (h.count != null ? '<span class="npanel-count num">' + h.count + '</span>' : '') + '</h2>' +
      '<span class="npanel-action bd-w-act">' + (h.pill ? '<span class="unit-pill bd-pill">' + h.pill + '</span>' : '') +
      '<button type="button" class="icon-btn icon-btn-sm bd-grip" data-bd="grip" aria-label="' + esc(T('Pindahkan {name}', { name: name })) + '" title="' + esc(T('Tarik untuk memindahkan. Panah kiri dan kanan juga bisa.')) + '">' + ic('grip-vertical', 16) + '</button>' +
      '<button type="button" class="icon-btn icon-btn-sm bd-more" data-bd="menu" aria-haspopup="menu" aria-expanded="false" aria-label="' + esc(T('Atur widget {name}', { name: name })) + '">' + ic('dots', 16) + '</button></span></header>' +
      (edit ? '<div class="bd-estrip"><span class="bd-emove"><button type="button" class="icon-btn icon-btn-sm" data-bd="move" data-v="-1"' + (i <= 0 ? ' disabled' : '') + ' aria-label="' + esc(T('Pindah ke depan: {name}', { name: name })) + '" title="' + esc(T('Pindah ke depan')) + '">' + ic('arrow-narrow-left', 16) + '</button>' +
        '<button type="button" class="icon-btn icon-btn-sm" data-bd="move" data-v="1"' + (i >= l.order.length - 1 ? ' disabled' : '') + ' aria-label="' + esc(T('Pindah ke belakang: {name}', { name: name })) + '" title="' + esc(T('Pindah ke belakang')) + '">' + ic('arrow-narrow-right', 16) + '</button></span>' +
        '<span class="bd-ewidth"><span class="bd-ewidth-l">' + T('Lebar') + '</span>' + segBtns('width', s, [[1, '1'], [2, '2'], [3, '3']], T('Lebar {name} dalam kolom', { name: name })) + '</span>' +
        '<button type="button" class="btn btn-ghost btn-sm bd-ehide" data-bd="hide" aria-label="' + esc(T('Sembunyikan {name}', { name: name })) + '">' + ic('eye-off', 16) + '<span class="btn-label">' + T('Sembunyikan') + '</span></button></div>' : '') +
      '<div class="npanel-body ' + (w.pad === 'none' ? 'pad-none' : 'pad-md') + ' bd-w-body"' + (edit ? ' inert' : '') + '>' + w.body(st.brand, c) + '</div></section>';
  }
  function addTile() {
    var n = hiddenIds().filter(function (id) { return avail(id) === true; }).length;
    return '<button type="button" class="bd-add" data-bd="add">' + ic('plus', 20) + '<span class="t-strong">' + T('Tambah widget') + '</span><span class="t-small sec">' + (n ? T('{n} widget bisa ditambahkan', { n: n }) : T('Semua widget sudah tampil')) + '</span></button>';
  }
  function grid() { return lay().order.map(widget).join('') + (edit ? addTile() : ''); }
  function inner() {
    var b = st.brand;
    return head() + (edit ? editBar() : '') +
      '<div class="bd-board"><div class="bd-grid' + (edit ? ' is-edit' : '') + '" data-bd-grid>' + grid() + '</div></div>' +
      '<div class="demo-note mt-16">' + ic('info-circle', 14) + '<span>' + (b === 'kamtono' ? T('Semua angka contoh. Penjualan, member baru, dan voucher yang kamu klik di tampilan kasir dan HP member ikut masuk ke sini.') : T('{b} adalah merek contoh. Semua angka di sini angka contoh, tidak terhubung dengan tampilan kasir dan HP member.', { b: B[b].name })) + '</span></div>' +
      '<p class="sr-only" aria-live="polite" id="bd-live"></p>';
  }
  function html() { return '<div class="bd-page" data-bd-page>' + inner() + '</div>'; }

  /* ════════════ brand theme + sidebar ════════════ */
  /* the brand look applies on the summary only; the other dashboard pages show Kamtono's live demo data */
  function onSummary() { var h = location.hash.replace(/^#\/?/, ''); return !h || h.indexOf('ringkasan') === 0; }
  function applyTheme() { if (onSummary()) document.body.setAttribute('data-brand', st.brand); else document.body.removeAttribute('data-brand'); }
  function chrome() {
    applyTheme();
    if (!onSummary()) return;
    var b = B[st.brand], ws = document.querySelector('.ws-card');
    if (ws && ws.getAttribute('data-bd-ws') !== st.brand + P.lang()) {
      ws.setAttribute('data-bd-ws', st.brand + P.lang());
      ws.innerHTML = brandIcon(st.brand, 30) + '<span class="stack" style="--gap:0;min-width:0"><span class="t-strong ellip" title="' + esc(b.name) + '">' + esc(b.name) + '</span><span class="t-small sec ellip" title="' + esc(T(b.meta)) + '">' + T(b.meta) + '</span></span>';
    }
    var cr = document.querySelector('.crumbs .crumb');
    if (cr && cr.textContent !== b.name) cr.textContent = b.name;
  }
  applyTheme();
  /* the dashboard re-renders #app on every route change: keep the sidebar card on the chosen brand */
  var app = document.getElementById('app');
  if (app && window.MutationObserver) new MutationObserver(function () { chrome(); }).observe(app, { childList: true });

  /* ════════════ rendering ════════════ */
  function root() { return document.querySelector('[data-bd-page]'); }
  function rerender(focusSel) {
    var r = root(); if (!r) return;
    closeMenu();
    r.innerHTML = inner();
    chrome();
    if (focusSel) { var f = r.querySelector(focusSel); if (f) f.focus({ preventScroll: true }); }
  }
  function rerenderWidget(id) {
    var r = root(), el = r && r.querySelector('[data-w="' + id + '"]'); if (!el) return;
    var tmp = document.createElement('div'); tmp.innerHTML = widget(id);
    el.replaceWith(tmp.firstChild);
  }
  function announce(msg) { var l = document.getElementById('bd-live'); if (l) { l.textContent = ''; setTimeout(function () { l.textContent = msg; }, 30); } }

  /* ════════════ widget menu ("…") ════════════ */
  var menuEl = null, menuBtn = null;
  function closeMenu(refocus) {
    if (!menuEl) return;
    menuEl.remove(); menuEl = null;
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'false'); if (refocus && menuBtn.isConnected) menuBtn.focus(); }
    menuBtn = null;
  }
  function openMenu(btn) {
    var wEl = btn.closest('[data-w]'), id = wEl.getAttribute('data-w'), w = W[id], c = cfg(id), s = spanOf(id);
    if (menuEl && menuBtn === btn) { closeMenu(true); return; }
    closeMenu();
    var items = (w.menu ? w.menu(st.brand) : []).concat([{ sep: 1 }, { wrow: 1 }, { sep: 1 }, { act: 'hide', icon: 'eye-off', t: 'Sembunyikan' }, { act: 'ask', icon: 'message-question', t: 'Tanya tim tentang ini' }]);
    var h = '<div class="menu-list">' + items.map(function (it) {
      if (it.sep) return '<div class="menu-divider" role="separator"></div>';
      if (it.h) return '<div class="menu-header">' + T(it.h) + '</div>';
      if (it.wrow) return '<div class="bd-mwidth" role="group" aria-label="' + esc(T('Lebar')) + '"><span class="bd-mwidth-l">' + T('Lebar') + '</span><span class="bd-mw-btns">' + [1, 2, 3].map(function (n) {
        return '<button type="button" class="menu-item bd-mw" role="menuitemradio" aria-checked="' + (s === n) + '" aria-label="' + esc(T('{n} kolom', { n: n })) + '" title="' + esc(T('{n} kolom', { n: n })) + '" data-m-k="__w" data-m-v="' + n + '">' + n + '</button>';
      }).join('') + '</span></div>';
      if (it.act) return '<button type="button" class="menu-item" role="menuitem" data-m-act="' + it.act + '">' + ic(it.icon, 16) + '<span class="menu-label">' + T(it.t) + '</span></button>';
      var on = it.tog ? !!c[it.tog] : String(it.k === '__w' ? s : c[it.k]) === String(it.v);
      return '<button type="button" class="menu-item" role="' + (it.tog ? 'menuitemcheckbox' : 'menuitemradio') + '" aria-checked="' + on + '" data-m-k="' + (it.tog || it.k) + '" data-m-v="' + (it.tog ? (on ? 0 : 1) : it.v) + '"><span class="bd-mcheck">' + (on ? ic('check', 16, 'menu-check') : '') + '</span><span class="menu-label">' + T(it.t) + '</span></button>';
    }).join('') + '</div>';
    menuEl = document.createElement('div');
    menuEl.className = 'popover bd-menu'; menuEl.setAttribute('role', 'menu'); menuEl.setAttribute('aria-label', T('Atur widget {name}', { name: T(w.name) }));
    menuEl.innerHTML = h; document.body.appendChild(menuEl);
    menuBtn = btn; btn.setAttribute('aria-expanded', 'true');
    placeMenu(true);
    menuEl.addEventListener('click', function (e) {
      var it = e.target.closest('.menu-item'); if (!it) return;
      if (it.hasAttribute('data-m-act')) { var a = it.getAttribute('data-m-act'); closeMenu(); if (a === 'hide') hideW(id, true); else ask(id); return; }
      var k = it.getAttribute('data-m-k'), v = it.getAttribute('data-m-v'); v = /^\d+$/.test(v) ? +v : v;
      if (k === '__w') { setWidth(id, v); closeMenu(); return; }
      setCfg(id, k, v); closeMenu(); rerenderWidget(id);
      var nb = root().querySelector('[data-w="' + id + '"] .bd-more'); if (nb) nb.focus({ preventScroll: true });
    });
    menuEl.addEventListener('keydown', function (e) {
      var its = [].slice.call(menuEl.querySelectorAll('.menu-item')), i = its.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); its[(i + 1) % its.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); its[(i - 1 + its.length) % its.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); its[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); its[its.length - 1].focus(); }
      else if (e.key === 'Tab') closeMenu();
    });
    var first = menuEl.querySelector('.menu-item[aria-checked="true"]') || menuEl.querySelector('.menu-item');
    if (first) first.focus({ preventScroll: true });
  }
  /* the menu is position: fixed; it follows its button on scroll and closes when the button leaves the view */
  function placeMenu(first) {
    if (!menuEl || !menuBtn) return;
    if (!menuBtn.isConnected) { closeMenu(); return; }
    if (first === true) menuBtn.scrollIntoView({ block: 'nearest' });
    var r = menuBtn.getBoundingClientRect(), vh = innerHeight, vw = document.documentElement.clientWidth;
    if (first !== true && (r.bottom < 0 || r.top > vh)) { closeMenu(); return; }
    menuEl.style.maxHeight = '';
    var mw = menuEl.offsetWidth, mh = menuEl.offsetHeight, below = vh - r.bottom - 14, above = r.top - 14 - 60, top;
    if (mh <= below || below >= above) { top = r.bottom + 6; if (mh > below) menuEl.style.maxHeight = Math.max(160, below) + 'px'; }
    else { if (mh > above) menuEl.style.maxHeight = Math.max(160, above) + 'px'; top = r.top - 6 - menuEl.offsetHeight; }
    menuEl.style.left = Math.max(8, Math.min(r.right - mw, vw - mw - 8)) + 'px'; menuEl.style.top = Math.max(8, top) + 'px';
  }
  document.addEventListener('pointerdown', function (e) { if (menuEl && !menuEl.contains(e.target) && !(menuBtn && menuBtn.contains(e.target))) closeMenu(); }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (menuEl) { e.stopPropagation(); closeMenu(true); return; }
    if (edit && root() && !document.querySelector('.overlay[data-open]')) { edit = false; rerender('[data-bd="edit"]'); }
  }, true);
  addEventListener('scroll', placeMenu, { passive: true });
  addEventListener('resize', placeMenu);

  /* ════════════ layout actions ════════════ */
  function ask(id) {
    if (window.PLAsk && window.PLAsk.open) window.PLAsk.open({ feature: 'ringkasan-' + id, title: T(W[id].name) });
    else location.href = 'mailto:hello@providea.com?subject=' + encodeURIComponent('Providea Loyalty: ' + T(W[id].name));
  }
  function setWidth(id, v) {
    lay().w[id] = v; save();
    var el = root().querySelector('[data-w="' + id + '"]');
    if (el) { flip(function () { rerenderWidget(id); }); }
    announce(T('{name}: lebar {n} kolom', { name: T(W[id].name), n: v }));
    var nb = root().querySelector('[data-w="' + id + '"] [data-bd="width"][data-v="' + v + '"]') || root().querySelector('[data-w="' + id + '"] .bd-more');
    if (nb) nb.focus({ preventScroll: true });
  }
  function hideW(id, fromMenu) {
    var l = lay(), i = l.order.indexOf(id); if (i < 0) return;
    flip(function () { l.order.splice(i, 1); save(); var el = root().querySelector('[data-w="' + id + '"]'); if (el) el.remove(); var add = root().querySelector('.bd-add'); if (add) add.outerHTML = addTile(); });
    var name = T(W[id].name);
    P.toast(fromMenu && !edit ? T('{name} disembunyikan. Tampilkan lagi lewat Atur ringkasan.', { name: name }) : T('{name} disembunyikan', { name: name }), 'eye-off');
    announce(T('{name} disembunyikan', { name: name }));
    var next = root().querySelectorAll('[data-w]')[Math.min(i, l.order.length - 1)];
    var f = next ? next.querySelector('.bd-grip') : root().querySelector('[data-bd="add"], [data-bd="edit"]'); if (f) f.focus({ preventScroll: true });
  }
  function moveW(id, dir) {
    var l = lay(), i = l.order.indexOf(id), j = i + dir; if (i < 0 || j < 0 || j >= l.order.length) return false;
    l.order.splice(i, 1); l.order.splice(j, 0, id); save();
    flip(function () {
      var g = root().querySelector('[data-bd-grid]'), el = g.querySelector('[data-w="' + id + '"]'), ref = g.querySelectorAll('[data-w]');
      var others = [].filter.call(ref, function (x) { return x !== el; });
      g.insertBefore(el, others[j] || g.querySelector('.bd-add'));
      refreshMoveBtns();
    });
    announce(T('{name}: posisi {i} dari {n}', { name: T(W[id].name), i: j + 1, n: l.order.length }));
    return true;
  }
  function refreshMoveBtns() {
    var ws = root().querySelectorAll('[data-w]');
    [].forEach.call(ws, function (w, i) { var bs = w.querySelectorAll('[data-bd="move"]'); if (bs.length) { bs[0].disabled = i === 0; bs[1].disabled = i === ws.length - 1; } });
  }
  function syncOrder() { var l = lay(); l.order = [].map.call(root().querySelectorAll('[data-bd-grid] > [data-w]'), function (w) { return w.getAttribute('data-w'); }); save(); }

  /* FLIP: animate grid children from their old place to the new one */
  function flip(change) {
    var g = root() && root().querySelector('[data-bd-grid]');
    if (!g || reduced()) { change(); return; }
    var before = new Map();
    [].forEach.call(g.children, function (el) { before.set(el.getAttribute('data-w') || el.className, el.getBoundingClientRect()); });
    change();
    [].forEach.call(g.children, function (el) {
      if (el.classList.contains('is-dragging')) return;
      var a = before.get(el.getAttribute('data-w') || el.className); if (!a) return;
      var b = el.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
      if (!dx && !dy) return;
      el.style.transition = 'none'; el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      el.getBoundingClientRect();
      el.style.transition = 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)'; el.style.transform = '';
      setTimeout(function () { el.style.transition = ''; }, 260);
    });
  }

  /* add-widget picker */
  function picker() {
    var b = st.brand, hid = hiddenIds(), ok = hid.filter(function (id) { return avail(id) === true; }), no = hid.filter(function (id) { return avail(id) !== true; });
    function row(id, reason) {
      return '<li class="bd-pick-row' + (reason ? ' is-off' : '') + '"><span class="bd-pick-ic">' + ic(W[id].icon, 20) + '</span><span class="bd-pick-tx"><span class="t-strong">' + T(W[id].name) + '</span><span class="t-small sec">' + (reason || T(W[id].desc)) + '</span></span>' +
        (reason ? '<span class="tag tag-outline tag-sm">' + T('Tidak tersedia') + '</span>' : '<button type="button" class="btn btn-secondary btn-sm" data-add="' + id + '">' + ic('plus', 16) + '<span class="btn-label">' + T('Tambah') + '</span></button>') + '</li>';
    }
    var body = (ok.length ? '<ul class="bd-pick">' + ok.map(function (id) { return row(id); }).join('') + '</ul>' : '<p class="bd-pick-empty">' + ic('circle-check', 18) + T('Semua widget untuk {b} sudah tampil.', { b: B[b].name }) + '</p>') +
      (no.length ? '<p class="bd-sub-h mt-16">' + T('Tidak tersedia untuk {b}', { b: B[b].name }) + '</p><ul class="bd-pick">' + no.map(function (id) { return row(id, avail(id)); }).join('') + '</ul>' : '');
    var m = P.modal({ title: T('Tambah widget'), desc: T('Pilih widget untuk ringkasan {b}. Widget baru masuk di akhir, lalu bisa ditarik ke tempat lain.', { b: B[b].name }), width: 560, body: body });
    m.el.classList.add('bd-modal');
    m.body.addEventListener('click', function (e) {
      var a = e.target.closest('[data-add]'); if (!a) return;
      var id = a.getAttribute('data-add'), l = lay();
      if (l.order.indexOf(id) < 0) l.order.push(id);
      if (!l.w[id]) l.w[id] = W[id].span; save();
      m.close();
      flip(function () { var g = root().querySelector('[data-bd-grid]'), tmp = document.createElement('div'); tmp.innerHTML = widget(id); g.insertBefore(tmp.firstChild, g.querySelector('.bd-add')); var add = g.querySelector('.bd-add'); if (add) add.outerHTML = addTile(); refreshMoveBtns(); });
      var el = root().querySelector('[data-w="' + id + '"]');
      if (el) { el.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); var gr = el.querySelector('.bd-grip'); if (gr) gr.focus({ preventScroll: true }); el.classList.add('is-new'); setTimeout(function () { el.classList.remove('is-new'); }, 1200); }
      P.toast(T('{name} ditambahkan', { name: T(W[id].name) }), 'circle-check');
    });
  }

  /* ════════════ drag to reorder (pointer events: mouse, pen, touch) ════════════ */
  var drag = null;
  function onGripDown(e, grip) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    var w = grip.closest('[data-w]');
    drag = { w: w, grip: grip, id: w.getAttribute('data-w'), x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, pid: e.pointerId };
    try { grip.setPointerCapture(e.pointerId); } catch (er) {}
    grip.addEventListener('pointermove', onMove);
    grip.addEventListener('pointerup', onUp);
    grip.addEventListener('pointercancel', onUp);
    grip.addEventListener('lostpointercapture', onUp);
  }
  function begin() {
    var w = drag.w, r = w.getBoundingClientRect(), g = w.parentNode;
    closeMenu();
    drag.on = true; drag.r = r; drag.ox = drag.x0 - r.left; drag.oy = drag.y0 - r.top;
    var ph = document.createElement('div'); ph.className = 'bd-ph bd-s' + spanOf(drag.id); ph.style.height = r.height + 'px';
    g.insertBefore(ph, w); drag.ph = ph; drag.g = g;
    w.classList.add('is-dragging');
    w.style.width = r.width + 'px'; w.style.height = r.height + 'px'; w.style.left = r.left + 'px'; w.style.top = r.top + 'px';
    document.body.classList.add('bd-dragging');
    drag.raf = requestAnimationFrame(tick);
  }
  function onMove(e) {
    if (!drag) return;
    drag.x = e.clientX; drag.y = e.clientY;
    if (!drag.on) { if (Math.abs(drag.x - drag.x0) + Math.abs(drag.y - drag.y0) < 6) return; begin(); }
    e.preventDefault();
    drag.w.style.transform = 'translate(' + (drag.x - drag.ox - drag.r.left) + 'px,' + (drag.y - drag.oy - drag.r.top) + 'px) rotate(0.6deg)';
    place();
  }
  /* auto-scroll near the top and bottom edges while dragging */
  function tick() {
    if (!drag || !drag.on) return;
    var edge = 72, sp = 0;
    if (drag.y < edge + 56) sp = -Math.ceil((edge + 56 - drag.y) / 6);
    else if (drag.y > innerHeight - edge) sp = Math.ceil((drag.y - (innerHeight - edge)) / 6);
    if (sp) { scrollBy(0, sp); place(); }
    drag.raf = requestAnimationFrame(tick);
  }
  function place() {
    var g = drag.g, x = drag.x, y = drag.y, pr = drag.ph.getBoundingClientRect();
    if (x >= pr.left && x <= pr.right && y >= pr.top && y <= pr.bottom) return;
    var best = null, bd = Infinity;
    [].forEach.call(g.children, function (c) {
      if (c === drag.w || c === drag.ph || c.classList.contains('bd-add')) return;
      var r = c.getBoundingClientRect(), dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0, dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = { c: c, r: r }; }
    });
    if (!best) return;
    var r = best.r, sameRow = y >= r.top && y <= r.bottom, after = sameRow ? x > r.left + r.width / 2 : y > r.top + r.height / 2;
    var ref = after ? best.c.nextSibling : best.c;
    while (ref && (ref === drag.w || ref === drag.ph)) ref = ref.nextSibling;
    var cur = drag.ph.nextSibling; while (cur && cur === drag.w) cur = cur.nextSibling;
    if (cur === ref) return;
    flip(function () { g.insertBefore(drag.ph, ref); });
  }
  function onUp() {
    if (!drag) return;
    var d = drag; drag = null;
    d.grip.removeEventListener('pointermove', onMove); d.grip.removeEventListener('pointerup', onUp); d.grip.removeEventListener('pointercancel', onUp); d.grip.removeEventListener('lostpointercapture', onUp);
    try { d.grip.releasePointerCapture(d.pid); } catch (er) {}
    if (!d.on) return;
    cancelAnimationFrame(d.raf);
    document.body.classList.remove('bd-dragging');
    var from = d.w.getBoundingClientRect();
    d.g.insertBefore(d.w, d.ph); d.ph.remove();
    d.w.classList.remove('is-dragging'); d.w.style.width = d.w.style.height = d.w.style.left = d.w.style.top = ''; d.w.style.transform = '';
    if (!reduced()) {
      var to = d.w.getBoundingClientRect();
      d.w.style.transition = 'none'; d.w.style.transform = 'translate(' + (from.left - to.left) + 'px,' + (from.top - to.top) + 'px)';
      d.w.getBoundingClientRect();
      d.w.style.transition = 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)'; d.w.style.transform = '';
      setTimeout(function () { d.w.style.transition = ''; }, 240);
    }
    var before = lay().order.join();
    syncOrder(); refreshMoveBtns();
    var l = lay();
    if (l.order.join() !== before) announce(T('{name}: posisi {i} dari {n}', { name: T(W[d.id].name), i: l.order.indexOf(d.id) + 1, n: l.order.length }));
    d.grip.focus({ preventScroll: true });
  }

  /* ════════════ events ════════════ */
  function onClick(e) {
    var a = e.target.closest('[data-bd]'); if (!a || a.disabled) return;
    var k = a.getAttribute('data-bd'), v = a.getAttribute('data-v'), wEl = a.closest('[data-w]'), id = wEl && wEl.getAttribute('data-w');
    if (k === 'brand') {
      if (v === st.brand) return;
      st.brand = v; save(); applyTheme(); rerender('[data-bd="brand"][data-v="' + v + '"]');
      announce(T('Contoh {b} ditampilkan', { b: B[v].name }));
    } else if (k === 'period') { st.period = v; save(); rerender('[data-bd="period"][data-v="' + v + '"]'); }
    else if (k === 'edit') { edit = !edit; rerender('.page-head [data-bd="edit"]'); announce(edit ? T('Mode atur ringkasan.') : T('Susunan ringkasan disimpan')); }
    else if (k === 'reset') { st.L[st.brand] = defLayout(st.brand); save(); rerender('[data-bd="reset"]'); P.toast(T('Susunan awal {b} dikembalikan', { b: B[st.brand].name }), 'arrow-back-up'); }
    else if (k === 'menu') openMenu(a);
    else if (k === 'move') { moveW(id, +v); var nb = root().querySelector('[data-w="' + id + '"] [data-bd="move"][data-v="' + v + '"]'); if (nb && !nb.disabled) nb.focus({ preventScroll: true }); else { var gb = root().querySelector('[data-w="' + id + '"] .bd-grip'); if (gb) gb.focus({ preventScroll: true }); } }
    else if (k === 'width') setWidth(id, +v);
    else if (k === 'hide') hideW(id);
    else if (k === 'add') picker();
    else if (k === 'heatMode') { setCfg(id, 'mode', v); rerenderWidget(id); var hb = root().querySelector('[data-w="' + id + '"] [data-bd="heatMode"][data-v="' + v + '"]'); if (hb) hb.focus({ preventScroll: true }); }
    else if (k === 'posTest') { a.disabled = true; setTimeout(function () { a.disabled = false; P.toast(T('Koneksi baik. Transaksi uji masuk dalam 1,1 detik (demo).'), 'circle-check'); }, 700); }
  }
  function onKey(e) {
    var t = e.target;
    if (t.matches && t.matches('.bd-grip') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      var id = t.closest('[data-w]').getAttribute('data-w');
      if (moveW(id, e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1)) { var g = root().querySelector('[data-w="' + id + '"] .bd-grip'); if (g) g.focus({ preventScroll: true }); }
    } else if (t.matches && t.matches('.bd-brand') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      var i = BRANDS.indexOf(t.getAttribute('data-v')), n = BRANDS[(i + (e.key === 'ArrowRight' ? 1 : -1) + BRANDS.length) % BRANDS.length];
      var nb = root().querySelector('[data-bd="brand"][data-v="' + n + '"]'); if (nb) nb.click();
    }
  }
  function mount() {
    var r = root(); if (!r) { chrome(); return; }
    chrome();
    if (r.getAttribute('data-bd-bound')) return;
    r.setAttribute('data-bd-bound', '1');
    r.addEventListener('click', onClick);
    r.addEventListener('keydown', onKey);
    r.addEventListener('pointerdown', function (e) { var g = e.target.closest('.bd-grip'); if (g && r.contains(g)) onGripDown(e, g); });
  }

  window.PLBoard = { html: html, mount: mount, chrome: chrome, brand: function () { return st.brand; }, brands: B };
})();
