/* © 2026 Nicoly Canteiro Araújo — universo desenhado por código (sem fotos externas) */
(function () {
  var c = document.getElementById('cosmos'); if (!c) return;
  var x = c.getContext('2d'), W, H, D, dpr = Math.min(2, window.devicePixelRatio || 1);
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), next = 1800, L = [], shots = [];

  /* ruído suave (value noise + fbm) */
  var P = new Uint8Array(512); (function () { var p = []; for (var i = 0; i < 256; i++) p[i] = i; for (i = 255; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), k = p[i]; p[i] = p[j]; p[j] = k } for (i = 0; i < 512; i++) P[i] = p[i & 255] })();
  function h2(i, j) { return P[(P[i & 255] + j) & 255] / 255 }
  function sm(t) { return t * t * (3 - 2 * t) }
  function n2(x, y) { var i = Math.floor(x), j = Math.floor(y), fx = sm(x - i), fy = sm(y - j); var a = h2(i, j), b = h2(i + 1, j), c2 = h2(i, j + 1), d = h2(i + 1, j + 1); return a + (b - a) * fx + (c2 - a) * fy + (a - b - c2 + d) * fx * fy }
  function fbm(x, y, o) { var s = 0, a = .5, f = 1; for (var i = 0; i < (o || 5); i++) { s += a * n2(x * f, y * f); f *= 2.03; a *= .5 } return s }
  function mk(w, h) { var k = document.createElement('canvas'); k.width = w; k.height = h; return k }

  /* nebulosa: nuvem colorida gerada por ruído */
  function nebula(w, h, cols, seed) {
    var k = mk(w, h), g = k.getContext('2d'), im = g.createImageData(w, h), d = im.data;
    for (var y = 0; y < h; y++) for (var xx = 0; xx < w; xx++) {
      var u = xx / w, v = y / h, dx = (u - .5) * 2, dy = (v - .5) * 2, fall = Math.max(0, 1 - Math.sqrt(dx * dx * .8 + dy * dy * 1.1));
      var q = fbm(u * 3 + seed, v * 3 - seed, 4), n = fbm(u * 4 + q * 2.2 + seed, v * 4 + q * 1.6, 6);
      var dust = fbm(u * 7 - seed, v * 7 + seed, 5);
      var a = Math.pow(Math.max(0, n - .32) * 1.9, 1.6) * fall * fall, m = Math.min(1, n * 1.3);
      var r = cols[0][0] * (1 - m) + cols[1][0] * m, gg = cols[0][1] * (1 - m) + cols[1][1] * m, b = cols[0][2] * (1 - m) + cols[1][2] * m;
      var core = Math.pow(Math.max(0, n - .55) * 2.4, 2) * fall;
      a *= 1 - Math.max(0, dust - .55) * 1.8;
      var i = (y * w + xx) * 4; d[i] = Math.min(255, r + core * 255); d[i + 1] = Math.min(255, gg + core * 220); d[i + 2] = Math.min(255, b + core * 200); d[i + 3] = Math.max(0, Math.min(255, a * 255));
    }
    g.putImageData(im, 0, 0);
    for (var s = 0; s < w * h / 90; s++) { var sx = Math.random() * w, sy = Math.random() * h, sr = Math.random() < .03 ? 1.4 : .5; g.fillStyle = 'rgba(255,' + (220 + Math.random() * 35 | 0) + ',' + (200 + Math.random() * 55 | 0) + ',' + (.4 + Math.random() * .6) + ')'; g.beginPath(); g.arc(sx, sy, sr, 0, 6.283); g.fill() }
    return k;
  }

  /* galáxia espiral: milhares de estrelas + braços + poeira */
  function galaxy(S, arms, tight, hue) {
    var k = mk(S, S), g = k.getContext('2d'), C = S / 2;
    g.globalCompositeOperation = 'lighter';
    var halo = g.createRadialGradient(C, C, 0, C, C, C); halo.addColorStop(0, 'rgba(255,236,205,.55)'); halo.addColorStop(.12, 'rgba(255,220,180,.22)'); halo.addColorStop(.5, 'rgba(' + hue + ',.07)'); halo.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = halo; g.fillRect(0, 0, S, S);
    for (var i = 0; i < 16000; i++) {
      var r = Math.pow(Math.random(), .75), arm = i % arms, th = arm * 6.283 / arms + Math.log(r * 30 + 1) * tight + (Math.random() - .5) * (.9 - r * .4);
      var sc = (Math.random() - .5) * .06 * C, px = C + Math.cos(th) * r * C * .92 + sc, py = C + Math.sin(th) * r * C * .92 + sc;
      var young = Math.random() < .5 * r; g.fillStyle = young ? 'rgba(' + hue + ',' + (.25 + Math.random() * .5) + ')' : 'rgba(255,232,200,' + (.15 + Math.random() * .4) + ')';
      g.fillRect(px, py, Math.random() < .02 ? 1.8 : 1, Math.random() < .02 ? 1.8 : 1);
      if (young && Math.random() < .015) { g.fillStyle = 'rgba(255,120,170,.35)'; g.beginPath(); g.arc(px, py, 2.2, 0, 6.283); g.fill() }
    }
    g.globalCompositeOperation = 'source-over';
    for (i = 0; i < 2500; i++) { var r2 = .12 + Math.random() * .7, a2 = (i % arms) * 6.283 / arms + Math.log(r2 * 30 + 1) * tight - .25; g.fillStyle = 'rgba(10,6,4,.10)'; g.beginPath(); g.arc(C + Math.cos(a2) * r2 * C * .92, C + Math.sin(a2) * r2 * C * .92, 3, 0, 6.283); g.fill() }
    g.globalCompositeOperation = 'lighter'; var core = g.createRadialGradient(C, C, 0, C, C, C * .14); core.addColorStop(0, 'rgba(255,250,235,.95)'); core.addColorStop(1, 'rgba(255,220,170,0)'); g.fillStyle = core; g.beginPath(); g.arc(C, C, C * .14, 0, 6.283); g.fill();
    return k;
  }

  /* planeta: textura por ruído, luz e atmosfera */
  function planet(S, kind) {
    var k = mk(S, S), g = k.getContext('2d'), im = g.createImageData(S, S), d = im.data, R = S / 2, sd = Math.random() * 50;
    for (var y = 0; y < S; y++) for (var xx = 0; xx < S; xx++) {
      var nx = (xx - R) / R, ny = (y - R) / R, rr = nx * nx + ny * ny; if (rr > 1) continue;
      var nz = Math.sqrt(1 - rr), lat = ny, lon = Math.atan2(nx, nz), col;
      if (kind === 'gas') { var b = Math.sin(lat * 15 + fbm(lon * 2 + sd, lat * 8, 4) * 3.2), t = fbm(lon * 3 + sd, lat * 12, 5); col = [205 + b * 30 + t * 30, 165 + b * 28 + t * 20, 120 + b * 18]; var sp = Math.hypot((lon - .4) * 2.2, (lat - .32) * 4.5); if (sp < .35) col = [col[0] * .8 + 60, col[1] * .55, col[2] * .45] }
      else if (kind === 'ice') { var b2 = Math.sin(lat * 9 + fbm(lon + sd, lat * 4, 3) * 2); col = [95 + b2 * 12, 145 + b2 * 14, 230 + b2 * 10] }
      else if (kind === 'rock') { var m = fbm(lon * 3 + sd, lat * 3, 6), cr = fbm(lon * 9, lat * 9 + sd, 3); col = [185 * m + 90 - cr * 40, 85 * m + 45 - cr * 25, 50 * m + 25]; if (Math.abs(lat) > .86) col = [235, 230, 225] }
      else { var e = fbm(lon * 2.4 + sd, lat * 2.4, 6), cl = fbm(lon * 4 - sd, lat * 5, 5); col = e > .52 ? [70 + e * 90, 110 + e * 60, 50] : [20, 55, 130 + e * 60]; if (cl > .55) { var w = Math.min(1, (cl - .55) * 4); col = [col[0] + (245 - col[0]) * w, col[1] + (248 - col[1]) * w, col[2] + (255 - col[2]) * w] } }
      var lx = -.55, ly = -.45, lz = .7, dif = Math.max(0, nx * lx + ny * ly + nz * lz) * 1.15 + .04, limb = .55 + .45 * nz;
      var i = (y * S + xx) * 4; d[i] = Math.min(255, col[0] * dif * limb); d[i + 1] = Math.min(255, col[1] * dif * limb); d[i + 2] = Math.min(255, col[2] * dif * limb); d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    var at = g.createRadialGradient(R * .7, R * .7, R * .2, R, R, R); at.addColorStop(.85, 'rgba(0,0,0,0)'); at.addColorStop(1, kind === 'earth' ? 'rgba(120,180,255,.45)' : kind === 'ice' ? 'rgba(150,200,255,.4)' : 'rgba(255,220,180,.18)'); g.fillStyle = at; g.beginPath(); g.arc(R, R, R, 0, 6.283); g.fill();
    return k;
  }

  var PL = [
    { f: .06, x: .87, r: 72, k: 'gas', ring: 1, t: 'Saturno', d: 'anéis de gelo e rocha', sp: .55 },
    { f: .22, x: .08, r: 46, k: 'rock', t: 'Marte', d: 'ferrugem deixa o solo vermelho', sp: .75 },
    { f: .40, x: .9, r: 96, k: 'gas', t: 'Júpiter', d: 'a Grande Mancha é uma tempestade', sp: .45 },
    { f: .58, x: .08, r: 56, k: 'earth', moon: 1, t: 'Terra', d: 'o único planeta com vida conhecida', sp: .8 },
    { f: .80, x: .9, r: 52, k: 'ice', t: 'Netuno', d: 'ventos de até 2.100 km/h', sp: .6 }
  ];
  var GX = [
    { f: .14, x: .3, r: 210, arms: 2, tight: .9, hue: '150,180,255', tilt: .42, a: .5, t: 'Galáxia espiral', d: 'centenas de bilhões de estrelas' },
    { f: .48, x: .7, r: 190, arms: 4, tight: .75, hue: '170,190,255', tilt: .7, a: -.4, t: 'Galáxia cata-vento', d: 'braços cheios de estrelas jovens' },
    { f: .86, x: .34, r: 200, arms: 2, tight: 1.1, hue: '190,170,255', tilt: .3, a: .2, t: 'Galáxia barrada', d: 'como a nossa Via Láctea' }
  ];
  var NB = [
    { f: 0, x: .5, w: 1.25, hh: .95, cols: [[60, 40, 140], [255, 120, 150]], sp: .25 },
    { f: .02, x: .35, w: .7, hh: .6, cols: [[30, 70, 160], [255, 170, 110]], sp: .32 },
    { f: .34, x: .75, w: .8, hh: .55, cols: [[90, 40, 150], [120, 190, 255]], sp: .3 },
    { f: .66, x: .2, w: .8, hh: .55, cols: [[120, 30, 90], [255, 150, 120]], sp: .3 },
    { f: .97, x: .6, w: .9, hh: .6, cols: [[40, 50, 150], [200, 140, 255]], sp: .3 }
  ];

  function lab(o, px, py, R) { x.globalCompositeOperation = 'source-over'; x.textAlign = 'center'; x.font = '600 12px system-ui,sans-serif'; x.fillStyle = 'rgba(255,255,255,.7)'; x.fillText(o.t, px, py + R + 22); x.font = '11px system-ui,sans-serif'; x.fillStyle = 'rgba(200,205,215,.5)'; x.fillText(o.d, px, py + R + 38) }

  var built = false;
  function build() {
    NB.forEach(function (n, i) { n.img = nebula(260, 170, n.cols, i * 7.3 + 1); n.img2 = nebula(220, 150, [n.cols[1], n.cols[0]], i * 3.1 + 9) });
    GX.forEach(function (g) { g.img = galaxy(420, g.arms, g.tight, g.hue) });
    PL.forEach(function (p) { p.img = planet(220, p.k) });
    built = true;
  }

  function rs() {
    W = innerWidth; H = innerHeight; D = Math.max(document.documentElement.scrollHeight, H);
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var s = Math.max(.55, Math.min(1, W / 1400)); PL.forEach(function (p) { p.R = p.r * s }); GX.forEach(function (g) { g.R = g.r * s });
    L = []; [[220, .08, .6], [120, .22, 1], [50, .45, 1.6]].forEach(function (k) { var a = []; for (var i = 0; i < k[0]; i++)a.push({ x: Math.random() * W, y: Math.random() * H * 3, r: Math.random() * k[2] + .3, p: Math.random() * 6.3, c: Math.random() < .7 ? '255,255,255' : (Math.random() < .5 ? '190,205,255' : '255,215,180') }); L.push({ a: a, sp: k[1] }) });
  }
  rs(); addEventListener('resize', rs); setTimeout(rs, 1500);
  function Y(f, sp) { return H * .5 + (f * (D - H) - scrollY) * sp }
  function Yn(f, sp) { return f === 0 ? H * .42 - scrollY * sp : Y(f, sp) }

  function frame(now) {
    var t = (now - t0) / 1000, sy = scrollY;
    x.globalCompositeOperation = 'source-over'; x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    if (built) {
      x.globalCompositeOperation = 'screen';
      NB.forEach(function (n, i) {
        var cy = Yn(n.f, n.sp), cx = n.x * W, w = W * n.w, hh = H * n.hh * 1.2; if (cy < -hh || cy > H + hh) return;
        x.save(); x.globalAlpha = .85; x.translate(cx + Math.sin(t * .05 + i) * 20, cy); x.rotate(Math.sin(t * .03 + i) * .05); x.scale(1 + Math.sin(t * .07 + i) * .03, 1); x.drawImage(n.img, -w / 2, -hh / 2, w, hh); x.restore();
        x.save(); x.globalAlpha = .55; x.translate(cx - Math.sin(t * .04 + i) * 26, cy + Math.cos(t * .05) * 10); x.rotate(-Math.sin(t * .025 + i) * .07); x.drawImage(n.img2, -w * .4, -hh * .4, w * .8, hh * .8); x.restore();
      });
      GX.forEach(function (g, i) {
        var gy = Y(g.f, .3), gx = g.x * W, R = g.R; if (gy < -R * 2 || gy > H + R * 2) return;
        x.save(); x.globalAlpha = .9; x.translate(gx, gy); x.rotate(g.a); x.scale(1, g.tilt); x.rotate(t * .015 * (i % 2 ? -1 : 1)); x.drawImage(g.img, -R, -R, R * 2, R * 2); x.restore();
        lab(g, gx, gy, R * g.tilt * .9); x.globalCompositeOperation = 'screen';
      });
    }
    x.globalCompositeOperation = 'lighter';
    L.forEach(function (l, k) { l.a.forEach(function (s) { var yy = ((s.y - sy * l.sp) % (H * 3) + H * 3) % (H * 3); if (yy > H) return; var al = .3 + .7 * Math.pow((Math.sin(s.p + t * (1.2 + k * .5)) + 1) / 2, 3); x.fillStyle = 'rgba(' + s.c + ',' + al.toFixed(2) + ')'; x.beginPath(); x.arc(s.x, yy, s.r, 0, 6.283); x.fill(); if (s.r > 1.4 && al > .85) { x.fillRect(s.x - s.r * 3, yy - .3, s.r * 6, .6); x.fillRect(s.x - .3, yy - s.r * 3, .6, s.r * 6) } }) });
    x.globalCompositeOperation = 'source-over';
    if (built) PL.forEach(function (p) {
      var py = Y(p.f, p.sp) + Math.sin(t * .3 + p.f * 9) * 4, px = p.x * W, R = p.R; if (py < -R * 3 || py > H + R * 3) return;
      var gl = x.createRadialGradient(px, py, R * .9, px, py, R * 1.7); gl.addColorStop(0, 'rgba(160,190,255,.12)'); gl.addColorStop(1, 'rgba(160,190,255,0)'); x.fillStyle = gl; x.beginPath(); x.arc(px, py, R * 1.7, 0, 6.283); x.fill();
      function ring(a0, a1) { for (var j = 0; j < 5; j++) { x.strokeStyle = 'rgba(' + (220 - j * 12) + ',' + (200 - j * 10) + ',' + (170 - j * 8) + ',' + (.5 - j * .07) + ')'; x.lineWidth = R * .07; x.beginPath(); x.ellipse(px, py, R * (1.45 + j * .12), R * (1.45 + j * .12) * .28, -.35, a0, a1); x.stroke() } }
      if (p.ring) ring(Math.PI, 2 * Math.PI);
      x.drawImage(p.img, px - R, py - R, R * 2, R * 2);
      if (p.ring) ring(0, Math.PI);
      if (p.moon) { var ma = t * .35, mx = px + Math.cos(ma) * R * 2.1, my = py + Math.sin(ma) * R * .7, mr = R * .22; var mg = x.createRadialGradient(mx - mr * .4, my - mr * .4, mr * .1, mx, my, mr); mg.addColorStop(0, '#e8e6e0'); mg.addColorStop(1, '#3a3a3e'); x.fillStyle = mg; x.beginPath(); x.arc(mx, my, mr, 0, 6.283); x.fill() }
      lab(p, px, py, p.ring ? R * .5 : R);
    });
    x.globalCompositeOperation = 'lighter';
    if (!still && now - t0 > next) { next = now - t0 + 1400 + Math.random() * 2800; shots.push({ x: Math.random() * W * .8 + W * .2, y: Math.random() * H * .5, vx: -(7 + Math.random() * 6), vy: 4 + Math.random() * 3, l: 1 }) }
    shots = shots.filter(function (s) { s.x += s.vx; s.y += s.vy; s.l -= .011; if (s.l <= 0) return false; var gr = x.createLinearGradient(s.x, s.y, s.x - s.vx * 16, s.y - s.vy * 16); gr.addColorStop(0, 'rgba(255,255,255,' + s.l + ')'); gr.addColorStop(.3, 'rgba(200,215,255,' + (s.l * .5) + ')'); gr.addColorStop(1, 'rgba(150,170,255,0)'); x.strokeStyle = gr; x.lineWidth = 1.6; x.beginPath(); x.moveTo(s.x, s.y); x.lineTo(s.x - s.vx * 16, s.y - s.vy * 16); x.stroke(); return true });
    x.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  setTimeout(build, 30);
})();
