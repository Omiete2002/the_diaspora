/* =========================================================
   THE DIASPORA — home page effects
   Loading screen, embers, parallax, rotating cities, tilt,
   magnetic buttons, scroll progress. Works on touch + mouse.
   ========================================================= */
(function () {
  "use strict";
  var root = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var isSmall = window.matchMedia("(max-width: 700px)").matches;

  /* -------------------------------------------------- loading screen */
  var pre = document.querySelector(".preloader");
  var bar = pre && pre.querySelector(".pl-bar span");
  var started = window.__plStart || performance.now();
  var repeat = false;
  try { repeat = sessionStorage.getItem("diaspora-seen") === "1"; sessionStorage.setItem("diaspora-seen", "1"); } catch (e) {}
  var MIN = reduce ? 500 : (repeat ? 1300 : 2500);   // shorter on repeat visits in the same session
  var MAX = 5000;                                     // never hold the visitor longer than this
  var finished = false;

  function setProgress(p) { if (bar) bar.style.transform = "scaleX(" + Math.min(1, p) + ")"; }

  // fake-but-honest progress: images that have loaded + time elapsed
  var imgs = Array.prototype.slice.call(document.images);
  var loaded = 0;
  function count() { loaded++; setProgress(Math.max(loaded / Math.max(imgs.length, 1), (performance.now() - started) / MIN) * 0.9); }
  imgs.forEach(function (im) { if (im.complete) loaded++; else { im.addEventListener("load", count); im.addEventListener("error", count); } });
  var timeTick = setInterval(function () {
    setProgress(Math.max(loaded / Math.max(imgs.length, 1), (performance.now() - started) / MIN) * 0.9);
  }, 120);

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(timeTick);
    setProgress(1);
    setTimeout(function () {
      if (pre) pre.classList.add("pl-done");
      body.classList.add("loaded");
      root.classList.remove("is-loading");
      setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 1300);
    }, reduce ? 0 : 280);
  }
  function whenReady() {
    var wait = Math.max(0, MIN - (performance.now() - started));
    setTimeout(finish, wait);
  }
  if (!pre) { body.classList.add("loaded"); root.classList.remove("is-loading"); }
  else {
    if (document.readyState === "complete") whenReady();
    else window.addEventListener("load", whenReady);
    setTimeout(finish, MAX);
  }

  /* -------------------------------------------------- rotating cities */
  var rot = document.querySelector(".city-rotator");
  if (rot) {
    var cities = (rot.getAttribute("data-cities") || "").split(",");
    var i = 0;
    var current = rot.querySelector("span");
    setInterval(function () {
      if (document.hidden) return;
      i = (i + 1) % cities.length;
      var next = document.createElement("span");
      next.className = "in";
      next.textContent = cities[i];
      rot.appendChild(next);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          next.className = "";
          current.className = "out";
          var old = current;
          setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 750);
          current = next;
        });
      });
    }, 2200);
  }

  /* -------------------------------------------------- embers (hero canvas) */
  var hero = document.querySelector(".hero");
  var canvas = document.querySelector(".embers");
  var heroVisible = true;
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(hero);
  }
  if (canvas && !reduce && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, parts = [];
    var N = isSmall ? 22 : 48;
    var colors = ["201,170,146", "232,205,170", "165,144,127", "247,238,226"];
    function size() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(p, initial) {
      p.x = Math.random() * W;
      p.y = initial ? Math.random() * H : H + 10;
      p.r = Math.random() * 1.8 + 0.5;
      p.vy = Math.random() * 0.35 + 0.12;
      p.vx = (Math.random() - 0.5) * 0.15;
      p.wob = Math.random() * Math.PI * 2;
      p.a = Math.random() * 0.5 + 0.25;
      p.c = colors[(Math.random() * colors.length) | 0];
      return p;
    }
    size();
    for (var k = 0; k < N; k++) parts.push(spawn({}, true));
    window.addEventListener("resize", size);
    (function loop() {
      requestAnimationFrame(loop);
      if (!heroVisible || document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.wob += 0.012;
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.wob) * 0.18;
        var fade = Math.min(1, p.y / (H * 0.35));        // fade as they rise toward the top
        if (p.y < -10 || fade <= 0) spawn(p, false);
        ctx.beginPath();
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, "rgba(" + p.c + "," + (p.a * fade) + ")");
        g.addColorStop(1, "rgba(" + p.c + ",0)");
        ctx.fillStyle = g;
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    })();
  }

  /* -------------------------------------------------- scroll: parallax + progress + marquee speed */
  var inner = document.querySelector(".hero-inner");
  var foot = document.querySelector(".hero-foot");
  var progress = document.querySelector(".scroll-progress");
  var marquee = document.querySelector(".marquee-track");
  var lastY = window.scrollY, ticking = false, skew = 0;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      var vh = window.innerHeight;
      if (hero && !reduce && y < vh * 1.2) {
        hero.style.setProperty("--sy", y);
        if (inner) {
          inner.style.transform = "translateY(" + (y * 0.32) + "px)";
          inner.style.opacity = Math.max(0, 1 - y / (vh * 0.75));
        }
        if (foot) foot.style.opacity = Math.max(0, 1 - y / (vh * 0.25));
      }
      if (progress) {
        var max = document.documentElement.scrollHeight - vh;
        progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      }
      if (marquee && !reduce) {
        var v = Math.max(-12, Math.min(12, (y - lastY) * 0.4));
        skew += (v - skew) * 0.3;
        marquee.style.transform = "skewX(" + (-skew) + "deg)";
      }
      lastY = y;
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  // settle the marquee skew back to zero when scrolling stops
  setInterval(function () {
    if (!marquee || Math.abs(skew) < 0.05) return;
    skew *= 0.7;
    marquee.style.transform = "skewX(" + (-skew) + "deg)";
  }, 60);

  /* -------------------------------------------------- pointer: spotlight + ring parallax */
  if (hero && finePointer && !reduce) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      hero.style.setProperty("--mx", (x * 100) + "%");
      hero.style.setProperty("--my", (y * 100) + "%");
      hero.style.setProperty("--px", (x - 0.5) * 2);
      hero.style.setProperty("--py", (y - 0.5) * 2);
    });
    hero.addEventListener("pointerleave", function () {
      hero.style.setProperty("--px", 0); hero.style.setProperty("--py", 0);
    });
  }
  // phones/tablets: gently drift the rings with device tilt (when the browser allows it without a prompt)
  if (hero && !finePointer && !reduce && "DeviceOrientationEvent" in window && typeof DeviceOrientationEvent.requestPermission !== "function") {
    window.addEventListener("deviceorientation", function (e) {
      if (e.gamma == null) return;
      hero.style.setProperty("--px", Math.max(-1, Math.min(1, e.gamma / 30)));
      hero.style.setProperty("--py", Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    });
  }

  /* -------------------------------------------------- 3D tilt cards (mouse only) */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      var shine = document.createElement("span");
      shine.className = "shine";
      card.appendChild(shine);
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.classList.add("tilting");
        card.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 8) + "deg) rotateY(" + ((x - 0.5) * 10) + "deg) translateY(-6px)";
        card.style.setProperty("--sx", (x * 100) + "%");
        card.style.setProperty("--sy2", (y * 100) + "%");
      });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("tilting");
        card.style.transform = "";
      });
    });

    /* magnetic buttons */
    document.querySelectorAll(".magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + (x * 0.25) + "px," + (y * 0.35) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }
})();
