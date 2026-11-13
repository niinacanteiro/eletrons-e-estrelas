/* Fundo cósmico do Elétrons e Estrelas
   © Nicoly Canteiro Araújo
   - Dois céus: "Galáxia" (tema escuro) e "Nebulosa" (tema claro), com transição suave ao trocar o tema.
   - Planetas com textura real, rotação, sombra de terminador, atmosfera e anéis.
   - Galáxias e nebulosas pré-renderizadas em sprites: leve até em notebook. */
(function () {
  'use strict';
  var cv = document.getElementById('cosmos');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var root = document.documentElement;
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var W = 0, H = 0, D = 0, t0 = performance.now();
  var TAU = Math.PI * 2;

  /* ---------- Paletas dos dois céus ---------- */
  var SKY = {
    galaxia:  { top: [0, 0, 0],     bot: [4, 5, 10],    star: ['255,255,255', '200,214,255', '255,244,230'], arm: [222, 230, 250], core: [255, 255, 255], halo: [190, 205, 240] },
    nebulosa: { top: [6, 8, 26],    bot: [20, 8, 34],   star: ['255,236,214', '255,200,236', '206,226,255'], arm: [255, 206, 170], core: [255, 240, 214], halo: [255, 150, 200] }
  };
  function themeMix() { return root.getAttribute('data-theme') === 'light' ? 1 : 0; }
  var mix = themeMix(), mixTarget = mix;
  new MutationObserver(function () { mixTarget = themeMix(); if (still) frame(performance.now()); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  function lerp(a, b, k) { return a + (b - a) * k; }
  function lerpRGB(a, b, k) { return 'rgb(' + Math.round(lerp(a[0], b[0], k)) + ',' + Math.round(lerp(a[1], b[1], k)) + ',' + Math.round(lerp(a[2], b[2], k)) + ')'; }

  /* ---------- Utilidades ---------- */
  function offscreen(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function parallaxY(f, sp) { return H * 0.5 + (f * (D - H) - scrollY) * sp; }

  /* ---------- Estrelas (3 camadas de paralaxe) ---------- */
  var layers = [];
  function buildStars() {
    var r = rnd(7), area = W * H / (1366 * 768);
    layers = [[260, 0.08, 0.7], [140, 0.22, 1.05], [55, 0.45, 1.6]].map(function (k) {
      var a = [];
      for (var i = 0, n = Math.round(k[0] * Math.max(0.6, area)); i < n; i++)
        a.push({ x: r() * W, y: r() * H * 3, r: r() * k[2] + 0.3, p: r() * TAU, c: r() < 0.7 ? 0 : (r() < 0.5 ? 1 : 2) });
      return { a: a, sp: k[1] };
    });
  }

  /* ---------- Galáxias espirais (sprites por paleta) ---------- */
  var GAL = [{ f: 0.15, x: 0.28, r: 170, a: 0.5, s: 11 }, { f: 0.5, x: 0.66, r: 230, a: -0.6, s: 23 }, { f: 0.85, x: 0.38, r: 190, a: 0.3, s: 37 }];
  function galaxySprite(R, pal, seed) {
    var size = R * 2.6, c = offscreen(size, size), g = c.getContext('2d'), m = size / 2, r = rnd(seed);
    g.globalCompositeOperation = 'lighter';
    var halo = g.createRadialGradient(m, m, 0, m, m, R * 1.25);
    halo.addColorStop(0, 'rgba(' + pal.halo + ',.16)'); halo.addColorStop(0.5, 'rgba(' + pal.halo + ',.05)'); halo.addColorStop(1, 'rgba(' + pal.halo + ',0)');
    g.fillStyle = halo; g.fillRect(0, 0, size, size);
    for (var i = 0; i < 2600; i++) {
      var arm = i % 2, t = r(), rr = Math.pow(t, 0.62) * R, ang = arm * Math.PI + (rr / R) * 5.2 + (r() - 0.5) * (0.35 + 0.5 * (1 - rr / R));
      var px = m + Math.cos(ang) * rr, py = m + Math.sin(ang) * rr, al = (1 - rr / R) * 0.55 + 0.06, s = r() < 0.06 ? 1.6 : 1;
      g.fillStyle = 'rgba(' + pal.arm + ',' + al.toFixed(2) + ')'; g.fillRect(px, py, s, s);
    }
    for (var j = 0; j < 40; j++) { /* aglomerados rosados de formação estelar */
      var aa = r() * TAU, d = (0.3 + r() * 0.6) * R, hx = m + Math.cos(aa) * d, hy = m + Math.sin(aa) * d, hr = 3 + r() * 6;
      var hg = g.createRadialGradient(hx, hy, 0, hx, hy, hr); hg.addColorStop(0, 'rgba(255,150,190,.22)'); hg.addColorStop(1, 'rgba(255,150,190,0)');
      g.fillStyle = hg; g.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);
    }
    var core = g.createRadialGradient(m, m, 0, m, m, R * 0.28);
    core.addColorStop(0, 'rgba(' + pal.core + ',.95)'); core.addColorStop(0.35, 'rgba(' + pal.core + ',.35)'); core.addColorStop(1, 'rgba(' + pal.core + ',0)');
    g.fillStyle = core; g.fillRect(0, 0, size, size);
    return c;
  }
  var galSprites = { galaxia: [], nebulosa: [] };
  GAL.forEach(function (gx) {
    galSprites.galaxia.push(galaxySprite(gx.r, SKY.galaxia, gx.s));
    galSprites.nebulosa.push(galaxySprite(gx.r, SKY.nebulosa, gx.s + 100));
  });

  /* ---------- Nuvens de nebulosa (só no céu "Nebulosa") ---------- */
  var nebula = null;
  function buildNebula() {
    nebula = offscreen(W, H * 2); var g = nebula.getContext('2d'), r = rnd(91);
    var cols = ['255,90,170', '120,90,255', '60,190,230', '255,150,90'];
    g.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 26; i++) {
      var x = r() * W, y = r() * H * 2, rad = (0.18 + r() * 0.35) * Math.max(W, H), c = cols[i % cols.length];
      var gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(' + c + ',.10)'); gr.addColorStop(0.5, 'rgba(' + c + ',.035)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
  }

  /* ---------- Planetas com textura ---------- */
  var PLANETS = [
    { tex: 'saturn',       f: 0.08, x: 0.86, r: 62,  sp: 0.55, spin: 0.020, tilt: -0.32, ring: true },
    { tex: 'mars',         f: 0.27, x: 0.08, r: 40,  sp: 0.75, spin: 0.030, atm: '255,170,130' },
    { tex: 'jupiter',      f: 0.45, x: 0.91, r: 104, sp: 0.45, spin: 0.045 },
    { tex: 'earth_daymap', f: 0.63, x: 0.07, r: 44,  sp: 0.80, spin: 0.025, atm: '120,175,255', moon: true },
    { tex: 'neptune',      f: 0.81, x: 0.89, r: 56,  sp: 0.60, spin: 0.030, atm: '110,190,255' }
  ];
  PLANETS.forEach(function (p) {
    p.img = new Image(); p.img.decoding = 'async'; p.img.src = 'tex-' + p.tex + '.jpg';
    p.img.onload = function () { p.ready = true; if (still) frame(performance.now()); };
    var pad = p.ring ? p.r * 1.3 : p.r * 0.35;
    p.buf = offscreen((p.r + pad) * 2 * DPR, (p.r + pad) * 2 * DPR); p.pad = pad;
  });

  /* Esfera: a textura é projetada em colunas com longitude = asin(x), dando curvatura real. */
  function drawSphere(g, img, cx, cy, R, rot) {
    var tw = img.naturalWidth, th = img.naturalHeight, N = Math.max(24, Math.round(R * 0.9)), colW = (2 * R) / N;
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
    for (var k = 0; k < N; k++) {
      var x0 = -1 + (k * 2) / N, x1 = -1 + ((k + 1) * 2) / N;
      var u0 = Math.asin(x0) / TAU + rot, u1 = Math.asin(x1) / TAU + rot;
      u0 -= Math.floor(u0); var du = u1 - Math.floor(u1) - u0; if (du < 0) du += 1;
      var sx = u0 * tw, sw = Math.max(0.5, du * tw);
      if (sx + sw > tw) sw = tw - sx;
      g.drawImage(img, sx, 0, sw, th, cx - R + k * colW, cy - R, colW + 0.6, 2 * R);
    }
    /* volume: limbo escurecido + lado noturno */
    var lx = cx - R * 0.45, ly = cy - R * 0.35;
    var shade = g.createRadialGradient(lx, ly, R * 0.05, cx, cy, R * 1.08);
    shade.addColorStop(0, 'rgba(255,255,255,.10)'); shade.addColorStop(0.45, 'rgba(0,0,0,0)');
    shade.addColorStop(0.8, 'rgba(0,0,0,.55)'); shade.addColorStop(1, 'rgba(0,0,0,.92)');
    g.fillStyle = shade; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
    g.restore();
  }

  function drawRing(g, cx, cy, R, tilt, front) {
    g.save(); g.translate(cx, cy); g.rotate(tilt);
    var bands = [[1.25, 0.18], [1.38, 0.42], [1.52, 0.55], [1.62, 0.12], [1.72, 0.45], [1.92, 0.30], [2.08, 0.16]];
    bands.forEach(function (b) {
      g.beginPath(); g.ellipse(0, 0, R * b[0], R * b[0] * 0.24, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      g.strokeStyle = 'rgba(226,210,180,' + b[1] + ')'; g.lineWidth = R * 0.11; g.stroke();
    });
    g.restore();
  }

  function renderPlanet(p, t) {
    var b = p.buf, g = b.getContext('2d'), size = (p.r + p.pad) * 2, c = size / 2;
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, size, size);
    if (p.ring) drawRing(g, c, c, p.r, p.tilt, false);
    drawSphere(g, p.img, c, c, p.r, still ? 0.2 : t * p.spin);
    if (p.ring) drawRing(g, c, c, p.r, p.tilt, true);
    if (p.atm) { /* atmosfera fina no lado iluminado */
      var a = g.createRadialGradient(c, c, p.r * 0.92, c, c, p.r * 1.18);
      a.addColorStop(0, 'rgba(' + p.atm + ',.45)'); a.addColorStop(1, 'rgba(' + p.atm + ',0)');
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = a;
      g.beginPath(); g.arc(c, c, p.r * 1.18, Math.PI * 0.55, Math.PI * 1.95); g.arc(c, c, p.r * 0.92, Math.PI * 1.95, Math.PI * 0.55, true); g.fill(); g.restore();
    }
    return b;
  }

  function drawMoon(px, py, p, t) {
    var a = (still ? 1 : t * 0.35), mx = px + Math.cos(a) * p.r * 2.3, my = py + Math.sin(a) * p.r * 0.75, mr = p.r * 0.2;
    var behind = Math.sin(a) < 0;
    var g = ctx.createRadialGradient(mx - mr * 0.4, my - mr * 0.4, mr * 0.1, mx, my, mr);
    g.addColorStop(0, '#e8e6e0'); g.addColorStop(0.6, '#9a978f'); g.addColorStop(1, '#22211f');
    return { behind: behind, draw: function () { ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill(); } };
  }

  /* ---------- Estrelas cadentes ---------- */
  var shots = [], nextShot = 1800;

  /* ---------- Quadro ---------- */
  function resize() {
    W = innerWidth; H = innerHeight; D = Math.max(document.documentElement.scrollHeight, H);
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars(); buildNebula(); if (still) frame(performance.now());
  }

  function frame(now) {
    var t = (now - t0) / 1000, sy = scrollY;
    mix += (mixTarget - mix) * (still ? 1 : 0.06); if (Math.abs(mixTarget - mix) < 0.002) mix = mixTarget;
    var A = SKY.galaxia, B = SKY.nebulosa;

    ctx.globalCompositeOperation = 'source-over';
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, lerpRGB(A.top, B.top, mix)); bg.addColorStop(1, lerpRGB(A.bot, B.bot, mix));
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    if (mix > 0.01 && nebula) { /* nebulosa com paralaxe lenta */
      ctx.globalAlpha = mix; var ny = -((sy * 0.05) % H); ctx.drawImage(nebula, 0, ny, W, H * 2); ctx.globalAlpha = 1;
    }

    GAL.forEach(function (gx, i) {
      var gy = parallaxY(gx.f, 0.3), cx = gx.x * W, R = gx.r; if (gy < -R * 2 || gy > H + R * 2) return;
      var rot = (still ? 0 : t * 0.02 * (i % 2 ? -1 : 1)) + gx.a;
      [['galaxia', 1 - mix], ['nebulosa', mix]].forEach(function (s) {
        if (s[1] < 0.01) return; var sp = galSprites[s[0]][i];
        ctx.save(); ctx.globalAlpha = s[1]; ctx.translate(cx, gy); ctx.scale(1, 0.42); ctx.rotate(rot);
        ctx.drawImage(sp, -sp.width / 2, -sp.height / 2); ctx.restore();
      });
    });

    layers.forEach(function (l, k) {
      l.a.forEach(function (s) {
        var yy = ((s.y - sy * l.sp) % (H * 3) + H * 3) % (H * 3); if (yy > H) return;
        var tw = still ? 0.8 : 0.3 + 0.7 * Math.pow((Math.sin(s.p + t * (1.2 + k * 0.5)) + 1) / 2, 3);
        var col = mix < 0.5 ? A.star[s.c] : B.star[s.c];
        ctx.fillStyle = 'rgba(' + col + ',' + tw.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(s.x, yy, s.r, 0, TAU); ctx.fill();
        if (s.r > 1.4 && tw > 0.85) { ctx.fillRect(s.x - s.r * 3, yy - 0.3, s.r * 6, 0.6); ctx.fillRect(s.x - 0.3, yy - s.r * 3, 0.6, s.r * 6); }
      });
    });

    ctx.globalCompositeOperation = 'source-over';
    PLANETS.forEach(function (p) {
      if (!p.ready) return;
      var py = parallaxY(p.f, p.sp), px = p.x * W, ext = p.r + p.pad; if (py < -ext * 2 || py > H + ext * 2) return;
      var moon = p.moon ? drawMoon(px, py, p, t) : null;
      if (moon && moon.behind) moon.draw();
      ctx.drawImage(renderPlanet(p, t), px - ext, py - ext, ext * 2, ext * 2);
      if (moon && !moon.behind) moon.draw();
    });

    if (!still) {
      ctx.globalCompositeOperation = 'lighter';
      if (now - t0 > nextShot) { nextShot = now - t0 + 1400 + Math.random() * 2800; shots.push({ x: Math.random() * W * 0.8 + W * 0.2, y: Math.random() * H * 0.5, vx: -(7 + Math.random() * 6), vy: 4 + Math.random() * 3, l: 1 }); }
      shots = shots.filter(function (s) {
        s.x += s.vx; s.y += s.vy; s.l -= 0.011; if (s.l <= 0) return false;
        var gr = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 16, s.y - s.vy * 16);
        gr.addColorStop(0, 'rgba(255,255,255,' + s.l + ')'); gr.addColorStop(0.3, 'rgba(200,215,255,' + s.l * 0.5 + ')'); gr.addColorStop(1, 'rgba(150,170,255,0)');
        ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 16, s.y - s.vy * 16); ctx.stroke();
        return true;
      });
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(frame);
    }
  }

  addEventListener('resize', resize);
  if (still) addEventListener('scroll', function () { frame(performance.now()); }, { passive: true });
  resize(); setTimeout(resize, 1500);
  if (!still) requestAnimationFrame(frame);
})();
