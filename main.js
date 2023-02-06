import mygeodata from "./station.json";

const TGMap = document.getElementById("TGMap");
let pMap = null;
let infoWindow = null;
let markers = [
  { point: { lat: 24.783076, lng: 120.999146 }, content: "ABCDE" },
  { point: { lat: 24.283076, lng: 120.199146 }, content: `<input class="owen" type="text">` },
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

async function loadMarkers() {
  const imgUrl = "./marker.svg"; //標記點圖示來源

  for (let marker of markers) {
    const point = new window.TGOS.TGPoint(marker.point.lng, marker.point.lat);
    //設定標記點圖片及尺寸大小
    const markerImg = new window.TGOS.TGImage(
      imgUrl,
      new window.TGOS.TGSize(38, 33),
      new window.TGOS.TGPoint(0, 0),
      new window.TGOS.TGPoint(10, 33)
    );

    const pTGMarker = new window.TGOS.TGMarker(pMap, point, "", markerImg); //建立機關單位標記點

    window.TGOS.TGEvent.addListener(pTGMarker, "click", () => {
      openInfoWindow(point, marker.content);
    });
  }
}

async function initInfoWindow() {
  let infoWindowOptions = {
    maxWidth: 300,
    pixelOffset: new window.TGOS.TGSize(5, -30),
    zIndex: 99,
  };

  infoWindow = new window.TGOS.TGInfoWindow();
  infoWindow.setOptions(infoWindowOptions);
}

function openInfoWindow(point, content) {
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
  await loadMarkers();
  await initInfoWindow();
})();
