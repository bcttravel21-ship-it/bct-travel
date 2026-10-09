// Boti i Flytik – BCT Travel
// Hyn në Flytik me user dhe password, kërkon çdo destinacion nga Prishtina, lexon çmimet ditë për ditë
// (vajtje dhe kthim), shton markup-un tuaj dhe ia dërgon çmimet shërbimit 24/7 (Cloudflare Worker).
// User-i, password-i dhe çelësat lexohen nga "secrets"; kurrë nuk shkruhen në kod.

import { mkdir, writeFile } from 'node:fs/promises';
const pw = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;

const E = process.env;
const LOGIN_URL = E.FLYTIK_URL || 'https://www.flytik.com/';
const USER = E.FLYTIK_USER, PASS = E.FLYTIK_PASS;
const WORKER = (E.WORKER_URL || '').replace(/\/+$/, ''), KEY = E.INGEST_KEY || '';
const CENTERS = (E.WINDOWS || '8,23').split(',').map(n => parseInt(n, 10)).filter(n => n > 0);   // qendra e çdo kërkimi, në ditë nga sot
const FLEX = parseInt(E.FLEX || '8', 10);                                                         // "± Ditë" në formë
const PCT = parseFloat(E.MARKUP_PERCENT || '0') || 0, FIX = parseFloat(E.MARKUP_FIXED || '0') || 0;
const ONLY = (E.ONLY_ROUTES || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
const DEBUG = E.DEBUG === '1', PAUSE = parseInt(E.PAUSE_MS || '1500', 10);

if (!USER || !PASS) { console.error('Mungojnë FLYTIK_USER ose FLYTIK_PASS. Shtojini si secrets (README, hapi 2).'); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const plusDays = n => { const d = new Date(); d.setUTCHours(12, 0, 0, 0); d.setUTCDate(d.getUTCDate() + n); return d; };
const dmy = d => `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
const markup = p => Math.ceil(p * (1 + PCT / 100) + FIX);

async function snap(page, name) {
  await mkdir('debug', { recursive: true });
  await page.screenshot({ path: `debug/${name}.png`, fullPage: true }).catch(() => {});
  await writeFile(`debug/${name}.html`, await page.content().catch(() => '')).catch(() => {});
}

/* ---------- 1. Hyrja ---------- */
async function login(page) {
  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  const pass = page.locator('input[type=password]').first();
  await pass.waitFor({ timeout: 20000 });
  const form = page.locator('form', { has: pass }).first();
  const scope = (await form.count()) ? form : page;
  await scope.locator('input[type=text], input[type=email], input:not([type])').first().fill(USER);
  await pass.fill(PASS);
  if (DEBUG) await snap(page, '1-hyrja');
  const candidates = [
    scope.locator('input[type=submit][value*="login" i], input[type=button][value*="login" i], input[type=image]'),
    scope.getByRole('button', { name: /login|hyr/i }),
    scope.locator('a', { hasText: /login/i })
  ];
  let clicked = false;
  for (const c of candidates) { if (await c.count()) { await c.first().click(); clicked = true; break; } }
  if (!clicked) await pass.press('Enter');
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  if (!(await airportSelects(page)).length && await page.locator('input[type=password]').count()) {
    await snap(page, 'gabim-hyrja');
    throw new Error('Hyrja dështoi: kontrolloni FLYTIK_USER dhe FLYTIK_PASS (ose faqja kërkon kod/CAPTCHA).');
  }
}

/* ---------- 2. Forma e kërkimit ---------- */
async function airportSelects(page) {
  return page.evaluate(() => [...document.querySelectorAll('select')].map((s, i) => ({ i, a: [...s.options].filter(o => /\([A-Z]{3}\)/.test(o.text)).length }))
    .filter(x => x.a >= 2).map(x => x.i));
}
let SEARCH_PAGE = E.SEARCH_URL || '';
const hasForm = async page => (await airportSelects(page)).length >= 2;
async function openSearch(page) {
  if (await hasForm(page)) { if (!SEARCH_PAGE) SEARCH_PAGE = page.url(); return; }
  const tries = [
    async () => { if (SEARCH_PAGE) await page.goto(SEARCH_PAGE, { waitUntil: 'networkidle', timeout: 45000 }); },   // adresa e formës, e mbajtur mend
    async () => { await page.goBack({ waitUntil: 'networkidle', timeout: 30000 }); },
    async () => { const l = page.locator('a', { hasText: /kërkoni|kërko|booking|rezerv/i }).first(); if (await l.count()) { await l.click(); await page.waitForLoadState('networkidle').catch(() => {}); } }
  ];
  for (const t of tries) { await t().catch(() => {}); if (await hasForm(page)) { if (!SEARCH_PAGE) SEARCH_PAGE = page.url(); return; } }
  await snap(page, 'gabim-forma');
  throw new Error('Nuk e gjeta formën e kërkimit (vendosni SEARCH_URL me adresën e faqes "Kërko udhëtimin").');
}
async function destinations(page) {
  const [, toIdx] = await airportSelects(page);
  return page.locator('select').nth(toIdx).evaluate(s => [...s.options].map(o => { const m = /^(.*?)\s*\(([A-Z]{3})\)/.exec(o.text.trim()); return m ? { code: m[2], city: m[1].trim(), value: o.value } : null; })
    .filter(x => x && x.code !== 'PRN'));
}
async function selectAirport(page, idx, code) {
  await page.locator('select').nth(idx).evaluate((s, c) => {
    const o = [...s.options].find(x => x.text.includes(`(${c})`)); if (!o) return;
    s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true }));
  }, code);
}
async function search(page, code, center) {
  await openSearch(page);
  const sel = await airportSelects(page);
  await selectAirport(page, sel[0], 'PRN');
  await selectAirport(page, sel[1], code);
  if (sel.length >= 4) { await selectAirport(page, sel[2], code); await selectAirport(page, sel[3], 'PRN'); }
  const rt = page.getByText(/Nisje dhe Kthim/i).first();
  await page.evaluate(() => { const r = [...document.querySelectorAll('input[type=radio]')].find(x => /kthim/i.test((x.nextSibling && x.nextSibling.textContent) || '') || /rt|kthim/i.test(x.value)); if (r && !r.checked) r.click(); });
  if (!(await page.locator('input[type=radio]:checked').count()) && await rt.count()) await rt.click().catch(() => {});
  const date = dmy(plusDays(center));
  const n = await page.evaluate(d => {
    const inputs = [...document.querySelectorAll('input')].filter(el => /^\d{2}\.\d{2}\.\d{4}$/.test(el.value));
    inputs.slice(0, 2).forEach(el => { el.removeAttribute('readonly'); el.value = d; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
    return inputs.length;
  }, date);
  if (n < 1) { await snap(page, `gabim-datat-${code}`); throw new Error('Nuk i gjeta fushat e datave (dd.mm.vvvv).'); }
  await page.evaluate(flex => {
    const x = document.evaluate("//text()[contains(., 'Ditë')]/following::select[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (!x) return;
    const best = [...x.options].map(o => o.value || o.text).filter(v => /^\d+$/.test(v) && +v <= flex).sort((a, b) => b - a)[0];
    if (best !== undefined) { x.value = best; x.dispatchEvent(new Event('change', { bubbles: true })); }
  }, FLEX);
  if (DEBUG && code === ONLY[0]) await snap(page, `2-forma-${code}`);
  const btns = [page.locator('input[type=submit][value*="Kërko" i], input[type=button][value*="Kërko" i]'), page.getByRole('button', { name: /kërko/i }), page.locator('a', { hasText: /kërko udhëtimin/i })];
  let ok = false;
  for (const b of btns) { if (await b.count()) { await b.first().click(); ok = true; break; } }
  if (!ok) { await snap(page, `gabim-butoni-${code}`); throw new Error('Nuk e gjeta butonin "Kërko udhëtimin".'); }
  await page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => {});
  await page.waitForFunction(() => /Gjithsejt/i.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  return parse(page, center);
}

/* ---------- 3. Leximi i tabelave ---------- */
async function parse(page, center) {
  const tables = await page.evaluate(() => {
    const norm = s => (s || '').replace(/\s+/g, ' ').trim(), out = [];
    for (const t of document.querySelectorAll('table')) {
      const rows = [...t.querySelectorAll(':scope > tbody > tr, :scope > thead > tr, :scope > tr')];
      const hi = rows.findIndex(r => { const c = [...r.children].map(x => norm(x.textContent).toLowerCase()); return c.includes('data') && c.some(h => h.startsWith('gjithsej')); });
      if (hi < 0) continue;
      const head = [...rows[hi].children].map(c => norm(c.textContent).toLowerCase()), col = p => head.findIndex(h => h.startsWith(p));
      const ci = { date: col('data'), time: col('nisje'), nr: col('nr'), price: col('gjithsej'), seats: col('vend') };
      const list = rows.slice(hi + 1).map(r => [...r.children].map(x => norm(x.textContent))).filter(c => c.length >= head.length - 1)
        .map(c => ({ date: c[ci.date] || '', time: c[ci.time] || '', nr: c[ci.nr] || '', price: c[ci.price] || '', seats: ci.seats >= 0 ? c[ci.seats] || '' : '' }));
      let title = '', el = t;
      for (let k = 0; k < 6 && el && !title; k++) { el = el.previousElementSibling || el.parentElement; if (el && /Nisja|Kthimi/.test(el.textContent || '')) title = /Kthimi/.test(norm(el.textContent).slice(0, 40)) ? 'in' : 'out'; }
      out.push({ title, rows: list });
    }
    return out;
  });
  if (!tables.length) return null;
  const base = plusDays(center);
  const toIso = s => {                                                  // "Pre 09.10" -> 2026-10-09 (viti sipas datës së kërkimit)
    const m = /(\d{1,2})\.(\d{1,2})/.exec(s); if (!m) return null;
    let best = null;
    for (const y of [base.getUTCFullYear() - 1, base.getUTCFullYear(), base.getUTCFullYear() + 1]) {
      const d = new Date(Date.UTC(y, +m[2] - 1, +m[1], 12));
      if (!best || Math.abs(d - base) < Math.abs(best - base)) best = d;
    }
    return iso(best);
  };
  const legs = { out: [], in: [] };
  tables.forEach((t, i) => { const dir = t.title || (i === 0 ? 'out' : 'in'); if (legs[dir] && !legs[dir].length) legs[dir] = t.rows; });
  const result = {};
  for (const dir of ['out', 'in']) {
    const days = new Set(), flights = [];
    for (const r of legs[dir]) {
      const date = toIso(r.date); if (!date) continue;
      days.add(date);
      if (/shitur/i.test(r.price) || r.seats.trim() === '0') continue;          // e shitur
      const pm = /(\d[\d.,]*)/.exec(r.price.replace(/\s/g, '')), tm = /(\d{1,2}:\d{2})\D+(\d{1,2}:\d{2})/.exec(r.time);
      if (!pm || !tm) continue;
      const price = parseFloat(pm[1].replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'));
      const currency = /CHF/i.test(r.price) ? 'CHF' : 'EUR';
      flights.push({ date, dep: tm[1].padStart(5, '0'), arr: tm[2].padStart(5, '0'), flight: r.nr, price: markup(price), currency });
    }
    result[dir] = { days: [...days], flights };
  }
  return result;
}

/* ---------- 4. Dërgimi te shërbimi 24/7 ---------- */
async function send(path, body) {
  if (!WORKER) return;
  const r = await fetch(`${WORKER}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Ingest-Key': KEY }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Shërbimi ktheu ${r.status}: ${(await r.text()).slice(0, 120)}`);
}

/* ---------- Nisja ---------- */
const browser = await chromium.launch();
const page = await (await browser.newContext({ locale: 'sq-AL', viewport: { width: 1280, height: 900 } })).newPage();
const today = iso(plusDays(0)), index = {}, all = {};
let ok = 0, failed = 0;
try {
  await login(page);
  console.log('Hyrja: OK');
  await openSearch(page);
  let list = await destinations(page);
  if (ONLY.length) list = list.filter(d => ONLY.includes(d.code));
  console.log(`Destinacione: ${list.length}`);
  for (const d of list) {
    try {
      const data = { city: d.city, updated: new Date().toISOString(), out: {}, in: {} }, days = { out: new Set(), in: new Set() };
      for (const center of CENTERS) {
        const r = await search(page, d.code, center);
        if (!r) throw new Error('nuk u gjet tabela me çmime');
        for (const dir of ['out', 'in']) {
          r[dir].days.forEach(x => x >= today && days[dir].add(x));
          for (const f of r[dir].flights) {
            if (f.date < today) continue;
            const arr = (data[dir][f.date] = data[dir][f.date] || []);
            if (!arr.some(x => x.flight === f.flight && x.dep === f.dep)) arr.push({ dep: f.dep, arr: f.arr, flight: f.flight, price: f.price, currency: f.currency });
          }
        }
        await sleep(PAUSE);
      }
      for (const dir of ['out', 'in']) for (const k of Object.keys(data[dir])) data[dir][k].sort((a, b) => a.price - b.price);
      const covered = [...days.out, ...days.in].sort();
      if (!covered.length) throw new Error('tabela pa data');
      data.from = covered[0]; data.until = covered[covered.length - 1];
      await send(`/ingest?route=${d.code}`, data);
      all[d.code] = data;
      const cheapest = Object.entries(data.out).flatMap(([date, fl]) => fl.map(f => ({ ...f, date }))).sort((a, b) => a.price - b.price)[0];
      if (cheapest) index[d.code] = { price: cheapest.price, currency: cheapest.currency, date: cheapest.date, flight: cheapest.flight, city: d.city };
      const nOut = Object.values(data.out).flat().length, nIn = Object.values(data.in).flat().length;
      console.log(`${d.code}: ${days.out.size} ditë, ${nOut} fluturime vajtje, ${nIn} kthim`);   // pa çmime në log
      ok++;
    } catch (e) {
      failed++;
      console.warn(`${d.code}: ${e.message}`);
      if (failed <= 2) await snap(page, `gabim-${d.code}`);
    }
  }
  await send('/ingest?index=1', { updated: new Date().toISOString(), source: 'flytik', routes: index });
  if (!WORKER || DEBUG) { await mkdir('debug', { recursive: true }); await writeFile('debug/flytik.json', JSON.stringify({ index, all }, null, 2)); }
  console.log(`\nGati: ${ok} destinacione me çmime, ${failed} me gabim.${WORKER ? ' Çmimet u dërguan te shërbimi.' : ' (WORKER_URL mungon: u ruajtën vetëm te debug/flytik.json)'}`);
} catch (e) {
  console.error(e.message);
  await snap(page, 'gabim');
  process.exitCode = 1;
} finally {
  await browser.close();
}
if (failed && !ok) process.exitCode = 1;
