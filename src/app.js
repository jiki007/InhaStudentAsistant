/* InhaAssist UI. Depends on window.INHA_BUILDINGS and window.InhaSearch. */
(function () {
  var BUILDINGS = window.INHA_BUILDINGS;
  var S = window.InhaSearch;
  var $ = function (id) { return document.getElementById(id); };

  var CAMPUS_CENTER = [37.4507, 126.6545];
  var current = null; // selected building
  function hasLocation(b) { return b && typeof b.lat === "number" && typeof b.lng === "number"; }
  var PLACED = BUILDINGS.filter(hasLocation); // buildings that can be drawn on the map
  // South-west and north-east corners around all placed buildings (start view).
  var CAMPUS_BOUNDS = PLACED.length ? [
    [Math.min.apply(null, PLACED.map(function (b) { return b.lat; })), Math.min.apply(null, PLACED.map(function (b) { return b.lng; }))],
    [Math.max.apply(null, PLACED.map(function (b) { return b.lat; })), Math.max.apply(null, PLACED.map(function (b) { return b.lng; }))]
  ] : null;
  // Short English label shown on the map, e.g. "2 · Building #2".
  function labelHtml(b) {
    return (b.mapNo ? '<b class="no">' + b.mapNo + "</b>" : "") +
      '<span class="nm">' + (b.mapNo ? " · " : "") + escapeHtml(b.shortEn || b.nameEn) + "</span>";
  }
  // Set once the search UI exists; called when a building is tapped on the map.
  var onMapSelect = function () {};

  // ---------- Map: Leaflet if available, otherwise a simple SVG fallback ----------
  var map = createMap();

  function createMap() {
    var el = $("map");
    if (window.L) {
      var m = L.map(el, { zoomControl: true }).setView(CAMPUS_CENTER, 16);

      // Base maps. Satellite is the default: it covers the campus in full detail, needs no
      // API key and shows no Korean text, so the app's English labels are the only names.
      // (Plain "no-label" maps tried earlier either needed a key or had no data for Korea.)
      var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19, attribution: "Tiles &copy; Esri"
      });
      var street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19, attribution: "&copy; OpenStreetMap contributors"
      });
      satellite.addTo(m);
      L.control.layers({
        "Satellite (English labels)": satellite,
        "Street map (Korean labels)": street
      }, null, { position: "topright" }).addTo(m);
      if (CAMPUS_BOUNDS) m.fitBounds(CAMPUS_BOUNDS, { padding: [12, 12] });

      // If a map service blocks us (e.g. OpenStreetMap answers 403 to pages opened
      // from file://), switch to the next base map instead of showing error tiles.
      var fallbacks = [satellite, street];
      fallbacks.forEach(function (layer, i) {
        var ok = 0, bad = 0;
        layer.on("tileload", function () { ok++; });
        layer.on("tileerror", function () {
          bad++;
          var next = fallbacks[i + 1];
          if (ok === 0 && bad >= 3 && next && m.hasLayer(layer)) {
            m.removeLayer(layer);
            next.addTo(m);
          }
        });
      });

      // English label + dot for every building; tapping one opens its card.
      var labels = {};
      PLACED.forEach(function (b) {
        var dot = L.circleMarker([b.lat, b.lng], {
          radius: 5, color: "#ffffff", weight: 2, fillColor: "#0b4ea2", fillOpacity: 1
        }).addTo(m);
        dot.bindTooltip(labelHtml(b), {
          permanent: true, direction: "top", offset: [0, -4], className: "bldg-label", interactive: true
        });
        dot.on("click", function () { onMapSelect(b); });
        labels[b.id] = dot;
      });
      // Zoomed out: numbers only (full names would overlap); far out: no labels.
      function toggleLabels() {
        var z = m.getZoom();
        el.classList.toggle("labels-off", z < 15);
        el.classList.toggle("labels-compact", z < 17);
        refreshLabels();
      }
      // A label is centred using its width when it opens; after CSS hides or shows
      // the name part, ask Leaflet to centre it again.
      function refreshLabels() {
        Object.keys(labels).forEach(function (id) {
          var t = labels[id].getTooltip && labels[id].getTooltip();
          if (t && t.update) t.update();
        });
      }
      m.on("zoomend", toggleLabels); toggleLabels();

      var NORMAL = { radius: 5, fillColor: "#0b4ea2" }, SELECTED = { radius: 9, fillColor: "#d92d20" };
      return {
        kind: "leaflet",
        pin: function (b) {
          // The selected building gets a bigger red dot and a highlighted label (no extra pin,
          // so its English label stays readable).
          Object.keys(labels).forEach(function (id) {
            var on = !!b && id === b.id;
            labels[id].setStyle(on ? SELECTED : NORMAL);
            if (on && labels[id].bringToFront) labels[id].bringToFront();
            var t = labels[id].getTooltip && labels[id].getTooltip();
            var tipEl = t && t.getElement && t.getElement();
            if (tipEl) tipEl.classList.toggle("selected", on);
          });
          refreshLabels();
          if (!hasLocation(b)) {
            if (CAMPUS_BOUNDS) m.fitBounds(CAMPUS_BOUNDS, { padding: [12, 12] }); else m.setView(CAMPUS_CENTER, 16);
            el.setAttribute("data-pinned", ""); return;
          }
          m.setView([b.lat, b.lng], 18);
          el.setAttribute("data-pinned", b.id);
        }
      };
    }

    // Fallback: plot every building relative to the campus bounding box.
    return {
      kind: "fallback",
      pin: function (b) {
        var ok = hasLocation(b);
        drawFallback(el, ok ? b : null);
        el.setAttribute("data-pinned", ok ? b.id : "");
      }
    };
  }

  function drawFallback(el, selected) {
    var lats = PLACED.map(function (b) { return b.lat; });
    var lngs = PLACED.map(function (b) { return b.lng; });
    var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
    var minLng = Math.min.apply(null, lngs), maxLng = Math.max.apply(null, lngs);
    var W = 400, H = 300, pad = 60;
    function x(lng) { return pad + (lng - minLng) / (maxLng - minLng || 1) * (W - 2 * pad); }
    function y(lat) { return H - pad - (lat - minLat) / (maxLat - minLat || 1) * (H - 2 * pad); }
    // draw the selected building last so its pin sits on top
    var order = PLACED.filter(function (b) { return !(selected && b.id === selected.id); });
    if (selected && hasLocation(selected)) order.push(selected);
    var dots = order.map(function (b) {
      var sel = selected && b.id === selected.id;
      // With many buildings, only the selected one gets a label so text does not overlap.
      if (!sel && PLACED.length > 8) {
        return '<circle data-building="' + b.id + '" cx="' + x(b.lng) + '" cy="' + y(b.lat) +
          '" r="5" fill="#8a97a8" stroke="#fff" stroke-width="2"/>';
      }
      return '<g data-building="' + b.id + '"' + (sel ? ' data-selected="true"' : "") + ">" +
        '<circle cx="' + x(b.lng) + '" cy="' + y(b.lat) + '" r="' + (sel ? 11 : 6) + '" fill="' +
        (sel ? "#d92d20" : "#8a97a8") + '" stroke="#fff" stroke-width="2"/>' +
        '<text x="' + x(b.lng) + '" y="' + (y(b.lat) - (sel ? 16 : 11)) + '" text-anchor="middle" font-size="' +
        (sel ? 13 : 11) + '" font-weight="' + (sel ? 700 : 400) + '" fill="#1b2430">' +
        escapeHtml(b.nameEn) + "</text></g>";
    }).join("");
    el.innerHTML = '<svg class="fallback-map" viewBox="0 0 ' + W + " " + H +
      '" role="img" aria-label="Offline campus sketch">' +
      '<rect width="' + W + '" height="' + H + '" fill="#e8edf2"/>' + dots +
      '<text x="8" y="' + (H - 8) + '" font-size="10" fill="#5b6676">Offline sketch — map tiles unavailable</text></svg>';
  }

  // ---------- S1: search ----------
  $("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = $("search-input").value;
    var result = S.searchBuildings(q, BUILDINGS);
    clearChoices();

    if (result.status === "empty") {
      showMessage("Type a building name or code.", false);
    } else if (result.status === "not-found") {
      showMessage("Unrecognized building code: “" + q.trim() + "”", true);
      hideBuilding();
    } else if (result.status === "multiple") {
      showMessage(result.matches.length + " buildings match. Choose one:", false);
      showChoices(result.matches);
    } else {
      selectBuilding(result.matches[0]);
    }
  });

  function selectBuilding(b) {
    current = b;
    clearChoices();
    showMessage(hasLocation(b)
      ? "Showing " + b.nameEn + " on the map."
      : "Found " + b.nameEn + ", but its map position has not been added yet.", false);
    map.pin(b);
    $("building-card").hidden = false;
    $("building-name").textContent = b.nameEn;
    $("building-ko").textContent = b.nameKo;
    $("building-houses").textContent = b.houses || "";
    $("coord-note").textContent = {
      missing: "Map position not added yet.",
      approximate: "Pin position is approximate (not yet checked on campus).",
      map: "Pin placed from map imagery (not yet checked on campus).",
      verified: ""
    }[b.coordStatus] || "";

    // M2 open rule, decided: show a DISABLED button with a reason rather than hiding it,
    // so the user knows the feature exists but data is missing for this building.
    var btn = $("view-directory");
    if (S.hasDirectory(b)) {
      btn.disabled = false;
      btn.textContent = "View Directory";
    } else {
      btn.disabled = true;
      btn.textContent = "Data unavailable for this building";
    }
    $("directory").hidden = true;
  }

  onMapSelect = function (b) { $("search-input").value = b.nameEn; selectBuilding(b); };

  function hideBuilding() {
    current = null;
    $("building-card").hidden = true;
    $("directory").hidden = true;
  }

  // ---------- S2: floor directory ----------
  $("view-directory").addEventListener("click", function () {
    if (!current || !S.hasDirectory(current)) return;
    $("directory").hidden = false;
    $("room-filter").value = "";
    $("data-badge").textContent = { sample: "Sample data", partial: "Partial list" }[current.dataStatus] || "";
    renderDirectory();
    $("directory").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("room-filter").addEventListener("input", renderDirectory);

  function renderDirectory() {
    var q = $("room-filter").value;
    var floors = S.filterDirectory(current, q);
    var list = $("floor-list");
    list.innerHTML = floors.map(function (f) {
      return '<li data-floor="' + f.floor + '"><h3>Floor ' + f.floor + "</h3><ul>" +
        f.rooms.map(function (r) {
          return '<li data-room="' + escapeHtml(r.number) + '"><span class="room-no">' +
            escapeHtml(r.number) + "</span><span>" + escapeHtml(r.nameEn) +
            ' <span class="room-ko">' + escapeHtml(r.nameKo) + "</span></span></li>";
        }).join("") + "</ul></li>";
    }).join("");
    var empty = $("dir-empty");
    empty.hidden = floors.length > 0;
    empty.textContent = floors.length ? "" : "No room matches “" + q.trim() + "” in this building.";
  }

  // ---------- helpers ----------
  function showMessage(text, isError) {
    var m = $("message");
    m.textContent = text;
    m.className = "message" + (isError ? " error" : "");
  }
  function showChoices(list) {
    var ul = $("choices");
    ul.hidden = false;
    ul.innerHTML = "";
    list.forEach(function (b) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = b.nameEn + " · " + b.nameKo;
      btn.addEventListener("click", function () { selectBuilding(b); });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }
  function clearChoices() { var ul = $("choices"); ul.hidden = true; ul.innerHTML = ""; }

  // All user-visible text goes through textContent or this escape (XSS check, Section 6).
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Initial state: show the campus with no pin selected.
  if (map.kind === "fallback") drawFallback($("map"), null);
  window.__inhaMapKind = map.kind; // read by e2e tests
})();
