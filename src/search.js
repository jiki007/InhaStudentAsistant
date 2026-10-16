/*
 * InhaAssist core logic (no DOM). Shared by the browser UI and the Node tests.
 *
 *   searchBuildings(query, buildings) -> { status, matches }
 *     status: "found" | "multiple" | "not-found" | "empty"
 *   filterDirectory(building, query)  -> floors[] containing only matching rooms
 *   hasDirectory(building)            -> boolean (floor data available?)
 */
(function (root) {
  // Lowercase, Unicode-normalise, drop spaces and punctuation so that
  // "60th Anniversary Hall", "60th-anniversary hall" and "60thanniversaryhall"
  // all compare equal. Korean characters are kept.
  function normalize(text) {
    return String(text == null ? "" : text)
      .normalize("NFC")
      .toLowerCase()
      .replace(/[\s\-_.,()'"/]+/g, "");
  }

  function namesOf(b) {
    return [b.id, b.nameEn, b.nameKo].concat(b.aliases || []);
  }

  // Score how well a query matches one building: 3 exact, 2 prefix, 1 contains.
  function score(building, q) {
    var best = 0;
    namesOf(building).forEach(function (name) {
      var n = normalize(name);
      if (!n) return;
      if (n === q) best = Math.max(best, 3);
      else if (n.indexOf(q) === 0) best = Math.max(best, 2);
      else if (q.length >= 2 && n.indexOf(q) !== -1) best = Math.max(best, 1);
    });
    return best;
  }

  function searchBuildings(query, buildings) {
    var q = normalize(query);
    if (!q) return { status: "empty", matches: [] };

    var scored = buildings
      .map(function (b) { return { b: b, s: score(b, q) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, z) { return z.s - a.s; });

    if (scored.length === 0) return { status: "not-found", matches: [] };

    // One clear winner (only match, or the only exact match) -> pin it.
    var top = scored[0].s;
    var tied = scored.filter(function (x) { return x.s === top; });
    if (scored.length === 1 || (top === 3 && tied.length === 1)) {
      return { status: "found", matches: [scored[0].b] };
    }
    return { status: "multiple", matches: scored.map(function (x) { return x.b; }) };
  }

  function hasDirectory(building) {
    return !!(building && building.floors && building.floors.length > 0);
  }

  // Keep floor order; within each floor keep rooms whose number starts with the
  // query, or whose English/Korean name contains it. Floors with no match are
  // removed. An empty query returns the full directory.
  function filterDirectory(building, query) {
    if (!hasDirectory(building)) return [];
    var q = normalize(query);
    return building.floors
      .map(function (f) {
        var rooms = f.rooms.filter(function (r) {
          if (!q) return true;
          return normalize(r.number).indexOf(q) === 0 ||
                 normalize(r.nameEn).indexOf(q) !== -1 ||
                 normalize(r.nameKo).indexOf(q) !== -1;
        });
        return { floor: f.floor, rooms: rooms };
      })
      .filter(function (f) { return f.rooms.length > 0; })
      .sort(function (a, z) { return a.floor - z.floor; });
  }

  var api = {
    normalize: normalize,
    searchBuildings: searchBuildings,
    filterDirectory: filterDirectory,
    hasDirectory: hasDirectory
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.InhaSearch = api;
  }
})(this);
