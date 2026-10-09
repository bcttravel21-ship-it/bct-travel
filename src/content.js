/* Ndryshimet nga paneli i administrimit (admin.html): lexohen nga shërbimi 24/7 para se të hapet faqja.
   Pa shërbim, ose nëse ai vonon më shumë se 2,5 sekonda, faqja hapet me të dhënat e veta. */
BCT.applyContent = function (c) {
  if (!c || typeof c !== 'object') return;
  var ov = c.offers || {}, ok = ['title', 'sub', 'tag', 'price', 'old', 'nights', 'dates', 'photo', 'photoPos', 'rank', 'stay', 'meal', 'highlights'];
  var pick = function (x) { var o = {}; ok.forEach(function (k) { if (x[k] !== undefined && x[k] !== null && x[k] !== '') o[k] = x[k]; }); if (x.old === 0 || x.old === null) o.old = undefined; return o; };
  var base = BCT.offers.slice();
  BCT.offers = base.filter(function (o) { return !(ov[o.id] && ov[o.id].hidden); })
    .map(function (o) { return ov[o.id] ? Object.assign({}, o, pick(ov[o.id])) : o; });
  (c.custom || []).forEach(function (x) {
    var b = base.find(function (o) { return o.id === x.base; });
    if (b && x.id && !x.hidden) BCT.offers.push(Object.assign({}, b, pick(x), { id: String(x.id), rank: x.rank || (b.rank + 0.5) }));
  });
};
(function () {
  var api = String((BCT.config && BCT.config.priceApi) || '').replace(/\/+$/, ''), done = false;
  var go = function () { if (done) return; done = true; BCT.startApp(); };
  if (!api || !window.fetch) return go();
  setTimeout(go, 2500);
  fetch(api + '/content', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (c) { if (!done) { try { BCT.applyContent(c); } catch (e) { console.warn(e); } } })
    .catch(function () {})
    .then(go);
})();
