// Unit tests for the core logic. Run: npm test   (Node 18+, no dependencies)
const test = require("node:test");
const assert = require("node:assert/strict");
const BUILDINGS = require("../data/buildings.js");
const { searchBuildings, filterDirectory, hasDirectory, normalize } = require("../src/search.js");

const byId = (id) => BUILDINGS.find((b) => b.id === id);

// ---------- S1: search a building ----------
test("S1-AC1: '60th Anniversary' finds 60th Anniversary Hall", () => {
  const r = searchBuildings("60th Anniversary", BUILDINGS);
  assert.equal(r.status, "found");
  assert.equal(r.matches[0].id, "B60");
});

test("S1-AC1 (added): Korean name '60주년기념관' from the schedule finds the same building", () => {
  const r = searchBuildings("60주년기념관", BUILDINGS);
  assert.equal(r.status, "found");
  assert.equal(r.matches[0].id, "B60");
});

test("S1-AC1: case, spaces and hyphens do not matter", () => {
  for (const q of ["  60TH anniversary hall ", "60th-anniversary-hall", "hi tech center", "HITECH"]) {
    assert.equal(searchBuildings(q, BUILDINGS).status, "found", q);
  }
});

test("S1-AC1: every building is reachable by its English and Korean name", () => {
  for (const b of BUILDINGS) {
    assert.equal(searchBuildings(b.nameEn, BUILDINGS).matches[0].id, b.id, b.nameEn);
    assert.equal(searchBuildings(b.nameKo, BUILDINGS).matches[0].id, b.id, b.nameKo);
  }
});

test("S1-AC2: unrecognized code 'XYZ99' returns not-found", () => {
  const r = searchBuildings("XYZ99", BUILDINGS);
  assert.equal(r.status, "not-found");
  assert.equal(r.matches.length, 0);
});

test("S1: empty or whitespace query returns empty (no error shown)", () => {
  assert.equal(searchBuildings("", BUILDINGS).status, "empty");
  assert.equal(searchBuildings("   ", BUILDINGS).status, "empty");
});

test("S1: ambiguous query 'Building' returns a list to choose from", () => {
  const r = searchBuildings("Building", BUILDINGS);
  assert.equal(r.status, "multiple");
  assert.ok(r.matches.length >= 2);
});

// ---------- S2: floor directory ----------
test("S2-AC1: directory lists floors bottom-to-top, every room has an English name", () => {
  const floors = filterDirectory(byId("B60"), "");
  assert.deepEqual(floors.map((f) => f.floor), [1, 2, 3, 4]);
  for (const f of floors) for (const r of f.rooms) assert.match(r.nameEn, /[A-Za-z]/);
});

test("S2-AC2: filter '302' shows only room 302 on floor 3", () => {
  const floors = filterDirectory(byId("B60"), "302");
  assert.equal(floors.length, 1);
  assert.equal(floors[0].floor, 3);
  assert.deepEqual(floors[0].rooms.map((r) => r.number), ["302"]);
});

test("S2-AC2: filter with no match returns an empty list", () => {
  assert.deepEqual(filterDirectory(byId("B60"), "999"), []);
});

test("S2 rule: building without floor data has no directory", () => {
  assert.equal(hasDirectory(byId("LIB")), false);
  assert.deepEqual(filterDirectory(byId("LIB"), ""), []);
});

// ---------- data integrity ----------
test("Data: ids unique; every position is inside the Inha campus area", () => {
  const ids = new Set(BUILDINGS.map((b) => b.id));
  assert.equal(ids.size, BUILDINGS.length);
  for (const b of BUILDINGS) {
    assert.ok(["missing", "approximate", "map", "verified"].includes(b.coordStatus), `${b.id} coordStatus`);
    if (b.coordStatus === "missing") {
      assert.equal(b.lat, null, `${b.id} missing but has lat`);
      continue;
    }
    assert.ok(b.lat > 37.445 && b.lat < 37.456, `${b.id} lat ${b.lat}`);
    assert.ok(b.lng > 126.646 && b.lng < 126.662, `${b.id} lng ${b.lng}`);
  }
});

test("Data: the 24 numbered places of the official campus map are listed, numbers unique", () => {
  assert.equal(BUILDINGS.length, 24);
  const nums = BUILDINGS.map((b) => b.mapNo);
  assert.equal(new Set(nums).size, nums.length);
  for (const ko of ["본관 (1호관)", "60주년기념관", "하이테크센터", "정석학술정보관", "서호관", "로스쿨관", "학군단"]) {
    assert.ok(BUILDINGS.some((b) => b.nameKo === ko), ko);
  }
});

test("S1: wing codes from schedules find the building ('2남' -> Building #2, '5서' -> Building #5)", () => {
  for (const [q, id] of [["2남", "B2"], ["2북", "B2"], ["2호관", "B2"], ["5서", "B5"], ["5동", "B5"], ["Building #5", "B5"]]) {
    const r = searchBuildings(q, BUILDINGS);
    assert.equal(r.status, "found", q);
    assert.equal(r.matches[0].id, id, q);
  }
});

test("S1: official English map names work ('West Building' = 서호관, 'Student Center' = 학생회관)", () => {
  assert.equal(searchBuildings("West Building", BUILDINGS).matches[0].nameKo, "서호관");
  assert.equal(searchBuildings("Student Center", BUILDINGS).matches[0].id, "B7");
  assert.equal(searchBuildings("International Center", BUILDINGS).matches[0].id, "B7");
});

test("S2: real rooms from the campus map can be filtered ('502B' -> Global Education Center, 5F)", () => {
  const floors = filterDirectory(byId("DREAM"), "502B");
  assert.equal(floors.length, 1);
  assert.equal(floors[0].floor, 5);
  assert.equal(floors[0].rooms[0].nameEn, "Global Education Center");
});

test("S1: a building without a map position is still found by search", () => {
  // Use a copy with West Building's position removed, so the test does not depend on the data.
  const copy = BUILDINGS.map((b) => (b.id === "WEST" ? { ...b, lat: null, lng: null, coordStatus: "missing" } : b));
  const r = searchBuildings("West Building", copy);
  assert.equal(r.status, "found");
  assert.equal(r.matches[0].coordStatus, "missing");
});

test("Data: every building has a position, and no two are within 10 m (catches copy-paste mistakes)", () => {
  const rad = Math.PI / 180;
  const distanceMeters = (a, c) => { // haversine
    const h = Math.sin((c.lat - a.lat) * rad / 2) ** 2 +
      Math.cos(a.lat * rad) * Math.cos(c.lat * rad) * Math.sin((c.lng - a.lng) * rad / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
  };
  for (const b of BUILDINGS) assert.notEqual(b.coordStatus, "missing", `${b.id} has no position`);
  for (let i = 0; i < BUILDINGS.length; i++) {
    for (let j = i + 1; j < BUILDINGS.length; j++) {
      const a = BUILDINGS[i], c = BUILDINGS[j];
      const d = distanceMeters(a, c);
      assert.ok(d > 10, `${a.id} and ${c.id} are only ${d.toFixed(1)} m apart`);
    }
  }
});

test("Data: no two buildings share an alias (avoids wrong pins)", () => {
  const seen = new Map();
  for (const b of BUILDINGS) {
    for (const n of [b.nameEn, b.nameKo, ...b.aliases]) {
      const k = normalize(n);
      assert.ok(!seen.has(k) || seen.get(k) === b.id, `alias "${n}" used by ${seen.get(k)} and ${b.id}`);
      seen.set(k, b.id);
    }
  }
});
