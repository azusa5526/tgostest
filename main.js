import mygeodata from "./station.json";

const TGMap = document.getElementById("TGMap");
let pMap = null;
let infoWindow = null;
let tgosData = null;

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

async function loadGeoJson() {
  tgosData = new TGOS.TGData({ map: pMap });
  tgosData.addGeoJson(mygeodata);
}

function processData() {
  tgosData.graphics.forEach((graphic) => {
    const graphicType = graphic.geometry.type;
    const processer = new Map([
      ["TGPoint", pointProcesser],
      ["TGPolygon", polygonProcesser],
    ]);

    const suitableProcesser = processer.get(graphicType);
    suitableProcesser
      ? suitableProcesser(graphic)
      : console.error(`Can not process graphic type: ${graphicType}`);
  });
}

function pointProcesser(graphic) {
  const imgUrl = "./marker.svg";
  const markerImg = new window.TGOS.TGImage(
    imgUrl,
    new window.TGOS.TGSize(38, 33),
    new window.TGOS.TGPoint(0, 0),
    new window.TGOS.TGPoint(16, 33)
  );

  graphic.gs_[0].setIcon(markerImg);

  window.TGOS.TGEvent.addListener(graphic.gs_[0], "click", () => {
    openInfoWindow(graphic.geometry, graphic.properties.Name, true);
  });
}

function polygonProcesser(graphic) {
  graphic.gs_[0].setStrokeWeight(10);

  window.TGOS.TGEvent.addListener(graphic.gs_[0], "click", (args) => {
    openInfoWindow(args.point, graphic.properties.Name, true);
  });
}

(async () => {
  pMap = await initTGMap();
  await loadGeoJson();
  processData();
  initInfoWindow();
})();
