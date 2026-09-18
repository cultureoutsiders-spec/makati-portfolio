/* =============================================================
   Makati Web Studio — app.js  (shared, per-site copy)
   Vanilla JS, no dependencies. Progressive enhancement only.
   ============================================================= */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header shadow ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile nav ---- */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setOpen(nav.getAttribute("data-open") !== "true");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1040) setOpen(false);
    });
  }

  /* ---- Scroll reveal (single + staggered groups) ---- */
  var reveal = document.querySelectorAll(".reveal, .reveal-group");
  if (reveal.length && "IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        if (t.classList.contains("reveal-group")) {
          Array.prototype.forEach.call(t.children, function (c, i) { c.style.setProperty("--i", i); });
        }
        t.classList.add("is-in");
        io.unobserve(t);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- Parallax on [data-parallax] (strength ~ .05–.3) ---- */
  (function parallax() {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 700) return;
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!nodes.length) return;
    var ticking = false;
    var apply = function () {
      var vh = window.innerHeight;
      nodes.forEach(function (n) {
        var r = n.getBoundingClientRect();
        var mid = r.top + r.height / 2;
        var delta = (mid - vh / 2) / vh;
        var strength = parseFloat(n.getAttribute("data-parallax")) || 0.12;
        n.style.transform = "translate3d(0," + (delta * strength * -120).toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(apply); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", apply);
    apply();
  })();

  /* ---- SVG line draw on [data-draw] ---- */
  (function lineDraw() {
    var paths = Array.prototype.slice.call(document.querySelectorAll("[data-draw]"));
    if (!paths.length) return;
    paths.forEach(function (p) {
      try {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = reduceMotion ? 0 : len;
      } catch (e) {}
    });
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.transition = "stroke-dashoffset 1.4s ease";
        en.target.style.strokeDashoffset = 0;
        dio.unobserve(en.target);
      });
    }, { threshold: 0.3 });
    paths.forEach(function (p) { dio.observe(p); });
  })();

  /* ---- Count-up on [data-count] ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var dec = (el.getAttribute("data-count").split(".")[1] || "").length;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = target.toFixed(dec) + suffix; return; }
      var start = null, dur = 1400;
      var tick = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(dec) + suffix;
      };
      requestAnimationFrame(tick);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Lightbox ---- */
  var gallery = document.querySelector(".gallery");
  var lb = document.querySelector(".lightbox");
  if (gallery && lb) {
    var lbImg = lb.querySelector("img");
    var open = function (src, alt) {
      lbImg.src = src; lbImg.alt = alt || "";
      lb.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lightbox__close").focus();
    };
    var close = function () {
      lb.setAttribute("data-open", "false");
      document.body.style.overflow = "";
    };
    gallery.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        var img = b.querySelector("img");
        open(img.getAttribute("data-full") || img.src, img.alt);
      });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("lightbox__close")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---- Year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Contact form (Web3Forms + mailto fallback) ----
     Set the site's access key in data-web3key on the <form>.
     Get a free key at https://web3forms.com (2 min, no account) and paste it in.
     Until then the form falls back to opening the visitor's email client. */
  document.querySelectorAll("form[data-contact]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var key = form.getAttribute("data-web3key");
    var fallbackTo = form.getAttribute("data-mailto");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('input[name="botcheck"]') && form.querySelector('input[name="botcheck"]').checked) return;
      var data = new FormData(form);

      if (!key || key.indexOf("REPLACE") === 0) {
        // No key yet — hand off to the visitor's mail client so nothing is lost.
        var body = [];
        data.forEach(function (v, k) { if (k !== "botcheck" && k !== "access_key") body.push(k + ": " + v); });
        window.location.href = "mailto:" + (fallbackTo || "") +
          "?subject=" + encodeURIComponent("Website enquiry") +
          "&body=" + encodeURIComponent(body.join("\n"));
        return;
      }

      data.append("access_key", key);
      if (status) { status.setAttribute("data-state", ""); status.textContent = "Sending…"; status.style.display = "block"; }
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res.success) {
          form.reset();
          if (status) { status.setAttribute("data-state", "ok"); status.textContent = "Thanks — your message is on its way. We'll reply shortly."; }
        } else {
          throw new Error(res.message || "failed");
        }
      }).catch(function () {
        if (status) { status.setAttribute("data-state", "err"); status.textContent = "Something went wrong. Please call us or message us on Facebook."; }
      }).finally(function () {
        if (btn) btn.disabled = false;
      });
    });
  });
})();
