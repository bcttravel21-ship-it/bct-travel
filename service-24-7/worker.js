// BCT Travel – shërbimi 24/7 i çmimeve të fluturimeve (Cloudflare Worker)
//
//   GET /search  -> kërkim live te Duffel për qytetin, datat dhe udhëtarët që zgjedh klienti
//   GET /prices  -> çmimet "nga" për të gjitha qytetet, që shërbimi i rifreskon vetë
//   Orari (Cron) -> çdo orë kontrollon disa qytete me radhë; brenda ditës i kalon të gjitha
//
// Cilësimet në Cloudflare (Settings → Variables and Secrets / Bindings):
//   DUFFEL_TOKEN     (Secret)   token-i i Duffel; kurrë mos e vendosni në faqe
//   PRICES           (KV)       hapësira ku ruhen çmimet
//   ALLOWED_ORIGINS  (tekst)    p.sh. https://bct-travel.com,https://www.bct-travel.com
//   BATCH            (tekst)    sa kontrolle bën çdo orë (parazgjedhja: 3)
//   DAYS_AHEAD       (tekst)    pas sa ditësh kontrollohen datat "nga" (parazgjedhja: 10,24)
//   MAX_CONNECTIONS  (tekst)    0 = vetëm fluturime direkte (parazgjedhja), 1 = edhe me një ndalesë
//   INGEST_KEY       (Secret)   fjalëkalimi me të cilin boti i Flytik dërgon çmimet (/ingest)
//   ADMIN_PASSWORD   (Secret)   fjalëkalimi i panelit të administrimit (admin.html)
//
// Duffel është opsional: nëse s'ka DUFFEL_TOKEN, shërbimi punon vetëm me çmimet që dërgon boti i Flytik.

const HOME = 'PRN';
const ROUTES = ['BER', 'BRE', 'DTM', 'DUS', 'HHN', 'HAM', 'HAJ', 'FKB', 'CGN', 'FMM', 'MUC', 'FMO', 'NUE', 'STR', 'ZRH', 'GVA', 'BSL',
  'MMX', 'GOT', 'VXO', 'MXP', 'FCO', 'TRS', 'BRU', 'CRL', 'SZG', 'OSL', 'HEL', 'LTN', 'LUX', 'LJU', 'BTS', 'OHD'];
const SEARCH_CACHE_SECONDS = 1800;              // e njëjta kërkesë ruhet 30 minuta
const FRESH_HOURS = 48;                         // çmimet "nga" më të vjetra se kaq nuk shfaqen
const BASE = 'https://api.duffel.com';

/* ---------- ndihmës ---------- */
const day = n => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
const int = (v, lo, hi, def) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def; };
const conf = env => ({
  batch: int(env.BATCH, 1, 10, 3),
  days: String(env.DAYS_AHEAD || '10,24').split(',').map(x => int(x, 1, 330, 14)),
  maxConn: int(env.MAX_CONNECTIONS, 0, 2, 0),
  api: env.DUFFEL_API || BASE
});

function cors(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
  const ok = allowed.includes('*') || allowed.includes(origin);
  return { ok: ok || !origin, headers: ok && origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : (allowed.includes('*') ? { 'Access-Control-Allow-Origin': '*' } : {}) };
}
const json = (data, status, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...extra }
});

