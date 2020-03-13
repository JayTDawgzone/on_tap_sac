
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

      let searchbar = d3.select('#searchbar')
      let lcontrol = L.control.layers(baseMaps,overlayMaps).addTo(mymap)
      let layer;
      d3.select('#searchbtn').on('click', function(d) {
        let search = searchbar.property('value')
        d3.json(`http://127.0.0.1:5000/api/taps/${search}`).then(function(result,error) {
          console.log(search)
          mymap.removeLayer(layerGroup)
          mymap.eachLayer(d => {
            mymap.removeLayer(d)
          })
          var layer = mapController.createMarkers(result)
          mymap.addLayer(baseMap)
          mymap.addLayer(layer)
        })


      })
// leaflet-pane leaflet-shadow-pane
// leaflet-pane leaflet-marker-pane
// leaflet-pane leaflet-tooltip-pane
    },
    createMarkers: function (result) {
      // Create Markers for the map
      //Dictionary containing locations
      let markers = [];
      let obj;
      result.map(function(d) {

            for (var z=0; z<d.locations.length; z++) {
              console.log(d.locations[z].location)
              obj = {
                coordinates: [d.locations[z].lat, d.locations[z].lng],
                name: d.locations[z].location,
                tap: []
              }
              markers.push(obj)
            }
      });
      console.log(markers)
      // Push all taps associated with account to Markers List
      let location;
      result.map(function(d) {
        for (let x=0; x<markers.length; x++) {
          location = markers[x].name;
          let check;
          for (var y=0; y<d.locations.length; y++) {
            check = d.locations[y].location;
            if (location === check) {
              markers[x].tap.push(d.tap)
            }
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

  let query = 'bud';

  return {

    init: function() {
    let data = d3.json(`http://127.0.0.1:5000/api/taps/${query}`).then(function(result,error) {
      let layer = mapCtrl.createMarkers(result)
      mapCtrl.createMap(layer)




      });
    }
  }
})(mapController);


controller.init();
