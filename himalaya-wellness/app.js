/* Himalaya Wellness ID revamp mockup: shared chrome and interactions (vanilla JS). */
(function(){
const Q = new URLSearchParams(location.search);
const STATIC = Q.has('static');
const html = document.documentElement;
if (STATIC) html.classList.add('static');
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const rp = n => (n == null) ? 'Cek harga di toko' : 'Rp' + n.toLocaleString('id-ID');
const store = { get(k){ try{return localStorage.getItem(k)}catch(e){return null} }, set(k,v){ try{localStorage.setItem(k,v)}catch(e){} } };
const page = document.body.dataset.page || '';

/* ---------- data helpers ---------- */
const CONCERN = { jerawat:'Jerawat', noda:'Noda Hitam', mencerahkan:'Mencerahkan', berminyak:'Kulit Berminyak', kering:'Kulit Kering' };
const TINT = { jerawat:'t-sage', noda:'t-peach', mencerahkan:'t-butter', berminyak:'t-sand', kering:'t-sand' };
const MP = [ /* Tokopedia URL given in the brief. Shopee, TikTok Shop, Lazada and Watsons use search URLs until the official store links are confirmed. */
  { k:'tokopedia', n:'Tokopedia', c:'#03AC0E', l:'T', s:'Himalaya Official Store', u:'https://www.tokopedia.com/himalaya-official-store' },
  { k:'shopee', n:'Shopee', c:'#EE4D2D', l:'S', s:'Cari Himalaya Official Store', u:'https://shopee.co.id/search?keyword=himalaya%20official%20store' },
  { k:'tiktok', n:'TikTok Shop', c:'#111111', l:'<i class="ti ti-brand-tiktok"></i>', s:'Cari Himalaya Official Store', u:'https://www.tiktok.com/search?q=himalaya%20official%20store' },
  { k:'lazada', n:'Lazada', c:'#10156F', l:'L', s:'Cari Himalaya di LazMall', u:'https://www.lazada.co.id/catalog/?q=himalaya%20official%20store' },
  { k:'watsons', n:'Watsons', c:'#009AA6', l:'W', s:'Cari Himalaya di Watsons', u:'https://www.watsons.co.id/search?text=himalaya' }
];
const P = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
const byId = id => P.find(p => p.id === id);
function pimg(p){ const s = (typeof PACK!=='undefined' && PACK[p.id]); return s ? { src:s, cover:false } : { src:p.img, cover:true }; }
function tint(p){ return TINT[p.c[0]] || 't-sand'; }
function stars(r){ const f = Math.round(r); return '★'.repeat(f) + '☆'.repeat(5-f); }
/* NOTE: ratings (p.r) and review counts (p.u) in data.js are ILLUSTRATIVE for the mockup, not real store data. */
function cardHTML(p, o={}){
  const im = pimg(p);
  const badge = o.badge || '';
  return `<article class="card ${o.tint||tint(p)} rv-up" data-id="${p.id}">
    ${badge?`<span class="badge">${badge}</span>`:''}
    <button class="bag" data-buy="${p.id}" aria-label="Beli ${p.n}"><i class="ti ti-shopping-bag"></i></button>
    <a class="img" href="produk.html"><img loading="lazy" class="${im.cover?'cover':''}" src="${im.src}${im.src.includes('?')?'&':'?'}width=700" alt="${p.n}"></a>
    <div class="meta">
      <h3><a href="produk.html">${p.n}</a></h3>
      <div class="sub">${p.t} · ${p.vs.join(' / ')}</div>
      <div class="row"><span class="price num ${p.p==null?'ask':''}">${rp(p.p)}</span><button class="buy" data-buy="${p.id}">Beli <i class="ti ti-arrow-up-right"></i></button></div>
    </div></article>`;
}
window.HM = { rp, cardHTML, byId, pimg, CONCERN, MP, stars };

/* ---------- i18n (key strings only; mockup) ---------- */
const I18N = {
  en: {
    'nav.home':'Home','nav.face':'Face Care','nav.acne':'Acne Hub','nav.about':'About Us','nav.journal':'Skin Journal','nav.buy':'Shop now',
    'alert.1':'<b>Free shipping</b> at our official marketplace stores*','alert.2':'Herbal research <b>since 1930</b>','alert.3':'Take the <b>2-minute skin quiz</b> to find your routine',
    'search.ph':'Search face wash, serum, mask…','search.pop':'Popular:',
    'hero.kicker':'Herbal skincare since 1930','hero.title':'Calm skin,<br><em>rooted</em> in nature.','hero.sub':'Herbal face care from Himalaya: neem, turmeric and aloe vera for a simple daily routine under the tropical sun.','hero.cta1':'Shop face care','hero.cta2':'Find my routine',
    'ft.shop':'Shop','ft.help':'Help','ft.co':'Company','ft.news':'Get skincare tips','ft.nlph':'Your email address','ft.sub':'Subscribe',
    'buy':'Buy','faq.title':'Frequently asked <em>questions</em>',
    'nav.kom':'Community','notice':'<b>Design concept.</b> Not the official Himalaya Wellness Indonesia website.','notice.link':'See the community app',
    'kom.label':'Komunitas Himalaya (concept)','kom.title':'Care for your skin, <em>together.</em>','kom.sub':'A web app for Himalaya users: check your skin, keep your routine, review honestly, and collect points you can swap for discounts on Himalaya products.','kom.cta':'Join the community (concept)','kom.more':'How it works',
    'hm.fav':'Favourites for <em>tropical skin</em>','hm.need':'Start from<br>your skin needs.','hm.ing':'Simple ingredients,<br><em>chosen for a reason.</em>','hm.steps':'Your new routine,<br><em>just three steps.</em>','hm.jr':'From the Skin Journal.','hm.nl':'Start a<br><em>calmer routine.</em>',
    'ft.demo':'<b>Design concept.</b> Not the official Himalaya Wellness Indonesia website.','mp.note':'You will open the Himalaya store on the marketplace you choose.',
    'pw.title':'Herbal face care<br>for <em>tropical skin.</em>','hub.title':'Acne-prone skin,<br><em>cared for calmly.</em>','jr.title':'Skin Journal for<br><em>tropical weather.</em>','ab.title':'Made with patience,<br><em>since 1930.</em>'
  }
};
const ID_CACHE = {};
function setLang(l){
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (!(k in ID_CACHE)) ID_CACHE[k] = el.innerHTML; el.innerHTML = l==='en' && I18N.en[k] ? I18N.en[k] : ID_CACHE[k]; });
  $$('[data-i18n-ph]').forEach(el => { const k = el.dataset.i18nPh; if (!(k in ID_CACHE)) ID_CACHE[k] = el.placeholder; el.placeholder = l==='en' && I18N.en[k] ? I18N.en[k] : ID_CACHE[k]; });
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === l));
  html.lang = l; store.set('hm-lang', l);
}

