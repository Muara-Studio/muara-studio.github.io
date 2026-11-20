/* Providea Loyalty demo · WhatsApp pieces shared by the three demo views (HP member, kasir, dashboard).
   Scheme (20 Nov 2026): Providea is not a Meta partner, so messages go through the official WhatsApp Cloud API
   from Providea's own number, display name "Providea Loyalty". The screens are a simplified demo illustration in the
   WhatsApp colour family: Tabler icons only (no WhatsApp logo bitmap), our own "Akun bisnis" chip (not Meta's badge),
   and the member always sends from their own WhatsApp. Nothing shows a regular WhatsApp app being automated. */
(function () {
  'use strict';
  var P = window.PL; if (!P) return;
  var T = P.T;
  Object.assign(window.ICONS, {
    'checks': '<path d="M7 12l5 5l10 -10"/><path d="M2 12l5 5m5 -5l5 -5"/>',
    'login': '<path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"/><path d="M21 12h-13l3 -3"/><path d="M11 15l-3 -3"/>',
    'link': '<path d="M9 15l6 -6"/><path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464"/><path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463"/>',
    'gauge': '<path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M13.41 10.59l2.59 -2.59"/><path d="M7 12a5 5 0 0 1 5 -5"/>',
    'template': '<path d="M4 5a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1l0 -2"/><path d="M4 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6"/><path d="M14 12l6 0"/><path d="M14 16l6 0"/><path d="M14 20l6 0"/>',
    'message-2': '<path d="M8 9h8"/><path d="M8 13h6"/><path d="M9 18h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-3l-3 3l-3 -3"/>',
    'lock-check': '<path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v.5"/><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"/><path d="M8 11v-4a4 4 0 1 1 8 0v4"/><path d="M15 19l2 2l4 -4"/>'
  });

  /* keyword per brand: DAFTAR KAMTONO / DAFTAR MENDAYA / DAFTAR BOBS (EN: JOIN …) */
  var KW = { kamtono: 'KAMTONO', mendaya: 'MENDAYA', bobs: 'BOBS' };
  var CODE = '482913';
  function word() { return KW[P.brand()] || 'KAMTONO'; }
  function kwJoin() { return T('DAFTAR {b}', { b: word() }); }
  function kwLogin(c) { return T('MASUK {c}', { c: c || CODE }); }
  function fmtCode(c) { c = c || CODE; return c.slice(0, 3) + ' ' + c.slice(3); }
  /* our own label next to the sender name: a small green check chip, not Meta's verified badge */
  function chip() { return '<span class="wa-biz">' + ic('check', 11) + '<span>' + T('Akun bisnis') + '</span></span>'; }
  function avatar(s, cls) { s = s || 36; return '<span class="wa-av ' + (cls || '') + '" style="--s:' + s + 'px">' + P.mark(Math.round(s * 0.56)) + '</span>'; }
  /* member page link, e.g. kamtono.providea.id/m/N7K4Q2 (letters and digits alternate, so it never spells a word) */
  function link(m) {
    var L = 'BCDFGHJKLMNPQRTVWXZ', D = '23456789', s = String((m && (m.id + m.no)) || 'x'), h = 7, out = '';
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    for (var j = 0; j < 6; j++) { out += j % 2 ? D[h % D.length] : L[h % L.length]; h = Math.floor(h / 7) + j * 131 + 17; }
    return P.BRAND.domain + '/m/' + out;
  }
  function digits(p) { var d = String(p || '').replace(/\D/g, '').replace(/^62/, '0'); if (d && d[0] !== '0') d = '0' + d; return d; }
  function phoneOk(p) { return /^08\d{8,11}$/.test(digits(p)); }
  function welcomeVoucher(id, now) { return { id: P.uid('v-'), memberId: id, title: 'Gratis topping', src: 'Hadiah sambutan', code: P.code('WL' + Math.floor(Math.random() * 9)), exp: now + 30 * P.DAY, kind: 'free', value: 8000 }; }

  /* 1. the member sends DAFTAR <brand>: the number is verified by the message itself (no OTP). Same record id as the
     phone join (m-new), so the member phone, the cashier tablet and the dashboard all show the same new member. */
  function joinViaWa(o) {
    o = o || {};
    var S = P.S, id = 'm-new', now = Date.now();
    ['members', 'vouchers', 'log', 'inbox'].forEach(function (k) { S[k] = S[k].filter(function (x) { return (x.memberId || x.id) !== id; }); });
    S.checkins = S.checkins.filter(function (c) { return c.memberId !== id; });
    S.members.unshift({ id: id, name: o.name || 'Nadia Putri', phone: digits(o.phone || '081312345678'), email: '', spend: 0, points: 0, stamps: 0, visits: 0, joined: now, last: now,
      promoWa: false, promoEmail: false, bday: '', no: '2611-' + String(2000 + Math.floor(Math.random() * 7000)), wallet: '', via: 'wa' });
    S.vouchers.unshift(welcomeVoucher(id, now));
    S.log.unshift({ id: P.uid('l'), kind: 'join', memberId: id, at: now, by: 'Daftar via WhatsApp', outlet: 'Cempaka' });
    S.inbox.unshift({ id: P.uid('i'), memberId: id, ch: 'wa', title: 'Selamat datang di Kamtono', body: 'Kamu member Silver. Voucher gratis topping sudah ada di halaman member.', at: now, read: false });
    S.checkins.unshift({ id: P.uid('c'), memberId: id, at: now, seen: false, isNew: true, via: 'wa' });
    P.save();
    return P.member(id);
  }

  /* 2. the cashier types the number (with the customer's consent): a utility template asks the customer to complete
     the sign-up. The record exists at once, so today's purchase can already earn points. */
  function invite(o) {
    o = o || {};
    var S = P.S, now = Date.now(), id = 'm-k-' + now.toString(36), ph = digits(o.phone);
    var name = (o.name || '').trim() || T('Pelanggan baru');
    S.members.unshift({ id: id, name: name, phone: ph, email: '', spend: 0, points: 0, stamps: 0, visits: 0, joined: now, last: now,
      promoWa: false, promoEmail: false, bday: '', no: '2611-' + String(3000 + Math.floor(Math.random() * 6000)), wallet: '', pending: true, via: 'invite' });
    S.vouchers.unshift(welcomeVoucher(id, now));
    S.log.unshift({ id: P.uid('l'), kind: 'join', memberId: id, at: now, by: 'Undangan WhatsApp: Ayu', outlet: 'Cempaka' });
    S.inbox.unshift({ id: P.uid('i'), memberId: id, ch: 'wa', kind: 'invite', title: 'Lengkapi pendaftaran member Kamtono', body: 'Nomor ini didaftarkan sebagai member Kamtono di Outlet Cempaka. Lengkapi pendaftaran untuk melihat kartu dan poin.', at: now, read: false });
    (S.wa = S.wa || []).unshift({ id: P.uid('w'), kind: 'invite', memberId: id, at: now, notified: false, seen: false });
    P.addAudit(o.by || 'Ayu Kartika', 'Mengirim undangan WhatsApp ke {m}', { m: P.maskPhone(ph) });
    P.save();
    return P.member(id);
  }
  function lastInvite() { var l = (P.S.wa || []).filter(function (w) { return w.kind === 'invite' && P.member(w.memberId); }); return l[0] || null; }

  window.PLWA = { word: word, kwJoin: kwJoin, kwLogin: kwLogin, code: CODE, fmtCode: fmtCode, chip: chip, avatar: avatar, link: link,
    digits: digits, phoneOk: phoneOk, joinViaWa: joinViaWa, invite: invite, lastInvite: lastInvite };
})();
