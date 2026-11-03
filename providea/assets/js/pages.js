// Pages: solusi, tentang, jadwal. Owner: agent C (Pages), see providea/REVISI-2026-11-03b.md.
// Reads document.documentElement.lang and re-renders every generated string on the window event "pv:lang".
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const L = () => (root.lang === 'en' ? 'en' : 'id');
  const onLang = fn => { fn(); window.addEventListener('pv:lang', fn); };
  const pad = n => String(n).padStart(2, '0');

  /* Scroll reveal for [data-rv] (reuses .reveal from style.css), staggered inside each parent */
  const rvEls = $$('[data-rv]');
  if (rvEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rvEls.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-rv'));
      el.style.setProperty('--d', Math.min(sibs.indexOf(el) * 0.08, 0.4) + 's');
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* Solusi: sticky pillar nav highlights the section in view */
  const nav = $('.pg-nav nav');
  if (nav) {
    const links = $$('a[href^="#"]', nav);
    const targets = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const mark = id => links.forEach(a => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('on', on);
      if (on) { a.setAttribute('aria-current', 'true'); const r = a.getBoundingClientRect(), n = nav.getBoundingClientRect(); if (r.left < n.left || r.right > n.right) nav.scrollTo({ left: nav.scrollLeft + r.left - n.left - 24, behavior: still.matches ? 'auto' : 'smooth' }); }
      else a.removeAttribute('aria-current');
    });
    let raf = 0;
    const update = () => {
      raf = 0;
      let cur = '';
      const line = innerHeight * 0.4;
      targets.forEach(t => { if (t.getBoundingClientRect().top <= line) cur = t.id; });
      mark(cur);
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* Solusi: connect flow draws its line when it enters the view */
  const flow = $('.flow');
  if (flow) {
    if ('IntersectionObserver' in window) {
      const fio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { flow.classList.add('in'); fio.disconnect(); } }, { threshold: 0.35 });
      fio.observe(flow);
    } else flow.classList.add('in');
  }

  /* Tentang: timeline line grows with the scroll, entries switch on as the line passes them */
  const tl = $('.tl');
  if (tl) {
    const items = $$('li', tl);
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = innerHeight * 0.55;
      const r = tl.getBoundingClientRect();
      tl.style.setProperty('--k', Math.max(0, Math.min(1, (line - r.top) / r.height)).toFixed(3));
      items.forEach(li => li.classList.toggle('on', li.getBoundingClientRect().top < line));
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  /* Tentang: office clocks and the time difference, DST-correct through Intl */
  const offices = $$('.office[data-tz]');
  if (offices.length) {
    // wall-clock reading of an instant in a zone, as a UTC number, so two zones can be compared
    const wall = (tz, d) => {
      const p = {};
      new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d).forEach(x => { p[x.type] = +x.value; });
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    };
    const abbr = (tz, d) => {
      if (tz === 'Asia/Jakarta') return 'WIB';
      const x = new Intl.DateTimeFormat('en-AU', { timeZone: tz, timeZoneName: 'short' }).formatToParts(d).find(p => p.type === 'timeZoneName');
      return x ? x.value : '';
    };
    const diffEl = $('[data-odiff]');
    const tick = () => {
      const now = new Date();
      offices.forEach(o => {
        const tz = o.dataset.tz, w = new Date(wall(tz, now));
        const t = $('time', o);
        t.textContent = pad(w.getUTCHours()) + ':' + pad(w.getUTCMinutes());
        t.dateTime = t.textContent;
        $('.tzn', o).textContent = abbr(tz, now);
      });
      if (diffEl) {
        const h = Math.round((wall('Australia/Melbourne', now) - wall('Asia/Jakarta', now)) / 36e5);
        const mel = abbr('Australia/Melbourne', now);
        const a = new Date(now); a.setHours(12, 0, 0, 0);
        diffEl.textContent = L() === 'en'
          ? `Melbourne is ${h} hours ahead of Jakarta (${mel}). A 09:00 to 17:00 WIB workday is ${pad(9 + h)}:00 to ${pad(17 + h)}:00 in Melbourne.`
          : `Melbourne ${h} jam lebih awal dari Jakarta (${mel}). Jam kerja 09:00 sampai 17:00 WIB sama dengan ${pad(9 + h)}:00 sampai ${pad(17 + h)}:00 di Melbourne.`;
      }
    };
    onLang(tick);
    setInterval(tick, 30000);
  }

  /* Jadwal: booking form. Nothing is stored; the two buttons only build a Google Calendar link and a WhatsApp message. */
  const form = $('#bk-form');
  if (form) {
    const T = {
      id: {
        date: 'Tanggal', slot: 'Jam', topics: 'Topik',
        mel: 'Melbourne', wib: 'WIB',
        e_date: 'Pilih tanggal.', e_slot: 'Pilih jam.', e_name: 'Isi nama Anda.', e_biz: 'Isi nama bisnis Anda.',
        e_wa: 'Nomor WhatsApp belum benar. Contoh: 0812 3456 7890.', e_topic: 'Pilih minimal satu topik.',
        sumHint: 'Pilih tanggal dan jam untuk melihat ringkasan.',
        sumIn: 'Waktu Jakarta (WIB) dan Melbourne', next: 'Berikutnya',
        okCal: 'Undangan terbuka di tab baru. Simpan acaranya agar hello@providea.com ikut diundang.',
        okWa: 'WhatsApp terbuka di tab baru. Kirim pesannya untuk mengonfirmasi jadwal.',
        blocked: 'Tab baru tidak terbuka. Izinkan pop-up untuk situs ini, lalu coba lagi.',
        fix: 'Lengkapi isian yang ditandai.',
        title: b => `Meeting Providea: ${b}`,
        det: d => ['Meeting 30 menit lewat Google Meet bersama Providea.', '', `Waktu: ${d.when}`, `Nama: ${d.name}`, `Bisnis: ${d.biz}`, `Topik: ${d.topics}`, ...(d.wa ? [`WhatsApp: ${d.wa}`] : []), ...(d.note ? [`Catatan: ${d.note}`] : [])].join('\n'),
        wa: d => ['Halo Providea, saya ingin konfirmasi jadwal meeting 30 menit.', '', `Waktu: ${d.when}`, `Nama: ${d.name}`, `Bisnis: ${d.biz}`, `Topik: ${d.topics}`, ...(d.wa ? [`WhatsApp: ${d.wa}`] : []), ...(d.note ? [`Catatan: ${d.note}`] : [])].join('\n'),
        topicLbl: { web: 'Website', seo: 'SEO & GEO', sell: 'Jual online', erp: 'ERP / aplikasi internal', act: 'Aktivasi' },
      },
      en: {
        date: 'Date', slot: 'Time', topics: 'Topics',
        mel: 'Melbourne', wib: 'WIB',
        e_date: 'Choose a date.', e_slot: 'Choose a time.', e_name: 'Enter your name.', e_biz: 'Enter your business name.',
        e_wa: 'Check your WhatsApp number. Example: +62 812 3456 7890.', e_topic: 'Choose at least one topic.',
        sumHint: 'Choose a date and time to see the summary.',
        sumIn: 'Jakarta (WIB) and Melbourne time', next: 'Next',
        okCal: 'The invite opened in a new tab. Save the event so hello@providea.com is invited too.',
        okWa: 'WhatsApp opened in a new tab. Send the message to confirm the time.',
        blocked: 'The new tab did not open. Allow pop-ups for this site, then try again.',
        fix: 'Complete the highlighted fields.',
        title: b => `Providea meeting: ${b}`,
        det: d => ['30-minute meeting on Google Meet with Providea.', '', `Time: ${d.when}`, `Name: ${d.name}`, `Business: ${d.biz}`, `Topics: ${d.topics}`, ...(d.wa ? [`WhatsApp: ${d.wa}`] : []), ...(d.note ? [`Note: ${d.note}`] : [])].join('\n'),
        wa: d => ['Hello Providea, I would like to confirm a 30-minute meeting.', '', `Time: ${d.when}`, `Name: ${d.name}`, `Business: ${d.biz}`, `Topics: ${d.topics}`, ...(d.wa ? [`WhatsApp: ${d.wa}`] : []), ...(d.note ? [`Note: ${d.note}`] : [])].join('\n'),
        topicLbl: { web: 'Website', seo: 'SEO & GEO', sell: 'Sell online', erp: 'ERP / internal app', act: 'Activation' },
      },
    };
    const TOPICS = ['web', 'seo', 'sell', 'erp', 'act'];
    const DAY = 864e5, WIB_MS = 7 * 36e5, MEET = 30 * 6e4;
    const state = { date: null, slot: null, topics: new Set(), touched: new Set(), submitted: false };
    const loc = () => (L() === 'en' ? 'en-AU' : 'id-ID');

    // The next 10 weekdays, counted in Jakarta. Each date is a UTC-midnight number that stands for that calendar day.
    const jkt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number);
    const dates = [];
    for (let d = Date.UTC(jkt[0], jkt[1] - 1, jkt[2]); dates.length < 10;) { d += DAY; if (new Date(d).getUTCDay() % 6) dates.push(d); }
    // 09:00 to 16:30 WIB every 30 minutes, so the 30-minute meeting ends by 17:00
    const slots = []; for (let m = 9 * 60; m < 17 * 60; m += 30) slots.push(m);
    const instant = (date, m) => date + m * 6e4 - WIB_MS;   // UTC ms of a WIB wall-clock time
    const melFmt = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Melbourne', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short', day: 'numeric' });
    const mel = ms => {
      const p = {}; melFmt.formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
      const wibDay = new Date(ms + WIB_MS).getUTCDate();
      return { clock: `${p.hour}:${p.minute}`, tz: p.timeZoneName, next: +p.day !== wibDay };
    };
    const fmtDate = (d, o) => new Intl.DateTimeFormat(loc(), Object.assign({ timeZone: 'UTC' }, o)).format(new Date(d));
    const refDate = () => state.date ?? dates[0];

    const dWrap = $('[data-dates]', form), sWrap = $('[data-slots]', form), tWrap = $('[data-topics]', form);
    const sum = $('[data-sum]', form), status = $('[data-status]', form);
    const fName = $('#bk-name'), fBiz = $('#bk-biz'), fWa = $('#bk-wa'), fNote = $('#bk-note');
    const errEl = k => $(`[data-err="${k}"]`, form);

    // Build the radio groups once; labels are repainted on language change
    dWrap.innerHTML = dates.map((d, i) => `<button type="button" class="bk-pick" role="radio" aria-checked="false" tabindex="${i ? -1 : 0}" data-d="${d}"><span class="a"></span><span class="b"></span><span class="c"></span></button>`).join('');
    sWrap.innerHTML = slots.map((m, i) => `<button type="button" class="bk-pick" role="radio" aria-checked="false" tabindex="${i ? -1 : 0}" data-m="${m}"><span class="b">${pad(Math.floor(m / 60))}:${pad(m % 60)}</span><span class="c"></span></button>`).join('');
    tWrap.innerHTML = TOPICS.map(k => `<button type="button" class="bk-chip" aria-pressed="false" data-t="${k}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg><span></span></button>`).join('');

    const dBtns = $$('[data-d]', dWrap), sBtns = $$('[data-m]', sWrap), tBtns = $$('[data-t]', tWrap);

    const paintDates = () => dBtns.forEach(b => {
      const d = +b.dataset.d;
      $('.a', b).textContent = fmtDate(d, { weekday: 'short' });
      $('.b', b).textContent = fmtDate(d, { day: 'numeric' });
      $('.c', b).textContent = fmtDate(d, { month: 'short' });
      b.setAttribute('aria-label', fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }));
    });
    const paintSlots = () => {
      const ref = refDate();
      sBtns.forEach(b => {
        const m = mel(instant(ref, +b.dataset.m));
        $('.c', b).textContent = `${m.clock}${m.next ? '+1' : ''} ${m.tz}`;
        b.setAttribute('aria-label', `${b.firstChild.textContent} ${T[L()].wib}, ${m.clock} ${m.tz} ${T[L()].mel}`);
      });
    };
    const paintTopics = () => tBtns.forEach(b => { $('span', b).textContent = T[L()].topicLbl[b.dataset.t]; });

    const whenText = () => {
      const t = instant(state.date, state.slot), m = mel(t);
      const day = fmtDate(state.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const c = `${pad(Math.floor(state.slot / 60))}:${pad(state.slot % 60)}`;
      return `${day}, ${c} ${T[L()].wib} (${m.clock}${m.next ? '+1' : ''} ${m.tz} ${T[L()].mel})`;
    };
    const paintSum = () => {
      const ready = state.date != null && state.slot != null;
      sum.classList.toggle('ready', ready);
      $('.txt', sum).innerHTML = ready
        ? `<b>${whenText()}</b>${L() === 'en' ? '30 minutes on Google Meet' : '30 menit lewat Google Meet'}`
        : T[L()].sumHint;
    };

    // Roving radio group: arrows move and select, Home/End jump, Tab leaves the group
    const radio = (btns, onPick, cols) => {
      const set = (b, focus) => {
        btns.forEach(x => { const on = x === b; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
        if (focus) b.focus();
        onPick(b);
      };
      btns.forEach((b, i) => {
        b.addEventListener('click', () => set(b, false));
        b.addEventListener('keydown', e => {
          const k = e.key; let j = -1;
          if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + (k === 'ArrowDown' && cols ? cols() : 1)) % btns.length;
          else if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - (k === 'ArrowUp' && cols ? cols() : 1) + btns.length) % btns.length;
          else if (k === 'Home') j = 0; else if (k === 'End') j = btns.length - 1;
          if (j > -1) { e.preventDefault(); set(btns[j], true); }
        });
      });
    };
    const colsOf = w => () => getComputedStyle(w).gridTemplateColumns.split(' ').length;
    radio(dBtns, b => { state.date = +b.dataset.d; state.touched.add('date'); paintSlots(); paintSum(); check(); }, colsOf(dWrap));
    radio(sBtns, b => { state.slot = +b.dataset.m; state.touched.add('slot'); paintSum(); check(); }, colsOf(sWrap));
    tBtns.forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.t;
      if (state.topics.has(k)) state.topics.delete(k); else state.topics.add(k);
      b.setAttribute('aria-pressed', String(state.topics.has(k)));
      state.touched.add('topic'); check();
    }));

    // Validation: a field shows its message after it is touched, or after the first send attempt
    const waOk = v => { const d = v.replace(/\D/g, ''); return /^\+?[\d\s\-().]+$/.test(v) && d.length >= 8 && d.length <= 15; };
    const rules = {
      date: () => state.date != null, slot: () => state.slot != null,
      name: () => fName.value.trim().length >= 2, biz: () => fBiz.value.trim().length >= 2,
      wa: () => !fWa.value.trim() || waOk(fWa.value.trim()), topic: () => state.topics.size > 0,
    };
    const inputs = { name: fName, biz: fBiz, wa: fWa };
    const check = () => {
      let first = null;
      Object.keys(rules).forEach(k => {
        const bad = !rules[k]();
        const show = bad && (state.submitted || state.touched.has(k));
        const el = errEl(k);
        el.hidden = !show;
        if (show) el.textContent = T[L()]['e_' + k];
        if (inputs[k]) { if (show) inputs[k].setAttribute('aria-invalid', 'true'); else inputs[k].removeAttribute('aria-invalid'); }
        if (bad && !first) first = k;
      });
      return first;
    };
    Object.entries(inputs).forEach(([k, el]) => {
      el.addEventListener('blur', () => { state.touched.add(k); check(); });
      el.addEventListener('input', () => { if (state.touched.has(k) || state.submitted) check(); });
    });

    const data = () => ({
      name: fName.value.trim(), biz: fBiz.value.trim(), wa: fWa.value.trim(), note: fNote.value.trim(),
      topics: TOPICS.filter(k => state.topics.has(k)).map(k => T[L()].topicLbl[k]).join(', '),
      when: whenText(),
    });
    const stamp = ms => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const calUrl = () => {
      const d = data(), start = instant(state.date, state.slot);
      return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        + '&text=' + encodeURIComponent(T[L()].title(d.biz))
        + '&dates=' + stamp(start) + '/' + stamp(start + MEET)
        + '&details=' + encodeURIComponent(T[L()].det(d))
        + '&add=hello@providea.com';
    };
    const waUrl = () => {
      let n = '';
      try { if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.whatsapp) n = String(CONFIG.whatsapp).replace(/\D/g, ''); } catch (e) {}
      return `https://wa.me/${n}?text=${encodeURIComponent(T[L()].wa(data()))}`;
    };
    let statusKey = '';
    const setStatus = k => { statusKey = k; status.textContent = k ? T[L()][k] : ''; status.style.color = k === 'blocked' || k === 'fix' ? 'var(--err)' : ''; };
    const send = (build, okKey) => {
      state.submitted = true;
      const bad = check();
      if (bad) {
        setStatus('fix');
        const t = inputs[bad] || $(`[data-g="${bad}"] [role=radio][tabindex="0"], [data-g="${bad}"] [data-t]`, form);
        if (t) t.focus({ preventScroll: true });
        (errEl(bad).closest('fieldset, .bk-field') || errEl(bad)).scrollIntoView({ block: 'center', behavior: still.matches ? 'auto' : 'smooth' });
        return;
      }
      const w = window.open(build(), '_blank');
      if (w) { try { w.opener = null; } catch (e) {} setStatus(okKey); } else setStatus('blocked');
    };
    $('[data-act="cal"]', form).addEventListener('click', () => send(calUrl, 'okCal'));
    $('[data-act="wa"]', form).addEventListener('click', () => send(waUrl, 'okWa'));
    form.addEventListener('submit', e => { e.preventDefault(); send(calUrl, 'okCal'); });

    onLang(() => {
      paintDates(); paintSlots(); paintTopics(); paintSum(); check();
      dWrap.setAttribute('aria-label', T[L()].date); sWrap.setAttribute('aria-label', T[L()].slot); tWrap.setAttribute('aria-label', T[L()].topics);
      if (statusKey) setStatus(statusKey);
    });
  }
})();
