/* DUCA landing page interactions. Additive and defensive. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var LIME = "#b9e936";

  function toast(msg) {
    var t = $("lp-toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }

  /* ───── confetti ───── */
  function confetti(x, y, count) {
    if (reduce) return;
    var c = document.createElement("canvas");
    c.className = "lp-confetti";
    var dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    var g = c.getContext("2d"); g.scale(dpr, dpr);
    var cols = [LIME, "#F4F4EE", "#8caeff", "#b9e936"];
    var ps = [];
    for (var i = 0; i < (count || 90); i++) {
      var a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      ps.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, s: 4 + Math.random() * 6, c: cols[i % cols.length], r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4 });
    }
    var t0 = performance.now();
    (function tick(t) {
      var age = t - t0; g.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(function (p) {
        p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - age / 2200);
        g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s); g.restore();
      });
      if (age < 2200) requestAnimationFrame(tick); else c.remove();
    })(t0);
  }

  /* ───── hero canvas: floating glyphs that flee the cursor ───── */
  var cv = $("lp-canvas");
  if (cv && !reduce) {
    var g = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), mouse = { x: -999, y: -999 };
    var chars = "01{}</>#DUCACTF$_;".split(""), parts = [], running = true;
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(160, Math.floor((W * H) / 9000)); parts = [];
      for (var i = 0; i < n; i++) {
        var x = Math.random() * W, y = Math.random() * H;
        parts.push({ x: x, y: y, hx: x, hy: y, vx: 0, vy: 0, ch: chars[(Math.random() * chars.length) | 0], s: 11 + Math.random() * 10, ph: Math.random() * 6.28, hot: Math.random() < 0.12 });
      }
    }
    size(); window.addEventListener("resize", size);
    cv.parentElement.addEventListener("pointermove", function (e) {
      var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    cv.parentElement.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });
    cv.parentElement.addEventListener("click", function (e) { /* shockwave */
      var r = cv.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
      parts.forEach(function (p) { var dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) + 1; if (d < 260) { p.vx += (dx / d) * (260 - d) * 0.1; p.vy += (dy / d) * (260 - d) * 0.1; } });
    });
    document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) loop(); });
    new IntersectionObserver(function (en) { var v = en[0].isIntersecting; if (v && !running) { running = true; loop(); } else if (!v) running = false; }).observe(cv);
    var t = 0;
    (function loop() {
      if (!running) return;
      t += 0.01; g.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 130) { var f = (130 - d) / 130; p.vx += (dx / (d + 1)) * f * 2.2; p.vy += (dy / (d + 1)) * f * 2.2; }
        p.vx += (p.hx + Math.sin(t + p.ph) * 14 - p.x) * 0.012; p.vy += (p.hy + Math.cos(t * 0.8 + p.ph) * 14 - p.y) * 0.012;
        p.vx *= 0.9; p.vy *= 0.9; p.x += p.vx; p.y += p.vy;
        var near = d < 130;
        g.font = p.s + "px 'Space Mono', monospace";
        g.fillStyle = near || p.hot ? LIME : "rgba(244,244,238,0.22)";
        g.globalAlpha = near ? 1 : 0.9; g.fillText(p.ch, p.x, p.y);
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ───── magnetic buttons ───── */
  if (!reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = (e.clientX - r.left - r.width / 2) * 0.22 + "px " + (e.clientY - r.top - r.height / 2) * 0.35 + "px";
      });
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });

    /* ───── tilt + glare cards ───── */
    document.querySelectorAll("[data-tilt], [data-tilt-soft]").forEach(function (c) {
      var k = c.hasAttribute("data-tilt-soft") ? 2 : 7;
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--ry", (x - 0.5) * k * 2 + "deg"); c.style.setProperty("--rx", (0.5 - y) * k * 2 + "deg");
        c.style.setProperty("--gx", x * 100 + "%"); c.style.setProperty("--gy", y * 100 + "%");
        if (c.hasAttribute("data-tilt-soft")) c.style.transform = "perspective(1000px) rotateX(" + (0.5 - y) * k + "deg) rotateY(" + (x - 0.5) * k + "deg)";
      });
      c.addEventListener("pointerleave", function () {
        c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); if (c.hasAttribute("data-tilt-soft")) c.style.transform = "";
      });
    });
  }

  /* ───── countdown (only when the CTF has a start or end) ───── */
  var cd = $("lp-countdown");
  if (cd && window.init) {
    var start = Number(window.init.start) * 1000 || 0, end = Number(window.init.end) * 1000 || 0;
    function fmt(ms) {
      var s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, x = s % 60;
      return (d ? d + "d " : "") + [h, m, x].map(function (v) { return String(v).padStart(2, "0"); }).join(":");
    }
    function tick() {
      var now = Date.now();
      if (start && now < start) cd.innerHTML = "Starts in <b>" + fmt(start - now) + "</b>";
      else if (end && now < end) cd.innerHTML = "Ends in <b>" + fmt(end - now) + "</b>";
      else if (end && now >= end) cd.innerHTML = "This CTF has <b>ended</b>";
      else { cd.hidden = true; return; }
      cd.hidden = false;
    }
    if (start || end) { tick(); setInterval(tick, 1000); }
  }

  /* ───── konami code ───── */
  var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], pos = 0;
  window.addEventListener("keydown", function (e) {
    if (/INPUT|TEXTAREA/.test((e.target || {}).tagName || "")) return;
    pos = e.key === seq[pos] ? pos + 1 : (e.key === seq[0] ? 1 : 0);
    if (pos === seq.length) { pos = 0; toast("+30 lives. you know the code."); for (var i = 0; i < 4; i++) setTimeout(function () { confetti(Math.random() * innerWidth, innerHeight * 0.3, 80); }, i * 250); }
  });
})();
