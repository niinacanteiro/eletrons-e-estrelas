/* Elétrons e Estrelas — extras
   © Nicoly Canteiro Araújo
   1) Mergulho no universo na entrada (estrelas vindo em direção à tela + zoom ao rolar)
   2) Sistema Solar 3D que gira com o mouse/dedo
   3) Código colorido (realce de sintaxe) */
(function () {
  'use strict';
  var TAU = Math.PI * 2, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(1.5, window.devicePixelRatio || 1);
  function vis(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting); }); }, { rootMargin: '120px' }).observe(el);
  }
  function glowSprite(rgb, size) {
    var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d'), m = size / 2;
    var gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, 'rgba(' + rgb + ',.95)');
    gr.addColorStop(0.35, 'rgba(' + rgb + ',.28)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, size, size); return c;
  }
  var COLS = ['170,200,255', '255,214,150', '255,150,210', '190,160,255', '140,230,255', '255,255,255'];
  var SPR = COLS.map(function (c) { return glowSprite(c, 64); });

  /* ================= 1) Mergulho na entrada ================= */
  (function () {
    var hero = document.querySelector('.hero'); if (!hero) return;
    var img = hero.querySelector('.hero__img');
    var cv = document.createElement('canvas'); cv.className = 'hero__warp'; cv.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, hero.querySelector('.hero__copy'));
    var x = cv.getContext('2d'), W = 0, H = 0, S = [], on = true, last = performance.now();
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0);
      var n = Math.round(Math.min(420, W * H / 3200));
      S = []; for (var i = 0; i < n; i++) S.push(spawn(true));
    }
    function spawn(any) {
      return { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: any ? Math.random() : 1, c: (Math.random() * COLS.length) | 0, b: 0.6 + Math.random() * 0.8, p: Math.random() * TAU };
    }
    var dive = 0;
    function onScroll() {
      var h = hero.offsetHeight || 1, p = Math.max(0, Math.min(1, window.scrollY / h));
      dive = p;
      if (img) { img.style.transform = 'translateX(-50%) scale(' + (1 + p * 0.55).toFixed(4) + ')'; img.style.opacity = (1 - p * 0.75).toFixed(3); }
    }
    var tk = 0; addEventListener('scroll', function () { if (tk) return; tk = 1; requestAnimationFrame(function () { onScroll(); tk = 0; }); }, { passive: true });
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (on) {
        x.clearRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
        var cx = W * 0.5, cy = H * 0.46, F = Math.max(W, H) * 0.55, sp = (0.045 + dive * 0.55) * dt;
        for (var i = 0; i < S.length; i++) {
          var s = S[i]; if (!still) s.z -= sp * (0.6 + s.b * 0.4);
          if (s.z <= 0.02) { S[i] = s = spawn(false); }
          var k = 1 / s.z, px = cx + s.x * F * k * 0.5, py = cy + s.y * F * k * 0.5;
          if (px < -40 || px > W + 40 || py < -40 || py > H + 40) { S[i] = spawn(false); continue; }
          var near = 1 - s.z, tw = 0.75 + 0.25 * Math.sin(now / 420 + s.p);
          var r = (1.2 + near * near * 9) * s.b, a = Math.min(1, (0.25 + near * 1.1)) * tw;
          x.globalAlpha = a; x.drawImage(SPR[s.c], px - r * 2, py - r * 2, r * 4, r * 4);
          if (near > 0.55 && dive > 0.05) { /* rastro de velocidade ao mergulhar */
            var tl = 1 + dive * 0.35; x.globalAlpha = a * 0.35 * dive;
            x.strokeStyle = 'rgba(' + COLS[s.c] + ',1)'; x.lineWidth = Math.max(0.6, r * 0.35);
            x.beginPath(); x.moveTo(px, py); x.lineTo(cx + (px - cx) / tl, cy + (py - cy) / tl); x.stroke();
          }
        }
        x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      }
      requestAnimationFrame(frame);
    }
    vis(hero, function (v) { on = v; });
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 150); });
    size(); onScroll(); requestAnimationFrame(frame);
  })();

  /* ================= 2) Sistema Solar 3D ================= */
  (function () {
    var box = document.querySelector('.sis3d'); if (!box) return;
    var cv = box.querySelector('canvas'), x = cv.getContext('2d'), tip = box.querySelector('.sis-tip');
    var BODIES = [
      { k: 'Elétrons e estrelas', n: 'Sol', tex: 'tex-sun.jpg', r: 34, a: 0, T: 1, spin: 0.01, sun: true },
      { k: 'Terra', n: 'Terra', tex: 'tex-earth_daymap.jpg', r: 11, a: 95, T: 26, spin: 0.05, atm: '120,180,255' },
      { k: 'Marte', n: 'Marte', tex: 'tex-mars.jpg', r: 8.5, a: 135, T: 40, spin: 0.05 },
      { k: 'Júpiter', n: 'Júpiter', tex: 'tex-jupiter.jpg', r: 21, a: 190, T: 60, spin: 0.08 },
      { k: 'Saturno', n: 'Saturno', tex: 'tex-saturn.jpg', r: 17, a: 250, T: 82, spin: 0.07, ring: true },
      { k: 'Netuno', n: 'Netuno', tex: 'tex-neptune.jpg', r: 12, a: 305, T: 110, spin: 0.05 }
    ];
    BODIES.forEach(function (b, i) {
      b.ph = i * 1.7; b.img = new Image(); b.img.src = b.tex; b.img.onload = function () { b.ok = true; };
      b.buf = document.createElement('canvas'); b.buf.width = b.buf.height = 128;
    });
    var yaw = -0.5, pitch = 0.42, zoom = 1, vyaw = 0, drag = null, moved = 0, hover = null, W = 0, H = 0, on = true, t0 = performance.now(), auto = true;
    function size() {
      var r = box.getBoundingClientRect(); W = r.width; H = Math.max(360, Math.min(620, W * 0.72));
      cv.style.height = H + 'px'; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); x.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function sphere(b, t) { /* textura projetada em colunas para dar curvatura real */
      var g = b.buf.getContext('2d'), R = 64, img = b.img, tw = img.naturalWidth, th = img.naturalHeight, N = 96, cw = (2 * R) / N, rot = t * b.spin;
      g.clearRect(0, 0, 128, 128); g.save(); g.beginPath(); g.arc(64, 64, R, 0, TAU); g.clip();
      for (var k = 0; k < N; k++) {
        var x0 = -1 + (k * 2) / N, x1 = -1 + ((k + 1) * 2) / N, u0 = Math.asin(x0) / TAU + rot, u1 = Math.asin(x1) / TAU + rot;
        u0 -= Math.floor(u0); var du = u1 - Math.floor(u1) - u0; if (du < 0) du += 1;
        var sx = u0 * tw, sw = Math.max(1, du * tw); if (sx + sw > tw) sw = tw - sx;
        g.drawImage(img, sx, 0, sw, th, k * cw, 0, cw + 1, 128);
      }
      g.restore();
    }
    function proj(px, py, pz) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var X = px * cy - pz * sy, Z = px * sy + pz * cy, Y = py * cp - Z * sp; Z = py * sp + Z * cp;
      var s = zoom * Math.min(W, H * 1.35) / 700, f = 900 / (900 + Z * s);
      return { x: W / 2 + X * s * f, y: H / 2 + Y * s * f, z: Z, f: f * s };
    }
    var sunGlow = null;
    function draw(now) {
      var t = (now - t0) / 1000;
      if (!drag && auto && !still) yaw += 0.0009 + vyaw; vyaw *= 0.94;
      x.clearRect(0, 0, W, H);
      var sun = proj(0, 0, 0);
      /* órbitas */
      x.lineWidth = 1;
      BODIES.forEach(function (b) {
        if (b.sun) return; x.beginPath();
        for (var i = 0; i <= 120; i++) { var a = i / 120 * TAU, p = proj(Math.cos(a) * b.a, 0, Math.sin(a) * b.a); if (i) x.lineTo(p.x, p.y); else x.moveTo(p.x, p.y); }
        x.strokeStyle = b === hover ? 'rgba(243,210,122,.55)' : 'rgba(200,215,255,.13)'; x.stroke();
      });
      /* posições */
      var list = BODIES.map(function (b) {
        var ang = b.sun ? 0 : b.ph + (still ? 0 : t * TAU / b.T / 1.6);
        var p = proj(Math.cos(ang) * b.a, 0, Math.sin(ang) * b.a); p.b = b; p.R = b.r * p.f * 1.25; return p;
      }).sort(function (a, c) { return c.z - a.z; });
      list.forEach(function (p) {
        var b = p.b; if (!b.ok) return;
        if (!b.last || t - b.last > 0.08) { sphere(b, still ? 0.3 : t); b.last = t; }
        if (b.sun) {
          if (!sunGlow) sunGlow = glowSprite('255,170,70', 256);
          x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.9; x.drawImage(sunGlow, p.x - p.R * 4, p.y - p.R * 4, p.R * 8, p.R * 8);
          x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
          x.drawImage(b.buf, p.x - p.R, p.y - p.R, p.R * 2, p.R * 2);
          var hl = x.createRadialGradient(p.x, p.y, p.R * 0.2, p.x, p.y, p.R);
          hl.addColorStop(0, 'rgba(255,240,200,.35)'); hl.addColorStop(1, 'rgba(255,140,40,0)');
          x.fillStyle = hl; x.beginPath(); x.arc(p.x, p.y, p.R, 0, TAU); x.fill();
        } else {
          if (b.ring) ring(p, false);
          x.drawImage(b.buf, p.x - p.R, p.y - p.R, p.R * 2, p.R * 2);
          /* luz vinda do Sol: lado iluminado claro, lado oposto em sombra suave dentro do próprio planeta */
          var dx = sun.x - p.x, dy = sun.y - p.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
          var lx = p.x + ux * p.R * 0.55, ly = p.y + uy * p.R * 0.55;
          var sh = x.createRadialGradient(lx, ly, p.R * 0.1, p.x - ux * p.R * 0.2, p.y - uy * p.R * 0.2, p.R * 1.25);
          sh.addColorStop(0, 'rgba(255,250,235,.16)'); sh.addColorStop(0.45, 'rgba(0,0,0,0)'); sh.addColorStop(0.85, 'rgba(0,0,8,.62)'); sh.addColorStop(1, 'rgba(0,0,8,.85)');
          x.save(); x.beginPath(); x.arc(p.x, p.y, p.R, 0, TAU); x.clip(); x.fillStyle = sh; x.fillRect(p.x - p.R, p.y - p.R, p.R * 2, p.R * 2); x.restore();
          if (b.ring) ring(p, true);
          if (b === hover) { x.strokeStyle = 'rgba(243,210,122,.9)'; x.lineWidth = 1.5; x.beginPath(); x.arc(p.x, p.y, p.R + 5, 0, TAU); x.stroke(); }
        }
        b.sx = p.x; b.sy = p.y; b.sR = p.R;
      });
      if (on) requestAnimationFrame(draw); else drawing = false;
    }
    function ring(p, front) { /* anéis no plano da órbita, metade de trás antes e metade da frente depois do planeta */
      var b = p.b, bands = [[1.35, .25], [1.55, .5], [1.75, .6], [1.9, .18], [2.05, .42], [2.3, .2]];
      var c = p, ang = Math.atan2(0, 1);
      bands.forEach(function (bd) {
        x.beginPath(); var started = false;
        for (var i = 0; i <= 72; i++) {
          var a = i / 72 * TAU, rr = b.r * bd[0];
          var wx = Math.cos(a) * rr, wz = Math.sin(a) * rr;
          var q = projRel(c, wx, wz), isFront = q.z < c.z;
          if (isFront === front) { if (!started) { x.moveTo(q.x, q.y); started = true; } else x.lineTo(q.x, q.y); } else started = false;
        }
        x.strokeStyle = 'rgba(228,212,178,' + bd[1] + ')'; x.lineWidth = Math.max(1, b.r * p.f * 0.16); x.stroke();
      });
    }
    function projRel(c, wx, wz) { /* projeta um ponto relativo ao centro do planeta */
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var X = wx * cy - wz * sy, Z = wx * sy + wz * cy, Y = -Z * sp; Z = Z * cp;
      var k = c.f * 1.25; return { x: c.x + X * k, y: c.y + Y * k, z: c.z + Z };
    }
    function pick(e) {
      var r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, best = null, bd = 1e9;
      BODIES.forEach(function (b) { if (b.sx === undefined) return; var d = Math.hypot(mx - b.sx, my - b.sy); if (d < b.sR + 8 && d < bd) { bd = d; best = b; } });
      return best;
    }
    cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; moved = 0; auto = false; cv.setPointerCapture(e.pointerId); cv.classList.add('is-drag'); });
    cv.addEventListener('pointermove', function (e) {
      if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
        yaw += dx * 0.008; vyaw = dx * 0.0004; pitch = Math.max(0.08, Math.min(1.35, pitch + dy * 0.006)); drag = { x: e.clientX, y: e.clientY };
      } else {
        hover = pick(e); cv.style.cursor = hover ? 'pointer' : 'grab';
        if (tip) { if (hover) { var r = cv.getBoundingClientRect(); tip.textContent = hover.n; tip.style.transform = 'translate(' + (hover.sx) + 'px,' + (hover.sy - hover.sR - 26) + 'px)'; tip.classList.add('on'); } else tip.classList.remove('on'); }
      }
    });
    function end(e) {
      if (!drag) return; cv.classList.remove('is-drag');
      if (moved < 6) { var b = pick(e); if (b) { var btn = document.querySelector('#ceu .sis-sr [data-k="' + b.k + '"]'); if (btn) btn.click(); } }
      drag = null; setTimeout(function () { auto = true; }, 2500);
    }
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', function () { drag = null; cv.classList.remove('is-drag'); });
    cv.addEventListener('pointerleave', function () { hover = null; if (tip) tip.classList.remove('on'); });
    cv.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.shiftKey && Math.abs(e.deltaY) < 4) return; }, { passive: true });
    box.querySelectorAll('[data-zoom]').forEach(function (b) { b.addEventListener('click', function () { zoom = Math.max(0.6, Math.min(2, zoom * (b.dataset.zoom === 'in' ? 1.2 : 1 / 1.2))); }); });
    var drawing = false;
    vis(box, function (v) { on = v; if (v && !drawing) { drawing = true; requestAnimationFrame(draw); } });
    var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 150); });
    size(); if (!('IntersectionObserver' in window)) { drawing = true; requestAnimationFrame(draw); }
  })();

  /* ================= 3) Código colorido ================= */
  (function () {
    var KW = /^(def|for|in|if|else|elif|return|import|from|as|while|and|or|not|break|continue|class|with|try|except)$/;
    var TY = /^(void|long|int|float|double|const|bool|char|unsigned|True|False|None|HIGH|LOW|OUTPUT|INPUT)$/;
    var BI = /^(print|range|len|np|numpy|Serial|servo|digitalWrite|pinMode|delay|analogRead|digitalRead)$/;
    var RX = /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([=+\-*\/<>!%&|]+)/gm;
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function hl(text) {
      var out = '', i = 0, m; RX.lastIndex = 0;
      while ((m = RX.exec(text))) {
        out += esc(text.slice(i, m.index)); i = RX.lastIndex; var v = m[0], cls = '';
        if (m[1]) cls = 'c'; else if (m[2]) cls = 's'; else if (m[3]) cls = 'n';
        else if (m[4]) {
          var after = text.slice(RX.lastIndex).match(/^\s*\(/);
          if (KW.test(v)) cls = 'k'; else if (TY.test(v)) cls = 't'; else if (/^[A-Z][A-Z0-9_]{2,}$/.test(v)) cls = 'cst';
          else if (after) cls = 'f'; else if (BI.test(v)) cls = 'b'; else cls = 'v';
        } else if (m[5]) cls = 'o';
        out += '<span class="tk-' + cls + '">' + esc(v) + '</span>';
        if (m[0].length === 0) RX.lastIndex++;
      }
      return out + esc(text.slice(i));
    }
    document.querySelectorAll('pre.x-code code').forEach(function (code) {
      var pre = code.parentNode, lang = /void |digitalWrite|servo|long /.test(code.textContent) ? 'Arduino (C++)' : 'Python';
      var lines = code.querySelectorAll('.x-ln');
      if (lines.length) lines.forEach(function (ln) { ln.innerHTML = hl(ln.textContent); });
      else code.innerHTML = hl(code.textContent);
      if (!pre.previousElementSibling || !pre.previousElementSibling.classList.contains('code-bar')) {
        var bar = document.createElement('div'); bar.className = 'code-bar';
        bar.innerHTML = '<i></i><i></i><i></i><span>' + lang + '</span>';
        var win = document.createElement('div'); win.className = 'code-win';
        pre.parentNode.insertBefore(win, pre); win.appendChild(bar); win.appendChild(pre); pre.classList.add('has-bar');
      }
    });
  })();
})();
