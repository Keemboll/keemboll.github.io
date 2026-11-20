/* Draws the relationship lines of the project schema.
   Without JavaScript the cards still work; only the connectors are missing. */
(function () {
  "use strict";

  var schema = document.querySelector(".schema");
  var svg = schema && schema.querySelector(".links");
  if (!schema || !svg) return;

  var NS = "http://www.w3.org/2000/svg";
  var fact = schema.querySelector(".t-fact");
  var targets = Array.prototype.slice.call(schema.querySelectorAll("[data-link]"));
  var links = [];

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function build() {
    targets.forEach(function (card, i) {
      var group = el("g", { style: "--i:" + i });
      var edge = el("path", { class: "edge", pathLength: "1" });
      var foot = el("path", { class: "foot" });
      var node = el("circle", { class: "node", r: "4.5" });
      group.appendChild(edge);
      group.appendChild(foot);
      group.appendChild(node);
      svg.appendChild(group);
      links.push({ card: card, edge: edge, foot: foot, node: node });

      function on() {
        [edge, foot, node].forEach(function (n) { n.classList.add("is-active"); });
      }
      function off() {
        [edge, foot, node].forEach(function (n) { n.classList.remove("is-active"); });
      }
      card.addEventListener("mouseenter", on);
      card.addEventListener("mouseleave", off);
      card.addEventListener("focusin", on);
      card.addEventListener("focusout", off);
    });
  }

  function rel(node, origin) {
    var r = node.getBoundingClientRect();
    return {
      left: r.left - origin.left,
      right: r.right - origin.left,
      top: r.top - origin.top,
      bottom: r.bottom - origin.top,
      cx: (r.left + r.right) / 2 - origin.left,
      cy: (r.top + r.bottom) / 2 - origin.top
    };
  }

  var FOOT = 16;
  var SPREAD = 8;

  function update() {
    if (getComputedStyle(svg).display === "none") return;
    var origin = schema.getBoundingClientRect();
    svg.setAttribute("viewBox", "0 0 " + origin.width + " " + origin.height);
    var f = rel(fact, origin);

    links.forEach(function (l) {
      var t = rel(l.card, origin);
      var d, foot, sx, sy;

      if (t.top > f.bottom) {
        // below: straight vertical line
        sx = f.cx; sy = f.bottom;
        var ey = t.top;
        d = "M" + sx + " " + sy + "V" + (ey - FOOT);
        foot = "M" + t.cx + " " + (ey - FOOT) +
          "L" + (t.cx - SPREAD) + " " + ey +
          "M" + t.cx + " " + (ey - FOOT) + "L" + t.cx + " " + ey +
          "M" + t.cx + " " + (ey - FOOT) + "L" + (t.cx + SPREAD) + " " + ey;
        // keep the line straight even if centres differ slightly
        d = "M" + t.cx + " " + sy + "V" + (ey - FOOT);
        sx = t.cx;
      } else {
        var leftSide = t.cx < f.cx;
        sx = leftSide ? f.left : f.right;
        sy = f.cy;
        var ex = leftSide ? t.right : t.left;
        var ey2 = t.cy;
        var dir = leftSide ? -1 : 1;
        var bx = ex - dir * FOOT;
        var mid = (sx + bx) / 2;
        d = Math.abs(sy - ey2) < 1
          ? "M" + sx + " " + sy + "H" + bx
          : "M" + sx + " " + sy + "H" + mid + "V" + ey2 + "H" + bx;
        foot = "M" + bx + " " + ey2 +
          "L" + ex + " " + (ey2 - SPREAD) +
          "M" + bx + " " + ey2 + "L" + ex + " " + ey2 +
          "M" + bx + " " + ey2 + "L" + ex + " " + (ey2 + SPREAD);
      }

      l.edge.setAttribute("d", d);
      l.foot.setAttribute("d", foot);
      l.node.setAttribute("cx", sx);
      l.node.setAttribute("cy", sy);
    });
  }

  build();

  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(function () {
    update();
    svg.classList.add("draw");
    if (window.ResizeObserver) {
      new ResizeObserver(update).observe(schema);
    } else {
      window.addEventListener("resize", update);
    }
  });
})();
