/* DUCA theme interactions. Purely additive: every feature is defensive and
   CTFd works the same if this file fails to load. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;
  var nav = document.querySelector(".duca-nav");

  /* sticky navbar shrink + highlight current route */
  function onScroll() { if (nav) nav.classList.toggle("scrolled", window.scrollY > 12); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (nav) {
    var path = location.pathname.replace(/\/$/, "");
    nav.querySelectorAll(".nav-link[href]").forEach(function (a) {
      var h = a.getAttribute("href").replace(/\/$/, "");
      if (h && h !== "#" && h === path) a.classList.add("active-route");
    });
  }

  if (reduce) return;

  /* cursor glow in page background */
  var raf = 0, mx = 0, my = 0;
  window.addEventListener("pointermove", function (e) {
    mx = e.clientX; my = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = 0;
      root.style.setProperty("--mx", mx + "px");
      root.style.setProperty("--my", my + "px");
    });
  }, { passive: true });

  /* per-card spotlight: sets --bx/--by on challenge buttons */
  document.addEventListener("pointermove", function (e) {
    var b = e.target.closest && e.target.closest(".challenge-button");
    if (!b) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty("--bx", e.clientX - r.left + "px");
    b.style.setProperty("--by", e.clientY - r.top + "px");
  }, { passive: true });

  /* scroll-reveal for cards, rows and challenge tiles (they render async via Alpine) */
  if (!("IntersectionObserver" in window)) return;
  var SEL = ".challenge-button, .category-header, .card";
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });

  function watch(el) {
    if (el.__duca || el.closest(".modal")) return;
    el.__duca = true;
    var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty("--i", Math.min(sibs, 6));
    el.classList.add("duca-reveal");
    io.observe(el);
  }
  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.matches && node.matches(SEL)) watch(node);
    if (node.querySelectorAll) node.querySelectorAll(SEL).forEach(watch);
  }

  scan(document.body);
  new MutationObserver(function (muts) {
    muts.forEach(function (m) { m.addedNodes.forEach(scan); });
  }).observe(document.body, { childList: true, subtree: true });

  /* safety net: never leave content hidden if observer misses it */
  setTimeout(function () {
    document.querySelectorAll(".duca-reveal:not(.in)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("in");
    });
  }, 600);
})();
