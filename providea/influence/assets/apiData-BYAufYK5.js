import{Q as e}from"./ui-5BDPzDh8.js";import{t}from"./IconCalculator-ZUsHtrq5.js";import{L as n}from"./index-C_fBshm9.js";var r=e(`outline`,`key`,`Key`,[[`path`,{d:`M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0`,key:`svg-0`}],[`path`,{d:`M15 9h.01`,key:`svg-1`}]]),i=e(`outline`,`webhook`,`Webhook`,[[`path`,{d:`M4.876 13.61a4 4 0 1 0 6.124 3.39h6`,key:`svg-0`}],[`path`,{d:`M15.066 20.502a4 4 0 1 0 1.934 -7.502c-.706 0 -1.424 .179 -2 .5l-3 -5.5`,key:`svg-1`}],[`path`,{d:`M16 8a4 4 0 1 0 -8 0c0 1.506 .77 2.818 2 3.5l-3 5.5`,key:`svg-2`}]]),a=`https://api.providea.id`,o={sandboxPerMin:60,enterprisePerMin:600,sandboxMonth:1e4},s=[{icon:n,title:`Pencarian KOL di tool Anda`,text:`Cari KOL Indonesia yang aktif dan sudah dicek dari CRM atau dashboard internal, dengan filter niche, kota, ER, dan harga.`},{icon:t,title:`Budget dengan harga bersumber`,text:`Tarik rate per format lengkap dengan sumber dan tanggalnya, lalu susun budget campaign tanpa salin manual.`},{icon:i,title:`Status campaign yang selalu sama`,text:`Webhook mengabari sistem Anda saat MoU ditandatangani, invoice dibayar, atau task pindah kolom.`}],c=[{title:`KOL dan harga`,items:[{method:`GET`,path:`/v1/kols`,text:`Cari KOL dengan filter. Hasil dibagi per halaman.`,params:[`tier`,`niche`,`city`,`platform`,`followers_min`,`followers_max`,`er_min`,`price_max`,`format`,`page`]},{method:`GET`,path:`/v1/kols/{handle}`,text:`Profil, platform, audiens, dan status verifikasi satu KOL.`},{method:`GET`,path:`/v1/kols/{handle}/rates`,text:`Rate per format, lengkap dengan sumber dan tanggalnya.`}]},{title:`Campaign`,items:[{method:`POST`,path:`/v1/shortlists`,text:`Tambahkan KOL ke shortlist sebuah ticket.`},{method:`GET`,path:`/v1/tickets/{id}`,text:`Ticket dengan task dan status setiap KOL.`},{method:`GET`,path:`/v1/mous/{id}`,text:`Status MoU dan tanda tangan setiap pihak.`}]},{title:`Keuangan`,items:[{method:`GET`,path:`/v1/invoices`,text:`Invoice dan bukti potong PPh 21.`}]}],l=[{id:`kol.rate_updated`,text:`Rate KOL berubah.`},{id:`mou.signed`,text:`MoU sudah ditandatangani semua pihak.`},{id:`invoice.paid`,text:`Invoice sudah dibayar.`},{id:`ticket.task_moved`,text:`Task di sebuah ticket pindah kolom.`}],u=`/v1/kols/sintamasak/rates`,d={curl:`curl`,js:`JavaScript`,python:`Python`},f={curl:`curl ${a}${u} \\
  -H "Authorization: Bearer $PROVIDEA_KEY"`,js:`const res = await fetch('${a}${u}', {
  headers: { Authorization: \`Bearer \${process.env.PROVIDEA_KEY}\` },
});
const { rates } = await res.json();`,python:`import os
import requests

res = requests.get(
    "${a}${u}",
    headers={"Authorization": f"Bearer {os.environ['PROVIDEA_KEY']}"},
)
rates = res.json()["rates"]`},p=`{
  "handle": "sintamasak",
  "currency": "IDR",
  "rates": [
    {
      "format": "instagram_reels",
      "price": 4500000,
      "source": "deal",
      "date": "2026-10-14"
    },
    {
      "format": "tiktok_video",
      "price": 3800000,
      "source": "negotiated",
      "date": "2026-09-30"
    },
    {
      "format": "instagram_story",
      "price": 1200000,
      "source": "kol_stated",
      "date": "2026-11-02"
    }
  ]
}`,m=[{value:`deal`,source:`riwayat`,label:`Riwayat deal`},{value:`negotiated`,source:`nego`,label:`Hasil nego`},{value:`kol_stated`,source:`dinyatakan`,label:`Dinyatakan KOL`}],h=[{format:`Reels IG`,price:45e5,source:`riwayat`,date:`2026-10-14`},{format:`Video TikTok`,price:38e5,source:`nego`,date:`2026-09-30`},{format:`Story Instagram`,price:12e5,source:`dinyatakan`,date:`2026-11-02`}],g=[{title:`Hanya data yang sah`,text:`Data yang KOL berikan kepada kami, atau informasi bisnis yang mereka publikasikan sendiri, seperti rate card dan kontak kerja sama.`},{title:`Tidak dijual ulang`,text:`Data pribadi dari API tidak boleh dijual ulang atau dibagikan ke pihak lain. Key yang melanggar kami cabut.`},{title:`Opt-out dihormati`,text:`KOL bisa meminta keluar dari katalog. Setelah itu profilnya tidak muncul lagi di hasil API.`},{title:`Sesuai UU PDP`,text:`Pengolahan data mengikuti Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.`}],_=[{q:`Siapa yang bisa memakai API?`,a:`Setiap paket, termasuk Gratis, mendapat key Sandbox dengan data uji. Key produksi tersedia di paket Enterprise.`},{q:`Apakah API memberi harga KOL?`,a:`Ya, dengan key produksi. Setiap rate datang bersama format, sumber, dan tanggalnya. Key Sandbox memakai harga contoh.`},{q:`Apa bedanya dengan katalog di aplikasi?`,a:`Datanya sama. API berguna kalau tim Anda ingin memakai data itu di CRM, dashboard, atau sistem keuangan sendiri.`},{q:`Bagaimana kalau rate KOL berubah?`,a:`Pasang webhook kol.rate_updated. Kami mengirim event setiap kali rate KOL di katalog berubah.`}];export{l as a,o as c,m as d,i as f,c as i,f as l,s as n,h as o,r as p,g as r,d as s,_ as t,p as u};