/* ---------- chrome ---------- */
const LOGO = `<a class="logo" href="index.html" aria-label="Himalaya Wellness Indonesia, beranda"><img src="img/logo.png" alt="Himalaya since 1930" width="76" height="44"></a>`;
const NAV = [['index.html','nav.home','Beranda','home'],['perawatan-wajah.html','nav.face','Perawatan Wajah','face-care'],['kebutuhan-jerawat.html','nav.acne','Kulit Berjerawat','hub'],['jurnal.html','nav.journal','Jurnal Kulit','journal'],['tentang-kami.html','nav.about','Tentang Kami','about'],['komunitas.html','nav.kom','Komunitas','kom']];
function chromeTop(){
  return `<div class="alert" id="alert" role="note"><span data-i18n="notice"><b>Konsep desain.</b> Bukan situs resmi Himalaya Wellness Indonesia.</span> <a href="komunitas.html" data-i18n="notice.link">Lihat aplikasi komunitas</a></div>
  <header class="nav" id="nav"><div class="wrap">${LOGO}
    <nav class="menu">${NAV.map(n=>`<a href="${n[0]}" class="${n[3]===page?'on':''}" data-i18n="${n[1]}">${n[2]}</a>`).join('')}</nav>
    <div class="tools">
      <button class="ib" id="searchBtn" aria-label="Cari"><i class="ti ti-search"></i></button>
      <div class="lang" role="group" aria-label="Bahasa"><button data-l="id" class="on">ID</button><button data-l="en">EN</button></div>
      <a class="btn btn-p btn-sm" href="perawatan-wajah.html"><span data-i18n="nav.buy">Belanja</span><span class="ar"><i class="ti ti-arrow-up-right"></i></span></a>
      <button class="ib burger" id="burger" aria-label="Buka menu" aria-controls="drawer" aria-expanded="false"><i class="ti ti-menu-2"></i></button>
    </div></div>
    <div class="search" id="search"><div class="wrap">
      <label class="field"><i class="ti ti-search" style="font-size:20px;color:var(--muted)"></i><input id="sq" type="search" placeholder="Cari facial wash, serum, masker…" data-i18n-ph="search.ph" autocomplete="off"><button class="ib" id="searchClose" aria-label="Tutup"><i class="ti ti-x"></i></button></label>
      <div class="sugg"><span class="small" data-i18n="search.pop">Populer:</span>${['Neem','Facial wash jerawat','Vitamin C','Kunyit','Toner'].map(s=>`<button class="chip" data-s="${s}">${s}</button>`).join('')}</div>
      <div class="res" id="sres"></div></div></div>
  </header>
  <div class="drawer" id="drawer" aria-hidden="true"><div class="bg"></div><div class="panel" role="dialog" aria-modal="true" aria-label="Menu">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">${LOGO}<button class="ib" id="drawerX" aria-label="Tutup"><i class="ti ti-x"></i></button></div>
    ${NAV.map(n=>`<a class="big ${n[3]===page?'on':''}" href="${n[0]}"><span data-i18n="${n[1]}">${n[2]}</span><i class="ti ti-arrow-up-right"></i></a>`).join('')}
    <div class="lang" style="display:flex;align-self:flex-start;margin-top:22px"><button data-l="id" class="on">ID</button><button data-l="en">EN</button></div>
    <a class="btn btn-p" style="margin-top:18px;align-self:flex-start" href="perawatan-wajah.html"><span data-i18n="nav.buy">Belanja</span><span class="ar"><i class="ti ti-arrow-up-right"></i></span></a>
  </div></div>`;
}
function chromeBottom(){
  return `<footer class="ft"><div class="top">
    <div class="about"><a class="logo" href="index.html"><img src="img/logo-light.png" alt="Himalaya since 1930" width="110" height="64" style="height:64px"></a><p>Perawatan kulit herbal dari Himalaya Wellness, dengan riset herbal sejak 1930. </p>
      <p class="demo" data-i18n="ft.demo"><b>Konsep desain.</b> Bukan situs resmi Himalaya Wellness Indonesia.</p></div>
    <div><h6 data-i18n="ft.shop">Belanja</h6><ul><li><a href="perawatan-wajah.html">Perawatan Wajah</a></li><li><a href="perawatan-wajah.html?type=Facial%20Wash">Facial Wash</a></li><li><a href="perawatan-wajah.html?type=Serum">Serum</a></li><li><a href="perawatan-wajah.html?type=Masker">Masker</a></li><li><a href="kebutuhan-jerawat.html">Kulit Berjerawat</a></li></ul></div>
    <div><h6 data-i18n="ft.help">Bantuan</h6><ul><li><a href="index.html#faq">FAQ</a></li><li><a href="https://cekbpom.pom.go.id/" target="_blank" rel="noopener">Cek BPOM</a></li><li><a href="https://www.tokopedia.com/himalaya-official-store" target="_blank" rel="noopener">Official store</a></li><li><a href="komunitas.html">Komunitas Himalaya</a></li></ul></div>
    <div><h6 data-i18n="ft.co">Perusahaan</h6><ul><li><a href="tentang-kami.html">Tentang Kami</a></li><li><a href="jurnal.html">Jurnal Kulit</a></li></ul></div>
    <div class="news"><h6 data-i18n="ft.news">Dapatkan tips perawatan kulit</h6><p style="font-size:14px;color:rgba(232,239,226,.7);margin-bottom:14px">Artikel Jurnal Kulit dan info promo, sebulan dua kali. Bisa berhenti kapan saja.</p>
      <form class="nl" onsubmit="event.preventDefault();this.innerHTML='<span style=\\'padding:12px 16px;font-weight:600\\'>Terima kasih, cek email kamu.</span>'"><input type="email" required placeholder="Alamat email kamu" data-i18n-ph="ft.nlph" aria-label="Email"><button class="btn btn-l btn-sm" type="submit"><span data-i18n="ft.sub">Daftar</span><span class="ar"><i class="ti ti-arrow-right"></i></span></button></form>
      <p class="fine">Dengan mendaftar, kamu menyetujui Kebijakan Privasi kami.</p>
      </div>
  </div>
  <div class="word">Himalaya<em>.</em></div>
  <div class="bar"><span>Konsep desain untuk presentasi, 2026. Bukan situs resmi Himalaya Wellness Indonesia. Merek, logo dan foto kemasan milik Himalaya Wellness. Foto gaya hidup sementara dari Unsplash.</span><div><a href="NOTICES.md">Kredit foto</a></div></div></footer>
  
  <button class="totop" id="totop" aria-label="Kembali ke atas"><i class="ti ti-arrow-up"></i></button>
  <div class="modal chooser" id="chooser" role="dialog" aria-modal="true" aria-label="Pilih marketplace"><div class="bg" data-close></div><div class="box">
    <button class="x" data-close aria-label="Tutup"><i class="ti ti-x"></i></button>
    <div class="hd"><div class="t"><img id="chImg" alt=""></div><div><b id="chName"></b><span id="chPrice" class="num"></span></div></div>
    <div class="ls"><p data-i18n="mp.note">Kamu akan membuka toko Himalaya di marketplace pilihanmu.</p>
      ${MP.map(m=>`<a class="mprow" href="${m.u}" target="_blank" rel="noopener" data-mp="${m.k}"><span class="dot" style="background:${m.c}">${m.l}</span><span><b>${m.n}</b><span>${m.s}</span></span><i class="ti ti-external-link"></i></a>`).join('')}
      <p class="small" style="margin-top:8px">Harga dan promo mengikuti marketplace masing-masing.</p></div></div></div>
  `;
}
const top = $('#chrome-top'), bot = $('#chrome-bottom');
if (top) top.outerHTML = chromeTop();
if (bot) bot.outerHTML = chromeBottom();

