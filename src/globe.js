/* Globi 3D me pika: rrugët e fluturimeve nga Prishtina, rrotullim me maus dhe kamera që ndjek scroll-in. */
(function () {
  const D2R = Math.PI / 180;
  const vec = (lat, lon) => { const a = lat * D2R, b = lon * D2R; return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)]; };
  function slerp(a, b, t) {
    const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), w = Math.acos(d);
    if (w < 1e-6) return a.slice();
    const s = Math.sin(w), k1 = Math.sin((1 - t) * w) / s, k2 = Math.sin(t * w) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }
  const toLL = v => [Math.asin(Math.max(-1, Math.min(1, v[2]))) / D2R, Math.atan2(v[1], v[0]) / D2R];
  const angDiff = (a, b) => { let d = (b - a) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  function Globe(canvas, labelsEl, opts) {
    const ctx = canvas.getContext('2d');
    const reduce = opts.reduceMotion;
    const pts = BCT.world.points(opts.points || 15000);
    const n = pts.length, P = new Float32Array(n * 3);
    pts.forEach(([la, lo], i) => { const v = vec(la, lo); P[i * 3] = v[0]; P[i * 3 + 1] = v[1]; P[i * 3 + 2] = v[2]; });
    const hub = Object.assign({ v: vec(opts.hub.lat, opts.hub.lon) }, opts.hub);
    const dests = opts.dests.map(d => {
      const v = vec(d.lat, d.lon), o = d.from ? vec(d.from.lat, d.from.lon) : hub.v;
      const w = Math.acos(Math.max(-1, Math.min(1, o[0] * v[0] + o[1] * v[1] + o[2] * v[2])));
      const h = (d.group ? .035 : .05) + 0.2 * (w / Math.PI), arc = [];
      for (let i = 0; i <= 72; i++) { const t = i / 72, p = slerp(o, v, t), r = 1 + h * Math.sin(Math.PI * t); arc.push([p[0], p[1], p[2], r]); }
      return Object.assign({ v, ov: o, arc, seed: Math.random(), dur: (d.group ? 4.4 : 5.6) + 6 * (w / Math.PI) }, d);
    });
    const byKey = Object.fromEntries(dests.map(d => [d.key, d]));
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 16;
    const sg = sprite.getContext('2d');
    sg.fillStyle = '#E8ECF4'; sg.beginPath(); sg.arc(8, 8, 7, 0, Math.PI * 2); sg.fill();
    // Avioni parë nga lart, me hundën djathtas (njësi ~24)
    const PLANE = typeof Path2D === 'function' ? new Path2D(
      'M12 0C12-.9 11-1.35 9.6-1.35L3.1-1.35 2-3.9 3.2-3.9 3.2-5.3 1.2-5.3-3.1-10.6-5.3-10.6-1.9-1.35-8.1-1.15-11-4.5-12.3-4.5-10.9-.8-12.5 0' +
      '-10.9.8-12.3 4.5-11 4.5-8.1 1.15-1.9 1.35-5.3 10.6-3.1 10.6 1.2 5.3 3.2 5.3 3.2 3.9 2 3.9 3.1 1.35 9.6 1.35C11 1.35 12 .9 12 0Z') : null;
    const stars = Array.from({ length: opts.stars === false ? 0 : 130 }, () => ({
      x: Math.random(), y: Math.random(), s: Math.random() < .12 ? 1.4 : .7 + Math.random() * .45,
      a: .1 + Math.random() * .32, ph: Math.random() * 6.3, sp: .35 + Math.random() * 1.1
    }));

    const view = { lat: 18, lon: 38, cx: 0, cy: 0, R: 300 };
    const target = { lat: 18, lon: 38, cx: 0, cy: 0, R: 300 };
    let W = 0, H = 0, w = 0, h = 0, dpr = 1, running = false, raf = 0, last = 0, t0 = performance.now();
    let mode = 'hero', active = null, showRare = false, drag = null, userUntil = 0;
    let showGroup = null, groupSince = 0, dense = null, showAll = false;
    const cluster = opts.cluster ? Object.assign({ v: vec(opts.cluster.lat, opts.cluster.lon) }, opts.cluster) : null;
    function makeDense() {
      const pts = BCT.world.pointsIn(140000, -25, 60, 25, 75), D = new Float32Array(pts.length * 3);
      pts.forEach(([la, lo], i) => { const v = vec(la, lo); D[i * 3] = v[0]; D[i * 3 + 1] = v[1]; D[i * 3 + 2] = v[2]; });
      return { n: pts.length, P: D };
    }

    /* labels */
    const labels = {};
    function makeLabel(key, html, cls) { const el = document.createElement('div'); el.className = 'glabel ' + cls; el.dataset.key = key; el.innerHTML = html; labelsEl.appendChild(el); labels[key] = el; }
    makeLabel('hub', `<b>${hub.label}</b>`, 'glabel--hub');
    dests.forEach(d => makeLabel(d.key, d.group ? `<b>${d.label}</b>` : `<b>${d.label}</b><span>${d.sub || ''}</span>`, (d.rare ? 'glabel--rare' : '') + (d.group ? ' glabel--fl' : '') + (d.anchor === 'left' ? ' glabel--left' : '')));
    if (dests.some(d => d.from)) makeLabel('origin', `<b>${opts.originLabel || ''}</b>`, 'glabel--hub glabel--left');
    if (cluster) makeLabel('cluster', `<b>${cluster.label}</b><span>${cluster.sub || ''}</span>`, 'glabel--cluster glabel--left');

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      W = Math.round(w * dpr); H = Math.round(h * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    }
    let sLat = 0, cLat = 1, sLon = 0, cLon = 1;
    function setRot() { sLat = Math.sin(view.lat * D2R); cLat = Math.cos(view.lat * D2R); sLon = Math.sin(view.lon * D2R); cLon = Math.cos(view.lon * D2R); }
    function proj(x0, y0, z0, r, out) {
      const x = -x0 * sLon + y0 * cLon, q = x0 * cLon + y0 * sLon, y = z0 * cLat - q * sLat, z = z0 * sLat + q * cLat;
      out[0] = view.cx + x * r * view.R; out[1] = view.cy - y * r * view.R; out[2] = z; out[3] = x * r; out[4] = y * r;
      return out;
    }
    const tmp = [0, 0, 0, 0, 0], tmp2 = [0, 0, 0, 0, 0];
    const hidden = o => o[2] < 0 && (o[3] * o[3] + o[4] * o[4]) < 1;

    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      setRot();
      const R = view.R, cx = view.cx, cy = view.cy;
      // stars, with a little parallax when the globe turns
      if (stars.length) {
        const st = (t - t0) / 1000, par = view.lon * 1.1;
        ctx.fillStyle = '#FFFFFF';
        for (const s of stars) {
          let x = (s.x * w + par) % w; if (x < 0) x += w;
          ctx.globalAlpha = s.a * (reduce ? 1 : .62 + .38 * Math.sin(st * s.sp + s.ph));
          ctx.fillRect(x, s.y * h, s.s, s.s);
        }
        ctx.globalAlpha = 1;
      }
      // atmosphere
      let g = ctx.createRadialGradient(cx, cy, R * .96, cx, cy, R * 1.28);
      g.addColorStop(0, 'rgba(247,150,99,.26)'); g.addColorStop(.35, 'rgba(238,45,46,.08)'); g.addColorStop(1, 'rgba(238,45,46,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, Math.PI * 2); ctx.fill();
      // body
      g = ctx.createRadialGradient(cx - R * .38, cy - R * .42, R * .05, cx, cy, R * 1.02);
      g.addColorStop(0, '#1C2233'); g.addColorStop(.6, '#0A0D16'); g.addColorStop(1, '#020306');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,214,170,.14)'; ctx.lineWidth = 1; ctx.stroke();
      // dots
      const base = Math.max(1.3, Math.min(3.2, R * .0072));
      const buckets = [[], [], [], [], []];
      for (let i = 0; i < n; i++) {
        const x0 = P[i * 3], y0 = P[i * 3 + 1], z0 = P[i * 3 + 2];
        const q = x0 * cLon + y0 * sLon, z = z0 * sLat + q * cLat;
        if (z <= 0.02) continue;
        const x = -x0 * sLon + y0 * cLon, y = z0 * cLat - q * sLat;
        buckets[Math.min(4, (z * 5) | 0)].push(cx + x * R, cy - y * R);
      }
      if (showGroup && dense) {
        const D = dense.P;
        for (let i = 0; i < dense.n; i++) {
          const x0 = D[i * 3], y0 = D[i * 3 + 1], z0 = D[i * 3 + 2];
          const q = x0 * cLon + y0 * sLon, z = z0 * sLat + q * cLat;
          if (z <= 0.02) continue;
          const x = -x0 * sLon + y0 * cLon, y = z0 * cLat - q * sLat, sx = cx + x * R, sy = cy - y * R;
          if (sx < -10 || sy < -10 || sx > w + 10 || sy > h + 10) continue;
          buckets[Math.min(4, (z * 5) | 0)].push(sx, sy);
        }
      }
      const alphas = [.22, .38, .56, .74, .92];
      for (let b = 0; b < 5; b++) {
        const arr = buckets[b], s = base * (.72 + b * .08);
        ctx.globalAlpha = alphas[b];
        for (let k = 0; k < arr.length; k += 2) ctx.drawImage(sprite, arr[k] - s / 2, arr[k + 1] - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      // arcs
      const sec = (t - t0) / 1000;
      dests.forEach((d, di) => {
        const isAct = active === d.key;
        const vis = d.group ? (showGroup === d.group || (showAll && !showGroup && !active)) : (showGroup ? false : (d.rare ? showRare || isAct : true));
        if (!vis) return;
        const grow = reduce ? 1 : d.group ? clamp(((t - groupSince) / 1000 - d.gi * .035) / 1.1, 0, 1) : clamp((sec - .3 - di * .12) / 1.4, 0, 1);
        const m = Math.max(1, Math.round(72 * grow));
        const net = d.group && !showGroup;
        ctx.lineWidth = isAct ? 2.4 : d.group ? (net ? .9 : 1.1) : 1.3;
        ctx.strokeStyle = isAct ? '#FBC771' : d.group ? (net ? 'rgba(251,199,113,.42)' : 'rgba(251,199,113,.62)') : (active ? 'rgba(251,199,113,.22)' : 'rgba(251,199,113,.5)');
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= m; i++) {
          const a = d.arc[i]; proj(a[0], a[1], a[2], a[3], tmp);
          if (hidden(tmp)) { pen = false; continue; }
          if (!pen) { ctx.moveTo(tmp[0], tmp[1]); pen = true; } else ctx.lineTo(tmp[0], tmp[1]);
        }
        ctx.stroke();
        if (grow < 1 || !PLANE || (d.group && d.gi % (net ? 3 : 2) !== 0)) return;   // jo çdo linjë: më elegant
        // Avioni: vajtje dhe kthim, me pushim në çdo aeroport
        const dur = d.dur, period = dur * 1.5;
        const clock = sec + d.seed * period * 2;
        const k = Math.floor(clock / period), u = reduce ? .55 : (clock - k * period) / dur;
        const back = !reduce && k % 2 === 1;
        if (u > 1) {                                                   // sapo u ul: valë e lehtë
          const lt = (u - 1) * dur;
          if (lt < 1.2 && !net) {
            const e = back ? d.ov : d.v; proj(e[0], e[1], e[2], 1, tmp);
            if (tmp[2] > 0) { const q = lt / 1.2; ctx.strokeStyle = `rgba(251,199,113,${.6 * (1 - q)})`; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 4 + q * 18, 0, Math.PI * 2); ctx.stroke(); }
          }
          return;
        }
        const at = (s, out) => {                                       // pika në hark për progresin s (0..1), në drejtimin e fluturimit
          const f = (back ? 1 - s : s) * 72, i = Math.min(71, Math.floor(f)), fr = f - i, a = d.arc[i], b = d.arc[i + 1];
          return proj(a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr, a[2] + (b[2] - a[2]) * fr, a[3] + (b[3] - a[3]) * fr, out);
        };
        const s = reduce ? .55 : .5 - .5 * Math.cos(Math.PI * u);    // ngrihet ngadalë, ulet butë
        // gjurma e avionit
        const s0 = Math.max(0, s - (net ? .14 : .22)), N = 14;
        let px = 0, py = 0, has = false;
        for (let j = 0; j <= N; j++) {
          at(s0 + (s - s0) * j / N, tmp2);
          const ok = !hidden(tmp2);
          if (ok && has) {
            const q = j / N;
            ctx.strokeStyle = `rgba(255,${228 + 27 * q | 0},${196 + 59 * q | 0},${(net ? .45 : .8) * q * q})`;
            ctx.lineWidth = (net ? .7 : 1) + q * (net ? .7 : 1.3);
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tmp2[0], tmp2[1]); ctx.stroke();
          }
          px = tmp2[0]; py = tmp2[1]; has = ok;
        }
        // avioni
        at(s, tmp); if (hidden(tmp)) return;
        const ahead = s < .985;
        at(ahead ? s + .012 : s - .012, tmp2);
        const ang = ahead ? Math.atan2(tmp2[1] - tmp[1], tmp2[0] - tmp[0]) : Math.atan2(tmp[1] - tmp2[1], tmp[0] - tmp2[0]);
        const size = clamp(R * .05, 11, 21) * (net ? .7 : isAct ? 1.2 : 1) * (.8 + .32 * Math.sin(Math.PI * s));
        ctx.save();
        ctx.translate(tmp[0], tmp[1]); ctx.rotate(ang); ctx.scale(size / 24, size / 24);
        ctx.globalAlpha = (active && !isAct ? .45 : 1) * (.35 + .65 * clamp(tmp[2] * 3 + .25, 0, 1));
        ctx.shadowColor = isAct ? 'rgba(251,199,113,.95)' : 'rgba(251,199,113,.75)'; ctx.shadowBlur = isAct ? 12 : 8;
        ctx.fillStyle = isAct ? '#FFF4E0' : '#FFFFFF';
        ctx.fill(PLANE);
        ctx.restore();
      });
      // markers
      dests.forEach(d => {
        if (d.group ? !(showGroup === d.group || (showAll && !showGroup && !active)) : (showGroup || (d.rare && !showRare && active !== d.key))) return;
        proj(d.v[0], d.v[1], d.v[2], 1, tmp);
        if (tmp[2] <= 0) return;
        const isAct = active === d.key;
        ctx.fillStyle = isAct ? '#FFFFFF' : '#F79663';
        ctx.beginPath(); ctx.arc(tmp[0], tmp[1], isAct ? 4.5 : d.group ? 2.6 : 3, 0, Math.PI * 2); ctx.fill();
        if (isAct) { ctx.strokeStyle = 'rgba(247,150,99,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 10, 0, Math.PI * 2); ctx.stroke(); }
      });
      const ad = active && byKey[active];
      if (ad && ad.from) {
        proj(ad.ov[0], ad.ov[1], ad.ov[2], 1, tmp);
        if (tmp[2] > 0) {
          ctx.fillStyle = '#FBC771'; ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 3.6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(251,199,113,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 8, 0, Math.PI * 2); ctx.stroke();
        }
      }
      proj(hub.v[0], hub.v[1], hub.v[2], 1, tmp);
      if (tmp[2] > 0) {
        const ph = reduce ? .4 : (sec % 2.2) / 2.2;
        ctx.strokeStyle = `rgba(251,199,113,${.8 * (1 - ph)})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 5 + ph * 20, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#FBC771'; ctx.beginPath(); ctx.arc(tmp[0], tmp[1], 4.5, 0, Math.PI * 2); ctx.fill();
      }
      placeLabels();
    }
    function placeLabels() {
      const show = k => {
        if (k === 'hub') return true;
        if (k === 'origin') { const a = active && byKey[active]; return !!(a && a.from); }
        if (k === 'cluster') return showAll && !showGroup && !active;
        const d = byKey[k];
        if (d.group) return showGroup === d.group && !!d.major;
        if (showGroup) return false;
        if (active) return k === active;
        if (d.rare) return showRare;
        return mode === 'hero';
      };
      Object.entries(labels).forEach(([k, el]) => {
        const v = k === 'hub' ? hub.v : k === 'cluster' ? cluster.v : k === 'origin' ? ((active && byKey[active]) ? byKey[active].ov : hub.v) : byKey[k].v;
        proj(v[0], v[1], v[2], 1, tmp);
        const on = show(k) && tmp[2] > .12 && tmp[1] > 40 && tmp[1] < h - 10;
        el.classList.toggle('is-on', on);
        el.classList.toggle('is-active', k === active);
        if (on) el.style.transform = `translate3d(${tmp[0].toFixed(1)}px, ${tmp[1].toFixed(1)}px, 0)`;
      });
    }
    function step(t) {
      const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
      if (!drag && t > userUntil) {
        const wob = mode === 'hero' && !reduce ? 24 * Math.sin((t - t0) / 1000 * .16) : 0;
        const k = reduce ? 1 : 1 - Math.exp(-dt * 2.6);
        view.lat += (target.lat - view.lat) * k;
        view.lon += angDiff(view.lon, target.lon + wob) * k;
      }
      const k2 = reduce ? 1 : 1 - Math.exp(-dt * 3.4);
      view.cx += (target.cx - view.cx) * k2; view.cy += (target.cy - view.cy) * k2; view.R += (target.R - view.R) * k2;
      draw(t);
      if (running) raf = requestAnimationFrame(step);
    }
    function start() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(step); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    canvas.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch') return;
      drag = { x: e.clientX, y: e.clientY, lat: view.lat, lon: view.lon };
      canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-drag');
    });
    canvas.addEventListener('pointermove', e => {
      if (!drag) return;
      const s = 90 / Math.max(120, view.R);
      view.lon = drag.lon - (e.clientX - drag.x) * s;
      view.lat = clamp(drag.lat + (e.clientY - drag.y) * s, -55, 75);
    });
    const end = () => { if (!drag) return; drag = null; userUntil = performance.now() + 2600; canvas.classList.remove('is-drag'); };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

    function focus(spec) {
      mode = spec.mode; active = spec.active || null; showRare = !!spec.rare;
      const grp = spec.group || null;
      if (grp && !dense) dense = makeDense();
      const all = !!spec.all;
      if (grp !== showGroup || (all && !showAll)) groupSince = performance.now();
      showGroup = grp; showAll = all;
      if (spec.lat != null) { target.lat = spec.lat; target.lon = spec.lon; }
      target.cx = spec.cx; target.cy = spec.cy; target.R = spec.R;
    }
    function snap() { Object.assign(view, target); }
    function midpoint(key, t) { const d = byKey[key]; const [la, lo] = toLL(slerp(d.ov, d.v, t)); return { lat: la, lon: lo }; }
    resize();
    (window.requestIdleCallback || (f => setTimeout(f, 1500)))(() => { if (!dense) dense = makeDense(); });
    return { start, stop, resize, focus, snap, midpoint, get size() { return { w, h }; } };
  }

  BCT.Globe = Globe;
  BCT.smooth = smooth;
})();
