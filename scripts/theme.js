/* Dark is the default; the choice is remembered in localStorage. */
(function () {
  "use strict";
  var root = document.documentElement;
  var saved;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  root.setAttribute("data-theme", saved === "light" ? "light" : "dark");

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    function label() {
      btn.textContent = root.getAttribute("data-theme") === "dark" ? "Light" : "Dark";
    }
    label();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      label();
    });
  });
})();
