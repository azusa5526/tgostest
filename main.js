import mygeodata from "./station.json";

const TGMap = document.getElementById("TGMap");
let pMap = null;
let infoWindow = null;
const markers = [
  { point: { lat: 24.783076, lng: 120.999146 }, content: "ABCDE" },
  {
    point: { lat: 24.283076, lng: 120.199146 },
    content: `<input class="owen" type="text">`,
  },
];
const lines = [
  [
    { lat: 24.983076, lng: 120.999146 },
    { lat: 24.683076, lng: 120.199146 },
    { lat: 24.183076, lng: 120.399146 },
  ],
  [
    { lat: 24.183076, lng: 121.999146 },
    { lat: 24.583076, lng: 120.299146 },
    { lat: 24.283076, lng: 120.799146 },
  ],
];
const polygons = [
  [
    { lat: 23.983076, lng: 120.999146 },
    { lat: 23.683076, lng: 120.199146 },
    { lat: 23.183076, lng: 120.399146 },
    { lat: 23.283076, lng: 120.799146 },
  ],
  [
    { lat: 24.183076, lng: 122.999146 },
    { lat: 23.583076, lng: 122.299146 },
    { lat: 23.283076, lng: 122.799146 },
  ],
];

async function initTGMap() {
  await requireTGOSAPI();
  console.log(window.TGOS);
  const map = new window.TGOS.TGOnlineMap(
    TGMap,
    window.TGOS.TGCoordSys.EPSG3857,
    getMapOptions()
  );
  return map;
}

async function requireTGOSAPI() {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement("script");
      const src =
        "http://api.tgos.tw/TGOS_API/tgos?ver=2.5&AppID=x+JLVSx85Lk=&APIKey=in8W74q0ogpcfW/STwicK8D5QwCdddJf05/7nb+OtDh8R99YN3T0LurV4xato3TpL/fOfylvJ9Wv/khZEsXEWxsBmg+GEj4AuokiNXCh14Rei21U5GtJpIkO++Mq3AguFK/ISDEWn4hMzqgrkxNe1Q==";
      script.addEventListener("load", resolve);
      script.src = src;
      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });
}

function getMapOptions() {
  const mapOptions = {
    scaleControl: true,
    navigationControl: true,
    navigationControlOptions: {
      controlPosition: window.TGOS.TGControlPosition.TOP_LEFT,
      navigationControlStyle: window.TGOS.TGNavigationControlStyle.SMALL,
    },
    mapTypeControl: false,
  };

  return mapOptions;
}

function loadMarkers() {
  const imgUrl = "./marker.svg"; //標記點圖示來源

  const pTGMarkers = markers.map((marker) => {
    const tgosPoint = new window.TGOS.TGPoint(marker.point.lng, marker.point.lat);
    //設定標記點圖片及尺寸大小
    const markerImg = new window.TGOS.TGImage(
      imgUrl,
      new window.TGOS.TGSize(38, 33),
      new window.TGOS.TGPoint(0, 0),
      new window.TGOS.TGPoint(10, 33)
    );

    const pTGMarker = new window.TGOS.TGMarker(pMap, tgosPoint, "", markerImg); //建立機關單位標記點

    window.TGOS.TGEvent.addListener(pTGMarker, "click", (args) => {
      openInfoWindow(
        tgosPoint,
        marker.content,
        args.target instanceof TGOS.TGMarker
      );
    });

    return pTGMarker;
  });

  console.log("loadMarkers", pTGMarkers);
}

function loadPolylines() {
  const paths = lines.map((line) => {
    return line.map((point) => new window.TGOS.TGPoint(point.lng, point.lat));
  });

  const tgosLineStrings = paths.map(
    (lineString) => new window.TGOS.TGLineString(lineString)
  );

  const pTGLines = tgosLineStrings.map((tgosLineString) => {
    const pTGLine = new window.TGOS.TGLine(pMap, tgosLineString, {
      strokeWeight: 10,
    });

    window.TGOS.TGEvent.addListener(pTGLine, "click", (args) => {
      console.log("args", args);
      openInfoWindow(args.point, "LineString123");
    });

    return pTGLine;
  });

  console.log("loadPolylines", pTGLines);
}

function loadPolygons() {
  const paths = polygons.map((polygon) => {
    return polygon.map(
      (point) => new window.TGOS.TGPoint(point.lng, point.lat)
    );
  });

  const tgosLineStrings = paths.map(
    (lineString) => new window.TGOS.TGLineString(lineString)
  );

  const tgosLineRings = tgosLineStrings.map((tgosLineString) => [
    new window.TGOS.TGLinearRing(tgosLineString),
  ]);

  const tgosPolygons = tgosLineRings.map(
    (tgosLineRing) => new window.TGOS.TGPolygon(tgosLineRing)
  );

  const pTGFills = tgosPolygons.map((tgosPolygon) => {
    const pTGFill = new window.TGOS.TGFill(pMap, tgosPolygon, {
      strokeWeight: 10,
    });

    window.TGOS.TGEvent.addListener(pTGFill, "click", (args) => {
      console.log("args", args);
      openInfoWindow(args.point, "Polygon123");
    });

    return pTGFill;
  });

  console.log("loadPolygons", pTGFills);
}

function initInfoWindow() {
  let infoWindowOptions = {
    maxWidth: 300,
    zIndex: 99,
  };

  infoWindow = new window.TGOS.TGInfoWindow();
  infoWindow.setOptions(infoWindowOptions);
}

function openInfoWindow(point, content, offsetState) {
  if (offsetState)
    infoWindow.setOptions({ pixelOffset: new window.TGOS.TGSize(0, -32) });
  infoWindow.setPosition(point);
  infoWindow.setContent(content);
  infoWindow.open(pMap);
}

// async function loadGeoJson() {
//   const data = new TGOS.TGData({ map: pMap });
//   data.addGeoJson(mygeodata);
// }

(async () => {
  pMap = await initTGMap();
  // await loadGeoJson();
  loadMarkers();
  loadPolylines();
  loadPolygons();
  initInfoWindow();
})();
