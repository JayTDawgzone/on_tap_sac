
let mapController = (function() {

  function createTapList(taplist) {
    // Creates Tap List String for Pop Ups
    let string = ''
    for (let i=0; i<taplist.length; i++) {
      string = string + `<li>${taplist[i]}</li>`
    }
    return string
  }


  return {
    createMap: function (layerGroup) {
      // Initialize Map
      let baseMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 20,
          id: 'mapbox/streets-v11',
          accessToken: 'pk.eyJ1IjoiY29zdGNvLWhvdGRvZyIsImEiOiJjazYxajkyNGUwNDljM2xvZnZjZmxmcjJqIn0.zW5wSAD1e2DKZIjtlAwNtQ'
      })
      let mymap = L.map('map', { layers: [baseMap, layerGroup], zoomControl: true, scrollWheelZoom: true }).setView([38.577488, -121.494763], 12);
      mymap.on('focus', function() { mymap.scrollWheelZoom.enable(); });
      mymap.on('blur', function() { mymap.scrollWheelZoom.disable(); });

      let baseMaps = {
          "Dark": baseMap,
      }
      let overlayMaps = {
        "Locations": layerGroup
      }
      return L.control.layers(baseMaps,overlayMaps).addTo(mymap)
    },
    createMarkers: function (result) {
      // Create Markers for the map

      //Dictionary containing locations
      let markers = [];
      let obj;
      result.map(function(d) {
            obj = {
              coordinates: [d.locations[0].lat, d.locations[0].lng],
              name: d.locations[0].location,
              tap: []
            };
            markers.push(obj);
      });

      // Push all taps associated with account to Markers List
      let location;
      result.map(function(d) {
        for (x=0; x<markers.length; x++) {
          location = markers[x].name;
          if (location === d.locations[0].location) {
            markers[x].tap.push(d.tap)
          }
        }
      })
    // Create Layer Group
    let layerGroup = [];
    let layer;
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        layer = L.marker(marker.coordinates).bindPopup(`<p> ${marker.name} </p><p>Brands:</p> ${createTapList(marker.tap)}`);
        layerGroup.push(layer);
      };
      var markerGroup = L.layerGroup(layerGroup);
      return markerGroup
    }
  }
})();

let controller = (function(mapCtrl) {

  let query = 'firestone';

  return {

    init: function() {
    let data = d3.json(`http://127.0.0.1:5000/api/taps/${query}`).then(function(result,error) {
      let layer = mapCtrl.createMarkers(result)
      let lcontol = mapCtrl.createMap(layer)

      


      });
    }
  }
})(mapController);


controller.init();
