const centerInit = {lat: -33.8688, lng: 151.2195};
let infowindow;
let places = [];
let currentAdd = '';

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
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
  service.nearbySearch(request, searchCallback);
        
  //Call geocoder function and center on submit once address placed
  var geocoder = new google.maps.Geocoder();

  //submit id will be replaced by id of submit button on form
  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);


  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    let places = searchBox.getPlaces();

    if (places.length == 0)
      return;

    currentAdd = places[0].formatted_address;
    let currentGeo = places[0].geometry
    let bounds = new google.maps.LatLngBounds();
    if (currentGeo.viewport)
      bounds.union(currentGeo.viewport);
    else 
      bounds.extend(currentGeo.location);
    map.fitBounds(bounds);

    


    // // Clear out the old markers.
    // markers.forEach(function(marker) {
    //   marker.setMap(null);
    // });
    // markers = [];

    // // For each place, get the icon, name and location.
    // places.forEach(function(place) {
    //   if (!place.geometry) {
    //     console.log("Returned place contains no geometry");
    //     return;
    //   }
    //   var icon = {
    //     url: place.icon,
    //     size: new google.maps.Size(71, 71),
    //     origin: new google.maps.Point(0, 0),
    //     anchor: new google.maps.Point(17, 34),
    //     scaledSize: new google.maps.Size(25, 25)
    //   };

    //   // Create a marker for each place.
    //   markers.push(new google.maps.Marker({
    //     map: map,
    //     icon: icon,
    //     title: place.name,
    //     position: place.geometry.location
    //   }));

  });
}

//Function to call when we need to get location and center
function geocodeAddress(geocoder, resultsMap) {
  //address id is going to be replaced by id of input on form
var address = document.getElementById('address').value;
geocoder.geocode({'address': address}, function(results, status) {
  if (status === 'OK') {
    resultsMap.setCenter(results[0].geometry.location);
    var marker = new google.maps.Marker({
      map: resultsMap,
      position: results[0].geometry.location
    });
  } else {
    alert('Geocode was not successful for the following reason: ' + status);
  }
});
}

function searchCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      let request = {
        placeId: results[i].place_id,
        fields: ['name', 'rating', 'formatted_address']
      };
      service.getDetails(request, makeDetailCallback(places));
    }
    console.log(places);
  }
}

// Modifies places by adding details to passin in placesToModify argument
function makeDetailCallback(placesToModify) {
  return function detailCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK)
     placesToModify.push({
       name: results.name,
       address: results.formatted_address,
       rating: results.rating});
  }
}