/* sticky nav shadow + back to top */
const nav = $('#nav'), tt = $('#totop');
function onScroll(){ nav && nav.classList.toggle('scrolled', scrollY > 10); tt && tt.classList.toggle('show', scrollY > 700); }
addEventListener('scroll', onScroll, { passive:true }); onScroll();
tt?.addEventListener('click', () => scrollTo({ top:0, behavior: STATIC ? 'auto' : 'smooth' }));

/* search */
const sp = $('#search'), sq = $('#sq'), sres = $('#sres');
function renderSearch(q){
  q = (q||'').toLowerCase().trim();
  const list = (q ? P.filter(p => (p.n+' '+p.t+' '+p.c.map(c=>CONCERN[c]).join(' ')+' '+p.k).toLowerCase().includes(q.split(' ')[0])) : P.slice(6,10)).slice(0,4);
  sres.innerHTML = list.map(p => { const im = pimg(p); return `<a class="sres" href="produk.html"><span class="t"><img src="${im.src}${im.src.includes('?')?'&':'?'}width=200" alt=""></span><span><b>${p.n}</b><span class="num">${rp(p.p)}</span></span></a>`; }).join('') || '<p class="small">Tidak ada hasil. Coba "neem" atau "serum".</p>';
}
window.HM.openSearch = (q) => { sp.classList.add('open'); if (q!=null) sq.value = q; renderSearch(sq.value); setTimeout(()=>sq.focus(), 50); };
$('#searchBtn')?.addEventListener('click', () => sp.classList.contains('open') ? sp.classList.remove('open') : window.HM.openSearch());
$('#searchClose')?.addEventListener('click', e => { e.preventDefault(); sp.classList.remove('open'); });
sq?.addEventListener('input', () => renderSearch(sq.value));
sq?.addEventListener('keydown', e => { if (e.key==='Enter') location.href = 'perawatan-wajah.html?q=' + encodeURIComponent(sq.value); if (e.key==='Escape') sp.classList.remove('open'); });
$$('.sugg .chip').forEach(c => c.addEventListener('click', () => { sq.value = c.dataset.s; renderSearch(c.dataset.s); }));

