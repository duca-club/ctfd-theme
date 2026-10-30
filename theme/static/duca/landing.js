/* DUCA landing page: the hero background and the countdown. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LIME = "#b9e936";

  /* ───── hero background: floating glyphs that scatter away from the cursor ───── */
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
      parts.forEach(function (p) {
        var dx = p.x - cx, dy = p.y - cy, d = Math.hypot(dx, dy) + 1;
        if (d < 260) { p.vx += (dx / d) * (260 - d) * 0.1; p.vy += (dy / d) * (260 - d) * 0.1; }
      });
    });

    document.addEventListener("visibilitychange", function () { running = !document.hidden; if (running) loop(); });
    new IntersectionObserver(function (en) {
      var v = en[0].isIntersecting;
      if (v && !running) { running = true; loop(); } else if (!v) running = false;
    }).observe(cv);

    var t = 0;
    function loop() {
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
    }
    loop();
  }

  /* ───── countdown (only when the CTF has a start or end) ───── */
  var cd = $("lp-countdown");
  if (cd && window.init) {
    var start = Number(window.init.start) * 1000 || 0, end = Number(window.init.end) * 1000 || 0;
    var fmt = function (ms) {
      var s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, x = s % 60;
      return (d ? d + "d " : "") + [h, m, x].map(function (v) { return String(v).padStart(2, "0"); }).join(":");
    };
    var tick = function () {
      var now = Date.now();
      if (start && now < start) cd.innerHTML = "Starts in <b>" + fmt(start - now) + "</b>";
      else if (end && now < end) cd.innerHTML = "Ends in <b>" + fmt(end - now) + "</b>";
      else if (end && now >= end) cd.innerHTML = "This CTF has <b>ended</b>";
      else { cd.hidden = true; return; }
      cd.hidden = false;
    };
    if (start || end) { tick(); setInterval(tick, 1000); }
  }
})();