/* ---------- Duffel ---------- */
async function duffelSearch(env, slices, passengers, maxConn) {
  const res = await fetch(`${conf(env).api}/air/offer_requests?return_offers=true&supplier_timeout=12000`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.DUFFEL_TOKEN}`,
      'Duffel-Version': 'v2',
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ data: { slices, passengers, cabin_class: 'economy', max_connections: maxConn } })
  });
  if (!res.ok) throw new Error(`Duffel ${res.status}`);
  return ((await res.json()).data || {}).offers || [];
}

function slim(o) {
  return {
    price: Math.ceil(parseFloat(o.total_amount)),
    currency: o.total_currency,
    airline: (o.owner && o.owner.name) || '',
    slices: (o.slices || []).map(s => {
      const g = s.segments || [], a = g[0] || {}, b = g[g.length - 1] || {};
      return {
        from: a.origin && a.origin.iata_code, to: b.destination && b.destination.iata_code,
        dep: a.departing_at, arr: b.arriving_at, stops: Math.max(0, g.length - 1), duration: s.duration || '',
        flight: a.marketing_carrier ? `${a.marketing_carrier.iata_code} ${a.marketing_carrier_flight_number || ''}`.trim() : ''
      };
    })
  };
}

/* ---------- Çmimet nga boti i Flytik ---------- */
async function ingest(request, env, url) {
  if (!env.INGEST_KEY || request.headers.get('X-Ingest-Key') !== env.INGEST_KEY) return json({ error: 'Nuk lejohet.' }, 403);
  if (!env.PRICES) return json({ error: 'Mungon KV PRICES.' }, 500);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return json({ error: 'JSON i pavlefshëm.' }, 400);
  const route = (url.searchParams.get('route') || '').toUpperCase(), ttl = 3 * 86400;   // pa rifreskim 3 ditë: fshihen vetë
  if (route) {
    if (!/^[A-Z]{3}$/.test(route)) return json({ error: 'Kod i pavlefshëm.' }, 400);
    await env.PRICES.put(`fl:${route}`, JSON.stringify(body), { expirationTtl: ttl });
    return json({ ok: true, route }, 200);
  }
  if (url.searchParams.get('index')) { await env.PRICES.put('fl:index', JSON.stringify(body), { expirationTtl: ttl }); return json({ ok: true }, 200); }
  return json({ error: 'Mungon route ose index.' }, 400);
}

async function flytikSearch(env, city, inbound, dep, ret, ad, ch, inf) {
  const data = env.PRICES ? await env.PRICES.get(`fl:${city}`, 'json').catch(() => null) : null;
  if (!data || !data.from || !data.until) return null;
  const inside = d => d >= data.from && d <= data.until;
  if (!inside(dep) || (ret && !inside(ret))) return null;            // jashtë periudhës që kontrollon boti
  const [a, b] = inbound ? [city, HOME] : [HOME, city];
  const first = ((data[inbound ? 'in' : 'out'] || {})[dep]) || [];
  const back = ret ? (((data[inbound ? 'out' : 'in'] || {})[ret]) || []) : null;
  const leg = (f, from, to, date) => ({ from, to, dep: `${date}T${f.dep}:00`, arr: `${date}T${f.arr}:00`, stops: 0, duration: '', flight: f.flight || '' });
  let offers = [];
  if (!ret) offers = first.slice(0, 6).map(f => ({ price: f.price * ad, currency: f.currency, airline: 'Fluturim direkt', slices: [leg(f, a, b, dep)] }));
  else for (const f of first.slice(0, 4)) for (const g of back.slice(0, 3)) {
    if (f.currency === g.currency) offers.push({ price: (f.price + g.price) * ad, currency: f.currency, airline: 'Fluturim direkt', slices: [leg(f, a, b, dep), leg(g, b, a, ret)] });
  }
  offers.sort((x, y) => x.price - y.price);
  return {
    from: a, to: b, dep, ret, checked: data.updated, source: 'flytik', mode: 'live',
    note: ch || inf ? 'Çmimi i shfaqur është për të rriturit; për fëmijët dhe foshnjat çmimin e konfirmon agjenti.' : '',
    offers: offers.slice(0, 6)
  };
}

/* ---------- /search: kërkimi live ---------- */
const hits = new Map();                        // kufi i butë kundër abuzimit, për çdo IP
function tooMany(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 600000);
  list.push(now); hits.set(ip, list);
  return list.length > 20;                       // më shumë se 20 kërkime në 10 minuta
}

async function search(request, env, url) {
  const p = url.searchParams, city = (p.get('to') || '').toUpperCase(), inbound = p.get('dir') === 'in';
  const dep = p.get('dep'), ret = p.get('ret') || '';
  const ad = int(p.get('ad'), 1, 9, 1), ch = int(p.get('ch'), 0, 8, 0), inf = int(p.get('in'), 0, 4, 0);
  const idx = env.PRICES ? await env.PRICES.get('fl:index', 'json').catch(() => null) : null;
  if (!ROUTES.includes(city) && !(idx && idx.routes && idx.routes[city])) return json({ error: 'Ky qytet nuk është në listë.' }, 400);
  if (!isDate(dep) || dep < day(0) || dep > day(330)) return json({ error: 'Data e nisjes nuk është e saktë.' }, 400);
  if (ret && (!isDate(ret) || ret < dep || ret > day(340))) return json({ error: 'Data e kthimit nuk është e saktë.' }, 400);
  if (inf > ad) return json({ error: 'Çdo foshnjë duhet të udhëtojë me një të rritur.' }, 400);
  if (tooMany(request.headers.get('CF-Connecting-IP') || 'x')) return json({ error: 'Shumë kërkime njëra pas tjetrës. Provoni pas pak minutash.' }, 429);

  const fl = await flytikSearch(env, city, inbound, dep, ret, ad, ch, inf);
  if (fl) return json(fl, 200);
  if (!env.DUFFEL_TOKEN) return json({ error: 'Për këtë datë na shkruani në WhatsApp: boti kontrollon automatikisht vetëm javët e ardhshme.' }, 404);

  const [a, b] = inbound ? [city, HOME] : [HOME, city];
  const key = `s:${a}-${b}:${dep}:${ret}:${ad}-${ch}-${inf}`;
  const cached = env.PRICES ? await env.PRICES.get(key, 'json').catch(() => null) : null;
  if (cached) return json({ ...cached, cached: true }, 200);

  const slices = [{ origin: a, destination: b, departure_date: dep }];
  if (ret) slices.push({ origin: b, destination: a, departure_date: ret });
  const passengers = [...Array(ad)].map(() => ({ type: 'adult' }))
    .concat([...Array(ch)].map(() => ({ age: 8 })))
    .concat([...Array(inf)].map(() => ({ type: 'infant_without_seat' })));

  let offers;
  try { offers = await duffelSearch(env, slices, passengers, conf(env).maxConn); }
  catch (e) { return json({ error: 'Kërkimi nuk u krye. Provoni sërish, ose na shkruani në WhatsApp.' }, 502); }

  const seen = new Set(), list = [];
  for (const o of offers.map(slim).filter(o => Number.isFinite(o.price)).sort((x, y) => x.price - y.price)) {
    const sig = o.airline + o.slices.map(s => s.dep).join('|');
    if (seen.has(sig)) continue;                 // e njëjta fluturim me tarifë tjetër: mbaje më të lirën
    seen.add(sig); list.push(o);
    if (list.length === 6) break;
  }
  const out = { from: a, to: b, dep, ret, checked: new Date().toISOString(), mode: String(env.DUFFEL_TOKEN || '').startsWith('duffel_test_') ? 'test' : 'live', offers: list };
  if (env.PRICES) await env.PRICES.put(key, JSON.stringify(out), { expirationTtl: SEARCH_CACHE_SECONDS }).catch(() => {});
  return json(out, 200);
}

/* ---------- /prices dhe rifreskimi çdo orë ---------- */
async function prices(env) {
  const slots = (env.PRICES && await env.PRICES.get('slots', 'json').catch(() => null)) || {};
  const now = Date.now(), routes = {};
  for (const [code, byDay] of Object.entries(slots)) {
    let best = null;
    for (const r of Object.values(byDay)) {
      if (!r || !r.price || r.date < day(0) || now - new Date(r.checked) > FRESH_HOURS * 36e5) continue;
      if (!best || r.price < best.price) best = r;
    }
    if (best) routes[code] = best;
  }
  const meta = (env.PRICES && await env.PRICES.get('meta', 'json').catch(() => null)) || {};
  for (const r of Object.values(routes)) r.test = meta.mode === 'test';
  const idx = env.PRICES ? await env.PRICES.get('fl:index', 'json').catch(() => null) : null;
  if (idx && idx.routes) {                      // çmimet e Flytik kanë përparësi: janë nga furnitori juaj
    for (const [code, r] of Object.entries(idx.routes)) if (r && r.price && r.date >= day(0)) routes[code] = { ...r, checked: idx.updated, source: 'flytik', test: false };
  }
  const updated = [meta.updated, idx && idx.updated].filter(Boolean).sort().pop() || null;
  return { updated, mode: idx ? 'live' : (meta.mode || ''), routes };
}

async function refresh(env) {
  const c = conf(env), combos = [];
  ROUTES.forEach(code => c.days.forEach(n => combos.push([code, n])));
  const kv = env.PRICES;
  let pointer = parseInt((await kv.get('pointer')) || '0', 10) || 0;
  const slots = (await kv.get('slots', 'json')) || {};
  const done = [];
  for (let i = 0; i < c.batch; i++) {
    const [code, n] = combos[pointer % combos.length]; pointer++;
    const date = day(n);
    try {
      const offers = await duffelSearch(env, [{ origin: HOME, destination: code, departure_date: date }], [{ type: 'adult' }], c.maxConn);
      let best = null;
      for (const o of offers) { const v = parseFloat(o.total_amount); if (Number.isFinite(v) && (!best || v < best.v)) best = { v, o }; }
      slots[code] = slots[code] || {};
      slots[code][n] = best ? { price: Math.ceil(best.v), currency: best.o.total_currency, date, airline: (best.o.owner && best.o.owner.name) || '', checked: new Date().toISOString() } : null;
      done.push(`${code} ${date}: ${best ? Math.ceil(best.v) + ' ' + best.o.total_currency : 'pa ofertë'}`);
    } catch (e) {
      done.push(`${code} ${date}: gabim (${e.message})`);
    }
  }
  await kv.put('slots', JSON.stringify(slots));
  await kv.put('pointer', String(pointer % combos.length));
  await kv.put('meta', JSON.stringify({ updated: new Date().toISOString(), mode: String(env.DUFFEL_TOKEN || '').startsWith('duffel_test_') ? 'test' : 'live' }));
  console.log('Rifreskim:', done.join(' | '));
  return done;
}

/* ---------- Paneli i administrimit: çmimet, tekstet dhe fotot ---------- */
const enc = new TextEncoder();
async function sign(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(msg)));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function isAdmin(request, env) {
  const [exp, sig] = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').split('.');
  if (!env.ADMIN_PASSWORD || !exp || !sig || +exp < Date.now()) return false;
  return sig === await sign(env.ADMIN_PASSWORD, `admin:${exp}`);
}
async function adminLogin(request, env) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'Mungon ADMIN_PASSWORD te cilësimet e Worker-it.' }, 500);
  if (tooMany(`login:${request.headers.get('CF-Connecting-IP') || 'x'}`)) return json({ error: 'Shumë përpjekje. Provoni pas 10 minutash.' }, 429);
  const b = await request.json().catch(() => ({}));
  if (String(b.password || '') !== env.ADMIN_PASSWORD) return json({ error: 'Fjalëkalimi është i gabuar.' }, 401);
  const exp = Date.now() + 12 * 36e5;                                   // hyrja vlen 12 orë
  return json({ token: `${exp}.${await sign(env.ADMIN_PASSWORD, `admin:${exp}`)}`, expires: exp }, 200);
}
async function readContent(env) {
  return (env.PRICES && await env.PRICES.get('content', 'json').catch(() => null)) || { offers: {}, custom: [] };
}
async function saveContent(request, env) {
  if (!(await isAdmin(request, env))) return json({ error: 'Hyni sërish në panel.' }, 401);
  const text = await request.text();
  if (text.length > 900000) return json({ error: 'Të dhënat janë shumë të mëdha.' }, 413);
  let c; try { c = JSON.parse(text); } catch (e) { return json({ error: 'JSON i pavlefshëm.' }, 400); }
  if (!c || typeof c.offers !== 'object' || !Array.isArray(c.custom || [])) return json({ error: 'Format i pavlefshëm.' }, 400);
  const out = { updated: new Date().toISOString(), offers: c.offers, custom: c.custom || [] };
  await env.PRICES.put('content', JSON.stringify(out));
  return json({ ok: true, updated: out.updated }, 200);
}
async function uploadPhoto(request, env, url) {
  if (!(await isAdmin(request, env))) return json({ error: 'Hyni sërish në panel.' }, 401);
  const type = (request.headers.get('Content-Type') || '').split(';')[0];
  if (!['image/webp', 'image/jpeg', 'image/png'].includes(type)) return json({ error: 'Lejohen vetëm foto WebP, JPG ose PNG.' }, 415);
  const buf = await request.arrayBuffer();
  if (buf.byteLength > 3000000) return json({ error: 'Fotoja është mbi 3 MB.' }, 413);
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  await env.PRICES.put(`ph:${id}`, buf, { metadata: { type } });
  return json({ url: `${url.origin}/photo/${id}` }, 200);
}
async function servePhoto(env, id) {
  const r = env.PRICES ? await env.PRICES.getWithMetadata(`ph:${id}`, 'arrayBuffer').catch(() => null) : null;
  if (!r || !r.value) return new Response('Nuk u gjet', { status: 404 });
  return new Response(r.value, { headers: { 'Content-Type': (r.metadata && r.metadata.type) || 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' } });
}

/* ---------- hyrja ---------- */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), c = cors(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: c.ok ? 204 : 403, headers: { ...c.headers, 'Access-Control-Allow-Methods': 'GET, POST, PUT', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400' } });
    if (url.pathname.startsWith('/photo/') && request.method === 'GET') return servePhoto(env, url.pathname.slice(7).replace(/[^a-z0-9]/gi, ''));
    if (!c.ok) return json({ error: 'Nuk lejohet.' }, 403);
    let res;
    if (url.pathname === '/ingest' && request.method === 'POST') res = await ingest(request, env, url);
    else if (url.pathname === '/content' && request.method === 'GET') res = json(await readContent(env), 200, { 'Cache-Control': 'public, max-age=30' });
    else if (url.pathname === '/admin/login' && request.method === 'POST') res = await adminLogin(request, env);
    else if (url.pathname === '/admin/content' && request.method === 'PUT') res = await saveContent(request, env);
    else if (url.pathname === '/admin/photo' && request.method === 'POST') res = await uploadPhoto(request, env, url);
    else if (url.pathname === '/search' && request.method === 'GET') res = await search(request, env, url);
    else if (url.pathname === '/prices') res = json(await prices(env), 200, { 'Cache-Control': 'public, max-age=300' });
    else if (url.pathname === '/refresh' && env.DUFFEL_TOKEN && url.searchParams.get('key') && url.searchParams.get('key') === env.REFRESH_KEY) res = json({ done: await refresh(env) }, 200);
    else res = json({ ok: true, service: 'BCT Travel – çmimet e fluturimeve', endpoints: ['/search', '/prices'] }, 200);
    for (const [k, v] of Object.entries(c.headers)) res.headers.set(k, v);
    return res;
  },
  async scheduled(event, env, ctx) {
    if (!env.DUFFEL_TOKEN || !env.PRICES) return;
    ctx.waitUntil(refresh(env));
  }
};