/* drawer (mobile menu) */
const dr = $('#drawer'), burger = $('#burger');
function drawer(open){ if (!dr) return; dr.classList.toggle('open', open); dr.setAttribute('aria-hidden', String(!open)); burger && burger.setAttribute('aria-expanded', String(open)); html.style.overflow = open ? 'hidden' : ''; if (open) setTimeout(() => $('#drawerX')?.focus(), 60); }
burger?.addEventListener('click', () => drawer(true));
$$('#drawer .bg, #drawerX').forEach(b => b.addEventListener('click', () => drawer(false)));
$$('#drawer a').forEach(a => a.addEventListener('click', () => drawer(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && dr && dr.classList.contains('open')) drawer(false); });
addEventListener('resize', () => { if (innerWidth > 1180) drawer(false); });

/* lang */
$$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.l)));
if (Q.get('lang') === 'en' || (!STATIC && store.get('hm-lang') === 'en')) setLang('en');

/* modals */
function openM(m){ m.classList.add('open'); }
function closeM(m){ m.classList.remove('open'); }
$$('.modal').forEach(m => $$('[data-close]', m).forEach(b => b.addEventListener('click', () => closeM(m))));
addEventListener('keydown', e => { if (e.key==='Escape') $$('.modal.open').forEach(closeM); });
window.HM.buy = (id) => {
  const p = byId(id) || byId('himalaya-purifying-neem-face-wash'); const im = pimg(p);
  $('#chImg').src = im.src + (im.src.includes('?')?'&':'?') + 'width=200'; $('#chName').textContent = p.n; $('#chPrice').textContent = (p.p==null ? '' : rp(p.p) + ' · ') + p.vs.join(' / ');
  openM($('#chooser'));
};
document.addEventListener('click', e => { const b = e.target.closest('[data-buy]'); if (b){ e.preventDefault(); window.HM.buy(b.dataset.buy); } });

