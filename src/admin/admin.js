/* BCT Travel – Paneli i administrimit
   Ndryshon çmimet, datat, tekstet dhe fotot e ofertave. Ndryshimet ruhen te shërbimi 24/7 (Cloudflare)
   dhe faqja i lexon vetë. Fjalëkalimi kontrollohet te shërbimi; këtu nuk ruhet asnjë fjalëkalim. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const money = n => `${num(n)} €`;
  const MONTHS = ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'];
  const fmtDate = s => { const [y, m, d] = s.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
  const todayIso = new Date().toISOString().slice(0, 10);

  const BASE = (window.BCT.offers || []).map(o => JSON.parse(JSON.stringify(o)));
  const PHS = BCT.photoSrc || {}, OPH = BCT.offerPhotos || {};
  const S = {
    api: (localStorage.getItem('bct-admin-api') || (BCT.config && BCT.config.priceApi) || '').replace(/\/+$/, ''),
    token: sessionStorage.getItem('bct-admin-token') || '',
    exp: +(sessionStorage.getItem('bct-admin-exp') || 0),
    content: { offers: {}, custom: [] },
    dirty: false, q: '', filter: 'all', ed: null, pendingSave: false
  };

  /* ---------- të dhënat ---------- */
  const baseOf = id => BASE.find(o => o.id === id);
  const customOf = id => S.content.custom.find(x => x.id === id);
  const clean = x => Object.fromEntries(Object.entries(x || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  function effective(id) {
    const c = customOf(id);
    if (c) { const b = baseOf(c.base); return b ? { ...b, ...clean(c), id: c.id, _custom: true, _base: c.base, hidden: !!c.hidden, old: c.old === 0 ? undefined : (c.old ?? b.old) } : null; }
    const b = baseOf(id); if (!b) return null;
    const ov = S.content.offers[id] || {};
    return { ...b, ...clean(ov), hidden: !!ov.hidden, old: ov.old === 0 ? undefined : (ov.old ?? b.old), _changed: Object.keys(ov).length > 0 };
  }
  function photoOf(o) {
    if (o.photo) { const src = /^(https?:|data:|\/)/.test(o.photo) ? o.photo : PHS[o.photo]; if (src) return { src, pos: o.photoPos || '50% 50%' }; }
    const p = OPH[o._base || o.id];
    return p && PHS[p[0]] ? { src: PHS[p[0]], pos: o.photoPos || p[1] || '50% 50%' } : null;
  }
  const defaultPos = o => { const p = OPH[o._base || o.id]; return (p && p[1]) || '50% 50%'; };
  const allIds = () => {
    const out = [];
    [...BASE].sort((a, b) => a.rank - b.rank).forEach(b => { out.push(b.id); S.content.custom.filter(c => c.base === b.id).forEach(c => out.push(c.id)); });
    return out;
  };

  /* ---------- shërbimi ---------- */
  async function call(path, opts = {}) {
    if (!S.api) throw new Error('Vendosni adresën e shërbimit 24/7.');
    const headers = { ...(opts.headers || {}) };
    if (S.token) headers.Authorization = `Bearer ${S.token}`;
    let r;
    try { r = await fetch(S.api + path, { ...opts, headers }); }
    catch (e) { throw new Error('Shërbimi nuk u gjet. Kontrolloni adresën dhe ALLOWED_ORIGINS te Worker-i.'); }
    let body = null; try { body = await r.json(); } catch (e) { /* bosh */ }
    if (r.status === 401 && path !== '/admin/login') { needLogin('Sesioni skadoi. Hyni sërish: ndryshimet tuaja janë ende këtu.'); throw new Error('401'); }
    if (!r.ok) throw new Error((body && body.error) || `Gabim ${r.status}`);
    return body;
  }

  /* ---------- njoftime ---------- */
  let toastT;
  function toast(msg, bad) {
    const t = $('#toast'); t.textContent = msg; t.className = `toast is-on${bad ? ' toast--bad' : ''}`;
    clearTimeout(toastT); toastT = setTimeout(() => { t.className = 'toast'; }, 3800);
  }
  function markDirty(v = true) {
    S.dirty = v;
    const n = Object.keys(S.content.offers).length + S.content.custom.length;
    $('#saveBar').hidden = !v;
    $('#saveInfo').textContent = v ? 'Keni ndryshime që nuk janë publikuar ende.' : '';
    $('#statChanged').textContent = String(n);
  }
  window.addEventListener('beforeunload', e => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- hyrja ---------- */
  function needLogin(msg) {
    S.token = ''; sessionStorage.removeItem('bct-admin-token');
    $('#loginErr').textContent = msg || '';
    $('#login').hidden = false; $('#app').hidden = true; $('#logout').hidden = true;
    $('#apiInput').value = S.api;
    $('#apiRow').hidden = !!S.api && !msg;
    setTimeout(() => $('#pass').focus(), 50);
  }
  $('#apiToggle').addEventListener('click', () => { $('#apiRow').hidden = !$('#apiRow').hidden; });
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const api = $('#apiInput').value.trim().replace(/\/+$/, '');
    if (api) { S.api = api; localStorage.setItem('bct-admin-api', api); }
    if (!S.api) { $('#apiRow').hidden = false; $('#loginErr').textContent = 'Vendosni adresën e shërbimit 24/7 (p.sh. https://bct-flights.EMRI.workers.dev).'; return; }
    const btn = $('#loginBtn'); btn.disabled = true; $('#loginErr').textContent = '';
    try {
      const r = await call('/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#pass').value }) });
      S.token = r.token; S.exp = r.expires;
      sessionStorage.setItem('bct-admin-token', S.token); sessionStorage.setItem('bct-admin-exp', String(S.exp));
      $('#pass').value = '';
      if (S.pendingSave) { S.pendingSave = false; showApp(); publish(); return; }
      await loadContent(); showApp();
    } catch (err) { $('#loginErr').textContent = err.message; }
    finally { btn.disabled = false; }
  });
  $('#logout').addEventListener('click', () => {
    if (S.dirty && !confirm('Keni ndryshime të papublikuara. Të dilni gjithsesi?')) return;
    S.dirty = false; needLogin('');
  });
  async function loadContent() {
    const c = await call('/content', { cache: 'no-store' });
    S.content = { offers: (c && c.offers) || {}, custom: (c && c.custom) || [] };
    $('#lastSaved').textContent = c && c.updated ? `Publikuar së fundi: ${new Date(c.updated).toLocaleString('sq-AL')}` : 'Ende pa ndryshime të publikuara.';
    markDirty(false);
  }
  function showApp() { $('#login').hidden = true; $('#app').hidden = false; $('#logout').hidden = false; renderList(); }

  /* ---------- lista ---------- */
  $('#search').addEventListener('input', e => { S.q = e.target.value.trim().toLowerCase(); renderList(); });
  $$('[data-filter]').forEach(b => b.addEventListener('click', () => {
    S.filter = b.dataset.filter; $$('[data-filter]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); renderList();
  }));
  function renderList() {
    const items = allIds().map(effective).filter(Boolean);
    $('#statTotal').textContent = String(items.length);
    $('#statLive').textContent = String(items.filter(o => !o.hidden && (o.dates || []).some(d => d[0] >= todayIso)).length);
    const shown = items.filter(o => {
      if (S.q && !`${o.title} ${o.tag} ${o.id}`.toLowerCase().includes(S.q)) return false;
      if (S.filter === 'live') return !o.hidden;
      if (S.filter === 'hidden') return o.hidden;
      if (S.filter === 'changed') return o._changed || o._custom;
      return true;
    });
    $('#list').innerHTML = shown.map(o => {
      const p = photoOf(o), future = (o.dates || []).filter(d => d[0] >= todayIso).sort((a, b) => a[0] < b[0] ? -1 : 1);
      const badges = [o.hidden ? '<span class="badge badge--grey">E fshehur</span>' : '', o._custom ? '<span class="badge badge--blue">Kopje</span>' : '',
        o._changed ? '<span class="badge badge--gold">Ndryshuar</span>' : '', !future.length ? '<span class="badge badge--red">Pa data: nuk shfaqet</span>' : ''].join('');
      return `<article class="oc${o.hidden ? ' is-hidden' : ''}">
        <div class="oc__img">${p ? `<img src="${p.src}" alt="" data-pos="${esc(p.pos)}">` : ''}<div class="oc__badges">${badges}</div></div>
        <div class="oc__body">
          <p class="oc__tag">${esc(o.tag || '')}</p>
          <h3>${esc(o.title)}</h3>
          <p class="oc__price">nga <b>${money(o.price)}</b>${o.old ? ` <s>${money(o.old)}</s>` : ''} <span>· ${o.nights} netë</span></p>
          <p class="oc__dates">${future.length ? `${future.length} data, e para ${fmtDate(future[0][0])}` : 'Asnjë datë në të ardhmen'}</p>
        </div>
        <div class="oc__actions"><button class="btn btn--dark" data-edit="${esc(o.id)}">Ndrysho</button><button class="btn" data-dup="${esc(o.id)}">Dupliko</button>${o._custom ? `<button class="btn btn--danger" data-del="${esc(o.id)}">Fshi</button>` : ''}</div>
      </article>`;
    }).join('') || '<p class="empty">Asnjë ofertë për këtë kërkim.</p>';
    $$('#list img[data-pos]').forEach(im => { im.style.objectPosition = im.dataset.pos; });
  }
  $('#list').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.edit) openEditor(b.dataset.edit);
    if (b.dataset.dup) duplicate(b.dataset.dup);
    if (b.dataset.del && confirm('Ta fshij këtë kopje të ofertës?')) { S.content.custom = S.content.custom.filter(c => c.id !== b.dataset.del); markDirty(); renderList(); }
  });
  function duplicate(id) {
    const o = effective(id); if (!o) return;
    const src = o._custom ? { ...customOf(id) } : { ...(S.content.offers[id] || {}) };
    delete src.hidden;
    const copy = { ...src, id: `c-${Math.random().toString(36).slice(2, 8)}`, base: o._base || o.id, title: `${o.title} (kopje)` };
    S.content.custom.push(copy); markDirty(); renderList(); openEditor(copy.id);
  }

  /* ---------- redaktori ---------- */
  const ed = $('#editor');
  function openEditor(id) {
    const o = effective(id); if (!o) return;
    const p = photoOf(o);
    S.ed = { id, photo: o.photo || '', photoPos: (p && p.pos) || defaultPos(o), notes: Object.fromEntries((o.dates || []).filter(d => d[2]).map(d => [d[0], d[2]])) };
    $('#edTitle').textContent = o._custom ? 'Ndrysho kopjen e ofertës' : 'Ndrysho ofertën';
    $('#edId').textContent = o._custom ? `Kopje e: ${baseOf(o._base).title}` : `Kodi: ${o.id}`;
    $('#fShow').checked = !o.hidden;
    $('#fTitle').value = o.title || ''; $('#fTag').value = o.tag || ''; $('#fSub').value = o.sub || '';
    $('#fNights').value = o.nights || ''; $('#fStay').value = o.stay || ''; $('#fMeal').value = o.meal || '';
    $('#fPrice').value = o.price || ''; $('#fOld').value = o.old || '';
    $('#fHl').value = (o.highlights || []).join('\n');
    $('#dates').innerHTML = ''; (o.dates || []).slice().sort((a, b) => a[0] < b[0] ? -1 : 1).forEach(d => addDateRow(d[0], d[1]));
    $('#resetBtn').hidden = !!o._custom || !o._changed;
    $('#edErr').textContent = '';
    $('#photoStrip').innerHTML = Object.keys(PHS).map(k => `<button type="button" class="strip__item" data-ph="${k}" aria-label="Foto ${k}"><img src="${PHS[k]}" alt=""></button>`).join('');
    updatePhoto();
    ed.showModal(); ed.scrollTop = 0;
  }
  function addDateRow(d = '', s = 10) {
    const row = document.createElement('div'); row.className = 'drow';
    row.innerHTML = `<input type="date" class="in" value="${esc(d)}" aria-label="Data e nisjes"><label class="drow__seats"><input type="number" class="in" min="0" max="999" value="${esc(s)}" aria-label="Vende të lira"><span>vende</span></label><button type="button" class="icon-btn" aria-label="Hiqe datën">×</button>`;
    row.querySelector('button').addEventListener('click', () => row.remove());
    $('#dates').appendChild(row);
  }
  $('#addDate').addEventListener('click', () => { addDateRow(''); $('#dates .drow:last-child input[type=date]').focus(); });
  function currentPhoto() {
    const o = effective(S.ed.id);
    return photoOf({ ...o, photo: S.ed.photo, photoPos: S.ed.photoPos });
  }
  function updatePhoto() {
    const p = currentPhoto();
    $('#phMain').src = p ? p.src : ''; $('#phMain').hidden = !p;
    $$('.ph-prev img').forEach(im => { im.src = p ? p.src : ''; im.style.objectPosition = S.ed.photoPos; });
    const [x, y] = S.ed.photoPos.split(' ').map(parseFloat);
    $('#phDot').style.left = `${x}%`; $('#phDot').style.top = `${y}%`;
    $$('.strip__item').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ph === S.ed.photo)));
  }
  $('#phPick').addEventListener('click', e => {
    const im = $('#phMain'), r = im.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100), y = Math.round(((e.clientY - r.top) / r.height) * 100);
    S.ed.photoPos = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`; updatePhoto();
  });
  $('#photoStrip').addEventListener('click', e => {
    const b = e.target.closest('[data-ph]'); if (!b) return;
    S.ed.photo = b.dataset.ph; S.ed.photoPos = '50% 50%'; updatePhoto();
  });
  async function compress(file) {
    const bmp = await (window.createImageBitmap ? createImageBitmap(file) : new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }));
    const w = bmp.width, h = bmp.height, k = Math.min(1, 1800 / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = t => new Promise(res => c.toBlob(res, t, t === 'image/webp' ? 0.82 : 0.86));
    let b = await blob('image/webp');
    if (!b || b.type !== 'image/webp') b = await blob('image/jpeg');
    return b;
  }
  $('#phFile').addEventListener('change', async e => {
    const f = e.target.files && e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { $('#phStatus').textContent = 'Zgjidhni një foto (JPG, PNG ose WebP).'; return; }
    try {
      $('#phStatus').textContent = 'Po e përgatis foton…';
      const blob = await compress(f);
      $('#phStatus').textContent = `Po ngarkohet (${Math.round(blob.size / 1024)} KB)…`;
      const r = await call('/admin/photo', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
      S.ed.photo = r.url; S.ed.photoPos = '50% 50%'; updatePhoto();
      $('#phStatus').textContent = 'Fotoja u ngarkua. Klikoni mbi të për të zgjedhur pjesën kryesore.';
    } catch (err) { if (err.message !== '401') $('#phStatus').textContent = err.message; }
  });

  function readForm() {
    const dates = $$('#dates .drow').map(r => { const [d, s] = r.querySelectorAll('input'); return [d.value, Math.max(0, parseInt(s.value, 10) || 0)]; })
      .filter(d => d[0]).sort((a, b) => a[0] < b[0] ? -1 : 1).map(d => (S.ed.notes[d[0]] ? [...d, S.ed.notes[d[0]]] : d));
    return {
      hidden: !$('#fShow').checked,
      title: $('#fTitle').value.trim(), tag: $('#fTag').value.trim(), sub: $('#fSub').value.trim(),
      nights: parseInt($('#fNights').value, 10) || 0, stay: $('#fStay').value.trim(), meal: $('#fMeal').value.trim(),
      price: Math.round(parseFloat(String($('#fPrice').value).replace(',', '.')) || 0),
      old: Math.round(parseFloat(String($('#fOld').value).replace(',', '.')) || 0),
      highlights: $('#fHl').value.split('\n').map(s => s.trim()).filter(Boolean),
      dates
    };
  }
  $('#edSave').addEventListener('click', () => {
    const v = readForm(), id = S.ed.id, c = customOf(id), base = c ? baseOf(c.base) : baseOf(id);
    const err = !v.title ? 'Shkruani titullin.' : v.price <= 0 ? 'Shkruani çmimin.' : v.nights < 1 ? 'Shkruani numrin e netëve.' : v.old && v.old <= v.price ? 'Çmimi i vjetër duhet të jetë më i lartë se çmimi i ri.' : '';
    if (err) { $('#edErr').textContent = err; return; }
    const ov = {};
    for (const k of ['title', 'tag', 'sub', 'nights', 'stay', 'meal', 'price', 'highlights', 'dates']) {
      if (JSON.stringify(v[k]) !== JSON.stringify(base[k] ?? (k === 'highlights' || k === 'dates' ? [] : ''))) ov[k] = v[k];
    }
    if (v.old !== (base.old || 0)) ov.old = v.old || 0;
    if (S.ed.photo && S.ed.photo !== (base.photo || '')) ov.photo = S.ed.photo;
    if (S.ed.photoPos !== defaultPos({ ...base, _base: c ? c.base : undefined }) || ov.photo) ov.photoPos = S.ed.photoPos;
    if (v.hidden) ov.hidden = true;
    if (c) { Object.keys(c).forEach(k => { if (k !== 'id' && k !== 'base') delete c[k]; }); Object.assign(c, ov, { title: v.title }); }
    else if (Object.keys(ov).length) S.content.offers[id] = ov;
    else delete S.content.offers[id];
    ed.close(); markDirty(); renderList();
    toast('U ruajt te paneli. Shtypni "Publiko" që të dalë në faqe.');
  });
  $('#edCancel').addEventListener('click', () => ed.close());
  $('#edClose').addEventListener('click', () => ed.close());
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Të rikthehet oferta siç ishte në fillim (çmimi, tekstet, datat dhe fotoja)?')) return;
    delete S.content.offers[S.ed.id]; ed.close(); markDirty(); renderList();
  });

  /* ---------- publikimi ---------- */
  async function publish() {
    const btn = $('#publish'); btn.disabled = true; btn.textContent = 'Po publikohet…';
    try {
      const r = await call('/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(S.content) });
      markDirty(false);
      $('#lastSaved').textContent = `Publikuar së fundi: ${new Date(r.updated).toLocaleString('sq-AL')}`;
      toast('U publikua. Faqja përditësohet brenda një minute.');
    } catch (err) {
      if (err.message === '401') S.pendingSave = true; else toast(err.message, true);
    } finally { btn.disabled = false; btn.textContent = 'Publiko në faqe'; }
  }
  $('#publish').addEventListener('click', publish);
  $('#discard').addEventListener('click', async () => {
    if (!confirm('Të anulohen të gjitha ndryshimet e papublikuara?')) return;
    try { await loadContent(); renderList(); toast('Ndryshimet u anuluan.'); } catch (err) { toast(err.message, true); }
  });

  /* ---------- nisja ---------- */
  if (S.token && S.exp > Date.now() && S.api) loadContent().then(showApp).catch(err => needLogin(err.message === '401' ? '' : err.message));
  else needLogin('');
})();
