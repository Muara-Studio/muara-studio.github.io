/* Beranda: renders the data-driven sections. */
(function(){
const { rp, cardHTML, byId, pimg } = window.HM;
const $ = s => document.querySelector(s);
const STATIC = new URLSearchParams(location.search).has('static');
const w = (u, n) => u + '&w=' + n;
const pk = (id, n=600) => { const im = pimg(byId(id)); return im.src + (im.src.includes('?')?'&':'?') + 'width=' + n; };

/* hero image is set in index.html (srcset, high priority) */
$('#heroPack').src = pk('himalaya-purifying-neem-face-wash', 300);

const trust = [['ti-leaf','Riset herbal sejak 1930'],['ti-shield-check','Terdaftar BPOM'],['ti-lock','Pembayaran aman di marketplace'],['ti-plant','Bahan herbal pilihan'],['ti-rosette','Produk original']];
const mq = trust.concat(trust).concat(trust).map(t => `<span><i class="ti ${t[0]}"></i>${t[1]}</span>`).join('');
$('#mq1').innerHTML = mq; $('#mq2').innerHTML = mq;

/* fanned carousel (Orvéli) */
const favIds = ['himalaya-purifying-neem-face-wash','himalaya-dark-spot-treatment-turmeric-face-serum','refreshing-clarifying-toner','himalaya-purifying-neem-face-mask','himalaya-brightening-vitamin-c-orange-face-wash','oil-control-lemon-face-wash','himalaya-dark-spot-treatment-turmeric-face-wash','moisturizing-aloe-vera-face-wash'];
const badges = ['Kulit berminyak','Kulit bernoda','Toner','Masker mingguan','Mencerahkan','Kulit berminyak','Kulit kusam','Kulit kering'];
const fan = $('#fan');
fan.innerHTML = favIds.map((id,i) => cardHTML(byId(id), { tint:'t-sand', badge:badges[i] }).replace('rv-up','')).join('');
const cards = [...fan.children]; let cur = 0;
function layout(){
  const mob = innerWidth < 860, step = mob ? 190 : 270;
  cards.forEach((c,i) => {
    let d = i - cur; const n = cards.length; if (d > n/2) d -= n; if (d < -n/2) d += n;
    const hide = Math.abs(d) > (mob ? 1 : 2);
    c.style.transform = `translateX(${d*step}px) translateY(${Math.abs(d)*34}px) rotate(${d*7}deg)`;
    c.style.opacity = hide ? 0 : 1; c.style.zIndex = 10 - Math.abs(d); c.style.pointerEvents = hide ? 'none' : 'auto';
  });
}
layout(); addEventListener('resize', layout);
$('#fanPrev').onclick = () => { cur = (cur - 1 + cards.length) % cards.length; layout(); };
$('#fanNext').onclick = () => { cur = (cur + 1) % cards.length; layout(); };
if (!STATIC) setInterval(() => { if (!document.hidden) { cur = (cur + 1) % cards.length; layout(); } }, 4200);

/* concerns */
const concerns = [
  ['jerawat','Jerawat','Kulit berminyak & mudah berjerawat','wash'],
  ['noda','Noda Hitam','Kulit kusam & bernoda','portrait2'],
  ['mencerahkan','Mencerahkan','Untuk kulit tampak segar','serumModel'],
  ['berminyak','Kulit Berminyak','Kilap di zona T','hijab2'],
  ['kering','Kulit Kering','Terasa tertarik setelah cuci muka','hijab5']];
$('#concerns').innerHTML = concerns.map((c,i) => { const n = PRODUCTS.filter(p => p.c.includes(c[0])).length;
  return `<a class="concern rv-up" href="${c[0]==='jerawat'?'kebutuhan-jerawat.html':'perawatan-wajah.html?concern='+c[0]}"><img loading="lazy" src="${IMG[c[3]]}&w=600&h=840" alt=""><span class="go"><i class="ti ti-arrow-up-right"></i></span><span class="n">0${i+1} · ${n} produk</span><h3>${c[1]}</h3><p>${c[2]}</p></a>`; }).join('');

$('#misiImg').src = w(IMG.leafModel, 1000);
$('#misiPack').src = pk('himalaya-purifying-neem-face-mask', 300);

/* ingredients */
const rows = $('#ingRows'), ingImg = $('#ingImg');
rows.innerHTML = INGREDIENTS.map((g,i) => `<div class="irow ${i===0?'on':''}" data-i="${i}"><h4>${g.n}</h4><span class="n">${g.l} · Bahan 0${i+1}</span><p>${g.d}</p></div>`).join('');
ingImg.src = w(IMG[INGREDIENTS[0].img], 1000);
rows.addEventListener('click', e => { const r = e.target.closest('.irow'); if (!r) return; [...rows.children].forEach(x => x.classList.remove('on')); r.classList.add('on'); const g = INGREDIENTS[r.dataset.i]; ingImg.src = w(IMG[g.img], 1000); $('#ingCap').textContent = g.n + ' · ' + g.l; });

$('#ps1').src = w(IMG.towel, 900); $('#ps2').src = w(IMG.hijab3, 900);

/* steps */
const stepsHTML = STEPS.map(s => { const p = byId(s.pid); return `<article class="step rv-up"><div class="ph"><img loading="lazy" src="${IMG[s.img]}&w=800&h=640" alt=""><b>${s.n}</b></div><div class="bd"><h3>${s.t}</h3><p>${s.d}</p><a class="pr" href="produk.html"><img src="${pk(s.pid,160)}" alt="">${p.n}<span style="margin-left:auto" class="num">${rp(p.p)}</span></a></div></article>`; }).join('');
$('#steps').innerHTML = stepsHTML;

$('#bentoImg').src = w(IMG.hijab, 900);

$('#st1').src = w(IMG.neem2, 300) + '&h=160'; $('#st2').src = w(IMG.portrait3, 300) + '&h=160'; $('#st3').src = w(IMG.turmeric, 300) + '&h=160';

/* product spotlight */
const gal = NEEM_GALLERY.concat([IMG.wash2 + '&w=900']);
$('#thumbs').innerHTML = gal.map((g,i) => `<button class="${i===0?'on':''} ${g.includes('unsplash')?'cov':''}" data-i="${i}" aria-label="Foto produk ${i+1}"><img src="${g}${g.includes('unsplash')?'':'&width=200'}" alt=""></button>`).join('');
const main = $('#mainImg'); main.src = gal[0] + '&width=1000';
$('#thumbs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; [...b.parentNode.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); const g = gal[b.dataset.i]; main.className = g.includes('unsplash') ? 'cover' : ''; main.src = g.includes('unsplash') ? g : g + '&width=1000'; });
/* Per-size prices: only 100ml (Rp44.900) comes from data.js. 50ml and 150ml are ILLUSTRATIVE placeholders until the client confirms its price list. */
const sizes = [['50ml',null],['100ml',44900],['150ml',null]]; /* only the 100 ml price is confirmed */
$('#spSizes').innerHTML = sizes.map((s,i) => `<button class="size ${i===1?'on':''}" data-p="${s[1]??''}" data-s="${s[0]}">${s[0].replace('ml',' ml')}</button>`).join('');
$('#spSizes').addEventListener('click', e => { const b = e.target.closest('.size'); if (!b) return; [...b.parentNode.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); $('#spPrice').textContent = rp(b.dataset.p ? +b.dataset.p : null); document.querySelector('#spSize').textContent = b.dataset.s.replace('ml',' ml'); });

/* FAQ */
$('#faq').innerHTML = FAQ_HOME.map((f,i) => `<details class="acc" ${i===0?'open':''}><summary>${f[0]}<i class="ti ti-plus"></i></summary><div class="ct">${f[1]}</div></details>`).join('');
document.querySelectorAll('#faq details').forEach(d => d.addEventListener('toggle', () => { if (d.open) document.querySelectorAll('#faq details').forEach(o => o!==d && (o.open=false)); }));

/* journal */
const A = ARTICLES;
const jc = (a, big) => `<a class="jcard ${big?'big':''} rv-up" href="jurnal.html"><img loading="lazy" src="${IMG[a.img]}&w=${big?1400:900}" alt=""><span class="m"><b>${a.cat}</b>${a.date} · ${a.min} menit baca</span><h3>${a.t}</h3></a>`;
$('#jr').innerHTML = jc(A[0], true) + `<div class="side">${jc(A[1])}${jc(A[2])}</div>`;

$('#ctaStrip').innerHTML = ['gel1','neem3','dropper2','gel3','aloe2'].map(k => `<img loading="lazy" src="${IMG[k]}&w=260&h=260" alt="">`).join('');

window.HM.afterRender();
})();
