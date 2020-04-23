let mapController = (function () {

  function createTapList(taplist) {

    // Creates Tap List String for Pop Ups
    let string = ''
    if (taplist[0].constructor == Object) {
      for (const property in taplist) {
        string = string + `<li>${Object.values(taplist[property])}</li>`
        console.log(Object.values(taplist[property]))
      }
    } else {
      for (let i = 0; i < taplist.length; i++) {

        string = string + `<li>${taplist[i]}</li>`
      }
    }

    return string
  }

  function displayRadioValue() {
    var ele = document.getElementsByName('options');
    let checked;
    for (let x = 0; x < ele.length; x++) {
      if (ele[x].checked) {
        if (x === 0) {
          checked = 'brands'
        } else {
          checked = 'locations'
        }
      }

    }
    return checked
  }

  function clearDropdown() {
    let body = d3.select('body')
    let removeDropdown = body.select('#drop-container');
    if (removeDropdown) {
      removeDropdown.remove();
    }
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
      let mymap = L.map('map', {
        layers: [baseMap, layerGroup],
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([38.577488, -121.494763], 12);
      mymap.on('focus', function () {
        mymap.scrollWheelZoom.enable();
      });
      mymap.on('blur', function () {
        mymap.scrollWheelZoom.disable();
      });

      let baseMaps = {
        "Dark": baseMap,
      }
      let overlayMaps = {
        "Locations": layerGroup
      }

      let searchbar = d3.select('#searchbar')
      searchbar.on('keypress', function () {

        if (searchbar.property('value').length > 3) {
          let search = searchbar.property('value');
          let option = displayRadioValue();
          clearDropdown();
          if (option === 'brands') {
            d3.json(`http://127.0.0.1:5000/api/taps/${search}`).then(function (result, error) {

              let taps = result.map(d => d.tap);



              let dropContainer = d3.select('.auto-complete').append('div').attr('id', 'drop-container');
              let dropdown = dropContainer
                .data(result)
                .append('div')
                .classed('dropdown', true)
                .text(d => d.tap)
                .enter();


            })
          }
        }
      })
      // let lcontrol = L.control.layers(baseMaps,overlayMaps).addTo(mymap)
      // let option1 = document.getElementbyID('option1')
      // let option2 = document.getElementbyID('option2')
      let layer;
      d3.select('#searchbtn').on('click', function (d) {
        let search = searchbar.property('value');
        let option = displayRadioValue();
        let layer;


        if (option === 'brands') {
          d3.json(`http://127.0.0.1:5000/api/taps/${search}`).then(function (result, error) {
            mymap.removeLayer(layerGroup)
            mymap.eachLayer(d => {
              mymap.removeLayer(d)
            })
            layer = mapController.createMarkers(result);
            mymap.addLayer(baseMap);
            mymap.addLayer(layer);
          })
        } else {
          // search for accounts
          d3.json(`http://127.0.0.1:5000/api/accounts_query/${search}`).then(function (result, error) {
            mymap.removeLayer(layerGroup)
            mymap.eachLayer(d => {
              mymap.removeLayer(d);
            })
            layer = mapController.createAccountMarkers(result);
            mymap.addLayer(baseMap);
            mymap.addLayer(layer);
          })
        }



      })
      // leaflet-pane leaflet-shadow-pane
      // leaflet-pane leaflet-marker-pane
      // leaflet-pane leaflet-tooltip-pane
    },
    createAccountMarkers: function (result) {
      let markers = [];
      let obj;
      result.map(function (d) {
        obj = {
          location: d.location,
          coordinates: [d.lat, d.lng],
          taps: d.taps
        }
        markers.push(obj);
      })
      let layerGroup = [];
      let layer;
      for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        layer = L.marker(marker.coordinates).bindPopup(`<p> ${marker.location} </p><p>Brands:</p> ${createTapList(marker.taps)}`);
        layerGroup.push(layer);
      };
      var markerGroup = L.layerGroup(layerGroup);
      return markerGroup
    },
    createMarkers: function (result) {
      // Create Markers for the map
      //Dictionary containing locations
      let markers = [];
      let obj;
      result.map(function (d) {

        for (var z = 0; z < d.locations.length; z++) {
          obj = {
            coordinates: [d.locations[z].lat, d.locations[z].lng],
            name: d.locations[z].location,
            tap: []
          }
          markers.push(obj)
        }
      });
      // Push all taps associated with account to Markers List
      let location;
      result.map(function (d) {
        for (let x = 0; x < markers.length; x++) {
          location = markers[x].name;
          let check;
          for (var y = 0; y < d.locations.length; y++) {
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

let controller = (function (mapCtrl) {

  let query = 'bud';

  return {

    init: function () {
      let data = d3.json(`http://127.0.0.1:5000/api/taps/${query}`).then(function (result, error) {
        let layer = mapCtrl.createMarkers(result)
        mapCtrl.createMap(layer)
        d3.select('#search').text(query)





      });
    }
  }
})(mapController);


controller.init();