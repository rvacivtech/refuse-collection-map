function refuseCollectionScheduleMap(){
  
  var jsonURL = "https://data.richmondgov.com/api/geospatial/tnpy-mt5v?method=export&format=GeoJSON";
  var ajaxResponseJSON;
  var map;
  var dayColor;
  var divWrap = document.createElement("div");
  divWrap.setAttribute("id", "leaflet-legend-modal-wrap");
  var div;
  var legendWrap;
  var geojsonLayer;
  var modalTruckType;
  var modalRouteName;
  var modalDay;
  var modalPickups;
  var modalList;
  var modalWrap = document.createElement("div");
  var modalParent;
  var bxx = document.getElementsByClassName("leaflet-right");
  var styleCityBoundary = {
      color: "#222",
      weight: 3.25,
      opacity: 1,
      fillOpacity: 0.15,
      fillColor: "#000"
  };
  var styleHighlight = {
    weight: 4,
    color: "#ff0",
    dashArray: "",
    fillOpacity: 0.7,
    fillColor: "#fff"
  };
  
  function leafletMapInit(){
    map = L.map("map", {
      "center": [37.533333, -77.466667],
      "zoom": 12
    })
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      "attribution": "Map data &copy; OpenStreetMap contributors"
    }).addTo(map);
  };
  leafletMapInit();
  
  function addDataBoundary(data, map) {
    var geoJsonLayer = L.geoJson(data, {
      style:styleCityBoundary
    }).addTo(map);
  }
  addDataBoundary(cityBoundary, map);
  
  function getColor(day) { // base polygon color off day value
    return day === "Monday" ? "#800026" :
      day === "Tuesday"  ? "#e31a1c" :
      day === "Wednesday"   ? "#fd8d3c" :
      day === "Thursday"   ? "fed976" :
        "#ffeda0";
  }
  function geoJSONLayers(jsonDataParsed){
    for(var i = 0; i < jsonDataParsed.length; i++){
    	let day = jsonDataParsed[i].properties.day;
    	let trucktype = jsonDataParsed[i].properties.trucktype;
    	let routename = jsonDataParsed[i].properties.routename;
    	let pickups = jsonDataParsed[i].properties.pickups;
  
      getColor(day);
    }
  };
  
  function style(feature) {
    return {
      weight: 2,
      opacity: 1,
      color: "#fff",
      dashArray: "3",
      fillOpacity: 0.7,
      fillColor: getColor(feature.properties.day)
    };
  }
  
  function makeWrap() {
    if(legendWrap){
      content.log("leaflet-legend-modal exists!");
      legendWrap.appendChild(modalWrap);
    } else {
      // console.log("leaflet-legend-modal does NOT exist!");
    }
  }
  makeWrap();
  
  function mapLegend(){
    legendWrap = document.createElement("div");
    legendWrap.setAttribute("id", "leaflet-legend-modal");
    grades = ["Monday", "Tuesday", "Wednesday", "Thursday"],
      // colorLabels = ["#800026","#e31a1c","#fd8d3c","#fed976","#ffeda0"],
      colorLabels = ["#800026","#e31a1c","#fd8d3c","#fed976"],
      labels = [];
      for (var i = 0; i < grades.length; i++) {
        labels.push("<li><i style=\"background:" + colorLabels[i] + "\"></i> <strong>" +grades[i]+ "</strong></li>");
      }
      var lwList = "<ul class=\"xoxo ul-legend\">";
      // legendWrap.innerHTML = labels.join("<br />");
      lwList += labels.join("");
      lwList += "</ul>";
      legendWrap.innerHTML += lwList;
      legendWrap.innerHTML += "<div id='xyz'></div>";
      bxx[0].appendChild(legendWrap);
  }
  mapLegend();
  
  function layerModalInfo(array){
    //legendWrap.appendChild(divWrap);
    modalList = "";
    modalList += "<ul class=\"xoxo polygon-hover\"><li><strong>Day</strong>: <span class=\"block\">" +array.day+ "</span></li>";
    modalList += "<li><strong>Pickups</strong>: <span class=\"block\">" +array.pickups+ "</span></li>";
    modalList += "<li><strong>Route Name</strong>: <span class=\"block\">" +array.routename+ "</span></li>";
    modalList += "<li><strong>Truck Type</strong>: <span class=\"block\">" +array.trucktype+ "</span></li></ul>";
    
    // console.log(Object.getOwnPropertyNames(modalParent));
    modalParent = document.getElementById("xyz");
    if(modalParent) {
      modalParent.innerHTML = "";
      modalParent.innerHTML = modalList;
    }
  }
  
  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle(styleHighlight);
    
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
     layer.bringToFront();
    }
    // info.update(layer.feature.properties); // console.log(layer.feature.properties);
    layerModalInfo(layer.feature.properties);
  }
  function resetHighlight(e) { // console.log("reset highlight, info update passes e.feature.properties.day: " +e);
    geojsonLayer.resetStyle(e.target);
  }
  
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }
  
  function onEachFeature(feature, layer) {
    layer.on({
     mouseover: highlightFeature,
     mouseout: resetHighlight,
     click: zoomToFeature
    });
  }
  function mapAttribution(){
    var attributionRVAReferenceURL = "https://data.richmondgov.com/Sustainability-and-Natural-Environment/Refuse-Collection/tnpy-mt5v";
    var attributionRVAReferenceText = "Refuse Collection";
    var attributionRVAGeoJSONText = "GeoJSON";
    var attributionRVA = "<cite><strong><a href=" +attributionRVAReferenceURL+ ">" +attributionRVAReferenceText+ "</a></strong>: represents refuse collection areas, <a href=" +jsonURL+ ">" +attributionRVAGeoJSONText+ "</a> via City of Richmond, Virginia</cite>";
    map.attributionControl.addAttribution(attributionRVA);
  }
  mapAttribution();
  
  function ajaxRequest(url) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
  	  if(xhr.status >= 200 && xhr.status < 300) {
  		  ajaxResponseJSON = xhr.response;
  		  jsonDataParsed = JSON.parse(ajaxResponseJSON);
  		  geoJSONLayers(jsonDataParsed.features);
  		  geojsonLayer = L.geoJson(jsonDataParsed, {
  		    style:style,
  		    onEachFeature: onEachFeature
  		  }).addTo(map);
  	  } else {
  		  console.log("AJAX Request Failed!"); // should output to browser/user...
  	 }
    };
    xhr.open("GET", url);
    xhr.send();
  };
  ajaxRequest(jsonURL);
  console.log("3");
}
  
refuseCollectionScheduleMap();