if (Q.get('chooser') === '1') window.HM.buy(Q.get('id') || 'himalaya-purifying-neem-face-wash');
if (Q.get('search')) window.HM.openSearch(Q.get('search'));

/* accordions: one open at a time within a group */
$$('[data-acc-group]').forEach(g => $$('details', g).forEach(d => d.addEventListener('toggle', () => { if (d.open) $$('details', g).forEach(o => o!==d && (o.open=false)); })));

/* reveal anything already scrolled past (fast scrolls, anchor jumps) */
let rq = 0;
function revealPassed(){ rq = 0; const lim = innerHeight * 0.95; $$('.rv-up:not(.in)').forEach(e => { if (e.getBoundingClientRect().top < lim) e.classList.add('in'); }); }
addEventListener('scroll', () => { if (!rq) rq = requestAnimationFrame(revealPassed); }, { passive:true });
/* page hooks */
window.HM.afterRender = () => {
  if (STATIC) $$('img[loading="lazy"]').forEach(i => i.loading = 'eager');
  const els = $$('.rv-up:not(.in)');
  if (STATIC || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach(e => e.classList.add('in')); return; }
  html.classList.add('rv-js');
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin:'0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
  revealPassed();
};
document.addEventListener('DOMContentLoaded', () => window.HM.afterRender());
setTimeout(() => window.HM.afterRender(), 0);
})();
