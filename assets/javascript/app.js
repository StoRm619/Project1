const centerInit = { lat: 32.8800604, lng: -117.2362022 };
let infowindow;
let places = [];
let currentAdd = '';
let currentLatLng = {};

function initMap() {
  let map = new google.maps.Map(document.getElementById('map'), {
    center: centerInit,
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  var request = {
    location: centerInit,
    radius: '500',
    type: ['restaurant']
  };

  service = new google.maps.places.PlacesService(map);
  // service.nearbySearch(request, searchCallback);

  //Call geocoder function and center on submit once address placed
  var geocoder = new google.maps.Geocoder();

  //submit id will be replaced by id of submit button on form
  document.getElementById('submit').addEventListener('click', function() {
    // geocodeAddress(geocoder, map);
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.

  searchBox.addListener('places_changed', function() {
    let currentLocInput = searchBox.getPlaces();

    if (currentLocInput.length == 0) return;

    currentAdd = currentLocInput[0].formatted_address;
    let currentGeo = currentLocInput[0].geometry;
    let bounds = new google.maps.LatLngBounds();
    if (currentGeo.viewport) bounds.union(currentGeo.viewport);
    else bounds.extend(currentGeo.location);
    map.fitBounds(bounds);

    geocodeAddress(currentAdd, callSearchNearby);

    var origin = currentAdd;

    //Pushing address values into destinations array for distance matrix calculations
    var destination = [];
    for (var h = 0; h < places.length; h++) {
      destination.push(places[h].address);
    }

    var selectTransporatation = document.getElementById('methodTransportation');
    var userSelectMode =
      selectTransporatation.options[selectTransporatation.selectedIndex].value;

    var service2 = new google.maps.DistanceMatrixService();
    service2.getDistanceMatrix(
      {
        origins: [origin],
        destinations: destination,

        travelMode: userSelectMode,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      },
      function(response, status) {
        if (status !== 'OK') {
          alert('Error was: ' + status);
        } else {
          var originList = response.originAddresses;

          for (var i = 0; i < originList.length; i++) {
            var results = response.rows[i].elements;
            geocoder.geocode({ address: originList[i] }, function() {});
            for (var j = 0; j < results.length; j++) {
              geocoder.geocode({ address: destination[j] }, function() {});

              console.log(places[j].name);
              console.log(results[j].duration.text);
              console.log(results[j].distance.text);
            }
          }
        }
      }
    );
  });
}

function callSearchNearby(latLng) {
  let requestNearby = {
    location: latLng,
    radius: '500',
    type: ['restaurant']
  };
  service.nearbySearch(requestNearby, callGetDetails);
}

function callGetDetails(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      let request = {
        placeId: results[i].place_id,
        fields: ['name', 'rating', 'formatted_address']
      };
      service.getDetails(request, makeDetailCallback(places));
    }
    console.log('SearchCallback, places:', places);
  }
}

// Modifies places by adding details to passin in placesToModify argument
function makeDetailCallback(placesToModify) {
  return function detailCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK)
      placesToModify.push({
        name: results.name,
        address: results.formatted_address,
        rating: results.rating
      });
  };
}

function geocodeAddress(address, callback) {
  var geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: address }, function(results, status) {
    if (status === 'OK') {
      currentLatLng = results[0].geometry.location;
      console.log('Geocoding: ', currentLatLng);
      callback(currentLatLng);
    } else alert('Geocode was not successful for the following reason: ' + status);
  });
}
