BCT.startApp = () => {
  'use strict';
  const { config: CFG, cats: CATS, dests: DESTS, offers: OFFERS } = window.BCT;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Helpers ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('bct:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('bct:' + k, JSON.stringify(v)); } catch (e) { /* storage off */ } }
  };
  const MONTHS = ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'];
  const pad2 = n => String(n).padStart(2, '0');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const parseDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtD = (d, year = true) => `${d.getDate()} ${MONTHS[d.getMonth()]}${year ? ' ' + d.getFullYear() : ''}`;
  const fmtDate = (s, year = true) => fmtD(parseDate(s), year);
  function span(s, nights) {
    const a = parseDate(s), b = parseDate(s); b.setDate(b.getDate() + nights);
    if (a.getFullYear() !== b.getFullYear()) return `${fmtD(a)} – ${fmtD(b)}`;
    if (a.getMonth() !== b.getMonth()) return `${fmtD(a, false)} – ${fmtD(b)}`;
    return `${a.getDate()}–${b.getDate()} ${MONTHS[a.getMonth()]} ${a.getFullYear()}`;
  }
  const num = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const money = n => num(n) + ' €';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const nightsTxt = n => plural(n, 'natë', 'netë');
  const paxText = (a, c) => plural(a, 'i rritur', 'të rritur') + (c ? `, ${plural(c, 'fëmijë', 'fëmijë')}` : '');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offerBy = {};
  OFFERS.forEach(o => {
    offerBy[o.id] = o;
    o.future = o.dates.map(([d, s, note]) => ({ d, s, note })).filter(x => parseDate(x.d) >= today);
    o.next = o.future.find(x => x.s > 0) || null;
    o.deal = o.old && o.old > o.price ? Math.round((1 - o.price / o.old) * 100) : 0;
    o.dealTxt = o.deal ? `${o.cats.includes('earlybooking') ? 'Early Booking' : 'Ulje'} −${o.deal}%` : '';
  });
  const destBy = Object.fromEntries(DESTS.map(d => [d.key, d]));
  const catLabel = Object.fromEntries(CATS);
  const live = () => OFFERS.filter(o => o.next).sort((a, b) => a.rank - b.rank);
  const netOf = o => Math.round(o.price * (1 - o.commission));
  const allDeps = [];
  OFFERS.forEach(o => o.future.forEach(x => allDeps.push({ o, d: x.d, s: x.s, date: parseDate(x.d) })));
  allDeps.sort((a, b) => a.date - b.date);

  const TONE = { maldive: 'l', 'maldive-dusk': 'l', zanzibar: 'l', safari: 'd', dubai: 'd', desert: 'l', antalya: 'l', bodrum: 'l', 'aegean-dusk': 'd', laponi: 'd', jordani: 'd', seychelles: 'l', japoni: 'l' };
  const moodCls = m => `mood mood--${m} tone-${TONE[m] || 'd'}`;
  /* Fotot: BCT.photoSrc (shtohen gjatë ndërtimit), BCT.offerPhotos (cila foto për cilën ofertë). */
  const PHS = BCT.photoSrc || {}, OPH = BCT.offerPhotos || {}, DPH = BCT.destPhotos || {};
  const photoOf = o => {
    if (o.photo) { const src = /^(https?:|data:|\/)/.test(o.photo) ? o.photo : PHS[o.photo]; if (src) return { src, pos: o.photoPos || '50% 50%' }; }
    const p = OPH[o.id]; return p && PHS[p[0]] ? { src: PHS[p[0]], pos: o.photoPos || p[1] || '50% 50%' } : null;
  };
  const photoLayer = o => { const p = photoOf(o); return p ? `<img class="ph" src="${p.src}" alt="" decoding="async" data-pos="${p.pos}"><span class="ph-shade" aria-hidden="true"></span>` : ''; };
  const moodFor = o => (photoOf(o) ? `mood mood--${o.mood} tone-d has-photo` : moodCls(o.mood));
  const fixPos = root => $$('img.ph[data-pos]', root || document).forEach(im => { im.style.objectPosition = im.dataset.pos; im.removeAttribute('data-pos'); });

  const ICONS = {
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    whatsapp: '<path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.4Z"/><path d="M9.1 8.4c.3-.6.7-.6 1-.6h.4l1 2.3-.8.9a6.2 6.2 0 0 0 2.4 2.4l.9-.8 2.3 1v.4c0 .3 0 .7-.6 1-1 .5-2.5.3-4.3-1.2S8.6 10.4 9.1 8.4Z" fill="currentColor" stroke="none"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3Z"/>',
    headset: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/>',
    copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
  };
  const ic = (n, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[n] || ''}</svg>`;
  const routeInline = r => r.map((c, i) => (i ? ic('plane') : '') + `<span>${c}</span>`).join('');
  const waNum = () => String(CFG.whatsapp || '').replace(/\D/g, '');
  const waHref = text => `https://wa.me/${waNum()}?text=${encodeURIComponent(text)}`;
  const mailHref = (subject, body) => `mailto:${CFG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  /* ---------- State ---------- */
  const state = {
    mode: 'b2c',
    partner: store.get('partner', null),
    markup: store.get('markup', 12),
    favs: new Set(store.get('favs', []).filter(id => offerBy[id])),
    cat: 'all', fav: false,
    requests: []
  };
  const b2b = () => state.mode === 'b2b';
  const shownPrice = o => (b2b() ? netOf(o) : o.price);
  const fromWord = () => (b2b() ? 'NET nga' : 'nga');

  /* ---------- Pricing ---------- */
  function defaults(o) { const s = {}; (o.options || []).forEach((g, i) => { s[i] = g.def || 0; }); return s; }
  function quote(o, sel, adults, children) {
    let pp = o.price, nights = o.nights;
    (o.options || []).forEach((g, i) => { const c = g.choices[sel[i] != null ? sel[i] : (g.def || 0)]; pp += c.d || 0; nights += c.n || 0; });
    const adultUnit = pp, childUnit = Math.round(pp * o.child), single = adults === 1 ? Math.round(pp * o.single) : 0;
    const total = adults * adultUnit + children * childUnit + single;
    const net = Math.round(total * (1 - o.commission));
    return { pp, nights, adultUnit, childUnit, single, total, net, commission: total - net, client: Math.round(net * (1 + state.markup / 100)) };
  }
  function optionValues(o, sel) { const v = {}; (o.options || []).forEach((g, i) => { if (g.key) v[g.key] = g.choices[sel[i] != null ? sel[i] : 0].v; }); return v; }
  const program = (o, sel) => (o.plan ? o.plan(optionValues(o, sel)) : o.days);
  function dayList(days) { let n = 1; return days.map(([t, x, len]) => { len = len || 1; const lbl = len > 1 ? `Ditët ${n}–${n + len - 1}` : `Dita ${n}`; n += len; return { lbl, t, x }; }); }
  const picksText = (o, sel) => (o.options || []).map((g, gi) => `${g.name}: ${g.choices[sel[gi] != null ? sel[gi] : 0].l}`);
  function timelineHtml(o, sel) {
    const v = optionValues(o, sel), S = v.safari, B = v.beach, total = S + B + 2;
    const segs = [['fly', 1, 'Nisja', 'Dita 1'], ['safari', S, 'Safari', `Ditët 2–${S + 1}`], ['beach', B, 'Zanzibar', `Ditët ${S + 2}–${S + B + 1}`], ['fly', 1, 'Kthimi', `Dita ${total}`]];
    return `<div class="tl" role="img" aria-label="${S} ditë safari, ${B} netë plazh, gjithsej ${total} ditë">${segs.map(([t, n, a, b]) => `<div class="tl__seg tl__seg--${t}" data-n="${n}"><span class="tl__bar"></span><span class="tl__label"><b>${a}</b>${b}</span></div>`).join('')}</div>`;
  }
  function sizeTimeline(root) { $$('.tl__seg', root).forEach(s => { const n = +s.dataset.n; s.style.flex = `${n} 1 0`; s.querySelector('.tl__bar').style.setProperty('--n', n); }); }

  /* ---------- UI utilities ---------- */
  function injectIcons(root = document) { $$('i[data-i]', root).forEach(el => { el.outerHTML = ic(el.dataset.i); }); }
  function toast(msg) {
    const host = $$('dialog[open]').pop();
    let box = host ? host.querySelector(':scope > .toasts') : $('#toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); host.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; box.appendChild(t);
    setTimeout(() => t.classList.add('out'), 2400);
    setTimeout(() => t.remove(), 2800);
  }
  function showDialog(d) { if (!d.open) d.showModal(); document.documentElement.classList.add('modal-open'); }
  function closeDialog(d) { if (d.open) d.close(); }
  function scrollToId(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
  function refocus(root, attr, value) { const el = root.querySelector(`[${attr}="${value}"]`); if (el && !el.disabled) el.focus({ preventScroll: true }); }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      ($$('dialog[open]').pop() || document.body).appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove(); return ok;
    }
  }

  /* ---------- Globe story ---------- */
  const HOLIDAY = ['maldive', 'zanzibar', 'dubai', 'antalya', 'bodrum'];
  const CHAPTERS = [
    { key: 'eu', group: 'eu', title: 'Evropa.' },
    { key: 'holiday', holiday: true, title: 'Pushime.' }
  ].filter(ch => ch.group ? (BCT.flights || []).length : live().some(o => HOLIDAY.includes(o.dest)));
  const N = CHAPTERS.length + 1;
  let globe = null, stageUpdate = () => {};

  function euHtml(ch, i) {
    const F = BCT.flights || [], C = BCT.flightCountries || {}, counts = {};
    F.forEach(f => { counts[f.c] = (counts[f.c] || 0) + 1; });
    const top = Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 4), rest = Object.keys(counts).length - top.length;
    return `<div class="panel panel--chapter" data-phase="${i + 1}"><div class="chap">
      <p class="chap__route">PRN ${ic('plane')} ${F.length} qytete</p>
      <h2 class="chap__title">${ch.title}</h2>
      <p class="chap__line">${F.length} qytete, një nisje: Prishtina.</p>
      <p class="chap__text">Bileta avioni për familjen, punën dhe fundjavat, nga Gjermania dhe Zvicra te Suedia, Italia dhe Londra.</p>
      <div class="chap__facts">${top.map(([c, k]) => `<span>${k} në ${esc(C[c] ? C[c][1] : c)}</span>`).join('')}${rest > 0 ? `<span>dhe ${rest} vende të tjera</span>` : ''}</div>
      <div class="chap__cta"><a class="pill pill--white" href="#fluturime">Kërko biletë</a><a class="chev" href="#fluturime">Të gjitha qytetet ${ic('chevron')}</a></div>
    </div></div>`;
  }
  function chapterHtml(ch, i) {
    if (ch.group) return euHtml(ch, i);
    if (ch.holiday) return holidayHtml(ch, i);
    const o = offerBy[ch.offer], alt = ch.alt && offerBy[ch.alt] && offerBy[ch.alt].next ? offerBy[ch.alt] : null;
    const cheap = alt && alt.price < o.price ? alt : o;
    return `<div class="panel panel--chapter" data-phase="${i + 1}"><div class="chap">
      <p class="chap__route">${routeInline(ch.key === 'zanzibar' ? ['PRN', 'JRO', 'ZNZ'] : o.route)}</p>
      <h2 class="chap__title">${ch.title}</h2>
      <p class="chap__line">${ch.line}</p>
      <p class="chap__text">${ch.text}</p>
      <div class="chap__facts">${ch.facts.map(f => `<span>${f}</span>`).join('')}</div>
      ${ch.countdown ? '<p class="chap__count" data-countdown></p>' : ''}
      <p class="chap__price">${fromWord()}<b>${money(shownPrice(cheap))}</b>${cheap.old && !b2b() ? `<s>${money(cheap.old)}</s>` : ''}</p>
      <div class="chap__cta"><button type="button" class="pill pill--white" data-details="${o.id}">Detajet</button>${alt ? `<button type="button" class="chev" data-details="${alt.id}">${ch.altLabel} ${ic('chevron')}</button>` : ''}<button type="button" class="chev" data-configure="${o.id}">Rezervo ${ic('chevron')}</button></div>
    </div></div>`;
  }
  function holidayHtml(ch, i) {
    const rows = HOLIDAY.map(k => {
      const list = live().filter(o => o.dest === k); if (!list.length) return '';
      const top = list.slice().sort((x, y) => x.rank - y.rank)[0];
      return `<li><button type="button" class="hrow" data-details="${top.id}">${PHS[DPH[k]] ? `<img class="hrow__img" src="${PHS[DPH[k]]}" alt="" decoding="async">` : ''}<span class="hrow__name">${esc(destBy[k].name)}</span><span class="hrow__price">${fromWord()} <b>${money(Math.min(...list.map(shownPrice)))}</b></span>${ic('chevron')}</button></li>`;
    }).join('');
    return `<div class="panel panel--chapter" data-phase="${i + 1}"><div class="chap chap--holiday">
      <p class="chap__route">Pushime me fluturim të përfshirë</p>
      <h2 class="chap__title">${ch.title}</h2>
      <p class="chap__line">Fluturimi, hoteli dhe transferi, në një rezervim.</p>
      <ul class="hlist">${rows}</ul>
      <div class="chap__cta"><a class="pill pill--white" href="#ofertat">Shiko ofertat</a><a class="chev" href="#te-rralla">Koleksioni i rrallë ${ic('chevron')}</a></div>
    </div></div>`;
  }
  function renderPanels() {
    const hero = $('.panel--hero');
    $$('.panel--chapter').forEach(el => el.remove());
    hero.insertAdjacentHTML('afterend', CHAPTERS.map(chapterHtml).join(''));
    tickCountdown();
    stageUpdate(true);
  }
  function destSub(key) {
    const list = live().filter(o => o.dest === key);
    return list.length ? `${fromWord()} ${money(Math.min(...list.map(shownPrice)))}` : '';
  }
  function updateGlobeLabels() { $$('#globeLabels .glabel').forEach(el => { const k = el.dataset.key; if (k && k !== 'hub' && k !== 'cluster') { const s = el.querySelector('span'); if (s) s.textContent = destSub(k); } }); }
  function tickCountdown() {
    const dep = new Date(CFG.nye ? CFG.nye.departure : NaN);
    const el = $('[data-countdown]'); if (!el) return;
    const ms = dep - Date.now();
    if (isNaN(ms) || ms <= 0) { el.hidden = true; return; }
    const d = Math.floor(ms / 864e5);
    el.textContent = d >= 2 ? `Nisja pas ${d} ditësh` : d === 1 ? 'Nisja pas një dite' : 'Nisja sot';
  }
  function initStage() {
    const sec = $('#stage'), canvas = $('#globe');
    const small = window.innerWidth < 760;
    globe = BCT.Globe(canvas, $('#globeLabels'), {
      reduceMotion, points: small ? 11000 : 15000,
      hub: { lat: CFG.hub.lat, lon: CFG.hub.lon, label: CFG.hub.label },
      dests: DESTS.map(d => ({ key: d.key, lat: d.lat, lon: d.lon, label: d.name.split(' ')[0], sub: '', rare: !d.main, from: d.origin && CFG.hubs ? CFG.hubs[d.origin] || null : null }))
        .concat((BCT.flights || []).map((f, gi) => ({ key: 'fl-' + f.code, lat: f.lat, lon: f.lon, label: f.city.split(' ')[0], group: 'eu', gi, major: !!f.major, anchor: ['BRU', 'GVA', 'ZRH', 'LTN'].includes(f.code) ? 'left' : '' }))),
      originLabel: CFG.hubs && CFG.hubs.TIA ? CFG.hubs.TIA.label : '',
      cluster: (BCT.flights || []).length ? { lat: 51.5, lon: 8, label: 'Evropa', sub: `${BCT.flights.length} qytete` } : null
    });
    renderPanels(); updateGlobeLabels();
    const names = ['Hyrja', ...CHAPTERS.map(c => c.title.replace('.', ''))];
    $('#rail').innerHTML = names.map((n, k) => `<button type="button" data-rail="${k}" aria-label="${n}"></button>`).join('');
    const layout = (i, w, h) => {
      const mob = w < 760;
      if (i === 0) {
        if (w >= 1000) return { cx: w * .71, cy: h * .54, R: Math.min(h * .42, w * .29) };
        const R = Math.min(w * .78, h * .4);
        return { cx: w / 2, cy: h * .56 + R, R };
      }
      const ch = CHAPTERS[i - 1];
      if (ch.group) return mob ? { cx: w / 2, cy: h * .3, R: w * 1.55 } : { cx: w * .66, cy: h * .5, R: Math.min(h * 1.3, w * .9) };
      if (mob) return { cx: w / 2, cy: h * .25, R: Math.min(w * .38, h * .19) };
      return { cx: w * .67, cy: h * .52, R: Math.min(h * .4, w * .28) };
    };
    let phase = -1;
    const apply = i => {
      const { w, h } = globe.size, L = layout(i, w, h);
      if (i === 0) globe.focus(Object.assign({ mode: 'hero', all: true }, w >= 1000 ? { lat: 34, lon: 30 } : { lat: 26, lon: 30 }, L));
      else if (CHAPTERS[i - 1].group) globe.focus(Object.assign({ mode: 'chapter', group: CHAPTERS[i - 1].group, lat: 50, lon: 13 }, L));
      else globe.focus(Object.assign({ mode: 'hero', lat: 22, lon: 46 }, L));
      $$('#rail [data-rail]').forEach(b => b.setAttribute('aria-current', String(+b.dataset.rail === i)));
    };
    const cue = $('#cue'), hint = $('#dragHint');
    if (!finePointer) hint.hidden = true;
    stageUpdate = force => {
      const r = sec.getBoundingClientRect(), vh = window.innerHeight, total = Math.max(1, r.height - vh);
      const p = Math.min(1, Math.max(0, -r.top / total)), f = p * N, i = Math.min(N - 1, Math.floor(f));
      $$('#panels .panel').forEach(el => {
        const k = +el.dataset.phase;
        let o;
        if (k === 0) o = 1 - BCT.smooth(.55, .9, f);
        else if (k === N - 1) o = BCT.smooth(k - .02, k + .16, f);
        else o = BCT.smooth(k - .02, k + .16, f) * (1 - BCT.smooth(k + .84, k + 1.02, f));
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < .01 ? 'hidden' : 'visible';
        el.style.transform = `translate3d(0, ${((1 - o) * (k === 0 ? -24 : 28)).toFixed(1)}px, 0)`;
        el.classList.toggle('is-on', o > .5);
      });
      cue.style.opacity = (1 - BCT.smooth(.04, .3, f)).toFixed(3);
      if (i !== phase || force) { phase = i; apply(i); }
    };
    window.addEventListener('scroll', () => stageUpdate(), { passive: true });
    let rz = 0;
    window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { globe.resize(); stageUpdate(true); }); });
    $('#rail').addEventListener('click', e => {
      const b = e.target.closest('[data-rail]'); if (!b) return;
      const k = +b.dataset.rail, total = sec.offsetHeight - window.innerHeight;
      window.scrollTo({ top: sec.offsetTop + (k === 0 ? 0 : (k + .5) / N * total), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    canvas.addEventListener('pointerdown', () => { hint.style.opacity = '0'; }, { once: true });
    stageUpdate(true); globe.snap();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(en => (en.isIntersecting ? globe.start() : globe.stop()))).observe(sec);
    } else globe.start();
    document.addEventListener('visibilitychange', () => { if (document.hidden) globe.stop(); else if (sec.getBoundingClientRect().bottom > 0) globe.start(); });
    setInterval(tickCountdown, 60000);
  }

  /* ---------- Bento offers ---------- */
  function tileHtml(o, wide) {
    const tone = photoOf(o) ? 'd' : (TONE[o.mood] || 'd');
    const eyebrow = o.dealTxt || o.tag;
    const price = b2b() ? `NET nga<b>${money(netOf(o))}</b>` : `nga<b>${money(o.price)}</b>${o.old ? `<s>${money(o.old)}</s>` : ''}`;
    return `<article class="tile ${moodFor(o)}${wide ? ' tile--wide' : ''}">${photoLayer(o)}
      <button type="button" class="fav" data-fav="${o.id}" aria-pressed="${state.favs.has(o.id)}" aria-label="Ruaje ofertën ${esc(o.title)}">${ic('heart')}</button>
      <p class="tile__eyebrow">${esc(eyebrow)}</p>
      <h3 class="tile__title">${esc(o.title)}</h3>
      <p class="tile__sub">${nightsTxt(o.nights)}, ${esc(o.stay)}</p>
      <p class="tile__price">${price}</p>
      <div class="tile__cta"><button type="button" class="pill pill--sm ${tone === 'd' ? 'pill--white' : 'pill--dark'}" data-details="${o.id}">Detajet</button><button type="button" class="chev" data-configure="${o.id}">Rezervo ${ic('chevron')}</button></div>
    </article>`;
  }
  function renderBento() {
    let list = live();
    if (state.cat === 'all') list = list.filter(o => !o.cats.includes('rare'));
    else list = list.filter(o => o.cats.includes(state.cat));
    if (state.fav) list = live().filter(o => state.favs.has(o.id));
    const grid = $('#bento');
    $('#bentoMore').hidden = true;
    if (!list.length) {
      grid.innerHTML = state.fav
        ? '<div class="empty"><h3>Ende nuk keni oferta të ruajtura.</h3><p>Shtypni zemrën te një ofertë dhe ajo do të shfaqet këtu.</p><div class="empty__cta"><button type="button" class="pill pill--soft" data-clear>Shfaq të gjitha ofertat</button></div></div>'
        : '<div class="empty"><h3>Asnjë ofertë në këtë kategori.</h3><p>Na tregoni çfarë kërkoni dhe e ndërtojmë ofertën për ju.</p><div class="empty__cta"><button type="button" class="pill pill--soft" data-clear>Shfaq të gjitha ofertat</button><a class="pill pill--red" href="#kontakt">Kërko ofertë</a></div></div>';
      return;
    }
    const more = state.cat === 'all' && !state.fav && !state.allOffers && list.length > 6, shown = more ? list.slice(0, 6) : list;
    const wideFirst = !state.fav && shown.length % 2 === 1;
    grid.innerHTML = shown.map((o, i) => tileHtml(o, wideFirst && i === 0)).join('');
    fixPos(grid);
    const mb = $('#bentoMore'); mb.hidden = !more; if (more) mb.textContent = `Shiko të gjitha ofertat (${list.length})`;
  }
  function initBento() {
    $('#bentoMore').addEventListener('click', () => { state.allOffers = true; renderBento(); });
    $('#catChips').innerHTML = CATS.filter(([k]) => ['all', 'beach', 'safari', 'honeymoon', 'earlybooking'].includes(k)).map(([k, l]) => `<button type="button" class="chip" data-cat="${k}" aria-pressed="${k === 'all'}">${l}</button>`).join('');
    $('#catChips').addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (!c) return; setCat(c.dataset.cat); });
    $('#fFav').addEventListener('click', () => { state.fav = !state.fav; syncChips(); renderBento(); });
  }
  function syncChips() { $$('#catChips .chip').forEach(c => c.setAttribute('aria-pressed', String(!state.fav && c.dataset.cat === state.cat))); $('#fFav').setAttribute('aria-pressed', String(state.fav)); }
  function setCat(cat) { state.cat = cat; state.fav = false; syncChips(); renderBento(); }
  function toggleFav(id) {
    const on = !state.favs.has(id);
    if (on) state.favs.add(id); else state.favs.delete(id);
    store.set('favs', [...state.favs]);
    $$(`[data-fav="${id}"]`).forEach(b => { b.setAttribute('aria-pressed', String(on)); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); });
    updateFavCount();
    if (state.fav && !on) renderBento();
    toast(on ? 'Oferta u ruajt' : 'Oferta u hoq nga të ruajturat');
  }
  function updateFavCount() { $$('[data-fav-count]').forEach(el => { el.textContent = state.favs.size ? String(state.favs.size) : ''; }); }

  /* ---------- Configurator ---------- */
  const C = { id: null, sel: {}, date: null, adults: 2, children: 0, sent: false };
  const HINTS = { Vila: 'Ku dëshironi të zgjoheni?', Pensioni: 'Sa vakte të përfshira?', Transferi: 'Si arrini në ishull?', Safari: 'Sa ditë në savanë?', 'Plazhi në Zanzibar': 'Sa netë në oqean?', Niveli: 'Komfort apo luks?', Hoteli: 'Ku qëndroni?', Hotelet: 'Ku qëndroni?', 'Zona dhe hoteli': 'Cila zonë ju pëlqen?', Dhoma: 'Çfarë dhome dëshironi?', Resorti: 'Si dëshironi ta mbyllni udhëtimin?', Ekskursionet: 'Sa dëshironi të shihni?', Guleti: 'Sa ditë në det?', Akomodimi: 'Sa netë nën qiellin e hapur?', Aktivitetet: 'Sa aventurë dëshironi?', 'Kampi në Wadi Rum': 'Si dëshironi ta shihni qiellin?', Petra: 'Edhe natën?', Shtesë: 'Dëshironi të shihni më shumë?', 'Nata e Vitit të Ri': 'Si e prisni mesnatën?', 'Aktivitete shtesë': 'Diçka më shumë?' };
  function cfgSelect(id, keepPax) {
    const o = offerBy[id]; if (!o) return;
    C.id = id; C.sel = defaults(o); C.sent = false;
    const av = o.future.filter(x => x.s > 0); C.date = av[0] ? av[0].d : null;
    if (!keepPax) { C.adults = 2; C.children = 0; }
    renderCfg();
  }
  function renderCfg() { renderCfgSteps(); renderCfgSummary(); }
  function renderCfgSteps() {
    const o = offerBy[C.id];
    const og = (label, arr) => arr.length ? `<optgroup label="${label}">${arr.map(x => `<option value="${x.id}"${x.id === C.id ? ' selected' : ''}>${esc(x.title)}, ${fromWord()} ${money(shownPrice(x))}</option>`).join('')}</optgroup>` : '';
    const picks = `<span class="select select--lg"><select data-cfg-offer aria-label="Oferta">${og('Pushime', live().filter(x => !x.cats.includes('rare')))}${og('Koleksioni i rrallë', live().filter(x => x.cats.includes('rare')))}</select></span>`;
    const dates = o.future.map(x => {
      const low = x.s > 0 && x.s <= 5;
      const sub = x.s === 0 ? 'Plot' : b2b() ? plural(x.s, 'vend', 'vende') : low ? `Vetëm ${plural(x.s, 'vend', 'vende')}` : 'Ka vende';
      return `<button type="button" class="date-opt" data-pick-date="${x.d}" aria-pressed="${x.d === C.date}"${x.s === 0 ? ' disabled' : ''}><b>${fmtDate(x.d)}</b><small class="${low ? 'low' : ''}">${sub}${x.note ? `, ${esc(x.note)}` : ''}</small></button>`;
    }).join('');
    const opts = (o.options || []).map((g, gi) => `<div class="step"><h3 class="step__title">${esc(g.name)}. <span>${HINTS[g.name] || 'Zgjidhni sipas dëshirës.'}</span></h3><div class="opt-list">${g.choices.map((c, ci) => `<button type="button" class="opt" data-pick-opt="${gi}:${ci}" aria-pressed="${(C.sel[gi] || 0) === ci}"><span><b>${esc(c.l)}</b>${c.s ? `<small>${esc(c.s)}</small>` : ''}</span><span class="opt__delta">${c.d === 0 ? 'Përfshirë' : (c.d > 0 ? '+' : '−') + money(Math.abs(c.d))}</span></button>`).join('')}</div></div>`).join('');
    const stepper = (key, label, sub, min, max, less, more) => `<div class="stepper"><div>${label}<small>${sub}</small></div><div class="stepper__ctrl"><button type="button" data-step="${key}:-1" aria-label="${less}"${C[key] <= min ? ' disabled' : ''}>${ic('minus')}</button><output>${C[key]}</output><button type="button" data-step="${key}:1" aria-label="${more}"${C[key] >= max ? ' disabled' : ''}>${ic('plus')}</button></div></div>`;
    $('#cfgSteps').innerHTML = `
      <div class="step"><h3 class="step__title">Oferta. <span>Cila ju tërheq më shumë?</span></h3>${picks}</div>
      <div class="step"><h3 class="step__title">Data. <span>Kur dëshironi të niseni?</span></h3>${o.future.length ? `<div class="dates">${dates}</div>` : '<p class="muted">Na shkruani për datën që ju përshtatet.</p>'}</div>
      ${opts}
      <div class="step"><h3 class="step__title">Udhëtarët. <span>Kush vjen me ju?</span></h3><div>${stepper('adults', 'Të rritur', '12 vjeç e lart', 1, 8, 'Një i rritur më pak', 'Një i rritur më shumë')}${stepper('children', 'Fëmijë', `2–11 vjeç, −${Math.round((1 - o.child) * 100)}%`, 0, 4, 'Një fëmijë më pak', 'Një fëmijë më shumë')}</div></div>`;
  }
  function bookingText(o, q) {
    return ['Përshëndetje BCT Travel, dëshiroj të rezervoj këtë ofertë:', '', o.title,
      `Nisja: ${C.date ? span(C.date, q.nights) : 'data për t’u caktuar'}`, ...picksText(o, C.sel),
      `Udhëtarë: ${paxText(C.adults, C.children)}`, `Çmimi i llogaritur: ${money(q.total)}`, '', 'Ju lutem më konfirmoni disponueshmërinë.'].join('\n');
  }
  function b2bText(o, q) {
    return [`Kërkesë rezervimi B2B nga ${state.partner ? state.partner.agency : 'agjencia partnere'}`, '', o.title,
      `Nisja: ${C.date ? span(C.date, q.nights) : 'data për t’u caktuar'}`, ...picksText(o, C.sel),
      `Udhëtarë: ${paxText(C.adults, C.children)}`, `NET: ${money(q.net)} (komisioni ${money(q.commission)})`].join('\n');
  }
  function renderCfgSummary() {
    const o = offerBy[C.id], q = quote(o, C.sel, C.adults, C.children);
    const card = `<div class="sum-card ${moodFor(o)}">${photoLayer(o)}<p class="sum-card__route">${routeInline(o.route)}</p><h3 class="sum-card__title">${esc(o.title)}</h3><p class="sum-card__dates">${C.date ? span(C.date, q.nights) : 'Data sipas kërkesës'}, ${nightsTxt(q.nights)}</p>${o.plan ? timelineHtml(o, C.sel) : ''}</div>`;
    let rows, cta, ctaShort;
    if (b2b()) {
      rows = `<div class="sum-row sum-row--muted"><span>Çmimi publik</span><span>${money(q.total)}</span></div><div class="sum-row"><span>Komisioni juaj (${Math.round(o.commission * 100)}%)</span><span>${money(q.commission)}</span></div><div class="sum-row sum-row--muted"><span>Me markup-un tuaj (+${state.markup}%)</span><span>${money(q.client)}</span></div><div class="sum-total"><span>NET gjithsej</span><b>${money(q.net)}</b></div>`;
      cta = `${C.sent ? `<p class="done">${ic('check')}<span>Kërkesa u shtua në panel me statusin “Në pritje”.</span></p>` : ''}<button type="button" class="pill pill--red pill--block" data-b2b-request${C.date ? '' : ' disabled'}>Dërgo kërkesë rezervimi</button><button type="button" class="pill pill--soft pill--block" data-b2b-quote>Krijo ofertë për klientin</button><a class="pill pill--wa pill--block" href="${waHref(b2bText(o, q))}" target="_blank" rel="noopener">${ic('whatsapp')}Konfirmo me WhatsApp</a>`;
      ctaShort = `<button type="button" class="pill pill--red pill--block" data-b2b-request${C.date ? '' : ' disabled'}>Dërgo kërkesë rezervimi</button>`;
    } else {
      const lines = [[`${plural(C.adults, 'i rritur', 'të rritur')} × ${money(q.adultUnit)}`, money(C.adults * q.adultUnit)]];
      if (C.children) lines.push([`${plural(C.children, 'fëmijë', 'fëmijë')} × ${money(q.childUnit)}`, money(C.children * q.childUnit)]);
      if (q.single) lines.push(['Shtesë për dhomë teke', money(q.single)]);
      rows = lines.map(([a, b]) => `<div class="sum-row"><span>${a}</span><span>${b}</span></div>`).join('') + `<div class="sum-total"><span>Gjithsej</span><b>${money(q.total)}</b></div>`;
      const text = bookingText(o, q);
      cta = `<a class="pill pill--wa pill--block" href="${waHref(text)}" target="_blank" rel="noopener">${ic('whatsapp')}Rezervo me WhatsApp</a><a class="pill pill--soft pill--block" href="${mailHref('Rezervim: ' + o.title, text)}">${ic('mail')}Dërgo kërkesën me email</a><p class="fine">Nuk paguani asgjë tani. Ne ju konfirmojmë disponueshmërinë dhe çmimin përfundimtar.</p>`;
      ctaShort = `<a class="pill pill--wa pill--block" href="${waHref(text)}" target="_blank" rel="noopener">${ic('whatsapp')}Rezervo me WhatsApp</a>`;
    }
    $('#cfgSummary').innerHTML = card + `<div class="sum-box">${rows}</div><div class="sum-cta">${cta}</div>`;
    fixPos($('#cfgSummary'));
    sizeTimeline($('#cfgSummary'));
    $('#cfgBar').innerHTML = `<div class="sum-total"><span>${b2b() ? 'NET gjithsej' : 'Gjithsej'}<small class="fine fine--block"></small></span><b>${money(b2b() ? q.net : q.total)}</b></div>${ctaShort}`;
    const sm = $('#cfgBar small'); if (sm) sm.textContent = paxText(C.adults, C.children);
  }
  function initCfg() {
    $('#cfgSteps').addEventListener('change', e => { if (e.target.matches('[data-cfg-offer]')) { cfgSelect(e.target.value, true); const sel = $('#cfgSteps [data-cfg-offer]'); if (sel) sel.focus({ preventScroll: true }); } });
    cfgSelect(live()[0].id);
    $('#nderto').addEventListener('click', e => {
      const t = e.target.closest('[data-pick-offer],[data-pick-date],[data-pick-opt],[data-step],[data-b2b-request],[data-b2b-quote]');
      if (!t) return;
      if (t.dataset.pickOffer) { cfgSelect(t.dataset.pickOffer, true); refocus($('#cfgSteps'), 'data-pick-offer', C.id); }
      else if (t.dataset.pickDate) { C.date = t.dataset.pickDate; renderCfg(); refocus($('#cfgSteps'), 'data-pick-date', C.date); }
      else if (t.dataset.pickOpt) { const [g, c] = t.dataset.pickOpt.split(':').map(Number); C.sel[g] = c; renderCfg(); refocus($('#cfgSteps'), 'data-pick-opt', t.dataset.pickOpt); }
      else if (t.dataset.step) {
        const [k, d] = t.dataset.step.split(':'), lim = k === 'adults' ? [1, 8] : [0, 4], v = t.dataset.step;
        C[k] = Math.min(lim[1], Math.max(lim[0], C[k] + Number(d))); renderCfg(); refocus($('#cfgSteps'), 'data-step', v);
      } else if (t.hasAttribute('data-b2b-request')) addRequest();
      else if (t.hasAttribute('data-b2b-quote')) openDash('quote', { id: C.id, date: C.date, adults: C.adults, children: C.children, sel: Object.assign({}, C.sel) });
    });
  }
  function addRequest() {
    const o = offerBy[C.id], q = quote(o, C.sel, C.adults, C.children);
    state.requests.unshift({ id: o.id, title: o.title, date: C.date, nights: q.nights, pax: paxText(C.adults, C.children), net: q.net, commission: q.commission });
    C.sent = true; renderCfgSummary(); renderDevice(); toast('Kërkesa u shtua në panel');
  }

  /* ---------- Details sheet ---------- */
  function openDetails(id) {
    const o = offerBy[id]; if (!o) return;
    const sel = defaults(o), q = quote(o, sel, 2, 0), d = destBy[o.dest];
    $('#sheetHero').className = `sheet__hero ${moodFor(o)}`;
    $('#sheetHero').innerHTML = photoLayer(o) + `<p>${esc(o.dealTxt || o.tag)}</p><h2 class="sheet__title" id="sheetTitle">${esc(o.title)}</h2><p class="sheet__sub">${esc(o.sub)}</p>`;
    fixPos($('#sheetHero'));
    const more = o.future.filter(x => x.s > 0).length - 1;
    const facts = [
      ['Kohëzgjatja', `${q.nights + 1} ditë, ${nightsTxt(q.nights)}`],
      ['Fluturimi', o.route.join(' – '), o.via],
      ['Akomodimi', o.stay],
      ['Pensioni', o.meal],
      ['Nisja e radhës', fmtDate(o.next.d), more > 0 ? `dhe ${plural(more, 'datë tjetër', 'data të tjera')}` : ''],
      ['Sezona më e mirë', d ? d.season : '']
    ];
    const days = dayList(program(o, sel));
    $('#sheetBody').innerHTML = `
      <div class="facts">${facts.map(([k, v, x]) => `<div class="fact"><small>${k}</small><b>${esc(v)}</b>${x ? `<i>${esc(x)}</i>` : ''}</div>`).join('')}</div>
      <div><h3>Pikat kryesore.</h3><ul class="ticks">${o.highlights.map(h => `<li>${ic('check')}<span>${esc(h)}</span></li>`).join('')}</ul></div>
      <div><h3>Programi.</h3>${o.plan ? timelineHtml(o, sel) : ''}<ol class="program">${days.map(x => `<li><span class="program__day">${x.lbl}</span><div><b>${esc(x.t)}</b><p>${esc(x.x)}</p></div></li>`).join('')}</ol></div>
      <div class="incl"><div><h3>Përfshihet.</h3><ul class="ticks">${o.incl.map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ul></div><div><h3>Nuk përfshihet.</h3><ul class="ticks ticks--x">${o.excl.map(x => `<li>${ic('x')}<span>${esc(x)}</span></li>`).join('')}</ul></div></div>
      ${o.note ? `<p class="note">${esc(o.note)}</p>` : ''}`;
    sizeTimeline($('#sheetBody'));
    const ask = `Përshëndetje BCT Travel, kam një pyetje për ofertën “${o.title}”.`;
    $('#sheetFoot').innerHTML = `<div><small>${fromWord()}, për person</small><b>${money(shownPrice(o))}</b></div><div><a class="pill pill--soft" href="${waHref(ask)}" target="_blank" rel="noopener">${ic('whatsapp')}Pyet në WhatsApp</a><button type="button" class="pill pill--red" data-configure="${o.id}">Rezervo këtë ofertë</button></div>`;
    showDialog($('#offerDlg'));
    $('#sheetScroll').scrollTop = 0;
  }

  /* ---------- Flights from Prishtina ---------- */
  const FL = { trip: 'rt', swapped: false };
  /* Çmimet nga boti: prices.json pranë index.html (shih paketën bct-price-bot). Pa skedarin, faqja punon si më parë. */
  const PR = { routes: {}, mode: '', updated: null };
  const API = String(CFG.priceApi || '').replace(/\/+$/, '');
  const priceTxt = d => (d.currency === 'EUR' ? money(d.price) : `${num(d.price)} ${esc(d.currency)}`);
  const freshPrice = code => { const d = PR.routes[code]; return d && d.price && (!d.checked || Date.now() - new Date(d.checked) < 72 * 36e5) ? d : null; };
  function updateFlightHint() {
    const el = $('#flPrice'); if (!el) return;
    const code = $('#flDest').value, d = code && !FL.swapped ? freshPrice(code) : null;
    if (!d) { el.hidden = true; return; }
    const when = new Date(d.checked || PR.updated), at = isNaN(when) ? '' : `, kontrolluar më ${fmtD(when, false)} në ${pad2(when.getHours())}:${pad2(when.getMinutes())}`;
    const isTest = d.test === true || (d.test === undefined && PR.mode === 'test'), who = d.airline || d.flight || '';
    el.innerHTML = `${ic('tag')}<span>Çmimi më i lirë që gjeti boti: <b>${priceTxt(d)}</b> vetëm vajtje, më ${fmtDate(d.date)}${who ? `, ${esc(who)}` : ''}${at}. Çmimi përfundimtar konfirmohet nga agjenti.${isTest ? ' <em>Çmime prove nga modaliteti test.</em>' : ''}</span>`;
    el.hidden = false;
  }
  async function loadFlightPrices() {
    try {
      const r = await fetch(API ? `${API}/prices` : 'prices.json', { cache: 'no-store' });
      if (!r.ok) return;
      const j = await r.json();
      if (!j || typeof j.routes !== 'object') return;
      Object.assign(PR, j);
    } catch (e) { return; }
    $$('#flRoutes [data-fl]').forEach(b => { const d = freshPrice(b.dataset.fl); if (d) b.insertAdjacentHTML('beforeend', `<span class="route-chip__price">nga ${priceTxt(d)}</span>`); });
    $$('#flDest option').forEach(o => { const d = o.value && freshPrice(o.value); if (d) o.textContent += `, nga ${priceTxt(d)}`; });
    updateFlightHint();
  }
  function initFlights() {
    const F = BCT.flights || [], C = BCT.flightCountries || {}, form = $('#flightForm');
    if (!F.length || !form) return;
    const groups = {};
    F.forEach(f => { (groups[f.c] = groups[f.c] || []).push(f); });
    const cname = c => (C[c] ? C[c][0] : c);
    const order = Object.keys(groups).sort((x, y) => groups[y].length - groups[x].length || cname(x).localeCompare(cname(y), 'sq'));
    $('#flDest').innerHTML = '<option value="">Zgjidhni qytetin</option>' + order.map(c => `<optgroup label="${esc(cname(c))}">${groups[c].map(f => `<option value="${f.code}">${esc(f.city)} (${f.code})${f.new ? ', linjë e re' : ''}</option>`).join('')}</optgroup>`).join('');
    $('#flRoutes').innerHTML = `<details class="routes-all"><summary>Shiko të gjitha qytetet (${F.length})</summary><div class="routes-list">${order.map(c => `<div class="routes-row"><b>${esc(cname(c))}</b><div class="routes-chips">${groups[c].map(f => `<button type="button" class="route-chip" data-fl="${f.code}">${esc(f.city)}${f.new ? ' <em class="badge-new">E re</em>' : ''}</button>`).join('')}</div></div>`).join('')}</div></details>`;
    $$('[data-fl-count]').forEach(el => { el.textContent = F.length; });
    $('#flAdults').innerHTML = optRange(1, 9, 1); $('#flChildren').innerHTML = optRange(0, 8, 0); $('#flInfants').innerHTML = optRange(0, 4, 0);
    const iso = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`, dep = $('#flDep'), ret = $('#flRet');
    dep.min = iso(today); ret.min = iso(today);
    dep.addEventListener('change', () => { ret.min = dep.value || iso(today); if (ret.value && ret.value < dep.value) ret.value = ''; });
    $$('[data-trip]').forEach(b => b.addEventListener('click', () => {
      FL.trip = b.dataset.trip;
      $$('[data-trip]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $('#flRetWrap').hidden = FL.trip === 'ow';
    }));
    $('#flSwap').addEventListener('click', () => {
      FL.swapped = !FL.swapped;
      form.classList.toggle('is-swapped', FL.swapped);
      $('#flFromLabel').textContent = FL.swapped ? 'Për' : 'Nga';
      $('#flToLabel').textContent = FL.swapped ? 'Nga' : 'Për';
      $('#flSwap').setAttribute('aria-pressed', String(FL.swapped));
      updateFlightHint();
    });
    $('#flDest').addEventListener('change', updateFlightHint);
    loadFlightPrices();
    $('#flRoutes').addEventListener('click', e => {
      const b = e.target.closest('[data-fl]'); if (!b) return;
      $('#flDest').value = b.dataset.fl; updateFlightHint();
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => dep.focus({ preventScroll: true }), reduceMotion ? 0 : 500);
    });
    if (API) { $('#flLiveBtn').hidden = false; $('#flWaLabel').textContent = 'Pyet në WhatsApp'; }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const via = (e.submitter && e.submitter.value) || (API ? 'live' : 'wa');
      if (!validate(form, [['dest', el => !!el.value, 'Zgjidhni qytetin.'], ['dep', el => !!el.value, 'Zgjidhni datën e nisjes.'],
        ['ret', el => FL.trip === 'ow' || (!!el.value && el.value >= form.elements.dep.value), 'Zgjidhni datën e kthimit.']])) return;
      const d = Object.fromEntries(new FormData(form)), city = F.find(x => x.code === d.dest);
      const home = 'Prishtinë (PRN)', away = `${city.city} (${city.code})`, [from, to] = FL.swapped ? [away, home] : [home, away];
      const pax = [plural(+d.adults, 'i rritur', 'të rritur'), +d.children ? plural(+d.children, 'fëmijë', 'fëmijë') : '', +d.infants ? plural(+d.infants, 'foshnjë', 'foshnja') : ''].filter(Boolean).join(', ');
      const text = ['Përshëndetje BCT Travel, kërkoj biletë avioni:', '', `${from} → ${to}`,
        FL.trip === 'rt' ? `Vajtje-ardhje: ${fmtDate(d.dep)} – ${fmtDate(d.ret)}` : `Vetëm vajtje: ${fmtDate(d.dep)}`,
        `Udhëtarë: ${pax}`, `Bagazhi: ${d.bags}`, '', 'Ju lutem më dërgoni fluturimet dhe çmimin e ditës.'].join('\n');
      if (via === 'live' && API) { liveSearch(d, city, from, to, pax, text); return; }
      launch(via === 'mail' ? mailHref(`Biletë avioni: ${from} – ${to}`, text) : waHref(text), via);
      toast(via === 'mail' ? 'U hap email-i me kërkesën tuaj' : 'U hap WhatsApp-i me kërkesën tuaj');
    });
  }
  const durTxt = s => { const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(s || ''); if (!m) return ''; return [m[1] ? `${+m[1]} orë` : '', m[2] ? `${+m[2]} min` : ''].filter(Boolean).join(' '); };
  const hhmm = s => (s || '').slice(11, 16);
  const legHtml = (s, label) => `<div class="leg"><span class="leg__lbl">${label}</span><b>${hhmm(s.dep)}</b><span class="leg__line"><small>${s.stops ? plural(s.stops, 'ndalesë', 'ndalesa') : 'Direkt'}${s.duration ? `, ${durTxt(s.duration)}` : ''}</small></span><b>${hhmm(s.arr)}</b><span class="leg__meta">${esc(s.from)} → ${esc(s.to)}, ${s.dep ? fmtDate(s.dep.slice(0, 10), false) : ''}${s.flight ? `, ${esc(s.flight)}` : ''}</span></div>`;
  async function liveSearch(d, city, from, to, pax, askText) {
    const box = $('#flResults'), btn = $('#flLiveBtn');
    const q = new URLSearchParams({ to: city.code, dep: d.dep, ad: d.adults, ch: d.children, in: d.infants, dir: FL.swapped ? 'in' : 'out' });
    if (FL.trip === 'rt') q.set('ret', d.ret);
    box.hidden = false;
    box.innerHTML = '<p class="fl-loading"><span class="spin" aria-hidden="true"></span>Po kërkojmë fluturimet te kompanitë ajrore…</p>';
    btn.disabled = true;
    const fallback = `<div class="fl-results__cta"><a class="pill pill--wa pill--sm" href="${waHref(askText)}" target="_blank" rel="noopener">${ic('whatsapp')}Na shkruani në WhatsApp</a></div>`;
    let res;
    try {
      const r = await fetch(`${API}/search?${q}`, { signal: AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined });
      res = await r.json();
      if (!r.ok) throw new Error(res && res.error ? res.error : 'Kërkimi nuk u krye.');
    } catch (e) {
      box.innerHTML = `<p class="fl-results__msg">${esc(e.message && e.message.length < 140 ? e.message : 'Kërkimi nuk u krye. Provoni sërish.')}</p>${fallback}`;
      btn.disabled = false; return;
    }
    btn.disabled = false;
    const list = res.offers || [];
    if (!list.length) {
      box.innerHTML = `<p class="fl-results__msg">Nuk gjetëm fluturime ${FL.trip === 'rt' ? 'për këto data' : 'për këtë datë'}. Provoni një datë tjetër, ose na shkruani dhe ju gjejmë alternativa.</p>${fallback}`;
      return;
    }
    const when = new Date(res.checked), at = isNaN(when) ? '' : `${pad2(when.getHours())}:${pad2(when.getMinutes())}`;
    const people = +d.adults + +d.children + +d.infants, adultsOnly = !!res.note;
    const whoPays = adultsOnly ? `për ${plural(+d.adults, 'të rritur', 'të rritur')}` : (people > 1 ? `gjithsej për ${people} udhëtarë` : 'për 1 udhëtar');
    const srcTxt = res.source === 'flytik' ? `Çmime nga sistemi i rezervimeve, kontrolluar në ${at}` : `Çmime live, kontrolluar në ${at}${res.cached ? ' (nga 30 minutat e fundit)' : ''}`;
    box.innerHTML = `<div class="fl-results__head"><b>${plural(list.length, 'fluturim', 'fluturime')} për datat tuaja</b><small>${srcTxt}${res.mode === 'test' ? ', <em>çmime prove</em>' : ''}</small></div>` +
      (res.note ? `<p class="fl-results__msg">${esc(res.note)}</p>` : '') +
      list.map(o => {
        const legs = o.slices.map((s, i) => legHtml(s, i ? 'Kthimi' : 'Vajtja')).join('');
        const pricev = o.currency === 'EUR' ? money(o.price) : `${num(o.price)} ${esc(o.currency)}`;
        const msg = ['Përshëndetje BCT Travel, dua të rezervoj këtë fluturim:', '', `${from} → ${to}`, `${o.airline}${o.slices[0] && o.slices[0].flight ? `, ${o.slices[0].flight}` : ''}`,
          ...o.slices.map((s, i) => `${i ? 'Kthimi' : 'Vajtja'}: ${s.dep ? fmtDate(s.dep.slice(0, 10)) : ''}, ${hhmm(s.dep)} – ${hhmm(s.arr)}${s.stops ? ` (${plural(s.stops, 'ndalesë', 'ndalesa')})` : ''}`),
          `Udhëtarë: ${pax}`, `Çmimi në faqe: ${pricev}${adultsOnly ? ' (vetëm për të rriturit)' : ''}, kontrolluar në ${at}`, '', 'Ju lutem ma konfirmoni.'].join('\n');
        return `<article class="fres"><div class="fres__main"><p class="fres__airline">${esc(o.airline)}</p>${legs}</div><div class="fres__side"><b class="fres__price">${pricev}</b><small>${whoPays}</small><a class="pill pill--wa pill--sm" href="${waHref(msg)}" target="_blank" rel="noopener">${ic('whatsapp')}Rezervo</a></div></article>`;
      }).join('') +
      `<p class="fl-results__note">${res.source === 'flytik' ? 'Çmimet i kontrollon boti automatikisht disa herë në ditë.' : 'Çmimet vijnë live nga kompanitë ajrore, në momentin e kërkimit.'} Çmimi përfundimtar konfirmohet nga agjenti para pagesës.</p>`;
    box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }

  /* ---------- Numbers, rare carousel, device ---------- */
  function renderNumbers() {
    const in12 = new Date(today); in12.setFullYear(in12.getFullYear() + 1);
    const items = [
      [live().length, 'paketa pushimi, me fluturim të përfshirë'],
      [(BCT.flights || []).length, 'qytete në Evropë, me bileta nga Prishtina'],
      [allDeps.filter(x => x.date <= in12).length, 'nisje në dymbëdhjetë muajt e ardhshëm'],
      [2021, 'viti kur nisëm, si agjenci nga Kosova', true]
    ];
    $('#numbers').innerHTML = items.map(([v, l, still]) => `<div class="num"><b class="grad" data-count="${v}"${still ? ' data-still' : ''}>${still || reduceMotion ? v : 0}</b><span>${l}</span></div>`).join('');
    if (reduceMotion || !('IntersectionObserver' in window)) { $$('#numbers [data-count]').forEach(el => { el.textContent = el.dataset.count; }); return; }
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; io.disconnect();
      $$('#numbers [data-count]:not([data-still])').forEach(el => {
        const end = +el.dataset.count, t0 = performance.now();
        const tick = t => { const k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * e); if (k < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      });
    }), { threshold: .4 });
    io.observe($('#numbers'));
  }
  function renderRare() {
    $('#rareTrack').innerHTML = live().filter(o => o.cats.includes('rare')).map(o => {
      const months = [...new Set(o.future.map(x => MONTHS[parseDate(x.d).getMonth()]))];
      return `<article class="rcard ${moodFor(o)}">${photoLayer(o)}<span class="rcard__shade"></span><p class="rcard__eyebrow">${esc(o.tag)}</p><h3>${esc(o.title)}</h3><p>${esc(o.sub)}</p><p>${plural(o.future.length, 'nisje', 'nisje')}: ${months.join(', ')}</p>
        <div class="rcard__foot"><div><small>${fromWord()}</small><b>${money(shownPrice(o))}</b></div><button type="button" class="pill pill--white pill--sm" data-details="${o.id}">Detajet</button></div></article>`;
    }).join('');
    fixPos($('#rareTrack'));
  }
  function initCarousel() {
    const track = $('#rareTrack');
    const sync = () => { const max = track.scrollWidth - track.clientWidth - 2; $('[data-car="-1"]').disabled = track.scrollLeft <= 2; $('[data-car="1"]').disabled = track.scrollLeft >= max; };
    $$('[data-car]').forEach(b => b.addEventListener('click', () => { const card = track.querySelector('.rcard'); const step = card ? card.getBoundingClientRect().width + 18 : 400; track.scrollBy({ left: +b.dataset.car * step, behavior: reduceMotion ? 'auto' : 'smooth' }); }));
    track.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', sync); sync();
  }
  function renderDevice() {
    const ids = ['maldive-vila', 'zanzibar-safari', 'dubai-viti-ri', 'antalya-uai', 'bodrum-uai'];
    const avg = Math.round(live().reduce((a, o) => a + o.commission, 0) / live().length * 100);
    const seats = allDeps.filter(x => x.s > 0).slice(0, 10).reduce((a, x) => a + x.s, 0);
    $('#deviceKpis').innerHTML = [['Kërkesat tuaja', b2b() ? String(state.requests.length) : '—'], ['Komisioni mesatar', avg + '%'], ['Vende në 10 nisjet e ardhshme', String(seats)]].map(([k, v]) => `<div class="kpi"><small>${k}</small><b>${v}</b></div>`).join('');
    $('#deviceRows').innerHTML = ids.map(id => offerBy[id]).filter(o => o && o.next).map(o => `<tr><td>${esc(o.title)}</td><td class="num">${money(o.price)}</td><td class="num net">${b2b() ? money(netOf(o)) : '0.000 €'}</td><td class="num net">${b2b() ? Math.round(o.commission * 100) + '%' : '00%'}</td></tr>`).join('');
  }
  function initDeviceTilt() {
    const dev = $('#device');
    if (reduceMotion) { dev.style.setProperty('--tilt', '0deg'); dev.style.setProperty('--sc', '1'); return; }
    let raf = 0;
    const upd = () => { raf = 0; const r = dev.getBoundingClientRect(), vh = window.innerHeight; const t = Math.min(1, Math.max(0, (vh - r.top) / (vh * .75))); dev.style.setProperty('--tilt', (22 * (1 - t)).toFixed(2) + 'deg'); dev.style.setProperty('--sc', (.92 + .08 * t).toFixed(3)); };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true }); upd();
  }

  /* ---------- B2B: mode, login, dashboard ---------- */
  function setMode(m) {
    state.mode = m;
    document.documentElement.dataset.mode = m;
    store.set('mode', m);
    $$('[data-mode-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === m)));
    $$('[data-partner-name]').forEach(el => { el.textContent = state.partner ? state.partner.agency : ''; });
    renderBento(); renderCfg(); renderRare(); renderDevice(); renderPanels(); updateGlobeLabels();
    if ($('#offerDlg').open && $('#sheetFoot [data-configure]')) openDetails($('#sheetFoot [data-configure]').dataset.configure);
  }
  function agencyFrom(email) {
    const dom = (email.split('@')[1] || '').split('.')[0];
    if (!dom || /^(gmail|hotmail|yahoo|outlook|live|icloud|aol|msn)$/i.test(dom)) return 'Agjencia juaj';
    return dom.split(/[-_]/).filter(Boolean).map(cap).join(' ');
  }
  function loginAs(agency) { state.partner = { agency }; store.set('partner', state.partner); closeDialog($('#loginDlg')); setMode('b2b'); toast(`Mirë se erdhët, ${agency}. Çmimet NET janë aktive.`); }
  function logout() { state.partner = null; store.set('partner', null); closeDialog($('#dashDlg')); setMode('b2c'); toast('Dolët nga portali B2B'); }
  function initLogin() {
    $('#loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, email = f.elements.email.value.trim(), pass = f.elements.pass.value, err = $('#loginErr');
      if (!/^\S+@\S+\.\S+$/.test(email) || pass.length < 4) { err.textContent = 'Shkruani email-in e agjencisë dhe fjalëkalimin, së paku 4 shenja.'; err.hidden = false; return; }
      err.hidden = true; loginAs(agencyFrom(email));
    });
    $('#demoLogin').addEventListener('click', () => loginAs('Agjencia Demo'));
  }
  const D = { tab: 'overview', q: null, text: '' };
  const optRange = (a, b, v) => Array.from({ length: b - a + 1 }, (_, i) => a + i).map(n => `<option value="${n}"${n === v ? ' selected' : ''}>${n}</option>`).join('');
  function openDash(tab, preset) {
    if (!state.partner) { showDialog($('#loginDlg')); return; }
    D.tab = tab || 'overview';
    if (preset) D.q = Object.assign({ markup: state.markup, agency: state.partner.agency }, preset);
    if (!D.q) { const o = live()[0]; D.q = { id: o.id, date: o.next.d, adults: 2, children: 0, sel: defaults(o), markup: state.markup, agency: state.partner.agency }; }
    renderDash(); showDialog($('#dashDlg'));
  }
  function renderDash() {
    $$('#dashDlg [data-dtab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.dtab === D.tab)));
    const body = $('#dashBody');
    if (D.tab === 'overview') {
      const R = state.requests, net = R.reduce((a, r) => a + r.net, 0), com = R.reduce((a, r) => a + r.commission, 0);
      const deps = allDeps.filter(x => x.s > 0).slice(0, 6);
      body.innerHTML = `<div class="metrics"><div class="metric"><small>Kërkesa të dërguara</small><b>${R.length}</b></div><div class="metric"><small>Vlera NET</small><b>${money(net)}</b></div><div class="metric"><small>Komisioni i pritshëm</small><b>${money(com)}</b></div></div>
        <div><h3 class="drawer__h">Kërkesat e mia</h3>${R.length ? `<ul class="req-list">${R.map(r => `<li class="req"><div class="req__top"><b>${esc(r.title)}</b><span class="req__status">Në pritje</span></div><small>${r.date ? span(r.date, r.nights) : 'Pa datë'}, ${esc(r.pax)}</small><small>NET ${money(r.net)}, komisioni ${money(r.commission)}</small></li>`).join('')}</ul>` : '<p class="empty-note">Ende nuk keni dërguar kërkesa. Zgjidhni një ofertë te “Ndërto udhëtimin” dhe shtypni “Dërgo kërkesë rezervimi”.</p>'}</div>
        <div><h3 class="drawer__h">Nisjet e ardhshme me vende të lira</h3><ul class="dep-list">${deps.map(x => `<li><span><b>${esc(x.o.title)}</b><small>${fmtD(x.date)}, ${plural(x.s, 'vend i lirë', 'vende të lira')}, NET ${money(netOf(x.o))}</small></span><button type="button" class="pill pill--soft pill--sm" data-dash-open="${x.o.id}" data-date="${x.d}">Zgjidh</button></li>`).join('')}</ul></div>`;
    } else if (D.tab === 'quote') {
      const q = D.q, o = offerBy[q.id];
      body.innerHTML = `<form class="dlg__form dlg__form--flush" id="quoteForm" novalidate>
          <label class="field"><span>Emri i agjencisë në ofertë</span><input class="input" name="agency" value="${esc(q.agency)}"></label>
          <label class="field"><span>Oferta</span><span class="select"><select name="offer">${live().map(x => `<option value="${x.id}"${x.id === q.id ? ' selected' : ''}>${esc(x.title)}</option>`).join('')}</select></span></label>
          <div class="form-grid">
            <label class="field"><span>Data</span><span class="select"><select name="date">${o.future.filter(x => x.s > 0).map(x => `<option value="${x.d}"${x.d === q.date ? ' selected' : ''}>${fmtDate(x.d)}</option>`).join('')}</select></span></label>
            <label class="field"><span>Markup-u (%)</span><input class="input" name="markup" type="number" min="0" max="40" step="1" inputmode="numeric" value="${q.markup}"></label>
            <label class="field"><span>Të rritur</span><span class="select"><select name="adults">${optRange(1, 8, q.adults)}</select></span></label>
            <label class="field"><span>Fëmijë</span><span class="select"><select name="children">${optRange(0, 4, q.children)}</select></span></label>
          </div>
        </form><div id="quotePreview" class="sum-cta"></div>`;
      renderQuotePreview();
    } else {
      body.innerHTML = `<div><h3 class="drawer__h">Markup-u juaj</h3><p class="muted">Përqindja që shtohet mbi çmimin NET kur krijoni oferta për klientët.</p></div>
        <div class="range"><input type="range" min="0" max="30" step="1" value="${state.markup}" id="mkRange" aria-label="Markup-u në përqindje"><output id="mkOut">${state.markup}%</output></div>
        <p class="profit" id="mkEx"></p>`;
      renderMarkupExample();
    }
  }
  function renderMarkupExample() {
    const o = offerBy['maldive-vila'] || live()[0], net = netOf(o), client = Math.round(net * (1 + state.markup / 100));
    $('#mkEx').innerHTML = `<span>${esc(o.title)}: NET ${money(net)} për person</span><span>Klienti paguan <b>${money(client)}</b></span>`;
  }
  function renderQuotePreview() {
    const q = D.q, o = offerBy[q.id], r = quote(o, q.sel || defaults(o), q.adults, q.children);
    const client = Math.round(r.net * (1 + (Number(q.markup) || 0) / 100)), profit = client - r.net;
    const valid = new Date(today); valid.setDate(valid.getDate() + 3);
    const incl = o.incl.filter(x => !/BCT/.test(x));
    D.text = [`Ofertë nga ${q.agency || 'agjencia jonë'}`, '', o.title, `${q.date ? span(q.date, r.nights) : ''}, ${nightsTxt(r.nights)}`, paxText(q.adults, q.children), '', 'Përfshihet:', ...incl.map(x => `- ${x}`), '', `Çmimi gjithsej: ${money(client)}`, `Oferta vlen deri më ${fmtD(valid)}.`].join('\n');
    $('#quotePreview').innerHTML = `<div class="quote"><div class="quote__head"><small>Ofertë nga</small><b>${esc(q.agency || 'Agjencia juaj')}</b></div>
        <div class="quote__body"><div class="quote__title">${esc(o.title)}</div><div>${q.date ? span(q.date, r.nights) : ''}, ${nightsTxt(r.nights)}, ${paxText(q.adults, q.children)}</div>
          <ul class="ticks">${incl.slice(0, 4).map(x => `<li>${ic('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
          <div class="quote__price"><span>Çmimi gjithsej<small>Oferta vlen deri më ${fmtD(valid)}</small></span><b>${money(client)}</b></div></div></div>
      <div class="profit"><span>NET për ju ${money(r.net)}</span><span>Fitimi juaj <b>${money(profit)}</b></span></div>
      <button type="button" class="pill pill--red pill--block" data-copy-quote>${ic('copy')}Kopjo tekstin e ofertës</button>
      <a class="pill pill--wa pill--block" href="https://wa.me/?text=${encodeURIComponent(D.text)}" target="_blank" rel="noopener">${ic('whatsapp')}Ndaje në WhatsApp</a>`;
  }
  function initDash() {
    const dlg = $('#dashDlg');
    dlg.addEventListener('click', async e => {
      const t = e.target.closest('[data-dtab],[data-copy-quote],[data-dash-open]');
      if (!t) return;
      if (t.dataset.dtab) { D.tab = t.dataset.dtab; renderDash(); t.focus(); }
      else if (t.hasAttribute('data-copy-quote')) toast(await copyText(D.text) ? 'Teksti i ofertës u kopjua' : 'Kopjimi nuk u lejua. Zgjidhni tekstin dhe kopjojeni me dorë.');
      else if (t.dataset.dashOpen) { closeDialog(dlg); cfgSelect(t.dataset.dashOpen, true); C.date = t.dataset.date; renderCfg(); scrollToId('nderto'); }
    });
    dlg.addEventListener('input', e => {
      if (e.target.id === 'mkRange') { state.markup = +e.target.value; store.set('markup', state.markup); $('#mkOut').textContent = state.markup + '%'; renderMarkupExample(); renderCfgSummary(); return; }
      if (!e.target.closest('#quoteForm')) return;
      const q = D.q, name = e.target.name;
      if (name === 'offer') { const o = offerBy[e.target.value]; q.id = o.id; q.date = o.next.d; q.sel = defaults(o); renderDash(); return; }
      if (name === 'agency') q.agency = e.target.value;
      else if (name === 'markup') q.markup = Math.max(0, Math.min(40, Number(e.target.value) || 0));
      else if (name === 'date') q.date = e.target.value;
      else q[name] = Number(e.target.value);
      renderQuotePreview();
    });
    $$('[data-dtab]', dlg).forEach(b => b.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const tabs = $$('[data-dtab]', dlg), i = tabs.indexOf(b), n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      D.tab = n.dataset.dtab; renderDash(); n.focus();
    }));
  }

  /* ---------- Forms ---------- */
  function validate(form, rules) {
    let first = null;
    rules.forEach(([name, test, msg]) => {
      const el = form.elements[name], wrap = el.closest('.field') || el.closest('.check');
      let err = wrap.querySelector('.err');
      if (!test(el)) {
        if (!err) { err = document.createElement('span'); err.className = 'err'; err.id = 'err-' + form.getAttribute('id') + '-' + name; wrap.appendChild(err); }
        err.textContent = msg; el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', err.id); first = first || el;
      } else { if (err) err.remove(); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }
    });
    if (first) first.focus();
    return !first;
  }
  const filled = n => el => el.value.trim().length >= n;
  const phoneOk = el => el.value.replace(/\D/g, '').length >= 6;
  const emailOk = el => /^\S+@\S+\.\S+$/.test(el.value.trim());
  function launch(url, via) { if (via === 'mail') window.location.href = url; else window.open(url, '_blank', 'noopener'); }
  function successHtml(name, text, wa, mail, via, kind) {
    return `<div class="success" role="status"><span class="success__ic">${ic('check')}</span><h3>Faleminderit, ${esc(name)}.</h3>
      <p>${via === 'mail' ? 'Hapëm email-in tuaj me mesazhin më poshtë.' : 'Hapëm WhatsApp-in me mesazhin më poshtë.'} Shtypni “Dërgo” atje dhe ju përgjigjemi sa më shpejt. Nëse nuk u hap, përdorni butonat.</p>
      <div class="msg-preview">${esc(text)}</div>
      <div class="success__cta"><a class="pill pill--wa" href="${wa}" target="_blank" rel="noopener">${ic('whatsapp')}Hap WhatsApp</a><a class="pill pill--soft" href="${mail}">${ic('mail')}Hap email-in</a></div>
      <button type="button" class="link-btn" data-reset="${kind}">${kind === 'contact' ? 'Shkruani një kërkesë tjetër' : 'Plotësoni përsëri formularin'}</button></div>`;
  }
  let contactTpl = '', partnerTpl = '';
  function initForms() {
    const main = DESTS.filter(d => d.main), rare = DESTS.filter(d => !d.main);
    $('#cDest').innerHTML = `<option value="Ende e pavendosur">Ende s’e kam vendosur</option>${main.map(d => `<option>${esc(d.name)}</option>`).join('')}<optgroup label="Koleksioni i rrallë">${rare.map(d => `<option>${esc(d.name)}</option>`).join('')}</optgroup><option>Destinacion tjetër</option>`;
    const ms = []; for (let i = 0; i < 12; i++) { const d = new Date(today.getFullYear(), today.getMonth() + i, 1); ms.push(`${cap(MONTHS[d.getMonth()])} ${d.getFullYear()}`); }
    $('#cMonth').innerHTML = '<option>Jam fleksibël</option>' + ms.map(m => `<option>${m}</option>`).join('');
    $('#cAdults').innerHTML = optRange(1, 8, 2); $('#cChildren').innerHTML = optRange(0, 4, 0);
    contactTpl = $('#contactCard').innerHTML; partnerTpl = $('#partnerBody').innerHTML;
    $('#contactCard').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, via = (e.submitter && e.submitter.value) || 'wa';
      if (!validate(f, [['name', filled(2), 'Shkruani emrin tuaj.'], ['phone', phoneOk, 'Shkruani një numër telefoni, që t’ju kontaktojmë.'], ['email', el => !el.value.trim() || emailOk(el), 'Kontrolloni adresën e email-it.']])) return;
      const d = Object.fromEntries(new FormData(f));
      const text = [`Përshëndetje BCT Travel, jam ${d.name.trim()}.`, `Destinacioni: ${d.dest}`, `Muaji: ${d.month}`, `Udhëtarë: ${paxText(+d.adults, +d.children)}`, d.msg.trim() ? `Mesazhi: ${d.msg.trim()}` : '', `Telefoni: ${d.phone.trim()}`, d.email.trim() ? `Email: ${d.email.trim()}` : ''].filter(Boolean).join('\n');
      const wa = waHref(text), mail = mailHref(`Kërkesë për ofertë: ${d.dest}`, text);
      launch(via === 'mail' ? mail : wa, via);
      $('#contactCard').innerHTML = successHtml(d.name.trim().split(/\s+/)[0], text, wa, mail, via, 'contact');
    });
    $('#partnerBody').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target, via = (e.submitter && e.submitter.value) || 'wa';
      if (!validate(f, [['agency', filled(2), 'Shkruani emrin e agjencisë.'], ['biz', filled(4), 'Shkruani numrin e biznesit (NUI ose NIPT).'], ['person', filled(2), 'Shkruani emrin e personit kontaktues.'], ['email', emailOk, 'Kontrolloni adresën e email-it.'], ['phone', phoneOk, 'Shkruani një numër telefoni.'], ['terms', el => el.checked, 'Pranoni kontaktin për të vazhduar.']])) return;
      const d = Object.fromEntries(new FormData(f));
      const text = ['Aplikim për partneritet B2B me BCT Travel', '', `Agjencia: ${d.agency.trim()}`, `Nr. i biznesit: ${d.biz.trim()}`, d.city.trim() ? `Qyteti: ${d.city.trim()}` : '', `Personi kontaktues: ${d.person.trim()}`, `Email: ${d.email.trim()}`, `Telefoni: ${d.phone.trim()}`].filter(Boolean).join('\n');
      const wa = waHref(text), mail = mailHref(`Aplikim B2B: ${d.agency.trim()}`, text);
      launch(via === 'mail' ? mail : wa, via);
      $('#partnerBody').innerHTML = `<button class="dlg__close dlg__close--plain" type="button" data-close aria-label="Mbyll">${ic('x')}</button>` + successHtml(d.person.trim().split(/\s+/)[0], text, wa, mail, via, 'partner');
    });
  }

  /* ---------- Global wiring ---------- */
  function initContacts() {
    $$('[data-phone]').forEach(el => { el.textContent = CFG.phoneDisplay; });
    $$('[data-email]').forEach(el => { el.textContent = CFG.email; });
    $$('[data-address]').forEach(el => { el.textContent = CFG.address; });
    $$('[data-tel]').forEach(a => { a.href = 'tel:' + CFG.phoneDisplay.replace(/[^\d+]/g, ''); });
    $$('[data-mail]').forEach(a => { a.href = 'mailto:' + CFG.email; });
    $$('[data-wa-link]').forEach(a => { a.href = waHref('Përshëndetje BCT Travel, kam një pyetje për një ofertë.'); a.target = '_blank'; a.rel = 'noopener'; });
    $('#year').textContent = today.getFullYear();
  }
  function initDialogs() {
    $$('dialog').forEach(d => {
      let down = false;
      d.addEventListener('pointerdown', e => { down = e.target === d; });
      d.addEventListener('click', e => { if (e.target === d && down) d.close(); });
      d.addEventListener('close', () => { if (!$$('dialog[open]').length) document.documentElement.classList.remove('modal-open'); });
    });
  }
  function initMenu() {
    const btn = $('#menuBtn'), nav = $('#mnav');
    const set = open => { nav.hidden = !open; btn.setAttribute('aria-expanded', String(open)); document.documentElement.classList.toggle('modal-open', open); if (open) nav.querySelector('a').focus(); };
    btn.addEventListener('click', () => set(nav.hidden));
    nav.addEventListener('click', e => { if (e.target.closest('a, [data-mode-btn], [data-menu-close]')) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nav.hidden) { set(false); btn.focus(); } });
  }
  function initGlobal() {
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-fav],[data-details],[data-configure],[data-login],[data-partner-apply],[data-open-dash],[data-logout],[data-goto-cat],[data-close],[data-mode-btn],[data-fav-filter],[data-clear],[data-reset]');
      if (!t) return;
      if (t.dataset.fav) toggleFav(t.dataset.fav);
      else if (t.dataset.details) openDetails(t.dataset.details);
      else if (t.dataset.configure) { $$('dialog[open]').forEach(closeDialog); cfgSelect(t.dataset.configure, true); scrollToId('nderto'); }
      else if (t.hasAttribute('data-login')) showDialog($('#loginDlg'));
      else if (t.hasAttribute('data-partner-apply')) { closeDialog($('#loginDlg')); if (!$('#partnerForm')) $('#partnerBody').innerHTML = partnerTpl; showDialog($('#partnerDlg')); }
      else if (t.hasAttribute('data-open-dash')) openDash(t.dataset.openDash || 'overview');
      else if (t.hasAttribute('data-logout')) logout();
      else if (t.dataset.gotoCat) { setCat(t.dataset.gotoCat); scrollToId('ofertat'); }
      else if (t.hasAttribute('data-close')) { const d = t.closest('dialog'); if (d) d.close(); }
      else if (t.dataset.modeBtn) { if (t.dataset.modeBtn === 'b2b' && !state.partner) showDialog($('#loginDlg')); else if (t.dataset.modeBtn !== state.mode) setMode(t.dataset.modeBtn); }
      else if (t.hasAttribute('data-fav-filter')) { if (!state.favs.size) { toast('Ende nuk keni oferta të ruajtura. Shtypni zemrën te një ofertë.'); return; } state.fav = true; syncChips(); renderBento(); scrollToId('ofertat'); }
      else if (t.hasAttribute('data-clear')) setCat('all');
      else if (t.dataset.reset) { if (t.dataset.reset === 'contact') { $('#contactCard').innerHTML = contactTpl; $('#contactCard input').focus(); } else { $('#partnerBody').innerHTML = partnerTpl; $('#partnerBody input').focus(); } }
    });
  }

  function init() {
    injectIcons();
    initContacts(); initDialogs(); initMenu(); initBento(); initCfg(); initLogin(); initDash(); initForms(); initGlobal();
    initFlights(); renderRare(); initCarousel(); renderDevice(); initDeviceTilt(); updateFavCount();
    state.mode = state.partner && store.get('mode', 'b2c') === 'b2b' ? 'b2b' : 'b2c';
    document.documentElement.dataset.mode = state.mode;
    $$('[data-mode-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === state.mode)));
    $$('[data-partner-name]').forEach(el => { el.textContent = state.partner ? state.partner.agency : ''; });
    renderBento(); renderCfg(); renderRare(); renderDevice();
    initStage();
    const cfgSec = $('#nderto');
    if (cfgSec && 'IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(en => document.documentElement.classList.toggle('cfg-in-view', en.isIntersecting)), { rootMargin: '-30% 0px -10% 0px' }).observe(cfgSec);
    }
  }
  init();
};
