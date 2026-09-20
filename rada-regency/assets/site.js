/* Rada Regency — site.js (page-specific behaviour; base behaviour lives in app.js) */
(function () {
  "use strict";

  /* ---- Units filter (units.html) ---- */
  var list = document.querySelector("[data-units]");
  if (list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll(".unit"));
    var state = { mode: "all", type: "all" };
    var out = document.querySelector("[data-count-out]");
    var empty = document.querySelector(".empty-note");
    var apply = function () {
      var n = 0;
      cards.forEach(function (c) {
        var ok = (state.mode === "all" || c.getAttribute("data-mode") === state.mode) &&
                 (state.type === "all" || c.getAttribute("data-type") === state.type);
        c.hidden = !ok;
        if (ok) n++;
      });
      if (out) out.textContent = "Showing " + n + " of " + cards.length + " sample listings";
      if (empty) empty.setAttribute("data-show", n === 0 ? "true" : "false");
    };
    document.querySelectorAll("[data-filter]").forEach(function (group) {
      var key = group.getAttribute("data-filter");
      group.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-value]");
        if (!b) return;
        state[key] = b.getAttribute("data-value");
        group.querySelectorAll("button").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        apply();
      });
    });
    apply();
  }

  /* ---- Tower explorer (the-building.html) ---- */
  var tower = document.querySelector("[data-tower]");
  if (tower) {
    var bands = Array.prototype.slice.call(tower.querySelectorAll("[data-zone]"));
    var zones = Array.prototype.slice.call(document.querySelectorAll(".zone"));
    var show = function (id) {
      bands.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-zone") === id ? "true" : "false");
      });
      zones.forEach(function (z) { z.hidden = z.id !== "zone-" + id; });
    };
    bands.forEach(function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-zone")); });
    });
    show("residential");
  }

  /* ---- Contact form prefill from ?type=&ref= ---- */
  var form = document.querySelector("form[data-prefill]");
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var map = {
      "tenant": "Renting a unit",
      "buyer": "Buying a unit",
      "owner-rent": "Owner: I want to rent out my unit",
      "owner-sell": "Owner: I want to sell my unit",
      "admin": "Building admin matter"
    };
    var sel = form.querySelector('select[name="type"]');
    var t = params.get("type");
    if (sel && t && map[t]) sel.value = map[t];
    var ref = params.get("ref");
    var msg = form.querySelector('textarea[name="message"]');
    if (msg && ref && !msg.value) msg.value = "I'm interested in: " + ref + ".";
  }
})();
