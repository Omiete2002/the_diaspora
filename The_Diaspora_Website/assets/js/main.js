(function () {
  "use strict";
  var C = window.DIASPORA || {};
  var body = document.body;

  /* ---- header: transparent over the hero, solid once scrolled ---- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("solid", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".menu-toggle");
  function setNav(open) {
    body.classList.toggle("nav-open", open);
    document.documentElement.classList.toggle("nav-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }
  if (toggle) {
    toggle.addEventListener("click", function () { setNav(!body.classList.contains("nav-open")); });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setNav(false); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1080) setNav(false); });
    // returning via the browser back button can restore a page with the menu still open
    window.addEventListener("pageshow", function () { setNav(false); });
  }

  /* ---- reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- contact details from config ---- */
  document.querySelectorAll("[data-phone]").forEach(function (el) {
    el.textContent = C.phoneDisplay || "";
    if (el.tagName === "A") el.href = "tel:" + (C.phoneDisplay || "").replace(/[^\d+]/g, "");
  });
  document.querySelectorAll("[data-email]").forEach(function (el) {
    el.textContent = C.email || "";
    if (el.tagName === "A") el.href = "mailto:" + (C.email || "");
  });
  document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
    el.href = "https://wa.me/" + (C.whatsapp || "");
  });
  ["instagram", "tiktok", "x"].forEach(function (k) {
    document.querySelectorAll('[data-social="' + k + '"]').forEach(function (el) {
      if (C[k]) { el.href = C[k]; } else { el.parentElement && el.parentElement.tagName === "LI" ? el.parentElement.remove() : el.remove(); }
    });
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- countdown ---- */
  var cd = document.querySelectorAll("[data-countdown]");
  if (cd.length && C.openingDate) {
    var target = new Date(C.openingDate).getTime();
    var set = function (el, v) {
      if (!el || el.textContent === v) return;
      el.textContent = v;
      el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
    };
    var tick = function () {
      var diff = target - Date.now();
      cd.forEach(function (box) {
        if (diff <= 0) { box.innerHTML = '<div><b>Now</b><small>Open</small></div>'; return; }
        var d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5),
            m = Math.floor(diff % 36e5 / 6e4), s = Math.floor(diff % 6e4 / 1e3);
        set(box.querySelector("[data-d]"), String(d));
        set(box.querySelector("[data-h]"), String(h).padStart(2, "0"));
        set(box.querySelector("[data-m]"), String(m).padStart(2, "0"));
        set(box.querySelector("[data-s]"), String(s).padStart(2, "0"));
      });
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---- sub-navigation highlight on menu pages ---- */
  var subLinks = document.querySelectorAll(".subnav a");
  if (subLinks.length && "IntersectionObserver" in window) {
    var map = {};
    subLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          subLinks.forEach(function (a) { a.classList.remove("active"); });
          map[e.target.id].classList.add("active");
          map[e.target.id].scrollIntoView({ block: "nearest", inline: "center" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---- December calendar: mark today ---- */
  var today = new Date();
  document.querySelectorAll(".cal .cell[data-date]").forEach(function (cell) {
    var d = new Date(cell.getAttribute("data-date") + "T23:59:59+01:00");
    if (d < today) cell.classList.add("past");
  });

  /* ---- What's On: mark tonight (Lagos time) ---- */
  (function () {
    var nights = document.querySelectorAll("[data-day]");
    if (!nights.length) return;
    var names = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    var lagos = new Date(Date.now() + (new Date().getTimezoneOffset() + 60) * 60000);
    var today = names[lagos.getDay()];
    nights.forEach(function (el) { if (el.getAttribute("data-day") === today) el.classList.add(el.tagName === "A" ? "is-today" : "is-today"); });
  })();

  /* ---- reservation form → WhatsApp / email ---- */
  var form = document.getElementById("reserve-form");
  if (form) {
    var dateInput = form.querySelector('[name="date"]');
    if (dateInput) {
      var t = new Date(); dateInput.min = t.toISOString().slice(0, 10);
    }
    // preselect package from ?package= in the URL (links from the December page)
    var params = new URLSearchParams(location.search);
    // ?day=monday → pre-fill the date with the next Monday
    var dayParam = params.get("day");
    if (dayParam && dateInput) {
      var idx = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].indexOf(dayParam);
      if (idx > -1) {
        var d = new Date(); d.setHours(12);
        d.setDate(d.getDate() + ((idx - d.getDay() + 7) % 7));
        dateInput.value = d.toISOString().slice(0, 10);
      }
    }
    var pk = params.get("package");
    if (pk) {
      var sel = form.querySelector('[name="occasion"]');
      if (sel) { Array.prototype.forEach.call(sel.options, function (o) { if (o.value === pk) sel.value = pk; }); }
    }

    var status = form.querySelector(".form-status");
    var buildMessage = function () {
      var f = new FormData(form);
      var lines = [
        "Hello The Diaspora, I'd like to request a reservation.",
        "",
        "Name: " + (f.get("name") || ""),
        "Phone: " + (f.get("phone") || ""),
        "Date: " + (f.get("date") || ""),
        "Time: " + (f.get("time") || ""),
        "Guests: " + (f.get("guests") || ""),
        "Occasion / package: " + (f.get("occasion") || "")
      ];
      if (f.get("notes")) lines.push("Notes: " + f.get("notes"));
      return lines.join("\n");
    };
    var valid = function () {
      if (!form.checkValidity()) { form.reportValidity(); return false; }
      return true;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!valid()) return;
      window.open("https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent(buildMessage()), "_blank", "noopener");
      if (status) {
        status.textContent = "Thank you — WhatsApp has opened with your request. Our team will confirm your table shortly.";
        status.classList.add("show");
      }
    });
    var emailBtn = form.querySelector("[data-send-email]");
    if (emailBtn) {
      emailBtn.addEventListener("click", function () {
        if (!valid()) return;
        location.href = "mailto:" + (C.email || "") + "?subject=" + encodeURIComponent("Reservation request") + "&body=" + encodeURIComponent(buildMessage());
      });
    }
  }
})();
