/* Perawatan Wajah (collection): filters, sort, grid. Everything is driven by data.js. */
(function(){
const { rp, cardHTML, byId, pimg, CONCERN } = window.HM;
const $ = s => document.querySelector(s);
const Q = new URLSearchParams(location.search);
const TYPES = ['Facial Wash','Serum','Masker','Toner','Scrub'];
const CICON = { jerawat:'ti-droplet-half-2', noda:'ti-sun', mencerahkan:'ti-sparkles', berminyak:'ti-droplet', kering:'ti-leaf' };
const st = { concern: Q.get('concern'), type: Q.get('type'), sort: Q.get('sort') || 'pop', q: (Q.get('q')||'').toLowerCase() };

$('#fcHero').src = IMG.portrait2 + '&w=2000';

const count = f => PRODUCTS.filter(f).length;
function chips(){
  $('#fConcern').innerHTML = `<button class="chip ${!st.concern?'on':''}" data-c="">Semua</button>` + Object.entries(CONCERN).map(([k,v]) => `<button class="chip ${st.concern===k?'on':''}" data-c="${k}"><i class="ti ${CICON[k]}"></i>${v} <span style="opacity:.6" class="num">${count(p=>p.c.includes(k))}</span></button>`).join('');
  $('#fType').innerHTML = `<button class="chip ${!st.type?'on':''}" data-t="">Semua jenis</button>` + TYPES.map(t => `<button class="chip ${st.type===t?'on':''}" data-t="${t}">${t} <span style="opacity:.6" class="num">${count(p=>p.t===t)}</span></button>`).join('');
}
function render(){
  let list = PRODUCTS.filter(p => (!st.concern || p.c.includes(st.concern)) && (!st.type || p.t === st.type) && (!st.q || (p.n+' '+p.t+' '+p.k).toLowerCase().includes(st.q)));
  const s = { pop:(a,b)=>b.u-a.u, new:(a,b)=>PRODUCTS.indexOf(a)-PRODUCTS.indexOf(b), asc:(a,b)=>(a.p??1e9)-(b.p??1e9), desc:(a,b)=>(b.p??0)-(a.p??0), rate:(a,b)=>b.r-a.r||b.u-a.u }[st.sort];
  list = list.slice().sort(s);
  $('#grid').innerHTML = list.map(p => cardHTML(p)).join('') || `<div class="empty"><i class="ti ti-mood-empty" style="font-size:32px"></i><p style="margin-top:8px">Belum ada produk untuk kombinasi ini. <button class="link" id="reset">Reset filter</button></p></div>`;
  $('#fCount').textContent = list.length + ' produk';
  const act = [st.concern && CONCERN[st.concern], st.type, st.q && `"${st.q}"`].filter(Boolean);
  $('#fActive').innerHTML = act.length ? `Menampilkan: <b style="color:var(--ink)">${act.join(' · ')}</b> &nbsp;<button class="link" id="reset2" style="font-size:13px">Hapus filter</button>` : `Menampilkan semua perawatan wajah, diurutkan <b style="color:var(--ink)">${$('#fSort').selectedOptions[0].text.toLowerCase()}</b>.`;
  document.querySelectorAll('#reset,#reset2').forEach(b => b.onclick = () => { st.concern = st.type = null; st.q = ''; sync(); });
  window.HM.afterRender();
}
function sync(){
  chips(); render();
  const u = new URLSearchParams(); if (st.concern) u.set('concern', st.concern); if (st.type) u.set('type', st.type); if (st.sort !== 'pop') u.set('sort', st.sort); if (st.q) u.set('q', st.q); if (Q.has('static')) u.set('static','1');
  history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
}
$('#fbar').addEventListener('click', e => { const c = e.target.closest('[data-c]'), t = e.target.closest('[data-t]'); if (c) st.concern = c.dataset.c || null; if (t) st.type = t.dataset.t || null; if (c || t) sync(); });
$('#fSort').value = st.sort; $('#fSort').onchange = e => { st.sort = e.target.value; sync(); };
chips(); render();

/* ingredient tiles */
const ing = [['Neem','Rangkaian Purifying','neem','jerawat'],['Kunyit','Rangkaian Dark Spot','turmeric','noda'],['Jeruk','Rangkaian Brightening','dropper','mencerahkan'],['Lemon','Oil Control','gel4','berminyak'],['Lidah Buaya','Moisturizing','aloe','kering']];
$('#ingTiles').innerHTML = ing.map((g,i) => `<a class="concern rv-up" href="?concern=${g[3]}#katalog" style="aspect-ratio:3/3.4"><img loading="lazy" src="${IMG[g[2]]}&w=600&h=680" alt=""><span class="go"><i class="ti ti-arrow-up-right"></i></span><span class="n">Bahan 0${i+1}</span><h3>${g[0]}</h3><p>${g[1]}</p></a>`).join('');

/* routine band */
const r = [['Pagi & malam','Bersihkan','himalaya-purifying-neem-face-wash','Pijat lembut 30 detik ke wajah yang basah, lalu bilas.'],['Setelah cuci muka','Seimbangkan','refreshing-clarifying-toner','Usapkan dengan kapas ke seluruh wajah, hindari area mata.'],['Malam hari','Rawat','himalaya-purifying-neem-face-serum','2 sampai 3 tetes, lalu kunci dengan pelembap ringan.']];
$('#fcSteps').innerHTML = r.map((s,i) => { const p = byId(s[2]), im = pimg(p); return `<article class="step rv-up"><div class="ph" style="background:#fff;aspect-ratio:4/2.6;display:grid;place-items:center"><img loading="lazy" src="${im.src}${im.src.includes('?')?'&':'?'}width=600" style="object-fit:contain;height:88%;width:auto" alt=""><b style="background:var(--sage2);color:var(--ink)">0${i+1} · ${s[0]}</b></div><div class="bd"><h3>${s[1]}</h3><p>${s[3]}</p><div class="pr" style="justify-content:space-between"><span>${p.n}</span><span class="num">${rp(p.p)}</span></div><button class="btn btn-l btn-sm" data-buy="${p.id}" style="align-self:flex-start;margin-top:6px">Beli<span class="ar"><i class="ti ti-arrow-up-right"></i></span></button></div></article>`; }).join('');

/* related articles */
$('#fcArticles').innerHTML = ARTICLES.slice(0,3).map(a => `<a class="bcard rv-up" href="jurnal.html"><div class="ph"><img loading="lazy" src="${IMG[a.img]}&w=700&h=480" alt=""></div><div class="bd"><span class="cat">${a.cat}</span><h3>${a.t}</h3><div class="m"><span><i class="ti ti-calendar"></i>${a.date}</span><span><i class="ti ti-clock"></i>${a.min} menit</span></div></div></a>`).join('');
window.HM.afterRender();
})();
