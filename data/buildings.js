/*
 * InhaAssist building data — Yonghyeon (main) campus, 인천 미추홀구 인하로 100.
 *
 * Names and numbers follow the official Inha campus maps (English and Korean
 * versions; "mapNo" = the number printed on the building). English names are the
 * ones printed on the English campus map (nameEnSource: "campus-map").
 * Building 2 and Building 5 are one record each; the wing codes used on schedules
 * (2동/2남/2북, 5동/5서/5남/5북) are aliases.
 *
 * coordStatus — how much to trust lat/lng:
 *   "missing"     no position yet (no pin is shown)
 *   "approximate" placed by hand for the first spike, NOT accurate
 *   "map"         from Google Maps Plus Codes collected by the team (2026-10-16),
 *                 accurate to ~3 m (11-character codes) or ~14 m (10-character codes)
 *   "verified"    checked on campus with a phone
 *
 * dataStatus — room lists:
 *   "sample"        made-up rooms for testing S2
 *   "partial"       real rooms copied from the official campus map, list incomplete
 *   "no-floor-data" no rooms yet ("Data unavailable for this building")
 *
 * Loaded as a classic script so index.html works from file://. In Node (tests)
 * it is exported with module.exports.
 */
(function (root) {
  function b(mapNo, id, nameEn, nameKo, aliases, houses, extra) {
    var rec = {
      mapNo: mapNo, id: id, nameEn: nameEn, nameKo: nameKo, aliases: aliases, houses: houses,
      nameEnSource: "campus-map",
      lat: null, lng: null, coordStatus: "missing",
      dataStatus: "no-floor-data", floors: []
    };
    for (var k in extra) rec[k] = extra[k];
    return rec;
  }

  var BUILDINGS = [
    b(1, "MAIN", "University Main Building", "본관 (1호관)",
      ["Main Building", "Building 1", "Building #1", "Bldg 1", "본관", "1호관"],
      "University headquarters, Fashion Design & Textiles; Hana Hall, auditoriums; museum (B1)",
      { lat: 37.449287, lng: 126.654234, coordStatus: "map", coordSource: "Google Maps Plus Code CMX3+PM9", shortEn: "Main Building",
        dataStatus: "sample",
        floors: [
          { floor: 2, rooms: [{ number: "204", nameEn: "Lecture Room", nameKo: "강의실" }] }
        ] }),

    b(2, "B2", "Building #2", "2호관",
      ["Building 2", "Bldg 2", "2동", "2남", "2북", "2호관 동관", "2호관 남관", "2호관 북관"],
      "College of Engineering (wings 2동, 2남, 2북)",
      { lat: 37.450313, lng: 126.655687, coordStatus: "map", coordSource: "Google Maps Plus Code FM24+47",
        dataStatus: "sample", floors: [
          { floor: 1, rooms: [{ number: "112", nameEn: "Lecture Room", nameKo: "강의실" }] },
          { floor: 5, rooms: [{ number: "502", nameEn: "Professor Office", nameKo: "교수 연구실" }] }
        ] }),

    b(3, "B60", "60th Anniversary Hall", "60주년기념관",
      ["60th Anniversary Building", "60th Anniversary", "60주년", "60th", "60주년 기념관"],
      "College of Medicine, College of Software Convergence, Frontier College; PC labs",
      { lat: 37.450662, lng: 126.653953, coordStatus: "map", coordSource: "Google Maps Plus Code FM23+7H8", shortEn: "60th Anniversary Hall",
        dataStatus: "sample",
        floors: [
          { floor: 1, rooms: [
            { number: "101", nameEn: "Lecture Room", nameKo: "강의실" },
            { number: "105", nameEn: "Student Lounge", nameKo: "학생 라운지" } ] },
          { floor: 2, rooms: [
            { number: "201", nameEn: "Lecture Room", nameKo: "강의실" },
            { number: "210", nameEn: "Computer Lab", nameKo: "컴퓨터실" } ] },
          { floor: 3, rooms: [
            { number: "302", nameEn: "Lecture Room", nameKo: "강의실" },
            { number: "311", nameEn: "Seminar Room", nameKo: "세미나실" } ] },
          { floor: 4, rooms: [
            { number: "402", nameEn: "Professor Office", nameKo: "교수 연구실" },
            { number: "405", nameEn: "Department Office", nameKo: "학과 사무실" } ] }
        ] }),

    b(4, "B4", "Building #4", "4호관",
      ["Building 4", "Bldg 4", "4호관", "보미관", "Bomi Hall"],
      "AI Convergence Research Center, Geoinformatic Engineering, Biological Engineering labs",
      { lat: 37.450387, lng: 126.654922, coordStatus: "map", coordSource: "Google Maps Plus Code FM23+5X3" }),
    b(5, "B5", "Building #5", "5호관",
      ["Building 5", "Bldg 5", "5동", "5서", "5남", "5북", "5호관 동관", "5호관 서관", "5호관 남관", "5호관 북관"],
      "Colleges of Humanities, Natural Sciences, Arts & Sports, Nursing (wings 5동, 5서, 5남, 5북)",
      { lat: 37.450837, lng: 126.654203, coordStatus: "map", coordSource: "Google Maps Plus Code FM23+8MP" }),
    b(6, "B6", "Building #6", "6호관", ["Building 6", "Bldg 6"],
      "College of Business Administration offices; cafe, convenience store",
      { lat: 37.448312, lng: 126.655734, coordStatus: "map", coordSource: "Google Maps Plus Code CMX4+87H" }),
    b(7, "B7", "Student Center", "학생회관 (7호관)",
      ["Student Union", "Building 7", "Bldg 7", "7호관", "학생회관", "비룡플라자", "Biryong Plaza", "비플",
       "International Center", "International Student Services Office"],
      "International Center (3F) and International Student Services Office (5F); health center, cafeteria, shops",
      { lat: 37.449562, lng: 126.656328, coordStatus: "map", coordSource: "Google Maps Plus Code CMX4+RGG",
        dataStatus: "partial", floors: [
          { floor: 3, rooms: [{ number: "313", nameEn: "International Center", nameKo: "국제센터" }] },
          { floor: 5, rooms: [{ number: "505", nameEn: "International Student Services Office", nameKo: "외국인 유학생 지원실" }] }
        ] }),

    b(8, "LIB", "Jungseok Memorial Library", "정석학술정보관",
      ["Library", "Jungseok Library", "Central Library", "도서관", "정석", "중앙도서관"],
      "Central library, reading rooms, multimedia center",
      { lat: 37.449437, lng: 126.652563, coordStatus: "map", coordSource: "Google Maps Plus Code CMX3+Q2", shortEn: "Library" }),
    b(9, "B9", "Building #9", "9호관", ["Building 9", "Bldg 9"],
      "College of Social Sciences, Asia-Pacific School of Logistics, graduate school offices",
      { lat: 37.447562, lng: 126.655438, coordStatus: "map", coordSource: "Google Maps Plus Code CMX4+25" }),
    b(10, "WEST", "West Building", "서호관", ["Seoho Hall", "Seoho", "서호"],
      "College of Education offices, Design Convergence",
      { lat: 37.451238, lng: 126.651453, coordStatus: "map", coordSource: "Google Maps Plus Code FM22+FHW" }),
    b(11, "CLUB", "Student Club Hall", "나빌레관", ["Club Hall", "Nabile Hall", "Navile Hall", "나빌레"],
      "Student club rooms",
      { lat: 37.451363, lng: 126.650578, coordStatus: "map", coordSource: "Google Maps Plus Code FM22+G6W" }),
    b(12, "HT", "Inha Hi-Tech Center", "하이테크센터",
      ["Hi-Tech Center", "Hitech Center", "Hi Tech", "Hitech", "하이테크"],
      "College of IT Engineering (Electronic, Electrical, Computer, Information & Communication Eng.)",
      { lat: 37.450637, lng: 126.657672, coordStatus: "map", coordSource: "Google Maps Plus Code FM25+733", shortEn: "Hi-Tech Center",
        dataStatus: "sample",
        floors: [
          { floor: 1, rooms: [{ number: "101", nameEn: "Auditorium", nameKo: "강당" }] },
          { floor: 2, rooms: [
            { number: "232", nameEn: "Lecture Room", nameKo: "강의실" },
            { number: "236", nameEn: "Computer Lab", nameKo: "컴퓨터실" } ] },
          { floor: 3, rooms: [{ number: "302", nameEn: "Seminar Room", nameKo: "세미나실" }] }
        ] }),

    b(13, "LAW", "Law School", "로스쿨관", ["Law School Building", "로스쿨", "법학전문대학원"],
      "Law School offices and law library",
      { lat: 37.448312, lng: 126.651938, coordStatus: "map", coordSource: "Google Maps Plus Code CMX2+8Q" }),
    b(14, "ROTC", "R.O.T.C. Building", "학군단", ["ROTC", "ROTC Building"],
      "ROTC unit; stairs beside it lead to the Inha Univ. Station side gate",
      { lat: 37.449187, lng: 126.650828, coordStatus: "map", coordSource: "Google Maps Plus Code CMX2+M8G" }),
    b(15, "CCE", "Center for Continuing Education", "평생교육관",
      ["Continuing Education", "Lifelong Education Center", "평생교육관", "미래융합대학", "SGCS", "SGCS Office"],
      "SGCS office (2F, room 221); College of Future Convergence",
      { lat: 37.447412, lng: 126.654109, coordStatus: "map", coordSource: "Google Maps Plus Code CMW3+XJ9", shortEn: "Continuing Education",
        dataStatus: "partial", floors: [
          { floor: 2, rooms: [{ number: "221", nameEn: "SGCS Office", nameKo: "SGCS 사무실" }] }
        ] }),

    b(16, "DREAM", "Kim Hyun Tae Inha Dream Center", "김현태 인하드림센터",
      ["Inha Dream Center", "Dream Center", "인하드림센터", "드림센터", "Global Education Center"],
      "Global Education Center (5F, room 502B)",
      { lat: 37.448812, lng: 126.656188, coordStatus: "map", coordSource: "Google Maps Plus Code CMX4+GF", shortEn: "Dream Center",
        dataStatus: "partial", floors: [
          { floor: 5, rooms: [{ number: "502B", nameEn: "Global Education Center", nameKo: "글로벌교육센터" }] }
        ] }),

    b(17, "GYM", "Gymnasium", "체육관 (하와이교포기념관)",
      ["Gym", "Hawaii Memorial Hall", "체육관", "하와이교포기념관"],
      "Indoor sports hall",
      { lat: 37.448537, lng: 126.655828, coordStatus: "map", coordSource: "Google Maps Plus Code CMX4+C88" }),
    b(19, "FIELD", "Sports Field", "대운동장", ["Main Sports Field", "Playground", "Stadium", "운동장"],
      "Outdoor field and running track",
      { lat: 37.449937, lng: 126.651188, coordStatus: "map", coordSource: "Google Maps Plus Code CMX2+XF" }),
    b(20, "BBALL", "Basketball Field", "농구장", ["Basketball Court", "Basketball"], "Outdoor courts",
      { lat: 37.449937, lng: 126.653437, coordStatus: "map", coordSource: "Google Maps Plus Code CMX3+X9" }),
    b(21, "TENNIS", "Tennis Courts", "테니스장", ["Tennis Court", "Tennis"], "Outdoor courts",
      { lat: 37.448687, lng: 126.651188, coordStatus: "map", coordSource: "Google Maps Plus Code CMX2+FF" }),
    b(22, "BANK", "Hana Bank & GS25", "하나은행 · GS25",
      ["Hana Bank", "GS25", "Bank", "ATM", "Convenience Store", "하나은행", "편의점"],
      "Bank branch and convenience store next to the Student Center",
      { lat: 37.449262, lng: 126.656359, coordStatus: "map", coordSource: "Google Maps Plus Code CMX4+PG5", shortEn: "Hana Bank · GS25" }),
    b(23, "PARK", "Parking Lot", "비룡주차장", ["Biryong Parking Lot", "Parking", "주차장"], "Car park",
      { lat: 37.450187, lng: 126.650516, coordStatus: "map", coordSource: "Google Maps Plus Code FM22+36C" }),
    b(24, "DORM1", "1st Dormitory", "웅비재 (제1생활관)",
      ["Dormitory 1", "Dorm 1", "First Dormitory", "Woongbi-jae", "Woongbijae", "웅비재", "제1생활관", "제1기숙사"],
      "Student dormitory",
      { lat: 37.446887, lng: 126.654141, coordStatus: "map", coordSource: "Google Maps Plus Code CMW3+QM2" }),
    b(25, "DORM23", "2nd / 3rd Dormitory", "비룡재 (제2·3생활관)",
      ["Dormitory 2", "Dormitory 3", "Dorm 2", "Dorm 3", "2nd Dormitory", "3rd Dormitory", "Biryong-jae",
       "Biryongjae", "비룡재", "제2생활관", "제3생활관"],
      "Student dormitories",
      { lat: 37.447687, lng: 126.659437, coordStatus: "map", coordSource: "Google Maps Plus Code CMX5+3Q", shortEn: "2nd/3rd Dormitory" })
  ];

  if (typeof module !== "undefined" && module.exports) {
    module.exports = BUILDINGS;
  } else {
    root.INHA_BUILDINGS = BUILDINGS;
  }
})(this);
