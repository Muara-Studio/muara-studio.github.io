/* Providea Loyalty demo: shared core (state, rules, format, i18n, overlays, demo bar).
   Plain JS, no build step. All brands, people and numbers are fictional sample data. */
(function () {
  'use strict';
  var KEY = 'pl-demo-v3';
  var DAY = 864e5, HOUR = 36e5, MIN = 6e4;

  /* ── sample brands (all fictional). One brand is active in the three demo views (pl-brand); the site pages stay Kamtono.
     The demo state is shared: the same members and sales show for every brand. Stored texts use Kamtono's words
     ("Gratis topping", outlet "Cempaka", codes "KMT-", tier ids silver/gold/platinum = 1st/2nd/3rd tier) and T() maps them
     to the active brand: first the brand dictionary (exact Indonesian key), then the English table, then names. ── */
  var BR = {
    kamtono: {
      id: 'kamtono', name: 'Kamtono', cat: 'Froyo', outlet: 'Cempaka', domain: 'kamtono.providea.id', prefix: 'KMT', pdir: 'kamtono',
      icon: 'img/kamtono/icon.webp', meta: 'Froyo · 1 outlet', wm: 'img/kamtono/wordmark.svg', wmScale: 1, goal: 10, rewardValue: 32000,
      outlets: ['Cempaka'],
      tiers: [
        { id: 'silver', name: 'Cicip', min: 0, mult: 1, look: 'silver', mean: 'Cicip: baru mencoba' },
        { id: 'gold', name: 'Doyan', min: 1500000, mult: 1.25, look: 'gold', mean: 'Doyan: sudah suka, sering datang' },
        { id: 'platinum', name: 'Sultan', min: 4000000, mult: 1.5, look: 'platinum', mean: 'Sultan: pelanggan paling royal' }
      ],
      ben: { silver: ['Voucher ulang tahun Rp25.000', 'Kabar menu khusus member'], gold: ['Gratis topping saat naik tier', 'Voucher khusus Gold (Selasa Gold)', 'Voucher ulang tahun lebih besar'], platinum: ['Beli 1 gratis 1, sebulan sekali', 'Coba menu baru lebih dulu', 'Undangan acara tasting'] },
      cats: [['froyo', 'Froyo', 'ice-cream-2'], ['topping', 'Topping', 'sparkles'], ['minum', 'Minuman', 'cup']],
      menu: [
        { id: 'p1', cat: 'froyo', name: 'Froyo Original · cup kecil', price: 32000, cup: 1, img: 'froyo-original' },
        { id: 'p2', cat: 'froyo', name: 'Froyo Original · cup sedang', price: 42000, cup: 1, img: 'froyo-original' },
        { id: 'p3', cat: 'froyo', name: 'Froyo Original · cup besar', price: 55000, cup: 1, img: 'cup-besar-granola' },
        { id: 'p4', cat: 'froyo', name: 'Froyo Mangga Ketan', price: 48000, cup: 1, img: 'mangga-ketan' },
        { id: 'p5', cat: 'froyo', name: 'Froyo Stroberi Kemangi', price: 46000, cup: 1, img: 'stroberi-kemangi' },
        { id: 'p6', cat: 'froyo', name: 'Froyo Kopi Gula Aren', price: 46000, cup: 1, img: 'kopi-gula-aren' },
        { id: 't1', cat: 'topping', name: 'Topping buah segar', price: 8000 },
        { id: 't2', cat: 'topping', name: 'Topping granola madu', price: 8000 },
        { id: 't3', cat: 'topping', name: 'Topping mochi', price: 9000 },
        { id: 't4', cat: 'topping', name: 'Saus cokelat', price: 6000 },
        { id: 'd1', cat: 'minum', name: 'Smoothie yogurt', price: 38000, img: 'smoothie-yogurt' },
        { id: 'd2', cat: 'minum', name: 'Air mineral', price: 8000 }
      ],
      catalog: [8000, 20000, 42000],
      quick: [['Cup kecil', 32000], ['Cup sedang', 42000], ['Cup besar', 55000], ['+ Topping', 8000]], sale0: { amount: 47000, cups: 1 },
      dash: { total0: 2128, owed0: 19985, seg: { 'new': 400, active: 862, risk: 286, lapsed: 580, top: 214, gold: 256 }, avg: { 'new': 68000, active: 186000, risk: 142000, lapsed: 97000, top: 1940000 }, tiers: { gold: 231, platinum: 25 } },
      dict: {}
    },
    mendaya: {
      id: 'mendaya', name: 'Mendaya Ramen', cat: 'Ramen', outlet: 'Kelapa Gading', domain: 'mendaya.providea.id', prefix: 'MDY', pdir: 'mendaya',
      icon: 'img/brands/mendaya/icon.webp', meta: 'Ramen · 6 outlet', wmScale: 0.62, goal: 8, rewardValue: 62000, pos: 'kasir',
      outlets: ['Kelapa Gading', 'Menteng', 'Kemang Raya', 'Tebet', 'BSD', 'Gading Serpong'],
      tiers: [
        { id: 'silver', name: 'Kohai', min: 0, mult: 1, look: 'silver', mean: 'Kohai: adik kelas, pelanggan baru' },
        { id: 'gold', name: 'Senpai', min: 1000000, mult: 1.2, look: 'gold', mean: 'Senpai: kakak kelas, sudah akrab dengan kedai' },
        { id: 'platinum', name: 'Sensei', min: 3000000, mult: 1.35, look: 'copper', mean: 'Sensei: guru, paham setiap kuah' },
        { id: 'diamond', name: 'Taisho', min: 6000000, mult: 1.5, look: 'platinum', mean: 'Taisho: sebutan pemilik kedai ramen' }
      ],
      ben: { silver: ['Voucher ulang tahun Rp25.000', 'Kabar menu khusus member'], gold: ['Gratis telur ajitama saat naik tier', 'Voucher khusus Gold (Selasa Gold)', 'Voucher ulang tahun lebih besar'], platinum: ['Gyoza gratis, sebulan sekali', 'Coba menu baru lebih dulu'], diamond: ['Ramen gratis, sebulan sekali', 'Undangan acara tasting bersama chef', 'Kursi tanpa antre di jam ramai'] },
      cats: [['ramen', 'Ramen', 'bowl-chopsticks'], ['samping', 'Nasi dan gyoza', 'bowl-chopsticks'], ['topping', 'Topping', 'sparkles'], ['minum', 'Minuman', 'cup']],
      menu: [
        { id: 'p1', cat: 'ramen', name: 'Tonkotsu Ramen', price: 68000, cup: 1, img: 'tonkotsu' },
        { id: 'p2', cat: 'ramen', name: 'Shoyu Ramen', price: 62000, cup: 1, img: 'shoyu' },
        { id: 'p3', cat: 'ramen', name: 'Miso Pedas', price: 70000, cup: 1, img: 'miso-pedas' },
        { id: 'p4', cat: 'ramen', name: 'Tantanmen', price: 72000, cup: 1, img: 'tantanmen' },
        { id: 'p5', cat: 'samping', name: 'Chashu Don', price: 55000, cup: 1, img: 'chashu-don' },
        { id: 'p6', cat: 'samping', name: 'Gyoza 6 pcs', price: 38000, img: 'gyoza' },
        { id: 't1', cat: 'topping', name: 'Telur ajitama', price: 8000 },
        { id: 't2', cat: 'topping', name: 'Chashu tambahan', price: 15000 },
        { id: 't3', cat: 'topping', name: 'Nori', price: 5000 },
        { id: 't4', cat: 'topping', name: 'Ekstra mi', price: 12000 },
        { id: 'd1', cat: 'minum', name: 'Ocha dingin', price: 12000 },
        { id: 'd2', cat: 'minum', name: 'Calpico', price: 18000 }
      ],
      catalog: [8000, 20000, 62000],
      quick: [['Shoyu Ramen', 62000], ['Tonkotsu Ramen', 68000], ['Tantanmen', 72000], ['+ Gyoza', 38000]], sale0: { amount: 106000, cups: 1 },
      dash: { total0: 9788, owed0: 141300, seg: { 'new': 1250, active: 4120, risk: 1640, lapsed: 2790, top: 980, gold: 2900 }, avg: { 'new': 165000, active: 452000, risk: 341000, lapsed: 233000, top: 4650000 }, tiers: { gold: 1980, platinum: 720, diamond: 200 } },
      dict: {
        'Gratis topping': 'Gratis telur ajitama', 'Cup sedang gratis': 'Shoyu Ramen gratis', 'Cup kecil gratis': 'Mangkuk gratis', 'Diskon 20% cup besar': 'Diskon 20% ramen',
        'Kumpulkan 10 stempel, dapat cup kecil gratis': 'Kumpulkan 8 stempel, dapat 1 mangkuk gratis', 'Gratis topping untuk member baru': 'Gratis telur ajitama untuk member baru',
        '{n} cup lagi, dapat cup kecil gratis.': '{n} mangkuk lagi, dapat 1 mangkuk gratis.', '{n} cup lagi, cup kecil gratis': '{n} mangkuk lagi, 1 mangkuk gratis',
        'Kartu stempel penuh. Voucher cup kecil gratis dibuat otomatis.': 'Kartu stempel penuh. Voucher mangkuk gratis dibuat otomatis.',
        'Voucher cup kecil gratis sudah masuk ke halaman member.': 'Voucher mangkuk gratis sudah masuk ke halaman member.',
        'Jumlah cup froyo': 'Jumlah mangkuk', '1 cup = 1 stempel': '1 mangkuk = 1 stempel', '1 cup = 1 stempel.': '1 mangkuk = 1 stempel.',
        'Poin untuk tier, stempel untuk cup.': 'Poin untuk tier, stempel untuk mangkuk.', 'stempel = cup kecil gratis': 'stempel = 1 mangkuk gratis',
        'Setiap cup menambah satu stempel. Stempel ke-10 menjadi voucher cup kecil gratis.': 'Setiap mangkuk menambah satu stempel. Stempel ke-8 menjadi voucher mangkuk gratis.',
        'Hadiah sambutan sudah ada di Voucher: gratis topping. Tunjukkan QR ke kasir setiap belanja.': 'Hadiah sambutan sudah ada di Voucher: gratis telur ajitama. Tunjukkan QR ke kasir setiap makan.',
        'Kamu member Silver. Voucher gratis topping sudah ada di halaman member.': 'Kamu member Silver. Voucher gratis telur ajitama sudah ada di halaman member.',
        'Halo {nama}, sudah lama tidak mampir ke Kamtono. Ada gratis topping untukmu sampai akhir bulan. Tunjukkan voucher di kasir, ya.': 'Halo {nama}, sudah lama tidak mampir ke Kamtono. Ada gratis telur ajitama untukmu sampai akhir bulan. Tunjukkan voucher di kasir, ya.',
        'Akhir pekan · gratis topping': 'Akhir pekan · gratis telur ajitama', 'Poinmu cukup untuk cup sedang gratis': 'Poinmu cukup untuk Shoyu Ramen gratis',
        'Kamu punya 186 poin. Tukar 80 poin jadi cup sedang gratis di menu Voucher.': 'Kamu punya 186 poin. Tukar 80 poin jadi Shoyu Ramen gratis di menu Voucher.',
        'Selasa Gold: diskon 20% cup besar': 'Selasa Gold: diskon 20% ramen',
        'Khusus member Gold dan Platinum. Tunjukkan voucher di kasir setiap Selasa sampai akhir bulan.': 'Khusus member Gold ke atas. Tunjukkan voucher di kasir setiap Selasa sampai akhir bulan.',
        'Menu baru: Froyo Mangga Ketan': 'Menu baru: Tantanmen', 'Sudah ada di Outlet Cempaka. Member Gold dapat topping gratis untuk menu baru minggu ini.': 'Sudah ada di Outlet Cempaka. Member Gold dapat telur ajitama gratis untuk menu baru minggu ini.',
        'Mulai sekarang poinmu 1,25×. Hadiah naik tier: gratis topping, sudah ada di Voucher.': 'Mulai sekarang poinmu 1,2×. Hadiah naik tier: gratis telur ajitama, sudah ada di Voucher.',
        'Menu baru Mangga Ketan': 'Menu baru Tantanmen', 'Hadiah sambutan · gratis topping': 'Hadiah sambutan · gratis telur ajitama', 'Hadiah naik Gold · gratis topping': 'Hadiah naik Gold · gratis telur ajitama',
        'Selasa Gold · diskon 20% cup besar': 'Selasa Gold · diskon 20% ramen', 'Kartu stempel penuh · cup kecil gratis': 'Kartu stempel penuh · mangkuk gratis',
        'Tukar 15 poin · gratis topping': 'Tukar 15 poin · gratis telur ajitama', 'Tukar 80 poin · cup sedang gratis': 'Tukar 80 poin · Shoyu Ramen gratis', '10 stempel': '8 stempel',
        'Gold dan Platinum': 'Gold ke atas', 'Froyo · Outlet Cempaka': 'Ramen · Outlet Cempaka',
        'Bilah ini menunjukkan sisa belanja sampai tier berikutnya. Gold mendapat poin 1,25×, Platinum 1,5×.': 'Bilah ini menunjukkan sisa belanja sampai tier berikutnya. Senpai mendapat poin 1,2×, Sensei 1,35×, Taisho 1,5×.'
      }
    },
    bobs: {
      id: 'bobs', name: 'Bobs', cat: 'Boba milk tea', outlet: 'Kemang', domain: 'bobs.providea.id', prefix: 'BOB', pdir: 'bobs',
      icon: 'img/brands/bobs/icon.webp', meta: 'Boba · 18 outlet', wm: 'img/brands/bobs/logo.webp', wmScale: 1.06, goal: 10, rewardValue: 22000, noHeadIcon: true, pos: 'pos',
      outlets: ['Kemang', 'Tebet', 'Bintaro', 'Margonda', 'Kelapa Gading', 'Alam Sutera', 'Cibubur', 'Rawamangun', 'Pluit', 'Grogol', 'Cikini', 'Pondok Indah', 'BSD', 'Gading Serpong', 'Sunter', 'Cempaka Putih', 'Pasar Minggu', 'Cinere'],
      tiers: [
        { id: 'silver', name: 'Pearl', min: 0, mult: 1, look: 'silver' },
        { id: 'gold', name: 'Gold Pearl', min: 750000, mult: 1.25, look: 'gold' },
        { id: 'platinum', name: 'Black Pearl', min: 2000000, mult: 1.5, look: 'platinum' }
      ],
      ben: { silver: ['Voucher ulang tahun Rp25.000', 'Kabar menu khusus member'], gold: ['Gratis topping boba saat naik tier', 'Voucher khusus Gold (Selasa Gold)', 'Voucher ulang tahun lebih besar'], platinum: ['Beli 1 gratis 1, sebulan sekali', 'Coba menu baru lebih dulu', 'Upsize gratis setiap hari'] },
      cats: [['boba', 'Milk tea', 'cup'], ['topping', 'Topping', 'sparkles'], ['minum', 'Lainnya', 'cup']],
      menu: [
        { id: 'p1', cat: 'boba', name: 'Brown Sugar Boba Milk', price: 28000, cup: 1, img: 'brown-sugar-boba' },
        { id: 'p2', cat: 'boba', name: 'Klasik Milk Tea', price: 22000, cup: 1, img: 'klasik-milk-tea' },
        { id: 'p3', cat: 'boba', name: 'Thai Tea Boba', price: 24000, cup: 1, img: 'thai-tea-boba' },
        { id: 'p4', cat: 'boba', name: 'Matcha Latte Boba', price: 29000, cup: 1, img: 'matcha-latte-boba' },
        { id: 'p5', cat: 'boba', name: 'Taro Milk Tea', price: 25000, cup: 1, img: 'taro-milk-tea' },
        { id: 'p6', cat: 'boba', name: 'Cheese Foam Oolong', price: 30000, cup: 1, img: 'cheese-foam-oolong' },
        { id: 't1', cat: 'topping', name: 'Boba ekstra', price: 5000 },
        { id: 't2', cat: 'topping', name: 'Pudding', price: 6000 },
        { id: 't3', cat: 'topping', name: 'Cheese foam', price: 8000 },
        { id: 't4', cat: 'topping', name: 'Grass jelly', price: 5000 },
        { id: 'd1', cat: 'minum', name: 'Upsize ke large', price: 6000 },
        { id: 'd2', cat: 'minum', name: 'Air mineral', price: 6000 }
      ],
      catalog: [5000, 20000, 28000],
      quick: [['Klasik Milk Tea', 22000], ['Brown Sugar Boba', 28000], ['Cheese Foam Oolong', 30000], ['+ Topping boba', 5000]], sale0: { amount: 50000, cups: 2 },
      dash: { total0: 26388, owed0: 295100, seg: { 'new': 4320, active: 15800, risk: 3300, lapsed: 2980, top: 2640, gold: 4100 }, avg: { 'new': 54000, active: 152000, risk: 112000, lapsed: 76000, top: 1520000 }, tiers: { gold: 3640, platinum: 460 } },
      dict: {
        'Gratis topping': 'Gratis topping boba', 'Cup sedang gratis': 'Gratis 1 boba large', 'Cup kecil gratis': 'Gratis 1 boba', 'Diskon 20% cup besar': 'Diskon 20% ukuran large',
        'Kumpulkan 10 stempel, dapat cup kecil gratis': 'Kumpulkan 10 stempel, dapat 1 boba gratis', 'Gratis topping untuk member baru': 'Gratis topping boba untuk member baru',
        '{n} cup lagi, dapat cup kecil gratis.': '{n} cup lagi, dapat 1 boba gratis.', '{n} cup lagi, cup kecil gratis': '{n} cup lagi, 1 boba gratis',
        'Kartu stempel penuh. Voucher cup kecil gratis dibuat otomatis.': 'Kartu stempel penuh. Voucher 1 boba gratis dibuat otomatis.',
        'Voucher cup kecil gratis sudah masuk ke halaman member.': 'Voucher 1 boba gratis sudah masuk ke halaman member.',
        'Jumlah cup froyo': 'Jumlah cup minuman', 'stempel = cup kecil gratis': 'stempel = 1 boba gratis',
        'Setiap cup menambah satu stempel. Stempel ke-10 menjadi voucher cup kecil gratis.': 'Setiap cup menambah satu stempel. Stempel ke-10 menjadi voucher 1 boba gratis.',
        'Hadiah sambutan sudah ada di Voucher: gratis topping. Tunjukkan QR ke kasir setiap belanja.': 'Hadiah sambutan sudah ada di Voucher: gratis topping boba. Tunjukkan QR ke kasir setiap belanja.',
        'Kamu member Silver. Voucher gratis topping sudah ada di halaman member.': 'Kamu member Silver. Voucher gratis topping boba sudah ada di halaman member.',
        'Halo {nama}, sudah lama tidak mampir ke Kamtono. Ada gratis topping untukmu sampai akhir bulan. Tunjukkan voucher di kasir, ya.': 'Halo {nama}, sudah lama tidak mampir ke Kamtono. Ada gratis topping boba untukmu sampai akhir bulan. Tunjukkan voucher di kasir, ya.',
        'Akhir pekan · gratis topping': 'Akhir pekan · gratis topping boba', 'Poinmu cukup untuk cup sedang gratis': 'Poinmu cukup untuk 1 boba large gratis',
        'Kamu punya 186 poin. Tukar 80 poin jadi cup sedang gratis di menu Voucher.': 'Kamu punya 186 poin. Tukar 80 poin jadi 1 boba large gratis di menu Voucher.',
        'Selasa Gold: diskon 20% cup besar': 'Selasa Gold: diskon 20% ukuran large',
        'Menu baru: Froyo Mangga Ketan': 'Menu baru: Matcha Latte Boba', 'Sudah ada di Outlet Cempaka. Member Gold dapat topping gratis untuk menu baru minggu ini.': 'Sudah ada di Outlet Cempaka. Member Gold dapat topping boba gratis untuk menu baru minggu ini.',
        'Mulai sekarang poinmu 1,25×. Hadiah naik tier: gratis topping, sudah ada di Voucher.': 'Mulai sekarang poinmu 1,25×. Hadiah naik tier: gratis topping boba, sudah ada di Voucher.',
        'Menu baru Mangga Ketan': 'Matcha Latte Boba baru', 'Hadiah sambutan · gratis topping': 'Hadiah sambutan · gratis topping boba', 'Hadiah naik Gold · gratis topping': 'Hadiah naik Gold · gratis topping boba',
        'Selasa Gold · diskon 20% cup besar': 'Selasa Gold · diskon 20% ukuran large', 'Kartu stempel penuh · cup kecil gratis': 'Kartu stempel penuh · 1 boba gratis',
        'Tukar 15 poin · gratis topping': 'Tukar 15 poin · gratis topping boba', 'Tukar 80 poin · cup sedang gratis': 'Tukar 80 poin · 1 boba large gratis',
        'Froyo · Outlet Cempaka': 'Boba milk tea · Outlet Cempaka'
      }
    }
  };
  var BRAND_IDS = ['kamtono', 'mendaya', 'bobs'];
  function readBrand() {
    var b = null;
    try {
      b = localStorage.getItem('pl-brand');
      if (!BR[b]) { var o = JSON.parse(localStorage.getItem('pl-board') || 'null'); if (o && BR[o.brand]) { b = o.brand; localStorage.setItem('pl-brand', b); } }
    } catch (e) {}
    return BR[b] ? b : 'kamtono';
  }
  var BRAND_K = readBrand(), DEMO = false;
  /* the brand the current page shows: the chosen one in the demo views, Kamtono on the site pages */
  function db() { return DEMO ? BRAND_K : 'kamtono'; }
  function B() { return BR[db()]; }

  /* ── i18n: Indonesian strings are the keys; window.EN holds English ── */
  var LANG = 'id';
  try { LANG = localStorage.getItem('pl-lang') === 'en' ? 'en' : 'id'; } catch (e) {}
  var HAS = Object.prototype.hasOwnProperty, LEGACY_TIER = { Silver: 0, Gold: 1, Platinum: 2 };
  /* the demo views speak for the active brand: brand dictionary, then English, then brand names, outlet, code prefix and tier names */
  function brandify(r) {
    var b = BR[BRAND_K];
    if (BRAND_K !== 'kamtono') r = r.replace(/Kamtono/g, b.name).replace(/Cempaka/g, b.outlet).replace(/KMT-/g, b.prefix + '-');
    return r.replace(/\b(Silver|Gold|Platinum)\b/g, function (m) { var t = S && S.rules && S.rules.tiers[LEGACY_TIER[m]]; return t ? t.name : m; });
  }
  var MISS = window.__plMiss = {};
  function T(s, v) {
    var k = s;
    if (DEMO && typeof k === 'string' && HAS.call(BR[BRAND_K].dict, k)) k = BR[BRAND_K].dict[k];
    var r = k;
    if (LANG === 'en' && window.EN) { if (window.EN[k]) r = window.EN[k]; else if (DEMO && typeof k === 'string' && /[a-z]{3}/i.test(k)) MISS[k] = 1; }
    if (DEMO && typeof r === 'string') r = brandify(r);
    if (v) r = r.replace(/\{(\w+)\}/g, function (m, k2) { return v[k2] != null ? v[k2] : m; });
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
  function code(prefix) { var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return 'KMT-' + prefix + '-' + s.slice(0, 3) + s.slice(3); }  /* stored codes keep KMT-; vcode() shows the brand prefix */

  /* ── rules + seed ── */
  /* rules per brand (stamp goal and tiers differ). S.R holds them; S.rules is the active brand's set. */
  function rules0(b) {
    var x = BR[b || db()];
    return {
      type: 'both', earnPer: 10000, pointValue: 500, payMode: 'voucher', capSale: 50, capDay: 100, expiry: 12, period: 'rolling',
      stampGoal: x.goal, stampReward: 'Cup kecil gratis', bday: 25000,
      tiers: x.tiers.map(function (t) { return { id: t.id, name: t.name, min: t.min, mult: t.mult }; })
    };
  }
  function rulesAll() { var o = {}; BRAND_IDS.forEach(function (b) { o[b] = rules0(b); }); return o; }
  /* S.rules reads and writes the active brand's rules; it is not saved itself (S.R is) */
  function bindRules(s) {
    Object.defineProperty(s, 'rules', { configurable: true, enumerable: false, get: function () { return s.R[db()] || s.R.kamtono; }, set: function (v) { s.R[db()] = v; } });
    return s;
  }
  var CATALOG0 = [
    { id: 'c1', title: 'Gratis topping', pts: 15, kind: 'free' },
    { id: 'c2', title: 'Potongan Rp20.000', pts: 40, kind: 'rp' },
    { id: 'c3', title: 'Cup sedang gratis', pts: 80, kind: 'free' }
  ];
  function catalog() { var v = B().catalog; return CATALOG0.map(function (c, i) { return { id: c.id, title: c.title, pts: c.pts, kind: c.kind, value: v[i] }; }); }

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
      { id: 'v-r1', memberId: 'm-rina', title: 'Gratis topping', src: 'Hadiah naik Gold', code: 'KMT-GT7-Q4M', exp: now + 42 * DAY, kind: 'free', value: 8000 },
      { id: 'v-r2', memberId: 'm-rina', title: 'Diskon 20% cup besar', src: 'Selasa Gold', code: 'KMT-SG2-K8P', exp: now + 12 * DAY, tier: 'gold', kind: 'pct', value: 20 },
      { id: 'v-r0', memberId: 'm-rina', title: 'Gratis topping', src: 'Hadiah sambutan', code: 'KMT-WL8-H2D', exp: now - 40 * DAY, kind: 'free', value: 8000, used: { at: now - 136 * DAY, by: 'Ayu', outlet: 'Cempaka' } },
      { id: 'v-b1', memberId: 'm-bagus', title: 'Beli 1 gratis 1', src: 'Platinum bulanan', code: 'KMT-PB1-7RX', exp: now + 11 * DAY, tier: 'platinum', kind: 'free', value: 42000 },
      { id: 'v-p1', memberId: 'm-putri', title: 'Gratis topping', src: 'Hadiah sambutan', code: 'KMT-WL3-N6T', exp: now + 25 * DAY, kind: 'free', value: 8000 },
      { id: 'v-k1', memberId: 'm-kevin', title: 'Diskon 20% cup besar', src: 'Selasa Gold', code: 'KMT-SG5-W2C', exp: now + 12 * DAY, tier: 'gold', kind: 'pct', value: 20 }
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
      { id: 'k4', name: 'Kangen Kamtono', seg: 'risk', ch: ['wa'], at: now - 16 * DAY, sent: 286, read: 233, used: 41, cost: 167690, status: 'sent' }
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
    return bindRules({ v: 2, rv: 2, R: rulesAll(), members: members, log: log, vouchers: vouchers, inbox: inbox, campaigns: campaigns, vtpl: vtpl, staff: staff, audit: audit, checkins: [], me: 'm-rina', receiptNo: 1290 });
  }

  var S;
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.v === 2) {
        /* older saves kept one rules set (Kamtono, tiers Silver/Gold/Platinum): keep it as Kamtono's, give the tiers Kamtono's names */
        if (!s.R) { s.R = rulesAll(); if (s.rules) s.R.kamtono = s.rules; }
        delete s.rules;
        BRAND_IDS.forEach(function (b) { if (!s.R[b]) s.R[b] = rules0(b); });
        if (s.rv !== 2) { BRAND_IDS.forEach(function (b) { s.R[b].tiers.forEach(function (t, i) { if (LEGACY_TIER[t.name] === i && BR[b].tiers[i]) t.name = BR[b].tiers[i].name; }); }); s.rv = 2; }
        return bindRules(s);
      }
    } catch (e) {}
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
  function tierById(id) { var ts = S.rules.tiers; return ts.filter(function (t) { return t.id === id; })[0] || (id === 'diamond' ? ts[ts.length - 1] : undefined); }
  function tierOf(m) {
    if (m.override) { var o = tierById(m.override); if (o) return o; }
    var t = S.rules.tiers[0];
    S.rules.tiers.forEach(function (x) { if (m.spend >= x.min) t = x; });
    return t;
  }
  /* tier ids are ranks: silver = 1st tier, gold = 2nd, platinum = 3rd, diamond = 4th (Mendaya). Names, colour and meaning come from the brand. */
  function tierDef(t) { var d = B().tiers.filter(function (x) { return x.id === (t && t.id); })[0]; return d || {}; }
  function tierLook(t) { return tierDef(t).look || (t && t.id) || 'silver'; }
  function tierMean(t) { var m = tierDef(t).mean; return m ? T(m) : ''; }
  /* a stored tier (id, or a name saved by an older version or another brand) shown with the active brand's name */
  function tn(x) {
    if (x == null || x === '') return '';
    var t = tierById(x); if (t) return t.name;
    var i = LEGACY_TIER[x];
    if (i == null) BRAND_IDS.forEach(function (b) { BR[b].tiers.forEach(function (d, j) { if (d.name === x) i = j; }); });
    t = i != null ? S.rules.tiers[Math.min(i, S.rules.tiers.length - 1)] : null;
    return t ? t.name : x;
  }
  /* benefits per tier, for the member page and the tier screen */
  function benefits(t) {
    var i = S.rules.tiers.indexOf(t), list = (B().ben[t.id] || []).map(function (b) { return T(b); });
    return [i <= 0 ? T('1 poin tiap Rp10.000') : T('Poin {x}×', { x: dec(t.mult) })].concat(list);
  }
  /* outlet and voucher code as stored (Kamtono words) → the active brand */
  function ol(name) { return name === 'Cempaka' ? B().outlet : name; }
  function vcode(c) { return String(c || '').replace(/^KMT-/, B().prefix + '-'); }
  function vcodeIn(c) { return String(c || '').trim().toUpperCase().replace(/^(MDY|BOB)-/, 'KMT-'); }
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
      reward = { id: uid('v-'), memberId: m.id, title: 'Cup kecil gratis', src: 'Kartu stempel penuh', code: code('ST' + Math.floor(Math.random() * 9)), exp: Date.now() + 60 * DAY, kind: 'free', value: B().rewardValue };
      S.vouchers.unshift(reward);
    }
    var item = { id: uid('l'), kind: 'sale', memberId: m.id, at: Date.now(), amount: amount, points: pts, stamps: stamps, receipt: opts.receipt ? bumpReceipt(opts.receipt) : nextReceipt(), by: opts.by || 'Ayu', outlet: 'Cempaka', channel: opts.channel || 'kasir', paidPoints: opts.paidPoints || 0 };
    S.log.unshift(item);
    var after = tierOf(m), tierUp = after !== before && S.rules.tiers.indexOf(after) > S.rules.tiers.indexOf(before);
    if (tierUp) {
      S.log.unshift({ id: uid('l'), kind: 'tier', memberId: m.id, at: Date.now() + 1, title: after.id, by: 'Sistem' });
      S.inbox.unshift({ id: uid('i'), memberId: m.id, ch: 'wa', title: 'Selamat, kamu naik ke {t}', body: 'Mulai sekarang poinmu {x}×. Kartu di Wallet ikut berubah.', v: { t: after.id, x: dec(after.mult) }, at: Date.now(), read: false });
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
  var MARK = 'M20.63 8H56.42C72.7 8 85.89 21.2 85.89 37.47V41.68C85.89 57.96 72.7 71.16 56.42 71.16H44.84C40.77 71.16 37.47 74.46 37.47 78.53V84.84C37.47 86.59 36.06 88 34.32 88H13.26C11.74 88 10.46 86.92 10.17 85.48C10.87 72.04 17.23 61.44 29.66 53.84C24.22 56.03 17.59 57.31 10.11 58.13V18.53C10.11 12.71 14.82 8 20.63 8ZM59.91 26.62Q48 36.38 36.09 26.62Q45.86 38.53 36.09 50.44Q48 40.67 59.91 50.44Q50.14 38.53 59.91 26.62ZM36.09 50.44C33.79 51.49 31.65 52.63 29.66 53.84C32.04 52.89 34.19 51.77 36.09 50.44ZM21.5 31Q19 33.05 16.5 31Q18.55 33.5 16.5 36Q19 33.95 21.5 36Q19.45 33.5 21.5 31ZM22.4 40.1Q19 42.89 15.6 40.1Q18.39 43.5 15.6 46.9Q19 44.11 22.4 46.9Q19.61 43.5 22.4 40.1ZM31 41Q28.5 43.05 26 41Q28.05 43.5 26 46Q28.5 43.95 31 46Q28.95 43.5 31 41Z'; /* Providea P and star with three small stars set as an L at bottom left: Providea Loyalty (Influence has a thin ring) */
  function mark(s) { return '<svg width="' + (s || 24) + '" height="' + (s || 24) + '" viewBox="8 6 80 84" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="' + MARK + '"/></svg>'; }
  function tierTag(t, sm) { var mn = tierMean(t); return '<span class="tier tier-' + tierLook(t) + (sm ? ' tier-sm' : '') + '"' + (mn ? ' title="' + esc(mn) + '"' : '') + '>' + ic('crown', sm ? 12 : 13) + esc(t.name) + '</span>'; }
  function avatar(m, s, cls) { return '<span class="avatar avatar-brand ' + (cls || '') + '" style="width:' + s + 'px;height:' + s + 'px;font-size:' + Math.round(s * 0.38) + 'px">' + esc(initials(m.name)) + '</span>'; }
  var SEG = { 'new': ['Baru', 'info'], active: ['Aktif', 'success'], risk: ['Berisiko', 'warning'], lapsed: ['Hilang', 'danger'] };
  function segTag(s) { return '<span class="tag tag-' + SEG[s][1] + ' tag-sm">' + T(SEG[s][0]) + '</span>'; }
  /* sample brand marks: square icon, wordmark and the stamp glyph of the active brand (Kamtono on the site pages) */
  function sjLogo(s) { return '<span class="sj-logo" style="--s:' + (s || 28) + 'px"><img src="' + B().icon + '" alt="" decoding="async"></span>'; }
  /* tone: 'dark' on a dark card, 'light' on a light surface, empty = follows the theme (Mendaya has an ink and a cream wordmark) */
  function wordmark(h, tone) {
    var b = B(), hh = Math.round((h || 28) * b.wmScale);
    if (b.id === 'mendaya') {
      var ink = '<img class="sj-wm wm-ink" src="img/brands/mendaya/word-ink.webp" alt="Mendaya Ramen" style="height:' + hh + 'px" decoding="async">', cream = '<img class="sj-wm wm-cream" src="img/brands/mendaya/word-cream.webp" alt="Mendaya Ramen" style="height:' + hh + 'px" decoding="async">';
      return tone === 'dark' ? cream : tone === 'light' ? ink : '<span class="sj-wm-auto">' + ink + cream + '</span>';
    }
    return '<img class="sj-wm" src="' + b.wm + '" alt="' + esc(b.name) + '" style="height:' + hh + 'px" decoding="async">';
  }
  var cupN = 0;
  function cup(s) {
    var id = 'kc' + (++cupN), b = db(), o = '<svg class="cup" width="' + s + '" height="' + s + '" viewBox="0 0 48 48" fill="currentColor" aria-hidden="true">';
    if (b === 'mendaya') return o + '<defs><mask id="' + id + '"><rect width="48" height="48" fill="#fff"/><path d="M11 28q3-2.6 6 0t6 0t6 0t6 0t6 0" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/></mask></defs><g stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"><path d="M31 5L19 20"/><path d="M37 7L24 21"/></g><g mask="url(#' + id + ')"><path d="M7 23H41C41 32.5 33.4 40 24 40S7 32.5 7 23Z"/></g><rect x="17.5" y="40" width="13" height="3.6" rx="1.8"/></svg>';
    if (b === 'bobs') return o + '<defs><mask id="' + id + '"><rect width="48" height="48" fill="#fff"/><g fill="#000"><circle cx="19" cy="37" r="2.1"/><circle cx="24" cy="38" r="2.1"/><circle cx="29" cy="37" r="2.1"/><circle cx="21.5" cy="32.6" r="2.1"/><circle cx="26.5" cy="32.6" r="2.1"/></g></mask></defs><path d="M27 3L24 15" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><rect x="10" y="12" width="28" height="5" rx="2.5"/><path mask="url(#' + id + ')" d="M12.5 19H35.5L33 41.6C32.8 43.5 31.2 45 29.3 45H18.7C16.8 45 15.2 43.5 15 41.6Z"/></svg>';
    return o + '<defs><mask id="' + id + '"><rect width="48" height="48" fill="#fff"/><g fill="none" stroke="#000" stroke-width="2.1" stroke-linecap="round"><path d="M39.6 23.4C31 21.6 20.4 23 14.2 27.6"/><path d="M35.4 16.4C28.6 15.2 21.8 16.8 17.6 20.4"/><path d="M31.8 10.8C28.2 10.2 25 11.2 22.6 13.2"/><path d="M13.4 36.9H31.2C33.6 36.9 34.2 38.2 33.4 40.4"/></g></mask></defs><g mask="url(#' + id + ')"><path d="M9 29.2C9 24.4 12.4 21.4 16.4 20.4C15.4 15.8 19.2 12.2 23.4 11.8C22.8 8.6 24.8 5.4 28.6 4.4C27.2 6.6 27.6 9 29.6 10.2C33.2 11.4 34.8 14.4 33.8 17.6C37.8 18.8 39.8 22.2 39.2 25.8L38.6 29.2Z"/><rect x="6.5" y="30.2" width="35" height="3.8" rx="1.9"/><path d="M9 34H39C38.6 40.4 33.8 44.6 27.6 44.6H20.4C14.2 44.6 9.4 40.4 9 34Z"/></g></svg>';
  }
  /* product photo or an icon tile in the brand colour (POS) */
  function prodThumb(it, cls) {
    var b = B();
    if (it.img) return '<span class="pthumb ' + (cls || '') + '"><img src="img/products/' + b.pdir + '/' + it.img + '.webp" alt="" loading="lazy" decoding="async"></span>';
    var c = b.cats.filter(function (x) { return x[0] === it.cat; })[0];
    return '<span class="pthumb is-icon ' + (cls || '') + '">' + ic(c ? c[2] : 'cup', 24) + '</span>';
  }

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
  /* ID | EN segmented control: the active language is filled; a click on it does nothing */
  ACT.setLang = function (el) { if (el.getAttribute('data-v') !== LANG) ACT.lang(el); };
  function langSeg(cls) {
    return '<span class="lang-seg ' + (cls || '') + '" role="group" aria-label="' + T('Bahasa') + '">' + [['id', 'ID', 'Bahasa Indonesia'], ['en', 'EN', 'English']].map(function (l) {
      return '<button type="button" data-act="setLang" data-v="' + l[0] + '" aria-pressed="' + (LANG === l[0]) + '" lang="' + l[0] + '" title="' + l[2] + '"><span aria-hidden="true">' + l[1] + '</span><span class="sr-only">' + l[2] + '</span></button>';
    }).join('') + '</span>';
  }
  ACT.resetDemo = function () {
    var m = modal({ title: T('Ulang demo?'), desc: T('Semua klik di demo ini kembali ke data contoh awal. Data hanya tersimpan di browser ini.'), width: 440,
      foot: '<button class="btn btn-secondary" data-close>' + T('Batal') + '</button><button class="btn btn-primary" id="rsGo">' + ic('refresh', 18) + '<span class="btn-label">' + T('Ulang demo') + '</span></button>' });
    m.el.querySelector('#rsGo').onclick = function () { reset(); m.close(); location.reload(); };
  };

  /* demo bar: switcher between the three views */
  var VIEW = '';
  /* site pages (landing, case pages, demo sign-in): a product-site menu instead of the view switcher */
  var NAV = [
    { t: 'Produk', items: [['anggota.html#/home', 'device-mobile', 'Kartu member di HP', 'Daftar dan pakai tanpa unduh aplikasi'], ['kasir.html', 'device-tablet', 'Aplikasi kasir', 'Check-in, poin, dan voucher di kasir'], ['dashboard.html', 'layout-dashboard', 'Dashboard pemilik', 'Laporan, member, dan program'], ['dashboard.html#/kampanye/baru', 'speakerphone', 'Promo WhatsApp', 'Pesan ke segmen, biaya terlihat dulu']] },
    { t: 'Cara kerja', href: 'index.html#cara-kerja' },
    { t: 'Manfaat', href: 'index.html#manfaat' },
    { t: 'Kisah pelanggan', items: [['kisah.html?k=kamtono', 'ice-cream-2', 'Kamtono', 'Froyo · outlet pertama'], ['kisah.html?k=mendaya', 'bowl-chopsticks', 'Mendaya Ramen', 'Ramen · 6 outlet'], ['kisah.html?k=bobs', 'cup', 'Bobs', 'Boba milk tea · 18 outlet']] },
    { t: 'Harga', href: 'harga.html' },
    { t: 'FAQ', href: 'index.html#faq' }
  ];
  function siteBar(el) {
    el.classList.add('is-site');
    el.innerHTML = '<a class="logo" href="index.html" aria-label="Providea Loyalty"><span class="logo-mark">' + mark(24) + '</span><span class="logo-word">Providea Loyalty</span></a>' +
      '<nav class="snav" aria-label="' + T('Menu utama') + '">' + NAV.map(function (n, i) {
        if (!n.items) return '<a class="snav-a" href="' + n.href + '">' + T(n.t) + '</a>';
        return '<div class="snav-dd"><button type="button" class="snav-a" aria-expanded="false" data-dd="' + i + '">' + T(n.t) + ic('chevron-down', 14) + '</button><div class="snav-panel">' + n.items.map(function (x) {
          return '<a class="snav-item" href="' + x[0] + '">' + ic(x[1], 20) + '<span><b>' + T(x[2]) + '</b><small>' + T(x[3]) + '</small></span></a>'; }).join('') + '</div></div>';
      }).join('') + '</nav>' +
      '<div class="demobar-actions">' + langSeg('lang-site') +
      '<button type="button" class="icon-btn" data-act="theme" aria-label="' + T('Ganti tema') + '" title="' + T('Ganti tema') + '">' + ic(theme() === 'dark' ? 'sun' : 'moon', 18) + '</button>' +
      '<a class="btn btn-secondary btn-sm snav-login" href="masuk.html">' + T('Masuk') + '</a><a class="btn btn-primary btn-sm" href="masuk.html#demo">' + T('Coba demo') + '</a>' +
      '<button type="button" class="icon-btn snav-burger" aria-label="' + T('Buka menu') + '" aria-expanded="false" data-burger>' + ic('menu-2', 20) + '</button></div>' +
      '<div class="snav-sheet" hidden>' + NAV.map(function (n) {
        return n.items ? '<p class="snav-sh">' + T(n.t) + '</p>' + n.items.map(function (x) { return '<a href="' + x[0] + '">' + ic(x[1], 18) + T(x[2]) + '</a>'; }).join('') : '<a href="' + n.href + '">' + T(n.t) + '</a>';
      }).join('') + '<div class="snav-lang"><span>' + T('Bahasa') + '</span>' + langSeg() + '</div><a class="btn btn-primary" href="masuk.html#demo">' + T('Coba demo') + '</a></div>';
    if (!el.dataset.wired) {
      el.dataset.wired = '1';
      el.addEventListener('click', function (e) {
        var dd = e.target.closest('[data-dd]'), bg = e.target.closest('[data-burger]');
        el.querySelectorAll('.snav-dd').forEach(function (d) { var b = d.querySelector('[data-dd]'); var open = dd === b ? b.getAttribute('aria-expanded') !== 'true' : false; b.setAttribute('aria-expanded', open); d.classList.toggle('is-open', open); });
        if (bg) { var sh = el.querySelector('.snav-sheet'), o = sh.hidden; sh.hidden = !o; bg.setAttribute('aria-expanded', o); }
        if (e.target.closest('.snav-sheet a, .snav-item')) { var s2 = el.querySelector('.snav-sheet'); if (s2) s2.hidden = true; }
        if (e.target.closest('[data-act=setLang]') && el.querySelector('.snav-sheet') && !el.querySelector('.snav-sheet').hidden) setTimeout(function () { var s3 = el.querySelector('.snav-sheet'), b3 = el.querySelector('[data-burger]'); if (s3) { s3.hidden = false; b3 && b3.setAttribute('aria-expanded', 'true'); } }, 0);
      });
      document.addEventListener('click', function (e) { if (!el.contains(e.target)) el.querySelectorAll('.snav-dd.is-open').forEach(function (d) { d.classList.remove('is-open'); d.querySelector('[data-dd]').setAttribute('aria-expanded', 'false'); }); });
    }
  }
  /* footer for the site pages (same build as the Providea Influence footer) */
  function footer() {
    var col = function (h, links) { return '<div class="sfoot-col"><h3>' + T(h) + '</h3>' + links.map(function (l) { return '<a href="' + l[1] + '"' + (l[2] ? ' target="_blank" rel="noopener"' : '') + '>' + (l[3] ? ic(l[3], 16) : '') + T(l[0]) + '</a>'; }).join('') + '</div>'; };
    return '<footer class="sfoot"><div class="sfoot-grid"><div class="sfoot-brand"><a class="logo" href="index.html"><span class="logo-mark">' + mark(22) + '</span><span class="logo-word">Providea Loyalty</span></a>' +
      '<p>' + T('Kartu member, poin, dan voucher tanpa aplikasi untuk merek dengan 1 sampai 20 outlet.') + '</p></div>' +
      col('Produk', [['Kartu member di HP', 'anggota.html#/home'], ['Aplikasi kasir', 'kasir.html'], ['Dashboard pemilik', 'dashboard.html'], ['Cara kerja', 'index.html#cara-kerja'], ['Harga', 'harga.html']]) +
      col('Kisah pelanggan', [['Kamtono', 'kisah.html?k=kamtono'], ['Mendaya Ramen', 'kisah.html?k=mendaya'], ['Bobs', 'kisah.html?k=bobs']]) +
      col('Providea', [['Tentang Providea', '../'], ['Providea Influence', '../influence/'], ['Hubungi kami', 'mailto:hello@providea.com', false, 'mail'], ['Coba demo', 'masuk.html#demo']]) +
      '</div><div class="sfoot-bottom"><span>© 2026 Providea</span><span>' + T('Providea Loyalty · demo produk. Merek, orang, dan angka di demo ini fiktif. Gambar kafe adalah ilustrasi.') + '</span></div></footer>';
  }
  function renderBar() {
    var el = document.getElementById('demobar'); if (!el) return;
    if (VIEW === 'hub' || VIEW === 'site') { siteBar(el); return; }
    el.classList.remove('is-site');
    var tabs = [['anggota.html', 'device-mobile', 'HP member', 'member'], ['kasir.html', 'device-tablet', 'Kasir', 'kasir'], ['dashboard.html', 'layout-dashboard', 'Dashboard', 'dash']];
    el.innerHTML = '<a class="logo" href="./" aria-label="Providea Loyalty">' + '<span class="logo-mark">' + mark(24) + '</span><span class="logo-word">Providea Loyalty</span></a>' +
      '<nav class="tabs-segmented tabs-sm demo-switch" aria-label="' + T('Pilih tampilan') + '">' + tabs.map(function (t) {
        return '<a class="tab' + (VIEW === t[3] ? ' is-active' : '') + '" href="' + t[0] + '"' + (VIEW === t[3] ? ' aria-current="page"' : '') + ' title="' + T(t[2]) + '">' + ic(t[1], 16) + '<span>' + T(t[2]) + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="demobar-actions"><span class="tag tag-warning demo-tag">' + ic('info-circle', 14) + '<span class="demo-tag-long">' + T('Demo · data contoh') + '</span><span class="demo-tag-short">Demo</span></span>' +
      langSeg() +
      '<button type="button" class="icon-btn" data-act="theme" aria-label="' + T('Ganti tema') + '" title="' + T('Ganti tema') + '">' + ic(theme() === 'dark' ? 'sun' : 'moon', 18) + '</button>' +
      '<button type="button" class="icon-btn demo-reset" data-act="resetDemo" aria-label="' + T('Ulang demo') + '" title="' + T('Ulang demo') + '">' + ic('refresh', 18) + '</button></div>';
    autoBar(el);
    setTitle();
  }

  /* ── demo views: the bar hides at the top and comes back on demand ──
     Pointer: within 12 px of the top edge or over the bar; hides 600 ms after the pointer leaves.
     Touch: the "Menu demo" pull tab toggles it; a tap outside hides it. Keyboard: focus shows it, Esc hides it.
     It never hides while it has focus or an open menu. The first demo view of a session shows it for 2,5 s. */
  var BAR = null;
  function autoBar(el) {
    var root = document.documentElement;
    root.classList.add('has-autobar');
    if (!window.ICONS['chevron-compact-down']) window.ICONS['chevron-compact-down'] = '<path d="M4 11l8 3l8 -3"/>';
    if (BAR) { syncTab(); return; }
    BAR = { el: el, shown: false, t: 0, over: false };
    var tab = document.createElement('button');
    tab.type = 'button'; tab.className = 'bar-tab'; tab.setAttribute('aria-controls', 'demobar'); tab.setAttribute('aria-expanded', 'false');
    document.body.appendChild(tab); BAR.tab = tab; syncTab();
    var fine = matchMedia('(hover: hover) and (pointer: fine)');
    function busy() { return el.contains(document.activeElement) || !!el.querySelector('[aria-expanded="true"]') || BAR.over; }
    function show() { clearTimeout(BAR.t); BAR.t = 0; if (BAR.shown) return; BAR.shown = true; el.classList.add('is-shown'); root.classList.add('bar-shown'); syncTab(); moved(); }
    function hide(force) { clearTimeout(BAR.t); BAR.t = 0; if (!BAR.shown || (!force && busy())) return; BAR.shown = false; el.classList.remove('is-shown'); root.classList.remove('bar-shown'); syncTab(); moved(); }
    function later(ms) { clearTimeout(BAR.t); BAR.t = setTimeout(function () { hide(); }, ms); }
    /* other layers (the guide's button) measure the bar: tell them once it has moved */
    function moved() { setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 260); }
    BAR.show = show; BAR.hide = hide;
    document.addEventListener('mousemove', function (e) {
      if (!fine.matches) return;
      if (e.clientY <= 12) show();
      else if (BAR.shown && !BAR.over && !busy() && !BAR.t) later(600);
    }, { passive: true });
    el.addEventListener('mouseenter', function () { BAR.over = true; show(); });
    el.addEventListener('mouseleave', function () { BAR.over = false; later(600); });
    el.addEventListener('focusin', show);
    el.addEventListener('focusout', function (e) { if (!el.contains(e.relatedTarget) && e.relatedTarget !== tab) later(600); });
    tab.addEventListener('click', function () { if (BAR.shown) hide(true); else show(); });
    document.addEventListener('pointerdown', function (e) { if (BAR.shown && !fine.matches && !el.contains(e.target) && !tab.contains(e.target)) hide(true); }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !BAR.shown || document.querySelector('.overlay[data-open], .psheet')) return;
      var inBar = el.contains(document.activeElement);
      hide(true);
      if (inBar) { if (getComputedStyle(tab).display !== 'none') tab.focus(); else document.activeElement.blur(); }
    });
    var hinted = false; try { hinted = sessionStorage.getItem('pl-bar-hint') === '1'; sessionStorage.setItem('pl-bar-hint', '1'); } catch (er) {}
    if (!hinted) (function hint() { if (document.querySelector('.pvl')) { setTimeout(hint, 300); return; } show(); later(2500); })();
  }
  function syncTab() {
    if (!BAR || !BAR.tab) return;
    BAR.tab.setAttribute('aria-expanded', String(BAR.shown));
    BAR.tab.setAttribute('aria-label', BAR.shown ? T('Tutup menu demo') : T('Buka menu demo'));
    BAR.tab.innerHTML = '<span class="bar-tab-pill">' + ic('chevron-compact-down', 16) + '<span>' + T('Menu demo') + '</span></span>';
  }
  var TITLES = { member: 'HP member', kasir: 'Kasir', dash: 'Dashboard' };
  function setTitle() { if (DEMO) document.title = T(TITLES[VIEW]) + ' · ' + BR[BRAND_K].name + ' · Providea Loyalty'; }

  function setView(v) {
    VIEW = v; DEMO = !!TITLES[v];
    document.documentElement.lang = LANG;
    if (DEMO && document.body) document.body.setAttribute('data-brand', BRAND_K);
    renderBar(); if (v !== 'hub' && v !== 'site') visit(v);
  }

  /* active sample brand (demo views). Views set PL.onBrand to re-render; without it they re-render like a language switch. */
  function applyBrand() {
    if (DEMO && document.body) document.body.setAttribute('data-brand', BRAND_K);
    setTitle();
    var f = window.PL.onBrand || window.PL.onLang; if (f) f();
  }
  function setBrand(k) {
    if (!BR[k] || k === BRAND_K) return;
    BRAND_K = k; try { localStorage.setItem('pl-brand', k); } catch (e) {}
    applyBrand();
  }

  /* cross-tab sync: another view changed the demo data or the brand */
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { S = load(); window.PL.S = S; if (window.PL.onSync) window.PL.onSync(); }
    else if (e.key === 'pl-brand') { var nb = readBrand(); if (nb !== BRAND_K) { BRAND_K = nb; applyBrand(); } }
  });

  window.PL = {
    get S() { return S; }, set S(v) { S = v; },
    T: T, num: num, rp: rp, dec: dec, fdate: fdate, fmonth: fmonth, ftime: ftime, ago: ago, daysSince: daysSince, maskPhone: maskPhone, fmtPhone: fmtPhone,
    esc: esc, initials: initials, uid: uid, code: code, DAY: DAY, HOUR: HOUR, MIN: MIN,
    get BRAND() { return B(); }, get CATALOG() { return catalog(); }, get MENU() { return B().menu; }, rules0: rules0,
    brand: function () { return BRAND_K; }, setBrand: setBrand, brandInfo: function (k) { return BR[k || db()]; }, BRANDS: BRAND_IDS,
    tierLook: tierLook, tierMean: tierMean, tn: tn, benefits: benefits, ol: ol, vcode: vcode, vcodeIn: vcodeIn, prodThumb: prodThumb,
    save: save, reset: reset, member: member, tierOf: tierOf, tierById: tierById, nextTier: nextTier, earnFor: earnFor, earnedToday: earnedToday,
    segOf: segOf, isTop: isTop, memberVouchers: memberVouchers, addAudit: addAudit, recordSale: recordSale, nextReceipt: nextReceipt,
    qr: qr, mark: mark, MARK: MARK, tierTag: tierTag, avatar: avatar, segTag: segTag, SEG: SEG, sjLogo: sjLogo, wordmark: wordmark, cup: cup,
    toast: toast, modal: modal, ACT: ACT, setView: setView, renderBar: renderBar, footer: footer, visit: visit, visited: visited,
    lang: function () { return LANG; }, onLang: null, onSync: null, onBrand: null
  };
})();
