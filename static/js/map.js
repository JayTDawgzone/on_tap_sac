



d3.json('http://127.0.0.1:5000/api/taps/sierra').then(function(result,error){
  let baseDark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
      id: 'mapbox/streets-v11',
      accessToken: 'pk.eyJ1IjoiY29zdGNvLWhvdGRvZyIsImEiOiJjazYxajkyNGUwNDljM2xvZnZjZmxmcjJqIn0.zW5wSAD1e2DKZIjtlAwNtQ'
  })

  let mymap = L.map('map', { layers: [baseDark], zoomControl: false, scrollWheelZoom: false }).setView([38.577488, -121.494763], 12);
  mymap.on('focus', function() { mymap.scrollWheelZoom.enable(); });
  mymap.on('blur', function() { mymap.scrollWheelZoom.disable(); });


  let baseMaps = {
      "Dark": baseDark
  }


  L.control.layers(baseMaps).addTo(mymap)
  let markers = [];

  result.map(function(d) {
        obj = {
          coordinates: [d.locations[0].lat, d.locations[0].lng],
          name: d.locations[0].location,
          tap: d.tap
        };
        markers.push(obj);
  });


  console.log(markers)
  for (var i = 0; i < markers.length; i++) {
    var marker = markers[i];
    L.marker(marker.coordinates)
      .bindPopup("<p>" + marker.name + "</p><p>Brand: " + marker.tap + "</p>")
      .addTo(mymap);
  }


  // console.log(markers);


});
