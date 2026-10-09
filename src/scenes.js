/* Ilustrimet e destinacioneve (SVG, pa foto të jashtme). BCT.scene('maldives') kthen një <svg>. */
(function () {
  let uid = 0;
  const f1 = s => s.replace(/-?\d+\.\d{2,}/g, m => (Math.round(+m * 10) / 10).toString());
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  const stops = a => a.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
  const lg = (id, a, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops(a)}</linearGradient>`;
  const rg = (id, a) => `<radialGradient id="${id}">${stops(a)}</radialGradient>`;
  const wrap = (defs, body) => `<svg class="scene" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>${defs}</defs>${f1(body)}</svg>`;

  function palm(x, y, h, lean, col) {
    const cx = x + lean * h * 0.28, cy = y - h, w0 = h * 0.045, w1 = h * 0.022;
    let d = `M${x - w0} ${y} Q${x + lean * h * 0.06 - w0} ${y - h * 0.55} ${cx - w1} ${cy} L${cx + w1} ${cy} Q${x + lean * h * 0.14 + w0} ${y - h * 0.55} ${x + w0} ${y}Z`;
    [[-172, .62], [-145, .7], [-115, .52], [-68, .52], [-36, .7], [-8, .62], [158, .48], [24, .48]].forEach(([a, k]) => {
      const L = h * k, r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
      const tx = cx + c * L, ty = cy + s * L + L * 0.3;
      d += `M${cx} ${cy} Q${cx + c * L * .5} ${cy + s * L * .5 - L * .24} ${tx} ${ty} Q${cx + c * L * .55} ${cy + s * L * .5 - L * .02} ${cx} ${cy + h * .02}Z`;
    });
    return `<path d="${d}" fill="${col}"/>`;
  }
  const birds = (list, col) => `<path d="${list.map(([x, y, s]) => `M${x} ${y} q${3 * s} ${-3.4 * s} ${6 * s} 0 q${3 * s} ${-3.4 * s} ${6 * s} 0`).join('')}" stroke="${col}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  const shimmer = (d, op = .55) => `<path d="${d}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="${op}"/>`;
  function stars(rnd, n, ymax, op = 1) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${rnd() * 400}" cy="${rnd() * ymax}" r="${.5 + rnd() * 1.1}" fill="#fff" opacity="${(.35 + rnd() * .65) * op}"/>`;
    return s;
  }

  /* ---------- Maldive ---------- */
  function villa(x, y, s, dusk) {
    const w = 30 * s, h = 12 * s;
    return `<path d="M${x + 3 * s} ${y} v${16 * s} M${x + w - 3 * s} ${y} v${16 * s} M${x + w / 2} ${y} v${16 * s}" stroke="#6B4A32" stroke-width="${1.5 * s}"/>` +
      `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${dusk ? '#F2D6B2' : '#F8EDDC'}"/>` +
      `<rect x="${x + w * .4}" y="${y - h * .8}" width="${w * .22}" height="${h * .8}" fill="#5B3B27" opacity=".5"/>` +
      `<path d="M${x - 5 * s} ${y - h + 1} L${x + w / 2} ${y - h - 15 * s} L${x + w + 5 * s} ${y - h + 1}Z" fill="${dusk ? '#9A5B32' : '#B5733C'}"/>` +
      `<path d="M${x + w / 2} ${y - h - 15 * s} L${x + w + 5 * s} ${y - h + 1} L${x + w / 2 + 2 * s} ${y - h + 1}Z" fill="#000" opacity=".13"/>`;
  }
  function maldives(o = {}) {
    const id = 'sc' + (++uid), dusk = !!o.sunset;
    const defs = lg(id + 's', dusk ? [[0, '#EE8E5E'], [.55, '#F8C26E'], [1, '#FCE2BA']] : [[0, '#5DBBE4'], [.6, '#A8DEEF'], [1, '#F6E5C8']]) +
      lg(id + 'w', dusk ? [[0, '#1F7E9E'], [1, '#14557A']] : [[0, '#17A0BE'], [.5, '#2CC0C5'], [1, '#7DE0D2']]) +
      rg(id + 'g', [[0, '#FFF6DA', .9], [1, '#FFF6DA', 0]]);
    const sy = dusk ? 186 : 112, sr = dusk ? 30 : 24;
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/>`;
    b += `<circle cx="300" cy="${sy}" r="${sr * 2.7}" fill="url(#${id}g)"/><circle cx="300" cy="${sy}" r="${sr}" fill="${dusk ? '#FFE2A6' : '#FFF8E1'}"/>`;
    b += `<rect y="205" width="400" height="195" fill="url(#${id}w)"/>`;
    if (dusk) b += `<path d="M284 212h32M278 222h44M289 234h22M283 248h34" stroke="#FFD99A" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
    b += `<path d="M328 206 q24 -10 50 0Z" fill="${dusk ? '#2D5B57' : '#2E7C69'}"/>`;
    b += `<path d="M0 296 C80 280 170 288 240 304 C300 318 360 314 400 302 V400 H0Z" fill="${dusk ? '#1C6C8D' : '#90E7D9'}" opacity=".55"/>`;
    const vs = [[34, 256, 1.15], [90, 252, 1], [139, 249, .88], [182, 246, .77], [219, 244, .67], [250, 242, .58]];
    b += `<path d="M18 257 L${250 + 30 * .58} 243" stroke="#7A5134" stroke-width="2.4"/>`;
    vs.forEach(([x, y, s]) => { b += villa(x, y, s, dusk); });
    b += `<ellipse cx="346" cy="330" rx="82" ry="15" fill="${dusk ? '#E6C38C' : '#F4E3BC'}"/>`;
    b += palm(334, 332, 122, -.5, dusk ? '#24413C' : '#1C5D4D') + palm(366, 334, 92, .35, dusk ? '#2D4C45' : '#246B58');
    b += shimmer('M40 300h26M118 318h40M208 298h22M88 350h30M238 360h24');
    b += birds([[118, 112, 1], [140, 102, .8]], dusk ? '#5A3A3A' : '#24365C');
    return wrap(defs, b);
  }

  /* ---------- Zanzibar ---------- */
  function zanzibar() {
    const id = 'sc' + (++uid);
    const defs = lg(id + 's', [[0, '#79C8E7'], [.6, '#C9E9EF'], [1, '#FBE4C4']]) + lg(id + 'w', [[0, '#16779F'], [1, '#2AAFBE']]) +
      rg(id + 'g', [[0, '#FFF3D0', .9], [1, '#FFF3D0', 0]]);
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/>`;
    b += `<circle cx="88" cy="150" r="58" fill="url(#${id}g)"/><circle cx="88" cy="150" r="22" fill="#FFF6DD"/>`;
    b += `<rect y="214" width="400" height="186" fill="url(#${id}w)"/>`;
    b += `<path d="M0 262 C100 254 220 268 400 258 V300 H0Z" fill="#34C2C3"/>`;
    b += `<path d="M0 292 C120 284 260 300 400 290 V330 H0Z" fill="#97E6D8"/>`;
    b += `<path d="M0 322 C140 312 260 330 400 318 V400 H0Z" fill="#F5E6C8"/><path d="M0 322 C140 312 260 330 400 318" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`;
    b += `<path d="M175 262 Q232 276 296 262" stroke="#14688A" stroke-width="3" fill="none" opacity=".35"/>`;
    b += `<path d="M168 256 Q232 274 300 254 L306 246 L162 248Z" fill="#5A3824"/><path d="M166 249 L304 247" stroke="#C9A06A" stroke-width="2"/>`;
    b += `<path d="M236 248 L234 178" stroke="#3A2416" stroke-width="2.2"/>`;
    b += `<path d="M190 234 L302 134 Q282 196 244 246Z" fill="#F8F0E0"/><path d="M244 246 Q282 196 302 134 L297 150 Q274 200 251 244Z" fill="#E4D4B7"/>`;
    b += `<path d="M188 236 L304 132" stroke="#3A2416" stroke-width="2.4" stroke-linecap="round"/>`;
    b += palm(372, 352, 172, -1.05, '#17594B') + palm(400, 362, 128, -.55, '#1F6A57');
    b += shimmer('M30 240h30M90 276h24M320 272h30M60 306h20', .5);
    b += birds([[150, 120, 1], [172, 110, .8], [130, 108, .7]], '#2A3E5E');
    return wrap(defs, b);
  }

  /* ---------- Safari ---------- */
  function giraffe(x, y, s, flip, col) {
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" fill="${col}">` +
      `<path d="M0 -46 C6 -57 25 -61 37 -56 L43 -50 C43 -44 39 -40 35 -39 L6 -38 C0 -39 -3 -42 0 -46Z"/>` +
      `<path d="M31 -55 L49 -101 L56 -98 L41 -50Z"/><path d="M46 -103 C50 -108 59 -107 64 -101 C61 -97 55 -97 50 -98Z"/>` +
      `<path d="M50 -105 l-1.5 -6 M53.5 -106 l-.5 -6 M-1 -44 L-6 -27" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/>` +
      `<rect x="2" y="-41" width="3.2" height="41"/><rect x="9" y="-41" width="3" height="41"/><rect x="29" y="-42" width="3.2" height="42"/><rect x="36" y="-42" width="3" height="42"/></g>`;
  }
  function acacia(x, y, s, col) {
    return `<g fill="${col}"><path d="M${x - 3 * s} ${y} L${x - 2 * s} ${y - 40 * s} L${x - 24 * s} ${y - 64 * s} L${x - 20 * s} ${y - 66 * s} L${x} ${y - 46 * s} L${x + 21 * s} ${y - 68 * s} L${x + 25 * s} ${y - 65 * s} L${x + 3 * s} ${y - 40 * s} L${x + 4 * s} ${y}Z"/>` +
      `<ellipse cx="${x - 30 * s}" cy="${y - 71 * s}" rx="${36 * s}" ry="${8 * s}"/><ellipse cx="${x + 6 * s}" cy="${y - 77 * s}" rx="${48 * s}" ry="${10 * s}"/>` +
      `<ellipse cx="${x + 40 * s}" cy="${y - 70 * s}" rx="${32 * s}" ry="${7 * s}"/><ellipse cx="${x - 4 * s}" cy="${y - 67 * s}" rx="${54 * s}" ry="${6 * s}"/></g>`;
  }
  function safari() {
    const id = 'sc' + (++uid), rnd = rng(7);
    const defs = lg(id + 's', [[0, '#E8764E'], [.45, '#F39E59'], [1, '#FBD68F']]) + lg(id + 'gr', [[0, '#D88A3D'], [1, '#9B5122']]);
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/>`;
    b += `<circle cx="250" cy="206" r="56" fill="#FFE3A3" opacity=".95"/>`;
    b += `<path d="M30 238 L140 182 Q170 166 196 172 L222 176 L338 238Z" fill="#B4694F" opacity=".6"/>`;
    b += `<path d="M140 182 Q170 166 196 172 L222 176 L208 184 L196 179 L182 187 L168 181 L152 188Z" fill="#FDEBDD" opacity=".75"/>`;
    b += `<rect y="236" width="400" height="164" fill="url(#${id}gr)"/>`;
    b += `<path d="M0 250 C120 240 260 254 400 244 V400 H0Z" fill="#C7773A" opacity=".55"/>`;
    let g = '';
    for (let i = 0; i < 70; i++) { const x = rnd() * 400, y = 300 + rnd() * 100; g += `M${x} ${y} l${(rnd() - .5) * 4} ${-6 - rnd() * 9}`; }
    b += `<path d="${g}" stroke="#6E3716" stroke-width="1.2" opacity=".45" stroke-linecap="round"/>`;
    b += acacia(345, 268, .55, '#3B2418') + acacia(96, 302, 1.05, '#2B1911');
    b += giraffe(258, 304, 1.15, false, '#2B1911') + giraffe(330, 308, .9, true, '#2B1911');
    b += birds([[232, 128, 1], [252, 118, .8], [214, 120, .7]], '#5A2E1A');
    return wrap(defs, b);
  }

  /* ---------- Dubai ---------- */
  function firework(cx, cy, r, col) {
    let d = '', dots = '';
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      d += `M${cx + c * r * .3} ${cy + s * r * .3} L${cx + c * r} ${cy + s * r}`;
      dots += `<circle cx="${cx + c * r * 1.12}" cy="${cy + s * r * 1.12}" r="1.6" fill="${col}"/>`;
    }
    return `<path d="${d}" stroke="${col}" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>${dots}`;
  }
  function dubai(o = {}) {
    const id = 'sc' + (++uid), fw = !!o.fireworks, rnd = rng(fw ? 31 : 13);
    const defs = lg(id + 's', fw ? [[0, '#0F1B3D'], [.45, '#33306A'], [.8, '#B65C79'], [1, '#F1A25E']] : [[0, '#26336A'], [.4, '#7E5689'], [.75, '#EE8A5E'], [1, '#FBC771']]) +
      lg(id + 't', fw ? [[0, '#262D60'], [1, '#121735']] : [[0, '#2E3164'], [1, '#1A1C44']]);
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/>`;
    if (fw) b += stars(rnd, 45, 190, .8); else b += `<circle cx="96" cy="262" r="30" fill="#FFD08A"/>`;
    const T = [[18, 24, 236], [44, 18, 208], [64, 26, 248], [92, 14, 176, 1], [108, 20, 214], [132, 16, 192], [150, 24, 226], [174, 14, 204],
      [228, 16, 186], [246, 22, 224], [270, 14, 168, 1], [286, 24, 216], [312, 16, 240], [352, 26, 250], [380, 22, 230]];
    let tw = '', win = '';
    T.forEach(([x, w, t, p]) => {
      tw += p ? `<path d="M${x} 292 L${x} ${t + 12} L${x + w / 2} ${t} L${x + w} ${t + 12} L${x + w} 292Z"/>` : `<rect x="${x}" y="${t}" width="${w}" height="${292 - t}"/>`;
      for (let y = t + 10; y < 284; y += 8) for (let xx = x + 3; xx < x + w - 3; xx += 5) if (rnd() < .26) win += `M${xx} ${y}h2v3h-2z`;
    });
    b += `<g fill="url(#${id}t)">${tw}</g><path d="${win}" fill="#FFD58A" opacity="${fw ? .75 : .55}"/>`;
    const L = [[191, 292], [191, 246], [194, 246], [194, 208], [197, 208], [197, 172], [199.5, 172], [199.5, 140], [201.5, 140], [201.5, 113], [203.2, 113], [203.2, 94], [204.4, 94], [204.7, 70]];
    const pts = L.concat(L.slice().reverse().map(([x, y]) => [410 - x, y]));
    b += `<path d="M${pts.map(p => p.join(' ')).join(' L')}Z" fill="url(#${id}t)"/>`;
    b += `<path d="M205.3 70 L205.6 94 L206.8 94 L206.8 113 L208.5 113 L208.5 140 L210.5 140 L210.5 172 L213 172 L213 208 L216 208 L216 246 L219 246 L219 292 L212 292Z" fill="#fff" opacity=".07"/>`;
    b += `<path d="M334 300 L338 196 Q374 230 372 300Z" fill="${fw ? '#D9D3E6' : '#ECE6EE'}" opacity=".92"/><path d="M336 300 L338 184" stroke="#C9C1D6" stroke-width="2"/>`;
    b += `<rect y="290" width="400" height="44" fill="${fw ? '#141838' : '#1B1E45'}"/>`;
    b += `<path d="M0 340 Q100 310 205 332 T400 324 V400 H0Z" fill="#E39A5C"/><path d="M0 368 Q130 342 250 366 T400 358 V400 H0Z" fill="#CC7D44"/>`;
    b += `<path d="M0 340 Q100 310 205 332 T400 324" stroke="#F6C08A" stroke-width="2" fill="none" opacity=".7"/>`;
    if (fw) b += firework(150, 118, 28, '#FBC771') + firework(262, 104, 34, '#F79663') + firework(205, 90, 14, '#FFFFFF') + firework(322, 150, 20, '#FBC771');
    return wrap(defs, b);
  }

  /* ---------- Antalya ---------- */
  function umbrella(x, y, col) {
    let s = `<ellipse cx="${x + 4}" cy="${y + 18}" rx="14" ry="3" fill="#000" opacity=".1"/><path d="M${x} ${y - 6} L${x} ${y + 16}" stroke="#6B4A32" stroke-width="1.6"/>`;
    s += `<path d="M${x - 17} ${y} Q${x} ${y - 18} ${x + 17} ${y}Z" fill="${col}"/>`;
    if (col !== '#FFFFFF') s += `<path d="M${x - 6} ${y} Q${x} ${y - 17} ${x + 6} ${y}Z" fill="#fff" opacity=".9"/>`;
    return s;
  }
  function antalya() {
    const id = 'sc' + (++uid);
    const defs = lg(id + 's', [[0, '#5AB4EB'], [.6, '#BDE3F7'], [1, '#EEF7F6']]) + lg(id + 'w', [[0, '#1766A7'], [.55, '#2686C6'], [1, '#4BB0DD']]);
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/>`;
    b += `<path d="M0 196 L35 164 L60 176 L95 134 L125 158 L160 120 L190 142 L215 128 L250 152 L285 124 L320 150 L350 138 L400 162 V214 H0Z" fill="#8FA8C8"/>`;
    b += `<path d="M87 143 L95 134 L104 145 L99 142 L95 146 L91 141Z M152 130 L160 120 L169 132 L164 129 L160 133 L156 128Z M277 133 L285 124 L294 135 L289 132 L285 136 L281 131Z" fill="#fff" opacity=".9"/>`;
    b += `<path d="M0 212 L50 186 L90 200 L140 176 L180 196 L230 182 L270 200 L320 184 L360 198 L400 186 V218 H0Z" fill="#4D6E96"/>`;
    b += `<path d="M0 214 C100 207 220 216 400 210 V222 H0Z" fill="#5E8A64"/>`;
    b += `<rect y="218" width="400" height="182" fill="url(#${id}w)"/>`;
    b += `<path d="M0 232 L62 228 Q86 230 92 254 L98 300 L0 308Z" fill="#C98E57"/><path d="M0 232 L62 228 Q78 228 86 238 L0 242Z" fill="#4F7A52"/>`;
    b += `<path d="M4 254 L86 250 M2 272 L92 268 M2 290 L96 286" stroke="#A8703F" stroke-width="1.5" opacity=".6"/>`;
    b += `<path d="M236 248 L266 248 L260 254 L242 254Z" fill="#fff"/><path d="M250 247 L250 218 L266 246Z" fill="#fff"/><path d="M248 247 L248 224 L236 246Z" fill="#EEF3F8"/>`;
    b += shimmer('M140 236h30M300 244h26M180 262h40M320 270h22', .45);
    b += `<path d="M0 306 Q200 278 400 296 V400 H0Z" fill="#F3DDAE"/><path d="M0 306 Q200 278 400 296" stroke="#fff" stroke-width="3" fill="none" opacity=".85"/>`;
    b += umbrella(148, 304, '#EE2D2E') + umbrella(194, 302, '#FFFFFF') + umbrella(240, 301, '#FBC771') + umbrella(286, 302, '#EE2D2E') + umbrella(330, 304, '#FFFFFF');
    b += palm(372, 340, 165, -.62, '#1B5848') + palm(398, 350, 124, -.25, '#21634F');
    return wrap(defs, b);
  }

  /* ---------- Bodrum ---------- */
  function windmill(x, y) {
    let s = `<path d="M${x - 6} ${y} L${x - 4} ${y - 24} L${x + 4} ${y - 24} L${x + 6} ${y}Z" fill="#F6F1E8"/><path d="M${x - 5} ${y - 24} Q${x} ${y - 32} ${x + 5} ${y - 24}Z" fill="#8C6B4F"/>`;
    let d = '';
    [25, 115, 205, 295].forEach(a => { const r = a * Math.PI / 180; d += `M${x} ${y - 25} L${x + Math.cos(r) * 15} ${y - 25 + Math.sin(r) * 15}`; });
    return s + `<path d="${d}" stroke="#6E5743" stroke-width="1.4" stroke-linecap="round"/>`;
  }
  function bodrum(o = {}) {
    const id = 'sc' + (++uid);
    const defs = lg(id + 's', [[0, '#6CC2F0'], [.6, '#CBEAFA'], [1, '#F3FAFD']]) + lg(id + 'w', [[0, '#1B6EB3'], [1, '#3AA2D8']]);
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/><rect y="226" width="400" height="174" fill="url(#${id}w)"/>`;
    b += `<path d="M250 227 C290 213 340 211 400 219 V228 H250Z" fill="#8EA4B8" opacity=".7"/>`;
    b += `<path d="M0 196 C40 178 90 172 140 186 C178 198 205 222 222 252 L222 330 L0 330Z" fill="#CDB991"/>`;
    b += `<path d="M0 196 C40 178 90 172 140 186 C150 189 158 192 165 196 L0 206Z" fill="#B3A076" opacity=".6"/>`;
    b += windmill(48, 186) + windmill(88, 179) + windmill(128, 186);
    const H = [[18, 222, 24, 18], [46, 214, 20, 16], [70, 226, 26, 18], [100, 218, 22, 17], [128, 230, 24, 18], [156, 240, 22, 16], [30, 246, 26, 20], [60, 252, 22, 18],
      [88, 246, 26, 20], [118, 258, 24, 18], [150, 264, 26, 18], [180, 262, 20, 16], [10, 272, 28, 22], [44, 278, 24, 20], [74, 274, 28, 22], [106, 284, 24, 18], [138, 288, 26, 18], [168, 286, 24, 18], [196, 280, 20, 16]];
    let hs = '';
    H.forEach(([x, y, w, h], i) => {
      hs += `<rect x="${x - 1}" y="${y - 1.5}" width="${w + 2}" height="2" fill="#E9E1D3"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FBF8F2"/><rect x="${x + w * .68}" y="${y}" width="${w * .32}" height="${h}" fill="#E6DCCB"/>`;
      hs += i % 3 === 0 ? `<rect x="${x + w * .2}" y="${y + h * .45}" width="${w * .17}" height="${h * .55}" fill="#2B6CB0"/>` : `<rect x="${x + w * .24}" y="${y + h * .3}" width="${w * .18}" height="${h * .26}" fill="#5F6F82"/>`;
      if (i % 4 === 1) hs += `<circle cx="${x + w * .82}" cy="${y}" r="3.6" fill="#DB4C8A"/><circle cx="${x + w * .95}" cy="${y + 3}" r="3" fill="#E86FA2"/><circle cx="${x + w * .7}" cy="${y + 2.5}" r="2.4" fill="#C93E7B"/>`;
    });
    b += hs;
    b += `<path d="M250 304 L270 268 L318 258 L372 266 L400 292 V306Z" fill="#B39062"/>`;
    let cr = '';
    [[280, 222, 18], [312, 204, 16], [342, 226, 16], [276, 240, 96]].forEach(([x, y, w]) => { for (let xx = x; xx < x + w - 2; xx += 5) cr += `<rect x="${xx}" y="${y - 4}" width="3" height="4"/>`; });
    b += `<g fill="#D9BD8E"><rect x="276" y="240" width="96" height="28"/><rect x="280" y="222" width="18" height="46"/><rect x="342" y="226" width="16" height="42"/><rect x="312" y="204" width="16" height="64"/>${cr}</g>`;
    b += `<g fill="#C3A36F"><rect x="292" y="222" width="6" height="46"/><rect x="323" y="204" width="5" height="64"/><rect x="353" y="226" width="5" height="42"/></g>`;
    b += `<path d="M320 204 L320 188" stroke="#7A5C3B" stroke-width="1.4"/><path d="M320 188 L331 191 L320 195Z" fill="#EE2D2E"/>`;
    b += `<rect y="330" width="400" height="70" fill="#1E6FAE"/>`;
    if (o.gulet) {
      b += `<g transform="translate(144 81) scale(.62)"><path d="M120 352 Q230 372 330 348 L340 334 L114 338Z" fill="#7A4B2E"/><path d="M116 338 L338 334" stroke="#E8D7B8" stroke-width="3"/><rect x="190" y="324" width="60" height="12" fill="#EAD9BC"/>`;
      b += `<path d="M200 334 L200 236 M270 334 L270 254" stroke="#4A2F1E" stroke-width="3.4"/>`;
      b += `<path d="M201 240 L201 330 L246 330Z M271 258 L271 330 L308 330Z" fill="#FBF7EE"/><path d="M199 244 L132 336 L196 336Z" fill="#F1EADC"/>`;
      b += `<path d="M130 362 Q230 380 326 360" stroke="#155A8E" stroke-width="4" fill="none" opacity=".5"/></g>`;
    } else {
      b += `<path d="M196 254 L222 254 L217 259 L201 259Z M232 242 L252 242 L248 246 L236 246Z" fill="#fff"/><path d="M208 253 L208 228 L221 252Z M241 241 L241 222 L251 240Z" fill="#fff"/>`;
    }
    b += shimmer('M20 350h30M240 372h40M330 356h26M90 382h24', .5);
    return wrap(defs, b);
  }

  /* ---------- Laponi ---------- */
  function pine(x, y, h, col) {
    const w = h * .36;
    return `<path d="M${x} ${y - h} L${x - w * .45} ${y - h * .62} L${x - w * .25} ${y - h * .62} L${x - w * .7} ${y - h * .3} L${x - w * .42} ${y - h * .3} L${x - w} ${y} L${x + w} ${y} L${x + w * .42} ${y - h * .3} L${x + w * .7} ${y - h * .3} L${x + w * .25} ${y - h * .62} L${x + w * .45} ${y - h * .62}Z" fill="${col}"/>` +
      `<path d="M${x - w * .45} ${y - h * .62} L${x - w * .15} ${y - h * .64} M${x - w * .7} ${y - h * .3} L${x - w * .3} ${y - h * .33} M${x - w} ${y} L${x - w * .5} ${y - h * .04}" stroke="#E8F1FF" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`;
  }
  function igloo(cx, cy, s, id) {
    const r = 50 * s, h = 44 * s;
    return `<circle cx="${cx}" cy="${cy - 10 * s}" r="${24 * s}" fill="url(#${id}gl)"/>` +
      `<path d="M${cx - r} ${cy} A${r} ${h} 0 0 1 ${cx + r} ${cy}Z" fill="#CFE6FF" fill-opacity=".22" stroke="#E8F3FF" stroke-width="${1.4 * s}"/>` +
      `<path d="M${cx} ${cy - h} L${cx} ${cy} M${cx - r * .56} ${cy - h * .82} Q${cx - r * .28} ${cy - h * .4} ${cx - r * .36} ${cy} M${cx + r * .56} ${cy - h * .82} Q${cx + r * .28} ${cy - h * .4} ${cx + r * .36} ${cy} M${cx - r * .88} ${cy - h * .36} Q${cx} ${cy - h * .58} ${cx + r * .88} ${cy - h * .36}" stroke="#E8F3FF" stroke-width="${1 * s}" fill="none" opacity=".75"/>`;
  }
  function lapland() {
    const id = 'sc' + (++uid), rnd = rng(42);
    const defs = lg(id + 's', [[0, '#050A1E'], [.55, '#0D2146'], [1, '#20406A']]) +
      lg(id + 'a', [[0, '#3DFFB0', 0], [.25, '#3DFFB0', .85], [.55, '#45D9C9', .7], [.8, '#8E6BFF', .45], [1, '#8E6BFF', 0]], 1, 0) +
      rg(id + 'gl', [[0, '#FFD58A', .95], [1, '#FFD58A', 0]]) +
      `<filter id="${id}b" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>`;
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/>` + stars(rnd, 70, 240);
    b += `<g filter="url(#${id}b)"><path d="M-10 172 C60 112 130 192 200 142 S330 82 410 122 L410 152 C330 117 260 192 200 177 S60 152 -10 207Z" fill="url(#${id}a)"/>` +
      `<path d="M-10 118 C80 78 150 138 230 98 S350 58 410 88 L410 104 C340 83 250 148 230 122 S90 108 -10 138Z" fill="url(#${id}a)" opacity=".6"/></g>`;
    b += `<path d="M-10 172 C60 112 130 192 200 142 S330 82 410 122" stroke="#B8FFE4" stroke-width="1.5" fill="none" opacity=".35"/>`;
    b += `<path d="M0 266 Q100 244 200 260 T400 252 V400 H0Z" fill="#8EA7C7"/>`;
    for (let i = 0; i < 26; i++) { const x = (i / 26) * 410 + rnd() * 10 - 5, h = 24 + rnd() * 30; b += pine(x, 262 + Math.sin(x / 60) * 5, h, '#0B1830'); }
    b += `<path d="M0 304 Q120 282 240 302 T400 296 V400 H0Z" fill="#DCE8F6"/><path d="M0 330 Q160 314 400 330 V400 H0Z" fill="#C9D9EE" opacity=".6"/>`;
    b += igloo(250, 306, 1, id) + igloo(340, 298, .55, id);
    b += pine(34, 338, 74, '#0B1830') + pine(70, 344, 56, '#0E1E3A');
    return wrap(defs, b);
  }

  /* ---------- Jordani ---------- */
  function jordan() {
    const id = 'sc' + (++uid), rnd = rng(5);
    const defs = lg(id + 's', [[0, '#2A2352'], [.35, '#61406F'], [.7, '#D8735A'], [1, '#F5B56B']]) + lg(id + 'g', [[0, '#E68D50'], [1, '#BF5D2D']]) +
      `<radialGradient id="${id}d" cx=".35" cy=".3"><stop offset="0" stop-color="#FBF8F3"/><stop offset="1" stop-color="#C7BBAE"/></radialGradient>` +
      `<mask id="${id}m"><rect width="400" height="400" fill="#fff"/><circle cx="307" cy="81" r="13" fill="#000"/></mask>`;
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/>` + stars(rnd, 28, 140, .7);
    b += `<circle cx="300" cy="86" r="14" fill="#FCE9C8" mask="url(#${id}m)"/>`;
    b += `<path d="M0 248 L0 204 L26 200 L34 186 L86 182 L96 200 L124 206 L134 248Z M244 248 L256 172 L296 160 L342 166 L354 192 L400 196 V248Z" fill="#A54B3A" opacity=".8"/>`;
    b += `<rect y="246" width="400" height="154" fill="url(#${id}g)"/>`;
    b += `<path d="M104 266 L124 198 L148 186 L200 190 L214 214 L234 266Z" fill="#8A3324"/><path d="M134 200 L128 262 M160 190 L156 264 M186 192 L190 264 M206 210 L214 264" stroke="#6E2619" stroke-width="2" opacity=".7"/>`;
    b += `<path d="M0 272 C80 260 160 276 240 266 C300 258 360 264 400 260 V400 H0Z" fill="#E99A5E" opacity=".75"/><path d="M0 332 C110 314 220 338 400 322 V400 H0Z" fill="#D9783F"/>`;
    [[128, 318, 16], [168, 316, 19], [210, 315, 21], [252, 316, 19], [292, 318, 16]].forEach(([cx, cy, r]) => {
      b += `<ellipse cx="${cx + 4}" cy="${cy + 1}" rx="${r + 4}" ry="3" fill="#7A3418" opacity=".3"/><path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}Z" fill="url(#${id}d)"/><circle cx="${cx + r * .28}" cy="${cy - r * .36}" r="${r * .27}" fill="#FFD58A" opacity=".9"/>`;
    });
    return wrap(defs, b);
  }

  /* ---------- Seychelles ---------- */
  function seychelles() {
    const id = 'sc' + (++uid);
    const defs = lg(id + 's', [[0, '#58C0EA'], [.6, '#B7E6F5'], [1, '#ECF9FB']]) + lg(id + 'w', [[0, '#168DB4'], [1, '#2BC2C6']]) + lg(id + 'b', [[0, '#CFB0A6'], [1, '#8A6C66']]);
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/><rect y="214" width="400" height="186" fill="url(#${id}w)"/>`;
    b += `<path d="M114 222 L132 222 L128 226 L118 226Z" fill="#fff"/><path d="M123 221 L123 204 L132 220Z" fill="#fff"/>`;
    b += `<path d="M0 300 C120 290 260 306 400 296 V340 H0Z" fill="#8FE9DA"/>`;
    b += `<g fill="url(#${id}b)"><path d="M8 344 C-2 296 28 252 82 246 C138 240 172 276 170 314 C168 340 124 352 66 352Z"/><path d="M118 350 C112 312 146 282 188 290 C228 298 240 334 226 354Z"/><path d="M276 330 C280 280 326 256 368 266 C410 276 420 334 402 354 C366 366 290 362 276 330Z"/></g>`;
    b += `<path d="M40 262 C34 290 36 320 44 346 M70 252 C62 290 66 324 72 350 M110 250 C104 286 108 320 112 348 M160 296 C156 316 158 334 164 352 M318 268 C310 300 314 330 320 358 M356 266 C348 300 352 334 356 360" stroke="#6F5550" stroke-width="1.6" fill="none" opacity=".45"/>`;
    b += `<path d="M0 344 Q200 326 400 346 V400 H0Z" fill="#F7EBD3"/>`;
    b += palm(352, 272, 150, -.95, '#1C5B47');
    b += shimmer('M200 240h30M260 256h26M60 230h24', .5) + birds([[210, 130, 1], [232, 120, .8]], '#24405F');
    return wrap(defs, b);
  }

  /* ---------- Japoni ---------- */
  function japan() {
    const id = 'sc' + (++uid), rnd = rng(19);
    const defs = lg(id + 's', [[0, '#F4C6D3'], [.55, '#FBE2E7'], [1, '#FFF4EA']]) + lg(id + 'm', [[0, '#7487B6'], [1, '#4E5F92']]);
    let b = `<rect width="400" height="400" fill="url(#${id}s)"/><circle cx="318" cy="128" r="30" fill="#EE2D2E" opacity=".9"/>`;
    b += `<path d="M48 262 L162 154 Q200 130 238 154 L352 262Z" fill="url(#${id}m)"/>`;
    b += `<path d="M162 154 Q200 130 238 154 L252 168 L238 164 L226 176 L212 165 L198 178 L184 166 L170 174 L150 166Z" fill="#FDFDFF"/>`;
    b += `<rect y="260" width="400" height="50" fill="#CADBEB"/><path d="M80 262 L200 314 L320 262Z" fill="#8FA2C8" opacity=".25"/>`;
    b += `<path d="M0 308 C120 296 260 312 400 302 V400 H0Z" fill="#4C5D47"/><path d="M0 350 C140 338 260 356 400 344 V400 H0Z" fill="#3D4B3A"/>`;
    let pg = `<rect x="68" y="306" width="48" height="6" fill="#6B5A54"/>`;
    for (let i = 0; i < 5; i++) {
      const y = 306 - i * 25, bw = 30 - i * 3.6, rw = bw + 22;
      pg += `<rect x="${92 - bw / 2}" y="${y - 15}" width="${bw}" height="15" fill="#C8352F"/>`;
      pg += `<path d="M${92 - rw / 2} ${y - 13} Q${92 - bw / 2} ${y - 17} ${92 - bw / 2 + 2} ${y - 20} L${92 + bw / 2 - 2} ${y - 20} Q${92 + bw / 2} ${y - 17} ${92 + rw / 2} ${y - 13}Z" fill="#2F2626"/>`;
    }
    b += pg + `<path d="M92 186 L92 160 M88 176 h8 M88 170 h8" stroke="#2F2626" stroke-width="2"/>`;
    b += `<path d="M412 80 Q350 100 304 96 Q276 94 252 108 M342 98 Q330 122 312 134 M300 97 Q296 78 282 70 M-10 96 Q40 102 72 90" stroke="#4A2E2A" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const C = ['#F6A9BF', '#FBC6D4', '#F28FAE', '#FFDCE5'];
    [[300, 94, 8], [262, 106, 7], [316, 132, 7], [284, 72, 6], [350, 98, 7], [384, 86, 6], [60, 92, 7], [30, 100, 6]].forEach(([cx, cy, n]) => {
      for (let i = 0; i < n; i++) b += `<circle cx="${cx + (rnd() - .5) * 22}" cy="${cy + (rnd() - .5) * 16}" r="${3 + rnd() * 4}" fill="${C[(rnd() * 4) | 0]}" opacity=".92"/>`;
    });
    for (let i = 0; i < 14; i++) { const x = rnd() * 400, y = 170 + rnd() * 190; b += `<ellipse cx="${x}" cy="${y}" rx="3" ry="1.6" transform="rotate(${rnd() * 180} ${x} ${y})" fill="#F49BB5" opacity=".8"/>`; }
    return wrap(defs, b);
  }

  const S = { maldives, zanzibar, safari, dubai, antalya, bodrum, lapland, jordan, seychelles, japan };
  BCT.scene = (name, opts) => (S[name] || maldives)(opts || {});
})();
